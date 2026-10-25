"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { buttonPrimary, buttonQuiet, chip, eyebrow, field, FieldError, panel } from "./ui";

type Tone = "anxious" | "low" | "frustrated" | "positive" | "neutral";
type Analysis = { tone: Tone; matched: string[]; flagged: boolean; topics: string[]; name?: string };
type Message = { id: number; role: "user" | "companion"; text: string; analysis?: Analysis; safety?: boolean };
type Memory = { name?: string; topics: string[]; lowStreak: number };

const MAX_LENGTH = 500;

const TONE_WORDS: Record<Exclude<Tone, "neutral">, string[]> = {
  anxious: ["anxious", "anxiety", "worried", "worry", "nervous", "panic", "panicking", "stressed", "stress", "overwhelmed", "scared", "afraid", "tense", "restless"],
  low: ["sad", "down", "lonely", "alone", "empty", "hopeless", "tired", "exhausted", "numb", "crying", "worthless", "unmotivated", "depressed", "drained"],
  frustrated: ["angry", "frustrated", "annoyed", "mad", "irritated", "furious", "unfair", "hate", "fed up"],
  positive: ["happy", "good", "great", "better", "excited", "grateful", "calm", "proud", "relieved", "glad", "well"],
};
const NEGATIONS = new Set(["not", "never", "isn't", "dont", "don't", "no", "hardly"]);

// Phrases that switch the companion from conversation to crisis resources.
const CRISIS_PATTERNS = [
  /\bkill(ing)? myself\b/, /\bsuicid/, /\bend (my life|it all)\b/, /\bwant to die\b/, /\bself[- ]?harm/,
  /\bhurt(ing)? myself\b/, /\bno reason to live\b/, /\bbetter off dead\b/, /\btake my own life\b/, /\b(don'?t|do not) want to be alive\b/, /\bend my own life\b/, /\bdon'?t want to (be here|live)( anymore)?\b/, /\bcut(ting)? myself\b/,
];

const TOPICS: [string, RegExp][] = [
  ["exams", /\b(exams?|tests?|studying|study|grades?|assignments?)\b/],
  ["work", /\b(work|job|boss|deadlines?|office|internship|manager)\b/],
  ["sleep", /\b(sleep|sleeping|insomnia|awake at night|can'?t sleep)\b/],
  ["family", /\b(family|mom|mum|dad|parents?|sister|brother)\b/],
  ["friends", /\b(friends?|friendship)\b/],
  ["relationships", /\b(partner|boyfriend|girlfriend|relationship|breakup|broke up)\b/],
  ["health", /\b(health|sick|ill|pain|doctor)\b/],
];

const OPENERS: Record<Tone, string[]> = {
  anxious: ["That sounds like a lot to carry at once.", "It makes sense to feel on edge when things pile up."],
  low: ["I'm sorry it feels this heavy right now.", "That sounds really draining."],
  frustrated: ["That sounds genuinely frustrating.", "It's understandable to feel annoyed when things feel unfair."],
  positive: ["I'm really glad to hear that.", "That's lovely to hear."],
  neutral: ["Thanks for sharing that with me.", "I'm listening."],
};
const FOLLOW_UPS: Record<Tone, string[]> = {
  anxious: ["What's the part that feels most urgent right now?", "Would it help to pick just one small next step together?"],
  low: ["What has your energy been like today?", "Is there someone you feel comfortable reaching out to?"],
  frustrated: ["What would feel like a fair outcome here?", "What do you wish the other person understood?"],
  positive: ["What do you think helped?", "How could you make a little more room for that?"],
  neutral: ["How are you feeling about it?", "What's been on your mind most today?"],
};

const STARTERS = [
  "I've been really stressed about my exams",
  "My name is Sam and I can't sleep lately",
  "I feel kind of down today",
  "Things actually went well at work today",
];

function analyse(text: string): Analysis {
  const lower = text.toLowerCase();
  const tokens = lower.match(/[a-z']+/g) ?? [];
  const counts: Record<Tone, number> = { anxious: 0, low: 0, frustrated: 0, positive: 0, neutral: 0 };
  const matched: string[] = [];

  tokens.forEach((token, i) => {
    for (const [tone, words] of Object.entries(TONE_WORDS) as [Exclude<Tone, "neutral">, string[]][]) {
      if (!words.includes(token)) continue;
      const negated = i > 0 && NEGATIONS.has(tokens[i - 1]);
      // "not good" reads as low, "not worried" carries no signal.
      if (negated && tone === "positive") {
        counts.low++;
        matched.push(`not ${token}`);
      } else if (!negated) {
        counts[tone]++;
        matched.push(token);
      }
    }
  });
  if (lower.includes("fed up")) { counts.frustrated++; matched.push("fed up"); }

  const ranked = (Object.entries(counts) as [Tone, number][]).filter(([t]) => t !== "neutral").sort((a, b) => b[1] - a[1]);
  const tone: Tone = ranked[0][1] > 0 ? ranked[0][0] : "neutral";
  const nameMatch = text.match(/\b(?:my name is|call me)\s+([A-Za-z][A-Za-z'-]{1,20})/i);

  return {
    tone,
    matched,
    flagged: CRISIS_PATTERNS.some((p) => p.test(lower)),
    topics: TOPICS.filter(([, re]) => re.test(lower)).map(([topic]) => topic),
    name: nameMatch ? nameMatch[1][0].toUpperCase() + nameMatch[1].slice(1).toLowerCase() : undefined,
  };
}

function compose(analysis: Analysis, memory: Memory, turn: number): string {
  const pick = (options: string[]) => options[turn % options.length];
  const parts: string[] = [];

  if (analysis.name && analysis.name !== memory.name) parts.push(`Nice to meet you, ${analysis.name}.`);
  parts.push(pick(OPENERS[analysis.tone]));

  const newTopics = analysis.topics.filter((t) => !memory.topics.includes(t));
  if (newTopics.length > 0) {
    parts.push(`I'll keep in mind that ${newTopics.join(" and ")} ${newTopics.length > 1 ? "are" : "is"} part of this.`);
  } else if (analysis.topics.length === 0 && memory.topics.length > 0 && analysis.tone !== "positive") {
    parts.push(`Earlier you mentioned ${memory.topics[memory.topics.length - 1]} — is that still weighing on you?`);
  }

  if (analysis.tone === "low" && memory.lowStreak + 1 >= 3) {
    parts.push("You've sounded low for a few messages now. Talking to someone you trust, or a counsellor, can really help — you don't have to hold this alone.");
  } else {
    const name = memory.name ?? analysis.name;
    const question = pick(FOLLOW_UPS[analysis.tone]);
    parts.push(name && turn % 2 === 1 ? `${name}, ${question[0].toLowerCase()}${question.slice(1)}` : question);
  }
  return parts.join(" ");
}

export default function ChatbotDemo() {
  const [messages, setMessages] = useState<Message[]>([
    { id: 0, role: "companion", text: "Hi, I'm here to listen. How are you feeling today?" },
  ]);
  const [memory, setMemoryState] = useState<Memory>({ topics: [], lowStreak: 0 });
  // Mirrors `memory` so the delayed reply reads the latest value without side effects in state updaters.
  const memoryRef = useRef(memory);
  const setMemory = (next: Memory) => {
    memoryRef.current = next;
    setMemoryState(next);
  };
  const [draft, setDraft] = useState("");
  const [error, setError] = useState<string>();
  const [thinking, setThinking] = useState(false);
  const logRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const nextId = useRef(1);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    logRef.current?.scrollTo({ top: logRef.current.scrollHeight });
  }, [messages, thinking]);
  useEffect(() => () => { if (timer.current) clearTimeout(timer.current); }, []);

  const lastAnalysis = [...messages].reverse().find((m) => m.analysis)?.analysis;

  const send = (text: string) => {
    const trimmed = text.trim();
    if (!trimmed) return setError("Type a message first.");
    if (trimmed.length > MAX_LENGTH) return setError(`Please keep messages under ${MAX_LENGTH} characters.`);
    if (thinking) return;
    setError(undefined);

    const analysis = analyse(trimmed);
    const userMessage: Message = { id: nextId.current++, role: "user", text: trimmed, analysis };
    setMessages((m) => [...m, userMessage]);
    setDraft("");
    setThinking(true);

    // A short pause so replies don't feel instantaneous; the reply is computed locally.
    timer.current = setTimeout(() => {
      const mem = memoryRef.current;
      const reply: Message = analysis.flagged
        ? { id: nextId.current++, role: "companion", safety: true, text: "I'm really glad you told me. What you're describing sounds serious, and you deserve support from a real person right now." }
        : { id: nextId.current++, role: "companion", text: compose(analysis, mem, userMessage.id) };
      setMessages((m) => [...m, reply]);
      setMemory({
        name: analysis.name ?? mem.name,
        topics: [...mem.topics, ...analysis.topics.filter((t) => !mem.topics.includes(t))],
        lowStreak: analysis.tone === "low" ? mem.lowStreak + 1 : 0,
      });
      setThinking(false);
      inputRef.current?.focus();
    }, 700);
  };

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    send(draft);
  };

  const reset = () => {
    if (timer.current) clearTimeout(timer.current);
    setThinking(false);
    setMessages([{ id: nextId.current++, role: "companion", text: "Fresh start. How are you feeling right now?" }]);
    setMemory({ topics: [], lowStreak: 0 });
    setError(undefined);
  };

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
      <div className={`${panel} flex min-h-[520px] flex-col`}>
        <div
          ref={logRef}
          role="log"
          aria-live="polite"
          aria-label="Conversation"
          tabIndex={0}
          className="hide-scrollbar flex max-h-[480px] min-h-[320px] flex-1 flex-col gap-4 overflow-y-auto pr-1"
        >
          {messages.map((m) => (
            <div key={m.id} className={`max-w-[88%] ${m.role === "user" ? "self-end text-right" : "self-start"}`}>
              <p className="sr-only">{m.role === "user" ? "You said:" : "Companion said:"}</p>
              <div
                className={`rounded-3xl px-5 py-3 text-[15px] font-light leading-relaxed ${
                  m.role === "user" ? "rounded-br-md bg-[#dce7e5]/[.12] text-[#f4f7f6]" : "rounded-bl-md border border-white/10 bg-[#061c27]/70 text-[#dce7e5]"
                } ${m.safety ? "border-[#e6d3a8]/50" : ""}`}
              >
                {m.text}
                {m.safety && (
                  <ul className="mt-3 space-y-1.5 text-[14px] text-[#f4f7f6]">
                    <li>If you are in immediate danger, call your local emergency number now.</li>
                    <li>India — Tele-MANAS: <strong className="font-medium">14416</strong> (free, 24/7)</li>
                    <li>US — 988 Suicide &amp; Crisis Lifeline: call or text <strong className="font-medium">988</strong></li>
                    <li>
                      Elsewhere —{" "}
                      <a href="https://findahelpline.com" target="_blank" rel="noopener noreferrer" className="underline underline-offset-4 hover:text-white">
                        findahelpline.com
                      </a>
                    </li>
                  </ul>
                )}
              </div>
              {m.analysis && (
                <p className="mt-1.5 text-[10px] uppercase tracking-[.2em] text-[#b8ccca]/55">
                  tone: {m.analysis.tone}
                  {m.analysis.flagged ? " · safety check flagged" : ""}
                </p>
              )}
            </div>
          ))}
          {thinking && <p className="self-start text-[12px] italic text-[#b8ccca]/70">companion is writing…</p>}
        </div>

        {messages.length <= 1 && (
          <div className="mt-4 flex flex-wrap gap-2" aria-label="Example messages">
            {STARTERS.map((s) => (
              <button key={s} type="button" onClick={() => send(s)} className={`${chip} min-h-[36px] transition-colors hover:border-white/40 hover:text-white`}>
                {s}
              </button>
            ))}
          </div>
        )}

        <form onSubmit={onSubmit} noValidate className="mt-5 border-t border-white/10 pt-5">
          <label htmlFor="chat-input" className={eyebrow}>your message</label>
          <div className="mt-3 flex flex-col gap-3 sm:flex-row">
            <input
              ref={inputRef}
              id="chat-input"
              value={draft}
              onChange={(e) => { setDraft(e.target.value); if (error) setError(undefined); }}
              maxLength={MAX_LENGTH}
              autoComplete="off"
              placeholder="Say how you're feeling…"
              aria-invalid={error ? true : undefined}
              aria-describedby={error ? "chat-error" : "chat-count"}
              className={field}
            />
            <button type="submit" disabled={thinking} className={buttonPrimary}>Send</button>
          </div>
          <FieldError id="chat-error" message={error} />
          <p id="chat-count" className="mt-2 text-right text-[11px] tabular-nums text-[#b8ccca]/50">{draft.length}/{MAX_LENGTH}</p>
        </form>
      </div>

      <div className="flex flex-col gap-6">
        <div className={panel}>
          <h2 className={eyebrow}>what the system noticed</h2>
          {lastAnalysis ? (
            <dl className="mt-5 space-y-4 text-[14px] font-light text-[#dce7e5]/85">
              <div>
                <dt className="text-[11px] uppercase tracking-[.2em] text-[#b8ccca]/60">Tone</dt>
                <dd className="mt-1 font-serif text-[24px] text-[#f4f7f6]">{lastAnalysis.tone}</dd>
                <dd className="text-[12px] text-[#b8ccca]/70">{lastAnalysis.matched.length ? `signals: ${lastAnalysis.matched.join(", ")}` : "no strong emotional words found"}</dd>
              </div>
              <div>
                <dt className="text-[11px] uppercase tracking-[.2em] text-[#b8ccca]/60">Safety check</dt>
                <dd className={`mt-1 ${lastAnalysis.flagged ? "text-[#e6d3a8]" : ""}`}>
                  {lastAnalysis.flagged ? "Flagged — normal conversation paused and crisis resources shown." : "Passed — no risk phrases detected."}
                </dd>
              </div>
            </dl>
          ) : (
            <p className="mt-4 text-[14px] font-light text-[#b8ccca]/70">Send a message to see its tone and safety analysis.</p>
          )}
        </div>

        <div className={panel}>
          <h2 className={eyebrow}>contextual memory</h2>
          {memory.name || memory.topics.length ? (
            <dl className="mt-5 space-y-3 text-[14px] font-light text-[#dce7e5]/85">
              {memory.name && (
                <div><dt className="text-[11px] uppercase tracking-[.2em] text-[#b8ccca]/60">Name</dt><dd className="mt-1">{memory.name}</dd></div>
              )}
              {memory.topics.length > 0 && (
                <div>
                  <dt className="text-[11px] uppercase tracking-[.2em] text-[#b8ccca]/60">Topics</dt>
                  <dd className="mt-2 flex flex-wrap gap-2">{memory.topics.map((t) => <span key={t} className={chip}>{t}</span>)}</dd>
                </div>
              )}
            </dl>
          ) : (
            <p className="mt-4 text-[14px] font-light text-[#b8ccca]/70">Nothing remembered yet. Try mentioning your name or what&apos;s on your mind.</p>
          )}
          <div className="mt-6 flex flex-wrap gap-3">
            <button type="button" onClick={() => setMemory({ topics: [], lowStreak: 0 })} disabled={!memory.name && !memory.topics.length} className={buttonQuiet}>
              Clear memory
            </button>
            <button type="button" onClick={reset} className={buttonQuiet}>Restart</button>
          </div>
        </div>
      </div>
    </div>
  );
}

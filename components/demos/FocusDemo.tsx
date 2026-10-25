"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { buttonPrimary, buttonQuiet, eyebrow, field, FieldError, Meter, panel } from "./ui";

type Effort = 1 | 2 | 3;
type Energy = "low" | "steady" | "high";
type Task = { id: number; title: string; effort: Effort; done: boolean };
type Session = { taskId: number; durationMin: number; endsAt: number; pausedRemainingMs?: number; finished?: boolean };

const EFFORT_LABEL: Record<Effort, string> = { 1: "light", 2: "medium", 3: "heavy" };
const MAX_TASKS = 12;

function computeLoad(tasks: Task[], energy: Energy, focusedMinutes: number) {
  const openEffort = tasks.filter((t) => !t.done).reduce((sum, t) => sum + t.effort, 0);
  const taskLoad = Math.min(1, openEffort / 12) * 0.6;
  const energyLoad = energy === "low" ? 0.25 : energy === "high" ? -0.1 : 0;
  const fatigue = Math.min(0.3, (focusedMinutes / 120) * 0.3);
  const value = Math.max(0, Math.min(1, 0.15 + taskLoad + energyLoad + fatigue));
  const label = value < 0.35 ? "calm" : value < 0.6 ? "steady" : value < 0.8 ? "heavy" : "overloaded";
  return { value, label, openEffort, energyLoad, fatigue };
}

function suggestTask(tasks: Task[], load: number, energy: Energy) {
  const open = tasks.filter((t) => !t.done);
  if (!open.length) return undefined;
  const gentle = load >= 0.6 || energy === "low";
  // Overloaded or low energy: start with the lightest thing. Otherwise: do the hardest thing while fresh.
  return [...open].sort((a, b) => (gentle ? a.effort - b.effort : b.effort - a.effort))[0];
}

const format = (ms: number) => {
  const total = Math.max(0, Math.ceil(ms / 1000));
  return `${String(Math.floor(total / 60)).padStart(2, "0")}:${String(total % 60).padStart(2, "0")}`;
};

export default function FocusDemo() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [title, setTitle] = useState("");
  const [effort, setEffort] = useState<Effort>(2);
  const [error, setError] = useState<string>();
  const [energy, setEnergy] = useState<Energy>("steady");
  const [focusedMinutes, setFocusedMinutes] = useState(0);
  const [session, setSession] = useState<Session | null>(null);
  const [duration, setDuration] = useState<number | null>(null);
  const [now, setNow] = useState(() => Date.now());
  const nextId = useRef(1);
  const focusHeadingRef = useRef<HTMLHeadingElement>(null);
  const startButtonRef = useRef<HTMLButtonElement>(null);

  const load = computeLoad(tasks, energy, focusedMinutes);
  const suggested = suggestTask(tasks, load.value, energy);
  const suggestedDuration = load.value >= 0.8 ? 10 : load.value >= 0.6 || energy === "low" ? 15 : 25;
  const activeTask = session ? tasks.find((t) => t.id === session.taskId) : undefined;
  const remaining = session ? session.pausedRemainingMs ?? session.endsAt - now : 0;

  // Tick once a second while a session is running.
  useEffect(() => {
    if (!session || session.pausedRemainingMs !== undefined || session.finished) return;
    const interval = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(interval);
  }, [session]);

  // When time runs out, count the minutes and suggest a break.
  useEffect(() => {
    if (session && !session.finished && session.pausedRemainingMs === undefined && remaining <= 0) {
      setSession({ ...session, finished: true });
      setFocusedMinutes((m) => m + session.durationMin);
    }
  }, [remaining, session]);

  // Move keyboard focus into the focus state when it opens.
  const sessionTaskId = session?.taskId;
  useEffect(() => {
    if (sessionTaskId !== undefined) focusHeadingRef.current?.focus();
  }, [sessionTaskId]);

  const addTask = (e: FormEvent) => {
    e.preventDefault();
    const trimmed = title.trim();
    if (!trimmed) return setError("Write a few words about the task.");
    if (trimmed.length > 80) return setError("Keep it short — 80 characters at most.");
    if (tasks.length >= MAX_TASKS) return setError(`That's ${MAX_TASKS} tasks already. Finish or remove one first — that's the point.`);
    if (tasks.some((t) => !t.done && t.title.toLowerCase() === trimmed.toLowerCase())) return setError("That task is already on the list.");
    setTasks((t) => [...t, { id: nextId.current++, title: trimmed, effort, done: false }]);
    setTitle("");
    setError(undefined);
  };

  const start = (task: Task) => {
    const minutes = duration ?? suggestedDuration;
    const t = Date.now();
    setNow(t);
    setSession({ taskId: task.id, durationMin: minutes, endsAt: t + minutes * 60_000 });
  };

  const exitFocus = (markDone: boolean) => {
    if (!session) return;
    if (markDone) setTasks((ts) => ts.map((t) => (t.id === session.taskId ? { ...t, done: true } : t)));
    if (!session.finished) {
      const spent = Math.round((session.durationMin * 60_000 - remaining) / 60_000);
      setFocusedMinutes((m) => m + Math.max(0, spent));
    }
    setSession(null);
    requestAnimationFrame(() => startButtonRef.current?.focus());
  };

  const togglePause = () => {
    if (!session) return;
    if (session.pausedRemainingMs !== undefined) {
      const t = Date.now();
      setNow(t);
      setSession({ ...session, endsAt: t + session.pausedRemainingMs, pausedRemainingMs: undefined });
    } else {
      setSession({ ...session, pausedRemainingMs: session.endsAt - Date.now() });
    }
  };

  // Focus state: everything else disappears.
  if (session && activeTask) {
    return (
      <div className={`${panel} flex min-h-[460px] flex-col items-center justify-center text-center`}>
        <p className={eyebrow}>focus state · {EFFORT_LABEL[activeTask.effort]} task</p>
        <h2 ref={focusHeadingRef} tabIndex={-1} className="mt-6 max-w-2xl font-serif text-[clamp(2rem,5vw,3.5rem)] leading-[1.05] text-[#f4f7f6] focus:outline-none">
          {activeTask.title}
        </h2>
        <p role="timer" aria-live="off" className="mt-8 font-serif text-[64px] leading-none tabular-nums text-[#dce7e5]">{format(remaining)}</p>
        <p aria-live="polite" className="mt-4 min-h-[1.5em] text-[14px] font-light text-[#b8ccca]/80">
          {session.finished
            ? "Time's up. Step away for five minutes — water, window, stretch."
            : session.pausedRemainingMs !== undefined
              ? "Paused. The task will wait for you."
              : `${session.durationMin}-minute session. Only this, for now.`}
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          {!session.finished && (
            <button type="button" onClick={togglePause} className={buttonQuiet}>{session.pausedRemainingMs !== undefined ? "Resume" : "Pause"}</button>
          )}
          <button type="button" onClick={() => exitFocus(true)} className={buttonPrimary}>Mark done</button>
          <button type="button" onClick={() => exitFocus(false)} className={buttonQuiet}>Exit focus</button>
        </div>
      </div>
    );
  }

  const open = tasks.filter((t) => !t.done);
  const done = tasks.filter((t) => t.done);

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
      <div className={panel}>
        <form onSubmit={addTask} noValidate aria-labelledby="unload-heading">
          <h2 id="unload-heading" className={eyebrow}>unload your head</h2>
          <div className="mt-5 flex flex-col gap-3 sm:flex-row">
            <label htmlFor="task-title" className="sr-only">Task</label>
            <input id="task-title" value={title} onChange={(e) => { setTitle(e.target.value); if (error) setError(undefined); }}
              maxLength={80} placeholder="e.g. reply to Priya's email" autoComplete="off"
              aria-invalid={error ? true : undefined} aria-describedby={error ? "task-error" : undefined} className={field} />
            <label htmlFor="task-effort" className="sr-only">Effort</label>
            <select id="task-effort" value={effort} onChange={(e) => setEffort(Number(e.target.value) as Effort)} className={`${field} sm:w-36`}>
              <option value={1}>light</option>
              <option value={2}>medium</option>
              <option value={3}>heavy</option>
            </select>
            <button type="submit" className={buttonPrimary}>Add</button>
          </div>
          <FieldError id="task-error" message={error} />
        </form>

        {tasks.length === 0 ? (
          <p className="mt-8 text-[15px] font-light leading-relaxed text-[#b8ccca]/75">
            Nothing here yet. Add the things circling in your head — big or small — and give each a rough effort.
          </p>
        ) : (
          <ul className="mt-8 space-y-2" aria-label="Open tasks">
            {open.map((t) => (
              <li key={t.id} className={`flex items-center justify-between gap-3 rounded-2xl border px-4 py-3 ${t.id === suggested?.id ? "border-[#dce7e5]/35 bg-white/[.05]" : "border-white/10"}`}>
                <span className="min-w-0 text-[15px] font-light text-[#f4f7f6] [overflow-wrap:anywhere]">
                  {t.title}
                  <span className="ml-2 text-[11px] uppercase tracking-[.2em] text-[#b8ccca]/60">{EFFORT_LABEL[t.effort]}</span>
                  {t.id === suggested?.id && <span className="ml-2 text-[11px] uppercase tracking-[.2em] text-[#e6d3a8]/80">suggested</span>}
                </span>
                <span className="flex shrink-0 gap-2">
                  <button type="button" onClick={() => start(t)} className={buttonQuiet} aria-label={`Focus on ${t.title}`}>Focus</button>
                  <button type="button" onClick={() => setTasks((ts) => ts.filter((x) => x.id !== t.id))} className={buttonQuiet} aria-label={`Remove ${t.title}`}>
                    <span aria-hidden="true">✕</span>
                  </button>
                </span>
              </li>
            ))}
            {open.length === 0 && <li className="text-[15px] font-light text-[#b8ccca]/75">Everything&apos;s done. That&apos;s enough for today.</li>}
          </ul>
        )}
        {done.length > 0 && (
          <p className="mt-6 text-[13px] text-[#b8ccca]/60">Done: {done.map((t) => t.title).join(" · ")}</p>
        )}
      </div>

      <div className="flex flex-col gap-6">
        <div className={panel}>
          <h2 className={eyebrow}>check in</h2>
          <fieldset className="mt-4">
            <legend className="text-[14px] font-light text-[#dce7e5]/85">How&apos;s your energy right now?</legend>
            <div className="mt-3 flex flex-wrap gap-2">
              {(["low", "steady", "high"] as Energy[]).map((level) => (
                <label key={level} className={`inline-flex min-h-[44px] cursor-pointer items-center rounded-full border px-5 text-[12px] uppercase tracking-[.2em] transition-colors has-[:focus-visible]:outline has-[:focus-visible]:outline-1 has-[:focus-visible]:outline-offset-4 has-[:focus-visible]:outline-[#dce7e5] ${energy === level ? "border-[#dce7e5]/60 bg-white/10 text-white" : "border-white/15 text-[#b8ccca]/80 hover:border-white/35"}`}>
                  <input type="radio" name="energy" value={level} checked={energy === level} onChange={() => setEnergy(level)} className="sr-only" />
                  {level}
                </label>
              ))}
            </div>
          </fieldset>
        </div>

        <div className={panel}>
          <h2 className={eyebrow}>cognitive load</h2>
          <p className="mt-3 font-serif text-[40px] leading-none text-[#f4f7f6]">{load.label}</p>
          <div className="mt-5"><Meter label="Estimated load" value={load.value} valueText={`${Math.round(load.value * 100)}% — ${load.label}`} /></div>
          <ul className="mt-5 space-y-1.5 text-[13px] font-light text-[#b8ccca]/80">
            <li>Open effort: {load.openEffort} point{load.openEffort === 1 ? "" : "s"} across {open.length} task{open.length === 1 ? "" : "s"}</li>
            <li>Energy: {energy}{load.energyLoad > 0 ? " (adds load)" : load.energyLoad < 0 ? " (eases load)" : ""}</li>
            <li>Focused so far: {focusedMinutes} min{load.fatigue >= 0.15 ? " — fatigue is building" : ""}</li>
          </ul>
          {(tasks.length > 0 || focusedMinutes > 0) && (
            <button type="button" onClick={() => { setTasks([]); setFocusedMinutes(0); setEnergy("steady"); setDuration(null); setTitle(""); setError(undefined); }} className={`${buttonQuiet} mt-5`}>
              Reset everything
            </button>
          )}
          {load.label === "overloaded" && (
            <p className="mt-4 text-[14px] text-[#e6d3a8]">That&apos;s a lot at once. Consider removing or postponing something before starting.</p>
          )}
        </div>

        <div className={panel}>
          <h2 className={eyebrow}>next</h2>
          {suggested ? (
            <>
              <p className="mt-3 text-[15px] font-light leading-relaxed text-[#dce7e5]/85">
                {load.value >= 0.6 || energy === "low" ? "Start small to build momentum:" : "You have room — take on the hardest thing first:"}{" "}
                <span className="text-[#f4f7f6]">{suggested.title}</span>
              </p>
              <label htmlFor="session-length" className="mt-5 block text-[13px] text-[#dce7e5]/85">Session length</label>
              <select id="session-length" value={duration ?? ""} onChange={(e) => setDuration(e.target.value ? Number(e.target.value) : null)} className={`${field} mt-2`}>
                <option value="">Suggested ({suggestedDuration} min)</option>
                <option value={10}>10 min</option>
                <option value={15}>15 min</option>
                <option value={25}>25 min</option>
              </select>
              <button ref={startButtonRef} type="button" onClick={() => start(suggested)} className={`${buttonPrimary} mt-5`}>Enter focus</button>
            </>
          ) : (
            <p className="mt-3 text-[14px] font-light text-[#b8ccca]/70">Add a task to get a suggestion.</p>
          )}
        </div>
      </div>
    </div>
  );
}

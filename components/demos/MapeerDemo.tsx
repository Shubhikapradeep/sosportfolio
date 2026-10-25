"use client";

import { useMemo, useRef, useState, type FormEvent } from "react";
import { buttonPrimary, buttonQuiet, eyebrow, field, FieldError, Meter, panel } from "./ui";

type ModeId = "walk" | "cycle" | "metro" | "bus" | "carpool" | "car";
type Mode = { id: ModeId; label: string; speedKmh: number; overheadMin: number; gPerKm: number; maxKm: number; active: boolean };

// Typical averages: door-to-door speeds for a busy city and approximate per-passenger emission factors.
const MODES: Mode[] = [
  { id: "walk", label: "Walk", speedKmh: 5, overheadMin: 0, gPerKm: 0, maxKm: 5, active: true },
  { id: "cycle", label: "Cycle", speedKmh: 15, overheadMin: 2, gPerKm: 0, maxKm: 20, active: true },
  { id: "metro", label: "Metro", speedKmh: 32, overheadMin: 12, gPerKm: 35, maxKm: 60, active: false },
  { id: "bus", label: "Bus", speedKmh: 18, overheadMin: 10, gPerKm: 100, maxKm: 60, active: false },
  { id: "carpool", label: "Carpool (3 people)", speedKmh: 24, overheadMin: 6, gPerKm: 57, maxKm: 100, active: false },
  { id: "car", label: "Drive alone", speedKmh: 24, overheadMin: 4, gPerKm: 170, maxKm: 100, active: false },
];
const CAR_G_PER_KM = 170;
const INITIAL_AFFINITY: Record<ModeId, number> = { walk: 0.5, cycle: 0.5, metro: 0.5, bus: 0.5, carpool: 0.5, car: 0.5 };

type Trip = { request: { distance: number; priority: number; rain: boolean; heavy: boolean; deadline?: number } };
type Option = Mode & { minutes: number; kgCo2: number; score: number; reasons: string[]; tooSlow: boolean };
type LoggedTrip = { id: number; mode: string; distance: number; kgCo2: number; kgSaved: number };

function rank(req: Trip["request"], affinity: Record<ModeId, number>): Option[] {
  const feasible = MODES.filter((m) => req.distance <= m.maxKm);
  const options = feasible.map((m) => ({
    ...m,
    minutes: Math.round(m.overheadMin + (req.distance / m.speedKmh) * 60),
    kgCo2: (m.gPerKm * req.distance) / 1000,
  }));
  const fastest = Math.min(...options.map((o) => o.minutes));
  const dirtiest = Math.max(...options.map((o) => o.kgCo2)) || 1;
  const eco = req.priority / 100;

  return options
    .map((o) => {
      const reasons: string[] = [];
      const speedScore = fastest / o.minutes;
      const ecoScore = 1 - o.kgCo2 / dirtiest;
      let score = (1 - eco) * speedScore + eco * ecoScore;

      let penalty = 0;
      if (o.active && req.rain) { penalty += 0.25; reasons.push("raining"); }
      if (o.active && req.heavy) { penalty += 0.25; reasons.push("carrying something heavy"); }
      score -= penalty;

      // Learned preference: a gentle nudge, never enough to override a clear mismatch.
      const learned = (affinity[o.id] - 0.5) * 0.4;
      score += learned;
      if (learned > 0.03) reasons.push("you often choose this");
      if (learned < -0.03) reasons.push("you usually skip this");

      const tooSlow = req.deadline !== undefined && o.minutes > req.deadline;
      if (tooSlow) { score -= 1; reasons.push(`over your ${req.deadline}-minute limit`); }
      if (o.minutes === fastest) reasons.push("fastest option");
      if (o.kgCo2 === 0) reasons.push("zero tailpipe emissions");
      return { ...o, score, reasons, tooSlow };
    })
    .sort((a, b) => b.score - a.score);
}

export default function MapeerDemo() {
  const [distance, setDistance] = useState("6");
  const [deadline, setDeadline] = useState("");
  const [priority, setPriority] = useState(60);
  const [rain, setRain] = useState(false);
  const [heavy, setHeavy] = useState(false);
  const [errors, setErrors] = useState<{ distance?: string; deadline?: string }>({});
  const [request, setRequest] = useState<Trip["request"] | null>(null);
  const [affinity, setAffinity] = useState(INITIAL_AFFINITY);
  const [trips, setTrips] = useState<LoggedTrip[]>([]);
  const [choices, setChoices] = useState(0);
  const [lastLogged, setLastLogged] = useState<string>();
  const tripId = useRef(1);

  const options = useMemo(() => (request ? rank(request, affinity) : []), [request, affinity]);

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    const d = Number(distance);
    const limit = deadline.trim() === "" ? undefined : Number(deadline);
    const next: typeof errors = {};
    if (distance.trim() === "" || !Number.isFinite(d)) next.distance = "Enter the trip distance in kilometres.";
    else if (d < 0.2 || d > 100) next.distance = "Distance must be between 0.2 and 100 km.";
    if (limit !== undefined && (!Number.isFinite(limit) || limit < 5 || limit > 300)) next.deadline = "Time limit must be between 5 and 300 minutes, or left empty.";
    setErrors(next);
    if (Object.keys(next).length) return;
    setRequest({ distance: d, priority, rain, heavy, deadline: limit });
  };

  const choose = (option: Option) => {
    if (!request) return;
    // Online preference update: the chosen mode gains affinity, modes ranked above it that were skipped lose a little.
    const skipped = options.slice(0, options.findIndex((o) => o.id === option.id)).map((o) => o.id);
    setAffinity((a) => {
      const next = { ...a };
      next[option.id] = a[option.id] + 0.15 * (1 - a[option.id]);
      skipped.forEach((id) => { next[id] = a[id] - 0.1 * a[id]; });
      return next;
    });
    setTrips((t) => [
      { id: tripId.current++, mode: option.label, distance: request.distance, kgCo2: option.kgCo2, kgSaved: (CAR_G_PER_KM * request.distance) / 1000 - option.kgCo2 },
      ...t,
    ]);
    setChoices((c) => c + 1);
    setLastLogged(`Logged ${option.label}, ${request.distance} km.`);
  };

  const totalSaved = trips.reduce((sum, t) => sum + t.kgSaved, 0);
  const totalKm = trips.reduce((sum, t) => sum + t.distance, 0);

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)]">
      <div className="flex flex-col gap-6">
        <form onSubmit={onSubmit} noValidate className={panel} aria-labelledby="trip-heading">
          <h2 id="trip-heading" className={eyebrow}>plan a trip</h2>

          <div className="mt-6 grid gap-5 sm:grid-cols-2">
            <div>
              <label htmlFor="trip-distance" className="text-[13px] text-[#dce7e5]/85">Distance (km)</label>
              <input id="trip-distance" type="number" inputMode="decimal" min={0.2} max={100} step={0.1} value={distance}
                onChange={(e) => setDistance(e.target.value)} aria-invalid={errors.distance ? true : undefined}
                aria-describedby={errors.distance ? "trip-distance-error" : undefined} className={`${field} mt-2`} />
              <FieldError id="trip-distance-error" message={errors.distance} />
            </div>
            <div>
              <label htmlFor="trip-deadline" className="text-[13px] text-[#dce7e5]/85">Time limit (min, optional)</label>
              <input id="trip-deadline" type="number" inputMode="numeric" min={5} max={300} value={deadline} placeholder="none"
                onChange={(e) => setDeadline(e.target.value)} aria-invalid={errors.deadline ? true : undefined}
                aria-describedby={errors.deadline ? "trip-deadline-error" : undefined} className={`${field} mt-2`} />
              <FieldError id="trip-deadline-error" message={errors.deadline} />
            </div>
          </div>

          <div className="mt-6">
            <label htmlFor="trip-priority" className="flex justify-between text-[13px] text-[#dce7e5]/85">
              <span>Priority</span>
              <span className="tabular-nums text-[#b8ccca]/70">{priority < 40 ? "speed first" : priority > 60 ? "sustainability first" : "balanced"}</span>
            </label>
            <input id="trip-priority" type="range" min={0} max={100} value={priority} onChange={(e) => setPriority(Number(e.target.value))}
              aria-valuetext={`${100 - priority}% speed, ${priority}% sustainability`} className="mt-3 w-full accent-[#dce7e5]" />
            <div className="mt-1 flex justify-between text-[11px] text-[#b8ccca]/55"><span>fastest</span><span>greenest</span></div>
          </div>

          <fieldset className="mt-6">
            <legend className="text-[13px] text-[#dce7e5]/85">Conditions</legend>
            <div className="mt-3 flex flex-wrap gap-x-6 gap-y-3 text-[14px] font-light text-[#dce7e5]/85">
              <label className="inline-flex min-h-[32px] items-center gap-2"><input type="checkbox" checked={rain} onChange={(e) => setRain(e.target.checked)} className="h-4 w-4 accent-[#dce7e5]" /> Raining</label>
              <label className="inline-flex min-h-[32px] items-center gap-2"><input type="checkbox" checked={heavy} onChange={(e) => setHeavy(e.target.checked)} className="h-4 w-4 accent-[#dce7e5]" /> Carrying something heavy</label>
            </div>
          </fieldset>

          <button type="submit" className={`${buttonPrimary} mt-8`}>Recommend</button>
        </form>

        <div className={panel}>
          <h2 className={eyebrow}>learned preferences</h2>
          <p className="mt-3 text-[13px] font-light leading-relaxed text-[#b8ccca]/75">
            {choices === 0 ? "Pick an option to start nudging the ranking toward your habits. These are simple preference weights stored in this tab, not a trained model." : `Updated from ${choices} choice${choices > 1 ? "s" : ""}. Chosen modes gain weight; skipped higher-ranked modes lose a little.`}
          </p>
          <div className="mt-5 space-y-4">
            {MODES.map((m) => (
              <Meter key={m.id} label={m.label} value={affinity[m.id]} valueText={`${Math.round(affinity[m.id] * 100)}`} />
            ))}
          </div>
          <button type="button" onClick={() => { setAffinity(INITIAL_AFFINITY); setChoices(0); }} disabled={choices === 0} className={`${buttonQuiet} mt-6`}>
            Reset preferences
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-6">
        <div className={panel} aria-live="polite">
          <h2 className={eyebrow}>recommendations</h2>
          {!request ? (
            <p className="mt-4 text-[15px] font-light text-[#b8ccca]/75">Enter a trip and press Recommend to see ranked options.</p>
          ) : (
            <ol className="mt-5 space-y-3">
              {options.map((o, i) => (
                <li key={o.id} className={`rounded-2xl border px-5 py-4 ${i === 0 ? "border-[#dce7e5]/35 bg-white/[.05]" : "border-white/10"} ${o.tooSlow ? "opacity-60" : ""}`}>
                  <div className="flex flex-wrap items-baseline justify-between gap-3">
                    <p className="font-serif text-[22px] text-[#f4f7f6]">
                      <span className="mr-3 text-[12px] font-sans tracking-[.2em] text-[#b8ccca]/60">{String(i + 1).padStart(2, "0")}</span>
                      {o.label}
                    </p>
                    <p className="text-[13px] tabular-nums text-[#dce7e5]/85">≈ {o.minutes} min · {o.kgCo2.toFixed(2)} kg CO₂</p>
                  </div>
                  {o.reasons.length > 0 && <p className="mt-1 text-[12px] text-[#b8ccca]/65">{o.reasons.join(" · ")}</p>}
                  <button type="button" onClick={() => choose(o)} className={`${buttonQuiet} mt-3`} aria-label={`Take ${o.label} for this trip`}>
                    Take this
                  </button>
                </li>
              ))}
            </ol>
          )}
          {request && options.length < MODES.length && (
            <p className="mt-4 text-[12px] text-[#b8ccca]/60">
              Not shown for {request.distance} km: {MODES.filter((m) => request.distance > m.maxKm).map((m) => `${m.label} (over ${m.maxKm} km)`).join(", ")}.
            </p>
          )}
          <p className="mt-4 text-[12px] leading-relaxed text-[#b8ccca]/55">
            Assumptions: {MODES.map((m) => `${m.label} ${m.speedKmh} km/h + ${m.overheadMin} min, ${m.gPerKm} g CO₂/km`).join(" · ")}. Estimates only; savings are compared with driving alone at {CAR_G_PER_KM} g/km.
          </p>
        </div>

        <div className={panel}>
          <h2 className={eyebrow}>carbon tracking</h2>
          <div className="mt-4 flex flex-wrap items-end gap-x-10 gap-y-4">
            <p><span className="block font-serif text-[44px] leading-none text-[#f4f7f6]">{totalSaved.toFixed(2)}</span><span className="text-[12px] text-[#b8ccca]/70">kg CO₂ saved vs. driving alone</span></p>
            <p><span className="block font-serif text-[44px] leading-none text-[#f4f7f6]">{trips.length}</span><span className="text-[12px] text-[#b8ccca]/70">trips · {totalKm.toFixed(1)} km</span></p>
          </div>
          <p role="status" className="mt-4 min-h-[1.25em] text-[12px] text-[#cfe5dc]">{lastLogged}</p>
          {trips.length === 0 ? (
            <p className="mt-5 text-[14px] font-light text-[#b8ccca]/70">No trips logged yet.</p>
          ) : (
            <ul className="mt-5 max-h-56 space-y-2 overflow-y-auto text-[13px] font-light text-[#dce7e5]/85">
              {trips.map((t) => (
                <li key={t.id} className="flex justify-between gap-4 border-b border-white/5 pb-2">
                  <span>{t.mode} · {t.distance} km</span>
                  <span className="tabular-nums text-[#b8ccca]/75">{t.kgSaved > 0 ? `−${t.kgSaved.toFixed(2)}` : "0.00"} kg</span>
                </li>
              ))}
            </ul>
          )}
          {trips.length > 0 && <button type="button" onClick={() => { setTrips([]); setLastLogged(undefined); }} className={`${buttonQuiet} mt-5`}>Clear log</button>}
        </div>
      </div>
    </div>
  );
}

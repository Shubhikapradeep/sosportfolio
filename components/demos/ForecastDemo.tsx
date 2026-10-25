"use client";

import { useEffect, useMemo, useState } from "react";
import { buttonPrimary, buttonQuiet, eyebrow, field, FieldError, panel } from "./ui";

type Pattern = "random" | "trending" | "cyclical";
type ModelId = "naive" | "sma" | "linear" | "ar3";
type Predictor = (history: number[]) => number;
type Model = { id: ModelId; label: string; detail: string; fit: (train: number[]) => Predictor };

const VOLATILITY = { low: 0.01, medium: 0.02, high: 0.035 } as const;
const SERIES_LENGTH = 180;

// ---------- data ----------

function mulberry32(seed: number) {
  let s = seed | 0;
  return () => {
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function generateSeries(seed: number, pattern: Pattern, vol: number) {
  const rand = mulberry32(seed);
  const normal = () => {
    let u = 0;
    while (u === 0) u = rand();
    return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * rand());
  };
  const drift = pattern === "trending" ? 0.0025 : 0.0002;
  let logPrice = Math.log(100);
  return Array.from({ length: SERIES_LENGTH }, (_, i) => {
    logPrice += drift + vol * normal();
    const cycle = pattern === "cyclical" ? 0.08 * Math.sin((2 * Math.PI * i) / 30) : 0;
    return Math.exp(logPrice + cycle);
  });
}

function parsePrices(text: string): { prices?: number[]; error?: string } {
  const prices: number[] = [];
  for (const line of text.split(/\r?\n/)) {
    const tokens = line.split(/[,;\t ]+/).map((t) => t.replace(/["$]/g, "")).filter(Boolean);
    // Use the last numeric value on each line (e.g. the close in "date,open,high,low,close"); skip headers.
    const value = [...tokens].reverse().map(Number).find((n) => Number.isFinite(n));
    if (value === undefined) continue;
    if (value <= 0) return { error: `Prices must be positive — found ${value}.` };
    prices.push(value);
  }
  if (prices.length < 40) return { error: `Need at least 40 prices to fit and test models — found ${prices.length}.` };
  if (prices.length > 2000) return { error: "Please paste 2,000 prices or fewer." };
  return { prices };
}

// ---------- maths ----------

const mean = (xs: number[]) => xs.reduce((a, b) => a + b, 0) / xs.length;

function linearFit(ys: number[]) {
  const n = ys.length;
  const xMean = (n - 1) / 2;
  const yMean = mean(ys);
  let num = 0, den = 0;
  ys.forEach((y, x) => { num += (x - xMean) * (y - yMean); den += (x - xMean) ** 2; });
  const slope = den ? num / den : 0;
  return { slope, intercept: yMean - slope * xMean };
}

function logReturns(prices: number[]) {
  return prices.slice(1).map((p, i) => Math.log(p / prices[i]));
}

// Least squares via normal equations with a tiny ridge term for stability.
function solveLeastSquares(rows: number[][], ys: number[]) {
  const k = rows[0].length;
  const a = Array.from({ length: k }, (_, i) => Array.from({ length: k + 1 }, (_, j) =>
    j === k ? rows.reduce((s, r, n) => s + r[i] * ys[n], 0) : rows.reduce((s, r) => s + r[i] * r[j], 0) + (i === j ? 1e-8 : 0)));
  for (let c = 0; c < k; c++) {
    let pivot = c;
    for (let r = c + 1; r < k; r++) if (Math.abs(a[r][c]) > Math.abs(a[pivot][c])) pivot = r;
    [a[c], a[pivot]] = [a[pivot], a[c]];
    for (let r = 0; r < k; r++) {
      if (r === c || !a[c][c]) continue;
      const f = a[r][c] / a[c][c];
      for (let j = c; j <= k; j++) a[r][j] -= f * a[c][j];
    }
  }
  return a.map((row, i) => (row[i] ? row[k] / row[i] : 0));
}

const MODELS: Model[] = [
  { id: "naive", label: "Naive", detail: "tomorrow = today", fit: () => (h) => h[h.length - 1] },
  { id: "sma", label: "Moving average", detail: "mean of the last 10", fit: () => (h) => mean(h.slice(-10)) },
  {
    id: "linear", label: "Linear trend", detail: "line through the last 20",
    fit: () => (h) => { const w = h.slice(-20); const { slope, intercept } = linearFit(w); return intercept + slope * w.length; },
  },
  {
    id: "ar3", label: "AR(3)", detail: "autoregression on log returns",
    fit: (train) => {
      const r = logReturns(train);
      const rows: number[][] = [], ys: number[] = [];
      for (let t = 3; t < r.length; t++) { rows.push([1, r[t - 1], r[t - 2], r[t - 3]]); ys.push(r[t]); }
      const [c, b1, b2, b3] = solveLeastSquares(rows, ys);
      return (h) => {
        const n = h.length;
        const ret = (i: number) => Math.log(h[n - i] / h[n - i - 1]);
        return h[n - 1] * Math.exp(c + b1 * ret(1) + b2 * ret(2) + b3 * ret(3));
      };
    },
  },
];

function backtest(series: number[], split: number) {
  return MODELS.map((model) => {
    const predict = model.fit(series.slice(0, split));
    let absErr = 0, pctErr = 0, calls = 0, hits = 0;
    for (let t = split; t < series.length; t++) {
      const history = series.slice(0, t);
      const pred = predict(history);
      const last = history[history.length - 1];
      absErr += Math.abs(pred - series[t]);
      pctErr += Math.abs(pred - series[t]) / series[t];
      if (pred !== last) { calls++; if (Math.sign(pred - last) === Math.sign(series[t] - last)) hits++; }
    }
    const n = series.length - split;
    return { model, mae: absErr / n, mape: (pctErr / n) * 100, direction: calls ? hits / calls : null };
  });
}

function smaSeries(xs: number[], window: number) {
  return xs.map((_, i) => (i + 1 < window ? null : mean(xs.slice(i + 1 - window, i + 1))));
}

// ---------- component ----------

// The maths runs in the browser only: Math.exp/log can differ in the last digit between the
// server's and the browser's JS engines, which would cause a hydration mismatch in the chart.
export default function ForecastDemo() {
  const [ready, setReady] = useState(false);
  useEffect(() => setReady(true), []);

  if (!ready) {
    return (
      <div className={`${panel} flex min-h-[360px] items-center justify-center`} role="status">
        <p className="text-[14px] font-light text-[#b8ccca]/75">Generating series and fitting models…</p>
      </div>
    );
  }
  return <ForecastLab />;
}

function ForecastLab() {
  const [source, setSource] = useState<"synthetic" | "pasted">("synthetic");
  const [pattern, setPattern] = useState<Pattern>("random");
  const [volatility, setVolatility] = useState<keyof typeof VOLATILITY>("medium");
  const [seed, setSeed] = useState(42);
  const [csv, setCsv] = useState("");
  const [csvError, setCsvError] = useState<string>();
  const [pasted, setPasted] = useState<number[] | null>(null);
  const [modelId, setModelId] = useState<ModelId>("ar3");
  const [horizon, setHorizon] = useState(15);

  const series = useMemo(
    () => (source === "pasted" && pasted ? pasted : generateSeries(seed, pattern, VOLATILITY[volatility])),
    [source, pasted, seed, pattern, volatility],
  );

  const analysis = useMemo(() => {
    const split = Math.floor(series.length * 0.75);
    const results = backtest(series, split);
    const best = results.reduce((a, b) => (b.mae < a.mae ? b : a));
    const naive = results.find((r) => r.model.id === "naive")!;

    const model = MODELS.find((m) => m.id === modelId)!;
    const predict = model.fit(series);
    const extended = [...series];
    for (let k = 0; k < horizon; k++) extended.push(predict(extended));
    const forecast = extended.slice(series.length);

    const sigma = Math.sqrt(mean(logReturns(series).map((r) => r * r)));
    const last = series[series.length - 1];
    const band = forecast.map((_, k) => [last * Math.exp(-1.96 * sigma * Math.sqrt(k + 1)), last * Math.exp(1.96 * sigma * Math.sqrt(k + 1))]);

    const fast = smaSeries(series, 10), slow = smaSeries(series, 30);
    const crosses: { index: number; kind: "golden" | "death" }[] = [];
    for (let i = 1; i < series.length; i++) {
      const [f0, s0, f1, s1] = [fast[i - 1], slow[i - 1], fast[i], slow[i]];
      if (f0 === null || s0 === null || f1 === null || s1 === null) continue;
      if (f0 <= s0 && f1 > s1) crosses.push({ index: i, kind: "golden" });
      if (f0 >= s0 && f1 < s1) crosses.push({ index: i, kind: "death" });
    }
    const recent = series.slice(-30);
    const trendPct = (linearFit(recent).slope / mean(recent)) * 100;

    return { split, results, best, naive, forecast, band, fast, crosses, trendPct };
  }, [series, modelId, horizon]);

  const usePasted = () => {
    const { prices, error } = parsePrices(csv);
    setCsvError(error);
    if (prices) setPasted(prices);
  };

  // ---------- chart geometry ----------
  const W = 800, H = 320, L = 52, R = 16, T = 16, B = 30;
  const total = series.length + horizon;
  const all = [...series, ...analysis.forecast, ...analysis.band.flat()];
  const yMin = Math.min(...all), yMax = Math.max(...all);
  const x = (i: number) => L + (i / (total - 1)) * (W - L - R);
  const y = (v: number) => T + (1 - (v - yMin) / (yMax - yMin || 1)) * (H - T - B);
  const path = (pts: [number, number][]) => pts.map(([i, v], k) => `${k ? "L" : "M"}${x(i).toFixed(1)},${y(v).toFixed(1)}`).join("");
  const n = series.length;
  const pricePath = path(series.map((v, i) => [i, v]));
  const smaPath = path(analysis.fast.flatMap((v, i) => (v === null ? [] : [[i, v] as [number, number]])));
  const forecastPath = path([[n - 1, series[n - 1]], ...analysis.forecast.map((v, k) => [n + k, v] as [number, number])]);
  const bandPath =
    path([[n - 1, series[n - 1]], ...analysis.band.map(([, hi], k) => [n + k, hi] as [number, number])]) +
    analysis.band.map(([lo], k) => [n + k, lo] as [number, number]).reverse().map(([i, v]) => `L${x(i).toFixed(1)},${y(v).toFixed(1)}`).join("") +
    `L${x(n - 1).toFixed(1)},${y(series[n - 1]).toFixed(1)}Z`;

  const selected = MODELS.find((m) => m.id === modelId)!;
  const lastCross = analysis.crosses[analysis.crosses.length - 1];
  const beatsNaive = analysis.best.model.id !== "naive" && analysis.best.mae < analysis.naive.mae * 0.95;
  const summary = `${n} prices from ${series[0].toFixed(2)} to ${series[n - 1].toFixed(2)}. ${selected.label} forecasts ${analysis.forecast[horizon - 1].toFixed(2)} after ${horizon} steps.`;

  return (
    <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(0,2fr)]">
      <div className="flex flex-col gap-6">
        <div className={panel}>
          <fieldset>
            <legend className={eyebrow}>data</legend>
            <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-[14px] font-light text-[#dce7e5]/85">
              <label className="inline-flex min-h-[32px] items-center gap-2"><input type="radio" name="source" checked={source === "synthetic"} onChange={() => setSource("synthetic")} className="accent-[#dce7e5]" /> Synthetic</label>
              <label className="inline-flex min-h-[32px] items-center gap-2"><input type="radio" name="source" checked={source === "pasted"} onChange={() => setSource("pasted")} className="accent-[#dce7e5]" /> Paste your own</label>
            </div>
          </fieldset>

          {source === "synthetic" ? (
            <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-1">
              <div>
                <label htmlFor="fc-pattern" className="text-[13px] text-[#dce7e5]/85">Hidden pattern</label>
                <select id="fc-pattern" value={pattern} onChange={(e) => setPattern(e.target.value as Pattern)} className={`${field} mt-2`}>
                  <option value="random">None (random walk)</option>
                  <option value="trending">Upward drift</option>
                  <option value="cyclical">30-step cycle</option>
                </select>
              </div>
              <div>
                <label htmlFor="fc-vol" className="text-[13px] text-[#dce7e5]/85">Volatility</label>
                <select id="fc-vol" value={volatility} onChange={(e) => setVolatility(e.target.value as keyof typeof VOLATILITY)} className={`${field} mt-2`}>
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>
              <div className="flex items-end gap-3 sm:col-span-2 xl:col-span-1">
                <p className="pb-3 text-[13px] tabular-nums text-[#b8ccca]/70">seed {seed}</p>
                <button type="button" onClick={() => setSeed(Math.floor(Math.random() * 100000))} className={buttonQuiet}>New series</button>
              </div>
            </div>
          ) : (
            <div className="mt-5">
              <label htmlFor="fc-csv" className="text-[13px] text-[#dce7e5]/85">Closing prices — one per line, or CSV rows (last number is used)</label>
              <textarea id="fc-csv" rows={6} value={csv} onChange={(e) => setCsv(e.target.value)} placeholder={"date,close\n2024-01-02,185.6\n2024-01-03,184.2\n…"}
                aria-invalid={csvError ? true : undefined} aria-describedby={csvError ? "fc-csv-error" : undefined} className={`${field} mt-2 font-mono text-[13px]`} />
              <FieldError id="fc-csv-error" message={csvError} />
              <button type="button" onClick={usePasted} className={`${buttonPrimary} mt-4`}>Use this data</button>
              {!pasted && !csvError && <p className="mt-3 text-[12px] text-[#b8ccca]/60">Until you load data, the synthetic series is shown.</p>}
            </div>
          )}
        </div>

        <div className={panel}>
          <fieldset>
            <legend className={eyebrow}>forecast model</legend>
            <div className="mt-4 space-y-2">
              {MODELS.map((m) => (
                <label key={m.id} className="flex min-h-[32px] items-center gap-3 text-[14px] font-light text-[#dce7e5]/85">
                  <input type="radio" name="model" checked={modelId === m.id} onChange={() => setModelId(m.id)} className="accent-[#dce7e5]" />
                  <span>{m.label} <span className="text-[#b8ccca]/60">— {m.detail}</span></span>
                </label>
              ))}
            </div>
          </fieldset>
          <label htmlFor="fc-horizon" className="mt-6 flex justify-between text-[13px] text-[#dce7e5]/85">
            <span>Horizon</span><span className="tabular-nums text-[#b8ccca]/70">{horizon} steps</span>
          </label>
          <input id="fc-horizon" type="range" min={5} max={30} value={horizon} onChange={(e) => setHorizon(Number(e.target.value))} className="mt-3 w-full accent-[#dce7e5]" />
        </div>
      </div>

      <div className="flex min-w-0 flex-col gap-6">
        <figure className={panel}>
          <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={summary} className="h-auto w-full">
            <rect x={x(analysis.split)} y={T} width={x(n - 1) - x(analysis.split)} height={H - T - B} fill="rgba(220,231,229,0.04)" />
            {[yMin, (yMin + yMax) / 2, yMax].map((v, gi) => (
              <g key={gi}>
                <line x1={L} x2={W - R} y1={y(v)} y2={y(v)} stroke="rgba(255,255,255,0.06)" />
                <text x={L - 8} y={y(v) + 4} textAnchor="end" fontSize="11" fill="rgba(184,204,202,0.6)">{v.toFixed(0)}</text>
              </g>
            ))}
            <path d={bandPath} fill="rgba(230,211,168,0.08)" />
            <path d={smaPath} fill="none" stroke="rgba(184,204,202,0.45)" strokeWidth="1" strokeDasharray="2 3" />
            <path d={pricePath} fill="none" stroke="#dce7e5" strokeWidth="1.5" />
            <path d={forecastPath} fill="none" stroke="#e6d3a8" strokeWidth="1.75" strokeDasharray="5 4" />
            <line x1={x(n - 1)} x2={x(n - 1)} y1={T} y2={H - B} stroke="rgba(255,255,255,0.2)" />
            {analysis.crosses.map((c) => (
              <circle key={c.index} cx={x(c.index)} cy={y(series[c.index])} r="3.5" fill={c.kind === "golden" ? "#cfe5dc" : "#e8a7a0"} />
            ))}
            <text x={x(analysis.split) + 6} y={T + 14} fontSize="11" fill="rgba(184,204,202,0.6)">backtest window</text>
            <text x={x(n - 1)} y={H - 10} textAnchor="middle" fontSize="11" fill="rgba(184,204,202,0.7)">now</text>
          </svg>
          <p className="mt-3 text-[12px] text-[#e6d3a8]/80">
            {source === "pasted" && pasted ? `Data: ${n} prices you pasted. Nothing is uploaded.` : `Data: synthetic series (seed ${seed}, ${pattern === "random" ? "random walk" : pattern === "trending" ? "upward drift" : "30-step cycle"}, ${volatility} volatility), not real market prices.`}
          </p>
          <figcaption className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-[12px] text-[#b8ccca]/75">
            <span><span aria-hidden="true" className="mr-2 inline-block h-px w-5 bg-[#dce7e5] align-middle" />price</span>
            <span><span aria-hidden="true" className="mr-2 inline-block w-5 border-t border-dashed border-[#b8ccca]/60 align-middle" />10-step average</span>
            <span><span aria-hidden="true" className="mr-2 inline-block w-5 border-t-2 border-dashed border-[#e6d3a8] align-middle" />{selected.label} forecast</span>
            <span><span aria-hidden="true" className="mr-2 inline-block h-2 w-5 bg-[#e6d3a8]/20 align-middle" />rough 95% range (random-walk volatility)</span>
            <span><span aria-hidden="true" className="mr-1 inline-block h-2 w-2 rounded-full bg-[#cfe5dc]" />/<span aria-hidden="true" className="ml-1 mr-2 inline-block h-2 w-2 rounded-full bg-[#e8a7a0]" />average crossovers</span>
          </figcaption>
        </figure>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)]">
          <div className={panel}>
            <h2 className={eyebrow}>walk-forward backtest</h2>
            <p className="mt-2 text-[12px] text-[#b8ccca]/65">Fitted on the first 75%, then predicting one step ahead across the last {n - analysis.split} points.</p>
            <div className="mt-4 overflow-x-auto">
              <table className="w-full min-w-[340px] text-left text-[13px] font-light text-[#dce7e5]/85">
                <thead className="text-[10px] uppercase tracking-[.2em] text-[#b8ccca]/60">
                  <tr><th scope="col" className="pb-2 font-normal">Model</th><th scope="col" className="pb-2 font-normal">MAE</th><th scope="col" className="pb-2 font-normal">MAPE</th><th scope="col" className="pb-2 font-normal">Direction</th></tr>
                </thead>
                <tbody className="tabular-nums">
                  {analysis.results.map((r) => (
                    <tr key={r.model.id} className={`border-t border-white/5 ${r === analysis.best ? "text-[#f4f7f6]" : ""}`}>
                      <th scope="row" className="py-2 font-light">{r.model.label}{r === analysis.best && <span className="ml-2 text-[10px] uppercase tracking-[.2em] text-[#e6d3a8]">best</span>}</th>
                      <td className="py-2">{r.mae.toFixed(2)}</td>
                      <td className="py-2">{r.mape.toFixed(2)}%</td>
                      <td className="py-2">{r.direction === null ? "—" : `${Math.round(r.direction * 100)}%`}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="mt-4 text-[14px] font-light leading-relaxed text-[#dce7e5]/85">
              {beatsNaive
                ? `${analysis.best.model.label} beat "tomorrow = today" by ${(100 - (analysis.best.mae / analysis.naive.mae) * 100).toFixed(0)}% here — there's some structure to exploit.`
                : `Nothing clearly beat "tomorrow = today". That's the signature of a random walk: past prices carry little usable signal.`}
            </p>
          </div>

          <div className={panel}>
            <h2 className={eyebrow}>patterns found</h2>
            <dl className="mt-4 space-y-4 text-[14px] font-light text-[#dce7e5]/85">
              <div>
                <dt className="text-[11px] uppercase tracking-[.2em] text-[#b8ccca]/60">Recent trend (30 steps)</dt>
                <dd className="mt-1">{analysis.trendPct >= 0 ? "+" : ""}{analysis.trendPct.toFixed(2)}% per step · {Math.abs(analysis.trendPct) < 0.05 ? "flat" : analysis.trendPct > 0 ? "rising" : "falling"}</dd>
              </div>
              <div>
                <dt className="text-[11px] uppercase tracking-[.2em] text-[#b8ccca]/60">10 / 30 average crossovers</dt>
                <dd className="mt-1">
                  {analysis.crosses.length === 0
                    ? "None in this window."
                    : `${analysis.crosses.length} found. Latest: ${lastCross.kind === "golden" ? "upward" : "downward"} cross ${n - 1 - lastCross.index === 0 ? "on the latest step" : `${n - 1 - lastCross.index} step${n - 1 - lastCross.index === 1 ? "" : "s"} ago`}.`}
                </dd>
              </div>
            </dl>
            <button type="button" onClick={() => { setSource("synthetic"); setSeed(42); setPattern("random"); setVolatility("medium"); setCsv(""); setCsvError(undefined); setPasted(null); setModelId("ar3"); setHorizon(15); }} className={`${buttonQuiet} mt-6`}>Reset</button>
          </div>
        </div>
      </div>
    </div>
  );
}

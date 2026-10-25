// Shared styling for the project demos, matching the portfolio's cards, pills and labels.

export const panel =
  "rounded-[28px] border border-white/10 bg-[#0a141e]/55 p-6 backdrop-blur-xl shadow-[0_20px_60px_rgba(0,12,20,.45)] md:p-8";

export const eyebrow = "text-[10px] uppercase tracking-[.3em] text-[#b8ccca]/70";

export const field =
  "w-full rounded-2xl border border-white/15 bg-[#061c27]/60 px-4 py-3 text-[15px] font-light text-[#f4f7f6] placeholder:text-[#b8ccca]/40 transition-colors duration-300 hover:border-white/30 focus:border-[#dce7e5]/70 focus:outline-none focus-visible:outline-none focus:shadow-[0_0_0_1px_rgba(220,231,229,.6)]";

export const buttonPrimary =
  "inline-flex min-h-[44px] items-center justify-center gap-2 rounded-full border border-white/25 bg-white/[.07] px-6 py-2.5 text-[10px] uppercase tracking-[.25em] text-[#f4f7f6] backdrop-blur-md transition-colors duration-300 hover:border-white/50 hover:bg-white/[.13] disabled:cursor-not-allowed disabled:opacity-40";

export const buttonQuiet =
  "inline-flex min-h-[44px] items-center justify-center gap-2 rounded-full border border-white/10 px-5 py-2.5 text-[10px] uppercase tracking-[.25em] text-[#b8ccca]/80 transition-colors duration-300 hover:border-white/30 hover:text-[#e0e8e6] disabled:cursor-not-allowed disabled:opacity-40";

export const chip = "rounded-full border border-[#b5cbca]/20 bg-[#173846]/30 px-3 py-1 text-[11px] text-[#ccd9d7]/80";

export function FieldError({ id, message }: { id: string; message?: string }) {
  if (!message) return null;
  return (
    <p id={id} className="mt-2 text-[12px] tracking-wide text-[#e8a7a0]">
      {message}
    </p>
  );
}

export function Meter({ label, value, max = 1, valueText }: { label: string; value: number; max?: number; valueText?: string }) {
  const pct = Math.max(0, Math.min(100, (value / max) * 100));
  return (
    <div>
      <div className="flex items-baseline justify-between gap-3 text-[12px] text-[#ccd9d7]/80">
        <span>{label}</span>
        <span className="tabular-nums text-[#b8ccca]/70">{valueText ?? `${Math.round(pct)}%`}</span>
      </div>
      <div
        role="meter"
        aria-label={label}
        aria-valuemin={0}
        aria-valuemax={max}
        aria-valuenow={Number(value.toFixed(2))}
        aria-valuetext={valueText}
        className="mt-2 h-[3px] overflow-hidden rounded-full bg-white/10"
      >
        <div className="h-full rounded-full bg-[#dce7e5]/80 transition-[width] duration-700" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

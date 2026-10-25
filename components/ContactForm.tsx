"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { CONTACT_EMAIL, CONTACT_LIMITS, validateContact, type ContactErrors, type ContactFields } from "@/lib/contact";

type Status =
  | { kind: "idle" }
  | { kind: "submitting" }
  | { kind: "success" }
  | { kind: "not_configured" }
  | { kind: "error"; message: string };

const EMPTY: ContactFields = { name: "", email: "", subject: "", message: "" };

const FIELDS: { name: keyof ContactFields; label: string; type: "text" | "email" | "textarea"; autoComplete?: string }[] = [
  { name: "name", label: "Name", type: "text", autoComplete: "name" },
  { name: "email", label: "Email", type: "email", autoComplete: "email" },
  { name: "subject", label: "Subject", type: "text" },
  { name: "message", label: "Message", type: "textarea" },
];

const inputClass =
  "mt-3 w-full rounded-none border-0 border-b bg-transparent px-0 py-3 font-serif text-[22px] leading-snug text-[#f4f7f6] placeholder:text-[#b8ccca]/30 transition-colors duration-500 focus:outline-none focus-visible:outline-none md:text-[26px]";

export default function ContactForm({ labelledBy }: { labelledBy?: string }) {
  const [values, setValues] = useState<ContactFields>(EMPTY);
  const [errors, setErrors] = useState<ContactErrors>({});
  const [touched, setTouched] = useState<Partial<Record<keyof ContactFields, boolean>>>({});
  const [status, setStatus] = useState<Status>({ kind: "idle" });
  const [startedAt, setStartedAt] = useState(0);
  const formRef = useRef<HTMLFormElement>(null);

  // Set on the client only, so the server-rendered HTML stays stable.
  useEffect(() => setStartedAt(Date.now()), []);

  const update = (name: keyof ContactFields, value: string) => {
    const next = { ...values, [name]: value };
    setValues(next);
    if (touched[name]) setErrors(validateContact(next));
    if (status.kind !== "submitting" && status.kind !== "idle") setStatus({ kind: "idle" });
  };

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (status.kind === "submitting") return;

    const found = validateContact(values);
    setErrors(found);
    setTouched({ name: true, email: true, subject: true, message: true });
    const firstInvalid = FIELDS.find((f) => found[f.name]);
    if (firstInvalid) {
      formRef.current?.querySelector<HTMLElement>(`[name="${firstInvalid.name}"]`)?.focus();
      return;
    }

    setStatus({ kind: "submitting" });
    const honeypot = (formRef.current?.elements.namedItem("website") as HTMLInputElement | null)?.value ?? "";
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...values, website: honeypot, startedAt }),
      });
      const data = (await res.json().catch(() => ({}))) as { ok?: boolean; code?: string; error?: string; errors?: ContactErrors };

      if (res.ok && data.ok) {
        setStatus({ kind: "success" });
        setValues(EMPTY);
        setTouched({});
        setErrors({});
        setStartedAt(Date.now());
      } else if (data.code === "not_configured") {
        setStatus({ kind: "not_configured" });
      } else if (data.code === "invalid" && data.errors) {
        setErrors(data.errors);
        setStatus({ kind: "error", message: "Please fix the highlighted fields." });
      } else {
        setStatus({ kind: "error", message: data.error ?? "Something went wrong and the message wasn't sent. Please try again." });
      }
    } catch {
      setStatus({ kind: "error", message: "Couldn't reach the server, so the message wasn't sent. Check your connection and try again." });
    }
  };

  const mailto = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(values.subject)}&body=${encodeURIComponent(
    values.message + (values.name ? `\n\n— ${values.name}` : ""),
  )}`;

  return (
    <form ref={formRef} onSubmit={onSubmit} noValidate aria-labelledby={labelledBy} className="mt-8 grid gap-10 md:grid-cols-2 md:gap-x-12">
      {FIELDS.map((field) => {
        const id = `contact-${field.name}`;
        const error = touched[field.name] ? errors[field.name] : undefined;
        const common = {
          id,
          name: field.name,
          value: values[field.name],
          required: true,
          maxLength: CONTACT_LIMITS[field.name].max,
          "aria-invalid": error ? true : undefined,
          "aria-describedby": error ? `${id}-error` : undefined,
          onBlur: () => {
            setTouched((t) => ({ ...t, [field.name]: true }));
            setErrors(validateContact(values));
          },
          // The focus indicator is a brighter, doubled underline instead of the global outline.
          className: `${inputClass} focus:shadow-[0_1px_0_0_rgba(220,231,229,.85)] ${error ? "border-[#e8a7a0]/70" : "border-white/20 hover:border-white/35 focus:border-[#dce7e5]/85"}`,
        };
        return (
          <div key={field.name} className={field.name === "subject" || field.name === "message" ? "md:col-span-2" : ""}>
            <label htmlFor={id} className="text-[10px] uppercase tracking-[.3em] text-[#b8ccca]/70">
              {field.label} <span aria-hidden="true" className="text-[#b8ccca]/40">*</span>
            </label>
            {field.type === "textarea" ? (
              <textarea {...common} rows={5} onChange={(e) => update(field.name, e.target.value)} className={`${common.className} resize-y font-sans text-[16px] font-light leading-relaxed md:text-[17px]`} />
            ) : (
              <input {...common} type={field.type} autoComplete={field.autoComplete} onChange={(e) => update(field.name, e.target.value)} />
            )}
            {error && (
              <p id={`${id}-error`} className="mt-2 text-[12px] tracking-wide text-[#e8a7a0]">
                {error}
              </p>
            )}
          </div>
        );
      })}

      {/* Honeypot: hidden from people and assistive tech; bots that fill every field get rejected. */}
      <div aria-hidden="true" className="absolute left-[-9999px] h-px w-px overflow-hidden">
        <label htmlFor="contact-website">Website</label>
        <input id="contact-website" name="website" type="text" tabIndex={-1} autoComplete="off" defaultValue="" />
      </div>

      <div className="flex flex-col gap-6 md:col-span-2 md:flex-row md:items-center">
        <button
          type="submit"
          disabled={status.kind === "submitting"}
          className="group relative inline-flex min-h-[48px] items-center justify-center gap-3 self-start overflow-hidden rounded-full border border-white/20 bg-white/5 px-8 py-4 text-[11px] uppercase tracking-[.3em] text-white shadow-[0_0_20px_rgba(255,255,255,0.05)] backdrop-blur-md transition-all duration-500 hover:border-white/40 hover:bg-white/10 hover:shadow-[0_0_30px_rgba(255,255,255,0.15)] disabled:cursor-wait disabled:opacity-60"
        >
          <span>{status.kind === "submitting" ? "Sending…" : "Send Message"}</span>
          <span aria-hidden="true" className="transition-transform duration-300 group-hover:translate-x-1">→</span>
        </button>

        <div role="status" aria-live="polite" className="text-[13px] leading-relaxed tracking-wide md:max-w-md">
          {status.kind === "success" && <p className="text-[#cfe5dc]">Message sent. Thank you — I&apos;ll get back to you soon.</p>}
          {status.kind === "error" && <p className="text-[#e8a7a0]">{status.message}</p>}
          {status.kind === "not_configured" && (
            <p className="text-[#e6d3a8]">
              Message delivery isn&apos;t set up on this site yet, so nothing was sent. You can{" "}
              <a href={mailto} className="underline underline-offset-4 hover:text-white">open it in your email app</a> or write to{" "}
              <a href={`mailto:${CONTACT_EMAIL}`} className="underline underline-offset-4 hover:text-white">{CONTACT_EMAIL}</a>.
            </p>
          )}
        </div>
      </div>
    </form>
  );
}

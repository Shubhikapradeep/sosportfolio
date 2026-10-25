// Contact form rules shared by the browser form and the /api/contact route.

export const CONTACT_EMAIL = "pradeepshubhika@gmail.com";

export type ContactFields = { name: string; email: string; subject: string; message: string };
export type ContactErrors = Partial<Record<keyof ContactFields, string>>;

export const CONTACT_LIMITS: Record<keyof ContactFields, { min: number; max: number }> = {
  name: { min: 1, max: 100 },
  email: { min: 3, max: 200 },
  subject: { min: 1, max: 150 },
  message: { min: 10, max: 5000 },
};

// Pragmatic check: one @, no spaces, a dot in the domain.
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateContact(fields: ContactFields): ContactErrors {
  const errors: ContactErrors = {};
  const name = fields.name.trim();
  const email = fields.email.trim();
  const subject = fields.subject.trim();
  const message = fields.message.trim();

  if (!name) errors.name = "Please enter your name.";
  else if (name.length > CONTACT_LIMITS.name.max) errors.name = `Please keep your name under ${CONTACT_LIMITS.name.max} characters.`;

  if (!email) errors.email = "Please enter your email address.";
  else if (email.length > CONTACT_LIMITS.email.max || !EMAIL_PATTERN.test(email)) errors.email = "Please enter a valid email address, like name@example.com.";

  if (!subject) errors.subject = "Please add a subject.";
  else if (subject.length > CONTACT_LIMITS.subject.max) errors.subject = `Please keep the subject under ${CONTACT_LIMITS.subject.max} characters.`;

  if (!message) errors.message = "Please write a message.";
  else if (message.length < CONTACT_LIMITS.message.min) errors.message = `Please write at least ${CONTACT_LIMITS.message.min} characters.`;
  else if (message.length > CONTACT_LIMITS.message.max) errors.message = `Please keep the message under ${CONTACT_LIMITS.message.max} characters.`;

  return errors;
}

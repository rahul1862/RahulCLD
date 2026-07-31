import { useState } from "react";
import { validateUser } from "../../utils/helpers";
const FIELDS = [
  {
    key: "name",
    label: "Full name",
    type: "text",
    placeholder: "e.g. Alice Smith",
    half: false,
  },
  {
    key: "email",
    label: "Email",
    type: "email",
    placeholder: "e.g. alice@company.com",
    half: false,
  },
  {
    key: "company",
    label: "Company",
    type: "text",
    placeholder: "e.g. Maren Foods",
    half: false,
  },
  {
    key: "address",
    label: "Address",
    type: "text",
    placeholder: "Street, city",
    half: false,
  },
  {
    key: "phone",
    label: "Phone",
    type: "tel",
    placeholder: "e.g. +353 87 000 0000",
    half: false,
    optional: true,
  },
];
export default function UserForm({ initial = {}, onSubmit, onCancel, submitLabel = "Save" }) {
  const [form, setForm] = useState({
    name: "",
    email: "",
    company: "",
    address: "",
    phone: "",
    ...initial,
  });
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [apiErr, setApiErr] = useState("");
  const set = (k) => (e) => {
    setForm((f) => ({
      ...f,
      [k]: e.target.value,
    }));
    if (errors[k])
      setErrors((prev) => {
        const n = {
          ...prev,
        };
        delete n[k];
        return n;
      });
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    const { valid, errors: errs } = validateUser(form);
    if (!valid) {
      setErrors(errs);
      return;
    }
    setErrors({});
    setApiErr("");
    setSaving(true);
    try {
      await onSubmit(form);
    } catch (err) {
      setApiErr(err.message);
    } finally {
      setSaving(false);
    }
  };
  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-4">
      {apiErr && (
        <div
          className="px-3.5 py-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-sm text-red-700 dark:text-red-400"
          role="alert"
        >
          {apiErr}
        </div>
      )}

      {FIELDS.map(({ key, label, type, placeholder, optional }) => (
        <div key={key}>
          <label htmlFor={key} className="field-label">
            {label}
            {optional && (
              <span className="ml-1 text-ink-400 normal-case font-normal tracking-normal">
                (optional)
              </span>
            )}
          </label>
          <input
            id={key}
            type={type}
            value={form[key]}
            onChange={set(key)}
            placeholder={placeholder}
            aria-invalid={!!errors[key]}
            aria-describedby={errors[key] ? `${key}-err` : undefined}
            className={`field ${errors[key] ? "field-error" : ""}`}
            autoComplete={key === "email" ? "email" : key === "name" ? "name" : "off"}
          />
          {errors[key] && (
            <p
              id={`${key}-err`}
              className="mt-1 text-[11px] text-red-500 dark:text-red-400"
              role="alert"
            >
              {errors[key]}
            </p>
          )}
        </div>
      ))}

      <div className="flex items-center justify-end gap-2 pt-2">
        {onCancel && (
          <button type="button" onClick={onCancel} className="btn-secondary btn-sm">
            Cancel
          </button>
        )}
        <button type="submit" disabled={saving} className="btn-primary btn-sm min-w-[90px]">
          {saving ? (
            <span className="flex items-center gap-2">
              <svg
                className="animate-spin h-3.5 w-3.5"
                viewBox="0 0 24 24"
                fill="none"
                aria-hidden="true"
              >
                <circle
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="3"
                  className="opacity-20"
                />
                <path
                  d="M4 12a8 8 0 018-8"
                  stroke="currentColor"
                  strokeWidth="3"
                  strokeLinecap="round"
                  className="opacity-80"
                />
              </svg>
              Saving
            </span>
          ) : (
            submitLabel
          )}
        </button>
      </div>
    </form>
  );
}

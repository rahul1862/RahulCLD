import { useState } from "react";
import { validateTransaction } from "../../utils/helpers";
const today = () => new Date().toISOString().slice(0, 10);
export default function TransactionForm({
  initial = {},
  onSubmit,
  onCancel,
  submitLabel = "Save",
}) {
  const [form, setForm] = useState({
    type: "expense",
    category: "",
    description: "",
    amount: "",
    ...initial,
    date: initial.date ? initial.date.slice(0, 10) : today(),
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
    const { valid, errors: errs } = validateTransaction(form);
    if (!valid) {
      setErrors(errs);
      return;
    }
    setErrors({});
    setApiErr("");
    setSaving(true);
    try {
      await onSubmit({
        ...form,
        amount: Number(form.amount),
      });
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

      <div>
        <label htmlFor="type" className="field-label">
          Type
        </label>
        <select id="type" value={form.type} onChange={set("type")} className="field">
          <option value="expense">Expense</option>
          <option value="income">Income</option>
        </select>
      </div>

      <div>
        <label htmlFor="category" className="field-label">
          Category
        </label>
        <input
          id="category"
          type="text"
          value={form.category}
          onChange={set("category")}
          placeholder="e.g. Hosting, Subscriptions"
          aria-invalid={!!errors.category}
          aria-describedby={errors.category ? "category-err" : undefined}
          className={`field ${errors.category ? "field-error" : ""}`}
        />
        {errors.category && (
          <p
            id="category-err"
            className="mt-1 text-[11px] text-red-500 dark:text-red-400"
            role="alert"
          >
            {errors.category}
          </p>
        )}
      </div>

      <div>
        <label htmlFor="description" className="field-label">
          Description
          <span className="ml-1 text-ink-400 normal-case font-normal tracking-normal">
            (optional)
          </span>
        </label>
        <input
          id="description"
          type="text"
          value={form.description}
          onChange={set("description")}
          placeholder="e.g. Render — API + static site"
          className="field"
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label htmlFor="amount" className="field-label">
            Amount (EUR)
          </label>
          <input
            id="amount"
            type="number"
            step="0.01"
            min="0"
            value={form.amount}
            onChange={set("amount")}
            placeholder="0.00"
            aria-invalid={!!errors.amount}
            aria-describedby={errors.amount ? "amount-err" : undefined}
            className={`field ${errors.amount ? "field-error" : ""}`}
          />
          {errors.amount && (
            <p
              id="amount-err"
              className="mt-1 text-[11px] text-red-500 dark:text-red-400"
              role="alert"
            >
              {errors.amount}
            </p>
          )}
        </div>
        <div>
          <label htmlFor="date" className="field-label">
            Date
          </label>
          <input
            id="date"
            type="date"
            value={form.date}
            onChange={set("date")}
            aria-invalid={!!errors.date}
            aria-describedby={errors.date ? "date-err" : undefined}
            className={`field ${errors.date ? "field-error" : ""}`}
          />
          {errors.date && (
            <p
              id="date-err"
              className="mt-1 text-[11px] text-red-500 dark:text-red-400"
              role="alert"
            >
              {errors.date}
            </p>
          )}
        </div>
      </div>

      <div className="flex items-center justify-end gap-2 pt-2">
        {onCancel && (
          <button type="button" onClick={onCancel} className="btn-secondary btn-sm">
            Cancel
          </button>
        )}
        <button type="submit" disabled={saving} className="btn-primary btn-sm min-w-[90px]">
          {saving ? "Saving" : submitLabel}
        </button>
      </div>
    </form>
  );
}

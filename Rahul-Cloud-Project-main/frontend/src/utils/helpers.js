export const initials = (name = "") =>
  name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
export const fmtDate = (iso) =>
  new Date(iso).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
const PALETTE = [
  "bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-400",
  "bg-sky-100    dark:bg-sky-900/30    text-sky-700    dark:text-sky-400",
  "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400",
  "bg-amber-100  dark:bg-amber-900/30  text-amber-700  dark:text-amber-400",
  "bg-rose-100   dark:bg-rose-900/30   text-rose-700   dark:text-rose-400",
  "bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400",
  "bg-teal-100   dark:bg-teal-900/30   text-teal-700   dark:text-teal-400",
];
export const avatarColor = (name = "") => {
  const n = [...name].reduce((a, c) => a + c.charCodeAt(0), 0);
  return PALETTE[n % PALETTE.length];
};
export const validateUser = ({ name, email, address, company }) => {
  const errors = {};
  if (!name || name.trim().length < 2) errors.name = "Must be at least 2 characters";
  if (!email || !/^\S+@\S+\.\S+$/.test(email)) errors.email = "Enter a valid email address";
  if (!company || !company.trim()) errors.company = "Company name is required";
  if (!address || address.trim().length < 5) errors.address = "Must be at least 5 characters";
  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
};
export const fmtCurrency = (n) =>
  new Intl.NumberFormat("en-IE", {
    style: "currency",
    currency: "EUR",
  }).format(n ?? 0);
export const validateTransaction = ({ type, category, amount, date }) => {
  const errors = {};
  if (type !== "income" && type !== "expense") errors.type = "Choose income or expense";
  if (!category || category.trim().length < 2) errors.category = "Must be at least 2 characters";
  if (
    amount === "" ||
    amount === undefined ||
    amount === null ||
    Number.isNaN(Number(amount)) ||
    Number(amount) <= 0
  )
    errors.amount = "Must be a positive number";
  if (!date || Number.isNaN(Date.parse(date))) errors.date = "Enter a valid date";
  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
};

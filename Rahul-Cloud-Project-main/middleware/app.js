import crypto from "node:crypto";
export const toApi = (row) => ({
  _id: row.id,
  name: row.name,
  email: row.email,
  company: row.company,
  address: row.address,
  phone: row.phone || "",
  createdAt: row.createdAt,
});
export const validate = ({ name, email, address, company }) => {
  const errors = {};
  if (!name || name.trim().length < 2) errors.name = "Must be at least 2 characters";
  if (!email || !/^\S+@\S+\.\S+$/.test(email)) errors.email = "Enter a valid email address";
  if (!company || !company.trim()) errors.company = "Company name is required";
  if (!address || address.trim().length < 5) errors.address = "Must be at least 5 characters";
  return errors;
};
const toApiTransaction = (row) => ({
  _id: row.id,
  type: row.type,
  category: row.category,
  description: row.description || "",
  amount: row.amount,
  date: row.date,
  createdAt: row.createdAt,
});
export const validateTransaction = ({ type, category, amount, date }) => {
  const errors = {};
  if (type !== "income" && type !== "expense") errors.type = "Type must be income or expense";
  if (!category || category.trim().length < 2) errors.category = "Must be at least 2 characters";
  if (
    amount === undefined ||
    amount === null ||
    Number.isNaN(Number(amount)) ||
    Number(amount) <= 0
  )
    errors.amount = "Must be a positive number";
  if (!date || Number.isNaN(Date.parse(date))) errors.date = "Enter a valid date";
  return errors;
};
export function createApp({ express, cors, db, generateUserPdf }) {
  const app = express();
  app.use(cors());
  app.use(express.json());
  const router = express.Router();
  router.get("/users", async (req, res) => {
    const { rows } = await db('SELECT * FROM users ORDER BY "createdAt" DESC');
    res.json(rows.map(toApi));
  });
  router.get("/search", async (req, res) => {
    const q = `%${String(req.query.q || "").toLowerCase()}%`;
    const { rows } = await db(
      'SELECT * FROM users WHERE lower(name) LIKE ? OR lower(email) LIKE ? OR lower(address) LIKE ? ORDER BY "createdAt" DESC',
      [q, q, q]
    );
    res.json(rows.map(toApi));
  });
  router.get("/stats", async (req, res) => {
    const { rows } = await db("SELECT * FROM users");
    const total = rows.length;
    const now = Date.now();
    const WEEK = 7 * 86400000;
    const recentUsers = rows.filter((r) => now - new Date(r.createdAt).getTime() < WEEK).length;
    const prevWeekUsers = rows.filter((r) => {
      const age = now - new Date(r.createdAt).getTime();
      return age >= WEEK && age < 2 * WEEK;
    }).length;
    const growthRate =
      prevWeekUsers === 0
        ? recentUsers > 0
          ? 100
          : 0
        : Math.round(((recentUsers - prevWeekUsers) / prevWeekUsers) * 100);
    const domainBreakdown = {};
    for (const r of rows) {
      const domain = r.email.split("@")[1]?.toLowerCase();
      if (domain) domainBreakdown[domain] = (domainBreakdown[domain] || 0) + 1;
    }
    const mostCommonDomain =
      Object.entries(domainBreakdown).sort((a, b) => b[1] - a[1])[0]?.[0] ?? null;
    res.json({
      total,
      recentUsers,
      growthRate,
      mostCommonDomain,
      domainBreakdown,
    });
  });
  router.get("/user/:id", async (req, res) => {
    const { rows } = await db("SELECT * FROM users WHERE id = ?", [req.params.id]);
    const row = rows[0];
    if (!row)
      return res.status(404).json({
        message: "User not found",
      });
    res.json(toApi(row));
  });
  router.get("/user/:id/pdf", async (req, res, next) => {
    try {
      const { rows } = await db("SELECT * FROM users WHERE id = ?", [req.params.id]);
      const row = rows[0];
      if (!row)
        return res.status(404).json({
          message: "User not found",
        });
      const pdfBuffer = await generateUserPdf(toApi(row));
      const filename = `${row.name.replace(/\s+/g, "_")}-profile.pdf`;
      res.setHeader("Content-Type", "application/pdf");
      res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
      res.send(pdfBuffer);
    } catch (err) {
      next(err);
    }
  });
  router.post("/user", async (req, res) => {
    const { name, email, address, phone, company } = req.body || {};
    const errors = validate({
      name,
      email,
      address,
      company,
    });
    if (Object.keys(errors).length) {
      return res.status(400).json({
        message: Object.values(errors)[0],
        errors,
      });
    }
    const { rows: existingRows } = await db("SELECT id FROM users WHERE email = ?", [email]);
    if (existingRows[0])
      return res.status(409).json({
        message: "Email already in use",
      });
    const id = crypto.randomUUID();
    const createdAt = new Date().toISOString();
    await db(
      'INSERT INTO users (id, name, email, company, address, phone, "createdAt") VALUES (?, ?, ?, ?, ?, ?, ?)',
      [
        id,
        name.trim(),
        email.trim(),
        company.trim(),
        address.trim(),
        phone?.trim() || null,
        createdAt,
      ]
    );
    res.status(201).json(
      toApi({
        id,
        name,
        email,
        company,
        address,
        phone,
        createdAt,
      })
    );
  });
  router.put("/update/user/:id", async (req, res) => {
    const { rows } = await db("SELECT * FROM users WHERE id = ?", [req.params.id]);
    const row = rows[0];
    if (!row)
      return res.status(404).json({
        message: "User not found",
      });
    const { name, email, address, phone, company } = req.body || {};
    const errors = validate({
      name,
      email,
      address,
      company,
    });
    if (Object.keys(errors).length) {
      return res.status(400).json({
        message: Object.values(errors)[0],
        errors,
      });
    }
    const { rows: dupeRows } = await db("SELECT id FROM users WHERE email = ? AND id != ?", [
      email,
      req.params.id,
    ]);
    if (dupeRows[0])
      return res.status(409).json({
        message: "Email already in use",
      });
    await db(
      "UPDATE users SET name = ?, email = ?, company = ?, address = ?, phone = ? WHERE id = ?",
      [
        name.trim(),
        email.trim(),
        company.trim(),
        address.trim(),
        phone?.trim() || null,
        req.params.id,
      ]
    );
    res.json(
      toApi({
        ...row,
        name,
        email,
        company,
        address,
        phone,
      })
    );
  });
  router.delete("/delete/user/:id", async (req, res) => {
    const result = await db("DELETE FROM users WHERE id = ?", [req.params.id]);
    if (result.rowCount === 0)
      return res.status(404).json({
        message: "User not found",
      });
    res.json({
      message: "Deleted",
    });
  });
  router.get("/transactions", async (req, res) => {
    const { rows } = await db("SELECT * FROM transactions ORDER BY date DESC");
    res.json(rows.map(toApiTransaction));
  });
  router.get("/pnl", async (req, res) => {
    const { rows } = await db("SELECT * FROM transactions");
    const totalIncome = rows
      .filter((r) => r.type === "income")
      .reduce((sum, r) => sum + r.amount, 0);
    const totalExpense = rows
      .filter((r) => r.type === "expense")
      .reduce((sum, r) => sum + r.amount, 0);
    const netProfit = totalIncome - totalExpense;
    const byCategory = {};
    const byMonth = {};
    for (const r of rows) {
      const month = r.date.slice(0, 7);
      (byCategory[r.category] ??= {
        income: 0,
        expense: 0,
      })[r.type] += r.amount;
      (byMonth[month] ??= {
        income: 0,
        expense: 0,
      })[r.type] += r.amount;
    }
    res.json({
      totalIncome,
      totalExpense,
      netProfit,
      byCategory,
      byMonth: Object.entries(byMonth)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([month, v]) => ({
          month,
          ...v,
          net: v.income - v.expense,
        })),
    });
  });
  router.get("/transaction/:id", async (req, res) => {
    const { rows } = await db("SELECT * FROM transactions WHERE id = ?", [req.params.id]);
    const row = rows[0];
    if (!row)
      return res.status(404).json({
        message: "Transaction not found",
      });
    res.json(toApiTransaction(row));
  });
  router.post("/transaction", async (req, res) => {
    const { type, category, description, amount, date } = req.body || {};
    const errors = validateTransaction({
      type,
      category,
      amount,
      date,
    });
    if (Object.keys(errors).length) {
      return res.status(400).json({
        message: Object.values(errors)[0],
        errors,
      });
    }
    const id = crypto.randomUUID();
    const createdAt = new Date().toISOString();
    await db(
      'INSERT INTO transactions (id, type, category, description, amount, date, "createdAt") VALUES (?, ?, ?, ?, ?, ?, ?)',
      [id, type, category.trim(), description?.trim() || null, Number(amount), date, createdAt]
    );
    res.status(201).json(
      toApiTransaction({
        id,
        type,
        category,
        description,
        amount: Number(amount),
        date,
        createdAt,
      })
    );
  });
  router.put("/update/transaction/:id", async (req, res) => {
    const { rows } = await db("SELECT * FROM transactions WHERE id = ?", [req.params.id]);
    const row = rows[0];
    if (!row)
      return res.status(404).json({
        message: "Transaction not found",
      });
    const { type, category, description, amount, date } = req.body || {};
    const errors = validateTransaction({
      type,
      category,
      amount,
      date,
    });
    if (Object.keys(errors).length) {
      return res.status(400).json({
        message: Object.values(errors)[0],
        errors,
      });
    }
    await db(
      "UPDATE transactions SET type = ?, category = ?, description = ?, amount = ?, date = ? WHERE id = ?",
      [type, category.trim(), description?.trim() || null, Number(amount), date, req.params.id]
    );
    res.json(
      toApiTransaction({
        ...row,
        type,
        category,
        description,
        amount: Number(amount),
        date,
      })
    );
  });
  router.delete("/delete/transaction/:id", async (req, res) => {
    const result = await db("DELETE FROM transactions WHERE id = ?", [req.params.id]);
    if (result.rowCount === 0)
      return res.status(404).json({
        message: "Transaction not found",
      });
    res.json({
      message: "Deleted",
    });
  });
  app.use("/api", router);
  app.get("/", (req, res) =>
    res.json({
      status: "ok",
      service: "userhub-server",
    })
  );
  return app;
}

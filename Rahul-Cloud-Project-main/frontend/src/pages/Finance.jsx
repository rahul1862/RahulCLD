import { useState, useMemo } from "react";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { useTransactions, usePnl } from "../hooks/useTransactions";
import { transactionService } from "../services/api";
import { useToast } from "../context/ToastContext";
import { Modal, ConfirmModal } from "../components/ui/Modal";
import { SkeletonRow, SkeletonCard } from "../components/ui/Skeleton";
import { EmptyState, ErrorState } from "../components/ui/States";
import TransactionForm from "../components/finance/TransactionForm";
import { fmtDate, fmtCurrency } from "../utils/helpers";
const FILTERS = ["all", "income", "expense"];
function Metric({ label, value, loading, tone }) {
  if (loading) return <SkeletonCard />;
  const toneClass =
    tone === "positive"
      ? "text-emerald-600 dark:text-emerald-400"
      : tone === "negative"
        ? "text-red-600 dark:text-red-400"
        : "text-ink-900 dark:text-ink-100";
  return (
    <div className="p-5">
      <p className="text-[11px] font-medium text-ink-400 dark:text-ink-600 uppercase tracking-wide mb-1">
        {label}
      </p>
      <p className={`text-2xl font-semibold tabular-nums leading-none ${toneClass}`}>{value}</p>
    </div>
  );
}
export default function Finance() {
  const { transactions, loading, error, reload } = useTransactions();
  const { pnl, loading: pnlLoading, reload: reloadPnl } = usePnl();
  const toast = useToast();
  const [filter, setFilter] = useState("all");
  const [editing, setEditing] = useState(null);
  const [adding, setAdding] = useState(false);
  const [del, setDel] = useState(null);
  const filtered = useMemo(() => {
    if (filter === "all") return transactions;
    return transactions.filter((t) => t.type === filter);
  }, [transactions, filter]);
  const refreshAll = () => {
    reload();
    reloadPnl();
  };
  const handleCreate = async (form) => {
    await transactionService.create(form);
    toast("Transaction added", "success");
    setAdding(false);
    refreshAll();
  };
  const handleUpdate = async (form) => {
    await transactionService.update(editing._id, form);
    toast("Changes saved", "success");
    setEditing(null);
    refreshAll();
  };
  const handleDelete = async () => {
    try {
      await transactionService.remove(del._id);
      toast("Transaction removed", "success");
      refreshAll();
    } catch (e) {
      toast(e.message, "error");
    } finally {
      setDel(null);
    }
  };
  return (
    <div className="page space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-3 bg-white dark:bg-ink-900 border border-ink-200 dark:border-ink-800 rounded-xl divide-y sm:divide-y-0 sm:divide-x divide-ink-100 dark:divide-ink-800 overflow-hidden">
        <Metric
          label="Income"
          value={fmtCurrency(pnl?.totalIncome)}
          loading={pnlLoading}
          tone="positive"
        />
        <Metric
          label="Expenses"
          value={fmtCurrency(pnl?.totalExpense)}
          loading={pnlLoading}
          tone="negative"
        />
        <Metric label="Net profit" value={fmtCurrency(pnl?.netProfit)} loading={pnlLoading} />
      </div>

      <div className="flex items-center gap-3 justify-between">
        <div className="flex items-center gap-1 bg-ink-50 dark:bg-ink-900 border border-ink-200 dark:border-ink-800 rounded-lg p-0.5">
          {FILTERS.map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-md text-[12px] font-medium capitalize transition-colors
                ${filter === f ? "bg-white dark:bg-ink-800 text-ink-900 dark:text-ink-100 shadow-sm" : "text-ink-400 hover:text-ink-700 dark:hover:text-ink-300"}`}
            >
              {f}
            </button>
          ))}
        </div>
        <button onClick={() => setAdding(true)} className="btn-primary flex-shrink-0">
          <Plus size={14} />
          <span className="hidden sm:inline">Add transaction</span>
          <span className="sm:hidden">Add</span>
        </button>
      </div>

      <div className="bg-white dark:bg-ink-900 border border-ink-200 dark:border-ink-800 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="data-table" aria-label="Transactions">
            <thead>
              <tr>
                <th>Category</th>
                <th className="hidden sm:table-cell">Description</th>
                <th className="hidden md:table-cell">Date</th>
                <th className="text-right">Amount</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array(6)
                  .fill(0)
                  .map((_, i) => <SkeletonRow key={i} cols={5} />)
              ) : error ? (
                <tr>
                  <td colSpan={5}>
                    <ErrorState message={error} onRetry={reload} />
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={5}>
                    <EmptyState
                      title="No transactions yet"
                      message="Record your first income or expense to get started."
                      action={
                        <button onClick={() => setAdding(true)} className="btn-primary btn-sm">
                          Add transaction
                        </button>
                      }
                    />
                  </td>
                </tr>
              ) : (
                filtered.map((t) => (
                  <tr key={t._id}>
                    <td>
                      <span className="text-[13px] font-medium text-ink-800 dark:text-ink-200">
                        {t.category}
                      </span>
                    </td>
                    <td className="hidden sm:table-cell text-[12px] text-ink-500 dark:text-ink-500 truncate max-w-[220px]">
                      {t.description || "—"}
                    </td>
                    <td className="hidden md:table-cell text-[11px] text-ink-400 font-mono whitespace-nowrap">
                      {fmtDate(t.date)}
                    </td>
                    <td
                      className={`text-right text-[13px] font-medium tabular-nums whitespace-nowrap ${t.type === "income" ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400"}`}
                    >
                      {t.type === "income" ? "+" : "-"}
                      {fmtCurrency(t.amount)}
                    </td>
                    <td>
                      <div className="flex items-center justify-end gap-0.5">
                        <button
                          onClick={() => setEditing(t)}
                          className="btn-ghost btn-icon"
                          title="Edit"
                          aria-label={`Edit ${t.category}`}
                        >
                          <Pencil size={14} />
                        </button>
                        <button
                          onClick={() => setDel(t)}
                          className="btn-ghost btn-icon text-ink-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"
                          title="Remove"
                          aria-label={`Remove ${t.category}`}
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {adding && (
        <Modal title="Add transaction" onClose={() => setAdding(false)}>
          <TransactionForm
            submitLabel="Add transaction"
            onSubmit={handleCreate}
            onCancel={() => setAdding(false)}
          />
        </Modal>
      )}

      {editing && (
        <Modal title="Edit transaction" onClose={() => setEditing(null)}>
          <TransactionForm
            initial={editing}
            submitLabel="Save changes"
            onSubmit={handleUpdate}
            onCancel={() => setEditing(null)}
          />
        </Modal>
      )}

      {del && (
        <ConfirmModal
          title="Remove transaction"
          message={`This ${del.type} of ${fmtCurrency(del.amount)} will be permanently deleted. This can't be undone.`}
          onConfirm={handleDelete}
          onClose={() => setDel(null)}
        />
      )}
    </div>
  );
}

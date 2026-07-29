import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import {
  UserPlus, Search, ChevronUp, ChevronDown,
  ChevronsUpDown, Eye, Pencil, Trash2, ChevronLeft, ChevronRight,
} from "lucide-react";
import { useUsers } from "../hooks/useUsers";
import { userService } from "../services/api";
import { useToast } from "../context/ToastContext";
import { ConfirmModal } from "../components/ui/Modal";
import { SkeletonRow } from "../components/ui/Skeleton";
import { EmptyState, SearchEmpty, ErrorState } from "../components/ui/States";
import Avatar from "../components/ui/Avatar";
import { fmtDate } from "../utils/helpers";

const PAGE = 10;

function SortBtn({ active, dir, onClick, children }) {
  const Icon = active ? (dir === "asc" ? ChevronUp : ChevronDown) : ChevronsUpDown;
  return (
    <button
      onClick={onClick}
      className="inline-flex items-center gap-1 group"
      aria-label={`Sort by ${children}`}
    >
      {children}
      <Icon
        size={11}
        className={active ? "text-ink-700 dark:text-ink-300" : "text-ink-300 dark:text-ink-700 group-hover:text-ink-500 transition-colors"}
      />
    </button>
  );
}

export default function UsersPage() {
  const { users, loading, error, reload } = useUsers();
  const toast = useToast();

  const [search, setSearch] = useState("");
  const [sort,   setSort]   = useState({ col: "createdAt", dir: "desc" });
  const [page,   setPage]   = useState(1);
  const [del,    setDel]    = useState(null);

  const toggleSort = (col) => {
    setSort((s) => ({ col, dir: s.col === col && s.dir === "asc" ? "desc" : "asc" }));
    setPage(1);
  };

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return !q ? users : users.filter((u) =>
      u.name?.toLowerCase().includes(q) ||
      u.email?.toLowerCase().includes(q) ||
      u.address?.toLowerCase().includes(q)
    );
  }, [users, search]);

  const sorted = useMemo(() =>
    [...filtered].sort((a, b) => {
      const av = (a[sort.col] ?? "").toString();
      const bv = (b[sort.col] ?? "").toString();
      return sort.dir === "asc" ? av.localeCompare(bv) : bv.localeCompare(av);
    }),
  [filtered, sort]);

  const totalPages = Math.max(1, Math.ceil(sorted.length / PAGE));
  const paged      = sorted.slice((page-1)*PAGE, page*PAGE);

  const handleDelete = async () => {
    try {
      await userService.remove(del._id);
      toast("Person removed", "success");
      reload();
    } catch (e) {
      toast(e.message, "error");
    } finally {
      setDel(null);
    }
  };

  return (
    <div className="page space-y-4">

      <div className="flex items-center gap-3 justify-between">
        <div className="relative flex-1 max-w-xs">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-400 pointer-events-none" />
          <input
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search people…"
            aria-label="Search people"
            className="field pl-8 text-[13px]"
          />
        </div>
        <Link to="/add" className="btn-primary flex-shrink-0">
          <UserPlus size={14} />
          <span className="hidden sm:inline">Add person</span>
          <span className="sm:hidden">Add</span>
        </Link>
      </div>

      {!loading && !error && (
        <p className="text-[11px] text-ink-400 dark:text-ink-600">
          {search
            ? `${filtered.length} of ${users.length} people`
            : `${users.length} ${users.length === 1 ? "person" : "people"}`
          }
        </p>
      )}

      <div className="bg-white dark:bg-ink-900 border border-ink-200 dark:border-ink-800 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="data-table" aria-label="People">
            <thead>
              <tr>
                <th>
                  <SortBtn col="name" active={sort.col==="name"} dir={sort.dir} onClick={() => toggleSort("name")}>Name</SortBtn>
                </th>
                <th className="hidden sm:table-cell">
                  <SortBtn col="address" active={sort.col==="address"} dir={sort.dir} onClick={() => toggleSort("address")}>Address</SortBtn>
                </th>
                <th className="hidden md:table-cell">
                  <SortBtn col="createdAt" active={sort.col==="createdAt"} dir={sort.dir} onClick={() => toggleSort("createdAt")}>Joined</SortBtn>
                </th>
                <th className="hidden lg:table-cell">
                  <SortBtn col="company" active={sort.col==="company"} dir={sort.dir} onClick={() => toggleSort("company")}>Company</SortBtn>
                </th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading
                ? Array(PAGE).fill(0).map((_,i) => <SkeletonRow key={i} cols={5} />)
                : error
                ? <tr><td colSpan={5}><ErrorState message={error} onRetry={reload} /></td></tr>
                : paged.length === 0
                ? <tr><td colSpan={5}>
                    {search
                      ? <SearchEmpty query={search} />
                      : <EmptyState title="No people yet" message="Add your first person to get started." action={<Link to="/add" className="btn-primary btn-sm">Add person</Link>} />
                    }
                  </td></tr>
                : paged.map((u) => (
                  <tr key={u._id}>
                    <td>
                      <div className="flex items-center gap-2.5">
                        <Avatar name={u.name} size="sm" />
                        <div className="min-w-0">
                          <p className="text-[13px] font-medium text-ink-800 dark:text-ink-200 truncate">{u.name}</p>
                          <p className="text-[11px] text-ink-400 dark:text-ink-600 truncate">{u.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="hidden sm:table-cell text-[12px] text-ink-500 dark:text-ink-500">{u.address}</td>
                    <td className="hidden md:table-cell text-[11px] text-ink-400 font-mono whitespace-nowrap">{fmtDate(u.createdAt)}</td>
                    <td className="hidden lg:table-cell text-[12px] text-ink-500 dark:text-ink-500 truncate max-w-[160px]">{u.company}</td>
                    <td>
                      <div className="flex items-center justify-end gap-0.5">
                        <Link to={`/user/${u._id}`} className="btn-ghost btn-icon" title="View profile" aria-label={`View ${u.name}`}><Eye size={14} /></Link>
                        <Link to={`/edit/${u._id}`} className="btn-ghost btn-icon" title="Edit" aria-label={`Edit ${u.name}`}><Pencil size={14} /></Link>
                        <button
                          onClick={() => setDel(u)}
                          className="btn-ghost btn-icon text-ink-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"
                          title="Remove"
                          aria-label={`Remove ${u.name}`}
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              }
            </tbody>
          </table>
        </div>

        {!loading && !error && sorted.length > PAGE && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-ink-100 dark:border-ink-800">
            <span className="text-[11px] text-ink-400 tabular-nums">
              {(page-1)*PAGE+1}–{Math.min(page*PAGE, sorted.length)} / {sorted.length}
            </span>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setPage(p => Math.max(1,p-1))}
                disabled={page===1}
                className="btn-ghost btn-icon disabled:opacity-30"
                aria-label="Previous page"
              >
                <ChevronLeft size={14} />
              </button>
              {Array.from({length: totalPages}, (_,i) => i+1)
                .filter(p => p===1 || p===totalPages || Math.abs(p-page)<=1)
                .map((p, i, arr) => (
                  <span key={p} className="flex items-center">
                    {i > 0 && arr[i-1] !== p-1 && (
                      <span className="text-ink-300 dark:text-ink-700 text-[11px] px-1">·</span>
                    )}
                    <button
                      onClick={() => setPage(p)}
                      className={`w-7 h-7 rounded text-[12px] font-medium transition-colors
                        ${p === page
                          ? "bg-ink-900 dark:bg-ink-100 text-white dark:text-ink-900"
                          : "text-ink-500 hover:bg-ink-100 dark:hover:bg-ink-800"
                        }`}
                    >
                      {p}
                    </button>
                  </span>
                ))
              }
              <button
                onClick={() => setPage(p => Math.min(totalPages,p+1))}
                disabled={page===totalPages}
                className="btn-ghost btn-icon disabled:opacity-30"
                aria-label="Next page"
              >
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        )}
      </div>

      {del && (
        <ConfirmModal
          title="Remove person"
          message={`${del.name} will be permanently deleted. This can't be undone.`}
          onConfirm={handleDelete}
          onClose={() => setDel(null)}
        />
      )}
    </div>
  );
}

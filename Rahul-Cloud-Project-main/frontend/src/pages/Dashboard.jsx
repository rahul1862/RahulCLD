import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { useUsers, useStats } from "../hooks/useUsers";
import { userService } from "../services/api";
import Avatar from "../components/ui/Avatar";
import { SkeletonRow } from "../components/ui/Skeleton";
import { ErrorState, EmptyState, SearchEmpty } from "../components/ui/States";
import { fmtDate } from "../utils/helpers";
function Metric({ label, value, sub, loading }) {
  if (loading) {
    return (
      <div className="py-1 space-y-1.5">
        <div className="skel h-2.5 w-16 rounded" />
        <div className="skel h-6 w-10 rounded" />
      </div>
    );
  }
  return (
    <div className="py-1">
      <p className="text-[11px] font-medium text-ink-400 dark:text-ink-600 uppercase tracking-wide mb-1">
        {label}
      </p>
      <p className="text-2xl font-semibold text-ink-900 dark:text-ink-100 tabular-nums leading-none">
        {value ?? "—"}
      </p>
      {sub && (
        <p className="text-[11px] text-ink-400 dark:text-ink-600 mt-1 flex items-center gap-1">
          {sub}
        </p>
      )}
    </div>
  );
}
function DomainBar({ domain, count }) {
  return (
    <div className="group">
      <div className="flex items-center justify-between mb-1">
        <span className="text-[12px] font-mono text-ink-600 dark:text-ink-400">{domain}</span>
        <span className="text-[11px] text-ink-400 dark:text-ink-600 tabular-nums">{count}</span>
      </div>
    </div>
  );
}
export default function Dashboard() {
  const { users, loading: uLoad, error: uErr, reload } = useUsers();
  const { stats, loading: sLoad } = useStats();
  const [search, setSearch] = useState("");
  const [results, setResults] = useState(null);
  const [searching, setSearching] = useState(false);
  useEffect(() => {
    if (!search.trim()) {
      setResults(null);
      return;
    }
    const t = setTimeout(async () => {
      setSearching(true);
      try {
        setResults(await userService.search(search));
      } catch {
        setResults([]);
      } finally {
        setSearching(false);
      }
    }, 350);
    return () => clearTimeout(t);
  }, [search]);
  const displayed = (results ?? users).slice(0, 8);
  const domains = stats
    ? Object.entries(stats.domainBreakdown ?? {})
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
    : [];
  return (
    <div className="page space-y-8">
      <section aria-label="Key metrics">
        <div className="flex items-start gap-8 sm:gap-12 overflow-x-auto pb-2 no-scrollbar">
          <Metric
            label="Total people"
            value={stats?.total}
            sub={`${stats?.recentUsers ?? 0} joined this week`}
            trend={stats?.growthRate}
            loading={sLoad}
          />
          <div className="w-px self-stretch bg-ink-100 dark:bg-ink-900 flex-shrink-0" />
          <Metric
            label="Growth"
            value={
              stats?.growthRate !== undefined
                ? `${stats.growthRate > 0 ? "+" : ""}${stats.growthRate}%`
                : null
            }
            sub="week over week"
            trend={stats?.growthRate}
            loading={sLoad}
          />
          <div className="w-px self-stretch bg-ink-100 dark:bg-ink-900 flex-shrink-0" />
          <Metric
            label="Top domain"
            value={stats?.mostCommonDomain ?? "—"}
            sub="most common provider"
            loading={sLoad}
          />
          <div className="w-px self-stretch bg-ink-100 dark:bg-ink-900 flex-shrink-0 hidden sm:block" />
          <Metric
            label="Providers"
            value={stats ? Object.keys(stats.domainBreakdown ?? {}).length : null}
            sub="unique email domains"
            loading={sLoad}
          />
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_220px] gap-6 items-start">
        <section
          className="
            bg-white dark:bg-ink-900
            border border-ink-200 dark:border-ink-800
            rounded-xl overflow-hidden
          "
          aria-label="Recent people"
        >
          <div className="flex items-center justify-between px-5 py-3.5 border-b border-ink-100 dark:border-ink-800/80">
            <span className="text-[12px] font-semibold text-ink-600 dark:text-ink-400 uppercase tracking-wide">
              {results ? `${results.length} result${results.length !== 1 ? "s" : ""}` : "Recent"}
            </span>
            <div className="flex items-center gap-2">
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search…"
                aria-label="Search people"
                className="field text-xs py-1.5 w-36 sm:w-48"
              />
              <Link
                to="/users"
                className="btn-ghost btn-sm flex items-center gap-1 text-[12px] whitespace-nowrap"
              >
                All <ArrowRight size={12} />
              </Link>
            </div>
          </div>

          <table className="data-table" aria-label="People list">
            <thead>
              <tr>
                <th>Name</th>
                <th className="hidden sm:table-cell">Address</th>
                <th className="hidden md:table-cell">Joined</th>
                <th className="hidden lg:table-cell">Company</th>
                <th className="w-14" />
              </tr>
            </thead>
            <tbody>
              {uLoad || searching ? (
                Array(5)
                  .fill(0)
                  .map((_, i) => <SkeletonRow key={i} cols={5} />)
              ) : uErr ? (
                <tr>
                  <td colSpan={5}>
                    <ErrorState message={uErr} onRetry={reload} />
                  </td>
                </tr>
              ) : displayed.length === 0 ? (
                <tr>
                  <td colSpan={5}>
                    {search ? (
                      <SearchEmpty query={search} />
                    ) : (
                      <EmptyState
                        title="No people yet"
                        message="Add your first person to get started."
                      />
                    )}
                  </td>
                </tr>
              ) : (
                displayed.map((u) => (
                  <tr key={u._id}>
                    <td>
                      <div className="flex items-center gap-2.5">
                        <Avatar name={u.name} size="sm" />
                        <div className="min-w-0">
                          <p className="text-[13px] font-medium text-ink-800 dark:text-ink-200 truncate">
                            {u.name}
                          </p>
                          <p className="text-[11px] text-ink-400 dark:text-ink-600 truncate">
                            {u.email}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="hidden sm:table-cell text-[12px] text-ink-500 dark:text-ink-500">
                      {u.address}
                    </td>
                    <td className="hidden md:table-cell text-[11px] text-ink-400 font-mono">
                      {fmtDate(u.createdAt)}
                    </td>
                    <td className="hidden lg:table-cell text-[12px] text-ink-500 dark:text-ink-500 truncate max-w-[140px]">
                      {u.company}
                    </td>
                    <td>
                      <Link to={`/user/${u._id}`} className="btn-ghost btn-sm text-[11px]">
                        View
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </section>

        {!sLoad && domains.length > 0 && (
          <section
            className="
              bg-white dark:bg-ink-900
              border border-ink-200 dark:border-ink-800
              rounded-xl p-5
            "
            aria-label="Domain breakdown"
          >
            <p className="text-[11px] font-semibold text-ink-400 dark:text-ink-600 uppercase tracking-wide mb-4">
              Domains
            </p>
            <div className="space-y-3.5">
              {domains.map(([domain, count]) => (
                <DomainBar key={domain} domain={domain} count={count} />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}

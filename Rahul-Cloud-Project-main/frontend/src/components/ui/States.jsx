import { Users, AlertCircle, SearchX } from "lucide-react";
export function EmptyState({ title, message, action }) {
  return (
    <div className="flex flex-col items-center justify-center py-14 text-center px-4">
      <div className="w-12 h-12 rounded-xl border border-ink-200 dark:border-ink-800 flex items-center justify-center mb-4 bg-ink-50 dark:bg-ink-900">
        <Users size={20} className="text-ink-300 dark:text-ink-600" strokeWidth={1.5} />
      </div>
      <p className="text-sm font-medium text-ink-700 dark:text-ink-300 mb-1">{title}</p>
      {message && (
        <p className="text-xs text-ink-400 dark:text-ink-600 max-w-[220px] leading-relaxed">
          {message}
        </p>
      )}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
export function SearchEmpty({ query }) {
  return (
    <div className="flex flex-col items-center justify-center py-14 text-center px-4">
      <div className="w-12 h-12 rounded-xl border border-ink-200 dark:border-ink-800 flex items-center justify-center mb-4 bg-ink-50 dark:bg-ink-900">
        <SearchX size={20} className="text-ink-300 dark:text-ink-600" strokeWidth={1.5} />
      </div>
      <p className="text-sm font-medium text-ink-700 dark:text-ink-300 mb-1">No results</p>
      <p className="text-xs text-ink-400 dark:text-ink-600">
        Nothing matched <span className="font-mono">{`"${query}"`}</span>
      </p>
    </div>
  );
}
export function ErrorState({ message, onRetry }) {
  return (
    <div className="flex flex-col items-center justify-center py-14 text-center px-4">
      <div className="w-12 h-12 rounded-xl border border-red-200 dark:border-red-900/60 flex items-center justify-center mb-4 bg-red-50 dark:bg-red-900/20">
        <AlertCircle size={20} className="text-red-400" strokeWidth={1.5} />
      </div>
      <p className="text-sm font-medium text-ink-700 dark:text-ink-300 mb-1">Failed to load</p>
      <p className="text-xs text-ink-400 dark:text-ink-600 max-w-[220px] mb-4">{message}</p>
      {onRetry && (
        <button onClick={onRetry} className="btn-secondary btn-sm">
          Retry
        </button>
      )}
    </div>
  );
}

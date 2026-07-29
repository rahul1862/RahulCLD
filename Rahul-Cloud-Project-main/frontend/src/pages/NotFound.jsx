import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div className="page flex flex-col justify-center min-h-[60vh]">
      <p className="text-[11px] font-mono text-ink-300 dark:text-ink-700 mb-3">404</p>
      <h1 className="text-[22px] font-semibold text-ink-800 dark:text-ink-200 mb-2">Page not found</h1>
      <p className="text-[14px] text-ink-400 dark:text-ink-600 mb-6 max-w-xs">
        {"The page you're looking for doesn't exist or has been moved."}
      </p>
      <div>
        <Link to="/" className="btn-secondary btn-sm">Go to overview</Link>
      </div>
    </div>
  );
}

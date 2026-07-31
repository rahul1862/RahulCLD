import { NavLink } from "react-router-dom";
import { LayoutDashboard, Users, UserPlus, Wallet, X } from "lucide-react";
const NAV = [
  {
    to: "/",
    icon: LayoutDashboard,
    label: "Overview",
  },
  {
    to: "/users",
    icon: Users,
    label: "People",
  },
  {
    to: "/add",
    icon: UserPlus,
    label: "Add person",
  },
  {
    to: "/finance",
    icon: Wallet,
    label: "Finance",
  },
];
export default function Sidebar({ open, onClose }) {
  return (
    <>
      {open && (
        <button
          type="button"
          aria-label="Close menu"
          onClick={onClose}
          className="fixed inset-0 z-30 bg-ink-950/30 dark:bg-ink-950/60 backdrop-blur-[2px] lg:hidden cursor-default"
        />
      )}

      <aside
        className={`
          fixed top-0 left-0 h-full z-40 flex flex-col w-56
          bg-white dark:bg-ink-950
          border-r border-ink-100 dark:border-ink-900
          transition-transform duration-250 ease-out
          ${open ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0
        `}
      >
        <div className="flex items-center justify-between h-14 px-5">
          <div className="flex items-center gap-2 no-tap-highlight">
            <div className="w-5 h-5 rounded-[5px] bg-ink-900 dark:bg-white flex items-center justify-center flex-shrink-0">
              <div className="w-2 h-2 rounded-sm bg-white dark:bg-ink-900" />
            </div>
            <span className="text-sm font-semibold text-ink-900 dark:text-ink-100 tracking-tight">
              UserHub
            </span>
          </div>
          <button
            onClick={onClose}
            className="btn-ghost btn-icon lg:hidden text-ink-400"
            aria-label="Close menu"
          >
            <X size={15} />
          </button>
        </div>

        <nav className="flex-1 px-2 py-1 space-y-0.5" role="navigation">
          {NAV.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              end={to === "/"}
              onClick={onClose}
              className={({
                isActive,
              }) => `flex items-center gap-2.5 px-3 py-2 rounded-md text-[13px] font-medium
                 transition-colors duration-100 no-tap-highlight
                 ${isActive ? "bg-ink-100 dark:bg-ink-800 text-ink-900 dark:text-ink-100" : "text-ink-500 dark:text-ink-500 hover:text-ink-800 dark:hover:text-ink-200 hover:bg-ink-50 dark:hover:bg-ink-900"}`}
            >
              {({ isActive }) => (
                <>
                  <Icon size={15} strokeWidth={isActive ? 2.2 : 1.8} />
                  {label}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="px-5 py-4">
          <span className="text-[11px] text-ink-300 dark:text-ink-700 font-mono">v1.0.0</span>
        </div>
      </aside>
    </>
  );
}

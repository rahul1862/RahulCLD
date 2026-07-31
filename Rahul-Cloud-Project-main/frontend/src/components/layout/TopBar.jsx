import { Menu, Sun, Moon, LogOut } from "lucide-react";
import { useTheme } from "../../context/ThemeContext";
import { useAuth } from "../../context/AuthContext";
import { useLocation } from "react-router-dom";
const TITLES = {
  "/": "Overview",
  "/users": "People",
  "/add": "Add person",
  "/finance": "Finance",
};
export default function TopBar({ onMenuClick }) {
  const { dark, toggle } = useTheme();
  const { user, logout } = useAuth();
  const { pathname } = useLocation();
  const title =
    TITLES[pathname] ||
    (pathname.startsWith("/edit/")
      ? "Edit person"
      : pathname.startsWith("/user/")
        ? "Profile"
        : "UserHub");
  return (
    <header
      className="
        fixed top-0 left-0 right-0 lg:left-56 z-20 h-14
        flex items-center justify-between px-4 sm:px-6
        bg-white/90 dark:bg-ink-950/90 backdrop-blur-md
        border-b border-ink-100 dark:border-ink-900
      "
    >
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="btn-ghost btn-icon lg:hidden"
          aria-label="Open menu"
        >
          <Menu size={16} />
        </button>
        <h1 className="text-[13px] font-semibold text-ink-800 dark:text-ink-200">{title}</h1>
      </div>

      <div className="flex items-center gap-1.5">
        {user?.email && (
          <span className="hidden sm:inline text-[12px] text-ink-500 dark:text-ink-400 max-w-[180px] truncate">
            {user.email}
          </span>
        )}
        <button
          onClick={toggle}
          className="btn-ghost btn-icon"
          aria-label={dark ? "Switch to light mode" : "Switch to dark mode"}
        >
          {dark ? (
            <Sun size={15} className="text-ink-400" />
          ) : (
            <Moon size={15} className="text-ink-400" />
          )}
        </button>
        <button
          onClick={logout}
          className="btn-ghost btn-icon"
          aria-label="Sign out"
          title="Sign out"
        >
          <LogOut size={15} className="text-ink-400" />
        </button>
      </div>
    </header>
  );
}

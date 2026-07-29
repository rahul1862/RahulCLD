import { useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import TopBar  from "./TopBar";

export default function AppLayout() {
  const [open, setOpen] = useState(false);
  return (
    <div className="min-h-dvh">
      <Sidebar open={open} onClose={() => setOpen(false)} />
      <TopBar  onMenuClick={() => setOpen(true)} />
      <main className="lg:ml-56 pt-14 min-h-dvh">
        <div className="px-4 sm:px-7 py-7 max-w-5xl mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
}

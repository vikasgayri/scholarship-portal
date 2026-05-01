import { useEffect, useMemo, useRef, useState } from "react";
import {
  FaBars,
  FaBell,
  FaChevronLeft,
  FaChevronRight,
  FaClipboardList,
  FaFileLines,
  FaFolderOpen,
  FaGraduationCap,
  FaHouse,
  FaIdBadge,
  FaRightFromBracket,
  FaShieldHalved,
} from "react-icons/fa6";
import { Link, NavLink, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getInitials } from "../lib/utils";
import Badge from "./ui/Badge";
import Button from "./ui/Button";

const NAV_STATE_KEY = "scholarhub-sidebar-collapsed";

const routeMeta = {
  "/admin": {
    eyebrow: "Operations overview",
    title: "Admin panel",
  },
  "/applications": {
    eyebrow: "Student workspace",
    title: "Applications",
  },
  "/dashboard": {
    eyebrow: "Student workspace",
    title: "Dashboard",
  },
  "/documents": {
    eyebrow: "Student workspace",
    title: "Documents",
  },
  "/profile": {
    eyebrow: "Student workspace",
    title: "Profile",
  },
  "/scholarships": {
    eyebrow: "Student workspace",
    title: "Scholarships",
  },
};

export default function PortalLayout() {
  const { logout, user } = useAuth();
  const location = useLocation();
  const dropdownRef = useRef(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(() => {
    const savedState = window.localStorage.getItem(NAV_STATE_KEY);
    return savedState === "true";
  });

  const navigationItems = useMemo(() => {
    const items = [
      { to: "/dashboard", label: "Dashboard", icon: FaHouse },
      { to: "/scholarships", label: "Scholarships", icon: FaClipboardList },
      { to: "/applications", label: "Applications", icon: FaFolderOpen },
      { to: "/documents", label: "Documents", icon: FaFileLines },
      { to: "/profile", label: "Profile", icon: FaIdBadge },
    ];

    if (user?.role === "ADMIN") {
      items.push({ to: "/admin", label: "Admin", icon: FaShieldHalved });
    }

    return items;
  }, [user?.role]);

  useEffect(() => {
    window.localStorage.setItem(NAV_STATE_KEY, String(collapsed));
  }, [collapsed]);

  useEffect(() => {
    setMobileOpen(false);
    setDropdownOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    function handlePointerDown(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    }

    document.addEventListener("mousedown", handlePointerDown);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
    };
  }, []);

  const currentRoute = routeMeta[location.pathname] || {
    eyebrow: location.pathname.startsWith("/scholarships/")
      ? "Student workspace"
      : "ScholarHub workspace",
    title: location.pathname.startsWith("/scholarships/") ? "Scholarships" : "Workspace",
  };

  return (
    <div className="min-h-screen bg-transparent text-slate-900">
      {mobileOpen ? (
        <button
          aria-label="Close sidebar overlay"
          className="fixed inset-0 z-40 bg-slate-950/45 lg:hidden"
          onClick={() => setMobileOpen(false)}
          type="button"
        />
      ) : null}

      <div className="flex min-h-screen">
        <aside
          className={[
            "fixed inset-y-0 left-0 z-50 flex w-[292px] flex-col border-r border-white/70 bg-slate-950 px-4 py-5 text-white shadow-strong transition-transform duration-300 lg:sticky lg:top-0 lg:z-30",
            collapsed ? "lg:w-24" : "lg:w-[292px]",
            mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
          ].join(" ")}
        >
          <div className="flex items-center justify-between gap-3 px-2">
            <Link
              className={`flex min-w-0 items-center gap-3 ${collapsed ? "lg:justify-center" : ""}`}
              to="/dashboard"
            >
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-teal-500/20 text-xl text-teal-100 ring-1 ring-teal-300/20">
                <FaGraduationCap />
              </span>
              <div className={collapsed ? "lg:hidden" : ""}>
                <p className="text-sm font-semibold uppercase tracking-[0.24em] text-teal-200">
                  ScholarHub
                </p>
                <p className="text-sm text-slate-400">Scholarship portal</p>
              </div>
            </Link>

            <button
              aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
              className="hidden rounded-2xl p-2 text-slate-300 transition hover:bg-white/10 hover:text-white lg:inline-flex"
              onClick={() => setCollapsed((current) => !current)}
              type="button"
            >
              {collapsed ? <FaChevronRight /> : <FaChevronLeft />}
            </button>
          </div>

          <div className={`mt-8 rounded-[28px] bg-white/6 p-4 ${collapsed ? "lg:hidden" : ""}`}>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-teal-100">
              {user?.role === "ADMIN" ? "Admin mode" : "Student mode"}
            </p>
            <p className="mt-3 text-sm leading-6 text-slate-300">
              Navigate your live applications, uploads, and profile details from a single
              workspace.
            </p>
          </div>

          <nav className="mt-8 flex-1 space-y-2">
            {navigationItems.map((item) => {
              const Icon = item.icon;

              return (
                <NavLink
                  className={({ isActive }) =>
                    [
                      "group flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition",
                      isActive
                        ? "bg-teal-500/16 text-white shadow-[inset_0_0_0_1px_rgba(94,234,212,0.15)]"
                        : "text-slate-300 hover:bg-white/8 hover:text-white",
                      collapsed ? "lg:justify-center lg:px-0" : "",
                    ].join(" ")
                  }
                  key={item.to}
                  to={item.to}
                >
                  <Icon className="shrink-0 text-base" />
                  <span className={collapsed ? "lg:hidden" : ""}>{item.label}</span>
                </NavLink>
              );
            })}
          </nav>

          <div className="mt-6 rounded-[28px] border border-white/10 bg-white/6 p-4">
            <div className={`flex items-center gap-3 ${collapsed ? "lg:justify-center" : ""}`}>
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white/14 text-sm font-semibold">
                {getInitials(user?.name)}
              </span>
              <div className={collapsed ? "lg:hidden" : ""}>
                <p className="truncate text-sm font-semibold">{user?.name}</p>
                <p className="truncate text-xs text-slate-400">{user?.email}</p>
              </div>
            </div>
          </div>
        </aside>

        <div className="flex min-h-screen min-w-0 flex-1 flex-col">
          <header className="sticky top-0 z-20 border-b border-white/70 bg-[rgba(244,247,251,0.82)] backdrop-blur-xl">
            <div className="page-shell flex items-center justify-between gap-4 py-4">
              <div className="flex min-w-0 items-center gap-3">
                <button
                  aria-label="Open navigation"
                  className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-600 shadow-soft lg:hidden"
                  onClick={() => setMobileOpen(true)}
                  type="button"
                >
                  <FaBars />
                </button>
                <div className="min-w-0">
                  <p className="truncate text-xs font-semibold uppercase tracking-[0.2em] text-teal-700">
                    {currentRoute.eyebrow}
                  </p>
                  <h1 className="truncate text-2xl font-semibold text-slate-950">
                    {currentRoute.title}
                  </h1>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button
                  aria-label="Notifications"
                  className="hidden h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-500 shadow-soft transition hover:text-slate-700 sm:inline-flex"
                  type="button"
                >
                  <FaBell />
                </button>

                <div className="relative" ref={dropdownRef}>
                  <button
                    className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-3 py-2 shadow-soft transition hover:border-slate-300"
                    onClick={() => setDropdownOpen((current) => !current)}
                    type="button"
                  >
                    <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-900 text-sm font-semibold text-white">
                      {getInitials(user?.name)}
                    </span>
                    <div className="hidden text-left sm:block">
                      <p className="max-w-[150px] truncate text-sm font-semibold text-slate-900">
                        {user?.name}
                      </p>
                      <p className="text-xs text-slate-500">{user?.role === "ADMIN" ? "Administrator" : "Student"}</p>
                    </div>
                  </button>

                  {dropdownOpen ? (
                    <div className="absolute right-0 mt-3 w-64 rounded-3xl border border-slate-200 bg-white p-3 shadow-strong">
                      <div className="rounded-2xl bg-slate-50 p-4">
                        <p className="text-sm font-semibold text-slate-900">{user?.name}</p>
                        <p className="mt-1 text-sm text-slate-500">{user?.email}</p>
                        <div className="mt-3">
                          <Badge variant={user?.role === "ADMIN" ? "brand" : "info"}>
                            {user?.role === "ADMIN" ? "Admin access" : "Student workspace"}
                          </Badge>
                        </div>
                      </div>

                      <div className="mt-3 space-y-1">
                        <Link
                          className="flex items-center rounded-2xl px-4 py-3 text-sm font-medium text-slate-600 transition hover:bg-slate-50 hover:text-slate-900"
                          to="/profile"
                        >
                          Profile settings
                        </Link>
                        <Button
                          className="w-full justify-start"
                          onClick={logout}
                          variant="ghost"
                        >
                          <FaRightFromBracket />
                          Sign out
                        </Button>
                      </div>
                    </div>
                  ) : null}
                </div>
              </div>
            </div>
          </header>

          <main className="flex-1">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
}

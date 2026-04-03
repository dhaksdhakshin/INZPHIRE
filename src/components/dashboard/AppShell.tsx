import { useEffect, useRef, useState } from "react";
import { Outlet, useLocation } from "react-router-dom";

import { useDashboard } from "../../app/dashboard-context";
import AccountMenu from "./AccountMenu";
import GlobalSearch from "./GlobalSearch";
import Icon from "./Icon";
import LogoMark from "./LogoMark";
import Sidebar from "./Sidebar";
import ToastViewport from "./ToastViewport";

function SignedOutView() {
  const { restoreSession } = useDashboard();

  return (
    <div className="signed-out">
      <div className="signed-out__card">
        <LogoMark className="logo-mark logo-mark--large" />
        <h1>Session ended</h1>
        <p>The dashboard state is still available locally. Sign back in to continue the demo.</p>
        <button type="button" className="button button--primary" onClick={restoreSession}>
          Sign back in
        </button>
      </div>
    </div>
  );
}

export default function AppShell() {
  const {
    user,
    accountMenuOpen,
    setAccountMenuOpen,
    setSearchOpen,
    pushToast,
    signedOut,
  } = useDashboard();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const location = useLocation();
  const menuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setMobileSidebarOpen(false);
    setAccountMenuOpen(false);
  }, [location.pathname, setAccountMenuOpen]);

  useEffect(() => {
    function handleShortcut(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setSearchOpen(true);
      }
    }

    window.addEventListener("keydown", handleShortcut);
    return () => window.removeEventListener("keydown", handleShortcut);
  }, [setSearchOpen]);

  useEffect(() => {
    function handlePointer(event: MouseEvent) {
      if (!menuRef.current) {
        return;
      }

      if (!menuRef.current.contains(event.target as Node)) {
        setAccountMenuOpen(false);
      }
    }

    if (accountMenuOpen) {
      document.addEventListener("mousedown", handlePointer);
    }

    return () => document.removeEventListener("mousedown", handlePointer);
  }, [accountMenuOpen, setAccountMenuOpen]);

  if (signedOut) {
    return <SignedOutView />;
  }

  const hideMainSidebar = location.pathname === "/app/account-settings";

  return (
    <div className={`app-shell${hideMainSidebar ? " app-shell--settings" : ""}`}>
      {!hideMainSidebar ? (
        <Sidebar
          mobileOpen={mobileSidebarOpen}
          onCloseMobile={() => setMobileSidebarOpen(false)}
        />
      ) : null}

      <div className="app-shell__main">
        {!hideMainSidebar ? (
          <div className="app-shell__mobile-bar">
            <button
              type="button"
              className="icon-button icon-button--surface icon-button--mobile-nav"
              onClick={() => setMobileSidebarOpen(true)}
              aria-label="Open navigation"
            >
              <Icon name="menu" size={18} />
            </button>

            <LogoMark className="logo-mark" />
          </div>
        ) : null}

        <div className="app-shell__floating-controls" ref={menuRef}>
          <button
            type="button"
            className="icon-button icon-button--surface"
            onClick={() => pushToast("Notification center is ready for integration", "default")}
            aria-label="Notifications"
          >
            <Icon name="bell" size={18} />
          </button>

          <button
            type="button"
            className="avatar-trigger"
            onClick={() => setAccountMenuOpen(!accountMenuOpen)}
            aria-label="Open account menu"
          >
            <span>{user.initials}</span>
          </button>

          {accountMenuOpen ? <AccountMenu onClose={() => setAccountMenuOpen(false)} /> : null}
        </div>

        <Outlet />
      </div>

      <GlobalSearch />
      <ToastViewport />
    </div>
  );
}

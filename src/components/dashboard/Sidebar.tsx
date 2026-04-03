import { NavLink } from "react-router-dom";

import { useDashboard } from "../../app/dashboard-context";
import Icon from "./Icon";
import LogoMark from "./LogoMark";

interface SidebarProps {
  mobileOpen: boolean;
  onCloseMobile: () => void;
}

export default function Sidebar({ mobileOpen, onCloseMobile }: SidebarProps) {
  const { navItems, user } = useDashboard();
  const primaryItems = navItems.filter((item) => item.group === "primary");
  const teamItems = navItems.filter((item) => item.group === "team");
  const secondaryItems = navItems.filter((item) => item.group === "secondary");

  return (
    <>
      <div
        className={`sidebar-overlay${mobileOpen ? " is-open" : ""}`}
        onClick={onCloseMobile}
      />
      <aside className={`sidebar${mobileOpen ? " is-open" : ""}`}>
        <div className="sidebar__logo">
          <LogoMark className="logo-mark" />
        </div>

        <nav className="sidebar__group">
          {primaryItems.map((item) => (
            <NavLink
              key={item.id}
              to={item.href}
              className={({ isActive }) =>
                `sidebar-link${isActive ? " is-active" : ""}`
              }
              onClick={onCloseMobile}
            >
              <span className="sidebar-link__icon" aria-hidden="true">
                <Icon name={item.icon} size={20} strokeWidth={1.85} />
              </span>
              <span className="sidebar-link__label">{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="sidebar__team">
          <p className="sidebar__label">{user.teamName}</p>
          {teamItems.map((item) => (
            <NavLink
              key={item.id}
              to={item.href}
              className={({ isActive }) =>
                `sidebar-link${isActive ? " is-active" : ""}`
              }
              onClick={onCloseMobile}
            >
              <span className="sidebar-link__icon" aria-hidden="true">
                <Icon name={item.icon} size={20} strokeWidth={1.85} />
              </span>
              <span className="sidebar-link__label">{item.label}</span>
            </NavLink>
          ))}
        </div>

        <nav className="sidebar__group sidebar__group--bottom">
          {secondaryItems.map((item) => (
            <NavLink
              key={item.id}
              to={item.href}
              className={({ isActive }) =>
                `sidebar-link sidebar-link--text-only${isActive ? " is-active" : ""}`
              }
              onClick={onCloseMobile}
            >
              <span className="sidebar-link__label">{item.label}</span>
            </NavLink>
          ))}
        </nav>
      </aside>
    </>
  );
}

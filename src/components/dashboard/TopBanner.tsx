import { useDashboard } from "../../core/dashboard-context";
import Icon from "./Icon";

interface TopBannerProps {
  onOpenSidebar: () => void;
  onUpgradeClick: () => void;
}

export default function TopBanner({ onOpenSidebar, onUpgradeClick }: TopBannerProps) {
  const { user, setSearchOpen } = useDashboard();
  const progress = (user.participantUsage / user.participantLimit) * 100;

  return (
    <header className="top-banner">
      <div className="top-banner__left">
        <button
          type="button"
          className="icon-button icon-button--mobile"
          onClick={onOpenSidebar}
          aria-label="Open navigation"
        >
          <Icon name="menu" />
        </button>

        <span className="top-banner__message">
          Unlock unlimited participants to reach more people.
        </span>

        <button
          type="button"
          className="pill-button pill-button--green"
          onClick={onUpgradeClick}
        >
          <Icon name="sparkles" size={14} />
          Upgrade
        </button>
      </div>

      <div className="top-banner__right">
        <button
          type="button"
          className="top-banner__search-shortcut"
          onClick={() => setSearchOpen(true)}
        >
          <Icon name="search" size={14} />
          Search
          <span className="top-banner__kbd">Ctrl K</span>
        </button>

        <span className="top-banner__stat">
          {user.participantUsage}/{user.participantLimit} Participants this month
        </span>

        <div className="progress-bar" aria-hidden="true">
          <span style={{ width: `${progress}%` }} />
        </div>

        <button type="button" className="icon-button" aria-label="Usage information">
          <Icon name="info" size={14} />
        </button>
      </div>
    </header>
  );
}

import { ArrowLeft, ChevronDown, Settings2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

import { useDashboard } from "../dashboard-context";

export default function AccountSettingsPage() {
  const navigate = useNavigate();
  const { user, pushToast } = useDashboard();
  const [expanded, setExpanded] = useState({
    nameImage: true,
    email: true,
    password: true,
    inApp: false,
    emailNotifications: false,
    appearance: false,
  });

  function toggleSection(key: keyof typeof expanded) {
    setExpanded((current) => ({ ...current, [key]: !current[key] }));
  }

  return (
    <main className="page account-settings">
      <section className="page__content account-settings__layout">
        <aside className="account-settings__sidebar">
          <button
            type="button"
            className="account-settings__back"
            onClick={() => navigate("/app/home")}
          >
            <ArrowLeft size={18} />
            Back to home
          </button>

          <nav className="account-settings__nav" aria-label="Settings">
            <span className="account-settings__nav-item">My profile</span>
            <span className="account-settings__nav-item is-active">
              <span className="account-settings__nav-indicator" />
              <Settings2 size={18} />
              Account settings
            </span>
          </nav>
        </aside>

        <section className="account-settings__content">
          <h1>Account settings</h1>

          <div className="account-settings__list">
            <section className="account-settings__item">
              <button
                type="button"
                className={`account-settings__item-header${expanded.nameImage ? " is-open" : ""}`}
                onClick={() => toggleSection("nameImage")}
                aria-expanded={expanded.nameImage}
              >
                <div className="account-settings__item-title">
                  <span>Name &amp; image</span>
                </div>
                <ChevronDown size={12} strokeWidth={2} />
              </button>
              <div className="account-settings__item-meta">
                <span>Logged in as {user.name}.</span>
                <span className="account-settings__avatar">{user.initials}!</span>
              </div>
              {expanded.nameImage ? (
                <div className="account-settings__item-body">
                  <label className="account-settings__field">
                    <span>Name</span>
                    <div className="account-settings__field-row">
                      <input value={user.name} readOnly />
                      <button type="button" className="account-settings__save">
                        Save name
                      </button>
                    </div>
                  </label>
                  <label className="account-settings__field">
                    <span>Profile image</span>
                    <div className="account-settings__upload">
                      Drag and drop or <button type="button">Click to add an image</button>
                    </div>
                  </label>
                </div>
              ) : null}
            </section>

            <section className="account-settings__item">
              <button
                type="button"
                className={`account-settings__item-header${expanded.email ? " is-open" : ""}`}
                onClick={() => toggleSection("email")}
                aria-expanded={expanded.email}
              >
                <div className="account-settings__item-title">
                  <span>Email</span>
                  <span className="account-settings__badge account-settings__badge--verified">
                    Verified
                  </span>
                </div>
                <ChevronDown size={12} strokeWidth={2} />
              </button>
              <div className="account-settings__item-subtitle">
                Your email is {user.email}
              </div>
              {expanded.email ? (
                <div className="account-settings__info">
                  You are logged in with your Google account. If you want to change email you will
                  first need to create a password for INZPHIRE by resetting it{" "}
                  <button type="button">here</button>.
                </div>
              ) : null}
            </section>

            <section className="account-settings__item">
              <button
                type="button"
                className={`account-settings__item-header${expanded.password ? " is-open" : ""}`}
                onClick={() => toggleSection("password")}
                aria-expanded={expanded.password}
              >
                <div className="account-settings__item-title">
                  <span>Password</span>
                </div>
                <ChevronDown size={12} strokeWidth={2} />
              </button>
              {expanded.password ? (
                <div className="account-settings__info">
                  You haven't created a password yet. You can create a password by resetting it{" "}
                  <button type="button">here</button>.
                </div>
              ) : null}
            </section>

            <section className="account-settings__item">
              <button
                type="button"
                className={`account-settings__item-header${expanded.inApp ? " is-open" : ""}`}
                onClick={() => toggleSection("inApp")}
                aria-expanded={expanded.inApp}
              >
                <div className="account-settings__item-title">
                  <span>In-app notifications</span>
                </div>
                <ChevronDown size={12} strokeWidth={2} />
              </button>
              <div className="account-settings__item-subtitle">
                All in-app notifications are turned on
              </div>
            </section>

            <section className="account-settings__item">
              <button
                type="button"
                className={`account-settings__item-header${expanded.emailNotifications ? " is-open" : ""}`}
                onClick={() => toggleSection("emailNotifications")}
                aria-expanded={expanded.emailNotifications}
              >
                <div className="account-settings__item-title">
                  <span>Email notifications</span>
                </div>
                <ChevronDown size={12} strokeWidth={2} />
              </button>
              <div className="account-settings__item-subtitle">
                All email notifications are turned on
              </div>
            </section>

            <section className="account-settings__item">
              <button
                type="button"
                className={`account-settings__item-header${expanded.appearance ? " is-open" : ""}`}
                onClick={() => toggleSection("appearance")}
                aria-expanded={expanded.appearance}
              >
                <div className="account-settings__item-title">
                  <span>Appearance</span>
                </div>
                <ChevronDown size={12} strokeWidth={2} />
              </button>
              <div className="account-settings__item-subtitle">
                You're currently using light mode.
              </div>
            </section>
          </div>

          <div className="account-settings__divider" />

          <section className="account-settings__action">
            <h2>Log out everywhere else</h2>
            <p>This will log you out from all devices except the current one.</p>
            <button
              type="button"
              className="account-settings__button account-settings__button--soft-danger"
              onClick={() => pushToast("Logged out everywhere else", "default")}
            >
              Log out everywhere else
            </button>
          </section>

          <section className="account-settings__action">
            <h2>Delete account</h2>
            <p>Your account will be permanently deleted. Are you sure?</p>
            <button
              type="button"
              className="account-settings__button account-settings__button--danger"
              onClick={() => pushToast("Delete account flow is ready for integration", "danger")}
            >
              Delete account
            </button>
          </section>
        </section>
      </section>
    </main>
  );
}

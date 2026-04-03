import { useNavigate } from "react-router-dom";

import { useDashboard } from "../../app/dashboard-context";

interface AccountMenuProps {
  onClose: () => void;
}

const accountActions = ["Account settings"];

export default function AccountMenu({ onClose }: AccountMenuProps) {
  const navigate = useNavigate();
  const { user, logOut, pushToast } = useDashboard();

  return (
    <div className="account-menu" role="menu" aria-label="User account menu">
      <div className="account-menu__user">
        <div className="account-menu__avatar">{user.initials}</div>
        <div>
          <p className="account-menu__name">{user.name}</p>
          <p className="account-menu__email">{user.email}</p>
        </div>
      </div>

      <div className="account-menu__upgrade">
        <p>Ready for unlimited participants, exporting results and much more?</p>
        <button
          type="button"
          className="pill-button pill-button--green"
          onClick={() => {
            pushToast("Upgrade flow is ready for integration", "success");
            onClose();
          }}
        >
          Upgrade
        </button>
      </div>

      <div className="account-menu__actions">
        {accountActions.map((label) => (
          <button
            key={label}
            type="button"
            className="account-menu__action"
            onClick={() => {
              if (label === "Account settings") {
                navigate("/app/account-settings");
                onClose();
                return;
              }

              pushToast(`${label} clicked`, "default");
              onClose();
            }}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="account-menu__footer">
        <button
          type="button"
          className="account-menu__action account-menu__action--danger"
          onClick={logOut}
        >
          Log out
        </button>
      </div>
    </div>
  );
}

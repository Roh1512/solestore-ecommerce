import { useCurrentAuthState } from "@/app/useCurrentState";
import LogoLink from "@components/Logo/LogoLink";
import { memo } from "react";
import { NavLink } from "react-router-dom";
import { UserIcon } from "lucide-react";

const HeaderAdmin = () => {
  const { isLoggedIn, accessToken } = useCurrentAuthState();
  return (
    <header className="navbar">
      <div className="flex-1">
        <LogoLink to="/admin" />
      </div>
      {/* Shop Now Button */}
      <div className="flex-none gap-2">
        {isLoggedIn && accessToken && (
          <NavLink
            to="/admin/profile"
            className={({ isActive }) =>
              `btn flex items-center justify-center gap-w text-lg ${
                isActive ? "bg-base-300" : "btn-ghost"
              }`
            }
          >
            <UserIcon />
            <span className="logo-text">Profile</span>
          </NavLink>
        )}
      </div>
    </header>
  );
};

export default memo(HeaderAdmin);

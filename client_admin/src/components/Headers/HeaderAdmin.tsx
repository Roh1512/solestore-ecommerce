import { useCurrentAuthState } from "@/app/useCurrentState";
import LogoLink from "@components/Logo/LogoLink";
import ThemeToggle from "@components/theme/ToggleTheme";
import { memo } from "react";
import { Link } from "react-router-dom";

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
          <Link to="/admin/profile" className="btn">
            profile
          </Link>
        )}
        <ThemeToggle />
      </div>
    </header>
  );
};

export default memo(HeaderAdmin);

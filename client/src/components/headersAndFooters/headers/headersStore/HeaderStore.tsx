import { useCurrentState } from "@/app/useCurrentState";
import LogoLink from "../../../Logo/LogoLink";
import ThemeToggle from "../../../Theme/ToggleTheme";
import { Link } from "react-router-dom";

const HeaderStore = () => {
  const { isLoggedIn, accessToken } = useCurrentState().auth;
  return (
    <header className="navbar">
      <div className="flex-1">
        <LogoLink to="/" />
      </div>
      {/* Shop Now Button */}
      <div className="flex-none gap-2">
        {isLoggedIn && accessToken && (
          <Link to="/profile" className="btn">
            Profile
          </Link>
        )}
        <ThemeToggle />
      </div>
    </header>
  );
};

export default HeaderStore;

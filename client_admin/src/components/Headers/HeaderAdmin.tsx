import { useCurrentState } from "@/app/useCurrentState";
import LogoLink from "@components/Logo/LogoLink";
import ThemeToggle from "@components/theme/ToggleTheme";

const HeaderAdmin = () => {
  const { isLoggedIn, accessToken } = useCurrentState().auth;
  return (
    <header className="navbar">
      <div className="flex-1">
        <LogoLink to="/admin" />
      </div>
      {/* Shop Now Button */}
      <div className="flex-none gap-2">
        {isLoggedIn && accessToken && <button className="btn">profile</button>}
        <ThemeToggle />
      </div>
    </header>
  );
};

export default HeaderAdmin;

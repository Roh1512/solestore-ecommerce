import LogoLink from "../../../Logo/LogoLink";
import ThemeToggle from "../../../Theme/ToggleTheme";

const HeaderStore = () => {
  return (
    <header className="navbar">
      <div className="flex-1">
        <LogoLink to="/" />
      </div>
      {/* Shop Now Button */}
      <div className="flex-none gap-2">
        <ThemeToggle />
      </div>
    </header>
  );
};

export default HeaderStore;

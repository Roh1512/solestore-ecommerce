import { useCurrentAuthState } from "@/app/useCurrentState";
import LogoLink from "../../../Logo/LogoLink";
import { NavLink } from "react-router-dom";
import { memo } from "react";
import { ShoppingCartIcon, UserIcon } from "lucide-react";

const HeaderStore = () => {
  const { isLoggedIn, accessToken } = useCurrentAuthState();
  return (
    <header className="navbar">
      <div className="navbar-start">
        <div className="dropdown">
          <div tabIndex={0} role="button" className="btn btn-ghost btn-circle">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M4 6h16M4 12h16M4 18h7"
              />
            </svg>
          </div>
          <ul
            tabIndex={0}
            className="menu menu-sm dropdown-content bg-base-100 rounded-box z-[1] mt-3 w-52 p-2 shadow"
          >
            <li>
              <a>Homepage</a>
            </li>
            <li>
              <a>Portfolio</a>
            </li>
            <li>
              <a>About</a>
            </li>
          </ul>
        </div>
      </div>
      <div className="navbar-center">
        <LogoLink to="/" />
      </div>
      {/* Shop Now Button */}
      <div className="navbar-end gap-2">
        {isLoggedIn && accessToken && (
          <>
            <NavLink
              to="/cart"
              className={({ isActive }) =>
                `btn p-2 ${isActive ? "bg-base-200" : "btn-ghost"}`
              }
            >
              <ShoppingCartIcon />
            </NavLink>
            <NavLink
              to="/profile"
              className={({ isActive }) =>
                `btn p-2 ${isActive ? "bg-base-200" : "btn-ghost"}`
              }
            >
              <UserIcon className="icon" />{" "}
              <span className="link-text">Profile</span>
            </NavLink>
          </>
        )}
      </div>
    </header>
  );
};

export default memo(HeaderStore);

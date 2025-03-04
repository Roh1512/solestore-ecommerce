import { useState, useEffect, useRef, memo } from "react";
import { NavLink } from "react-router-dom";
import {
  ShoppingCartIcon,
  UserIcon,
  MenuIcon,
  SquareChartGantt,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import LogoLink from "../../../Logo/LogoLink";
import { useCheckAuthState, useCurrentCartState } from "@/app/useCurrentState";

// Define animation variants for the mobile menu
const mobileMenuVariants = {
  hidden: { opacity: 0, scale: 0.95, transition: { duration: 0.2 } },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.2 } },
};

const HeaderStore = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const mobileMenuRef = useRef<HTMLUListElement>(null);

  // Close mobile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        mobileMenuOpen &&
        mobileMenuRef.current &&
        !mobileMenuRef.current.contains(event.target as Node)
      ) {
        setMobileMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [mobileMenuOpen]);

  const { isLoggedIn } = useCheckAuthState();
  const { totalCount } = useCurrentCartState();

  return (
    <header className="navbar bg-base-100 text-base-content shadow-md ">
      {/* Mobile Menu Toggle: visible on small screens */}
      <div className="lg:hidden relative mr-4">
        <button
          onClick={() => setMobileMenuOpen((prev) => !prev)}
          className="btn btn-ghost btn-circle"
        >
          <MenuIcon className="w-6 h-6" />
        </button>
        <AnimatePresence>
          {mobileMenuOpen && isLoggedIn && (
            <motion.ul
              ref={mobileMenuRef}
              initial="hidden"
              animate="visible"
              exit="hidden"
              variants={mobileMenuVariants}
              className="menu menu-compact absolute left-0 top-full mt-2 p-2 shadow-lg bg-base-100 rounded-b-box w-52 z-10 border border-t-transparent border-base-300"
            >
              <li>
                <NavLink
                  to="/orders"
                  onClick={() => setMobileMenuOpen(false)}
                  className={({ isActive }) =>
                    isActive ? "bg-base-200" : "btn-ghost"
                  }
                >
                  Orders
                </NavLink>
              </li>
              <li>
                <NavLink
                  to="/profile"
                  onClick={() => setMobileMenuOpen(false)}
                  className={({ isActive }) =>
                    isActive ? "bg-base-200" : "btn-ghost"
                  }
                >
                  <UserIcon className="w-5 h-5 mr-2" /> Profile
                </NavLink>
              </li>
            </motion.ul>
          )}
        </AnimatePresence>
      </div>

      {/* Navbar Start: Logo */}
      <div className="navbar-start">
        <LogoLink to="/" />
      </div>

      {/* Navbar End: All menu icons on the right */}
      <div className="navbar-end flex items-center">
        {/* Desktop Menu: visible on large screens */}
        <div className="hidden lg:flex gap-4 mr-4">
          <NavLink
            to="/orders"
            className={({ isActive }) =>
              `btn btn-ghost ${isActive ? "bg-base-200" : ""}`
            }
          >
            <SquareChartGantt className="w-5 h-5 mr-2" aria-disabled />
            Orders
          </NavLink>
          <NavLink
            to="/profile"
            className={({ isActive }) =>
              `btn btn-ghost ${isActive ? "bg-base-200" : ""}`
            }
          >
            <UserIcon aria-disabled className="w-5 h-5 mr-2" /> Profile
          </NavLink>
        </div>

        {/* Cart and Theme Toggle */}
        {isLoggedIn && (
          <div className="flex items-center gap-2">
            <NavLink
              to="/cart"
              className={({ isActive }) =>
                `btn btn-ghost relative ${isActive ? "bg-base-200" : ""}`
              }
            >
              <ShoppingCartIcon className="w-6 h-6" />
              {totalCount! > 0 && (
                <span className="badge badge-sm badge-secondary absolute top-0 right-0">
                  {totalCount}
                </span>
              )}
            </NavLink>
          </div>
        )}
      </div>
    </header>
  );
};

export default memo(HeaderStore);

import { Link } from "react-router-dom";
import LogoLink from "../../Logo/LogoLink";
import { useCheckAuthState } from "@/app/useCurrentState";

const FooterStore = () => {
  const { isLoggedIn } = useCheckAuthState();
  return (
    <footer className="footer p-10 bg-base-200 text-base-content">
      <div>
        <LogoLink to="/" />
        <p className="text-sm">
          &copy; 2025 Sole Store
          <br />
          All rights reserved.
        </p>
      </div>
      <div>
        <span className="footer-title">Products</span>
        <Link to={"/shop"} className="link link-hover">
          Casual Shoes
        </Link>
        <Link to={"/shop"} className="link link-hover">
          Formal Shoes
        </Link>
        <Link to={"/shop"} className="link link-hover">
          Boots
        </Link>
        <Link to={"/shop"} className="link link-hover">
          Sneakers
        </Link>
        {!isLoggedIn && (
          <Link to={"/login"} className="btn btn-primary">
            Sign in to view more
          </Link>
        )}
      </div>
    </footer>
  );
};

export default FooterStore;

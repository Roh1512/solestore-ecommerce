import { useLogoutMutation } from "@/features/userAuthApiSlice";
import { useAppDispatch } from "@/app/hooks";
import { clearCredentials } from "@/features/accessTokenApiSlice";
import { toast } from "react-toastify";
import { LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";

const LogoutButton = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [logoutMutation, { isLoading, isSuccess }] = useLogoutMutation();

  const handleLogout = async () => {
    try {
      await logoutMutation().unwrap(); // Execute logout mutation
    } catch (err) {
      console.error("Logout error:", err);
      toast.error("Error logging out");
    }
  };

  useEffect(() => {
    if (isSuccess) {
      // Clear credentials and navigate after successful logout
      dispatch(clearCredentials());
      toast.success("Logged out successfully");
      navigate("/login"); // Redirect to login page
      window.location.reload();
    }
  }, [isSuccess, dispatch, navigate]);

  return (
    <button
      className="btn btn-outline btn-warning w-fit font-semibold flex items-center justify-center gap-2"
      onClick={handleLogout}
      disabled={isLoading}
    >
      {isLoading ? (
        "Logging out..."
      ) : (
        <>
          <LogOut className="logout-icon" /> <span>Logout</span>
        </>
      )}
    </button>
  );
};

export default LogoutButton;

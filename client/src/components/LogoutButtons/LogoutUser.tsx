import { useLogoutMutation } from "@/features/userAuthApiSlice";
import { useNavigate } from "react-router-dom";
import { useAppDispatch } from "@/app/hooks"; // Assuming you have a custom hook for dispatch
import { logout } from "@/features/accessTokenApiSlice";
import { useEffect } from "react";
import { toast } from "react-toastify";
import { LogOut } from "lucide-react";

const LogoutButton = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [logoutMutation, { isLoading, isError, isSuccess, data }] =
    useLogoutMutation();

  useEffect(() => {
    if (isError) {
      toast.error("Error logging out");
    }
    if (isSuccess) {
      toast.success(data?.message || "Logged out");
    }
  }, [data?.message, isError, isSuccess]);

  const handleLogout = async () => {
    try {
      await logoutMutation().unwrap();
      // Dispatch the logout action to clear the access token from Redux state
      dispatch(logout());
      // Redirect the user to the login page after logging out
      navigate("/login");
    } catch (err) {
      console.error("Logout error:", err);
    }
  };

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

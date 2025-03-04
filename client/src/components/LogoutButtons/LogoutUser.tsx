import { useLogoutMutation } from "@/features/userAuthApiSlice";
import { toast } from "react-toastify";
import { LogOut } from "lucide-react";
import { memo, useCallback } from "react";

const LogoutButton = () => {
  const [logoutMutation, { isLoading }] = useLogoutMutation();

  const handleLogout = useCallback(async () => {
    try {
      await logoutMutation().unwrap(); // Execute logout mutation
      // window.location.reload();
    } catch (err) {
      console.error("Logout error:", err);
      toast.error("Error logging out");
    }
  }, [logoutMutation]);

  return (
    <button
      className="btn btn-error sm:text-sm md:text-lg  font-semibold flex items-center justify-center gap-2"
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

export default memo(LogoutButton);

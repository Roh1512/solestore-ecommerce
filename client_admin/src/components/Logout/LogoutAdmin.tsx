import { useLogoutMutation } from "@/features/adminAuthApiSlice";
import { LogOut } from "lucide-react";
import { useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import ButtonLoading from "../Loading/ButtonLoading";

const LogoutAdmin = () => {
  const navigate = useNavigate();
  const [logoutMutation, { isLoading, isSuccess }] = useLogoutMutation();

  const handleLogout = useCallback(async () => {
    try {
      await logoutMutation().unwrap();
      window.location.reload();
    } catch (error) {
      console.error("Logout error: ", error);
      toast.error("Error logging out");
    }
  }, [logoutMutation]);

  useEffect(() => {
    if (isSuccess) {
      navigate("/admin/login");
    }
  }, [isSuccess, navigate]);

  return (
    <button
      className="btn btn-primary w-fit font-semibold flex items-center justify-center gap-2"
      onClick={handleLogout}
      disabled={isLoading}
    >
      {isLoading ? (
        <ButtonLoading text="Logging out" />
      ) : (
        <>
          <LogOut className="logout-icon" /> <span>Logout</span>
        </>
      )}
    </button>
  );
};

export default LogoutAdmin;

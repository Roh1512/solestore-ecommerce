import { GoogleLogin, CredentialResponse } from "@react-oauth/google";
// or your navigation library
import { useGoogleLoginMutation } from "@/features/userAuthApiSlice";
import { useNavigate } from "react-router";
import { useEffect } from "react";
import { useTheme } from "@/context/ThemeContext";

const GoogleLoginButton = () => {
  const { theme } = useTheme();
  const [googleLogin, { isSuccess }] = useGoogleLoginMutation();
  const navigate = useNavigate();
  const handleSuccess = async (response: CredentialResponse) => {
    const { credential } = response; // The Google OAuth token

    const token = credential && credential;

    try {
      if (!token) {
        return;
      }
      const data = await googleLogin({ token }).unwrap();
      console.log("Google Login Successful:", data);
    } catch (err) {
      console.error("Google login failed:", err);
    }
  };

  const handleError = () => {
    console.error("Google Login Failed:");
  };

  useEffect(() => {
    if (isSuccess) {
      navigate("/shop");
    }
  }, [isSuccess, navigate]);

  return (
    <div
      style={{
        transform: "scale(1.2)",
        transformOrigin: "center",
        padding: "2rem",
      }}
    >
      <GoogleLogin
        onSuccess={handleSuccess}
        onError={handleError}
        useOneTap
        theme={theme === "coffee" ? "filled_black" : "filled_blue"}
        text="signin_with"
        containerProps={{
          className: "w-full m-auto",
        }}
        logo_alignment="left"
        size="large"
      />
    </div>
  );
};

export default GoogleLoginButton;

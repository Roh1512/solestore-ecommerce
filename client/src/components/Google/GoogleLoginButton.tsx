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
    console.log("Response: ", response);

    const { credential } = response; // The Google OAuth token

    console.log("TOKEN: ", credential);

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
    <GoogleLogin
      onSuccess={handleSuccess}
      onError={handleError}
      useOneTap
      theme={theme === "lofi" ? "filled_black" : "filled_blue"}
      text="continue_with"
      containerProps={{
        className: "shadow-lg w-fit m-auto",
      }}
      logo_alignment="center"
      size="large"
      shape="pill"
    />
  );
};

export default GoogleLoginButton;

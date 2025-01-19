import { Body_auth_login } from "@/client";
import React, { useEffect, useState } from "react";
import { useLoginMutation } from "@/features/userAuthApiSlice";
import { useAppDispatch } from "@/app/hooks";
import { setCredentials } from "@/features/accessTokenApiSlice";
import { toast } from "react-toastify";
import { useNavigate } from "react-router";
import { ValidationErrorDisplay } from "@/types/errorTypes";
import {
  getApiErrorMessage,
  getValidationErrors,
  isApiError,
  isFieldValidationError,
} from "@/utils/errorHandler";
import AlertMessage from "@/components/ErrorElements/AlertMessage";
import GoogleLoginButton from "@/components/Google/GoogleLoginButton";
import { Link } from "react-router-dom";

const LoginUser = () => {
  const [loginData, setLoginData] = useState<Body_auth_login>({
    username: "johnwick",
    password: "password",
    grant_type: "password", // Required for OAuth2
  });

  const [validationErrors, setValidationErrors] = useState<
    ValidationErrorDisplay[]
  >([]);
  const [apiError, setApiError] = useState<string | null>(null);

  const [login, { isLoading, isError, isSuccess, error }] = useLoginMutation();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setApiError(null);
    setValidationErrors([]);
    try {
      const response = await login(loginData).unwrap();
      console.log("Login successful:", response);
      dispatch(setCredentials({ accessToken: response.access_token }));
    } catch (error) {
      console.error("Login error:", error);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLoginData({ ...loginData, [e.target.name]: e.target.value });
    setApiError(null);
    setValidationErrors((prevErrors) =>
      prevErrors.filter((err) => err.field !== e.target.name)
    );
  };

  useEffect(() => {
    if (isError && error) {
      if (isFieldValidationError(error)) {
        const errors = getValidationErrors(error);
        setValidationErrors(errors);
      }
      if (isApiError(error)) {
        const message = getApiErrorMessage(error);
        setApiError(message);
        toast.error(message);
      } else {
        setApiError("Error logging in");
        toast.error("Error logging in");
      }
    }
    if (isSuccess) {
      navigate("/shop");
    }
  }, [isError, isSuccess, navigate, error]);

  const getValidationMessage = (field: string) => {
    const error = validationErrors.find((err) => err.field === field);
    return error ? error.message : null;
  };

  return (
    <div className="w-full h-full max-w-md p-3 bg-base-300 text-base-content shadow-xl rounded-lg">
      <h2 className="text-2xl font-bold text-center mb-6">Login</h2>
      <form onSubmit={handleLogin}>
        <div className="mb-4">
          <label htmlFor="username" className="form-control w-full max-w-lg">
            <div className="label text-lg font-medium">
              <span className="label-text">Enter Username or Email</span>
            </div>
          </label>
          <input
            type="text"
            id="username"
            name="username"
            className="input input-bordered w-full max-w-lg"
            placeholder="Username or Email"
            value={loginData.username}
            onChange={handleChange}
            required
          />
          {getValidationMessage("username") && (
            <p className="text-red-600 text-sm mt-1">
              {getValidationMessage("username")}
            </p>
          )}
        </div>

        <div className="mb-6">
          <label htmlFor="password" className="form-control w-full max-w-lg">
            <div className="label text-lg font-medium">
              <span className="label-text">Password</span>
            </div>
          </label>
          <input
            type="password"
            id="password"
            name="password"
            className="input input-bordered w-full max-w-lg"
            placeholder="Enter your password"
            value={loginData.password}
            onChange={handleChange}
            required
          />
          {getValidationMessage("password") && (
            <p className="text-red-600 text-sm mt-1">
              {getValidationMessage("password")}
            </p>
          )}
        </div>

        <button
          type="submit"
          className="btn btn-primary w-full text-2xl"
          disabled={isLoading}
        >
          {isLoading ? "Logging In..." : "Login"}
        </button>

        <br />

        {apiError ? <AlertMessage message={apiError} /> : "\u00A0"}

        <div className="text-center">
          <p className="text-lg mb-2">
            Don't have an account?{" "}
            <Link to="/register" className="text-blue-600 hover:underline">
              Sign up here
            </Link>
          </p>
        </div>
      </form>
      <GoogleLoginButton />
    </div>
  );
};

export default LoginUser;

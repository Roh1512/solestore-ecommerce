import { Body_auth_login } from "@/client";
import React, { useCallback, useState } from "react";
import { useLoginMutation } from "@/features/userAuthApiSlice";

import { toast } from "react-toastify";
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
    username: "",
    password: "",
    grant_type: "password", // Required for OAuth2
  });

  const [validationErrors, setValidationErrors] = useState<
    ValidationErrorDisplay[]
  >([]);
  const [apiError, setApiError] = useState<string | null>(null);

  const [login, { isLoading }] = useLoginMutation();
  const handleLogin = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setApiError(null);
      setValidationErrors([]);
      try {
        await login(loginData).unwrap();
      } catch (error) {
        console.error("Login error:", error);
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
    },
    [login, loginData]
  );

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setLoginData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setApiError(null);
    setValidationErrors((prevErrors) =>
      prevErrors.filter((err) => err.field !== e.target.name)
    );
  }, []);

  const getValidationMessage = (field: string) =>
    validationErrors.find((err) => err.field === field)?.message || null;

  return (
    <div className="w-full h-full max-w-md p-3 bg-base-200 text-base-content shadow-xl rounded-lg mt-4 mb-4">
      <h2 className="text-2xl font-bold text-center mb-6">Login</h2>
      <form onSubmit={handleLogin}>
        <div className="mb-4">
          <label htmlFor="username" className="form-control w-full">
            <div className="label text-lg font-medium">
              <span className="label-text">Enter Username or Email</span>
            </div>
          </label>
          <input
            type="text"
            id="username"
            name="username"
            className={`input input-bordered w-full max-w-lg ${
              getValidationMessage("username") ? "input-error" : ""
            }`}
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
          <label htmlFor="password" className="form-control w-full">
            <div className="label text-lg font-medium">
              <span className="label-text">Password</span>
            </div>
          </label>
          <input
            type="password"
            id="password"
            name="password"
            className={`input input-bordered w-full max-w-lg ${
              getValidationMessage("password") ? "input-error" : ""
            }`}
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
      <div className="flex flex-col items-center justify-center w-full">
        <GoogleLoginButton />
      </div>
    </div>
  );
};

export default LoginUser;

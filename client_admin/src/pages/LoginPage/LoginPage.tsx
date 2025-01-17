import { Body_admin_admin_login } from "@/client";
import AlertMessage from "@/components/ErrorElements/AlertMessage";
import ButtonLoading from "@/components/Loading/ButtonLoading";
import { useLoginMutation } from "@/features/adminAuthApiSlice";
import { ValidationErrorDisplay } from "@/types/errorTypes";
import {
  getApiErrorMessage,
  getValidationErrors,
  isApiError,
  isFieldValidationError,
} from "@/utils/errorHandler";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

const LoginPage = () => {
  const navigate = useNavigate();
  const [loginData, setLoginData] = useState<Body_admin_admin_login>({
    username: "admina",
    password: "password",
    grant_type: "password",
  });

  const [login, { isLoading, isError, isSuccess, error }] = useLoginMutation();

  const [validationErrors, setValidationErrors] = useState<
    ValidationErrorDisplay[]
  >([]);
  const [apiError, setApiError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setApiError(null);
    setValidationErrors([]);
    try {
      const response = await login(loginData).unwrap();
      console.log("Login successful:", response);
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
        const errorMessage = getApiErrorMessage(error);
        setApiError(errorMessage);
        toast.error(errorMessage);
      } else {
        setApiError("Error logging in");
        toast.error("Error logging in");
      }
    }
    if (isSuccess) {
      navigate("/admin/dashboard");
    }
  }, [error, isError, isSuccess, navigate]);

  const getValidationMessage = (field: string) => {
    const error = validationErrors.find((err) => err.field === field);
    return error ? error.message : null;
  };

  return (
    <div className="w-full h-full max-w-md p-3 bg-base-300 border-2 border-black text-base-content shadow-xl rounded-lg">
      <h2 className="text-2xl font-bold text-center mb-6">Admin Login</h2>
      <form onSubmit={handleLogin}>
        <div className="mb-4">
          <label htmlFor="username" className="form-control w-full max-w-lg">
            <div className="label font-medium">
              <span className="label-text text-lg">
                Enter Username or Email
              </span>
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
          <label htmlFor="password" className="form-control w-full max-w-lg">
            <div className="label font-medium">
              <span className="label-text text-lg">Password</span>
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
            // required
          />
          {getValidationMessage("password") && (
            <p className="text-red-600 text-sm mt-1">
              {getValidationMessage("password")}
            </p>
          )}
        </div>

        <button
          type="submit"
          className="btn btn-primary w-full mb-4 text-2xl"
          disabled={isLoading}
        >
          {isLoading ? <ButtonLoading text="Logging in" /> : "Login"}
        </button>

        {apiError ? <AlertMessage message={apiError} /> : "\u00A0"}

        <div className="text-center">
          <p className="text-lg">
            Don't have an account?{" "}
            <a href="/register" className="text-blue-600 hover:underline">
              Sign up here
            </a>
          </p>
        </div>
      </form>
    </div>
  );
};

export default LoginPage;

import { Body_admin_admin_login } from "@/client";
import { useLoginMutation } from "@/features/adminAuthApiSlice";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

const LoginPage = () => {
  const navigate = useNavigate();
  const [loginData, setLoginData] = useState<Body_admin_admin_login>({
    username: "admin1",
    password: "password",
    grant_type: "password",
  });

  const [login, { isLoading, isError, isSuccess }] = useLoginMutation();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await login(loginData).unwrap();
      console.log("Login successful:", response);
    } catch (error) {
      console.error("Login error:", error);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLoginData({ ...loginData, [e.target.name]: e.target.value });
  };

  useEffect(() => {
    if (isError) {
      toast.error("Login failed");
    }
    if (isSuccess) {
      navigate("/admin/dashboard");
    }
  }, [isError, isSuccess, navigate]);

  return (
    <div className="w-full h-full max-w-md p-3 bg-base-300 text-base-content shadow-xl rounded-lg">
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
            className="input input-bordered w-full max-w-lg"
            placeholder="Username or Email"
            value={loginData.username}
            onChange={handleChange}
            required
          />
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
            className="input input-bordered w-full max-w-lg"
            placeholder="Enter your password"
            value={loginData.password}
            onChange={handleChange}
            required
          />
        </div>

        <button
          type="submit"
          className="btn btn-primary w-full mb-4 text-2xl"
          disabled={isLoading}
        >
          {isLoading ? "Logging in..." : "Login"}
        </button>

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

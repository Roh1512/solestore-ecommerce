import { Body_auth_login } from "@/client";
import React, { useEffect, useState } from "react";
import { useLoginMutation } from "@/features/userAuthApiSlice";
import { useAppDispatch } from "@/app/hooks";
import { setCredentials } from "@/features/accessTokenApiSlice";
import { toast } from "react-toastify";

const LoginUser = () => {
  const [loginData, setLoginData] = useState<Body_auth_login>({
    username: "",
    password: "",
    grant_type: "password", // Required for OAuth2
  });

  const [login, { isLoading, isError }] = useLoginMutation();
  const dispatch = useAppDispatch();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
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
  };

  useEffect(() => {
    if (isError) {
      toast.error("Error logging in");
    }
  }, [isError]);

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
        </div>

        <button
          type="submit"
          className="btn btn-primary w-full mb-4 text-2xl"
          disabled={isLoading}
        >
          {isLoading ? "Logging In..." : "Login"}
        </button>

        <div className="text-center">
          <p className="text-sm">
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

export default LoginUser;

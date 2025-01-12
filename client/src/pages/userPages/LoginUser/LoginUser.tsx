import React, { useState } from "react";

const LoginUser = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle login logic here
    console.log("Logging in with", username, password);
  };

  return (
    <div className="w-full h-full max-w-md p-6 bg-base-300 text-base-content shadow-xl rounded-lg">
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
            value={username}
            onChange={(e) => setUsername(e.target.value)}
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
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        <button type="submit" className="btn btn-neutral w-full mb-4">
          Login
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

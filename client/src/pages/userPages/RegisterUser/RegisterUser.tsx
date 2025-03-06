import { UserCreateRequest } from "@/client";
import { useCallback, useEffect, useState } from "react";
import { z } from "zod";
import { useRegisterMutation } from "@/features/userAuthApiSlice";
import { useNavigate } from "react-router";
import { toast } from "react-toastify";
import {
  getApiErrorMessage,
  getValidationErrors,
  isApiError,
  isFieldValidationError,
} from "@/utils/errorHandler";
import AlertMessage from "@/components/ErrorElements/AlertMessage";
import GoogleLoginButton from "@/components/Google/GoogleLoginButton";
import { Link } from "react-router-dom";
import AlertText from "@/components/ErrorElements/AlertText";

// Define a Zod schema for user input
const userCreateSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters").trim(),
  name: z.string().min(5, "Full name must be at least 5 characters").trim(),
  email: z.string().email("Invalid email address").trim(),
  password: z.string().min(8, "Password must be at least 8 characters"),
  address: z
    .string()
    .trim()
    .min(5, "Address must be at least 5 characters")
    .optional()
    .nullable()
    .refine(
      (value) => value === null || value === undefined || value.length >= 5,
      {
        message: "Address must be at least 5 characters",
      }
    ),
  phone: z
    .string()
    .regex(/^\+?[1-9]\d{1,14}$/, "Phone number must be numbers")
    .optional()
    .nullable(),
});

const RegisterUser = () => {
  const navigate = useNavigate();
  const [userDetails, setUserDetails] = useState<UserCreateRequest>({
    username: "",
    name: "",
    email: "",
    password: "",
    address: null,
    phone: null,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const [apiError, setApiError] = useState<string | null>(null);

  const [register, { isLoading, isError, error }] = useRegisterMutation();

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setErrors({});
      setApiError(null);

      // Ensure phone and address are `null` if empty
      const normalizedUserDetails = {
        ...userDetails,
        phone: userDetails.phone === "" ? null : userDetails.phone,
        address: userDetails.address === "" ? null : userDetails.address,
      };

      // Validate the user details
      const validationResult = userCreateSchema.safeParse(
        normalizedUserDetails
      );

      if (!validationResult.success) {
        // Collect errors from Zod validation
        const fieldErrors: Record<string, string> = {};
        validationResult.error.errors.forEach((error) => {
          if (error.path[0]) {
            fieldErrors[error.path[0] as string] = error.message;
          }
        });

        setErrors(fieldErrors);
      } else {
        setErrors({});

        // Proceed with your registration logic
        // For example: send `validationResult.data` to the backend
        try {
          await register(normalizedUserDetails).unwrap();
          toast.success("User registered successfully. Continue to login.");
          navigate("/login");
        } catch (error) {
          console.error("Register Error: ", error);
        }
      }
    },
    [navigate, register, userDetails]
  );

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setApiError(null);
      const { name, value } = e.target;

      setUserDetails((prev) => ({
        ...prev,
        [name]:
          value === "" && (name === "phone" || name === "address")
            ? null
            : value,
      }));
    },
    []
  );

  useEffect(() => {
    if (isError && error) {
      if (isFieldValidationError(error)) {
        const errors = getValidationErrors(error);
        const newErrors: Record<string, string> = {};
        errors.forEach(({ field, message }) => {
          newErrors[field] = message;
        });

        setErrors((prev) => ({ ...prev, ...newErrors }));
      }
      if (isApiError(error)) {
        const errorMessage = getApiErrorMessage(error);
        setApiError(errorMessage);
      } else {
        setApiError("Error registering user");
      }
    }
  }, [error, isError]);

  return (
    <>
      <div className="mt-4 mb-4 card w-full max-w-md bg-base-300 shadow-xl pt-2">
        <div className="card-body">
          <h2 className="card-title text-2xl font-bold text-center mb-3 m-auto">
            Register
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="form-control">
              <label htmlFor="username" className="label">
                <span className="label-text">Username</span>
              </label>
              <input
                type="text"
                name="username"
                className={`input input-bordered w-full ${
                  errors.username ? "input-error" : ""
                }`}
                required
                value={userDetails.username}
                onChange={handleChange}
                placeholder="Enter username"
              />
              {errors.username && typeof errors.username === "string" && (
                <AlertText message={errors.username} />
              )}
            </div>

            <div className="form-control">
              <label htmlFor="email" className="label">
                <span className="label-text">Email</span>
              </label>
              <input
                type="email"
                name="email"
                className={`input input-bordered w-full ${
                  errors.email ? "input-error" : ""
                }`}
                required
                value={userDetails.email}
                onChange={handleChange}
                placeholder="Enter email address"
              />
              {errors.email && typeof errors.email === "string" && (
                <AlertText message={errors.email} />
              )}
            </div>

            <div className="form-control">
              <label htmlFor="name" className="label">
                <span className="label-text">Full name</span>
              </label>
              <input
                type="text"
                name="name"
                className={`input input-bordered w-full ${
                  errors.name ? "input-error" : ""
                }`}
                required
                value={userDetails.name || ""}
                onChange={handleChange}
                placeholder="Enter full name"
              />
              {errors.name && typeof errors.name === "string" && (
                <AlertText message={errors.name} />
              )}
            </div>

            <div className="form-control">
              <label htmlFor="password" className="label">
                <span className="label-text">Password</span>
              </label>
              <input
                type="password"
                name="password"
                className={`input input-bordered w-full ${
                  errors.password ? "input-error" : ""
                }`}
                required
                value={userDetails.password}
                onChange={handleChange}
                placeholder="Enter password"
              />
              {errors.password && typeof errors.password === "string" && (
                <AlertText message={errors.password} />
              )}
            </div>

            <div className="form-control">
              <label htmlFor="phone" className="label">
                <span className="label-text">Phone number</span>
              </label>
              <input
                type="tel"
                name="phone"
                className={`input input-bordered w-full ${
                  errors.phone ? "input-error" : ""
                }`}
                required
                value={userDetails.phone || ""}
                onChange={handleChange}
                placeholder="Enter Phone number"
              />
              {errors.phone && typeof errors.phone === "string" && (
                <AlertText message={errors.phone} />
              )}
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text">Address</span>
              </label>
              <textarea
                name="address"
                value={userDetails.address ?? ""}
                onChange={handleChange}
                placeholder="Enter address"
                className={`textarea textarea-bordered h-24 ${
                  errors.address ? "textarea-error" : ""
                }`}
              />
              {errors.address && typeof errors.address === "string" && (
                <AlertText message={errors.address} />
              )}
            </div>

            <div className="form-control mt-6">
              <button
                type="submit"
                className="btn btn-primary w-full mb-4 text-2xl"
                disabled={isLoading}
              >
                {isLoading ? "Registering..." : "Register"}
              </button>
            </div>
          </form>
          {apiError && (
            <AlertMessage message={apiError || "Error registering user"} />
          )}
          <div className="flex flex-col items-center justify-center">
            <GoogleLoginButton />
          </div>
        </div>
        <div className="text-center">
          <p className="text-lg mb-2">
            Have an account?{" "}
            <Link to="/login" className="text-blue-600 hover:underline">
              Login here
            </Link>
          </p>
        </div>
      </div>
    </>
  );
};

export default RegisterUser;

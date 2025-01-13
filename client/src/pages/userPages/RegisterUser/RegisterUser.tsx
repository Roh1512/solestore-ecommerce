import { UserCreateRequest } from "@/client";
import { useState } from "react";
import { z } from "zod";
import { useRegisterMutation } from "@/features/userAuthApiSlice";
import { useNavigate } from "react-router";
import { toast } from "react-toastify";

// Define a Zod schema for user input
const userCreateSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters").trim(),
  name: z.string().min(3, "Full name must be at least 3 characters").trim(),
  email: z.string().email("Invalid email address").trim(),
  password: z.string().min(6, "Password must be at least 6 characters"),
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

  const [register, { isLoading, isError }] = useRegisterMutation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    // Ensure phone and address are `null` if empty
    const normalizedUserDetails = {
      ...userDetails,
      phone: userDetails.phone === "" ? null : userDetails.phone,
      address: userDetails.address === "" ? null : userDetails.address,
    };

    // Validate the user details
    const validationResult = userCreateSchema.safeParse(normalizedUserDetails);

    if (!validationResult.success) {
      // Collect errors from Zod validation
      const fieldErrors: Record<string, string> = {};
      validationResult.error.errors.forEach((error) => {
        if (error.path[0]) {
          fieldErrors[error.path[0] as string] = error.message;
        }
      });

      setErrors(fieldErrors);
      console.log(userDetails);
    } else {
      setErrors({});
      console.log("Validated User Details:", validationResult.data);

      // Proceed with your registration logic
      // For example: send `validationResult.data` to the backend
      try {
        const response = await register(normalizedUserDetails).unwrap();
        console.log("Registration successful: ", response);
        toast.success("User registered successfully. Continue to login.");
        navigate("/login");
      } catch (error) {
        console.log("Register Error: ", error);
      }
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;

    setUserDetails((prev) => ({
      ...prev,
      [name]:
        value === "" && (name === "phone" || name === "address") ? null : value,
    }));
  };

  return (
    <div className="card w-full max-w-md bg-base-300 shadow-xl">
      <div className="card-body">
        <h2 className="card-title text-2xl font-bold text-center mb-6">
          Create Account
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          {[
            {
              name: "username",
              label: "Username",
              type: "text",
              required: true,
            },
            { name: "name", label: "Full Name", type: "text", required: true },
            { name: "email", label: "Email", type: "email", required: true },
            {
              name: "password",
              label: "Password",
              type: "password",
              required: true,
            },
            { name: "phone", label: "Phone", type: "tel" },
          ].map((field) => (
            <div key={field.name} className="form-control">
              <label className="label">
                <span className="label-text">{field.label}</span>
              </label>
              <input
                type={field.type}
                name={field.name}
                value={userDetails[field.name as keyof UserCreateRequest] ?? ""}
                onChange={handleChange}
                placeholder={`Enter ${field.label.toLowerCase()}`}
                className={`input input-bordered w-full ${
                  errors[field.name] ? "input-error" : ""
                }`}
                required={field.required ? field.required : false}
              />
              {errors[field.name] && (
                <p className="text-error text-sm mt-1">{errors[field.name]}</p>
              )}
            </div>
          ))}

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
            {errors.address && (
              <p className="text-error text-sm mt-1">{errors.address}</p>
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
        {isError && <p>Error registering user</p>}
      </div>
    </div>
  );
};

export default RegisterUser;

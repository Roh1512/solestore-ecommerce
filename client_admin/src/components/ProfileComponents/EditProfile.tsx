import { Edit2 } from "lucide-react";
import { AdminUpdateRequest, AdminResponse } from "@/client";
import {
  User2,
  SignatureIcon,
  MailIcon,
  PhoneCallIcon,
  KeyRound,
} from "lucide-react";
import { memo, useCallback, useEffect, useMemo, useState } from "react";
import { z } from "zod";
import { useUpdateProfileMutation } from "@/features/profileApiSLice";

import {
  getApiErrorMessage,
  getValidationErrors,
  isApiError,
  isFieldValidationError,
} from "@/utils/errorHandler";
import AlertMessage from "../ErrorElements/AlertMessage";
import { toast } from "react-toastify";
import ButtonLoading from "../Loading/ButtonLoading";

type Props = {
  admin: AdminResponse;
};

// Zod validation schema
const updateAdminSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters").trim(),
  name: z.string().min(3, "Name must be at least 3 characters").trim(),
  email: z.string().email("Invalid email address").trim(),
  password: z
    .string()
    .optional()
    .nullable()
    .refine((value) => !value || value.length >= 6, {
      message: "Password must be at least 6 characters",
    }),
  phone: z
    .string()
    .optional()
    .nullable()
    .refine((value) => !value || /^\+?[1-9]\d{1,14}$/.test(value), {
      message: "Invalid phone number",
    }),
});

const passwordSchema = z.object({
  current_password: z
    .string()
    .min(6, "Password must be at least 6 characters")
    .trim(),
});

const EditProfile = (props: Props) => {
  const admin: AdminResponse = props.admin;

  const initialAdminDetails: AdminUpdateRequest = useMemo(() => {
    return {
      username: admin?.username || "",
      name: admin?.name || "",
      email: admin?.email || "",
      password: "",
      phone: admin?.phone || "",
    };
  }, [admin]);
  const [adminDetails, setAdminDetails] =
    useState<AdminUpdateRequest>(initialAdminDetails);
  const [currentPassword, setCurrentPassword] = useState<string>("");

  const [zodErrors, setZodErrors] = useState<Record<string, string>>({});
  const [currentPasswordError, setCurrentPasswordError] = useState<
    Record<string, string>
  >({});

  const [apiError, setApiError] = useState<string | null>(null);

  const [updateProfile, { isLoading, isError, error }] =
    useUpdateProfileMutation();

  const resetForm = useCallback(() => {
    setAdminDetails(initialAdminDetails);
    setZodErrors({});
    setCurrentPassword("");
    setCurrentPasswordError({});
    setApiError(null);
  }, [initialAdminDetails]);

  const handleDetailsChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setApiError(null);
      const { name, value } = e.target;
      setAdminDetails((prev) => ({
        ...prev,
        [name]:
          value === "" && (name === "phone" || name === "password")
            ? null
            : value,
      }));
    },
    []
  );

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      e.stopPropagation();

      setZodErrors({});
      setCurrentPasswordError({});

      // Validate using Zod schema
      const result = updateAdminSchema.safeParse(adminDetails);
      if (!result.success) {
        // Collect Zod errors
        const errors: Record<string, string> = {};
        result.error.errors.forEach((err) => {
          if (err.path[0]) {
            errors[err.path[0] as string] = err.message;
          }
        });
        setZodErrors(errors);
        return;
      }

      const currentPasswordResult = passwordSchema.safeParse({
        current_password: currentPassword,
      });

      if (!currentPasswordResult.success) {
        const errors: Record<string, string> = {};
        currentPasswordResult.error.errors.forEach((err) => {
          if (err.path[0]) {
            errors[err.path[0] as string] = err.message;
          }
        });
        setCurrentPasswordError(errors); // Set the current password error
        return;
      }

      try {
        const profileDetails = adminDetails;
        const response = await updateProfile({
          profileDetails,
          currentPassword,
        }).unwrap();
        console.log(response);
        toast.success("Profile updated");
        const modal = document.getElementById(
          "my_modal_2"
        ) as HTMLDialogElement | null;
        if (modal) {
          modal.close(); // Close the modal
        }

        // Optionally reset the form after successful update
        resetForm();
      } catch (error) {
        console.error("Error updating profile", error);
      }
    },
    [adminDetails, currentPassword, resetForm, updateProfile]
  );

  useEffect(() => {
    if (isError && error) {
      if (isFieldValidationError(error)) {
        const errors = getValidationErrors(error);

        const newErrors: Record<string, string> = {};
        errors.forEach(({ field, message }) => {
          newErrors[field] = message;
        });
        console.log(newErrors);

        setZodErrors((prev) => ({ ...prev, ...newErrors }));
      }
      if (isApiError(error)) {
        const errorMessage = getApiErrorMessage(error);
        setApiError(errorMessage);
      } else {
        setApiError("Error updating profile");
      }
    }
  }, [error, isError]);

  useEffect(() => {
    if (zodErrors) {
      const firstErrorField =
        Object.keys(zodErrors)[0] || Object.keys(currentPasswordError)[0];
      if (firstErrorField) {
        document.getElementById(firstErrorField)?.focus();
      }
    }
  }, [currentPasswordError, zodErrors]);

  return (
    <>
      <button
        aria-label="Edit profile"
        className="btn w-fit"
        onClick={() => {
          resetForm();
          const modal = document.getElementById(
            "my_modal_2"
          ) as HTMLDialogElement | null;
          if (modal) {
            modal.showModal();
          }
        }}
      >
        <Edit2 />
      </button>
      <dialog id="my_modal_2" className="modal">
        <div className="modal-box">
          <div>
            {/* Close Modal */}
            <button
              type="button"
              className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
              onClick={() => {
                const modal = document.getElementById(
                  "my_modal_2"
                ) as HTMLDialogElement | null;
                if (modal) {
                  modal.close();
                }
              }}
            >
              ✕
            </button>
          </div>
          <h3 className="font-bold text-lg">Edit</h3>
          <form onSubmit={handleSubmit}>
            {/* Username */}
            <div className="mb-4">
              <label
                htmlFor="username"
                className="input input-bordered flex items-center gap-2"
              >
                <User2 />
                <input
                  type="text"
                  id="username"
                  name="username"
                  className="grow"
                  placeholder="Username"
                  value={adminDetails.username || ""}
                  onChange={handleDetailsChange}
                />
              </label>
              {zodErrors.username && (
                <p className="text-red-500 text-sm mt-1">
                  {zodErrors.username}
                </p>
              )}
            </div>

            {/* Name */}
            <div className="mb-4">
              <label
                htmlFor="name"
                className="input input-bordered flex items-center gap-2"
              >
                <SignatureIcon />
                <input
                  type="text"
                  id="name"
                  name="name"
                  className="grow"
                  placeholder="Name"
                  value={adminDetails.name || ""}
                  onChange={handleDetailsChange}
                />
              </label>
              {zodErrors.name && (
                <p className="text-red-500 text-sm mt-1">{zodErrors.name}</p>
              )}
            </div>

            {/* Email */}
            <div className="mb-4">
              <label
                htmlFor="email"
                className="input input-bordered flex items-center gap-2"
              >
                <MailIcon />
                <input
                  type="email"
                  id="email"
                  name="email"
                  className="grow"
                  placeholder="Email"
                  value={adminDetails.email || ""}
                  onChange={handleDetailsChange}
                />
              </label>
              {zodErrors.email && (
                <p className="text-red-500 text-sm mt-1">{zodErrors.email}</p>
              )}
            </div>

            {/* Password */}
            <div className="mb-4">
              <label
                htmlFor="password"
                className="input input-bordered flex items-center gap-2"
              >
                <KeyRound />
                <input
                  type="password"
                  id="password"
                  name="password"
                  className="grow"
                  placeholder="Password"
                  value={adminDetails.password || ""}
                  onChange={handleDetailsChange}
                />
              </label>
              {zodErrors.password && (
                <p className="text-red-500 text-sm mt-1">
                  {zodErrors.password}
                </p>
              )}
            </div>

            {/* Phone */}
            <div className="mb-4">
              <label
                htmlFor="phone"
                className="input input-bordered flex items-center gap-2"
              >
                <PhoneCallIcon />
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  className="grow"
                  placeholder="Phone"
                  value={adminDetails.phone || ""}
                  onChange={handleDetailsChange}
                />
              </label>
              {zodErrors.phone && (
                <p className="text-red-500 text-sm mt-1">{zodErrors.phone}</p>
              )}
            </div>

            <div className="mb-4">
              <label
                htmlFor="current_password"
                className="input input-bordered flex items-center gap-2"
              >
                <KeyRound />
                <input
                  type="password"
                  id="current_password"
                  name="current_password"
                  className="grow"
                  placeholder="Enter current password"
                  value={currentPassword}
                  onChange={(e) => {
                    setCurrentPassword(e.target.value);
                    setApiError(null);
                  }}
                />
              </label>
              {currentPasswordError.current_password && (
                <p className="text-red-500 text-sm mt-1">
                  {currentPasswordError.current_password}
                </p>
              )}
            </div>

            {apiError && typeof apiError === "string" && (
              <AlertMessage message={apiError} />
            )}

            {/* Submit Button */}
            <button
              type="submit"
              className="mt-3 btn btn-primary w-full"
              disabled={isLoading}
            >
              {isLoading ? <ButtonLoading text="Updating" /> : "Save changes"}
            </button>
          </form>
        </div>
      </dialog>
    </>
  );
};

export default memo(EditProfile);

import { UpdateProfileRequest, UserResponse } from "@/client";
import { useUpdateProfileDetailsMutation } from "@/features/userProfileApiSlice";
import {
  getApiErrorMessage,
  getValidationErrors,
  isApiError,
  isFieldValidationError,
} from "@/utils/errorHandler";
import { Edit2, KeyRound, MailIcon, SignatureIcon, User2 } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { z } from "zod";
import AlertText from "../ErrorElements/AlertText";
import ButtonLoading from "../Loading/ButtonLoading";
import { closeModal, openModal } from "@/utils/modal_utils";

const updateProfileSchema = z.object({
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
});

const passwordSchema = z.object({
  current_password: z
    .string()
    .min(6, "Password must be at least 6 characters")
    .trim(),
});

type Props = {
  user: UserResponse;
};

const EditProfileDetails = (props: Props) => {
  const user = props.user;
  const initialUserDetails: UpdateProfileRequest = {
    username: user?.username || "",
    name: user?.name || "",
    email: user?.email || "",
    password: "",
  };
  const modalId = "edit_profile_modal";
  const [userDetails, setUserDetails] =
    useState<UpdateProfileRequest>(initialUserDetails);
  const [currentPassword, setCurrentPassword] = useState<string>("");

  const [zodErrors, setZodErrors] = useState<Record<string, string>>({});
  const [currentPasswordError, setCurrentPasswordError] = useState<
    Record<string, string>
  >({});

  const [apiError, setApiError] = useState<string | null>(null);

  const [updateProfileDetails, { isLoading, isError, error }] =
    useUpdateProfileDetailsMutation();

  const resetForm = () => {
    setUserDetails(initialUserDetails);
    setZodErrors({});
    setCurrentPassword("");
    setCurrentPasswordError({});
    setApiError(null);
  };

  const handleDetailsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setApiError(null);
    const { name, value } = e.target;
    setUserDetails((prev) => ({
      ...prev,
      [name]: value === "" && name === "password" ? null : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();

    setZodErrors({});
    setCurrentPasswordError({});

    const result = updateProfileSchema.safeParse(userDetails);
    if (!result.success) {
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

    if (!currentPasswordResult.success && !user.google_id) {
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
      const profileDetails = userDetails;
      const response = await updateProfileDetails({
        profileDetails,
        currentPassword,
      }).unwrap();
      console.log(response);
      toast.success("Profile updated");

      closeModal(modalId);
      resetForm();
    } catch (error) {
      console.error("Error updating profile", error);
    }
  };

  useEffect(() => {
    if (isError && error) {
      if (isFieldValidationError(error)) {
        const errors = getValidationErrors(error);

        const newErrors: Record<string, string> = {};
        errors.forEach(({ field, message }) => {
          newErrors[field] = message;
        });

        setZodErrors((prev) => ({ ...prev, ...newErrors }));
      }
      if (isApiError(error)) {
        const errorMessage = getApiErrorMessage(error);
        setApiError(errorMessage as string);
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
        className="bg-transparent border-2 border-secondary text-secondary w-fit  btn-info rounded-full p-2 hover:bg-secondary hover:text-secondary-content"
        onClick={() => {
          resetForm();
          openModal(modalId);
        }}
      >
        <Edit2 />
      </button>

      <dialog id={modalId} className="modal">
        <div className="modal-box">
          <div>
            {/* Close Modal */}
            <button
              type="button"
              className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
              onClick={() => closeModal(modalId)}
            >
              ✕
            </button>
          </div>
          <h3 className="font-bold text-lg">Edit</h3>
          <form onSubmit={handleSubmit}>
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
                  value={userDetails.username || ""}
                  onChange={handleDetailsChange}
                />
              </label>
              {zodErrors.username && <AlertText message={zodErrors.username} />}
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
                  value={userDetails.name || ""}
                  onChange={handleDetailsChange}
                />
              </label>
              {zodErrors.name && <AlertText message={zodErrors.name} />}
            </div>

            {/* Email */}
            {!user?.google_id && (
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
                    value={userDetails.email || ""}
                    onChange={handleDetailsChange}
                  />
                </label>
                {zodErrors.email && <AlertText message={zodErrors.email} />}
              </div>
            )}

            {/* Password */}
            {!user.google_id && (
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
                    placeholder="New Password to change(optional)"
                    value={userDetails.password || ""}
                    onChange={handleDetailsChange}
                  />
                </label>
                {zodErrors.password && (
                  <AlertText message={zodErrors.password} />
                )}
              </div>
            )}

            {!user?.google_id && (
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
                  <AlertText message={currentPasswordError.current_password} />
                )}
              </div>
            )}
            <br />
            {apiError && typeof apiError === "string" && (
              <AlertText message={apiError} />
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

export default EditProfileDetails;

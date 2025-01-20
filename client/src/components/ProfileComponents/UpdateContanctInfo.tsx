import { UpdateContactInfoRequest, UserResponse } from "@/client";
import { useUpdateContactInfoMutation } from "@/features/userProfileApiSlice";
import {
  getApiErrorMessage,
  getValidationErrors,
  isApiError,
  isFieldValidationError,
} from "@/utils/errorHandler";
import { closeModal, openModal } from "@/utils/modal_utils";
import { HomeIcon, KeyRound, PhoneCallIcon, ReceiptText } from "lucide-react";
import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { z } from "zod";
import AlertText from "../ErrorElements/AlertText";
import ButtonLoading from "../Loading/ButtonLoading";

type Props = {
  user: UserResponse;
};

const updateContanctInfoSchema = z.object({
  phone: z
    .string()
    .optional()
    .nullable()
    .refine((value) => !value || /^\+?[1-9]\d{1,14}$/.test(value), {
      message: "Invalid phone number",
    }),
  address: z
    .string()
    .optional()
    .nullable()
    .refine((value) => !value || value.length >= 6, {
      message: "Address must be at least 6 characters",
    }),
});

const passwordSchema = z.object({
  current_password: z
    .string()
    .min(6, "Password must be at least 6 characters")
    .trim(),
});

const UpdateContanctInfo = (props: Props) => {
  const modalId = "update_info_modal";
  const user: UserResponse = props.user;
  const initialContactInfo: UpdateContactInfoRequest = {
    phone: user?.phone || "",
    address: user?.address || "",
  };
  const [contactInfo, setContactInfo] =
    useState<UpdateContactInfoRequest>(initialContactInfo);
  const [currentPassword, setCurrentPassword] = useState<string>("");

  const [zodErrors, setZodErrors] = useState<Record<string, string>>({});
  const [currentPasswordError, setCurrentPasswordError] = useState<
    Record<string, string>
  >({});

  const [apiError, setApiError] = useState<string | null>(null);

  const [updateContactInfo, { isLoading, isError, error }] =
    useUpdateContactInfoMutation();

  const resetForm = () => {
    setContactInfo(initialContactInfo);
    setZodErrors({});
    setCurrentPassword("");
    setCurrentPasswordError({});
    setApiError(null);
  };

  const handleDetailsChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setApiError(null);
    const { name, value } = e.target;
    setContactInfo((prev) => ({
      ...prev,
      [name]: value === "" ? null : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (JSON.stringify(contactInfo) === JSON.stringify(initialContactInfo)) {
      toast.info("No change detected");
      closeModal(modalId);
      return;
    }

    setZodErrors({});
    setCurrentPasswordError({});
    setApiError(null);

    const result = updateContanctInfoSchema.safeParse(contactInfo);
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

    if (!currentPasswordResult.success && !props.user.google_id) {
      const errors: Record<string, string> = {};
      currentPasswordResult.error.errors.forEach((err) => {
        if (err.path[0]) {
          errors[err.path[0] as string] = err.message;
        }
      });
      setCurrentPasswordError(errors); // Set the current password error//
      return;
    }

    try {
      const response = await updateContactInfo({
        contactInfo,
        currentPassword,
      }).unwrap();
      console.log(response);
      toast.success("Contact info updated");
      resetForm();
      closeModal(modalId);
    } catch (error) {
      console.error("Error updating contact info: ", error);
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
        aria-label="Update address and phone number"
        className="btn w-fit m-auto box-content p-2 sm:btn-sm"
        onClick={() => openModal(modalId)}
      >
        <ReceiptText className="w-4 h-4" /> Update Address and Phone number
      </button>
      <dialog id={modalId} className="modal">
        <div className="modal-box">
          <div>
            <button
              type="button"
              className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
              onClick={() => closeModal(modalId)}
            >
              ✕
            </button>
          </div>
          <h3 className="font-bold text-lg">Update contact info</h3>

          <form onSubmit={handleSubmit}>
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
                  value={contactInfo.phone || ""}
                  onChange={handleDetailsChange}
                />
              </label>
              {zodErrors.phone && <AlertText message={zodErrors.phone} />}
            </div>
            <div className="mb-4">
              <label className="form-control" htmlFor="address">
                <div className="label">
                  <span className="label-text flex gap-2 items-center justify-center">
                    <HomeIcon /> Address
                  </span>
                </div>
                <textarea
                  className="textarea textarea-bordered h-24"
                  id="address"
                  name="address"
                  placeholder="Enter address here"
                  value={contactInfo.address || ""}
                  onChange={handleDetailsChange}
                ></textarea>
                {zodErrors.address && <AlertText message={zodErrors.address} />}
              </label>
            </div>

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
                  <p className="text-red-500 text-sm mt-1">
                    {currentPasswordError.current_password}
                  </p>
                )}
              </div>
            )}

            {apiError && typeof apiError === "string" && (
              <AlertText message={apiError} />
            )}

            <button
              type="submit"
              className="mt-3 btn btn-primary w-full"
              disabled={isLoading}
            >
              {isLoading ? <ButtonLoading text="Updating" /> : "Update"}
            </button>
          </form>
        </div>
      </dialog>
    </>
  );
};

export default UpdateContanctInfo;

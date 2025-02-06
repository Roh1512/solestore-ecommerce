import { memo, useCallback, useEffect, useState } from "react";
import ButtonLoading from "../Loading/ButtonLoading";
import { closeModal, openModal } from "@/utils/modal_utils";
import { LockKeyhole, Mail, Pen, Phone, Plus, UserPen } from "lucide-react";
import { useRegisterAdminMutation } from "@/features/allAdminsApiSlice";
import { z } from "zod";
import { AdminRole } from "@/types/queryTypes";
import { AdminCreateRequest } from "@/client";
import { toast } from "react-toastify";
import {
  getApiErrorMessage,
  getValidationErrors,
  isApiError,
  isFieldValidationError,
} from "@/utils/errorHandler";
import AlertText from "../ErrorElements/AlertText";
import AlertMessage from "../ErrorElements/AlertMessage";

const addAdminSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters").trim(),
  name: z.string().min(5, "Full name must be at least 5 characters").trim(),
  email: z.string().email("Invalid email address").trim(),
  password: z.string().min(8, "Password must be at least 8 characters"),
  phone: z
    .string()
    .regex(/^\+?[1-9]\d{1,14}$/, "Phone number must be numbers")
    .optional()
    .nullable(),
  role: z.nativeEnum(AdminRole),
});

const AddAdmin = memo(() => {
  const [adminDetails, setAdminDetails] = useState<AdminCreateRequest>({
    username: "",
    name: "",
    email: "",
    password: "",
    phone: null,
    role: AdminRole.ADMIN,
  });

  const [zodErrors, setZodErrors] = useState<Record<string, string>>({});

  const [apiError, setApiError] = useState<string | null>(null);

  const [addAdmin, { isLoading, isError, error }] = useRegisterAdminMutation();

  const resetForm = useCallback(() => {
    setApiError(null);
    setZodErrors({});
    setAdminDetails({
      username: "",
      name: "",
      email: "",
      password: "",
      phone: null,
      role: AdminRole.ADMIN,
    });
  }, []);

  const handleSubmut = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setZodErrors({});
      setApiError(null);

      const normalizedAdminDetails = {
        ...adminDetails,
        phone: adminDetails.phone === "" ? null : adminDetails.phone,
      };

      const validationResult = addAdminSchema.safeParse(normalizedAdminDetails);

      if (!validationResult.success) {
        const fieldErrors: Record<string, string> = {};
        validationResult.error.errors.forEach((error) => {
          if (error.path[0]) {
            fieldErrors[error.path[0] as string] = error.message;
          }
        });
        setZodErrors(fieldErrors);
      } else {
        setZodErrors({});
        try {
          const response = await addAdmin(normalizedAdminDetails).unwrap();
          console.log("Admin Regitered successfully", response);
          toast.success("Admin Regitered successfully");
          resetForm();
        } catch (error) {
          console.error("Error adding admin: ", error);
        }
      }
    },
    [addAdmin, adminDetails, resetForm]
  );

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      setApiError(null);
      const { name, value } = e.target;
      setAdminDetails((prev) => ({
        ...prev,
        [name]: value === "" && name === "phone" ? null : value,
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
          newErrors[field] =
            typeof message === "string" ? message : JSON.stringify(message);
        });
        setZodErrors((prev) => ({ ...prev, ...newErrors }));
      }
      if (isApiError(error)) {
        const errorMessage = getApiErrorMessage(error);
        setApiError(errorMessage);
      } else {
        setApiError("Error registering admin");
      }
    }
  }, [error, isError]);

  const modalId = "add-admin-modal";
  return (
    <>
      <button
        className="btn bg-green-900 hover:bg-green-700 shadow-slate-700 shadow-md text-white fixed bottom-7 right-6 text-lg font-bold z-10"
        onClick={() => {
          openModal(modalId);
        }}
      >
        {isLoading ? (
          <ButtonLoading text="Creating" />
        ) : (
          <>
            <span>Register New</span> <Plus className="w-6 h-6" />
          </>
        )}
      </button>

      <dialog id={modalId} className="modal">
        <div className="modal-box min-h-">
          <button
            type="button"
            className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
            onClick={() => {
              closeModal(modalId);
            }}
          >
            ✕
          </button>
          <h3>Register new admin</h3>
          <form onSubmit={handleSubmut} className="">
            <div className="mb-4">
              <label
                htmlFor="username"
                className={`input input-bordered flex items-center gap-2 ${
                  zodErrors.username ? "input-error" : null
                }`}
              >
                <UserPen />
                <input
                  type="text"
                  id="username"
                  name="username"
                  className="grow"
                  placeholder="Enter username"
                  // value={brandDetails.title || ""}
                  // onChange={handleChange}
                  value={adminDetails.username}
                  onChange={handleChange}
                  disabled={isLoading}
                  autoComplete="username"
                />
              </label>
              {zodErrors.username && <AlertText message={zodErrors.username} />}
            </div>

            <div className="mb-4">
              <label
                htmlFor="email"
                className={`input input-bordered flex items-center gap-2 ${
                  zodErrors.email ? "input-error" : null
                }`}
              >
                <Mail />
                <input
                  type="email"
                  id="email"
                  name="email"
                  className="grow"
                  placeholder="Enter Email"
                  // value={brandDetails.title || ""}
                  // onChange={handleChange}
                  value={adminDetails.email}
                  onChange={handleChange}
                  disabled={isLoading}
                  autoComplete="email"
                />
              </label>
              {zodErrors.email && <AlertText message={zodErrors.email} />}
            </div>

            <div className="mb-4">
              <label
                htmlFor="name"
                className={`input input-bordered flex items-center gap-2 ${
                  zodErrors.name ? "input-error" : null
                }`}
              >
                <Pen />
                <input
                  type="text"
                  id="name"
                  name="name"
                  className="grow"
                  placeholder="Enter name"
                  // value={brandDetails.title || ""}
                  // onChange={handleChange}
                  value={adminDetails.name || ""}
                  onChange={handleChange}
                  disabled={isLoading}
                  autoComplete="name"
                />
              </label>
              {zodErrors.name && <AlertText message={zodErrors.name} />}
            </div>

            <div className="mb-4">
              <label
                htmlFor="password"
                className={`input input-bordered flex items-center gap-2 ${
                  zodErrors.password ? "input-error" : null
                }`}
              >
                <LockKeyhole />
                <input
                  type="password"
                  id="password"
                  name="password"
                  className="grow"
                  placeholder="Enter password to set"
                  // value={brandDetails.title || ""}
                  // onChange={handleChange}
                  value={adminDetails.password || ""}
                  onChange={handleChange}
                  disabled={isLoading}
                  autoComplete="new-password"
                />
              </label>
              {zodErrors.password && <AlertText message={zodErrors.password} />}
            </div>

            <div className="mb-4">
              <label
                htmlFor="role"
                className="input input-bordered flex items-center gap-2"
              >
                <UserPen />
                <select
                  id="role"
                  name="role"
                  className="grow"
                  value={adminDetails.role}
                  onChange={handleChange}
                  disabled={isLoading}
                >
                  {Object.values(AdminRole).map((role) => (
                    <option key={role} value={role}>
                      {role.replace("_", " ")}
                    </option>
                  ))}
                </select>
              </label>
              {zodErrors.role && <AlertText message={zodErrors.role} />}
            </div>

            <div className="mb-4">
              <label
                htmlFor="phone"
                className={`input input-bordered flex items-center gap-2 ${
                  zodErrors.phone ? "input-error" : null
                }`}
              >
                <Phone />
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  className="grow"
                  placeholder="Enter contact number(Optional)"
                  // value={brandDetails.title || ""}
                  // onChange={handleChange}
                  value={adminDetails.phone || ""}
                  onChange={handleChange}
                  disabled={isLoading}
                />
              </label>
              {zodErrors.phone && <AlertText message={zodErrors.phone} />}
            </div>
            <br />
            <button
              type="submit"
              className="btn btn-primary w-full mb-4 text-2xl"
              disabled={isLoading}
            >
              {isLoading ? "Registering..." : "Register"}
            </button>
          </form>
          {apiError && (
            <AlertMessage message={apiError || "Error registering user"} />
          )}
        </div>
      </dialog>
    </>
  );
});

export default AddAdmin;

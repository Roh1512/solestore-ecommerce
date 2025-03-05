import { AdminResponse, AdminRoleUpdateRequest } from "@/client";
import { AdminRole } from "@/types/queryTypes";
import { closeModal, openModal } from "@/utils/modal_utils";
import { memo, useCallback, useEffect, useState } from "react";
import { z } from "zod";
import ButtonLoading from "../Loading/ButtonLoading";
import { useUpdateAdminRoleMutation } from "@/features/allAdminsApiSlice";
import AlertText from "../ErrorElements/AlertText";
import { PenBoxIcon, UserPen } from "lucide-react";
import { toast } from "react-toastify";
import {
  getApiErrorMessage,
  getValidationErrors,
  isApiError,
  isFieldValidationError,
} from "@/utils/errorHandler";

type Props = {
  admin: AdminResponse;
};

const updateRoleSchema = z.object({
  role: z.nativeEnum(AdminRole),
});

const UpdateRole = memo(({ admin }: Props) => {
  const modalId = `update-role-${admin._id}`;
  const [newRole, setNewRole] = useState<AdminRoleUpdateRequest>({
    role: admin.role || AdminRole.ADMIN,
  });

  const [zodErrors, setZodErrors] = useState<Record<string, string>>({});

  const [apiError, setApiError] = useState<string | null>(null);

  const [updateRole, { isLoading, isError, error }] =
    useUpdateAdminRoleMutation();

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      setApiError(null);
      const { name, value } = e.target;
      setNewRole((prev) => ({
        ...prev,
        [name]: value,
      }));
    },
    []
  );

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setApiError(null);
      setZodErrors({});

      const normalizedRoleDetails = {
        ...newRole,
        role: newRole.role,
      };

      const validationResult = updateRoleSchema.safeParse(
        normalizedRoleDetails
      );

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
          await updateRole({
            adminId: admin._id,
            body: newRole,
          }).unwrap();
          toast.success("Admin role updated");
        } catch (error) {
          console.error("Error updating role: ", error);
        }
      }
    },
    [admin, newRole, updateRole]
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
      }
    }
  }, [error, isError]);

  return (
    <>
      <button
        className="btn btn-sm btn-warning"
        onClick={() => {
          openModal(modalId);
        }}
      >
        {isLoading ? (
          <ButtonLoading text="Creating" />
        ) : (
          <>
            <PenBoxIcon className="w-4 h-4" />
            <span className="logo-text">Update Role</span>
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
              setApiError(null);
              setZodErrors({});
            }}
          >
            ✕
          </button>
          <h3 className="text-2xl mb-3">Update Role of {admin.username}</h3>

          <form onSubmit={handleSubmit}>
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
                  value={newRole.role}
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
            <button
              type="submit"
              className="btn btn-primary w-full mb-4 text-2xl"
              disabled={isLoading}
            >
              {isLoading ? <ButtonLoading text="Updating" /> : "Update Role"}
            </button>
          </form>
          {apiError && typeof apiError === "string" && (
            <AlertText message={apiError || "Error registering user"} />
          )}
        </div>
      </dialog>
    </>
  );
});

export default UpdateRole;

import { AdminResponse } from "@/client";
import { useDeleteAdminMutation } from "@/features/allAdminsApiSlice";
import { getApiErrorMessage, isApiError } from "@/utils/errorHandler";
import { closeModal, openModal } from "@/utils/modal_utils";
import { useCallback, useEffect, useState } from "react";
import { toast } from "react-toastify";
import IconLoading from "../Loading/IconLoading";
import { Trash2 } from "lucide-react";
import ButtonLoading from "../Loading/ButtonLoading";
import AlertText from "../ErrorElements/AlertText";
import { useLocation, useNavigate } from "react-router-dom";

type Props = {
  admin: AdminResponse;
  deleteAdminId: string;
  text?: string;
};

const DeleteAdmin = ({ admin, deleteAdminId, text }: Props) => {
  const modalId = `delete-admin-moda-${admin._id}`;
  const location = useLocation();
  const navigate = useNavigate();
  const [deleteAdmin, { isLoading, isError, error, isSuccess, data }] =
    useDeleteAdminMutation();
  const isDeleteLoading = isLoading && deleteAdminId === admin._id;
  const [apiError, setApiError] = useState<string | null>(null);

  const handleDeleteAdmin = useCallback(async () => {
    setApiError(null);
    try {
      await deleteAdmin({
        adminId: admin._id,
      }).unwrap();

      closeModal(modalId);
      if (location.pathname === `/admin/admins/${admin._id}`) {
        navigate("/admin/admins");
      }
    } catch (error) {
      console.error(error);
    }
  }, [admin._id, deleteAdmin, location.pathname, modalId, navigate]);

  useEffect(() => {
    if (isSuccess) {
      toast.success(data?.message || "Admin deleted");
    }
    if (isError && error) {
      if (isApiError(error)) {
        const errorMessage = getApiErrorMessage(error);
        setApiError(errorMessage);
        toast.error(errorMessage);
      } else {
        toast.error("Error deleting brand");
      }
    }
  }, [data?.message, error, isError, isSuccess]);

  const closeModalLocal = useCallback(() => {
    setApiError(null);
    closeModal(modalId);
  }, [modalId]);
  const openModalLocal = useCallback(() => {
    setApiError(null);
    openModal(modalId);
  }, [modalId]);

  return (
    <>
      <button
        className="btn btn-sm btn-ghost text-red-700 hover:bg-error/10"
        aria-label="Delete"
        onClick={openModalLocal}
      >
        {isDeleteLoading ? (
          text ? (
            <ButtonLoading text="Deleting" />
          ) : (
            <IconLoading />
          )
        ) : (
          <>
            <Trash2 /> {text && <span className="text-lg">{text}</span>}
          </>
        )}
      </button>

      {/* Modal */}
      <dialog id={modalId} className="modal">
        <div className="modal-box">
          {/* Close Button */}
          <button
            type="button"
            className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
            onClick={closeModalLocal}
          >
            ✕
          </button>

          {/* Modal Content */}
          <div>
            <h2 className="text-xl font-bold mb-4">
              Delete Admin: {admin.username}
            </h2>
            <p className="text-gray-600">
              Are you sure you want to delete this admin? This action cannot be
              undone.
            </p>

            {apiError && typeof apiError === "string" ? (
              <AlertText message={apiError} />
            ) : (
              <br />
            )}

            {/* Action Buttons */}
            <div className="modal-action">
              <button className="btn btn-error" onClick={handleDeleteAdmin}>
                {isDeleteLoading ? <ButtonLoading text="Deleting" /> : "Delete"}
              </button>
              <button
                className="btn btn-ghost"
                onClick={() => closeModal(modalId)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      </dialog>
    </>
  );
};

export default DeleteAdmin;

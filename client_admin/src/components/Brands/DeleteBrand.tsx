import { BrandResponse } from "@/client";
import { closeModal, openModal } from "@/utils/modal_utils";
import { Trash2 } from "lucide-react";
import ButtonLoading from "../Loading/ButtonLoading";
import IconLoading from "../Loading/IconLoading";
import { useEffect } from "react";
import { toast } from "react-toastify";
import { getApiErrorMessage, isApiError } from "@/utils/errorHandler";
import { useDeleteBrandMutation } from "@/features/brandApiSlice";

type Props = {
  brand: BrandResponse;
  deleteBrandId: string;
};

const DeleteBrand = (props: Props) => {
  const modalId = `deleteModal-${props.brand.id}`; // Unique modal ID for each brand
  const [deleteBrand, { data, isLoading, isSuccess, isError, error }] =
    useDeleteBrandMutation();

  const isDeleteLoading = isLoading && props.deleteBrandId === props.brand.id;

  const handleDeleteBrand = async () => {
    try {
      const res = await deleteBrand({ brandId: props.deleteBrandId }).unwrap();
      console.log(res);
      closeModal(modalId);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    if (isSuccess) {
      toast.success(data?.message || "Brand deleted");
    }
    if (isError && error) {
      if (isApiError(error)) {
        const errorMessage = getApiErrorMessage(error);
        toast.error(errorMessage);
      } else {
        toast.error("Error deleting brand");
      }
    }
  }, [data?.message, error, isError, isSuccess]);

  return (
    <>
      {/* Delete Button */}
      <button
        className="btn btn-sm btn-ghost text-red-700 hover:bg-error/10"
        aria-label="Delete"
        onClick={() => openModal(modalId)}
      >
        {isDeleteLoading ? <IconLoading /> : <Trash2 />}
      </button>

      {/* Modal */}
      <dialog id={modalId} className="modal">
        <div className="modal-box">
          {/* Close Button */}
          <button
            type="button"
            className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
            onClick={() => closeModal(modalId)}
          >
            ✕
          </button>

          {/* Modal Content */}
          <div>
            <h2 className="text-xl font-bold mb-4">
              Delete Brand: {props.brand.title}
            </h2>
            <p className="text-gray-600">
              Are you sure you want to delete this brand? This action cannot be
              undone.
            </p>

            {/* Action Buttons */}
            <div className="modal-action">
              <button className="btn btn-error" onClick={handleDeleteBrand}>
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

export default DeleteBrand;

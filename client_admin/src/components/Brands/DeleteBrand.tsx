import { BrandResponse } from "@/client";
import { closeModal, openModal } from "@/utils/modal_utils";
import { Trash2 } from "lucide-react";
import ButtonLoading from "../Loading/ButtonLoading";
import IconLoading from "../Loading/IconLoading";

type Props = {
  brand: BrandResponse;
  onDelete: (brandId: string) => void;
  isLoading: boolean;
  deleteBrandId: string;
};

const DeleteBrand = (props: Props) => {
  const modalId = `deleteModal-${props.brand.id}`; // Unique modal ID for each brand
  const isLoading = props.isLoading && props.deleteBrandId === props.brand.id;

  return (
    <>
      {/* Delete Button */}
      <button
        className="btn btn-sm btn-ghost text-red-700 hover:bg-error/10"
        aria-label="Delete"
        onClick={() => openModal(modalId)}
      >
        {isLoading ? <IconLoading /> : <Trash2 />}
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
              <button
                className="btn btn-error"
                onClick={() => {
                  props.onDelete(props.brand.id);
                  closeModal(modalId);
                }}
              >
                {isLoading ? <ButtonLoading text="Deleting" /> : "Delete"}
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

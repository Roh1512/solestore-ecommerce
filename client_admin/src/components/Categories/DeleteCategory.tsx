import { CategoryResponse } from "@/client";
import IconLoading from "../Loading/IconLoading";
import { closeModal, openModal } from "@/utils/modal_utils";
import ButtonLoading from "../Loading/ButtonLoading";
import { Trash2 } from "lucide-react";

type Props = {
  category: CategoryResponse;
  onDelete: (categoryId: string) => void;
  isLoading: boolean;
  deleteCategoryId: string;
};

const DeleteCategory = (props: Props) => {
  const modalId = `deleteModal=${props.category.id}`;
  const isLoading =
    props.isLoading && props.deleteCategoryId === props.category.id;

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
              Delete Brand: {props.category.title}
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
                  props.onDelete(props.category.id);
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

export default DeleteCategory;

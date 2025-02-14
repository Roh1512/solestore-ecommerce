import { closeModal, openModal } from "@/utils/modal_utils";
import { memo, useCallback } from "react";
import ProductImagesUploader from "../ImageUploader/ProductImagesUploader";
import { ProductResponse } from "@/client";

type props = {
  product: ProductResponse;
};

const AddImages = ({ product }: props) => {
  const modalId = "add-product-images-modal";
  const close = useCallback(() => closeModal(modalId), []);
  const open = useCallback(() => openModal(modalId), []);
  return (
    <>
      <button className="btn" onClick={open}>
        Add Images
      </button>

      <dialog id={modalId} className="modal">
        <div className="modal-box">
          <button
            type="button"
            className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
            onClick={close}
          >
            ✕
          </button>

          <h3 className="text-lg font-bold mb-4">Add Images</h3>
          <ProductImagesUploader productId={product.id} />
        </div>
      </dialog>
    </>
  );
};

export default memo(AddImages);

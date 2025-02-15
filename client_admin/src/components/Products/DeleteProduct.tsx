import { ProductResponse } from "@/client";
import { useDeleteProductMutation } from "@/features/productApiSlice";
import { closeModal, openModal } from "@/utils/modal_utils";
import { Trash2 } from "lucide-react";
import { memo, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

type Props = {
  product: ProductResponse;
};

const DeleteProduct = memo(({ product }: Props) => {
  const navigate = useNavigate();
  const modalId = "delete-product-modal-" + product.id;
  const close = useCallback(() => closeModal(modalId), [modalId]);
  const open = useCallback(() => openModal(modalId), [modalId]);

  const [deleteProduct, { isError, isSuccess }] = useDeleteProductMutation();

  const handleDelete = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      try {
        await deleteProduct({ productId: product.id }).unwrap();
      } catch (error) {
        console.error(error);
      }
    },
    [deleteProduct, product.id]
  );

  useEffect(() => {
    if (isError) {
      toast.error("Error deleting product");
    }
    if (isSuccess) {
      toast.success("Product deleted");
      navigate("/admin/products");
      close();
    }
  }, [close, isError, isSuccess, navigate]);

  return (
    <>
      <button
        className="btn btn-error flex items-center justify-center gap-3"
        onClick={open}
      >
        <Trash2 /> <span className="logo-text">Delete</span>
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

          <p>Are you sure you want to delete this product?</p>
          <ul>
            <li>{product.title}</li>
          </ul>

          <form onSubmit={handleDelete}>
            <div className="modal-action">
              <button className="btn" onClick={close}>
                Cancel
              </button>
              <button type="submit" className="btn btn-error">
                Yes
              </button>
            </div>
          </form>
        </div>
      </dialog>
    </>
  );
});

export default DeleteProduct;

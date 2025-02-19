import { ProductResponse } from "@/client";
import { useAddToCartMutation } from "@/features/cartApiSlice";
import {
  getApiErrorMessage,
  getValidationErrors,
  isApiError,
  isFieldValidationError,
} from "@/utils/errorHandler";
import { closeModal, openModal } from "@/utils/modal_utils";
import { Plus, XIcon } from "lucide-react";
import { memo, useCallback, useState } from "react";
import { toast } from "react-toastify";
import { z } from "zod";
import AlertText from "../ErrorElements/AlertText";
import ButtonLoading from "../Loading/ButtonLoading";

type Props = {
  product: ProductResponse;
};

const addToCartRequestSchema = z.object({
  size: z
    .number({
      required_error: "Please select size",
      invalid_type_error: "Please select size",
    })
    .min(7, "Size must be greater than or equal to 7")
    .max(12, "Size must be less than or equal to 12"),
  quantity: z
    .number({
      required_error: "Please enter quantity",
      invalid_type_error: "Quantity must be a number",
    })
    .min(1, "Minimum 1 product is to be added"),
});

const AddToCart = ({ product }: Props) => {
  const modalId = `filter-product-modal-${product.id}`;
  const [size, setSize] = useState<number | null>(null);
  const [quantity, setQuantity] = useState<number>(1);
  const [zodErrors, setZodErrors] = useState<Record<string, string>>({});
  const [apiError, setApiError] = useState<string | null>(null);
  const [addToCart, { isLoading }] = useAddToCartMutation();

  const reset = useCallback(() => {
    setSize(null);
    setQuantity(1);
    setApiError(null);
    setZodErrors({});
  }, []);

  const open = useCallback(() => {
    openModal(modalId);
    reset();
  }, [modalId, reset]);
  const close = useCallback(() => {
    closeModal(modalId);
    reset();
  }, [modalId, reset]);

  const handleAddToCart = useCallback(async () => {
    setZodErrors({});
    setApiError(null);
    if (!size && !quantity) {
      toast.error("Select size and quantity");
      setApiError("Select size and quantity");
      return;
    }
    const result = addToCartRequestSchema.safeParse({
      product_id: product.id,
      size: size,
      quantity: quantity,
    });
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
    try {
      const res = await addToCart({
        product_id: product.id,
        quantity: quantity!,
        size: size!,
      }).unwrap();
      console.log(res);
      toast.success(`${product.title} added to cart`);
      close();
    } catch (error) {
      console.error(error);
      if (error) {
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
    }
  }, [addToCart, close, product.id, product.title, quantity, size]);

  let outOfStock = product.sizes.length <= 0 ? true : false;

  if (
    product.sizes &&
    product.sizes.map((item) => {
      if (item.stock && item.stock <= 0) {
        outOfStock = true;
        return;
      }
      outOfStock = false;
    })
  )
    return (
      <>
        <button
          className="btn btn-success flex items-center gap-2"
          onClick={open}
          aria-label="Open filter options"
        >
          <Plus className="w-5 h-5" />
          Add to cart
        </button>

        <dialog id={modalId} className="modal">
          <div className="modal-box">
            <button
              type="button"
              className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
              onClick={close}
              aria-label="Close modal"
            >
              ✕
            </button>

            {/* Size Selection */}
            <div className="mb-6">
              {!outOfStock ? (
                <>
                  <h4 className="font-semibold mb-2">Select Size</h4>
                  <div className="flex flex-wrap gap-2 items-center justify-center">
                    <div className="flex flex-col items-center justify-center">
                      <span>Size: </span>
                      <span>Stock: </span>
                    </div>
                    {product.sizes?.map((sizeObj) => (
                      <div
                        key={sizeObj.size}
                        className="flex flex-col items-center justify-center"
                      >
                        <button
                          className={`btn btn-sm ${
                            size === sizeObj.size
                              ? "btn-primary"
                              : "btn-outline"
                          }`}
                          onClick={() => setSize(sizeObj.size)}
                          disabled={
                            sizeObj.stock && sizeObj.stock < 1 ? true : false
                          }
                        >
                          {sizeObj.size}
                        </button>
                        <span>{sizeObj.stock}</span>
                      </div>
                    ))}
                  </div>
                  {zodErrors.size && <AlertText message={zodErrors.size} />}
                </>
              ) : (
                <AlertText message="Out of stock" />
              )}
            </div>

            {/* Quantity Selection */}
            {!outOfStock && (
              <div className="mb-6">
                <h4 className="font-semibold mb-2">Quantity</h4>
                <div className="join">
                  <button
                    className="join-item btn"
                    onClick={() => setQuantity(Math.max(1, quantity! - 1))}
                  >
                    -
                  </button>
                  <input
                    type="number"
                    className="join-item input input-bordered w-20 text-center"
                    value={quantity!}
                    min="1"
                    onChange={(e) =>
                      setQuantity(Math.max(1, parseInt(e.target.value)))
                    }
                  />
                  <button
                    className="join-item btn"
                    onClick={() => setQuantity(quantity! + 1)}
                  >
                    +
                  </button>
                </div>
                {zodErrors.quantity && (
                  <AlertText message={zodErrors.quantity} />
                )}
              </div>
            )}

            {/* Add to Cart Button */}
            <div className="modal-action">
              {!outOfStock ? (
                <button
                  className="btn btn-primary w-full"
                  onClick={handleAddToCart}
                >
                  {isLoading ? (
                    <ButtonLoading text="Adding to cart" />
                  ) : (
                    "Add to cart"
                  )}
                </button>
              ) : (
                <button className="btn btn-error w-full" onClick={close}>
                  <XIcon />
                  Close
                </button>
              )}
            </div>
            <br />
            {apiError && typeof apiError === "string" ? (
              <AlertText message={apiError} />
            ) : (
              <br />
            )}
          </div>
        </dialog>
      </>
    );
};

export default memo(AddToCart);

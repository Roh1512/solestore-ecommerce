import { ProductResponse, ProductSizeStockRequest } from "@/client";
import { useUpdateSizeStockMutation } from "@/features/productApiSlice";
import {
  getApiErrorMessage,
  getValidationErrors,
  isApiError,
  isFieldValidationError,
} from "@/utils/errorHandler";
import { closeModal, openModal } from "@/utils/modal_utils";
import { memo, useCallback, useEffect, useState } from "react";
import { toast } from "react-toastify";
import { z } from "zod";
import AlertText from "../ErrorElements/AlertText";
import ButtonLoading from "../Loading/ButtonLoading";

type Props = {
  product: ProductResponse;
};

export const SizeSchema = z.object({
  size: z.number(), // For example, the size value (e.g., 7, 8, 9, etc.)
  stock: z.number().int().nonnegative(), // Stock must be a non-negative integer
});

const SizeStockUpdateSchema = z.object({
  sizes: z.array(SizeSchema).optional().nullable(),
});

const UpdateSizeStock = memo(({ product }: Props) => {
  const initialState =
    product.sizes && product.sizes.length > 0
      ? product.sizes
      : [
          { size: 7, stock: 0 },
          { size: 8, stock: 0 },
          { size: 9, stock: 0 },
          { size: 10, stock: 0 },
          { size: 11, stock: 0 },
          { size: 12, stock: 0 },
        ];
  const [sizeStock, setSizeStock] = useState<ProductSizeStockRequest>({
    sizes: initialState,
  });

  const [zodErrors, setZodErrors] = useState<Record<string, string>>({});
  const [apiError, setApiError] = useState<string | null>(null);

  const [updateSizeStock, { isLoading, isError, error, isSuccess }] =
    useUpdateSizeStockMutation();

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (name.startsWith("stock-")) {
      const sizeNumber = parseInt(name.split("-")[1], 10);
      const newStock = parseInt(value, 10);
      if (isNaN(newStock)) {
        // Option 1: Return early (do nothing)
        return;
      }
      setSizeStock((prev) => ({
        ...prev,
        sizes: prev.sizes?.map((item) =>
          item.size === sizeNumber ? { ...item, stock: newStock } : item
        ),
      }));
    }
  }, []);

  const handleSizeStockUpdate = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();

      const validationResult = SizeStockUpdateSchema.safeParse(sizeStock);

      if (!validationResult.success) {
        const errors: Record<string, string> = {};
        validationResult.error.errors.forEach((err) => {
          if (err.path[0]) {
            errors[err.path[0] as string] = err.message;
          }
        });
        setZodErrors(errors);
        return;
      }

      try {
        await updateSizeStock({
          productId: product.id,
          body: sizeStock,
        }).unwrap();
      } catch (error) {
        console.error(error);
      }
    },
    [product.id, sizeStock, updateSizeStock]
  );

  useEffect(() => {
    if (isError && error) {
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
        setApiError(errorMessage);
      } else {
        setApiError("Error adding product");
      }
    }
    if (isSuccess) {
      toast.success("Sizes and stock updated");
    }
  }, [error, isError, isSuccess]);

  const modalId = "update-product-size-stock";
  const open = () => openModal(modalId);
  const close = () => closeModal(modalId);
  return (
    <>
      <button className="btn" onClick={open}>
        Update Size and Stock
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
          <h3 className="mb-4">Update Size and Stock</h3>

          <form onSubmit={handleSizeStockUpdate}>
            <fieldset disabled={isLoading}>
              {sizeStock.sizes.map((item) => (
                <div
                  key={item.size}
                  className="flex items-center gap-2 mb-2 justify-center"
                >
                  <span className="w-16">Size {item.size}:</span>
                  <input
                    type="number"
                    name={`stock-${item.size}`}
                    value={item.stock === 0 ? "" : item.stock}
                    className="input input-bordered w-24"
                    onChange={handleChange}
                  />
                </div>
              ))}
              {zodErrors.sizes && <AlertText message={zodErrors.sizes} />}
            </fieldset>
            <button type="submit" className="btn btn-neutral">
              {isLoading ? <ButtonLoading text="Updating" /> : "Update"}
            </button>
          </form>
          {apiError && typeof apiError === "string" && (
            <AlertText message={apiError} />
          )}
        </div>
      </dialog>
    </>
  );
});

export default UpdateSizeStock;

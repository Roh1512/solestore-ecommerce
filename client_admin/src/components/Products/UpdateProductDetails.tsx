import { ProductDetailsRequest, ProductResponse } from "@/client";
import { useUpdateProductDetailsMutation } from "@/features/productApiSlice";
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
import CategorySelect from "./CategorySelect";
import BrandSelect from "./BrandSelect";
import AlertMessage from "../ErrorElements/AlertMessage";
import ButtonLoading from "../Loading/ButtonLoading";

type Props = {
  product: ProductResponse;
};

const productDetailsUpdateSchema = z.object({
  title: z.string().trim().nonempty({ message: "Title is required" }),
  description: z
    .string()
    .trim()
    .min(5, { message: "Description must be at least 5 characters long" })
    .optional()
    .nullable(),
  price: z.number().gt(0, { message: "Price must be greater than 0" }),
  brand: z.string().trim().nonempty({ message: "Brand ID is required" }),
  category: z.string().trim().nonempty({ message: "Category ID is required" }),
});

const UpdateProductDetails = memo(({ product }: Props) => {
  const modalId = "update-product-details";
  const close = () => closeModal(modalId);
  const open = () => openModal(modalId);

  const initialState: ProductDetailsRequest = {
    title: product.title || "",
    description: product.description || "",
    price: product.price || 0,
    brand: product.brand.id || "",
    category: product.category.id || "",
  };

  const [productDetails, setProductDetails] =
    useState<ProductDetailsRequest>(initialState);

  const [zodErrors, setZodErrors] = useState<Record<string, string>>({});
  const [apiError, setApiError] = useState<string | null>(null);

  const [updateDetails, { isLoading, isError, error, isSuccess }] =
    useUpdateProductDetailsMutation();

  const resetErrors = useCallback(() => {
    setZodErrors({});
    setApiError(null);
  }, []);

  const handleBrandChange = useCallback((brandId: string) => {
    setProductDetails((prev) => ({ ...prev, brand: brandId }));
  }, []);

  const handleCategoryChange = useCallback((categoryId: string) => {
    setProductDetails((prev) => ({ ...prev, category: categoryId }));
  }, []);

  const handleDetailsChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const { name, value } = e.target;
      if (name === "price") {
        setProductDetails((prev) => ({ ...prev, price: parseFloat(value) }));
      } else {
        setProductDetails((prev) => ({
          ...prev,
          [name]: value,
        }));
      }
    },
    []
  );

  const handleProductUpdate = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      resetErrors();
      const validationResult =
        productDetailsUpdateSchema.safeParse(productDetails);
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
        await updateDetails({
          productId: product.id,
          body: productDetails,
        }).unwrap();
        close();
      } catch (error) {
        console.error(error);
      }
    },
    [product.id, productDetails, resetErrors, updateDetails]
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
      toast.success("Product details updated");
    }
  }, [error, isError, isSuccess]);

  return (
    <>
      <button className="btn" onClick={open}>
        Edit Product Details
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
          <h3 className="mb-4">Edit Product Details</h3>

          <form onSubmit={handleProductUpdate}>
            <fieldset>
              <div>
                <label htmlFor="title" className="block font-medium mb-1">
                  Title *
                </label>
                <input
                  id="title"
                  name="title"
                  type="text"
                  value={productDetails.title || ""}
                  onChange={handleDetailsChange}
                  className="input input-bordered w-full"
                />
                {zodErrors.title && <AlertText message={zodErrors.title} />}
              </div>

              {/* Description */}
              <div>
                <label htmlFor="description" className="block font-medium mb-1">
                  Description
                </label>
                <input
                  id="description"
                  name="description"
                  type="text"
                  value={productDetails.description || ""}
                  onChange={handleDetailsChange}
                  className="input input-bordered w-full"
                />
                {zodErrors.description && (
                  <AlertText message={zodErrors.description} />
                )}
              </div>

              {/* Price */}
              <div>
                <label htmlFor="price" className="block font-medium mb-1">
                  Price *
                </label>
                <input
                  id="price"
                  name="price"
                  type="number"
                  value={productDetails.price || 0}
                  onChange={handleDetailsChange}
                  className="input input-bordered w-full"
                />
                {zodErrors.price && <AlertText message={zodErrors.price} />}
              </div>

              {/* Category */}
              <div>
                <label htmlFor="category" className="block font-medium mb-1">
                  Category *
                </label>
                <CategorySelect
                  value={productDetails.category || ""}
                  onChange={handleCategoryChange}
                  error={zodErrors.category}
                />
              </div>

              {/* Brand */}
              <div>
                <label htmlFor="brand" className="block font-medium mb-1">
                  Brand *
                </label>
                <BrandSelect
                  onChange={handleBrandChange}
                  value={productDetails.brand || ""}
                  error={zodErrors.brand}
                />
              </div>

              <button className="btn btn-primary mt-2" disabled={isLoading}>
                {isLoading ? <ButtonLoading text="Saving" /> : "Edit Product"}
              </button>
            </fieldset>

            <br />
            {apiError && typeof apiError === "string" && (
              <AlertMessage message={apiError} />
            )}
          </form>
        </div>
      </dialog>
    </>
  );
});

export default UpdateProductDetails;

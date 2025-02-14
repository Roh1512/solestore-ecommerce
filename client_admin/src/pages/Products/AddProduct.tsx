import { ProductCreateRequest } from "@/client";
import BackButton from "@/components/Buttons/BackButton";
import AlertMessage from "@/components/ErrorElements/AlertMessage";
import AlertText from "@/components/ErrorElements/AlertText";
import ButtonLoading from "@/components/Loading/ButtonLoading";
import BrandSelect from "@/components/Products/BrandSelect";
import CategorySelect from "@/components/Products/CategorySelect";
import { useAddProductMutation } from "@/features/productApiSlice";
import {
  getApiErrorMessage,
  getValidationErrors,
  isApiError,
  isFieldValidationError,
} from "@/utils/errorHandler";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { z } from "zod";

// Zod Schemas (for reference)
export const SizeSchema = z.object({
  size: z.number(), // For example, the size value (e.g., 7, 8, 9, etc.)
  stock: z.number().int().nonnegative(), // Stock must be a non-negative integer
});

export const ProductCreateRequestSchema = z.object({
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
  sizes: z.array(SizeSchema).optional().nullable(),
});

const AddProduct = () => {
  const navigate = useNavigate();
  // Initial state for a new product
  const initialState = useMemo<ProductCreateRequest>(
    () => ({
      title: "",
      description: "",
      price: 0,
      category: "",
      brand: "",
      sizes: [
        { size: 7, stock: 0 },
        { size: 8, stock: 0 },
        { size: 9, stock: 0 },
        { size: 10, stock: 0 },
        { size: 11, stock: 0 },
        { size: 12, stock: 0 },
      ],
    }),
    []
  );

  const [productDetails, setProductDetails] =
    useState<ProductCreateRequest>(initialState);
  const [zodErrors, setZodErrors] = useState<Record<string, string>>({});
  const [apiError, setApiError] = useState<string | null>(null);

  const [addProduct, { isLoading, isError, error, isSuccess, data }] =
    useAddProductMutation();

  const resetErrors = useCallback(() => {
    setZodErrors({});
    setApiError(null);
  }, []);

  const resetForm = useCallback(() => {
    setProductDetails(initialState);
  }, [initialState]);

  const handleCategoryChange = useCallback((categoryId: string) => {
    setProductDetails((prev) => ({ ...prev, category: categoryId }));
  }, []);
  const handleBrandChange = useCallback((brandId: string) => {
    setProductDetails((prev) => ({ ...prev, brand: brandId }));
  }, []);

  // Handle change for both top-level fields and size stocks.
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    if (zodErrors || apiError) {
      resetErrors();
    }

    // If the input is for a size stock, the name will be in the format "stock-<size>"
    if (name.startsWith("stock-")) {
      const sizeNumber = parseInt(name.split("-")[1], 10);
      const newStock = parseInt(value, 10);
      setProductDetails((prev) => ({
        ...prev,
        sizes: prev.sizes?.map((item) =>
          item.size === sizeNumber ? { ...item, stock: newStock } : item
        ),
      }));
    } else if (name === "price") {
      // Convert price to a number
      setProductDetails((prev) => ({
        ...prev,
        price: parseFloat(value),
      }));
    } else {
      // Update other top-level fields: title, description, category, brand.
      setProductDetails((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleProductAdd = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      resetErrors();

      const validationResult =
        ProductCreateRequestSchema.safeParse(productDetails);

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
        await addProduct(productDetails).unwrap();
      } catch (error) {
        console.error(error);
      }
    },
    [addProduct, productDetails, resetErrors]
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
      resetForm();
      toast.success("Product added");
      navigate(`/admin/products/${data.id}`);
    }
  }, [data?.id, error, isError, isSuccess, navigate, resetForm]);

  return (
    <div className="w-full flex flex-col items-start p-4">
      <BackButton />
      <div className="container max-w-2xl mx-auto">
        <h3 className="text-2xl font-bold mb-6">Add Product</h3>
        <form onSubmit={handleProductAdd}>
          {/* Title */}
          <fieldset className="space-y-4" disabled={isLoading}>
            <div>
              <label htmlFor="title" className="block font-medium mb-1">
                Title *
              </label>
              <input
                id="title"
                name="title"
                type="text"
                value={productDetails.title}
                onChange={handleChange}
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
                onChange={handleChange}
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
                value={productDetails.price}
                onChange={handleChange}
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
                value={productDetails.category}
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
                value={productDetails.brand}
                error={zodErrors.brand}
              />
            </div>

            {/* Sizes & Stocks */}
            <div>
              <label className="block font-medium mb-2">
                Sizes and Stocks *
              </label>
              {zodErrors.sizes && <AlertText message={zodErrors.sizes} />}
              {productDetails.sizes?.map((item) => (
                <div key={item.size} className="flex items-center gap-2 mb-2">
                  <span className="w-16">Size {item.size}:</span>
                  <input
                    type="number"
                    name={`stock-${item.size}`}
                    value={item.stock}
                    onChange={handleChange}
                    className="input input-bordered w-24"
                  />
                </div>
              ))}
            </div>

            <br />
            {apiError && typeof apiError === "string" && (
              <AlertMessage message={apiError} />
            )}
            <button className="btn btn-primary" disabled={isLoading}>
              {isLoading ? <ButtonLoading text="Adding" /> : "Add Product"}
            </button>
          </fieldset>
        </form>
      </div>
    </div>
  );
};

export default AddProduct;

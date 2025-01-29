import { PenLine, Plus } from "lucide-react";
import { closeModal, openModal } from "@/utils/modal_utils";
import { useCreateCategoryMutation } from "@/features/categoryApiSlice";
import { useCallback, useEffect, useMemo, useState, memo } from "react";
import { CategoryCreateRequest } from "@/client";
import {
  getApiErrorMessage,
  getValidationErrors,
  isApiError,
  isFieldValidationError,
} from "@/utils/errorHandler";
import ButtonLoading from "../Loading/ButtonLoading";
import AlertText from "../ErrorElements/AlertText";
import AlertMessage from "../ErrorElements/AlertMessage";
import { z } from "zod";
import { toast } from "react-toastify";
import SuccessText from "../SuccessElements/SuccessText";

const addCategorySchema = z.object({
  title: z.string().min(1, { message: "Title is required" }),
});

const AddCategory = () => {
  const modalId = "add-category-modal";

  const initialCategory = useMemo(() => {
    return { title: "" };
  }, []);
  const [categoryDetails, setCategoryDetails] =
    useState<CategoryCreateRequest>(initialCategory);

  const [zodErrors, setZodErrors] = useState<Record<string, string>>({});

  const [apiError, setApiError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const [createCategory, { isLoading, isError, error, isSuccess, data }] =
    useCreateCategoryMutation();

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setApiError(null);
    setSuccessMessage(null);
    const { name, value } = e.target;
    setCategoryDetails((prev) => ({
      ...prev,
      [name]: value === "" ? null : value,
    }));
  }, []);

  const resetForm = useCallback(() => {
    setCategoryDetails(initialCategory);
    setZodErrors({});
    setApiError(null);
    setSuccessMessage(null);
  }, [initialCategory]);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setZodErrors({});
      setApiError(null);
      setSuccessMessage(null);

      const validationResult = addCategorySchema.safeParse(categoryDetails);

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
        const response = await createCategory(categoryDetails).unwrap();
        console.log("Category add response: ", response);
        resetForm();
      } catch (error) {
        console.error("Error adding category: ", error);
      }
    },
    [categoryDetails, createCategory, resetForm]
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
        setApiError("Error adding category");
      }
    }
    if (isSuccess) {
      setSuccessMessage(`Added category: ${data?.title}`);
      toast.success(`Added category: ${data?.title}`);
    }
  }, [data?.title, error, isError, isSuccess]);

  useEffect(() => {
    if (zodErrors) {
      const firstErrorField = Object.keys(zodErrors)[0];
      if (firstErrorField) {
        document.getElementById(firstErrorField)?.focus();
      }
    }
  }, [zodErrors]);

  return (
    <>
      <button
        className="btn bg-green-900 hover:bg-green-700 shadow-slate-700 shadow-md text-white fixed bottom-7 right-6 text-lg font-bold"
        onClick={() => {
          openModal(modalId);
        }}
      >
        {isLoading ? (
          <ButtonLoading text="Creating" />
        ) : (
          <>
            <span>Add New</span> <Plus className="w-6 h-6" />
          </>
        )}
      </button>

      <dialog id={modalId} className="modal">
        <div className="modal-box">
          <button
            type="button"
            className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
            onClick={() => {
              resetForm();
              closeModal(modalId);
            }}
          >
            ✕
          </button>

          <h3>Add Category</h3>

          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label
                htmlFor="title"
                className="input input-bordered flex items-center gap-2"
              >
                <PenLine />
                <input
                  type="text"
                  id="title"
                  name="title"
                  className="grow"
                  placeholder="Enter Category title"
                  // value={brandDetails.title || ""}
                  // onChange={handleChange}
                  value={categoryDetails.title}
                  onChange={handleChange}
                  disabled={isLoading}
                />
              </label>
              {zodErrors.title && <AlertText message={zodErrors.title} />}
            </div>

            {apiError && typeof apiError === "string" && (
              <AlertMessage message={apiError} />
            )}

            {successMessage && typeof successMessage === "string" && (
              <SuccessText message={successMessage} />
            )}

            {!successMessage && !apiError && <br />}

            <button
              type="submit"
              className="mt-3 btn btn-primary w-full"
              disabled={isLoading}
            >
              {isLoading ? <ButtonLoading text="Adding" /> : "Save changes"}
            </button>
          </form>
        </div>
      </dialog>
    </>
  );
};

export default memo(AddCategory);

import { CategoryResponse, CategoryCreateRequest } from "@/client";
import { useEditCategoryMutation } from "@/features/categoryApiSlice";
import {
  getApiErrorMessage,
  getValidationErrors,
  isApiError,
  isFieldValidationError,
} from "@/utils/errorHandler";
import { closeModal, openModal } from "@/utils/modal_utils";
import React, { memo, useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify/unstyled";
import { z } from "zod";
import ButtonLoading from "../Loading/ButtonLoading";
import AlertMessage from "../ErrorElements/AlertMessage";
import AlertText from "../ErrorElements/AlertText";
import { Edit, PenLine } from "lucide-react";
import IconLoading from "../Loading/IconLoading";

type Props = {
  category: CategoryResponse;
  editCategoryId: string;
};

const editCategorySchema = z.object({
  title: z.string().min(1, { message: "Title is required" }),
});

const EditCategory = (props: Props) => {
  const modalId = `editModal-${props.category.id}`;
  const initialCategory = useMemo(() => {
    return {
      title: props?.category?.title || "",
    };
  }, [props?.category]);
  const [categoryDetails, setCategoryDetails] =
    useState<CategoryCreateRequest>(initialCategory);

  const [zodErrors, setZodErrors] = useState<Record<string, string>>({});

  const [apiError, setApiError] = useState<string | null>(null);

  const [editCategory, { isLoading, isError, error }] =
    useEditCategoryMutation();

  const resetForm = useCallback(() => {
    setCategoryDetails(initialCategory);
    setZodErrors({});
    setApiError(null);
  }, [initialCategory]);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setApiError(null);
    const { name, value } = e.target;
    setCategoryDetails((prev) => ({
      ...prev,
      [name]: value === "" ? null : value,
    }));
  }, []);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.stopPropagation();
      e.preventDefault();
      setZodErrors({});
      setApiError(null);

      if (categoryDetails === initialCategory) {
        toast.info("No change detected");
        closeModal(modalId);
      }

      const validationResult = editCategorySchema.safeParse(categoryDetails);

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
        const response = await editCategory({
          categoryId: props.category.id,
          data: categoryDetails,
        }).unwrap();
        closeModal(modalId);
        resetForm();
        console.log("Category edit response: ", response);
      } catch (error) {
        console.error("Error editing category: ", error);
      }
    },
    [
      categoryDetails,
      editCategory,
      initialCategory,
      modalId,
      props.category.id,
      resetForm,
    ]
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
        setApiError("Error editing category");
      }
    }
  }, [error, isError]);

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
        className="btn btn-sm btn-ghost text-blue-600 hover:bg-error/10"
        aria-label="Delete"
        onClick={() => {
          resetForm();
          openModal(modalId);
        }}
      >
        {isLoading ? <IconLoading /> : <Edit />}
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
          <h3>Edit Brand</h3>
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
                  placeholder="Enter Brand title"
                  value={categoryDetails.title || ""}
                  onChange={handleChange}
                  disabled={isLoading}
                />
              </label>
              {zodErrors.title && <AlertText message={zodErrors.title} />}
            </div>

            {apiError && typeof apiError === "string" && (
              <AlertMessage message={apiError} />
            )}

            <button
              type="submit"
              className="mt-3 btn btn-primary w-full"
              disabled={isLoading}
            >
              {isLoading ? <ButtonLoading text="Updating" /> : "Save changes"}
            </button>
          </form>
        </div>
      </dialog>
    </>
  );
};

export default memo(EditCategory);

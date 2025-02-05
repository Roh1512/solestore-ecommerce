import { BrandCreateRequest, BrandResponse } from "@/client";
import { closeModal, openModal } from "@/utils/modal_utils";
import { Edit, PenLine } from "lucide-react";
import ButtonLoading from "../Loading/ButtonLoading";
import IconLoading from "../Loading/IconLoading";
import { z } from "zod";
import { memo, useCallback, useEffect, useMemo, useState } from "react";
import { useEditBrandMutation } from "@/features/brandApiSlice";
import { toast } from "react-toastify";
import {
  getApiErrorMessage,
  getValidationErrors,
  isApiError,
  isFieldValidationError,
} from "@/utils/errorHandler";
import AlertText from "../ErrorElements/AlertText";

type Props = {
  brand: BrandResponse;
  editBrandId: string;
};

const editBrandSchema = z.object({
  title: z.string().min(1, { message: "Title is required" }).nullable(),
});

const EditBrand = (props: Props) => {
  const modalId = `editModal-${props.brand.id}`;
  const initialBrand = useMemo(() => {
    return {
      title: props?.brand?.title || "",
    };
  }, [props?.brand]);
  const [brandDetails, setBrandDetails] =
    useState<BrandCreateRequest>(initialBrand);

  const [zodErrors, setZodErrors] = useState<Record<string, string>>({});

  const [apiError, setApiError] = useState<string | null>(null);

  const [editBrand, { isLoading, isError, error }] = useEditBrandMutation();

  const resetForm = useCallback(() => {
    setBrandDetails(initialBrand);
    setZodErrors({});
    setApiError(null);
  }, [initialBrand]);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setApiError(null);
    const { name, value } = e.target;
    setBrandDetails((prev) => ({
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

      if (brandDetails === initialBrand) {
        toast.info("No change detected");
        closeModal(modalId);
        return;
      }

      const validationResult = editBrandSchema.safeParse(brandDetails);

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
        const response = await editBrand({
          brandId: props.brand.id,
          data: brandDetails,
        }).unwrap();
        console.log("Brand edit response: ", response);
        closeModal(modalId);
        resetForm();
      } catch (error) {
        console.error("Error editing brand: ", error);
      }
    },
    [brandDetails, editBrand, initialBrand, modalId, props.brand.id, resetForm]
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
        setApiError("Error editing brand");
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
                  value={brandDetails.title || ""}
                  onChange={handleChange}
                  disabled={isLoading}
                  required
                />
              </label>
              {zodErrors.title && <AlertText message={zodErrors.title} />}
            </div>

            {apiError && typeof apiError === "string" && (
              <AlertText message={apiError} />
            )}

            {apiError ? null : <br />}

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

export default memo(EditBrand);

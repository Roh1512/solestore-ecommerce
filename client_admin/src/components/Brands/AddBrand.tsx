import { BrandCreateRequest } from "@/client";
import { useCreateBrandMutation } from "@/features/brandApiSlice";
import {
  getApiErrorMessage,
  getValidationErrors,
  isApiError,
  isFieldValidationError,
} from "@/utils/errorHandler";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { z } from "zod";
import ButtonLoading from "../Loading/ButtonLoading";
import AlertMessage from "../ErrorElements/AlertMessage";
import AlertText from "../ErrorElements/AlertText";
import { PenLine, Plus } from "lucide-react";
import { closeModal, openModal } from "@/utils/modal_utils";

const addBrandSchema = z.object({
  title: z.string().min(1, { message: "Title is required" }),
});

const AddBrand = () => {
  const modalId = "add-brand-modal";
  const initialBrand = {
    title: "",
  };
  const [brandDetails, setBrandDetails] =
    useState<BrandCreateRequest>(initialBrand);

  const [zodErrors, setZodErrors] = useState<Record<string, string>>({});

  const [apiError, setApiError] = useState<string | null>(null);

  const [createBrand, { isLoading, isError, error, isSuccess, data }] =
    useCreateBrandMutation();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setApiError(null);
    const { name, value } = e.target;
    setBrandDetails((prev) => ({
      ...prev,
      [name]: value === "" ? null : value,
    }));
  };

  const resetForm = () => {
    setBrandDetails(initialBrand);
    setZodErrors({});
    setApiError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setZodErrors({});
    setApiError(null);

    const validationResult = addBrandSchema.safeParse(brandDetails);

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
      const response = await createBrand(brandDetails).unwrap;
      console.log("Brand add response: ", response);
      resetForm();
    } catch (error) {
      console.error("Error adding brand: ", error);
    }
  };

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
        setApiError("Error adding brand");
      }
    }
    if (isSuccess) {
      toast.success(`Added brand: ${data?.title}`);
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

          <h3>Add Brand</h3>

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
                  // value={brandDetails.title || ""}
                  // onChange={handleChange}
                  value={brandDetails.title}
                  onChange={handleChange}
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
              {isLoading ? <ButtonLoading text="Adding" /> : "Save changes"}
            </button>
          </form>
        </div>
      </dialog>
    </>
  );
};

export default AddBrand;

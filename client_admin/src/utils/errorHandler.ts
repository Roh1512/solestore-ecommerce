import {
  ValidationErrorDisplay,
  ApiError,
  FieldValidationError,
} from "@/types/errorTypes";

export const isApiError = (error: unknown): error is ApiError => {
  return (
    typeof error === "object" &&
    error !== null &&
    "data" in error &&
    typeof (error as ApiError).data &&
    "detail" in (error as ApiError).data &&
    typeof (error as ApiError).data.detail === "string"
  );
};

export const isFieldValidationError = (
  error: unknown
): error is FieldValidationError => {
  return (
    typeof error === "object" &&
    error !== null &&
    "data" in error &&
    typeof (error as FieldValidationError).data === "object" &&
    "detail" in (error as FieldValidationError).data
  );
};

export const getValidationErrors = (
  error: unknown
): ValidationErrorDisplay[] => {
  if (isFieldValidationError(error)) {
    if (error?.data?.detail && Array.isArray(error.data.detail)) {
      return error.data.detail.map((validationError) => {
        // Extract the last element in loc as the field name
        const field = Array.isArray(validationError.loc)
          ? validationError.loc[validationError.loc.length - 1] // Get the last element of the loc array
          : "unknown";

        return {
          field: String(field), // Convert the field to a string
          message: validationError.msg, // The validation error message
        };
      });
    }
  }

  return [];
};

export const getApiErrorMessage = (error: unknown): string | null => {
  if (isApiError(error)) {
    return error.data.detail; // Extract the detail message from the API error
  }
  return null; // Return null if the error doesn't match the ApiError structure
};

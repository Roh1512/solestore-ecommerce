import { ValidationError } from "../client";

interface ApiError {
  data: {
    detail: string;
    status: number;
  };
}

interface FieldValidationError {
  data: {
    detail: ValidationError[];
    status: number;
  };
}

interface ValidationErrorDisplay {
  field: string;
  message: string;
}

export type { ApiError, FieldValidationError, ValidationErrorDisplay };

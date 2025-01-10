from pydantic import BaseModel
from typing import List


class ErrorDetails(BaseModel):
    field: str
    messages: List[str]


class ValidationErrorResponse(BaseModel):
    detail: List[ErrorDetails]

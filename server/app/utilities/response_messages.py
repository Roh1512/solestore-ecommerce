from fastapi.responses import JSONResponse


def success_response(
    message: str,
    status: str = "success",
    status_code: int = 200
) -> JSONResponse:
    """
    Utility function to generate a custom success response in FastAPI.

    Args:
        message (str): The success message.
        data (Any, optional): Any data to return in the response (default is None).
        status (str): Status of the response (default is "success").
        status_code (int): The HTTP status code (default is 200).

    Returns:
        JSONResponse: The formatted JSON response with the provided details.
    """
    response_content = {
        "message": message,
        "status": status,
    }

    return JSONResponse(content=response_content, status_code=status_code)

from cloudinary.uploader import upload, destroy
from cloudinary.exceptions import Error as CloudinaryError
from fastapi import HTTPException, status

from PIL import Image
import io

# For asynchronous image upload to cloudinary
from asyncio import get_event_loop
from functools import partial


async def validate_image(file: bytes) -> bool:
    """
    Validate whether the uploaded file is an image.

    :param file: File bytes
    :return: True if the file is an image, False otherwise
    """
    try:
        with Image.open(io.BytesIO(file)) as img:
            return img.format.lower() in ["jpeg", "png", "gif", "bmp", "tiff"]
    except Exception as e:
        print("Validate Image error: ", e)
        return False


async def update_profile_image(file: bytes, folder: str = "solestore_ecommerce_app/users"):
    """
        Upload an image to Cloudinary.

        :param file: Image file bytes
        :param folder: Folder path in Cloudinary
        :return: Cloudinary upload response
        """

    if not await validate_image(file):
        raise ValueError(
            "Invalid file type. Only image files are allowed.")

    try:
        loop = get_event_loop()
        upload_func = partial(
            upload,
            file,
            folder=folder,
            resource_type="image"
        )
        result = await loop.run_in_executor(
            None, upload_func
        )
        return result
    except CloudinaryError as e:
        print(f"Error updating profile image to cloudinary: {e}")
        raise HTTPException(
            status_code=status.HTTP_417_EXPECTATION_FAILED,
            detail="Error updating prfoile image"
        ) from e


async def delete_image_from_cloudinary(public_id: str):
    """
    Delete an image from Cloudinary.

    :param public_id: The Cloudinary public ID of the image
    :return: Cloudinary deletion response
    """
    try:
        loop = get_event_loop()
        delete_func = partial(destroy, public_id)
        result = await loop.run_in_executor(None, delete_func)
        return result
    except CloudinaryError as e:
        print(f"Error deleting image from cloudinary: {e}")
        raise HTTPException(
            status_code=status.HTTP_417_EXPECTATION_FAILED,
            detail="Error updating prfoile image"
        ) from e

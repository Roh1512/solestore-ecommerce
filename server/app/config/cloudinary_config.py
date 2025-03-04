import cloudinary
import cloudinary.uploader
from app.config.env_settings import get_settings

settings = get_settings()

# Configuration
cloudinary.config(
    cloud_name=settings.CLOUDINARY_CLOUD_NAME,
    api_key=settings.CLOUDINARY_API_KEY,
    # Click 'View API Keys' above to copy your API secret
    api_secret=settings.CLOUDINARY_API_SECRET,
)

# # Upload an image
# upload_result = cloudinary.uploader.upload("https://res.cloudinary.com/demo/image/upload/getting-started/shoes.jpg",
#                                            public_id="shoes")
# print(upload_result["secure_url"])

# # Optimize delivery by resizing and applying auto-format and auto-quality
# optimize_url, _ = cloudinary_url("shoes", fetch_format="auto", quality="auto")
# print(optimize_url)

# # Transform the image: auto-crop to square aspect_ratio
# auto_crop_url, _ = cloudinary_url(
#     "shoes", width=500, height=500, crop="auto", gravity="auto")
# print(auto_crop_url)

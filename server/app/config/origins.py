'''CORS ORIGINS'''

from app.config.env_settings import settings

originsURLS = [
    "http://localhost:5173",
    "http://localhost:5174",
    "http://localhost:8000",
    "http://127.0.0.1:8000"
]

origins = ["https://solestore-ecommerce-3e19.onrender.com"] if settings.ENVIRONMENT == "production" else originsURLS

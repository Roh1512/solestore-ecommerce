from pydantic_settings import BaseSettings, SettingsConfigDict
from functools import lru_cache


class Settings(BaseSettings):
    SAMPLE: str = "sample"
    MONGODB_URI: str
    DATABASE_NAME: str
    SECRET_KEY: str
    ALGORITHM: str
    DATABASE_TESTING: str
    CLOUDINARY_CLOUD_NAME: str
    CLOUDINARY_API_KEY: str
    CLOUDINARY_API_SECRET: str
    ADMIN_REFRESH_COOKIE_NAME: str
    USER_REFRESH_COOKIE_NAME: str
    ENVIRONMENT: str
    GOOGLE_CLIENT_ID: str
    GOOGLE_CLIENT_SECRET: str

    model_config = SettingsConfigDict(env_file=".env")


@lru_cache
def get_settings():
    return Settings()


settings = get_settings()

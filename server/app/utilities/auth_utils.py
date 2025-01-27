from fastapi.security import OAuth2PasswordBearer
from app.model.user import User
from app.utilities.password_utils import verify_password
from datetime import datetime, timedelta, timezone
from app.config.env_settings import get_settings
import jwt
from jwt.exceptions import InvalidTokenError, ExpiredSignatureError
from typing import Annotated
from fastapi import HTTPException, status, Depends, Request, Response
from app.crud.user_crud import get_user_details, refresh_token_is_saved

settings = get_settings()

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login")


async def authenticate_user(email, password):
    user = await User.find_one(User.email == email)
    if not user:
        return False
    if not verify_password(password, user.password):
        return False
    return user


async def create_access_token(data: dict, expires_delta: timedelta | None = None) -> str:
    to_encode = data.copy()

    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(seconds=5)
    to_encode.update({"exp": expire})

    encoded_jwt = jwt.encode(
        to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
    return encoded_jwt


async def create_refresh_token(data: dict, expires_delta: timedelta | None = None) -> str:
    to_encode = data.copy()

    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(days=30)
    to_encode.update({"exp": expire})

    encoded_jwt = jwt.encode(
        to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
    return encoded_jwt


async def get_current_user(token: Annotated[str, Depends(oauth2_scheme)], request: Request, response: Response):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Unauthorized",
        headers={"WWW-Authenticate": "Bearer"},
    )

    async def invalidate_token():
        response.delete_cookie(settings.USER_REFRESH_COOKIE_NAME)
        raise credentials_exception
    try:
        refresh_token = request.cookies.get(settings.USER_REFRESH_COOKIE_NAME)
        if not refresh_token:
            raise credentials_exception
        refresh_payload = jwt.decode(
            refresh_token, settings.SECRET_KEY, algorithms=[
                settings.ALGORITHM]
        )
        refresh_user_id = refresh_payload.get("sub")
        if not refresh_user_id or not await refresh_token_is_saved(str(refresh_user_id), refresh_token):
            await invalidate_token()

        payload = jwt.decode(
            token, settings.SECRET_KEY,
            algorithms=[settings.ALGORITHM]
        )
        user_id: str = payload.get("sub")
        if not user_id or user_id != refresh_user_id:
            await invalidate_token()

        user = await get_user_details(user_id)
        if not user:
            await invalidate_token()
        return user
    except ExpiredSignatureError:
        await invalidate_token()
    except InvalidTokenError:
        await invalidate_token()

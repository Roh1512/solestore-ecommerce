from fastapi.security import OAuth2PasswordBearer
from app.admin_app.admin_models.admin import Admin
from datetime import datetime, timedelta, timezone
from app.config.env_settings import settings
import jwt
from jwt.exceptions import InvalidTokenError, ExpiredSignatureError
from typing import Annotated
from fastapi import HTTPException, status, Depends, Request, Response
from app.admin_app.admin_crud_operations.admin_crud import get_admin_details, admin_refresh_token_is_saved

admin_oauth2_scheme = OAuth2PasswordBearer("/api/admin/login")


async def get_current_admin(token: Annotated[str, Depends(admin_oauth2_scheme)], request: Request, response: Response):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Unauthorized",
        headers={"WWW-Authenticate": "Bearer"},
    )

    async def invalidate_token():
        response.delete_cookie(settings.ADMIN_REFRESH_COOKIE_NAME)
        raise credentials_exception

    try:
        refresh_token = request.cookies.get(settings.ADMIN_REFRESH_COOKIE_NAME)
        if not refresh_token:
            raise credentials_exception
        refresh_payload = jwt.decode(
            refresh_token,
            settings.SECRET_KEY,
            algorithms=[settings.ALGORITHM]
        )
        refresh_admin_id = refresh_payload.get("sub")
        if not refresh_admin_id or not await admin_refresh_token_is_saved(str(refresh_admin_id), refresh_token):
            await invalidate_token()

        payload = jwt.decode(
            token,
            settings.SECRET_KEY,
            algorithms=[settings.ALGORITHM]
        )

        admin_id: str = payload.get("sub")
        if not admin_id or admin_id != refresh_admin_id:
            await invalidate_token()

        admin = await get_admin_details(admin_id)

        if not admin:
            await invalidate_token()

        return admin
    except ExpiredSignatureError:
        await invalidate_token()
    except InvalidTokenError:
        await invalidate_token()

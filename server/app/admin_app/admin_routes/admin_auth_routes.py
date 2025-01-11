from fastapi import APIRouter, HTTPException, status, Depends, Response, Request
from app.admin_app.admin_crud_operations.admin_crud import create_admin, add_admin_refresh_token, remove_admin_refresh_token, remove_all_admin_refresh_token, admin_refresh_token_is_saved, get_admin_details
from app.admin_app.admin_models.admin import Admin, AdminResponse, AdminCreateRequest, AdminRole
from app.model.auth_models import Token
from app.utilities.password_utils import verify_password
from app.utilities.auth_utils import create_access_token, create_refresh_token
from beanie.operators import Or
from fastapi.security import OAuth2PasswordRequestForm
from app.admin_app.admin_utilities.admin_auth_utils import get_current_admin

from typing import Annotated
import jwt
from jwt.exceptions import InvalidTokenError, ExpiredSignatureError
from app.config.env_settings import settings


router = APIRouter()


@router.post(
    "/register", response_model=AdminResponse,
    status_code=status.HTTP_201_CREATED,
    description="Create a new admin and sign up"
)
async def create_new_admin(admin: AdminCreateRequest):
    try:
        existing_admin = await Admin.find_one(
            Or(Admin.username == admin.username,
               Admin.email == admin.email)
        )
        if existing_admin:
            print("Admin already exists")
            raise HTTPException(status_code=400, detail="Admin already exists")
        admin_data_dict = admin.model_dump()
        created_admin = await create_admin(admin_data_dict)
        return created_admin
    except HTTPException as e:
        print(f"Error creating admin. HTTPException: {e}")
        raise HTTPException(
            status_code=e.status_code,
            detail=e.detail,
        ) from e
    except Exception as e:
        print(f"Error creating admin. Unexpected Exception: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal server error during sign up",
        ) from e


@router.post("/login", response_model=Token, status_code=200)
async def admin_login(admin_credentials: Annotated[OAuth2PasswordRequestForm, Depends()], response: Response):
    try:
        print("Login attempt for admin username:", admin_credentials.username)

        raw_admin = await Admin.find_one(
            Or(Admin.username == admin_credentials.username,
               Admin.email == admin_credentials.username)
        )

        if not raw_admin:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Admin not found"
            )

        is_password_valid = verify_password(
            admin_credentials.password, raw_admin.password
        )

        if not is_password_valid:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Incorrect email or password"
            )

        access_token = await create_access_token(
            data={"sub": str(raw_admin.id)}
        )
        refresh_token = await create_refresh_token(
            data={"sub": str(raw_admin.id)}
        )

        # Add the refresh token to the user's refresh tokens list
        add_refresh_token_to_admin = await add_admin_refresh_token(str(raw_admin.id), refresh_token)

        if not add_refresh_token_to_admin:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Error adding refresh token to admin"
            )

        response.set_cookie(
            key=settings.ADMIN_REFRESH_COOKIE_NAME,
            value=refresh_token,
            httponly=True,
            max_age=60 * 60 * 24 * 30,
            secure=False,
            samesite="lax"
        )

        return Token(
            access_token=access_token,
            token_type="Bearer"
        )

    except HTTPException as e:
        print(f"Error logging in admin. HTTPException: {e}")
        raise HTTPException(
            status_code=e.status_code,
            detail=e.detail,
        ) from e
    except Exception as e:
        print(f"Error logging in admin. Full exception details: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal server error during admin login",
        ) from e


@router.post("/logout", status_code=200)
async def admin_logout(response: Response, request: Request, admin: Annotated[dict, Depends(get_current_admin)]):
    try:
        admin_id = admin.get("id")
        await remove_admin_refresh_token(
            str(admin_id),
            request.cookies.get(settings.ADMIN_REFRESH_COOKIE_NAME)
        )
        response.delete_cookie(
            key=settings.ADMIN_REFRESH_COOKIE_NAME,
        )
        return {"message": "Logged out"}
    except HTTPException as e:
        print(f"Error logging out admin. HTTPException: {e}")
        raise HTTPException(
            status_code=e.status_code,
            detail=e.detail,
        ) from e
    except Exception as e:
        print(f"Error logging out admin. Full exception details: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal server error during logout",
        ) from e


@router.post("/logoutall", )
async def admin_logout_all(response: Response, admin: Annotated[dict, Depends(get_current_admin)]):
    try:
        admin_id = admin.get("id")
        await remove_all_admin_refresh_token(str(admin_id))
        response.delete_cookie(settings.ADMIN_REFRESH_COOKIE_NAME)
        return {"message": "Logged out of all devices"}
    except HTTPException as e:
        print(f"Error logging out admin from all devices. HTTPException: {e}")
        raise HTTPException(
            status_code=e.status_code,
            detail=e.detail,
        ) from e
    except Exception as e:
        print(
            f"Error logging out admin from all devices. Full exception details: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal server error during logout",
        ) from e


@router.get("/checkauth")
async def protected(admin: Annotated[dict, Depends(get_current_admin)]):
    try:
        return {
            "status": "authenticated",
            "admin": admin
        }
    except HTTPException as e:
        raise HTTPException(
            status_code=e.status_code,
            detail=e.detail,
        ) from e
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal server error during authentication check",
        ) from e


@router.post("/refresh", response_model=Token, status_code=200)
async def admin_refresh_token_route(request: Request, response: Response):
    try:
        admin_refresh_token = request.cookies.get(
            settings.ADMIN_REFRESH_COOKIE_NAME)
        if not add_admin_refresh_token:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Unauthorized",
                headers={"WWW-Authenticate": "Bearer"}
            )
        payload = jwt.decode(
            admin_refresh_token,
            settings.SECRET_KEY,
            algorithms=[settings.ALGORITHM]
        )
        admin_id: str = payload.get("sub")
        if not admin_id:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Unauthorized",
                headers={"WWW-Authenticate": "Bearer"}
            )
        if not await admin_refresh_token_is_saved(str(admin_id), refresh_token=admin_refresh_token):
            response.delete_cookie(
                settings.ADMIN_REFRESH_COOKIE_NAME
            )
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Unauthorized",
                headers={"WWW-Authenticate": "Bearer"}
            )
        admin = await get_admin_details(admin_id)

        if not admin:
            response.delete_cookie(
                settings.ADMIN_REFRESH_COOKIE_NAME
            )
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Unauthorized",
                headers={"WWW-Authenticate": "Bearer"}
            )
        await remove_admin_refresh_token(str(admin_id), admin_refresh_token)
        access_token = await create_access_token(data={"sub": str(admin_id)})
        new_refresh_token = await create_refresh_token(data={"sub": str(admin_id)})

        await add_admin_refresh_token(str(admin_id), new_refresh_token)
        response.set_cookie(
            key=settings.ADMIN_REFRESH_COOKIE_NAME,
            value=new_refresh_token,
            httponly=True,
            max_age=60 * 60 * 24 * 30,
            secure=False,
            samesite="lax"
        )
        return Token(
            access_token=access_token,
            token_type="bearer"
        )
    except HTTPException as e:
        raise HTTPException(
            status_code=e.status_code,
            detail=e.detail,
        ) from e
    except jwt.PyJWTError as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Unauthorized",
            headers={"WWW-Authenticate": "Bearer"}
        ) from e
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal server error during admin token refresh",
        ) from e

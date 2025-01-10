from fastapi import APIRouter, HTTPException, status, Depends, Response, Request
from app.crud.user_crud import create_user, get_user_details, add_refresh_token, remove_refresh_token, remove_all_refresh_tokens, refresh_token_is_saved
from app.model.user import User, UserResponse, UserCreateRequest
from app.model.auth_models import Token
from app.utilities.password_utils import verify_password
from app.utilities.auth_utils import create_access_token, create_refresh_token, get_current_user
from fastapi.security import OAuth2PasswordRequestForm
from typing import Annotated
import jwt
from jwt.exceptions import InvalidTokenError, ExpiredSignatureError
from app.config.env_settings import settings
from beanie.operators import Or

router = APIRouter()


@router.post(
    "/register",
    response_model=UserResponse,
    status_code=status.HTTP_201_CREATED,
    description="Create a new user and sign up"
)
async def create_new_user(user: UserCreateRequest):
    try:
        existing_user = await User.find_one(User.email == user.email or User.username == user.username)
        if existing_user:
            print("User already exists")
            raise HTTPException(status_code=400, detail="User already exists")
        user_data_dict = user.model_dump()
        created_user = await create_user(user_data_dict)
        return created_user
    except HTTPException as e:
        print(f"Error creating user. HTTPException: {e}")
        raise HTTPException(
            status_code=e.status_code,
            detail=e.detail,
        ) from e
    except Exception as e:
        print(f"Error creating user. Unexpected Exception: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal server error during sign up",
        ) from e


@router.post("/login", response_model=Token)
async def login(user_credentials: Annotated[OAuth2PasswordRequestForm, Depends()], response: Response):
    try:
        print("Login attempt for username:", user_credentials.username)

        # First get the raw user data
        raw_user = await User.find_one(
            Or(User.username == user_credentials.username,
               User.email == user_credentials.username)
        )
        if not raw_user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

        # Print raw user data to debug
        # print("Raw user data:", raw_user.model_dump(exclude={"password"}))

        is_password_valid = verify_password(
            user_credentials.password, raw_user.password)
        if not is_password_valid:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Incorrect email or password"
            )
        access_token = await create_access_token(
            data={"sub": str(raw_user.id)}
        )
        refresh_token = await create_refresh_token(data={"sub": str(raw_user.id)})

        # Add the refresh token to the user's refresh tokens list
        add_refresh_token_to_user = await add_refresh_token(
            str(raw_user.id), refresh_token)

        if not add_refresh_token_to_user:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Error adding refresh token to user"
            )

        response.set_cookie(
            key=settings.USER_REFRESH_COOKIE_NAME,
            value=refresh_token, httponly=True, max_age=60 * 60 * 24 * 30,
            secure=False, samesite="lax",
        )

        return Token(
            access_token=access_token,
            token_type="bearer"
        )
    except HTTPException as e:
        print(f"Error logging in user. HTTPException: {e}")
        raise HTTPException(
            status_code=e.status_code,
            detail=e.detail,
        ) from e
    except Exception as e:
        print(f"Error logging in user. Full exception details: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal server error during login",
        ) from e


@router.post("/logout")
async def logout(response: Response, request: Request, user: Annotated[dict, Depends(get_current_user)]):
    try:
        user_id = user.get("id")
        await remove_refresh_token(str(user_id), request.cookies.get(settings.USER_REFRESH_COOKIE_NAME))
        response.delete_cookie(settings.USER_REFRESH_COOKIE_NAME)
        return {"message": "Logged out"}
    except HTTPException as e:
        print(f"Error logging out user. HTTPException: {e}")
        raise HTTPException(
            status_code=e.status_code,
            detail=e.detail,
        ) from e
    except Exception as e:
        print(f"Error logging out user. Full exception details: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal server error during logout",
        ) from e


@router.post("/logoutall", status_code=200)
async def logout_all(response: Response, user: Annotated[dict, Depends(get_current_user)]):
    try:
        user_id = user.get("id")
        user = await get_user_details(str(user_id))
        await remove_all_refresh_tokens(str(user_id))
        response.delete_cookie(settings.USER_REFRESH_COOKIE_NAME)
        return {"message": "Logged out of all devices"}
    except HTTPException as e:
        print(f"Error logging out user. HTTPException: {e}")
        raise HTTPException(
            status_code=e.status_code,
            detail=e.detail,
        ) from e
    except Exception as e:
        print(f"Error logging out user. Full exception details: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal server error during logout",
        ) from e


@router.get("/checkauth")
async def check_auth(user: Annotated[dict, Depends(get_current_user)]):
    try:
        return {"status": "authenticated", "user": user}
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
async def refresh_token_route(request: Request, response: Response):
    try:
        refresh_token = request.cookies.get(settings.USER_REFRESH_COOKIE_NAME)
        if not refresh_token:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Unauthorized",
                headers={"WWW-Authenticate": "Bearer"}
            )
        payload = jwt.decode(
            refresh_token, settings.SECRET_KEY,
            algorithms=[settings.ALGORITHM]
        )
        user_id: str = payload.get("sub")
        if not user_id or not await refresh_token_is_saved(user_id=str(user_id), refresh_token=refresh_token):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Unauthorized",
                headers={"WWW-Authenticate": "Bearer"}
            )
        user = await get_user_details(user_id)
        if user is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Unauthorized",
                headers={"WWW-Authenticate": "Bearer"}
            )
        await remove_refresh_token(str(user_id), refresh_token)
        access_token = await create_access_token(data={"sub": str(user_id)})
        new_refresh_token = await create_refresh_token(data={"sub": str(user_id)})
        await add_refresh_token(str(user_id), new_refresh_token)
        response.set_cookie(
            key=settings.USER_REFRESH_COOKIE_NAME,
            value=new_refresh_token, httponly=True, max_age=60 * 60 * 24 * 30,
            secure=False, samesite="lax",
        )
        return Token(
            access_token=access_token,
            token_type="bearer"
        )
    except (ExpiredSignatureError, InvalidTokenError) as e:
        response.delete_cookie(settings.USER_REFRESH_COOKIE_NAME)
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Unauthorized"
        ) from e

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
            detail="Internal server error during token refresh",
        ) from e

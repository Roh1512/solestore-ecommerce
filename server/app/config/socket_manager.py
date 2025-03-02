'''Web socket manager'''
from pprint import pformat

import socketio
from app.utilities.auth_utils import get_current_user_ws
from app.admin_app.admin_utilities.admin_auth_utils import get_current_admin_ws

from fastapi.exceptions import HTTPException

origins = [
    "http://localhost:5173",
    "http://localhost:5174",
    "http://localhost:8000",
    "http://127.0.0.1:8000"
]


sio = socketio.AsyncServer(
    async_mode='asgi',
    cors_allowed_origins=origins,
    ping_timeout=30,  # Longer timeout if clients are on slow networks
    ping_interval=10,  # Ping every 10 seconds
    # logger=True,  # Enable detailed logging
    # engineio_logger=True  # Enable engine.io logging
)


@sio.event
async def connect(sid, environ, auth):
    token = auth.get("token") if auth and isinstance(auth, dict) else None
    if not token:
        raise ConnectionRefusedError("Authentication required")

    # First, try authenticating as a regular user.
    user = None
    try:
        user = await get_current_user_ws(token=token)
    except HTTPException as e:
        # If the error indicates the user was not found, then try admin auth.
        if e.status_code != 404:
            raise ConnectionRefusedError(e.detail) from e

    if user:
        user = user.model_dump()
        await sio.save_session(sid, {"user_id": str(user["id"])})
        print(f"User {user['username']} connected with SID {sid}")
        await sio.enter_room(sid, str(user["id"]))
        return

    # If no regular user was found, try authenticating as an admin.
    try:
        admin = await get_current_admin_ws(token=token)
    except HTTPException as e:
        raise ConnectionRefusedError(e.detail) from e

    if admin:
        await sio.save_session(sid, {"admin_id": str(admin["id"])})
        print(f"Admin {admin['username']} connected with SID {sid}")
        await sio.enter_room(sid, "admin")
        return

    # If neither user nor admin authenticated, refuse the connection.
    raise ConnectionRefusedError("Authentication failed")


@sio.event
async def disconnect(sid):
    print(f"Client disconnected: {sid}")

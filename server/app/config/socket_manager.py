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
    # print("ENVIRON")
    # print(pformat(environ))
    # print("***************************************************")
    token = auth["token"] if auth else None
    if not token:
        raise ConnectionRefusedError("Authentication required")
    try:
        # Optionally extract refresh token from cookies if sent via query or headers
        user = await get_current_user_ws(token=token)
        if user:
            user = user.model_dump()
            # Store user info in session
            await sio.save_session(sid, {"user_id": str(user["id"])})
            print(f"User {user["username"]} connected with SID {sid}")
            await sio.enter_room(sid, str(user["id"]))
            return

        admin = await get_current_admin_ws(token=token)
        if admin:
            admin = admin.model_dump()
            # Store user info in session
            await sio.save_session(sid, {"admin_id": str(admin["id"])})
            print(f"Admin {admin["username"]} connected with SID {sid}")
            return
        raise ConnectionRefusedError("Authentication failed")

    except HTTPException as e:
        raise ConnectionRefusedError(e.detail) from e


@sio.event
async def disconnect(sid):
    print(f"Client disconnected: {sid}")

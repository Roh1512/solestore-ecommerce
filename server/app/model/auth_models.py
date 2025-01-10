from pydantic import BaseModel, ConfigDict, EmailStr


class LoginData(BaseModel):
    email: EmailStr
    password: str
    model_config = ConfigDict(extra="forbid")


class LoginResponse(BaseModel):
    token: "fake_token"


class Token(BaseModel):
    access_token: str
    token_type: str


class TokenData(BaseModel):
    id: str | None = None
    email: str | None = None
    username: str | None = None

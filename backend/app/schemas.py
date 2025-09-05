from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime
from typing import List


# ----------- Request Schemas -----------

class UserCreate(BaseModel):
    name: str
    email: EmailStr
    password: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str


# ----------- Response Schemas -----------

class UserResponse(BaseModel):
    token: str
    accountNumber: str
    email: EmailStr
    role: str   

    class Config:
        orm_mode = True


class TransactionBase(BaseModel):
    type: str
    amount: float
    description: Optional[str] = None

class TransactionResponse(TransactionBase):
    id: int
    created_at: datetime

    class Config:
        orm_mode = True

class BalanceResponse(BaseModel):
    account_number: str
    balance: float
    transactions: List[TransactionResponse]

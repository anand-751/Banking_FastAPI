from sqlalchemy import Column, Integer, String, Float, TIMESTAMP, ForeignKey, text, Enum
from sqlalchemy.orm import relationship
from app.database import Base
import enum

class UserRole(str, enum.Enum):
    user = "user"
    admin = "admin"

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    email = Column(String(100), unique=True, index=True, nullable=False)
    password = Column(String(255), nullable=False)
    account_number = Column(String(20), unique=True, index=True, nullable=False)
    role = Column(Enum(UserRole), nullable=False, server_default="user")
    created_at = Column(TIMESTAMP, server_default=text("CURRENT_TIMESTAMP"))

    transactions = relationship("Transaction", back_populates="user")

class Transaction(Base):
    __tablename__ = "transactions"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    type = Column(String(50), nullable=False)   # deposit, transfer, withdraw, account_created
    amount = Column(Float, default=0.0)
    description = Column(String(255))
    created_at = Column(TIMESTAMP, server_default=text("CURRENT_TIMESTAMP"))

    user = relationship("User", back_populates="transactions")

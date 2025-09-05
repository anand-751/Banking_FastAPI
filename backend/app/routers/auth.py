from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app import models, schemas, utils, database
from passlib.context import CryptContext
import jwt, os
from datetime import datetime, timedelta

router = APIRouter(prefix="/api/auth", tags=["Auth"])

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
SECRET_KEY = os.getenv("SECRET_KEY")
ALGORITHM = os.getenv("ALGORITHM")
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", 60))


@router.post("/signup", response_model=schemas.UserResponse)
def signup(user: schemas.UserCreate, db: Session = Depends(database.get_db)):
    # Check if email already exists
    existing_user = db.query(models.User).filter(models.User.email == user.email).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")

    # Generate unique account number
    account_number = utils.generate_account_number(db)

    # Hash password
    hashed_password = pwd_context.hash(user.password)

    # Determine role (admin only if both name and password contain "admin")
    if "admin" in user.name.lower() and "admin" in user.password.lower():
        role = "admin"
    else:
        role = "user"

    # Create new user
    new_user = models.User(
        name=user.name,
        email=user.email,
        password=hashed_password,
        account_number=account_number,
        role=role
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    # 👇 Register initial transaction (account created with 0 balance)
    init_txn = models.Transaction(
        user_id=new_user.id,
        type="account_created",
        amount=0.0,
        description="Account created with balance 0"
    )
    db.add(init_txn)
    db.commit()

    # Generate JWT
    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    token_data = {"sub": str(new_user.id), "exp": expire, "role": new_user.role}
    token = jwt.encode(token_data, SECRET_KEY, algorithm=ALGORITHM)

    return {
        "token": token,
        "accountNumber": account_number,
        "email": new_user.email,
        "role": new_user.role
    }



@router.post("/login")
def login(user: schemas.UserLogin, db: Session = Depends(database.get_db)):
    db_user = db.query(models.User).filter(models.User.email == user.email).first()
    if not db_user:
        raise HTTPException(status_code=400, detail="Invalid credentials")

    # Verify password
    if not pwd_context.verify(user.password, db_user.password):
        raise HTTPException(status_code=400, detail="Invalid credentials")

    # Use stored role from DB (already set during signup)
    role = db_user.role

    # Generate JWT
    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    token_data = {"sub": str(db_user.id), "exp": expire, "role": role}
    token = jwt.encode(token_data, SECRET_KEY, algorithm=ALGORITHM)

    return {
        "token": token,
        "accountNumber": db_user.account_number,
        "email": db_user.email,
        "role": role,
        "message": "Login successful"
    }

# app/routers/dashboard.py
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func
from pydantic import BaseModel
from typing import List, Optional

from app import models, database
from app.dependencies import get_current_user
from app.schemas import BalanceResponse, TransactionResponse

router = APIRouter(prefix="/api/dashboard", tags=["Dashboard"])


# ---------- Request Models ----------
class DepositRequest(BaseModel):
    amount: float

class TransferRequest(BaseModel):
    to_account: str
    amount: float


# ---------- Endpoints ----------
@router.get("/balance", response_model=BalanceResponse)
def get_balance(db: Session = Depends(database.get_db), current_user: models.User = Depends(get_current_user)):
    balance = db.query(func.coalesce(func.sum(models.Transaction.amount), 0.0)).filter(models.Transaction.user_id == current_user.id).scalar() or 0.0
    txns = db.query(models.Transaction).filter(models.Transaction.user_id == current_user.id).order_by(models.Transaction.created_at.desc()).all()

    return {
        "account_number": current_user.account_number,
        "balance": float(balance),
        "transactions": txns
    }


@router.post("/deposit")
def deposit(req: DepositRequest, db: Session = Depends(database.get_db), current_user: models.User = Depends(get_current_user)):
    amount = float(req.amount)
    if amount <= 0:
        raise HTTPException(status_code=400, detail="Deposit must be greater than 0")

    txn = models.Transaction(
        user_id=current_user.id,
        type="deposit",
        amount=amount,
        description=f"Deposited {amount}"
    )
    db.add(txn)
    db.commit()

    # compute new balance
    new_balance = db.query(func.coalesce(func.sum(models.Transaction.amount), 0.0)).filter(models.Transaction.user_id == current_user.id).scalar() or 0.0
    return {"message": f"Deposit of {amount} successful", "new_balance": float(new_balance)}


@router.post("/transfer")
def transfer(req: TransferRequest, db: Session = Depends(database.get_db), current_user: models.User = Depends(get_current_user)):
    to_account = req.to_account
    amount = float(req.amount)
    if amount <= 0:
        raise HTTPException(status_code=400, detail="Amount must be greater than 0")

    sender_balance = db.query(func.coalesce(func.sum(models.Transaction.amount), 0.0)).filter(models.Transaction.user_id == current_user.id).scalar() or 0.0
    if sender_balance < amount:
        raise HTTPException(status_code=400, detail="Insufficient funds")

    receiver = db.query(models.User).filter(models.User.account_number == to_account).first()
    if not receiver:
        raise HTTPException(status_code=404, detail="Receiver not found")

    # create negative transaction for sender
    sender_txn = models.Transaction(
        user_id=current_user.id,
        type="transfer_out",
        amount=-amount,
        description=f"Transferred {amount} to {receiver.account_number}"
    )
    db.add(sender_txn)

    # create positive transaction for receiver
    receiver_txn = models.Transaction(
        user_id=receiver.id,
        type="transfer_in",
        amount=amount,
        description=f"Received {amount} from {current_user.account_number}"
    )
    db.add(receiver_txn)

    db.commit()

    new_sender_balance = db.query(func.coalesce(func.sum(models.Transaction.amount), 0.0)).filter(models.Transaction.user_id == current_user.id).scalar() or 0.0
    return {"message": f"Transferred {amount} to {receiver.account_number}", "new_balance": float(new_sender_balance)}

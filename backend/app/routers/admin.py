# app/routers/admin.py
from fastapi import APIRouter, Depends, HTTPException, Header
from sqlalchemy.orm import Session
from app import models, database

router = APIRouter(prefix="/api/admin", tags=["Admin"])

# Mock role check – replace with JWT role check later
def check_admin(role: str = Header(...)):
    if role.lower() != "admin":
        raise HTTPException(status_code=403, detail="Admins only")
    return True


@router.get("/tables")
def list_tables(db: Session = Depends(database.get_db), _=Depends(check_admin)):
    # Expose only safe tables
    return {"tables": ["users", "transactions"]}


@router.get("/tables/{table_name}")
def get_table_data(
    table_name: str,
    db: Session = Depends(database.get_db),
    _=Depends(check_admin)
):
    if table_name == "users":
        users = db.query(models.User).all()
        return {"data": [
            {
                "id": u.id,
                "name": u.name,
                "email": u.email,
                "accountNumber": u.account_number,
                "role": u.role,
            }
            for u in users
        ]}

    elif table_name == "transactions":
        txns = db.query(models.Transaction).all()
        return {"data": [
            {
                "id": t.id,
                "type": t.type,
                "amount": t.amount,
                "description": t.description,
                "created_at": t.created_at,
                "user_id": t.user_id,
            }
            for t in txns
        ]}

    raise HTTPException(status_code=404, detail="Table not found")

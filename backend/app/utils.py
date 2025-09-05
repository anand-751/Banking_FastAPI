# app/utils.py
import random
from app import models

def generate_account_number(db):
    """
    Generate a unique 10-digit account number
    """
    while True:
        account_number = str(random.randint(1000000000, 9999999999))
        existing = db.query(models.User).filter(models.User.account_number == account_number).first()
        if not existing:
            return account_number

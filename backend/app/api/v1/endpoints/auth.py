from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.database.models import User, AuditLog, utcnow
from app.core.security import verify_password, create_access_token, oauth2_scheme, decode_token
from app.schemas.schemas import LoginRequest, DemoSwitchRequest, Token, UserResponse

router = APIRouter()

DEMO_ACCOUNTS = {
    "HSE_OFFICER": {
        "email": "hse@oil-demo.com",
        "full_name": "R. K. Sharma (Lead HSE Officer)",
        "role": "HSE_OFFICER",
        "site": "Duliajan Central Field",
        "department": "Health, Safety & Environment"
    },
    "SITE_MANAGER": {
        "email": "manager@oil-demo.com",
        "full_name": "P. K. Baruah (Asset Site Manager)",
        "role": "SITE_MANAGER",
        "site": "Moran Drilling Field",
        "department": "Operations & Production"
    },
    "CORPORATE_HSE": {
        "email": "corporate@oil-demo.com",
        "full_name": "Dr. Ananya Gogoi (VP Corporate HSE)",
        "role": "CORPORATE_HSE",
        "site": "All Assets (HQ)",
        "department": "Corporate HSE Governance"
    },
    "ADMIN": {
        "email": "admin@oil-demo.com",
        "full_name": "Kirtan Ladani (System Administrator)",
        "role": "ADMIN",
        "site": "Enterprise",
        "department": "IT & Systems"
    },
    "DATA_SCIENTIST": {
        "email": "ds@oil-demo.com",
        "full_name": "Vikram Sen (Lead Safety ML Engineer)",
        "role": "DATA_SCIENTIST",
        "site": "All Assets",
        "department": "AI & Safety Intelligence"
    }
}

def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)) -> User:
    if not token:
        # Fallback to default demo user for seamless UX if no header
        user = db.query(User).filter(User.role == "HSE_OFFICER").first()
        if user:
            return user
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Not authenticated")
    
    payload = decode_token(token)
    if not payload:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")
    
    email = payload.get("sub")
    user = db.query(User).filter(User.email == email).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    return user

@router.post("/login", response_model=Token)
def login(creds: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == creds.email).first()
    if not user or not verify_password(creds.password, user.hashed_password):
        # Check if demo account match
        matched_demo = None
        for role_key, acc in DEMO_ACCOUNTS.items():
            if acc["email"].lower() == creds.email.lower():
                matched_demo = acc
                break
        
        if matched_demo:
            # Upsert demo user
            if not user:
                from app.core.security import get_password_hash
                user = User(
                    email=matched_demo["email"],
                    hashed_password=get_password_hash("password123"),
                    full_name=matched_demo["full_name"],
                    role=matched_demo["role"],
                    site=matched_demo["site"],
                    department=matched_demo["department"]
                )
                db.add(user)
                db.commit()
                db.refresh(user)
        else:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")

    token = create_access_token({"sub": user.email, "role": user.role, "name": user.full_name})
    
    # Audit log
    audit = AuditLog(
        user_id=user.id,
        user_email=user.email,
        action="LOGIN",
        entity_type="USER",
        entity_id=str(user.id),
        details={"role": user.role}
    )
    db.add(audit)
    db.commit()

    return {
        "access_token": token,
        "token_type": "bearer",
        "user": {
            "id": user.id,
            "email": user.email,
            "full_name": user.full_name,
            "role": user.role,
            "site": user.site,
            "department": user.department
        }
    }

@router.post("/demo-switch", response_model=Token)
def demo_switch(req: DemoSwitchRequest, db: Session = Depends(get_db)):
    role_key = req.role.upper()
    if role_key not in DEMO_ACCOUNTS:
        role_key = "HSE_OFFICER"
        
    acc = DEMO_ACCOUNTS[role_key]
    user = db.query(User).filter(User.email == acc["email"]).first()
    if not user:
        from app.core.security import get_password_hash
        user = User(
            email=acc["email"],
            hashed_password=get_password_hash("password123"),
            full_name=acc["full_name"],
            role=acc["role"],
            site=acc["site"],
            department=acc["department"]
        )
        db.add(user)
        db.commit()
        db.refresh(user)

    token = create_access_token({"sub": user.email, "role": user.role, "name": user.full_name})
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": {
            "id": user.id,
            "email": user.email,
            "full_name": user.full_name,
            "role": user.role,
            "site": user.site,
            "department": user.department
        }
    }

@router.get("/me", response_model=UserResponse)
def get_me(user: User = Depends(get_current_user)):
    return user

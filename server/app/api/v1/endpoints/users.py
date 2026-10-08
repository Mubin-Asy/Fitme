from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.models.user import User
from app.schemas.user import UserResponse, UserCreate, UserUpdate, LoginRequest, Token
from app.core.security import verify_password, get_password_hash, create_access_token
from app.core.config import settings

router = APIRouter()


@router.get("/", response_model=List[UserResponse])
def get_users(db: Session = Depends(get_db)):
    """List all registered members in the private group (max 10)."""
    return db.query(User).filter(User.is_active == True).all()


@router.get("/{user_id}", response_model=UserResponse)
def get_user_by_id(user_id: int, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user


@router.post("/", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def create_user(user_in: UserCreate, db: Session = Depends(get_db)):
    """Create a user with explicit enforcement of the 10-member group quota."""
    current_count = db.query(User).count()
    if current_count >= settings.MAX_GROUP_USERS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Private Group Limit Reached: Fitme supports a maximum of {settings.MAX_GROUP_USERS} members."
        )

    if db.query(User).filter(User.email == user_in.email).first():
        raise HTTPException(status_code=400, detail="Email is already registered")
    if db.query(User).filter(User.username == user_in.username).first():
        raise HTTPException(status_code=400, detail="Username is already taken")

    user_data = user_in.model_dump()
    password = user_data.pop("password")
    user_data["hashed_password"] = get_password_hash(password)

    new_user = User(**user_data)
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user


@router.patch("/{user_id}", response_model=UserResponse)
def update_user(user_id: int, user_update: UserUpdate, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    update_dict = user_update.model_dump(exclude_unset=True)
    for field, val in update_dict.items():
        setattr(user, field, val)

    db.commit()
    db.refresh(user)
    return user


@router.post("/login", response_model=Token)
def login(login_req: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(
        (User.username == login_req.username_or_email) | (User.email == login_req.username_or_email)
    ).first()
    if not user or not verify_password(login_req.password, user.hashed_password):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")

    token = create_access_token(subject=user.id)
    return Token(access_token=token, token_type="bearer", user=user)

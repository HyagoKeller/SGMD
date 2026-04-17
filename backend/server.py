from dotenv import load_dotenv
from pathlib import Path

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

from fastapi import FastAPI, APIRouter, HTTPException, Request, Response, Depends
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
from bson import ObjectId
import os
import logging
import uuid
import bcrypt
import jwt
import csv
import io
import base64
import secrets
from datetime import datetime, timezone, timedelta
from pydantic import BaseModel, Field, field_validator
from typing import Optional, Literal
from fastapi.responses import StreamingResponse

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

app = FastAPI()
api_router = APIRouter(prefix="/api")

JWT_ALGORITHM = "HS256"

def get_jwt_secret():
    return os.environ["JWT_SECRET"]

def hash_password(password: str) -> str:
    salt = bcrypt.gensalt()
    return bcrypt.hashpw(password.encode("utf-8"), salt).decode("utf-8")

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return bcrypt.checkpw(plain_password.encode("utf-8"), hashed_password.encode("utf-8"))

def create_access_token(user_id: str, email: str) -> str:
    payload = {"sub": user_id, "email": email, "exp": datetime.now(timezone.utc) + timedelta(minutes=60), "type": "access"}
    return jwt.encode(payload, get_jwt_secret(), algorithm=JWT_ALGORITHM)

def create_refresh_token(user_id: str) -> str:
    payload = {"sub": user_id, "exp": datetime.now(timezone.utc) + timedelta(days=7), "type": "refresh"}
    return jwt.encode(payload, get_jwt_secret(), algorithm=JWT_ALGORITHM)

async def get_current_user(request: Request) -> dict:
    token = request.cookies.get("access_token")
    if not token:
        auth_header = request.headers.get("Authorization", "")
        if auth_header.startswith("Bearer "):
            token = auth_header[7:]
    if not token:
        raise HTTPException(status_code=401, detail="Não autenticado")
    try:
        payload = jwt.decode(token, get_jwt_secret(), algorithms=[JWT_ALGORITHM])
        if payload.get("type") != "access":
            raise HTTPException(status_code=401, detail="Token inválido")
        user = await db.users.find_one({"_id": ObjectId(payload["sub"])})
        if not user:
            raise HTTPException(status_code=401, detail="Usuário não encontrado")
        user["_id"] = str(user["_id"])
        user.pop("password_hash", None)
        return user
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expirado")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Token inválido")

def verify_basic_auth(request: Request) -> bool:
    """Verifica HTTP Basic Auth com as credenciais do InvGate (INVGATE_USER/INVGATE_PASSWORD)."""
    auth_header = request.headers.get("Authorization", "")
    if not auth_header.startswith("Basic "):
        return False
    try:
        decoded = base64.b64decode(auth_header[6:]).decode("utf-8")
        username, password = decoded.split(":", 1)
        expected_user = os.environ.get("INVGATE_USER", "")
        expected_pass = os.environ.get("INVGATE_PASSWORD", "")
        return secrets.compare_digest(username, expected_user) and secrets.compare_digest(password, expected_pass)
    except Exception:
        return False

async def get_user_or_integration(request: Request) -> dict:
    """Autenticacao flexivel: aceita JWT (cookie/Bearer) OU HTTP Basic Auth (InvGate)."""
    # Tentar Basic Auth primeiro (integracao InvGate)
    if verify_basic_auth(request):
        return {"_id": "invgate", "email": "invgate@integracao.sgmd", "name": "InvGate ITSM", "role": "integration"}
    # Senao, tentar JWT
    return await get_current_user(request)

# --- Auth Models ---
class LoginRequest(BaseModel):
    email: str
    password: str

class RegisterRequest(BaseModel):
    email: str
    password: str
    name: str

VALID_STATUSES = ["planejada", "aprovada", "em_execucao", "concluida", "cancelada"]
VALID_CATEGORIAS = ["novo_servico", "preventiva", "adaptativa", "corretiva", "evolutiva", "desativacao", "deploy", "teste_vulnerabilidade"]

# --- Change Models (ITIL v4) ---
class ChangeCreate(BaseModel):
    titulo: str
    descricao: str = ""
    responsavel_negocio: str = ""
    sistemas_afetados: str = ""
    data_inicio: str
    data_fim: str = ""
    status: str = "planejada"
    frente_atuacao: str = "sistemas"  # infraestrutura, sistemas, supersapiens
    natureza_mudanca: str = "planejada_normal"  # planejada_normal, baixo_risco, emergencial
    categoria_mudanca: str = "corretiva"
    risco: str = "medio"
    numero_rfc: str = ""
    justificativa: str = ""
    plano_rollback: str = ""
    servicos_impactados: str = ""
    resultado_conclusao: str = ""
    ambiente_homologado: str = "nao_se_aplica"  # sim, nao, nao_se_aplica
    versao_sistema: str = ""

    @field_validator('status')
    @classmethod
    def validate_status(cls, v):
        if v not in VALID_STATUSES:
            raise ValueError(f'Status invalido. Valores aceitos: {", ".join(VALID_STATUSES)}')
        return v

    @field_validator('categoria_mudanca')
    @classmethod
    def validate_categoria(cls, v):
        if v not in VALID_CATEGORIAS:
            raise ValueError(f'Categoria invalida. Valores aceitos: {", ".join(VALID_CATEGORIAS)}')
        return v

class ChangeUpdate(BaseModel):
    titulo: Optional[str] = None
    descricao: Optional[str] = None
    responsavel_negocio: Optional[str] = None
    sistemas_afetados: Optional[str] = None
    data_inicio: Optional[str] = None
    data_fim: Optional[str] = None
    status: Optional[str] = None
    frente_atuacao: Optional[str] = None
    natureza_mudanca: Optional[str] = None
    categoria_mudanca: Optional[str] = None
    risco: Optional[str] = None
    numero_rfc: Optional[str] = None
    justificativa: Optional[str] = None
    plano_rollback: Optional[str] = None
    servicos_impactados: Optional[str] = None
    resultado_conclusao: Optional[str] = None
    ambiente_homologado: Optional[str] = None
    versao_sistema: Optional[str] = None

    @field_validator('status')
    @classmethod
    def validate_status(cls, v):
        if v is not None and v not in VALID_STATUSES:
            raise ValueError(f'Status invalido. Valores aceitos: {", ".join(VALID_STATUSES)}')
        return v

# --- Auth Routes ---
@api_router.post("/auth/login")
async def login(req: LoginRequest, response: Response):
    email = req.email.strip().lower()
    user = await db.users.find_one({"email": email})
    if not user:
        raise HTTPException(status_code=401, detail="E-mail ou senha incorretos")
    if not verify_password(req.password, user["password_hash"]):
        raise HTTPException(status_code=401, detail="E-mail ou senha incorretos")
    user_id = str(user["_id"])
    access_token = create_access_token(user_id, email)
    refresh_token = create_refresh_token(user_id)
    response.set_cookie(key="access_token", value=access_token, httponly=True, secure=False, samesite="lax", max_age=3600, path="/")
    response.set_cookie(key="refresh_token", value=refresh_token, httponly=True, secure=False, samesite="lax", max_age=604800, path="/")
    return {"id": user_id, "email": user["email"], "name": user.get("name", ""), "role": user.get("role", "user"), "token": access_token}

@api_router.post("/auth/register")
async def register(req: RegisterRequest, response: Response):
    email = req.email.strip().lower()
    existing = await db.users.find_one({"email": email})
    if existing:
        raise HTTPException(status_code=400, detail="E-mail já cadastrado")
    hashed = hash_password(req.password)
    user_doc = {"email": email, "password_hash": hashed, "name": req.name, "role": "user", "created_at": datetime.now(timezone.utc).isoformat()}
    result = await db.users.insert_one(user_doc)
    user_id = str(result.inserted_id)
    access_token = create_access_token(user_id, email)
    refresh_token = create_refresh_token(user_id)
    response.set_cookie(key="access_token", value=access_token, httponly=True, secure=False, samesite="lax", max_age=3600, path="/")
    response.set_cookie(key="refresh_token", value=refresh_token, httponly=True, secure=False, samesite="lax", max_age=604800, path="/")
    return {"id": user_id, "email": email, "name": req.name, "role": "user", "token": access_token}

@api_router.get("/auth/me")
async def get_me(request: Request):
    user = await get_current_user(request)
    return user

@api_router.post("/auth/logout")
async def logout(response: Response):
    response.delete_cookie("access_token", path="/")
    response.delete_cookie("refresh_token", path="/")
    return {"message": "Logout realizado"}

# --- Changes CRUD ---
@api_router.get("/changes")
async def get_changes(request: Request):
    await get_user_or_integration(request)
    changes = await db.changes.find({}, {"_id": 0}).to_list(5000)
    return changes

@api_router.post("/changes", status_code=201)
async def create_change(change: ChangeCreate, request: Request):
    user = await get_user_or_integration(request)
    doc = change.model_dump()
    doc["id"] = str(uuid.uuid4())
    doc["created_at"] = datetime.now(timezone.utc).isoformat()
    doc["updated_at"] = datetime.now(timezone.utc).isoformat()
    doc["created_by"] = user.get("name", user.get("email", ""))
    await db.changes.insert_one(doc)
    result = await db.changes.find_one({"id": doc["id"]}, {"_id": 0})
    return result

@api_router.put("/changes/{change_id}")
async def update_change(change_id: str, change: ChangeUpdate, request: Request):
    await get_user_or_integration(request)
    update_data = {k: v for k, v in change.model_dump().items() if v is not None}
    update_data["updated_at"] = datetime.now(timezone.utc).isoformat()
    result = await db.changes.update_one({"id": change_id}, {"$set": update_data})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Mudança não encontrada")
    updated = await db.changes.find_one({"id": change_id}, {"_id": 0})
    return updated

@api_router.delete("/changes/{change_id}")
async def delete_change(change_id: str, request: Request):
    await get_user_or_integration(request)
    result = await db.changes.delete_one({"id": change_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Mudança não encontrada")
    return {"message": "Mudança excluída"}

@api_router.get("/changes/export/csv")
async def export_csv(request: Request):
    await get_user_or_integration(request)
    changes = await db.changes.find({}, {"_id": 0}).to_list(5000)
    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow(["Título", "Descrição", "Frente de Atuação", "Natureza da Mudança", "Categoria da Mudança", "Responsável do Negócio", "Sistemas Afetados", "Serviços Impactados", "Data/Hora Início", "Data/Hora Fim", "Status", "Resultado Conclusão", "Risco", "Número RFC", "Justificativa", "Plano Rollback", "Ambiente Homologado", "Versão Sistema", "Criado por", "Criado em"])
    for c in changes:
        writer.writerow([c.get("titulo",""), c.get("descricao",""), c.get("frente_atuacao",c.get("tipo_mudanca","")), c.get("natureza_mudanca",c.get("categoria_itil","")), c.get("categoria_mudanca",""), c.get("responsavel_negocio",c.get("responsavel","")), c.get("sistemas_afetados",c.get("sistema_afetado","")), c.get("servicos_impactados",""), c.get("data_inicio",""), c.get("data_fim",""), c.get("status",""), c.get("resultado_conclusao",""), c.get("risco",""), c.get("numero_rfc",""), c.get("justificativa",""), c.get("plano_rollback",""), c.get("ambiente_homologado",""), c.get("versao_sistema",""), c.get("created_by",""), c.get("created_at","")])
    output.seek(0)
    return StreamingResponse(io.BytesIO(output.getvalue().encode("utf-8-sig")), media_type="text/csv", headers={"Content-Disposition": "attachment; filename=mudancas_sgmd.csv"})

# Include router
app.include_router(api_router)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=os.environ.get("CORS_ORIGINS", "*").split(","),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

@app.on_event("startup")
async def startup():
    await db.users.create_index("email", unique=True)
    await seed_admin()

async def seed_admin():
    admin_email = os.environ.get("ADMIN_EMAIL", "admin@sgmd.gov.br")
    admin_password = os.environ.get("ADMIN_PASSWORD", "admin123")
    existing = await db.users.find_one({"email": admin_email})
    if existing is None:
        hashed = hash_password(admin_password)
        await db.users.insert_one({"email": admin_email, "password_hash": hashed, "name": "Administrador", "role": "admin", "created_at": datetime.now(timezone.utc).isoformat()})
        logger.info(f"Admin user seeded: {admin_email}")
    elif not verify_password(admin_password, existing["password_hash"]):
        await db.users.update_one({"email": admin_email}, {"$set": {"password_hash": hash_password(admin_password)}})
        logger.info(f"Admin password updated: {admin_email}")

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()

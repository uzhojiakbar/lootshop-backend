# from fastapi import FastAPI, HTTPException
# from fastapi.middleware.cors import CORSMiddleware
# from pydantic import BaseModel
# from telethon import TelegramClient
# from telethon.sessions import StringSession

# app = FastAPI()

# app.add_middleware(
#     CORSMiddleware,
#     allow_origins=["http://localhost:5173"],
#     allow_credentials=True,
#     allow_methods=["*"],
#     allow_headers=["*"],
# )

# api_id = 23779743  # Bu yerga o'zingizning API ID ni kiriting
# api_hash = '224cb2989a32a1138dfac4dd6eb805f4'  # Bu yerga o'zingizning API Hash ni kiriting

# class LoginData(BaseModel):
#     phone: str

# class CodeData(BaseModel):
#     phone: str
#     code: str
#     session: str
#     phone_code_hash: str

# @app.post("/login/")
# async def login(data: LoginData):
#     client = TelegramClient(StringSession(), api_id, api_hash)
#     await client.connect()

#     try:
#         sent_code = await client.send_code_request(data.phone)
#         session_string = client.session.save()
#         return {
#             "session": session_string,
#             "phone": data.phone,
#             "phone_code_hash": sent_code.phone_code_hash
#         }
#     except Exception as e:
#         raise HTTPException(status_code=400, detail=str(e))
#     finally:
#         await client.disconnect()

# @app.post("/code/")
# async def enter_code(data: CodeData):
#     client = TelegramClient(StringSession(data.session), api_id, api_hash)
#     await client.connect()

#     try:
#         # Sign in with only the required parameters
#         await client.sign_in(phone=data.phone, code=data.code, phone_code_hash=data.phone_code_hash)
#         session_string = client.session.save()
#         return {"status": "Login successful", "session": session_string}
#     except Exception as e:
#         raise HTTPException(status_code=400, detail=str(e))
#     finally:
#         await client.disconnect()


# if __name__ == "__main__":
#     import uvicorn
#     uvicorn.run(app, host="0.0.0.0", port=8000)

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from telethon import TelegramClient
import os

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

api_id = 23779743  # API ID ni kiriting
api_hash = '224cb2989a32a1138dfac4dd6eb805f4'  # API Hash ni kiriting

class LoginData(BaseModel):
    phone: str

class CodeData(BaseModel):
    phone: str
    code: str
    phone_code_hash: str

@app.post("/login/")
async def login(data: LoginData):
    session_file = f'{data.phone}.session'
    client = TelegramClient(session_file, api_id, api_hash)
    await client.connect()

    try:
        sent_code = await client.send_code_request(data.phone)
        return {
            "session": session_file,
            "phone": data.phone,
            "phone_code_hash": sent_code.phone_code_hash
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
    finally:
        await client.disconnect()

@app.post("/code/")
async def enter_code(data: CodeData):
    session_file = f'{data.phone}.session'
    client = TelegramClient(session_file, api_id, api_hash)
    await client.connect()

    try:
        # Faqat kerakli argumentlar bilan sign_in
        await client.sign_in(phone=data.phone, code=data.code, phone_code_hash=data.phone_code_hash)
        return {"status": "Login successful", "session": session_file}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
    finally:
        await client.disconnect()

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)

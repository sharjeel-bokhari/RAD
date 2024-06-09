from fastapi import FastAPI, UploadFile, File, Form
import uvicorn  #ASGI
from fastapi.middleware.cors import CORSMiddleware
import asyncio
from whisperAi import Whisper
from chatGpt import ScamDetector

app = FastAPI()
whisper = Whisper()
# Using two different api-keys to manage the sessions since the caller and the joiner are both sending seperate audios hence we need to keep their contexts different.
# Call Screen LLM Object
callScreenLLM = ScamDetector("your-first-api-key-here")
# Join Screen LLM Object
joinScreenLLM = ScamDetector("Your-second-api-key-here-from-gpt-3.5-turbo-instruct")
# Store if the Caller is a scam
callerScamOrNo = {}
# Store if the Joiner is a scam
joinerScamOrNo = {}

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["GET", "POST", "PUT", "DELETE"],
    allow_headers=["*"],
)
userCallHistory = {}
joinUserCallHistory = {}

@app.get('/') #Root route
def index():
    return {'message': 'Hello, Stranger!'}

@app.get('/Welcome')
def get_name(name: str):
    return {'Welcome to Rad': f'{name}'}
@app.post('/getRoomId')
def get_room_id(uid: str = Form(...)):
    return {"roomId" : uid}

@app.post('/upload-audio/call-screen')
async def get_uri(data: UploadFile= File(...), roomid: str = Form(...)):
    try:
        with open('received_audio_callScreen.wav', 'wb') as f:
            contents = await data.read()
            f.write(contents)

        try:
            print("\n\n ROOM ID\n\n",roomid)
            # transcribe
            x = whisper.transcribe_audio('received_audio_callScreen.wav')
            # Append trancription to currFileTranscript
            # Add to dictionary userCallHistory to the key of roomid
            userCallHistory[roomid] = userCallHistory.get(roomid, "") + x
            
        except Exception as e2:
            return {"Error Transcription": str(e2)}
        try:
        # Call your ML model to process the audio (replace this with your actual ML model code)
            res = callScreenLLM.get_prediction(userCallHistory[roomid])
        # Return a response back to the frontend (replace this with your actual ML model response)
            callerScamOrNo[roomid] = res

            return {'isJoinerScam' : joinerScamOrNo[roomid]}
            
        except Exception as e3:
            return {'Error Scam Detector:': str(e3)}
        
    except Exception as e:
        return {"Error:": str(e)}

@app.post('/upload-audio/join-screen')
async def get_uri(data: UploadFile= File(...), roomid: str = Form(...)):
    try:
        with open('received_audio_joinScreen.wav', 'wb') as f:
            contents = await data.read()
            f.write(contents)

        try:
            print("\n\n ROOM ID\n\n",roomid)
            # transcribe
            # Append trancription to currFileTranscript
            x = whisper.transcribe_audio('received_audio_joinScreen.wav')
            # Add to dictionary userCallHistory to the key of roomid
            joinUserCallHistory[roomid] = joinUserCallHistory.get(roomid, "") + x
            
        
        except Exception as e2:
            return {"Error Transcription": str(e2)}
        try:
        # Call your ML model to process the audio (replace this with your actual ML model code)
            res2 = joinScreenLLM.get_prediction(joinUserCallHistory[roomid])
        # Return a response back to the frontend (replace this with your actual ML model response)
            joinerScamOrNo[roomid] = res2
            return {'isCallerScam': callerScamOrNo[roomid]}
        except Exception as e3:
            return {'Error Scam Detector:': str(e3)}
    except Exception as e:
        return {"Error:": str(e)}

if __name__ == '__main__':
    uvicorn.run(app, host='0.0.0.0', port=8000)
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from analyzer import WhatsAppAnalyzer
import uvicorn
import traceback
import sys
import asyncio

app = FastAPI(title="WhatsApp Sentiment Analyzer")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://www.analyser.chat",
        "https://analyser.chat",
        "http://localhost:5173",
        "http://localhost:3000"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

analyzer = WhatsAppAnalyzer()

@app.get("/")
async def root():
    return {"message": "WhatsApp Sentiment Analyzer API is running"}

@app.post("/analyze")
async def analyze_chat(file: UploadFile = File(...)):
    if not file.filename.endswith('.txt'):
        raise HTTPException(status_code=400, detail="Only .txt files are supported")
    
    try:
        # Read file with timeout protection
        try:
            content = await asyncio.wait_for(file.read(), timeout=30.0)
        except asyncio.TimeoutError:
            raise HTTPException(status_code=408, detail="File upload timeout. Please try a smaller file or contact support.")
        
        # Check file size (limit to 10MB)
        if len(content) > 10 * 1024 * 1024:
            raise HTTPException(status_code=413, detail="File too large. Maximum size is 10MB.")
        
        # Decode content, handling potential encoding issues
        try:
            text_content = content.decode('utf-8')
        except UnicodeDecodeError:
            text_content = content.decode('latin-1')
            
        # Process with timeout (5 minutes for analysis)
        try:
            df = await asyncio.wait_for(
                asyncio.to_thread(analyzer.parse_chat, text_content),
                timeout=300.0
            )
        except asyncio.TimeoutError:
            raise HTTPException(status_code=408, detail="Analysis timeout. The file may be too large or complex.")
        
        if df.empty:
            raise HTTPException(status_code=400, detail="Could not parse any messages from the file. Ensure it's a valid WhatsApp export.")
        
        # Analyze with timeout
        try:
            results = await asyncio.wait_for(
                asyncio.to_thread(analyzer.analyze_sentiment, df),
                timeout=300.0
            )
        except asyncio.TimeoutError:
            raise HTTPException(status_code=408, detail="Analysis timeout. The file may be too large or complex.")
        
        return results
        
    except HTTPException:
        # Re-raise HTTP exceptions (they already have proper status codes)
        raise
    except Exception as e:
        traceback.print_exc(file=sys.stderr)
        raise HTTPException(status_code=500, detail=f"Analysis failed: {str(e)}")

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)

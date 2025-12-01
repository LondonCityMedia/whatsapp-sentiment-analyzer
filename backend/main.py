from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from analyzer import WhatsAppAnalyzer
import uvicorn
import traceback
import sys

app = FastAPI(title="WhatsApp Sentiment Analyzer")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, replace with specific frontend URL
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
        content = await file.read()
        # Decode content, handling potential encoding issues
        try:
            text_content = content.decode('utf-8')
        except UnicodeDecodeError:
            text_content = content.decode('latin-1')
            
        df = analyzer.parse_chat(text_content)
        
        if df.empty:
            raise HTTPException(status_code=400, detail="Could not parse any messages from the file. Ensure it's a valid WhatsApp export.")
            
        results = analyzer.analyze_sentiment(df)
        return results
        
    except Exception as e:
        traceback.print_exc(file=sys.stderr)
        raise HTTPException(status_code=500, detail=f"Analysis failed: {str(e)}")

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)

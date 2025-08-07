from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, HttpUrl
from .scraper import RedditScraper, HNScraper
from .llm import summarize_with_llm
from .cache import SimpleCache
import logging
from dotenv import load_dotenv
import os

load_dotenv()

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

logger.info("OPENROUTER_API_KEY loaded" if os.getenv("OPENROUTER_API_KEY") else "OPENROUTER_API_KEY missing")


app = FastAPI(
    title="Summarizer",
    description="AI-powered Reddit and Hacker News thread summarization",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

cache = SimpleCache(ttl=1800)

class SummarizeRequest(BaseModel):
    url: HttpUrl

class SummarizeResponse(BaseModel):
    summary: str
    top_insights: list
    consensus: str
    controversial: str
    sentiment: dict

@app.get("/")
async def root():
    return {
        "message": "Summarizer",
        "version": "1.0.0",
        "endpoints": {
            "POST /summarize": "Summarize a Reddit or Hacker News thread",
            "GET /health": "Health check"
        }
    }

@app.get("/health")
async def health_check():
    return {"status": "healthy", "cache_size": cache.size()}

@app.post("/summarize", response_model=SummarizeResponse)
async def summarize_thread(req: SummarizeRequest):
    url_str = str(req.url)
    
    
    cached = cache.get(url_str)
    if cached:
        return cached
    
    try:
        if "reddit.com" in url_str:
            scraper = RedditScraper()
        elif "news.ycombinator.com" in url_str:
            scraper = HNScraper()
        else:
            raise HTTPException(
                status_code=400, 
                detail="Invalid URL. Please provide a Reddit or Hacker News thread URL."
            )
        
        thread_data = await scraper.scrape(url_str)
        
        if not thread_data.get('comments'):
            raise HTTPException(
                status_code=400,
                detail="No comments found in this thread."
            )
        
        logger.info("Generating summary...")
        summary = await summarize_with_llm(thread_data)
        
        cache.set(url_str, summary)
        logger.info("Result cached successfully")
        
        return summary
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error summarizing thread: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to summarize thread: {str(e)}"
        )


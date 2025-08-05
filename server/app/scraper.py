import httpx  
import re
from abc import ABC, abstractmethod

class BaseScraper(ABC):
    @abstractmethod
    async def scrape(self, url: str) -> dict:
        pass

class RedditScraper(BaseScraper):
    async def scrape(self, url: str) -> dict:
        try:
            json_url = url.rstrip('/') + '.json'
            async with httpx.AsyncClient() as client:
                response = await client.get(
                    json_url,
                    headers={
                        'User-Agent': 'ThreadSummarizer',
                        'Accept': 'application/json'
                    },
                    timeout=15.0
                )
                response.raise_for_status()
                data = response.json()
            
            post = data[0]['data']['children'][0]['data']
            comments = data[1]['data']['children'][:20]  
            
            comments_text = []
            for comment in comments:
                if comment['kind'] == 't1':  
                    body = comment['data'].get('body', '')
                    if body and body != '[deleted]' and body != '[removed]':
                        cleaned = re.sub(r'\[([^\]]+)\]\([^\)]+\)', r'\1', body)  
                        cleaned = re.sub(r'`([^`]+)`', r'\1', cleaned)  
                        cleaned = re.sub(r'\*\*([^*]+)\*\*', r'\1', cleaned) 
                        cleaned = re.sub(r'\*([^*]+)\*', r'\1', cleaned)  
                        comments_text.append(cleaned[:500])  
            
            return {
                'title': post.get('title', ''),
                'content': post.get('selftext', ''),
                'comments': comments_text,
                'platform': 'reddit'
            }
            
        except httpx.HTTPStatusError as e:
            if e.response.status_code == 404:
                raise Exception("Reddit thread not found. Please check the URL and ensure the thread exists.")
            elif e.response.status_code == 403:
                raise Exception("Access denied by Reddit. The thread may be private or removed.")
            else:
                raise Exception(f"Reddit API error: {e.response.status_code}")
        except Exception as e:
            raise Exception(f"Failed to scrape Reddit thread: {str(e)}")



class HNScraper(BaseScraper):
    async def scrape(self, url: str) -> dict:
        try:
            match = re.search(r'id=(\d+)', url)
            if not match:
                raise Exception("Invalid Hacker News URL format")
            
            item_id = match.group(1)
            
            async with httpx.AsyncClient() as client:
                post_resp = await client.get(
                    f'https://hacker-news.firebaseio.com/v0/item/{item_id}.json',
                    timeout=15.0
                )
                post_resp.raise_for_status()
                post = post_resp.json()
                
                if not post:
                    raise Exception("Post not found or deleted")
                
                comments = []
                kids = post.get('kids', [])[:20]  
                
                for kid_id in kids:
                    try:
                        comment_resp = await client.get(
                            f'https://hacker-news.firebaseio.com/v0/item/{kid_id}.json',
                            timeout=10.0
                        )
                        comment_resp.raise_for_status()
                        comment = comment_resp.json()
                        
                        if comment and comment.get('text'):
                            text = re.sub(r'<[^>]+>', '', comment['text'])
                            text = re.sub(r'&[a-zA-Z]+;', '', text)  
                            comments.append(text[:500])  
                    except:
                        continue 
            
            return {
                'title': post.get('title', ''),
                'content': post.get('text', ''),
                'comments': comments,
                'platform': 'hackernews'
            }
            
        except httpx.HTTPStatusError as e:
            if e.response.status_code == 404:
                raise Exception("Hacker News thread not found. Please check the URL and ensure the thread exists.")
            else:
                raise Exception(f"Hacker News API error: {e.response.status_code}")
        except Exception as e:
            raise Exception(f"Failed to scrape Hacker News thread: {str(e)}")

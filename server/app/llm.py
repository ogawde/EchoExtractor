import httpx
import os
import json
import logging

logger = logging.getLogger(__name__)

OPENROUTER_API_KEY = os.getenv('OPENROUTER_API_KEY')

async def summarize_with_llm(thread_data: dict) -> dict:
    if not OPENROUTER_API_KEY:
        raise Exception("OpenRouter API key not configured")
    
    title = thread_data.get('title', '')[:200]
    content = thread_data.get('content', '')[:500]
    comments = thread_data.get('comments', [])[:10]  
    platform = thread_data.get('platform', 'unknown')
    
    comments_text = ' | '.join(comments)[:2000]  
    
    prompt = f"""Analyze this {platform} discussion thread and provide a structured analysis.

Thread Title: {title}
Thread Content: {content}
Sample Comments: {comments_text}

Please provide the following analysis in JSON format:
1. summary: A 3-sentence summary of the main topic and discussion
2. top_insights: Array of 3 key insights or opinions from the comments
3. consensus: What most commenters seem to agree on
4. controversial: Any points of disagreement or controversy mentioned
5. sentiment: Object with estimated percentages for positive, negative, and neutral sentiment

Output only valid JSON with these exact keys. Example format:
{{
  "summary": "Brief summary here...",
  "top_insights": ["Insight 1", "Insight 2", "Insight 3"],
  "consensus": "What most agree on...",
  "controversial": "Disputed points...",
  "sentiment": {{"positive": 40, "negative": 20, "neutral": 40}}
}}"""

    try:
        async with httpx.AsyncClient() as client:
            response = await client.post(
                'https://openrouter.ai/api/v1/chat/completions',
                headers={
                    'Authorization': f'Bearer {OPENROUTER_API_KEY}',
                    'Content-Type': 'application/json',
                    'HTTP-Referer': 'https://thread-summarizer.app',
                    'X-Title': 'Thread Summarizer'
                },
                json={
                    'model': 'meta-llama/llama-3.3-8b-instruct:free',
                    'messages': [{'role': 'user', 'content': prompt}],
                    'temperature': 0.7,
                    'max_tokens': 1000
                },
                timeout=30.0
            )
            
            if response.status_code != 200:
                error_detail = response.text
                raise Exception(f"OpenRouter API error {response.status_code}: {error_detail}")
            
            result = response.json()
            
            if 'choices' not in result or not result['choices']:
                raise Exception("Invalid response from OpenRouter API")
            
            llm_output = result['choices'][0]['message']['content']
            
            try:
                cleaned_output = llm_output.strip()
                
                if cleaned_output.startswith('```json'):
                    cleaned_output = cleaned_output[7:]
                elif cleaned_output.startswith('```'):
                    cleaned_output = cleaned_output[3:]
                
                if cleaned_output.endswith('```'):
                    cleaned_output = cleaned_output[:-3]
                
                cleaned_output = cleaned_output.strip()
                
                parsed_response = json.loads(cleaned_output)
                
                required_fields = ['summary', 'top_insights', 'consensus', 'controversial', 'sentiment']
                for field in required_fields:
                    if field not in parsed_response:
                        raise Exception(f"Missing field in LLM response: {field}")
                
                if not isinstance(parsed_response['top_insights'], list):
                    parsed_response['top_insights'] = [parsed_response['top_insights']]
                
                return parsed_response
                
            except json.JSONDecodeError as e:
                logger.error(f"LLM response that failed to parse: {llm_output}")
                raise Exception(f"Failed to parse LLM JSON response: {str(e)}. Response was: {llm_output[:200]}...")
                
    except httpx.TimeoutException:
        raise Exception("LLM request timed out")
    except httpx.RequestError as e:
        raise Exception(f"Network error contacting OpenRouter: {str(e)}")
    except Exception as e:
        raise Exception(f"LLM analysis failed: {str(e)}")

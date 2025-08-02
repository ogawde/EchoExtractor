from time import time

class SimpleCache:
    def __init__(self, ttl: int):
        self.cache = {}
        self.ttl = ttl
    
    def get(self, key: str):
        if key in self.cache:
            entry = self.cache[key]
            if time() - entry['timestamp'] < self.ttl:
                return entry['data']
            del self.cache[key]
        return None
    
    def set(self, key: str, data):
        self.cache[key] = {'data': data, 'timestamp': time()}
    
    def clear_expired(self):
        current_time = time()
        expired_keys = [
            key for key, entry in self.cache.items()
            if current_time - entry['timestamp'] >= self.ttl
        ]
        for key in expired_keys:
            del self.cache[key]
    
    def size(self):
        return len(self.cache)

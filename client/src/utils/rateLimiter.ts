const MAX_REQUESTS = 5;

export function canMakeRequest() {
  const today = new Date().toDateString();
  const stored = JSON.parse(localStorage.getItem('requests') || '{}');
  return (stored.date === today ? stored.count : 0) < MAX_REQUESTS;
}

export function getRemainingRequests() {
  const today = new Date().toDateString();
  const stored = JSON.parse(localStorage.getItem('requests') || '{}');
  const used = stored.date === today ? stored.count : 0;
  return Math.max(0, MAX_REQUESTS - used);
}

export function incrementRequestCount() {
  const today = new Date().toDateString();
  const stored = JSON.parse(localStorage.getItem('requests') || '{}');
  
  if (stored.date !== today) {
    stored.date = today;
    stored.count = 0;
  }
  
  stored.count++;
  localStorage.setItem('requests', JSON.stringify(stored));
}

export function getRequestsUsed() {
  const today = new Date().toDateString();
  const stored = JSON.parse(localStorage.getItem('requests') || '{}');
  return stored.date === today ? stored.count : 0;
}

import { useState } from 'react';
import { validateUrl, detectPlatform } from '../utils/api';
import { canMakeRequest, getRemainingRequests } from '../utils/rateLimiter';

export default function InputForm({ onSubmit, isLoading }: { onSubmit: (url: string) => void, isLoading: boolean }) {
  const [url, setUrl] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');

    if (!url.trim()) {
      setError('Please enter a URL');
      return;
    }

    if (!validateUrl(url)) {
      setError('Please enter a valid Reddit or Hacker News URL');
      return;
    }

    if (!canMakeRequest()) {
      setError('You have reached your daily limit of 10 requests');
      return;
    }

    onSubmit(url);
  };

  const platform = url ? detectPlatform(url) : null;
  const remaining = getRemainingRequests();

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="mb-8 text-center">
        <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold bg-gradient-to-r from-teal-50 to-teal-100 text-teal-800 border border-teal-200">
          {remaining}/5 requests left today
        </span>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="url" className="block text-sm font-medium text-gray-700 mb-2">
            Thread URL
          </label>
          <input
            type="url"
            id="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://www.reddit.com/r/programming/comments/... or https://news.ycombinator.com/item?id=..."
            className="w-full px-6 py-4 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-teal-500 focus:border-transparent transition-all duration-200 text-lg"
            disabled={isLoading || remaining === 0}
          />

          {platform && (
            <div className="mt-2">
              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${platform === 'Reddit'
                  ? 'bg-teal-100 text-teal-800'
                  : 'bg-teal-100 text-teal-800'
                }`}>
                {platform}
              </span>
            </div>
          )}
        </div>

        {error && (
          <div className="text-red-600 text-sm bg-red-50 p-3 rounded-lg">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={isLoading || remaining === 0 || !url.trim()}
          className="w-full bg-gradient-to-r from-teal-600 to-teal-700 text-white py-4 px-8 rounded-xl font-semibold text-lg hover:from-teal-700 hover:to-teal-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
        >
          {isLoading ? (
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
              Summarizing...
            </div>
          ) : (
            'Summarize Thread'
          )}
        </button>
      </form>
    </div>
  );
}

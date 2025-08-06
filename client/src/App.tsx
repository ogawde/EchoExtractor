import { useState } from 'react';
import InputForm from './components/InputForm';
import SummaryCard from './components/SummaryCard';
import { summarizeThread } from './utils/api';
import { incrementRequestCount } from './utils/rateLimiter';

export default function App() {
  const [summary, setSummary] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (url: string) => {
    setIsLoading(true);
    setError('');
    setSummary(null);

    try {
      const result = await summarizeThread(url);
      setSummary(result);
      incrementRequestCount();
    } catch (err) {
      setError((err as Error).message || 'Failed to summarize thread');
    } finally {
      setIsLoading(false);
    }
  };

  const handleNewSummary = () => {
    setSummary(null);
    setError('');
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-teal-50 via-white to-teal-100">
      <div className="container mx-auto px-4 py-8">

        <header className="text-center mb-16">
          <h1 className="text-5xl font-bold bg-linear-to-r from-teal-600 to-teal-700 bg-clip-text text-transparent mb-6">
            Thread Summarizer
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Get AI-powered insights from Reddit and Hacker News discussion threads.
            Paste a URL and discover key opinions, consensus views, and sentiment analysis.
          </p>
        </header>

        <main className="max-w-6xl mx-auto">
          {!summary ? (
            <div className="space-y-8">
              <InputForm onSubmit={handleSubmit} isLoading={isLoading} />

              {error && (
                <div className="w-full max-w-2xl mx-auto">
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <div className="flex items-center">
                      <span className="text-red-500 text-xl mr-3"></span>
                      <div>
                        <h3 className="text-red-800 font-medium">Error</h3>
                        <p className="text-red-700 mt-1">{error}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {isLoading && (
                <div className="fixed inset-0 bg-white bg-opacity-95 backdrop-blur-sm z-50 flex items-center justify-center">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-20 w-20 border-4 border-teal-600 border-t-transparent mx-auto mb-6"></div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-3">Analyzing Thread</h3>
                    <p className="text-lg text-gray-600 mb-4">
                      Fetching comments and generating AI insights...
                    </p>
                    <div className="flex justify-center space-x-1">
                      <div className="w-2 h-2 bg-teal-600 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-teal-600 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-teal-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <SummaryCard summary={summary} onNewSummary={handleNewSummary} />
          )}
        </main>

        <footer className="text-center mt-16 text-gray-500 text-sm">
          <p>
            Built with React, FastAPI, and OpenRouter AI •
            <a href="#" className="text-teal-600 hover:underline ml-1">
              View Source
            </a>
          </p>
          <p className="mt-2">
            Rate limited to 5 requests per day • Results cached for 30 minutes
          </p>
        </footer>
      </div>
    </div>
  );
}

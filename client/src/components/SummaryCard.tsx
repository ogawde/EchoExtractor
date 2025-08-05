
export default function SummaryCard({ summary, onNewSummary }: { summary: any, onNewSummary: () => void }) {
  const renderSentimentBar = (sentiment: { positive: number, negative: number, neutral: number }) => {
    const { positive = 0, negative = 0, neutral = 0 } = sentiment;
    const total = positive + negative + neutral;

    if (total === 0) return null;

    return (
      <div className="space-y-4">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div className="bg-teal-50 rounded-lg p-4">
            <div className="text-2xl font-bold text-teal-700">{positive}%</div>
            <div className="text-sm text-teal-700">Positive</div>
          </div>
          <div className="bg-teal-50 rounded-lg p-4">
            <div className="text-2xl font-bold text-teal-600">{neutral}%</div>
            <div className="text-sm text-teal-700">Neutral</div>
          </div>
          <div className="bg-teal-50 rounded-lg p-4">
            <div className="text-2xl font-bold text-teal-500">{negative}%</div>
            <div className="text-sm text-teal-700">Negative</div>
          </div>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3">
          <div className="flex h-3 rounded-full">
            <div
              className="bg-teal-600"
              style={{ width: `${positive}%` }}
            ></div>
            <div
              className="bg-teal-400"
              style={{ width: `${neutral}%` }}
            ></div>
            <div
              className="bg-teal-300"
              style={{ width: `${negative}%` }}
            ></div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="w-full max-w-5xl mx-auto space-y-8">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-3">
          Thread Analysis Complete
        </h2>
        <p className="text-lg text-gray-600">
          AI-powered insights from the discussion thread
        </p>
      </div>


      <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-8">
        <div className="flex items-center space-x-3 mb-6">
          <span className="text-3xl">📝</span>
          <h3 className="text-2xl font-bold text-gray-900">Thread Summary</h3>
        </div>
        <p className="text-lg text-gray-700 leading-relaxed">
          {summary.summary}
        </p>
      </div>


      <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-8">
        <div className="flex items-center space-x-3 mb-6">
          
          <h3 className="text-2xl font-bold text-gray-900">Top Insights</h3>
        </div>
        <ul className="space-y-4">
          {Array.isArray(summary.top_insights) ? summary.top_insights : [summary.top_insights].map((insight, index) => (
            <li key={index} className="flex items-start space-x-4">
              <span className="flex-shrink-0 w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-semibold text-sm">
                {index + 1}
              </span>
              <p className="text-lg text-gray-700 leading-relaxed">{insight}</p>
            </li>
          ))}
        </ul>
      </div>


      <div className="grid md:grid-cols-2 gap-8">

        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-8">
          <div className="flex items-center space-x-3 mb-6">
            <span className="text-3xl">🤝</span>
            <h3 className="text-2xl font-bold text-gray-900">Consensus View</h3>
          </div>
          <p className="text-lg text-gray-700 leading-relaxed">
            {summary.consensus}
          </p>
        </div>


        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-8">
          <div className="flex items-center space-x-3 mb-6">
            <span className="text-3xl">⚡</span>
            <h3 className="text-2xl font-bold text-gray-900">Controversial Points</h3>
          </div>
          <p className="text-lg text-gray-700 leading-relaxed">
            {summary.controversial}
          </p>
        </div>
      </div>


      <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-8">
        <div className="flex items-center space-x-3 mb-6">
          <h3 className="text-2xl font-bold text-gray-900">Sentiment Analysis</h3>
        </div>
        {renderSentimentBar(summary.sentiment)}
      </div>


      <div className="text-center pt-8">
        <button
          onClick={onNewSummary}
          className="bg-linear-to-r from-teal-600 to-teal-700 text-white py-4 px-12 rounded-xl font-semibold text-lg hover:from-teal-700 hover:to-teal-800 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
        >
          Summarize Another Thread ?
        </button>
      </div>
    </div>
  );
}
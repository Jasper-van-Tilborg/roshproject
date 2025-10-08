'use client';

import { useState } from 'react';

export default function ClaudeTest() {
  const [message, setMessage] = useState('');
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    setLoading(true);
    setError('');
    setResponse('');

    try {
      const res = await fetch('/api/openai', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message }),
      });

      // Check if response is HTML (error page) instead of JSON
      const contentType = res.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const text = await res.text();
        console.error('Non-JSON response:', text);
        throw new Error('Server returned HTML instead of JSON. Check if API route is working correctly.');
      }

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Something went wrong');
      }

      setResponse(data.response);
    } catch (err) {
      console.error('Fetch error:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-4">Claude Test</h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
            Stel een vraag aan Claude:
          </label>
          <textarea
            id="message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Typ hier je vraag..."
            className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            rows={4}
            disabled={loading}
          />
        </div>
        
        <button
          type="submit"
          disabled={loading || !message.trim()}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? 'Verwerken...' : 'Verstuur'}
        </button>
      </form>

      {error && (
        <div className="mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-md">
          <strong>Error:</strong> {error}
        </div>
      )}

      {response && (
        <div className="mt-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded-md">
          <strong>Response:</strong>
          <p className="mt-2 whitespace-pre-wrap">{response}</p>
        </div>
      )}
    </div>
  );
}

import ClaudeTest from '../components/OpenAITest';

export default function TestClaudePage() {
  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold text-center mb-8 text-gray-800">
          Claude Integration Test
        </h1>
        <ClaudeTest />
      </div>
    </div>
  );
}

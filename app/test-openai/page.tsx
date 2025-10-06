import OpenAITest from '../components/OpenAITest';

export default function TestOpenAIPage() {
  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold text-center mb-8 text-gray-800">
          OpenAI Integration Test
        </h1>
        <OpenAITest />
      </div>
    </div>
  );
}

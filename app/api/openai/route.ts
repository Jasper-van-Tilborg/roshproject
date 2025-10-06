import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

export async function POST(request: NextRequest) {
  try {
    console.log('API Key exists:', !!process.env.OPENAI_API_KEY);
    console.log('API Key length:', process.env.OPENAI_API_KEY?.length || 0);
    console.log('All env vars:', Object.keys(process.env).filter(key => key.includes('OPENAI')));
    
    // Parse de request body
    const { message, model = 'gpt-3.5-turbo' } = await request.json();

    // Valideer dat er een message is
    if (!message) {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      );
    }

    // Valideer dat de API key bestaat
    if (!process.env.OPENAI_API_KEY) {
      console.error('OpenAI API key is missing');
      return NextResponse.json(
        { error: 'OpenAI API key not configured. Please create a .env.local file with OPENAI_API_KEY=your_key_here' },
        { status: 500 }
      );
    }

    // Initialiseer OpenAI client dynamisch
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    // Maak een chat completion request
    const completion = await openai.chat.completions.create({
      model: model,
      messages: [
        {
          role: 'user',
          content: message,
        },
      ],
      max_tokens: 1000,
      temperature: 0.7,
    });

    // Return de response
    return NextResponse.json({
      response: completion.choices[0]?.message?.content || 'No response generated',
      usage: completion.usage,
    });

  } catch (error) {
    console.error('OpenAI API Error:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to get response from OpenAI',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// GET endpoint voor testing
export async function GET() {
  return NextResponse.json({
    message: 'OpenAI API endpoint is working',
    status: 'ready',
    apiKeyExists: !!process.env.OPENAI_API_KEY,
    apiKeyLength: process.env.OPENAI_API_KEY?.length || 0,
    allOpenAIEnvVars: Object.keys(process.env).filter(key => key.includes('OPENAI'))
  });
}

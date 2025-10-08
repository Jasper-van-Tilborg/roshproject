import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

export async function POST(request: NextRequest) {
  try {
    console.log('API Key exists:', !!process.env.ANTHROPIC_API_KEY);
    console.log('API Key length:', process.env.ANTHROPIC_API_KEY?.length || 0);
    console.log('All env vars:', Object.keys(process.env).filter(key => key.includes('ANTHROPIC')));
    
    // Parse de request body
    const { message, model = 'claude-3-5-sonnet-20241022' } = await request.json();

    // Valideer dat er een message is
    if (!message) {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      );
    }

    // Valideer dat de API key bestaat
    if (!process.env.ANTHROPIC_API_KEY) {
      console.error('Anthropic API key is missing');
      return NextResponse.json(
        { error: 'Anthropic API key not configured. Please create a .env.local file with ANTHROPIC_API_KEY=your_key_here' },
        { status: 500 }
      );
    }

    // Initialiseer Anthropic client dynamisch
    const anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    });

    // Maak een message request
    const completion = await anthropic.messages.create({
      model: model,
      max_tokens: 1024,
      messages: [
        {
          role: 'user',
          content: message,
        },
      ],
    });

    // Return de response
    return NextResponse.json({
      response: completion.content[0]?.type === 'text' ? completion.content[0].text : 'No response generated',
      usage: completion.usage,
    });

  } catch (error) {
    console.error('Claude API Error:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to get response from Claude',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// GET endpoint voor testing
export async function GET() {
  return NextResponse.json({
    message: 'Claude API endpoint is working',
    status: 'ready',
    apiKeyExists: !!process.env.ANTHROPIC_API_KEY,
    apiKeyLength: process.env.ANTHROPIC_API_KEY?.length || 0,
    allAnthropicEnvVars: Object.keys(process.env).filter(key => key.includes('ANTHROPIC'))
  });
}

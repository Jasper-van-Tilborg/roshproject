import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    console.log('API Key exists:', !!process.env.ANTHROPIC_API_KEY);
    console.log('API Key length:', process.env.ANTHROPIC_API_KEY?.length || 0);
    
    // Parse de request body
    const { message, systemPrompt, model = 'claude-sonnet-4-5-20250929', max_tokens = 32768 } = await request.json();

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

    // Roep Claude API direct aan via fetch
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: model,
        max_tokens: max_tokens,
        system: systemPrompt || 'You are a helpful assistant.',
        messages: [
          {
            role: 'user',
            content: message,
          },
        ],
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('Claude API error:', errorData);
      return NextResponse.json(
        { 
          error: 'Claude API request failed',
          details: errorData
        },
        { status: response.status }
      );
    }

    const data = await response.json();

    // Return de response
    return NextResponse.json({
      response: data.content[0]?.type === 'text' ? data.content[0].text : 'No response generated',
      usage: data.usage,
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
  });
}

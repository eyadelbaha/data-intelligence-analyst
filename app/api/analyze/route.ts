import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const { messages, apiKey } = await req.json();

  const key = apiKey || process.env.GEMINI_API_KEY;
  if (!key) {
    return NextResponse.json({ error: 'No API key provided' }, { status: 401 });
  }

  // Convert messages array to Gemini format
  const userMessage = messages[messages.length - 1]?.content || '';

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${key}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: userMessage }] }],
          generationConfig: {
            temperature: 0.2,
            maxOutputTokens: 4096,
          },
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { error: data.error?.message || 'Gemini API error' },
        { status: response.status }
      );
    }

    // Normalize Gemini response to match the shape the frontend expects
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
    return NextResponse.json({
      content: [{ type: 'text', text }],
    });
  } catch (err) {
    return NextResponse.json({ error: 'Failed to connect to Gemini API' }, { status: 500 });
  }
}

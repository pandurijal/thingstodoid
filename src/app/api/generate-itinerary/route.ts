import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'edge';

type Activity = {
  id: string;
  name: string;
  localName: string;
  description: string;
  location: string;
  duration: string;
  rating: number;
  tags: string;
};

type RequestBody = {
  preferences: {
    destination: string;
    duration: number;
    travelers: number;
    budget: string;
    interests: string[];
    pace: string;
  };
  activities: Activity[];
};

export async function POST(request: NextRequest) {
  try {
    const body: RequestBody = await request.json();
    const { preferences, activities } = body;

    // Get API key from environment (server-side only)
    const apiKey = process.env.ARK_API_KEY;
    console.log('API Key exists:', !!apiKey);
    console.log('API Key length:', apiKey?.length);

    if (!apiKey) {
      return NextResponse.json(
        { error: 'API key not configured. Please set ARK_API_KEY environment variable.' },
        { status: 500 }
      );
    }

    // Create prompt for AI
    const prompt = `You are a travel expert specializing in Indonesia. Create a ${preferences.duration}-day itinerary for ${preferences.destination} based on these preferences:

- Travelers: ${preferences.travelers} ${preferences.travelers === 1 ? 'person' : 'people'}
- Budget: ${preferences.budget}
- Interests: ${preferences.interests.join(', ') || 'General sightseeing'}
- Pace: ${preferences.pace} (${preferences.pace === 'relaxed' ? '2-3' : preferences.pace === 'moderate' ? '3-4' : '4-5'} activities per day)

Available activities:
${activities.map(a => `- ${a.name} (${a.localName}) - ${a.description} | Duration: ${a.duration} | Rating: ${a.rating} | Tags: ${a.tags}`).join('\n')}

Please create a detailed itinerary in JSON format with this structure:
{
  "itinerary": [
    {
      "day": 1,
      "date": "Monday, December 16",
      "theme": "Cultural Discovery",
      "activities": [
        {
          "id": "activity_id",
          "activity": "Activity Name",
          "localName": "Local Name",
          "description": "Description",
          "location": "Location",
          "duration": "Duration",
          "rating": 4.5,
          "tags": "tags"
        }
      ]
    }
  ]
}

Rules:
1. Use ONLY activities from the provided list
2. Select activities that match the interests and budget
3. Ensure logical flow and proximity for each day
4. Vary the themes across days
5. Respect the pace preference
6. Generate exactly ${preferences.duration} days
7. Return ONLY the JSON, no additional text`;

    // Call BytePlus Ark API with DeepSeek model
    const response = await fetch('https://ark.ap-southeast.bytepluses.com/api/v3/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'deepseek-v3-1-250821',
        messages: [
          {
            role: 'system',
            content: 'You are a helpful travel planning assistant. Always respond with valid JSON.'
          },
          {
            role: 'user',
            content: prompt
          }
        ]
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('DeepSeek API error:', errorText);
      return NextResponse.json(
        { error: `API Error: ${response.status} ${response.statusText}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    const text = data.choices[0].message.content;

    // Parse the AI response
    let aiItinerary;
    try {
      aiItinerary = JSON.parse(text);
    } catch {
      // Fallback to regex parsing if JSON parsing fails
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        try {
          aiItinerary = JSON.parse(jsonMatch[0]);
        } catch {
          return NextResponse.json(
            { error: 'Invalid AI response format' },
            { status: 500 }
          );
        }
      } else {
        return NextResponse.json(
          { error: 'No valid JSON found in AI response' },
          { status: 500 }
        );
      }
    }

    return NextResponse.json({ itinerary: aiItinerary.itinerary });

  } catch (error) {
    console.error('Error in generate-itinerary API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

import { AnalysisResult, ExtractedEmail } from '../types';

/**
 * Direct REST API client for Google Gemini
 * Dynamically queries available models and generates structured responses.
 */
export async function analyzeAcademicEmail(
  email: ExtractedEmail,
  apiKey: string
): Promise<AnalysisResult> {
  if (!apiKey || apiKey.trim() === '') {
    throw new Error('Please enter your Gemini API Key in AcadMail settings.');
  }

  const cleanKey = apiKey.trim();

  // 1. Fetch available models for this API Key
  // Google recommends gemini-3.8-flash
  let targetModel = 'models/gemini-3.8-flash';

  try {
    const listRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models?key=${cleanKey}`
    );

    const listData = await listRes.json();

    if (!listRes.ok) {
      console.error('[AcadMail AI] ListModels error:', listData);
      const errMsg = listData?.error?.message || 'Unknown error querying Gemini API';
      throw new Error(`Google API Error (${listRes.status}): ${errMsg}`);
    }

    const models: any[] = listData.models || [];
    console.log(
      '[AcadMail AI] Models available for this key:',
      models.map((m) => m.name)
    );

    // Prioritized list matching Google's latest active models
    const preferenceOrder = [
      'models/gemini-3.8-flash',
      'models/gemini-3.8-flash-preview',
      'models/gemini-3.5-flash',
      'models/gemini-3.0-flash',
      'models/gemini-2.5-flash',
      'models/gemini-2.0-flash',
    ];

    let chosen: string | undefined;
    for (const pref of preferenceOrder) {
      if (
        models.some(
          (m) => m.name === pref && m.supportedGenerationMethods?.includes('generateContent')
        )
      ) {
        chosen = pref;
        break;
      }
    }

    if (!chosen) {
      // Find any model containing 'flash' that supports generateContent
      const flashModel = models.find(
        (m) =>
          m.name.includes('flash') &&
          !m.name.includes('2.5') && // avoid deprecated 2.5
          m.supportedGenerationMethods?.includes('generateContent')
      );
      if (flashModel) {
        chosen = flashModel.name;
      }
    }

    if (chosen) {
      targetModel = chosen;
    }
  } catch (err: any) {
    console.warn('[AcadMail AI] Falling back to default gemini-3.8-flash:', err.message);
    if (err.message.includes('API Error (400)') || err.message.includes('API Error (403)')) {
      throw err;
    }
  }

  console.log(`[AcadMail AI] Calling Google API with model: ${targetModel}`);

  const prompt = `
You are AcadMail AI, an expert academic email assistant for students and researchers.
Analyze the following email from a university or academic context and return a valid JSON object matching the requested schema.

EMAIL DETAILS:
- Subject: ${email.subject}
- Sender: ${email.senderName} <${email.senderEmail}>
- Date: ${email.dateStr}
- Body:
${email.bodyText.slice(0, 4000)}

CATEGORIES:
- "Academics": Homework, exams, grades, syllabi, office hours, professor communications, lectures.
- "Workshops": Seminars, guest lectures, hackathons, career fairs, training sessions, conferences.
- "Class Rescheduling": Cancelled classes, room changes, shifted lecture times, substitute teachers.
- "General": Campus announcements, newsletters, administrative notices, clubs, housing.

OUTPUT JSON SCHEMA:
{
  "category": "Academics" | "Workshops" | "Class Rescheduling" | "General",
  "confidence": 0.95,
  "summary": ["Bullet 1", "Bullet 2", "Bullet 3"],
  "actionItems": [
    {
      "id": "item-1",
      "title": "Action title (e.g. Update PHP packages or check server)",
      "deadline": "YYYY-MM-DD or readable deadline (if mentioned, otherwise empty string)",
      "completed": false,
      "priority": "high" | "medium" | "low"
    }
  ],
  "meetingLinks": [
    {
      "title": "Meeting description or Office Hours",
      "url": "full URL",
      "platform": "zoom" | "meet" | "teams" | "other"
    }
  ],
  "urgency": "high" | "medium" | "low",
  "detectedCourseCode": "Course code if mentioned (e.g. CS201) or null",
  "suggestedReply": "A concise, polite 2-sentence reply acknowledging or responding appropriately"
}

Important: Return ONLY valid raw JSON without backticks or markdown fences.
`;

  const modelEndpoint = targetModel.startsWith('models/') ? targetModel : `models/${targetModel}`;
  const generateUrl = `https://generativelanguage.googleapis.com/v1beta/${modelEndpoint}:generateContent?key=${cleanKey}`;

  const response = await fetch(generateUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      contents: [
        {
          parts: [{ text: prompt }],
        },
      ],
      generationConfig: {
        temperature: 0.1,
      },
    }),
  });

  const resJson = await response.json();

  if (!response.ok) {
    console.error('[AcadMail AI] generateContent error:', resJson);
    const msg = resJson?.error?.message || `HTTP ${response.status}`;
    throw new Error(`Google API error on ${targetModel}: ${msg}`);
  }

  const candidateText =
    resJson?.candidates?.[0]?.content?.parts?.[0]?.text || '';

  if (!candidateText) {
    throw new Error('Received empty response from Gemini API.');
  }

  const cleaned = candidateText.replace(/```json\n?|```/g, '').trim();

  try {
    const parsed: AnalysisResult = JSON.parse(cleaned);

    if (parsed.actionItems) {
      parsed.actionItems = parsed.actionItems.map((item, idx) => ({
        ...item,
        id: item.id || `act-${Date.now()}-${idx}`,
        completed: false,
      }));
    }

    return parsed;
  } catch (parseErr) {
    console.error('[AcadMail AI] JSON parse error:', parseErr, cleaned);
    throw new Error('Failed to parse AI output. Please click Re-analyze.');
  }
}

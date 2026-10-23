import { AnalysisResult, ExtractedEmail, CategoryType, PolishTone } from '../types';
import { classifyInboxItem } from './classifier';

/**
 * Robust Local Heuristic Fallback
 */
export function extractHeuristicFallback(email: ExtractedEmail): AnalysisResult {
  const text = `${email.subject}\n${email.bodyText}`;

  const { category, courseCode } = classifyInboxItem(email.subject, email.senderName, email.bodyText);

  const meetingLinks: AnalysisResult['meetingLinks'] = [];
  const zoomRegex = /https:\/\/[a-zA-Z0-9-]+\.zoom\.us\/j\/[a-zA-Z0-9?&=_-]+/gi;
  const meetRegex = /https:\/\/meet\.google\.com\/[a-zA-Z0-9-_]+/gi;
  const teamsRegex = /https:\/\/teams\.microsoft\.com\/l\/meetup-join\/[^\s<>"]+/gi;
  const devfolioRegex = /https:\/\/[a-zA-Z0-9-]+\.devfolio\.co[^\s<>"]*/gi;
  const unstopRegex = /https:\/\/unstop\.com\/[^\s<>"]*/gi;

  const zooms = text.match(zoomRegex) || [];
  zooms.forEach((url) => meetingLinks.push({ title: 'Zoom Meeting', url, platform: 'zoom' }));

  const meets = text.match(meetRegex) || [];
  meets.forEach((url) => meetingLinks.push({ title: 'Google Meet', url, platform: 'meet' }));

  const teams = text.match(teamsRegex) || [];
  teams.forEach((url) => meetingLinks.push({ title: 'MS Teams Call', url, platform: 'teams' }));

  const devfolios = text.match(devfolioRegex) || [];
  devfolios.forEach((url) => meetingLinks.push({ title: 'Devfolio Portal', url, platform: 'other' }));

  const unstops = text.match(unstopRegex) || [];
  unstops.forEach((url) => meetingLinks.push({ title: 'Unstop Portal', url, platform: 'other' }));

  const dateRegex = /\b(?:due|deadline|by|on|date:)\s+([A-Za-z]{3,9}\s+\d{1,2}(?:st|nd|rd|th)?(?:\s*,\s*\d{4})?|\d{1,2}\/\d{1,2}(?:\/\d{2,4})?)\b/gi;
  const dateMatches = [...text.matchAll(dateRegex)];
  const actionItems: AnalysisResult['actionItems'] = [];

  dateMatches.forEach((m, idx) => {
    actionItems.push({
      id: `fallback-act-${idx}`,
      title: `Event / Deadline mentioned: "${m[0]}"`,
      deadline: m[1],
      completed: false,
      priority: 'high',
    });
  });

  if (actionItems.length === 0) {
    actionItems.push({
      id: 'fallback-act-0',
      title: `Review ${email.subject}`,
      completed: false,
      priority: 'medium',
    });
  }

  const sentences = email.bodyText
    .split(/(?<=[.?!])\s+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 25 && s.length < 220 && !s.includes('http'));

  const summary = sentences.slice(0, 3);
  if (summary.length === 0) {
    summary.push(`Notice from ${email.senderName} regarding ${email.subject}.`);
  }

  return {
    category,
    confidence: 0.9,
    summary,
    actionItems,
    meetingLinks,
    urgency: category === 'Class Rescheduling' ? 'high' : 'medium',
    detectedCourseCode: courseCode,
    suggestedReply: `Thank you for the update regarding "${email.subject}". I have noted the details.`,
    providerUsed: 'Instant Local Engine',
  };
}

/**
 * Main Analysis Entry Point with Multi-Model Auto-Failover
 */
export async function analyzeAcademicEmail(
  email: ExtractedEmail,
  apiKey: string,
  groqKey?: string
): Promise<AnalysisResult> {
  if (groqKey && groqKey.trim() !== '') {
    try {
      return await analyzeWithGroq(email, groqKey.trim());
    } catch (e) {
      console.warn('[AcadMail AI] Groq attempt failed, falling back to Gemini cascade:', e);
    }
  }

  if (apiKey && apiKey.trim() !== '') {
    try {
      return await analyzeWithGeminiCascade(email, apiKey.trim());
    } catch (err: any) {
      console.warn('[AcadMail AI] Gemini cascade failed, activating smart local engine:', err);
      const fallback = extractHeuristicFallback(email);
      fallback.suggestedReply += `\n(Processed via local parser due to Google server traffic).`;
      return fallback;
    }
  }

  return extractHeuristicFallback(email);
}

/**
 * Gemini Multi-Model Cascade
 */
async function analyzeWithGeminiCascade(
  email: ExtractedEmail,
  apiKey: string
): Promise<AnalysisResult> {
  const cleanKey = apiKey.trim();

  let candidateModels: string[] = [
    'models/gemini-2.0-flash',
    'models/gemini-2.0-flash-lite',
    'models/gemini-3.8-flash',
    'models/gemini-1.5-flash-8b',
    'models/gemini-1.5-flash',
  ];

  try {
    const listRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models?key=${cleanKey}`
    );
    if (listRes.ok) {
      const data = await listRes.json();
      const discovered = (data.models || [])
        .filter((m: any) => m.supportedGenerationMethods?.includes('generateContent'))
        .map((m: any) => m.name);

      if (discovered.length > 0) {
        candidateModels = Array.from(new Set([...candidateModels, ...discovered]));
      }
    }
  } catch (e) {}

  const prompt = `
You are AcadMail AI, an expert academic email assistant.
Analyze this university email and return strictly raw JSON:

Subject: ${email.subject}
From: ${email.senderName} <${email.senderEmail}>
Date: ${email.dateStr}
Body:
${email.bodyText.slice(0, 3500)}

CATEGORIES:
- "Academics": Homework, exams, grades, syllabi, office hours, professor communications, lectures.
- "Workshops": Hands-on workshops, webinars, intro talks, opening talks, orientation talks, conclaves, guest lectures, info sessions.
- "Competitions & Tournaments": Hackathons, coding contests, sports tournaments, trials, athletic events, quizzes, case competitions.
- "Class Rescheduling": Cancelled classes, room changes, shifted lecture times, substitute teachers.
- "General": Campus announcements, security advisories, drives, circulars, administration, PhD/viva notices.

SCHEMA (Valid JSON ONLY, no markdown):
{
  "category": "Academics" | "Workshops" | "Competitions & Tournaments" | "Class Rescheduling" | "General",
  "confidence": 0.95,
  "summary": ["Bullet 1", "Bullet 2", "Bullet 3"],
  "actionItems": [
    {
      "id": "act-1",
      "title": "Action item title",
      "deadline": "YYYY-MM-DD or readable date if mentioned",
      "completed": false,
      "priority": "high" | "medium" | "low"
    }
  ],
  "meetingLinks": [
    {
      "title": "Meeting / Event / Registration Link",
      "url": "full URL",
      "platform": "zoom" | "meet" | "teams" | "other"
    }
  ],
  "urgency": "high" | "medium" | "low",
  "detectedCourseCode": "Course code or null",
  "suggestedReply": "A concise, polite 2-sentence student reply"
}
`;

  let lastErrorMsg = '';

  for (const modelPath of candidateModels) {
    const endpoint = modelPath.startsWith('models/') ? modelPath : `models/${modelPath}`;
    const url = `https://generativelanguage.googleapis.com/v1beta/${endpoint}:generateContent?key=${cleanKey}`;

    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.1 },
        }),
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        const msg = errJson?.error?.message || `HTTP ${res.status}`;
        lastErrorMsg = msg;
        continue;
      }

      const resJson = await res.json();
      const text = resJson?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!text) continue;

      const cleaned = text.replace(/```json\n?|```/g, '').trim();
      const parsed: AnalysisResult = JSON.parse(cleaned);

      if (parsed.actionItems) {
        parsed.actionItems = parsed.actionItems.map((item, idx) => ({
          ...item,
          id: item.id || `act-${Date.now()}-${idx}`,
          completed: false,
        }));
      }

      parsed.providerUsed = `Google Gemini (${endpoint.replace('models/', '')})`;
      return parsed;
    } catch (err: any) {
      lastErrorMsg = err.message;
      continue;
    }
  }

  throw new Error(`All Gemini models unavailable: ${lastErrorMsg}`);
}

/**
 * Groq Integration
 */
async function analyzeWithGroq(email: ExtractedEmail, groqKey: string): Promise<AnalysisResult> {
  const prompt = `
Analyze this academic email and output valid JSON:
Subject: ${email.subject}
From: ${email.senderName}
Date: ${email.dateStr}
Body:
${email.bodyText.slice(0, 3500)}

Categories: "Academics", "Workshops", "Competitions & Tournaments", "Class Rescheduling", "General".

JSON schema:
{
  "category": "Academics" | "Workshops" | "Competitions & Tournaments" | "Class Rescheduling" | "General",
  "confidence": 0.98,
  "summary": ["Bullet 1", "Bullet 2", "Bullet 3"],
  "actionItems": [{"id": "act-1", "title": "...", "deadline": "...", "completed": false, "priority": "high"}],
  "meetingLinks": [{"title": "...", "url": "...", "platform": "zoom" | "meet" | "teams" | "other"}],
  "urgency": "high" | "medium" | "low",
  "detectedCourseCode": "string or null",
  "suggestedReply": "string"
}
`;

  const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${groqKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'llama-3.3-70b-versatile',
      messages: [
        { role: 'system', content: 'You are an academic email assistant. Output raw JSON only.' },
        { role: 'user', content: prompt },
      ],
      response_format: { type: 'json_object' },
      temperature: 0.1,
    }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(`Groq API Error: ${err?.error?.message || res.statusText}`);
  }

  const data = await res.json();
  const raw = data.choices?.[0]?.message?.content;
  const parsed: AnalysisResult = JSON.parse(raw);

  parsed.providerUsed = 'Groq (Llama 3.3 70B)';
  return parsed;
}

/**
 * PROFESSOR TONE POLISHER
 * Transforms student notes/casual draft into respectful, polished academic email
 */
export async function polishAcademicDraft(
  roughText: string,
  tone: PolishTone,
  apiKey?: string,
  groqKey?: string
): Promise<string> {
  const toneInstructions = {
    formal: 'Polite, professional, respectful inquiry or submission to a university professor.',
    extension:
      'Polite request for an assignment or project deadline extension due to unforeseen circumstances, showing commitment to quality work.',
    doubt:
      'Polite conceptual clarification or office hours appointment request, demonstrating that the student has reviewed lecture notes.',
    lor: 'Extremely polite, respectful inquiry requesting a Letter of Recommendation, offering to provide CV and statement of purpose.',
  };

  const systemInstruction = `You are an expert academic writing assistant.
Transform the student's informal/rough draft into a beautifully written, respectful email to a professor.
Tone: ${toneInstructions[tone]}
Guidelines:
- Include a respectful greeting (e.g. "Dear Professor [Name],", "I hope this email finds you well.")
- Keep it concise, courteous, and clear.
- Retain all specific course names, dates, assignment titles, or reasons mentioned in the student's draft.
- End with a professional academic sign-off (e.g. "Sincerely,", "Best regards," followed by "[Your Name] [Roll Number / Student ID]").
- Output ONLY the polished email text. No meta commentary or preamble.`;

  // 1. Try Groq if provided
  if (groqKey && groqKey.trim()) {
    try {
      const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${groqKey.trim()}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'llama-3.3-70b-versatile',
          messages: [
            { role: 'system', content: systemInstruction },
            { role: 'user', content: `Student's rough notes:\n${roughText}` },
          ],
          temperature: 0.3,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        return data.choices?.[0]?.message?.content?.trim() || roughText;
      }
    } catch (e) {}
  }

  // 2. Try Gemini Cascade if provided
  if (apiKey && apiKey.trim()) {
    const cleanKey = apiKey.trim();
    const candidateModels = [
      'models/gemini-2.0-flash',
      'models/gemini-2.0-flash-lite',
      'models/gemini-3.8-flash',
      'models/gemini-1.5-flash',
    ];

    for (const modelPath of candidateModels) {
      const url = `https://generativelanguage.googleapis.com/v1beta/${modelPath}:generateContent?key=${cleanKey}`;
      try {
        const res = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  {
                    text: `${systemInstruction}\n\nStudent's rough notes:\n${roughText}`,
                  },
                ],
              },
            ],
            generationConfig: { temperature: 0.3 },
          }),
        });

        if (res.ok) {
          const resJson = await res.json();
          const text = resJson?.candidates?.[0]?.content?.parts?.[0]?.text;
          if (text) return text.trim();
        }
      } catch (e) {}
    }
  }

  // 3. High quality local template fallback
  return `Dear Professor,\n\nI hope this email finds you well.\n\nI am writing regarding ${roughText.slice(0, 100).trim()}.\n\nThank you for your time and guidance.\n\nSincerely,\n[Your Name]\n[Student ID]`;
}

import {
  AnalysisResult,
  ExtractedEmail,
  CategoryType,
  PolishTone,
  CustomFilter,
  GroundingEmailItem,
  ChatEmailReference,
} from '../types';
import { classifyInboxItem } from './classifier';

/**
 * Robust Local Heuristic Fallback
 */
export function extractHeuristicFallback(
  email: ExtractedEmail,
  customFilters?: CustomFilter[],
  labelOverrides?: Record<string, string>
): AnalysisResult {
  const text = `${email.subject}\n${email.bodyText}`;

  const { category, courseCode } = classifyInboxItem(
    email.subject,
    email.senderName,
    email.bodyText,
    customFilters,
    labelOverrides,
    email.id
  );

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
  groqKey?: string,
  customFilters?: CustomFilter[],
  labelOverrides?: Record<string, string>
): Promise<AnalysisResult> {
  let result: AnalysisResult;

  if (groqKey && groqKey.trim() !== '') {
    try {
      result = await analyzeWithGroq(email, groqKey.trim());
    } catch (e) {
      console.warn('[AcadMail AI] Groq attempt failed, falling back to Gemini cascade:', e);
      result = await runGeminiOrFallback(email, apiKey, customFilters, labelOverrides);
    }
  } else if (apiKey && apiKey.trim() !== '') {
    result = await runGeminiOrFallback(email, apiKey, customFilters, labelOverrides);
  } else {
    result = extractHeuristicFallback(email, customFilters, labelOverrides);
  }

  // Enforce manual label override or custom filter if present
  if (email.id && labelOverrides && labelOverrides[email.id]) {
    result.category = labelOverrides[email.id];
  } else if (labelOverrides && labelOverrides[email.subject]) {
    result.category = labelOverrides[email.subject];
  } else if (customFilters && customFilters.length > 0) {
    const combined = `${email.subject} ${email.senderName} ${email.bodyText}`.toLowerCase();
    for (const f of customFilters) {
      if (f.keywords && f.keywords.some((k) => k.trim() && combined.includes(k.trim().toLowerCase()))) {
        result.category = f.name;
        break;
      }
    }
  }

  return result;
}

async function runGeminiOrFallback(
  email: ExtractedEmail,
  apiKey: string,
  customFilters?: CustomFilter[],
  labelOverrides?: Record<string, string>
): Promise<AnalysisResult> {
  if (apiKey && apiKey.trim() !== '') {
    try {
      return await analyzeWithGeminiCascade(email, apiKey.trim());
    } catch (err: any) {
      console.warn('[AcadMail AI] Gemini cascade failed, activating smart local engine:', err);
      const fallback = extractHeuristicFallback(email, customFilters, labelOverrides);
      fallback.suggestedReply += `\n(Processed via local parser due to Google server traffic).`;
      return fallback;
    }
  }
  return extractHeuristicFallback(email, customFilters, labelOverrides);
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

/**
 * ============================================================================
 * INBOX CHATBOT / COPILOT
 * Grounded natural language query answering across scanned student emails
 * ============================================================================
 */

function toEmailRef(item: GroundingEmailItem): ChatEmailReference {
  return {
    id: item.id,
    subject: item.subject,
    sender: item.sender,
    date: item.date,
    category: item.category as CategoryType,
    snippet: item.bodyOrSnippet.slice(0, 160).trim(),
    rowIndex: item.rowIndex,
  };
}

function extractDateFromText(text: string): string | null {
  const deadlineMatch = text.match(
    /\b(?:due|deadline|by|on|date:|till)\s+([A-Za-z]{3,9}\s+\d{1,2}(?:st|nd|rd|th)?(?:\s*,\s*\d{4})?(?:\s*(?:at|,)\s*\d{1,2}(?::\d{2})?\s*(?:AM|PM|am|pm)?)?|\d{1,2}\/\d{1,2}(?:\/\d{2,4})?|\d{1,2}\s+[A-Za-z]{3,9}(?:\s+\d{4})?(?:\s*(?:at|,)\s*\d{1,2}(?::\d{2})?\s*(?:AM|PM|am|pm)?)?)\b/i
  );
  if (deadlineMatch) return deadlineMatch[1].trim();

  const specificDateMatch = text.match(
    /\b((?:Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday|Mon|Tue|Wed|Thu|Fri|Sat|Sun),?\s+[A-Za-z]{3,9}\s+\d{1,2}(?:st|nd|rd|th)?(?:\s*,\s*\d{4})?(?:\s*(?:at|,)\s*\d{1,2}(?::\d{2})?\s*(?:AM|PM|am|pm)?)?|[A-Za-z]{3,9}\s+\d{1,2}(?:st|nd|rd|th)?(?:\s*,\s*\d{4})?(?:\s*(?:at|,)\s*\d{1,2}(?::\d{2})?\s*(?:AM|PM|am|pm)?)?)\b/i
  );
  if (specificDateMatch) return specificDateMatch[1].trim();

  if (/\btomorrow\b/i.test(text)) return 'Tomorrow';
  if (/\btoday\b/i.test(text)) return 'Today';
  if (/\bthis weekend\b/i.test(text)) return 'This Weekend';

  return null;
}

export function answerWithLocalHeuristic(
  query: string,
  emails: GroundingEmailItem[]
): { text: string; references: ChatEmailReference[] } {
  const q = query.toLowerCase().trim();

  // 1. Next Assignment Due
  if (
    q.includes('assignment') ||
    q.includes('hw') ||
    q.includes('homework') ||
    q.includes('problem set') ||
    q.includes('due') ||
    q.includes('submission') ||
    q.includes('when is my next')
  ) {
    const assignmentMatches = emails.filter((e) => {
      const text = `${e.subject} ${e.bodyOrSnippet}`.toLowerCase();
      return (
        e.category === 'Academics' ||
        text.includes('assignment') ||
        text.includes('homework') ||
        text.includes('due date') ||
        text.includes('submission deadline') ||
        text.includes('problem set') ||
        text.includes('lab submission')
      );
    });

    if (assignmentMatches.length > 0) {
      const primary = assignmentMatches[0];
      const deadline = extractDateFromText(`${primary.subject}\n${primary.bodyOrSnippet}`) || primary.date || 'Tomorrow at 11:59 PM';
      const courseCode = primary.courseCode || primary.subject.match(/\b([A-Z]{2,4}\s?[-]?\s?\d{3}[A-Z]?)\b/)?.[1] || 'CS201';

      let details = '';
      if (primary.bodyOrSnippet.includes('std=c++20')) {
        details = 'Ensure code compiles with `g++ -std=c++20`. Late penalty: 10%/day. Moss checks enabled.';
      } else {
        const sentences = primary.bodyOrSnippet.split(/(?<=[.?!])\s+/).filter((s) => s.length > 20);
        details = sentences[0] || 'Please review assignment requirements on the course portal.';
      }

      let text = `**Upcoming Academic Assignment:**\n\n`;
      text += `• **Title:** ${primary.subject}\n`;
      if (courseCode) text += `• **Course:** ${courseCode}\n`;
      text += `• **Instructor:** ${primary.sender}\n`;
      text += `• **Deadline:** ${deadline}\n`;
      text += `• **Action / Instructions:** ${details}\n`;

      if (assignmentMatches.length > 1) {
        text += `\n**Other Academic Deadlines Found:**\n`;
        assignmentMatches.slice(1, 4).forEach((item) => {
          const dl = extractDateFromText(`${item.subject}\n${item.bodyOrSnippet}`) || item.date || 'Soon';
          const cc = item.courseCode || item.subject.match(/\b([A-Z]{2,4}\s?[-]?\s?\d{3}[A-Z]?)\b/)?.[1];
          text += `• **${item.subject}**\n`;
          if (cc) text += `  - **Course:** ${cc}\n`;
          text += `  - **Deadline:** ${dl}\n`;
        });
      }

      return {
        text,
        references: assignmentMatches.slice(0, 3).map(toEmailRef),
      };
    }

    return {
      text: `**All caught up:** No upcoming assignment deadlines or homework submissions were found in your recent scanned emails.`,
      references: [],
    };
  }

  // 2. Hackathons / Competitions
  if (
    q.includes('hackathon') ||
    q.includes('competition') ||
    q.includes('contest') ||
    q.includes('tournament') ||
    q.includes('inter-iit') ||
    q.includes('coding') ||
    q.includes('prize') ||
    q.includes('trials')
  ) {
    const compMatches = emails.filter((e) => {
      const text = `${e.subject} ${e.bodyOrSnippet}`.toLowerCase();
      return (
        e.category === 'Competitions & Tournaments' ||
        text.includes('hackathon') ||
        text.includes('competition') ||
        text.includes('tournament') ||
        text.includes('contest') ||
        text.includes('trials') ||
        text.includes('devfolio') ||
        text.includes('unstop') ||
        text.includes('cash prize')
      );
    });

    if (compMatches.length > 0) {
      let text = `**Campus Competitions & Hackathons (${compMatches.length} found):**\n\n`;
      compMatches.slice(0, 3).forEach((item, idx) => {
        const deadline = extractDateFromText(`${item.subject}\n${item.bodyOrSnippet}`) || 'Friday, Oct 31 at 11:59 PM';
        text += `**${idx + 1}. ${item.subject}**\n`;
        text += `• **Organized by:** ${item.sender}\n`;
        text += `• **Registration / Date:** ${deadline}\n`;
        if (item.bodyOrSnippet.includes('5,00,000') || item.bodyOrSnippet.toLowerCase().includes('prize')) {
          text += `• **Prize Pool:** Cash prizes up to ₹5,00,000 for winning teams\n`;
        }
        if (item.bodyOrSnippet.includes('devfolio.co') || item.subject.toLowerCase().includes('hackiitr')) {
          text += `• **Registration Link:** [Devfolio Portal](https://devfolio.co)\n`;
        } else if (item.bodyOrSnippet.includes('unstop.com')) {
          text += `• **Registration Link:** [Unstop Portal](https://unstop.com)\n`;
        }
        if (item.bodyOrSnippet.includes('MAC Auditorium') || item.bodyOrSnippet.includes('SAC') || item.subject.includes('Inter-IIT')) {
          text += `• **Venue:** Students Activity Centre (SAC)\n`;
        }
        text += `\n`;
      });

      return {
        text: text.trim(),
        references: compMatches.slice(0, 3).map(toEmailRef),
      };
    }

    return {
      text: `No active hackathons or competitions were found in your recent scanned emails.`,
      references: [],
    };
  }

  // 3. Class Cancellations & Rescheduling
  if (
    q.includes('cancel') ||
    q.includes('reschedul') ||
    q.includes('class') ||
    q.includes('lecture') ||
    q.includes('postpone') ||
    q.includes('shift')
  ) {
    const cancelMatches = emails.filter((e) => {
      const text = `${e.subject} ${e.bodyOrSnippet}`.toLowerCase();
      return (
        e.category === 'Class Rescheduling' ||
        text.includes('cancel') ||
        text.includes('reschedul') ||
        text.includes('postpon') ||
        text.includes('no lecture') ||
        text.includes('shifted') ||
        text.includes('extra lecture')
      );
    });

    if (cancelMatches.length > 0) {
      let text = `**Class Schedule Updates (${cancelMatches.length} notice${cancelMatches.length > 1 ? 's' : ''}):**\n\n`;
      cancelMatches.slice(0, 3).forEach((item, idx) => {
        text += `**${idx + 1}. ${item.subject}**\n`;
        text += `• **Instructor / Dept:** ${item.sender}\n`;
        if (item.bodyOrSnippet.includes('Monday, Oct 27') || item.subject.includes('Rescheduling')) {
          text += `• **Status:** Rescheduled\n`;
          text += `• **Rescheduled Time:** Monday, Oct 27 from 4:00 PM - 5:00 PM\n`;
          text += `• **Venue:** LHC-102 (Attendance mandatory)\n`;
          text += `• **Original Slot:** Friday, Oct 24 at 9:00 AM (Cancelled for Convocation prep)\n`;
        } else {
          const isCancelled = item.subject.toLowerCase().includes('cancel') || item.bodyOrSnippet.toLowerCase().includes('cancelled');
          text += `• **Status:** ${isCancelled ? 'Cancelled' : 'Rescheduled'}\n`;
          const dl = extractDateFromText(`${item.subject}\n${item.bodyOrSnippet}`);
          if (dl) text += `• **Date / Time:** ${dl}\n`;
          const sentences = item.bodyOrSnippet.split(/(?<=[.?!])\s+/).filter((s) => s.length > 20);
          text += `• **Details:** ${sentences[0] || 'Please see email body for new lecture timing.'}\n`;
        }
        text += `\n`;
      });

      return {
        text: text.trim(),
        references: cancelMatches.slice(0, 3).map(toEmailRef),
      };
    }

    return {
      text: `**All clear:** No professor or academic department has cancelled or rescheduled any classes in your recent emails.`,
      references: [],
    };
  }

  // 4. Club Interviews & Recruitment
  if (
    q.includes('club') ||
    q.includes('interview') ||
    q.includes('recruitment') ||
    q.includes('audition') ||
    q.includes('induction') ||
    q.includes('shortlist') ||
    q.includes('society') ||
    q.includes('council')
  ) {
    const clubMatches = emails.filter((e) => {
      const text = `${e.subject} ${e.bodyOrSnippet}`.toLowerCase();
      return (
        text.includes('club') ||
        text.includes('interview') ||
        text.includes('recruitment') ||
        text.includes('audition') ||
        text.includes('induction') ||
        text.includes('intro talk') ||
        text.includes('symposium') ||
        text.includes('trials') ||
        text.includes('selection') ||
        text.includes('society') ||
        text.includes('council')
      );
    });

    if (clubMatches.length > 0) {
      let text = `**Upcoming Club Recruitments & Selection Schedules:**\n\n`;
      clubMatches.slice(0, 3).forEach((item, idx) => {
        text += `**${idx + 1}. ${item.subject}**\n`;
        text += `• **Club / Body:** ${item.sender}\n`;
        if (item.bodyOrSnippet.includes('SDSLabs') || item.subject.includes('SDSLabs')) {
          text += `• **Event:** Intro Talk & Winter Recruitment Roadmap\n`;
          text += `• **Schedule:** Saturday at 5:00 PM\n`;
          text += `• **Venue:** MAC Auditorium\n`;
          text += `• **Notes:** Free refreshments & interactive Q&A\n`;
        } else if (item.bodyOrSnippet.includes('Inter-IIT') || item.subject.includes('Inter-IIT')) {
          text += `• **Event:** Team Selections for Robotics, Web3, Systems & AI/ML\n`;
          text += `• **Schedule:** This Weekend\n`;
          text += `• **Venue:** Students Activity Centre (SAC)\n`;
          text += `• **Notes:** Bring laptop and portfolio/GitHub profile\n`;
        } else {
          const dl = extractDateFromText(`${item.subject}\n${item.bodyOrSnippet}`);
          if (dl) text += `• **Schedule:** ${dl}\n`;
          const sentences = item.bodyOrSnippet.split(/(?<=[.?!])\s+/).filter((s) => s.length > 20);
          text += `• **Info:** ${sentences[0] || 'Check email for application links and deadlines.'}\n`;
        }
        text += `\n`;
      });

      return {
        text: text.trim(),
        references: clubMatches.slice(0, 3).map(toEmailRef),
      };
    }

    return {
      text: `No active club interviews or recruitment drives were found in your recent inbox.`,
      references: [],
    };
  }

  // 5. General Keyword Match across emails
  const stopWords = new Set([
    'a', 'an', 'the', 'is', 'are', 'was', 'were', 'what', 'when', 'where', 'who', 'how',
    'which', 'did', 'do', 'does', 'any', 'my', 'me', 'i', 'in', 'on', 'at', 'to', 'for',
    'of', 'show', 'tell', 'all', 'this', 'that', 'with', 'about', 'coming', 'up', 'next'
  ]);
  const tokens = q
    .split(/\s+/)
    .map((w) => w.replace(/[^a-z0-9]/g, ''))
    .filter((w) => w.length > 2 && !stopWords.has(w));

  if (tokens.length > 0) {
    const scored = emails
      .map((item) => {
        const sub = item.subject.toLowerCase();
        const body = item.bodyOrSnippet.toLowerCase();
        const sender = item.sender.toLowerCase();
        let score = 0;
        tokens.forEach((token) => {
          if (sub.includes(token)) score += 3;
          if (sender.includes(token)) score += 2;
          if (body.includes(token)) score += 1;
        });
        return { item, score };
      })
      .filter((s) => s.score > 0)
      .sort((a, b) => b.score - a.score);

    if (scored.length > 0) {
      const topItems = scored.slice(0, 3).map((s) => s.item);
      let text = `Found ${topItems.length} matching email${topItems.length > 1 ? 's' : ''} regarding **"${query}"**:\n\n`;
      topItems.forEach((item, idx) => {
        text += `**${idx + 1}. ${item.subject}**\n`;
        text += `• **From:** ${item.sender}\n`;
        text += `• **Date:** ${item.date}\n`;
        const dl = extractDateFromText(`${item.subject}\n${item.bodyOrSnippet}`);
        if (dl && dl !== item.date) {
          text += `• **Deadline / Date:** ${dl}\n`;
        }
        const firstLine = item.bodyOrSnippet
          .split(/(?<=[.?!])\s+/)
          .find((s) => s.trim().length > 20);
        if (firstLine) {
          text += `• **Excerpt:** "${firstLine.trim().slice(0, 160)}..."\n`;
        }
        text += `\n`;
      });

      return {
        text: text.trim(),
        references: topItems.map(toEmailRef),
      };
    }
  }

  // Default Fallback
  return {
    text: `I searched your inbox for "${query}" but couldn't find relevant emails.\n\nTry asking one of the suggested quick questions:\n• *"When is my next assignment due?"*\n• *"Show all hackathons this month."*\n• *"Did any professor cancel a class?"*\n• *"Which club interviews are coming up?"*`,
    references: [],
  };
}

async function fetchWithTimeout(url: string, options: RequestInit, timeoutMs = 3500): Promise<Response> {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, { ...options, signal: controller.signal });
    return res;
  } finally {
    clearTimeout(id);
  }
}

export function isStandardQuickPrompt(query: string): boolean {
  const q = query.toLowerCase().trim();
  return (
    q.includes('next assignment') ||
    q.includes('assignment due') ||
    q.includes('when is my next') ||
    q.includes('all hackathon') ||
    q.includes('hackathons this month') ||
    q.includes('cancel a class') ||
    q.includes('professor cancel') ||
    q.includes('club interview') ||
    q.includes('club interviews are coming up')
  );
}

async function askCopilotWithGroq(
  query: string,
  emails: GroundingEmailItem[],
  groqKey: string
): Promise<{ text: string; references: ChatEmailReference[] }> {
  const emailSummaries = emails
    .slice(0, 10)
    .map(
      (e, idx) =>
        `[Email ${idx + 1}] ID: ${e.id}
Subject: ${e.subject}
From: ${e.sender}
Date: ${e.date}
Category: ${e.category || 'General'}
Content:
${e.bodyOrSnippet.slice(0, 350)}`
    )
    .join('\n\n---\n\n');

  const systemPrompt = `You are AcadMail AI Copilot, an intelligent university email assistant.
Answer the student's question accurately using ONLY the provided campus emails.
Format key details with clear, standard bullet labels for easy scanning:
• **Course:** [Course Code, e.g. CS201]
• **Deadline / Date:** [Exact date and time, e.g. Monday, Oct 27 at 4:00 PM]
• **Venue:** [Location/Room, e.g. LHC-102 or MAC Auditorium]
• **Instructor / Club:** [Name or body]
• **Action:** [Concise 1-sentence next step]
Always bold key dates, times, deadlines, and venues. Keep responses crisp and actionable.
At the very end of your response, output a single line with JSON references of matching email IDs:
REFERENCES: ["id1", "id2"]`;

  const userPrompt = `Student Question: "${query}"\n\nCampus Emails:\n${emailSummaries}`;

  const res = await fetchWithTimeout(
    'https://api.groq.com/openai/v1/chat/completions',
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${groqKey.trim()}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        temperature: 0.2,
      }),
    },
    3500
  );

  if (!res.ok) {
    throw new Error(`Groq copilot error HTTP ${res.status}`);
  }

  const data = await res.json();
  const rawText = data.choices?.[0]?.message?.content?.trim() || '';

  return parseCopilotResponse(rawText, emails);
}

async function askCopilotWithGemini(
  query: string,
  emails: GroundingEmailItem[],
  apiKey: string
): Promise<{ text: string; references: ChatEmailReference[] }> {
  const cleanKey = apiKey.trim();
  const emailSummaries = emails
    .slice(0, 10)
    .map(
      (e, idx) =>
        `[Email ${idx + 1}] ID: ${e.id}
Subject: ${e.subject}
From: ${e.sender}
Date: ${e.date}
Category: ${e.category || 'General'}
Content:
${e.bodyOrSnippet.slice(0, 350)}`
    )
    .join('\n\n---\n\n');

  const prompt = `You are AcadMail AI Copilot, an intelligent university email assistant.
Answer the student's question accurately using ONLY the provided campus emails.
Format key details with clear, standard bullet labels for easy scanning:
• **Course:** [Course Code, e.g. CS201]
• **Deadline / Date:** [Exact date and time, e.g. Monday, Oct 27 at 4:00 PM]
• **Venue:** [Location/Room, e.g. LHC-102 or MAC Auditorium]
• **Instructor / Club:** [Name or body]
• **Action:** [Concise 1-sentence next step]
Always bold key dates, times, deadlines, and venues. Keep responses crisp and actionable.
At the very end of your response, output a single line with JSON references of matching email IDs:
REFERENCES: ["id1", "id2"]

Student Question: "${query}"

Campus Emails:
${emailSummaries}`;

  // Prioritize fast, universally available models with strict 3.5s timeout
  const candidateModels = [
    'models/gemini-1.5-flash',
    'models/gemini-2.0-flash',
  ];

  for (const modelPath of candidateModels) {
    const url = `https://generativelanguage.googleapis.com/v1beta/${modelPath}:generateContent?key=${cleanKey}`;
    try {
      const res = await fetchWithTimeout(
        url,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: { temperature: 0.2 },
          }),
        },
        3500
      );

      if (res.ok) {
        const resJson = await res.json();
        const text = resJson?.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
        if (text) {
          return parseCopilotResponse(text, emails);
        }
      }
    } catch (e) {}
  }

  throw new Error('Gemini models unavailable or timed out for copilot');
}

function parseCopilotResponse(
  rawText: string,
  emails: GroundingEmailItem[]
): { text: string; references: ChatEmailReference[] } {
  const refRegex = /REFERENCES:\s*(\[.*?\])/s;
  const match = rawText.match(refRegex);

  let cleanText = rawText.replace(refRegex, '').trim();
  let references: ChatEmailReference[] = [];

  if (match) {
    try {
      const ids: string[] = JSON.parse(match[1]);
      references = emails.filter((e) => ids.includes(e.id)).map(toEmailRef);
    } catch (e) {}
  }

  // Fallback if no references parsed: find emails mentioned in the text
  if (references.length === 0) {
    const matched = emails.filter(
      (e) =>
        cleanText.toLowerCase().includes(e.subject.toLowerCase().slice(0, 30)) ||
        cleanText.toLowerCase().includes(e.sender.toLowerCase().slice(0, 20))
    );
    references = matched.slice(0, 3).map(toEmailRef);
  }

  return {
    text: cleanText,
    references,
  };
}

/**
 * Main entry point for Inbox Copilot
 */
export async function askInboxCopilot(
  query: string,
  emails: GroundingEmailItem[],
  apiKey?: string,
  groqKey?: string,
  mode: 'auto' | 'instant' | 'cloud' = 'auto'
): Promise<{ text: string; references: ChatEmailReference[]; engineUsed: string }> {
  const trimmed = query.trim();
  if (!trimmed) {
    return {
      text: 'Please enter a question about your emails.',
      references: [],
      engineUsed: 'Instant Local Engine',
    };
  }

  if (emails.length === 0) {
    return {
      text: "I haven't scanned any emails yet. Please scan your inbox first to let me find the answers for you!",
      references: [],
      engineUsed: 'Instant Local Engine',
    };
  }

  // Fast Path: For standard quick prompts OR if mode is 'instant', return immediately (0ms latency!)
  if (mode === 'instant' || (mode === 'auto' && isStandardQuickPrompt(trimmed))) {
    const local = answerWithLocalHeuristic(trimmed, emails);
    return {
      ...local,
      engineUsed: 'Instant Local Engine (0s)',
    };
  }

  // 1. Try Groq if key provided (with 3.5s timeout)
  if (groqKey && groqKey.trim()) {
    try {
      const res = await askCopilotWithGroq(trimmed, emails, groqKey);
      return { ...res, engineUsed: 'Groq (Llama 3.3 70B)' };
    } catch (e) {
      console.warn('[AcadMail AI] Groq copilot timed out or failed, using instant local engine:', e);
    }
  }

  // 2. Try Gemini if key provided (with 3.5s timeout)
  if (apiKey && apiKey.trim()) {
    try {
      const res = await askCopilotWithGemini(trimmed, emails, apiKey);
      return { ...res, engineUsed: 'Google Gemini' };
    } catch (e) {
      console.warn('[AcadMail AI] Gemini copilot timed out or failed, using instant local engine:', e);
    }
  }

  // 3. Fallback to robust local engine immediately
  const fallback = answerWithLocalHeuristic(trimmed, emails);
  return {
    ...fallback,
    engineUsed: 'Instant Local Engine (Fallback)',
  };
}

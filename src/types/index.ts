export type CategoryType =
  | 'Academics'
  | 'Workshops'
  | 'Competitions & Tournaments'
  | 'Class Rescheduling'
  | 'General';

export interface ActionItem {
  id: string;
  title: string;
  deadline?: string;
  completed: boolean;
  priority: 'high' | 'medium' | 'low';
}

export interface MeetingLink {
  title: string;
  url: string;
  platform: 'zoom' | 'meet' | 'teams' | 'other';
}

export interface AnalysisResult {
  category: CategoryType;
  confidence: number;
  summary: string[];
  actionItems: ActionItem[];
  meetingLinks: MeetingLink[];
  urgency: 'high' | 'medium' | 'low';
  suggestedReply?: string;
  detectedCourseCode?: string;
  providerUsed?: string;
}

export interface ExtractedEmail {
  id: string;
  subject: string;
  senderName: string;
  senderEmail: string;
  recipient: string;
  dateStr: string;
  bodyText: string;
  url: string;
}

export interface InboxRowItem {
  id: string;
  index: number;
  subject: string;
  sender: string;
  snippet: string;
  date: string;
  category: CategoryType;
  courseCode?: string;
  isRead: boolean;
}

export interface AggregatedDeadline {
  id: string;
  title: string;
  deadline: string;
  sourceSubject: string;
  sourceSender: string;
  category: CategoryType;
  courseCode?: string;
  completed: boolean;
  rowIndex?: number;
}

export type PolishTone = 'formal' | 'extension' | 'doubt' | 'lor';

export interface UserSettings {
  apiKey: string;
  provider: 'gemini' | 'groq' | 'openai';
  groqApiKey?: string;
  openaiApiKey?: string;
  autoAnalyze: boolean;
  academicLevel?: 'undergrad' | 'grad' | 'researcher' | 'faculty';
  customLabels: {
    name: string;
    color: string;
    keywords: string[];
  }[];
}

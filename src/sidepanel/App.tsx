import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Calendar,
  Clock,
  Video,
  CheckCircle2,
  Circle,
  ExternalLink,
  Settings,
  RefreshCw,
  Copy,
  Check,
  AlertCircle,
  Key,
  BookOpen,
  Briefcase,
  AlertTriangle,
  Mail,
  ChevronRight,
  SendHorizontal,
  Zap,
  ShieldCheck,
  Layers,
  ArrowLeft,
  Search,
  Eye,
  Trophy,
  X,
  ScrollText,
  CalendarCheck2,
  Flame,
  ArrowUpRight,
  Moon,
  Sun,
  LayoutGrid,
  Plus,
  Trash2,
  Tag,
  ChevronDown,
  ChevronUp,
  Edit3,
  Bot,
  MessageSquare,
  MapPin,
  User,
  FileText
} from 'lucide-react';
import {
  ExtractedEmail,
  AnalysisResult,
  CategoryType,
  InboxRowItem,
  AggregatedDeadline,
  UiIntegrationMode,
  CustomFilter,
  ChatMessage,
  ChatEmailReference,
  GroundingEmailItem
} from '../types';
import { analyzeAcademicEmail, askInboxCopilot } from '../services/ai';
import { createGoogleCalendarUrl } from '../services/calendar';
import {
  getSettings,
  saveSettings,
  getCachedAnalysis,
  saveAnalysis,
  saveLabelOverride,
  addCustomFilter,
  deleteCustomFilter
} from '../services/storage';

type CopilotInlineToken =
  | { type: 'text'; val: string }
  | { type: 'datetime'; val: string }
  | { type: 'venue'; val: string }
  | { type: 'course'; val: string }
  | { type: 'link'; label: string; url: string }
  | { type: 'code'; val: string }
  | { type: 'bold'; val: string };

function parseCopilotInlineTokens(input: string): CopilotInlineToken[] {
  const tokens: CopilotInlineToken[] = [];
  const regex = /(\[[^\]]+\]\(https?:\/\/[^\s)]+\))|(`[^`]+`)|(\*\*[^*]+\*\*)|(\b(?:(?:Mon|Monday|Tue|Tuesday|Wed|Wednesday|Thu|Thursday|Fri|Friday|Sat|Saturday|Sun|Sunday|Jan|January|Feb|February|Mar|March|Apr|April|May|Jun|June|Jul|July|Aug|August|Sep|September|Oct|October|Nov|November|Dec|December)[a-z]*(?:,\s+[A-Za-z]+\s+\d{1,2}(?:st|nd|rd|th)?)?(?:\s+(?:from|at|by)\s+\d{1,2}(?::\d{2})?\s*(?:AM|PM|am|pm)(?:\s*-\s*\d{1,2}(?::\d{2})?\s*(?:AM|PM|am|pm))?)?|Tomorrow(?:\s+(?:at|by)\s+\d{1,2}(?::\d{2})?\s*(?:AM|PM|am|pm)?)?|Today(?:\s+(?:at|by)\s+\d{1,2}(?::\d{2})?\s*(?:AM|PM|am|pm)?)?|This Weekend|\d{1,2}(?::\d{2})?\s*(?:AM|PM|am|pm)(?:\s*-\s*\d{1,2}(?::\d{2})?\s*(?:AM|PM|am|pm))?)\b)|(\b(?:LHC-\d{2,3}|MAC Auditorium|Students Activity Centre(?:\s*\(SAC\))?|SAC|Hall\s+\d+|APJ Hall)\b)|(\b[A-Z]{2,4}\s?[-]?\s?\d{3}[A-Z]?\b)/gi;

  let lastIndex = 0;
  let match: RegExpExecArray | null;
  while ((match = regex.exec(input)) !== null) {
    if (match.index > lastIndex) {
      tokens.push({ type: 'text', val: input.slice(lastIndex, match.index) });
    }
    const [, link, code, bold, dateTime, venue, course] = match;
    if (link) {
      const lm = link.match(/\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/);
      if (lm) tokens.push({ type: 'link', label: lm[1], url: lm[2] });
    } else if (code) {
      tokens.push({ type: 'code', val: code.slice(1, -1) });
    } else if (bold) {
      const inner = bold.slice(2, -2);
      const subTokens = parseCopilotInlineTokens(inner);
      if (subTokens.length === 1 && subTokens[0].type !== 'text') {
        tokens.push(subTokens[0]);
      } else {
        tokens.push({ type: 'bold', val: inner });
      }
    } else if (dateTime) {
      tokens.push({ type: 'datetime', val: dateTime });
    } else if (venue) {
      tokens.push({ type: 'venue', val: venue });
    } else if (course) {
      tokens.push({ type: 'course', val: course });
    }
    lastIndex = regex.lastIndex;
  }
  if (lastIndex < input.length) {
    tokens.push({ type: 'text', val: input.slice(lastIndex) });
  }
  return tokens;
}

function renderCopilotInlineTokens(tokens: CopilotInlineToken[]) {
  return tokens.map((token, idx) => {
    switch (token.type) {
      case 'datetime':
        return (
          <span
            key={idx}
            className="inline-flex items-center px-1.5 py-0.5 rounded-md text-[11.5px] font-medium bg-[#e8f0fe] dark:bg-[#042d54] text-[#174ea6] dark:text-[#a8c7fa] border border-[#d2e3fc]/80 dark:border-[#004a77] my-0.5 align-middle select-all shadow-2xs"
            title="Date & Time"
          >
            {token.val}
          </span>
        );
      case 'venue':
        return (
          <span
            key={idx}
            className="inline-flex items-center px-1.5 py-0.5 rounded-md text-[11.5px] font-medium bg-[#f1f3f4] dark:bg-[#28292c] text-[#3c4043] dark:text-[#e3e3e3] border border-[#dadce0] dark:border-[#3c4043] my-0.5 align-middle select-all shadow-2xs"
            title="Location / Venue"
          >
            {token.val}
          </span>
        );
      case 'course':
        return (
          <span
            key={idx}
            className="inline-flex items-center px-1.5 py-0.2 rounded font-mono text-[11px] font-semibold bg-[#edf2fa] dark:bg-[#1a2333] text-[#0b57d0] dark:text-[#7fcfff] border border-[#d3e3fd]/70 dark:border-[#1a3860] my-0.5 align-middle select-all"
            title="Course Code"
          >
            {token.val}
          </span>
        );
      case 'link':
        return (
          <a
            key={idx}
            href={token.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#0b57d0] dark:text-[#a8c7fa] underline hover:opacity-80 font-semibold my-0.5 align-middle cursor-pointer"
          >
            {token.label}
          </a>
        );
      case 'code':
        return (
          <code
            key={idx}
            className="px-1.5 py-0.5 rounded text-[11.5px] font-mono bg-[#f1f3f4] dark:bg-[#28292c] text-[#c5221f] dark:text-[#f28b82] border border-[#dadce0]/60 dark:border-[#3c4043] my-0.5 align-middle"
          >
            {token.val}
          </code>
        );
      case 'bold':
        return (
          <strong key={idx} className="font-semibold text-[#1f1f1f] dark:text-white">
            {token.val}
          </strong>
        );
      case 'text':
      default:
        return <span key={idx}>{token.val}</span>;
    }
  });
}

function CopilotMessageRenderer({ text }: { text: string }) {
  const lines = text.split('\n');
  const kvRegex = /^(?:[•\-\*]\s+|\s+-\s+)?\*\*([A-Za-z0-9\s/_\-–]+?):\*\*\s*(.*)$/;
  const headerRegex = /^(?:#+\s*|\*\*)([^*]+)(?:\*\*|:)?$/;
  const numHeaderRegex = /^\*\*(\d+\.\s+[^*]+)\*\*$/;
  const bulletRegex = /^(?:[•\-\*]\s+)(.*)$/;

  return (
    <div className="space-y-1.5 text-[13px] leading-relaxed">
      {lines.map((line, idx) => {
        const trimmed = line.trim();
        if (!trimmed) {
          return <div key={idx} className="h-1" />;
        }

        // 1. Key-Value structured row (clean text label, no icon)
        const kvMatch = line.match(kvRegex);
        if (kvMatch && kvMatch[2].trim().length > 0) {
          const keyName = kvMatch[1].trim();
          const valText = kvMatch[2].trim();
          return (
            <div
              key={idx}
              className="flex items-start gap-2 py-0.5 pl-1 rounded-md hover:bg-black/[0.02] dark:hover:bg-white/[0.02] transition-colors"
            >
              <div className="text-[#444746] dark:text-[#9aa0a6] text-xs font-semibold shrink-0 pt-0.5 min-w-[80px] max-w-[130px]">
                <span className="truncate">{keyName}:</span>
              </div>
              <div className="flex-1 text-[#1f1f1f] dark:text-[#e3e3e3] font-normal break-words">
                {renderCopilotInlineTokens(parseCopilotInlineTokens(valText))}
              </div>
            </div>
          );
        }

        // 2. Numbered Item Header (e.g. **1. HackIITR 2026**)
        const numMatch = line.match(numHeaderRegex);
        if (numMatch) {
          return (
            <div
              key={idx}
              className="font-bold text-[#1f1f1f] dark:text-white text-[13px] pt-2 pb-0.5 border-b border-[#e0e2ec]/60 dark:border-[#2c2d30]/60"
            >
              <span>{numMatch[1]}</span>
            </div>
          );
        }

        // 3. Section Header (no icon)
        const hMatch = line.match(headerRegex);
        if (hMatch && !line.startsWith('•') && !line.startsWith('-')) {
          const title = hMatch[1].replace(/[:*]/g, '').trim();
          return (
            <div
              key={idx}
              className="font-bold text-[#1f1f1f] dark:text-white text-[13px] pt-1.5 pb-1 border-b border-[#e0e2ec]/80 dark:border-[#2c2d30]/80"
            >
              <span>{title}</span>
            </div>
          );
        }

        // 4. Bullet Item (not key-value)
        const bMatch = line.match(bulletRegex);
        if (bMatch) {
          return (
            <div key={idx} className="flex items-start gap-2 pl-1 py-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#0b57d0] dark:bg-[#a8c7fa] mt-2 shrink-0" />
              <div className="flex-1 text-[#3c4043] dark:text-[#c4c7c5]">
                {renderCopilotInlineTokens(parseCopilotInlineTokens(bMatch[1]))}
              </div>
            </div>
          );
        }

        // 5. Default text line
        return (
          <div key={idx} className="text-[#1f1f1f] dark:text-[#e3e3e3]">
            {renderCopilotInlineTokens(parseCopilotInlineTokens(line))}
          </div>
        );
      })}
    </div>
  );
}

export default function App() {
  const [activeTab, setActiveTab] = useState<'buckets' | 'deadlines' | 'chat' | 'detail'>('buckets');
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');
  const [email, setEmail] = useState<ExtractedEmail | null>(null);
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [apiKey, setApiKey] = useState('');
  const [groqKey, setGroqKey] = useState('');
  const [showSettings, setShowSettings] = useState(false);
  const [inPageIntegration, setInPageIntegration] = useState(true);
  const [uiMode, setUiMode] = useState<UiIntegrationMode>('blended');
  const [copiedSummary, setCopiedSummary] = useState(false);
  const [copiedReplyIndex, setCopiedReplyIndex] = useState<number | null>(null);

  // Smart Buckets Inbox State
  const [inboxItems, setInboxItems] = useState<InboxRowItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<CategoryType | 'ALL'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [isScanningInbox, setIsScanningInbox] = useState(false);
  const [syncGmailDom, setSyncGmailDom] = useState(false);

  // Custom Filters & Relabeling State
  const [customFilters, setCustomFilters] = useState<CustomFilter[]>([
    {
      id: 'filter-assignment',
      name: 'Assignment',
      color: '#0b57d0',
      keywords: [
        'assignment',
        'assignments',
        'tutorial',
        'tutorials',
        'homework',
        'problem set',
        'problem sets',
        'pset',
        'psets',
        'lab submission',
        'lab assignment',
      ],
    },
    {
      id: 'filter-placements',
      name: 'Placements & Internships',
      color: '#8b5cf6',
      keywords: ['placement', 'tpo', 'internship', 'interview', 'shortlist', 'offer', 'ctc', 'pre-placement']
    },
    {
      id: 'filter-hostel',
      name: 'Hostel & Campus Mess',
      color: '#06b6d4',
      keywords: ['hostel', 'mess', 'warden', 'room', 'maintenance', 'electricity', 'water', 'hall of residence']
    }
  ]);
  const [labelOverrides, setLabelOverrides] = useState<Record<string, string>>({});
  const [showRelabelMenu, setShowRelabelMenu] = useState(false);
  const [showAddFilterModal, setShowAddFilterModal] = useState(false);
  const [newFilterName, setNewFilterName] = useState('');
  const [newFilterKeywords, setNewFilterKeywords] = useState('');
  const [newFilterColor, setNewFilterColor] = useState('#8b5cf6');

  // First-Time Setup & Priority List State
  const [hasCompletedSetup, setHasCompletedSetup] = useState<boolean>(true);
  const [showSetupModal, setShowSetupModal] = useState<boolean>(false);
  const [priorityList, setPriorityList] = useState<string[]>([
    'Assignment',
    'Academics',
    'Competitions & Tournaments',
    'Class Rescheduling',
  ]);

  const AVAILABLE_PRIORITY_CATEGORIES = [
    {
      id: 'Assignment',
      label: 'Assignment',
      desc: 'Assignments, tutorials & problem sets',
      icon: FileText,
    },
    {
      id: 'Academics',
      label: 'Academics',
      desc: 'Coursework, lectures & exams',
      icon: BookOpen,
    },
    {
      id: 'Competitions & Tournaments',
      label: 'Competitions',
      desc: 'Hackathons, sports & contests',
      icon: Trophy,
    },
    {
      id: 'Class Rescheduling',
      label: 'Rescheduling',
      desc: 'Timing changes & cancellations',
      icon: Clock,
    },
    {
      id: 'Workshops',
      label: 'Workshops & Talks',
      desc: 'Bootcamps, seminars & guest talks',
      icon: Zap,
    },
    {
      id: 'Placements & Internships',
      label: 'Placements',
      desc: 'Interviews, shortlists & TPO notices',
      icon: Briefcase,
    },
    {
      id: 'Hostel & Campus Mess',
      label: 'Hostel & Mess',
      desc: 'Hall of residence & maintenance',
      icon: Layers,
    },
  ];

  // Aggregated Deadlines State
  const [deadlines, setDeadlines] = useState<AggregatedDeadline[]>([]);
  const [deadlineFilter, setDeadlineFilter] = useState<'all' | 'urgent' | 'academics' | 'competitions'>('all');

  // Inbox Copilot Chatbot State
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: 'msg-welcome',
      role: 'assistant',
      text: "Hi! I'm your **AcadMail AI Copilot**.\n\nI can answer questions about your deadlines, classes, competitions, and campus announcements grounded in your university emails. Try tapping one of the quick questions below or type your own!",
      timestamp: 'Just now',
    },
  ]);
  const [chatInput, setChatInput] = useState('');
  const [isChatThinking, setIsChatThinking] = useState(false);
  const [copilotMode, setCopilotMode] = useState<'instant' | 'cloud'>('instant');

  const QUICK_PROMPTS = [
    {
      id: 'qp-assignment',
      label: 'Assignment Due Date',
      prompt: 'When is my next assignment due?',
      icon: CalendarCheck2,
      category: 'Assignment',
    },
    {
      id: 'qp-hackathon',
      label: 'Hackathons & Contests',
      prompt: 'Show all hackathons this month.',
      icon: Trophy,
      category: 'Competitions',
    },
    {
      id: 'qp-cancelled',
      label: 'Class Cancellations',
      prompt: 'Did any professor cancel a class?',
      icon: AlertTriangle,
      category: 'Schedules',
    },
    {
      id: 'qp-club',
      label: 'Club Inductions & Talks',
      prompt: 'Which club interviews are coming up?',
      icon: Briefcase,
      category: 'Recruitment',
    },
  ];

  useEffect(() => {
    // Load theme - sync with Gmail's active theme if no manual override
    if (typeof chrome !== 'undefined' && chrome.storage?.local) {
      chrome.storage.local.get(['acadmail_theme', 'acadmail_gmail_theme'], (res) => {
        if (res.acadmail_theme) {
          setTheme(res.acadmail_theme);
        } else if (res.acadmail_gmail_theme) {
          setTheme(res.acadmail_gmail_theme);
        } else {
          const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
          setTheme(prefersDark ? 'dark' : 'light');
        }
      });
    }

    getSettings().then((settings) => {
      setApiKey(settings.apiKey || '');
      setGroqKey(settings.groqApiKey || '');
      setInPageIntegration(settings.inPageIntegration !== false);
      if (settings.uiMode) {
        setUiMode(settings.uiMode);
      } else if (settings.inPageIntegration === false) {
        setUiMode('off');
      } else {
        setUiMode('blended');
      }
      if (Array.isArray(settings.customFilters) && settings.customFilters.length > 0) {
        setCustomFilters(settings.customFilters);
      }
      if (settings.labelOverrides) {
        setLabelOverrides(settings.labelOverrides);
      }
      if (Array.isArray(settings.priorityList) && settings.priorityList.length > 0) {
        setPriorityList(settings.priorityList);
      } else if (Array.isArray(settings.preferredLabels) && settings.preferredLabels.length > 0) {
        setPriorityList(settings.preferredLabels);
      }
      const completed = settings.hasCompletedSetup ?? false;
      setHasCompletedSetup(completed);
      if (!completed) {
        setShowSetupModal(true);
      } else if (!settings.apiKey && !settings.groqApiKey) {
        setShowSettings(true);
      }
    });

    scanInbox();
    fetchEmailFromActiveTab();

    const listener = (message: any) => {
      if (message.type === 'GMAIL_THEME_DETECTED' && message.theme) {
        chrome.storage.local.get(['acadmail_theme'], (res) => {
          if (!res.acadmail_theme) {
            setTheme(message.theme);
          }
        });
      }
      if (message.type === 'EMAIL_CHANGED' || message.type === 'SETTINGS_CHANGED') {
        getSettings().then((s) => {
          if (Array.isArray(s.customFilters) && s.customFilters.length > 0) {
            setCustomFilters(s.customFilters);
          }
          if (s.labelOverrides) {
            setLabelOverrides(s.labelOverrides);
          }
        });
        fetchEmailFromActiveTab();
        scanInbox();
      }
    };

    if (typeof chrome !== 'undefined' && chrome.runtime?.onMessage) {
      chrome.runtime.onMessage.addListener(listener);
      return () => chrome.runtime.onMessage.removeListener(listener);
    }
  }, []);

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
      document.body.classList.add('dark');
      document.body.style.backgroundColor = '#111318';
    } else {
      document.documentElement.classList.remove('dark');
      document.body.classList.remove('dark');
      document.body.style.backgroundColor = '#f6f8fc';
    }
  }, [theme]);

  const toggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
    if (typeof chrome !== 'undefined' && chrome.storage?.local) {
      chrome.storage.local.set({ acadmail_theme: nextTheme });
    }
  };

  // Extract deadlines automatically from scanned inbox items with robust date & time detection
  useEffect(() => {
    if (inboxItems.length === 0) return;

    const extracted: AggregatedDeadline[] = [];
    const datePattern = /\b(?:due|deadline|by|on|date:|till)\s+([A-Za-z]{3,9}\s+\d{1,2}(?:st|nd|rd|th)?(?:\s*,\s*\d{4})?|\d{1,2}\/\d{1,2}(?:\/\d{2,4})?|\d{1,2}\s+[A-Za-z]{3,9})\b/gi;
    const standaloneDatePattern = /\b(\d{1,2}\s+(?:Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:tember)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)(?:\s*,?\s*\d{4})?|(?:Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:tember)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)\s+\d{1,2}(?:st|nd|rd|th)?(?:\s*,?\s*\d{4})?)\b/i;

    inboxItems.forEach((item) => {
      const combined = `${item.subject} ${item.snippet || ''}`;
      const lower = combined.toLowerCase();

      // Extract explicit time if present (e.g. 9:00 AM, 6:00 PM, 11:59 PM)
      const timeMatch = combined.match(/\b(\d{1,2}(?::\d{2})?\s*(?:AM|PM|am|pm))\b/);
      const timeStr = timeMatch ? timeMatch[1].toUpperCase() : null;

      // 1. Check relative days first (Tomorrow, Today)
      if (lower.includes('tomorrow') || lower.includes('today')) {
        const relDay = lower.includes('tomorrow') ? 'Tomorrow' : 'Today';
        extracted.push({
          id: `dl-${item.id}-rel`,
          title: item.subject,
          deadline: timeStr ? `${relDay}, ${timeStr}` : relDay,
          sourceSubject: item.subject,
          sourceSender: item.sender,
          category: item.category,
          courseCode: item.courseCode,
          completed: false,
          rowIndex: item.index,
        });
        return;
      }

      // 2. Explicit date pattern matches (e.g. "due Nov 5th, 2026")
      const matches = [...combined.matchAll(datePattern)];
      if (matches.length > 0) {
        matches.forEach((m, idx) => {
          const rawDate = m[1];
          const formattedDeadline = timeStr && !rawDate.includes(timeStr) ? `${rawDate}, ${timeStr}` : rawDate;
          extracted.push({
            id: `dl-${item.id}-${idx}`,
            title: item.subject,
            deadline: formattedDeadline,
            sourceSubject: item.subject,
            sourceSender: item.sender,
            category: item.category,
            courseCode: item.courseCode,
            completed: false,
            rowIndex: item.index,
          });
        });
        return;
      }

      // 3. Standalone date pattern (e.g. "23 October", "November 5th, 2026")
      const standaloneMatch = combined.match(standaloneDatePattern);
      if (standaloneMatch) {
        const rawDate = standaloneMatch[1];
        const formattedDeadline = timeStr && !rawDate.includes(timeStr) ? `${rawDate}, ${timeStr}` : rawDate;
        extracted.push({
          id: `dl-${item.id}-date`,
          title: item.subject,
          deadline: formattedDeadline,
          sourceSubject: item.subject,
          sourceSender: item.sender,
          category: item.category,
          courseCode: item.courseCode,
          completed: false,
          rowIndex: item.index,
        });
        return;
      }

      // 4. Academic categories with reminders / submissions
      if (
        item.category === 'Academics' ||
        item.category === 'Competitions & Tournaments' ||
        item.category === 'Class Rescheduling'
      ) {
        if (
          lower.includes('final reminder') ||
          lower.includes('submission') ||
          lower.includes('deadline') ||
          lower.includes('due') ||
          lower.includes('reminder:')
        ) {
          extracted.push({
            id: `dl-${item.id}-auto`,
            title: item.subject,
            deadline: timeStr ? `${item.date}, ${timeStr}` : item.date,
            sourceSubject: item.subject,
            sourceSender: item.sender,
            category: item.category,
            courseCode: item.courseCode,
            completed: false,
            rowIndex: item.index,
          });
        }
      }
    });

    setDeadlines(extracted);
  }, [inboxItems]);

  const getGmailTab = async (): Promise<chrome.tabs.Tab | null> => {
    if (typeof chrome === 'undefined' || !chrome.tabs) return null;

    try {
      const currentTabs = await chrome.tabs.query({ currentWindow: true });
      let mailTab = currentTabs.find(
        (t) => t.url && (t.url.includes('mail.google.com') || t.url.includes('outlook.'))
      );
      if (mailTab) return mailTab;

      const [focusedTab] = await chrome.tabs.query({ active: true, lastFocusedWindow: true });
      if (
        focusedTab?.url &&
        (focusedTab.url.includes('google.com') || focusedTab.url.includes('outlook.'))
      ) {
        return focusedTab;
      }

      const allTabs = await chrome.tabs.query({});
      mailTab = allTabs.find(
        (t) => t.url && (t.url.includes('mail.google.com') || t.url.includes('outlook.'))
      );
      if (mailTab) return mailTab;

      const [activeTab] = await chrome.tabs.query({ active: true, currentWindow: true });
      return activeTab || null;
    } catch (e) {
      return null;
    }
  };

  const ensureContentScriptInjected = async (tabId: number) => {
    if (typeof chrome === 'undefined' || !chrome.scripting) return;
    try {
      await chrome.scripting.executeScript({
        target: { tabId },
        files: ['content.js'],
      });
    } catch (e) {}
  };

  const scanInbox = async (isRetry = false) => {
    setIsScanningInbox(true);
    const tab = await getGmailTab();
    if (!tab?.id) {
      setIsScanningInbox(false);
      return;
    }

    chrome.tabs.sendMessage(tab.id, { type: 'SCAN_INBOX' }, async (response) => {
      if (chrome.runtime.lastError || !response?.items) {
        if (!isRetry) {
          await ensureContentScriptInjected(tab.id!);
          setTimeout(() => scanInbox(true), 500);
          return;
        }
      }

      if (response?.items && Array.isArray(response.items)) {
        setInboxItems(response.items);
      }
      setIsScanningInbox(false);
    });
  };

  const handleCategoryFilterChange = async (cat: CategoryType | 'ALL') => {
    setSelectedCategory(cat);
    if (syncGmailDom) {
      const tab = await getGmailTab();
      if (tab?.id) {
        chrome.tabs.sendMessage(tab.id, { type: 'FILTER_GMAIL_DOM', category: cat });
      }
    }
  };

  const handleToggleSyncDom = async (enabled: boolean) => {
    setSyncGmailDom(enabled);
    const tab = await getGmailTab();
    if (tab?.id) {
      chrome.tabs.sendMessage(tab.id, {
        type: 'FILTER_GMAIL_DOM',
        category: enabled ? selectedCategory : 'ALL',
      });
    }
  };

  const handleSelectInboxRow = async (item: InboxRowItem) => {
    const tab = await getGmailTab();
    if (tab?.id) {
      chrome.tabs.sendMessage(tab.id, { type: 'CLICK_ROW', index: item.index });
    }
    setActiveTab('detail');
    setTimeout(() => fetchEmailFromActiveTab(), 600);
  };

  const handleJumpToEmailFromDeadline = async (dl: AggregatedDeadline) => {
    if (dl.rowIndex !== undefined) {
      const tab = await getGmailTab();
      if (tab?.id) {
        chrome.tabs.sendMessage(tab.id, { type: 'CLICK_ROW', index: dl.rowIndex });
      }
      setActiveTab('detail');
      setTimeout(() => fetchEmailFromActiveTab(), 600);
    }
  };

  const toggleDeadlineComplete = (id: string) => {
    setDeadlines((prev) =>
      prev.map((dl) => (dl.id === id ? { ...dl, completed: !dl.completed } : dl))
    );
  };

  const handleSendChatMessage = async (textToSend?: string, forceInstant = false) => {
    const query = (textToSend || chatInput).trim();
    if (!query || isChatThinking) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setChatMessages((prev) => [...prev, userMsg]);
    setChatInput('');
    setIsChatThinking(true);

    try {
      const groundingEmails: GroundingEmailItem[] = inboxItems.map((item) => ({
        id: item.id,
        subject: item.subject,
        sender: item.sender,
        bodyOrSnippet: item.snippet,
        date: item.date,
        category: item.category,
        courseCode: item.courseCode,
        rowIndex: item.index,
      }));

      if (email) {
        const existingIdx = groundingEmails.findIndex((e) => e.id === email.id);
        const fullItem: GroundingEmailItem = {
          id: email.id,
          subject: email.subject,
          sender: `${email.senderName} <${email.senderEmail}>`,
          bodyOrSnippet: email.bodyText,
          date: email.dateStr,
          category: analysis?.category || 'Academics',
          courseCode: analysis?.detectedCourseCode,
        };
        if (existingIdx >= 0) {
          groundingEmails[existingIdx] = fullItem;
        } else {
          groundingEmails.unshift(fullItem);
        }
      }

      const modeToUse = forceInstant ? 'instant' : copilotMode;
      const res = await askInboxCopilot(query, groundingEmails, apiKey, groqKey, modeToUse);

      const assistantMsg: ChatMessage = {
        id: `ai-${Date.now()}`,
        role: 'assistant',
        text: res.text,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        references: res.references,
      };

      setChatMessages((prev) => [...prev, assistantMsg]);
    } catch (err: any) {
      setChatMessages((prev) => [
        ...prev,
        {
          id: `ai-err-${Date.now()}`,
          role: 'assistant',
          text: `Sorry, I encountered an issue analyzing your emails: ${err.message || 'Please try again.'}`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setIsChatThinking(false);
    }
  };

  const handleJumpToEmailFromReference = async (ref: ChatEmailReference) => {
    // 1. Try finding in inboxItems
    const matchedItem = inboxItems.find(
      (it) =>
        it.id === ref.id ||
        it.subject === ref.subject ||
        it.subject.toLowerCase().includes(ref.subject.toLowerCase()) ||
        ref.subject.toLowerCase().includes(it.subject.toLowerCase())
    );

    const targetIndex = ref.rowIndex !== undefined ? ref.rowIndex : matchedItem?.index;

    // 2. Pre-set email state so user gets immediate display
    if (matchedItem) {
      setEmail({
        id: matchedItem.id,
        subject: matchedItem.subject,
        senderName: matchedItem.sender,
        senderEmail: '',
        recipient: '',
        dateStr: matchedItem.date,
        bodyText: matchedItem.snippet,
        url: '',
      });
    }

    // 3. Command Gmail to click and open that thread
    const tab = await getGmailTab();
    if (tab?.id) {
      chrome.tabs.sendMessage(tab.id, {
        type: 'CLICK_ROW',
        index: targetIndex,
        subject: ref.subject,
      });
    }

    setActiveTab('detail');
    setTimeout(() => fetchEmailFromActiveTab(), 500);
    setTimeout(() => fetchEmailFromActiveTab(), 1100);
  };

  const fetchEmailFromActiveTab = async (retryCount = 0) => {
    const tab = await getGmailTab();
    if (!tab?.id) return;

    chrome.tabs.sendMessage(tab.id, { type: 'GET_ACTIVE_EMAIL' }, async (response) => {
      if (chrome.runtime.lastError || !response?.email) {
        if (retryCount < 2) {
          setTimeout(() => fetchEmailFromActiveTab(retryCount + 1), 600);
        }
        return;
      }

      const activeEmail: ExtractedEmail = response.email;
      setEmail(activeEmail);
      setActiveTab('detail');

      const cached = await getCachedAnalysis(activeEmail.id);
      if (cached) {
        setAnalysis(cached);
      } else {
        const settings = await getSettings();
        triggerAnalysis(activeEmail, settings.apiKey, settings.groqApiKey);
      }
    });
  };

  const triggerAnalysis = async (
    targetEmail: ExtractedEmail,
    keyToUse = apiKey,
    groqToUse = groqKey
  ) => {
    setLoading(true);
    setError(null);

    try {
      const result = await analyzeAcademicEmail(
        targetEmail,
        keyToUse,
        groqToUse,
        customFilters,
        labelOverrides
      );
      setAnalysis(result);
      await saveAnalysis(targetEmail.id, result);
    } catch (err: any) {
      setError(err.message || 'Failed to analyze email');
    } finally {
      setLoading(false);
    }
  };

  const handleRelabelEmail = async (emailId: string, newCategory: string) => {
    if (!email) return;
    const updatedOverrides = {
      ...labelOverrides,
      [emailId]: newCategory,
      [email.subject]: newCategory,
    };
    setLabelOverrides(updatedOverrides);
    await saveLabelOverride(emailId, newCategory);
    if (email.subject) {
      await saveLabelOverride(email.subject, newCategory);
    }

    // Update current analysis
    if (analysis) {
      const updatedAnalysis = { ...analysis, category: newCategory };
      setAnalysis(updatedAnalysis);
      await saveAnalysis(emailId, updatedAnalysis);
    }

    // Update inboxItems state
    setInboxItems((prev) =>
      prev.map((item) =>
        item.id === emailId || item.subject === email.subject
          ? { ...item, category: newCategory }
          : item
      )
    );

    setShowRelabelMenu(false);

    // Notify active tab so in-page chip and Gmail row badge update in real-time
    const tab = await getGmailTab();
    if (tab?.id) {
      chrome.tabs.sendMessage(tab.id, {
        type: 'RELABEL_EMAIL',
        emailId,
        newCategory,
      }).catch(() => {});
    }
  };

  const handleAddCustomFilter = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFilterName.trim()) return;

    const keywords = newFilterKeywords
      .split(',')
      .map((k) => k.trim().toLowerCase())
      .filter(Boolean);

    const filter: CustomFilter = {
      id: `filter-${Date.now()}`,
      name: newFilterName.trim(),
      color: newFilterColor || '#8b5cf6',
      keywords: keywords.length > 0 ? keywords : [newFilterName.trim().toLowerCase()],
    };

    const updatedFilters = [...customFilters, filter];
    setCustomFilters(updatedFilters);
    await addCustomFilter(filter);

    setNewFilterName('');
    setNewFilterKeywords('');
    setShowAddFilterModal(false);

    // Notify Gmail tab to update its chip bar
    const tab = await getGmailTab();
    if (tab?.id) {
      chrome.tabs.sendMessage(tab.id, {
        type: 'UPDATE_CUSTOM_FILTERS',
        customFilters: updatedFilters,
      }).catch(() => {});
    }

    // Rescan inbox with new filters
    scanInbox();
  };

  const handleDeleteCustomFilter = async (filterId: string) => {
    const updatedFilters = customFilters.filter((f) => f.id !== filterId);
    setCustomFilters(updatedFilters);
    await deleteCustomFilter(filterId);

    // Notify Gmail tab
    const tab = await getGmailTab();
    if (tab?.id) {
      chrome.tabs.sendMessage(tab.id, {
        type: 'UPDATE_CUSTOM_FILTERS',
        customFilters: updatedFilters,
      }).catch(() => {});
    }

    // Rescan inbox
    scanInbox();
  };

  const handleSetUiMode = async (mode: UiIntegrationMode) => {
    setUiMode(mode);
    setInPageIntegration(mode !== 'off');
    await saveSettings({ uiMode: mode, inPageIntegration: mode !== 'off' });
    const tab = await getGmailTab();
    if (tab?.id) {
      chrome.tabs.sendMessage(tab.id, {
        type: 'SET_UI_MODE',
        mode,
      }).catch(() => {});
    }
  };

  const movePriorityUp = (index: number) => {
    if (index <= 0) return;
    setPriorityList((prev) => {
      const next = [...prev];
      const temp = next[index - 1];
      next[index - 1] = next[index];
      next[index] = temp;
      return next;
    });
  };

  const movePriorityDown = (index: number) => {
    setPriorityList((prev) => {
      if (index >= prev.length - 1) return prev;
      const next = [...prev];
      const temp = next[index + 1];
      next[index + 1] = next[index];
      next[index] = temp;
      return next;
    });
  };

  const removeFromPriorityList = (catId: string) => {
    setPriorityList((prev) => {
      if (prev.length <= 1) return prev; // Keep at least one
      return prev.filter((id) => id !== catId);
    });
  };

  const addToPriorityList = (catId: string) => {
    setPriorityList((prev) => {
      if (prev.includes(catId)) return prev;
      return [...prev, catId];
    });
  };

  const handleSaveFirstTimeSetup = async (finalList: string[]) => {
    const validList = finalList && finalList.length > 0
      ? finalList
      : ['Academics', 'Competitions & Tournaments', 'Class Rescheduling'];
    setPriorityList(validList);
    setHasCompletedSetup(true);
    setShowSetupModal(false);

    await saveSettings({
      hasCompletedSetup: true,
      priorityList: validList,
      preferredLabels: validList,
    });

    const tab = await getGmailTab();
    if (tab?.id) {
      chrome.tabs.sendMessage(tab.id, {
        type: 'UPDATE_SETTINGS',
        priorityList: validList,
      }).catch(() => {});
    }

    setTimeout(scanInbox, 250);
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    await saveSettings({
      apiKey: apiKey.trim(),
      groqApiKey: groqKey.trim(),
      inPageIntegration: uiMode !== 'off',
      uiMode,
      customFilters,
      priorityList,
      preferredLabels: priorityList,
    });
    setShowSettings(false);
    setError(null);

    const tab = await getGmailTab();
    if (tab?.id) {
      chrome.tabs.sendMessage(tab.id, {
        type: 'UPDATE_SETTINGS',
        priorityList,
      }).catch(() => {});
    }

    if (email) {
      triggerAnalysis(email, apiKey.trim(), groqKey.trim());
    }
    setTimeout(scanInbox, 250);
  };

  const toggleActionItem = (id: string) => {
    if (!analysis) return;
    const updated = {
      ...analysis,
      actionItems: analysis.actionItems.map((item) =>
        item.id === id ? { ...item, completed: !item.completed } : item
      ),
    };
    setAnalysis(updated);
    if (email) {
      saveAnalysis(email.id, updated);
    }
  };

  const handleCopySummary = () => {
    if (!analysis) return;
    navigator.clipboard.writeText(analysis.summary.join('\n• '));
    setCopiedSummary(true);
    setTimeout(() => setCopiedSummary(false), 2000);
  };

  const handleCopyReplyPreset = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedReplyIndex(index);
    setTimeout(() => setCopiedReplyIndex(null), 2000);
  };

  const getCategoryTheme = (cat: CategoryType) => {
    return {
      chip: 'bg-[#f1f3f4] dark:bg-[#282a2d] text-[#3c4043] dark:text-[#c4c7c5] border-[#dadce0] dark:border-[#3c4043]',
      dot: 'bg-[#747775] dark:bg-[#9aa0a6]',
      activeBtn: 'bg-[#c2e7ff] dark:bg-[#004a77] text-[#001d35] dark:text-[#c2e7ff] border-[#7fcfff] dark:border-[#005c93] shadow-2xs font-semibold',
      countBadge: 'bg-[#001d35]/12 dark:bg-[#c2e7ff]/20 text-[#001d35] dark:text-[#c2e7ff]',
    };
  };

  const getDeadlineBadgeStyle = (deadlineStr: string) => {
    const lower = deadlineStr.toLowerCase();

    // Urgent: Today or Overdue (subtle Material 3 Red tone)
    if (lower.includes('today') || lower.includes('overdue')) {
      return {
        chip: 'bg-[#fce8e6] dark:bg-[#3c1e1e] text-[#b3261e] dark:text-[#f28b82] border-[#f8c9c6] dark:border-[#5c2b29]',
        icon: 'text-[#b3261e] dark:text-[#f28b82]',
        isTime: true,
      };
    }

    // Due Soon: Tomorrow (subtle Google Blue container)
    if (lower.includes('tomorrow')) {
      return {
        chip: 'bg-[#e8f0fe] dark:bg-[#004a77]/30 text-[#0b57d0] dark:text-[#c2e7ff] border-[#c2e7ff] dark:border-[#005c93]',
        icon: 'text-[#0b57d0] dark:text-[#c2e7ff]',
        isTime: true,
      };
    }

    // Has explicit time (e.g. 9:00 AM, 6:00 PM, 11:59 PM)
    if (/\b(?:am|pm)\b/i.test(lower)) {
      return {
        chip: 'bg-[#edf2fa] dark:bg-[#1a2e40] text-[#044377] dark:text-[#b4d6ff] border-[#d3e3fd] dark:border-[#22476d]',
        icon: 'text-[#044377] dark:text-[#b4d6ff]',
        isTime: true,
      };
    }

    // Standard upcoming calendar date (clean Google neutral surface)
    return {
      chip: 'bg-[#f1f3f4] dark:bg-[#282a2d] text-[#1f1f1f] dark:text-[#e3e3e3] border-[#dadce0] dark:border-[#3c4043]',
      icon: 'text-[#5f6368] dark:text-[#8e918f]',
      isTime: false,
    };
  };

  const filteredInbox = inboxItems.filter((item) => {
    const matchesCat = selectedCategory === 'ALL' || item.category === selectedCategory;
    const matchesSearch =
      !searchQuery ||
      item.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.sender.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const filteredDeadlines = deadlines.filter((dl) => {
    if (deadlineFilter === 'urgent') {
      const lower = dl.deadline.toLowerCase();
      return lower.includes('tomorrow') || lower.includes('today') || dl.category === 'Class Rescheduling';
    }
    if (deadlineFilter === 'academics') return dl.category === 'Academics';
    if (deadlineFilter === 'competitions') return dl.category === 'Competitions & Tournaments';
    return true;
  });

  const counts: Record<string, number> = {
    all: inboxItems.length,
    academics: inboxItems.filter((i) => i.category === 'Academics').length,
    competitions: inboxItems.filter((i) => i.category === 'Competitions & Tournaments').length,
    workshops: inboxItems.filter((i) => i.category === 'Workshops').length,
    rescheduling: inboxItems.filter((i) => i.category === 'Class Rescheduling').length,
    general: inboxItems.filter((i) => i.category === 'General').length,
  };
  customFilters.forEach((f) => {
    counts[f.name] = inboxItems.filter((i) => i.category === f.name).length;
  });

  const pendingDeadlinesCount = deadlines.filter((d) => !d.completed).length;

  const quickReplies = [
    {
      title: 'Acknowledge',
      text: `Dear ${email?.senderName || 'Sir/Madam'},\n\nThank you for the update regarding "${email?.subject}". I have noted the details.\n\nBest regards.`,
    },
    {
      title: 'Request Extension',
      text: `Dear ${email?.senderName || 'Professor'},\n\nRegarding "${email?.subject}", could I kindly request a brief extension due to unforeseen circumstances? I would be grateful for your consideration.\n\nThank you.`,
    },
    {
      title: 'Confirm Attendance',
      text: `Dear ${email?.senderName || 'Organizers'},\n\nThank you for the notification regarding "${email?.subject}". I would like to confirm my participation.\n\nBest regards.`,
    },
  ];

  return (
    <div className={theme === 'dark' ? 'dark' : ''}>
      <div className="flex flex-col min-h-screen bg-[#f6f8fc] dark:bg-[#111318] text-[#1f1f1f] dark:text-[#e3e3e3] font-sans antialiased text-sm selection:bg-[#c2e7ff] dark:selection:bg-[#004a77] transition-colors duration-150">
        {/* Top Header */}
        <header className="sticky top-0 z-30 bg-[#f6f8fc] dark:bg-[#111318] border-b border-[#e0e2ec] dark:border-[#282a2d] px-3.5 py-2.5 flex items-center justify-between transition-colors">
          <div className="flex items-center gap-2">
            <img
              src="/icons/envelope-logo.png"
              alt="AcadMail"
              className="w-6 h-6 rounded-md object-contain shadow-2xs shrink-0"
            />
            <div className="flex items-baseline gap-1.5">
              <span className="font-batangas text-[16px] font-bold tracking-wide text-[#1f1f1f] dark:text-[#e3e3e3]">
                AcadMail
              </span>
              <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-[#eaeff8] dark:bg-[#1e1f20] text-[#0b57d0] dark:text-[#a8c7fa] border border-[#d3e3fd] dark:border-[#3c4043]">
                v1.0
              </span>
            </div>
          </div>

          <div className="flex items-center gap-0.5">
            {/* Gmail Theme Switcher */}
            <button
              onClick={toggleTheme}
              title={theme === 'dark' ? 'Switch to Gmail Light Theme' : 'Switch to Gmail Dark Theme'}
              className="p-1.5 text-[#444746] hover:text-[#1f1f1f] dark:text-[#c4c7c5] dark:hover:text-[#e3e3e3] hover:bg-[#eaebef] dark:hover:bg-[#28292c] rounded-full transition"
            >
              {theme === 'dark' ? <Sun className="w-4 h-4 text-[#f8d070]" /> : <Moon className="w-4 h-4 text-[#444746]" />}
            </button>

            <button
              onClick={() => {
                scanInbox();
                fetchEmailFromActiveTab();
              }}
              disabled={isScanningInbox || loading}
              title="Refresh current mailbox"
              className="p-1.5 text-[#444746] hover:text-[#1f1f1f] dark:text-[#c4c7c5] dark:hover:text-[#e3e3e3] hover:bg-[#eaebef] dark:hover:bg-[#28292c] rounded-full transition"
            >
              <RefreshCw
                className={`w-4 h-4 ${
                  isScanningInbox || loading ? 'animate-spin text-[#0b57d0] dark:text-[#a8c7fa]' : ''
                }`}
              />
            </button>
            <button
              onClick={() => setShowSettings(!showSettings)}
              title="AI Configuration"
              className={`p-1.5 rounded-full transition ${
                showSettings
                  ? 'bg-[#c2e7ff] dark:bg-[#004a77] text-[#001d35] dark:text-[#c2e7ff]'
                  : 'text-[#444746] hover:text-[#1f1f1f] dark:text-[#c4c7c5] dark:hover:text-[#e3e3e3] hover:bg-[#eaebef] dark:hover:bg-[#28292c]'
              }`}
            >
              <Settings className="w-4 h-4" />
            </button>
          </div>
        </header>

        {/* Google M3 Style Segmented Switcher */}
        <div className="px-3 pt-2.5 pb-2 bg-[#f6f8fc] dark:bg-[#111318] border-b border-[#e0e2ec] dark:border-[#282a2d]">
          <div className="p-1 bg-[#eaeff8] dark:bg-[#1e1f20] rounded-lg flex items-center gap-1 border border-[#d3e3fd]/60 dark:border-[#2c2d30]">
            <button
              onClick={() => setActiveTab('buckets')}
              className={`flex-1 py-2 px-2.5 rounded-md text-[13px] transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                activeTab === 'buckets'
                  ? 'bg-white dark:bg-[#004a77] text-[#0b57d0] dark:text-[#c2e7ff] shadow-xs font-semibold'
                  : 'text-[#444746] dark:text-[#c4c7c5] hover:text-[#1f1f1f] dark:hover:text-[#e3e3e3]'
              }`}
            >
              <span className="truncate">Buckets</span>
              {inboxItems.length > 0 && (
                <span className="text-[11px] font-medium opacity-75">
                  {inboxItems.length}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('deadlines')}
              className={`flex-1 py-2 px-2.5 rounded-md text-[13px] transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                activeTab === 'deadlines'
                  ? 'bg-white dark:bg-[#004a77] text-[#0b57d0] dark:text-[#c2e7ff] shadow-xs font-semibold'
                  : 'text-[#444746] dark:text-[#c4c7c5] hover:text-[#1f1f1f] dark:hover:text-[#e3e3e3]'
              }`}
            >
              <span className="truncate">Deadlines</span>
              {pendingDeadlinesCount > 0 && (
                <span className="text-[11px] font-semibold text-[#0b57d0] dark:text-[#a8c7fa]">
                  {pendingDeadlinesCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('chat')}
              className={`flex-1 py-2 px-2.5 rounded-md text-[13px] transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                activeTab === 'chat'
                  ? 'bg-white dark:bg-[#004a77] text-[#0b57d0] dark:text-[#c2e7ff] shadow-xs font-semibold'
                  : 'text-[#444746] dark:text-[#c4c7c5] hover:text-[#1f1f1f] dark:hover:text-[#e3e3e3]'
              }`}
            >
              <span className="truncate">Copilot</span>
            </button>

            <button
              onClick={() => setActiveTab('detail')}
              className={`flex-1 py-2 px-2.5 rounded-md text-[13px] transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                activeTab === 'detail'
                  ? 'bg-white dark:bg-[#004a77] text-[#0b57d0] dark:text-[#c2e7ff] shadow-xs font-semibold'
                  : 'text-[#444746] dark:text-[#c4c7c5] hover:text-[#1f1f1f] dark:hover:text-[#e3e3e3]'
              }`}
            >
              <span className="truncate">Detail</span>
              {email && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0"></span>}
            </button>
          </div>
        </div>

        {/* Main Content Area */}
        <main className="flex-1 p-3.5 space-y-3">
          {/* Settings Drawer */}
          {showSettings && (
            <div className="bg-white dark:bg-[#1e1f20] border border-[#e0e2ec] dark:border-[#2c2d30] rounded-xl p-4 shadow-xs space-y-3.5 animate-in fade-in duration-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-[#1f1f1f] dark:text-[#e3e3e3] font-bold text-sm">
                  <Key className="w-4 h-4 text-[#0b57d0] dark:text-[#a8c7fa]" />
                  <span>AI Configuration</span>
                </div>
                <span className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" /> Auto-Cascade Active
                </span>
              </div>

              <form onSubmit={handleSaveSettings} className="space-y-3">
                <div className="space-y-1">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-semibold text-[#444746] dark:text-[#c4c7c5]">
                      Google Gemini Key
                    </span>
                    <a
                      href="https://aistudio.google.com/"
                      target="_blank"
                      rel="noreferrer"
                      className="text-[#0b57d0] dark:text-[#a8c7fa] hover:underline flex items-center gap-0.5 text-xs font-medium"
                    >
                      Get Free Key <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                  <input
                    type="password"
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    placeholder="Paste Gemini API Key..."
                    className="w-full px-3 py-2 text-xs bg-[#f6f8fc] dark:bg-[#111318] border border-[#dadce0] dark:border-[#3c4043] rounded-lg focus:bg-white dark:focus:bg-[#1e1f20] focus:outline-none focus:border-[#0b57d0] dark:focus:border-[#a8c7fa] text-[#1f1f1f] dark:text-[#e3e3e3] font-mono"
                  />
                </div>

                <div className="space-y-1 pt-2 border-t border-[#f1f3f4] dark:border-[#2c2d30]">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-semibold text-[#444746] dark:text-[#c4c7c5] flex items-center gap-1">
                      <span>Groq Key</span>
                      <span className="px-1.5 py-0.2 bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-800/60 text-[9px] rounded font-bold">
                        Zero Downtime
                      </span>
                    </span>
                    <a
                      href="https://console.groq.com/keys"
                      target="_blank"
                      rel="noreferrer"
                      className="text-[#0b57d0] dark:text-[#a8c7fa] hover:underline flex items-center gap-0.5 text-xs font-medium"
                    >
                      Free Groq Key <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                  <input
                    type="password"
                    value={groqKey}
                    onChange={(e) => setGroqKey(e.target.value)}
                    placeholder="gsk_... (Optional backup)"
                    className="w-full px-3 py-2 text-xs bg-[#f6f8fc] dark:bg-[#111318] border border-[#dadce0] dark:border-[#3c4043] rounded-lg focus:bg-white dark:focus:bg-[#1e1f20] focus:outline-none focus:border-[#0b57d0] dark:focus:border-[#a8c7fa] text-[#1f1f1f] dark:text-[#e3e3e3] font-mono"
                  />
                </div>

                {/* In-Gmail Integration & Revert Options */}
                <div className="pt-2 border-t border-[#f1f3f4] dark:border-[#2c2d30] space-y-2">
                  <div>
                    <div className="font-semibold text-[#1f1f1f] dark:text-[#e3e3e3] text-xs flex items-center gap-1.5">
                      <LayoutGrid className="w-3.5 h-3.5 text-[#0b57d0] dark:text-[#a8c7fa] shrink-0" />
                      <span>Gmail Integration & Revert</span>
                    </div>
                    <p className="text-[11px] text-[#5f6368] dark:text-[#8e918f] leading-tight mt-0.5">
                      Select how AcadMail integrates inside Gmail
                    </p>
                  </div>

                  <div className="grid grid-cols-3 gap-1.5 pt-0.5">
                    <button
                      type="button"
                      onClick={() => handleSetUiMode('blended')}
                      className={`p-2.5 rounded-xl text-left border transition ${
                        uiMode === 'blended'
                          ? 'bg-[#c2e7ff] dark:bg-[#004a77] border-[#7fcfff] dark:border-[#005c93] text-[#001d35] dark:text-[#c2e7ff] font-semibold shadow-2xs'
                          : 'bg-white dark:bg-[#1e1f20] border-[#dadce0] dark:border-[#3c4043] text-[#444746] dark:text-[#c4c7c5] hover:bg-[#f0f4f9] dark:hover:bg-[#28292c]'
                      }`}
                    >
                      <div className="flex items-center gap-1.5 text-xs font-medium">
                        <span>Blended M3</span>
                      </div>
                      <p className="text-[10px] text-[#5f6368] dark:text-[#8e918f] font-normal mt-0.5 leading-tight">Native Google UI</p>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleSetUiMode('floating')}
                      className={`p-2.5 rounded-xl text-left border transition ${
                        uiMode === 'floating'
                          ? 'bg-[#c2e7ff] dark:bg-[#004a77] border-[#7fcfff] dark:border-[#005c93] text-[#001d35] dark:text-[#c2e7ff] font-semibold shadow-2xs'
                          : 'bg-white dark:bg-[#1e1f20] border-[#dadce0] dark:border-[#3c4043] text-[#444746] dark:text-[#c4c7c5] hover:bg-[#f0f4f9] dark:hover:bg-[#28292c]'
                      }`}
                    >
                      <div className="flex items-center gap-1.5 text-xs font-medium">
                        <span>Floating Bar</span>
                      </div>
                      <p className="text-[10px] text-[#5f6368] dark:text-[#8e918f] font-normal mt-0.5 leading-tight">Capsule toolbar</p>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleSetUiMode('off')}
                      className={`p-2.5 rounded-xl text-left border transition ${
                        uiMode === 'off'
                          ? 'bg-[#fce8e6] dark:bg-[#3d1417] border-[#fad2cf] dark:border-[#66272c] text-[#c5221f] dark:text-[#f29e99] font-semibold shadow-2xs'
                          : 'bg-white dark:bg-[#1e1f20] border-[#dadce0] dark:border-[#3c4043] text-[#444746] dark:text-[#c4c7c5] hover:bg-[#f0f4f9] dark:hover:bg-[#28292c]'
                      }`}
                    >
                      <div className="flex items-center gap-1.5 text-xs font-medium">
                        <span>Revert (Off)</span>
                      </div>
                      <p className="text-[10px] text-[#5f6368] dark:text-[#8e918f] font-normal mt-0.5 leading-tight">Side panel only</p>
                    </button>
                  </div>
                </div>

                {/* Custom Academic Filters Management */}
                <div className="pt-2 border-t border-[#f1f3f4] dark:border-[#2c2d30] space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="font-semibold text-[#1f1f1f] dark:text-[#e3e3e3] text-xs flex items-center gap-1.5">
                      <span>Custom Academic Filters</span>
                    </div>
                    <span className="text-xs text-[#5f6368] dark:text-[#8e918f] font-medium">
                      {customFilters.length} active
                    </span>
                  </div>
                  <p className="text-xs text-[#5f6368] dark:text-[#8e918f] leading-tight">
                    Add custom filters for placements, hostels, clubs, or research labs.
                  </p>

                  {/* Existing Filters List */}
                  {customFilters.length > 0 && (
                    <div className="space-y-1 max-h-36 overflow-y-auto">
                      {customFilters.map((f) => (
                        <div
                          key={f.id}
                          className="flex items-center justify-between p-2 rounded-lg bg-[#f6f8fc] dark:bg-[#111318] border border-[#dadce0] dark:border-[#3c4043]"
                        >
                          <div className="min-w-0 flex-1 pr-2">
                            <div className="font-semibold text-xs text-[#1f1f1f] dark:text-[#e3e3e3] truncate flex items-center gap-1.5">
                              <span className="w-2 h-2 rounded-full shrink-0 bg-[#747775] dark:bg-[#9aa0a6]" />
                              <span className="truncate">{f.name}</span>
                            </div>
                            <div className="text-[11px] text-[#5f6368] dark:text-[#8e918f] truncate mt-0.5">
                              Keywords: {f.keywords.join(', ')}
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleDeleteCustomFilter(f.id)}
                            className="p-1 text-[#5f6368] hover:text-[#1f1f1f] dark:hover:text-[#e3e3e3] rounded-lg transition shrink-0 cursor-pointer"
                            title="Delete custom filter"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Add New Filter Inline */}
                  <div className="p-3 rounded-lg bg-[#f6f8fc] dark:bg-[#111318] border border-[#dadce0] dark:border-[#3c4043] space-y-2">
                    <div className="text-xs font-semibold text-[#1f1f1f] dark:text-[#e3e3e3]">
                      Add New Custom Filter
                    </div>
                    <div className="space-y-1.5">
                      <input
                        type="text"
                        placeholder="Filter Name (e.g. Library & Fines)"
                        value={newFilterName}
                        onChange={(e) => setNewFilterName(e.target.value)}
                        className="w-full px-3 py-1.5 text-xs bg-white dark:bg-[#1e1f20] border border-[#dadce0] dark:border-[#3c4043] rounded-lg text-[#1f1f1f] dark:text-[#e3e3e3] focus:outline-none focus:border-[#0b57d0]"
                      />
                      <input
                        type="text"
                        placeholder="Keywords (e.g. library, book, fine, return)"
                        value={newFilterKeywords}
                        onChange={(e) => setNewFilterKeywords(e.target.value)}
                        className="w-full px-3 py-1.5 text-xs bg-white dark:bg-[#1e1f20] border border-[#dadce0] dark:border-[#3c4043] rounded-lg text-[#1f1f1f] dark:text-[#e3e3e3] focus:outline-none focus:border-[#0b57d0]"
                      />
                    </div>
                    <div className="flex justify-end">
                      <button
                        type="button"
                        disabled={!newFilterName.trim()}
                        onClick={handleAddCustomFilter}
                        className="px-3.5 py-1.5 bg-[#0b57d0] hover:bg-[#0842a0] dark:bg-[#a8c7fa] dark:hover:bg-[#d3e3fd] text-white dark:text-[#001d35] disabled:opacity-40 rounded-lg text-xs font-semibold transition shadow-xs cursor-pointer"
                      >
                        Create Filter
                      </button>
                    </div>
                  </div>
                </div>

                {/* Priority List (Rank-Weighted Routing) */}
                <div className="pt-2 border-t border-[#f1f3f4] dark:border-[#2c2d30] space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-semibold text-[#1f1f1f] dark:text-[#e3e3e3] text-xs">
                        Priority List (Rank-Weighted Routing)
                      </div>
                      <p className="text-[11px] text-[#5f6368] dark:text-[#8e918f] leading-tight mt-0.5">
                        Emails are evaluated in this order (Rank 1 first). Subtle keyword signals route directly into higher priorities.
                      </p>
                    </div>
                    <span className="text-xs text-[#0b57d0] dark:text-[#a8c7fa] font-semibold">
                      {priorityList.length} ranked
                    </span>
                  </div>

                  {/* Ranked Priority Items */}
                  <div className="space-y-1.5 pt-1">
                    {priorityList.map((catId, index) => {
                      const catInfo = AVAILABLE_PRIORITY_CATEGORIES.find((c) => c.id === catId);
                      const Icon = catInfo?.icon || Tag;
                      return (
                        <div
                          key={catId}
                          className="flex items-center justify-between p-2 rounded-xl border bg-white dark:bg-[#1e1f20] border-[#dadce0] dark:border-[#3c4043] shadow-2xs"
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <div
                              className={`w-5 h-5 rounded-full flex items-center justify-center text-[11px] font-bold shrink-0 ${
                                index === 0
                                  ? 'bg-[#0b57d0] text-white'
                                  : 'bg-[#e8f0fe] dark:bg-[#004a77] text-[#0b57d0] dark:text-[#c2e7ff]'
                              }`}
                            >
                              {index + 1}
                            </div>
                            <Icon className="w-3.5 h-3.5 text-[#5f6368] dark:text-[#8e918f] shrink-0" />
                            <div className="min-w-0">
                              <div className="text-xs font-semibold text-[#1f1f1f] dark:text-[#e3e3e3] truncate flex items-center gap-1.5">
                                <span>{catInfo?.label || catId}</span>
                                {index === 0 && (
                                  <span className="text-[9.5px] px-1.5 py-0.2 rounded font-medium bg-[#c2e7ff]/80 dark:bg-[#004a77]/80 text-[#001d35] dark:text-[#c2e7ff]">
                                    Top Priority
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-0.5 shrink-0 ml-2">
                            <button
                              type="button"
                              disabled={index === 0}
                              onClick={() => movePriorityUp(index)}
                              className="p-1 rounded text-[#5f6368] hover:text-[#1f1f1f] dark:text-[#8e918f] dark:hover:text-white disabled:opacity-20 hover:bg-[#f1f3f4] dark:hover:bg-[#282a2d] transition cursor-pointer"
                              title="Move Up"
                            >
                              <ChevronUp className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              disabled={index === priorityList.length - 1}
                              onClick={() => movePriorityDown(index)}
                              className="p-1 rounded text-[#5f6368] hover:text-[#1f1f1f] dark:text-[#8e918f] dark:hover:text-white disabled:opacity-20 hover:bg-[#f1f3f4] dark:hover:bg-[#282a2d] transition cursor-pointer"
                              title="Move Down"
                            >
                              <ChevronDown className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              disabled={priorityList.length <= 1}
                              onClick={() => removeFromPriorityList(catId)}
                              className="p-1 rounded text-[#5f6368] hover:text-[#c5221f] dark:text-[#8e918f] dark:hover:text-[#f28b82] disabled:opacity-20 hover:bg-[#fce8e6] dark:hover:bg-[#3c1e1e] transition cursor-pointer ml-0.5"
                              title="Remove"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Add Unranked Categories */}
                  {(() => {
                    const unranked = AVAILABLE_PRIORITY_CATEGORIES.filter(
                      (c) => !priorityList.includes(c.id)
                    );
                    if (unranked.length === 0) return null;
                    return (
                      <div className="pt-1.5">
                        <div className="text-[11px] font-medium text-[#5f6368] dark:text-[#8e918f] mb-1">
                          Add category to priority list:
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {unranked.map((cat) => (
                            <button
                              key={cat.id}
                              type="button"
                              onClick={() => addToPriorityList(cat.id)}
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium border border-dashed border-[#dadce0] dark:border-[#3c4043] text-[#444746] dark:text-[#c4c7c5] hover:border-[#0b57d0] hover:text-[#0b57d0] dark:hover:border-[#a8c7fa] dark:hover:text-[#a8c7fa] hover:bg-[#f0f4f9] dark:hover:bg-[#282a2d] transition cursor-pointer"
                            >
                              <Plus className="w-3 h-3" />
                              <span>{cat.label}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    );
                  })()}
                </div>

                <div className="flex justify-end pt-1">
                  <button
                    type="submit"
                    className="px-4 py-2 bg-[#0b57d0] hover:bg-[#0842a0] dark:bg-[#a8c7fa] dark:hover:bg-[#d3e3fd] text-white dark:text-[#001d35] font-semibold rounded-lg text-xs transition shadow-xs cursor-pointer"
                  >
                    Save Settings
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* ========================================================================= */}
          {/* FIRST-TIME SETUP MODAL: USER PRIORITY LIST */}
          {/* ========================================================================= */}
          {showSetupModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/40 backdrop-blur-xs animate-in fade-in duration-200">
              <div className="w-full max-w-sm bg-white dark:bg-[#1e1f20] border border-[#dadce0] dark:border-[#3c4043] rounded-2xl shadow-xl p-5 space-y-3.5">
                <div className="text-center space-y-1">
                  <div className="w-10 h-10 rounded-xl bg-[#c2e7ff] dark:bg-[#004a77] text-[#0b57d0] dark:text-[#c2e7ff] flex items-center justify-center mx-auto mb-1 shadow-2xs">
                    <Mail className="w-5 h-5" />
                  </div>
                  <h3 className="font-bold text-[17px] text-[#1f1f1f] dark:text-[#e3e3e3] font-['Batangas',serif]">
                    Set Your Label Priorities
                  </h3>
                  <p className="text-xs text-[#5f6368] dark:text-[#8e918f] leading-relaxed">
                    Rank your academic categories. Emails are classified in priority order—even when keywords are subtle or probability is low.
                  </p>
                </div>

                {/* Priority List Display */}
                <div className="space-y-1.5 max-h-56 overflow-y-auto pr-0.5">
                  {priorityList.map((catId, index) => {
                    const catInfo = AVAILABLE_PRIORITY_CATEGORIES.find((c) => c.id === catId);
                    const Icon = catInfo?.icon || Tag;
                    return (
                      <div
                        key={catId}
                        className="flex items-center justify-between p-2.5 rounded-xl border bg-white dark:bg-[#1e1f20] border-[#dadce0] dark:border-[#3c4043] shadow-2xs"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div
                            className={`w-5 h-5 rounded-full flex items-center justify-center text-[11px] font-bold shrink-0 ${
                              index === 0
                                ? 'bg-[#0b57d0] text-white shadow-2xs'
                                : 'bg-[#e8f0fe] dark:bg-[#004a77] text-[#0b57d0] dark:text-[#c2e7ff]'
                            }`}
                          >
                            {index + 1}
                          </div>
                          <Icon className="w-4 h-4 text-[#5f6368] dark:text-[#8e918f] shrink-0" />
                          <div className="min-w-0">
                            <div className="text-xs font-semibold text-[#1f1f1f] dark:text-[#e3e3e3] truncate flex items-center gap-1.5">
                              <span>{catInfo?.label || catId}</span>
                              {index === 0 && (
                                <span className="text-[9.5px] px-1.5 py-0.2 rounded font-medium bg-[#c2e7ff]/80 dark:bg-[#004a77]/80 text-[#001d35] dark:text-[#c2e7ff]">
                                  Top Priority
                                </span>
                              )}
                            </div>
                            <div className="text-[10.5px] text-[#5f6368] dark:text-[#8e918f] truncate">
                              {catInfo?.desc || 'Academic category'}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-0.5 shrink-0 ml-2">
                          <button
                            type="button"
                            disabled={index === 0}
                            onClick={() => movePriorityUp(index)}
                            className="p-1 rounded text-[#5f6368] hover:text-[#1f1f1f] dark:text-[#8e918f] dark:hover:text-white disabled:opacity-20 hover:bg-[#f1f3f4] dark:hover:bg-[#282a2d] transition cursor-pointer"
                            title="Move Up in Priority"
                          >
                            <ChevronUp className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            disabled={index === priorityList.length - 1}
                            onClick={() => movePriorityDown(index)}
                            className="p-1 rounded text-[#5f6368] hover:text-[#1f1f1f] dark:text-[#8e918f] dark:hover:text-white disabled:opacity-20 hover:bg-[#f1f3f4] dark:hover:bg-[#282a2d] transition cursor-pointer"
                            title="Move Down in Priority"
                          >
                            <ChevronDown className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            disabled={priorityList.length <= 1}
                            onClick={() => removeFromPriorityList(catId)}
                            className="p-1 rounded text-[#5f6368] hover:text-[#c5221f] dark:text-[#8e918f] dark:hover:text-[#f28b82] disabled:opacity-20 hover:bg-[#fce8e6] dark:hover:bg-[#3c1e1e] transition cursor-pointer ml-0.5"
                            title="Remove"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Available Categories to Add */}
                {(() => {
                  const unranked = AVAILABLE_PRIORITY_CATEGORIES.filter(
                    (c) => !priorityList.includes(c.id)
                  );
                  if (unranked.length === 0) return null;
                  return (
                    <div>
                      <div className="text-[11px] font-medium text-[#5f6368] dark:text-[#8e918f] mb-1">
                        Add to priority list:
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {unranked.map((cat) => (
                          <button
                            key={cat.id}
                            type="button"
                            onClick={() => addToPriorityList(cat.id)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium border border-dashed border-[#dadce0] dark:border-[#3c4043] text-[#444746] dark:text-[#c4c7c5] hover:border-[#0b57d0] hover:text-[#0b57d0] dark:hover:border-[#a8c7fa] dark:hover:text-[#a8c7fa] hover:bg-[#f0f4f9] dark:hover:bg-[#282a2d] transition cursor-pointer"
                          >
                            <Plus className="w-3 h-3" />
                            <span>{cat.label}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  );
                })()}

                <div className="pt-2 border-t border-[#f1f3f4] dark:border-[#282a2d] space-y-2">
                  <button
                    type="button"
                    onClick={() => handleSaveFirstTimeSetup(priorityList)}
                    className="w-full py-2.5 px-4 bg-[#0b57d0] hover:bg-[#0842a0] dark:bg-[#a8c7fa] dark:hover:bg-[#d3e3fd] text-white dark:text-[#001d35] font-semibold rounded-xl text-xs transition shadow-xs cursor-pointer text-center"
                  >
                    Save Priority List & Start ({priorityList.length} ranked)
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      handleSaveFirstTimeSetup([
                        'Academics',
                        'Competitions & Tournaments',
                        'Class Rescheduling',
                      ])
                    }
                    className="w-full py-1 text-xs text-[#5f6368] hover:text-[#1f1f1f] dark:text-[#8e918f] dark:hover:text-white font-medium transition cursor-pointer text-center"
                  >
                    Reset to Recommended Order
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* VIEW 1: SMART BUCKETS INBOX ORGANIZER */}
          {/* ========================================================================= */}
          {activeTab === 'buckets' && (
            <div className="space-y-2.5">
              {/* Category Filter Ribbon */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none pt-0.5">
                <button
                  onClick={() => handleCategoryFilterChange('ALL')}
                  className={`px-3 py-1.5 rounded-lg text-[12.5px] transition shrink-0 flex items-center gap-1.5 cursor-pointer ${
                    selectedCategory === 'ALL'
                      ? 'bg-[#c2e7ff] text-[#001d35] dark:bg-[#004a77] dark:text-[#c2e7ff] font-semibold border border-[#7fcfff] dark:border-[#005c93] shadow-2xs'
                      : 'bg-white dark:bg-[#1e1f20] text-[#444746] dark:text-[#c4c7c5] border border-[#dadce0] dark:border-[#3c4043] hover:bg-[#f0f4f9] dark:hover:bg-[#28292c]'
                  }`}
                >
                  <span>All</span>
                  <span
                    className={`text-[11px] px-2 py-0.5 rounded-md font-medium ${
                      selectedCategory === 'ALL'
                        ? 'bg-[#001d35]/12 text-[#001d35] dark:bg-[#c2e7ff]/20 dark:text-[#c2e7ff]'
                        : 'bg-[#f1f3f4] text-[#5f6368] dark:bg-[#28292a] dark:text-[#8e918f]'
                    }`}
                  >
                    {counts.all}
                  </span>
                </button>

                {[
                  { id: 'Academics', label: 'Academics', count: counts.academics },
                  { id: 'Competitions & Tournaments', label: 'Competitions', count: counts.competitions },
                  { id: 'Workshops', label: 'Workshops', count: counts.workshops },
                  { id: 'Class Rescheduling', label: 'Reschedules', count: counts.rescheduling },
                  { id: 'General', label: 'General', count: counts.general },
                ].map((cat) => {
                  const isSelected = selectedCategory === cat.id;
                  const theme = getCategoryTheme(cat.id as CategoryType);
                  return (
                    <button
                      key={cat.id}
                      onClick={() => handleCategoryFilterChange(cat.id as CategoryType)}
                      className={`px-3 py-1.5 rounded-lg text-[12.5px] font-medium transition shrink-0 flex items-center gap-1.5 cursor-pointer ${
                        isSelected
                          ? `${theme.activeBtn}`
                          : 'bg-white dark:bg-[#1e1f20] text-[#444746] dark:text-[#c4c7c5] border border-[#dadce0] dark:border-[#3c4043] hover:bg-[#f0f4f9] dark:hover:bg-[#28292c]'
                      }`}
                    >
                      <span>{cat.label}</span>
                      <span
                        className={`text-[11px] px-2 py-0.5 rounded-md font-medium ${
                          isSelected
                            ? `${theme.countBadge}`
                            : 'bg-[#f1f3f4] text-[#5f6368] dark:bg-[#28292a] dark:text-[#8e918f]'
                        }`}
                      >
                        {cat.count}
                      </span>
                    </button>
                  );
                })}

                {/* Custom Filters */}
                {customFilters.map((filter) => {
                  const isSelected = selectedCategory === filter.name;
                  const theme = getCategoryTheme(filter.name);
                  return (
                    <button
                      key={filter.id}
                      onClick={() => handleCategoryFilterChange(filter.name)}
                      className={`px-3 py-1.5 rounded-lg text-[12.5px] transition shrink-0 flex items-center gap-1.5 cursor-pointer ${
                        isSelected
                          ? `${theme.activeBtn}`
                          : 'bg-white dark:bg-[#1e1f20] text-[#444746] dark:text-[#c4c7c5] border border-[#dadce0] dark:border-[#3c4043] hover:bg-[#f0f4f9] dark:hover:bg-[#28292c]'
                      }`}
                    >
                      <span>{filter.name}</span>
                      <span
                        className={`text-[11px] px-2 py-0.5 rounded-md font-medium ${
                          isSelected
                            ? `${theme.countBadge}`
                            : 'bg-[#f1f3f4] text-[#5f6368] dark:bg-[#28292a] dark:text-[#8e918f]'
                        }`}
                      >
                        {counts[filter.name] || 0}
                      </span>
                    </button>
                  );
                })}

                {/* Add Filter Button */}
                <button
                  onClick={() => setShowAddFilterModal(true)}
                  title="Add custom academic filter"
                  className="px-3 py-1.5 rounded-lg text-[12.5px] font-medium text-[#444746] dark:text-[#c4c7c5] border border-dashed border-[#dadce0] dark:border-[#3c4043] hover:border-[#747775] hover:bg-[#f0f4f9] dark:hover:bg-[#28292c] transition shrink-0 flex items-center gap-1 cursor-pointer"
                >
                  <span>+ Filter</span>
                </button>
              </div>

              {/* Search & Actions Toolbar */}
              <div className="flex items-center gap-1.5">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-[#5f6368] dark:text-[#8e918f] absolute left-3 top-2.5 pointer-events-none" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={`Search in ${selectedCategory === 'ALL' ? 'all emails' : selectedCategory}...`}
                    className="w-full pl-9 pr-7 py-2 text-sm bg-white dark:bg-[#1e1f20] border border-[#dadce0] dark:border-[#3c4043] focus:border-[#0b57d0] dark:focus:border-[#a8c7fa] rounded-lg focus:outline-none text-[#1f1f1f] dark:text-[#e3e3e3] placeholder-[#5f6368] dark:placeholder-[#8e918f] shadow-2xs transition-colors"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="absolute right-2.5 top-2 text-[#5f6368] hover:text-[#1f1f1f] dark:text-[#8e918f] dark:hover:text-[#e3e3e3]"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </div>

                <button
                  onClick={() => handleToggleSyncDom(!syncGmailDom)}
                  title="Dim non-matching rows on Gmail"
                  className={`py-2 px-3 rounded-lg border text-xs font-medium flex items-center gap-1.5 transition shrink-0 cursor-pointer ${
                    syncGmailDom
                      ? 'bg-[#c2e7ff] text-[#001d35] dark:bg-[#004a77] dark:text-[#c2e7ff] border-[#7fcfff] dark:border-[#005c93] shadow-2xs font-semibold'
                      : 'bg-white dark:bg-[#1e1f20] border border-[#dadce0] dark:border-[#3c4043] text-[#444746] dark:text-[#c4c7c5] hover:bg-[#f0f4f9] dark:hover:bg-[#28292c]'
                  }`}
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Dim Gmail</span>
                </button>

                <button
                  onClick={() => scanInbox()}
                  disabled={isScanningInbox}
                  title="Refresh & scan visible inbox rows"
                  className="p-2 rounded-lg border border-[#dadce0] dark:border-[#3c4043] bg-white dark:bg-[#1e1f20] text-[#444746] dark:text-[#c4c7c5] hover:text-[#1f1f1f] dark:hover:text-[#e3e3e3] hover:bg-[#f0f4f9] dark:hover:bg-[#28292c] transition shrink-0 cursor-pointer"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isScanningInbox ? 'animate-spin text-[#0b57d0] dark:text-[#a8c7fa]' : ''}`} />
                </button>
              </div>

              {/* Email List */}
              {filteredInbox.length === 0 ? (
                <div className="bg-white dark:bg-[#1e1f20] border border-[#e0e2ec] dark:border-[#2c2d30] rounded-xl p-8 text-center space-y-3 shadow-2xs">
                  <div className="w-10 h-10 mx-auto rounded-lg bg-[#eaeff8] dark:bg-[#28292a] text-[#0b57d0] dark:text-[#a8c7fa] flex items-center justify-center">
                    <Mail className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-[#1f1f1f] dark:text-[#e3e3e3] text-sm">
                      {inboxItems.length === 0
                        ? 'No visible emails detected'
                        : `No emails found in "${selectedCategory}"`}
                    </h4>
                    <p className="text-xs text-[#5f6368] dark:text-[#8e918f] mt-1 max-w-[260px] mx-auto">
                      Scan your visible Gmail inbox rows to categorize them automatically.
                    </p>
                  </div>
                  <button
                    onClick={() => scanInbox()}
                    disabled={isScanningInbox}
                    className="px-4 py-2 bg-[#0b57d0] hover:bg-[#0842a0] dark:bg-[#a8c7fa] dark:hover:bg-[#d3e3fd] text-white dark:text-[#001d35] font-semibold text-xs rounded-lg transition shadow-xs inline-flex items-center gap-1.5 cursor-pointer"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isScanningInbox ? 'animate-spin' : ''}`} />
                    <span>Scan Visible Inbox</span>
                  </button>
                </div>
              ) : (
                <div className="rounded-xl border border-[#e0e2ec] dark:border-[#2c2d30] bg-white dark:bg-[#1e1f20] divide-y divide-[#f1f3f4] dark:divide-[#28292a] overflow-hidden shadow-2xs">
                  {filteredInbox.map((item) => {
                    const theme = getCategoryTheme(item.category);
                    return (
                      <div
                        key={item.id}
                        onClick={() => handleSelectInboxRow(item)}
                        className="p-3.5 hover:bg-[#f0f4f9] dark:hover:bg-[#28292c] cursor-pointer transition-colors group flex flex-col gap-1.5"
                      >
                        {/* Header: Sender & Timestamp */}
                        <div className="flex items-center justify-between gap-2 min-w-0">
                          <span className="font-semibold text-[#1f1f1f] dark:text-[#e3e3e3] text-[13.5px] truncate">
                            {item.sender}
                          </span>
                          <span className="text-xs text-[#5f6368] dark:text-[#8e918f] shrink-0 font-normal">
                            {item.date}
                          </span>
                        </div>

                        {/* Subject */}
                        <div className="font-medium text-[13px] text-[#1f1f1f] dark:text-[#e3e3e3] group-hover:text-[#0b57d0] dark:group-hover:text-[#a8c7fa] transition-colors line-clamp-1 leading-snug">
                          {item.subject}
                        </div>

                        {/* Snippet preview */}
                        {item.snippet && (
                          <p className="text-xs text-[#5f6368] dark:text-[#8e918f] line-clamp-2 leading-relaxed">
                            {item.snippet}
                          </p>
                        )}

                        {/* Badges / Micro-tags */}
                        <div className="flex items-center justify-between pt-1 gap-2">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span
                              className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[11px] font-medium border ${theme.chip}`}
                            >
                              <span className={`w-1.5 h-1.5 rounded-full ${theme.dot}`} />
                              <span>{item.category}</span>
                            </span>

                            {item.courseCode && (
                              <span className="px-2 py-0.5 rounded-md text-[10.5px] font-medium bg-[#eaeff8] dark:bg-[#28292a] text-[#0b57d0] dark:text-[#a8c7fa] border border-[#d3e3fd] dark:border-[#3c4043]">
                                {item.courseCode}
                              </span>
                            )}
                          </div>

                          <span className="text-xs font-medium text-[#5f6368] dark:text-[#8e918f] group-hover:text-[#0b57d0] dark:group-hover:text-[#a8c7fa] opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-0.5 shrink-0">
                            <span>Open</span>
                            <ChevronRight className="w-3.5 h-3.5" />
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* ========================================================================= */}
          {/* VIEW 2: MASTER ACADEMIC DEADLINE TIMELINE */}
          {/* ========================================================================= */}
          {activeTab === 'deadlines' && (
            <div className="space-y-3">
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                <button
                  onClick={() => setDeadlineFilter('all')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition shrink-0 cursor-pointer ${
                    deadlineFilter === 'all'
                      ? 'bg-[#c2e7ff] text-[#001d35] dark:bg-[#004a77] dark:text-[#c2e7ff] font-semibold border border-[#7fcfff] dark:border-[#005c93] shadow-2xs'
                      : 'bg-white dark:bg-[#1e1f20] border border-[#dadce0] dark:border-[#3c4043] text-[#444746] dark:text-[#c4c7c5] hover:bg-[#f0f4f9] dark:hover:bg-[#28292c]'
                  }`}
                >
                  All ({deadlines.length})
                </button>
                <button
                  onClick={() => setDeadlineFilter('urgent')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition shrink-0 cursor-pointer ${
                    deadlineFilter === 'urgent'
                      ? 'bg-[#c2e7ff] text-[#001d35] dark:bg-[#004a77] dark:text-[#c2e7ff] font-semibold border border-[#7fcfff] dark:border-[#005c93] shadow-2xs'
                      : 'bg-white dark:bg-[#1e1f20] border border-[#dadce0] dark:border-[#3c4043] text-[#444746] dark:text-[#c4c7c5] hover:bg-[#f0f4f9] dark:hover:bg-[#28292c]'
                  }`}
                >
                  <span>Due Soon</span>
                </button>
                <button
                  onClick={() => setDeadlineFilter('academics')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition shrink-0 cursor-pointer ${
                    deadlineFilter === 'academics'
                      ? 'bg-[#c2e7ff] text-[#001d35] dark:bg-[#004a77] dark:text-[#c2e7ff] font-semibold border border-[#7fcfff] dark:border-[#005c93] shadow-2xs'
                      : 'bg-white dark:bg-[#1e1f20] border border-[#dadce0] dark:border-[#3c4043] text-[#444746] dark:text-[#c4c7c5] hover:bg-[#f0f4f9] dark:hover:bg-[#28292c]'
                  }`}
                >
                  <span>Coursework</span>
                </button>
                <button
                  onClick={() => setDeadlineFilter('competitions')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition shrink-0 cursor-pointer ${
                    deadlineFilter === 'competitions'
                      ? 'bg-[#c2e7ff] text-[#001d35] dark:bg-[#004a77] dark:text-[#c2e7ff] font-semibold border border-[#7fcfff] dark:border-[#005c93] shadow-2xs'
                      : 'bg-white dark:bg-[#1e1f20] border border-[#dadce0] dark:border-[#3c4043] text-[#444746] dark:text-[#c4c7c5] hover:bg-[#f0f4f9] dark:hover:bg-[#28292c]'
                  }`}
                >
                  <span>Contests</span>
                </button>
              </div>

              {filteredDeadlines.length === 0 ? (
                <div className="bg-white dark:bg-[#1e1f20] border border-[#e0e2ec] dark:border-[#2c2d30] rounded-xl p-6 text-center space-y-2 shadow-2xs">
                  <CalendarCheck2 className="w-8 h-8 mx-auto text-[#5f6368] dark:text-[#8e918f]" />
                  <h4 className="font-semibold text-[#1f1f1f] dark:text-[#e3e3e3] text-sm">
                    No pending deadlines found
                  </h4>
                  <p className="text-xs text-[#5f6368] dark:text-[#8e918f]">
                    Scan your inbox in the Buckets tab to pull upcoming submission dates.
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {filteredDeadlines.map((dl) => {
                    const theme = getCategoryTheme(dl.category);
                    const deadlineBadge = getDeadlineBadgeStyle(dl.deadline);
                    return (
                      <div
                        key={dl.id}
                        className={`p-3.5 bg-white dark:bg-[#1e1f20] border rounded-xl transition space-y-2 shadow-2xs ${
                          dl.completed
                            ? 'opacity-60 bg-[#f6f8fc]/60 dark:bg-[#111318]/60 border-[#e0e2ec] dark:border-[#2c2d30]'
                            : 'border-[#e0e2ec] dark:border-[#2c2d30] hover:border-[#0b57d0] dark:hover:border-[#a8c7fa]'
                        }`}
                      >
                        <div className="flex items-start gap-2.5">
                          <button
                            onClick={() => toggleDeadlineComplete(dl.id)}
                            className="mt-0.5 text-[#5f6368] hover:text-[#0b57d0] dark:text-[#8e918f] dark:hover:text-[#a8c7fa] transition shrink-0 cursor-pointer"
                          >
                            {dl.completed ? (
                              <CheckCircle2 className="w-4 h-4 text-[#137333] dark:text-[#85e0a3]" />
                            ) : (
                              <Circle className="w-4 h-4" />
                            )}
                          </button>

                          <div className="flex-1 min-w-0">
                            <p
                              className={`font-semibold text-[13.5px] leading-snug ${
                                dl.completed
                                   ? 'line-through text-[#5f6368] dark:text-[#8e918f]'
                                   : 'text-[#1f1f1f] dark:text-[#e3e3e3]'
                              }`}
                            >
                              {dl.title}
                            </p>

                            {/* Highlighted Date & Time + Sender */}
                            <div className="flex items-center gap-2 mt-2 flex-wrap">
                              <span
                                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold border transition-all ${
                                  dl.completed
                                    ? 'bg-[#f1f3f4]/70 dark:bg-[#282a2d]/70 text-[#80868b] dark:text-[#6e716e] border-[#dadce0]/60 dark:border-[#3c4043]/60 line-through'
                                    : deadlineBadge.chip
                                }`}
                              >
                                {deadlineBadge.isTime ? (
                                  <Clock className={`w-3.5 h-3.5 shrink-0 ${dl.completed ? 'text-[#80868b]' : deadlineBadge.icon}`} />
                                ) : (
                                  <Calendar className={`w-3.5 h-3.5 shrink-0 ${dl.completed ? 'text-[#80868b]' : deadlineBadge.icon}`} />
                                )}
                                <span>{dl.deadline}</span>
                              </span>

                              <span className="text-xs text-[#5f6368] dark:text-[#8e918f] truncate max-w-[170px]">
                                {dl.sourceSender}
                              </span>
                            </div>

                            <div className="flex items-center justify-between mt-2 pt-1.5 border-t border-[#f1f3f4] dark:border-[#282a2d]">
                              <span
                                className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[11px] font-medium border ${theme.chip}`}
                              >
                                <span className={`w-1.5 h-1.5 rounded-full ${theme.dot}`} />
                                {dl.courseCode
                                  ? `${dl.courseCode} • ${dl.category}`
                                  : dl.category}
                              </span>

                              <div className="flex items-center gap-3">
                                <button
                                  onClick={() => handleJumpToEmailFromDeadline(dl)}
                                  className="text-xs text-[#444746] hover:text-[#1f1f1f] dark:text-[#c4c7c5] dark:hover:text-white font-medium flex items-center gap-0.5 transition"
                                >
                                  <span>Open Email</span>
                                  <ArrowUpRight className="w-3 h-3" />
                                </button>

                                <a
                                  href={createGoogleCalendarUrl(
                                    dl.title,
                                    `Academic Task from ${dl.sourceSender}`,
                                    dl.deadline
                                  )}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="text-xs text-[#0b57d0] hover:text-[#0842a0] dark:text-[#a8c7fa] hover:underline font-semibold flex items-center gap-0.5 transition"
                                >
                                  <span>+ Calendar</span>
                                  <ExternalLink className="w-3 h-3" />
                                </a>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* ========================================================================= */}
          {/* VIEW 3: INBOX COPILOT (CHATBOT) */}
          {/* ========================================================================= */}
          {activeTab === 'chat' && (
            <div className="flex flex-col h-[calc(100vh-125px)] animate-in fade-in duration-200">
              {/* Copilot Header */}
              <div className="flex items-center justify-between px-3 py-2 bg-white dark:bg-[#1e1f20] border border-[#e0e2ec] dark:border-[#2c2d30] rounded-xl mb-2 shrink-0 shadow-2xs">
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[13px] font-bold text-[#1f1f1f] dark:text-[#e3e3e3] tracking-tight font-serif">
                      Inbox Copilot
                    </span>
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  </div>
                  <div className="text-[10.5px] text-[#5f6368] dark:text-[#8e918f]">
                    {inboxItems.length} campus emails indexed
                  </div>
                </div>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => setCopilotMode(prev => prev === 'instant' ? 'cloud' : 'instant')}
                    title="Click to toggle between Instant Local Engine and Cloud LLM"
                    className={`text-[11px] font-medium px-2.5 py-1 rounded-full border transition-colors cursor-pointer shadow-2xs ${
                      copilotMode === 'instant'
                        ? 'bg-[#eaeff8] dark:bg-[#28292a] text-[#0b57d0] dark:text-[#a8c7fa] border-[#d3e3fd] dark:border-[#3c4043]'
                        : 'bg-[#c2e7ff] dark:bg-[#004a77] text-[#001d35] dark:text-[#c2e7ff] border-[#7fcfff] dark:border-[#005c93]'
                    }`}
                  >
                    <span>{copilotMode === 'instant' ? 'Instant Engine' : (apiKey || groqKey ? 'Cloud LLM' : 'Instant Engine')}</span>
                  </button>
                  <button
                    onClick={() => {
                      setChatMessages([
                        {
                          id: 'msg-welcome',
                          role: 'assistant',
                          text: "Chat cleared. Ask anything about coursework, deadlines, venues, or campus notices.",
                          timestamp: 'Just now',
                        },
                      ]);
                    }}
                    className="text-xs text-[#5f6368] hover:text-[#1f1f1f] dark:text-[#8e918f] dark:hover:text-[#e3e3e3] px-2 py-1 rounded transition cursor-pointer"
                  >
                    Clear
                  </button>
                </div>
              </div>

              {/* Messages Scroll Area */}
              <div className="flex-1 overflow-y-auto space-y-3 pr-1 pb-2 scrollbar-thin">
                {chatMessages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${
                      msg.role === 'user' ? 'items-end' : 'items-start'
                    }`}
                  >
                    {msg.role === 'user' ? (
                      <div className="max-w-[85%] rounded-2xl rounded-tr-xs px-3.5 py-2.5 text-[13px] bg-[#0b57d0] text-white dark:bg-[#a8c7fa] dark:text-[#001d35] font-normal shadow-2xs">
                        <p className="whitespace-pre-wrap">{msg.text}</p>
                      </div>
                    ) : (
                      <div className="max-w-[94%] rounded-2xl rounded-tl-xs p-3.5 bg-white dark:bg-[#1e1f20] text-[#1f1f1f] dark:text-[#e3e3e3] border border-[#e0e2ec] dark:border-[#2c2d30] shadow-2xs space-y-2">
                        {/* Assistant Header Badge */}
                        <div className="flex items-center justify-between pb-1.5 border-b border-[#e0e2ec]/60 dark:border-[#2c2d30]/60">
                          <span className="text-xs font-bold text-[#1f1f1f] dark:text-[#e3e3e3] tracking-tight">
                            AcadMail Copilot
                          </span>
                          <span className="text-[10px] text-[#5f6368] dark:text-[#8e918f]">
                            {msg.timestamp}
                          </span>
                        </div>

                        {/* Rich Parsed Message Content */}
                        <CopilotMessageRenderer text={msg.text} />

                        {/* Grounded Email References with Explicit Open Email Option */}
                        {(() => {
                          const effectiveReferences = (msg.references && msg.references.length > 0)
                            ? msg.references
                            : (() => {
                                if (msg.role !== 'assistant') return [];
                                const lower = msg.text.toLowerCase();
                                const matched = inboxItems.filter(
                                  (it) => it.subject.length > 8 && lower.includes(it.subject.toLowerCase().slice(0, 25))
                                );
                                return matched.slice(0, 3).map((it) => ({
                                  id: it.id,
                                  subject: it.subject,
                                  sender: it.sender,
                                  date: it.date,
                                  category: it.category,
                                  rowIndex: it.index,
                                }));
                              })();

                          if (effectiveReferences.length === 0) return null;

                          return (
                            <div className="mt-3 pt-2.5 border-t border-[#e0e2ec] dark:border-[#2c2d30] space-y-2">
                              <div className="flex items-center justify-between px-0.5">
                                <span className="text-[10.5px] font-bold text-[#5f6368] dark:text-[#8e918f] uppercase tracking-wider block">
                                  Source Email{effectiveReferences.length > 1 ? `s (${effectiveReferences.length})` : ''}
                                </span>
                                <span className="text-[10.5px] text-[#0b57d0] dark:text-[#a8c7fa] font-medium">
                                  Click to view in Gmail
                                </span>
                              </div>
                              <div className="space-y-1.5">
                                {effectiveReferences.map((ref) => (
                                  <div
                                    key={ref.id}
                                    onClick={() => handleJumpToEmailFromReference(ref)}
                                    className="flex items-center justify-between gap-2.5 p-2.5 rounded-xl bg-[#f8fafd] dark:bg-[#15171c] hover:bg-[#edf2fa] dark:hover:bg-[#20232a] border border-[#e0e2ec] dark:border-[#2c2d30] transition group cursor-pointer"
                                  >
                                    <div className="min-w-0 flex-1">
                                      <div className="text-xs font-semibold text-[#1f1f1f] dark:text-[#e3e3e3] truncate group-hover:text-[#0b57d0] dark:group-hover:text-[#a8c7fa]">
                                        {ref.subject}
                                      </div>
                                      <div className="text-[11px] text-[#5f6368] dark:text-[#8e918f] truncate flex items-center gap-1.5 mt-0.5">
                                        <span>{ref.sender}</span>
                                        {ref.date && (
                                          <>
                                            <span>•</span>
                                            <span>{ref.date}</span>
                                          </>
                                        )}
                                      </div>
                                    </div>

                                    <button
                                      type="button"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleJumpToEmailFromReference(ref);
                                      }}
                                      className="shrink-0 px-2.5 py-1.5 rounded-lg bg-[#c2e7ff] dark:bg-[#004a77] hover:bg-[#b0dcfa] dark:hover:bg-[#005c93] text-[#001d35] dark:text-[#c2e7ff] text-[11.5px] font-bold transition flex items-center gap-1.5 cursor-pointer shadow-2xs"
                                      title="Open this email in Gmail"
                                    >
                                      <span>Open Email</span>
                                      <span className="text-[12px] leading-none">→</span>
                                    </button>
                                  </div>
                                ))}
                              </div>
                            </div>
                          );
                        })()}
                      </div>
                    )}
                    <span className="text-[10px] text-[#5f6368] dark:text-[#8e918f] mt-0.5 px-1 font-normal">
                      {msg.timestamp}
                    </span>
                  </div>
                ))}

                {/* If chat is new, show suggested questions inside chat area */}
                {chatMessages.length <= 1 && (
                  <div className="pt-2 space-y-2">
                    <div className="flex items-center justify-between px-0.5">
                      <span className="text-xs font-bold text-[#1f1f1f] dark:text-[#e3e3e3]">
                        Suggested Questions
                      </span>
                      <span className="text-[11px] text-[#5f6368] dark:text-[#8e918f]">1-tap ask</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      {QUICK_PROMPTS.map((qp) => (
                        <button
                          key={qp.id}
                          onClick={() => handleSendChatMessage(qp.prompt, true)}
                          disabled={isChatThinking}
                          className="p-3 rounded-xl text-left border border-[#e0e2ec] dark:border-[#2c2d30] bg-white dark:bg-[#1e1f20] hover:bg-[#f0f4f9] dark:hover:bg-[#28292c] hover:border-[#0b57d0]/40 dark:hover:border-[#a8c7fa]/40 transition-all flex flex-col justify-between gap-1.5 group cursor-pointer shadow-2xs"
                        >
                          <div className="text-xs font-bold text-[#1f1f1f] dark:text-[#e3e3e3]">
                            {qp.label}
                          </div>
                          <div className="text-[11px] text-[#5f6368] dark:text-[#8e918f] line-clamp-1">
                            "{qp.prompt}"
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Thinking / Scanning State */}
                {isChatThinking && (
                  <div className="max-w-[90%] animate-in fade-in duration-150">
                    <div className="rounded-2xl rounded-tl-xs px-3.5 py-2.5 bg-white dark:bg-[#1e1f20] border border-[#e0e2ec] dark:border-[#2c2d30] shadow-2xs space-y-1">
                      <div className="flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#0b57d0] dark:bg-[#a8c7fa] animate-bounce" />
                        <span className="w-1.5 h-1.5 rounded-full bg-[#0b57d0] dark:bg-[#a8c7fa] animate-bounce [animation-delay:0.15s]" />
                        <span className="w-1.5 h-1.5 rounded-full bg-[#0b57d0] dark:bg-[#a8c7fa] animate-bounce [animation-delay:0.3s]" />
                        <span className="text-xs font-medium text-[#5f6368] dark:text-[#8e918f] ml-1">
                          Scanning inbox for deadlines, venues & schedules...
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Compact Quick Queries Ribbon (when chat has messages) */}
              {chatMessages.length > 1 && (
                <div className="py-1.5 flex items-center gap-1.5 overflow-x-auto scrollbar-none shrink-0 border-t border-[#e0e2ec]/60 dark:border-[#2c2d30]/60">
                  <span className="text-[10.5px] font-semibold text-[#5f6368] dark:text-[#8e918f] uppercase tracking-wider shrink-0 mr-0.5">
                    Ask:
                  </span>
                  {QUICK_PROMPTS.map((qp) => (
                    <button
                      key={qp.id}
                      onClick={() => handleSendChatMessage(qp.prompt, true)}
                      disabled={isChatThinking}
                      className="px-3 py-1 rounded-full text-xs font-medium bg-white dark:bg-[#1e1f20] hover:bg-[#eaeff8] dark:hover:bg-[#28292c] text-[#1f1f1f] dark:text-[#e3e3e3] hover:text-[#0b57d0] dark:hover:text-[#a8c7fa] border border-[#e0e2ec] dark:border-[#2c2d30] whitespace-nowrap transition-colors cursor-pointer shadow-2xs shrink-0"
                    >
                      <span>{qp.label}</span>
                    </button>
                  ))}
                </div>
              )}

              {/* Chat Input */}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendChatMessage();
                }}
                className="pt-2 border-t border-[#e0e2ec] dark:border-[#2c2d30] flex items-center gap-2 shrink-0"
              >
                <div className="flex-1 relative flex items-center">
                  <input
                    type="text"
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    placeholder="Ask about assignments, class shifts, hackathons..."
                    disabled={isChatThinking}
                    className="w-full bg-white dark:bg-[#1e1f20] border border-[#dadce0] dark:border-[#3c4043] rounded-xl px-3.5 py-2.5 text-sm text-[#1f1f1f] dark:text-[#e3e3e3] placeholder-[#5f6368] dark:placeholder-[#8e918f] focus:outline-none focus:border-[#0b57d0] dark:focus:border-[#a8c7fa] focus:ring-2 focus:ring-[#0b57d0]/15 dark:focus:ring-[#a8c7fa]/20 transition-all shadow-2xs"
                  />
                </div>
                <button
                  type="submit"
                  disabled={!chatInput.trim() || isChatThinking}
                  className="px-4 py-2.5 rounded-xl bg-[#0b57d0] hover:bg-[#0842a0] dark:bg-[#a8c7fa] dark:hover:bg-[#d3e3fd] disabled:opacity-40 disabled:cursor-not-allowed text-white dark:text-[#001d35] font-semibold text-xs transition-all shadow-xs cursor-pointer shrink-0"
                  title="Send Question"
                >
                  Send
                </button>
              </form>
            </div>
          )}

          {/* ========================================================================= */}
          {/* VIEW 4: ACTIVE EMAIL DETAIL (AI BREAKDOWN) */}
          {/* ========================================================================= */}
          {activeTab === 'detail' && (
            <div className="space-y-3">
              <button
                onClick={() => setActiveTab('buckets')}
                className="text-xs font-semibold text-[#0b57d0] dark:text-[#a8c7fa] hover:underline transition cursor-pointer"
              >
                ← Back to Smart Buckets
              </button>

              {!email && !loading && (
                <div className="bg-white dark:bg-[#1e1f20] border border-[#e0e2ec] dark:border-[#2c2d30] rounded-xl p-6 text-center space-y-1.5">
                  <h4 className="font-bold text-[#1f1f1f] dark:text-[#e3e3e3] text-sm">
                    No email opened
                  </h4>
                  <p className="text-xs text-[#5f6368] dark:text-[#8e918f]">
                    Select any email from <strong>Smart Buckets</strong> or click an email in Gmail.
                  </p>
                </div>
              )}

              {email && (
                <div className="bg-white dark:bg-[#1e1f20] border border-[#e0e2ec] dark:border-[#2c2d30] rounded-xl p-3.5 shadow-2xs space-y-2.5">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <h2
                        className="text-[15px] font-bold text-[#1f1f1f] dark:text-[#e3e3e3] leading-snug"
                        title={email.subject}
                      >
                        {email.subject}
                      </h2>
                      <div className="text-xs text-[#5f6368] dark:text-[#8e918f] mt-1 flex items-center gap-1.5">
                        <span className="font-semibold text-[#444746] dark:text-[#c4c7c5] truncate">
                          {email.senderName}
                        </span>
                        <span>•</span>
                        <span>{email.dateStr}</span>
                      </div>
                    </div>
                    <button
                      onClick={() => triggerAnalysis(email)}
                      disabled={loading}
                      className="shrink-0 py-1.5 px-2.5 bg-[#f0f4f9] dark:bg-[#28292c] hover:bg-[#c2e7ff]/30 dark:hover:bg-[#004a77]/40 text-[#1f1f1f] dark:text-[#e3e3e3] hover:text-[#0b57d0] dark:hover:text-[#a8c7fa] border border-[#dadce0] dark:border-[#3c4043] rounded-lg transition font-semibold text-xs cursor-pointer"
                    >
                      <span>Re-analyze</span>
                    </button>
                  </div>

                  {analysis && (
                    <div className="flex flex-wrap items-center gap-1.5 pt-1.5 border-t border-[#f1f3f4] dark:border-[#2c2d30]">
                      {(() => {
                        const theme = getCategoryTheme(analysis.category);
                        return (
                          <div className="relative">
                            <button
                              onClick={() => setShowRelabelMenu(!showRelabelMenu)}
                              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg font-semibold border text-xs transition hover:shadow-xs cursor-pointer ${theme.chip}`}
                              title="Click to manually change or override this email label"
                            >
                              <span className={`w-1.5 h-1.5 rounded-full ${theme.dot}`} />
                              <span>{analysis.category}</span>
                              <ChevronDown className="w-3 h-3 opacity-60" />
                            </button>

                            {showRelabelMenu && (
                              <div className="absolute left-0 top-full mt-1.5 z-50 w-56 bg-white dark:bg-[#1e1f20] border border-[#e0e2ec] dark:border-[#2c2d30] rounded-xl shadow-xl p-1.5 space-y-1 animate-in fade-in duration-150">
                                <div className="px-2 py-1 text-xs font-bold uppercase tracking-wider text-[#5f6368] dark:text-[#8e918f]">
                                  Change Email Category
                                </div>
                                {(
                                  [
                                    'Academics',
                                    'Competitions & Tournaments',
                                    'Workshops',
                                    'Class Rescheduling',
                                    'General',
                                  ] as CategoryType[]
                                ).map((cat) => (
                                  <button
                                    key={cat}
                                    onClick={() => handleRelabelEmail(email.id, cat)}
                                    className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-semibold flex items-center justify-between transition cursor-pointer ${
                                      analysis.category === cat
                                        ? 'bg-[#c2e7ff] text-[#001d35] dark:bg-[#004a77] dark:text-[#c2e7ff] font-bold'
                                        : 'hover:bg-[#f0f4f9] dark:hover:bg-[#28292c] text-[#1f1f1f] dark:text-[#e3e3e3]'
                                    }`}
                                  >
                                    <span>{cat}</span>
                                    {analysis.category === cat && (
                                      <Check className="w-3.5 h-3.5 text-[#0b57d0] dark:text-[#a8c7fa]" />
                                    )}
                                  </button>
                                ))}

                                {customFilters.length > 0 && (
                                  <div className="border-t border-[#f1f3f4] dark:border-[#2c2d30] pt-1 mt-1">
                                    <div className="px-2 py-0.5 text-xs font-bold uppercase tracking-wider text-[#5f6368]">
                                      Custom Filters
                                    </div>
                                    {customFilters.map((f) => (
                                      <button
                                        key={f.id}
                                        onClick={() => handleRelabelEmail(email.id, f.name)}
                                        className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-semibold flex items-center justify-between transition cursor-pointer ${
                                          analysis.category === f.name
                                            ? 'bg-[#c2e7ff] text-[#001d35] dark:bg-[#004a77] dark:text-[#c2e7ff] font-bold'
                                            : 'hover:bg-[#f0f4f9] dark:hover:bg-[#28292c] text-[#1f1f1f] dark:text-[#e3e3e3]'
                                        }`}
                                      >
                                        <span className="truncate">{f.name}</span>
                                        {analysis.category === f.name && (
                                          <Check className="w-3.5 h-3.5 text-[#0b57d0]" />
                                        )}
                                      </button>
                                    ))}
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        );
                      })()}

                      {analysis.detectedCourseCode && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full font-semibold bg-[#f1f3f4] dark:bg-[#28292d] text-[#3c4043] dark:text-[#c4c7c5] border border-[#dadce0] dark:border-[#3c4043] text-[11px]">
                          <span className="font-mono">{analysis.detectedCourseCode}</span>
                        </span>
                      )}

                      {analysis.urgency === 'high' && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full font-semibold bg-[#fce8e6] dark:bg-[#3d1417] text-[#c5221f] dark:text-[#f29e99] border border-[#fad2cf] dark:border-[#66272c] text-[11px]">
                          <span>Urgent</span>
                        </span>
                      )}

                      {analysis.providerUsed && (
                        <span className="ml-auto text-[10.5px] text-[#5f6368] dark:text-[#8e918f] font-medium">
                          <span>{analysis.providerUsed}</span>
                        </span>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Skeleton Loader */}
              {loading && (
                <div className="bg-white dark:bg-[#1e1f20] border border-[#e0e2ec] dark:border-[#2c2d30] rounded-xl p-4 space-y-3 animate-pulse shadow-2xs">
                  <div className="h-4 bg-[#eaeff8] dark:bg-[#28292c] rounded-lg w-1/3"></div>
                  <div className="space-y-1.5">
                    <div className="h-3 bg-[#f0f4f9] dark:bg-[#28292c] rounded w-full"></div>
                    <div className="h-3 bg-[#f0f4f9] dark:bg-[#28292c] rounded w-5/6"></div>
                    <div className="h-3 bg-[#f0f4f9] dark:bg-[#28292c] rounded w-4/6"></div>
                  </div>
                  <div className="h-16 bg-[#f6f8fc] dark:bg-[#111318] border border-dashed border-[#e0e2ec] dark:border-[#2c2d30] rounded-xl"></div>
                </div>
              )}

              {/* Analysis Results */}
              {analysis && !loading && (
                <div className="space-y-3">
                  {/* 1. Bulleted Executive Summary */}
                  <div className="bg-white dark:bg-[#1e1f20] border border-[#e0e2ec] dark:border-[#2c2d30] rounded-xl p-3.5 shadow-2xs space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="font-bold text-[#1f1f1f] dark:text-[#e3e3e3] text-sm">
                        AI Executive Summary
                      </div>
                      <button
                        onClick={handleCopySummary}
                        className="text-xs font-semibold text-[#5f6368] hover:text-[#1f1f1f] dark:text-[#8e918f] dark:hover:text-[#e3e3e3] transition cursor-pointer"
                      >
                        {copiedSummary ? (
                          <span className="text-emerald-600 dark:text-emerald-400 font-bold">Copied</span>
                        ) : (
                          <span>Copy</span>
                        )}
                      </button>
                    </div>

                    <ul className="space-y-2 pt-0.5">
                      {analysis.summary.map((bullet, idx) => (
                        <li
                          key={idx}
                          className="flex items-start gap-2 text-[#444746] dark:text-[#c4c7c5] leading-relaxed text-[13px]"
                        >
                          <span className="text-[#0b57d0] dark:text-[#a8c7fa] font-extrabold leading-tight mt-0.5">•</span>
                          <span>{bullet}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* 2. Action Items & Deadlines */}
                  <div className="bg-white dark:bg-[#1e1f20] border border-[#e0e2ec] dark:border-[#2c2d30] rounded-xl p-3.5 shadow-2xs space-y-2.5">
                    <div className="flex items-center justify-between">
                      <div className="font-bold text-[#1f1f1f] dark:text-[#e3e3e3] text-sm">
                        Action Items & Deadlines
                      </div>
                      <span className="text-xs px-2.5 py-0.5 bg-[#eaeff8] dark:bg-[#28292c] text-[#1f1f1f] dark:text-[#c4c7c5] rounded-md font-bold">
                        {analysis.actionItems.filter((i) => !i.completed).length} pending
                      </span>
                    </div>

                    {analysis.actionItems.length === 0 ? (
                      <p className="text-xs text-[#5f6368] dark:text-[#8e918f] italic">
                        No direct action items found.
                      </p>
                    ) : (
                      <div className="space-y-2">
                        {analysis.actionItems.map((item) => (
                          <div
                            key={item.id}
                            className={`p-3 rounded-lg border transition ${
                              item.completed
                                ? 'bg-[#f6f8fc]/70 dark:bg-[#111318]/50 border-[#f1f3f4] dark:border-[#2c2d30] opacity-60'
                                : 'bg-white dark:bg-[#1e1f20] border-[#dadce0] dark:border-[#3c4043] hover:border-[#0b57d0]/40 shadow-2xs'
                            }`}
                          >
                            <div className="flex items-start gap-2.5">
                              <input
                                type="checkbox"
                                checked={item.completed}
                                onChange={() => toggleActionItem(item.id)}
                                className="w-4 h-4 mt-0.5 rounded cursor-pointer accent-[#0b57d0] dark:accent-[#a8c7fa] shrink-0"
                                aria-label={item.completed ? 'Mark incomplete' : 'Mark complete'}
                              />

                              <div className="flex-1 min-w-0">
                                <p
                                  className={`font-semibold text-[13px] leading-tight ${
                                    item.completed
                                      ? 'line-through text-[#5f6368] dark:text-[#8e918f]'
                                      : 'text-[#1f1f1f] dark:text-[#e3e3e3]'
                                  }`}
                                >
                                  {item.title}
                                </p>

                                {item.deadline && (
                                  <div className="flex items-center justify-between mt-2 pt-1.5 border-t border-[#f1f3f4] dark:border-[#2c2d30]">
                                    <span
                                      className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-semibold border ${getDeadlineBadgeStyle(item.deadline).chip}`}
                                    >
                                      <span>{item.deadline}</span>
                                    </span>

                                    <a
                                      href={createGoogleCalendarUrl(
                                        item.title,
                                        email?.subject || 'Academic Task',
                                        item.deadline
                                      )}
                                      target="_blank"
                                      rel="noreferrer"
                                      className="text-xs text-[#0b57d0] hover:text-[#0842a0] dark:text-[#a8c7fa] hover:underline font-semibold transition"
                                    >
                                      + Google Calendar
                                    </a>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* 3. Event & Registration Links */}
                  {analysis.meetingLinks && analysis.meetingLinks.length > 0 && (
                    <div className="bg-white dark:bg-[#1e1f20] border border-[#e0e2ec] dark:border-[#2c2d30] rounded-xl p-3.5 shadow-2xs space-y-2">
                      <div className="font-bold text-[#1f1f1f] dark:text-[#e3e3e3] text-sm">
                        Event & Registration Links
                      </div>
                      <div className="space-y-1.5">
                        {analysis.meetingLinks.map((link, idx) => (
                          <a
                            key={idx}
                            href={link.url}
                            target="_blank"
                            rel="noreferrer"
                            className="flex items-center justify-between p-2.5 rounded-lg bg-white dark:bg-[#1e1f20] hover:bg-[#f0f4f9] dark:hover:bg-[#28292c] border border-[#dadce0] dark:border-[#3c4043] text-[#1f1f1f] dark:text-[#e3e3e3] transition group"
                          >
                            <div className="flex items-center gap-2 truncate">
                              <span className="font-semibold text-xs truncate">
                                {link.title || 'Join Event / Register'}
                              </span>
                            </div>
                            <span className="text-xs font-semibold text-[#0b57d0] dark:text-[#a8c7fa] group-hover:underline shrink-0">
                              Open
                            </span>
                          </a>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* 4. Smart Academic Quick Replies */}
                  <div className="bg-white dark:bg-[#1e1f20] border border-[#e0e2ec] dark:border-[#2c2d30] rounded-xl p-3.5 shadow-2xs space-y-2.5">
                    <div className="flex items-center justify-between">
                      <div className="font-bold text-[#1f1f1f] dark:text-[#e3e3e3] text-sm">
                        Academic Quick Replies
                      </div>
                      <span className="text-xs text-[#5f6368] dark:text-[#8e918f] font-medium">
                        1-Click Copy
                      </span>
                    </div>

                    <div className="grid grid-cols-3 gap-1.5">
                      {quickReplies.map((reply, idx) => (
                        <button
                          key={idx}
                          onClick={() => handleCopyReplyPreset(reply.text, idx)}
                          className={`py-2.5 px-2 rounded-lg border text-center transition font-semibold text-xs flex items-center justify-center cursor-pointer ${
                            copiedReplyIndex === idx
                              ? 'bg-[#eaeff8] dark:bg-[#28292c] border-[#0b57d0] text-[#0b57d0] dark:text-[#a8c7fa]'
                              : 'bg-white dark:bg-[#1e1f20] hover:bg-[#f0f4f9] dark:hover:bg-[#28292c] border-[#dadce0] dark:border-[#3c4043] text-[#1f1f1f] dark:text-[#e3e3e3]'
                          }`}
                        >
                          {copiedReplyIndex === idx ? (
                            <span className="text-emerald-600 dark:text-emerald-400 font-bold">Copied!</span>
                          ) : (
                            <span>{reply.title}</span>
                          )}
                        </button>
                      ))}
                    </div>

                    {analysis.suggestedReply && (
                      <div className="p-3 bg-white dark:bg-[#1e1f20] border border-[#dadce0] dark:border-[#3c4043] rounded-lg text-[#444746] dark:text-[#c4c7c5] text-[13px] italic leading-relaxed">
                        "{analysis.suggestedReply}"
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </main>

        {/* Add Filter Modal */}
        {showAddFilterModal && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3">
            <div className="bg-white dark:bg-[#1e1f20] rounded-xl w-full max-w-xs p-4 space-y-3 shadow-2xl border border-[#e0e2ec] dark:border-[#2c2d30] animate-in zoom-in-95 duration-150">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-xs text-[#1f1f1f] dark:text-[#e3e3e3] flex items-center gap-1.5">
                  <Tag className="w-3.5 h-3.5 text-purple-600" />
                  <span>New Custom Academic Filter</span>
                </h3>
                <button
                  onClick={() => setShowAddFilterModal(false)}
                  className="text-[#5f6368] hover:text-[#1f1f1f] dark:text-[#8e918f] dark:hover:text-[#e3e3e3] cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleAddCustomFilter} className="space-y-2.5">
                <div>
                  <label className="text-[10px] font-bold text-[#5f6368] dark:text-[#8e918f] uppercase tracking-wider block mb-1">
                    Filter Name
                  </label>
                  <input
                    type="text"
                    required
                    value={newFilterName}
                    onChange={(e) => setNewFilterName(e.target.value)}
                    placeholder="e.g. Placements, Library, Hostel"
                    className="w-full px-2.5 py-1.5 text-xs bg-[#f6f8fc] dark:bg-[#111318] border border-[#e0e2ec] dark:border-[#2c2d30] rounded-lg focus:outline-none focus:border-[#0b57d0] text-[#1f1f1f] dark:text-[#e3e3e3]"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold text-[#5f6368] dark:text-[#8e918f] uppercase tracking-wider block mb-1">
                    Matching Keywords (Comma separated)
                  </label>
                  <input
                    type="text"
                    required
                    value={newFilterKeywords}
                    onChange={(e) => setNewFilterKeywords(e.target.value)}
                    placeholder="e.g. interview, ctc, tpo, offer"
                    className="w-full px-2.5 py-1.5 text-xs bg-[#f6f8fc] dark:bg-[#111318] border border-[#e0e2ec] dark:border-[#2c2d30] rounded-lg focus:outline-none focus:border-[#0b57d0] text-[#1f1f1f] dark:text-[#e3e3e3]"
                  />
                  <p className="text-[9px] text-[#5f6368] dark:text-[#8e918f] mt-1">
                    Emails containing these words in their subject or body will be auto-categorized here.
                  </p>
                </div>

                <div className="flex justify-end gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setShowAddFilterModal(false)}
                    className="px-3 py-1.5 text-xs text-[#5f6368] hover:text-[#1f1f1f] dark:text-[#8e918f] dark:hover:text-[#e3e3e3] cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-3.5 py-1.5 bg-[#0b57d0] hover:bg-[#0842a0] dark:bg-[#a8c7fa] dark:hover:bg-[#d3e3fd] text-white dark:text-[#001d35] rounded-lg text-xs font-bold shadow-xs transition cursor-pointer"
                  >
                    Create Filter
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Footer */}
        <footer className="border-t border-[#e0e2ec] dark:border-[#2c2d30] px-3.5 py-2 text-center text-[10px] text-[#5f6368] dark:text-[#8e918f] bg-[#f6f8fc] dark:bg-[#111318] transition-colors">
          AcadMail AI • Intelligent Academic Copilot
        </footer>
      </div>
    </div>
  );
}

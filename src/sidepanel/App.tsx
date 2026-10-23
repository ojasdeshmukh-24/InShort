import React, { useState, useEffect } from 'react';
import {
  GraduationCap,
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
  LayoutGrid
} from 'lucide-react';
import {
  ExtractedEmail,
  AnalysisResult,
  CategoryType,
  InboxRowItem,
  AggregatedDeadline
} from '../types';
import { analyzeAcademicEmail } from '../services/ai';
import { createGoogleCalendarUrl } from '../services/calendar';
import { getSettings, saveSettings, getCachedAnalysis, saveAnalysis } from '../services/storage';

export default function App() {
  const [activeTab, setActiveTab] = useState<'buckets' | 'deadlines' | 'detail'>('buckets');
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');
  const [email, setEmail] = useState<ExtractedEmail | null>(null);
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [apiKey, setApiKey] = useState('');
  const [groqKey, setGroqKey] = useState('');
  const [showSettings, setShowSettings] = useState(false);
  const [inPageIntegration, setInPageIntegration] = useState(true);
  const [copiedSummary, setCopiedSummary] = useState(false);
  const [copiedReplyIndex, setCopiedReplyIndex] = useState<number | null>(null);

  // Smart Buckets Inbox State
  const [inboxItems, setInboxItems] = useState<InboxRowItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<CategoryType | 'ALL'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [isScanningInbox, setIsScanningInbox] = useState(false);
  const [syncGmailDom, setSyncGmailDom] = useState(false);

  // Aggregated Deadlines State
  const [deadlines, setDeadlines] = useState<AggregatedDeadline[]>([]);
  const [deadlineFilter, setDeadlineFilter] = useState<'all' | 'urgent' | 'academics' | 'competitions'>('all');

  useEffect(() => {
    // Load theme
    if (typeof chrome !== 'undefined' && chrome.storage?.local) {
      chrome.storage.local.get(['acadmail_theme'], (res) => {
        if (res.acadmail_theme) {
          setTheme(res.acadmail_theme);
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
      if (!settings.apiKey && !settings.groqApiKey) {
        setShowSettings(true);
      }
    });

    scanInbox();
    fetchEmailFromActiveTab();

    const listener = (message: any) => {
      if (message.type === 'EMAIL_CHANGED') {
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
      document.body.style.backgroundColor = '#090d16';
    } else {
      document.documentElement.classList.remove('dark');
      document.body.classList.remove('dark');
      document.body.style.backgroundColor = '#f8fafc';
    }
  }, [theme]);

  const toggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
    if (typeof chrome !== 'undefined' && chrome.storage?.local) {
      chrome.storage.local.set({ acadmail_theme: nextTheme });
    }
  };

  // Extract deadlines automatically from scanned inbox items
  useEffect(() => {
    if (inboxItems.length === 0) return;

    const extracted: AggregatedDeadline[] = [];
    const datePattern = /\b(?:due|deadline|by|on|date:|till)\s+([A-Za-z]{3,9}\s+\d{1,2}(?:st|nd|rd|th)?(?:\s*,\s*\d{4})?|\d{1,2}\/\d{1,2}(?:\/\d{2,4})?|\d{1,2}\s+[A-Za-z]{3,9})\b/gi;

    inboxItems.forEach((item) => {
      const combined = `${item.subject} ${item.snippet}`;
      const matches = [...combined.matchAll(datePattern)];

      if (matches.length > 0) {
        matches.forEach((m, idx) => {
          extracted.push({
            id: `dl-${item.id}-${idx}`,
            title: item.subject,
            deadline: m[1],
            sourceSubject: item.subject,
            sourceSender: item.sender,
            category: item.category,
            courseCode: item.courseCode,
            completed: false,
            rowIndex: item.index,
          });
        });
      } else if (
        item.category === 'Academics' ||
        item.category === 'Competitions & Tournaments' ||
        item.category === 'Class Rescheduling'
      ) {
        if (
          combined.toLowerCase().includes('tomorrow') ||
          combined.toLowerCase().includes('today') ||
          combined.toLowerCase().includes('final reminder') ||
          combined.toLowerCase().includes('submission')
        ) {
          extracted.push({
            id: `dl-${item.id}-auto`,
            title: item.subject,
            deadline: combined.toLowerCase().includes('tomorrow') ? 'Tomorrow' : item.date,
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
      const result = await analyzeAcademicEmail(targetEmail, keyToUse, groqToUse);
      setAnalysis(result);
      await saveAnalysis(targetEmail.id, result);
    } catch (err: any) {
      setError(err.message || 'Failed to analyze email');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleInPage = async (enabled: boolean) => {
    setInPageIntegration(enabled);
    await saveSettings({ inPageIntegration: enabled });
    const tab = await getGmailTab();
    if (tab?.id) {
      chrome.tabs.sendMessage(tab.id, {
        type: 'TOGGLE_IN_PAGE_INTEGRATION',
        enabled,
      }).catch(() => {});
    }
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    await saveSettings({ apiKey: apiKey.trim(), groqApiKey: groqKey.trim(), inPageIntegration });
    setShowSettings(false);
    setError(null);
    if (email) {
      triggerAnalysis(email, apiKey.trim(), groqKey.trim());
    }
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
    switch (cat) {
      case 'Academics':
        return {
          icon: <BookOpen className="w-3.5 h-3.5" />,
          chip: 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border-blue-200/80 dark:border-blue-800/60',
          dot: 'bg-blue-600 dark:bg-blue-400',
          activeBtn: 'bg-blue-600 dark:bg-blue-600 text-white border-blue-600 shadow-sm shadow-blue-500/20',
          countBadge: 'bg-blue-100 dark:bg-blue-900/80 text-blue-800 dark:text-blue-200',
        };
      case 'Competitions & Tournaments':
        return {
          icon: <Trophy className="w-3.5 h-3.5" />,
          chip: 'bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border-amber-200/80 dark:border-amber-800/60',
          dot: 'bg-amber-600 dark:bg-amber-400',
          activeBtn: 'bg-amber-600 dark:bg-amber-600 text-white border-amber-600 shadow-sm shadow-amber-500/20',
          countBadge: 'bg-amber-100 dark:bg-amber-900/80 text-amber-900 dark:text-amber-200',
        };
      case 'Workshops':
        return {
          icon: <Briefcase className="w-3.5 h-3.5" />,
          chip: 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200/80 dark:border-emerald-800/60',
          dot: 'bg-emerald-600 dark:bg-emerald-400',
          activeBtn: 'bg-emerald-600 dark:bg-emerald-600 text-white border-emerald-600 shadow-sm shadow-emerald-500/20',
          countBadge: 'bg-emerald-100 dark:bg-emerald-900/80 text-emerald-800 dark:text-emerald-200',
        };
      case 'Class Rescheduling':
        return {
          icon: <AlertTriangle className="w-3.5 h-3.5" />,
          chip: 'bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border-rose-200/80 dark:border-rose-800/60',
          dot: 'bg-rose-600 dark:bg-rose-400',
          activeBtn: 'bg-rose-600 dark:bg-rose-600 text-white border-rose-600 shadow-sm shadow-rose-500/20',
          countBadge: 'bg-rose-100 dark:bg-rose-900/80 text-rose-800 dark:text-rose-200',
        };
      default:
        return {
          icon: <ScrollText className="w-3.5 h-3.5" />,
          chip: 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200/80 dark:border-slate-700/60',
          dot: 'bg-slate-600 dark:bg-slate-400',
          activeBtn: 'bg-slate-800 dark:bg-slate-700 text-white border-slate-700 shadow-sm',
          countBadge: 'bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200',
        };
    }
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

  const counts = {
    all: inboxItems.length,
    academics: inboxItems.filter((i) => i.category === 'Academics').length,
    competitions: inboxItems.filter((i) => i.category === 'Competitions & Tournaments').length,
    workshops: inboxItems.filter((i) => i.category === 'Workshops').length,
    rescheduling: inboxItems.filter((i) => i.category === 'Class Rescheduling').length,
    general: inboxItems.filter((i) => i.category === 'General').length,
  };

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
      <div className="flex flex-col min-h-screen bg-[#f8fafc] dark:bg-[#090d16] text-slate-900 dark:text-slate-100 font-sans antialiased text-xs selection:bg-blue-100 dark:selection:bg-blue-900 transition-colors duration-200">
        {/* Top Header */}
        <header className="sticky top-0 z-30 bg-white/90 dark:bg-[#0f172a]/90 backdrop-blur-md border-b border-slate-200/70 dark:border-slate-800/80 px-3.5 py-2.5 flex items-center justify-between transition-colors">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-violet-600 flex items-center justify-center text-white shadow-xs">
              <GraduationCap className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-1.5 leading-none">
                <h1 className="text-xs font-extrabold text-slate-900 dark:text-white tracking-tight">
                  AcadMail
                </h1>
                <span className="px-1 py-0.2 bg-gradient-to-r from-blue-600 to-indigo-600 text-[9px] font-black text-white rounded">
                  AI
                </span>
              </div>
              <p className="text-[10px] text-slate-400 font-medium mt-0.5 leading-none">
                Academic Copilot
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            {/* Dark Mode Toggle */}
            <button
              onClick={toggleTheme}
              title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              className="p-1.5 text-slate-400 hover:text-slate-800 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition"
            >
              {theme === 'dark' ? <Sun className="w-3.5 h-3.5 text-amber-400" /> : <Moon className="w-3.5 h-3.5 text-slate-600" />}
            </button>

            <button
              onClick={() => {
                scanInbox();
                fetchEmailFromActiveTab();
              }}
              disabled={isScanningInbox || loading}
              title="Refresh current mailbox"
              className="p-1.5 text-slate-400 hover:text-slate-800 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition"
            >
              <RefreshCw
                className={`w-3.5 h-3.5 ${
                  isScanningInbox || loading ? 'animate-spin text-blue-600 dark:text-blue-400' : ''
                }`}
              />
            </button>
            <button
              onClick={() => setShowSettings(!showSettings)}
              title="AI Configuration"
              className={`p-1.5 rounded-lg transition ${
                showSettings
                  ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400'
                  : 'text-slate-400 hover:text-slate-800 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <Settings className="w-3.5 h-3.5" />
            </button>
          </div>
        </header>

        {/* 3-Tab Segmented Switcher Bar */}
        <div className="px-3 pt-2 pb-1 bg-white dark:bg-[#0f172a] border-b border-slate-200/60 dark:border-slate-800/80 grid grid-cols-3 gap-1 transition-colors">
          <button
            onClick={() => setActiveTab('buckets')}
            className={`py-1.5 px-1.5 rounded-lg font-bold text-[11px] flex items-center justify-center gap-1 transition ${
              activeTab === 'buckets'
                ? 'bg-slate-900 dark:bg-blue-600 text-white shadow-xs'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60'
            }`}
          >
            <Layers className="w-3.5 h-3.5 shrink-0" />
            <span>Buckets</span>
            {inboxItems.length > 0 && (
              <span
                className={`px-1 py-0.2 rounded-full text-[8px] font-extrabold ${
                  activeTab === 'buckets'
                    ? 'bg-slate-800 dark:bg-blue-700 text-slate-200'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                }`}
              >
                {inboxItems.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('deadlines')}
            className={`py-1.5 px-1.5 rounded-lg font-bold text-[11px] flex items-center justify-center gap-1 transition ${
              activeTab === 'deadlines'
                ? 'bg-slate-900 dark:bg-blue-600 text-white shadow-xs'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60'
            }`}
          >
            <CalendarCheck2 className="w-3.5 h-3.5 shrink-0 text-amber-500 dark:text-amber-400" />
            <span>Deadlines</span>
            {pendingDeadlinesCount > 0 && (
              <span
                className={`px-1 py-0.2 rounded-full text-[8px] font-extrabold ${
                  activeTab === 'deadlines'
                    ? 'bg-amber-500 text-white'
                    : 'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300'
                }`}
              >
                {pendingDeadlinesCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('detail')}
            className={`py-1.5 px-1.5 rounded-lg font-bold text-[11px] flex items-center justify-center gap-1 transition ${
              activeTab === 'detail'
                ? 'bg-slate-900 dark:bg-blue-600 text-white shadow-xs'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 shrink-0 text-blue-400" />
            <span>AI Detail</span>
            {email && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>}
          </button>
        </div>

        {/* Main Content Area */}
        <main className="flex-1 p-3.5 space-y-3">
          {/* Settings Drawer */}
          {showSettings && (
            <div className="bg-white dark:bg-[#0f172a] border border-blue-200/80 dark:border-blue-900/50 rounded-2xl p-3.5 shadow-xs space-y-3 animate-in fade-in duration-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-blue-950 dark:text-blue-300 font-bold text-xs">
                  <Key className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                  <span>AI Configuration</span>
                </div>
                <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" /> Auto-Cascade Active
                </span>
              </div>

              <form onSubmit={handleSaveSettings} className="space-y-2.5">
                <div className="space-y-1">
                  <div className="flex justify-between items-center text-[11px]">
                    <span className="font-semibold text-slate-700 dark:text-slate-300">
                      Google Gemini Key
                    </span>
                    <a
                      href="https://aistudio.google.com/"
                      target="_blank"
                      rel="noreferrer"
                      className="text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-0.5 text-[10px] font-medium"
                    >
                      Get Free Key <ExternalLink className="w-2.5 h-2.5" />
                    </a>
                  </div>
                  <input
                    type="password"
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    placeholder="Paste Gemini API Key..."
                    className="w-full px-2.5 py-1.5 text-xs bg-slate-50/50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-xl focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-900 dark:text-slate-100 font-mono"
                  />
                </div>

                <div className="space-y-1 pt-1.5 border-t border-slate-100 dark:border-slate-800">
                  <div className="flex justify-between items-center text-[11px]">
                    <span className="font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                      <span>Groq Key</span>
                      <span className="px-1 py-0.2 bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-800/60 text-[8px] rounded font-bold">
                        Zero Downtime
                      </span>
                    </span>
                    <a
                      href="https://console.groq.com/keys"
                      target="_blank"
                      rel="noreferrer"
                      className="text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-0.5 text-[10px] font-medium"
                    >
                      Free Groq Key <ExternalLink className="w-2.5 h-2.5" />
                    </a>
                  </div>
                  <input
                    type="password"
                    value={groqKey}
                    onChange={(e) => setGroqKey(e.target.value)}
                    placeholder="gsk_... (Optional backup)"
                    className="w-full px-2.5 py-1.5 text-xs bg-slate-50/50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-xl focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-900 dark:text-slate-100 font-mono"
                  />
                </div>

                {/* In-Gmail Native Interface Toggle */}
                <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <div className="pr-2">
                    <div className="font-semibold text-slate-800 dark:text-slate-200 text-[11px] flex items-center gap-1.5">
                      <LayoutGrid className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                      <span>In-Gmail Native Interface</span>
                    </div>
                    <p className="text-[10px] text-slate-400 leading-tight mt-0.5">
                      Filter bar above inbox & AI brief card inside open emails
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleToggleInPage(!inPageIntegration)}
                    className={`w-9 h-5 flex items-center rounded-full p-0.5 transition duration-200 shrink-0 cursor-pointer ${
                      inPageIntegration ? 'bg-blue-600' : 'bg-slate-300 dark:bg-slate-700'
                    }`}
                  >
                    <div
                      className={`bg-white w-4 h-4 rounded-full shadow-xs transform transition duration-200 ${
                        inPageIntegration ? 'translate-x-4' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>

                <div className="flex justify-end pt-1">
                  <button
                    type="submit"
                    className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl text-xs transition shadow-xs"
                  >
                    Save Settings
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* ========================================================================= */}
          {/* VIEW 1: SMART BUCKETS INBOX ORGANIZER */}
          {/* ========================================================================= */}
          {activeTab === 'buckets' && (
            <div className="space-y-3">
              <div className="space-y-1.5">
                <div className="grid grid-cols-2 gap-1.5">
                  <button
                    onClick={() => handleCategoryFilterChange('Academics')}
                    className={`p-2.5 rounded-2xl border text-left transition flex items-center justify-between group ${
                      selectedCategory === 'Academics'
                        ? getCategoryTheme('Academics').activeBtn
                        : 'bg-white dark:bg-[#111827] hover:border-blue-200 dark:hover:border-blue-800 border-slate-200/80 dark:border-slate-800/80 text-slate-700 dark:text-slate-300 shadow-2xs'
                    }`}
                  >
                    <div className="flex items-center gap-2 truncate">
                      <div
                        className={`p-1.5 rounded-lg ${
                          selectedCategory === 'Academics'
                            ? 'bg-white/20 text-white'
                            : 'bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400'
                        }`}
                      >
                        <BookOpen className="w-3.5 h-3.5" />
                      </div>
                      <span className="font-bold truncate text-[11px]">Academics</span>
                    </div>
                    <span
                      className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                        selectedCategory === 'Academics'
                          ? 'bg-white/20 text-white'
                          : getCategoryTheme('Academics').countBadge
                      }`}
                    >
                      {counts.academics}
                    </span>
                  </button>

                  <button
                    onClick={() => handleCategoryFilterChange('Competitions & Tournaments')}
                    className={`p-2.5 rounded-2xl border text-left transition flex items-center justify-between group ${
                      selectedCategory === 'Competitions & Tournaments'
                        ? getCategoryTheme('Competitions & Tournaments').activeBtn
                        : 'bg-white dark:bg-[#111827] hover:border-amber-200 dark:hover:border-amber-800 border-slate-200/80 dark:border-slate-800/80 text-slate-700 dark:text-slate-300 shadow-2xs'
                    }`}
                  >
                    <div className="flex items-center gap-2 truncate">
                      <div
                        className={`p-1.5 rounded-lg ${
                          selectedCategory === 'Competitions & Tournaments'
                            ? 'bg-white/20 text-white'
                            : 'bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400'
                        }`}
                      >
                        <Trophy className="w-3.5 h-3.5" />
                      </div>
                      <span className="font-bold truncate text-[11px]">Competitions</span>
                    </div>
                    <span
                      className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                        selectedCategory === 'Competitions & Tournaments'
                          ? 'bg-white/20 text-white'
                          : getCategoryTheme('Competitions & Tournaments').countBadge
                      }`}
                    >
                      {counts.competitions}
                    </span>
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-1.5">
                  <button
                    onClick={() => handleCategoryFilterChange('Workshops')}
                    className={`p-2.5 rounded-2xl border text-left transition flex items-center justify-between group ${
                      selectedCategory === 'Workshops'
                        ? getCategoryTheme('Workshops').activeBtn
                        : 'bg-white dark:bg-[#111827] hover:border-emerald-200 dark:hover:border-emerald-800 border-slate-200/80 dark:border-slate-800/80 text-slate-700 dark:text-slate-300 shadow-2xs'
                    }`}
                  >
                    <div className="flex items-center gap-2 truncate">
                      <div
                        className={`p-1.5 rounded-lg ${
                          selectedCategory === 'Workshops'
                            ? 'bg-white/20 text-white'
                            : 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400'
                        }`}
                      >
                        <Briefcase className="w-3.5 h-3.5" />
                      </div>
                      <span className="font-bold truncate text-[11px]">Workshops & Talks</span>
                    </div>
                    <span
                      className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                        selectedCategory === 'Workshops'
                          ? 'bg-white/20 text-white'
                          : getCategoryTheme('Workshops').countBadge
                      }`}
                    >
                      {counts.workshops}
                    </span>
                  </button>

                  <button
                    onClick={() => handleCategoryFilterChange('Class Rescheduling')}
                    className={`p-2.5 rounded-2xl border text-left transition flex items-center justify-between group ${
                      selectedCategory === 'Class Rescheduling'
                        ? getCategoryTheme('Class Rescheduling').activeBtn
                        : 'bg-white dark:bg-[#111827] hover:border-rose-200 dark:hover:border-rose-800 border-slate-200/80 dark:border-slate-800/80 text-slate-700 dark:text-slate-300 shadow-2xs'
                    }`}
                  >
                    <div className="flex items-center gap-2 truncate">
                      <div
                        className={`p-1.5 rounded-lg ${
                          selectedCategory === 'Class Rescheduling'
                            ? 'bg-white/20 text-white'
                            : 'bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400'
                        }`}
                      >
                        <AlertTriangle className="w-3.5 h-3.5" />
                      </div>
                      <span className="font-bold truncate text-[11px]">Reschedules</span>
                    </div>
                    <span
                      className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                        selectedCategory === 'Class Rescheduling'
                          ? 'bg-white/20 text-white'
                          : getCategoryTheme('Class Rescheduling').countBadge
                      }`}
                    >
                      {counts.rescheduling}
                    </span>
                  </button>
                </div>

                {/* General & PhD Notices */}
                <button
                  onClick={() => handleCategoryFilterChange('General')}
                  className={`w-full p-2.5 rounded-2xl border text-left transition flex items-center justify-between group ${
                    selectedCategory === 'General'
                      ? getCategoryTheme('General').activeBtn
                      : 'bg-white dark:bg-[#111827] hover:border-slate-300 dark:hover:border-slate-700 border-slate-200/80 dark:border-slate-800/80 text-slate-700 dark:text-slate-300 shadow-2xs'
                  }`}
                >
                  <div className="flex items-center gap-2 truncate">
                    <div
                      className={`p-1.5 rounded-lg ${
                        selectedCategory === 'General'
                          ? 'bg-white/20 text-white'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      <ScrollText className="w-3.5 h-3.5" />
                    </div>
                    <div className="truncate">
                      <div className="font-bold truncate text-[11px] leading-tight text-slate-900 dark:text-white">
                        General & Campus Announcements
                      </div>
                      <div
                        className={`text-[9px] truncate ${
                          selectedCategory === 'General'
                            ? 'text-slate-200'
                            : 'text-slate-400 dark:text-slate-500'
                        }`}
                      >
                        Includes PhD defenses, viva-voce notices, circulars
                      </div>
                    </div>
                  </div>
                  <span
                    className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                      selectedCategory === 'General'
                        ? 'bg-white/20 text-white'
                        : getCategoryTheme('General').countBadge
                    }`}
                  >
                    {counts.general}
                  </span>
                </button>
              </div>

              {/* Subheader Toolbar */}
              <div className="flex items-center gap-1.5 pt-1">
                <div className="relative flex-1">
                  <Search className="w-3 h-3 text-slate-400 absolute left-2.5 top-2.5" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={`Search in ${selectedCategory === 'ALL' ? 'all' : selectedCategory}...`}
                    className="w-full pl-7 pr-7 py-1.5 text-xs bg-white dark:bg-[#111827] border border-slate-200/80 dark:border-slate-800/80 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 shadow-2xs"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="absolute right-2 top-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </div>

                {selectedCategory !== 'ALL' && (
                  <button
                    onClick={() => handleCategoryFilterChange('ALL')}
                    className="px-2 py-1.5 text-[10px] font-bold text-slate-600 dark:text-slate-300 bg-white dark:bg-[#111827] border border-slate-200/80 dark:border-slate-800 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition shadow-2xs"
                  >
                    All ({counts.all})
                  </button>
                )}

                <button
                  onClick={() => handleToggleSyncDom(!syncGmailDom)}
                  title="Dim non-matching rows on Gmail"
                  className={`p-1.5 px-2 rounded-xl border text-[10px] font-semibold flex items-center gap-1 transition shadow-2xs ${
                    syncGmailDom
                      ? 'bg-blue-50 dark:bg-blue-950/80 border-blue-300 dark:border-blue-700 text-blue-700 dark:text-blue-300'
                      : 'bg-white dark:bg-[#111827] border-slate-200/80 dark:border-slate-800 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white'
                  }`}
                >
                  <Eye className="w-3 h-3" />
                  <span>Dim Gmail</span>
                </button>
              </div>

              {/* Email Cards Stream */}
              {filteredInbox.length === 0 ? (
                <div className="bg-white dark:bg-[#111827] border border-slate-200/80 dark:border-slate-800 rounded-2xl p-6 text-center space-y-2.5 shadow-2xs">
                  <div className="w-10 h-10 mx-auto rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                    <Mail className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-800 dark:text-slate-200 text-xs">
                      {inboxItems.length === 0
                        ? 'No visible emails detected in inbox'
                        : `No emails match "${selectedCategory}"`}
                    </h4>
                    <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">
                      Click below to scan visible emails from your inbox.
                    </p>
                  </div>
                  <button
                    onClick={() => scanInbox()}
                    disabled={isScanningInbox}
                    className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-xl transition shadow-xs flex items-center justify-center gap-1.5 mx-auto"
                  >
                    <RefreshCw className={`w-3 h-3 ${isScanningInbox ? 'animate-spin' : ''}`} />
                    <span>⚡ Scan Visible Inbox</span>
                  </button>
                </div>
              ) : (
                <div className="space-y-1.5">
                  {filteredInbox.map((item) => {
                    const theme = getCategoryTheme(item.category);
                    const initials = item.sender.slice(0, 2).toUpperCase();

                    return (
                      <div
                        key={item.id}
                        onClick={() => handleSelectInboxRow(item)}
                        className="p-3 bg-white dark:bg-[#111827] border border-slate-200/80 dark:border-slate-800/80 hover:border-blue-300 dark:hover:border-blue-700 hover:shadow-xs rounded-2xl cursor-pointer transition space-y-1.5 group"
                      >
                        <div className="flex items-center justify-between gap-1.5">
                          <div className="flex items-center gap-1.5 truncate flex-1 min-w-0">
                            <div className="w-5 h-5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-extrabold text-[9px] flex items-center justify-center shrink-0">
                              {initials}
                            </div>
                            <span className="font-bold text-slate-800 dark:text-slate-200 text-[11px] truncate">
                              {item.sender}
                            </span>
                          </div>
                          <span className="text-[10px] text-slate-400 dark:text-slate-500 font-medium shrink-0">
                            {item.date}
                          </span>
                        </div>

                        <div className="font-bold text-slate-900 dark:text-slate-100 text-xs truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition leading-snug">
                          {item.subject}
                        </div>

                        {item.snippet && (
                          <p className="text-[10px] text-slate-500 dark:text-slate-400 line-clamp-1 leading-relaxed">
                            {item.snippet}
                          </p>
                        )}

                        <div className="flex items-center justify-between pt-1">
                          <span
                            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-semibold border ${theme.chip}`}
                          >
                            <span className={`w-1 h-1 rounded-full ${theme.dot}`} />
                            {item.courseCode
                              ? `${item.courseCode} • ${item.category}`
                              : item.category}
                          </span>

                          <span className="text-[10px] text-blue-600 dark:text-blue-400 font-bold opacity-0 group-hover:opacity-100 transition flex items-center gap-0.5">
                            View AI Detail <ChevronRight className="w-3 h-3" />
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
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
                <button
                  onClick={() => setDeadlineFilter('all')}
                  className={`px-2.5 py-1 rounded-xl text-[10px] font-bold transition shrink-0 ${
                    deadlineFilter === 'all'
                      ? 'bg-slate-900 dark:bg-blue-600 text-white'
                      : 'bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50'
                  }`}
                >
                  All ({deadlines.length})
                </button>
                <button
                  onClick={() => setDeadlineFilter('urgent')}
                  className={`px-2.5 py-1 rounded-xl text-[10px] font-bold transition shrink-0 flex items-center gap-1 ${
                    deadlineFilter === 'urgent'
                      ? 'bg-rose-600 text-white'
                      : 'bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 text-rose-700 dark:text-rose-400 hover:bg-rose-50'
                  }`}
                >
                  <Flame className="w-3 h-3" /> Due Soon / Urgent
                </button>
                <button
                  onClick={() => setDeadlineFilter('academics')}
                  className={`px-2.5 py-1 rounded-xl text-[10px] font-bold transition shrink-0 flex items-center gap-1 ${
                    deadlineFilter === 'academics'
                      ? 'bg-blue-600 text-white'
                      : 'bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 text-blue-700 dark:text-blue-400 hover:bg-blue-50'
                  }`}
                >
                  <BookOpen className="w-3.5 h-3.5" /> Coursework
                </button>
                <button
                  onClick={() => setDeadlineFilter('competitions')}
                  className={`px-2.5 py-1 rounded-xl text-[10px] font-bold transition shrink-0 flex items-center gap-1 ${
                    deadlineFilter === 'competitions'
                      ? 'bg-amber-600 text-white'
                      : 'bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 text-amber-800 dark:text-amber-400 hover:bg-amber-50'
                  }`}
                >
                  <Trophy className="w-3.5 h-3.5" /> Contests
                </button>
              </div>

              {filteredDeadlines.length === 0 ? (
                <div className="bg-white dark:bg-[#111827] border border-slate-200/80 dark:border-slate-800 rounded-2xl p-6 text-center space-y-2 shadow-2xs">
                  <CalendarCheck2 className="w-8 h-8 mx-auto text-slate-300 dark:text-slate-600" />
                  <h4 className="font-bold text-slate-800 dark:text-slate-200 text-xs">
                    No pending deadlines found
                  </h4>
                  <p className="text-[11px] text-slate-400 dark:text-slate-500">
                    Scan your inbox in the Buckets tab to pull upcoming submission dates.
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {filteredDeadlines.map((dl) => {
                    const theme = getCategoryTheme(dl.category);
                    return (
                      <div
                        key={dl.id}
                        className={`p-3 bg-white dark:bg-[#111827] border rounded-2xl transition space-y-2 shadow-2xs ${
                          dl.completed
                            ? 'opacity-60 bg-slate-50/50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800'
                            : 'border-slate-200/80 dark:border-slate-800/80 hover:border-blue-300 dark:hover:border-blue-700'
                        }`}
                      >
                        <div className="flex items-start gap-2.5">
                          <button
                            onClick={() => toggleDeadlineComplete(dl.id)}
                            className="mt-0.5 text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition shrink-0"
                          >
                            {dl.completed ? (
                              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                            ) : (
                              <Circle className="w-4 h-4" />
                            )}
                          </button>

                          <div className="flex-1 min-w-0">
                            <p
                              className={`font-bold text-xs leading-snug ${
                                dl.completed
                                  ? 'line-through text-slate-400 dark:text-slate-500'
                                  : 'text-slate-900 dark:text-white'
                              }`}
                            >
                              {dl.title}
                            </p>

                            <div className="flex items-center gap-1.5 mt-1 text-[10px] text-slate-500 dark:text-slate-400">
                              <span className="truncate">{dl.sourceSender}</span>
                              <span>•</span>
                              <span className="font-bold text-amber-800 dark:text-amber-300 flex items-center gap-0.5">
                                <Clock className="w-3 h-3 text-amber-600 dark:text-amber-400" />{' '}
                                {dl.deadline}
                              </span>
                            </div>

                            <div className="flex items-center justify-between mt-2 pt-1.5 border-t border-slate-100 dark:border-slate-800">
                              <span
                                className={`inline-flex items-center gap-1 px-2 py-0.2 rounded-full text-[9px] font-bold border ${theme.chip}`}
                              >
                                <span className={`w-1 h-1 rounded-full ${theme.dot}`} />
                                {dl.courseCode
                                  ? `${dl.courseCode} • ${dl.category}`
                                  : dl.category}
                              </span>

                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => handleJumpToEmailFromDeadline(dl)}
                                  className="text-[10px] text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 font-semibold flex items-center gap-0.5"
                                >
                                  <span>Open Email</span>
                                  <ArrowUpRight className="w-2.5 h-2.5" />
                                </button>

                                <a
                                  href={createGoogleCalendarUrl(
                                    dl.title,
                                    `Academic Task from ${dl.sourceSender}`,
                                    dl.deadline
                                  )}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="text-[10px] text-blue-600 dark:text-blue-400 hover:underline font-bold flex items-center gap-0.5"
                                >
                                  <span>+ Calendar</span>
                                  <ExternalLink className="w-2.5 h-2.5" />
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
          {/* VIEW 3: ACTIVE EMAIL DETAIL (AI BREAKDOWN) */}
          {/* ========================================================================= */}
          {activeTab === 'detail' && (
            <div className="space-y-3">
              <button
                onClick={() => setActiveTab('buckets')}
                className="text-[11px] font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 group transition"
              >
                <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
                <span>Back to Smart Buckets</span>
              </button>

              {!email && !loading && (
                <div className="bg-white dark:bg-[#111827] border border-slate-200/80 dark:border-slate-800 rounded-2xl p-6 text-center space-y-2.5">
                  <div className="w-10 h-10 mx-auto rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center">
                    <Mail className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-800 dark:text-slate-200 text-xs">
                      No email opened
                    </h4>
                    <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">
                      Select any email from <strong>Smart Buckets</strong> or click an email in
                      Gmail.
                    </p>
                  </div>
                </div>
              )}

              {email && (
                <div className="bg-white dark:bg-[#111827] border border-slate-200/80 dark:border-slate-800 rounded-2xl p-3.5 shadow-2xs space-y-2.5">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <h2
                        className="text-xs font-extrabold text-slate-900 dark:text-white leading-snug"
                        title={email.subject}
                      >
                        {email.subject}
                      </h2>
                      <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-1.5">
                        <span className="font-semibold text-slate-700 dark:text-slate-300 truncate">
                          {email.senderName}
                        </span>
                        <span>•</span>
                        <span>{email.dateStr}</span>
                      </div>
                    </div>
                    <button
                      onClick={() => triggerAnalysis(email)}
                      disabled={loading}
                      className="shrink-0 p-1.5 px-2 bg-slate-50 dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-blue-950 text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 border border-slate-200/60 dark:border-slate-700 rounded-xl transition flex items-center gap-1 font-semibold text-[10px]"
                    >
                      <Sparkles className="w-3 h-3 text-blue-600 dark:text-blue-400" />
                      <span>Re-analyze</span>
                    </button>
                  </div>

                  {analysis && (
                    <div className="flex flex-wrap items-center gap-1.5 pt-1.5 border-t border-slate-100 dark:border-slate-800">
                      {(() => {
                        const theme = getCategoryTheme(analysis.category);
                        return (
                          <span
                            className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full font-semibold border text-[10px] ${theme.chip}`}
                          >
                            <span className={`w-1.5 h-1.5 rounded-full ${theme.dot}`} />
                            {analysis.category}
                          </span>
                        );
                      })()}

                      {analysis.detectedCourseCode && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full font-bold bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border border-indigo-200/80 dark:border-indigo-800 text-[10px]">
                          📚 {analysis.detectedCourseCode}
                        </span>
                      )}

                      {analysis.urgency === 'high' && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full font-bold bg-rose-50 dark:bg-rose-950 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800 text-[10px]">
                          🔥 Urgent
                        </span>
                      )}

                      {analysis.providerUsed && (
                        <span className="ml-auto text-[9px] text-slate-400 dark:text-slate-500 font-medium flex items-center gap-0.5">
                          <Zap className="w-2.5 h-2.5 text-amber-500" />
                          <span>{analysis.providerUsed}</span>
                        </span>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Skeleton Loader */}
              {loading && (
                <div className="bg-white dark:bg-[#111827] border border-slate-200/80 dark:border-slate-800 rounded-2xl p-4 space-y-3 animate-pulse shadow-2xs">
                  <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded-lg w-1/3"></div>
                  <div className="space-y-1.5">
                    <div className="h-3 bg-slate-100 dark:bg-slate-800 rounded w-full"></div>
                    <div className="h-3 bg-slate-100 dark:bg-slate-800 rounded w-5/6"></div>
                    <div className="h-3 bg-slate-100 dark:bg-slate-800 rounded w-4/6"></div>
                  </div>
                  <div className="h-16 bg-slate-50 dark:bg-slate-900 border border-dashed border-slate-200 dark:border-slate-800 rounded-xl"></div>
                </div>
              )}

              {/* Analysis Results */}
              {analysis && !loading && (
                <div className="space-y-3">
                  {/* 1. Bulleted Executive Summary */}
                  <div className="bg-white dark:bg-[#111827] border border-slate-200/80 dark:border-slate-800 rounded-2xl p-3.5 shadow-2xs space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 font-bold text-slate-900 dark:text-white text-xs">
                        <Sparkles className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                        <span>AI Executive Summary</span>
                      </div>
                      <button
                        onClick={handleCopySummary}
                        className="text-[10px] font-semibold text-slate-400 hover:text-slate-800 dark:hover:text-white flex items-center gap-1 transition"
                      >
                        {copiedSummary ? (
                          <>
                            <Check className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                            <span className="text-emerald-600 dark:text-emerald-400">Copied</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3" />
                            <span>Copy</span>
                          </>
                        )}
                      </button>
                    </div>

                    <ul className="space-y-1.5 pt-0.5">
                      {analysis.summary.map((bullet, idx) => (
                        <li
                          key={idx}
                          className="flex items-start gap-2 text-slate-600 dark:text-slate-300 leading-relaxed text-[11px]"
                        >
                          <span className="text-blue-500 font-extrabold leading-tight mt-0.5">•</span>
                          <span>{bullet}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* 2. Action Items & Deadlines */}
                  <div className="bg-white dark:bg-[#111827] border border-slate-200/80 dark:border-slate-800 rounded-2xl p-3.5 shadow-2xs space-y-2.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 font-bold text-slate-900 dark:text-white text-xs">
                        <Clock className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                        <span>Action Items & Deadlines</span>
                      </div>
                      <span className="text-[10px] px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-full font-bold">
                        {analysis.actionItems.filter((i) => !i.completed).length} pending
                      </span>
                    </div>

                    {analysis.actionItems.length === 0 ? (
                      <p className="text-[11px] text-slate-400 dark:text-slate-500 italic">
                        No direct action items found.
                      </p>
                    ) : (
                      <div className="space-y-1.5">
                        {analysis.actionItems.map((item) => (
                          <div
                            key={item.id}
                            className={`p-2.5 rounded-xl border transition ${
                              item.completed
                                ? 'bg-slate-50/70 dark:bg-slate-900/50 border-slate-100 dark:border-slate-800 opacity-60'
                                : 'bg-white dark:bg-[#111827] border-slate-200/80 dark:border-slate-800 hover:border-slate-300 shadow-2xs'
                            }`}
                          >
                            <div className="flex items-start gap-2">
                              <button
                                onClick={() => toggleActionItem(item.id)}
                                className="mt-0.5 text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition shrink-0"
                              >
                                {item.completed ? (
                                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                                ) : (
                                  <Circle className="w-4 h-4" />
                                )}
                              </button>

                              <div className="flex-1 min-w-0">
                                <p
                                  className={`font-semibold text-[11px] leading-tight ${
                                    item.completed
                                      ? 'line-through text-slate-400 dark:text-slate-500'
                                      : 'text-slate-800 dark:text-slate-200'
                                  }`}
                                >
                                  {item.title}
                                </p>

                                {item.deadline && (
                                  <div className="flex items-center justify-between mt-2 pt-1.5 border-t border-slate-100 dark:border-slate-800">
                                    <span className="text-[10px] text-amber-800 dark:text-amber-400 font-semibold flex items-center gap-1">
                                      <Calendar className="w-3 h-3 text-amber-600 dark:text-amber-400" />
                                      {item.deadline}
                                    </span>

                                    <a
                                      href={createGoogleCalendarUrl(
                                        item.title,
                                        email?.subject || 'Academic Task',
                                        item.deadline
                                      )}
                                      target="_blank"
                                      rel="noreferrer"
                                      className="inline-flex items-center gap-1 text-[10px] text-blue-600 dark:text-blue-400 hover:underline font-bold transition"
                                    >
                                      <span>+ Google Calendar</span>
                                      <ExternalLink className="w-2.5 h-2.5" />
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
                    <div className="bg-white dark:bg-[#111827] border border-slate-200/80 dark:border-slate-800 rounded-2xl p-3.5 shadow-2xs space-y-2">
                      <div className="flex items-center gap-1.5 font-bold text-slate-900 dark:text-white text-xs">
                        <Video className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                        <span>Event & Registration Links</span>
                      </div>
                      <div className="space-y-1.5">
                        {analysis.meetingLinks.map((link, idx) => (
                          <a
                            key={idx}
                            href={link.url}
                            target="_blank"
                            rel="noreferrer"
                            className="flex items-center justify-between p-2.5 rounded-xl bg-indigo-50/60 dark:bg-indigo-950/60 hover:bg-indigo-100/60 dark:hover:bg-indigo-900/60 border border-indigo-100 dark:border-indigo-800/60 text-indigo-950 dark:text-indigo-200 transition group"
                          >
                            <div className="flex items-center gap-2 truncate">
                              <span className="font-bold text-[11px] truncate">
                                {link.title || 'Join Event / Register'}
                              </span>
                            </div>
                            <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 group-hover:translate-x-0.5 transition-transform flex items-center gap-0.5 shrink-0">
                              Open <ChevronRight className="w-3 h-3" />
                            </span>
                          </a>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* 4. Smart Academic Quick Replies */}
                  <div className="bg-white dark:bg-[#111827] border border-slate-200/80 dark:border-slate-800 rounded-2xl p-3.5 shadow-2xs space-y-2.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 font-bold text-slate-900 dark:text-white text-xs">
                        <SendHorizontal className="w-3.5 h-3.5 text-slate-600 dark:text-slate-400" />
                        <span>Academic Quick Replies</span>
                      </div>
                      <span className="text-[10px] text-slate-400 dark:text-slate-500 font-medium">
                        1-Click Copy
                      </span>
                    </div>

                    <div className="grid grid-cols-3 gap-1.5">
                      {quickReplies.map((reply, idx) => (
                        <button
                          key={idx}
                          onClick={() => handleCopyReplyPreset(reply.text, idx)}
                          className={`p-2 rounded-xl border text-center transition font-semibold text-[10px] flex flex-col items-center justify-center gap-1 ${
                            copiedReplyIndex === idx
                              ? 'bg-emerald-50 dark:bg-emerald-950/80 border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300'
                              : 'bg-slate-50 dark:bg-slate-900/70 hover:bg-blue-50 dark:hover:bg-blue-950 border-slate-200/80 dark:border-slate-800 text-slate-700 dark:text-slate-300'
                          }`}
                        >
                          {copiedReplyIndex === idx ? (
                            <>
                              <Check className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                              <span>Copied!</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3 h-3 text-slate-400" />
                              <span>{reply.title}</span>
                            </>
                          )}
                        </button>
                      ))}
                    </div>

                    {analysis.suggestedReply && (
                      <div className="p-2.5 bg-slate-50/70 dark:bg-slate-900/70 border border-slate-100 dark:border-slate-800 rounded-xl text-slate-600 dark:text-slate-300 text-[11px] italic leading-relaxed">
                        "{analysis.suggestedReply}"
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </main>

        {/* Footer */}
        <footer className="border-t border-slate-200/70 dark:border-slate-800/80 px-3.5 py-2 text-center text-[10px] text-slate-400 dark:text-slate-500 bg-white dark:bg-[#0f172a] transition-colors">
          AcadMail AI • Intelligent Academic Copilot
        </footer>
      </div>
    </div>
  );
}

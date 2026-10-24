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
  Edit3,
  Bot,
  MessageSquare
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
      category: 'Academics',
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
      if (!settings.apiKey && !settings.groqApiKey) {
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
    if (ref.rowIndex !== undefined) {
      const tab = await getGmailTab();
      if (tab?.id) {
        chrome.tabs.sendMessage(tab.id, { type: 'CLICK_ROW', index: ref.rowIndex });
      }
    }
    setActiveTab('detail');
    setTimeout(() => fetchEmailFromActiveTab(), 600);
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

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    await saveSettings({
      apiKey: apiKey.trim(),
      groqApiKey: groqKey.trim(),
      inPageIntegration: uiMode !== 'off',
      uiMode,
      customFilters,
    });
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
          chip: 'bg-[#edf5fd] dark:bg-[#1a2d48] text-[#1a73e8] dark:text-[#a8c7fa] border-[#d2e3fc] dark:border-[#2b4c7e]',
          dot: 'bg-[#1a73e8] dark:bg-[#a8c7fa]',
          activeBtn: 'bg-[#c2e7ff] dark:bg-[#004a77] text-[#001d35] dark:text-[#c2e7ff] border-[#7fcfff] dark:border-[#005c93] shadow-2xs font-semibold',
          countBadge: 'bg-[#001d35]/12 dark:bg-[#c2e7ff]/20 text-[#001d35] dark:text-[#c2e7ff]',
        };
      case 'Competitions & Tournaments':
        return {
          icon: <Trophy className="w-3.5 h-3.5" />,
          chip: 'bg-[#fef7e0] dark:bg-[#3e2c0e] text-[#b06000] dark:text-[#f8d070] border-[#fce8b2] dark:border-[#63481b]',
          dot: 'bg-[#b06000] dark:bg-[#f8d070]',
          activeBtn: 'bg-[#fef7e0] dark:bg-[#3e2c0e] text-[#b06000] dark:text-[#f8d070] border-[#fce8b2] dark:border-[#63481b] shadow-2xs font-semibold',
          countBadge: 'bg-[#b06000]/12 dark:bg-[#f8d070]/20 text-[#b06000] dark:text-[#f8d070]',
        };
      case 'Workshops':
        return {
          icon: <Briefcase className="w-3.5 h-3.5" />,
          chip: 'bg-[#e6f4ea] dark:bg-[#0f331e] text-[#137333] dark:text-[#85e0a3] border-[#ceead6] dark:border-[#1c5534]',
          dot: 'bg-[#137333] dark:bg-[#85e0a3]',
          activeBtn: 'bg-[#e6f4ea] dark:bg-[#0f331e] text-[#137333] dark:text-[#85e0a3] border-[#ceead6] dark:border-[#1c5534] shadow-2xs font-semibold',
          countBadge: 'bg-[#137333]/12 dark:bg-[#85e0a3]/20 text-[#137333] dark:text-[#85e0a3]',
        };
      case 'Class Rescheduling':
        return {
          icon: <AlertTriangle className="w-3.5 h-3.5" />,
          chip: 'bg-[#fce8e6] dark:bg-[#3d1417] text-[#c5221f] dark:text-[#f29e99] border-[#fad2cf] dark:border-[#66272c]',
          dot: 'bg-[#c5221f] dark:bg-[#f29e99]',
          activeBtn: 'bg-[#fce8e6] dark:bg-[#3d1417] text-[#c5221f] dark:text-[#f29e99] border-[#fad2cf] dark:border-[#66272c] shadow-2xs font-semibold',
          countBadge: 'bg-[#c5221f]/12 dark:bg-[#f29e99]/20 text-[#c5221f] dark:text-[#f29e99]',
        };
      case 'General':
        return {
          icon: <ScrollText className="w-3.5 h-3.5" />,
          chip: 'bg-[#f1f3f4] dark:bg-[#282a2d] text-[#444746] dark:text-[#c4c7c5] border-[#dadce0] dark:border-[#3c4043]',
          dot: 'bg-[#5f6368] dark:bg-[#c4c7c5]',
          activeBtn: 'bg-[#e9eef6] dark:bg-[#282a2d] text-[#1f1f1f] dark:text-[#e3e3e3] border-[#dadce0] dark:border-[#3c4043] shadow-2xs font-semibold',
          countBadge: 'bg-[#5f6368]/12 dark:bg-[#c4c7c5]/20 text-[#5f6368] dark:text-[#c4c7c5]',
        };
      default:
        // Custom user-defined categories
        if (cat.toLowerCase().includes('placement') || cat.toLowerCase().includes('intern')) {
          return {
            icon: <Tag className="w-3.5 h-3.5" />,
            chip: 'bg-[#f3e8ff] dark:bg-[#321c4d] text-[#7e22ce] dark:text-[#d8b4fe] border-[#e9d5ff] dark:border-[#582987]',
            dot: 'bg-[#7e22ce] dark:bg-[#d8b4fe]',
            activeBtn: 'bg-[#f3e8ff] dark:bg-[#321c4d] text-[#7e22ce] dark:text-[#d8b4fe] border-[#e9d5ff] dark:border-[#582987] shadow-2xs font-semibold',
            countBadge: 'bg-[#7e22ce]/12 dark:bg-[#d8b4fe]/20 text-[#7e22ce] dark:text-[#d8b4fe]',
          };
        }
        if (cat.toLowerCase().includes('hostel') || cat.toLowerCase().includes('mess')) {
          return {
            icon: <Tag className="w-3.5 h-3.5" />,
            chip: 'bg-[#e0f7fa] dark:bg-[#00363a] text-[#006064] dark:text-[#80deea] border-[#b2ebf2] dark:border-[#006064]',
            dot: 'bg-[#00838f] dark:bg-[#80deea]',
            activeBtn: 'bg-[#e0f7fa] dark:bg-[#00363a] text-[#006064] dark:text-[#80deea] border-[#b2ebf2] dark:border-[#006064] shadow-2xs font-semibold',
            countBadge: 'bg-[#00838f]/12 dark:bg-[#80deea]/20 text-[#006064] dark:text-[#80deea]',
          };
        }
        return {
          icon: <Tag className="w-3.5 h-3.5" />,
          chip: 'bg-[#f3e8ff] dark:bg-[#321c4d] text-[#7e22ce] dark:text-[#d8b4fe] border-[#e9d5ff] dark:border-[#582987]',
          dot: 'bg-[#7e22ce] dark:bg-[#d8b4fe]',
          activeBtn: 'bg-[#f3e8ff] dark:bg-[#321c4d] text-[#7e22ce] dark:text-[#d8b4fe] border-[#e9d5ff] dark:border-[#582987] shadow-2xs font-semibold',
          countBadge: 'bg-[#7e22ce]/12 dark:bg-[#d8b4fe]/20 text-[#7e22ce] dark:text-[#d8b4fe]',
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
      <div className="flex flex-col min-h-screen bg-[#f6f8fc] dark:bg-[#111318] text-[#1f1f1f] dark:text-[#e3e3e3] font-sans antialiased text-xs selection:bg-[#c2e7ff] dark:selection:bg-[#004a77] transition-colors duration-150">
        {/* Top Header */}
        <header className="sticky top-0 z-30 bg-[#f6f8fc] dark:bg-[#111318] border-b border-[#e0e2ec] dark:border-[#282a2d] px-3.5 py-2.5 flex items-center justify-between transition-colors">
          <div className="flex items-center gap-2">
            <img
              src="/icons/envelope-logo.png"
              alt="AcadMail"
              className="w-6 h-6 rounded-md object-contain shadow-2xs shrink-0"
            />
            <div className="flex items-baseline gap-1.5">
              <span className="font-batangas text-[14px] font-bold tracking-wide text-[#1f1f1f] dark:text-[#e3e3e3]">
                AcadMail
              </span>
              <span className="text-[9px] font-medium px-1.5 py-0.2 rounded-full bg-[#eaeff8] dark:bg-[#1e1f20] text-[#0b57d0] dark:text-[#a8c7fa] border border-[#d3e3fd] dark:border-[#3c4043]">
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
              {theme === 'dark' ? <Sun className="w-3.5 h-3.5 text-[#f8d070]" /> : <Moon className="w-3.5 h-3.5 text-[#444746]" />}
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
                className={`w-3.5 h-3.5 ${
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
              <Settings className="w-3.5 h-3.5" />
            </button>
          </div>
        </header>

        {/* Google M3 Style Segmented Switcher */}
        <div className="px-3 pt-2.5 pb-2 bg-[#f6f8fc] dark:bg-[#111318] border-b border-[#e0e2ec] dark:border-[#282a2d]">
          <div className="p-1 bg-[#eaeff8] dark:bg-[#1e1f20] rounded-lg flex items-center gap-1 border border-[#d3e3fd]/60 dark:border-[#2c2d30]">
            <button
              onClick={() => setActiveTab('buckets')}
              className={`flex-1 py-1.5 px-2 rounded-md text-[11px] transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                activeTab === 'buckets'
                  ? 'bg-white dark:bg-[#004a77] text-[#0b57d0] dark:text-[#c2e7ff] shadow-xs font-semibold'
                  : 'text-[#444746] dark:text-[#c4c7c5] hover:text-[#1f1f1f] dark:hover:text-[#e3e3e3]'
              }`}
            >
              <span className="truncate">Buckets</span>
              {inboxItems.length > 0 && (
                <span className="text-[9px] font-medium opacity-75">
                  {inboxItems.length}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('deadlines')}
              className={`flex-1 py-1.5 px-2 rounded-md text-[11px] transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                activeTab === 'deadlines'
                  ? 'bg-white dark:bg-[#004a77] text-[#0b57d0] dark:text-[#c2e7ff] shadow-xs font-semibold'
                  : 'text-[#444746] dark:text-[#c4c7c5] hover:text-[#1f1f1f] dark:hover:text-[#e3e3e3]'
              }`}
            >
              <span className="truncate">Deadlines</span>
              {pendingDeadlinesCount > 0 && (
                <span className="text-[9px] font-semibold text-amber-700 dark:text-amber-400">
                  {pendingDeadlinesCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('chat')}
              className={`flex-1 py-1.5 px-2 rounded-md text-[11px] transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                activeTab === 'chat'
                  ? 'bg-white dark:bg-[#004a77] text-[#0b57d0] dark:text-[#c2e7ff] shadow-xs font-semibold'
                  : 'text-[#444746] dark:text-[#c4c7c5] hover:text-[#1f1f1f] dark:hover:text-[#e3e3e3]'
              }`}
            >
              <span className="truncate">Copilot</span>
            </button>

            <button
              onClick={() => setActiveTab('detail')}
              className={`flex-1 py-1.5 px-2 rounded-md text-[11px] transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
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
            <div className="bg-white dark:bg-[#1e1f20] border border-[#e0e2ec] dark:border-[#2c2d30] rounded-xl p-3.5 shadow-xs space-y-3 animate-in fade-in duration-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-[#1f1f1f] dark:text-[#e3e3e3] font-bold text-xs">
                  <Key className="w-3.5 h-3.5 text-[#0b57d0] dark:text-[#a8c7fa]" />
                  <span>AI Configuration</span>
                </div>
                <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" /> Auto-Cascade Active
                </span>
              </div>

              <form onSubmit={handleSaveSettings} className="space-y-2.5">
                <div className="space-y-1">
                  <div className="flex justify-between items-center text-[11px]">
                    <span className="font-semibold text-[#444746] dark:text-[#c4c7c5]">
                      Google Gemini Key
                    </span>
                    <a
                      href="https://aistudio.google.com/"
                      target="_blank"
                      rel="noreferrer"
                      className="text-[#0b57d0] dark:text-[#a8c7fa] hover:underline flex items-center gap-0.5 text-[10px] font-medium"
                    >
                      Get Free Key <ExternalLink className="w-2.5 h-2.5" />
                    </a>
                  </div>
                  <input
                    type="password"
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    placeholder="Paste Gemini API Key..."
                    className="w-full px-2.5 py-1.5 text-xs bg-[#f6f8fc] dark:bg-[#111318] border border-[#e0e2ec] dark:border-[#2c2d30] rounded-xl focus:bg-white dark:focus:bg-[#1e1f20] focus:outline-none focus:border-[#0b57d0] dark:focus:border-[#a8c7fa] text-[#1f1f1f] dark:text-[#e3e3e3] font-mono"
                  />
                </div>

                <div className="space-y-1 pt-1.5 border-t border-[#f1f3f4] dark:border-[#2c2d30]">
                  <div className="flex justify-between items-center text-[11px]">
                    <span className="font-semibold text-[#444746] dark:text-[#c4c7c5] flex items-center gap-1">
                      <span>Groq Key</span>
                      <span className="px-1 py-0.2 bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-800/60 text-[8px] rounded font-bold">
                        Zero Downtime
                      </span>
                    </span>
                    <a
                      href="https://console.groq.com/keys"
                      target="_blank"
                      rel="noreferrer"
                      className="text-[#0b57d0] dark:text-[#a8c7fa] hover:underline flex items-center gap-0.5 text-[10px] font-medium"
                    >
                      Free Groq Key <ExternalLink className="w-2.5 h-2.5" />
                    </a>
                  </div>
                  <input
                    type="password"
                    value={groqKey}
                    onChange={(e) => setGroqKey(e.target.value)}
                    placeholder="gsk_... (Optional backup)"
                    className="w-full px-2.5 py-1.5 text-xs bg-[#f6f8fc] dark:bg-[#111318] border border-[#e0e2ec] dark:border-[#2c2d30] rounded-xl focus:bg-white dark:focus:bg-[#1e1f20] focus:outline-none focus:border-[#0b57d0] dark:focus:border-[#a8c7fa] text-[#1f1f1f] dark:text-[#e3e3e3] font-mono"
                  />
                </div>

                {/* In-Gmail Integration & Revert Options */}
                <div className="pt-2 border-t border-[#f1f3f4] dark:border-[#2c2d30] space-y-2">
                  <div>
                    <div className="font-semibold text-[#1f1f1f] dark:text-[#e3e3e3] text-[11px] flex items-center gap-1.5">
                      <LayoutGrid className="w-3.5 h-3.5 text-[#0b57d0] dark:text-[#a8c7fa] shrink-0" />
                      <span>Gmail Integration & Revert</span>
                    </div>
                    <p className="text-[10px] text-[#5f6368] dark:text-[#8e918f] leading-tight mt-0.5">
                      Select how AcadMail integrates inside Gmail
                    </p>
                  </div>

                  <div className="grid grid-cols-3 gap-1.5 pt-0.5">
                    <button
                      type="button"
                      onClick={() => handleSetUiMode('blended')}
                      className={`p-2 rounded-xl text-left border transition ${
                        uiMode === 'blended'
                          ? 'bg-[#c2e7ff] dark:bg-[#004a77] border-[#7fcfff] dark:border-[#005c93] text-[#001d35] dark:text-[#c2e7ff] font-bold shadow-2xs'
                          : 'bg-white dark:bg-[#1e1f20] border-[#e0e2ec] dark:border-[#2c2d30] text-[#444746] dark:text-[#c4c7c5] hover:bg-[#f0f4f9] dark:hover:bg-[#28292c]'
                      }`}
                    >
                      <div className="flex items-center gap-1.5 text-[10px]">
                        <Layers className="w-3 h-3 text-[#0b57d0] dark:text-[#a8c7fa]" />
                        <span>Blended M3</span>
                      </div>
                      <p className="text-[8px] text-[#5f6368] dark:text-[#8e918f] font-normal mt-0.5 leading-tight">Native Google UI</p>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleSetUiMode('floating')}
                      className={`p-2 rounded-xl text-left border transition ${
                        uiMode === 'floating'
                          ? 'bg-[#c2e7ff] dark:bg-[#004a77] border-[#7fcfff] dark:border-[#005c93] text-[#001d35] dark:text-[#c2e7ff] font-bold shadow-2xs'
                          : 'bg-white dark:bg-[#1e1f20] border-[#e0e2ec] dark:border-[#2c2d30] text-[#444746] dark:text-[#c4c7c5] hover:bg-[#f0f4f9] dark:hover:bg-[#28292c]'
                      }`}
                    >
                      <div className="flex items-center gap-1.5 text-[10px]">
                        <Zap className="w-3 h-3 text-amber-500" />
                        <span>Floating Bar</span>
                      </div>
                      <p className="text-[8px] text-[#5f6368] dark:text-[#8e918f] font-normal mt-0.5 leading-tight">Capsule toolbar</p>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleSetUiMode('off')}
                      className={`p-2 rounded-xl text-left border transition ${
                        uiMode === 'off'
                          ? 'bg-rose-50 dark:bg-rose-950/60 border-rose-500 text-rose-700 dark:text-rose-300 font-bold shadow-2xs'
                          : 'bg-white dark:bg-[#1e1f20] border-[#e0e2ec] dark:border-[#2c2d30] text-[#444746] dark:text-[#c4c7c5] hover:bg-[#f0f4f9] dark:hover:bg-[#28292c]'
                      }`}
                    >
                      <div className="flex items-center gap-1.5 text-[10px]">
                        <ShieldCheck className="w-3 h-3 text-slate-500" />
                        <span>Revert (Off)</span>
                      </div>
                      <p className="text-[8px] text-[#5f6368] dark:text-[#8e918f] font-normal mt-0.5 leading-tight">Side panel only</p>
                    </button>
                  </div>
                </div>

                {/* Custom Academic Filters Management */}
                <div className="pt-2 border-t border-[#f1f3f4] dark:border-[#2c2d30] space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="font-semibold text-[#1f1f1f] dark:text-[#e3e3e3] text-[11px] flex items-center gap-1.5">
                      <Tag className="w-3.5 h-3.5 text-purple-500 shrink-0" />
                      <span>Custom Academic Filters</span>
                    </div>
                    <span className="text-[10px] text-[#5f6368] dark:text-[#8e918f] font-medium">
                      {customFilters.length} active
                    </span>
                  </div>
                  <p className="text-[10px] text-[#5f6368] dark:text-[#8e918f] leading-tight">
                    Add custom filters for placements, hostels, clubs, or research labs.
                  </p>

                  {/* Existing Filters List */}
                  {customFilters.length > 0 && (
                    <div className="space-y-1 max-h-36 overflow-y-auto">
                      {customFilters.map((f) => (
                        <div
                          key={f.id}
                          className="flex items-center justify-between p-2 rounded-xl bg-[#f6f8fc] dark:bg-[#111318] border border-[#e0e2ec] dark:border-[#2c2d30]"
                        >
                          <div className="min-w-0 flex-1 pr-2">
                            <div className="font-bold text-[11px] text-[#1f1f1f] dark:text-[#e3e3e3] truncate flex items-center gap-1.5">
                              <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: f.color || '#8b5cf6' }} />
                              <span className="truncate">{f.name}</span>
                            </div>
                            <div className="text-[9px] text-[#5f6368] dark:text-[#8e918f] truncate mt-0.5">
                              Keywords: {f.keywords.join(', ')}
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleDeleteCustomFilter(f.id)}
                            className="p-1 text-[#5f6368] hover:text-rose-600 rounded-lg transition shrink-0"
                            title="Delete custom filter"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Add New Filter Inline */}
                  <div className="p-2.5 rounded-xl bg-[#f6f8fc] dark:bg-[#111318] border border-[#e0e2ec] dark:border-[#2c2d30] space-y-2">
                    <div className="text-[10px] font-bold text-[#1f1f1f] dark:text-[#e3e3e3] flex items-center gap-1">
                      <Plus className="w-3 h-3 text-[#0b57d0] dark:text-[#a8c7fa]" />
                      <span>Add New Custom Filter</span>
                    </div>
                    <div className="space-y-1.5">
                      <input
                        type="text"
                        placeholder="Filter Name (e.g. Library & Fines)"
                        value={newFilterName}
                        onChange={(e) => setNewFilterName(e.target.value)}
                        className="w-full px-2.5 py-1.5 text-[11px] bg-white dark:bg-[#1e1f20] border border-[#e0e2ec] dark:border-[#2c2d30] rounded-xl text-[#1f1f1f] dark:text-[#e3e3e3] focus:outline-none focus:border-[#0b57d0]"
                      />
                      <input
                        type="text"
                        placeholder="Keywords (e.g. library, book, fine, return)"
                        value={newFilterKeywords}
                        onChange={(e) => setNewFilterKeywords(e.target.value)}
                        className="w-full px-2.5 py-1.5 text-[11px] bg-white dark:bg-[#1e1f20] border border-[#e0e2ec] dark:border-[#2c2d30] rounded-xl text-[#1f1f1f] dark:text-[#e3e3e3] focus:outline-none focus:border-[#0b57d0]"
                      />
                    </div>
                    <div className="flex justify-end">
                      <button
                        type="button"
                        disabled={!newFilterName.trim()}
                        onClick={handleAddCustomFilter}
                        className="px-3 py-1 bg-[#0b57d0] hover:bg-[#0842a0] dark:bg-[#a8c7fa] dark:hover:bg-[#d3e3fd] text-white dark:text-[#001d35] disabled:opacity-40 rounded-full text-[10px] font-bold transition flex items-center gap-1 shadow-2xs"
                      >
                        <Plus className="w-3 h-3" />
                        <span>Create Filter</span>
                      </button>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end pt-1">
                  <button
                    type="submit"
                    className="px-3.5 py-1.5 bg-[#0b57d0] hover:bg-[#0842a0] dark:bg-[#a8c7fa] dark:hover:bg-[#d3e3fd] text-white dark:text-[#001d35] font-semibold rounded-full text-xs transition shadow-xs"
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
            <div className="space-y-2.5">
              {/* Category Filter Ribbon */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none pt-0.5">
                <button
                  onClick={() => handleCategoryFilterChange('ALL')}
                  className={`px-2.5 py-1.5 rounded-lg text-[11px] transition shrink-0 flex items-center gap-1.5 cursor-pointer ${
                    selectedCategory === 'ALL'
                      ? 'bg-[#c2e7ff] text-[#001d35] dark:bg-[#004a77] dark:text-[#c2e7ff] font-semibold border border-[#7fcfff] dark:border-[#005c93] shadow-2xs'
                      : 'bg-white dark:bg-[#1e1f20] text-[#444746] dark:text-[#c4c7c5] border border-[#c4c7c5] dark:border-[#444746] hover:bg-[#f0f4f9] dark:hover:bg-[#28292c]'
                  }`}
                >
                  <span>All</span>
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-md font-medium ${
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
                      className={`px-2.5 py-1.5 rounded-lg text-[11px] font-medium transition shrink-0 flex items-center gap-1.5 cursor-pointer ${
                        isSelected
                          ? `${theme.activeBtn}`
                          : 'bg-white dark:bg-[#1e1f20] text-[#444746] dark:text-[#c4c7c5] border border-[#c4c7c5] dark:border-[#444746] hover:bg-[#f0f4f9] dark:hover:bg-[#28292c]'
                      }`}
                    >
                      <span>{cat.label}</span>
                      <span
                        className={`text-[10px] px-1.5 py-0.2 rounded-md font-medium ${
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
                      className={`px-2.5 py-1.5 rounded-lg text-[11px] transition shrink-0 flex items-center gap-1.5 cursor-pointer ${
                        isSelected
                          ? `${theme.activeBtn}`
                          : 'bg-white dark:bg-[#1e1f20] text-[#7e22ce] dark:text-[#d8b4fe] border border-[#e9d5ff] dark:border-[#582987] hover:bg-[#f3e8ff]/50 dark:hover:bg-[#321c4d]/50'
                      }`}
                    >
                      <span>{filter.name}</span>
                      <span
                        className={`text-[10px] px-1.5 py-0.2 rounded-md font-medium ${
                          isSelected
                            ? `${theme.countBadge}`
                            : 'bg-[#f3e8ff] text-[#7e22ce] dark:bg-[#321c4d] dark:text-[#d8b4fe]'
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
                  className="px-2.5 py-1.5 rounded-lg text-[11px] font-medium text-[#444746] dark:text-[#c4c7c5] border border-dashed border-[#c4c7c5] dark:border-[#444746] hover:border-[#747775] hover:bg-[#f0f4f9] dark:hover:bg-[#28292c] transition shrink-0 flex items-center gap-1 cursor-pointer"
                >
                  <span>+ Filter</span>
                </button>
              </div>

              {/* Search & Actions Toolbar */}
              <div className="flex items-center gap-1.5">
                <div className="relative flex-1">
                  <Search className="w-3.5 h-3.5 text-[#5f6368] dark:text-[#8e918f] absolute left-3 top-2.5 pointer-events-none" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={`Search in ${selectedCategory === 'ALL' ? 'all emails' : selectedCategory}...`}
                    className="w-full pl-8 pr-7 py-1.5 text-xs bg-[#eaeff8] dark:bg-[#1e1f20] border border-transparent focus:border-[#0b57d0] dark:focus:border-[#a8c7fa] rounded-lg focus:outline-none focus:bg-white dark:focus:bg-[#28292a] text-[#1f1f1f] dark:text-[#e3e3e3] placeholder-[#5f6368] dark:placeholder-[#8e918f] shadow-2xs transition-colors"
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
                  className={`py-1.5 px-2.5 rounded-lg border text-[11px] font-medium flex items-center gap-1.5 transition shrink-0 cursor-pointer ${
                    syncGmailDom
                      ? 'bg-[#c2e7ff] text-[#001d35] dark:bg-[#004a77] dark:text-[#c2e7ff] border-[#7fcfff] dark:border-[#005c93] shadow-2xs font-semibold'
                      : 'bg-white dark:bg-[#1e1f20] border-[#c4c7c5] dark:border-[#444746] text-[#444746] dark:text-[#c4c7c5] hover:bg-[#f0f4f9] dark:hover:bg-[#28292c]'
                  }`}
                >
                  <Eye className="w-3 h-3" />
                  <span>Dim Gmail</span>
                </button>

                <button
                  onClick={() => scanInbox()}
                  disabled={isScanningInbox}
                  title="Refresh & scan visible inbox rows"
                  className="p-1.5 rounded-lg border border-[#c4c7c5] dark:border-[#444746] bg-white dark:bg-[#1e1f20] text-[#444746] dark:text-[#c4c7c5] hover:text-[#1f1f1f] dark:hover:text-[#e3e3e3] hover:bg-[#f0f4f9] dark:hover:bg-[#28292c] transition shrink-0 cursor-pointer"
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
                    <h4 className="font-semibold text-[#1f1f1f] dark:text-[#e3e3e3] text-xs">
                      {inboxItems.length === 0
                        ? 'No visible emails detected'
                        : `No emails found in "${selectedCategory}"`}
                    </h4>
                    <p className="text-[11px] text-[#5f6368] dark:text-[#8e918f] mt-1 max-w-[260px] mx-auto">
                      Scan your visible Gmail inbox rows to categorize them automatically.
                    </p>
                  </div>
                  <button
                    onClick={() => scanInbox()}
                    disabled={isScanningInbox}
                    className="px-3.5 py-1.5 bg-[#0b57d0] hover:bg-[#0842a0] dark:bg-[#a8c7fa] dark:hover:bg-[#d3e3fd] text-white dark:text-[#001d35] font-semibold text-xs rounded-lg transition shadow-xs inline-flex items-center gap-1.5 cursor-pointer"
                  >
                    <RefreshCw className={`w-3 h-3 ${isScanningInbox ? 'animate-spin' : ''}`} />
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
                        className="p-3 hover:bg-[#f0f4f9] dark:hover:bg-[#28292c] cursor-pointer transition-colors group flex flex-col gap-1"
                      >
                        {/* Header: Sender & Timestamp */}
                        <div className="flex items-center justify-between gap-2 min-w-0">
                          <span className="font-semibold text-[#1f1f1f] dark:text-[#e3e3e3] text-xs truncate">
                            {item.sender}
                          </span>
                          <span className="text-[10px] text-[#5f6368] dark:text-[#8e918f] shrink-0 font-normal">
                            {item.date}
                          </span>
                        </div>

                        {/* Subject */}
                        <div className="font-normal text-xs text-[#1f1f1f] dark:text-[#e3e3e3] group-hover:text-[#0b57d0] dark:group-hover:text-[#a8c7fa] transition-colors line-clamp-1 leading-snug">
                          {item.subject}
                        </div>

                        {/* Snippet preview */}
                        {item.snippet && (
                          <p className="text-[11px] text-[#5f6368] dark:text-[#8e918f] line-clamp-2 leading-relaxed">
                            {item.snippet}
                          </p>
                        )}

                        {/* Badges / Micro-tags */}
                        <div className="flex items-center justify-between pt-1 gap-2">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span
                              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-medium border ${theme.chip}`}
                            >
                              <span className={`w-1.5 h-1.5 rounded-full ${theme.dot}`} />
                              <span>{item.category}</span>
                            </span>

                            {item.courseCode && (
                              <span className="px-1.5 py-0.5 rounded-md text-[9px] font-medium bg-[#eaeff8] dark:bg-[#28292a] text-[#0b57d0] dark:text-[#a8c7fa] border border-[#d3e3fd] dark:border-[#3c4043]">
                                {item.courseCode}
                              </span>
                            )}
                          </div>

                          <span className="text-[10px] font-medium text-[#5f6368] dark:text-[#8e918f] group-hover:text-[#0b57d0] dark:group-hover:text-[#a8c7fa] opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-0.5 shrink-0">
                            <span>Open</span>
                            <ChevronRight className="w-3 h-3" />
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
                  className={`px-2.5 py-1.5 rounded-lg text-[11px] font-medium transition shrink-0 cursor-pointer ${
                    deadlineFilter === 'all'
                      ? 'bg-[#c2e7ff] text-[#001d35] dark:bg-[#004a77] dark:text-[#c2e7ff] font-semibold border border-[#7fcfff] dark:border-[#005c93] shadow-2xs'
                      : 'bg-white dark:bg-[#1e1f20] border border-[#c4c7c5] dark:border-[#444746] text-[#444746] dark:text-[#c4c7c5] hover:bg-[#f0f4f9] dark:hover:bg-[#28292c]'
                  }`}
                >
                  All ({deadlines.length})
                </button>
                <button
                  onClick={() => setDeadlineFilter('urgent')}
                  className={`px-2.5 py-1.5 rounded-lg text-[11px] font-medium transition shrink-0 cursor-pointer ${
                    deadlineFilter === 'urgent'
                      ? 'bg-[#fce8e6] text-[#c5221f] dark:bg-[#3d1417] dark:text-[#f29e99] font-semibold border border-[#fad2cf] dark:border-[#66272c] shadow-2xs'
                      : 'bg-white dark:bg-[#1e1f20] border border-[#c4c7c5] dark:border-[#444746] text-[#c5221f] dark:text-[#f29e99] hover:bg-[#fce8e6]/40 dark:hover:bg-[#3d1417]/40'
                  }`}
                >
                  <span>Due Soon / Urgent</span>
                </button>
                <button
                  onClick={() => setDeadlineFilter('academics')}
                  className={`px-2.5 py-1.5 rounded-lg text-[11px] font-medium transition shrink-0 cursor-pointer ${
                    deadlineFilter === 'academics'
                      ? 'bg-[#edf5fd] text-[#1a73e8] dark:bg-[#1a2d48] dark:text-[#a8c7fa] font-semibold border border-[#d2e3fc] dark:border-[#2b4c7e] shadow-2xs'
                      : 'bg-white dark:bg-[#1e1f20] border border-[#c4c7c5] dark:border-[#444746] text-[#1a73e8] dark:text-[#a8c7fa] hover:bg-[#edf5fd]/40 dark:hover:bg-[#1a2d48]/40'
                  }`}
                >
                  <span>Coursework</span>
                </button>
                <button
                  onClick={() => setDeadlineFilter('competitions')}
                  className={`px-2.5 py-1.5 rounded-lg text-[11px] font-medium transition shrink-0 cursor-pointer ${
                    deadlineFilter === 'competitions'
                      ? 'bg-[#fef7e0] text-[#b06000] dark:bg-[#3e2c0e] dark:text-[#f8d070] font-semibold border border-[#fce8b2] dark:border-[#63481b] shadow-2xs'
                      : 'bg-white dark:bg-[#1e1f20] border border-[#c4c7c5] dark:border-[#444746] text-[#b06000] dark:text-[#f8d070] hover:bg-[#fef7e0]/40 dark:hover:bg-[#3e2c0e]/40'
                  }`}
                >
                  <span>Contests</span>
                </button>
              </div>

              {filteredDeadlines.length === 0 ? (
                <div className="bg-white dark:bg-[#1e1f20] border border-[#e0e2ec] dark:border-[#2c2d30] rounded-xl p-6 text-center space-y-2 shadow-2xs">
                  <CalendarCheck2 className="w-8 h-8 mx-auto text-[#5f6368] dark:text-[#8e918f]" />
                  <h4 className="font-semibold text-[#1f1f1f] dark:text-[#e3e3e3] text-xs">
                    No pending deadlines found
                  </h4>
                  <p className="text-[11px] text-[#5f6368] dark:text-[#8e918f]">
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
                        className={`p-3 bg-white dark:bg-[#1e1f20] border rounded-xl transition space-y-2 shadow-2xs ${
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
                              className={`font-semibold text-xs leading-snug ${
                                dl.completed
                                  ? 'line-through text-[#5f6368] dark:text-[#8e918f]'
                                  : 'text-[#1f1f1f] dark:text-[#e3e3e3]'
                              }`}
                            >
                              {dl.title}
                            </p>

                            <div className="flex items-center gap-1.5 mt-1 text-[10px] text-[#5f6368] dark:text-[#8e918f]">
                              <span className="truncate">{dl.sourceSender}</span>
                              <span>•</span>
                              <span className="font-semibold text-[#b06000] dark:text-[#f8d070] flex items-center gap-0.5">
                                <Clock className="w-3 h-3 text-[#b06000] dark:text-[#f8d070]" />{' '}
                                {dl.deadline}
                              </span>
                            </div>

                            <div className="flex items-center justify-between mt-2 pt-1.5 border-t border-[#f1f3f4] dark:border-[#282a2d]">
                              <span
                                className={`inline-flex items-center gap-1 px-2 py-0.2 rounded-md text-[9px] font-medium border ${theme.chip}`}
                              >
                                <span className={`w-1 h-1 rounded-full ${theme.dot}`} />
                                {dl.courseCode
                                  ? `${dl.courseCode} • ${dl.category}`
                                  : dl.category}
                              </span>

                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => handleJumpToEmailFromDeadline(dl)}
                                  className="text-[10px] text-[#5f6368] dark:text-[#8e918f] hover:text-[#0b57d0] dark:hover:text-[#a8c7fa] font-medium flex items-center gap-0.5"
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
                                  className="text-[10px] text-[#0b57d0] dark:text-[#a8c7fa] hover:underline font-semibold flex items-center gap-0.5"
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
          {/* VIEW 3: INBOX COPILOT (CHATBOT) */}
          {/* ========================================================================= */}
          {activeTab === 'chat' && (
            <div className="flex flex-col h-[calc(100vh-125px)] animate-in fade-in duration-200">
              {/* Copilot Header */}
              <div className="flex items-center justify-between px-3 py-2 bg-white dark:bg-[#1e1f20] border border-[#e0e2ec] dark:border-[#2c2d30] rounded-xl mb-2.5 shrink-0 shadow-2xs">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-[12px] font-semibold text-[#1f1f1f] dark:text-[#e3e3e3] tracking-tight">
                      Inbox Copilot
                    </span>
                    <span className="text-[10px] text-[#5f6368] dark:text-[#8e918f]">
                      • {inboxItems.length} emails grounded
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => setCopilotMode(prev => prev === 'instant' ? 'cloud' : 'instant')}
                    title="Click to toggle between Instant Local Engine and Cloud LLM"
                    className={`text-[9px] font-medium px-2 py-0.5 rounded-full border transition-colors cursor-pointer ${
                      copilotMode === 'instant'
                        ? 'bg-[#eaeff8] dark:bg-[#28292a] text-[#0b57d0] dark:text-[#a8c7fa] border-[#d3e3fd] dark:border-[#3c4043]'
                        : 'bg-[#c2e7ff] dark:bg-[#004a77] text-[#001d35] dark:text-[#c2e7ff] border-[#7fcfff] dark:border-[#005c93]'
                    }`}
                  >
                    {copilotMode === 'instant' ? 'Instant Engine (0s)' : (apiKey || groqKey ? 'Cloud LLM' : 'Instant Engine')}
                  </button>
                  <button
                    onClick={() => {
                      setChatMessages([
                        {
                          id: 'msg-welcome',
                          role: 'assistant',
                          text: "Chat cleared. Ask anything about coursework, deadlines, or campus notices.",
                          timestamp: 'Just now',
                        },
                      ]);
                    }}
                    className="text-[10px] text-[#5f6368] hover:text-[#1f1f1f] dark:text-[#8e918f] dark:hover:text-[#e3e3e3] px-1.5 py-0.5 rounded transition"
                  >
                    Clear
                  </button>
                </div>
              </div>

              {/* Quick Prompt Queries */}
              <div className="mb-2.5 shrink-0 space-y-1">
                <div className="flex items-center justify-between px-0.5">
                  <span className="text-[9px] uppercase tracking-wider text-[#5f6368] dark:text-[#8e918f] font-semibold">
                    Quick Queries
                  </span>
                  <span className="text-[9px] text-[#5f6368] dark:text-[#8e918f]">1-tap</span>
                </div>
                <div className="grid grid-cols-2 gap-1.5">
                  {QUICK_PROMPTS.map((qp) => {
                    const Icon = qp.icon;
                    return (
                      <button
                        key={qp.id}
                        onClick={() => handleSendChatMessage(qp.prompt, true)}
                        disabled={isChatThinking}
                        className="p-2 rounded-xl text-left border border-[#e0e2ec] dark:border-[#2c2d30] bg-white dark:bg-[#1e1f20] hover:bg-[#f0f4f9] dark:hover:bg-[#28292c] transition flex items-center justify-between gap-1.5 group cursor-pointer shadow-2xs"
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <div className="w-5 h-5 rounded-md bg-[#eaeff8] dark:bg-[#28292a] text-[#0b57d0] dark:text-[#a8c7fa] flex items-center justify-center shrink-0 group-hover:bg-[#0b57d0] group-hover:text-white dark:group-hover:bg-[#a8c7fa] dark:group-hover:text-[#001d35] transition-colors">
                            <Icon className="w-3 h-3" />
                          </div>
                          <div className="min-w-0">
                            <div className="text-[11px] font-medium text-[#1f1f1f] dark:text-[#e3e3e3] truncate">
                              {qp.label}
                            </div>
                            <div className="text-[9px] text-[#5f6368] dark:text-[#8e918f] truncate">
                              "{qp.prompt.slice(0, 24)}..."
                            </div>
                          </div>
                        </div>
                        <ChevronRight className="w-3 h-3 text-[#5f6368] dark:text-[#8e918f] group-hover:text-[#0b57d0] dark:group-hover:text-[#a8c7fa] group-hover:translate-x-0.5 transition shrink-0" />
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Messages Scroll Area */}
              <div className="flex-1 overflow-y-auto space-y-2.5 pr-1 pb-2 scrollbar-thin">
                {chatMessages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${
                      msg.role === 'user' ? 'items-end' : 'items-start'
                    }`}
                  >
                    <div
                      className={`max-w-[92%] rounded-xl px-3 py-2 text-xs shadow-2xs ${
                        msg.role === 'user'
                          ? 'bg-[#c2e7ff] text-[#001d35] dark:bg-[#004a77] dark:text-[#c2e7ff] rounded-br-xs font-medium'
                          : 'bg-white dark:bg-[#1e1f20] text-[#1f1f1f] dark:text-[#e3e3e3] border border-[#e0e2ec] dark:border-[#2c2d30] rounded-bl-xs'
                      }`}
                    >
                      <div className="whitespace-pre-line leading-relaxed space-y-1 text-[11px]">
                        {msg.text.split('\n').map((line, i) => {
                          if (
                            line.startsWith('#') ||
                            line.startsWith('**') ||
                            line.startsWith('📌 ') ||
                            line.startsWith('🏆 ') ||
                            line.startsWith('⚠️ ') ||
                            line.startsWith('🎯 ') ||
                            line.startsWith('✅ ') ||
                            line.startsWith('🎉 ')
                          ) {
                            return (
                              <div key={i} className="font-semibold text-[#1f1f1f] dark:text-white pt-0.5">
                                {line.replace(/^#+\s*/, '')}
                              </div>
                            );
                          }
                          if (line.startsWith('• ') || line.startsWith('- ')) {
                            return (
                              <div key={i} className="pl-1 text-[#3c4043] dark:text-[#c4c7c5]">
                                {line}
                              </div>
                            );
                          }
                          return <div key={i}>{line}</div>;
                        })}
                      </div>

                      {/* Grounded Email References */}
                      {msg.references && msg.references.length > 0 && (
                        <div className="mt-2 pt-1.5 border-t border-[#e0e2ec] dark:border-[#2c2d30] space-y-1">
                          <span className="text-[9px] font-semibold text-[#5f6368] dark:text-[#8e918f] uppercase tracking-wider block">
                            Matched Emails:
                          </span>
                          <div className="space-y-1">
                            {msg.references.map((ref) => (
                              <button
                                key={ref.id}
                                onClick={() => handleJumpToEmailFromReference(ref)}
                                className="w-full text-left p-1.5 rounded-lg bg-[#f6f8fc] dark:bg-[#111318] hover:bg-[#eaeff8] dark:hover:bg-[#28292c] border border-[#e0e2ec] dark:border-[#2c2d30] transition flex items-center justify-between gap-1.5 group cursor-pointer"
                              >
                                <div className="min-w-0 flex-1">
                                  <div className="text-[10px] font-semibold text-[#1f1f1f] dark:text-[#e3e3e3] truncate group-hover:text-[#0b57d0] dark:group-hover:text-[#a8c7fa]">
                                    {ref.subject}
                                  </div>
                                  <div className="text-[9px] text-[#5f6368] dark:text-[#8e918f] truncate">
                                    {ref.sender} • {ref.date}
                                  </div>
                                </div>
                                <ChevronRight className="w-3.5 h-3.5 text-[#5f6368] group-hover:text-[#0b57d0] dark:group-hover:text-[#a8c7fa] shrink-0" />
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                    <span className="text-[8px] text-[#5f6368] dark:text-[#8e918f] mt-0.5 px-1 font-normal">
                      {msg.timestamp}
                    </span>
                  </div>
                ))}

                {isChatThinking && (
                  <div className="flex items-center gap-2 p-2.5 bg-white dark:bg-[#1e1f20] rounded-xl border border-[#e0e2ec] dark:border-[#2c2d30] w-fit">
                    <div className="w-2 h-2 rounded-full bg-[#0b57d0] dark:bg-[#a8c7fa] animate-ping"></div>
                    <span className="text-[11px] text-[#5f6368] dark:text-[#8e918f] italic">
                      Scanning campus emails & reasoning...
                    </span>
                  </div>
                )}
              </div>

              {/* Chat Input */}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendChatMessage();
                }}
                className="pt-2 border-t border-[#e0e2ec] dark:border-[#2c2d30] flex items-center gap-1.5 shrink-0"
              >
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  placeholder="Ask a question about your emails..."
                  disabled={isChatThinking}
                  className="flex-1 bg-white dark:bg-[#1e1f20] border border-[#e0e2ec] dark:border-[#2c2d30] rounded-lg px-3 py-2 text-xs text-[#1f1f1f] dark:text-[#e3e3e3] placeholder-[#5f6368] dark:placeholder-[#8e918f] focus:outline-none focus:border-[#0b57d0] dark:focus:border-[#a8c7fa]"
                />
                <button
                  type="submit"
                  disabled={!chatInput.trim() || isChatThinking}
                  className="p-2 rounded-lg bg-[#0b57d0] hover:bg-[#0842a0] dark:bg-[#a8c7fa] dark:hover:bg-[#d3e3fd] disabled:opacity-50 text-white dark:text-[#001d35] font-semibold transition flex items-center justify-center shadow-xs cursor-pointer"
                >
                  <SendHorizontal className="w-4 h-4" />
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
                className="text-[11px] font-semibold text-[#0b57d0] dark:text-[#a8c7fa] hover:underline flex items-center gap-1 group transition cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
                <span>Back to Smart Buckets</span>
              </button>

              {!email && !loading && (
                <div className="bg-white dark:bg-[#1e1f20] border border-[#e0e2ec] dark:border-[#2c2d30] rounded-xl p-6 text-center space-y-2.5">
                  <div className="w-10 h-10 mx-auto rounded-lg bg-[#f0f4f9] dark:bg-[#28292c] text-[#5f6368] dark:text-[#8e918f] flex items-center justify-center">
                    <Mail className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-[#1f1f1f] dark:text-[#e3e3e3] text-xs">
                      No email opened
                    </h4>
                    <p className="text-[11px] text-[#5f6368] dark:text-[#8e918f] mt-0.5">
                      Select any email from <strong>Smart Buckets</strong> or click an email in
                      Gmail.
                    </p>
                  </div>
                </div>
              )}

              {email && (
                <div className="bg-white dark:bg-[#1e1f20] border border-[#e0e2ec] dark:border-[#2c2d30] rounded-xl p-3.5 shadow-2xs space-y-2.5">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <h2
                        className="text-xs font-bold text-[#1f1f1f] dark:text-[#e3e3e3] leading-snug"
                        title={email.subject}
                      >
                        {email.subject}
                      </h2>
                      <div className="text-[10px] text-[#5f6368] dark:text-[#8e918f] mt-1 flex items-center gap-1.5">
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
                      className="shrink-0 p-1.5 px-2 bg-[#f0f4f9] dark:bg-[#28292c] hover:bg-[#c2e7ff]/30 dark:hover:bg-[#004a77]/40 text-[#1f1f1f] dark:text-[#e3e3e3] hover:text-[#0b57d0] dark:hover:text-[#a8c7fa] border border-[#e0e2ec] dark:border-[#2c2d30] rounded-lg transition flex items-center gap-1 font-semibold text-[10px] cursor-pointer"
                    >
                      <Sparkles className="w-3 h-3 text-[#0b57d0] dark:text-[#a8c7fa]" />
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
                              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg font-bold border text-[10px] transition hover:shadow-xs cursor-pointer ${theme.chip}`}
                              title="Click to manually change or override this email label"
                            >
                              <span className={`w-1.5 h-1.5 rounded-full ${theme.dot}`} />
                              <span>{analysis.category}</span>
                              <ChevronDown className="w-3 h-3 opacity-60" />
                            </button>

                            {showRelabelMenu && (
                              <div className="absolute left-0 top-full mt-1.5 z-50 w-56 bg-white dark:bg-[#1e1f20] border border-[#e0e2ec] dark:border-[#2c2d30] rounded-xl shadow-xl p-1.5 space-y-1 animate-in fade-in duration-150">
                                <div className="px-2 py-1 text-[9px] font-extrabold uppercase tracking-wider text-[#5f6368] dark:text-[#8e918f]">
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
                                    className={`w-full text-left px-2 py-1.5 rounded-lg text-xs font-semibold flex items-center justify-between transition cursor-pointer ${
                                      analysis.category === cat
                                        ? 'bg-[#c2e7ff] text-[#001d35] dark:bg-[#004a77] dark:text-[#c2e7ff] font-bold'
                                        : 'hover:bg-[#f0f4f9] dark:hover:bg-[#28292c] text-[#1f1f1f] dark:text-[#e3e3e3]'
                                    }`}
                                  >
                                    <span>{cat}</span>
                                    {analysis.category === cat && (
                                      <Check className="w-3 h-3 text-[#0b57d0] dark:text-[#a8c7fa]" />
                                    )}
                                  </button>
                                ))}

                                {customFilters.length > 0 && (
                                  <div className="border-t border-[#f1f3f4] dark:border-[#2c2d30] pt-1 mt-1">
                                    <div className="px-2 py-0.5 text-[9px] font-extrabold uppercase tracking-wider text-purple-500">
                                      Custom Filters
                                    </div>
                                    {customFilters.map((f) => (
                                      <button
                                        key={f.id}
                                        onClick={() => handleRelabelEmail(email.id, f.name)}
                                        className={`w-full text-left px-2 py-1.5 rounded-lg text-xs font-semibold flex items-center justify-between transition cursor-pointer ${
                                          analysis.category === f.name
                                            ? 'bg-purple-50 dark:bg-purple-950/80 text-purple-700 dark:text-purple-300 font-bold'
                                            : 'hover:bg-[#f0f4f9] dark:hover:bg-[#28292c] text-[#1f1f1f] dark:text-[#e3e3e3]'
                                        }`}
                                      >
                                        <span className="truncate">{f.name}</span>
                                        {analysis.category === f.name && (
                                          <Check className="w-3 h-3 text-purple-600" />
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
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full font-bold bg-[#edf5fd] dark:bg-[#1a2d48] text-[#1a73e8] dark:text-[#a8c7fa] border border-[#d2e3fc] dark:border-[#2b4c7e] text-[10px]">
                          <BookOpen className="w-2.5 h-2.5" />
                          <span className="font-mono">{analysis.detectedCourseCode}</span>
                        </span>
                      )}

                      {analysis.urgency === 'high' && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full font-bold bg-[#fce8e6] dark:bg-[#3d1417] text-[#c5221f] dark:text-[#f29e99] border border-[#fad2cf] dark:border-[#66272c] text-[10px]">
                          <Flame className="w-2.5 h-2.5" />
                          <span>Urgent</span>
                        </span>
                      )}

                      {analysis.providerUsed && (
                        <span className="ml-auto text-[9px] text-[#5f6368] dark:text-[#8e918f] font-medium flex items-center gap-0.5">
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
                      <div className="flex items-center gap-1.5 font-bold text-[#1f1f1f] dark:text-[#e3e3e3] text-xs">
                        <Sparkles className="w-3.5 h-3.5 text-[#0b57d0] dark:text-[#a8c7fa]" />
                        <span>AI Executive Summary</span>
                      </div>
                      <button
                        onClick={handleCopySummary}
                        className="text-[10px] font-semibold text-[#5f6368] hover:text-[#1f1f1f] dark:text-[#8e918f] dark:hover:text-[#e3e3e3] flex items-center gap-1 transition cursor-pointer"
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
                          className="flex items-start gap-2 text-[#444746] dark:text-[#c4c7c5] leading-relaxed text-[11px]"
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
                      <div className="flex items-center gap-1.5 font-bold text-[#1f1f1f] dark:text-[#e3e3e3] text-xs">
                        <Clock className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                        <span>Action Items & Deadlines</span>
                      </div>
                      <span className="text-[10px] px-2 py-0.5 bg-[#eaeff8] dark:bg-[#28292c] text-[#1f1f1f] dark:text-[#c4c7c5] rounded-md font-bold">
                        {analysis.actionItems.filter((i) => !i.completed).length} pending
                      </span>
                    </div>

                    {analysis.actionItems.length === 0 ? (
                      <p className="text-[11px] text-[#5f6368] dark:text-[#8e918f] italic">
                        No direct action items found.
                      </p>
                    ) : (
                      <div className="space-y-1.5">
                        {analysis.actionItems.map((item) => (
                          <div
                            key={item.id}
                            className={`p-2.5 rounded-lg border transition ${
                              item.completed
                                ? 'bg-[#f6f8fc]/70 dark:bg-[#111318]/50 border-[#f1f3f4] dark:border-[#2c2d30] opacity-60'
                                : 'bg-white dark:bg-[#1e1f20] border-[#e0e2ec] dark:border-[#2c2d30] hover:border-[#0b57d0]/40 shadow-2xs'
                            }`}
                          >
                            <div className="flex items-start gap-2">
                              <button
                                onClick={() => toggleActionItem(item.id)}
                                className="mt-0.5 text-[#5f6368] hover:text-[#0b57d0] dark:hover:text-[#a8c7fa] transition shrink-0 cursor-pointer"
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
                                      ? 'line-through text-[#5f6368] dark:text-[#8e918f]'
                                      : 'text-[#1f1f1f] dark:text-[#e3e3e3]'
                                  }`}
                                >
                                  {item.title}
                                </p>

                                {item.deadline && (
                                  <div className="flex items-center justify-between mt-2 pt-1.5 border-t border-[#f1f3f4] dark:border-[#2c2d30]">
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
                                      className="inline-flex items-center gap-1 text-[10px] text-[#0b57d0] dark:text-[#a8c7fa] hover:underline font-bold transition"
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
                    <div className="bg-white dark:bg-[#1e1f20] border border-[#e0e2ec] dark:border-[#2c2d30] rounded-xl p-3.5 shadow-2xs space-y-2">
                      <div className="flex items-center gap-1.5 font-bold text-[#1f1f1f] dark:text-[#e3e3e3] text-xs">
                        <Video className="w-3.5 h-3.5 text-[#0b57d0] dark:text-[#a8c7fa]" />
                        <span>Event & Registration Links</span>
                      </div>
                      <div className="space-y-1.5">
                        {analysis.meetingLinks.map((link, idx) => (
                          <a
                            key={idx}
                            href={link.url}
                            target="_blank"
                            rel="noreferrer"
                            className="flex items-center justify-between p-2.5 rounded-lg bg-[#edf5fd] dark:bg-[#1a2d48] hover:bg-[#d2e3fc]/60 dark:hover:bg-[#2b4c7e]/60 border border-[#d2e3fc] dark:border-[#2b4c7e] text-[#1a73e8] dark:text-[#a8c7fa] transition group"
                          >
                            <div className="flex items-center gap-2 truncate">
                              <span className="font-bold text-[11px] truncate">
                                {link.title || 'Join Event / Register'}
                              </span>
                            </div>
                            <span className="text-[10px] font-bold text-[#0b57d0] dark:text-[#a8c7fa] group-hover:translate-x-0.5 transition-transform flex items-center gap-0.5 shrink-0">
                              Open <ChevronRight className="w-3 h-3" />
                            </span>
                          </a>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* 4. Smart Academic Quick Replies */}
                  <div className="bg-white dark:bg-[#1e1f20] border border-[#e0e2ec] dark:border-[#2c2d30] rounded-xl p-3.5 shadow-2xs space-y-2.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 font-bold text-[#1f1f1f] dark:text-[#e3e3e3] text-xs">
                        <SendHorizontal className="w-3.5 h-3.5 text-[#5f6368] dark:text-[#8e918f]" />
                        <span>Academic Quick Replies</span>
                      </div>
                      <span className="text-[10px] text-[#5f6368] dark:text-[#8e918f] font-medium">
                        1-Click Copy
                      </span>
                    </div>

                    <div className="grid grid-cols-3 gap-1.5">
                      {quickReplies.map((reply, idx) => (
                        <button
                          key={idx}
                          onClick={() => handleCopyReplyPreset(reply.text, idx)}
                          className={`p-2 rounded-lg border text-center transition font-semibold text-[10px] flex flex-col items-center justify-center gap-1 cursor-pointer ${
                            copiedReplyIndex === idx
                              ? 'bg-emerald-50 dark:bg-emerald-950/80 border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300'
                              : 'bg-[#f0f4f9] dark:bg-[#28292c] hover:bg-[#c2e7ff]/30 dark:hover:bg-[#004a77]/40 border-[#e0e2ec] dark:border-[#2c2d30] text-[#1f1f1f] dark:text-[#e3e3e3]'
                          }`}
                        >
                          {copiedReplyIndex === idx ? (
                            <>
                              <Check className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                              <span>Copied!</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3 h-3 text-[#5f6368] dark:text-[#8e918f]" />
                              <span>{reply.title}</span>
                            </>
                          )}
                        </button>
                      ))}
                    </div>

                    {analysis.suggestedReply && (
                      <div className="p-2.5 bg-[#f0f4f9] dark:bg-[#28292c] border border-[#e0e2ec] dark:border-[#2c2d30] rounded-lg text-[#444746] dark:text-[#c4c7c5] text-[11px] italic leading-relaxed">
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

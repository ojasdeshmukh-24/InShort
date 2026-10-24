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
  Layers,
  ArrowLeft,
  Search,
  Trophy,
  X,
  ScrollText,
  CalendarCheck2,
  Moon,
  Sun,
  Plus,
  Share2,
  Tag,
  ChevronDown,
  Edit3,
  Trash2,
  Bot,
  MessageSquare
} from 'lucide-react';
import {
  ExtractedEmail,
  AnalysisResult,
  CategoryType,
  InboxRowItem,
  AggregatedDeadline,
  PolishTone,
  CustomFilter,
  ChatMessage,
  ChatEmailReference,
  GroundingEmailItem
} from '../types';
import { analyzeAcademicEmail, polishAcademicDraft, askInboxCopilot } from '../services/ai';
import { createGoogleCalendarUrl } from '../services/calendar';
import { classifyInboxItem } from '../services/classifier';

// Realistic Campus Demo Emails for Hackathon Presentation
const INITIAL_DEMO_EMAILS: ExtractedEmail[] = [
  {
    id: 'email-cs201-hw3',
    subject: '[CS201] Assignment 3: Balanced Binary Search Trees & AVL Rotations Due Date',
    senderName: 'Prof. Arvind K. Sharma (Dept. of CSE)',
    senderEmail: 'asharma@cse.iitr.ac.in',
    recipient: 'cs201-students@campus.edu',
    dateStr: 'Oct 23, 2026, 4:15 PM',
    bodyText: `Dear Students,\n\nProgramming Assignment 3 on AVL Trees and Red-Black Tree balancing has been uploaded to the university portal. The submission deadline is Friday, Oct 28 at 11:59 PM.\n\nPlease ensure your code compiles with g++ -std=c++20. Late submissions will attract a 10% penalty per day. Academic integrity checks will be run through Moss.\n\nOffice hours are held on Wednesdays 4-6 PM on Zoom: https://zoom.us/j/9876543210.\n\nBest regards,\nProf. Arvind Sharma`,
    url: '',
  },
  {
    id: 'email-inter-iit-trials',
    subject: 'Open Trials & Team Selections for Annual Inter-IIT Tech Meet 2026',
    senderName: 'Institute Technical Council',
    senderEmail: 'techcouncil@campus.edu',
    recipient: 'all-students@campus.edu',
    dateStr: 'Oct 23, 2026, 2:30 PM',
    bodyText: `Greetings Campus,\n\nThe open trials and team selections for the 14th Inter-IIT Tech Meet will begin this weekend. Categories include Autonomous Robotics, Web3/DeFi, Low-Power Embedded Systems, and AI/ML.\n\nCash prizes of ₹5,00,000 for winning institute teams. Register on the campus portal before Thursday, Oct 27, 8:00 PM.\n\nPortal link: https://devfolio.co/competitions/inter-iit-2026.\n\nBring your campus identity cards for physical venue verification at the Students Activity Centre.`,
    url: '',
  },
  {
    id: 'email-sdslabs-talk',
    subject: 'SDSLabs Opening Talk: Architecting Distributed Systems & Open Source at Scale',
    senderName: 'SDSLabs Campus Community',
    senderEmail: 'contact@sdslabs.co.in',
    recipient: 'all-students@campus.edu',
    dateStr: 'Oct 22, 2026, 6:00 PM',
    bodyText: `Hey everyone!\n\nSDSLabs is hosting our annual Intro Talk & Tech Symposium this Saturday at 5:00 PM in the Multi-Activity Center (MAC Auditorium).\n\nAgenda:\n- Systems engineering in Go and Rust\n- How we handle high-concurrency campus services\n- Interactive Q&A and winter recruitment roadmap.\n\nVirtual streaming link for remote students: https://meet.google.com/abc-defg-hij.\n\nFree refreshments will be provided for attendees. See you all there!`,
    url: '',
  },
  {
    id: 'email-reschedule-ec204',
    subject: 'URGENT: Rescheduling of EC204 Signals & Systems Lecture from Friday to Monday',
    senderName: 'Academic Section (UG)',
    senderEmail: 'academics@campus.edu',
    recipient: 'ec204-students@campus.edu',
    dateStr: 'Oct 22, 2026, 11:20 AM',
    bodyText: `Dear UG-II Students,\n\nPlease note that the EC204 lecture originally scheduled for Friday, Oct 24, at 9:00 AM has been rescheduled due to the Institute Convocation preparations.\n\nThe extra lecture will now be conducted on Monday, Oct 27, from 4:00 PM to 5:00 PM in Lecture Hall Complex Room LHC-102.\n\nAttendance is mandatory for all registered students.`,
    url: '',
  },
  {
    id: 'email-phd-viva-amit',
    subject: 'Oral Defense / Viva-Voce Notice: Ph.D. Candidate Mr. Amit Kumar (CSE Dept)',
    senderName: 'Dean of Academic Affairs',
    senderEmail: 'dean_acad@campus.edu',
    recipient: 'all-faculty-scholars@campus.edu',
    dateStr: 'Oct 21, 2026, 3:45 PM',
    bodyText: `Notice for Oral Defense / Ph.D. Viva-Voce:\n\nCandidate: Mr. Amit Kumar\nEnrollment No: 21915002\nDepartment: Computer Science and Engineering\nThesis Title: "Fault-Tolerant Consensus Mechanisms in Edge Cloud Computing"\nSupervisor: Dr. R. K. Mukherjee\n\nDate: Thursday, Oct 29, 2026 at 11:00 AM\nVenue: Senate Hall / Department Seminar Room\n\nAll interested faculty members and research scholars are cordially invited to attend.`,
    url: '',
  },
];

export default function MobileApp() {
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');
  const [activeTab, setActiveTab] = useState<'inbox' | 'deadlines' | 'chat' | 'polish' | 'settings'>('inbox');
  const [emails, setEmails] = useState<ExtractedEmail[]>(INITIAL_DEMO_EMAILS);
  const [selectedCategory, setSelectedCategory] = useState<CategoryType | 'ALL'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedEmail, setSelectedEmail] = useState<ExtractedEmail | null>(null);
  const [emailAnalysis, setEmailAnalysis] = useState<AnalysisResult | null>(null);
  const [analyzingEmailId, setAnalyzingEmailId] = useState<string | null>(null);

  // Deadlines
  const [deadlines, setDeadlines] = useState<AggregatedDeadline[]>([]);

  // Inbox Copilot Chatbot State
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: 'msg-welcome',
      role: 'assistant',
      text: "Hey! I'm your **AcadMail AI Copilot**.\n\nAsk me anything about your university emails — assignments, class shifts, hackathons, or campus announcements! Or pick one of the quick prompts below.",
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

  // Custom Filters & Label Overrides State
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
  const [newFilterName, setNewFilterName] = useState('');
  const [newFilterKeywords, setNewFilterKeywords] = useState('');

  // Professor Polisher State
  const [roughNotes, setRoughNotes] = useState('');
  const [selectedTone, setSelectedTone] = useState<PolishTone>('formal');
  const [polishedEmail, setPolishedEmail] = useState('');
  const [isPolishing, setIsPolishing] = useState(false);
  const [copiedDraft, setCopiedDraft] = useState(false);

  // Settings State
  const [apiKey, setApiKey] = useState('');
  const [groqKey, setGroqKey] = useState('');
  const [savedSettingsSuccess, setSavedSettingsSuccess] = useState(false);

  // New Email & Filter Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [showAddFilterModal, setShowAddFilterModal] = useState(false);
  const [newSubject, setNewSubject] = useState('');
  const [newSender, setNewSender] = useState('');
  const [newBody, setNewBody] = useState('');

  // Sync theme
  useEffect(() => {
    const savedTheme = localStorage.getItem('acadmail_mobile_theme') as 'light' | 'dark' | null;
    if (savedTheme) {
      setTheme(savedTheme);
    } else {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      setTheme(prefersDark ? 'dark' : 'light');
    }

    const savedApi = localStorage.getItem('acadmail_api_key') || '';
    const savedGroq = localStorage.getItem('acadmail_groq_key') || '';
    setApiKey(savedApi);
    setGroqKey(savedGroq);

    const savedFilters = localStorage.getItem('acadmail_custom_filters');
    if (savedFilters) {
      try {
        const parsed = JSON.parse(savedFilters);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setCustomFilters(parsed);
        }
      } catch (e) {}
    }

    const savedOverrides = localStorage.getItem('acadmail_mobile_overrides');
    if (savedOverrides) {
      try {
        setLabelOverrides(JSON.parse(savedOverrides));
      } catch (e) {}
    }
  }, []);

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
      document.body.style.backgroundColor = '#090d16';
    } else {
      document.documentElement.classList.remove('dark');
      document.body.style.backgroundColor = '#f8fafc';
    }
    localStorage.setItem('acadmail_mobile_theme', theme);
  }, [theme]);

  // Extract Deadlines from emails
  useEffect(() => {
    const extracted: AggregatedDeadline[] = [];
    const datePattern = /\b(?:due|deadline|by|on|date:|till)\s+([A-Za-z]{3,9}\s+\d{1,2}(?:st|nd|rd|th)?(?:\s*,\s*\d{4})?|\d{1,2}\/\d{1,2}(?:\/\d{2,4})?|\d{1,2}\s+[A-Za-z]{3,9})\b/gi;

    emails.forEach((item, index) => {
      const classification = classifyInboxItem(
        item.subject,
        item.senderName,
        item.bodyText,
        customFilters,
        labelOverrides,
        item.id
      );
      const text = `${item.subject} ${item.bodyText}`;
      const matches = [...text.matchAll(datePattern)];

      if (matches.length > 0) {
        matches.forEach((m, idx) => {
          extracted.push({
            id: `dl-${item.id}-${idx}`,
            title: item.subject,
            deadline: m[1],
            sourceSubject: item.subject,
            sourceSender: item.senderName,
            category: classification.category,
            courseCode: classification.courseCode,
            completed: false,
            rowIndex: index,
          });
        });
      }
    });

    setDeadlines(extracted);
  }, [emails, customFilters, labelOverrides]);

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  // Analyze Email
  const handleInspectEmail = async (email: ExtractedEmail) => {
    setSelectedEmail(email);
    setAnalyzingEmailId(email.id);

    try {
      const analysis = await analyzeAcademicEmail(
        email,
        apiKey,
        groqKey,
        customFilters,
        labelOverrides
      );
      setEmailAnalysis(analysis);
    } catch (e) {
      console.error(e);
    } finally {
      setAnalyzingEmailId(null);
    }
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
      const groundingEmails: GroundingEmailItem[] = emails.map((item) => ({
        id: item.id,
        subject: item.subject,
        sender: `${item.senderName} <${item.senderEmail}>`,
        bodyOrSnippet: item.bodyText,
        date: item.dateStr,
      }));

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
          text: `Sorry, error answering query: ${err.message || 'Please retry.'}`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setIsChatThinking(false);
    }
  };

  const handleJumpToEmailFromReference = (ref: ChatEmailReference) => {
    const target = emails.find((e) => e.id === ref.id);
    if (target) {
      handleInspectEmail(target);
    }
  };

  const handleMobileRelabel = (email: ExtractedEmail, newCategory: string) => {
    const updated = {
      ...labelOverrides,
      [email.id]: newCategory,
      [email.subject]: newCategory,
    };
    setLabelOverrides(updated);
    localStorage.setItem('acadmail_mobile_overrides', JSON.stringify(updated));

    if (emailAnalysis) {
      setEmailAnalysis({ ...emailAnalysis, category: newCategory });
    }
    setShowRelabelMenu(false);
  };

  const handleAddMobileCustomFilter = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFilterName.trim()) return;

    const keywords = newFilterKeywords
      .split(',')
      .map((k) => k.trim().toLowerCase())
      .filter(Boolean);

    const filter: CustomFilter = {
      id: `filter-${Date.now()}`,
      name: newFilterName.trim(),
      color: '#8b5cf6',
      keywords: keywords.length > 0 ? keywords : [newFilterName.trim().toLowerCase()],
    };

    const updated = [...customFilters, filter];
    setCustomFilters(updated);
    localStorage.setItem('acadmail_custom_filters', JSON.stringify(updated));

    setNewFilterName('');
    setNewFilterKeywords('');
    setShowAddFilterModal(false);
  };

  const handleDeleteMobileCustomFilter = (filterId: string) => {
    const updated = customFilters.filter((f) => f.id !== filterId);
    setCustomFilters(updated);
    localStorage.setItem('acadmail_custom_filters', JSON.stringify(updated));
  };

  // Polish Professor Draft
  const handlePolishDraft = async () => {
    if (!roughNotes.trim()) return;
    setIsPolishing(true);
    try {
      const polished = await polishAcademicDraft(roughNotes, selectedTone, apiKey, groqKey);
      setPolishedEmail(polished);
    } catch (e) {
      console.error(e);
    } finally {
      setIsPolishing(false);
    }
  };

  // Open Native Mobile Email Client (Gmail, Apple Mail)
  const openNativeEmailApp = (bodyContent: string, subjectLine = 'Regarding Course Inquiry') => {
    const mailtoUrl = `mailto:professor@university.edu?subject=${encodeURIComponent(
      subjectLine
    )}&body=${encodeURIComponent(bodyContent)}`;
    window.location.href = mailtoUrl;
  };

  // Add custom email
  const handleAddEmail = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubject.trim()) return;

    const email: ExtractedEmail = {
      id: `custom-${Date.now()}`,
      subject: newSubject.trim(),
      senderName: newSender.trim() || 'Campus Notice',
      senderEmail: 'notice@campus.edu',
      recipient: 'student@campus.edu',
      dateStr: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      bodyText: newBody.trim() || newSubject.trim(),
      url: '',
    };

    setEmails([email, ...emails]);
    setNewSubject('');
    setNewSender('');
    setNewBody('');
    setShowAddModal(false);
  };

  // Category Theme Helper
  const getCategoryStyles = (category: CategoryType) => {
    switch (category) {
      case 'Academics':
        return {
          chip: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-900/50',
          dot: 'bg-blue-500',
          badge: 'Academics',
        };
      case 'Competitions & Tournaments':
        return {
          chip: 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-900/50',
          dot: 'bg-amber-500',
          badge: 'Competitions',
        };
      case 'Workshops':
        return {
          chip: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900/50',
          dot: 'bg-emerald-500',
          badge: 'Workshop',
        };
      case 'Class Rescheduling':
        return {
          chip: 'bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-900/50',
          dot: 'bg-rose-500',
          badge: 'Rescheduled',
        };
      case 'General':
        return {
          chip: 'bg-slate-500/10 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800',
          dot: 'bg-slate-500',
          badge: 'General',
        };
      default:
        if (category.toLowerCase().includes('placement') || category.toLowerCase().includes('intern')) {
          return {
            chip: 'bg-purple-500/10 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-900/50',
            dot: 'bg-purple-500',
            badge: category,
          };
        }
        if (category.toLowerCase().includes('hostel') || category.toLowerCase().includes('mess')) {
          return {
            chip: 'bg-cyan-500/10 text-cyan-700 dark:text-cyan-300 border-cyan-200 dark:border-cyan-900/50',
            dot: 'bg-cyan-500',
            badge: category,
          };
        }
        return {
          chip: 'bg-violet-500/10 text-violet-700 dark:text-violet-300 border-violet-200 dark:border-violet-900/50',
          dot: 'bg-violet-500',
          badge: category,
        };
    }
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

    // Has explicit time
    if (/\b(?:am|pm)\b/i.test(lower)) {
      return {
        chip: 'bg-[#edf2fa] dark:bg-[#1a2e40] text-[#044377] dark:text-[#b4d6ff] border-[#d3e3fd] dark:border-[#22476d]',
        icon: 'text-[#044377] dark:text-[#b4d6ff]',
        isTime: true,
      };
    }

    // Standard upcoming calendar date
    return {
      chip: 'bg-[#f1f3f4] dark:bg-[#282a2d] text-[#1f1f1f] dark:text-[#e3e3e3] border-[#dadce0] dark:border-[#3c4043]',
      icon: 'text-[#5f6368] dark:text-[#8e918f]',
      isTime: false,
    };
  };

  // Filter Emails
  const filteredEmails = emails.filter((item) => {
    const classification = classifyInboxItem(
      item.subject,
      item.senderName,
      item.bodyText,
      customFilters,
      labelOverrides,
      item.id
    );
    const matchesCat = selectedCategory === 'ALL' || classification.category === selectedCategory;
    const matchesSearch =
      !searchQuery.trim() ||
      item.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.senderName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.bodyText.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (classification.courseCode &&
        classification.courseCode.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCat && matchesSearch;
  });

  return (
    <div className={theme === 'dark' ? 'dark' : ''}>
      <div className="flex flex-col min-h-screen bg-[#f8fafc] dark:bg-[#090d16] text-slate-900 dark:text-slate-100 font-sans pb-20 select-none">
        {/* Mobile App Header */}
        <header className="sticky top-0 z-40 bg-white/95 dark:bg-[#0e1526]/95 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800/80 px-4 py-2.5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img
              src="/icons/envelope-logo.png"
              alt="AcadMail"
              className="w-6 h-6 rounded-md object-contain shadow-2xs shrink-0"
            />
            <div className="flex items-baseline gap-1.5">
              <span className="font-batangas text-[14px] font-bold tracking-wide text-slate-900 dark:text-white">
                AcadMail
              </span>
              <span className="font-mono text-[9px] font-medium px-1.5 py-0.2 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200/60 dark:border-slate-700/60">
                Mobile
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={toggleTheme}
              className="p-2 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white rounded-lg transition"
            >
              {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
            </button>
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-1 px-2.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Test Email</span>
            </button>
          </div>
        </header>

        {/* ========================================================================= */}
        {/* VIEW 1: SMART BUCKETS INBOX */}
        {/* ========================================================================= */}
        {activeTab === 'inbox' && (
          <main className="p-4 space-y-3.5">
            {/* Search Bar */}
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search coursework, profs, hackathons..."
                className="w-full pl-9 pr-8 py-2 text-xs bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 shadow-2xs"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Horizontal Scrolling Filter Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-[13px]">
              <button
                onClick={() => setSelectedCategory('ALL')}
                className={`px-3.5 py-1.5 rounded-full font-semibold whitespace-nowrap transition border ${
                  selectedCategory === 'ALL'
                    ? 'bg-blue-600 text-white border-transparent shadow-xs'
                    : 'bg-white dark:bg-[#111827] border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300'
                }`}
              >
                All ({emails.length})
              </button>

              <button
                onClick={() => setSelectedCategory('Academics')}
                className={`px-3.5 py-1.5 rounded-full font-semibold whitespace-nowrap transition border ${
                  selectedCategory === 'Academics'
                    ? 'bg-blue-600 text-white border-transparent shadow-xs'
                    : 'bg-white dark:bg-[#111827] border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300'
                }`}
              >
                <span>Academics</span>
              </button>

              <button
                onClick={() => setSelectedCategory('Competitions & Tournaments')}
                className={`px-3.5 py-1.5 rounded-full font-semibold whitespace-nowrap transition border ${
                  selectedCategory === 'Competitions & Tournaments'
                    ? 'bg-blue-600 text-white border-transparent shadow-xs'
                    : 'bg-white dark:bg-[#111827] border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300'
                }`}
              >
                <span>Competitions</span>
              </button>

              <button
                onClick={() => setSelectedCategory('Workshops')}
                className={`px-3.5 py-1.5 rounded-full font-semibold whitespace-nowrap transition border ${
                  selectedCategory === 'Workshops'
                    ? 'bg-blue-600 text-white border-transparent shadow-xs'
                    : 'bg-white dark:bg-[#111827] border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300'
                }`}
              >
                <span>Workshops</span>
              </button>

              <button
                onClick={() => setSelectedCategory('Class Rescheduling')}
                className={`px-3.5 py-1.5 rounded-full font-semibold whitespace-nowrap transition border ${
                  selectedCategory === 'Class Rescheduling'
                    ? 'bg-blue-600 text-white border-transparent shadow-xs'
                    : 'bg-white dark:bg-[#111827] border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300'
                }`}
              >
                <span>Rescheduled</span>
              </button>

              <button
                onClick={() => setSelectedCategory('General')}
                className={`px-3.5 py-1.5 rounded-full font-semibold whitespace-nowrap transition border ${
                  selectedCategory === 'General'
                    ? 'bg-blue-600 text-white border-transparent shadow-xs'
                    : 'bg-white dark:bg-[#111827] border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300'
                }`}
              >
                <span>PhD & General</span>
              </button>

              {/* Dynamic User Custom Filter Pills */}
              {customFilters.map((f) => {
                const isSelected = selectedCategory === f.name;

                return (
                  <button
                    key={f.id}
                    onClick={() => setSelectedCategory(f.name)}
                    className={`px-3.5 py-1.5 rounded-full font-semibold whitespace-nowrap transition border ${
                      isSelected
                        ? 'bg-blue-600 text-white border-transparent shadow-xs'
                        : 'bg-white dark:bg-[#111827] border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <span>{f.name}</span>
                  </button>
                );
              })}

              {/* + Add Filter Pill */}
              <button
                onClick={() => setShowAddFilterModal(true)}
                className="px-3 py-1.5 rounded-full font-semibold whitespace-nowrap transition border border-dashed border-purple-300 dark:border-purple-800 text-purple-600 dark:text-purple-400 bg-purple-50/50 dark:bg-purple-950/30 hover:bg-purple-100 shrink-0"
              >
                <span>+ Filter</span>
              </button>
            </div>

            {/* Email Cards List */}
            <div className="space-y-2.5">
              {filteredEmails.length === 0 ? (
                <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-2xl p-8 text-center space-y-2">
                  <Mail className="w-8 h-8 text-slate-300 dark:text-slate-600 mx-auto" />
                  <p className="font-semibold text-xs text-slate-600 dark:text-slate-400">
                    No emails match your filter
                  </p>
                </div>
              ) : (
                filteredEmails.map((email) => {
                  const classification = classifyInboxItem(
                    email.subject,
                    email.senderName,
                    email.bodyText,
                    customFilters,
                    labelOverrides,
                    email.id
                  );
                  const styles = getCategoryStyles(classification.category);

                  return (
                    <div
                      key={email.id}
                      onClick={() => handleInspectEmail(email)}
                      className="p-3.5 bg-white dark:bg-[#111827] border border-slate-200/90 dark:border-slate-800/80 rounded-2xl hover:border-blue-400 dark:hover:border-blue-600 transition shadow-2xs space-y-2 cursor-pointer active:scale-[0.99]"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-bold text-xs text-slate-900 dark:text-slate-100 truncate">
                          {email.senderName}
                        </span>
                        <span className="text-[10px] text-slate-400 shrink-0">
                          {email.dateStr}
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-semibold border ${styles.chip}`}
                        >
                          <span className={`w-1 h-1 rounded-full ${styles.dot}`} />
                          <span>{styles.badge}</span>
                        </span>

                        {classification.courseCode && (
                          <span className="px-1.5 py-0.5 rounded-md font-mono font-bold text-[9px] bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-900">
                            {classification.courseCode}
                          </span>
                        )}
                      </div>

                      <h3 className="font-bold text-xs text-slate-800 dark:text-slate-200 leading-snug line-clamp-2">
                        {email.subject}
                      </h3>

                      <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                        {email.bodyText}
                      </p>

                      <div className="pt-1 flex items-center justify-between text-[10px] font-semibold text-blue-600 dark:text-blue-400">
                        <span className="flex items-center gap-1">
                          <Sparkles className="w-3 h-3" />
                          <span>Tap for AI Brief & Quick Reply</span>
                        </span>
                        <ChevronRight className="w-3 h-3" />
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </main>
        )}

        {/* ========================================================================= */}
        {/* VIEW 2: MASTER DEADLINES TIMELINE */}
        {/* ========================================================================= */}
        {activeTab === 'deadlines' && (
          <main className="p-4 space-y-3.5">
            {/* Clean Deadlines Header */}
            <div className="bg-white dark:bg-[#111827] border border-slate-200/80 dark:border-slate-800 rounded-xl p-3.5 shadow-2xs space-y-1">
              <div className="flex items-center justify-between">
                <span className="font-mono text-[9px] font-semibold uppercase tracking-wider text-slate-400">
                  Deadlines & Schedule
                </span>
                <span className="font-mono text-[9px] font-medium px-2 py-0.5 rounded bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-900/60">
                  {deadlines.filter((d) => !d.completed).length} pending
                </span>
              </div>
              <h2 className="text-sm font-semibold text-slate-900 dark:text-white tracking-tight">Active Academic Deadlines</h2>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                Extracted from professor emails with 1-tap Google Calendar sync.
              </p>
            </div>

            <div className="space-y-2.5">
              {deadlines.length === 0 ? (
                <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-2xl p-8 text-center space-y-2">
                  <CalendarCheck2 className="w-8 h-8 text-slate-300 dark:text-slate-600 mx-auto" />
                  <p className="font-semibold text-xs text-slate-600 dark:text-slate-400">
                    No active deadlines detected
                  </p>
                </div>
              ) : (
                deadlines.map((dl) => {
                  const styles = getCategoryStyles(dl.category);

                  return (
                    <div
                      key={dl.id}
                      className={`p-3.5 bg-white dark:bg-[#111827] border rounded-2xl transition space-y-2.5 shadow-2xs ${
                        dl.completed
                          ? 'border-emerald-200 dark:border-emerald-900/40 bg-emerald-50/20'
                          : 'border-slate-200 dark:border-slate-800'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => {
                              setDeadlines(
                                deadlines.map((d) =>
                                  d.id === dl.id ? { ...d, completed: !d.completed } : d
                                )
                              );
                            }}
                            className="shrink-0 text-slate-400 hover:text-emerald-600"
                          >
                            {dl.completed ? (
                              <CheckCircle2 className="w-4 h-4 text-emerald-500 fill-emerald-50" />
                            ) : (
                              <Circle className="w-4 h-4" />
                            )}
                          </button>
                          <div>
                            <span
                              className={`font-bold text-xs leading-snug line-clamp-2 ${
                                dl.completed ? 'line-through text-slate-400' : 'text-slate-900 dark:text-white'
                              }`}
                            >
                              {dl.title}
                            </span>
                            <span className="text-[10px] text-slate-400 block mt-0.5">
                              From: {dl.sourceSender}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-1 border-t border-slate-100 dark:border-slate-800/80">
                        <div className="flex items-center gap-1.5">
                          {(() => {
                            const badge = getDeadlineBadgeStyle(dl.deadline);
                            return (
                              <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md border text-[10px] font-semibold ${badge.chip}`}>
                                {badge.isTime ? (
                                  <Clock className={`w-3 h-3 ${badge.icon}`} />
                                ) : (
                                  <Calendar className={`w-3 h-3 ${badge.icon}`} />
                                )}
                                <span>{dl.deadline}</span>
                              </span>
                            );
                          })()}

                          <span
                            className={`px-2 py-0.5 rounded-full text-[9px] font-semibold border ${styles.chip}`}
                          >
                            {styles.badge}
                          </span>
                        </div>

                        <a
                          href={createGoogleCalendarUrl(
                            dl.title,
                            `Source: ${dl.sourceSubject} from ${dl.sourceSender}`,
                            dl.deadline
                          )}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 px-2.5 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-[10px] font-bold shadow-2xs transition"
                        >
                          <Calendar className="w-3 h-3" />
                          <span>+ Calendar</span>
                        </a>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </main>
        )}

        {/* ========================================================================= */}
        {/* VIEW 3: INBOX COPILOT / CHATBOT */}
        {/* ========================================================================= */}
        {activeTab === 'chat' && (
          <main className="p-4 flex flex-col h-[calc(100vh-130px)]">
            {/* Header info */}
            <div className="bg-white dark:bg-[#111827] border border-slate-200/80 dark:border-slate-800 rounded-xl p-3.5 shadow-2xs space-y-1 shrink-0 mb-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                  <span className="text-[12px] font-semibold text-slate-900 dark:text-white tracking-tight">
                    Inbox Copilot
                  </span>
                  <span className="font-mono text-[9px] text-slate-400">
                    • {emails.length} emails
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => setCopilotMode(prev => prev === 'instant' ? 'cloud' : 'instant')}
                    className={`font-mono text-[9px] font-medium px-2 py-0.5 rounded border transition cursor-pointer ${
                      copilotMode === 'instant'
                        ? 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                        : 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-900'
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
                    className="text-[10px] text-slate-400 hover:text-slate-600 px-1.5 py-0.5 rounded transition"
                  >
                    Clear
                  </button>
                </div>
              </div>
            </div>

            {/* Quick Prompt Queries */}
            <div className="mb-2.5 shrink-0 space-y-1">
              <div className="flex items-center justify-between px-0.5">
                <span className="font-mono text-[9px] uppercase tracking-wider text-slate-400 font-semibold">
                  Quick Queries
                </span>
                <span className="font-mono text-[9px] text-slate-400">1-tap</span>
              </div>
              <div className="grid grid-cols-2 gap-1.5">
                {QUICK_PROMPTS.map((qp) => {
                  const Icon = qp.icon;
                  return (
                    <button
                      key={qp.id}
                      onClick={() => handleSendChatMessage(qp.prompt, true)}
                      disabled={isChatThinking}
                      className="p-2 rounded-xl text-left border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-[#111827] hover:border-slate-400 dark:hover:border-slate-600 transition flex items-center justify-between gap-1.5 group cursor-pointer shadow-2xs"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <div className="w-5 h-5 rounded-md bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 flex items-center justify-center shrink-0 group-hover:bg-slate-900 group-hover:text-white dark:group-hover:bg-white dark:group-hover:text-slate-900 transition-colors">
                          <Icon className="w-3 h-3" />
                        </div>
                        <div className="min-w-0">
                          <div className="text-[11px] font-medium text-slate-800 dark:text-slate-200 truncate">
                            {qp.label}
                          </div>
                          <div className="font-mono text-[8px] text-slate-400 truncate">
                            "{qp.prompt.slice(0, 24)}..."
                          </div>
                        </div>
                      </div>
                      <ChevronRight className="w-3 h-3 text-slate-300 dark:text-slate-600 group-hover:text-slate-600 dark:group-hover:text-slate-300 group-hover:translate-x-0.5 transition shrink-0" />
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Messages List */}
            <div className="flex-1 overflow-y-auto space-y-2.5 pr-1 pb-2 scrollbar-thin">
              {chatMessages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex flex-col ${
                    msg.role === 'user' ? 'items-end' : 'items-start'
                  }`}
                >
                  <div
                    className={`max-w-[90%] rounded-xl px-3 py-2 text-xs shadow-2xs ${
                      msg.role === 'user'
                        ? 'bg-slate-900 dark:bg-blue-600 text-white rounded-br-xs font-medium'
                        : 'bg-white dark:bg-[#111827] text-slate-800 dark:text-slate-100 border border-slate-200/80 dark:border-slate-800/80 rounded-bl-xs'
                    }`}
                  >
                    <div className="whitespace-pre-line leading-relaxed space-y-1 text-xs">
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
                            <div key={i} className="font-bold text-slate-900 dark:text-white pt-1">
                              {line.replace(/^#+\s*/, '')}
                            </div>
                          );
                        }
                        if (line.startsWith('• ') || line.startsWith('- ')) {
                          return (
                            <div key={i} className="pl-1 text-slate-700 dark:text-slate-300">
                              {line}
                            </div>
                          );
                        }
                        return <div key={i}>{line}</div>;
                      })}
                    </div>

                    {/* Referencing Emails Card */}
                    {msg.references && msg.references.length > 0 && (
                      <div className="mt-2 pt-1.5 border-t border-slate-200/60 dark:border-slate-800/80 space-y-1">
                        <span className="text-[9px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
                          Referenced Emails:
                        </span>
                        <div className="space-y-1">
                          {msg.references.map((ref) => (
                            <button
                              key={ref.id}
                              onClick={() => handleJumpToEmailFromReference(ref)}
                              className="w-full text-left p-1.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 hover:bg-blue-50 dark:hover:bg-blue-950/40 border border-slate-200/60 dark:border-slate-800 transition flex items-center justify-between gap-1.5 group cursor-pointer"
                            >
                              <div className="min-w-0 flex-1">
                                <div className="text-[10px] font-bold text-slate-800 dark:text-slate-200 truncate group-hover:text-blue-600 dark:group-hover:text-blue-400">
                                  {ref.subject}
                                </div>
                                <div className="text-[9px] text-slate-500 dark:text-slate-400 truncate">
                                  {ref.sender} • {ref.date}
                                </div>
                              </div>
                              <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 shrink-0" />
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                  <span className="text-[8px] text-slate-400 mt-0.5 px-1">
                    {msg.timestamp}
                  </span>
                </div>
              ))}

              {isChatThinking && (
                <div className="flex items-center gap-2 p-2.5 bg-white dark:bg-[#111827] rounded-2xl border border-slate-200 dark:border-slate-800 w-fit">
                  <div className="w-2 h-2 rounded-full bg-blue-600 animate-ping"></div>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 italic">
                    Reasoning over campus emails...
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
              className="pt-2 border-t border-slate-200/60 dark:border-slate-800/80 flex items-center gap-1.5 shrink-0"
            >
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder="Ask about assignments, talks, classes..."
                disabled={isChatThinking}
                className="flex-1 bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
              />
              <button
                type="submit"
                disabled={!chatInput.trim() || isChatThinking}
                className="p-2 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold transition flex items-center justify-center shadow-xs cursor-pointer"
              >
                <SendHorizontal className="w-4 h-4" />
              </button>
            </form>
          </main>
        )}

        {/* ========================================================================= */}
        {/* VIEW 4: POLISH FOR PROFESSOR MOBILE COMPOSER */}
        {/* ========================================================================= */}
        {activeTab === 'polish' && (
          <main className="p-4 space-y-3.5">
            {/* Professional Tone Header */}
            <div className="bg-white dark:bg-[#111827] border border-slate-200/80 dark:border-slate-800 rounded-xl p-3.5 shadow-2xs space-y-1">
              <div className="flex items-center gap-1.5">
                <span className="font-mono text-[9px] font-semibold uppercase tracking-wider text-slate-400">
                  Email Studio
                </span>
                <span className="text-slate-300 dark:text-slate-700">•</span>
                <span className="text-[10px] text-blue-600 dark:text-blue-400 font-medium">Academic Formality</span>
              </div>
              <h2 className="text-sm font-semibold text-slate-900 dark:text-white tracking-tight">Professor Tone Polisher</h2>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                Transforms informal rough thoughts into respectful university correspondence.
              </p>
            </div>

            {/* Input Box */}
            <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-xl p-3.5 space-y-2.5 shadow-2xs">
              <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block">
                Type your rough notes:
              </label>
              <textarea
                rows={3}
                value={roughNotes}
                onChange={(e) => setRoughNotes(e.target.value)}
                placeholder="e.g. sick with high fever cannot attend lab 3 today need extension till monday..."
                className="w-full p-2.5 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-900 dark:text-slate-100"
              />

              {/* Tone Selection Pills */}
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Select Academic Tone
                </span>
                <div className="grid grid-cols-2 gap-1.5 text-[10px]">
                  <button
                    onClick={() => setSelectedTone('formal')}
                    className={`p-2 rounded-xl border text-left font-semibold transition ${
                      selectedTone === 'formal'
                        ? 'bg-blue-600 text-white border-transparent'
                        : 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    Respectful & Formal
                  </button>

                  <button
                    onClick={() => setSelectedTone('extension')}
                    className={`p-2 rounded-xl border text-left font-semibold transition ${
                      selectedTone === 'extension'
                        ? 'bg-blue-600 text-white border-transparent'
                        : 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    Request Extension
                  </button>

                  <button
                    onClick={() => setSelectedTone('doubt')}
                    className={`p-2 rounded-xl border text-left font-semibold transition ${
                      selectedTone === 'doubt'
                        ? 'bg-blue-600 text-white border-transparent'
                        : 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    Clarify Doubt
                  </button>

                  <button
                    onClick={() => setSelectedTone('lor')}
                    className={`p-2 rounded-xl border text-left font-semibold transition ${
                      selectedTone === 'lor'
                        ? 'bg-blue-600 text-white border-transparent'
                        : 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    LoR Request
                  </button>
                </div>
              </div>

              <button
                onClick={handlePolishDraft}
                disabled={isPolishing || !roughNotes.trim()}
                className="w-full py-2.5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-100 font-semibold rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-xs transition disabled:opacity-50 cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>{isPolishing ? 'Polishing Academic Tone...' : 'Generate Polished Email'}</span>
              </button>
            </div>

            {/* Output Card */}
            {polishedEmail && (
              <div className="bg-white dark:bg-[#111827] border border-blue-200 dark:border-blue-900/50 rounded-2xl p-3.5 space-y-2.5 shadow-xs animate-in fade-in">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-blue-600 dark:text-blue-400 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Polished Academic Draft</span>
                  </span>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(polishedEmail);
                      setCopiedDraft(true);
                      setTimeout(() => setCopiedDraft(false), 2000);
                    }}
                    className="text-[10px] font-semibold text-slate-500 hover:text-slate-900 dark:hover:text-white flex items-center gap-1"
                  >
                    {copiedDraft ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedDraft ? 'Copied!' : 'Copy'}</span>
                  </button>
                </div>

                <div className="p-3 bg-slate-50 dark:bg-slate-900/80 rounded-xl font-mono text-[11px] text-slate-800 dark:text-slate-200 whitespace-pre-wrap leading-relaxed border border-slate-200 dark:border-slate-800">
                  {polishedEmail}
                </div>

                <button
                  onClick={() => openNativeEmailApp(polishedEmail)}
                  className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-2xs transition"
                >
                  <SendHorizontal className="w-3.5 h-3.5" />
                  <span>Open & Send via Phone Gmail App</span>
                </button>
              </div>
            )}
          </main>
        )}

        {/* ========================================================================= */}
        {/* VIEW 4: SETTINGS & API CONFIGURATION */}
        {/* ========================================================================= */}
        {activeTab === 'settings' && (
          <main className="p-4 space-y-3.5">
            <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-2xl p-4 space-y-3 shadow-2xs">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-blue-50 dark:bg-blue-950/60 flex items-center justify-center text-blue-600 dark:text-blue-400">
                  <Key className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-xs text-slate-900 dark:text-white">AI Configuration</h3>
                  <p className="text-[10px] text-slate-400">Google Gemini & Groq Resilient Engine</p>
                </div>
              </div>

              <div className="space-y-2">
                <div>
                  <label className="text-[11px] font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Google Gemini API Key
                  </label>
                  <input
                    type="password"
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    placeholder="Paste Gemini API Key..."
                    className="w-full px-2.5 py-1.5 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-1 focus:ring-blue-500 font-mono text-slate-900 dark:text-slate-100"
                  />
                  <a
                    href="https://aistudio.google.com/"
                    target="_blank"
                    rel="noreferrer"
                    className="text-[10px] text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-0.5 mt-1"
                  >
                    Get free Gemini key <ExternalLink className="w-2.5 h-2.5" />
                  </a>
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Groq API Key (Optional Zero-Downtime Backup)
                  </label>
                  <input
                    type="password"
                    value={groqKey}
                    onChange={(e) => setGroqKey(e.target.value)}
                    placeholder="gsk_..."
                    className="w-full px-2.5 py-1.5 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-1 focus:ring-blue-500 font-mono text-slate-900 dark:text-slate-100"
                  />
                </div>

                <button
                  onClick={() => {
                    localStorage.setItem('acadmail_api_key', apiKey.trim());
                    localStorage.setItem('acadmail_groq_key', groqKey.trim());
                    setSavedSettingsSuccess(true);
                    setTimeout(() => setSavedSettingsSuccess(false), 2000);
                  }}
                  className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs transition shadow-xs mt-2"
                >
                  {savedSettingsSuccess ? 'Saved Successfully!' : 'Save Configuration'}
                </button>
              </div>
            </div>

            {/* Custom Academic Filters Card */}
            <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-2xl p-4 space-y-3 shadow-2xs">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-purple-50 dark:bg-purple-950/60 flex items-center justify-center text-purple-600 dark:text-purple-400">
                    <Tag className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-bold text-xs text-slate-900 dark:text-white">Custom Filters</h3>
                    <p className="text-[10px] text-slate-400">Personalized category buckets</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowAddFilterModal(true)}
                  className="px-2.5 py-1 bg-purple-600 text-white rounded-lg text-[10px] font-bold flex items-center gap-1 shadow-xs"
                >
                  <Plus className="w-3 h-3" />
                  <span>New</span>
                </button>
              </div>

              <div className="space-y-1.5">
                {customFilters.map((f) => (
                  <div
                    key={f.id}
                    className="flex items-center justify-between p-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800"
                  >
                    <div className="min-w-0 flex-1 pr-2">
                      <div className="font-bold text-[11px] text-slate-800 dark:text-slate-200 flex items-center gap-1.5 truncate">
                        <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: f.color || '#8b5cf6' }} />
                        <span className="truncate">{f.name}</span>
                      </div>
                      <div className="text-[9px] text-slate-400 truncate mt-0.5">
                        {f.keywords.join(', ')}
                      </div>
                    </div>
                    <button
                      onClick={() => handleDeleteMobileCustomFilter(f.id)}
                      className="p-1 text-slate-400 hover:text-rose-600 rounded-lg transition shrink-0"
                      title="Delete filter"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-2xl p-4 space-y-2 text-xs">
              <span className="font-bold text-slate-900 dark:text-white block">
                Hackathon Presentation Info
              </span>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                AcadMail AI combines a Chrome Extension for desktop Gmail with a native mobile companion for smartphones. Built for university students to eliminate deadline anxiety and automate academic email etiquette.
              </p>
            </div>
          </main>
        )}

        {/* ========================================================================= */}
        {/* EMAIL DETAIL BOTTOM SHEET MODAL */}
        {/* ========================================================================= */}
        {selectedEmail && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex flex-col justify-end">
            <div className="bg-white dark:bg-[#0f172a] rounded-t-3xl max-h-[88vh] flex flex-col shadow-2xl animate-in slide-in-from-bottom duration-250">
              {/* Modal Handle & Header */}
              <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
                  <span className="font-extrabold text-xs text-slate-900 dark:text-white">
                    Email AI Inspector
                  </span>
                </div>
                <button
                  onClick={() => {
                    setSelectedEmail(null);
                    setEmailAnalysis(null);
                  }}
                  className="p-1.5 rounded-full text-slate-400 hover:text-slate-700 dark:hover:text-white bg-slate-100 dark:bg-slate-800"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-4 overflow-y-auto space-y-3.5 text-xs">
                <div>
                  <h2 className="font-extrabold text-sm text-slate-900 dark:text-white leading-snug">
                    {selectedEmail.subject}
                  </h2>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 flex items-center justify-between">
                    <span>From: {selectedEmail.senderName}</span>
                    <span>{selectedEmail.dateStr}</span>
                  </div>
                </div>

                {/* Email Category Badge & Manual Relabeling */}
                {(() => {
                  const classification = classifyInboxItem(
                    selectedEmail.subject,
                    selectedEmail.senderName,
                    selectedEmail.bodyText,
                    customFilters,
                    labelOverrides,
                    selectedEmail.id
                  );
                  const currentCategory = emailAnalysis?.category || classification.category;
                  const styles = getCategoryStyles(currentCategory);

                  return (
                    <div className="space-y-1.5 pt-0.5">
                      <div className="flex items-center justify-between">
                        <button
                          onClick={() => setShowRelabelMenu(!showRelabelMenu)}
                          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border transition ${styles.chip}`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${styles.dot}`} />
                          <span>{styles.badge}</span>
                          <ChevronDown className="w-3.5 h-3.5 opacity-60" />
                        </button>

                        <button
                          onClick={() => setShowRelabelMenu(!showRelabelMenu)}
                          className="text-[11px] font-semibold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
                        >
                          <Edit3 className="w-3 h-3" />
                          <span>Change Label</span>
                        </button>
                      </div>

                      {showRelabelMenu && (
                        <div className="p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl space-y-2 animate-in fade-in duration-150">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                            Re-classify This Email To:
                          </span>
                          <div className="grid grid-cols-2 gap-1.5 text-[11px]">
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
                                onClick={() => handleMobileRelabel(selectedEmail, cat)}
                                className={`px-2 py-1.5 rounded-xl text-left font-semibold truncate transition flex items-center justify-between ${
                                  currentCategory === cat
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-white dark:bg-[#111827] text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800'
                                }`}
                              >
                                <span className="truncate">{cat}</span>
                                {currentCategory === cat && <Check className="w-3 h-3 shrink-0 ml-1" />}
                              </button>
                            ))}
                          </div>

                          {customFilters.length > 0 && (
                            <div className="pt-1.5 border-t border-slate-200 dark:border-slate-800 space-y-1">
                              <span className="text-[10px] font-bold text-purple-500 uppercase tracking-wider block">
                                Custom Filters:
                              </span>
                              <div className="grid grid-cols-2 gap-1.5 text-[11px]">
                                {customFilters.map((f) => (
                                  <button
                                    key={f.id}
                                    onClick={() => handleMobileRelabel(selectedEmail, f.name)}
                                    className={`px-2 py-1.5 rounded-xl text-left font-semibold truncate transition flex items-center justify-between ${
                                      currentCategory === f.name
                                        ? 'bg-purple-600 text-white'
                                        : 'bg-white dark:bg-[#111827] text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800'
                                    }`}
                                  >
                                    <span className="truncate">{f.name}</span>
                                    {currentCategory === f.name && (
                                      <Check className="w-3 h-3 shrink-0 ml-1" />
                                    )}
                                  </button>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })()}

                {/* AI Executive Summary Card */}
                <div className="bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-xl p-3.5 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1 font-mono">
                      <Sparkles className="w-3.5 h-3.5 text-blue-500" />
                      <span>Executive Summary</span>
                    </span>
                    {analyzingEmailId && (
                      <span className="text-[9px] font-bold text-blue-600 animate-pulse">
                        Analyzing...
                      </span>
                    )}
                  </div>

                  <ul className="space-y-1.5 text-[11px] text-slate-700 dark:text-slate-300 leading-relaxed list-disc list-inside">
                    {emailAnalysis?.summary.map((point, i) => (
                      <li key={i}>{point}</li>
                    )) || (
                      <>
                        <li>Notification regarding {selectedEmail.subject}.</li>
                        <li>Extracted key details for academic review.</li>
                      </>
                    )}
                  </ul>
                </div>

                {/* Detected Action Items / Deadlines */}
                {emailAnalysis?.actionItems && emailAnalysis.actionItems.length > 0 && (
                  <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-2xl p-3.5 space-y-2">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                      Detected Action Items
                    </span>
                    <div className="space-y-1.5">
                      {emailAnalysis.actionItems.map((act) => (
                        <div
                          key={act.id}
                          className="flex items-center justify-between gap-2 p-2 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800"
                        >
                          <div className="flex items-center gap-2">
                            <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                            <span className="text-[11px] font-medium text-slate-800 dark:text-slate-200">
                              {act.title}
                            </span>
                          </div>
                          {act.deadline && (
                            <span className="text-[10px] font-bold text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/60 px-2 py-0.5 rounded-md shrink-0 flex items-center gap-1">
                              <Clock className="w-3 h-3 text-amber-500" />
                              <span>{act.deadline}</span>
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Detected Meeting Links */}
                {emailAnalysis?.meetingLinks && emailAnalysis.meetingLinks.length > 0 && (
                  <div className="space-y-1.5">
                    {emailAnalysis.meetingLinks.map((m, idx) => (
                      <a
                        key={idx}
                        href={m.url}
                        target="_blank"
                        rel="noreferrer"
                        className="w-full py-2 px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-2xs transition"
                      >
                        <Video className="w-3.5 h-3.5" />
                        <span>Join Meeting: {m.title}</span>
                      </a>
                    ))}
                  </div>
                )}

                {/* 1-Click Quick Reply Actions */}
                <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-2">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    1-Click Reply Drafts
                  </span>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => {
                        const reply = `Dear ${selectedEmail.senderName},\n\nThank you for the update regarding "${selectedEmail.subject}". I confirm my participation.\n\nBest regards,\n[Your Name]`;
                        openNativeEmailApp(reply, `Re: ${selectedEmail.subject}`);
                      }}
                      className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111827] text-left text-[11px] font-bold text-slate-800 dark:text-slate-200 hover:border-blue-400"
                    >
                      <span>Confirm Attendance</span>
                      <span className="text-[9px] text-slate-400 block font-normal mt-0.5">Send via Gmail App</span>
                    </button>

                    <button
                      onClick={() => {
                        const reply = `Dear Professor ${selectedEmail.senderName},\n\nI hope this email finds you well. I respectfully request a short deadline extension regarding "${selectedEmail.subject}".\n\nThank you,\n[Your Name]`;
                        openNativeEmailApp(reply, `Re: ${selectedEmail.subject}`);
                      }}
                      className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111827] text-left text-[11px] font-bold text-slate-800 dark:text-slate-200 hover:border-blue-400"
                    >
                      <span>Request Extension</span>
                      <span className="text-[9px] text-slate-400 block font-normal mt-0.5">Send via Gmail App</span>
                    </button>
                  </div>
                </div>

                {/* Full Original Email Body */}
                <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    Original Email Body
                  </span>
                  <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded-xl text-[11px] text-slate-600 dark:text-slate-400 whitespace-pre-wrap leading-relaxed font-sans">
                    {selectedEmail.bodyText}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* ADD TEST EMAIL MODAL (FOR LIVE HACKATHON DEMOS) */}
        {/* ========================================================================= */}
        {showAddModal && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white dark:bg-[#0f172a] rounded-2xl w-full max-w-sm p-4 space-y-3 shadow-2xl animate-in zoom-in-95 duration-150">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-xs text-slate-900 dark:text-white flex items-center gap-1.5">
                  <Plus className="w-4 h-4 text-blue-600" />
                  <span>Test Campus Email</span>
                </h3>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="text-slate-400 hover:text-slate-600"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleAddEmail} className="space-y-2.5">
                <input
                  type="text"
                  required
                  value={newSubject}
                  onChange={(e) => setNewSubject(e.target.value)}
                  placeholder="Subject (e.g. [CS301] Quiz Rescheduled due on Friday)"
                  className="w-full px-2.5 py-1.5 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-1 focus:ring-blue-500"
                />

                <input
                  type="text"
                  value={newSender}
                  onChange={(e) => setNewSender(e.target.value)}
                  placeholder="Sender (e.g. Prof. Gupta, Technical Council)"
                  className="w-full px-2.5 py-1.5 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-1 focus:ring-blue-500"
                />

                <textarea
                  rows={3}
                  value={newBody}
                  onChange={(e) => setNewBody(e.target.value)}
                  placeholder="Email body or announcement text..."
                  className="w-full p-2.5 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-1 focus:ring-blue-500"
                />

                <div className="flex justify-end gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="px-3 py-1.5 text-xs text-slate-500"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 bg-blue-600 text-white rounded-xl text-xs font-bold"
                  >
                    Add to Inbox
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* ADD CUSTOM FILTER MODAL */}
        {/* ========================================================================= */}
        {showAddFilterModal && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white dark:bg-[#0f172a] rounded-2xl w-full max-w-sm p-4 space-y-3 shadow-2xl border border-slate-200 dark:border-slate-800 animate-in zoom-in-95 duration-150">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-xs text-slate-900 dark:text-white flex items-center gap-1.5">
                  <Tag className="w-4 h-4 text-purple-600" />
                  <span>New Custom Academic Filter</span>
                </h3>
                <button
                  onClick={() => setShowAddFilterModal(false)}
                  className="text-slate-400 hover:text-slate-600"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleAddMobileCustomFilter} className="space-y-2.5">
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                    Filter Name
                  </label>
                  <input
                    type="text"
                    required
                    value={newFilterName}
                    onChange={(e) => setNewFilterName(e.target.value)}
                    placeholder="e.g. Placements, Library, Hostel"
                    className="w-full px-2.5 py-1.5 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-1 focus:ring-purple-500 text-slate-900 dark:text-slate-100"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                    Keywords (comma separated)
                  </label>
                  <input
                    type="text"
                    required
                    value={newFilterKeywords}
                    onChange={(e) => setNewFilterKeywords(e.target.value)}
                    placeholder="e.g. interview, ctc, tpo, offer"
                    className="w-full px-2.5 py-1.5 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-1 focus:ring-purple-500 text-slate-900 dark:text-slate-100"
                  />
                  <p className="text-[9px] text-slate-400 mt-1">
                    Emails matching these terms will be classified into this bucket.
                  </p>
                </div>

                <div className="flex justify-end gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setShowAddFilterModal(false)}
                    className="px-3 py-1.5 text-xs text-slate-500"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 bg-purple-600 text-white rounded-xl text-xs font-bold"
                  >
                    Create Filter
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TOUCH-FRIENDLY BOTTOM NAVIGATION BAR */}
        {/* ========================================================================= */}
        <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-[#0e1526]/95 backdrop-blur-md border-t border-slate-200/80 dark:border-slate-800/80 px-2 py-2 flex items-center justify-around">
          <button
            onClick={() => setActiveTab('inbox')}
            className={`flex flex-col items-center gap-1 transition ${
              activeTab === 'inbox'
                ? 'text-slate-900 dark:text-white font-semibold'
                : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span className="text-[10px]">Buckets</span>
          </button>

          <button
            onClick={() => setActiveTab('deadlines')}
            className={`flex flex-col items-center gap-1 transition relative ${
              activeTab === 'deadlines'
                ? 'text-slate-900 dark:text-white font-semibold'
                : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
            }`}
          >
            <Calendar className="w-4 h-4" />
            <span className="text-[10px]">Deadlines</span>
            {deadlines.filter((d) => !d.completed).length > 0 && (
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 absolute top-0 right-2" />
            )}
          </button>

          <button
            onClick={() => setActiveTab('chat')}
            className={`flex flex-col items-center gap-1 transition relative ${
              activeTab === 'chat'
                ? 'text-slate-900 dark:text-white font-semibold'
                : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
            }`}
          >
            <Bot className="w-4 h-4" />
            <span className="text-[10px]">Copilot</span>
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500 absolute top-0 right-1.5" />
          </button>

          <button
            onClick={() => setActiveTab('polish')}
            className={`flex flex-col items-center gap-1 transition ${
              activeTab === 'polish'
                ? 'text-slate-900 dark:text-white font-semibold'
                : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span className="text-[10px]">Polish</span>
          </button>

          <button
            onClick={() => setActiveTab('settings')}
            className={`flex flex-col items-center gap-1 transition ${
              activeTab === 'settings'
                ? 'text-slate-900 dark:text-white font-semibold'
                : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
            }`}
          >
            <Settings className="w-4 h-4" />
            <span className="text-[10px]">Settings</span>
          </button>
        </nav>
      </div>
    </div>
  );
}

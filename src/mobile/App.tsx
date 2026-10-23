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
  Share2
} from 'lucide-react';
import {
  ExtractedEmail,
  AnalysisResult,
  CategoryType,
  InboxRowItem,
  AggregatedDeadline,
  PolishTone
} from '../types';
import { analyzeAcademicEmail, polishAcademicDraft } from '../services/ai';
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
  const [activeTab, setActiveTab] = useState<'inbox' | 'deadlines' | 'polish' | 'settings'>('inbox');
  const [emails, setEmails] = useState<ExtractedEmail[]>(INITIAL_DEMO_EMAILS);
  const [selectedCategory, setSelectedCategory] = useState<CategoryType | 'ALL'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedEmail, setSelectedEmail] = useState<ExtractedEmail | null>(null);
  const [emailAnalysis, setEmailAnalysis] = useState<AnalysisResult | null>(null);
  const [analyzingEmailId, setAnalyzingEmailId] = useState<string | null>(null);

  // Deadlines
  const [deadlines, setDeadlines] = useState<AggregatedDeadline[]>([]);

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

  // New Email Modal
  const [showAddModal, setShowAddModal] = useState(false);
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
      const classification = classifyInboxItem(item.subject, item.senderName, item.bodyText);
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
  }, [emails]);

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  // Analyze Email
  const handleInspectEmail = async (email: ExtractedEmail) => {
    setSelectedEmail(email);
    setAnalyzingEmailId(email.id);

    try {
      const analysis = await analyzeAcademicEmail(email, apiKey, groqKey);
      setEmailAnalysis(analysis);
    } catch (e) {
      console.error(e);
    } finally {
      setAnalyzingEmailId(null);
    }
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
          badge: '🎓 Academics',
        };
      case 'Competitions & Tournaments':
        return {
          chip: 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-900/50',
          dot: 'bg-amber-500',
          badge: '🏆 Contests',
        };
      case 'Workshops':
        return {
          chip: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900/50',
          dot: 'bg-emerald-500',
          badge: '🛠️ Workshop',
        };
      case 'Class Rescheduling':
        return {
          chip: 'bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-900/50',
          dot: 'bg-rose-500',
          badge: '⏰ Rescheduled',
        };
      case 'General':
      default:
        return {
          chip: 'bg-slate-500/10 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800',
          dot: 'bg-slate-500',
          badge: '📜 General',
        };
    }
  };

  // Filter Emails
  const filteredEmails = emails.filter((item) => {
    const classification = classifyInboxItem(item.subject, item.senderName, item.bodyText);
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
        <header className="sticky top-0 z-40 bg-white/95 dark:bg-[#0f172a]/95 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800/80 px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-violet-600 flex items-center justify-center text-white shadow-xs">
              <GraduationCap className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-1.5 leading-none">
                <h1 className="text-sm font-extrabold text-slate-900 dark:text-white tracking-tight">
                  AcadMail
                </h1>
                <span className="px-1.5 py-0.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-[9px] font-black text-white rounded">
                  MOBILE
                </span>
              </div>
              <p className="text-[10px] text-slate-400 font-medium mt-0.5 leading-none">
                Campus AI Email Copilot
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
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
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs">
              <button
                onClick={() => setSelectedCategory('ALL')}
                className={`px-3 py-1.5 rounded-full font-semibold whitespace-nowrap transition border ${
                  selectedCategory === 'ALL'
                    ? 'bg-slate-900 dark:bg-blue-600 text-white border-transparent'
                    : 'bg-white dark:bg-[#111827] border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                }`}
              >
                All ({emails.length})
              </button>

              <button
                onClick={() => setSelectedCategory('Academics')}
                className={`px-3 py-1.5 rounded-full font-semibold whitespace-nowrap transition border flex items-center gap-1 ${
                  selectedCategory === 'Academics'
                    ? 'bg-blue-600 text-white border-transparent'
                    : 'bg-blue-50/60 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-900/50'
                }`}
              >
                <BookOpen className="w-3 h-3" />
                <span>Academics</span>
              </button>

              <button
                onClick={() => setSelectedCategory('Competitions & Tournaments')}
                className={`px-3 py-1.5 rounded-full font-semibold whitespace-nowrap transition border flex items-center gap-1 ${
                  selectedCategory === 'Competitions & Tournaments'
                    ? 'bg-amber-600 text-white border-transparent'
                    : 'bg-amber-50/60 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border-amber-200 dark:border-amber-900/50'
                }`}
              >
                <Trophy className="w-3 h-3" />
                <span>Competitions</span>
              </button>

              <button
                onClick={() => setSelectedCategory('Workshops')}
                className={`px-3 py-1.5 rounded-full font-semibold whitespace-nowrap transition border flex items-center gap-1 ${
                  selectedCategory === 'Workshops'
                    ? 'bg-emerald-600 text-white border-transparent'
                    : 'bg-emerald-50/60 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-900/50'
                }`}
              >
                <Briefcase className="w-3 h-3" />
                <span>Workshops</span>
              </button>

              <button
                onClick={() => setSelectedCategory('Class Rescheduling')}
                className={`px-3 py-1.5 rounded-full font-semibold whitespace-nowrap transition border flex items-center gap-1 ${
                  selectedCategory === 'Class Rescheduling'
                    ? 'bg-rose-600 text-white border-transparent'
                    : 'bg-rose-50/60 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-900/50'
                }`}
              >
                <AlertTriangle className="w-3 h-3" />
                <span>Rescheduled</span>
              </button>

              <button
                onClick={() => setSelectedCategory('General')}
                className={`px-3 py-1.5 rounded-full font-semibold whitespace-nowrap transition border flex items-center gap-1 ${
                  selectedCategory === 'General'
                    ? 'bg-slate-700 text-white border-transparent'
                    : 'bg-slate-100 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                }`}
              >
                <Mail className="w-3 h-3" />
                <span>PhD & General</span>
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
                    email.bodyText
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
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-4 text-white shadow-xs space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-blue-200">
                  Campus Deadlines Timeline
                </span>
                <span className="px-2 py-0.5 rounded-full bg-white/20 text-[10px] font-bold">
                  {deadlines.filter((d) => !d.completed).length} Pending
                </span>
              </div>
              <h2 className="text-base font-extrabold">Active Academic Due Dates</h2>
              <p className="text-[11px] text-blue-100">
                1-tap direct sync to your phone's Google Calendar
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
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-50 dark:bg-amber-950/50 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-900/50 text-[10px] font-bold">
                            <Clock className="w-3 h-3" />
                            <span>{dl.deadline}</span>
                          </span>

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
        {/* VIEW 3: POLISH FOR PROFESSOR MOBILE COMPOSER */}
        {/* ========================================================================= */}
        {activeTab === 'polish' && (
          <main className="p-4 space-y-3.5">
            <div className="bg-gradient-to-r from-violet-600 to-indigo-600 rounded-2xl p-4 text-white shadow-xs space-y-1">
              <span className="text-xs font-bold uppercase tracking-wider text-violet-200">
                Professor Tone Polisher
              </span>
              <h2 className="text-base font-extrabold">Instant Academic Email Drafter</h2>
              <p className="text-[11px] text-violet-100">
                Turns informal shorthand into courteous university correspondence
              </p>
            </div>

            {/* Input Box */}
            <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-2xl p-3.5 space-y-2.5 shadow-2xs">
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
                    🎓 Respectful & Formal
                  </button>

                  <button
                    onClick={() => setSelectedTone('extension')}
                    className={`p-2 rounded-xl border text-left font-semibold transition ${
                      selectedTone === 'extension'
                        ? 'bg-blue-600 text-white border-transparent'
                        : 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    ⏳ Request Extension
                  </button>

                  <button
                    onClick={() => setSelectedTone('doubt')}
                    className={`p-2 rounded-xl border text-left font-semibold transition ${
                      selectedTone === 'doubt'
                        ? 'bg-blue-600 text-white border-transparent'
                        : 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    ❓ Clarify Doubt
                  </button>

                  <button
                    onClick={() => setSelectedTone('lor')}
                    className={`p-2 rounded-xl border text-left font-semibold transition ${
                      selectedTone === 'lor'
                        ? 'bg-blue-600 text-white border-transparent'
                        : 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    📝 LoR Request
                  </button>
                </div>
              </div>

              <button
                onClick={handlePolishDraft}
                disabled={isPolishing || !roughNotes.trim()}
                className="w-full py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-xs transition disabled:opacity-50"
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

                {/* AI Executive Summary Card */}
                <div className="bg-gradient-to-br from-blue-50/70 to-indigo-50/70 dark:from-blue-950/40 dark:to-indigo-950/30 border border-blue-200/80 dark:border-blue-900/40 rounded-2xl p-3.5 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-blue-700 dark:text-blue-300 uppercase tracking-wider flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5" />
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
                            <span className="text-[10px] font-bold text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/60 px-2 py-0.5 rounded-md shrink-0">
                              ⏰ {act.deadline}
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
                      <span>✍️ Confirm Attendance</span>
                      <span className="text-[9px] text-slate-400 block font-normal mt-0.5">Send via Gmail App</span>
                    </button>

                    <button
                      onClick={() => {
                        const reply = `Dear Professor ${selectedEmail.senderName},\n\nI hope this email finds you well. I respectfully request a short deadline extension regarding "${selectedEmail.subject}".\n\nThank you,\n[Your Name]`;
                        openNativeEmailApp(reply, `Re: ${selectedEmail.subject}`);
                      }}
                      className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111827] text-left text-[11px] font-bold text-slate-800 dark:text-slate-200 hover:border-blue-400"
                    >
                      <span>⏳ Request Extension</span>
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
        {/* TOUCH-FRIENDLY BOTTOM NAVIGATION BAR */}
        {/* ========================================================================= */}
        <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-[#0f172a]/95 backdrop-blur-md border-t border-slate-200/80 dark:border-slate-800/80 px-4 py-2 flex items-center justify-around">
          <button
            onClick={() => setActiveTab('inbox')}
            className={`flex flex-col items-center gap-1 transition ${
              activeTab === 'inbox'
                ? 'text-blue-600 dark:text-blue-400 font-bold'
                : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            <Layers className="w-5 h-5" />
            <span className="text-[10px]">Buckets</span>
          </button>

          <button
            onClick={() => setActiveTab('deadlines')}
            className={`flex flex-col items-center gap-1 transition relative ${
              activeTab === 'deadlines'
                ? 'text-blue-600 dark:text-blue-400 font-bold'
                : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            <Calendar className="w-5 h-5" />
            <span className="text-[10px]">Deadlines</span>
            {deadlines.filter((d) => !d.completed).length > 0 && (
              <span className="w-2 h-2 rounded-full bg-amber-500 absolute top-0 right-2" />
            )}
          </button>

          <button
            onClick={() => setActiveTab('polish')}
            className={`flex flex-col items-center gap-1 transition ${
              activeTab === 'polish'
                ? 'text-blue-600 dark:text-blue-400 font-bold'
                : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            <Sparkles className="w-5 h-5" />
            <span className="text-[10px]">Polish</span>
          </button>

          <button
            onClick={() => setActiveTab('settings')}
            className={`flex flex-col items-center gap-1 transition ${
              activeTab === 'settings'
                ? 'text-blue-600 dark:text-blue-400 font-bold'
                : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            <Settings className="w-5 h-5" />
            <span className="text-[10px]">Settings</span>
          </button>
        </nav>
      </div>
    </div>
  );
}

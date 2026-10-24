import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Key,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  PanelRight,
  BookOpen,
  Briefcase,
  AlertTriangle,
  Mail,
  Trophy
} from 'lucide-react';
import { getSettings, saveSettings } from '../services/storage';

export default function PopupApp() {
  const [apiKey, setApiKey] = useState('');
  const [isSaved, setIsSaved] = useState(false);
  const [showKeyInput, setShowKeyInput] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');

  useEffect(() => {
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

    getSettings().then((s) => {
      setApiKey(s.apiKey || '');
      if (!s.apiKey && !s.groqApiKey) setShowKeyInput(true);
    });
  }, []);

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
      document.body.style.backgroundColor = '#090d16';
    } else {
      document.documentElement.classList.remove('dark');
      document.body.style.backgroundColor = '#f8fafc';
    }
  }, [theme]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    await saveSettings({ apiKey: apiKey.trim() });
    setIsSaved(true);
    setShowKeyInput(false);
    setTimeout(() => setIsSaved(false), 2000);
  };

  const openSidePanel = async () => {
    if (typeof chrome !== 'undefined' && chrome.tabs) {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (tab?.windowId) {
        chrome.sidePanel.open({ windowId: tab.windowId });
        window.close(); // Close the popup
      }
    }
  };

  return (
    <div className={theme === 'dark' ? 'dark' : ''}>
      <div className="p-3.5 space-y-3 font-sans text-xs bg-slate-50 dark:bg-[#090d16] text-slate-800 dark:text-slate-100 min-h-[360px] transition-colors">
        {/* Header */}
        <div className="flex items-center justify-between pb-2.5 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <img
              src="/icons/envelope-logo.png"
              alt="AcadMail"
              className="w-7 h-7 rounded-md object-contain shadow-xs shrink-0"
            />
            <div>
              <h1 className="font-batangas font-bold text-slate-900 dark:text-white text-sm tracking-wide leading-none">
                AcadMail <span className="text-blue-600 dark:text-blue-400">AI</span>
              </h1>
              <p className="text-[10px] text-slate-500 dark:text-slate-400">Academic Copilot</p>
            </div>
          </div>
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 text-[10px] font-semibold">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            Ready
          </span>
        </div>

        {/* Primary Action Button */}
        <button
          onClick={openSidePanel}
          className="w-full py-2 px-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold rounded-xl shadow-xs transition flex items-center justify-center gap-2 text-xs"
        >
          <PanelRight className="w-4 h-4" />
          <span>Open AI Side Panel</span>
        </button>

        {/* Classification Categories Overview (All 5 Categories) */}
        <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-xl p-2.5 space-y-1.5 shadow-2xs">
          <div className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
            Active Academic Buckets
          </div>
          <div className="grid grid-cols-2 gap-1.5 text-[10px]">
            <div className="flex items-center gap-1.5 p-1.5 rounded-lg bg-blue-50/70 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border border-blue-100 dark:border-blue-900/40 font-medium">
              <BookOpen className="w-3 h-3 shrink-0" />
              <span className="truncate">Academics</span>
            </div>
            <div className="flex items-center gap-1.5 p-1.5 rounded-lg bg-amber-50/70 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border border-amber-100 dark:border-amber-900/40 font-medium">
              <Trophy className="w-3 h-3 shrink-0" />
              <span className="truncate">Competitions</span>
            </div>
            <div className="flex items-center gap-1.5 p-1.5 rounded-lg bg-emerald-50/70 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-100 dark:border-emerald-900/40 font-medium">
              <Briefcase className="w-3 h-3 shrink-0" />
              <span className="truncate">Workshops</span>
            </div>
            <div className="flex items-center gap-1.5 p-1.5 rounded-lg bg-rose-50/70 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border border-rose-100 dark:border-rose-900/40 font-medium">
              <AlertTriangle className="w-3 h-3 shrink-0" />
              <span className="truncate">Rescheduling</span>
            </div>
            <div className="col-span-2 flex items-center gap-1.5 p-1.5 rounded-lg bg-slate-100/70 dark:bg-slate-800/50 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700/60 font-medium">
              <Mail className="w-3 h-3 shrink-0" />
              <span className="truncate">General & Campus (PhD / Viva)</span>
            </div>
          </div>
        </div>

        {/* API Key Configuration Section */}
        <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-xl p-2.5 space-y-2 shadow-2xs">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 font-semibold text-slate-700 dark:text-slate-300 text-[11px]">
              <Key className="w-3 h-3 text-slate-500 dark:text-slate-400" />
              <span>Gemini API Key</span>
            </div>
            {apiKey && !showKeyInput ? (
              <button
                onClick={() => setShowKeyInput(true)}
                className="text-[10px] text-blue-600 dark:text-blue-400 hover:underline"
              >
                Change
              </button>
            ) : null}
          </div>

          {apiKey && !showKeyInput ? (
            <div className="flex items-center gap-1.5 text-[11px] text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 p-1.5 rounded-lg border border-emerald-100 dark:border-emerald-900/50">
              <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
              <span>Key connected (Auto-failover active)</span>
            </div>
          ) : (
            <form onSubmit={handleSave} className="space-y-1.5">
              <input
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="Paste Gemini API Key..."
                className="w-full px-2 py-1.5 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 font-mono text-slate-900 dark:text-slate-100"
              />
              <div className="flex items-center justify-between pt-0.5">
                <a
                  href="https://aistudio.google.com/"
                  target="_blank"
                  rel="noreferrer"
                  className="text-[10px] text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-0.5"
                >
                  Get free key <ExternalLink className="w-2.5 h-2.5" />
                </a>
                <button
                  type="submit"
                  className="px-2.5 py-1 bg-blue-600 text-white rounded-md text-[10px] font-medium hover:bg-blue-700 transition"
                >
                  {isSaved ? 'Saved!' : 'Save'}
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Helpful Hint */}
        <p className="text-[10px] text-slate-400 dark:text-slate-500 text-center">
          Works seamlessly on <span className="font-semibold text-slate-600 dark:text-slate-300">mail.google.com</span> and{' '}
          <span className="font-semibold text-slate-600 dark:text-slate-300">outlook.office.com</span>
        </p>
      </div>
    </div>
  );
}

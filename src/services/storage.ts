import { UserSettings, AnalysisResult, ExtractedEmail } from '../types';

const DEFAULT_SETTINGS: UserSettings = {
  apiKey: '',
  provider: 'gemini',
  groqApiKey: '',
  autoAnalyze: false,
  academicLevel: 'undergrad',
  customLabels: [
    { name: 'Thesis / Research', color: '#8b5cf6', keywords: ['thesis', 'dissertation', 'advisor', 'lab meeting'] },
    { name: 'Financial Aid', color: '#10b981', keywords: ['scholarship', 'bursar', 'grant', 'tuition', 'finaid'] },
  ],
};

export async function getSettings(): Promise<UserSettings> {
  return new Promise((resolve) => {
    if (typeof chrome === 'undefined' || !chrome.storage?.local) {
      const local = localStorage.getItem('acadmail_settings');
      resolve(local ? JSON.parse(local) : DEFAULT_SETTINGS);
      return;
    }

    chrome.storage.local.get(['acadmail_settings'], (result) => {
      resolve(result.acadmail_settings || DEFAULT_SETTINGS);
    });
  });
}

export async function saveSettings(settings: Partial<UserSettings>): Promise<void> {
  const current = await getSettings();
  const updated = { ...current, ...settings };

  return new Promise((resolve) => {
    if (typeof chrome === 'undefined' || !chrome.storage?.local) {
      localStorage.setItem('acadmail_settings', JSON.stringify(updated));
      resolve();
      return;
    }

    chrome.storage.local.set({ acadmail_settings: updated }, () => {
      resolve();
    });
  });
}

export async function getCachedAnalysis(emailId: string): Promise<AnalysisResult | null> {
  return new Promise((resolve) => {
    if (typeof chrome === 'undefined' || !chrome.storage?.local) {
      const cached = localStorage.getItem(`analysis_${emailId}`);
      resolve(cached ? JSON.parse(cached) : null);
      return;
    }

    chrome.storage.local.get([`analysis_${emailId}`], (result) => {
      resolve(result[`analysis_${emailId}`] || null);
    });
  });
}

export async function saveAnalysis(emailId: string, analysis: AnalysisResult): Promise<void> {
  return new Promise((resolve) => {
    if (typeof chrome === 'undefined' || !chrome.storage?.local) {
      localStorage.setItem(`analysis_${emailId}`, JSON.stringify(analysis));
      resolve();
      return;
    }

    chrome.storage.local.set({ [`analysis_${emailId}`]: analysis }, () => {
      resolve();
    });
  });
}

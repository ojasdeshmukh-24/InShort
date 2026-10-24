import { UserSettings, AnalysisResult, ExtractedEmail, CustomFilter } from '../types';

export const DEFAULT_ASSIGNMENT_FILTER: CustomFilter = {
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
};

const DEFAULT_SETTINGS: UserSettings = {
  apiKey: '',
  provider: 'gemini',
  groqApiKey: '',
  autoAnalyze: false,
  academicLevel: 'undergrad',
  inPageIntegration: true,
  uiMode: 'blended',
  hasCompletedSetup: false,
  priorityList: ['Assignment', 'Academics', 'Competitions & Tournaments', 'Class Rescheduling'],
  preferredLabels: ['Assignment', 'Academics', 'Competitions & Tournaments', 'Class Rescheduling'],
  customFilters: [
    DEFAULT_ASSIGNMENT_FILTER,
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
  ],
  labelOverrides: {},
  customLabels: [
    { name: 'Thesis / Research', color: '#8b5cf6', keywords: ['thesis', 'dissertation', 'advisor', 'lab meeting'] },
    { name: 'Financial Aid', color: '#10b981', keywords: ['scholarship', 'bursar', 'grant', 'tuition', 'finaid'] },
  ],
};

function ensureAssignmentFilter(settings: UserSettings): UserSettings {
  if (!settings.customFilters) {
    settings.customFilters = [...(DEFAULT_SETTINGS.customFilters || [])];
    return settings;
  }
  const hasAssignment = settings.customFilters.some(
    (cf) => cf.id === 'filter-assignment' || cf.name.toLowerCase() === 'assignment' || cf.name.toLowerCase() === 'assignments'
  );
  if (!hasAssignment) {
    settings.customFilters = [DEFAULT_ASSIGNMENT_FILTER, ...settings.customFilters];
  }
  return settings;
}

export async function getSettings(): Promise<UserSettings> {
  return new Promise((resolve) => {
    if (typeof chrome === 'undefined' || !chrome.storage?.local) {
      const local = localStorage.getItem('acadmail_settings');
      const settings = local ? JSON.parse(local) : DEFAULT_SETTINGS;
      resolve(ensureAssignmentFilter(settings));
      return;
    }

    chrome.storage.local.get(['acadmail_settings'], (result) => {
      const settings = result.acadmail_settings || DEFAULT_SETTINGS;
      resolve(ensureAssignmentFilter(settings));
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

export async function saveLabelOverride(emailId: string, category: string): Promise<void> {
  const current = await getSettings();
  const overrides = { ...(current.labelOverrides || {}), [emailId]: category };
  await saveSettings({ labelOverrides: overrides });
}

export async function addCustomFilter(filter: CustomFilter): Promise<void> {
  const current = await getSettings();
  const filters = [...(current.customFilters || []), filter];
  await saveSettings({ customFilters: filters });
}

export async function deleteCustomFilter(filterId: string): Promise<void> {
  const current = await getSettings();
  const filters = (current.customFilters || []).filter((f) => f.id !== filterId);
  await saveSettings({ customFilters: filters });
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

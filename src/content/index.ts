import { ExtractedEmail, InboxRowItem, CategoryType, UiIntegrationMode, CustomFilter } from '../types';

console.log('[AcadMail AI] Ultra-Clean Material 3 Gmail Script with Custom Filters & Relabeling active.');

let lastClickedRow: HTMLElement | null = null;
let currentActiveFilter: CategoryType | 'ALL' = 'ALL';
let scannedItemsCache: InboxRowItem[] = [];
let uiMode: UiIntegrationMode = 'blended';
let isBriefExpanded = false;
let customFiltersCache: CustomFilter[] = [
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
];
let labelOverridesCache: Record<string, string> = {};

// Safe message sender
function safeSendMessage(message: any) {
  try {
    if (typeof chrome !== 'undefined' && chrome.runtime?.id) {
      chrome.runtime.sendMessage(message).catch(() => {});
    }
  } catch (e) {}
}

// Detect Gmail Dark Mode accurately
function isGmailDark(): boolean {
  try {
    const bg = window.getComputedStyle(document.body).backgroundColor;
    if (bg) {
      const rgb = bg.match(/\d+/g);
      if (rgb && rgb.length >= 3) {
        const brightness = (parseInt(rgb[0]) * 299 + parseInt(rgb[1]) * 587 + parseInt(rgb[2]) * 114) / 1000;
        return brightness < 128;
      }
    }
  } catch (e) {}
  return window.matchMedia('(prefers-color-scheme: dark)').matches;
}

function syncGmailTheme() {
  const isDark = isGmailDark();
  const theme = isDark ? 'dark' : 'light';
  if (typeof chrome !== 'undefined' && chrome.storage?.local) {
    chrome.storage.local.set({ acadmail_gmail_theme: theme });
  }
  safeSendMessage({ type: 'GMAIL_THEME_DETECTED', theme });
}

// Load UI Mode, Custom Filters & Label Overrides
function loadSettings() {
  syncGmailTheme();
  if (typeof chrome !== 'undefined' && chrome.storage?.local) {
    chrome.storage.local.get(['acadmail_settings'], (res) => {
      if (res.acadmail_settings) {
        if (res.acadmail_settings.uiMode) {
          uiMode = res.acadmail_settings.uiMode;
        } else if (res.acadmail_settings.inPageIntegration === false) {
          uiMode = 'off';
        } else {
          uiMode = 'blended';
        }

        if (Array.isArray(res.acadmail_settings.customFilters)) {
          customFiltersCache = res.acadmail_settings.customFilters;
        }
        if (res.acadmail_settings.labelOverrides) {
          labelOverridesCache = res.acadmail_settings.labelOverrides;
        }
      }
      applyUiMode();
    });
  }
}

function applyUiMode() {
  // Clean up all possible injected elements
  document.getElementById('acadmail-native-chip-bar')?.remove();
  document.getElementById('acadmail-inbox-filter-bar')?.remove();
  document.getElementById('acadmail-email-brief-card')?.remove();
  document.getElementById('acadmail-siderail-btn')?.remove();

  if (uiMode === 'off') {
    filterGmailDom('ALL');
    return;
  }

  scanVisibleInbox();
  checkAndInjectEmailBrief();
  injectSideRailIcon();
}

// Save manual email re-label override
function saveEmailLabelOverride(emailId: string, subject: string, sender: string, newCategory: string) {
  labelOverridesCache[emailId] = newCategory;
  if (subject) labelOverridesCache[subject] = newCategory;
  const rowKey = `${subject}::${sender}`.trim();
  if (rowKey) labelOverridesCache[rowKey] = newCategory;

  if (typeof chrome !== 'undefined' && chrome.storage?.local) {
    chrome.storage.local.get(['acadmail_settings'], (res) => {
      const current = res.acadmail_settings || {};
      const currentOverrides = current.labelOverrides || {};
      currentOverrides[emailId] = newCategory;
      if (subject) currentOverrides[subject] = newCategory;
      if (rowKey) currentOverrides[rowKey] = newCategory;
      chrome.storage.local.set({
        acadmail_settings: { ...current, labelOverrides: currentOverrides }
      });
    });
  }

  scanVisibleInbox();
  checkAndInjectEmailBrief();
  safeSendMessage({ type: 'EMAIL_CHANGED' });
  showToastNotification(`Email re-labeled as "${newCategory}"`);
}

// Save new custom filter from in-page dialog
function saveNewCustomFilter(name: string, keywordsStr: string) {
  if (!name.trim()) return;
  const keywords = keywordsStr.split(',').map((k) => k.trim().toLowerCase()).filter(Boolean);
  const newFilter: CustomFilter = {
    id: `filter-${Date.now()}`,
    name: name.trim(),
    color: '#8b5cf6',
    keywords: keywords.length > 0 ? keywords : [name.trim().toLowerCase()]
  };

  customFiltersCache.push(newFilter);

  if (typeof chrome !== 'undefined' && chrome.storage?.local) {
    chrome.storage.local.get(['acadmail_settings'], (res) => {
      const current = res.acadmail_settings || {};
      const existingFilters = current.customFilters || [];
      chrome.storage.local.set({
        acadmail_settings: { ...current, customFilters: [...existingFilters, newFilter] }
      });
    });
  }

  scanVisibleInbox();
  safeSendMessage({ type: 'UPDATE_CUSTOM_FILTERS' });
  showToastNotification(`Created filter "${newFilter.name}"`);
}

// Inlined classifier supporting custom filters & user label overrides
function classifyInboxItem(
  subject: string,
  sender: string,
  snippet: string,
  emailId?: string
): { category: CategoryType; courseCode?: string; isPhd?: boolean } {
  const combined = `${subject} ${sender} ${snippet}`.toLowerCase();

  const courseMatch = subject.match(/\b([A-Z]{2,4}\s?[-_]?\s?\d{3,4}[A-Z]?)\b/i);
  const courseCode = courseMatch ? courseMatch[1].toUpperCase() : undefined;

  // 0. Check manual user label overrides first (highest priority)
  if (emailId && labelOverridesCache[emailId]) {
    return { category: labelOverridesCache[emailId], courseCode };
  }
  if (labelOverridesCache[subject]) {
    return { category: labelOverridesCache[subject], courseCode };
  }
  const rowKey = `${subject}::${sender}`.trim();
  if (labelOverridesCache[rowKey]) {
    return { category: labelOverridesCache[rowKey], courseCode };
  }

  // 0.5. Check user-defined custom filters
  if (customFiltersCache && customFiltersCache.length > 0) {
    for (const filter of customFiltersCache) {
      if (
        filter.keywords &&
        filter.keywords.some((k) => k.trim() && combined.includes(k.trim().toLowerCase()))
      ) {
        return { category: filter.name, courseCode };
      }
    }
  }

  // 1. PhD and Viva-Voce Notices -> Route directly to General
  if (
    combined.includes('viva') ||
    combined.includes('viva-voce') ||
    combined.includes('viva voce') ||
    combined.includes('oral defense') ||
    combined.includes('thesis defense') ||
    combined.includes('phd defense') ||
    combined.includes('ph.d. defense') ||
    combined.includes('synopsis presentation') ||
    combined.includes('synopsis submission') ||
    combined.includes('ph.d. viva') ||
    combined.includes('phd viva') ||
    combined.includes('doctoral defense')
  ) {
    return { category: 'General', courseCode, isPhd: true };
  }

  // 2. Class Rescheduling
  if (
    combined.includes('reschedule') ||
    combined.includes('rescheduled') ||
    combined.includes('postpone') ||
    combined.includes('postponed') ||
    combined.includes('cancelled') ||
    combined.includes('class canceled') ||
    combined.includes('venue change') ||
    combined.includes('room change') ||
    combined.includes('lecture timing') ||
    combined.includes('no class today') ||
    combined.includes('extra class')
  ) {
    return { category: 'Class Rescheduling', courseCode };
  }

  // 3. Competitions & Tournaments
  if (
    combined.includes('competition') ||
    combined.includes('tournament') ||
    combined.includes('contest') ||
    combined.includes('hackathon') ||
    combined.includes('sociothon') ||
    combined.includes('devfolio') ||
    combined.includes('trials') ||
    combined.includes('open trials') ||
    combined.includes('inter-iit') ||
    combined.includes('inter iit') ||
    combined.includes('inter-hostel') ||
    combined.includes('inter hostel') ||
    combined.includes('inter-college') ||
    combined.includes('championship') ||
    combined.includes('trophy') ||
    combined.includes('athletics') ||
    combined.includes('sports') ||
    combined.includes('cricket') ||
    combined.includes('football') ||
    combined.includes('badminton') ||
    combined.includes('volleyball') ||
    combined.includes('table tennis') ||
    combined.includes('chess') ||
    combined.includes('squash') ||
    combined.includes('esports') ||
    combined.includes('case competition') ||
    combined.includes('case comp') ||
    combined.includes('quiz competition') ||
    combined.includes('challenge') ||
    combined.includes('cash prize') ||
    combined.includes('prize pool') ||
    combined.includes('mushaira') ||
    combined.includes('ideathon')
  ) {
    return { category: 'Competitions & Tournaments', courseCode };
  }

  // 4. Workshops & Talks
  if (
    combined.includes('intro talk') ||
    combined.includes('intro talks') ||
    combined.includes('opening talk') ||
    combined.includes('introductory talk') ||
    combined.includes('orientation talk') ||
    combined.includes('info session') ||
    combined.includes('tech talk') ||
    combined.includes('talk by') ||
    combined.includes('distinguished lecture') ||
    combined.includes('guest lecture') ||
    combined.includes('workshop') ||
    combined.includes('webinar') ||
    combined.includes('seminar') ||
    combined.includes('conclave') ||
    combined.includes('symposium') ||
    combined.includes('bootcamp') ||
    combined.includes('masterclass') ||
    combined.includes('hands-on') ||
    combined.includes('enactus') ||
    combined.includes('sdslabs') ||
    combined.includes('pragati') ||
    combined.includes('hr conclave')
  ) {
    return { category: 'Workshops', courseCode };
  }

  // 5. Academics
  if (
    courseCode ||
    combined.includes('assignment') ||
    combined.includes('homework') ||
    combined.includes('syllabus') ||
    combined.includes('quiz') ||
    combined.includes('midterm') ||
    combined.includes('endterm') ||
    combined.includes('exam') ||
    combined.includes('grade') ||
    combined.includes('grading') ||
    combined.includes('lab manual') ||
    combined.includes('tutorial') ||
    combined.includes('office hours') ||
    combined.includes('canvas') ||
    combined.includes('moodle') ||
    combined.includes('classroom') ||
    combined.includes('prof.') ||
    combined.includes('professor') ||
    combined.includes('teaching day') ||
    combined.includes('lecture') ||
    combined.includes('faculty') ||
    combined.includes('ug-i') ||
    combined.includes('ug-ii') ||
    combined.includes('pg-i') ||
    combined.includes('project evaluation')
  ) {
    return { category: 'Academics', courseCode };
  }

  return { category: 'General', courseCode };
}

// Track clicked rows in Gmail
document.addEventListener(
  'click',
  (e) => {
    const target = e.target as HTMLElement;
    const row = target.closest('tr.zA');
    if (row) {
      lastClickedRow = row as HTMLElement;
      setTimeout(() => {
        safeSendMessage({ type: 'EMAIL_CHANGED' });
        checkAndInjectEmailBrief();
      }, 350);
      setTimeout(() => {
        safeSendMessage({ type: 'EMAIL_CHANGED' });
        checkAndInjectEmailBrief();
      }, 800);
    }
  },
  true
);

// Scan all visible emails in the current inbox view
function scanVisibleInbox(): InboxRowItem[] {
  const rows = document.querySelectorAll('tr.zA');
  const items: InboxRowItem[] = [];

  rows.forEach((row, index) => {
    const rowEl = row as HTMLElement;
    const subjectEl = rowEl.querySelector('.bqe, .bog, span[data-thread-id]');
    const subject = subjectEl?.textContent?.trim() || '(No Subject)';

    const senderEl = rowEl.querySelector('.bA4 span, .yP, .zF');
    const sender = senderEl?.textContent?.trim() || 'Unknown';

    const snippetEl = rowEl.querySelector('.y2');
    const snippet = snippetEl?.textContent?.trim() || '';

    const dateEl = rowEl.querySelector('.xW span');
    const date = dateEl?.textContent?.trim() || 'Recent';

    const isRead = !rowEl.classList.contains('zE');

    const emailKey = `${subject}::${sender}`.trim();
    const { category, courseCode, isPhd } = classifyInboxItem(subject, sender, snippet, emailKey);

    const item: InboxRowItem = {
      id: `row-${index}-${subject.slice(0, 15).replace(/[^a-zA-Z0-9]/g, '_')}`,
      index,
      subject,
      sender,
      snippet,
      date,
      category,
      courseCode,
      isRead,
    };

    items.push(item);
    injectRowBadge(rowEl, category, courseCode, isPhd, subject, sender);
  });

  scannedItemsCache = items;

  if (uiMode === 'blended' && items.length > 0) {
    injectMaterial3ToolbarChips(items);
  }

  return items;
}

// Subtle, elegant micro-badge matching native Gmail labels (with relabel click)
function injectRowBadge(
  rowEl: HTMLElement,
  category: CategoryType,
  courseCode?: string,
  isPhd?: boolean,
  subject?: string,
  sender?: string
) {
  const existing = rowEl.querySelector('.acadmail-row-badge');
  if (existing) existing.remove();

  const subjectContainer = rowEl.querySelector('.y6, .bog');
  if (!subjectContainer) return;

  const isDark = isGmailDark();
  const badge = document.createElement('span');
  badge.className = 'acadmail-row-badge';

  let badgeColor = isDark
    ? 'background: rgba(56, 139, 253, 0.15); color: #79c0ff; border: 1px solid rgba(56, 139, 253, 0.3);'
    : 'background: #edf5fd; color: #1a73e8; border: 1px solid #d2e3fc;';
  let labelText = courseCode || 'Acads';

  if (category === 'Competitions & Tournaments') {
    badgeColor = isDark
      ? 'background: rgba(210, 153, 34, 0.15); color: #e3b341; border: 1px solid rgba(210, 153, 34, 0.3);'
      : 'background: #fef7e0; color: #b06000; border: 1px solid #fce8b2;';
    labelText = 'Contest';
  } else if (category === 'Workshops') {
    badgeColor = isDark
      ? 'background: rgba(46, 160, 67, 0.15); color: #7ee787; border: 1px solid rgba(46, 160, 67, 0.3);'
      : 'background: #e6f4ea; color: #137333; border: 1px solid #ceead6;';
    labelText = 'Workshop';
  } else if (category === 'Class Rescheduling') {
    badgeColor = isDark
      ? 'background: rgba(248, 81, 73, 0.15); color: #ff7b72; border: 1px solid rgba(248, 81, 73, 0.3);'
      : 'background: #fce8e6; color: #c5221f; border: 1px solid #fad2cf;';
    labelText = 'Rescheduled';
  } else if (isPhd) {
    badgeColor = isDark
      ? 'background: rgba(142, 145, 143, 0.15); color: #c4c7c5; border: 1px solid rgba(142, 145, 143, 0.3);'
      : 'background: #f1f3f4; color: #5f6368; border: 1px solid #dadce0;';
    labelText = 'PhD / Viva';
  } else if (category === 'General') {
    badgeColor = isDark
      ? 'background: rgba(142, 145, 143, 0.12); color: #c4c7c5; border: 1px solid rgba(142, 145, 143, 0.2);'
      : 'background: #f8f9fa; color: #5f6368; border: 1px solid #dadce0;';
    labelText = 'General';
  } else {
    // Custom user filter
    badgeColor = isDark
      ? 'background: rgba(168, 85, 247, 0.15); color: #c084fc; border: 1px solid rgba(168, 85, 247, 0.3);'
      : 'background: #f3e8ff; color: #7e22ce; border: 1px solid #e9d5ff;';
    labelText = category;
  }

  badge.setAttribute(
    'style',
    `
    display: inline-flex;
    align-items: center;
    gap: 3px;
    padding: 0 6px;
    height: 16px;
    margin-right: 6px;
    border-radius: 6px;
    font-size: 10.5px;
    font-weight: 500;
    font-family: Roboto, "Google Sans", "Google Sans Text", sans-serif;
    vertical-align: middle;
    cursor: pointer;
    ${badgeColor}
  `
  );

  badge.innerText = labelText;
  badge.title = courseCode ? `Filter Gmail for ${courseCode} (Right-click to change label)` : `Category: ${category} (Click to change)`;

  badge.onclick = (e) => {
    e.stopPropagation();
    if (courseCode) {
      executeGmailSearch(courseCode);
    } else if (subject && sender) {
      openRelabelMenu(badge, subject, sender, category);
    }
  };

  badge.oncontextmenu = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (subject && sender) {
      openRelabelMenu(badge, subject, sender, category);
    }
  };

  subjectContainer.prepend(badge);
}

// 1-Click Search Gmail for a course code
function executeGmailSearch(query: string) {
  const searchInput = document.querySelector('input[name="q"], input[aria-label*="Search"]') as HTMLInputElement;
  if (searchInput) {
    searchInput.value = query;
    searchInput.dispatchEvent(new Event('input', { bubbles: true }));
    const form = searchInput.closest('form');
    if (form) {
      form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
    } else {
      searchInput.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', keyCode: 13, bubbles: true }));
    }
  }
}

// Filter rows on Gmail DOM (supports custom filters)
function filterGmailDom(category: CategoryType | 'ALL') {
  currentActiveFilter = category;
  const rows = document.querySelectorAll('tr.zA');

  rows.forEach((row) => {
    const rowEl = row as HTMLElement;
    if (category === 'ALL') {
      rowEl.style.display = '';
      return;
    }

    const badge = rowEl.querySelector('.acadmail-row-badge');
    const badgeText = badge?.textContent || '';

    let match = false;
    if (category === 'Academics' && (badgeText.includes('🎓') || badgeText.includes('Acads'))) match = true;
    else if (category === 'Competitions & Tournaments' && (badgeText.includes('🏆') || badgeText.includes('Contest'))) match = true;
    else if (category === 'Workshops' && (badgeText.includes('🛠️') || badgeText.includes('Workshop'))) match = true;
    else if (category === 'Class Rescheduling' && (badgeText.includes('⏰') || badgeText.includes('Rescheduled'))) match = true;
    else if (category === 'General' && (badgeText.includes('📢') || badgeText.includes('General') || badgeText.includes('PhD'))) match = true;
    else if (badgeText.toLowerCase().includes(category.toLowerCase())) match = true; // Match custom filters!

    if (match) {
      rowEl.style.display = '';
    } else {
      rowEl.style.display = 'none';
    }
  });

  updateToolbarChipsActiveState();
}

// Pre-filled Google Calendar URL generator
function createGCalUrl(title: string, details: string, dueDateStr?: string): string {
  const baseUrl = 'https://calendar.google.com/calendar/render?action=TEMPLATE';
  let datesParam = '';
  if (dueDateStr) {
    const parsedDate = new Date(dueDateStr);
    if (!isNaN(parsedDate.getTime())) {
      const start = parsedDate.toISOString().replace(/-|:|\.\d\d\d/g, '');
      const endDate = new Date(parsedDate.getTime() + 60 * 60 * 1000);
      const end = endDate.toISOString().replace(/-|:|\.\d\d\d/g, '');
      datesParam = `&dates=${start}/${end}`;
    }
  }

  const params = new URLSearchParams({
    text: `[AcadMail] ${title}`,
    details: `${details}\n\n— Auto-extracted by AcadMail AI`,
  });

  return `${baseUrl}&${params.toString()}${datesParam}`;
}

// Quick toast notification on Gmail DOM
function showToastNotification(message: string) {
  const existing = document.getElementById('acadmail-toast');
  if (existing) existing.remove();

  const toast = document.createElement('div');
  toast.id = 'acadmail-toast';
  toast.innerText = message;
  toast.setAttribute(
    'style',
    `
    position: fixed;
    bottom: 24px;
    left: 50%;
    transform: translateX(-50%);
    background: #0f172a;
    color: #ffffff;
    padding: 8px 16px;
    border-radius: 9999px;
    font-size: 11.5px;
    font-weight: 600;
    box-shadow: 0 4px 14px rgba(0,0,0,0.25);
    z-index: 9999999;
    font-family: -apple-system, BlinkMacSystemFont, "Google Sans", Roboto, sans-serif;
    animation: fadeIn 0.15s ease-out;
  `
  );
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 2500);
}

// =========================================================================
// 1. INLINE MATERIAL 3 TOOLBAR CHIPS (Pixel-Perfect, Zero-Clipping, Native Google Design)
// =========================================================================
function injectMaterial3ToolbarChips(items: InboxRowItem[]) {
  if (uiMode !== 'blended') return;

  const targetBar =
    document.querySelector('div[gh="tm"]') ||
    document.querySelector('div.G-atb') ||
    document.querySelector('div.aeF');

  if (!targetBar) return;

  // Inject or update stylesheet for pristine, non-clipping M3 styling
  if (!document.getElementById('acadmail-m3-css')) {
    const styleEl = document.createElement('style');
    styleEl.id = 'acadmail-m3-css';
    styleEl.textContent = `
      @font-face {
        font-family: 'Batangas';
        src: url('${chrome.runtime.getURL('fonts/Batangas-Bold.otf')}') format('opentype');
        font-weight: 100 900;
        font-style: normal;
        font-display: swap;
      }
      #acadmail-chip-scroll-track::-webkit-scrollbar {
        display: none !important;
        height: 0 !important;
      }
      .m3-chip {
        white-space: nowrap !important;
        flex-shrink: 0 !important;
        height: 32px !important;
        box-sizing: border-box !important;
        padding: 0 12px !important;
        border-radius: 6px !important;
        display: inline-flex !important;
        align-items: center !important;
        gap: 6px !important;
        font-family: Roboto, "Google Sans", "Google Sans Text", -apple-system, BlinkMacSystemFont, sans-serif !important;
        font-size: 12px !important;
        font-weight: 500 !important;
        line-height: 1 !important;
        cursor: pointer !important;
        user-select: none !important;
        outline: none !important;
        transition: background 0.15s ease, border-color 0.15s ease, box-shadow 0.15s ease !important;
      }
      .m3-chip:hover {
        filter: brightness(0.97);
      }
      .m3-chip-count {
        font-size: 11px !important;
        font-weight: 500 !important;
        font-family: Roboto, "Google Sans", sans-serif !important;
        padding: 2px 6px !important;
        border-radius: 4px !important;
        line-height: 1 !important;
        display: inline-flex !important;
        align-items: center !important;
        justify-content: center !important;
      }
    `;
    document.head.appendChild(styleEl);
  }

  let acadCount = 0;
  let compCount = 0;
  let workCount = 0;
  let reschedCount = 0;
  let genCount = 0;

  const datePattern = /\b(?:due|deadline|by|on|date:|till)\s+([A-Za-z]{3,9}\s+\d{1,2}(?:st|nd|rd|th)?(?:\s*,\s*\d{4})?|\d{1,2}\/\d{1,2}(?:\/\d{2,4})?|\d{1,2}\s+[A-Za-z]{3,9})\b/gi;
  const deadlineList: { title: string; deadline: string }[] = [];

  items.forEach((item) => {
    if (item.category === 'Academics') acadCount++;
    else if (item.category === 'Competitions & Tournaments') compCount++;
    else if (item.category === 'Workshops') workCount++;
    else if (item.category === 'Class Rescheduling') reschedCount++;
    else if (item.category === 'General') genCount++;

    const text = `${item.subject} ${item.snippet}`;
    const matches = [...text.matchAll(datePattern)];
    if (matches.length > 0) {
      deadlineList.push({ title: item.subject, deadline: matches[0][1] });
    }
  });

  const isDark = isGmailDark();
  let bar = document.getElementById('acadmail-native-chip-bar');

  if (!bar) {
    bar = document.createElement('div');
    bar.id = 'acadmail-native-chip-bar';
    bar.setAttribute(
      'style',
      `
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 10px;
      padding: 6px 16px;
      min-height: 44px;
      box-sizing: border-box;
      background: ${isDark ? '#141517' : '#ffffff'};
      border-bottom: 1px solid ${isDark ? 'rgba(255,255,255,0.08)' : '#e0e2ec'};
      font-family: Roboto, "Google Sans", "Google Sans Text", -apple-system, sans-serif;
      font-size: 12px;
      z-index: 10;
    `
    );

    targetBar.parentElement?.insertBefore(bar, targetBar.nextSibling || targetBar);
  }

  const getPillStyle = (cat: CategoryType | 'ALL') => {
    const isActive = currentActiveFilter === cat;
    if (isActive) {
      return `
        background: ${isDark ? '#004a77' : '#c2e7ff'};
        color: ${isDark ? '#c2e7ff' : '#001d35'};
        border: 1px solid ${isDark ? '#005f9e' : '#7fcfff'};
        font-weight: 600;
        box-shadow: 0 1px 2px rgba(0,0,0,0.05);
      `;
    }
    return `
      background: ${isDark ? 'rgba(255,255,255,0.04)' : '#f8fafd'};
      color: ${isDark ? '#e3e3e3' : '#3c4043'};
      border: 1px solid ${isDark ? 'rgba(255,255,255,0.12)' : '#dadce0'};
      font-weight: 500;
    `;
  };

  const renderCountBadge = (cat: CategoryType | 'ALL', count: number) => {
    const isActive = currentActiveFilter === cat;
    const badgeBg = isActive
      ? isDark
        ? 'rgba(194, 231, 255, 0.22)'
        : 'rgba(0, 29, 53, 0.12)'
      : isDark
      ? 'rgba(255, 255, 255, 0.1)'
      : 'rgba(0, 0, 0, 0.06)';
    return `<span class="m3-chip-count" style="background: ${badgeBg}; color: inherit;">${count}</span>`;
  };

  bar.innerHTML = `
    <!-- Left: Slim Google Material 3 Chips (Defaults + Dynamic Custom Filters) -->
    <div id="acadmail-chip-scroll-track" style="display: flex; align-items: center; gap: 8px; overflow-x: auto; scrollbar-width: none; -ms-overflow-style: none; flex: 1; min-width: 0; padding: 2px 0;">
      
      <!-- Brand Pill -->
      <div style="display: inline-flex; align-items: center; gap: 6px; height: 32px; box-sizing: border-box; padding: 0 10px; border-radius: 6px; background: ${
        isDark ? 'rgba(56, 139, 253, 0.12)' : 'rgba(26, 115, 232, 0.08)'
      }; color: ${isDark ? '#79c0ff' : '#1a73e8'}; flex-shrink: 0; white-space: nowrap; margin-right: 4px; border: 1px solid ${
        isDark ? 'rgba(56, 139, 253, 0.25)' : 'rgba(26, 115, 232, 0.2)'
      };">
        <img src="${chrome.runtime.getURL('icons/envelope-logo.png')}" alt="AcadMail" style="width: 17px; height: 17px; border-radius: 3px; object-fit: contain;" />
        <span style="font-family: 'Batangas', Roboto, sans-serif; font-weight: 700; font-size: 13px; letter-spacing: 0.2px;">AcadMail</span>
      </div>

      <!-- 1. All Emails -->
      <button class="m3-chip" data-cat="ALL" style="${getPillStyle('ALL')}">
        <span>All</span>
        ${renderCountBadge('ALL', items.length)}
      </button>

      <!-- 2. Academics -->
      <button class="m3-chip" data-cat="Academics" style="${getPillStyle('Academics')}">
        <span>Academics</span>
        ${renderCountBadge('Academics', acadCount)}
      </button>

      <!-- 3. Competitions -->
      <button class="m3-chip" data-cat="Competitions & Tournaments" style="${getPillStyle('Competitions & Tournaments')}">
        <span>Contests</span>
        ${renderCountBadge('Competitions & Tournaments', compCount)}
      </button>

      <!-- 4. Workshops -->
      <button class="m3-chip" data-cat="Workshops" style="${getPillStyle('Workshops')}">
        <span>Workshops</span>
        ${renderCountBadge('Workshops', workCount)}
      </button>

      <!-- 5. Reschedules -->
      <button class="m3-chip" data-cat="Class Rescheduling" style="${getPillStyle('Class Rescheduling')}">
        <span>Rescheduled</span>
        ${renderCountBadge('Class Rescheduling', reschedCount)}
      </button>

      <!-- 6. General -->
      <button class="m3-chip" data-cat="General" style="${getPillStyle('General')}">
        <span>General & PhD</span>
        ${renderCountBadge('General', genCount)}
      </button>

      <!-- 7. Dynamic User-Defined Custom Filters -->
      ${customFiltersCache
        .map((cf) => {
          const cfCount = items.filter((it) => it.category === cf.name).length;
          return `
          <button class="m3-chip" data-cat="${cf.name}" style="${getPillStyle(cf.name)}">
            <span>${cf.name}</span>
            ${renderCountBadge(cf.name, cfCount)}
          </button>
        `;
        })
        .join('')}

      <!-- 8. Add Custom Filter Button -->
      <button id="m3-add-filter-chip" title="Create your own custom academic filter" style="height: 32px; padding: 0 10px; border-radius: 6px; border: 1px dashed ${
        isDark ? 'rgba(255,255,255,0.25)' : '#94a3b8'
      }; background: transparent; color: ${
        isDark ? '#79c0ff' : '#1a73e8'
      }; font-size: 12px; font-weight: 500; font-family: Roboto, 'Google Sans', sans-serif; cursor: pointer; display: inline-flex; align-items: center; gap: 4px; flex-shrink: 0; white-space: nowrap; transition: all 0.15s ease;">
        <span style="font-size: 14px; font-weight: 600; line-height: 1;">+</span>
        <span>Filter</span>
      </button>
    </div>

    <!-- Right: Mini Deadlines Dropdown & Instant Hide Button -->
    <div style="display: flex; align-items: center; gap: 8px; flex-shrink: 0;">
      ${
        deadlineList.length > 0
          ? `
        <div style="position: relative; flex-shrink: 0;">
          <button id="m3-deadlines-btn" style="height: 32px; padding: 0 10px; border-radius: 6px; border: 1px solid ${
            isDark ? 'rgba(210,153,34,0.4)' : '#fde68a'
          }; background: ${isDark ? 'rgba(210,153,34,0.15)' : '#fffbeb'}; color: ${
              isDark ? '#e3b341' : '#b45309'
            }; font-size: 12px; font-weight: 600; font-family: Roboto, 'Google Sans', sans-serif; cursor: pointer; display: inline-flex; align-items: center; gap: 5px; white-space: nowrap;">
            <span style="font-weight: 700; font-family: Roboto, 'Google Sans', sans-serif; font-size: 11px;">DUE</span>
            <span>${deadlineList.length}</span>
          </button>

          <div id="m3-deadlines-popover" style="display: none; position: absolute; right: 0; top: 38px; width: 310px; background: ${
            isDark ? '#1e1f20' : '#ffffff'
          }; border: 1px solid ${
              isDark ? '#3c4043' : '#e0e2ec'
            }; border-radius: 8px; box-shadow: 0 10px 28px rgba(0,0,0,0.2); padding: 12px; z-index: 99999; font-family: Roboto, 'Google Sans', sans-serif;">
            <div style="font-weight: 600; color: ${
              isDark ? '#e3e3e3' : '#1f1f1f'
            }; font-size: 11.5px; margin-bottom: 8px; display: flex; justify-content: space-between; align-items: center;">
              <span>Detected Due Dates</span>
              <span style="font-size: 10px; color: #1a73e8; font-weight: 600;">+ Google Calendar</span>
            </div>
            <div style="max-height: 220px; overflow-y: auto; display: flex; flex-direction: column; gap: 6px;">
              ${deadlineList
                .map(
                  (d) => `
                <div style="padding: 8px 10px; background: ${
                  isDark ? '#2b2c2f' : '#f8fafd'
                }; border-radius: 6px; display: flex; align-items: center; justify-content: space-between; gap: 8px;">
                  <div style="overflow: hidden; flex: 1;">
                    <div style="font-size: 11.5px; font-weight: 500; color: ${
                      isDark ? '#e3e3e3' : '#1f1f1f'
                    }; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${d.title}</div>
                    <div style="font-size: 10.5px; color: ${isDark ? '#e3b341' : '#b45309'}; font-weight: 600; margin-top: 2px;">⏰ ${d.deadline}</div>
                  </div>
                  <a href="${createGCalUrl(d.title, 'Course deadline from email', d.deadline)}" target="_blank" style="text-decoration: none; flex-shrink: 0; padding: 3px 8px; background: ${
                    isDark ? '#004a77' : '#c2e7ff'
                  }; color: ${isDark ? '#c2e7ff' : '#001d35'}; border-radius: 4px; font-size: 10.5px; font-weight: 600;">+ GCal</a>
                </div>
              `
                )
                .join('')}
            </div>
          </div>
        </div>
      `
          : ''
      }

      <button id="acadmail-instant-revert-btn" title="Hide AcadMail toolbar" style="height: 32px; padding: 0 10px; border-radius: 6px; border: 1px solid transparent; background: transparent; color: ${
        isDark ? '#8e918f' : '#64748b'
      }; font-size: 12px; font-family: Roboto, 'Google Sans', sans-serif; cursor: pointer; display: inline-flex; align-items: center; gap: 4px; flex-shrink: 0; white-space: nowrap; transition: color 0.15s ease;">
        <span style="font-size: 13px; line-height: 1;">✕</span>
        <span>Hide</span>
      </button>
    </div>
  `;

  // Attach chip events
  bar.querySelectorAll('.m3-chip').forEach((btn) => {
    const buttonEl = btn as HTMLElement;
    buttonEl.onclick = () => {
      const cat = buttonEl.getAttribute('data-cat') as CategoryType | 'ALL';
      if (currentActiveFilter === cat && cat !== 'ALL') {
        filterGmailDom('ALL');
      } else {
        filterGmailDom(cat);
      }
    };
  });

  // + New Filter Chip Button
  const addFilterChip = bar.querySelector('#m3-add-filter-chip') as HTMLElement;
  if (addFilterChip) {
    addFilterChip.onclick = () => openAddFilterModal();
  }

  // Deadlines Popover
  const dlBtn = bar.querySelector('#m3-deadlines-btn') as HTMLElement;
  const dlPop = bar.querySelector('#m3-deadlines-popover') as HTMLElement;
  if (dlBtn && dlPop) {
    dlBtn.onclick = (e) => {
      e.stopPropagation();
      dlPop.style.display = dlPop.style.display === 'block' ? 'none' : 'block';
    };
    document.addEventListener('click', (e) => {
      if (!dlPop.contains(e.target as Node) && e.target !== dlBtn) {
        dlPop.style.display = 'none';
      }
    });
  }

  // Instant Revert Click Handler
  const revertBtn = bar.querySelector('#acadmail-instant-revert-btn') as HTMLElement;
  if (revertBtn) {
    revertBtn.onclick = () => {
      uiMode = 'off';
      if (typeof chrome !== 'undefined' && chrome.storage?.local) {
        chrome.storage.local.get(['acadmail_settings'], (res) => {
          const current = res.acadmail_settings || {};
          chrome.storage.local.set({
            acadmail_settings: { ...current, uiMode: 'off', inPageIntegration: false },
          });
        });
      }
      applyUiMode();
    };
  }
}

// In-Gmail Add Custom Filter Modal
function openAddFilterModal() {
  const existing = document.getElementById('acadmail-add-filter-modal');
  if (existing) {
    existing.remove();
    return;
  }

  const isDark = isGmailDark();
  const modal = document.createElement('div');
  modal.id = 'acadmail-add-filter-modal';
  modal.setAttribute(
    'style',
    `
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 320px;
    background: ${isDark ? '#1e1f20' : '#ffffff'};
    border: 1px solid ${isDark ? '#444746' : '#cbd5e1'};
    border-radius: 16px;
    box-shadow: 0 16px 36px rgba(0,0,0,0.25);
    padding: 16px;
    z-index: 9999999;
    font-family: -apple-system, BlinkMacSystemFont, "Google Sans", Roboto, sans-serif;
  `
  );

  modal.innerHTML = `
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
      <span style="font-weight: 700; font-size: 13px; color: ${isDark ? '#e3e3e3' : '#0f172a'};">
        ✨ Create Custom Academic Filter
      </span>
      <button id="modal-close-btn" style="border: none; background: transparent; color: #94a3b8; font-size: 14px; cursor: pointer;">✕</button>
    </div>

    <div style="display: flex; flex-direction: column; gap: 8px;">
      <div>
        <label style="font-size: 10.5px; font-weight: 600; color: ${isDark ? '#c4c7c5' : '#475569'}; display: block; margin-bottom: 3px;">
          Filter / Bucket Name
        </label>
        <input id="new-filter-name" type="text" placeholder="e.g. Mess & Hostel, Library, Placements" style="width: 100%; box-sizing: border-box; padding: 6px 10px; border-radius: 8px; border: 1px solid ${
          isDark ? '#444746' : '#cbd5e1'
        }; background: ${isDark ? '#2b2c2f' : '#f8fafc'}; color: ${isDark ? '#e3e3e3' : '#0f172a'}; font-size: 12px; outline: none;" />
      </div>

      <div>
        <label style="font-size: 10.5px; font-weight: 600; color: ${isDark ? '#c4c7c5' : '#475569'}; display: block; margin-bottom: 3px;">
          Keywords (comma-separated)
        </label>
        <input id="new-filter-keywords" type="text" placeholder="e.g. mess, rebate, room, warden, hostel" style="width: 100%; box-sizing: border-box; padding: 6px 10px; border-radius: 8px; border: 1px solid ${
          isDark ? '#444746' : '#cbd5e1'
        }; background: ${isDark ? '#2b2c2f' : '#f8fafc'}; color: ${isDark ? '#e3e3e3' : '#0f172a'}; font-size: 12px; outline: none;" />
      </div>

      <div style="display: flex; justify-content: flex-end; gap: 6px; margin-top: 6px;">
        <button id="modal-cancel-btn" style="padding: 5px 10px; border-radius: 8px; border: 1px solid transparent; background: transparent; color: ${
          isDark ? '#c4c7c5' : '#64748b'
        }; font-size: 11px; cursor: pointer;">Cancel</button>
        <button id="modal-save-btn" style="padding: 5px 14px; border-radius: 8px; border: none; background: #2563eb; color: #ffffff; font-size: 11px; font-weight: 600; cursor: pointer;">Save Filter</button>
      </div>
    </div>
  `;

  document.body.appendChild(modal);

  const closeBtn = modal.querySelector('#modal-close-btn') as HTMLElement;
  const cancelBtn = modal.querySelector('#modal-cancel-btn') as HTMLElement;
  const saveBtn = modal.querySelector('#modal-save-btn') as HTMLElement;
  const nameInput = modal.querySelector('#new-filter-name') as HTMLInputElement;
  const kwInput = modal.querySelector('#new-filter-keywords') as HTMLInputElement;

  closeBtn.onclick = () => modal.remove();
  cancelBtn.onclick = () => modal.remove();

  saveBtn.onclick = () => {
    const name = nameInput.value.trim();
    const keywords = kwInput.value.trim();
    if (!name) return;
    saveNewCustomFilter(name, keywords);
    modal.remove();
  };
}

// In-Gmail Re-label Dropdown Menu
function openRelabelMenu(anchorEl: HTMLElement, subject: string, sender: string, currentCategory: string) {
  const existing = document.getElementById('acadmail-relabel-popup');
  if (existing) {
    existing.remove();
    return;
  }

  const isDark = isGmailDark();
  const rect = anchorEl.getBoundingClientRect();

  const menu = document.createElement('div');
  menu.id = 'acadmail-relabel-popup';
  menu.setAttribute(
    'style',
    `
    position: fixed;
    top: ${rect.bottom + 4}px;
    left: ${Math.min(rect.left, window.innerWidth - 220)}px;
    width: 210px;
    background: ${isDark ? '#1e1f20' : '#ffffff'};
    border: 1px solid ${isDark ? '#444746' : '#e0e2ec'};
    border-radius: 12px;
    box-shadow: 0 10px 25px rgba(0,0,0,0.2);
    padding: 6px;
    z-index: 9999999;
    font-family: -apple-system, BlinkMacSystemFont, "Google Sans", Roboto, sans-serif;
  `
  );

  const defaultCategories = [
    'Academics',
    'Competitions & Tournaments',
    'Workshops',
    'Class Rescheduling',
    'General',
  ];

  const allCategories = [
    ...defaultCategories,
    ...customFiltersCache.map((cf) => cf.name).filter((n) => !defaultCategories.includes(n)),
  ];

  menu.innerHTML = `
    <div style="padding: 4px 8px; font-size: 10px; font-weight: 700; color: ${
      isDark ? '#8e918f' : '#64748b'
    }; text-transform: uppercase; border-bottom: 1px solid ${isDark ? '#333537' : '#f1f5f9'};">
      Change Category Label
    </div>
    <div style="display: flex; flex-direction: column; gap: 2px; padding-top: 4px; max-height: 200px; overflow-y: auto;">
      ${allCategories
        .map(
          (cat) => `
        <button class="relabel-opt" data-cat="${cat}" style="text-align: left; padding: 6px 8px; border-radius: 6px; border: none; background: ${
            cat === currentCategory ? (isDark ? '#004a77' : '#c2e7ff') : 'transparent'
          }; color: ${
            cat === currentCategory
              ? (isDark ? '#c2e7ff' : '#001d35')
              : (isDark ? '#e3e3e3' : '#1f1f1f')
          }; font-size: 11.5px; font-weight: ${
            cat === currentCategory ? '600' : '400'
          }; cursor: pointer; display: flex; align-items: center; justify-content: space-between;">
          <span>${cat}</span>
          ${cat === currentCategory ? '<span>✓</span>' : ''}
        </button>
      `
        )
        .join('')}
    </div>
  `;

  document.body.appendChild(menu);

  menu.querySelectorAll('.relabel-opt').forEach((btn) => {
    const b = btn as HTMLElement;
    b.onclick = (e) => {
      e.stopPropagation();
      const chosenCat = b.getAttribute('data-cat') || 'General';
      saveEmailLabelOverride(subject, subject, sender, chosenCat);
      menu.remove();
    };
  });

  const closeMenuListener = (evt: MouseEvent) => {
    if (!menu.contains(evt.target as Node) && !anchorEl.contains(evt.target as Node)) {
      menu.remove();
      document.removeEventListener('click', closeMenuListener);
    }
  };
  setTimeout(() => document.addEventListener('click', closeMenuListener), 50);
}

function updateToolbarChipsActiveState() {
  if (uiMode === 'blended' && scannedItemsCache.length > 0) {
    injectMaterial3ToolbarChips(scannedItemsCache);
  }
}

// =========================================================================
// 2. IN-EMAIL READING VIEW: ULTRA-COMPACT GEMINI SMART CHIP WITH RELABEL
// =========================================================================
function checkAndInjectEmailBrief() {
  if (uiMode === 'off') return;

  const emailData = extractGmailData();
  if (!emailData) {
    document.getElementById('acadmail-email-brief-card')?.remove();
    return;
  }

  const subjectContainer =
    document.querySelector('div.ha') ||
    document.querySelector('h2.hP')?.parentElement ||
    document.querySelector('div[role="main"] h2')?.parentElement;

  if (!subjectContainer) return;

  const existingCard = document.getElementById('acadmail-email-brief-card');
  const cardEmailId = existingCard?.getAttribute('data-email-id');

  if (existingCard && cardEmailId === emailData.id) {
    return;
  }

  if (existingCard) {
    existingCard.remove();
  }

  const classification = classifyInboxItem(emailData.subject, emailData.senderName, emailData.bodyText, emailData.id);
  const fullText = `${emailData.subject} ${emailData.bodyText}`;

  // Extract deadline
  const datePattern = /\b(?:due|deadline|by|on|date:|till)\s+([A-Za-z]{3,9}\s+\d{1,2}(?:st|nd|rd|th)?(?:\s*,\s*\d{4})?|\d{1,2}\/\d{1,2}(?:\/\d{2,4})?|\d{1,2}\s+[A-Za-z]{3,9})\b/i;
  const deadlineMatch = fullText.match(datePattern);
  const detectedDeadline = deadlineMatch ? deadlineMatch[1] : null;

  // Extract meeting
  const meetMatch = fullText.match(/https?:\/\/(?:[a-zA-Z0-9-]+\.)?(?:zoom\.us\/j|meet\.google\.com|teams\.microsoft\.com\/l)\/[^\s<>"']+/i);
  const meetingUrl = meetMatch ? meetMatch[0] : null;

  // Key takeaways
  const sentences = emailData.bodyText
    .split(/\.\s+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 25 && !s.includes('http') && !s.includes('unsubscribe') && !s.includes('Regards'));
  const bullets = sentences.slice(0, 3);
  if (bullets.length === 0) {
    bullets.push(`Announcement regarding ${emailData.subject} from ${emailData.senderName}.`);
  }

  const isDark = isGmailDark();
  const card = document.createElement('div');
  card.id = 'acadmail-email-brief-card';
  card.setAttribute('data-email-id', emailData.id);
  card.setAttribute(
    'style',
    `
    margin: 4px 0 10px 0;
    padding: 6px 12px;
    background: ${isDark ? '#1e1f20' : '#f8fafd'};
    border: 1px solid ${isDark ? '#333537' : '#e0e7ff'};
    border-radius: 8px;
    font-family: -apple-system, BlinkMacSystemFont, "Google Sans", Roboto, sans-serif;
    font-size: 12px;
    color: ${isDark ? '#e3e3e3' : '#1f1f1f'};
    transition: all 0.2s ease;
  `
  );

  card.innerHTML = `
    <!-- Top 1-Line Compact Summary Bar -->
    <div style="display: flex; align-items: center; justify-content: space-between; gap: 8px;">
      <div id="m3-brief-toggle-line" style="display: flex; align-items: center; gap: 6px; cursor: pointer; flex: 1; overflow: hidden;">
        <img src="${chrome.runtime.getURL('icons/envelope-logo.png')}" alt="AcadMail" style="width: 14px; height: 14px; border-radius: 2.5px; object-fit: contain; flex-shrink: 0;" />
        <span style="font-family: 'Batangas', Roboto, sans-serif; font-weight: 700; font-size: 12px; color: ${isDark ? '#79c0ff' : '#1a73e8'}; shrink: 0;">AcadMail:</span>
        <span style="font-size: 11.5px; color: ${isDark ? '#c4c7c5' : '#475569'}; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
          ${detectedDeadline ? `⏰ Due: <strong>${detectedDeadline}</strong> • ` : ''}${bullets[0]}
        </span>
      </div>

      <div style="display: flex; align-items: center; gap: 5px; shrink: 0;">
        <!-- Category Chip with Re-label button -->
        <span style="padding: 1px 7px; border-radius: 4px; font-size: 10px; font-weight: 600; background: ${
          isDark ? 'rgba(56, 139, 253, 0.2)' : '#e8f0fe'
        }; color: ${isDark ? '#79c0ff' : '#1a73e8'};">
          ${classification.category}
        </span>

        <button id="acadmail-brief-relabel-btn" title="Change this email's category label" style="cursor: pointer; padding: 2px 5px; border-radius: 4px; border: 1px dashed ${
          isDark ? '#444746' : '#cbd5e1'
        }; background: transparent; font-size: 10px; font-weight: 500; color: ${isDark ? '#a8c7fa' : '#1a73e8'};">
          ✎ Relabel
        </button>

        ${
          detectedDeadline
            ? `
          <a href="${createGCalUrl(
            emailData.subject,
            emailData.bodyText.slice(0, 300),
            detectedDeadline
          )}" target="_blank" style="text-decoration: none; padding: 2px 7px; background: ${
                isDark ? '#004a77' : '#c2e7ff'
              }; color: ${
                isDark ? '#c2e7ff' : '#001d35'
              }; border-radius: 6px; font-size: 10px; font-weight: 600;">+ GCal</a>
        `
            : ''
        }
        <button id="m3-brief-expand-btn" style="cursor: pointer; padding: 2px 6px; border-radius: 4px; border: 1px solid ${
          isDark ? '#444746' : '#d2e3fc'
        }; background: transparent; font-size: 10px; font-weight: 600; color: ${isDark ? '#79c0ff' : '#1a73e8'};">
          ${isBriefExpanded ? 'Collapse ▴' : 'Details ▾'}
        </button>
        <button id="m3-brief-dismiss-btn" title="Dismiss card" style="cursor: pointer; padding: 2px 4px; border: none; background: transparent; color: #94a3b8; font-size: 11px;">✕</button>
      </div>
    </div>

    <!-- Expandable Drawer Details -->
    <div id="m3-brief-drawer" style="display: ${
      isBriefExpanded ? 'flex' : 'none'
    }; flex-direction: column; gap: 8px; margin-top: 8px; padding-top: 8px; border-top: 1px dashed ${
    isDark ? '#333537' : '#e0e2ec'
  };">
      <ul style="margin: 0; padding-left: 16px; display: flex; flex-direction: column; gap: 3px; font-size: 11.5px; color: ${
        isDark ? '#c4c7c5' : '#334155'
      }; line-height: 1.45;">
        ${bullets.map((b) => `<li>${b}</li>`).join('')}
      </ul>

      <!-- Action Row: Meeting Links + Quick Reply Chips -->
      <div style="display: flex; flex-wrap: wrap; align-items: center; gap: 6px; padding-top: 2px;">
        ${
          meetingUrl
            ? `
          <a href="${meetingUrl}" target="_blank" style="text-decoration: none; display: inline-flex; align-items: center; gap: 4px; padding: 3px 8px; background: ${
                isDark ? '#143e2e' : '#e6f4ea'
              }; color: ${
                isDark ? '#a7f3d0' : '#137333'
              }; border-radius: 6px; font-size: 10.5px; font-weight: 600;">
            <span>🎥</span>
            <span>Join Meeting</span>
          </a>
        `
            : ''
        }

        <span style="font-size: 10px; font-weight: 600; color: #94a3b8; margin-left: 2px;">Reply draft:</span>

        <button class="m3-quick-reply-btn" data-reply="confirm" style="cursor: pointer; padding: 2px 8px; border-radius: 12px; border: 1px solid ${
          isDark ? '#444746' : '#cbd5e1'
        }; background: transparent; color: ${isDark ? '#e3e3e3' : '#334155'}; font-size: 10.5px; font-weight: 500;">
          Confirm Attendance
        </button>

        <button class="m3-quick-reply-btn" data-reply="extension" style="cursor: pointer; padding: 2px 8px; border-radius: 12px; border: 1px solid ${
          isDark ? '#444746' : '#cbd5e1'
        }; background: transparent; color: ${isDark ? '#e3e3e3' : '#334155'}; font-size: 10.5px; font-weight: 500;">
          Request Extension
        </button>

        <button class="m3-quick-reply-btn" data-reply="doubt" style="cursor: pointer; padding: 2px 8px; border-radius: 12px; border: 1px solid ${
          isDark ? '#444746' : '#cbd5e1'
        }; background: transparent; color: ${isDark ? '#e3e3e3' : '#334155'}; font-size: 10.5px; font-weight: 500;">
          Ask Clarification
        </button>
      </div>
    </div>
  `;

  // Relabel button handler
  const relabelBtn = card.querySelector('#acadmail-brief-relabel-btn') as HTMLElement;
  if (relabelBtn) {
    relabelBtn.onclick = (e) => {
      e.stopPropagation();
      openRelabelMenu(relabelBtn, emailData.subject, emailData.senderName, classification.category);
    };
  }

  // Toggle expand/collapse
  const drawer = card.querySelector('#m3-brief-drawer') as HTMLElement;
  const toggleBtn = card.querySelector('#m3-brief-expand-btn') as HTMLElement;
  const toggleLine = card.querySelector('#m3-brief-toggle-line') as HTMLElement;

  const toggleAction = () => {
    isBriefExpanded = !isBriefExpanded;
    drawer.style.display = isBriefExpanded ? 'flex' : 'none';
    toggleBtn.innerText = isBriefExpanded ? 'Collapse ▴' : 'Details ▾';
  };

  toggleBtn.onclick = toggleAction;
  toggleLine.onclick = toggleAction;

  // Dismiss
  const dismissBtn = card.querySelector('#m3-brief-dismiss-btn') as HTMLElement;
  if (dismissBtn) {
    dismissBtn.onclick = () => card.remove();
  }

  // Quick Reply handler
  card.querySelectorAll('.m3-quick-reply-btn').forEach((btn) => {
    const buttonEl = btn as HTMLElement;
    buttonEl.onclick = async () => {
      const type = buttonEl.getAttribute('data-reply');
      let text = '';
      if (type === 'confirm') {
        text = `Dear ${emailData.senderName || 'Professor'},\n\nThank you for the update regarding "${emailData.subject}". I confirm my participation and will ensure all prerequisites are met.\n\nBest regards,\n[Your Name]\n[Student ID]`;
      } else if (type === 'extension') {
        text = `Dear Professor ${emailData.senderName || ''},\n\nI hope this email finds you well. I am writing to respectfully ask if it might be possible to grant a short extension on the submission for "${emailData.subject}". I want to ensure my work meets the highest standards.\n\nThank you for your time and understanding.\n\nSincerely,\n[Your Name]\n[Student ID]`;
      } else {
        text = `Dear Professor ${emailData.senderName || ''},\n\nI hope you are well. Regarding the announcement on "${emailData.subject}", I had a quick question regarding the specifications and would appreciate some guidance.\n\nThank you very much.\n\nSincerely,\n[Your Name]\n[Student ID]`;
      }

      await injectDraftIntoGmailReplyBox(text, buttonEl);
    };
  });

  subjectContainer.parentElement?.insertBefore(card, subjectContainer.nextSibling);
}

// Injects draft directly into Gmail's native reply compose box
async function injectDraftIntoGmailReplyBox(replyText: string, triggerBtn: HTMLElement) {
  const originalText = triggerBtn.innerText;
  triggerBtn.innerText = 'Drafting...';

  const replyButton =
    (document.querySelector('div[role="button"][aria-label*="Reply"]') as HTMLElement) ||
    (document.querySelector('.ams.bkH') as HTMLElement) ||
    (document.querySelector('.T-I.J-J5-Ji.T-I-Js-IF[data-tooltip*="Reply"]') as HTMLElement) ||
    (document.querySelector('span[role="button"][aria-label*="Reply"]') as HTMLElement);

  if (replyButton) {
    replyButton.click();
  }

  let attempts = 0;
  const interval = setInterval(() => {
    attempts++;
    const composeBox = document.querySelector('div[aria-label="Message Body"], div[role="textbox"][contenteditable="true"]') as HTMLElement;

    if (composeBox) {
      clearInterval(interval);
      composeBox.focus();
      composeBox.innerText = replyText;
      composeBox.dispatchEvent(new Event('input', { bubbles: true }));
      composeBox.scrollIntoView({ behavior: 'smooth', block: 'center' });

      triggerBtn.innerText = '✅ Drafted!';
      setTimeout(() => {
        triggerBtn.innerText = originalText;
      }, 2500);
    } else if (attempts > 15) {
      clearInterval(interval);
      triggerBtn.innerText = '⚠️ Click Reply first';
      setTimeout(() => {
        triggerBtn.innerText = originalText;
      }, 2000);
    }
  }, 200);
}

// Native Google Workspace Side-Rail Icon
function injectSideRailIcon() {
  if (uiMode === 'off' || document.getElementById('acadmail-siderail-btn')) return;

  const sideRail =
    document.querySelector('div.aDG') ||
    document.querySelector('div[aria-label="Side panel"]') ||
    document.querySelector('div.bq9');

  if (!sideRail) return;

  const btn = document.createElement('div');
  btn.id = 'acadmail-siderail-btn';
  btn.title = 'AcadMail AI Copilot';
  btn.setAttribute('role', 'button');
  btn.setAttribute('tabindex', '0');

  const isDark = isGmailDark();
  btn.setAttribute(
    'style',
    `
    width: 36px;
    height: 36px;
    margin: 6px auto;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    background: transparent;
    color: ${isDark ? '#79c0ff' : '#1a73e8'};
    transition: background 0.15s;
  `
  );

  btn.innerHTML = `
    <img src="${chrome.runtime.getURL('icons/envelope-logo.png')}" alt="AcadMail" style="width: 22px; height: 22px; border-radius: 4px; object-fit: contain;" />
  `;

  btn.onmouseenter = () => (btn.style.background = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)');
  btn.onmouseleave = () => (btn.style.background = 'transparent');
  btn.onclick = () => safeSendMessage({ type: 'OPEN_SIDEPANEL' });

  sideRail.prepend(btn);
}

// Extract email data from Gmail DOM
function extractGmailData(): ExtractedEmail | null {
  const subjectEl =
    document.querySelector('h2.hP') ||
    document.querySelector('div.ha h2') ||
    document.querySelector('div[role="main"] h2') ||
    document.querySelector('h2[data-legacy-thread-id]') ||
    document.querySelector('h1[data-thread-perm-id]');

  const subject = subjectEl?.textContent?.trim() || '';

  const bodyContainers = document.querySelectorAll(
    '.a3s.aiL, div[role="listitem"] .adn .a3s, .ii.gt, div.adn.ads'
  );

  let bodyText = '';
  if (bodyContainers.length > 0) {
    const latestMsg = bodyContainers[bodyContainers.length - 1];
    bodyText = latestMsg.textContent?.trim() || '';
  }

  if (subject && (bodyText || bodyContainers.length > 0)) {
    const senderEl =
      document.querySelector('span[email]') ||
      document.querySelector('.gD') ||
      document.querySelector('.go') ||
      document.querySelector('span.zF');

    const senderEmail =
      senderEl?.getAttribute('email') ||
      senderEl?.textContent?.trim() ||
      'academic@university.edu';
    const senderName =
      senderEl?.getAttribute('name') ||
      senderEl?.textContent?.trim() ||
      'Academic Sender';

    const dateEl =
      document.querySelector('.g3') ||
      document.querySelector('span.mI') ||
      document.querySelector('.date');
    const dateStr =
      dateEl?.getAttribute('title') ||
      dateEl?.textContent?.trim() ||
      new Date().toLocaleString();

    const hash = window.location.hash || '';
    const emailId =
      hash.replace(/[^a-zA-Z0-9_-]/g, '_') || `email-${Date.now()}`;

    return {
      id: emailId,
      subject,
      senderName,
      senderEmail,
      recipient: 'Me',
      dateStr,
      bodyText: bodyText.slice(0, 5000),
      url: window.location.href,
    };
  }

  return null;
}

// Inline Professor Tone Polisher in Compose Dialog
function injectComposePolisher() {
  const composeToolbars = document.querySelectorAll('tr.btC, .gU.Up');

  composeToolbars.forEach((toolbar) => {
    if (toolbar.querySelector('.acadmail-polish-btn')) return;

    const polishBtn = document.createElement('div');
    polishBtn.className = 'acadmail-polish-btn';
    polishBtn.setAttribute(
      'style',
      `
      display: inline-flex;
      align-items: center;
      gap: 4px;
      margin-left: 8px;
      padding: 5px 10px;
      background: linear-gradient(135deg, #1e1b4b, #312e81);
      color: #e0e7ff;
      border: 1px solid rgba(129, 140, 248, 0.4);
      border-radius: 9999px;
      font-size: 11px;
      font-weight: 600;
      font-family: -apple-system, BlinkMacSystemFont, "Google Sans", Roboto, sans-serif;
      cursor: pointer;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
      transition: all 0.2s ease;
      position: relative;
    `
    );

    polishBtn.innerHTML = `
      <span style="font-size: 11px;">✨</span>
      <span>Polish</span>
    `;

    polishBtn.onclick = (e) => {
      e.stopPropagation();
      openToneMenu(toolbar as HTMLElement, polishBtn);
    };

    toolbar.appendChild(polishBtn);
  });
}

function openToneMenu(toolbar: HTMLElement, polishBtn: HTMLElement) {
  const existingMenu = document.getElementById('acadmail-tone-menu');
  if (existingMenu) {
    existingMenu.remove();
    return;
  }

  const composeDialog = toolbar.closest('div[role="dialog"]') || toolbar.closest('.M9');
  const editableBody = composeDialog?.querySelector('div[aria-label="Message Body"], div[contenteditable="true"]') as HTMLElement;
  const currentText = editableBody?.innerText?.trim() || '';

  const menu = document.createElement('div');
  menu.id = 'acadmail-tone-menu';
  menu.setAttribute(
    'style',
    `
    position: absolute;
    bottom: 40px;
    left: 8px;
    z-index: 999999;
    background: #ffffff;
    border: 1px solid #e2e8f0;
    border-radius: 12px;
    box-shadow: 0 10px 25px -5px rgba(0,0,0,0.18);
    padding: 6px;
    width: 240px;
    font-family: -apple-system, BlinkMacSystemFont, "Google Sans", Roboto, sans-serif;
  `
  );

  menu.innerHTML = `
    <div style="padding: 4px 8px; font-size: 10px; font-weight: 700; color: #64748b; text-transform: uppercase;">Academic Tone</div>
    <div style="display: flex; flex-direction: column; gap: 3px; padding-top: 4px;">
      <button class="acad-tone-opt" data-tone="formal" style="text-align: left; padding: 6px 8px; border-radius: 6px; border: none; background: transparent; cursor: pointer; font-size: 11px; font-weight: 600; color: #1e293b;">Respectful & Formal</button>
      <button class="acad-tone-opt" data-tone="extension" style="text-align: left; padding: 6px 8px; border-radius: 6px; border: none; background: transparent; cursor: pointer; font-size: 11px; font-weight: 600; color: #1e293b;">Request Extension</button>
      <button class="acad-tone-opt" data-tone="doubt" style="text-align: left; padding: 6px 8px; border-radius: 6px; border: none; background: transparent; cursor: pointer; font-size: 11px; font-weight: 600; color: #1e293b;">Clarify Doubt</button>
      <button class="acad-tone-opt" data-tone="lor" style="text-align: left; padding: 6px 8px; border-radius: 6px; border: none; background: transparent; cursor: pointer; font-size: 11px; font-weight: 600; color: #1e293b;">Request LoR / Reference</button>
    </div>
  `;

  menu.querySelectorAll('.acad-tone-opt').forEach((btn) => {
    const buttonEl = btn as HTMLElement;
    buttonEl.onclick = async () => {
      const tone = buttonEl.getAttribute('data-tone') || 'formal';
      menu.remove();
      await executePolish(editableBody, currentText, tone, polishBtn);
    };
  });

  polishBtn.appendChild(menu);

  const closeListener = (evt: MouseEvent) => {
    if (!menu.contains(evt.target as Node) && !polishBtn.contains(evt.target as Node)) {
      menu.remove();
      document.removeEventListener('click', closeListener);
    }
  };
  setTimeout(() => document.addEventListener('click', closeListener), 100);
}

async function executePolish(
  editableBody: HTMLElement | null,
  roughText: string,
  tone: string,
  polishBtn: HTMLElement
) {
  if (!editableBody) return;

  const originalBtnHTML = polishBtn.innerHTML;
  polishBtn.innerHTML = `<span>Polishing...</span>`;

  try {
    const settings = await new Promise<any>((resolve) => {
      if (typeof chrome !== 'undefined' && chrome.storage?.local) {
        chrome.storage.local.get(['acadmail_settings'], (r) => resolve(r.acadmail_settings || {}));
      } else {
        resolve({});
      }
    });

    const apiKey = settings.apiKey || '';
    const groqKey = settings.groqApiKey || '';
    const textToPolish = roughText || 'Need extension for lab assignment due this friday because of fever.';

    const polished = await callPolishAI(textToPolish, tone, apiKey, groqKey);

    editableBody.focus();
    editableBody.innerText = polished;
    editableBody.dispatchEvent(new Event('input', { bubbles: true }));

    polishBtn.innerHTML = `<span>Polished!</span>`;
    setTimeout(() => {
      polishBtn.innerHTML = originalBtnHTML;
    }, 2000);
  } catch (err: any) {
    polishBtn.innerHTML = `<span>Error</span>`;
    setTimeout(() => {
      polishBtn.innerHTML = originalBtnHTML;
    }, 2000);
  }
}

async function callPolishAI(rough: string, tone: string, apiKey: string, groqKey: string): Promise<string> {
  const toneMap: Record<string, string> = {
    formal: 'Polite, professional academic tone to a professor.',
    extension: 'Polite, respectful request for an assignment deadline extension showing dedication.',
    doubt: 'Polite conceptual question or office hours request referencing lecture material.',
    lor: 'Courteous inquiry requesting a Letter of Recommendation for graduate studies/internships.',
  };

  const prompt = `Transform this student's rough notes into a courteous, polished academic email to a professor.
Tone: ${toneMap[tone] || 'Formal'}
Guidelines:
- Include respectful salutation ("Dear Professor [Name],", "I hope this email finds you well.")
- Keep it concise, courteous, and respectful.
- Retain all dates, assignment titles, or reasons mentioned.
- Conclude with a warm academic sign-off ("Sincerely,", "Best regards," followed by "[Your Name] [Student ID]").
- Output ONLY the final email text.

Student's notes:
${rough}`;

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
          messages: [{ role: 'user', content: prompt }],
          temperature: 0.3,
        }),
      });
      if (res.ok) {
        const d = await res.json();
        return d.choices?.[0]?.message?.content?.trim() || rough;
      }
    } catch (e) {}
  }

  if (apiKey && apiKey.trim()) {
    const candidateModels = ['models/gemini-2.0-flash', 'models/gemini-3.8-flash', 'models/gemini-1.5-flash'];
    for (const m of candidateModels) {
      try {
        const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/${m}:generateContent?key=${apiKey.trim()}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: { temperature: 0.3 },
          }),
        });
        if (res.ok) {
          const d = await res.json();
          const t = d?.candidates?.[0]?.content?.parts?.[0]?.text;
          if (t) return t.trim();
        }
      } catch (e) {}
    }
  }

  return `Dear Professor,\n\nI hope this email finds you well.\n\nI am writing to respectfully request your guidance regarding ${rough}.\n\nThank you for your time and consideration.\n\nSincerely,\n[Your Name]\n[Student ID]`;
}

// Runtime message listener
if (typeof chrome !== 'undefined' && chrome.runtime?.onMessage) {
  chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
    if (message.type === 'GET_ACTIVE_EMAIL') {
      const email = extractGmailData();
      sendResponse({ email });
    } else if (message.type === 'SCAN_INBOX') {
      const items = scanVisibleInbox();
      sendResponse({ items });
    } else if (message.type === 'FILTER_GMAIL_DOM') {
      filterGmailDom(message.category);
      sendResponse({ success: true });
    } else if (message.type === 'SET_UI_MODE') {
      uiMode = message.mode;
      applyUiMode();
      sendResponse({ success: true });
    } else if (message.type === 'RELABEL_EMAIL') {
      saveEmailLabelOverride(message.emailId, message.subject || '', message.sender || '', message.newCategory);
      sendResponse({ success: true });
    } else if (message.type === 'UPDATE_CUSTOM_FILTERS') {
      loadSettings();
      sendResponse({ success: true });
    }
    return true;
  });
}

// Bootstrap
loadSettings();

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    setTimeout(scanVisibleInbox, 1200);
    setTimeout(checkAndInjectEmailBrief, 1200);
    setTimeout(injectSideRailIcon, 1200);
    setTimeout(injectComposePolisher, 1200);
    setTimeout(syncGmailTheme, 1200);
  });
} else {
  setTimeout(scanVisibleInbox, 1200);
  setTimeout(checkAndInjectEmailBrief, 1200);
  setTimeout(injectSideRailIcon, 1200);
  setTimeout(injectComposePolisher, 1200);
  setTimeout(syncGmailTheme, 1200);
}

// Watch DOM mutations & URL changes
let lastUrl = location.href;
new MutationObserver(() => {
  const url = location.href;
  if (url !== lastUrl) {
    lastUrl = url;
    setTimeout(() => {
      safeSendMessage({ type: 'EMAIL_CHANGED' });
      syncGmailTheme();
      scanVisibleInbox();
      checkAndInjectEmailBrief();
      injectSideRailIcon();
    }, 400);
  }
  injectComposePolisher();
}).observe(document, { subtree: true, childList: true });

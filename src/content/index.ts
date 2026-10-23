import { ExtractedEmail, InboxRowItem, CategoryType, UiIntegrationMode } from '../types';

console.log('[AcadMail AI] Material 3 Blended Content Script initialized.');

let lastClickedRow: HTMLElement | null = null;
let currentActiveFilter: CategoryType | 'ALL' = 'ALL';
let scannedItemsCache: InboxRowItem[] = [];
let uiMode: UiIntegrationMode = 'blended';
let isFilterBarMinimized = false;

// Safe message sender
function safeSendMessage(message: any) {
  try {
    if (typeof chrome !== 'undefined' && chrome.runtime?.id) {
      chrome.runtime.sendMessage(message).catch(() => {});
    }
  } catch (e) {}
}

// Detect Gmail Dark Mode
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

// Load UI Mode Settings
function loadSettings() {
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
      }
      applyUiMode();
    });
  }
}

function applyUiMode() {
  // Clean up existing elements
  document.getElementById('acadmail-inbox-filter-bar')?.remove();
  document.getElementById('acadmail-native-chip-bar')?.remove();
  document.getElementById('acadmail-minimized-pill')?.remove();
  document.getElementById('acadmail-email-brief-card')?.remove();
  document.getElementById('acadmail-siderail-btn')?.remove();

  if (uiMode === 'off') {
    filterGmailDom('ALL');
    return;
  }

  // Inject based on mode
  scanVisibleInbox();
  checkAndInjectEmailBrief();
  injectSideRailIcon();
}

// Inlined classifier for standalone content.js
function classifyInboxItem(
  subject: string,
  sender: string,
  snippet: string
): { category: CategoryType; courseCode?: string; isPhd?: boolean } {
  const combined = `${subject} ${sender} ${snippet}`.toLowerCase();

  const courseMatch = subject.match(/\b([A-Z]{2,4}\s?[-_]?\s?\d{3,4}[A-Z]?)\b/i);
  const courseCode = courseMatch ? courseMatch[1].toUpperCase() : undefined;

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
      }, 400);
      setTimeout(() => {
        safeSendMessage({ type: 'EMAIL_CHANGED' });
        checkAndInjectEmailBrief();
      }, 900);
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

    const { category, courseCode, isPhd } = classifyInboxItem(subject, sender, snippet);

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
    injectRowBadge(rowEl, category, courseCode, isPhd);
  });

  scannedItemsCache = items;

  if (uiMode === 'blended') {
    injectMaterial3ChipBar(items);
  } else if (uiMode === 'floating') {
    injectFloatingFilterBar(items);
  }

  return items;
}

// Inject modern badge directly into the Gmail row (Material styled)
function injectRowBadge(
  rowEl: HTMLElement,
  category: CategoryType,
  courseCode?: string,
  isPhd?: boolean
) {
  const existing = rowEl.querySelector('.acadmail-row-badge');
  if (existing) existing.remove();

  const subjectContainer = rowEl.querySelector('.y6, .bog');
  if (!subjectContainer) return;

  const isDark = isGmailDark();
  const badge = document.createElement('span');
  badge.className = 'acadmail-row-badge';

  let badgeColor = isDark
    ? 'background: #1e3a5f; color: #a8c7fa; border: 1px solid #2b5278;'
    : 'background: #e8f0fe; color: #1967d2; border: 1px solid #d2e3fc;';
  let icon = '🎓';
  let labelText = courseCode || 'Academics';

  if (category === 'Competitions & Tournaments') {
    badgeColor = isDark
      ? 'background: #4a3410; color: #fed7aa; border: 1px solid #785312;'
      : 'background: #fef3c7; color: #b45309; border: 1px solid #fde68a;';
    icon = '🏆';
    labelText = 'Contest / Sports';
  } else if (category === 'Workshops') {
    badgeColor = isDark
      ? 'background: #143e2e; color: #a7f3d0; border: 1px solid #1e5e45;'
      : 'background: #e6f4ea; color: #137333; border: 1px solid #ceead6;';
    icon = '🛠️';
    labelText = 'Workshop / Talk';
  } else if (category === 'Class Rescheduling') {
    badgeColor = isDark
      ? 'background: #4c1d24; color: #fecdd3; border: 1px solid #881337;'
      : 'background: #fce8e6; color: #c5221f; border: 1px solid #fad2cf;';
    icon = '⏰';
    labelText = 'Rescheduled';
  } else if (isPhd) {
    badgeColor = isDark
      ? 'background: #2a2b2e; color: #c4c7c5; border: 1px solid #444746;'
      : 'background: #f1f3f4; color: #5f6368; border: 1px solid #dadce0;';
    icon = '📜';
    labelText = 'PhD / Viva';
  } else if (category === 'General') {
    badgeColor = isDark
      ? 'background: #23272e; color: #c4c7c5; border: 1px solid #3c4043;'
      : 'background: #f8f9fa; color: #5f6368; border: 1px solid #dadce0;';
    icon = '📢';
    labelText = 'General';
  }

  badge.setAttribute(
    'style',
    `
    display: inline-flex;
    align-items: center;
    gap: 3px;
    padding: 0 6px;
    height: 18px;
    margin-right: 6px;
    border-radius: 4px;
    font-size: 11px;
    font-weight: 500;
    font-family: "Google Sans", Roboto, RobotoDraft, Helvetica, Arial, sans-serif;
    vertical-align: middle;
    cursor: ${courseCode ? 'pointer' : 'default'};
    ${badgeColor}
  `
  );

  badge.innerText = `${icon} ${labelText}`;

  // Course code quick search capability
  if (courseCode) {
    badge.title = `Search Gmail for "${courseCode}"`;
    badge.onclick = (e) => {
      e.stopPropagation();
      executeGmailSearch(courseCode);
    };
  }

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

// Filter rows on Gmail DOM
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
    if (category === 'Academics' && (badgeText.includes('🎓') || badgeText.includes('Academics'))) match = true;
    if (category === 'Competitions & Tournaments' && (badgeText.includes('🏆') || badgeText.includes('Contest'))) match = true;
    if (category === 'Workshops' && (badgeText.includes('🛠️') || badgeText.includes('Workshop'))) match = true;
    if (category === 'Class Rescheduling' && (badgeText.includes('⏰') || badgeText.includes('Rescheduled'))) match = true;
    if (category === 'General' && (badgeText.includes('📢') || badgeText.includes('General') || badgeText.includes('PhD'))) match = true;

    if (match) {
      rowEl.style.display = '';
    } else {
      rowEl.style.display = 'none';
    }
  });

  updateChipBarActiveState();
}

function clickRowByIndex(index: number) {
  const rows = document.querySelectorAll('tr.zA');
  if (rows[index]) {
    const target = rows[index] as HTMLElement;
    target.click();
  }
}

// Google Calendar URL generator
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
    details: `${details}\n\n— Auto-extracted by AcadMail AI for Google Workspace`,
  });

  return `${baseUrl}&${params.toString()}${datesParam}`;
}

// =========================================================================
// 1. MATERIAL 3 BLENDED FILTER CHIPS (Seamless with native Gmail action bar)
// =========================================================================
function injectMaterial3ChipBar(items: InboxRowItem[]) {
  if (uiMode !== 'blended') return;

  const mailContainer =
    document.querySelector('div[gh="tm"]') ||
    document.querySelector('div.G-atb') ||
    document.querySelector('div.aeF') ||
    document.querySelector('div[role="main"]');

  if (!mailContainer) return;

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
    else genCount++;

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
      gap: 8px;
      padding: 6px 16px;
      background: transparent;
      border-bottom: 1px solid ${isDark ? '#444746' : '#e0e2ec'};
      font-family: "Google Sans", Roboto, RobotoDraft, Helvetica, Arial, sans-serif;
      font-size: 13px;
      z-index: 20;
      transition: background 0.2s ease;
    `
    );

    const targetAnchor = document.querySelector('div.aeF') || document.querySelector('div[gh="tm"]') || mailContainer;
    targetAnchor.parentElement?.insertBefore(bar, targetAnchor);
  }

  // Material 3 Chip Styling
  const getChipStyle = (cat: CategoryType | 'ALL') => {
    const isActive = currentActiveFilter === cat;
    if (isActive) {
      return `
        height: 32px;
        padding: 0 12px;
        border-radius: 8px;
        border: none;
        background: ${isDark ? '#004a77' : '#c2e7ff'};
        color: ${isDark ? '#c2e7ff' : '#001d35'};
        font-weight: 600;
        cursor: pointer;
        display: inline-flex;
        align-items: center;
        gap: 6px;
        font-size: 13px;
        transition: all 0.15s ease;
      `;
    }
    return `
      height: 32px;
      padding: 0 12px;
      border-radius: 8px;
      border: 1px solid ${isDark ? '#444746' : '#747775'};
      background: transparent;
      color: ${isDark ? '#e3e3e3' : '#444746'};
      font-weight: 500;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: 6px;
      font-size: 13px;
      transition: all 0.15s ease;
    `;
  };

  bar.innerHTML = `
    <!-- Left: Material 3 Horizontal Filter Chips -->
    <div style="display: flex; align-items: center; gap: 8px; overflow-x: auto; padding: 2px 0;">
      <!-- Google Gemini Sparkle Branding -->
      <div title="AcadMail AI for Google Workspace" style="display: flex; align-items: center; gap: 4px; padding-right: 8px; border-right: 1px solid ${
        isDark ? '#444746' : '#dadce0'
      }; color: ${isDark ? '#a8c7fa' : '#0b57d0'}; font-weight: 600; font-size: 13px; white-space: nowrap;">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2L14.4 9.6L22 12L14.4 14.4L12 22L9.6 14.4L2 12L9.6 9.6L12 2Z"/>
        </svg>
        <span>AcadMail</span>
      </div>

      <button class="m3-chip" data-cat="ALL" style="${getChipStyle('ALL')}">
        ${currentActiveFilter === 'ALL' ? '✓ ' : ''}All (${items.length})
      </button>

      <button class="m3-chip" data-cat="Academics" style="${getChipStyle('Academics')}">
        ${currentActiveFilter === 'Academics' ? '✓ ' : ''}🎓 Academics (${acadCount})
      </button>

      <button class="m3-chip" data-cat="Competitions & Tournaments" style="${getChipStyle('Competitions & Tournaments')}">
        ${currentActiveFilter === 'Competitions & Tournaments' ? '✓ ' : ''}🏆 Competitions (${compCount})
      </button>

      <button class="m3-chip" data-cat="Workshops" style="${getChipStyle('Workshops')}">
        ${currentActiveFilter === 'Workshops' ? '✓ ' : ''}🛠️ Workshops & Talks (${workCount})
      </button>

      <button class="m3-chip" data-cat="Class Rescheduling" style="${getChipStyle('Class Rescheduling')}">
        ${currentActiveFilter === 'Class Rescheduling' ? '✓ ' : ''}⏰ Rescheduled (${reschedCount})
      </button>

      <button class="m3-chip" data-cat="General" style="${getChipStyle('General')}">
        ${currentActiveFilter === 'General' ? '✓ ' : ''}📜 PhD & General (${genCount})
      </button>
    </div>

    <!-- Right: Deadlines Quick Access & Mode Revert Dropdown -->
    <div style="display: flex; align-items: center; gap: 8px; shrink: 0;">
      <div style="position: relative;">
        <button id="m3-deadlines-btn" style="height: 32px; padding: 0 10px; border-radius: 8px; border: 1px solid ${
          isDark ? '#444746' : '#747775'
        }; background: transparent; color: ${
    isDark ? '#e3e3e3' : '#444746'
  }; font-size: 13px; font-weight: 500; cursor: pointer; display: flex; align-items: center; gap: 5px;">
          <span>📅</span>
          <span>Due Dates (${deadlineList.length})</span>
        </button>

        <div id="m3-deadlines-popover" style="display: none; position: absolute; right: 0; top: 38px; width: 320px; background: ${
          isDark ? '#1e1f20' : '#ffffff'
        }; border: 1px solid ${
    isDark ? '#444746' : '#e0e2ec'
  }; border-radius: 12px; box-shadow: 0 8px 24px rgba(0,0,0,0.18); padding: 12px; z-index: 99999;">
          <div style="font-weight: 600; color: ${
            isDark ? '#e3e3e3' : '#1f1f1f'
          }; font-size: 13px; margin-bottom: 8px; display: flex; justify-content: space-between; align-items: center;">
            <span>Detected Deadlines</span>
            <span style="font-size: 11px; color: ${isDark ? '#a8c7fa' : '#0b57d0'};">1-Click Google Calendar</span>
          </div>
          <div style="max-height: 240px; overflow-y: auto; display: flex; flex-direction: column; gap: 6px;">
            ${
              deadlineList.length === 0
                ? `<div style="color: ${
                    isDark ? '#8e918f' : '#747775'
                  }; font-size: 12px; text-align: center; padding: 12px 0;">No active deadlines detected in current view</div>`
                : deadlineList
                    .map(
                      (d) => `
              <div style="padding: 8px 10px; background: ${
                isDark ? '#2b2c2f' : '#f0f4f9'
              }; border-radius: 8px; display: flex; align-items: center; justify-content: space-between; gap: 6px;">
                <div style="overflow: hidden;">
                  <div style="font-size: 12px; font-weight: 500; color: ${
                    isDark ? '#e3e3e3' : '#1f1f1f'
                  }; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${d.title}</div>
                  <div style="font-size: 11px; color: ${isDark ? '#fed7aa' : '#b45309'}; font-weight: 600;">⏰ ${d.deadline}</div>
                </div>
                <a href="${createGCalUrl(d.title, 'Course deadline from email', d.deadline)}" target="_blank" style="text-decoration: none; shrink: 0; padding: 4px 8px; background: ${
                        isDark ? '#004a77' : '#c2e7ff'
                      }; color: ${
                        isDark ? '#c2e7ff' : '#001d35'
                      }; border-radius: 6px; font-size: 11px; font-weight: 600;">+ GCal</a>
              </div>
            `
                    )
                    .join('')
            }
          </div>
        </div>
      </div>

      <!-- Quick Mode & Revert Menu -->
      <div style="position: relative;">
        <button id="m3-options-btn" title="AcadMail Display & Revert Options" style="height: 32px; width: 32px; border-radius: 8px; border: 1px solid ${
          isDark ? '#444746' : '#dadce0'
        }; background: transparent; color: ${
    isDark ? '#c4c7c5' : '#5f6368'
  }; cursor: pointer; display: flex; align-items: center; justify-content: center; font-size: 14px;">
          ⋮
        </button>

        <div id="m3-options-menu" style="display: none; position: absolute; right: 0; top: 38px; width: 220px; background: ${
          isDark ? '#1e1f20' : '#ffffff'
        }; border: 1px solid ${
    isDark ? '#444746' : '#e0e2ec'
  }; border-radius: 12px; box-shadow: 0 8px 24px rgba(0,0,0,0.18); padding: 6px; z-index: 99999;">
          <div style="padding: 6px 8px; font-size: 11px; font-weight: 700; color: ${
            isDark ? '#8e918f' : '#747775'
          }; text-transform: uppercase;">
            Display Integration
          </div>
          <button class="m3-menu-opt" data-mode="blended" style="text-align: left; width: 100%; padding: 7px 10px; border-radius: 8px; border: none; background: ${
            isDark ? '#2b2c2f' : '#e8f0fe'
          }; color: ${isDark ? '#a8c7fa' : '#1967d2'}; font-size: 12px; font-weight: 600; cursor: pointer;">
            ✓ Blended Native M3
          </button>
          <button class="m3-menu-opt" data-mode="floating" style="text-align: left; width: 100%; padding: 7px 10px; border-radius: 8px; border: none; background: transparent; color: ${
            isDark ? '#e3e3e3' : '#444746'
          }; font-size: 12px; cursor: pointer; margin-top: 2px;">
            Floating Pill Toolbar
          </button>
          <div style="border-top: 1px solid ${isDark ? '#333537' : '#f1f3f4'}; margin: 4px 0;"></div>
          <button class="m3-menu-opt" data-mode="off" style="text-align: left; width: 100%; padding: 7px 10px; border-radius: 8px; border: none; background: transparent; color: #ef4444; font-size: 12px; font-weight: 600; cursor: pointer;">
            ✕ Revert to Original Gmail
          </button>
        </div>
      </div>
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

  // Deadlines Popover
  const dlBtn = bar.querySelector('#m3-deadlines-btn') as HTMLElement;
  const dlPop = bar.querySelector('#m3-deadlines-popover') as HTMLElement;
  if (dlBtn && dlPop) {
    dlBtn.onclick = (e) => {
      e.stopPropagation();
      dlPop.style.display = dlPop.style.display === 'block' ? 'none' : 'block';
    };
  }

  // Options Menu & Revert Click Handlers
  const optBtn = bar.querySelector('#m3-options-btn') as HTMLElement;
  const optMenu = bar.querySelector('#m3-options-menu') as HTMLElement;
  if (optBtn && optMenu) {
    optBtn.onclick = (e) => {
      e.stopPropagation();
      optMenu.style.display = optMenu.style.display === 'block' ? 'none' : 'block';
    };

    optMenu.querySelectorAll('.m3-menu-opt').forEach((item) => {
      const itemEl = item as HTMLElement;
      itemEl.onclick = async () => {
        const mode = itemEl.getAttribute('data-mode') as UiIntegrationMode;
        uiMode = mode;
        optMenu.style.display = 'none';

        if (typeof chrome !== 'undefined' && chrome.storage?.local) {
          chrome.storage.local.get(['acadmail_settings'], (res) => {
            const current = res.acadmail_settings || {};
            chrome.storage.local.set({
              acadmail_settings: { ...current, uiMode: mode, inPageIntegration: mode !== 'off' },
            });
          });
        }

        applyUiMode();
      };
    });
  }

  // Close menus on outside click
  document.addEventListener('click', (e) => {
    if (dlPop && !dlPop.contains(e.target as Node) && e.target !== dlBtn) {
      dlPop.style.display = 'none';
    }
    if (optMenu && !optMenu.contains(e.target as Node) && e.target !== optBtn) {
      optMenu.style.display = 'none';
    }
  });
}

function updateChipBarActiveState() {
  if (uiMode === 'blended' && scannedItemsCache.length > 0) {
    injectMaterial3ChipBar(scannedItemsCache);
  }
}

// =========================================================================
// 2. NATIVE GOOGLE WORKSPACE RIGHT SIDE-RAIL ICON (1:1 with Keep/Calendar)
// =========================================================================
function injectSideRailIcon() {
  if (uiMode === 'off' || document.getElementById('acadmail-siderail-btn')) return;

  // Look for Gmail's native right side-rail
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
    width: 40px;
    height: 40px;
    margin: 8px auto;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    background: transparent;
    color: ${isDark ? '#a8c7fa' : '#0b57d0'};
    transition: background 0.2s;
  `
  );

  btn.innerHTML = `
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M22 10v6M2 10l10-5 10 5-10 5z"/>
      <path d="M6 12v5c3 3 9 3 12 0v-5"/>
    </svg>
  `;

  btn.onmouseenter = () => (btn.style.background = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)');
  btn.onmouseleave = () => (btn.style.background = 'transparent');
  btn.onclick = () => safeSendMessage({ type: 'OPEN_SIDEPANEL' });

  sideRail.prepend(btn);
}

// =========================================================================
// 3. IN-EMAIL READING VIEW: NATIVE GEMINI ACADEMIC CARD
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

  const classification = classifyInboxItem(emailData.subject, emailData.senderName, emailData.bodyText);
  const category = classification.category;
  const courseCode = classification.courseCode;

  const fullText = `${emailData.subject} ${emailData.bodyText}`;
  const datePattern = /\b(?:due|deadline|by|on|date:|till)\s+([A-Za-z]{3,9}\s+\d{1,2}(?:st|nd|rd|th)?(?:\s*,\s*\d{4})?|\d{1,2}\/\d{1,2}(?:\/\d{2,4})?|\d{1,2}\s+[A-Za-z]{3,9})\b/i;
  const deadlineMatch = fullText.match(datePattern);
  const detectedDeadline = deadlineMatch ? deadlineMatch[1] : null;

  const meetMatch = fullText.match(/https?:\/\/(?:[a-zA-Z0-9-]+\.)?(?:zoom\.us\/j|meet\.google\.com|teams\.microsoft\.com\/l)\/[^\s<>"']+/i);
  const meetingUrl = meetMatch ? meetMatch[0] : null;

  const sentences = emailData.bodyText
    .split(/\.\s+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 25 && !s.includes('http') && !s.includes('unsubscribe') && !s.includes('Regards'));
  const bullets = sentences.slice(0, 3);
  if (bullets.length === 0) {
    bullets.push(`Notification regarding ${emailData.subject} from ${emailData.senderName}.`);
  }

  const isDark = isGmailDark();
  const card = document.createElement('div');
  card.id = 'acadmail-email-brief-card';
  card.setAttribute('data-email-id', emailData.id);
  card.setAttribute(
    'style',
    `
    margin: 12px 0 16px 0;
    padding: 14px 18px;
    background: ${isDark ? '#1e1f20' : '#f0f4f9'};
    border: 1px solid ${isDark ? '#444746' : '#d3e3fd'};
    border-radius: 16px;
    font-family: "Google Sans", Roboto, RobotoDraft, Helvetica, Arial, sans-serif;
    font-size: 13px;
    color: ${isDark ? '#e3e3e3' : '#1f1f1f'};
    z-index: 20;
    transition: all 0.2s ease;
  `
  );

  let categoryBadge = `<span style="padding: 2px 8px; border-radius: 6px; font-weight: 600; font-size: 11px; background: ${
    isDark ? '#004a77' : '#c2e7ff'
  }; color: ${isDark ? '#c2e7ff' : '#001d35'};">🎓 ${courseCode || 'Academics'}</span>`;
  if (category === 'Competitions & Tournaments') {
    categoryBadge = `<span style="padding: 2px 8px; border-radius: 6px; font-weight: 600; font-size: 11px; background: ${
      isDark ? '#785312' : '#fef3c7'
    }; color: ${isDark ? '#fed7aa' : '#b45309'};">🏆 Competitions</span>`;
  } else if (category === 'Workshops') {
    categoryBadge = `<span style="padding: 2px 8px; border-radius: 6px; font-weight: 600; font-size: 11px; background: ${
      isDark ? '#143e2e' : '#e6f4ea'
    }; color: ${isDark ? '#a7f3d0' : '#137333'};">🛠️ Workshops & Talks</span>`;
  } else if (category === 'Class Rescheduling') {
    categoryBadge = `<span style="padding: 2px 8px; border-radius: 6px; font-weight: 600; font-size: 11px; background: ${
      isDark ? '#4c1d24' : '#fce8e6'
    }; color: ${isDark ? '#fecdd3' : '#c5221f'};">⏰ Rescheduled</span>`;
  } else if (classification.isPhd) {
    categoryBadge = `<span style="padding: 2px 8px; border-radius: 6px; font-weight: 600; font-size: 11px; background: ${
      isDark ? '#2a2b2e' : '#f1f3f4'
    }; color: ${isDark ? '#c4c7c5' : '#5f6368'};">📜 PhD Defense / Viva</span>`;
  }

  card.innerHTML = `
    <!-- Google Gemini Header -->
    <div style="display: flex; align-items: center; justify-content: space-between; padding-bottom: 10px; border-bottom: 1px solid ${
      isDark ? '#333537' : '#e0e2ec'
    };">
      <div style="display: flex; align-items: center; gap: 8px;">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="${isDark ? '#a8c7fa' : '#0b57d0'}">
          <path d="M12 2L14.4 9.6L22 12L14.4 14.4L12 22L9.6 14.4L2 12L9.6 9.6L12 2Z"/>
        </svg>
        <span style="font-weight: 600; font-size: 13px; color: ${isDark ? '#e3e3e3' : '#1f1f1f'};">AcadMail AI Brief</span>
        ${categoryBadge}
      </div>

      <div style="display: flex; align-items: center; gap: 6px;">
        <button id="m3-card-sidepanel-btn" title="Open AI Side Panel" style="cursor: pointer; padding: 4px 10px; border-radius: 8px; border: 1px solid ${
          isDark ? '#444746' : '#c4c7c5'
        }; background: transparent; font-size: 12px; font-weight: 500; color: ${isDark ? '#e3e3e3' : '#444746'};">
          ⚡ Side Panel
        </button>
        <button id="m3-card-collapse-btn" title="Collapse" style="cursor: pointer; padding: 2px 6px; border-radius: 6px; border: none; background: transparent; color: ${
          isDark ? '#8e918f' : '#747775'
        }; font-size: 14px;">
          −
        </button>
      </div>
    </div>

    <!-- Body -->
    <div id="m3-card-content" style="padding-top: 10px; display: flex; flex-direction: column; gap: 10px;">
      <ul style="margin: 0; padding-left: 18px; display: flex; flex-direction: column; gap: 5px; font-size: 13px; line-height: 1.5; color: ${
        isDark ? '#c4c7c5' : '#334155'
      };">
        ${bullets.map((b) => `<li>${b}</li>`).join('')}
      </ul>

      <!-- Action Chips (Google Calendar + Meet) -->
      ${
        detectedDeadline || meetingUrl
          ? `
        <div style="display: flex; flex-wrap: wrap; align-items: center; gap: 8px; padding-top: 4px;">
          ${
            detectedDeadline
              ? `
            <a href="${createGCalUrl(
              emailData.subject,
              emailData.bodyText.slice(0, 300),
              detectedDeadline
            )}" target="_blank" style="text-decoration: none; display: inline-flex; align-items: center; gap: 6px; padding: 6px 12px; background: ${
                  isDark ? '#004a77' : '#c2e7ff'
                }; color: ${
                  isDark ? '#c2e7ff' : '#001d35'
                }; border-radius: 8px; font-size: 12px; font-weight: 600;">
              <span>📅</span>
              <span>Due: ${detectedDeadline} • Add to Google Calendar</span>
            </a>
          `
              : ''
          }

          ${
            meetingUrl
              ? `
            <a href="${meetingUrl}" target="_blank" style="text-decoration: none; display: inline-flex; align-items: center; gap: 6px; padding: 6px 12px; background: ${
                  isDark ? '#143e2e' : '#e6f4ea'
                }; color: ${
                  isDark ? '#a7f3d0' : '#137333'
                }; border-radius: 8px; font-size: 12px; font-weight: 600;">
              <span>🎥</span>
              <span>Join Video Meeting</span>
            </a>
          `
              : ''
          }
        </div>
      `
          : ''
      }

      <!-- Suggested Reply Chips -->
      <div style="display: flex; flex-wrap: wrap; align-items: center; gap: 6px; padding-top: 6px; border-top: 1px solid ${
        isDark ? '#333537' : '#e0e2ec'
      };">
        <span style="font-size: 11px; font-weight: 600; color: ${isDark ? '#8e918f' : '#747775'};">Suggested Reply:</span>

        <button class="m3-quick-reply-btn" data-reply="confirm" style="cursor: pointer; padding: 4px 10px; border-radius: 16px; border: 1px solid ${
          isDark ? '#444746' : '#747775'
        }; background: transparent; color: ${isDark ? '#e3e3e3' : '#444746'}; font-size: 12px; font-weight: 500;">
          ✍️ Confirm Attendance
        </button>

        <button class="m3-quick-reply-btn" data-reply="extension" style="cursor: pointer; padding: 4px 10px; border-radius: 16px; border: 1px solid ${
          isDark ? '#444746' : '#747775'
        }; background: transparent; color: ${isDark ? '#e3e3e3' : '#444746'}; font-size: 12px; font-weight: 500;">
          ⏳ Request Extension
        </button>

        <button class="m3-quick-reply-btn" data-reply="doubt" style="cursor: pointer; padding: 4px 10px; border-radius: 16px; border: 1px solid ${
          isDark ? '#444746' : '#747775'
        }; background: transparent; color: ${isDark ? '#e3e3e3' : '#444746'}; font-size: 12px; font-weight: 500;">
          ❓ Clarify Doubt
        </button>
      </div>
    </div>
  `;

  // Collapse handler
  const collapseBtn = card.querySelector('#m3-card-collapse-btn') as HTMLElement;
  const contentDiv = card.querySelector('#m3-card-content') as HTMLElement;
  if (collapseBtn && contentDiv) {
    collapseBtn.onclick = () => {
      const isHidden = contentDiv.style.display === 'none';
      contentDiv.style.display = isHidden ? 'flex' : 'none';
      collapseBtn.innerText = isHidden ? '−' : '+';
    };
  }

  const sidePanelBtn = card.querySelector('#m3-card-sidepanel-btn') as HTMLElement;
  if (sidePanelBtn) {
    sidePanelBtn.onclick = () => safeSendMessage({ type: 'OPEN_SIDEPANEL' });
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
  triggerBtn.innerText = 'Drafting in Gmail...';

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

      triggerBtn.innerText = '✅ Drafted in Gmail!';
      setTimeout(() => {
        triggerBtn.innerText = originalText;
      }, 2500);
    } else if (attempts > 15) {
      clearInterval(interval);
      triggerBtn.innerText = '⚠️ Please click Reply first';
      setTimeout(() => {
        triggerBtn.innerText = originalText;
      }, 2000);
    }
  }, 200);
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

// Fallback floating filter bar (for 'floating' mode)
function injectFloatingFilterBar(items: InboxRowItem[]) {
  // If floating mode is chosen, we keep the earlier floating pill bar
  const mailContainer =
    document.querySelector('div[gh="tm"]') ||
    document.querySelector('div.G-atb') ||
    document.querySelector('div.aeF') ||
    document.querySelector('div[role="main"]');

  if (!mailContainer) return;

  let bar = document.getElementById('acadmail-inbox-filter-bar');
  if (!bar) {
    bar = document.createElement('div');
    bar.id = 'acadmail-inbox-filter-bar';
    bar.setAttribute(
      'style',
      `
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 8px;
      margin: 8px 16px;
      padding: 6px 14px;
      background: #ffffff;
      border: 1px solid #e2e8f0;
      border-radius: 14px;
      box-shadow: 0 2px 8px -2px rgba(0,0,0,0.06);
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      font-size: 11px;
      z-index: 50;
    `
    );
    const targetAnchor = document.querySelector('div.aeF') || document.querySelector('div[gh="tm"]') || mailContainer;
    targetAnchor.parentElement?.insertBefore(bar, targetAnchor);
  }

  bar.innerHTML = `
    <div style="display: flex; align-items: center; gap: 6px;">
      <span style="font-weight: 800; font-size: 12px;">🎓 AcadMail</span>
      <button class="float-chip" data-cat="ALL" style="cursor: pointer; padding: 4px 8px; border-radius: 9999px; border: 1px solid #cbd5e1; background: #0f172a; color: #fff; font-size: 10px; font-weight: 600;">All (${items.length})</button>
      <button class="float-chip" data-cat="Academics" style="cursor: pointer; padding: 4px 8px; border-radius: 9999px; border: 1px solid #bfdbfe; background: #eff6ff; color: #1d4ed8; font-size: 10px; font-weight: 600;">🎓 Academics</button>
      <button class="float-chip" data-cat="Competitions & Tournaments" style="cursor: pointer; padding: 4px 8px; border-radius: 9999px; border: 1px solid #fde68a; background: #fffbeb; color: #b45309; font-size: 10px; font-weight: 600;">🏆 Competitions</button>
      <button class="float-chip" data-cat="Workshops" style="cursor: pointer; padding: 4px 8px; border-radius: 9999px; border: 1px solid #a7f3d0; background: #ecfdf5; color: #047857; font-size: 10px; font-weight: 600;">🛠️ Workshops</button>
      <button class="float-chip" data-cat="Class Rescheduling" style="cursor: pointer; padding: 4px 8px; border-radius: 9999px; border: 1px solid #fecdd3; background: #fff1f2; color: #be123c; font-size: 10px; font-weight: 600;">⏰ Rescheduled</button>
    </div>
  `;

  bar.querySelectorAll('.float-chip').forEach((btn) => {
    const buttonEl = btn as HTMLElement;
    buttonEl.onclick = () => {
      const cat = buttonEl.getAttribute('data-cat') as CategoryType | 'ALL';
      filterGmailDom(cat);
    };
  });
}

// Compose Toolbar Professor Polisher
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
      gap: 5px;
      margin-left: 8px;
      padding: 6px 12px;
      background: linear-gradient(135deg, #1e1b4b, #312e81);
      color: #e0e7ff;
      border: 1px solid rgba(129, 140, 248, 0.4);
      border-radius: 9999px;
      font-size: 11px;
      font-weight: 600;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      cursor: pointer;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      transition: all 0.2s ease;
      position: relative;
    `
    );

    polishBtn.innerHTML = `
      <span style="font-size: 12px;">✨</span>
      <span>Polish for Professor</span>
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
    bottom: 45px;
    left: 10px;
    z-index: 999999;
    background: #ffffff;
    border: 1px solid #e2e8f0;
    border-radius: 14px;
    box-shadow: 0 12px 30px -5px rgba(0,0,0,0.18);
    padding: 8px;
    width: 250px;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  `
  );

  menu.innerHTML = `
    <div style="padding: 4px 8px 6px 8px; font-size: 10px; font-weight: 700; color: #64748b; text-transform: uppercase;">Select Academic Polish Tone</div>
    <div style="display: flex; flex-direction: column; gap: 4px; padding-top: 6px;">
      <button class="acad-tone-opt" data-tone="formal" style="text-align: left; padding: 7px 10px; border-radius: 8px; border: none; background: transparent; cursor: pointer; font-size: 11px; font-weight: 600; color: #1e293b;">🎓 Respectful & Formal</button>
      <button class="acad-tone-opt" data-tone="extension" style="text-align: left; padding: 7px 10px; border-radius: 8px; border: none; background: transparent; cursor: pointer; font-size: 11px; font-weight: 600; color: #1e293b;">⏳ Request Extension</button>
      <button class="acad-tone-opt" data-tone="doubt" style="text-align: left; padding: 7px 10px; border-radius: 8px; border: none; background: transparent; cursor: pointer; font-size: 11px; font-weight: 600; color: #1e293b;">❓ Clarify Doubt</button>
      <button class="acad-tone-opt" data-tone="lor" style="text-align: left; padding: 7px 10px; border-radius: 8px; border: none; background: transparent; cursor: pointer; font-size: 11px; font-weight: 600; color: #1e293b;">📝 Request LoR / Reference</button>
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
  polishBtn.innerHTML = `<span>⏳</span><span>Polishing...</span>`;

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

    polishBtn.innerHTML = `<span>✅</span><span>Polished!</span>`;
    setTimeout(() => {
      polishBtn.innerHTML = originalBtnHTML;
    }, 2000);
  } catch (err: any) {
    polishBtn.innerHTML = `<span>⚠️ Error</span>`;
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
    } else if (message.type === 'CLICK_ROW') {
      clickRowByIndex(message.index);
      sendResponse({ success: true });
    } else if (message.type === 'SET_UI_MODE') {
      uiMode = message.mode;
      applyUiMode();
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
  });
} else {
  setTimeout(scanVisibleInbox, 1200);
  setTimeout(checkAndInjectEmailBrief, 1200);
  setTimeout(injectSideRailIcon, 1200);
  setTimeout(injectComposePolisher, 1200);
}

// Watch DOM mutations & URL changes
let lastUrl = location.href;
new MutationObserver(() => {
  const url = location.href;
  if (url !== lastUrl) {
    lastUrl = url;
    setTimeout(() => {
      safeSendMessage({ type: 'EMAIL_CHANGED' });
      scanVisibleInbox();
      checkAndInjectEmailBrief();
      injectSideRailIcon();
    }, 400);
  }
  injectComposePolisher();
}).observe(document, { subtree: true, childList: true });

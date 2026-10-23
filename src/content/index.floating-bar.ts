import { ExtractedEmail, InboxRowItem, CategoryType } from '../types';

console.log('[AcadMail AI] In-Gmail Native Content Script initialized.');

let lastClickedRow: HTMLElement | null = null;
let currentActiveFilter: CategoryType | 'ALL' = 'ALL';
let scannedItemsCache: InboxRowItem[] = [];
let inPageIntegrationEnabled = true;
let isFilterBarMinimized = false;

// Safe message sender
function safeSendMessage(message: any) {
  try {
    if (typeof chrome !== 'undefined' && chrome.runtime?.id) {
      chrome.runtime.sendMessage(message).catch(() => {});
    }
  } catch (e) {}
}

// Load inPageIntegration setting
function loadSettings() {
  if (typeof chrome !== 'undefined' && chrome.storage?.local) {
    chrome.storage.local.get(['acadmail_settings'], (res) => {
      if (res.acadmail_settings && typeof res.acadmail_settings.inPageIntegration === 'boolean') {
        inPageIntegrationEnabled = res.acadmail_settings.inPageIntegration;
      } else {
        inPageIntegrationEnabled = true;
      }
      applyIntegrationState();
    });
  }
}

function applyIntegrationState() {
  if (!inPageIntegrationEnabled) {
    // Remove in-page bars if disabled
    document.getElementById('acadmail-inbox-filter-bar')?.remove();
    document.getElementById('acadmail-minimized-pill')?.remove();
    document.getElementById('acadmail-email-brief-card')?.remove();
    filterGmailDom('ALL');
  } else {
    // Re-inject if on inbox or email
    scanVisibleInbox();
    checkAndInjectEmailBrief();
  }
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

  // If in-page integration is active, inject/update the native filter bar
  if (inPageIntegrationEnabled && items.length > 0) {
    injectInboxFilterBar(items);
  }

  return items;
}

// Inject modern badge directly into the Gmail row
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

  const badge = document.createElement('span');
  badge.className = 'acadmail-row-badge';

  let badgeColor = 'background: #eff6ff; color: #1d4ed8; border: 1px solid #bfdbfe;';
  let icon = '🎓';
  let labelText = courseCode || 'Academics';

  if (category === 'Competitions & Tournaments') {
    badgeColor = 'background: #fffbeb; color: #b45309; border: 1px solid #fde68a;';
    icon = '🏆';
    labelText = 'Contest / Sports';
  } else if (category === 'Workshops') {
    badgeColor = 'background: #ecfdf5; color: #047857; border: 1px solid #a7f3d0;';
    icon = '🛠️';
    labelText = 'Workshop / Talk';
  } else if (category === 'Class Rescheduling') {
    badgeColor = 'background: #fff1f2; color: #be123c; border: 1px solid #fecdd3;';
    icon = '⏰';
    labelText = 'Rescheduled';
  } else if (isPhd) {
    badgeColor = 'background: #f8fafc; color: #475569; border: 1px solid #cbd5e1;';
    icon = '📜';
    labelText = 'PhD / Viva';
  } else if (category === 'General') {
    badgeColor = 'background: #f1f5f9; color: #475569; border: 1px solid #e2e8f0;';
    icon = '📢';
    labelText = 'General';
  }

  badge.setAttribute(
    'style',
    `
    display: inline-flex;
    align-items: center;
    gap: 3px;
    padding: 1px 7px;
    margin-right: 6px;
    border-radius: 6px;
    font-size: 10px;
    font-weight: 600;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    letter-spacing: -0.01em;
    vertical-align: middle;
    box-shadow: 0 1px 2px rgba(0,0,0,0.03);
    ${badgeColor}
  `
  );

  badge.innerText = `${icon} ${labelText}`;
  subjectContainer.prepend(badge);
}

// Filter rows on Gmail DOM
function filterGmailDom(category: CategoryType | 'ALL') {
  currentActiveFilter = category;
  const rows = document.querySelectorAll('tr.zA');

  rows.forEach((row) => {
    const rowEl = row as HTMLElement;
    if (category === 'ALL') {
      rowEl.style.opacity = '1';
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
      rowEl.style.opacity = '1';
      rowEl.style.display = '';
    } else {
      // Clean hiding for high-signal triage
      rowEl.style.display = 'none';
    }
  });

  // Update filter bar pills if present
  updateFilterBarActiveState();
}

function clickRowByIndex(index: number) {
  const rows = document.querySelectorAll('tr.zA');
  if (rows[index]) {
    const target = rows[index] as HTMLElement;
    target.click();
  }
}

// Helper to create Google Calendar Event URL
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

// =========================================================================
// 1. IN-GMAIL NATIVE FILTER BAR (Injected directly above visible email list)
// =========================================================================
function injectInboxFilterBar(items: InboxRowItem[]) {
  if (!inPageIntegrationEnabled) return;

  // Only inject if Gmail email table or inbox view is active
  const mailContainer =
    document.querySelector('div[gh="tm"]') ||
    document.querySelector('div.G-atb') ||
    document.querySelector('div.aeF') ||
    document.querySelector('div[role="main"]');

  if (!mailContainer) return;

  // Count items per category
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

  let bar = document.getElementById('acadmail-inbox-filter-bar');

  // If already minimized, ensure pill is present
  if (isFilterBarMinimized) {
    if (bar) bar.style.display = 'none';
    injectMinimizedPill();
    return;
  }

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
      box-shadow: 0 2px 8px -2px rgba(0,0,0,0.06), 0 1px 3px rgba(0,0,0,0.04);
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      font-size: 11px;
      z-index: 50;
      transition: all 0.2s ease;
    `
    );

    // Insert right at top of mail list
    const targetAnchor = document.querySelector('div.aeF') || document.querySelector('div[gh="tm"]') || mailContainer;
    targetAnchor.parentElement?.insertBefore(bar, targetAnchor);
  }

  bar.innerHTML = `
    <!-- Left: Brand + Category Pills -->
    <div style="display: flex; align-items: center; gap: 6px; overflow-x: auto; padding-bottom: 1px;">
      <div style="display: flex; align-items: center; gap: 5px; font-weight: 800; color: #1e293b; padding-right: 8px; border-right: 1px solid #e2e8f0; white-space: nowrap;">
        <span style="font-size: 14px;">🎓</span>
        <span style="letter-spacing: -0.02em;">AcadMail</span>
      </div>

      <button class="acad-pill-btn" data-cat="ALL" style="cursor: pointer; padding: 4px 10px; border-radius: 9999px; border: 1px solid #cbd5e1; font-weight: 600; font-size: 11px; white-space: nowrap; transition: all 0.15s ease; ${
        currentActiveFilter === 'ALL'
          ? 'background: #0f172a; color: #ffffff; border-color: #0f172a;'
          : 'background: #f8fafc; color: #475569;'
      }">
        All (${items.length})
      </button>

      <button class="acad-pill-btn" data-cat="Academics" style="cursor: pointer; padding: 4px 10px; border-radius: 9999px; border: 1px solid ${
        currentActiveFilter === 'Academics' ? '#2563eb' : '#bfdbfe'
      }; font-weight: 600; font-size: 11px; white-space: nowrap; transition: all 0.15s ease; ${
        currentActiveFilter === 'Academics'
          ? 'background: #2563eb; color: #ffffff;'
          : 'background: #eff6ff; color: #1d4ed8;'
      }">
        🎓 Academics (${acadCount})
      </button>

      <button class="acad-pill-btn" data-cat="Competitions & Tournaments" style="cursor: pointer; padding: 4px 10px; border-radius: 9999px; border: 1px solid ${
        currentActiveFilter === 'Competitions & Tournaments' ? '#d97706' : '#fde68a'
      }; font-weight: 600; font-size: 11px; white-space: nowrap; transition: all 0.15s ease; ${
        currentActiveFilter === 'Competitions & Tournaments'
          ? 'background: #d97706; color: #ffffff;'
          : 'background: #fffbeb; color: #b45309;'
      }">
        🏆 Competitions (${compCount})
      </button>

      <button class="acad-pill-btn" data-cat="Workshops" style="cursor: pointer; padding: 4px 10px; border-radius: 9999px; border: 1px solid ${
        currentActiveFilter === 'Workshops' ? '#059669' : '#a7f3d0'
      }; font-weight: 600; font-size: 11px; white-space: nowrap; transition: all 0.15s ease; ${
        currentActiveFilter === 'Workshops'
          ? 'background: #059669; color: #ffffff;'
          : 'background: #ecfdf5; color: #047857;'
      }">
        🛠️ Workshops & Talks (${workCount})
      </button>

      <button class="acad-pill-btn" data-cat="Class Rescheduling" style="cursor: pointer; padding: 4px 10px; border-radius: 9999px; border: 1px solid ${
        currentActiveFilter === 'Class Rescheduling' ? '#e11d48' : '#fecdd3'
      }; font-weight: 600; font-size: 11px; white-space: nowrap; transition: all 0.15s ease; ${
        currentActiveFilter === 'Class Rescheduling'
          ? 'background: #e11d48; color: #ffffff;'
          : 'background: #fff1f2; color: #be123c;'
      }">
        ⏰ Rescheduled (${reschedCount})
      </button>

      <button class="acad-pill-btn" data-cat="General" style="cursor: pointer; padding: 4px 10px; border-radius: 9999px; border: 1px solid ${
        currentActiveFilter === 'General' ? '#475569' : '#e2e8f0'
      }; font-weight: 600; font-size: 11px; white-space: nowrap; transition: all 0.15s ease; ${
        currentActiveFilter === 'General'
          ? 'background: #475569; color: #ffffff;'
          : 'background: #f8fafc; color: #64748b;'
      }">
        📜 PhD & General (${genCount})
      </button>
    </div>

    <!-- Right: Deadlines Quick Popover + Actions -->
    <div style="display: flex; align-items: center; gap: 6px; shrink: 0; padding-left: 6px;">
      <div style="position: relative;">
        <button id="acadmail-deadlines-btn" style="cursor: pointer; display: flex; align-items: center; gap: 4px; padding: 4px 9px; border-radius: 8px; border: 1px solid #cbd5e1; background: #ffffff; color: #334155; font-size: 11px; font-weight: 600; transition: all 0.15s;">
          <span>📅</span>
          <span>Deadlines (${deadlineList.length})</span>
        </button>
        <div id="acadmail-deadlines-popover" style="display: none; position: absolute; right: 0; top: 32px; width: 300px; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; box-shadow: 0 10px 25px -5px rgba(0,0,0,0.15); padding: 10px; z-index: 99999;">
          <div style="font-weight: 700; color: #1e293b; font-size: 11px; margin-bottom: 6px; display: flex; justify-content: space-between; align-items: center;">
            <span>Detected Inbox Deadlines</span>
            <span style="font-size: 9px; color: #64748b; font-weight: 400;">1-Click Google Calendar</span>
          </div>
          <div style="max-height: 220px; overflow-y: auto; display: flex; flex-direction: column; gap: 5px;">
            ${
              deadlineList.length === 0
                ? '<div style="color: #94a3b8; font-size: 10px; text-align: center; padding: 12px 0;">No active deadlines detected in current view</div>'
                : deadlineList
                    .map(
                      (d) => `
              <div style="padding: 6px 8px; background: #f8fafc; border: 1px solid #f1f5f9; border-radius: 8px; display: flex; align-items: center; justify-content: space-between; gap: 6px;">
                <div style="overflow: hidden;">
                  <div style="font-size: 10px; font-weight: 600; color: #1e293b; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${d.title}</div>
                  <div style="font-size: 9px; color: #b45309; font-weight: 600;">⏰ ${d.deadline}</div>
                </div>
                <a href="${createGCalUrl(d.title, 'Course deadline from email', d.deadline)}" target="_blank" style="text-decoration: none; shrink: 0; padding: 2px 6px; background: #eff6ff; color: #1d4ed8; border: 1px solid #bfdbfe; border-radius: 6px; font-size: 9px; font-weight: 600;">+ GCal</a>
              </div>
            `
                    )
                    .join('')
            }
          </div>
        </div>
      </div>

      <button id="acadmail-open-sidepanel-btn" title="Open Copilot Side Panel" style="cursor: pointer; padding: 4px 8px; border-radius: 8px; border: 1px solid #e2e8f0; background: #ffffff; color: #475569; font-size: 11px; font-weight: 600;">
        ⚡ Side Panel
      </button>

      <button id="acadmail-minimize-bar-btn" title="Minimize Bar (Switch to compact pill)" style="cursor: pointer; padding: 4px 6px; border-radius: 8px; border: none; background: transparent; color: #94a3b8; font-size: 12px;">
        ✕
      </button>
    </div>
  `;

  // Pill click listeners
  bar.querySelectorAll('.acad-pill-btn').forEach((btn) => {
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

  // Deadlines toggle
  const dlBtn = bar.querySelector('#acadmail-deadlines-btn') as HTMLElement;
  const dlPop = bar.querySelector('#acadmail-deadlines-popover') as HTMLElement;
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

  // Open side panel
  const sideBtn = bar.querySelector('#acadmail-open-sidepanel-btn') as HTMLElement;
  if (sideBtn) {
    sideBtn.onclick = () => safeSendMessage({ type: 'OPEN_SIDEPANEL' });
  }

  // Minimize bar
  const minBtn = bar.querySelector('#acadmail-minimize-bar-btn') as HTMLElement;
  if (minBtn) {
    minBtn.onclick = () => {
      isFilterBarMinimized = true;
      if (bar) bar.style.display = 'none';
      injectMinimizedPill();
    };
  }
}

function updateFilterBarActiveState() {
  const bar = document.getElementById('acadmail-inbox-filter-bar');
  if (!bar) return;

  bar.querySelectorAll('.acad-pill-btn').forEach((btn) => {
    const buttonEl = btn as HTMLElement;
    const cat = buttonEl.getAttribute('data-cat');
    if (cat === currentActiveFilter) {
      buttonEl.style.boxShadow = '0 0 0 2px rgba(37,99,235,0.2)';
    } else {
      buttonEl.style.boxShadow = 'none';
    }
  });
}

function injectMinimizedPill() {
  if (document.getElementById('acadmail-minimized-pill')) return;

  const pill = document.createElement('div');
  pill.id = 'acadmail-minimized-pill';
  pill.setAttribute(
    'style',
    `
    position: fixed;
    top: 65px;
    right: 24px;
    z-index: 9999;
    padding: 4px 10px;
    background: #0f172a;
    color: #ffffff;
    border-radius: 9999px;
    font-size: 10px;
    font-weight: 700;
    cursor: pointer;
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    display: flex;
    align-items: center;
    gap: 4px;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  `
  );
  pill.innerHTML = `<span>🎓 AcadMail Bar</span> <span style="color: #94a3b8; font-size: 9px;">(Click to expand)</span>`;
  pill.onclick = () => {
    isFilterBarMinimized = false;
    pill.remove();
    const bar = document.getElementById('acadmail-inbox-filter-bar');
    if (bar) bar.style.display = 'flex';
    else scanVisibleInbox();
  };
  document.body.appendChild(pill);
}

// =========================================================================
// 2. IN-EMAIL READING VIEW: ACADEMIC COPILOT BRIEF CARD
// =========================================================================
function checkAndInjectEmailBrief() {
  if (!inPageIntegrationEnabled) return;

  const emailData = extractGmailData();
  if (!emailData) {
    // If not reading an email, remove any leftover card
    document.getElementById('acadmail-email-brief-card')?.remove();
    return;
  }

  // Look for subject container to anchor the card beneath
  const subjectContainer =
    document.querySelector('div.ha') ||
    document.querySelector('h2.hP')?.parentElement ||
    document.querySelector('div[role="main"] h2')?.parentElement;

  if (!subjectContainer) return;

  const existingCard = document.getElementById('acadmail-email-brief-card');
  const cardEmailId = existingCard?.getAttribute('data-email-id');

  // If already rendered for this specific email, avoid thrashing
  if (existingCard && cardEmailId === emailData.id) {
    return;
  }

  if (existingCard) {
    existingCard.remove();
  }

  // Classify current email
  const classification = classifyInboxItem(emailData.subject, emailData.senderName, emailData.bodyText);
  const category = classification.category;
  const courseCode = classification.courseCode;

  // Extract quick heuristics (deadlines, links, summary)
  const fullText = `${emailData.subject} ${emailData.bodyText}`;
  const datePattern = /\b(?:due|deadline|by|on|date:|till)\s+([A-Za-z]{3,9}\s+\d{1,2}(?:st|nd|rd|th)?(?:\s*,\s*\d{4})?|\d{1,2}\/\d{1,2}(?:\/\d{2,4})?|\d{1,2}\s+[A-Za-z]{3,9})\b/i;
  const deadlineMatch = fullText.match(datePattern);
  const detectedDeadline = deadlineMatch ? deadlineMatch[1] : null;

  // Virtual meeting links
  const meetMatch = fullText.match(/https?:\/\/(?:[a-zA-Z0-9-]+\.)?(?:zoom\.us\/j|meet\.google\.com|teams\.microsoft\.com\/l)\/[^\s<>"']+/i);
  const meetingUrl = meetMatch ? meetMatch[0] : null;

  // Extract clean 2-3 sentence bullets
  const sentences = emailData.bodyText
    .split(/\.\s+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 25 && !s.includes('http') && !s.includes('unsubscribe') && !s.includes('Regards'));
  const bullets = sentences.slice(0, 3);
  if (bullets.length === 0) {
    bullets.push(`Notification regarding ${emailData.subject} from ${emailData.senderName}.`);
  }

  // Build card
  const card = document.createElement('div');
  card.id = 'acadmail-email-brief-card';
  card.setAttribute('data-email-id', emailData.id);
  card.setAttribute(
    'style',
    `
    margin: 12px 0 16px 0;
    padding: 12px 16px;
    background: #ffffff;
    border: 1px solid #e2e8f0;
    border-radius: 16px;
    box-shadow: 0 4px 12px -2px rgba(0,0,0,0.05), 0 2px 4px -1px rgba(0,0,0,0.03);
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    font-size: 11px;
    color: #1e293b;
    z-index: 20;
    transition: all 0.2s ease;
  `
  );

  let categoryBadge = `<span style="padding: 2px 8px; border-radius: 9999px; font-weight: 700; font-size: 10px; background: #eff6ff; color: #1d4ed8; border: 1px solid #bfdbfe;">🎓 ${courseCode || 'Academics'}</span>`;
  if (category === 'Competitions & Tournaments') {
    categoryBadge = `<span style="padding: 2px 8px; border-radius: 9999px; font-weight: 700; font-size: 10px; background: #fffbeb; color: #b45309; border: 1px solid #fde68a;">🏆 Competitions / Sports</span>`;
  } else if (category === 'Workshops') {
    categoryBadge = `<span style="padding: 2px 8px; border-radius: 9999px; font-weight: 700; font-size: 10px; background: #ecfdf5; color: #047857; border: 1px solid #a7f3d0;">🛠️ Workshops & Talks</span>`;
  } else if (category === 'Class Rescheduling') {
    categoryBadge = `<span style="padding: 2px 8px; border-radius: 9999px; font-weight: 700; font-size: 10px; background: #fff1f2; color: #be123c; border: 1px solid #fecdd3;">⏰ Class Rescheduled</span>`;
  } else if (classification.isPhd) {
    categoryBadge = `<span style="padding: 2px 8px; border-radius: 9999px; font-weight: 700; font-size: 10px; background: #f8fafc; color: #475569; border: 1px solid #cbd5e1;">📜 PhD Defense / Viva</span>`;
  }

  card.innerHTML = `
    <!-- Top Header Bar -->
    <div style="display: flex; align-items: center; justify-content: space-between; padding-bottom: 8px; border-bottom: 1px solid #f1f5f9;">
      <div style="display: flex; align-items: center; gap: 8px;">
        <div style="display: flex; align-items: center; gap: 4px; font-weight: 800; font-size: 12px; color: #0f172a;">
          <span style="font-size: 14px;">🎓</span>
          <span>AcadMail Copilot Brief</span>
        </div>
        ${categoryBadge}
      </div>

      <div style="display: flex; align-items: center; gap: 6px;">
        <button id="acadmail-card-sidepanel-btn" style="cursor: pointer; padding: 3px 8px; border-radius: 6px; border: 1px solid #e2e8f0; background: #f8fafc; font-size: 10px; font-weight: 600; color: #475569;">
          ⚡ Full AI Analysis
        </button>
        <button id="acadmail-card-collapse-btn" style="cursor: pointer; padding: 2px 6px; border-radius: 6px; border: none; background: transparent; color: #94a3b8; font-size: 11px;">
          −
        </button>
      </div>
    </div>

    <!-- Collapsible Body -->
    <div id="acadmail-card-content" style="padding-top: 8px; display: flex; flex-direction: column; gap: 8px;">
      <!-- Key Takeaways -->
      <div style="background: #f8fafc; border-radius: 10px; padding: 8px 12px; border: 1px solid #f1f5f9;">
        <div style="font-size: 10px; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: 0.04em; margin-bottom: 4px;">
          Key Takeaways
        </div>
        <ul style="margin: 0; padding-left: 14px; display: flex; flex-direction: column; gap: 3px; font-size: 11px; color: #334155; line-height: 1.4;">
          ${bullets.map((b) => `<li>${b}</li>`).join('')}
        </ul>
      </div>

      <!-- Deadlines & Meeting Links (If detected) -->
      ${
        detectedDeadline || meetingUrl
          ? `
        <div style="display: flex; flex-wrap: wrap; align-items: center; gap: 8px; padding-top: 2px;">
          ${
            detectedDeadline
              ? `
            <div style="display: inline-flex; align-items: center; gap: 6px; padding: 4px 10px; background: #fffbeb; border: 1px solid #fde68a; border-radius: 8px; font-size: 11px; font-weight: 600; color: #b45309;">
              <span>⏰ Due: ${detectedDeadline}</span>
              <a href="${createGCalUrl(emailData.subject, emailData.bodyText.slice(0, 300), detectedDeadline)}" target="_blank" style="padding: 2px 7px; background: #d97706; color: #ffffff; border-radius: 6px; text-decoration: none; font-size: 10px; font-weight: 700;">+ Add to Google Calendar</a>
            </div>
          `
              : ''
          }

          ${
            meetingUrl
              ? `
            <a href="${meetingUrl}" target="_blank" style="display: inline-flex; align-items: center; gap: 5px; padding: 4px 10px; background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 8px; font-size: 11px; font-weight: 700; color: #1d4ed8; text-decoration: none;">
              <span>🎥</span>
              <span>Join Virtual Meeting</span>
            </a>
          `
              : ''
          }
        </div>
      `
          : ''
      }

      <!-- 1-Click Quick Reply Injector -->
      <div style="display: flex; flex-wrap: wrap; align-items: center; gap: 6px; padding-top: 4px; border-top: 1px dashed #e2e8f0;">
        <span style="font-size: 10px; font-weight: 700; color: #64748b;">1-Click Reply Draft:</span>

        <button class="acad-quick-reply-btn" data-reply="confirm" style="cursor: pointer; padding: 3px 9px; border-radius: 8px; border: 1px solid #cbd5e1; background: #ffffff; color: #1e293b; font-size: 10px; font-weight: 600; transition: all 0.15s;">
          ✍️ Confirm Attendance
        </button>

        <button class="acad-quick-reply-btn" data-reply="extension" style="cursor: pointer; padding: 3px 9px; border-radius: 8px; border: 1px solid #cbd5e1; background: #ffffff; color: #1e293b; font-size: 10px; font-weight: 600; transition: all 0.15s;">
          ⏳ Request Extension
        </button>

        <button class="acad-quick-reply-btn" data-reply="doubt" style="cursor: pointer; padding: 3px 9px; border-radius: 8px; border: 1px solid #cbd5e1; background: #ffffff; color: #1e293b; font-size: 10px; font-weight: 600; transition: all 0.15s;">
          ❓ Ask Clarification
        </button>
      </div>
    </div>
  `;

  // Attach card events
  const collapseBtn = card.querySelector('#acadmail-card-collapse-btn') as HTMLElement;
  const contentDiv = card.querySelector('#acadmail-card-content') as HTMLElement;
  if (collapseBtn && contentDiv) {
    collapseBtn.onclick = () => {
      const isHidden = contentDiv.style.display === 'none';
      contentDiv.style.display = isHidden ? 'flex' : 'none';
      collapseBtn.innerText = isHidden ? '−' : '+';
    };
  }

  const sidePanelBtn = card.querySelector('#acadmail-card-sidepanel-btn') as HTMLElement;
  if (sidePanelBtn) {
    sidePanelBtn.onclick = () => safeSendMessage({ type: 'OPEN_SIDEPANEL' });
  }

  // Quick Reply handler
  card.querySelectorAll('.acad-quick-reply-btn').forEach((btn) => {
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

  // Inject below subject container
  subjectContainer.parentElement?.insertBefore(card, subjectContainer.nextSibling);
}

// Automatically clicks Gmail's reply button and inserts draft into compose textarea
async function injectDraftIntoGmailReplyBox(replyText: string, triggerBtn: HTMLElement) {
  const originalText = triggerBtn.innerText;
  triggerBtn.innerText = 'Drafting in Gmail...';

  // 1. Find Gmail's Reply button
  const replyButton =
    (document.querySelector('div[role="button"][aria-label*="Reply"]') as HTMLElement) ||
    (document.querySelector('.ams.bkH') as HTMLElement) ||
    (document.querySelector('.T-I.J-J5-Ji.T-I-Js-IF[data-tooltip*="Reply"]') as HTMLElement) ||
    (document.querySelector('span[role="button"][aria-label*="Reply"]') as HTMLElement);

  if (replyButton) {
    replyButton.click();
  }

  // 2. Wait for Gmail's compose box to appear
  let attempts = 0;
  const interval = setInterval(() => {
    attempts++;
    const composeBox = document.querySelector('div[aria-label="Message Body"], div[role="textbox"][contenteditable="true"]') as HTMLElement;

    if (composeBox) {
      clearInterval(interval);
      composeBox.focus();
      composeBox.innerText = replyText;
      composeBox.dispatchEvent(new Event('input', { bubbles: true }));

      // Scroll smoothly to compose box
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

// ==========================================
// INLINE "PROFESSOR TONE POLISHER" IN COMPOSE
// ==========================================
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

    polishBtn.onmouseenter = () => {
      polishBtn.style.transform = 'translateY(-1px)';
      polishBtn.style.boxShadow = '0 4px 8px rgba(49, 46, 129, 0.3)';
    };
    polishBtn.onmouseleave = () => {
      polishBtn.style.transform = 'translateY(0)';
      polishBtn.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';
    };

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
    box-shadow: 0 12px 30px -5px rgba(0,0,0,0.18), 0 4px 6px -2px rgba(0,0,0,0.05);
    padding: 8px;
    width: 250px;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  `
  );

  menu.innerHTML = `
    <div style="padding: 4px 8px 6px 8px; font-size: 10px; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: 0.05em; border-bottom: 1px solid #f1f5f9;">
      Select Academic Polish Tone
    </div>
    <div style="display: flex; flex-direction: column; gap: 4px; padding-top: 6px;">
      <button class="acad-tone-opt" data-tone="formal" style="text-align: left; padding: 7px 10px; border-radius: 8px; border: none; background: transparent; cursor: pointer; font-size: 11px; font-weight: 600; color: #1e293b; display: flex; align-items: center; gap: 8px;">
        <span>🎓</span>
        <div>
          <div style="line-height: 1;">Respectful & Formal</div>
          <div style="font-size: 9px; color: #94a3b8; font-weight: 400; margin-top: 2px;">General inquiry to professor</div>
        </div>
      </button>

      <button class="acad-tone-opt" data-tone="extension" style="text-align: left; padding: 7px 10px; border-radius: 8px; border: none; background: transparent; cursor: pointer; font-size: 11px; font-weight: 600; color: #1e293b; display: flex; align-items: center; gap: 8px;">
        <span>⏳</span>
        <div>
          <div style="line-height: 1;">Request Extension</div>
          <div style="font-size: 9px; color: #94a3b8; font-weight: 400; margin-top: 2px;">Deadline adjustment request</div>
        </div>
      </button>

      <button class="acad-tone-opt" data-tone="doubt" style="text-align: left; padding: 7px 10px; border-radius: 8px; border: none; background: transparent; cursor: pointer; font-size: 11px; font-weight: 600; color: #1e293b; display: flex; align-items: center; gap: 8px;">
        <span>❓</span>
        <div>
          <div style="line-height: 1;">Clarify Doubt / Office Hours</div>
          <div style="font-size: 9px; color: #94a3b8; font-weight: 400; margin-top: 2px;">Coursework conceptual question</div>
        </div>
      </button>

      <button class="acad-tone-opt" data-tone="lor" style="text-align: left; padding: 7px 10px; border-radius: 8px; border: none; background: transparent; cursor: pointer; font-size: 11px; font-weight: 600; color: #1e293b; display: flex; align-items: center; gap: 8px;">
        <span>📝</span>
        <div>
          <div style="line-height: 1;">Request LoR / Reference</div>
          <div style="font-size: 9px; color: #94a3b8; font-weight: 400; margin-top: 2px;">Polite recommendation inquiry</div>
        </div>
      </button>
    </div>
  `;

  menu.querySelectorAll('.acad-tone-opt').forEach((btn) => {
    const buttonEl = btn as HTMLElement;
    buttonEl.onmouseenter = () => (buttonEl.style.background = '#f1f5f9');
    buttonEl.onmouseleave = () => (buttonEl.style.background = 'transparent');
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
    const textToPolish = roughText || 'Need extension for lab 3 assignment due this friday because of fever.';

    const polished = await callPolishAI(textToPolish, tone, apiKey, groqKey);

    editableBody.focus();
    editableBody.innerText = polished;
    editableBody.dispatchEvent(new Event('input', { bubbles: true }));

    polishBtn.innerHTML = `<span>✅</span><span>Polished!</span>`;
    setTimeout(() => {
      polishBtn.innerHTML = originalBtnHTML;
    }, 2000);
  } catch (err: any) {
    console.error('Polish error:', err);
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

  // Groq API
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

  // Gemini API
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

// Listen for messages from SidePanel
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
    } else if (message.type === 'TOGGLE_IN_PAGE_INTEGRATION') {
      inPageIntegrationEnabled = message.enabled;
      applyIntegrationState();
      sendResponse({ success: true });
    }
    return true;
  });
}

// Floating button
function injectFloatingTrigger() {
  if (document.getElementById('acadmail-floating-trigger')) return;

  const button = document.createElement('button');
  button.id = 'acadmail-floating-trigger';
  button.innerHTML = `
    <span style="display: flex; align-items: center; justify-content: center; width: 20px; height: 20px; border-radius: 6px; background: rgba(255,255,255,0.2);">⚡</span>
    <span style="font-weight: 600; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; letter-spacing: -0.01em;">AcadMail Copilot</span>
  `;
  button.setAttribute(
    'style',
    `
    position: fixed;
    bottom: 24px;
    right: 24px;
    z-index: 999999;
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px 14px;
    background: #0f172a;
    color: #ffffff;
    border: 1px solid rgba(255,255,255,0.15);
    border-radius: 12px;
    box-shadow: 0 10px 25px -5px rgba(15, 23, 42, 0.4), 0 4px 6px -2px rgba(15, 23, 42, 0.2);
    cursor: pointer;
    font-size: 12px;
    backdrop-filter: blur(8px);
    transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
  `
  );

  button.onmouseenter = () => {
    button.style.transform = 'translateY(-2px)';
    button.style.background = '#1e293b';
  };
  button.onmouseleave = () => {
    button.style.transform = 'translateY(0)';
    button.style.background = '#0f172a';
  };

  button.onclick = () => {
    safeSendMessage({ type: 'OPEN_SIDEPANEL' });
  };

  document.body.appendChild(button);
}

// Initial bootstrap
loadSettings();

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    injectFloatingTrigger();
    setTimeout(scanVisibleInbox, 1200);
    setTimeout(checkAndInjectEmailBrief, 1200);
    setTimeout(injectComposePolisher, 1200);
  });
} else {
  injectFloatingTrigger();
  setTimeout(scanVisibleInbox, 1200);
  setTimeout(checkAndInjectEmailBrief, 1200);
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
    }, 400);
  }
  injectComposePolisher();
}).observe(document, { subtree: true, childList: true });

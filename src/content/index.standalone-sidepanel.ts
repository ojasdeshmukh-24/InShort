import { ExtractedEmail, InboxRowItem, CategoryType } from '../types';

console.log('[AcadMail AI] Content script active on webmail.');

let lastClickedRow: HTMLElement | null = null;

function safeSendMessage(message: any) {
  try {
    if (typeof chrome !== 'undefined' && chrome.runtime?.id) {
      chrome.runtime.sendMessage(message).catch(() => {});
    }
  } catch (e) {}
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
      }, 400);
      setTimeout(() => {
        safeSendMessage({ type: 'EMAIL_CHANGED' });
      }, 900);
    }
  },
  true
);

// Scan all visible emails in the current inbox view
function scanVisibleInbox(): InboxRowItem[] {
  const rows = document.querySelectorAll('tr.zA');
  console.log(`[AcadMail AI] Scanning ${rows.length} rows.`);
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

// Filter or highlight rows on Gmail DOM
function filterGmailDom(category: CategoryType | 'ALL') {
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
      rowEl.style.opacity = '0.22';
    }
  });
}

function clickRowByIndex(index: number) {
  const rows = document.querySelectorAll('tr.zA');
  if (rows[index]) {
    const target = rows[index] as HTMLElement;
    target.click();
  }
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
  // Look for Gmail compose action bars
  const composeToolbars = document.querySelectorAll('tr.btC, .gU.Up');

  composeToolbars.forEach((toolbar) => {
    if (toolbar.querySelector('.acadmail-polish-btn')) return;

    // Find the Send button container
    const sendBtnContainer = toolbar.querySelector('td.gU, .T-I-KE') || toolbar.firstElementChild;
    if (!sendBtnContainer) return;

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

  // Find the compose body
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
    animation: fadeIn 0.15s ease-out;
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

  // Attach hover styles and click handler
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

  // Close on outside click
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
    // Read stored settings to get API keys
    const settings = await new Promise<any>((resolve) => {
      if (typeof chrome !== 'undefined' && chrome.storage?.local) {
        chrome.storage.local.get(['acadmail_settings'], (r) => resolve(r.acadmail_settings || {}));
      } else {
        resolve({});
      }
    });

    const apiKey = settings.apiKey || '';
    const groqKey = settings.groqApiKey || '';

    // If text is blank, supply a helpful default
    const textToPolish = roughText || 'Need extension for lab 3 assignment due this friday because of fever.';

    // Polish via direct API call
    const polished = await callPolishAI(textToPolish, tone, apiKey, groqKey);

    // Replace text inside Gmail's compose box and trigger input event for auto-save
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

  // 1. Try Groq if key exists
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

  // 2. Try Gemini
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

  // 3. Fallback
  return `Dear Professor,\n\nI hope this email finds you well.\n\nI am writing to respectfully request your guidance regarding ${rough}.\n\nThank you for your time and consideration.\n\nSincerely,\n[Your Name]\n[Student ID]`;
}

// Message Listener from SidePanel
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
    }
    return true;
  });
}

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

// Initial triggers
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    injectFloatingTrigger();
    setTimeout(scanVisibleInbox, 1200);
    setTimeout(injectComposePolisher, 1200);
  });
} else {
  injectFloatingTrigger();
  setTimeout(scanVisibleInbox, 1200);
  setTimeout(injectComposePolisher, 1200);
}

// Watch for DOM changes (navigation & compose window openings)
let lastUrl = location.href;
new MutationObserver(() => {
  const url = location.href;
  if (url !== lastUrl) {
    lastUrl = url;
    setTimeout(() => {
      safeSendMessage({ type: 'EMAIL_CHANGED' });
      scanVisibleInbox();
    }, 400);
  }
  // Automatically watch for compose toolbars appearing
  injectComposePolisher();
}).observe(document, { subtree: true, childList: true });

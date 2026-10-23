console.log("[AcadMail AI] In-Gmail Native Content Script initialized.");let x="ALL",k=!0,E=!1;function S(t){var o;try{typeof chrome<"u"&&((o=chrome.runtime)!=null&&o.id)&&chrome.runtime.sendMessage(t).catch(()=>{})}catch{}}function O(){var t;typeof chrome<"u"&&((t=chrome.storage)!=null&&t.local)&&chrome.storage.local.get(["acadmail_settings"],o=>{o.acadmail_settings&&typeof o.acadmail_settings.inPageIntegration=="boolean"?k=o.acadmail_settings.inPageIntegration:k=!0,G()})}function G(){var t,o,n;k?(A(),T()):((t=document.getElementById("acadmail-inbox-filter-bar"))==null||t.remove(),(o=document.getElementById("acadmail-minimized-pill"))==null||o.remove(),(n=document.getElementById("acadmail-email-brief-card"))==null||n.remove(),q("ALL"))}function _(t,o,n){const e=`${t} ${o} ${n}`.toLowerCase(),l=t.match(/\b([A-Z]{2,4}\s?[-_]?\s?\d{3,4}[A-Z]?)\b/i),a=l?l[1].toUpperCase():void 0;return e.includes("viva")||e.includes("viva-voce")||e.includes("viva voce")||e.includes("oral defense")||e.includes("thesis defense")||e.includes("phd defense")||e.includes("ph.d. defense")||e.includes("synopsis presentation")||e.includes("synopsis submission")||e.includes("ph.d. viva")||e.includes("phd viva")||e.includes("doctoral defense")?{category:"General",courseCode:a,isPhd:!0}:e.includes("reschedule")||e.includes("rescheduled")||e.includes("postpone")||e.includes("postponed")||e.includes("cancelled")||e.includes("class canceled")||e.includes("venue change")||e.includes("room change")||e.includes("lecture timing")||e.includes("no class today")||e.includes("extra class")?{category:"Class Rescheduling",courseCode:a}:e.includes("competition")||e.includes("tournament")||e.includes("contest")||e.includes("hackathon")||e.includes("sociothon")||e.includes("devfolio")||e.includes("trials")||e.includes("open trials")||e.includes("inter-iit")||e.includes("inter iit")||e.includes("inter-hostel")||e.includes("inter hostel")||e.includes("inter-college")||e.includes("championship")||e.includes("trophy")||e.includes("athletics")||e.includes("sports")||e.includes("cricket")||e.includes("football")||e.includes("badminton")||e.includes("volleyball")||e.includes("table tennis")||e.includes("chess")||e.includes("squash")||e.includes("esports")||e.includes("case competition")||e.includes("case comp")||e.includes("quiz competition")||e.includes("challenge")||e.includes("cash prize")||e.includes("prize pool")||e.includes("mushaira")||e.includes("ideathon")?{category:"Competitions & Tournaments",courseCode:a}:e.includes("intro talk")||e.includes("intro talks")||e.includes("opening talk")||e.includes("introductory talk")||e.includes("orientation talk")||e.includes("info session")||e.includes("tech talk")||e.includes("talk by")||e.includes("distinguished lecture")||e.includes("guest lecture")||e.includes("workshop")||e.includes("webinar")||e.includes("seminar")||e.includes("conclave")||e.includes("symposium")||e.includes("bootcamp")||e.includes("masterclass")||e.includes("hands-on")||e.includes("enactus")||e.includes("sdslabs")||e.includes("pragati")||e.includes("hr conclave")?{category:"Workshops",courseCode:a}:a||e.includes("assignment")||e.includes("homework")||e.includes("syllabus")||e.includes("quiz")||e.includes("midterm")||e.includes("endterm")||e.includes("exam")||e.includes("grade")||e.includes("grading")||e.includes("lab manual")||e.includes("tutorial")||e.includes("office hours")||e.includes("canvas")||e.includes("moodle")||e.includes("classroom")||e.includes("prof.")||e.includes("professor")||e.includes("teaching day")||e.includes("lecture")||e.includes("faculty")||e.includes("ug-i")||e.includes("ug-ii")||e.includes("pg-i")||e.includes("project evaluation")?{category:"Academics",courseCode:a}:{category:"General",courseCode:a}}document.addEventListener("click",t=>{t.target.closest("tr.zA")&&(setTimeout(()=>{S({type:"EMAIL_CHANGED"}),T()},400),setTimeout(()=>{S({type:"EMAIL_CHANGED"}),T()},900))},!0);function A(){const t=document.querySelectorAll("tr.zA"),o=[];return t.forEach((n,e)=>{var v,w,z,C;const l=n,a=l.querySelector(".bqe, .bog, span[data-thread-id]"),s=((v=a==null?void 0:a.textContent)==null?void 0:v.trim())||"(No Subject)",d=l.querySelector(".bA4 span, .yP, .zF"),c=((w=d==null?void 0:d.textContent)==null?void 0:w.trim())||"Unknown",i=l.querySelector(".y2"),p=((z=i==null?void 0:i.textContent)==null?void 0:z.trim())||"",u=l.querySelector(".xW span"),f=((C=u==null?void 0:u.textContent)==null?void 0:C.trim())||"Recent",h=!l.classList.contains("zE"),{category:g,courseCode:r,isPhd:b}=_(s,c,p),m={id:`row-${e}-${s.slice(0,15).replace(/[^a-zA-Z0-9]/g,"_")}`,index:e,subject:s,sender:c,snippet:p,date:f,category:g,courseCode:r,isRead:h};o.push(m),U(l,g,r,b)}),k&&o.length>0&&Y(o),o}function U(t,o,n,e){const l=t.querySelector(".acadmail-row-badge");l&&l.remove();const a=t.querySelector(".y6, .bog");if(!a)return;const s=document.createElement("span");s.className="acadmail-row-badge";let d="background: #eff6ff; color: #1d4ed8; border: 1px solid #bfdbfe;",c="🎓",i=n||"Academics";o==="Competitions & Tournaments"?(d="background: #fffbeb; color: #b45309; border: 1px solid #fde68a;",c="🏆",i="Contest / Sports"):o==="Workshops"?(d="background: #ecfdf5; color: #047857; border: 1px solid #a7f3d0;",c="🛠️",i="Workshop / Talk"):o==="Class Rescheduling"?(d="background: #fff1f2; color: #be123c; border: 1px solid #fecdd3;",c="⏰",i="Rescheduled"):e?(d="background: #f8fafc; color: #475569; border: 1px solid #cbd5e1;",c="📜",i="PhD / Viva"):o==="General"&&(d="background: #f1f5f9; color: #475569; border: 1px solid #e2e8f0;",c="📢",i="General"),s.setAttribute("style",`
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
    ${d}
  `),s.innerText=`${c} ${i}`,a.prepend(s)}function q(t){x=t,document.querySelectorAll("tr.zA").forEach(n=>{const e=n;if(t==="ALL"){e.style.opacity="1",e.style.display="";return}const l=e.querySelector(".acadmail-row-badge"),a=(l==null?void 0:l.textContent)||"";let s=!1;t==="Academics"&&(a.includes("🎓")||a.includes("Academics"))&&(s=!0),t==="Competitions & Tournaments"&&(a.includes("🏆")||a.includes("Contest"))&&(s=!0),t==="Workshops"&&(a.includes("🛠️")||a.includes("Workshop"))&&(s=!0),t==="Class Rescheduling"&&(a.includes("⏰")||a.includes("Rescheduled"))&&(s=!0),t==="General"&&(a.includes("📢")||a.includes("General")||a.includes("PhD"))&&(s=!0),s?(e.style.opacity="1",e.style.display=""):e.style.display="none"}),Z()}function W(t){const o=document.querySelectorAll("tr.zA");o[t]&&o[t].click()}function F(t,o,n){const e="https://calendar.google.com/calendar/render?action=TEMPLATE";let l="";if(n){const s=new Date(n);if(!isNaN(s.getTime())){const d=s.toISOString().replace(/-|:|\.\d\d\d/g,""),i=new Date(s.getTime()+3600*1e3).toISOString().replace(/-|:|\.\d\d\d/g,"");l=`&dates=${d}/${i}`}}const a=new URLSearchParams({text:`[AcadMail] ${t}`,details:`${o}

— Auto-extracted by AcadMail AI`});return`${e}&${a.toString()}${l}`}function Y(t){var g;if(!k)return;const o=document.querySelector('div[gh="tm"]')||document.querySelector("div.G-atb")||document.querySelector("div.aeF")||document.querySelector('div[role="main"]');if(!o)return;let n=0,e=0,l=0,a=0,s=0;const d=/\b(?:due|deadline|by|on|date:|till)\s+([A-Za-z]{3,9}\s+\d{1,2}(?:st|nd|rd|th)?(?:\s*,\s*\d{4})?|\d{1,2}\/\d{1,2}(?:\/\d{2,4})?|\d{1,2}\s+[A-Za-z]{3,9})\b/gi,c=[];t.forEach(r=>{r.category==="Academics"?n++:r.category==="Competitions & Tournaments"?e++:r.category==="Workshops"?l++:r.category==="Class Rescheduling"?a++:s++;const m=[...`${r.subject} ${r.snippet}`.matchAll(d)];m.length>0&&c.push({title:r.subject,deadline:m[0][1]})});let i=document.getElementById("acadmail-inbox-filter-bar");if(E){i&&(i.style.display="none"),R();return}if(!i){i=document.createElement("div"),i.id="acadmail-inbox-filter-bar",i.setAttribute("style",`
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
    `);const r=document.querySelector("div.aeF")||document.querySelector('div[gh="tm"]')||o;(g=r.parentElement)==null||g.insertBefore(i,r)}i.innerHTML=`
    <!-- Left: Brand + Category Pills -->
    <div style="display: flex; align-items: center; gap: 6px; overflow-x: auto; padding-bottom: 1px;">
      <div style="display: flex; align-items: center; gap: 5px; font-weight: 800; color: #1e293b; padding-right: 8px; border-right: 1px solid #e2e8f0; white-space: nowrap;">
        <span style="font-size: 14px;">🎓</span>
        <span style="letter-spacing: -0.02em;">AcadMail</span>
      </div>

      <button class="acad-pill-btn" data-cat="ALL" style="cursor: pointer; padding: 4px 10px; border-radius: 9999px; border: 1px solid #cbd5e1; font-weight: 600; font-size: 11px; white-space: nowrap; transition: all 0.15s ease; ${x==="ALL"?"background: #0f172a; color: #ffffff; border-color: #0f172a;":"background: #f8fafc; color: #475569;"}">
        All (${t.length})
      </button>

      <button class="acad-pill-btn" data-cat="Academics" style="cursor: pointer; padding: 4px 10px; border-radius: 9999px; border: 1px solid ${x==="Academics"?"#2563eb":"#bfdbfe"}; font-weight: 600; font-size: 11px; white-space: nowrap; transition: all 0.15s ease; ${x==="Academics"?"background: #2563eb; color: #ffffff;":"background: #eff6ff; color: #1d4ed8;"}">
        🎓 Academics (${n})
      </button>

      <button class="acad-pill-btn" data-cat="Competitions & Tournaments" style="cursor: pointer; padding: 4px 10px; border-radius: 9999px; border: 1px solid ${x==="Competitions & Tournaments"?"#d97706":"#fde68a"}; font-weight: 600; font-size: 11px; white-space: nowrap; transition: all 0.15s ease; ${x==="Competitions & Tournaments"?"background: #d97706; color: #ffffff;":"background: #fffbeb; color: #b45309;"}">
        🏆 Competitions (${e})
      </button>

      <button class="acad-pill-btn" data-cat="Workshops" style="cursor: pointer; padding: 4px 10px; border-radius: 9999px; border: 1px solid ${x==="Workshops"?"#059669":"#a7f3d0"}; font-weight: 600; font-size: 11px; white-space: nowrap; transition: all 0.15s ease; ${x==="Workshops"?"background: #059669; color: #ffffff;":"background: #ecfdf5; color: #047857;"}">
        🛠️ Workshops & Talks (${l})
      </button>

      <button class="acad-pill-btn" data-cat="Class Rescheduling" style="cursor: pointer; padding: 4px 10px; border-radius: 9999px; border: 1px solid ${x==="Class Rescheduling"?"#e11d48":"#fecdd3"}; font-weight: 600; font-size: 11px; white-space: nowrap; transition: all 0.15s ease; ${x==="Class Rescheduling"?"background: #e11d48; color: #ffffff;":"background: #fff1f2; color: #be123c;"}">
        ⏰ Rescheduled (${a})
      </button>

      <button class="acad-pill-btn" data-cat="General" style="cursor: pointer; padding: 4px 10px; border-radius: 9999px; border: 1px solid ${x==="General"?"#475569":"#e2e8f0"}; font-weight: 600; font-size: 11px; white-space: nowrap; transition: all 0.15s ease; ${x==="General"?"background: #475569; color: #ffffff;":"background: #f8fafc; color: #64748b;"}">
        📜 PhD & General (${s})
      </button>
    </div>

    <!-- Right: Deadlines Quick Popover + Actions -->
    <div style="display: flex; align-items: center; gap: 6px; shrink: 0; padding-left: 6px;">
      <div style="position: relative;">
        <button id="acadmail-deadlines-btn" style="cursor: pointer; display: flex; align-items: center; gap: 4px; padding: 4px 9px; border-radius: 8px; border: 1px solid #cbd5e1; background: #ffffff; color: #334155; font-size: 11px; font-weight: 600; transition: all 0.15s;">
          <span>📅</span>
          <span>Deadlines (${c.length})</span>
        </button>
        <div id="acadmail-deadlines-popover" style="display: none; position: absolute; right: 0; top: 32px; width: 300px; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; box-shadow: 0 10px 25px -5px rgba(0,0,0,0.15); padding: 10px; z-index: 99999;">
          <div style="font-weight: 700; color: #1e293b; font-size: 11px; margin-bottom: 6px; display: flex; justify-content: space-between; align-items: center;">
            <span>Detected Inbox Deadlines</span>
            <span style="font-size: 9px; color: #64748b; font-weight: 400;">1-Click Google Calendar</span>
          </div>
          <div style="max-height: 220px; overflow-y: auto; display: flex; flex-direction: column; gap: 5px;">
            ${c.length===0?'<div style="color: #94a3b8; font-size: 10px; text-align: center; padding: 12px 0;">No active deadlines detected in current view</div>':c.map(r=>`
              <div style="padding: 6px 8px; background: #f8fafc; border: 1px solid #f1f5f9; border-radius: 8px; display: flex; align-items: center; justify-content: space-between; gap: 6px;">
                <div style="overflow: hidden;">
                  <div style="font-size: 10px; font-weight: 600; color: #1e293b; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${r.title}</div>
                  <div style="font-size: 9px; color: #b45309; font-weight: 600;">⏰ ${r.deadline}</div>
                </div>
                <a href="${F(r.title,"Course deadline from email",r.deadline)}" target="_blank" style="text-decoration: none; shrink: 0; padding: 2px 6px; background: #eff6ff; color: #1d4ed8; border: 1px solid #bfdbfe; border-radius: 6px; font-size: 9px; font-weight: 600;">+ GCal</a>
              </div>
            `).join("")}
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
  `,i.querySelectorAll(".acad-pill-btn").forEach(r=>{const b=r;b.onclick=()=>{const m=b.getAttribute("data-cat");q(x===m&&m!=="ALL"?"ALL":m)}});const p=i.querySelector("#acadmail-deadlines-btn"),u=i.querySelector("#acadmail-deadlines-popover");p&&u&&(p.onclick=r=>{r.stopPropagation(),u.style.display=u.style.display==="block"?"none":"block"},document.addEventListener("click",r=>{!u.contains(r.target)&&r.target!==p&&(u.style.display="none")}));const f=i.querySelector("#acadmail-open-sidepanel-btn");f&&(f.onclick=()=>S({type:"OPEN_SIDEPANEL"}));const h=i.querySelector("#acadmail-minimize-bar-btn");h&&(h.onclick=()=>{E=!0,i&&(i.style.display="none"),R()})}function Z(){const t=document.getElementById("acadmail-inbox-filter-bar");t&&t.querySelectorAll(".acad-pill-btn").forEach(o=>{const n=o;n.getAttribute("data-cat")===x?n.style.boxShadow="0 0 0 2px rgba(37,99,235,0.2)":n.style.boxShadow="none"})}function R(){if(document.getElementById("acadmail-minimized-pill"))return;const t=document.createElement("div");t.id="acadmail-minimized-pill",t.setAttribute("style",`
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
  `),t.innerHTML='<span>🎓 AcadMail Bar</span> <span style="color: #94a3b8; font-size: 9px;">(Click to expand)</span>',t.onclick=()=>{E=!1,t.remove();const o=document.getElementById("acadmail-inbox-filter-bar");o?o.style.display="flex":A()},document.body.appendChild(t)}function T(){var z,C,M,P;if(!k)return;const t=H();if(!t){(z=document.getElementById("acadmail-email-brief-card"))==null||z.remove();return}const o=document.querySelector("div.ha")||((C=document.querySelector("h2.hP"))==null?void 0:C.parentElement)||((M=document.querySelector('div[role="main"] h2'))==null?void 0:M.parentElement);if(!o)return;const n=document.getElementById("acadmail-email-brief-card"),e=n==null?void 0:n.getAttribute("data-email-id");if(n&&e===t.id)return;n&&n.remove();const l=_(t.subject,t.senderName,t.bodyText),a=l.category,s=l.courseCode,d=`${t.subject} ${t.bodyText}`,c=/\b(?:due|deadline|by|on|date:|till)\s+([A-Za-z]{3,9}\s+\d{1,2}(?:st|nd|rd|th)?(?:\s*,\s*\d{4})?|\d{1,2}\/\d{1,2}(?:\/\d{2,4})?|\d{1,2}\s+[A-Za-z]{3,9})\b/i,i=d.match(c),p=i?i[1]:null,u=d.match(/https?:\/\/(?:[a-zA-Z0-9-]+\.)?(?:zoom\.us\/j|meet\.google\.com|teams\.microsoft\.com\/l)\/[^\s<>"']+/i),f=u?u[0]:null,g=t.bodyText.split(/\.\s+/).map(y=>y.trim()).filter(y=>y.length>25&&!y.includes("http")&&!y.includes("unsubscribe")&&!y.includes("Regards")).slice(0,3);g.length===0&&g.push(`Notification regarding ${t.subject} from ${t.senderName}.`);const r=document.createElement("div");r.id="acadmail-email-brief-card",r.setAttribute("data-email-id",t.id),r.setAttribute("style",`
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
  `);let b=`<span style="padding: 2px 8px; border-radius: 9999px; font-weight: 700; font-size: 10px; background: #eff6ff; color: #1d4ed8; border: 1px solid #bfdbfe;">🎓 ${s||"Academics"}</span>`;a==="Competitions & Tournaments"?b='<span style="padding: 2px 8px; border-radius: 9999px; font-weight: 700; font-size: 10px; background: #fffbeb; color: #b45309; border: 1px solid #fde68a;">🏆 Competitions / Sports</span>':a==="Workshops"?b='<span style="padding: 2px 8px; border-radius: 9999px; font-weight: 700; font-size: 10px; background: #ecfdf5; color: #047857; border: 1px solid #a7f3d0;">🛠️ Workshops & Talks</span>':a==="Class Rescheduling"?b='<span style="padding: 2px 8px; border-radius: 9999px; font-weight: 700; font-size: 10px; background: #fff1f2; color: #be123c; border: 1px solid #fecdd3;">⏰ Class Rescheduled</span>':l.isPhd&&(b='<span style="padding: 2px 8px; border-radius: 9999px; font-weight: 700; font-size: 10px; background: #f8fafc; color: #475569; border: 1px solid #cbd5e1;">📜 PhD Defense / Viva</span>'),r.innerHTML=`
    <!-- Top Header Bar -->
    <div style="display: flex; align-items: center; justify-content: space-between; padding-bottom: 8px; border-bottom: 1px solid #f1f5f9;">
      <div style="display: flex; align-items: center; gap: 8px;">
        <div style="display: flex; align-items: center; gap: 4px; font-weight: 800; font-size: 12px; color: #0f172a;">
          <span style="font-size: 14px;">🎓</span>
          <span>AcadMail Copilot Brief</span>
        </div>
        ${b}
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
          ${g.map(y=>`<li>${y}</li>`).join("")}
        </ul>
      </div>

      <!-- Deadlines & Meeting Links (If detected) -->
      ${p||f?`
        <div style="display: flex; flex-wrap: wrap; align-items: center; gap: 8px; padding-top: 2px;">
          ${p?`
            <div style="display: inline-flex; align-items: center; gap: 6px; padding: 4px 10px; background: #fffbeb; border: 1px solid #fde68a; border-radius: 8px; font-size: 11px; font-weight: 600; color: #b45309;">
              <span>⏰ Due: ${p}</span>
              <a href="${F(t.subject,t.bodyText.slice(0,300),p)}" target="_blank" style="padding: 2px 7px; background: #d97706; color: #ffffff; border-radius: 6px; text-decoration: none; font-size: 10px; font-weight: 700;">+ Add to Google Calendar</a>
            </div>
          `:""}

          ${f?`
            <a href="${f}" target="_blank" style="display: inline-flex; align-items: center; gap: 5px; padding: 4px 10px; background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 8px; font-size: 11px; font-weight: 700; color: #1d4ed8; text-decoration: none;">
              <span>🎥</span>
              <span>Join Virtual Meeting</span>
            </a>
          `:""}
        </div>
      `:""}

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
  `;const m=r.querySelector("#acadmail-card-collapse-btn"),v=r.querySelector("#acadmail-card-content");m&&v&&(m.onclick=()=>{const y=v.style.display==="none";v.style.display=y?"flex":"none",m.innerText=y?"−":"+"});const w=r.querySelector("#acadmail-card-sidepanel-btn");w&&(w.onclick=()=>S({type:"OPEN_SIDEPANEL"})),r.querySelectorAll(".acad-quick-reply-btn").forEach(y=>{const $=y;$.onclick=async()=>{const D=$.getAttribute("data-reply");let I="";D==="confirm"?I=`Dear ${t.senderName||"Professor"},

Thank you for the update regarding "${t.subject}". I confirm my participation and will ensure all prerequisites are met.

Best regards,
[Your Name]
[Student ID]`:D==="extension"?I=`Dear Professor ${t.senderName||""},

I hope this email finds you well. I am writing to respectfully ask if it might be possible to grant a short extension on the submission for "${t.subject}". I want to ensure my work meets the highest standards.

Thank you for your time and understanding.

Sincerely,
[Your Name]
[Student ID]`:I=`Dear Professor ${t.senderName||""},

I hope you are well. Regarding the announcement on "${t.subject}", I had a quick question regarding the specifications and would appreciate some guidance.

Thank you very much.

Sincerely,
[Your Name]
[Student ID]`,await J(I,$)}}),(P=o.parentElement)==null||P.insertBefore(r,o.nextSibling)}async function J(t,o){const n=o.innerText;o.innerText="Drafting in Gmail...";const e=document.querySelector('div[role="button"][aria-label*="Reply"]')||document.querySelector(".ams.bkH")||document.querySelector('.T-I.J-J5-Ji.T-I-Js-IF[data-tooltip*="Reply"]')||document.querySelector('span[role="button"][aria-label*="Reply"]');e&&e.click();let l=0;const a=setInterval(()=>{l++;const s=document.querySelector('div[aria-label="Message Body"], div[role="textbox"][contenteditable="true"]');s?(clearInterval(a),s.focus(),s.innerText=t,s.dispatchEvent(new Event("input",{bubbles:!0})),s.scrollIntoView({behavior:"smooth",block:"center"}),o.innerText="✅ Drafted in Gmail!",setTimeout(()=>{o.innerText=n},2500)):l>15&&(clearInterval(a),o.innerText="⚠️ Please click Reply first",setTimeout(()=>{o.innerText=n},2e3))},200)}function H(){var l,a,s,d,c;const t=document.querySelector("h2.hP")||document.querySelector("div.ha h2")||document.querySelector('div[role="main"] h2')||document.querySelector("h2[data-legacy-thread-id]")||document.querySelector("h1[data-thread-perm-id]"),o=((l=t==null?void 0:t.textContent)==null?void 0:l.trim())||"",n=document.querySelectorAll('.a3s.aiL, div[role="listitem"] .adn .a3s, .ii.gt, div.adn.ads');let e="";if(n.length>0&&(e=((a=n[n.length-1].textContent)==null?void 0:a.trim())||""),o&&(e||n.length>0)){const i=document.querySelector("span[email]")||document.querySelector(".gD")||document.querySelector(".go")||document.querySelector("span.zF"),p=(i==null?void 0:i.getAttribute("email"))||((s=i==null?void 0:i.textContent)==null?void 0:s.trim())||"academic@university.edu",u=(i==null?void 0:i.getAttribute("name"))||((d=i==null?void 0:i.textContent)==null?void 0:d.trim())||"Academic Sender",f=document.querySelector(".g3")||document.querySelector("span.mI")||document.querySelector(".date"),h=(f==null?void 0:f.getAttribute("title"))||((c=f==null?void 0:f.textContent)==null?void 0:c.trim())||new Date().toLocaleString();return{id:(window.location.hash||"").replace(/[^a-zA-Z0-9_-]/g,"_")||`email-${Date.now()}`,subject:o,senderName:u,senderEmail:p,recipient:"Me",dateStr:h,bodyText:e.slice(0,5e3),url:window.location.href}}return null}function L(){document.querySelectorAll("tr.btC, .gU.Up").forEach(o=>{if(o.querySelector(".acadmail-polish-btn"))return;const n=document.createElement("div");n.className="acadmail-polish-btn",n.setAttribute("style",`
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
    `),n.innerHTML=`
      <span style="font-size: 12px;">✨</span>
      <span>Polish for Professor</span>
    `,n.onmouseenter=()=>{n.style.transform="translateY(-1px)",n.style.boxShadow="0 4px 8px rgba(49, 46, 129, 0.3)"},n.onmouseleave=()=>{n.style.transform="translateY(0)",n.style.boxShadow="0 2px 4px rgba(0,0,0,0.1)"},n.onclick=e=>{e.stopPropagation(),V(o,n)},o.appendChild(n)})}function V(t,o){var c;const n=document.getElementById("acadmail-tone-menu");if(n){n.remove();return}const e=t.closest('div[role="dialog"]')||t.closest(".M9"),l=e==null?void 0:e.querySelector('div[aria-label="Message Body"], div[contenteditable="true"]'),a=((c=l==null?void 0:l.innerText)==null?void 0:c.trim())||"",s=document.createElement("div");s.id="acadmail-tone-menu",s.setAttribute("style",`
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
  `),s.innerHTML=`
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
  `,s.querySelectorAll(".acad-tone-opt").forEach(i=>{const p=i;p.onmouseenter=()=>p.style.background="#f1f5f9",p.onmouseleave=()=>p.style.background="transparent",p.onclick=async()=>{const u=p.getAttribute("data-tone")||"formal";s.remove(),await K(l,a,u,o)}}),o.appendChild(s);const d=i=>{!s.contains(i.target)&&!o.contains(i.target)&&(s.remove(),document.removeEventListener("click",d))};setTimeout(()=>document.addEventListener("click",d),100)}async function K(t,o,n,e){if(!t)return;const l=e.innerHTML;e.innerHTML="<span>⏳</span><span>Polishing...</span>";try{const a=await new Promise(p=>{var u;typeof chrome<"u"&&((u=chrome.storage)!=null&&u.local)?chrome.storage.local.get(["acadmail_settings"],f=>p(f.acadmail_settings||{})):p({})}),s=a.apiKey||"",d=a.groqApiKey||"",i=await Q(o||"Need extension for lab 3 assignment due this friday because of fever.",n,s,d);t.focus(),t.innerText=i,t.dispatchEvent(new Event("input",{bubbles:!0})),e.innerHTML="<span>✅</span><span>Polished!</span>",setTimeout(()=>{e.innerHTML=l},2e3)}catch(a){console.error("Polish error:",a),e.innerHTML="<span>⚠️ Error</span>",setTimeout(()=>{e.innerHTML=l},2e3)}}async function Q(t,o,n,e){var s,d,c,i,p,u,f,h,g;const a=`Transform this student's rough notes into a courteous, polished academic email to a professor.
Tone: ${{formal:"Polite, professional academic tone to a professor.",extension:"Polite, respectful request for an assignment deadline extension showing dedication.",doubt:"Polite conceptual question or office hours request referencing lecture material.",lor:"Courteous inquiry requesting a Letter of Recommendation for graduate studies/internships."}[o]||"Formal"}
Guidelines:
- Include respectful salutation ("Dear Professor [Name],", "I hope this email finds you well.")
- Keep it concise, courteous, and respectful.
- Retain all dates, assignment titles, or reasons mentioned.
- Conclude with a warm academic sign-off ("Sincerely,", "Best regards," followed by "[Your Name] [Student ID]").
- Output ONLY the final email text.

Student's notes:
${t}`;if(e&&e.trim())try{const r=await fetch("https://api.groq.com/openai/v1/chat/completions",{method:"POST",headers:{Authorization:`Bearer ${e.trim()}`,"Content-Type":"application/json"},body:JSON.stringify({model:"llama-3.3-70b-versatile",messages:[{role:"user",content:a}],temperature:.3})});if(r.ok)return((i=(c=(d=(s=(await r.json()).choices)==null?void 0:s[0])==null?void 0:d.message)==null?void 0:c.content)==null?void 0:i.trim())||t}catch{}if(n&&n.trim()){const r=["models/gemini-2.0-flash","models/gemini-3.8-flash","models/gemini-1.5-flash"];for(const b of r)try{const m=await fetch(`https://generativelanguage.googleapis.com/v1beta/${b}:generateContent?key=${n.trim()}`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({contents:[{parts:[{text:a}]}],generationConfig:{temperature:.3}})});if(m.ok){const v=await m.json(),w=(g=(h=(f=(u=(p=v==null?void 0:v.candidates)==null?void 0:p[0])==null?void 0:u.content)==null?void 0:f.parts)==null?void 0:h[0])==null?void 0:g.text;if(w)return w.trim()}}catch{}}return`Dear Professor,

I hope this email finds you well.

I am writing to respectfully request your guidance regarding ${t}.

Thank you for your time and consideration.

Sincerely,
[Your Name]
[Student ID]`}var B;typeof chrome<"u"&&((B=chrome.runtime)!=null&&B.onMessage)&&chrome.runtime.onMessage.addListener((t,o,n)=>{if(t.type==="GET_ACTIVE_EMAIL"){const e=H();n({email:e})}else if(t.type==="SCAN_INBOX"){const e=A();n({items:e})}else t.type==="FILTER_GMAIL_DOM"?(q(t.category),n({success:!0})):t.type==="CLICK_ROW"?(W(t.index),n({success:!0})):t.type==="TOGGLE_IN_PAGE_INTEGRATION"&&(k=t.enabled,G(),n({success:!0}));return!0});function N(){if(document.getElementById("acadmail-floating-trigger"))return;const t=document.createElement("button");t.id="acadmail-floating-trigger",t.innerHTML=`
    <span style="display: flex; align-items: center; justify-content: center; width: 20px; height: 20px; border-radius: 6px; background: rgba(255,255,255,0.2);">⚡</span>
    <span style="font-weight: 600; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; letter-spacing: -0.01em;">AcadMail Copilot</span>
  `,t.setAttribute("style",`
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
  `),t.onmouseenter=()=>{t.style.transform="translateY(-2px)",t.style.background="#1e293b"},t.onmouseleave=()=>{t.style.transform="translateY(0)",t.style.background="#0f172a"},t.onclick=()=>{S({type:"OPEN_SIDEPANEL"})},document.body.appendChild(t)}O();document.readyState==="loading"?document.addEventListener("DOMContentLoaded",()=>{N(),setTimeout(A,1200),setTimeout(T,1200),setTimeout(L,1200)}):(N(),setTimeout(A,1200),setTimeout(T,1200),setTimeout(L,1200));let j=location.href;new MutationObserver(()=>{const t=location.href;t!==j&&(j=t,setTimeout(()=>{S({type:"EMAIL_CHANGED"}),A(),T()},400)),L()}).observe(document,{subtree:!0,childList:!0});

console.log("[AcadMail AI] Ultra-Clean Material 3 Gmail Script with Custom Filters & Relabeling active.");let P="ALL",_=[],v="blended",C=!1,$=[{id:"filter-placements",name:"Placements & Internships",color:"#8b5cf6",keywords:["placement","tpo","internship","interview","shortlist","offer","ctc","pre-placement"]},{id:"filter-hostel",name:"Hostel & Campus Mess",color:"#06b6d4",keywords:["hostel","mess","warden","room","maintenance","electricity","water","hall of residence"]}],k={};function T(n){var t;try{typeof chrome<"u"&&((t=chrome.runtime)!=null&&t.id)&&chrome.runtime.sendMessage(n).catch(()=>{})}catch{}}function q(){try{const n=window.getComputedStyle(document.body).backgroundColor;if(n){const t=n.match(/\d+/g);if(t&&t.length>=3)return(parseInt(t[0])*299+parseInt(t[1])*587+parseInt(t[2])*114)/1e3<128}}catch{}return window.matchMedia("(prefers-color-scheme: dark)").matches}function W(){var n;typeof chrome<"u"&&((n=chrome.storage)!=null&&n.local)&&chrome.storage.local.get(["acadmail_settings"],t=>{t.acadmail_settings&&(t.acadmail_settings.uiMode?v=t.acadmail_settings.uiMode:t.acadmail_settings.inPageIntegration===!1?v="off":v="blended",Array.isArray(t.acadmail_settings.customFilters)&&($=t.acadmail_settings.customFilters),t.acadmail_settings.labelOverrides&&(k=t.acadmail_settings.labelOverrides)),F()})}function F(){var n,t,o,a;if((n=document.getElementById("acadmail-native-chip-bar"))==null||n.remove(),(t=document.getElementById("acadmail-inbox-filter-bar"))==null||t.remove(),(o=document.getElementById("acadmail-email-brief-card"))==null||o.remove(),(a=document.getElementById("acadmail-siderail-btn"))==null||a.remove(),v==="off"){I("ALL");return}S(),A(),D()}function Z(n,t,o,a){var s;k[n]=a,t&&(k[t]=a);const e=`${t}::${o}`.trim();e&&(k[e]=a),typeof chrome<"u"&&((s=chrome.storage)!=null&&s.local)&&chrome.storage.local.get(["acadmail_settings"],r=>{const d=r.acadmail_settings||{},l=d.labelOverrides||{};l[n]=a,t&&(l[t]=a),e&&(l[e]=a),chrome.storage.local.set({acadmail_settings:{...d,labelOverrides:l}})}),S(),A(),T({type:"EMAIL_CHANGED"}),Y(`Email re-labeled as "${a}"`)}function Q(n,t){var e;if(!n.trim())return;const o=t.split(",").map(s=>s.trim().toLowerCase()).filter(Boolean),a={id:`filter-${Date.now()}`,name:n.trim(),color:"#8b5cf6",keywords:o.length>0?o:[n.trim().toLowerCase()]};$.push(a),typeof chrome<"u"&&((e=chrome.storage)!=null&&e.local)&&chrome.storage.local.get(["acadmail_settings"],s=>{const r=s.acadmail_settings||{},d=r.customFilters||[];chrome.storage.local.set({acadmail_settings:{...r,customFilters:[...d,a]}})}),S(),T({type:"UPDATE_CUSTOM_FILTERS"}),Y(`Created filter "${a.name}"`)}function J(n,t,o,a){const e=`${n} ${t} ${o}`.toLowerCase(),s=n.match(/\b([A-Z]{2,4}\s?[-_]?\s?\d{3,4}[A-Z]?)\b/i),r=s?s[1].toUpperCase():void 0;if(a&&k[a])return{category:k[a],courseCode:r};if(k[n])return{category:k[n],courseCode:r};const d=`${n}::${t}`.trim();if(k[d])return{category:k[d],courseCode:r};if($&&$.length>0){for(const l of $)if(l.keywords&&l.keywords.some(i=>i.trim()&&e.includes(i.trim().toLowerCase())))return{category:l.name,courseCode:r}}return e.includes("viva")||e.includes("viva-voce")||e.includes("viva voce")||e.includes("oral defense")||e.includes("thesis defense")||e.includes("phd defense")||e.includes("ph.d. defense")||e.includes("synopsis presentation")||e.includes("synopsis submission")||e.includes("ph.d. viva")||e.includes("phd viva")||e.includes("doctoral defense")?{category:"General",courseCode:r,isPhd:!0}:e.includes("reschedule")||e.includes("rescheduled")||e.includes("postpone")||e.includes("postponed")||e.includes("cancelled")||e.includes("class canceled")||e.includes("venue change")||e.includes("room change")||e.includes("lecture timing")||e.includes("no class today")||e.includes("extra class")?{category:"Class Rescheduling",courseCode:r}:e.includes("competition")||e.includes("tournament")||e.includes("contest")||e.includes("hackathon")||e.includes("sociothon")||e.includes("devfolio")||e.includes("trials")||e.includes("open trials")||e.includes("inter-iit")||e.includes("inter iit")||e.includes("inter-hostel")||e.includes("inter hostel")||e.includes("inter-college")||e.includes("championship")||e.includes("trophy")||e.includes("athletics")||e.includes("sports")||e.includes("cricket")||e.includes("football")||e.includes("badminton")||e.includes("volleyball")||e.includes("table tennis")||e.includes("chess")||e.includes("squash")||e.includes("esports")||e.includes("case competition")||e.includes("case comp")||e.includes("quiz competition")||e.includes("challenge")||e.includes("cash prize")||e.includes("prize pool")||e.includes("mushaira")||e.includes("ideathon")?{category:"Competitions & Tournaments",courseCode:r}:e.includes("intro talk")||e.includes("intro talks")||e.includes("opening talk")||e.includes("introductory talk")||e.includes("orientation talk")||e.includes("info session")||e.includes("tech talk")||e.includes("talk by")||e.includes("distinguished lecture")||e.includes("guest lecture")||e.includes("workshop")||e.includes("webinar")||e.includes("seminar")||e.includes("conclave")||e.includes("symposium")||e.includes("bootcamp")||e.includes("masterclass")||e.includes("hands-on")||e.includes("enactus")||e.includes("sdslabs")||e.includes("pragati")||e.includes("hr conclave")?{category:"Workshops",courseCode:r}:r||e.includes("assignment")||e.includes("homework")||e.includes("syllabus")||e.includes("quiz")||e.includes("midterm")||e.includes("endterm")||e.includes("exam")||e.includes("grade")||e.includes("grading")||e.includes("lab manual")||e.includes("tutorial")||e.includes("office hours")||e.includes("canvas")||e.includes("moodle")||e.includes("classroom")||e.includes("prof.")||e.includes("professor")||e.includes("teaching day")||e.includes("lecture")||e.includes("faculty")||e.includes("ug-i")||e.includes("ug-ii")||e.includes("pg-i")||e.includes("project evaluation")?{category:"Academics",courseCode:r}:{category:"General",courseCode:r}}document.addEventListener("click",n=>{n.target.closest("tr.zA")&&(setTimeout(()=>{T({type:"EMAIL_CHANGED"}),A()},350),setTimeout(()=>{T({type:"EMAIL_CHANGED"}),A()},800))},!0);function S(){const n=document.querySelectorAll("tr.zA"),t=[];return n.forEach((o,a)=>{var g,M,E,L;const e=o,s=e.querySelector(".bqe, .bog, span[data-thread-id]"),r=((g=s==null?void 0:s.textContent)==null?void 0:g.trim())||"(No Subject)",d=e.querySelector(".bA4 span, .yP, .zF"),l=((M=d==null?void 0:d.textContent)==null?void 0:M.trim())||"Unknown",i=e.querySelector(".y2"),p=((E=i==null?void 0:i.textContent)==null?void 0:E.trim())||"",c=e.querySelector(".xW span"),m=((L=c==null?void 0:c.textContent)==null?void 0:L.trim())||"Recent",u=!e.classList.contains("zE"),b=`${r}::${l}`.trim(),{category:x,courseCode:w,isPhd:f}=J(r,l,p,b),h={id:`row-${a}-${r.slice(0,15).replace(/[^a-zA-Z0-9]/g,"_")}`,index:a,subject:r,sender:l,snippet:p,date:m,category:x,courseCode:w,isRead:u};t.push(h),ee(e,x,w,f,r,l)}),_=t,v==="blended"&&t.length>0&&V(t),t}function ee(n,t,o,a,e,s){const r=n.querySelector(".acadmail-row-badge");r&&r.remove();const d=n.querySelector(".y6, .bog");if(!d)return;const l=q(),i=document.createElement("span");i.className="acadmail-row-badge";let p=l?"background: rgba(56, 139, 253, 0.15); color: #79c0ff; border: 1px solid rgba(56, 139, 253, 0.3);":"background: #edf5fd; color: #1a73e8; border: 1px solid #d2e3fc;",c="🎓",m=o||"Acads";t==="Competitions & Tournaments"?(p=l?"background: rgba(210, 153, 34, 0.15); color: #e3b341; border: 1px solid rgba(210, 153, 34, 0.3);":"background: #fef7e0; color: #b06000; border: 1px solid #fce8b2;",c="🏆",m="Contest"):t==="Workshops"?(p=l?"background: rgba(46, 160, 67, 0.15); color: #7ee787; border: 1px solid rgba(46, 160, 67, 0.3);":"background: #e6f4ea; color: #137333; border: 1px solid #ceead6;",c="🛠️",m="Workshop"):t==="Class Rescheduling"?(p=l?"background: rgba(248, 81, 73, 0.15); color: #ff7b72; border: 1px solid rgba(248, 81, 73, 0.3);":"background: #fce8e6; color: #c5221f; border: 1px solid #fad2cf;",c="⏰",m="Rescheduled"):a?(p=l?"background: rgba(142, 145, 143, 0.15); color: #c4c7c5; border: 1px solid rgba(142, 145, 143, 0.3);":"background: #f1f3f4; color: #5f6368; border: 1px solid #dadce0;",c="📜",m="PhD / Viva"):t==="General"?(p=l?"background: rgba(142, 145, 143, 0.12); color: #c4c7c5; border: 1px solid rgba(142, 145, 143, 0.2);":"background: #f8f9fa; color: #5f6368; border: 1px solid #dadce0;",c="📢",m="General"):(p=l?"background: rgba(168, 85, 247, 0.15); color: #c084fc; border: 1px solid rgba(168, 85, 247, 0.3);":"background: #f3e8ff; color: #7e22ce; border: 1px solid #e9d5ff;",c="🏷️",m=t),i.setAttribute("style",`
    display: inline-flex;
    align-items: center;
    gap: 2.5px;
    padding: 0 5px;
    height: 16px;
    margin-right: 6px;
    border-radius: 4px;
    font-size: 10px;
    font-weight: 500;
    font-family: -apple-system, BlinkMacSystemFont, "Google Sans", Roboto, sans-serif;
    vertical-align: middle;
    cursor: pointer;
    ${p}
  `),i.innerText=`${c} ${m}`,i.title=o?`Filter Gmail for ${o} (Right-click to change label)`:`Category: ${t} (Click to change)`,i.onclick=u=>{u.stopPropagation(),o?te(o):G(i,e,s,t)},i.oncontextmenu=u=>{u.preventDefault(),u.stopPropagation(),G(i,e,s,t)},d.prepend(i)}function te(n){const t=document.querySelector('input[name="q"], input[aria-label*="Search"]');if(t){t.value=n,t.dispatchEvent(new Event("input",{bubbles:!0}));const o=t.closest("form");o?o.dispatchEvent(new Event("submit",{bubbles:!0,cancelable:!0})):t.dispatchEvent(new KeyboardEvent("keydown",{key:"Enter",keyCode:13,bubbles:!0}))}}function I(n){P=n,document.querySelectorAll("tr.zA").forEach(o=>{const a=o;if(n==="ALL"){a.style.display="";return}const e=a.querySelector(".acadmail-row-badge"),s=(e==null?void 0:e.textContent)||"";let r=!1;(n==="Academics"&&(s.includes("🎓")||s.includes("Acads"))||n==="Competitions & Tournaments"&&(s.includes("🏆")||s.includes("Contest"))||n==="Workshops"&&(s.includes("🛠️")||s.includes("Workshop"))||n==="Class Rescheduling"&&(s.includes("⏰")||s.includes("Rescheduled"))||n==="General"&&(s.includes("📢")||s.includes("General")||s.includes("PhD"))||s.toLowerCase().includes(n.toLowerCase()))&&(r=!0),r?a.style.display="":a.style.display="none"}),oe()}function K(n,t,o){const a="https://calendar.google.com/calendar/render?action=TEMPLATE";let e="";if(o){const r=new Date(o);if(!isNaN(r.getTime())){const d=r.toISOString().replace(/-|:|\.\d\d\d/g,""),i=new Date(r.getTime()+3600*1e3).toISOString().replace(/-|:|\.\d\d\d/g,"");e=`&dates=${d}/${i}`}}const s=new URLSearchParams({text:`[AcadMail] ${n}`,details:`${t}

— Auto-extracted by AcadMail AI`});return`${a}&${s.toString()}${e}`}function Y(n){const t=document.getElementById("acadmail-toast");t&&t.remove();const o=document.createElement("div");o.id="acadmail-toast",o.innerText=n,o.setAttribute("style",`
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
  `),document.body.appendChild(o),setTimeout(()=>o.remove(),2500)}function V(n){var w;if(v!=="blended")return;const t=document.querySelector('div[gh="tm"]')||document.querySelector("div.G-atb")||document.querySelector("div.aeF");if(!t)return;let o=0,a=0,e=0,s=0,r=0;const d=/\b(?:due|deadline|by|on|date:|till)\s+([A-Za-z]{3,9}\s+\d{1,2}(?:st|nd|rd|th)?(?:\s*,\s*\d{4})?|\d{1,2}\/\d{1,2}(?:\/\d{2,4})?|\d{1,2}\s+[A-Za-z]{3,9})\b/gi,l=[];n.forEach(f=>{f.category==="Academics"?o++:f.category==="Competitions & Tournaments"?a++:f.category==="Workshops"?e++:f.category==="Class Rescheduling"?s++:f.category==="General"&&r++;const g=[...`${f.subject} ${f.snippet}`.matchAll(d)];g.length>0&&l.push({title:f.subject,deadline:g[0][1]})});const i=q();let p=document.getElementById("acadmail-native-chip-bar");p||(p=document.createElement("div"),p.id="acadmail-native-chip-bar",p.setAttribute("style",`
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 6px;
      padding: 4px 16px;
      margin: 0;
      background: transparent;
      border-bottom: 1px solid ${i?"rgba(255,255,255,0.08)":"rgba(0,0,0,0.06)"};
      font-family: -apple-system, BlinkMacSystemFont, "Google Sans", Roboto, sans-serif;
      font-size: 12px;
      z-index: 10;
    `),(w=t.parentElement)==null||w.insertBefore(p,t.nextSibling||t));const c=f=>P===f?`
        height: 26px;
        padding: 0 10px;
        border-radius: 9999px;
        border: none;
        background: ${i?"#004a77":"#c2e7ff"};
        color: ${i?"#c2e7ff":"#001d35"};
        font-weight: 600;
        cursor: pointer;
        display: inline-flex;
        align-items: center;
        gap: 4px;
        font-size: 11.5px;
        transition: all 0.15s ease;
      `:`
      height: 26px;
      padding: 0 10px;
      border-radius: 9999px;
      border: 1px solid ${i?"rgba(255,255,255,0.12)":"rgba(0,0,0,0.1)"};
      background: ${i?"rgba(255,255,255,0.04)":"#ffffff"};
      color: ${i?"#c4c7c5":"#444746"};
      font-weight: 500;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: 4px;
      font-size: 11.5px;
      transition: all 0.15s ease;
    `;p.innerHTML=`
    <!-- Left: Slim Material Chips (Defaults + Dynamic Custom Filters) -->
    <div style="display: flex; align-items: center; gap: 6px; overflow-x: auto; padding-right: 8px;">
      <span style="font-weight: 700; color: ${i?"#79c0ff":"#1a73e8"}; font-size: 11px; margin-right: 4px; display: flex; align-items: center; gap: 3px; white-space: nowrap;">
        <span>🎓</span>
        <span>AcadMail</span>
      </span>

      <button class="m3-chip" data-cat="ALL" style="${c("ALL")}">
        All (${n.length})
      </button>

      <button class="m3-chip" data-cat="Academics" style="${c("Academics")}">
        🎓 Acads (${o})
      </button>

      <button class="m3-chip" data-cat="Competitions & Tournaments" style="${c("Competitions & Tournaments")}">
        🏆 Contests (${a})
      </button>

      <button class="m3-chip" data-cat="Workshops" style="${c("Workshops")}">
        🛠️ Workshops (${e})
      </button>

      <button class="m3-chip" data-cat="Class Rescheduling" style="${c("Class Rescheduling")}">
        ⏰ Rescheduled (${s})
      </button>

      <button class="m3-chip" data-cat="General" style="${c("General")}">
        📜 PhD & General (${r})
      </button>

      <!-- User-defined custom filters rendered here -->
      ${$.map(f=>{const h=n.filter(g=>g.category===f.name).length;return`
          <button class="m3-chip" data-cat="${f.name}" style="${c(f.name)}">
            🏷️ ${f.name} (${h})
          </button>
        `}).join("")}

      <!-- Add Custom Filter Button -->
      <button id="m3-add-filter-chip" title="Create your own custom academic filter" style="height: 24px; padding: 0 8px; border-radius: 9999px; border: 1px dashed ${i?"rgba(255,255,255,0.25)":"#94a3b8"}; background: transparent; color: ${i?"#79c0ff":"#1a73e8"}; font-size: 11px; font-weight: 600; cursor: pointer; display: flex; align-items: center; gap: 3px; white-space: nowrap;">
        <span>+ Filter</span>
      </button>
    </div>

    <!-- Right: Mini Deadlines Dropdown & Instant Revert Button -->
    <div style="display: flex; align-items: center; gap: 6px; shrink: 0;">
      ${l.length>0?`
        <div style="position: relative;">
          <button id="m3-deadlines-btn" style="height: 24px; padding: 0 8px; border-radius: 6px; border: 1px solid ${i?"rgba(210,153,34,0.4)":"#fde68a"}; background: ${i?"rgba(210,153,34,0.1)":"#fffbeb"}; color: ${i?"#e3b341":"#b45309"}; font-size: 11px; font-weight: 600; cursor: pointer; display: flex; align-items: center; gap: 4px;">
            <span>⏰</span>
            <span>${l.length} Due</span>
          </button>

          <div id="m3-deadlines-popover" style="display: none; position: absolute; right: 0; top: 28px; width: 300px; background: ${i?"#1e1f20":"#ffffff"}; border: 1px solid ${i?"#3c4043":"#e0e2ec"}; border-radius: 10px; box-shadow: 0 8px 24px rgba(0,0,0,0.16); padding: 10px; z-index: 99999;">
            <div style="font-weight: 600; color: ${i?"#e3e3e3":"#1f1f1f"}; font-size: 11px; margin-bottom: 6px; display: flex; justify-content: space-between;">
              <span>Detected Due Dates</span>
              <span style="font-size: 9px; color: #1a73e8;">+ Add to Google Calendar</span>
            </div>
            <div style="max-height: 200px; overflow-y: auto; display: flex; flex-direction: column; gap: 4px;">
              ${l.map(f=>`
                <div style="padding: 6px 8px; background: ${i?"#2b2c2f":"#f8fafd"}; border-radius: 6px; display: flex; align-items: center; justify-content: space-between; gap: 6px;">
                  <div style="overflow: hidden;">
                    <div style="font-size: 11px; font-weight: 500; color: ${i?"#e3e3e3":"#1f1f1f"}; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${f.title}</div>
                    <div style="font-size: 10px; color: ${i?"#e3b341":"#b45309"}; font-weight: 600;">⏰ ${f.deadline}</div>
                  </div>
                  <a href="${K(f.title,"Course deadline from email",f.deadline)}" target="_blank" style="text-decoration: none; shrink: 0; padding: 2px 6px; background: ${i?"#004a77":"#c2e7ff"}; color: ${i?"#c2e7ff":"#001d35"}; border-radius: 4px; font-size: 10px; font-weight: 600;">+ GCal</a>
                </div>
              `).join("")}
            </div>
          </div>
        </div>
      `:""}

      <button id="acadmail-instant-revert-btn" title="Revert to standard clean Gmail (Disable in-page elements)" style="height: 24px; padding: 0 6px; border-radius: 6px; border: 1px solid transparent; background: transparent; color: ${i?"#8e918f":"#94a3b8"}; font-size: 11px; cursor: pointer; display: flex; align-items: center; gap: 2px;">
        <span>✕</span>
        <span>Revert</span>
      </button>
    </div>
  `,p.querySelectorAll(".m3-chip").forEach(f=>{const h=f;h.onclick=()=>{const g=h.getAttribute("data-cat");I(P===g&&g!=="ALL"?"ALL":g)}});const m=p.querySelector("#m3-add-filter-chip");m&&(m.onclick=()=>ne());const u=p.querySelector("#m3-deadlines-btn"),b=p.querySelector("#m3-deadlines-popover");u&&b&&(u.onclick=f=>{f.stopPropagation(),b.style.display=b.style.display==="block"?"none":"block"},document.addEventListener("click",f=>{!b.contains(f.target)&&f.target!==u&&(b.style.display="none")}));const x=p.querySelector("#acadmail-instant-revert-btn");x&&(x.onclick=()=>{var f;v="off",typeof chrome<"u"&&((f=chrome.storage)!=null&&f.local)&&chrome.storage.local.get(["acadmail_settings"],h=>{const g=h.acadmail_settings||{};chrome.storage.local.set({acadmail_settings:{...g,uiMode:"off",inPageIntegration:!1}})}),F()})}function ne(){const n=document.getElementById("acadmail-add-filter-modal");if(n){n.remove();return}const t=q(),o=document.createElement("div");o.id="acadmail-add-filter-modal",o.setAttribute("style",`
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 320px;
    background: ${t?"#1e1f20":"#ffffff"};
    border: 1px solid ${t?"#444746":"#cbd5e1"};
    border-radius: 16px;
    box-shadow: 0 16px 36px rgba(0,0,0,0.25);
    padding: 16px;
    z-index: 9999999;
    font-family: -apple-system, BlinkMacSystemFont, "Google Sans", Roboto, sans-serif;
  `),o.innerHTML=`
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
      <span style="font-weight: 700; font-size: 13px; color: ${t?"#e3e3e3":"#0f172a"};">
        ✨ Create Custom Academic Filter
      </span>
      <button id="modal-close-btn" style="border: none; background: transparent; color: #94a3b8; font-size: 14px; cursor: pointer;">✕</button>
    </div>

    <div style="display: flex; flex-direction: column; gap: 8px;">
      <div>
        <label style="font-size: 10.5px; font-weight: 600; color: ${t?"#c4c7c5":"#475569"}; display: block; margin-bottom: 3px;">
          Filter / Bucket Name
        </label>
        <input id="new-filter-name" type="text" placeholder="e.g. Mess & Hostel, Library, Placements" style="width: 100%; box-sizing: border-box; padding: 6px 10px; border-radius: 8px; border: 1px solid ${t?"#444746":"#cbd5e1"}; background: ${t?"#2b2c2f":"#f8fafc"}; color: ${t?"#e3e3e3":"#0f172a"}; font-size: 12px; outline: none;" />
      </div>

      <div>
        <label style="font-size: 10.5px; font-weight: 600; color: ${t?"#c4c7c5":"#475569"}; display: block; margin-bottom: 3px;">
          Keywords (comma-separated)
        </label>
        <input id="new-filter-keywords" type="text" placeholder="e.g. mess, rebate, room, warden, hostel" style="width: 100%; box-sizing: border-box; padding: 6px 10px; border-radius: 8px; border: 1px solid ${t?"#444746":"#cbd5e1"}; background: ${t?"#2b2c2f":"#f8fafc"}; color: ${t?"#e3e3e3":"#0f172a"}; font-size: 12px; outline: none;" />
      </div>

      <div style="display: flex; justify-content: flex-end; gap: 6px; margin-top: 6px;">
        <button id="modal-cancel-btn" style="padding: 5px 10px; border-radius: 8px; border: 1px solid transparent; background: transparent; color: ${t?"#c4c7c5":"#64748b"}; font-size: 11px; cursor: pointer;">Cancel</button>
        <button id="modal-save-btn" style="padding: 5px 14px; border-radius: 8px; border: none; background: #2563eb; color: #ffffff; font-size: 11px; font-weight: 600; cursor: pointer;">Save Filter</button>
      </div>
    </div>
  `,document.body.appendChild(o);const a=o.querySelector("#modal-close-btn"),e=o.querySelector("#modal-cancel-btn"),s=o.querySelector("#modal-save-btn"),r=o.querySelector("#new-filter-name"),d=o.querySelector("#new-filter-keywords");a.onclick=()=>o.remove(),e.onclick=()=>o.remove(),s.onclick=()=>{const l=r.value.trim(),i=d.value.trim();l&&(Q(l,i),o.remove())}}function G(n,t,o,a){const e=document.getElementById("acadmail-relabel-popup");if(e){e.remove();return}const s=q(),r=n.getBoundingClientRect(),d=document.createElement("div");d.id="acadmail-relabel-popup",d.setAttribute("style",`
    position: fixed;
    top: ${r.bottom+4}px;
    left: ${Math.min(r.left,window.innerWidth-220)}px;
    width: 210px;
    background: ${s?"#1e1f20":"#ffffff"};
    border: 1px solid ${s?"#444746":"#e0e2ec"};
    border-radius: 12px;
    box-shadow: 0 10px 25px rgba(0,0,0,0.2);
    padding: 6px;
    z-index: 9999999;
    font-family: -apple-system, BlinkMacSystemFont, "Google Sans", Roboto, sans-serif;
  `);const l=["Academics","Competitions & Tournaments","Workshops","Class Rescheduling","General"],i=[...l,...$.map(c=>c.name).filter(c=>!l.includes(c))];d.innerHTML=`
    <div style="padding: 4px 8px; font-size: 10px; font-weight: 700; color: ${s?"#8e918f":"#64748b"}; text-transform: uppercase; border-bottom: 1px solid ${s?"#333537":"#f1f5f9"};">
      Change Category Label
    </div>
    <div style="display: flex; flex-direction: column; gap: 2px; padding-top: 4px; max-height: 200px; overflow-y: auto;">
      ${i.map(c=>`
        <button class="relabel-opt" data-cat="${c}" style="text-align: left; padding: 6px 8px; border-radius: 6px; border: none; background: ${c===a?s?"#004a77":"#c2e7ff":"transparent"}; color: ${c===a?s?"#c2e7ff":"#001d35":s?"#e3e3e3":"#1f1f1f"}; font-size: 11.5px; font-weight: ${c===a?"600":"400"}; cursor: pointer; display: flex; align-items: center; justify-content: space-between;">
          <span>${c}</span>
          ${c===a?"<span>✓</span>":""}
        </button>
      `).join("")}
    </div>
  `,document.body.appendChild(d),d.querySelectorAll(".relabel-opt").forEach(c=>{const m=c;m.onclick=u=>{u.stopPropagation();const b=m.getAttribute("data-cat")||"General";Z(t,t,o,b),d.remove()}});const p=c=>{!d.contains(c.target)&&!n.contains(c.target)&&(d.remove(),document.removeEventListener("click",p))};setTimeout(()=>document.addEventListener("click",p),50)}function oe(){v==="blended"&&_.length>0&&V(_)}function A(){var E,L,N,j;if(v==="off")return;const n=X();if(!n){(E=document.getElementById("acadmail-email-brief-card"))==null||E.remove();return}const t=document.querySelector("div.ha")||((L=document.querySelector("h2.hP"))==null?void 0:L.parentElement)||((N=document.querySelector('div[role="main"] h2'))==null?void 0:N.parentElement);if(!t)return;const o=document.getElementById("acadmail-email-brief-card"),a=o==null?void 0:o.getAttribute("data-email-id");if(o&&a===n.id)return;o&&o.remove();const e=J(n.subject,n.senderName,n.bodyText,n.id),s=`${n.subject} ${n.bodyText}`,r=/\b(?:due|deadline|by|on|date:|till)\s+([A-Za-z]{3,9}\s+\d{1,2}(?:st|nd|rd|th)?(?:\s*,\s*\d{4})?|\d{1,2}\/\d{1,2}(?:\/\d{2,4})?|\d{1,2}\s+[A-Za-z]{3,9})\b/i,d=s.match(r),l=d?d[1]:null,i=s.match(/https?:\/\/(?:[a-zA-Z0-9-]+\.)?(?:zoom\.us\/j|meet\.google\.com|teams\.microsoft\.com\/l)\/[^\s<>"']+/i),p=i?i[0]:null,m=n.bodyText.split(/\.\s+/).map(y=>y.trim()).filter(y=>y.length>25&&!y.includes("http")&&!y.includes("unsubscribe")&&!y.includes("Regards")).slice(0,3);m.length===0&&m.push(`Announcement regarding ${n.subject} from ${n.senderName}.`);const u=q(),b=document.createElement("div");b.id="acadmail-email-brief-card",b.setAttribute("data-email-id",n.id),b.setAttribute("style",`
    margin: 4px 0 10px 0;
    padding: 6px 12px;
    background: ${u?"#1e1f20":"#f8fafd"};
    border: 1px solid ${u?"#333537":"#e0e7ff"};
    border-radius: 8px;
    font-family: -apple-system, BlinkMacSystemFont, "Google Sans", Roboto, sans-serif;
    font-size: 12px;
    color: ${u?"#e3e3e3":"#1f1f1f"};
    transition: all 0.2s ease;
  `),b.innerHTML=`
    <!-- Top 1-Line Compact Summary Bar -->
    <div style="display: flex; align-items: center; justify-content: space-between; gap: 8px;">
      <div id="m3-brief-toggle-line" style="display: flex; align-items: center; gap: 6px; cursor: pointer; flex: 1; overflow: hidden;">
        <span style="color: ${u?"#79c0ff":"#1a73e8"}; font-size: 14px;">✨</span>
        <span style="font-weight: 600; font-size: 11.5px; color: ${u?"#79c0ff":"#1a73e8"}; shrink: 0;">AcadMail:</span>
        <span style="font-size: 11.5px; color: ${u?"#c4c7c5":"#475569"}; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
          ${l?`⏰ Due: <strong>${l}</strong> • `:""}${m[0]}
        </span>
      </div>

      <div style="display: flex; align-items: center; gap: 5px; shrink: 0;">
        <!-- Category Chip with Re-label button -->
        <span style="padding: 1px 7px; border-radius: 4px; font-size: 10px; font-weight: 600; background: ${u?"rgba(56, 139, 253, 0.2)":"#e8f0fe"}; color: ${u?"#79c0ff":"#1a73e8"};">
          ${e.category}
        </span>

        <button id="acadmail-brief-relabel-btn" title="Change this email's category label" style="cursor: pointer; padding: 2px 5px; border-radius: 4px; border: 1px dashed ${u?"#444746":"#cbd5e1"}; background: transparent; font-size: 10px; font-weight: 500; color: ${u?"#a8c7fa":"#1a73e8"};">
          ✎ Relabel
        </button>

        ${l?`
          <a href="${K(n.subject,n.bodyText.slice(0,300),l)}" target="_blank" style="text-decoration: none; padding: 2px 7px; background: ${u?"#004a77":"#c2e7ff"}; color: ${u?"#c2e7ff":"#001d35"}; border-radius: 6px; font-size: 10px; font-weight: 600;">+ GCal</a>
        `:""}
        <button id="m3-brief-expand-btn" style="cursor: pointer; padding: 2px 6px; border-radius: 4px; border: 1px solid ${u?"#444746":"#d2e3fc"}; background: transparent; font-size: 10px; font-weight: 600; color: ${u?"#79c0ff":"#1a73e8"};">
          ${C?"Collapse ▴":"Details ▾"}
        </button>
        <button id="m3-brief-dismiss-btn" title="Dismiss card" style="cursor: pointer; padding: 2px 4px; border: none; background: transparent; color: #94a3b8; font-size: 11px;">✕</button>
      </div>
    </div>

    <!-- Expandable Drawer Details -->
    <div id="m3-brief-drawer" style="display: ${C?"flex":"none"}; flex-direction: column; gap: 8px; margin-top: 8px; padding-top: 8px; border-top: 1px dashed ${u?"#333537":"#e0e2ec"};">
      <ul style="margin: 0; padding-left: 16px; display: flex; flex-direction: column; gap: 3px; font-size: 11.5px; color: ${u?"#c4c7c5":"#334155"}; line-height: 1.45;">
        ${m.map(y=>`<li>${y}</li>`).join("")}
      </ul>

      <!-- Action Row: Meeting Links + Quick Reply Chips -->
      <div style="display: flex; flex-wrap: wrap; align-items: center; gap: 6px; padding-top: 2px;">
        ${p?`
          <a href="${p}" target="_blank" style="text-decoration: none; display: inline-flex; align-items: center; gap: 4px; padding: 3px 8px; background: ${u?"#143e2e":"#e6f4ea"}; color: ${u?"#a7f3d0":"#137333"}; border-radius: 6px; font-size: 10.5px; font-weight: 600;">
            <span>🎥</span>
            <span>Join Meeting</span>
          </a>
        `:""}

        <span style="font-size: 10px; font-weight: 600; color: #94a3b8; margin-left: 2px;">Reply draft:</span>

        <button class="m3-quick-reply-btn" data-reply="confirm" style="cursor: pointer; padding: 2px 8px; border-radius: 12px; border: 1px solid ${u?"#444746":"#cbd5e1"}; background: transparent; color: ${u?"#e3e3e3":"#334155"}; font-size: 10.5px; font-weight: 500;">
          ✍️ Confirm Attendance
        </button>

        <button class="m3-quick-reply-btn" data-reply="extension" style="cursor: pointer; padding: 2px 8px; border-radius: 12px; border: 1px solid ${u?"#444746":"#cbd5e1"}; background: transparent; color: ${u?"#e3e3e3":"#334155"}; font-size: 10.5px; font-weight: 500;">
          ⏳ Request Extension
        </button>

        <button class="m3-quick-reply-btn" data-reply="doubt" style="cursor: pointer; padding: 2px 8px; border-radius: 12px; border: 1px solid ${u?"#444746":"#cbd5e1"}; background: transparent; color: ${u?"#e3e3e3":"#334155"}; font-size: 10.5px; font-weight: 500;">
          ❓ Ask Clarification
        </button>
      </div>
    </div>
  `;const x=b.querySelector("#acadmail-brief-relabel-btn");x&&(x.onclick=y=>{y.stopPropagation(),G(x,n.subject,n.senderName,e.category)});const w=b.querySelector("#m3-brief-drawer"),f=b.querySelector("#m3-brief-expand-btn"),h=b.querySelector("#m3-brief-toggle-line"),g=()=>{C=!C,w.style.display=C?"flex":"none",f.innerText=C?"Collapse ▴":"Details ▾"};f.onclick=g,h.onclick=g;const M=b.querySelector("#m3-brief-dismiss-btn");M&&(M.onclick=()=>b.remove()),b.querySelectorAll(".m3-quick-reply-btn").forEach(y=>{const R=y;R.onclick=async()=>{const O=R.getAttribute("data-reply");let z="";O==="confirm"?z=`Dear ${n.senderName||"Professor"},

Thank you for the update regarding "${n.subject}". I confirm my participation and will ensure all prerequisites are met.

Best regards,
[Your Name]
[Student ID]`:O==="extension"?z=`Dear Professor ${n.senderName||""},

I hope this email finds you well. I am writing to respectfully ask if it might be possible to grant a short extension on the submission for "${n.subject}". I want to ensure my work meets the highest standards.

Thank you for your time and understanding.

Sincerely,
[Your Name]
[Student ID]`:z=`Dear Professor ${n.senderName||""},

I hope you are well. Regarding the announcement on "${n.subject}", I had a quick question regarding the specifications and would appreciate some guidance.

Thank you very much.

Sincerely,
[Your Name]
[Student ID]`,await ie(z,R)}}),(j=t.parentElement)==null||j.insertBefore(b,t.nextSibling)}async function ie(n,t){const o=t.innerText;t.innerText="Drafting...";const a=document.querySelector('div[role="button"][aria-label*="Reply"]')||document.querySelector(".ams.bkH")||document.querySelector('.T-I.J-J5-Ji.T-I-Js-IF[data-tooltip*="Reply"]')||document.querySelector('span[role="button"][aria-label*="Reply"]');a&&a.click();let e=0;const s=setInterval(()=>{e++;const r=document.querySelector('div[aria-label="Message Body"], div[role="textbox"][contenteditable="true"]');r?(clearInterval(s),r.focus(),r.innerText=n,r.dispatchEvent(new Event("input",{bubbles:!0})),r.scrollIntoView({behavior:"smooth",block:"center"}),t.innerText="✅ Drafted!",setTimeout(()=>{t.innerText=o},2500)):e>15&&(clearInterval(s),t.innerText="⚠️ Click Reply first",setTimeout(()=>{t.innerText=o},2e3))},200)}function D(){if(v==="off"||document.getElementById("acadmail-siderail-btn"))return;const n=document.querySelector("div.aDG")||document.querySelector('div[aria-label="Side panel"]')||document.querySelector("div.bq9");if(!n)return;const t=document.createElement("div");t.id="acadmail-siderail-btn",t.title="AcadMail AI Copilot",t.setAttribute("role","button"),t.setAttribute("tabindex","0");const o=q();t.setAttribute("style",`
    width: 36px;
    height: 36px;
    margin: 6px auto;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    background: transparent;
    color: ${o?"#79c0ff":"#1a73e8"};
    transition: background 0.15s;
  `),t.innerHTML=`
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M22 10v6M2 10l10-5 10 5-10 5z"/>
      <path d="M6 12v5c3 3 9 3 12 0v-5"/>
    </svg>
  `,t.onmouseenter=()=>t.style.background=o?"rgba(255,255,255,0.08)":"rgba(0,0,0,0.06)",t.onmouseleave=()=>t.style.background="transparent",t.onclick=()=>T({type:"OPEN_SIDEPANEL"}),n.prepend(t)}function X(){var e,s,r,d,l;const n=document.querySelector("h2.hP")||document.querySelector("div.ha h2")||document.querySelector('div[role="main"] h2')||document.querySelector("h2[data-legacy-thread-id]")||document.querySelector("h1[data-thread-perm-id]"),t=((e=n==null?void 0:n.textContent)==null?void 0:e.trim())||"",o=document.querySelectorAll('.a3s.aiL, div[role="listitem"] .adn .a3s, .ii.gt, div.adn.ads');let a="";if(o.length>0&&(a=((s=o[o.length-1].textContent)==null?void 0:s.trim())||""),t&&(a||o.length>0)){const i=document.querySelector("span[email]")||document.querySelector(".gD")||document.querySelector(".go")||document.querySelector("span.zF"),p=(i==null?void 0:i.getAttribute("email"))||((r=i==null?void 0:i.textContent)==null?void 0:r.trim())||"academic@university.edu",c=(i==null?void 0:i.getAttribute("name"))||((d=i==null?void 0:i.textContent)==null?void 0:d.trim())||"Academic Sender",m=document.querySelector(".g3")||document.querySelector("span.mI")||document.querySelector(".date"),u=(m==null?void 0:m.getAttribute("title"))||((l=m==null?void 0:m.textContent)==null?void 0:l.trim())||new Date().toLocaleString();return{id:(window.location.hash||"").replace(/[^a-zA-Z0-9_-]/g,"_")||`email-${Date.now()}`,subject:t,senderName:c,senderEmail:p,recipient:"Me",dateStr:u,bodyText:a.slice(0,5e3),url:window.location.href}}return null}function B(){document.querySelectorAll("tr.btC, .gU.Up").forEach(t=>{if(t.querySelector(".acadmail-polish-btn"))return;const o=document.createElement("div");o.className="acadmail-polish-btn",o.setAttribute("style",`
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
    `),o.innerHTML=`
      <span style="font-size: 11px;">✨</span>
      <span>Polish</span>
    `,o.onclick=a=>{a.stopPropagation(),ae(t,o)},t.appendChild(o)})}function ae(n,t){var l;const o=document.getElementById("acadmail-tone-menu");if(o){o.remove();return}const a=n.closest('div[role="dialog"]')||n.closest(".M9"),e=a==null?void 0:a.querySelector('div[aria-label="Message Body"], div[contenteditable="true"]'),s=((l=e==null?void 0:e.innerText)==null?void 0:l.trim())||"",r=document.createElement("div");r.id="acadmail-tone-menu",r.setAttribute("style",`
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
  `),r.innerHTML=`
    <div style="padding: 4px 8px; font-size: 10px; font-weight: 700; color: #64748b; text-transform: uppercase;">Academic Tone</div>
    <div style="display: flex; flex-direction: column; gap: 3px; padding-top: 4px;">
      <button class="acad-tone-opt" data-tone="formal" style="text-align: left; padding: 6px 8px; border-radius: 6px; border: none; background: transparent; cursor: pointer; font-size: 11px; font-weight: 600; color: #1e293b;">🎓 Respectful & Formal</button>
      <button class="acad-tone-opt" data-tone="extension" style="text-align: left; padding: 6px 8px; border-radius: 6px; border: none; background: transparent; cursor: pointer; font-size: 11px; font-weight: 600; color: #1e293b;">⏳ Request Extension</button>
      <button class="acad-tone-opt" data-tone="doubt" style="text-align: left; padding: 6px 8px; border-radius: 6px; border: none; background: transparent; cursor: pointer; font-size: 11px; font-weight: 600; color: #1e293b;">❓ Clarify Doubt</button>
      <button class="acad-tone-opt" data-tone="lor" style="text-align: left; padding: 6px 8px; border-radius: 6px; border: none; background: transparent; cursor: pointer; font-size: 11px; font-weight: 600; color: #1e293b;">📝 Request LoR / Reference</button>
    </div>
  `,r.querySelectorAll(".acad-tone-opt").forEach(i=>{const p=i;p.onclick=async()=>{const c=p.getAttribute("data-tone")||"formal";r.remove(),await re(e,s,c,t)}}),t.appendChild(r);const d=i=>{!r.contains(i.target)&&!t.contains(i.target)&&(r.remove(),document.removeEventListener("click",d))};setTimeout(()=>document.addEventListener("click",d),100)}async function re(n,t,o,a){if(!n)return;const e=a.innerHTML;a.innerHTML="<span>⏳</span><span>Polishing...</span>";try{const s=await new Promise(p=>{var c;typeof chrome<"u"&&((c=chrome.storage)!=null&&c.local)?chrome.storage.local.get(["acadmail_settings"],m=>p(m.acadmail_settings||{})):p({})}),r=s.apiKey||"",d=s.groqApiKey||"",i=await se(t||"Need extension for lab assignment due this friday because of fever.",o,r,d);n.focus(),n.innerText=i,n.dispatchEvent(new Event("input",{bubbles:!0})),a.innerHTML="<span>✅</span><span>Polished!</span>",setTimeout(()=>{a.innerHTML=e},2e3)}catch{a.innerHTML="<span>⚠️ Error</span>",setTimeout(()=>{a.innerHTML=e},2e3)}}async function se(n,t,o,a){var r,d,l,i,p,c,m,u,b;const s=`Transform this student's rough notes into a courteous, polished academic email to a professor.
Tone: ${{formal:"Polite, professional academic tone to a professor.",extension:"Polite, respectful request for an assignment deadline extension showing dedication.",doubt:"Polite conceptual question or office hours request referencing lecture material.",lor:"Courteous inquiry requesting a Letter of Recommendation for graduate studies/internships."}[t]||"Formal"}
Guidelines:
- Include respectful salutation ("Dear Professor [Name],", "I hope this email finds you well.")
- Keep it concise, courteous, and respectful.
- Retain all dates, assignment titles, or reasons mentioned.
- Conclude with a warm academic sign-off ("Sincerely,", "Best regards," followed by "[Your Name] [Student ID]").
- Output ONLY the final email text.

Student's notes:
${n}`;if(a&&a.trim())try{const x=await fetch("https://api.groq.com/openai/v1/chat/completions",{method:"POST",headers:{Authorization:`Bearer ${a.trim()}`,"Content-Type":"application/json"},body:JSON.stringify({model:"llama-3.3-70b-versatile",messages:[{role:"user",content:s}],temperature:.3})});if(x.ok)return((i=(l=(d=(r=(await x.json()).choices)==null?void 0:r[0])==null?void 0:d.message)==null?void 0:l.content)==null?void 0:i.trim())||n}catch{}if(o&&o.trim()){const x=["models/gemini-2.0-flash","models/gemini-3.8-flash","models/gemini-1.5-flash"];for(const w of x)try{const f=await fetch(`https://generativelanguage.googleapis.com/v1beta/${w}:generateContent?key=${o.trim()}`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({contents:[{parts:[{text:s}]}],generationConfig:{temperature:.3}})});if(f.ok){const h=await f.json(),g=(b=(u=(m=(c=(p=h==null?void 0:h.candidates)==null?void 0:p[0])==null?void 0:c.content)==null?void 0:m.parts)==null?void 0:u[0])==null?void 0:b.text;if(g)return g.trim()}}catch{}}return`Dear Professor,

I hope this email finds you well.

I am writing to respectfully request your guidance regarding ${n}.

Thank you for your time and consideration.

Sincerely,
[Your Name]
[Student ID]`}var U;typeof chrome<"u"&&((U=chrome.runtime)!=null&&U.onMessage)&&chrome.runtime.onMessage.addListener((n,t,o)=>{if(n.type==="GET_ACTIVE_EMAIL"){const a=X();o({email:a})}else if(n.type==="SCAN_INBOX"){const a=S();o({items:a})}else n.type==="FILTER_GMAIL_DOM"?(I(n.category),o({success:!0})):n.type==="SET_UI_MODE"?(v=n.mode,F(),o({success:!0})):n.type==="RELABEL_EMAIL"?(Z(n.emailId,n.subject||"",n.sender||"",n.newCategory),o({success:!0})):n.type==="UPDATE_CUSTOM_FILTERS"&&(W(),o({success:!0}));return!0});W();document.readyState==="loading"?document.addEventListener("DOMContentLoaded",()=>{setTimeout(S,1200),setTimeout(A,1200),setTimeout(D,1200),setTimeout(B,1200)}):(setTimeout(S,1200),setTimeout(A,1200),setTimeout(D,1200),setTimeout(B,1200));let H=location.href;new MutationObserver(()=>{const n=location.href;n!==H&&(H=n,setTimeout(()=>{T({type:"EMAIL_CHANGED"}),S(),A(),D()},400)),B()}).observe(document,{subtree:!0,childList:!0});

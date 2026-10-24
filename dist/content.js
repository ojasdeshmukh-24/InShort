console.log("[AcadMail AI] Ultra-Clean Material 3 Gmail Script with Custom Filters & Relabeling active.");let I="ALL",_=[],w="blended",q=!1,S=[{id:"filter-placements",name:"Placements & Internships",color:"#8b5cf6",keywords:["placement","tpo","internship","interview","shortlist","offer","ctc","pre-placement"]},{id:"filter-hostel",name:"Hostel & Campus Mess",color:"#06b6d4",keywords:["hostel","mess","warden","room","maintenance","electricity","water","hall of residence"]}],$={};function A(n){var t;try{typeof chrome<"u"&&((t=chrome.runtime)!=null&&t.id)&&chrome.runtime.sendMessage(n).catch(()=>{})}catch{}}function E(){try{const n=window.getComputedStyle(document.body).backgroundColor;if(n){const t=n.match(/\d+/g);if(t&&t.length>=3)return(parseInt(t[0])*299+parseInt(t[1])*587+parseInt(t[2])*114)/1e3<128}}catch{}return window.matchMedia("(prefers-color-scheme: dark)").matches}function D(){var o;const t=E()?"dark":"light";typeof chrome<"u"&&((o=chrome.storage)!=null&&o.local)&&chrome.storage.local.set({acadmail_gmail_theme:t}),A({type:"GMAIL_THEME_DETECTED",theme:t})}function Z(){var n;D(),typeof chrome<"u"&&((n=chrome.storage)!=null&&n.local)&&chrome.storage.local.get(["acadmail_settings"],t=>{t.acadmail_settings&&(t.acadmail_settings.uiMode?w=t.acadmail_settings.uiMode:t.acadmail_settings.inPageIntegration===!1?w="off":w="blended",Array.isArray(t.acadmail_settings.customFilters)&&(S=t.acadmail_settings.customFilters),t.acadmail_settings.labelOverrides&&($=t.acadmail_settings.labelOverrides)),N()})}function N(){var n,t,o,a;if((n=document.getElementById("acadmail-native-chip-bar"))==null||n.remove(),(t=document.getElementById("acadmail-inbox-filter-bar"))==null||t.remove(),(o=document.getElementById("acadmail-email-brief-card"))==null||o.remove(),(a=document.getElementById("acadmail-siderail-btn"))==null||a.remove(),w==="off"){R("ALL");return}C(),T(),G()}function J(n,t,o,a){var r;$[n]=a,t&&($[t]=a);const e=`${t}::${o}`.trim();e&&($[e]=a),typeof chrome<"u"&&((r=chrome.storage)!=null&&r.local)&&chrome.storage.local.get(["acadmail_settings"],s=>{const p=s.acadmail_settings||{},l=p.labelOverrides||{};l[n]=a,t&&(l[t]=a),e&&(l[e]=a),chrome.storage.local.set({acadmail_settings:{...p,labelOverrides:l}})}),C(),T(),A({type:"EMAIL_CHANGED"}),V(`Email re-labeled as "${a}"`)}function ee(n,t){var e;if(!n.trim())return;const o=t.split(",").map(r=>r.trim().toLowerCase()).filter(Boolean),a={id:`filter-${Date.now()}`,name:n.trim(),color:"#8b5cf6",keywords:o.length>0?o:[n.trim().toLowerCase()]};S.push(a),typeof chrome<"u"&&((e=chrome.storage)!=null&&e.local)&&chrome.storage.local.get(["acadmail_settings"],r=>{const s=r.acadmail_settings||{},p=s.customFilters||[];chrome.storage.local.set({acadmail_settings:{...s,customFilters:[...p,a]}})}),C(),A({type:"UPDATE_CUSTOM_FILTERS"}),V(`Created filter "${a.name}"`)}function K(n,t,o,a){const e=`${n} ${t} ${o}`.toLowerCase(),r=n.match(/\b([A-Z]{2,4}\s?[-_]?\s?\d{3,4}[A-Z]?)\b/i),s=r?r[1].toUpperCase():void 0;if(a&&$[a])return{category:$[a],courseCode:s};if($[n])return{category:$[n],courseCode:s};const p=`${n}::${t}`.trim();if($[p])return{category:$[p],courseCode:s};if(S&&S.length>0){for(const l of S)if(l.keywords&&l.keywords.some(i=>i.trim()&&e.includes(i.trim().toLowerCase())))return{category:l.name,courseCode:s}}return e.includes("viva")||e.includes("viva-voce")||e.includes("viva voce")||e.includes("oral defense")||e.includes("thesis defense")||e.includes("phd defense")||e.includes("ph.d. defense")||e.includes("synopsis presentation")||e.includes("synopsis submission")||e.includes("ph.d. viva")||e.includes("phd viva")||e.includes("doctoral defense")?{category:"General",courseCode:s,isPhd:!0}:e.includes("reschedule")||e.includes("rescheduled")||e.includes("postpone")||e.includes("postponed")||e.includes("cancelled")||e.includes("class canceled")||e.includes("venue change")||e.includes("room change")||e.includes("lecture timing")||e.includes("no class today")||e.includes("extra class")?{category:"Class Rescheduling",courseCode:s}:e.includes("competition")||e.includes("tournament")||e.includes("contest")||e.includes("hackathon")||e.includes("sociothon")||e.includes("devfolio")||e.includes("trials")||e.includes("open trials")||e.includes("inter-iit")||e.includes("inter iit")||e.includes("inter-hostel")||e.includes("inter hostel")||e.includes("inter-college")||e.includes("championship")||e.includes("trophy")||e.includes("athletics")||e.includes("sports")||e.includes("cricket")||e.includes("football")||e.includes("badminton")||e.includes("volleyball")||e.includes("table tennis")||e.includes("chess")||e.includes("squash")||e.includes("esports")||e.includes("case competition")||e.includes("case comp")||e.includes("quiz competition")||e.includes("challenge")||e.includes("cash prize")||e.includes("prize pool")||e.includes("mushaira")||e.includes("ideathon")?{category:"Competitions & Tournaments",courseCode:s}:e.includes("intro talk")||e.includes("intro talks")||e.includes("opening talk")||e.includes("introductory talk")||e.includes("orientation talk")||e.includes("info session")||e.includes("tech talk")||e.includes("talk by")||e.includes("distinguished lecture")||e.includes("guest lecture")||e.includes("workshop")||e.includes("webinar")||e.includes("seminar")||e.includes("conclave")||e.includes("symposium")||e.includes("bootcamp")||e.includes("masterclass")||e.includes("hands-on")||e.includes("enactus")||e.includes("sdslabs")||e.includes("pragati")||e.includes("hr conclave")?{category:"Workshops",courseCode:s}:s||e.includes("assignment")||e.includes("homework")||e.includes("syllabus")||e.includes("quiz")||e.includes("midterm")||e.includes("endterm")||e.includes("exam")||e.includes("grade")||e.includes("grading")||e.includes("lab manual")||e.includes("tutorial")||e.includes("office hours")||e.includes("canvas")||e.includes("moodle")||e.includes("classroom")||e.includes("prof.")||e.includes("professor")||e.includes("teaching day")||e.includes("lecture")||e.includes("faculty")||e.includes("ug-i")||e.includes("ug-ii")||e.includes("pg-i")||e.includes("project evaluation")?{category:"Academics",courseCode:s}:{category:"General",courseCode:s}}document.addEventListener("click",n=>{n.target.closest("tr.zA")&&(setTimeout(()=>{A({type:"EMAIL_CHANGED"}),T()},350),setTimeout(()=>{A({type:"EMAIL_CHANGED"}),T()},800))},!0);function C(){const n=document.querySelectorAll("tr.zA"),t=[];return n.forEach((o,a)=>{var x,h,M,z;const e=o,r=e.querySelector(".bqe, .bog, span[data-thread-id]"),s=((x=r==null?void 0:r.textContent)==null?void 0:x.trim())||"(No Subject)",p=e.querySelector(".bA4 span, .yP, .zF"),l=((h=p==null?void 0:p.textContent)==null?void 0:h.trim())||"Unknown",i=e.querySelector(".y2"),u=((M=i==null?void 0:i.textContent)==null?void 0:M.trim())||"",c=e.querySelector(".xW span"),m=((z=c==null?void 0:c.textContent)==null?void 0:z.trim())||"Recent",f=!e.classList.contains("zE"),b=`${s}::${l}`.trim(),{category:g,courseCode:k,isPhd:v}=K(s,l,u,b),d={id:`row-${a}-${s.slice(0,15).replace(/[^a-zA-Z0-9]/g,"_")}`,index:a,subject:s,sender:l,snippet:u,date:m,category:g,courseCode:k,isRead:f};t.push(d),te(e,g,k,v,s,l)}),_=t,w==="blended"&&t.length>0&&X(t),t}function te(n,t,o,a,e,r){const s=n.querySelector(".acadmail-row-badge");s&&s.remove();const p=n.querySelector(".y6, .bog");if(!p)return;const l=E(),i=document.createElement("span");i.className="acadmail-row-badge";let u=l?"background: rgba(56, 139, 253, 0.15); color: #79c0ff; border: 1px solid rgba(56, 139, 253, 0.3);":"background: #edf5fd; color: #1a73e8; border: 1px solid #d2e3fc;",c=o||"Acads";t==="Competitions & Tournaments"?(u=l?"background: rgba(210, 153, 34, 0.15); color: #e3b341; border: 1px solid rgba(210, 153, 34, 0.3);":"background: #fef7e0; color: #b06000; border: 1px solid #fce8b2;",c="Contest"):t==="Workshops"?(u=l?"background: rgba(46, 160, 67, 0.15); color: #7ee787; border: 1px solid rgba(46, 160, 67, 0.3);":"background: #e6f4ea; color: #137333; border: 1px solid #ceead6;",c="Workshop"):t==="Class Rescheduling"?(u=l?"background: rgba(248, 81, 73, 0.15); color: #ff7b72; border: 1px solid rgba(248, 81, 73, 0.3);":"background: #fce8e6; color: #c5221f; border: 1px solid #fad2cf;",c="Rescheduled"):a?(u=l?"background: rgba(142, 145, 143, 0.15); color: #c4c7c5; border: 1px solid rgba(142, 145, 143, 0.3);":"background: #f1f3f4; color: #5f6368; border: 1px solid #dadce0;",c="PhD / Viva"):t==="General"?(u=l?"background: rgba(142, 145, 143, 0.12); color: #c4c7c5; border: 1px solid rgba(142, 145, 143, 0.2);":"background: #f8f9fa; color: #5f6368; border: 1px solid #dadce0;",c="General"):(u=l?"background: rgba(168, 85, 247, 0.15); color: #c084fc; border: 1px solid rgba(168, 85, 247, 0.3);":"background: #f3e8ff; color: #7e22ce; border: 1px solid #e9d5ff;",c=t),i.setAttribute("style",`
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
    ${u}
  `),i.innerText=c,i.title=o?`Filter Gmail for ${o} (Right-click to change label)`:`Category: ${t} (Click to change)`,i.onclick=m=>{m.stopPropagation(),o?ne(o):B(i,e,r,t)},i.oncontextmenu=m=>{m.preventDefault(),m.stopPropagation(),B(i,e,r,t)},p.prepend(i)}function ne(n){const t=document.querySelector('input[name="q"], input[aria-label*="Search"]');if(t){t.value=n,t.dispatchEvent(new Event("input",{bubbles:!0}));const o=t.closest("form");o?o.dispatchEvent(new Event("submit",{bubbles:!0,cancelable:!0})):t.dispatchEvent(new KeyboardEvent("keydown",{key:"Enter",keyCode:13,bubbles:!0}))}}function R(n){I=n,document.querySelectorAll("tr.zA").forEach(o=>{const a=o;if(n==="ALL"){a.style.display="";return}const e=a.querySelector(".acadmail-row-badge"),r=(e==null?void 0:e.textContent)||"";let s=!1;(n==="Academics"&&(r.includes("🎓")||r.includes("Acads"))||n==="Competitions & Tournaments"&&(r.includes("🏆")||r.includes("Contest"))||n==="Workshops"&&(r.includes("🛠️")||r.includes("Workshop"))||n==="Class Rescheduling"&&(r.includes("⏰")||r.includes("Rescheduled"))||n==="General"&&(r.includes("📢")||r.includes("General")||r.includes("PhD"))||r.toLowerCase().includes(n.toLowerCase()))&&(s=!0),s?a.style.display="":a.style.display="none"}),ie()}function Y(n,t,o){const a="https://calendar.google.com/calendar/render?action=TEMPLATE";let e="";if(o){const s=new Date(o);if(!isNaN(s.getTime())){const p=s.toISOString().replace(/-|:|\.\d\d\d/g,""),i=new Date(s.getTime()+3600*1e3).toISOString().replace(/-|:|\.\d\d\d/g,"");e=`&dates=${p}/${i}`}}const r=new URLSearchParams({text:`[AcadMail] ${n}`,details:`${t}

— Auto-extracted by AcadMail AI`});return`${a}&${r.toString()}${e}`}function V(n){const t=document.getElementById("acadmail-toast");t&&t.remove();const o=document.createElement("div");o.id="acadmail-toast",o.innerText=n,o.setAttribute("style",`
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
  `),document.body.appendChild(o),setTimeout(()=>o.remove(),2500)}function X(n){var v;if(w!=="blended")return;const t=document.querySelector('div[gh="tm"]')||document.querySelector("div.G-atb")||document.querySelector("div.aeF");if(!t)return;if(!document.getElementById("acadmail-m3-css")){const d=document.createElement("style");d.id="acadmail-m3-css",d.textContent=`
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
    `,document.head.appendChild(d)}let o=0,a=0,e=0,r=0,s=0;const p=/\b(?:due|deadline|by|on|date:|till)\s+([A-Za-z]{3,9}\s+\d{1,2}(?:st|nd|rd|th)?(?:\s*,\s*\d{4})?|\d{1,2}\/\d{1,2}(?:\/\d{2,4})?|\d{1,2}\s+[A-Za-z]{3,9})\b/gi,l=[];n.forEach(d=>{d.category==="Academics"?o++:d.category==="Competitions & Tournaments"?a++:d.category==="Workshops"?e++:d.category==="Class Rescheduling"?r++:d.category==="General"&&s++;const h=[...`${d.subject} ${d.snippet}`.matchAll(p)];h.length>0&&l.push({title:d.subject,deadline:h[0][1]})});const i=E();let u=document.getElementById("acadmail-native-chip-bar");u||(u=document.createElement("div"),u.id="acadmail-native-chip-bar",u.setAttribute("style",`
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 10px;
      padding: 6px 16px;
      min-height: 44px;
      box-sizing: border-box;
      background: ${i?"#141517":"#ffffff"};
      border-bottom: 1px solid ${i?"rgba(255,255,255,0.08)":"#e0e2ec"};
      font-family: Roboto, "Google Sans", "Google Sans Text", -apple-system, sans-serif;
      font-size: 12px;
      z-index: 10;
    `),(v=t.parentElement)==null||v.insertBefore(u,t.nextSibling||t));const c=d=>I===d?`
        background: ${i?"#004a77":"#c2e7ff"};
        color: ${i?"#c2e7ff":"#001d35"};
        border: 1px solid ${i?"#005f9e":"#7fcfff"};
        font-weight: 600;
        box-shadow: 0 1px 2px rgba(0,0,0,0.05);
      `:`
      background: ${i?"rgba(255,255,255,0.04)":"#f8fafd"};
      color: ${i?"#e3e3e3":"#3c4043"};
      border: 1px solid ${i?"rgba(255,255,255,0.12)":"#dadce0"};
      font-weight: 500;
    `,m=(d,x)=>`<span class="m3-chip-count" style="background: ${I===d?i?"rgba(194, 231, 255, 0.22)":"rgba(0, 29, 53, 0.12)":i?"rgba(255, 255, 255, 0.1)":"rgba(0, 0, 0, 0.06)"}; color: inherit;">${x}</span>`;u.innerHTML=`
    <!-- Left: Slim Google Material 3 Chips (Defaults + Dynamic Custom Filters) -->
    <div id="acadmail-chip-scroll-track" style="display: flex; align-items: center; gap: 8px; overflow-x: auto; scrollbar-width: none; -ms-overflow-style: none; flex: 1; min-width: 0; padding: 2px 0;">
      
      <!-- Brand Pill -->
      <div style="display: inline-flex; align-items: center; gap: 5px; height: 32px; box-sizing: border-box; padding: 0 10px; border-radius: 6px; background: ${i?"rgba(56, 139, 253, 0.12)":"rgba(26, 115, 232, 0.08)"}; color: ${i?"#79c0ff":"#1a73e8"}; flex-shrink: 0; white-space: nowrap; margin-right: 4px; border: 1px solid ${i?"rgba(56, 139, 253, 0.25)":"rgba(26, 115, 232, 0.2)"}; font-family: Roboto, 'Google Sans', 'Google Sans Text', sans-serif;">
        <span style="font-weight: 700; font-size: 11.5px; letter-spacing: 0.2px;">AM</span>
        <span style="font-weight: 600; font-size: 12px;">AcadMail</span>
      </div>

      <!-- 1. All Emails -->
      <button class="m3-chip" data-cat="ALL" style="${c("ALL")}">
        <span>All</span>
        ${m("ALL",n.length)}
      </button>

      <!-- 2. Academics -->
      <button class="m3-chip" data-cat="Academics" style="${c("Academics")}">
        <span>Academics</span>
        ${m("Academics",o)}
      </button>

      <!-- 3. Competitions -->
      <button class="m3-chip" data-cat="Competitions & Tournaments" style="${c("Competitions & Tournaments")}">
        <span>Contests</span>
        ${m("Competitions & Tournaments",a)}
      </button>

      <!-- 4. Workshops -->
      <button class="m3-chip" data-cat="Workshops" style="${c("Workshops")}">
        <span>Workshops</span>
        ${m("Workshops",e)}
      </button>

      <!-- 5. Reschedules -->
      <button class="m3-chip" data-cat="Class Rescheduling" style="${c("Class Rescheduling")}">
        <span>Rescheduled</span>
        ${m("Class Rescheduling",r)}
      </button>

      <!-- 6. General -->
      <button class="m3-chip" data-cat="General" style="${c("General")}">
        <span>General & PhD</span>
        ${m("General",s)}
      </button>

      <!-- 7. Dynamic User-Defined Custom Filters -->
      ${S.map(d=>{const x=n.filter(h=>h.category===d.name).length;return`
          <button class="m3-chip" data-cat="${d.name}" style="${c(d.name)}">
            <span>${d.name}</span>
            ${m(d.name,x)}
          </button>
        `}).join("")}

      <!-- 8. Add Custom Filter Button -->
      <button id="m3-add-filter-chip" title="Create your own custom academic filter" style="height: 32px; padding: 0 10px; border-radius: 6px; border: 1px dashed ${i?"rgba(255,255,255,0.25)":"#94a3b8"}; background: transparent; color: ${i?"#79c0ff":"#1a73e8"}; font-size: 12px; font-weight: 500; font-family: Roboto, 'Google Sans', sans-serif; cursor: pointer; display: inline-flex; align-items: center; gap: 4px; flex-shrink: 0; white-space: nowrap; transition: all 0.15s ease;">
        <span style="font-size: 14px; font-weight: 600; line-height: 1;">+</span>
        <span>Filter</span>
      </button>
    </div>

    <!-- Right: Mini Deadlines Dropdown & Instant Hide Button -->
    <div style="display: flex; align-items: center; gap: 8px; flex-shrink: 0;">
      ${l.length>0?`
        <div style="position: relative; flex-shrink: 0;">
          <button id="m3-deadlines-btn" style="height: 32px; padding: 0 10px; border-radius: 6px; border: 1px solid ${i?"rgba(210,153,34,0.4)":"#fde68a"}; background: ${i?"rgba(210,153,34,0.15)":"#fffbeb"}; color: ${i?"#e3b341":"#b45309"}; font-size: 12px; font-weight: 600; font-family: Roboto, 'Google Sans', sans-serif; cursor: pointer; display: inline-flex; align-items: center; gap: 5px; white-space: nowrap;">
            <span style="font-weight: 700; font-family: Roboto, 'Google Sans', sans-serif; font-size: 11px;">DUE</span>
            <span>${l.length}</span>
          </button>

          <div id="m3-deadlines-popover" style="display: none; position: absolute; right: 0; top: 38px; width: 310px; background: ${i?"#1e1f20":"#ffffff"}; border: 1px solid ${i?"#3c4043":"#e0e2ec"}; border-radius: 8px; box-shadow: 0 10px 28px rgba(0,0,0,0.2); padding: 12px; z-index: 99999; font-family: Roboto, 'Google Sans', sans-serif;">
            <div style="font-weight: 600; color: ${i?"#e3e3e3":"#1f1f1f"}; font-size: 11.5px; margin-bottom: 8px; display: flex; justify-content: space-between; align-items: center;">
              <span>Detected Due Dates</span>
              <span style="font-size: 10px; color: #1a73e8; font-weight: 600;">+ Google Calendar</span>
            </div>
            <div style="max-height: 220px; overflow-y: auto; display: flex; flex-direction: column; gap: 6px;">
              ${l.map(d=>`
                <div style="padding: 8px 10px; background: ${i?"#2b2c2f":"#f8fafd"}; border-radius: 6px; display: flex; align-items: center; justify-content: space-between; gap: 8px;">
                  <div style="overflow: hidden; flex: 1;">
                    <div style="font-size: 11.5px; font-weight: 500; color: ${i?"#e3e3e3":"#1f1f1f"}; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${d.title}</div>
                    <div style="font-size: 10.5px; color: ${i?"#e3b341":"#b45309"}; font-weight: 600; margin-top: 2px;">⏰ ${d.deadline}</div>
                  </div>
                  <a href="${Y(d.title,"Course deadline from email",d.deadline)}" target="_blank" style="text-decoration: none; flex-shrink: 0; padding: 3px 8px; background: ${i?"#004a77":"#c2e7ff"}; color: ${i?"#c2e7ff":"#001d35"}; border-radius: 4px; font-size: 10.5px; font-weight: 600;">+ GCal</a>
                </div>
              `).join("")}
            </div>
          </div>
        </div>
      `:""}

      <button id="acadmail-instant-revert-btn" title="Hide AcadMail toolbar" style="height: 32px; padding: 0 10px; border-radius: 6px; border: 1px solid transparent; background: transparent; color: ${i?"#8e918f":"#64748b"}; font-size: 12px; font-family: Roboto, 'Google Sans', sans-serif; cursor: pointer; display: inline-flex; align-items: center; gap: 4px; flex-shrink: 0; white-space: nowrap; transition: color 0.15s ease;">
        <span style="font-size: 13px; line-height: 1;">✕</span>
        <span>Hide</span>
      </button>
    </div>
  `,u.querySelectorAll(".m3-chip").forEach(d=>{const x=d;x.onclick=()=>{const h=x.getAttribute("data-cat");R(I===h&&h!=="ALL"?"ALL":h)}});const f=u.querySelector("#m3-add-filter-chip");f&&(f.onclick=()=>oe());const b=u.querySelector("#m3-deadlines-btn"),g=u.querySelector("#m3-deadlines-popover");b&&g&&(b.onclick=d=>{d.stopPropagation(),g.style.display=g.style.display==="block"?"none":"block"},document.addEventListener("click",d=>{!g.contains(d.target)&&d.target!==b&&(g.style.display="none")}));const k=u.querySelector("#acadmail-instant-revert-btn");k&&(k.onclick=()=>{var d;w="off",typeof chrome<"u"&&((d=chrome.storage)!=null&&d.local)&&chrome.storage.local.get(["acadmail_settings"],x=>{const h=x.acadmail_settings||{};chrome.storage.local.set({acadmail_settings:{...h,uiMode:"off",inPageIntegration:!1}})}),N()})}function oe(){const n=document.getElementById("acadmail-add-filter-modal");if(n){n.remove();return}const t=E(),o=document.createElement("div");o.id="acadmail-add-filter-modal",o.setAttribute("style",`
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
  `,document.body.appendChild(o);const a=o.querySelector("#modal-close-btn"),e=o.querySelector("#modal-cancel-btn"),r=o.querySelector("#modal-save-btn"),s=o.querySelector("#new-filter-name"),p=o.querySelector("#new-filter-keywords");a.onclick=()=>o.remove(),e.onclick=()=>o.remove(),r.onclick=()=>{const l=s.value.trim(),i=p.value.trim();l&&(ee(l,i),o.remove())}}function B(n,t,o,a){const e=document.getElementById("acadmail-relabel-popup");if(e){e.remove();return}const r=E(),s=n.getBoundingClientRect(),p=document.createElement("div");p.id="acadmail-relabel-popup",p.setAttribute("style",`
    position: fixed;
    top: ${s.bottom+4}px;
    left: ${Math.min(s.left,window.innerWidth-220)}px;
    width: 210px;
    background: ${r?"#1e1f20":"#ffffff"};
    border: 1px solid ${r?"#444746":"#e0e2ec"};
    border-radius: 12px;
    box-shadow: 0 10px 25px rgba(0,0,0,0.2);
    padding: 6px;
    z-index: 9999999;
    font-family: -apple-system, BlinkMacSystemFont, "Google Sans", Roboto, sans-serif;
  `);const l=["Academics","Competitions & Tournaments","Workshops","Class Rescheduling","General"],i=[...l,...S.map(c=>c.name).filter(c=>!l.includes(c))];p.innerHTML=`
    <div style="padding: 4px 8px; font-size: 10px; font-weight: 700; color: ${r?"#8e918f":"#64748b"}; text-transform: uppercase; border-bottom: 1px solid ${r?"#333537":"#f1f5f9"};">
      Change Category Label
    </div>
    <div style="display: flex; flex-direction: column; gap: 2px; padding-top: 4px; max-height: 200px; overflow-y: auto;">
      ${i.map(c=>`
        <button class="relabel-opt" data-cat="${c}" style="text-align: left; padding: 6px 8px; border-radius: 6px; border: none; background: ${c===a?r?"#004a77":"#c2e7ff":"transparent"}; color: ${c===a?r?"#c2e7ff":"#001d35":r?"#e3e3e3":"#1f1f1f"}; font-size: 11.5px; font-weight: ${c===a?"600":"400"}; cursor: pointer; display: flex; align-items: center; justify-content: space-between;">
          <span>${c}</span>
          ${c===a?"<span>✓</span>":""}
        </button>
      `).join("")}
    </div>
  `,document.body.appendChild(p),p.querySelectorAll(".relabel-opt").forEach(c=>{const m=c;m.onclick=f=>{f.stopPropagation();const b=m.getAttribute("data-cat")||"General";J(t,t,o,b),p.remove()}});const u=c=>{!p.contains(c.target)&&!n.contains(c.target)&&(p.remove(),document.removeEventListener("click",u))};setTimeout(()=>document.addEventListener("click",u),50)}function ie(){w==="blended"&&_.length>0&&X(_)}function T(){var M,z,j,H;if(w==="off")return;const n=Q();if(!n){(M=document.getElementById("acadmail-email-brief-card"))==null||M.remove();return}const t=document.querySelector("div.ha")||((z=document.querySelector("h2.hP"))==null?void 0:z.parentElement)||((j=document.querySelector('div[role="main"] h2'))==null?void 0:j.parentElement);if(!t)return;const o=document.getElementById("acadmail-email-brief-card"),a=o==null?void 0:o.getAttribute("data-email-id");if(o&&a===n.id)return;o&&o.remove();const e=K(n.subject,n.senderName,n.bodyText,n.id),r=`${n.subject} ${n.bodyText}`,s=/\b(?:due|deadline|by|on|date:|till)\s+([A-Za-z]{3,9}\s+\d{1,2}(?:st|nd|rd|th)?(?:\s*,\s*\d{4})?|\d{1,2}\/\d{1,2}(?:\/\d{2,4})?|\d{1,2}\s+[A-Za-z]{3,9})\b/i,p=r.match(s),l=p?p[1]:null,i=r.match(/https?:\/\/(?:[a-zA-Z0-9-]+\.)?(?:zoom\.us\/j|meet\.google\.com|teams\.microsoft\.com\/l)\/[^\s<>"']+/i),u=i?i[0]:null,m=n.bodyText.split(/\.\s+/).map(y=>y.trim()).filter(y=>y.length>25&&!y.includes("http")&&!y.includes("unsubscribe")&&!y.includes("Regards")).slice(0,3);m.length===0&&m.push(`Announcement regarding ${n.subject} from ${n.senderName}.`);const f=E(),b=document.createElement("div");b.id="acadmail-email-brief-card",b.setAttribute("data-email-id",n.id),b.setAttribute("style",`
    margin: 4px 0 10px 0;
    padding: 6px 12px;
    background: ${f?"#1e1f20":"#f8fafd"};
    border: 1px solid ${f?"#333537":"#e0e7ff"};
    border-radius: 8px;
    font-family: -apple-system, BlinkMacSystemFont, "Google Sans", Roboto, sans-serif;
    font-size: 12px;
    color: ${f?"#e3e3e3":"#1f1f1f"};
    transition: all 0.2s ease;
  `),b.innerHTML=`
    <!-- Top 1-Line Compact Summary Bar -->
    <div style="display: flex; align-items: center; justify-content: space-between; gap: 8px;">
      <div id="m3-brief-toggle-line" style="display: flex; align-items: center; gap: 6px; cursor: pointer; flex: 1; overflow: hidden;">
        <span style="color: ${f?"#79c0ff":"#1a73e8"}; font-size: 14px;">✨</span>
        <span style="font-weight: 600; font-size: 11.5px; color: ${f?"#79c0ff":"#1a73e8"}; shrink: 0;">AcadMail:</span>
        <span style="font-size: 11.5px; color: ${f?"#c4c7c5":"#475569"}; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
          ${l?`⏰ Due: <strong>${l}</strong> • `:""}${m[0]}
        </span>
      </div>

      <div style="display: flex; align-items: center; gap: 5px; shrink: 0;">
        <!-- Category Chip with Re-label button -->
        <span style="padding: 1px 7px; border-radius: 4px; font-size: 10px; font-weight: 600; background: ${f?"rgba(56, 139, 253, 0.2)":"#e8f0fe"}; color: ${f?"#79c0ff":"#1a73e8"};">
          ${e.category}
        </span>

        <button id="acadmail-brief-relabel-btn" title="Change this email's category label" style="cursor: pointer; padding: 2px 5px; border-radius: 4px; border: 1px dashed ${f?"#444746":"#cbd5e1"}; background: transparent; font-size: 10px; font-weight: 500; color: ${f?"#a8c7fa":"#1a73e8"};">
          ✎ Relabel
        </button>

        ${l?`
          <a href="${Y(n.subject,n.bodyText.slice(0,300),l)}" target="_blank" style="text-decoration: none; padding: 2px 7px; background: ${f?"#004a77":"#c2e7ff"}; color: ${f?"#c2e7ff":"#001d35"}; border-radius: 6px; font-size: 10px; font-weight: 600;">+ GCal</a>
        `:""}
        <button id="m3-brief-expand-btn" style="cursor: pointer; padding: 2px 6px; border-radius: 4px; border: 1px solid ${f?"#444746":"#d2e3fc"}; background: transparent; font-size: 10px; font-weight: 600; color: ${f?"#79c0ff":"#1a73e8"};">
          ${q?"Collapse ▴":"Details ▾"}
        </button>
        <button id="m3-brief-dismiss-btn" title="Dismiss card" style="cursor: pointer; padding: 2px 4px; border: none; background: transparent; color: #94a3b8; font-size: 11px;">✕</button>
      </div>
    </div>

    <!-- Expandable Drawer Details -->
    <div id="m3-brief-drawer" style="display: ${q?"flex":"none"}; flex-direction: column; gap: 8px; margin-top: 8px; padding-top: 8px; border-top: 1px dashed ${f?"#333537":"#e0e2ec"};">
      <ul style="margin: 0; padding-left: 16px; display: flex; flex-direction: column; gap: 3px; font-size: 11.5px; color: ${f?"#c4c7c5":"#334155"}; line-height: 1.45;">
        ${m.map(y=>`<li>${y}</li>`).join("")}
      </ul>

      <!-- Action Row: Meeting Links + Quick Reply Chips -->
      <div style="display: flex; flex-wrap: wrap; align-items: center; gap: 6px; padding-top: 2px;">
        ${u?`
          <a href="${u}" target="_blank" style="text-decoration: none; display: inline-flex; align-items: center; gap: 4px; padding: 3px 8px; background: ${f?"#143e2e":"#e6f4ea"}; color: ${f?"#a7f3d0":"#137333"}; border-radius: 6px; font-size: 10.5px; font-weight: 600;">
            <span>🎥</span>
            <span>Join Meeting</span>
          </a>
        `:""}

        <span style="font-size: 10px; font-weight: 600; color: #94a3b8; margin-left: 2px;">Reply draft:</span>

        <button class="m3-quick-reply-btn" data-reply="confirm" style="cursor: pointer; padding: 2px 8px; border-radius: 12px; border: 1px solid ${f?"#444746":"#cbd5e1"}; background: transparent; color: ${f?"#e3e3e3":"#334155"}; font-size: 10.5px; font-weight: 500;">
          Confirm Attendance
        </button>

        <button class="m3-quick-reply-btn" data-reply="extension" style="cursor: pointer; padding: 2px 8px; border-radius: 12px; border: 1px solid ${f?"#444746":"#cbd5e1"}; background: transparent; color: ${f?"#e3e3e3":"#334155"}; font-size: 10.5px; font-weight: 500;">
          Request Extension
        </button>

        <button class="m3-quick-reply-btn" data-reply="doubt" style="cursor: pointer; padding: 2px 8px; border-radius: 12px; border: 1px solid ${f?"#444746":"#cbd5e1"}; background: transparent; color: ${f?"#e3e3e3":"#334155"}; font-size: 10.5px; font-weight: 500;">
          Ask Clarification
        </button>
      </div>
    </div>
  `;const g=b.querySelector("#acadmail-brief-relabel-btn");g&&(g.onclick=y=>{y.stopPropagation(),B(g,n.subject,n.senderName,e.category)});const k=b.querySelector("#m3-brief-drawer"),v=b.querySelector("#m3-brief-expand-btn"),d=b.querySelector("#m3-brief-toggle-line"),x=()=>{q=!q,k.style.display=q?"flex":"none",v.innerText=q?"Collapse ▴":"Details ▾"};v.onclick=x,d.onclick=x;const h=b.querySelector("#m3-brief-dismiss-btn");h&&(h.onclick=()=>b.remove()),b.querySelectorAll(".m3-quick-reply-btn").forEach(y=>{const P=y;P.onclick=async()=>{const O=P.getAttribute("data-reply");let L="";O==="confirm"?L=`Dear ${n.senderName||"Professor"},

Thank you for the update regarding "${n.subject}". I confirm my participation and will ensure all prerequisites are met.

Best regards,
[Your Name]
[Student ID]`:O==="extension"?L=`Dear Professor ${n.senderName||""},

I hope this email finds you well. I am writing to respectfully ask if it might be possible to grant a short extension on the submission for "${n.subject}". I want to ensure my work meets the highest standards.

Thank you for your time and understanding.

Sincerely,
[Your Name]
[Student ID]`:L=`Dear Professor ${n.senderName||""},

I hope you are well. Regarding the announcement on "${n.subject}", I had a quick question regarding the specifications and would appreciate some guidance.

Thank you very much.

Sincerely,
[Your Name]
[Student ID]`,await ae(L,P)}}),(H=t.parentElement)==null||H.insertBefore(b,t.nextSibling)}async function ae(n,t){const o=t.innerText;t.innerText="Drafting...";const a=document.querySelector('div[role="button"][aria-label*="Reply"]')||document.querySelector(".ams.bkH")||document.querySelector('.T-I.J-J5-Ji.T-I-Js-IF[data-tooltip*="Reply"]')||document.querySelector('span[role="button"][aria-label*="Reply"]');a&&a.click();let e=0;const r=setInterval(()=>{e++;const s=document.querySelector('div[aria-label="Message Body"], div[role="textbox"][contenteditable="true"]');s?(clearInterval(r),s.focus(),s.innerText=n,s.dispatchEvent(new Event("input",{bubbles:!0})),s.scrollIntoView({behavior:"smooth",block:"center"}),t.innerText="✅ Drafted!",setTimeout(()=>{t.innerText=o},2500)):e>15&&(clearInterval(r),t.innerText="⚠️ Click Reply first",setTimeout(()=>{t.innerText=o},2e3))},200)}function G(){if(w==="off"||document.getElementById("acadmail-siderail-btn"))return;const n=document.querySelector("div.aDG")||document.querySelector('div[aria-label="Side panel"]')||document.querySelector("div.bq9");if(!n)return;const t=document.createElement("div");t.id="acadmail-siderail-btn",t.title="AcadMail AI Copilot",t.setAttribute("role","button"),t.setAttribute("tabindex","0");const o=E();t.setAttribute("style",`
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
  `,t.onmouseenter=()=>t.style.background=o?"rgba(255,255,255,0.08)":"rgba(0,0,0,0.06)",t.onmouseleave=()=>t.style.background="transparent",t.onclick=()=>A({type:"OPEN_SIDEPANEL"}),n.prepend(t)}function Q(){var e,r,s,p,l;const n=document.querySelector("h2.hP")||document.querySelector("div.ha h2")||document.querySelector('div[role="main"] h2')||document.querySelector("h2[data-legacy-thread-id]")||document.querySelector("h1[data-thread-perm-id]"),t=((e=n==null?void 0:n.textContent)==null?void 0:e.trim())||"",o=document.querySelectorAll('.a3s.aiL, div[role="listitem"] .adn .a3s, .ii.gt, div.adn.ads');let a="";if(o.length>0&&(a=((r=o[o.length-1].textContent)==null?void 0:r.trim())||""),t&&(a||o.length>0)){const i=document.querySelector("span[email]")||document.querySelector(".gD")||document.querySelector(".go")||document.querySelector("span.zF"),u=(i==null?void 0:i.getAttribute("email"))||((s=i==null?void 0:i.textContent)==null?void 0:s.trim())||"academic@university.edu",c=(i==null?void 0:i.getAttribute("name"))||((p=i==null?void 0:i.textContent)==null?void 0:p.trim())||"Academic Sender",m=document.querySelector(".g3")||document.querySelector("span.mI")||document.querySelector(".date"),f=(m==null?void 0:m.getAttribute("title"))||((l=m==null?void 0:m.textContent)==null?void 0:l.trim())||new Date().toLocaleString();return{id:(window.location.hash||"").replace(/[^a-zA-Z0-9_-]/g,"_")||`email-${Date.now()}`,subject:t,senderName:c,senderEmail:u,recipient:"Me",dateStr:f,bodyText:a.slice(0,5e3),url:window.location.href}}return null}function F(){document.querySelectorAll("tr.btC, .gU.Up").forEach(t=>{if(t.querySelector(".acadmail-polish-btn"))return;const o=document.createElement("div");o.className="acadmail-polish-btn",o.setAttribute("style",`
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
    `,o.onclick=a=>{a.stopPropagation(),se(t,o)},t.appendChild(o)})}function se(n,t){var l;const o=document.getElementById("acadmail-tone-menu");if(o){o.remove();return}const a=n.closest('div[role="dialog"]')||n.closest(".M9"),e=a==null?void 0:a.querySelector('div[aria-label="Message Body"], div[contenteditable="true"]'),r=((l=e==null?void 0:e.innerText)==null?void 0:l.trim())||"",s=document.createElement("div");s.id="acadmail-tone-menu",s.setAttribute("style",`
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
  `),s.innerHTML=`
    <div style="padding: 4px 8px; font-size: 10px; font-weight: 700; color: #64748b; text-transform: uppercase;">Academic Tone</div>
    <div style="display: flex; flex-direction: column; gap: 3px; padding-top: 4px;">
      <button class="acad-tone-opt" data-tone="formal" style="text-align: left; padding: 6px 8px; border-radius: 6px; border: none; background: transparent; cursor: pointer; font-size: 11px; font-weight: 600; color: #1e293b;">Respectful & Formal</button>
      <button class="acad-tone-opt" data-tone="extension" style="text-align: left; padding: 6px 8px; border-radius: 6px; border: none; background: transparent; cursor: pointer; font-size: 11px; font-weight: 600; color: #1e293b;">Request Extension</button>
      <button class="acad-tone-opt" data-tone="doubt" style="text-align: left; padding: 6px 8px; border-radius: 6px; border: none; background: transparent; cursor: pointer; font-size: 11px; font-weight: 600; color: #1e293b;">Clarify Doubt</button>
      <button class="acad-tone-opt" data-tone="lor" style="text-align: left; padding: 6px 8px; border-radius: 6px; border: none; background: transparent; cursor: pointer; font-size: 11px; font-weight: 600; color: #1e293b;">Request LoR / Reference</button>
    </div>
  `,s.querySelectorAll(".acad-tone-opt").forEach(i=>{const u=i;u.onclick=async()=>{const c=u.getAttribute("data-tone")||"formal";s.remove(),await re(e,r,c,t)}}),t.appendChild(s);const p=i=>{!s.contains(i.target)&&!t.contains(i.target)&&(s.remove(),document.removeEventListener("click",p))};setTimeout(()=>document.addEventListener("click",p),100)}async function re(n,t,o,a){if(!n)return;const e=a.innerHTML;a.innerHTML="<span>Polishing...</span>";try{const r=await new Promise(u=>{var c;typeof chrome<"u"&&((c=chrome.storage)!=null&&c.local)?chrome.storage.local.get(["acadmail_settings"],m=>u(m.acadmail_settings||{})):u({})}),s=r.apiKey||"",p=r.groqApiKey||"",i=await le(t||"Need extension for lab assignment due this friday because of fever.",o,s,p);n.focus(),n.innerText=i,n.dispatchEvent(new Event("input",{bubbles:!0})),a.innerHTML="<span>Polished!</span>",setTimeout(()=>{a.innerHTML=e},2e3)}catch{a.innerHTML="<span>Error</span>",setTimeout(()=>{a.innerHTML=e},2e3)}}async function le(n,t,o,a){var s,p,l,i,u,c,m,f,b;const r=`Transform this student's rough notes into a courteous, polished academic email to a professor.
Tone: ${{formal:"Polite, professional academic tone to a professor.",extension:"Polite, respectful request for an assignment deadline extension showing dedication.",doubt:"Polite conceptual question or office hours request referencing lecture material.",lor:"Courteous inquiry requesting a Letter of Recommendation for graduate studies/internships."}[t]||"Formal"}
Guidelines:
- Include respectful salutation ("Dear Professor [Name],", "I hope this email finds you well.")
- Keep it concise, courteous, and respectful.
- Retain all dates, assignment titles, or reasons mentioned.
- Conclude with a warm academic sign-off ("Sincerely,", "Best regards," followed by "[Your Name] [Student ID]").
- Output ONLY the final email text.

Student's notes:
${n}`;if(a&&a.trim())try{const g=await fetch("https://api.groq.com/openai/v1/chat/completions",{method:"POST",headers:{Authorization:`Bearer ${a.trim()}`,"Content-Type":"application/json"},body:JSON.stringify({model:"llama-3.3-70b-versatile",messages:[{role:"user",content:r}],temperature:.3})});if(g.ok)return((i=(l=(p=(s=(await g.json()).choices)==null?void 0:s[0])==null?void 0:p.message)==null?void 0:l.content)==null?void 0:i.trim())||n}catch{}if(o&&o.trim()){const g=["models/gemini-2.0-flash","models/gemini-3.8-flash","models/gemini-1.5-flash"];for(const k of g)try{const v=await fetch(`https://generativelanguage.googleapis.com/v1beta/${k}:generateContent?key=${o.trim()}`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({contents:[{parts:[{text:r}]}],generationConfig:{temperature:.3}})});if(v.ok){const d=await v.json(),x=(b=(f=(m=(c=(u=d==null?void 0:d.candidates)==null?void 0:u[0])==null?void 0:c.content)==null?void 0:m.parts)==null?void 0:f[0])==null?void 0:b.text;if(x)return x.trim()}}catch{}}return`Dear Professor,

I hope this email finds you well.

I am writing to respectfully request your guidance regarding ${n}.

Thank you for your time and consideration.

Sincerely,
[Your Name]
[Student ID]`}var W;typeof chrome<"u"&&((W=chrome.runtime)!=null&&W.onMessage)&&chrome.runtime.onMessage.addListener((n,t,o)=>{if(n.type==="GET_ACTIVE_EMAIL"){const a=Q();o({email:a})}else if(n.type==="SCAN_INBOX"){const a=C();o({items:a})}else n.type==="FILTER_GMAIL_DOM"?(R(n.category),o({success:!0})):n.type==="SET_UI_MODE"?(w=n.mode,N(),o({success:!0})):n.type==="RELABEL_EMAIL"?(J(n.emailId,n.subject||"",n.sender||"",n.newCategory),o({success:!0})):n.type==="UPDATE_CUSTOM_FILTERS"&&(Z(),o({success:!0}));return!0});Z();document.readyState==="loading"?document.addEventListener("DOMContentLoaded",()=>{setTimeout(C,1200),setTimeout(T,1200),setTimeout(G,1200),setTimeout(F,1200),setTimeout(D,1200)}):(setTimeout(C,1200),setTimeout(T,1200),setTimeout(G,1200),setTimeout(F,1200),setTimeout(D,1200));let U=location.href;new MutationObserver(()=>{const n=location.href;n!==U&&(U=n,setTimeout(()=>{A({type:"EMAIL_CHANGED"}),D(),C(),T(),G()},400)),F()}).observe(document,{subtree:!0,childList:!0});

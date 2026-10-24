console.log("[AcadMail AI] Ultra-Clean Material 3 Gmail Script with Custom Filters & Relabeling active.");let R="ALL",j=[],$="blended",z=!1,S=[{id:"filter-placements",name:"Placements & Internships",color:"#8b5cf6",keywords:["placement","tpo","internship","interview","shortlist","offer","ctc","pre-placement"]},{id:"filter-hostel",name:"Hostel & Campus Mess",color:"#06b6d4",keywords:["hostel","mess","warden","room","maintenance","electricity","water","hall of residence"]}],A={},G=["Academics","Class Rescheduling"];function L(t){var e;try{typeof chrome<"u"&&((e=chrome.runtime)!=null&&e.id)&&chrome.runtime.sendMessage(t).catch(()=>{})}catch{}}function q(){try{const t=window.getComputedStyle(document.body).backgroundColor;if(t){const e=t.match(/\d+/g);if(e&&e.length>=3)return(parseInt(e[0])*299+parseInt(e[1])*587+parseInt(e[2])*114)/1e3<128}}catch{}return window.matchMedia("(prefers-color-scheme: dark)").matches}function P(){var o;const e=q()?"dark":"light";typeof chrome<"u"&&((o=chrome.storage)!=null&&o.local)&&chrome.storage.local.set({acadmail_gmail_theme:e}),L({type:"GMAIL_THEME_DETECTED",theme:e})}function O(){var t;P(),typeof chrome<"u"&&((t=chrome.storage)!=null&&t.local)&&chrome.storage.local.get(["acadmail_settings"],e=>{e.acadmail_settings&&(e.acadmail_settings.uiMode?$=e.acadmail_settings.uiMode:e.acadmail_settings.inPageIntegration===!1?$="off":$="blended",Array.isArray(e.acadmail_settings.customFilters)&&(S=e.acadmail_settings.customFilters),e.acadmail_settings.labelOverrides&&(A=e.acadmail_settings.labelOverrides),Array.isArray(e.acadmail_settings.preferredLabels)&&(G=e.acadmail_settings.preferredLabels)),U()})}function U(){var t,e,o,i;if((t=document.getElementById("acadmail-native-chip-bar"))==null||t.remove(),(e=document.getElementById("acadmail-inbox-filter-bar"))==null||e.remove(),(o=document.getElementById("acadmail-email-brief-card"))==null||o.remove(),(i=document.getElementById("acadmail-siderail-btn"))==null||i.remove(),$==="off"){_("ALL");return}T(),M(),B()}function Y(t,e,o,i){var a;A[t]=i,e&&(A[e]=i);const s=`${e}::${o}`.trim();s&&(A[s]=i),typeof chrome<"u"&&((a=chrome.storage)!=null&&a.local)&&chrome.storage.local.get(["acadmail_settings"],r=>{const l=r.acadmail_settings||{},d=l.labelOverrides||{};d[t]=i,e&&(d[e]=i),s&&(d[s]=i),chrome.storage.local.set({acadmail_settings:{...l,labelOverrides:d}})}),T(),M(),L({type:"EMAIL_CHANGED"}),Q(`Email re-labeled as "${i}"`)}function oe(t,e){var s;if(!t.trim())return;const o=e.split(",").map(a=>a.trim().toLowerCase()).filter(Boolean),i={id:`filter-${Date.now()}`,name:t.trim(),color:"#8b5cf6",keywords:o.length>0?o:[t.trim().toLowerCase()]};S.push(i),typeof chrome<"u"&&((s=chrome.storage)!=null&&s.local)&&chrome.storage.local.get(["acadmail_settings"],a=>{const r=a.acadmail_settings||{},l=r.customFilters||[];chrome.storage.local.set({acadmail_settings:{...r,customFilters:[...l,i]}})}),T(),L({type:"UPDATE_CUSTOM_FILTERS"}),Q(`Created filter "${i.name}"`)}function V(t,e,o,i){const s=(t||"").toLowerCase(),a=(e||"").toLowerCase(),r=(o||"").toLowerCase(),l=`${s} ${a} ${r}`,d=t.match(/\b([A-Z]{2,4}\s?[-_]?\s?\d{3,4}[A-Z]?)\b/i),n=d?d[1].toUpperCase():void 0;if(i&&A[i])return{category:A[i],courseCode:n};if(A[t])return{category:A[t],courseCode:n};const u=`${t}::${e}`.trim();if(A[u])return{category:A[u],courseCode:n};if(l.includes("viva")||l.includes("viva-voce")||l.includes("viva voce")||l.includes("oral defense")||l.includes("thesis defense")||l.includes("phd defense")||l.includes("ph.d. defense")||l.includes("synopsis presentation")||l.includes("synopsis submission")||l.includes("ph.d. viva")||l.includes("phd viva")||l.includes("doctoral defense")||l.includes("comprehensive exam presentation"))return{category:"General",courseCode:n,isPhd:!0};const f={"Class Rescheduling":0,"Competitions & Tournaments":0,Workshops:0,Academics:n?6:0,General:1};S&&S.length>0&&S.forEach(g=>{f[g.name]=0});const m=(g,k,E,I=[])=>{let C=0;for(const y of k)s.includes(y)?C+=6:r.includes(y)&&(C+=3);for(const y of E)s.includes(y)?C+=3.5:r.includes(y)&&(C+=1.5);for(const y of I)a.includes(y)&&(C+=2.5);f[g]!==void 0&&(f[g]+=C)};m("Class Rescheduling",["reschedule","rescheduled","class cancelled","class canceled","lecture cancelled","no class today","no class","extra class","room change","venue change","timing change","rescheduled lecture","swapped class"],["cancelled","canceled","postpone","postponed","lecture timing","timing","schedule change"],["acad","timetable"]),m("Competitions & Tournaments",["competition","tournament","hackathon","sociothon","ideathon","devfolio","open trials","inter-iit","inter iit","inter-hostel","inter-college","championship","prize pool","cash prize","case competition","quiz competition","coding contest","athletics"],["contest","trials","sports","cricket","football","badminton","volleyball","table tennis","chess","squash","esports","case comp","challenge","mushaira","trophy"],["sports","gymkhana","cultural","council","club"]),m("Workshops",["workshop","bootcamp","masterclass","hands-on session","distinguished lecture","guest lecture","orientation talk","intro talk","intro talks","introductory talk","conclave","symposium","info session","tech talk"],["webinar","seminar","talk by","opening talk","hands-on","enactus","sdslabs","pragati","hr conclave","panel discussion"],["seminar","chapter","society","ieee","acm"]),m("Academics",["assignment","homework","syllabus","midterm","endterm","quiz","exam","examination","lab manual","grading","grade submission","project evaluation","teaching day"],["canvas","moodle","classroom","prof.","professor","lecture","faculty","tutorial","office hours","ug-i","ug-ii","pg-i","coursework","submission"],["acad","faculty","professor","instructor","doaa","dean"]),S&&S.length>0&&S.forEach(g=>{g.keywords&&g.keywords.length>0&&m(g.name,g.keywords,[g.name.toLowerCase()],[])});const b=G&&G.length>0?G:["Academics","Class Rescheduling"],h={},v=Object.keys(f);v.forEach(g=>{const k=f[g];b.includes(g)&&k>0?h[g]=k*4.5+4:h[g]=k});let w="General",c=-1;return v.forEach(g=>{h[g]>c&&(c=h[g],w=g)}),!v.some(g=>g!=="General"&&f[g]>0)&&!n&&(w="General"),{category:w,courseCode:n,isPhd:!1}}document.addEventListener("click",t=>{t.target.closest("tr.zA")&&(setTimeout(()=>{L({type:"EMAIL_CHANGED"}),M()},350),setTimeout(()=>{L({type:"EMAIL_CHANGED"}),M()},800))},!0);function T(){const t=document.querySelectorAll("tr.zA"),e=[];return t.forEach((o,i)=>{var x,g,k,E;const s=o,a=s.querySelector(".bqe, .bog, span[data-thread-id]"),r=((x=a==null?void 0:a.textContent)==null?void 0:x.trim())||"(No Subject)",l=s.querySelector(".bA4 span, .yP, .zF"),d=((g=l==null?void 0:l.textContent)==null?void 0:g.trim())||"Unknown",n=s.querySelector(".y2"),u=((k=n==null?void 0:n.textContent)==null?void 0:k.trim())||"",p=s.querySelector(".xW span"),f=((E=p==null?void 0:p.textContent)==null?void 0:E.trim())||"Recent",m=!s.classList.contains("zE"),b=`${r}::${d}`.trim(),{category:h,courseCode:v,isPhd:w}=V(r,d,u,b),c={id:`row-${i}-${r.slice(0,15).replace(/[^a-zA-Z0-9]/g,"_")}`,index:i,subject:r,sender:d,snippet:u,date:f,category:h,courseCode:v,isRead:m};e.push(c),ne(s,h,v,w,r,d)}),j=e,$==="blended"&&e.length>0&&ee(e),e}function ne(t,e,o,i,s,a){const r=t.querySelector(".acadmail-row-badge");r&&r.remove();const l=t.querySelector(".y6, .bog");if(!l)return;const d=q(),n=document.createElement("span");n.className="acadmail-row-badge";let u=d?"background: rgba(56, 139, 253, 0.15); color: #79c0ff; border: 1px solid rgba(56, 139, 253, 0.3);":"background: #edf5fd; color: #1a73e8; border: 1px solid #d2e3fc;",p=o||"Acads";e==="Competitions & Tournaments"?(u=d?"background: rgba(210, 153, 34, 0.15); color: #e3b341; border: 1px solid rgba(210, 153, 34, 0.3);":"background: #fef7e0; color: #b06000; border: 1px solid #fce8b2;",p="Contest"):e==="Workshops"?(u=d?"background: rgba(46, 160, 67, 0.15); color: #7ee787; border: 1px solid rgba(46, 160, 67, 0.3);":"background: #e6f4ea; color: #137333; border: 1px solid #ceead6;",p="Workshop"):e==="Class Rescheduling"?(u=d?"background: rgba(248, 81, 73, 0.15); color: #ff7b72; border: 1px solid rgba(248, 81, 73, 0.3);":"background: #fce8e6; color: #c5221f; border: 1px solid #fad2cf;",p="Rescheduled"):i?(u=d?"background: rgba(142, 145, 143, 0.15); color: #c4c7c5; border: 1px solid rgba(142, 145, 143, 0.3);":"background: #f1f3f4; color: #5f6368; border: 1px solid #dadce0;",p="PhD / Viva"):e==="General"?(u=d?"background: rgba(142, 145, 143, 0.12); color: #c4c7c5; border: 1px solid rgba(142, 145, 143, 0.2);":"background: #f8f9fa; color: #5f6368; border: 1px solid #dadce0;",p="General"):(u=d?"background: rgba(168, 85, 247, 0.15); color: #c084fc; border: 1px solid rgba(168, 85, 247, 0.3);":"background: #f3e8ff; color: #7e22ce; border: 1px solid #e9d5ff;",p=e),n.setAttribute("style",`
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
  `),n.innerText=p,n.title=o?`Filter Gmail for ${o} (Right-click to change label)`:`Category: ${e} (Click to change)`,n.onclick=f=>{f.stopPropagation(),o?ie(o):N(n,s,a,e)},n.oncontextmenu=f=>{f.preventDefault(),f.stopPropagation(),N(n,s,a,e)},l.prepend(n)}function ie(t){const e=document.querySelector('input[name="q"], input[aria-label*="Search"]');if(e){e.value=t,e.dispatchEvent(new Event("input",{bubbles:!0}));const o=e.closest("form");o?o.dispatchEvent(new Event("submit",{bubbles:!0,cancelable:!0})):e.dispatchEvent(new KeyboardEvent("keydown",{key:"Enter",keyCode:13,bubbles:!0}))}}function _(t){R=t,document.querySelectorAll("tr.zA").forEach(o=>{const i=o;if(t==="ALL"){i.style.display="";return}const s=i.querySelector(".acadmail-row-badge"),a=(s==null?void 0:s.textContent)||"";let r=!1;(t==="Academics"&&(a.includes("🎓")||a.includes("Acads"))||t==="Competitions & Tournaments"&&(a.includes("🏆")||a.includes("Contest"))||t==="Workshops"&&(a.includes("🛠️")||a.includes("Workshop"))||t==="Class Rescheduling"&&(a.includes("⏰")||a.includes("Rescheduled"))||t==="General"&&(a.includes("📢")||a.includes("General")||a.includes("PhD"))||a.toLowerCase().includes(t.toLowerCase()))&&(r=!0),r?i.style.display="":i.style.display="none"}),re()}function X(t,e,o){const i="https://calendar.google.com/calendar/render?action=TEMPLATE";let s="";if(o){const r=new Date(o);if(!isNaN(r.getTime())){const l=r.toISOString().replace(/-|:|\.\d\d\d/g,""),n=new Date(r.getTime()+3600*1e3).toISOString().replace(/-|:|\.\d\d\d/g,"");s=`&dates=${l}/${n}`}}const a=new URLSearchParams({text:`[AcadMail] ${t}`,details:`${e}

— Auto-extracted by AcadMail AI`});return`${i}&${a.toString()}${s}`}function Q(t){const e=document.getElementById("acadmail-toast");e&&e.remove();const o=document.createElement("div");o.id="acadmail-toast",o.innerText=t,o.setAttribute("style",`
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
  `),document.body.appendChild(o),setTimeout(()=>o.remove(),2500)}function ee(t){var w;if($!=="blended")return;const e=document.querySelector('div[gh="tm"]')||document.querySelector("div.G-atb")||document.querySelector("div.aeF");if(!e)return;if(!document.getElementById("acadmail-m3-css")){const c=document.createElement("style");c.id="acadmail-m3-css",c.textContent=`
      @font-face {
        font-family: 'Batangas';
        src: url('${chrome.runtime.getURL("fonts/Batangas-Bold.otf")}') format('opentype');
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
    `,document.head.appendChild(c)}let o=0,i=0,s=0,a=0,r=0;const l=/\b(?:due|deadline|by|on|date:|till)\s+([A-Za-z]{3,9}\s+\d{1,2}(?:st|nd|rd|th)?(?:\s*,\s*\d{4})?|\d{1,2}\/\d{1,2}(?:\/\d{2,4})?|\d{1,2}\s+[A-Za-z]{3,9})\b/gi,d=[];t.forEach(c=>{c.category==="Academics"?o++:c.category==="Competitions & Tournaments"?i++:c.category==="Workshops"?s++:c.category==="Class Rescheduling"?a++:c.category==="General"&&r++;const g=[...`${c.subject} ${c.snippet}`.matchAll(l)];g.length>0&&d.push({title:c.subject,deadline:g[0][1]})});const n=q();let u=document.getElementById("acadmail-native-chip-bar");u||(u=document.createElement("div"),u.id="acadmail-native-chip-bar",u.setAttribute("style",`
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 10px;
      padding: 6px 16px;
      min-height: 44px;
      box-sizing: border-box;
      background: ${n?"#141517":"#ffffff"};
      border-bottom: 1px solid ${n?"rgba(255,255,255,0.08)":"#e0e2ec"};
      font-family: Roboto, "Google Sans", "Google Sans Text", -apple-system, sans-serif;
      font-size: 12px;
      z-index: 10;
    `),(w=e.parentElement)==null||w.insertBefore(u,e.nextSibling||e));const p=c=>R===c?`
        background: ${n?"#004a77":"#c2e7ff"};
        color: ${n?"#c2e7ff":"#001d35"};
        border: 1px solid ${n?"#005f9e":"#7fcfff"};
        font-weight: 600;
        box-shadow: 0 1px 2px rgba(0,0,0,0.05);
      `:`
      background: ${n?"rgba(255,255,255,0.04)":"#f8fafd"};
      color: ${n?"#e3e3e3":"#3c4043"};
      border: 1px solid ${n?"rgba(255,255,255,0.12)":"#dadce0"};
      font-weight: 500;
    `,f=(c,x)=>`<span class="m3-chip-count" style="background: ${R===c?n?"rgba(194, 231, 255, 0.22)":"rgba(0, 29, 53, 0.12)":n?"rgba(255, 255, 255, 0.1)":"rgba(0, 0, 0, 0.06)"}; color: inherit;">${x}</span>`;u.innerHTML=`
    <!-- Left: Slim Google Material 3 Chips (Defaults + Dynamic Custom Filters) -->
    <div id="acadmail-chip-scroll-track" style="display: flex; align-items: center; gap: 8px; overflow-x: auto; scrollbar-width: none; -ms-overflow-style: none; flex: 1; min-width: 0; padding: 2px 0;">
      
      <!-- Brand Pill -->
      <div style="display: inline-flex; align-items: center; gap: 6px; height: 32px; box-sizing: border-box; padding: 0 10px; border-radius: 6px; background: ${n?"rgba(56, 139, 253, 0.12)":"rgba(26, 115, 232, 0.08)"}; color: ${n?"#79c0ff":"#1a73e8"}; flex-shrink: 0; white-space: nowrap; margin-right: 4px; border: 1px solid ${n?"rgba(56, 139, 253, 0.25)":"rgba(26, 115, 232, 0.2)"};">
        <img src="${chrome.runtime.getURL("icons/envelope-logo.png")}" alt="AcadMail" style="width: 17px; height: 17px; border-radius: 3px; object-fit: contain;" />
        <span style="font-family: 'Batangas', Roboto, sans-serif; font-weight: 700; font-size: 13px; letter-spacing: 0.2px;">AcadMail</span>
      </div>

      <!-- 1. All Emails -->
      <button class="m3-chip" data-cat="ALL" style="${p("ALL")}">
        <span>All</span>
        ${f("ALL",t.length)}
      </button>

      <!-- 2. Academics -->
      <button class="m3-chip" data-cat="Academics" style="${p("Academics")}">
        <span>Academics</span>
        ${f("Academics",o)}
      </button>

      <!-- 3. Competitions -->
      <button class="m3-chip" data-cat="Competitions & Tournaments" style="${p("Competitions & Tournaments")}">
        <span>Contests</span>
        ${f("Competitions & Tournaments",i)}
      </button>

      <!-- 4. Workshops -->
      <button class="m3-chip" data-cat="Workshops" style="${p("Workshops")}">
        <span>Workshops</span>
        ${f("Workshops",s)}
      </button>

      <!-- 5. Reschedules -->
      <button class="m3-chip" data-cat="Class Rescheduling" style="${p("Class Rescheduling")}">
        <span>Rescheduled</span>
        ${f("Class Rescheduling",a)}
      </button>

      <!-- 6. General -->
      <button class="m3-chip" data-cat="General" style="${p("General")}">
        <span>General & PhD</span>
        ${f("General",r)}
      </button>

      <!-- 7. Dynamic User-Defined Custom Filters -->
      ${S.map(c=>{const x=t.filter(g=>g.category===c.name).length;return`
          <button class="m3-chip" data-cat="${c.name}" style="${p(c.name)}">
            <span>${c.name}</span>
            ${f(c.name,x)}
          </button>
        `}).join("")}

      <!-- 8. Add Custom Filter Button -->
      <button id="m3-add-filter-chip" title="Create your own custom academic filter" style="height: 32px; padding: 0 10px; border-radius: 6px; border: 1px dashed ${n?"rgba(255,255,255,0.25)":"#94a3b8"}; background: transparent; color: ${n?"#79c0ff":"#1a73e8"}; font-size: 12px; font-weight: 500; font-family: Roboto, 'Google Sans', sans-serif; cursor: pointer; display: inline-flex; align-items: center; gap: 4px; flex-shrink: 0; white-space: nowrap; transition: all 0.15s ease;">
        <span style="font-size: 14px; font-weight: 600; line-height: 1;">+</span>
        <span>Filter</span>
      </button>
    </div>

    <!-- Right: Mini Deadlines Dropdown & Instant Hide Button -->
    <div style="display: flex; align-items: center; gap: 8px; flex-shrink: 0;">
      ${d.length>0?`
        <div style="position: relative; flex-shrink: 0;">
          <button id="m3-deadlines-btn" style="height: 32px; padding: 0 10px; border-radius: 6px; border: 1px solid ${n?"rgba(210,153,34,0.4)":"#fde68a"}; background: ${n?"rgba(210,153,34,0.15)":"#fffbeb"}; color: ${n?"#e3b341":"#b45309"}; font-size: 12px; font-weight: 600; font-family: Roboto, 'Google Sans', sans-serif; cursor: pointer; display: inline-flex; align-items: center; gap: 5px; white-space: nowrap;">
            <span style="font-weight: 700; font-family: Roboto, 'Google Sans', sans-serif; font-size: 11px;">DUE</span>
            <span>${d.length}</span>
          </button>

          <div id="m3-deadlines-popover" style="display: none; position: absolute; right: 0; top: 38px; width: 310px; background: ${n?"#1e1f20":"#ffffff"}; border: 1px solid ${n?"#3c4043":"#e0e2ec"}; border-radius: 8px; box-shadow: 0 10px 28px rgba(0,0,0,0.2); padding: 12px; z-index: 99999; font-family: Roboto, 'Google Sans', sans-serif;">
            <div style="font-weight: 600; color: ${n?"#e3e3e3":"#1f1f1f"}; font-size: 11.5px; margin-bottom: 8px; display: flex; justify-content: space-between; align-items: center;">
              <span>Detected Due Dates</span>
              <span style="font-size: 10px; color: #1a73e8; font-weight: 600;">+ Google Calendar</span>
            </div>
            <div style="max-height: 220px; overflow-y: auto; display: flex; flex-direction: column; gap: 6px;">
              ${d.map(c=>`
                <div style="padding: 8px 10px; background: ${n?"#2b2c2f":"#f8fafd"}; border-radius: 6px; display: flex; align-items: center; justify-content: space-between; gap: 8px;">
                  <div style="overflow: hidden; flex: 1;">
                    <div style="font-size: 11.5px; font-weight: 500; color: ${n?"#e3e3e3":"#1f1f1f"}; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${c.title}</div>
                    <div style="font-size: 10.5px; color: ${n?"#e3b341":"#b45309"}; font-weight: 600; margin-top: 2px;">⏰ ${c.deadline}</div>
                  </div>
                  <a href="${X(c.title,"Course deadline from email",c.deadline)}" target="_blank" style="text-decoration: none; flex-shrink: 0; padding: 3px 8px; background: ${n?"#004a77":"#c2e7ff"}; color: ${n?"#c2e7ff":"#001d35"}; border-radius: 4px; font-size: 10.5px; font-weight: 600;">+ GCal</a>
                </div>
              `).join("")}
            </div>
          </div>
        </div>
      `:""}

      <button id="acadmail-instant-revert-btn" title="Hide AcadMail toolbar" style="height: 32px; padding: 0 10px; border-radius: 6px; border: 1px solid transparent; background: transparent; color: ${n?"#8e918f":"#64748b"}; font-size: 12px; font-family: Roboto, 'Google Sans', sans-serif; cursor: pointer; display: inline-flex; align-items: center; gap: 4px; flex-shrink: 0; white-space: nowrap; transition: color 0.15s ease;">
        <span style="font-size: 13px; line-height: 1;">✕</span>
        <span>Hide</span>
      </button>
    </div>
  `,u.querySelectorAll(".m3-chip").forEach(c=>{const x=c;x.onclick=()=>{const g=x.getAttribute("data-cat");_(R===g&&g!=="ALL"?"ALL":g)}});const m=u.querySelector("#m3-add-filter-chip");m&&(m.onclick=()=>ae());const b=u.querySelector("#m3-deadlines-btn"),h=u.querySelector("#m3-deadlines-popover");b&&h&&(b.onclick=c=>{c.stopPropagation(),h.style.display=h.style.display==="block"?"none":"block"},document.addEventListener("click",c=>{!h.contains(c.target)&&c.target!==b&&(h.style.display="none")}));const v=u.querySelector("#acadmail-instant-revert-btn");v&&(v.onclick=()=>{var c;$="off",typeof chrome<"u"&&((c=chrome.storage)!=null&&c.local)&&chrome.storage.local.get(["acadmail_settings"],x=>{const g=x.acadmail_settings||{};chrome.storage.local.set({acadmail_settings:{...g,uiMode:"off",inPageIntegration:!1}})}),U()})}function ae(){const t=document.getElementById("acadmail-add-filter-modal");if(t){t.remove();return}const e=q(),o=document.createElement("div");o.id="acadmail-add-filter-modal",o.setAttribute("style",`
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 320px;
    background: ${e?"#1e1f20":"#ffffff"};
    border: 1px solid ${e?"#444746":"#cbd5e1"};
    border-radius: 16px;
    box-shadow: 0 16px 36px rgba(0,0,0,0.25);
    padding: 16px;
    z-index: 9999999;
    font-family: -apple-system, BlinkMacSystemFont, "Google Sans", Roboto, sans-serif;
  `),o.innerHTML=`
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
      <span style="font-weight: 700; font-size: 13px; color: ${e?"#e3e3e3":"#0f172a"};">
        ✨ Create Custom Academic Filter
      </span>
      <button id="modal-close-btn" style="border: none; background: transparent; color: #94a3b8; font-size: 14px; cursor: pointer;">✕</button>
    </div>

    <div style="display: flex; flex-direction: column; gap: 8px;">
      <div>
        <label style="font-size: 10.5px; font-weight: 600; color: ${e?"#c4c7c5":"#475569"}; display: block; margin-bottom: 3px;">
          Filter / Bucket Name
        </label>
        <input id="new-filter-name" type="text" placeholder="e.g. Mess & Hostel, Library, Placements" style="width: 100%; box-sizing: border-box; padding: 6px 10px; border-radius: 8px; border: 1px solid ${e?"#444746":"#cbd5e1"}; background: ${e?"#2b2c2f":"#f8fafc"}; color: ${e?"#e3e3e3":"#0f172a"}; font-size: 12px; outline: none;" />
      </div>

      <div>
        <label style="font-size: 10.5px; font-weight: 600; color: ${e?"#c4c7c5":"#475569"}; display: block; margin-bottom: 3px;">
          Keywords (comma-separated)
        </label>
        <input id="new-filter-keywords" type="text" placeholder="e.g. mess, rebate, room, warden, hostel" style="width: 100%; box-sizing: border-box; padding: 6px 10px; border-radius: 8px; border: 1px solid ${e?"#444746":"#cbd5e1"}; background: ${e?"#2b2c2f":"#f8fafc"}; color: ${e?"#e3e3e3":"#0f172a"}; font-size: 12px; outline: none;" />
      </div>

      <div style="display: flex; justify-content: flex-end; gap: 6px; margin-top: 6px;">
        <button id="modal-cancel-btn" style="padding: 5px 10px; border-radius: 8px; border: 1px solid transparent; background: transparent; color: ${e?"#c4c7c5":"#64748b"}; font-size: 11px; cursor: pointer;">Cancel</button>
        <button id="modal-save-btn" style="padding: 5px 14px; border-radius: 8px; border: none; background: #2563eb; color: #ffffff; font-size: 11px; font-weight: 600; cursor: pointer;">Save Filter</button>
      </div>
    </div>
  `,document.body.appendChild(o);const i=o.querySelector("#modal-close-btn"),s=o.querySelector("#modal-cancel-btn"),a=o.querySelector("#modal-save-btn"),r=o.querySelector("#new-filter-name"),l=o.querySelector("#new-filter-keywords");i.onclick=()=>o.remove(),s.onclick=()=>o.remove(),a.onclick=()=>{const d=r.value.trim(),n=l.value.trim();d&&(oe(d,n),o.remove())}}function N(t,e,o,i){const s=document.getElementById("acadmail-relabel-popup");if(s){s.remove();return}const a=q(),r=t.getBoundingClientRect(),l=document.createElement("div");l.id="acadmail-relabel-popup",l.setAttribute("style",`
    position: fixed;
    top: ${r.bottom+4}px;
    left: ${Math.min(r.left,window.innerWidth-220)}px;
    width: 210px;
    background: ${a?"#1e1f20":"#ffffff"};
    border: 1px solid ${a?"#444746":"#e0e2ec"};
    border-radius: 12px;
    box-shadow: 0 10px 25px rgba(0,0,0,0.2);
    padding: 6px;
    z-index: 9999999;
    font-family: -apple-system, BlinkMacSystemFont, "Google Sans", Roboto, sans-serif;
  `);const d=["Academics","Competitions & Tournaments","Workshops","Class Rescheduling","General"],n=[...d,...S.map(p=>p.name).filter(p=>!d.includes(p))];l.innerHTML=`
    <div style="padding: 4px 8px; font-size: 10px; font-weight: 700; color: ${a?"#8e918f":"#64748b"}; text-transform: uppercase; border-bottom: 1px solid ${a?"#333537":"#f1f5f9"};">
      Change Category Label
    </div>
    <div style="display: flex; flex-direction: column; gap: 2px; padding-top: 4px; max-height: 200px; overflow-y: auto;">
      ${n.map(p=>`
        <button class="relabel-opt" data-cat="${p}" style="text-align: left; padding: 6px 8px; border-radius: 6px; border: none; background: ${p===i?a?"#004a77":"#c2e7ff":"transparent"}; color: ${p===i?a?"#c2e7ff":"#001d35":a?"#e3e3e3":"#1f1f1f"}; font-size: 11.5px; font-weight: ${p===i?"600":"400"}; cursor: pointer; display: flex; align-items: center; justify-content: space-between;">
          <span>${p}</span>
          ${p===i?"<span>✓</span>":""}
        </button>
      `).join("")}
    </div>
  `,document.body.appendChild(l),l.querySelectorAll(".relabel-opt").forEach(p=>{const f=p;f.onclick=m=>{m.stopPropagation();const b=f.getAttribute("data-cat")||"General";Y(e,e,o,b),l.remove()}});const u=p=>{!l.contains(p.target)&&!t.contains(p.target)&&(l.remove(),document.removeEventListener("click",u))};setTimeout(()=>document.addEventListener("click",u),50)}function re(){$==="blended"&&j.length>0&&ee(j)}function M(){var k,E,I,C;if($==="off")return;const t=te();if(!t){(k=document.getElementById("acadmail-email-brief-card"))==null||k.remove();return}const e=document.querySelector("div.ha")||((E=document.querySelector("h2.hP"))==null?void 0:E.parentElement)||((I=document.querySelector('div[role="main"] h2'))==null?void 0:I.parentElement);if(!e)return;const o=document.getElementById("acadmail-email-brief-card"),i=o==null?void 0:o.getAttribute("data-email-id");if(o&&i===t.id)return;o&&o.remove();const s=V(t.subject,t.senderName,t.bodyText,t.id),a=`${t.subject} ${t.bodyText}`,r=/\b(?:due|deadline|by|on|date:|till)\s+([A-Za-z]{3,9}\s+\d{1,2}(?:st|nd|rd|th)?(?:\s*,\s*\d{4})?|\d{1,2}\/\d{1,2}(?:\/\d{2,4})?|\d{1,2}\s+[A-Za-z]{3,9})\b/i,l=a.match(r),d=l?l[1]:null,n=a.match(/https?:\/\/(?:[a-zA-Z0-9-]+\.)?(?:zoom\.us\/j|meet\.google\.com|teams\.microsoft\.com\/l)\/[^\s<>"']+/i),u=n?n[0]:null,f=t.bodyText.split(/\.\s+/).map(y=>y.trim()).filter(y=>y.length>25&&!y.includes("http")&&!y.includes("unsubscribe")&&!y.includes("Regards")).slice(0,3);f.length===0&&f.push(`Announcement regarding ${t.subject} from ${t.senderName}.`);const m=q(),b=document.createElement("div");b.id="acadmail-email-brief-card",b.setAttribute("data-email-id",t.id),b.setAttribute("style",`
    margin: 4px 0 10px 0;
    padding: 6px 12px;
    background: ${m?"#1e1f20":"#f8fafd"};
    border: 1px solid ${m?"#333537":"#e0e7ff"};
    border-radius: 8px;
    font-family: -apple-system, BlinkMacSystemFont, "Google Sans", Roboto, sans-serif;
    font-size: 12px;
    color: ${m?"#e3e3e3":"#1f1f1f"};
    transition: all 0.2s ease;
  `),b.innerHTML=`
    <!-- Top 1-Line Compact Summary Bar -->
    <div style="display: flex; align-items: center; justify-content: space-between; gap: 8px;">
      <div id="m3-brief-toggle-line" style="display: flex; align-items: center; gap: 6px; cursor: pointer; flex: 1; overflow: hidden;">
        <img src="${chrome.runtime.getURL("icons/envelope-logo.png")}" alt="AcadMail" style="width: 14px; height: 14px; border-radius: 2.5px; object-fit: contain; flex-shrink: 0;" />
        <span style="font-family: 'Batangas', Roboto, sans-serif; font-weight: 700; font-size: 12px; color: ${m?"#79c0ff":"#1a73e8"}; shrink: 0;">AcadMail:</span>
        <span style="font-size: 11.5px; color: ${m?"#c4c7c5":"#475569"}; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
          ${d?`⏰ Due: <strong>${d}</strong> • `:""}${f[0]}
        </span>
      </div>

      <div style="display: flex; align-items: center; gap: 5px; shrink: 0;">
        <!-- Category Chip with Re-label button -->
        <span style="padding: 1px 7px; border-radius: 4px; font-size: 10px; font-weight: 600; background: ${m?"rgba(56, 139, 253, 0.2)":"#e8f0fe"}; color: ${m?"#79c0ff":"#1a73e8"};">
          ${s.category}
        </span>

        <button id="acadmail-brief-relabel-btn" title="Change this email's category label" style="cursor: pointer; padding: 2px 5px; border-radius: 4px; border: 1px dashed ${m?"#444746":"#cbd5e1"}; background: transparent; font-size: 10px; font-weight: 500; color: ${m?"#a8c7fa":"#1a73e8"};">
          ✎ Relabel
        </button>

        ${d?`
          <a href="${X(t.subject,t.bodyText.slice(0,300),d)}" target="_blank" style="text-decoration: none; padding: 2px 7px; background: ${m?"#004a77":"#c2e7ff"}; color: ${m?"#c2e7ff":"#001d35"}; border-radius: 6px; font-size: 10px; font-weight: 600;">+ GCal</a>
        `:""}
        <button id="m3-brief-expand-btn" style="cursor: pointer; padding: 2px 6px; border-radius: 4px; border: 1px solid ${m?"#444746":"#d2e3fc"}; background: transparent; font-size: 10px; font-weight: 600; color: ${m?"#79c0ff":"#1a73e8"};">
          ${z?"Collapse ▴":"Details ▾"}
        </button>
        <button id="m3-brief-dismiss-btn" title="Dismiss card" style="cursor: pointer; padding: 2px 4px; border: none; background: transparent; color: #94a3b8; font-size: 11px;">✕</button>
      </div>
    </div>

    <!-- Expandable Drawer Details -->
    <div id="m3-brief-drawer" style="display: ${z?"flex":"none"}; flex-direction: column; gap: 8px; margin-top: 8px; padding-top: 8px; border-top: 1px dashed ${m?"#333537":"#e0e2ec"};">
      <ul style="margin: 0; padding-left: 16px; display: flex; flex-direction: column; gap: 3px; font-size: 11.5px; color: ${m?"#c4c7c5":"#334155"}; line-height: 1.45;">
        ${f.map(y=>`<li>${y}</li>`).join("")}
      </ul>

      <!-- Action Row: Meeting Links + Quick Reply Chips -->
      <div style="display: flex; flex-wrap: wrap; align-items: center; gap: 6px; padding-top: 2px;">
        ${u?`
          <a href="${u}" target="_blank" style="text-decoration: none; display: inline-flex; align-items: center; gap: 4px; padding: 3px 8px; background: ${m?"#143e2e":"#e6f4ea"}; color: ${m?"#a7f3d0":"#137333"}; border-radius: 6px; font-size: 10.5px; font-weight: 600;">
            <span>🎥</span>
            <span>Join Meeting</span>
          </a>
        `:""}

        <span style="font-size: 10px; font-weight: 600; color: #94a3b8; margin-left: 2px;">Reply draft:</span>

        <button class="m3-quick-reply-btn" data-reply="confirm" style="cursor: pointer; padding: 2px 8px; border-radius: 12px; border: 1px solid ${m?"#444746":"#cbd5e1"}; background: transparent; color: ${m?"#e3e3e3":"#334155"}; font-size: 10.5px; font-weight: 500;">
          Confirm Attendance
        </button>

        <button class="m3-quick-reply-btn" data-reply="extension" style="cursor: pointer; padding: 2px 8px; border-radius: 12px; border: 1px solid ${m?"#444746":"#cbd5e1"}; background: transparent; color: ${m?"#e3e3e3":"#334155"}; font-size: 10.5px; font-weight: 500;">
          Request Extension
        </button>

        <button class="m3-quick-reply-btn" data-reply="doubt" style="cursor: pointer; padding: 2px 8px; border-radius: 12px; border: 1px solid ${m?"#444746":"#cbd5e1"}; background: transparent; color: ${m?"#e3e3e3":"#334155"}; font-size: 10.5px; font-weight: 500;">
          Ask Clarification
        </button>
      </div>
    </div>
  `;const h=b.querySelector("#acadmail-brief-relabel-btn");h&&(h.onclick=y=>{y.stopPropagation(),N(h,t.subject,t.senderName,s.category)});const v=b.querySelector("#m3-brief-drawer"),w=b.querySelector("#m3-brief-expand-btn"),c=b.querySelector("#m3-brief-toggle-line"),x=()=>{z=!z,v.style.display=z?"flex":"none",w.innerText=z?"Collapse ▴":"Details ▾"};w.onclick=x,c.onclick=x;const g=b.querySelector("#m3-brief-dismiss-btn");g&&(g.onclick=()=>b.remove()),b.querySelectorAll(".m3-quick-reply-btn").forEach(y=>{const F=y;F.onclick=async()=>{const W=F.getAttribute("data-reply");let D="";W==="confirm"?D=`Dear ${t.senderName||"Professor"},

Thank you for the update regarding "${t.subject}". I confirm my participation and will ensure all prerequisites are met.

Best regards,
[Your Name]
[Student ID]`:W==="extension"?D=`Dear Professor ${t.senderName||""},

I hope this email finds you well. I am writing to respectfully ask if it might be possible to grant a short extension on the submission for "${t.subject}". I want to ensure my work meets the highest standards.

Thank you for your time and understanding.

Sincerely,
[Your Name]
[Student ID]`:D=`Dear Professor ${t.senderName||""},

I hope you are well. Regarding the announcement on "${t.subject}", I had a quick question regarding the specifications and would appreciate some guidance.

Thank you very much.

Sincerely,
[Your Name]
[Student ID]`,await se(D,F)}}),(C=e.parentElement)==null||C.insertBefore(b,e.nextSibling)}async function se(t,e){const o=e.innerText;e.innerText="Drafting...";const i=document.querySelector('div[role="button"][aria-label*="Reply"]')||document.querySelector(".ams.bkH")||document.querySelector('.T-I.J-J5-Ji.T-I-Js-IF[data-tooltip*="Reply"]')||document.querySelector('span[role="button"][aria-label*="Reply"]');i&&i.click();let s=0;const a=setInterval(()=>{s++;const r=document.querySelector('div[aria-label="Message Body"], div[role="textbox"][contenteditable="true"]');r?(clearInterval(a),r.focus(),r.innerText=t,r.dispatchEvent(new Event("input",{bubbles:!0})),r.scrollIntoView({behavior:"smooth",block:"center"}),e.innerText="✅ Drafted!",setTimeout(()=>{e.innerText=o},2500)):s>15&&(clearInterval(a),e.innerText="⚠️ Click Reply first",setTimeout(()=>{e.innerText=o},2e3))},200)}function B(){if($==="off"||document.getElementById("acadmail-siderail-btn"))return;const t=document.querySelector("div.aDG")||document.querySelector('div[aria-label="Side panel"]')||document.querySelector("div.bq9");if(!t)return;const e=document.createElement("div");e.id="acadmail-siderail-btn",e.title="AcadMail AI Copilot",e.setAttribute("role","button"),e.setAttribute("tabindex","0");const o=q();e.setAttribute("style",`
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
  `),e.innerHTML=`
    <img src="${chrome.runtime.getURL("icons/envelope-logo.png")}" alt="AcadMail" style="width: 22px; height: 22px; border-radius: 4px; object-fit: contain;" />
  `,e.onmouseenter=()=>e.style.background=o?"rgba(255,255,255,0.08)":"rgba(0,0,0,0.06)",e.onmouseleave=()=>e.style.background="transparent",e.onclick=()=>L({type:"OPEN_SIDEPANEL"}),t.prepend(e)}function te(){var s,a,r,l,d;const t=document.querySelector("h2.hP")||document.querySelector("div.ha h2")||document.querySelector('div[role="main"] h2')||document.querySelector("h2[data-legacy-thread-id]")||document.querySelector("h1[data-thread-perm-id]"),e=((s=t==null?void 0:t.textContent)==null?void 0:s.trim())||"",o=document.querySelectorAll('.a3s.aiL, div[role="listitem"] .adn .a3s, .ii.gt, div.adn.ads');let i="";if(o.length>0&&(i=((a=o[o.length-1].textContent)==null?void 0:a.trim())||""),e&&(i||o.length>0)){const n=document.querySelector("span[email]")||document.querySelector(".gD")||document.querySelector(".go")||document.querySelector("span.zF"),u=(n==null?void 0:n.getAttribute("email"))||((r=n==null?void 0:n.textContent)==null?void 0:r.trim())||"academic@university.edu",p=(n==null?void 0:n.getAttribute("name"))||((l=n==null?void 0:n.textContent)==null?void 0:l.trim())||"Academic Sender",f=document.querySelector(".g3")||document.querySelector("span.mI")||document.querySelector(".date"),m=(f==null?void 0:f.getAttribute("title"))||((d=f==null?void 0:f.textContent)==null?void 0:d.trim())||new Date().toLocaleString();return{id:(window.location.hash||"").replace(/[^a-zA-Z0-9_-]/g,"_")||`email-${Date.now()}`,subject:e,senderName:p,senderEmail:u,recipient:"Me",dateStr:m,bodyText:i.slice(0,5e3),url:window.location.href}}return null}function H(){document.querySelectorAll("tr.btC, .gU.Up").forEach(e=>{if(e.querySelector(".acadmail-polish-btn"))return;const o=document.createElement("div");o.className="acadmail-polish-btn",o.setAttribute("style",`
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
    `,o.onclick=i=>{i.stopPropagation(),le(e,o)},e.appendChild(o)})}function le(t,e){var d;const o=document.getElementById("acadmail-tone-menu");if(o){o.remove();return}const i=t.closest('div[role="dialog"]')||t.closest(".M9"),s=i==null?void 0:i.querySelector('div[aria-label="Message Body"], div[contenteditable="true"]'),a=((d=s==null?void 0:s.innerText)==null?void 0:d.trim())||"",r=document.createElement("div");r.id="acadmail-tone-menu",r.setAttribute("style",`
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
      <button class="acad-tone-opt" data-tone="formal" style="text-align: left; padding: 6px 8px; border-radius: 6px; border: none; background: transparent; cursor: pointer; font-size: 11px; font-weight: 600; color: #1e293b;">Respectful & Formal</button>
      <button class="acad-tone-opt" data-tone="extension" style="text-align: left; padding: 6px 8px; border-radius: 6px; border: none; background: transparent; cursor: pointer; font-size: 11px; font-weight: 600; color: #1e293b;">Request Extension</button>
      <button class="acad-tone-opt" data-tone="doubt" style="text-align: left; padding: 6px 8px; border-radius: 6px; border: none; background: transparent; cursor: pointer; font-size: 11px; font-weight: 600; color: #1e293b;">Clarify Doubt</button>
      <button class="acad-tone-opt" data-tone="lor" style="text-align: left; padding: 6px 8px; border-radius: 6px; border: none; background: transparent; cursor: pointer; font-size: 11px; font-weight: 600; color: #1e293b;">Request LoR / Reference</button>
    </div>
  `,r.querySelectorAll(".acad-tone-opt").forEach(n=>{const u=n;u.onclick=async()=>{const p=u.getAttribute("data-tone")||"formal";r.remove(),await ce(s,a,p,e)}}),e.appendChild(r);const l=n=>{!r.contains(n.target)&&!e.contains(n.target)&&(r.remove(),document.removeEventListener("click",l))};setTimeout(()=>document.addEventListener("click",l),100)}async function ce(t,e,o,i){if(!t)return;const s=i.innerHTML;i.innerHTML="<span>Polishing...</span>";try{const a=await new Promise(u=>{var p;typeof chrome<"u"&&((p=chrome.storage)!=null&&p.local)?chrome.storage.local.get(["acadmail_settings"],f=>u(f.acadmail_settings||{})):u({})}),r=a.apiKey||"",l=a.groqApiKey||"",n=await de(e||"Need extension for lab assignment due this friday because of fever.",o,r,l);t.focus(),t.innerText=n,t.dispatchEvent(new Event("input",{bubbles:!0})),i.innerHTML="<span>Polished!</span>",setTimeout(()=>{i.innerHTML=s},2e3)}catch{i.innerHTML="<span>Error</span>",setTimeout(()=>{i.innerHTML=s},2e3)}}async function de(t,e,o,i){var r,l,d,n,u,p,f,m,b;const a=`Transform this student's rough notes into a courteous, polished academic email to a professor.
Tone: ${{formal:"Polite, professional academic tone to a professor.",extension:"Polite, respectful request for an assignment deadline extension showing dedication.",doubt:"Polite conceptual question or office hours request referencing lecture material.",lor:"Courteous inquiry requesting a Letter of Recommendation for graduate studies/internships."}[e]||"Formal"}
Guidelines:
- Include respectful salutation ("Dear Professor [Name],", "I hope this email finds you well.")
- Keep it concise, courteous, and respectful.
- Retain all dates, assignment titles, or reasons mentioned.
- Conclude with a warm academic sign-off ("Sincerely,", "Best regards," followed by "[Your Name] [Student ID]").
- Output ONLY the final email text.

Student's notes:
${t}`;if(i&&i.trim())try{const h=await fetch("https://api.groq.com/openai/v1/chat/completions",{method:"POST",headers:{Authorization:`Bearer ${i.trim()}`,"Content-Type":"application/json"},body:JSON.stringify({model:"llama-3.3-70b-versatile",messages:[{role:"user",content:a}],temperature:.3})});if(h.ok)return((n=(d=(l=(r=(await h.json()).choices)==null?void 0:r[0])==null?void 0:l.message)==null?void 0:d.content)==null?void 0:n.trim())||t}catch{}if(o&&o.trim()){const h=["models/gemini-2.0-flash","models/gemini-3.8-flash","models/gemini-1.5-flash"];for(const v of h)try{const w=await fetch(`https://generativelanguage.googleapis.com/v1beta/${v}:generateContent?key=${o.trim()}`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({contents:[{parts:[{text:a}]}],generationConfig:{temperature:.3}})});if(w.ok){const c=await w.json(),x=(b=(m=(f=(p=(u=c==null?void 0:c.candidates)==null?void 0:u[0])==null?void 0:p.content)==null?void 0:f.parts)==null?void 0:m[0])==null?void 0:b.text;if(x)return x.trim()}}catch{}}return`Dear Professor,

I hope this email finds you well.

I am writing to respectfully request your guidance regarding ${t}.

Thank you for your time and consideration.

Sincerely,
[Your Name]
[Student ID]`}var J;typeof chrome<"u"&&((J=chrome.runtime)!=null&&J.onMessage)&&chrome.runtime.onMessage.addListener((t,e,o)=>{if(t.type==="GET_ACTIVE_EMAIL"){const i=te();o({email:i})}else if(t.type==="SCAN_INBOX"){const i=T();o({items:i})}else t.type==="FILTER_GMAIL_DOM"?(_(t.category),o({success:!0})):t.type==="SET_UI_MODE"?($=t.mode,U(),o({success:!0})):t.type==="RELABEL_EMAIL"?(Y(t.emailId,t.subject||"",t.sender||"",t.newCategory),o({success:!0})):(t.type==="UPDATE_CUSTOM_FILTERS"||t.type==="UPDATE_SETTINGS")&&(O(),setTimeout(T,300),o({success:!0}));return!0});var K;typeof chrome<"u"&&((K=chrome.storage)!=null&&K.onChanged)&&chrome.storage.onChanged.addListener((t,e)=>{e==="local"&&t.acadmail_settings&&(O(),setTimeout(T,300))});O();document.readyState==="loading"?document.addEventListener("DOMContentLoaded",()=>{setTimeout(T,1200),setTimeout(M,1200),setTimeout(B,1200),setTimeout(H,1200),setTimeout(P,1200)}):(setTimeout(T,1200),setTimeout(M,1200),setTimeout(B,1200),setTimeout(H,1200),setTimeout(P,1200));let Z=location.href;new MutationObserver(()=>{const t=location.href;t!==Z&&(Z=t,setTimeout(()=>{L({type:"EMAIL_CHANGED"}),P(),T(),M(),B()},400)),H()}).observe(document,{subtree:!0,childList:!0});

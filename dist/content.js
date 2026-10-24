console.log("[AcadMail AI] Ultra-Clean Material 3 Gmail Script with Custom Filters & Relabeling active.");let P="ALL",H=[],$="blended",R=!1,S=[{id:"filter-assignment",name:"Assignment",color:"#0b57d0",keywords:["assignment","assignments","tutorial","tutorials","homework","problem set","problem sets","pset","psets","lab submission","lab assignment"]},{id:"filter-placements",name:"Placements & Internships",color:"#8b5cf6",keywords:["placement","tpo","internship","interview","shortlist","offer","ctc","pre-placement"]},{id:"filter-hostel",name:"Hostel & Campus Mess",color:"#06b6d4",keywords:["hostel","mess","warden","room","maintenance","electricity","water","hall of residence"]}],L={},G=["Assignment","Academics","Competitions & Tournaments","Class Rescheduling"],_=["Assignment","Academics","Competitions & Tournaments","Class Rescheduling"];function M(t){var e;try{typeof chrome<"u"&&((e=chrome.runtime)!=null&&e.id)&&chrome.runtime.sendMessage(t).catch(()=>{})}catch{}}function I(){try{const t=window.getComputedStyle(document.body).backgroundColor;if(t){const e=t.match(/\d+/g);if(e&&e.length>=3)return(parseInt(e[0])*299+parseInt(e[1])*587+parseInt(e[2])*114)/1e3<128}}catch{}return window.matchMedia("(prefers-color-scheme: dark)").matches}function j(){var n;const e=I()?"dark":"light";typeof chrome<"u"&&((n=chrome.storage)!=null&&n.local)&&chrome.storage.local.set({acadmail_gmail_theme:e}),M({type:"GMAIL_THEME_DETECTED",theme:e})}function Z(){var t;j(),typeof chrome<"u"&&((t=chrome.storage)!=null&&t.local)&&chrome.storage.local.get(["acadmail_settings"],e=>{e.acadmail_settings&&(e.acadmail_settings.uiMode?$=e.acadmail_settings.uiMode:e.acadmail_settings.inPageIntegration===!1?$="off":$="blended",Array.isArray(e.acadmail_settings.customFilters)&&(S=e.acadmail_settings.customFilters,S.some(i=>i.id==="filter-assignment"||i.name.toLowerCase()==="assignment"||i.name.toLowerCase()==="assignments")||S.unshift({id:"filter-assignment",name:"Assignment",color:"#0b57d0",keywords:["assignment","assignments","tutorial","tutorials","homework","problem set","problem sets","pset","psets","lab submission","lab assignment"]})),e.acadmail_settings.labelOverrides&&(L=e.acadmail_settings.labelOverrides),Array.isArray(e.acadmail_settings.priorityList)?(G=e.acadmail_settings.priorityList,_=e.acadmail_settings.priorityList):Array.isArray(e.acadmail_settings.preferredLabels)&&(G=e.acadmail_settings.preferredLabels,_=e.acadmail_settings.preferredLabels)),J()})}function J(){var t,e,n,i;if((t=document.getElementById("acadmail-native-chip-bar"))==null||t.remove(),(e=document.getElementById("acadmail-inbox-filter-bar"))==null||e.remove(),(n=document.getElementById("acadmail-email-brief-card"))==null||n.remove(),(i=document.getElementById("acadmail-siderail-btn"))==null||i.remove(),$==="off"){B("ALL");return}A(),z(),F()}function oe(t,e,n,i){var s;L[t]=i,e&&(L[e]=i);const d=`${e}::${n}`.trim();d&&(L[d]=i),typeof chrome<"u"&&((s=chrome.storage)!=null&&s.local)&&chrome.storage.local.get(["acadmail_settings"],r=>{const a=r.acadmail_settings||{},l=a.labelOverrides||{};l[t]=i,e&&(l[e]=i),d&&(l[d]=i),chrome.storage.local.set({acadmail_settings:{...a,labelOverrides:l}})}),A(),z(),M({type:"EMAIL_CHANGED"}),se(`Email re-labeled as "${i}"`)}function de(t,e){var d;if(!t.trim())return;const n=e.split(",").map(s=>s.trim().toLowerCase()).filter(Boolean),i={id:`filter-${Date.now()}`,name:t.trim(),color:"#8b5cf6",keywords:n.length>0?n:[t.trim().toLowerCase()]};S.push(i),typeof chrome<"u"&&((d=chrome.storage)!=null&&d.local)&&chrome.storage.local.get(["acadmail_settings"],s=>{const r=s.acadmail_settings||{},a=r.customFilters||[];chrome.storage.local.set({acadmail_settings:{...r,customFilters:[...a,i]}})}),A(),M({type:"UPDATE_CUSTOM_FILTERS"}),se(`Created filter "${i.name}"`)}function ie(t,e,n,i){const d=(t||"").toLowerCase(),s=(e||"").toLowerCase(),r=(n||"").toLowerCase(),a=`${d} ${s} ${r}`,l=t.match(/\b([A-Z]{2,4}\s?[-_]?\s?\d{3,4}[A-Z]?)\b/i),o=l?l[1].toUpperCase():void 0;if(i&&L[i])return{category:L[i],courseCode:o};if(L[t])return{category:L[t],courseCode:o};const f=`${t}::${e}`.trim();if(L[f])return{category:L[f],courseCode:o};if(a.includes("viva")||a.includes("viva-voce")||a.includes("viva voce")||a.includes("oral defense")||a.includes("thesis defense")||a.includes("phd defense")||a.includes("ph.d. defense")||a.includes("synopsis presentation")||a.includes("synopsis submission")||a.includes("ph.d. viva")||a.includes("phd viva")||a.includes("doctoral defense")||a.includes("comprehensive exam presentation"))return{category:"General",courseCode:o,isPhd:!0};const m={"Class Rescheduling":0,"Competitions & Tournaments":0,Workshops:0,Academics:o?5:0,Assignment:0,General:1};S&&S.length>0&&S.forEach(g=>{m[g.name]=0});const p=(g,C,E,D=[])=>{let x=0;for(const T of C)d.includes(T)?x+=6:r.includes(T)&&(x+=3);for(const T of E)d.includes(T)?x+=3.5:r.includes(T)&&(x+=1.5);for(const T of D)s.includes(T)&&(x+=2.5);m[g]!==void 0&&(m[g]+=x)};p("Class Rescheduling",["reschedule","rescheduled","class cancelled","class canceled","lecture cancelled","no class today","no class","extra class","room change","venue change","timing change","rescheduled lecture","swapped class"],["cancelled","canceled","postpone","postponed","lecture timing","timing","schedule change"],["acad","timetable"]),p("Competitions & Tournaments",["competition","tournament","hackathon","sociothon","ideathon","devfolio","open trials","inter-iit","inter iit","inter-hostel","inter-college","championship","prize pool","cash prize","case competition","quiz competition","coding contest","athletics"],["contest","trials","sports","cricket","football","badminton","volleyball","table tennis","chess","squash","esports","case comp","challenge","mushaira","trophy"],["sports","gymkhana","cultural","council","club"]),p("Workshops",["workshop","bootcamp","masterclass","hands-on session","distinguished lecture","guest lecture","orientation talk","intro talk","intro talks","introductory talk","conclave","symposium","info session","tech talk"],["webinar","seminar","talk by","opening talk","hands-on","enactus","sdslabs","pragati","hr conclave","panel discussion"],["seminar","chapter","society","ieee","acm"]),p("Academics",["syllabus","midterm","endterm","quiz","exam","examination","lab manual","grading","grade submission","project evaluation","teaching day"],["classroom","lecture","office hours","ug-i","ug-ii","pg-i","coursework","grades"],["acad","instructor"]),p("Assignment",["assignment","assignments","tutorial","tutorials","homework","problem set","problem sets","pset","psets","lab submission","lab assignment","assignment submission","tutorial sheet","tutorial problem","tutorial problems","programming assignment"],["submission","submissions","due date","submit by","solution sheet","turnin"],[]),m.Assignment>0&&o&&(m.Assignment+=5),S&&S.length>0&&S.forEach(g=>{g.name.toLowerCase()==="assignment"||g.keywords&&g.keywords.length>0&&p(g.name,g.keywords,[g.name.toLowerCase()],[])});const b=G&&G.length>0?[...G]:_&&_.length>0?[..._]:["Assignment","Academics","Competitions & Tournaments","Class Rescheduling"],y=b.indexOf("Academics");y!==-1&&b.indexOf("Assignment")===-1&&b.splice(y,0,"Assignment");const v={},k=Object.keys(m);k.forEach(g=>{const C=m[g];if(C<=0){v[g]=0;return}const E=b.indexOf(g);if(E!==-1){const D=Math.max(2.5,12-E*3.5),x=Math.max(4,30-E*8);v[g]=C*D+x}else v[g]=C});const u=k.some(g=>g!=="General"&&m[g]>0);let h="General",w=0;return u||o?k.forEach(g=>{v[g]>w&&(w=v[g],h=g)}):h="General",{category:h,courseCode:o,isPhd:!1}}document.addEventListener("click",t=>{const e=t.target;if(!e)return;e.closest("tr.zA")&&(setTimeout(()=>{M({type:"EMAIL_CHANGED"}),z()},350),setTimeout(()=>{M({type:"EMAIL_CHANGED"}),z()},800)),e.closest('.ar5, .amD, [aria-label*="Older" i], [aria-label*="Newer" i], [aria-label*="Next" i], [aria-label*="Previous" i], [data-tooltip*="Older" i], [data-tooltip*="Newer" i], [data-tooltip*="Previous" i], [data-tooltip*="Next" i]')&&(setTimeout(A,100),setTimeout(A,300),setTimeout(A,700),setTimeout(A,1200))},!0);function A(){const t=document.querySelectorAll("tr.zA"),e=[];return t.forEach((n,i)=>{var h,w,g,C;const d=n,s=d.querySelector(".bqe, .bog, span[data-thread-id]"),r=((h=s==null?void 0:s.textContent)==null?void 0:h.trim())||"(No Subject)",a=d.querySelector(".bA4 span, .yP, .zF"),l=((w=a==null?void 0:a.textContent)==null?void 0:w.trim())||"Unknown",o=d.querySelector(".y2"),f=((g=o==null?void 0:o.textContent)==null?void 0:g.trim())||"",c=d.querySelector(".xW span"),m=((C=c==null?void 0:c.textContent)==null?void 0:C.trim())||"Recent",p=!d.classList.contains("zE"),b=`${r}::${l}`.trim(),{category:y,courseCode:v,isPhd:k}=ie(r,l,f,b),u={id:`row-${i}-${r.slice(0,15).replace(/[^a-zA-Z0-9]/g,"_")}`,index:i,subject:r,sender:l,snippet:f,date:m,category:y,courseCode:v,isRead:p};e.push(u),pe(d,y,v,k,r,l)}),H=e,$==="blended"&&e.length>0&&le(e),P!=="ALL"&&B(P),e}function pe(t,e,n,i,d,s){const r=t.querySelector(".acadmail-row-badge");r&&r.remove();const a=t.querySelector(".y6, .bog");if(!a)return;const l=I(),o=document.createElement("span");o.className="acadmail-row-badge";let f=l?"background: rgba(56, 139, 253, 0.15); color: #79c0ff; border: 1px solid rgba(56, 139, 253, 0.3);":"background: #edf5fd; color: #1a73e8; border: 1px solid #d2e3fc;",c=n||"Acads";e==="Assignment"?(f=l?"background: rgba(11, 87, 208, 0.2); color: #a8c7fa; border: 1px solid rgba(11, 87, 208, 0.35);":"background: #e8f0fe; color: #0b57d0; border: 1px solid #c2e7ff;",c=n?`${n} • Assign`:"Assignment"):e==="Competitions & Tournaments"?(f=l?"background: rgba(210, 153, 34, 0.15); color: #e3b341; border: 1px solid rgba(210, 153, 34, 0.3);":"background: #fef7e0; color: #b06000; border: 1px solid #fce8b2;",c="Contest"):e==="Workshops"?(f=l?"background: rgba(46, 160, 67, 0.15); color: #7ee787; border: 1px solid rgba(46, 160, 67, 0.3);":"background: #e6f4ea; color: #137333; border: 1px solid #ceead6;",c="Workshop"):e==="Class Rescheduling"?(f=l?"background: rgba(248, 81, 73, 0.15); color: #ff7b72; border: 1px solid rgba(248, 81, 73, 0.3);":"background: #fce8e6; color: #c5221f; border: 1px solid #fad2cf;",c="Rescheduled"):i?(f=l?"background: rgba(142, 145, 143, 0.15); color: #c4c7c5; border: 1px solid rgba(142, 145, 143, 0.3);":"background: #f1f3f4; color: #5f6368; border: 1px solid #dadce0;",c="PhD / Viva"):e==="General"?(f=l?"background: rgba(142, 145, 143, 0.12); color: #c4c7c5; border: 1px solid rgba(142, 145, 143, 0.2);":"background: #f8f9fa; color: #5f6368; border: 1px solid #dadce0;",c="General"):(f=l?"background: rgba(168, 85, 247, 0.15); color: #c084fc; border: 1px solid rgba(168, 85, 247, 0.3);":"background: #f3e8ff; color: #7e22ce; border: 1px solid #e9d5ff;",c=e),o.setAttribute("style",`
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
    ${f}
  `),o.setAttribute("data-category",e),t.setAttribute("data-acadmail-category",e),t.setAttribute("data-acadmail-scanned","true"),o.innerText=c,o.title=n?`Filter Gmail for ${n} (Right-click to change label)`:`Category: ${e} (Click to change)`,o.onclick=m=>{m.stopPropagation(),n?ue(n):U(o,d,s,e)},o.oncontextmenu=m=>{m.preventDefault(),m.stopPropagation(),U(o,d,s,e)},a.prepend(o)}function ue(t){const e=document.querySelector('input[name="q"], input[aria-label*="Search"]');if(e){e.value=t,e.dispatchEvent(new Event("input",{bubbles:!0}));const n=e.closest("form");n?n.dispatchEvent(new Event("submit",{bubbles:!0,cancelable:!0})):e.dispatchEvent(new KeyboardEvent("keydown",{key:"Enter",keyCode:13,bubbles:!0}))}}function B(t){P=t,document.querySelectorAll("tr.zA").forEach(n=>{const i=n;if(t==="ALL"){i.style.display="";return}const d=i.getAttribute("data-acadmail-category"),s=i.querySelector(".acadmail-row-badge"),r=s==null?void 0:s.getAttribute("data-category"),a=(s==null?void 0:s.textContent)||"";let l=!1;(d===t||r===t||t==="Academics"&&(a.includes("🎓")||a.includes("Acads"))||t==="Assignment"&&a.toLowerCase().includes("assign")||t==="Competitions & Tournaments"&&(a.includes("🏆")||a.includes("Contest"))||t==="Workshops"&&(a.includes("🛠️")||a.includes("Workshop"))||t==="Class Rescheduling"&&(a.includes("⏰")||a.includes("Rescheduled"))||t==="General"&&(a.includes("📢")||a.includes("General")||a.includes("PhD"))||a.toLowerCase().includes(t.toLowerCase()))&&(l=!0),l?i.style.display="":i.style.display="none"}),fe()}function ae(t,e,n){const i="https://calendar.google.com/calendar/render?action=TEMPLATE";let d="";if(n){const r=new Date(n);if(!isNaN(r.getTime())){const a=r.toISOString().replace(/-|:|\.\d\d\d/g,""),o=new Date(r.getTime()+3600*1e3).toISOString().replace(/-|:|\.\d\d\d/g,"");d=`&dates=${a}/${o}`}}const s=new URLSearchParams({text:`[AcadMail] ${t}`,details:`${e}

— Auto-extracted by AcadMail AI`});return`${i}&${s.toString()}${d}`}function se(t){const e=document.getElementById("acadmail-toast");e&&e.remove();const n=document.createElement("div");n.id="acadmail-toast",n.innerText=t,n.setAttribute("style",`
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
  `),document.body.appendChild(n),setTimeout(()=>n.remove(),2500)}function re(){const t=document.querySelector('div[gh="tm"]');if(t&&(t.offsetParent!==null||t.offsetHeight>0))return t;const e=document.querySelectorAll("div.G-atb");for(let d=0;d<e.length;d++){const s=e[d];if(s.offsetParent!==null&&!s.classList.contains("G-atb-b")){const r=s.getBoundingClientRect();if(r.top>=0&&r.top<window.innerHeight*.45)return s}}const n=document.querySelector('div[gh="tl"]');if(n&&n.parentElement)return n.previousElementSibling?n.previousElementSibling:n.parentElement;const i=document.querySelector("div.aeF");return i&&(i.offsetParent!==null||i.offsetHeight>0)?i:t||(e.length>0?e[0]:null)}function X(t,e){const n=e.parentElement;n&&(e.nextSibling?e.nextSibling!==t&&n.insertBefore(t,e.nextSibling):(t.parentElement!==n||n.lastElementChild!==t)&&n.appendChild(t))}function le(t){if($!=="blended")return;const e=re();if(!e)return;if(!document.getElementById("acadmail-m3-css")){const u=document.createElement("style");u.id="acadmail-m3-css",u.textContent=`
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
    `,document.head.appendChild(u)}let n=0,i=0,d=0,s=0,r=0;const a=/\b(?:due|deadline|by|on|date:|till)\s+([A-Za-z]{3,9}\s+\d{1,2}(?:st|nd|rd|th)?(?:\s*,\s*\d{4})?|\d{1,2}\/\d{1,2}(?:\/\d{2,4})?|\d{1,2}\s+[A-Za-z]{3,9})\b/gi,l=[];t.forEach(u=>{u.category==="Academics"?n++:u.category==="Competitions & Tournaments"?i++:u.category==="Workshops"?d++:u.category==="Class Rescheduling"?s++:u.category==="General"&&r++;const w=[...`${u.subject} ${u.snippet}`.matchAll(a)];w.length>0&&l.push({title:u.subject,deadline:w[0][1]})});const o=I(),f=`
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 10px;
    padding: 6px 16px;
    min-height: 44px;
    box-sizing: border-box;
    background: ${o?"#141517":"#ffffff"};
    border-bottom: 1px solid ${o?"rgba(255,255,255,0.08)":"#e0e2ec"};
    font-family: Roboto, "Google Sans", "Google Sans Text", -apple-system, sans-serif;
    font-size: 12px;
    z-index: 10;
  `;let c=document.getElementById("acadmail-native-chip-bar");!c||!document.body.contains(c)?(c&&c.parentElement&&c.remove(),c=document.createElement("div"),c.id="acadmail-native-chip-bar",c.setAttribute("style",f),X(c,e)):(c.setAttribute("style",f),X(c,e));const m=u=>P===u?`
        background: ${o?"#004a77":"#c2e7ff"};
        color: ${o?"#c2e7ff":"#001d35"};
        border: 1px solid ${o?"#005f9e":"#7fcfff"};
        font-weight: 600;
        box-shadow: 0 1px 2px rgba(0,0,0,0.05);
      `:`
      background: ${o?"rgba(255,255,255,0.04)":"#f8fafd"};
      color: ${o?"#e3e3e3":"#3c4043"};
      border: 1px solid ${o?"rgba(255,255,255,0.12)":"#dadce0"};
      font-weight: 500;
    `,p=(u,h)=>`<span class="m3-chip-count" style="background: ${P===u?o?"rgba(194, 231, 255, 0.22)":"rgba(0, 29, 53, 0.12)":o?"rgba(255, 255, 255, 0.1)":"rgba(0, 0, 0, 0.06)"}; color: inherit;">${h}</span>`;c.innerHTML=`
    <!-- Left: Slim Google Material 3 Chips (Defaults + Dynamic Custom Filters) -->
    <div id="acadmail-chip-scroll-track" style="display: flex; align-items: center; gap: 8px; overflow-x: auto; scrollbar-width: none; -ms-overflow-style: none; flex: 1; min-width: 0; padding: 2px 0;">
      
      <!-- Brand Pill -->
      <div style="display: inline-flex; align-items: center; gap: 6px; height: 32px; box-sizing: border-box; padding: 0 10px; border-radius: 6px; background: ${o?"rgba(56, 139, 253, 0.12)":"rgba(26, 115, 232, 0.08)"}; color: ${o?"#79c0ff":"#1a73e8"}; flex-shrink: 0; white-space: nowrap; margin-right: 4px; border: 1px solid ${o?"rgba(56, 139, 253, 0.25)":"rgba(26, 115, 232, 0.2)"};">
        <img src="${chrome.runtime.getURL("icons/envelope-logo.png")}" alt="AcadMail" style="width: 17px; height: 17px; border-radius: 3px; object-fit: contain;" />
        <span style="font-family: 'Batangas', Roboto, sans-serif; font-weight: 700; font-size: 13px; letter-spacing: 0.2px;">AcadMail</span>
      </div>

      <!-- 1. All Emails -->
      <button class="m3-chip" data-cat="ALL" style="${m("ALL")}">
        <span>All</span>
        ${p("ALL",t.length)}
      </button>

      <!-- 2. Academics -->
      <button class="m3-chip" data-cat="Academics" style="${m("Academics")}">
        <span>Academics</span>
        ${p("Academics",n)}
      </button>

      <!-- 3. Competitions -->
      <button class="m3-chip" data-cat="Competitions & Tournaments" style="${m("Competitions & Tournaments")}">
        <span>Contests</span>
        ${p("Competitions & Tournaments",i)}
      </button>

      <!-- 4. Workshops -->
      <button class="m3-chip" data-cat="Workshops" style="${m("Workshops")}">
        <span>Workshops</span>
        ${p("Workshops",d)}
      </button>

      <!-- 5. Reschedules -->
      <button class="m3-chip" data-cat="Class Rescheduling" style="${m("Class Rescheduling")}">
        <span>Rescheduled</span>
        ${p("Class Rescheduling",s)}
      </button>

      <!-- 6. General -->
      <button class="m3-chip" data-cat="General" style="${m("General")}">
        <span>General & PhD</span>
        ${p("General",r)}
      </button>

      <!-- 7. Dynamic User-Defined Custom Filters -->
      ${S.map(u=>{const h=t.filter(w=>w.category===u.name).length;return`
          <button class="m3-chip" data-cat="${u.name}" style="${m(u.name)}">
            <span>${u.name}</span>
            ${p(u.name,h)}
          </button>
        `}).join("")}

      <!-- 8. Add Custom Filter Button -->
      <button id="m3-add-filter-chip" title="Create your own custom academic filter" style="height: 32px; padding: 0 10px; border-radius: 6px; border: 1px dashed ${o?"rgba(255,255,255,0.25)":"#94a3b8"}; background: transparent; color: ${o?"#79c0ff":"#1a73e8"}; font-size: 12px; font-weight: 500; font-family: Roboto, 'Google Sans', sans-serif; cursor: pointer; display: inline-flex; align-items: center; gap: 4px; flex-shrink: 0; white-space: nowrap; transition: all 0.15s ease;">
        <span style="font-size: 14px; font-weight: 600; line-height: 1;">+</span>
        <span>Filter</span>
      </button>
    </div>

    <!-- Right: Mini Deadlines Dropdown & Instant Hide Button -->
    <div style="display: flex; align-items: center; gap: 8px; flex-shrink: 0;">
      ${l.length>0?`
        <div style="position: relative; flex-shrink: 0;">
          <button id="m3-deadlines-btn" style="height: 32px; padding: 0 10px; border-radius: 6px; border: 1px solid ${o?"rgba(210,153,34,0.4)":"#fde68a"}; background: ${o?"rgba(210,153,34,0.15)":"#fffbeb"}; color: ${o?"#e3b341":"#b45309"}; font-size: 12px; font-weight: 600; font-family: Roboto, 'Google Sans', sans-serif; cursor: pointer; display: inline-flex; align-items: center; gap: 5px; white-space: nowrap;">
            <span style="font-weight: 700; font-family: Roboto, 'Google Sans', sans-serif; font-size: 11px;">DUE</span>
            <span>${l.length}</span>
          </button>

          <div id="m3-deadlines-popover" style="display: none; position: absolute; right: 0; top: 38px; width: 310px; background: ${o?"#1e1f20":"#ffffff"}; border: 1px solid ${o?"#3c4043":"#e0e2ec"}; border-radius: 8px; box-shadow: 0 10px 28px rgba(0,0,0,0.2); padding: 12px; z-index: 99999; font-family: Roboto, 'Google Sans', sans-serif;">
            <div style="font-weight: 600; color: ${o?"#e3e3e3":"#1f1f1f"}; font-size: 11.5px; margin-bottom: 8px; display: flex; justify-content: space-between; align-items: center;">
              <span>Detected Due Dates</span>
              <span style="font-size: 10px; color: #1a73e8; font-weight: 600;">+ Google Calendar</span>
            </div>
            <div style="max-height: 220px; overflow-y: auto; display: flex; flex-direction: column; gap: 6px;">
              ${l.map(u=>`
                <div style="padding: 8px 10px; background: ${o?"#2b2c2f":"#f8fafd"}; border-radius: 6px; display: flex; align-items: center; justify-content: space-between; gap: 8px;">
                  <div style="overflow: hidden; flex: 1;">
                    <div style="font-size: 11.5px; font-weight: 500; color: ${o?"#e3e3e3":"#1f1f1f"}; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${u.title}</div>
                    <div style="font-size: 10.5px; color: ${o?"#e3b341":"#b45309"}; font-weight: 600; margin-top: 2px;">⏰ ${u.deadline}</div>
                  </div>
                  <a href="${ae(u.title,"Course deadline from email",u.deadline)}" target="_blank" style="text-decoration: none; flex-shrink: 0; padding: 3px 8px; background: ${o?"#004a77":"#c2e7ff"}; color: ${o?"#c2e7ff":"#001d35"}; border-radius: 4px; font-size: 10.5px; font-weight: 600;">+ GCal</a>
                </div>
              `).join("")}
            </div>
          </div>
        </div>
      `:""}

      <button id="acadmail-instant-revert-btn" title="Hide AcadMail toolbar" style="height: 32px; padding: 0 10px; border-radius: 6px; border: 1px solid transparent; background: transparent; color: ${o?"#8e918f":"#64748b"}; font-size: 12px; font-family: Roboto, 'Google Sans', sans-serif; cursor: pointer; display: inline-flex; align-items: center; gap: 4px; flex-shrink: 0; white-space: nowrap; transition: color 0.15s ease;">
        <span style="font-size: 13px; line-height: 1;">✕</span>
        <span>Hide</span>
      </button>
    </div>
  `,c.querySelectorAll(".m3-chip").forEach(u=>{const h=u;h.onclick=()=>{const w=h.getAttribute("data-cat");B(P===w&&w!=="ALL"?"ALL":w)}});const b=c.querySelector("#m3-add-filter-chip");b&&(b.onclick=()=>me());const y=c.querySelector("#m3-deadlines-btn"),v=c.querySelector("#m3-deadlines-popover");y&&v&&(y.onclick=u=>{u.stopPropagation(),v.style.display=v.style.display==="block"?"none":"block"},document.addEventListener("click",u=>{!v.contains(u.target)&&u.target!==y&&(v.style.display="none")}));const k=c.querySelector("#acadmail-instant-revert-btn");k&&(k.onclick=()=>{var u;$="off",typeof chrome<"u"&&((u=chrome.storage)!=null&&u.local)&&chrome.storage.local.get(["acadmail_settings"],h=>{const w=h.acadmail_settings||{};chrome.storage.local.set({acadmail_settings:{...w,uiMode:"off",inPageIntegration:!1}})}),J()})}function me(){const t=document.getElementById("acadmail-add-filter-modal");if(t){t.remove();return}const e=I(),n=document.createElement("div");n.id="acadmail-add-filter-modal",n.setAttribute("style",`
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
  `),n.innerHTML=`
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
  `,document.body.appendChild(n);const i=n.querySelector("#modal-close-btn"),d=n.querySelector("#modal-cancel-btn"),s=n.querySelector("#modal-save-btn"),r=n.querySelector("#new-filter-name"),a=n.querySelector("#new-filter-keywords");i.onclick=()=>n.remove(),d.onclick=()=>n.remove(),s.onclick=()=>{const l=r.value.trim(),o=a.value.trim();l&&(de(l,o),n.remove())}}function U(t,e,n,i){const d=document.getElementById("acadmail-relabel-popup");if(d){d.remove();return}const s=I(),r=t.getBoundingClientRect(),a=document.createElement("div");a.id="acadmail-relabel-popup",a.setAttribute("style",`
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
  `);const l=["Academics","Competitions & Tournaments","Workshops","Class Rescheduling","General"],o=[...l,...S.map(c=>c.name).filter(c=>!l.includes(c))];a.innerHTML=`
    <div style="padding: 4px 8px; font-size: 10px; font-weight: 700; color: ${s?"#8e918f":"#64748b"}; text-transform: uppercase; border-bottom: 1px solid ${s?"#333537":"#f1f5f9"};">
      Change Category Label
    </div>
    <div style="display: flex; flex-direction: column; gap: 2px; padding-top: 4px; max-height: 200px; overflow-y: auto;">
      ${o.map(c=>`
        <button class="relabel-opt" data-cat="${c}" style="text-align: left; padding: 6px 8px; border-radius: 6px; border: none; background: ${c===i?s?"#004a77":"#c2e7ff":"transparent"}; color: ${c===i?s?"#c2e7ff":"#001d35":s?"#e3e3e3":"#1f1f1f"}; font-size: 11.5px; font-weight: ${c===i?"600":"400"}; cursor: pointer; display: flex; align-items: center; justify-content: space-between;">
          <span>${c}</span>
          ${c===i?"<span>✓</span>":""}
        </button>
      `).join("")}
    </div>
  `,document.body.appendChild(a),a.querySelectorAll(".relabel-opt").forEach(c=>{const m=c;m.onclick=p=>{p.stopPropagation();const b=m.getAttribute("data-cat")||"General";oe(e,e,n,b),a.remove()}});const f=c=>{!a.contains(c.target)&&!t.contains(c.target)&&(a.remove(),document.removeEventListener("click",f))};setTimeout(()=>document.addEventListener("click",f),50)}function fe(){$==="blended"&&H.length>0&&le(H)}function z(){var g,C,E,D;if($==="off")return;const t=ce();if(!t){(g=document.getElementById("acadmail-email-brief-card"))==null||g.remove();return}const e=document.querySelector("div.ha")||((C=document.querySelector("h2.hP"))==null?void 0:C.parentElement)||((E=document.querySelector('div[role="main"] h2'))==null?void 0:E.parentElement);if(!e)return;const n=document.getElementById("acadmail-email-brief-card"),i=n==null?void 0:n.getAttribute("data-email-id");if(n&&i===t.id)return;n&&n.remove();const d=ie(t.subject,t.senderName,t.bodyText,t.id),s=`${t.subject} ${t.bodyText}`,r=/\b(?:due|deadline|by|on|date:|till)\s+([A-Za-z]{3,9}\s+\d{1,2}(?:st|nd|rd|th)?(?:\s*,\s*\d{4})?|\d{1,2}\/\d{1,2}(?:\/\d{2,4})?|\d{1,2}\s+[A-Za-z]{3,9})\b/i,a=s.match(r),l=a?a[1]:null,o=s.match(/https?:\/\/(?:[a-zA-Z0-9-]+\.)?(?:zoom\.us\/j|meet\.google\.com|teams\.microsoft\.com\/l)\/[^\s<>"']+/i),f=o?o[0]:null,m=t.bodyText.split(/\.\s+/).map(x=>x.trim()).filter(x=>x.length>25&&!x.includes("http")&&!x.includes("unsubscribe")&&!x.includes("Regards")).slice(0,3);m.length===0&&m.push(`Announcement regarding ${t.subject} from ${t.senderName}.`);const p=I(),b=document.createElement("div");b.id="acadmail-email-brief-card",b.setAttribute("data-email-id",t.id),b.setAttribute("style",`
    margin: 4px 0 10px 0;
    padding: 6px 12px;
    background: ${p?"#1e1f20":"#f8fafd"};
    border: 1px solid ${p?"#333537":"#e0e7ff"};
    border-radius: 8px;
    font-family: -apple-system, BlinkMacSystemFont, "Google Sans", Roboto, sans-serif;
    font-size: 12px;
    color: ${p?"#e3e3e3":"#1f1f1f"};
    transition: all 0.2s ease;
  `),b.innerHTML=`
    <!-- Top 1-Line Compact Summary Bar -->
    <div style="display: flex; align-items: center; justify-content: space-between; gap: 8px;">
      <div id="m3-brief-toggle-line" style="display: flex; align-items: center; gap: 6px; cursor: pointer; flex: 1; overflow: hidden;">
        <img src="${chrome.runtime.getURL("icons/envelope-logo.png")}" alt="AcadMail" style="width: 14px; height: 14px; border-radius: 2.5px; object-fit: contain; flex-shrink: 0;" />
        <span style="font-family: 'Batangas', Roboto, sans-serif; font-weight: 700; font-size: 12px; color: ${p?"#79c0ff":"#1a73e8"}; shrink: 0;">AcadMail:</span>
        <span style="font-size: 11.5px; color: ${p?"#c4c7c5":"#475569"}; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
          ${l?`⏰ Due: <strong>${l}</strong> • `:""}${m[0]}
        </span>
      </div>

      <div style="display: flex; align-items: center; gap: 5px; shrink: 0;">
        <!-- Category Chip with Re-label button -->
        <span style="padding: 1px 7px; border-radius: 4px; font-size: 10px; font-weight: 600; background: ${p?"rgba(56, 139, 253, 0.2)":"#e8f0fe"}; color: ${p?"#79c0ff":"#1a73e8"};">
          ${d.category}
        </span>

        <button id="acadmail-brief-relabel-btn" title="Change this email's category label" style="cursor: pointer; padding: 2px 5px; border-radius: 4px; border: 1px dashed ${p?"#444746":"#cbd5e1"}; background: transparent; font-size: 10px; font-weight: 500; color: ${p?"#a8c7fa":"#1a73e8"};">
          ✎ Relabel
        </button>

        ${l?`
          <a href="${ae(t.subject,t.bodyText.slice(0,300),l)}" target="_blank" style="text-decoration: none; padding: 2px 7px; background: ${p?"#004a77":"#c2e7ff"}; color: ${p?"#c2e7ff":"#001d35"}; border-radius: 6px; font-size: 10px; font-weight: 600;">+ GCal</a>
        `:""}
        <button id="m3-brief-expand-btn" style="cursor: pointer; padding: 2px 6px; border-radius: 4px; border: 1px solid ${p?"#444746":"#d2e3fc"}; background: transparent; font-size: 10px; font-weight: 600; color: ${p?"#79c0ff":"#1a73e8"};">
          ${R?"Collapse ▴":"Details ▾"}
        </button>
        <button id="m3-brief-dismiss-btn" title="Dismiss card" style="cursor: pointer; padding: 2px 4px; border: none; background: transparent; color: #94a3b8; font-size: 11px;">✕</button>
      </div>
    </div>

    <!-- Expandable Drawer Details -->
    <div id="m3-brief-drawer" style="display: ${R?"flex":"none"}; flex-direction: column; gap: 8px; margin-top: 8px; padding-top: 8px; border-top: 1px dashed ${p?"#333537":"#e0e2ec"};">
      <ul style="margin: 0; padding-left: 16px; display: flex; flex-direction: column; gap: 3px; font-size: 11.5px; color: ${p?"#c4c7c5":"#334155"}; line-height: 1.45;">
        ${m.map(x=>`<li>${x}</li>`).join("")}
      </ul>

      <!-- Action Row: Meeting Links + Quick Reply Chips -->
      <div style="display: flex; flex-wrap: wrap; align-items: center; gap: 6px; padding-top: 2px;">
        ${f?`
          <a href="${f}" target="_blank" style="text-decoration: none; display: inline-flex; align-items: center; gap: 4px; padding: 3px 8px; background: ${p?"#143e2e":"#e6f4ea"}; color: ${p?"#a7f3d0":"#137333"}; border-radius: 6px; font-size: 10.5px; font-weight: 600;">
            <span>🎥</span>
            <span>Join Meeting</span>
          </a>
        `:""}

        <span style="font-size: 10px; font-weight: 600; color: #94a3b8; margin-left: 2px;">Reply draft:</span>

        <button class="m3-quick-reply-btn" data-reply="confirm" style="cursor: pointer; padding: 2px 8px; border-radius: 12px; border: 1px solid ${p?"#444746":"#cbd5e1"}; background: transparent; color: ${p?"#e3e3e3":"#334155"}; font-size: 10.5px; font-weight: 500;">
          Confirm Attendance
        </button>

        <button class="m3-quick-reply-btn" data-reply="extension" style="cursor: pointer; padding: 2px 8px; border-radius: 12px; border: 1px solid ${p?"#444746":"#cbd5e1"}; background: transparent; color: ${p?"#e3e3e3":"#334155"}; font-size: 10.5px; font-weight: 500;">
          Request Extension
        </button>

        <button class="m3-quick-reply-btn" data-reply="doubt" style="cursor: pointer; padding: 2px 8px; border-radius: 12px; border: 1px solid ${p?"#444746":"#cbd5e1"}; background: transparent; color: ${p?"#e3e3e3":"#334155"}; font-size: 10.5px; font-weight: 500;">
          Ask Clarification
        </button>
      </div>
    </div>
  `;const y=b.querySelector("#acadmail-brief-relabel-btn");y&&(y.onclick=x=>{x.stopPropagation(),U(y,t.subject,t.senderName,d.category)});const v=b.querySelector("#m3-brief-drawer"),k=b.querySelector("#m3-brief-expand-btn"),u=b.querySelector("#m3-brief-toggle-line"),h=()=>{R=!R,v.style.display=R?"flex":"none",k.innerText=R?"Collapse ▴":"Details ▾"};k.onclick=h,u.onclick=h;const w=b.querySelector("#m3-brief-dismiss-btn");w&&(w.onclick=()=>b.remove()),b.querySelectorAll(".m3-quick-reply-btn").forEach(x=>{const T=x;T.onclick=async()=>{const V=T.getAttribute("data-reply");let N="";V==="confirm"?N=`Dear ${t.senderName||"Professor"},

Thank you for the update regarding "${t.subject}". I confirm my participation and will ensure all prerequisites are met.

Best regards,
[Your Name]
[Student ID]`:V==="extension"?N=`Dear Professor ${t.senderName||""},

I hope this email finds you well. I am writing to respectfully ask if it might be possible to grant a short extension on the submission for "${t.subject}". I want to ensure my work meets the highest standards.

Thank you for your time and understanding.

Sincerely,
[Your Name]
[Student ID]`:N=`Dear Professor ${t.senderName||""},

I hope you are well. Regarding the announcement on "${t.subject}", I had a quick question regarding the specifications and would appreciate some guidance.

Thank you very much.

Sincerely,
[Your Name]
[Student ID]`,await ge(N,T)}}),(D=e.parentElement)==null||D.insertBefore(b,e.nextSibling)}async function ge(t,e){const n=e.innerText;e.innerText="Drafting...";const i=document.querySelector('div[role="button"][aria-label*="Reply"]')||document.querySelector(".ams.bkH")||document.querySelector('.T-I.J-J5-Ji.T-I-Js-IF[data-tooltip*="Reply"]')||document.querySelector('span[role="button"][aria-label*="Reply"]');i&&i.click();let d=0;const s=setInterval(()=>{d++;const r=document.querySelector('div[aria-label="Message Body"], div[role="textbox"][contenteditable="true"]');r?(clearInterval(s),r.focus(),r.innerText=t,r.dispatchEvent(new Event("input",{bubbles:!0})),r.scrollIntoView({behavior:"smooth",block:"center"}),e.innerText="✅ Drafted!",setTimeout(()=>{e.innerText=n},2500)):d>15&&(clearInterval(s),e.innerText="⚠️ Click Reply first",setTimeout(()=>{e.innerText=n},2e3))},200)}function F(){if($==="off"||document.getElementById("acadmail-siderail-btn"))return;const t=document.querySelector("div.aDG")||document.querySelector('div[aria-label="Side panel"]')||document.querySelector("div.bq9");if(!t)return;const e=document.createElement("div");e.id="acadmail-siderail-btn",e.title="AcadMail AI Copilot",e.setAttribute("role","button"),e.setAttribute("tabindex","0");const n=I();e.setAttribute("style",`
    width: 36px;
    height: 36px;
    margin: 6px auto;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    background: transparent;
    color: ${n?"#79c0ff":"#1a73e8"};
    transition: background 0.15s;
  `),e.innerHTML=`
    <img src="${chrome.runtime.getURL("icons/envelope-logo.png")}" alt="AcadMail" style="width: 22px; height: 22px; border-radius: 4px; object-fit: contain;" />
  `,e.onmouseenter=()=>e.style.background=n?"rgba(255,255,255,0.08)":"rgba(0,0,0,0.06)",e.onmouseleave=()=>e.style.background="transparent",e.onclick=()=>M({type:"OPEN_SIDEPANEL"}),t.prepend(e)}function ce(){var d,s,r,a,l;const t=document.querySelector("h2.hP")||document.querySelector("div.ha h2")||document.querySelector('div[role="main"] h2')||document.querySelector("h2[data-legacy-thread-id]")||document.querySelector("h1[data-thread-perm-id]"),e=((d=t==null?void 0:t.textContent)==null?void 0:d.trim())||"",n=document.querySelectorAll('.a3s.aiL, div[role="listitem"] .adn .a3s, .ii.gt, div.adn.ads');let i="";if(n.length>0&&(i=((s=n[n.length-1].textContent)==null?void 0:s.trim())||""),e&&(i||n.length>0)){const o=document.querySelector("span[email]")||document.querySelector(".gD")||document.querySelector(".go")||document.querySelector("span.zF"),f=(o==null?void 0:o.getAttribute("email"))||((r=o==null?void 0:o.textContent)==null?void 0:r.trim())||"academic@university.edu",c=(o==null?void 0:o.getAttribute("name"))||((a=o==null?void 0:o.textContent)==null?void 0:a.trim())||"Academic Sender",m=document.querySelector(".g3")||document.querySelector("span.mI")||document.querySelector(".date"),p=(m==null?void 0:m.getAttribute("title"))||((l=m==null?void 0:m.textContent)==null?void 0:l.trim())||new Date().toLocaleString();return{id:(window.location.hash||"").replace(/[^a-zA-Z0-9_-]/g,"_")||`email-${Date.now()}`,subject:e,senderName:c,senderEmail:f,recipient:"Me",dateStr:p,bodyText:i.slice(0,5e3),url:window.location.href}}return null}function W(){document.querySelectorAll("tr.btC, .gU.Up").forEach(e=>{if(e.querySelector(".acadmail-polish-btn"))return;const n=document.createElement("div");n.className="acadmail-polish-btn",n.setAttribute("style",`
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
    `),n.innerHTML=`
      <span style="font-size: 11px;">✨</span>
      <span>Polish</span>
    `,n.onclick=i=>{i.stopPropagation(),be(e,n)},e.appendChild(n)})}function be(t,e){var l;const n=document.getElementById("acadmail-tone-menu");if(n){n.remove();return}const i=t.closest('div[role="dialog"]')||t.closest(".M9"),d=i==null?void 0:i.querySelector('div[aria-label="Message Body"], div[contenteditable="true"]'),s=((l=d==null?void 0:d.innerText)==null?void 0:l.trim())||"",r=document.createElement("div");r.id="acadmail-tone-menu",r.setAttribute("style",`
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
  `,r.querySelectorAll(".acad-tone-opt").forEach(o=>{const f=o;f.onclick=async()=>{const c=f.getAttribute("data-tone")||"formal";r.remove(),await he(d,s,c,e)}}),e.appendChild(r);const a=o=>{!r.contains(o.target)&&!e.contains(o.target)&&(r.remove(),document.removeEventListener("click",a))};setTimeout(()=>document.addEventListener("click",a),100)}async function he(t,e,n,i){if(!t)return;const d=i.innerHTML;i.innerHTML="<span>Polishing...</span>";try{const s=await new Promise(f=>{var c;typeof chrome<"u"&&((c=chrome.storage)!=null&&c.local)?chrome.storage.local.get(["acadmail_settings"],m=>f(m.acadmail_settings||{})):f({})}),r=s.apiKey||"",a=s.groqApiKey||"",o=await xe(e||"Need extension for lab assignment due this friday because of fever.",n,r,a);t.focus(),t.innerText=o,t.dispatchEvent(new Event("input",{bubbles:!0})),i.innerHTML="<span>Polished!</span>",setTimeout(()=>{i.innerHTML=d},2e3)}catch{i.innerHTML="<span>Error</span>",setTimeout(()=>{i.innerHTML=d},2e3)}}async function xe(t,e,n,i){var r,a,l,o,f,c,m,p,b;const s=`Transform this student's rough notes into a courteous, polished academic email to a professor.
Tone: ${{formal:"Polite, professional academic tone to a professor.",extension:"Polite, respectful request for an assignment deadline extension showing dedication.",doubt:"Polite conceptual question or office hours request referencing lecture material.",lor:"Courteous inquiry requesting a Letter of Recommendation for graduate studies/internships."}[e]||"Formal"}
Guidelines:
- Include respectful salutation ("Dear Professor [Name],", "I hope this email finds you well.")
- Keep it concise, courteous, and respectful.
- Retain all dates, assignment titles, or reasons mentioned.
- Conclude with a warm academic sign-off ("Sincerely,", "Best regards," followed by "[Your Name] [Student ID]").
- Output ONLY the final email text.

Student's notes:
${t}`;if(i&&i.trim())try{const y=await fetch("https://api.groq.com/openai/v1/chat/completions",{method:"POST",headers:{Authorization:`Bearer ${i.trim()}`,"Content-Type":"application/json"},body:JSON.stringify({model:"llama-3.3-70b-versatile",messages:[{role:"user",content:s}],temperature:.3})});if(y.ok)return((o=(l=(a=(r=(await y.json()).choices)==null?void 0:r[0])==null?void 0:a.message)==null?void 0:l.content)==null?void 0:o.trim())||t}catch{}if(n&&n.trim()){const y=["models/gemini-2.0-flash","models/gemini-3.8-flash","models/gemini-1.5-flash"];for(const v of y)try{const k=await fetch(`https://generativelanguage.googleapis.com/v1beta/${v}:generateContent?key=${n.trim()}`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({contents:[{parts:[{text:s}]}],generationConfig:{temperature:.3}})});if(k.ok){const u=await k.json(),h=(b=(p=(m=(c=(f=u==null?void 0:u.candidates)==null?void 0:f[0])==null?void 0:c.content)==null?void 0:m.parts)==null?void 0:p[0])==null?void 0:b.text;if(h)return h.trim()}}catch{}}return`Dear Professor,

I hope this email finds you well.

I am writing to respectfully request your guidance regarding ${t}.

Thank you for your time and consideration.

Sincerely,
[Your Name]
[Student ID]`}var te;typeof chrome<"u"&&((te=chrome.runtime)!=null&&te.onMessage)&&chrome.runtime.onMessage.addListener((t,e,n)=>{if(t.type==="GET_ACTIVE_EMAIL"){const i=ce();n({email:i})}else if(t.type==="SCAN_INBOX"){const i=A();n({items:i})}else t.type==="FILTER_GMAIL_DOM"?(B(t.category),n({success:!0})):t.type==="SET_UI_MODE"?($=t.mode,J(),n({success:!0})):t.type==="RELABEL_EMAIL"?(oe(t.emailId,t.subject||"",t.sender||"",t.newCategory),n({success:!0})):(t.type==="UPDATE_CUSTOM_FILTERS"||t.type==="UPDATE_SETTINGS")&&(Array.isArray(t.priorityList)&&(G=t.priorityList,_=t.priorityList),Z(),setTimeout(A,150),n({success:!0}));return!0});var ne;typeof chrome<"u"&&((ne=chrome.storage)!=null&&ne.onChanged)&&chrome.storage.onChanged.addListener((t,e)=>{e==="local"&&t.acadmail_settings&&(Z(),setTimeout(A,300))});Z();document.readyState==="loading"?document.addEventListener("DOMContentLoaded",()=>{setTimeout(A,1200),setTimeout(z,1200),setTimeout(F,1200),setTimeout(W,1200),setTimeout(j,1200)}):(setTimeout(A,1200),setTimeout(z,1200),setTimeout(F,1200),setTimeout(W,1200),setTimeout(j,1200));function ye(){const t=document.querySelector("span.Dj, .ar5 span");if(t&&t.textContent)return t.textContent.trim();const e=document.querySelector(".ar5");return e&&e.textContent?e.textContent.trim():""}function K(){const t=document.querySelectorAll("tr.zA");if(t.length===0)return!1;for(let e=0;e<t.length;e++)if(!t[e].querySelector(".acadmail-row-badge"))return!0;return!1}function Y(){if($!=="blended"||document.querySelectorAll("tr.zA").length===0)return!1;const e=document.getElementById("acadmail-native-chip-bar");if(!e||!document.body.contains(e))return!0;const n=re();return!!(n&&(e.parentElement!==n.parentElement||n.nextSibling!==e))}let Q=location.href,ee="",O=null;function q(t=120){O&&clearTimeout(O),O=setTimeout(()=>{A(),z(),F()},t)}new MutationObserver(()=>{const t=location.href;t!==Q&&(Q=t,M({type:"EMAIL_CHANGED"}),j(),q(250));const e=ye();e&&e!==ee&&(ee=e,q(100)),(K()||Y())&&q(100),W()}).observe(document,{subtree:!0,childList:!0});window.addEventListener("popstate",()=>{q(200),setTimeout(q,600)});window.addEventListener("hashchange",()=>{q(200),setTimeout(q,600)});document.addEventListener("keydown",t=>{["j","k","n","p","o","u","x"].includes(t.key.toLowerCase())&&setTimeout(()=>{(K()||Y())&&A()},200)});setInterval(()=>{$==="blended"&&document.querySelectorAll("tr.zA").length>0&&(Y()||K())&&A()},1e3);

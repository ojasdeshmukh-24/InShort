console.log("[AcadMail AI] Ultra-Clean Material 3 Gmail Script with Custom Filters & Relabeling active.");let P="ALL",H=[],$="blended",R=!1,S=[{id:"filter-assignment",name:"Assignment",color:"#0b57d0",keywords:["assignment","assignments","tutorial","tutorials","homework","problem set","problem sets","pset","psets","lab submission","lab assignment"]},{id:"filter-placements",name:"Placements & Internships",color:"#8b5cf6",keywords:["placement","tpo","internship","interview","shortlist","offer","ctc","pre-placement"]},{id:"filter-hostel",name:"Hostel & Campus Mess",color:"#06b6d4",keywords:["hostel","mess","warden","room","maintenance","electricity","water","hall of residence"]}],L={},G=["Assignment","Academics","Competitions & Tournaments","Class Rescheduling"],_=["Assignment","Academics","Competitions & Tournaments","Class Rescheduling"];function z(t){var e;try{typeof chrome<"u"&&((e=chrome.runtime)!=null&&e.id)&&chrome.runtime.sendMessage(t).catch(()=>{})}catch{}}function I(){try{const t=window.getComputedStyle(document.body).backgroundColor;if(t){const e=t.match(/\d+/g);if(e&&e.length>=3)return(parseInt(e[0])*299+parseInt(e[1])*587+parseInt(e[2])*114)/1e3<128}}catch{}return window.matchMedia("(prefers-color-scheme: dark)").matches}function N(){var n;const e=I()?"dark":"light";typeof chrome<"u"&&((n=chrome.storage)!=null&&n.local)&&chrome.storage.local.set({acadmail_gmail_theme:e}),z({type:"GMAIL_THEME_DETECTED",theme:e})}function Z(){var t;N(),typeof chrome<"u"&&((t=chrome.storage)!=null&&t.local)&&chrome.storage.local.get(["acadmail_settings"],e=>{e.acadmail_settings&&(e.acadmail_settings.uiMode?$=e.acadmail_settings.uiMode:e.acadmail_settings.inPageIntegration===!1?$="off":$="blended",Array.isArray(e.acadmail_settings.customFilters)&&(S=e.acadmail_settings.customFilters,S.some(i=>i.id==="filter-assignment"||i.name.toLowerCase()==="assignment"||i.name.toLowerCase()==="assignments")||S.unshift({id:"filter-assignment",name:"Assignment",color:"#0b57d0",keywords:["assignment","assignments","tutorial","tutorials","homework","problem set","problem sets","pset","psets","lab submission","lab assignment"]})),e.acadmail_settings.labelOverrides&&(L=e.acadmail_settings.labelOverrides),Array.isArray(e.acadmail_settings.priorityList)?(G=e.acadmail_settings.priorityList,_=e.acadmail_settings.priorityList):Array.isArray(e.acadmail_settings.preferredLabels)&&(G=e.acadmail_settings.preferredLabels,_=e.acadmail_settings.preferredLabels)),J()})}function J(){var t,e,n,i;if((t=document.getElementById("acadmail-native-chip-bar"))==null||t.remove(),(e=document.getElementById("acadmail-inbox-filter-bar"))==null||e.remove(),(n=document.getElementById("acadmail-email-brief-card"))==null||n.remove(),(i=document.getElementById("acadmail-siderail-btn"))==null||i.remove(),$==="off"){B("ALL");return}A(),q(),F()}function oe(t,e,n,i){var r;L[t]=i,e&&(L[e]=i);const s=`${e}::${n}`.trim();s&&(L[s]=i),typeof chrome<"u"&&((r=chrome.storage)!=null&&r.local)&&chrome.storage.local.get(["acadmail_settings"],l=>{const a=l.acadmail_settings||{},c=a.labelOverrides||{};c[t]=i,e&&(c[e]=i),s&&(c[s]=i),chrome.storage.local.set({acadmail_settings:{...a,labelOverrides:c}})}),A(),q(),z({type:"EMAIL_CHANGED"}),se(`Email re-labeled as "${i}"`)}function de(t,e){var s;if(!t.trim())return;const n=e.split(",").map(r=>r.trim().toLowerCase()).filter(Boolean),i={id:`filter-${Date.now()}`,name:t.trim(),color:"#8b5cf6",keywords:n.length>0?n:[t.trim().toLowerCase()]};S.push(i),typeof chrome<"u"&&((s=chrome.storage)!=null&&s.local)&&chrome.storage.local.get(["acadmail_settings"],r=>{const l=r.acadmail_settings||{},a=l.customFilters||[];chrome.storage.local.set({acadmail_settings:{...l,customFilters:[...a,i]}})}),A(),z({type:"UPDATE_CUSTOM_FILTERS"}),se(`Created filter "${i.name}"`)}function ie(t,e,n,i){const s=(t||"").toLowerCase(),r=(e||"").toLowerCase(),l=(n||"").toLowerCase(),a=`${s} ${r} ${l}`,c=t.match(/\b([A-Z]{2,4}\s?[-_]?\s?\d{3,4}[A-Z]?)\b/i),o=c?c[1].toUpperCase():void 0;if(i&&L[i])return{category:L[i],courseCode:o};if(L[t])return{category:L[t],courseCode:o};const m=`${t}::${e}`.trim();if(L[m])return{category:L[m],courseCode:o};if(a.includes("viva")||a.includes("viva-voce")||a.includes("viva voce")||a.includes("oral defense")||a.includes("thesis defense")||a.includes("phd defense")||a.includes("ph.d. defense")||a.includes("synopsis presentation")||a.includes("synopsis submission")||a.includes("ph.d. viva")||a.includes("phd viva")||a.includes("doctoral defense")||a.includes("comprehensive exam presentation"))return{category:"General",courseCode:o,isPhd:!0};const f={"Class Rescheduling":0,"Competitions & Tournaments":0,Workshops:0,Academics:o?5:0,Assignment:0,General:1};S&&S.length>0&&S.forEach(g=>{f[g.name]=0});const p=(g,C,E,D=[])=>{let x=0;for(const T of C)s.includes(T)?x+=6:l.includes(T)&&(x+=3);for(const T of E)s.includes(T)?x+=3.5:l.includes(T)&&(x+=1.5);for(const T of D)r.includes(T)&&(x+=2.5);f[g]!==void 0&&(f[g]+=x)};p("Class Rescheduling",["reschedule","rescheduled","class cancelled","class canceled","lecture cancelled","no class today","no class","extra class","room change","venue change","timing change","rescheduled lecture","swapped class"],["cancelled","canceled","postpone","postponed","lecture timing","timing","schedule change"],["acad","timetable"]),p("Competitions & Tournaments",["competition","tournament","hackathon","sociothon","ideathon","devfolio","open trials","inter-iit","inter iit","inter-hostel","inter-college","championship","prize pool","cash prize","case competition","quiz competition","coding contest","athletics"],["contest","trials","sports","cricket","football","badminton","volleyball","table tennis","chess","squash","esports","case comp","challenge","mushaira","trophy"],["sports","gymkhana","cultural","council","club"]),p("Workshops",["workshop","bootcamp","masterclass","hands-on session","distinguished lecture","guest lecture","orientation talk","intro talk","intro talks","introductory talk","conclave","symposium","info session","tech talk"],["webinar","seminar","talk by","opening talk","hands-on","enactus","sdslabs","pragati","hr conclave","panel discussion"],["seminar","chapter","society","ieee","acm"]),p("Academics",["syllabus","midterm","endterm","quiz","exam","examination","lab manual","grading","grade submission","project evaluation","teaching day"],["classroom","lecture","office hours","ug-i","ug-ii","pg-i","coursework","grades"],["acad","instructor"]),p("Assignment",["assignment","assignments","tutorial","tutorials","homework","problem set","problem sets","pset","psets","lab submission","lab assignment","assignment submission","tutorial sheet","tutorial problem","tutorial problems","programming assignment"],["submission","submissions","due date","submit by","solution sheet","turnin"],[]),f.Assignment>0&&o&&(f.Assignment+=5),S&&S.length>0&&S.forEach(g=>{g.name.toLowerCase()==="assignment"||g.keywords&&g.keywords.length>0&&p(g.name,g.keywords,[g.name.toLowerCase()],[])});const b=G&&G.length>0?[...G]:_&&_.length>0?[..._]:["Assignment","Academics","Competitions & Tournaments","Class Rescheduling"],y=b.indexOf("Academics");y!==-1&&b.indexOf("Assignment")===-1&&b.splice(y,0,"Assignment");const v={},k=Object.keys(f);k.forEach(g=>{const C=f[g];if(C<=0){v[g]=0;return}const E=b.indexOf(g);if(E!==-1){const D=Math.max(2.5,12-E*3.5),x=Math.max(4,30-E*8);v[g]=C*D+x}else v[g]=C});const u=k.some(g=>g!=="General"&&f[g]>0);let h="General",w=0;return u||o?k.forEach(g=>{v[g]>w&&(w=v[g],h=g)}):h="General",{category:h,courseCode:o,isPhd:!1}}document.addEventListener("click",t=>{const e=t.target;if(!e)return;e.closest("tr.zA")&&(setTimeout(()=>{z({type:"EMAIL_CHANGED"}),q()},350),setTimeout(()=>{z({type:"EMAIL_CHANGED"}),q()},800)),e.closest('.ar5, .amD, [aria-label*="Older" i], [aria-label*="Newer" i], [aria-label*="Next" i], [aria-label*="Previous" i], [data-tooltip*="Older" i], [data-tooltip*="Newer" i], [data-tooltip*="Previous" i], [data-tooltip*="Next" i]')&&(setTimeout(A,100),setTimeout(A,300),setTimeout(A,700),setTimeout(A,1200))},!0);function A(){const t=document.querySelectorAll("tr.zA"),e=[];return t.forEach((n,i)=>{var h,w,g,C;const s=n,r=s.querySelector(".bqe, .bog, span[data-thread-id]"),l=((h=r==null?void 0:r.textContent)==null?void 0:h.trim())||"(No Subject)",a=s.querySelector(".bA4 span, .yP, .zF"),c=((w=a==null?void 0:a.textContent)==null?void 0:w.trim())||"Unknown",o=s.querySelector(".y2"),m=((g=o==null?void 0:o.textContent)==null?void 0:g.trim())||"",d=s.querySelector(".xW span"),f=((C=d==null?void 0:d.textContent)==null?void 0:C.trim())||"Recent",p=!s.classList.contains("zE"),b=`${l}::${c}`.trim(),{category:y,courseCode:v,isPhd:k}=ie(l,c,m,b),u={id:`row-${i}-${l.slice(0,15).replace(/[^a-zA-Z0-9]/g,"_")}`,index:i,subject:l,sender:c,snippet:m,date:f,category:y,courseCode:v,isRead:p};e.push(u),pe(s,y,v,k,l,c)}),H=e,$==="blended"&&e.length>0&&le(e),P!=="ALL"&&B(P),e}function pe(t,e,n,i,s,r){const l=t.querySelector(".acadmail-row-badge");l&&l.remove();const a=t.querySelector(".y6, .bog");if(!a)return;const c=I(),o=document.createElement("span");o.className="acadmail-row-badge";let m=c?"background: rgba(56, 139, 253, 0.15); color: #79c0ff; border: 1px solid rgba(56, 139, 253, 0.3);":"background: #edf5fd; color: #1a73e8; border: 1px solid #d2e3fc;",d=n||"Acads";e==="Assignment"?(m=c?"background: rgba(11, 87, 208, 0.2); color: #a8c7fa; border: 1px solid rgba(11, 87, 208, 0.35);":"background: #e8f0fe; color: #0b57d0; border: 1px solid #c2e7ff;",d=n?`${n} • Assign`:"Assignment"):e==="Competitions & Tournaments"?(m=c?"background: rgba(210, 153, 34, 0.15); color: #e3b341; border: 1px solid rgba(210, 153, 34, 0.3);":"background: #fef7e0; color: #b06000; border: 1px solid #fce8b2;",d="Contest"):e==="Workshops"?(m=c?"background: rgba(46, 160, 67, 0.15); color: #7ee787; border: 1px solid rgba(46, 160, 67, 0.3);":"background: #e6f4ea; color: #137333; border: 1px solid #ceead6;",d="Workshop"):e==="Class Rescheduling"?(m=c?"background: rgba(248, 81, 73, 0.15); color: #ff7b72; border: 1px solid rgba(248, 81, 73, 0.3);":"background: #fce8e6; color: #c5221f; border: 1px solid #fad2cf;",d="Rescheduled"):i?(m=c?"background: rgba(142, 145, 143, 0.15); color: #c4c7c5; border: 1px solid rgba(142, 145, 143, 0.3);":"background: #f1f3f4; color: #5f6368; border: 1px solid #dadce0;",d="PhD / Viva"):e==="General"?(m=c?"background: rgba(142, 145, 143, 0.12); color: #c4c7c5; border: 1px solid rgba(142, 145, 143, 0.2);":"background: #f8f9fa; color: #5f6368; border: 1px solid #dadce0;",d="General"):(m=c?"background: rgba(168, 85, 247, 0.15); color: #c084fc; border: 1px solid rgba(168, 85, 247, 0.3);":"background: #f3e8ff; color: #7e22ce; border: 1px solid #e9d5ff;",d=e),o.setAttribute("style",`
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
    ${m}
  `),o.setAttribute("data-category",e),t.setAttribute("data-acadmail-category",e),t.setAttribute("data-acadmail-scanned","true"),o.innerText=d,o.title=n?`Filter Gmail for ${n} (Right-click to change label)`:`Category: ${e} (Click to change)`,o.onclick=f=>{f.stopPropagation(),n?ue(n):U(o,s,r,e)},o.oncontextmenu=f=>{f.preventDefault(),f.stopPropagation(),U(o,s,r,e)},a.prepend(o)}function ue(t){const e=document.querySelector('input[name="q"], input[aria-label*="Search"]');if(e){e.value=t,e.dispatchEvent(new Event("input",{bubbles:!0}));const n=e.closest("form");n?n.dispatchEvent(new Event("submit",{bubbles:!0,cancelable:!0})):e.dispatchEvent(new KeyboardEvent("keydown",{key:"Enter",keyCode:13,bubbles:!0}))}}function B(t){P=t,document.querySelectorAll("tr.zA").forEach(n=>{const i=n;if(t==="ALL"){i.style.display="";return}const s=i.getAttribute("data-acadmail-category"),r=i.querySelector(".acadmail-row-badge"),l=r==null?void 0:r.getAttribute("data-category"),a=(r==null?void 0:r.textContent)||"";let c=!1;(s===t||l===t||t==="Academics"&&(a.includes("🎓")||a.includes("Acads"))||t==="Assignment"&&a.toLowerCase().includes("assign")||t==="Competitions & Tournaments"&&(a.includes("🏆")||a.includes("Contest"))||t==="Workshops"&&(a.includes("🛠️")||a.includes("Workshop"))||t==="Class Rescheduling"&&(a.includes("⏰")||a.includes("Rescheduled"))||t==="General"&&(a.includes("📢")||a.includes("General")||a.includes("PhD"))||a.toLowerCase().includes(t.toLowerCase()))&&(c=!0),c?i.style.display="":i.style.display="none"}),me()}function ae(t,e,n){const i="https://calendar.google.com/calendar/render?action=TEMPLATE";let s="";if(n){const l=new Date(n);if(!isNaN(l.getTime())){const a=l.toISOString().replace(/-|:|\.\d\d\d/g,""),o=new Date(l.getTime()+3600*1e3).toISOString().replace(/-|:|\.\d\d\d/g,"");s=`&dates=${a}/${o}`}}const r=new URLSearchParams({text:`[AcadMail] ${t}`,details:`${e}

— Auto-extracted by AcadMail AI`});return`${i}&${r.toString()}${s}`}function se(t){const e=document.getElementById("acadmail-toast");e&&e.remove();const n=document.createElement("div");n.id="acadmail-toast",n.innerText=t,n.setAttribute("style",`
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
  `),document.body.appendChild(n),setTimeout(()=>n.remove(),2500)}function re(){const t=document.querySelector('div[gh="tm"]');if(t&&(t.offsetParent!==null||t.offsetHeight>0))return t;const e=document.querySelectorAll("div.G-atb");for(let s=0;s<e.length;s++){const r=e[s];if(r.offsetParent!==null&&!r.classList.contains("G-atb-b")){const l=r.getBoundingClientRect();if(l.top>=0&&l.top<window.innerHeight*.45)return r}}const n=document.querySelector('div[gh="tl"]');if(n&&n.parentElement)return n.previousElementSibling?n.previousElementSibling:n.parentElement;const i=document.querySelector("div.aeF");return i&&(i.offsetParent!==null||i.offsetHeight>0)?i:t||(e.length>0?e[0]:null)}function X(t,e){const n=e.parentElement;n&&(e.nextSibling?e.nextSibling!==t&&n.insertBefore(t,e.nextSibling):(t.parentElement!==n||n.lastElementChild!==t)&&n.appendChild(t))}function le(t){if($!=="blended")return;const e=re();if(!e)return;if(!document.getElementById("acadmail-m3-css")){const u=document.createElement("style");u.id="acadmail-m3-css",u.textContent=`
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
    `,document.head.appendChild(u)}let n=0,i=0,s=0,r=0,l=0;const a=/\b(?:due|deadline|by|on|date:|till)\s+([A-Za-z]{3,9}\s+\d{1,2}(?:st|nd|rd|th)?(?:\s*,\s*\d{4})?|\d{1,2}\/\d{1,2}(?:\/\d{2,4})?|\d{1,2}\s+[A-Za-z]{3,9})\b/gi,c=[];t.forEach(u=>{u.category==="Academics"?n++:u.category==="Competitions & Tournaments"?i++:u.category==="Workshops"?s++:u.category==="Class Rescheduling"?r++:u.category==="General"&&l++;const w=[...`${u.subject} ${u.snippet}`.matchAll(a)];w.length>0&&c.push({title:u.subject,deadline:w[0][1]})});const o=I(),m=`
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
  `;let d=document.getElementById("acadmail-native-chip-bar");!d||!document.body.contains(d)?(d&&d.parentElement&&d.remove(),d=document.createElement("div"),d.id="acadmail-native-chip-bar",d.setAttribute("style",m),X(d,e)):(d.setAttribute("style",m),X(d,e));const f=u=>P===u?`
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
    `,p=(u,h)=>`<span class="m3-chip-count" style="background: ${P===u?o?"rgba(194, 231, 255, 0.22)":"rgba(0, 29, 53, 0.12)":o?"rgba(255, 255, 255, 0.1)":"rgba(0, 0, 0, 0.06)"}; color: inherit;">${h}</span>`;d.innerHTML=`
    <!-- Left: Slim Google Material 3 Chips (Defaults + Dynamic Custom Filters) -->
    <div id="acadmail-chip-scroll-track" style="display: flex; align-items: center; gap: 8px; overflow-x: auto; scrollbar-width: none; -ms-overflow-style: none; flex: 1; min-width: 0; padding: 2px 0;">
      
      <!-- Brand Pill -->
      <div style="display: inline-flex; align-items: center; gap: 6px; height: 32px; box-sizing: border-box; padding: 0 10px; border-radius: 6px; background: ${o?"rgba(56, 139, 253, 0.12)":"rgba(26, 115, 232, 0.08)"}; color: ${o?"#79c0ff":"#1a73e8"}; flex-shrink: 0; white-space: nowrap; margin-right: 4px; border: 1px solid ${o?"rgba(56, 139, 253, 0.25)":"rgba(26, 115, 232, 0.2)"};">
        <img src="${chrome.runtime.getURL("icons/envelope-logo.png")}" alt="AcadMail" style="width: 17px; height: 17px; border-radius: 3px; object-fit: contain;" />
        <span style="font-family: 'Batangas', Roboto, sans-serif; font-weight: 700; font-size: 13px; letter-spacing: 0.2px;">AcadMail</span>
      </div>

      <!-- 1. All Emails -->
      <button class="m3-chip" data-cat="ALL" style="${f("ALL")}">
        <span>All</span>
        ${p("ALL",t.length)}
      </button>

      <!-- 2. Academics -->
      <button class="m3-chip" data-cat="Academics" style="${f("Academics")}">
        <span>Academics</span>
        ${p("Academics",n)}
      </button>

      <!-- 3. Competitions -->
      <button class="m3-chip" data-cat="Competitions & Tournaments" style="${f("Competitions & Tournaments")}">
        <span>Contests</span>
        ${p("Competitions & Tournaments",i)}
      </button>

      <!-- 4. Workshops -->
      <button class="m3-chip" data-cat="Workshops" style="${f("Workshops")}">
        <span>Workshops</span>
        ${p("Workshops",s)}
      </button>

      <!-- 5. Reschedules -->
      <button class="m3-chip" data-cat="Class Rescheduling" style="${f("Class Rescheduling")}">
        <span>Rescheduled</span>
        ${p("Class Rescheduling",r)}
      </button>

      <!-- 6. General -->
      <button class="m3-chip" data-cat="General" style="${f("General")}">
        <span>General & PhD</span>
        ${p("General",l)}
      </button>

      <!-- 7. Dynamic User-Defined Custom Filters -->
      ${S.map(u=>{const h=t.filter(w=>w.category===u.name).length;return`
          <button class="m3-chip" data-cat="${u.name}" style="${f(u.name)}">
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
      ${c.length>0?`
        <div style="position: relative; flex-shrink: 0;">
          <button id="m3-deadlines-btn" style="height: 32px; padding: 0 10px; border-radius: 6px; border: 1px solid ${o?"rgba(210,153,34,0.4)":"#fde68a"}; background: ${o?"rgba(210,153,34,0.15)":"#fffbeb"}; color: ${o?"#e3b341":"#b45309"}; font-size: 12px; font-weight: 600; font-family: Roboto, 'Google Sans', sans-serif; cursor: pointer; display: inline-flex; align-items: center; gap: 5px; white-space: nowrap;">
            <span style="font-weight: 700; font-family: Roboto, 'Google Sans', sans-serif; font-size: 11px;">DUE</span>
            <span>${c.length}</span>
          </button>

          <div id="m3-deadlines-popover" style="display: none; position: absolute; right: 0; top: 38px; width: 310px; background: ${o?"#1e1f20":"#ffffff"}; border: 1px solid ${o?"#3c4043":"#e0e2ec"}; border-radius: 8px; box-shadow: 0 10px 28px rgba(0,0,0,0.2); padding: 12px; z-index: 99999; font-family: Roboto, 'Google Sans', sans-serif;">
            <div style="font-weight: 600; color: ${o?"#e3e3e3":"#1f1f1f"}; font-size: 11.5px; margin-bottom: 8px; display: flex; justify-content: space-between; align-items: center;">
              <span>Detected Due Dates</span>
              <span style="font-size: 10px; color: #1a73e8; font-weight: 600;">+ Google Calendar</span>
            </div>
            <div style="max-height: 220px; overflow-y: auto; display: flex; flex-direction: column; gap: 6px;">
              ${c.map(u=>`
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
  `,d.querySelectorAll(".m3-chip").forEach(u=>{const h=u;h.onclick=()=>{const w=h.getAttribute("data-cat");B(P===w&&w!=="ALL"?"ALL":w)}});const b=d.querySelector("#m3-add-filter-chip");b&&(b.onclick=()=>fe());const y=d.querySelector("#m3-deadlines-btn"),v=d.querySelector("#m3-deadlines-popover");y&&v&&(y.onclick=u=>{u.stopPropagation(),v.style.display=v.style.display==="block"?"none":"block"},document.addEventListener("click",u=>{!v.contains(u.target)&&u.target!==y&&(v.style.display="none")}));const k=d.querySelector("#acadmail-instant-revert-btn");k&&(k.onclick=()=>{var u;$="off",typeof chrome<"u"&&((u=chrome.storage)!=null&&u.local)&&chrome.storage.local.get(["acadmail_settings"],h=>{const w=h.acadmail_settings||{};chrome.storage.local.set({acadmail_settings:{...w,uiMode:"off",inPageIntegration:!1}})}),J()})}function fe(){const t=document.getElementById("acadmail-add-filter-modal");if(t){t.remove();return}const e=I(),n=document.createElement("div");n.id="acadmail-add-filter-modal",n.setAttribute("style",`
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
  `,document.body.appendChild(n);const i=n.querySelector("#modal-close-btn"),s=n.querySelector("#modal-cancel-btn"),r=n.querySelector("#modal-save-btn"),l=n.querySelector("#new-filter-name"),a=n.querySelector("#new-filter-keywords");i.onclick=()=>n.remove(),s.onclick=()=>n.remove(),r.onclick=()=>{const c=l.value.trim(),o=a.value.trim();c&&(de(c,o),n.remove())}}function U(t,e,n,i){const s=document.getElementById("acadmail-relabel-popup");if(s){s.remove();return}const r=I(),l=t.getBoundingClientRect(),a=document.createElement("div");a.id="acadmail-relabel-popup",a.setAttribute("style",`
    position: fixed;
    top: ${l.bottom+4}px;
    left: ${Math.min(l.left,window.innerWidth-220)}px;
    width: 210px;
    background: ${r?"#1e1f20":"#ffffff"};
    border: 1px solid ${r?"#444746":"#e0e2ec"};
    border-radius: 12px;
    box-shadow: 0 10px 25px rgba(0,0,0,0.2);
    padding: 6px;
    z-index: 9999999;
    font-family: -apple-system, BlinkMacSystemFont, "Google Sans", Roboto, sans-serif;
  `);const c=["Academics","Competitions & Tournaments","Workshops","Class Rescheduling","General"],o=[...c,...S.map(d=>d.name).filter(d=>!c.includes(d))];a.innerHTML=`
    <div style="padding: 4px 8px; font-size: 10px; font-weight: 700; color: ${r?"#8e918f":"#64748b"}; text-transform: uppercase; border-bottom: 1px solid ${r?"#333537":"#f1f5f9"};">
      Change Category Label
    </div>
    <div style="display: flex; flex-direction: column; gap: 2px; padding-top: 4px; max-height: 200px; overflow-y: auto;">
      ${o.map(d=>`
        <button class="relabel-opt" data-cat="${d}" style="text-align: left; padding: 6px 8px; border-radius: 6px; border: none; background: ${d===i?r?"#004a77":"#c2e7ff":"transparent"}; color: ${d===i?r?"#c2e7ff":"#001d35":r?"#e3e3e3":"#1f1f1f"}; font-size: 11.5px; font-weight: ${d===i?"600":"400"}; cursor: pointer; display: flex; align-items: center; justify-content: space-between;">
          <span>${d}</span>
          ${d===i?"<span>✓</span>":""}
        </button>
      `).join("")}
    </div>
  `,document.body.appendChild(a),a.querySelectorAll(".relabel-opt").forEach(d=>{const f=d;f.onclick=p=>{p.stopPropagation();const b=f.getAttribute("data-cat")||"General";oe(e,e,n,b),a.remove()}});const m=d=>{!a.contains(d.target)&&!t.contains(d.target)&&(a.remove(),document.removeEventListener("click",m))};setTimeout(()=>document.addEventListener("click",m),50)}function me(){$==="blended"&&H.length>0&&le(H)}function q(){var g,C,E,D;if($==="off")return;const t=ce();if(!t){(g=document.getElementById("acadmail-email-brief-card"))==null||g.remove();return}const e=document.querySelector("div.ha")||((C=document.querySelector("h2.hP"))==null?void 0:C.parentElement)||((E=document.querySelector('div[role="main"] h2'))==null?void 0:E.parentElement);if(!e)return;const n=document.getElementById("acadmail-email-brief-card"),i=n==null?void 0:n.getAttribute("data-email-id");if(n&&i===t.id)return;n&&n.remove();const s=ie(t.subject,t.senderName,t.bodyText,t.id),r=`${t.subject} ${t.bodyText}`,l=/\b(?:due|deadline|by|on|date:|till)\s+([A-Za-z]{3,9}\s+\d{1,2}(?:st|nd|rd|th)?(?:\s*,\s*\d{4})?|\d{1,2}\/\d{1,2}(?:\/\d{2,4})?|\d{1,2}\s+[A-Za-z]{3,9})\b/i,a=r.match(l),c=a?a[1]:null,o=r.match(/https?:\/\/(?:[a-zA-Z0-9-]+\.)?(?:zoom\.us\/j|meet\.google\.com|teams\.microsoft\.com\/l)\/[^\s<>"']+/i),m=o?o[0]:null,f=t.bodyText.split(/\.\s+/).map(x=>x.trim()).filter(x=>x.length>25&&!x.includes("http")&&!x.includes("unsubscribe")&&!x.includes("Regards")).slice(0,3);f.length===0&&f.push(`Announcement regarding ${t.subject} from ${t.senderName}.`);const p=I(),b=document.createElement("div");b.id="acadmail-email-brief-card",b.setAttribute("data-email-id",t.id),b.setAttribute("style",`
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
          ${c?`⏰ Due: <strong>${c}</strong> • `:""}${f[0]}
        </span>
      </div>

      <div style="display: flex; align-items: center; gap: 5px; shrink: 0;">
        <!-- Category Chip with Re-label button -->
        <span style="padding: 1px 7px; border-radius: 4px; font-size: 10px; font-weight: 600; background: ${p?"rgba(56, 139, 253, 0.2)":"#e8f0fe"}; color: ${p?"#79c0ff":"#1a73e8"};">
          ${s.category}
        </span>

        <button id="acadmail-brief-relabel-btn" title="Change this email's category label" style="cursor: pointer; padding: 2px 5px; border-radius: 4px; border: 1px dashed ${p?"#444746":"#cbd5e1"}; background: transparent; font-size: 10px; font-weight: 500; color: ${p?"#a8c7fa":"#1a73e8"};">
          ✎ Relabel
        </button>

        ${c?`
          <a href="${ae(t.subject,t.bodyText.slice(0,300),c)}" target="_blank" style="text-decoration: none; padding: 2px 7px; background: ${p?"#004a77":"#c2e7ff"}; color: ${p?"#c2e7ff":"#001d35"}; border-radius: 6px; font-size: 10px; font-weight: 600;">+ GCal</a>
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
        ${f.map(x=>`<li>${x}</li>`).join("")}
      </ul>

      <!-- Action Row: Meeting Links + Quick Reply Chips -->
      <div style="display: flex; flex-wrap: wrap; align-items: center; gap: 6px; padding-top: 2px;">
        ${m?`
          <a href="${m}" target="_blank" style="text-decoration: none; display: inline-flex; align-items: center; gap: 4px; padding: 3px 8px; background: ${p?"#143e2e":"#e6f4ea"}; color: ${p?"#a7f3d0":"#137333"}; border-radius: 6px; font-size: 10.5px; font-weight: 600;">
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
  `;const y=b.querySelector("#acadmail-brief-relabel-btn");y&&(y.onclick=x=>{x.stopPropagation(),U(y,t.subject,t.senderName,s.category)});const v=b.querySelector("#m3-brief-drawer"),k=b.querySelector("#m3-brief-expand-btn"),u=b.querySelector("#m3-brief-toggle-line"),h=()=>{R=!R,v.style.display=R?"flex":"none",k.innerText=R?"Collapse ▴":"Details ▾"};k.onclick=h,u.onclick=h;const w=b.querySelector("#m3-brief-dismiss-btn");w&&(w.onclick=()=>b.remove()),b.querySelectorAll(".m3-quick-reply-btn").forEach(x=>{const T=x;T.onclick=async()=>{const V=T.getAttribute("data-reply");let j="";V==="confirm"?j=`Dear ${t.senderName||"Professor"},

Thank you for the update regarding "${t.subject}". I confirm my participation and will ensure all prerequisites are met.

Best regards,
[Your Name]
[Student ID]`:V==="extension"?j=`Dear Professor ${t.senderName||""},

I hope this email finds you well. I am writing to respectfully ask if it might be possible to grant a short extension on the submission for "${t.subject}". I want to ensure my work meets the highest standards.

Thank you for your time and understanding.

Sincerely,
[Your Name]
[Student ID]`:j=`Dear Professor ${t.senderName||""},

I hope you are well. Regarding the announcement on "${t.subject}", I had a quick question regarding the specifications and would appreciate some guidance.

Thank you very much.

Sincerely,
[Your Name]
[Student ID]`,await ge(j,T)}}),(D=e.parentElement)==null||D.insertBefore(b,e.nextSibling)}async function ge(t,e){const n=e.innerText;e.innerText="Drafting...";const i=document.querySelector('div[role="button"][aria-label*="Reply"]')||document.querySelector(".ams.bkH")||document.querySelector('.T-I.J-J5-Ji.T-I-Js-IF[data-tooltip*="Reply"]')||document.querySelector('span[role="button"][aria-label*="Reply"]');i&&i.click();let s=0;const r=setInterval(()=>{s++;const l=document.querySelector('div[aria-label="Message Body"], div[role="textbox"][contenteditable="true"]');l?(clearInterval(r),l.focus(),l.innerText=t,l.dispatchEvent(new Event("input",{bubbles:!0})),l.scrollIntoView({behavior:"smooth",block:"center"}),e.innerText="✅ Drafted!",setTimeout(()=>{e.innerText=n},2500)):s>15&&(clearInterval(r),e.innerText="⚠️ Click Reply first",setTimeout(()=>{e.innerText=n},2e3))},200)}function F(){if($==="off"||document.getElementById("acadmail-siderail-btn"))return;const t=document.querySelector("div.aDG")||document.querySelector('div[aria-label="Side panel"]')||document.querySelector("div.bq9");if(!t)return;const e=document.createElement("div");e.id="acadmail-siderail-btn",e.title="AcadMail AI Copilot",e.setAttribute("role","button"),e.setAttribute("tabindex","0");const n=I();e.setAttribute("style",`
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
  `,e.onmouseenter=()=>e.style.background=n?"rgba(255,255,255,0.08)":"rgba(0,0,0,0.06)",e.onmouseleave=()=>e.style.background="transparent",e.onclick=()=>z({type:"OPEN_SIDEPANEL"}),t.prepend(e)}function ce(){var s,r,l,a,c;const t=document.querySelector("h2.hP")||document.querySelector("div.ha h2")||document.querySelector('div[role="main"] h2')||document.querySelector("h2[data-legacy-thread-id]")||document.querySelector("h1[data-thread-perm-id]"),e=((s=t==null?void 0:t.textContent)==null?void 0:s.trim())||"",n=document.querySelectorAll('.a3s.aiL, div[role="listitem"] .adn .a3s, .ii.gt, div.adn.ads');let i="";if(n.length>0&&(i=((r=n[n.length-1].textContent)==null?void 0:r.trim())||""),e&&(i||n.length>0)){const o=document.querySelector("span[email]")||document.querySelector(".gD")||document.querySelector(".go")||document.querySelector("span.zF"),m=(o==null?void 0:o.getAttribute("email"))||((l=o==null?void 0:o.textContent)==null?void 0:l.trim())||"academic@university.edu",d=(o==null?void 0:o.getAttribute("name"))||((a=o==null?void 0:o.textContent)==null?void 0:a.trim())||"Academic Sender",f=document.querySelector(".g3")||document.querySelector("span.mI")||document.querySelector(".date"),p=(f==null?void 0:f.getAttribute("title"))||((c=f==null?void 0:f.textContent)==null?void 0:c.trim())||new Date().toLocaleString();return{id:(window.location.hash||"").replace(/[^a-zA-Z0-9_-]/g,"_")||`email-${Date.now()}`,subject:e,senderName:d,senderEmail:m,recipient:"Me",dateStr:p,bodyText:i.slice(0,5e3),url:window.location.href}}return null}function W(){document.querySelectorAll("tr.btC, .gU.Up").forEach(e=>{if(e.querySelector(".acadmail-polish-btn"))return;const n=document.createElement("div");n.className="acadmail-polish-btn",n.setAttribute("style",`
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
    `,n.onclick=i=>{i.stopPropagation(),be(e,n)},e.appendChild(n)})}function be(t,e){var c;const n=document.getElementById("acadmail-tone-menu");if(n){n.remove();return}const i=t.closest('div[role="dialog"]')||t.closest(".M9"),s=i==null?void 0:i.querySelector('div[aria-label="Message Body"], div[contenteditable="true"]'),r=((c=s==null?void 0:s.innerText)==null?void 0:c.trim())||"",l=document.createElement("div");l.id="acadmail-tone-menu",l.setAttribute("style",`
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
  `),l.innerHTML=`
    <div style="padding: 4px 8px; font-size: 10px; font-weight: 700; color: #64748b; text-transform: uppercase;">Academic Tone</div>
    <div style="display: flex; flex-direction: column; gap: 3px; padding-top: 4px;">
      <button class="acad-tone-opt" data-tone="formal" style="text-align: left; padding: 6px 8px; border-radius: 6px; border: none; background: transparent; cursor: pointer; font-size: 11px; font-weight: 600; color: #1e293b;">Respectful & Formal</button>
      <button class="acad-tone-opt" data-tone="extension" style="text-align: left; padding: 6px 8px; border-radius: 6px; border: none; background: transparent; cursor: pointer; font-size: 11px; font-weight: 600; color: #1e293b;">Request Extension</button>
      <button class="acad-tone-opt" data-tone="doubt" style="text-align: left; padding: 6px 8px; border-radius: 6px; border: none; background: transparent; cursor: pointer; font-size: 11px; font-weight: 600; color: #1e293b;">Clarify Doubt</button>
      <button class="acad-tone-opt" data-tone="lor" style="text-align: left; padding: 6px 8px; border-radius: 6px; border: none; background: transparent; cursor: pointer; font-size: 11px; font-weight: 600; color: #1e293b;">Request LoR / Reference</button>
    </div>
  `,l.querySelectorAll(".acad-tone-opt").forEach(o=>{const m=o;m.onclick=async()=>{const d=m.getAttribute("data-tone")||"formal";l.remove(),await he(s,r,d,e)}}),e.appendChild(l);const a=o=>{!l.contains(o.target)&&!e.contains(o.target)&&(l.remove(),document.removeEventListener("click",a))};setTimeout(()=>document.addEventListener("click",a),100)}async function he(t,e,n,i){if(!t)return;const s=i.innerHTML;i.innerHTML="<span>Polishing...</span>";try{const r=await new Promise(m=>{var d;typeof chrome<"u"&&((d=chrome.storage)!=null&&d.local)?chrome.storage.local.get(["acadmail_settings"],f=>m(f.acadmail_settings||{})):m({})}),l=r.apiKey||"",a=r.groqApiKey||"",o=await xe(e||"Need extension for lab assignment due this friday because of fever.",n,l,a);t.focus(),t.innerText=o,t.dispatchEvent(new Event("input",{bubbles:!0})),i.innerHTML="<span>Polished!</span>",setTimeout(()=>{i.innerHTML=s},2e3)}catch{i.innerHTML="<span>Error</span>",setTimeout(()=>{i.innerHTML=s},2e3)}}async function xe(t,e,n,i){var l,a,c,o,m,d,f,p,b;const r=`Transform this student's rough notes into a courteous, polished academic email to a professor.
Tone: ${{formal:"Polite, professional academic tone to a professor.",extension:"Polite, respectful request for an assignment deadline extension showing dedication.",doubt:"Polite conceptual question or office hours request referencing lecture material.",lor:"Courteous inquiry requesting a Letter of Recommendation for graduate studies/internships."}[e]||"Formal"}
Guidelines:
- Include respectful salutation ("Dear Professor [Name],", "I hope this email finds you well.")
- Keep it concise, courteous, and respectful.
- Retain all dates, assignment titles, or reasons mentioned.
- Conclude with a warm academic sign-off ("Sincerely,", "Best regards," followed by "[Your Name] [Student ID]").
- Output ONLY the final email text.

Student's notes:
${t}`;if(i&&i.trim())try{const y=await fetch("https://api.groq.com/openai/v1/chat/completions",{method:"POST",headers:{Authorization:`Bearer ${i.trim()}`,"Content-Type":"application/json"},body:JSON.stringify({model:"llama-3.3-70b-versatile",messages:[{role:"user",content:r}],temperature:.3})});if(y.ok)return((o=(c=(a=(l=(await y.json()).choices)==null?void 0:l[0])==null?void 0:a.message)==null?void 0:c.content)==null?void 0:o.trim())||t}catch{}if(n&&n.trim()){const y=["models/gemini-2.0-flash","models/gemini-3.8-flash","models/gemini-1.5-flash"];for(const v of y)try{const k=await fetch(`https://generativelanguage.googleapis.com/v1beta/${v}:generateContent?key=${n.trim()}`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({contents:[{parts:[{text:r}]}],generationConfig:{temperature:.3}})});if(k.ok){const u=await k.json(),h=(b=(p=(f=(d=(m=u==null?void 0:u.candidates)==null?void 0:m[0])==null?void 0:d.content)==null?void 0:f.parts)==null?void 0:p[0])==null?void 0:b.text;if(h)return h.trim()}}catch{}}return`Dear Professor,

I hope this email finds you well.

I am writing to respectfully request your guidance regarding ${t}.

Thank you for your time and consideration.

Sincerely,
[Your Name]
[Student ID]`}var te;typeof chrome<"u"&&((te=chrome.runtime)!=null&&te.onMessage)&&chrome.runtime.onMessage.addListener((t,e,n)=>{var i;if(t.type==="GET_ACTIVE_EMAIL"){const s=ce();n({email:s})}else if(t.type==="SCAN_INBOX"){const s=A();n({items:s})}else if(t.type==="FILTER_GMAIL_DOM")B(t.category),n({success:!0});else if(t.type==="CLICK_ROW"){const s=document.querySelectorAll("tr.zA");let r=!1;if(typeof t.index=="number"&&s[t.index]&&(s[t.index],s[t.index].click(),r=!0),!r&&t.subject){const l=t.subject.toLowerCase().replace(/\[.*?\]/g,"").replace(/[^a-z0-9\s]/g,"").trim().slice(0,25);for(let a=0;a<s.length;a++){const c=((i=s[a].textContent)==null?void 0:i.toLowerCase())||"";if(l&&c.includes(l)){s[a],s[a].click(),r=!0;break}}}r&&setTimeout(q,400),n({success:r})}else t.type==="SET_UI_MODE"?($=t.mode,J(),n({success:!0})):t.type==="RELABEL_EMAIL"?(oe(t.emailId,t.subject||"",t.sender||"",t.newCategory),n({success:!0})):(t.type==="UPDATE_CUSTOM_FILTERS"||t.type==="UPDATE_SETTINGS")&&(Array.isArray(t.priorityList)&&(G=t.priorityList,_=t.priorityList),Z(),setTimeout(A,150),n({success:!0}));return!0});var ne;typeof chrome<"u"&&((ne=chrome.storage)!=null&&ne.onChanged)&&chrome.storage.onChanged.addListener((t,e)=>{e==="local"&&t.acadmail_settings&&(Z(),setTimeout(A,300))});Z();document.readyState==="loading"?document.addEventListener("DOMContentLoaded",()=>{setTimeout(A,1200),setTimeout(q,1200),setTimeout(F,1200),setTimeout(W,1200),setTimeout(N,1200)}):(setTimeout(A,1200),setTimeout(q,1200),setTimeout(F,1200),setTimeout(W,1200),setTimeout(N,1200));function ye(){const t=document.querySelector("span.Dj, .ar5 span");if(t&&t.textContent)return t.textContent.trim();const e=document.querySelector(".ar5");return e&&e.textContent?e.textContent.trim():""}function K(){const t=document.querySelectorAll("tr.zA");if(t.length===0)return!1;for(let e=0;e<t.length;e++)if(!t[e].querySelector(".acadmail-row-badge"))return!0;return!1}function Y(){if($!=="blended"||document.querySelectorAll("tr.zA").length===0)return!1;const e=document.getElementById("acadmail-native-chip-bar");if(!e||!document.body.contains(e))return!0;const n=re();return!!(n&&(e.parentElement!==n.parentElement||n.nextSibling!==e))}let Q=location.href,ee="",O=null;function M(t=120){O&&clearTimeout(O),O=setTimeout(()=>{A(),q(),F()},t)}new MutationObserver(()=>{const t=location.href;t!==Q&&(Q=t,z({type:"EMAIL_CHANGED"}),N(),M(250));const e=ye();e&&e!==ee&&(ee=e,M(100)),(K()||Y())&&M(100),W()}).observe(document,{subtree:!0,childList:!0});window.addEventListener("popstate",()=>{M(200),setTimeout(M,600)});window.addEventListener("hashchange",()=>{M(200),setTimeout(M,600)});document.addEventListener("keydown",t=>{["j","k","n","p","o","u","x"].includes(t.key.toLowerCase())&&setTimeout(()=>{(K()||Y())&&A()},200)});setInterval(()=>{$==="blended"&&document.querySelectorAll("tr.zA").length>0&&(Y()||K())&&A()},1e3);

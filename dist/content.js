console.log("[AcadMail AI] Ultra-Clean Material 3 Gmail Script with Custom Filters & Relabeling active.");let P="ALL",N=[],C="blended",D=!1,$=[{id:"filter-assignment",name:"Assignment",color:"#0b57d0",keywords:["assignment","assignments","tutorial","tutorials","homework","problem set","problem sets","pset","psets","lab submission","lab assignment"]},{id:"filter-placements",name:"Placements & Internships",color:"#8b5cf6",keywords:["placement","tpo","internship","interview","shortlist","offer","ctc","pre-placement"]},{id:"filter-hostel",name:"Hostel & Campus Mess",color:"#06b6d4",keywords:["hostel","mess","warden","room","maintenance","electricity","water","hall of residence"]}],T={},R=["Assignment","Academics","Competitions & Tournaments","Class Rescheduling"],G=["Assignment","Academics","Competitions & Tournaments","Class Rescheduling"];function M(t){var e;try{typeof chrome<"u"&&((e=chrome.runtime)!=null&&e.id)&&chrome.runtime.sendMessage(t).catch(()=>{})}catch{}}function z(){try{const t=window.getComputedStyle(document.body).backgroundColor;if(t){const e=t.match(/\d+/g);if(e&&e.length>=3)return(parseInt(e[0])*299+parseInt(e[1])*587+parseInt(e[2])*114)/1e3<128}}catch{}return window.matchMedia("(prefers-color-scheme: dark)").matches}function B(){var n;const e=z()?"dark":"light";typeof chrome<"u"&&((n=chrome.storage)!=null&&n.local)&&chrome.storage.local.set({acadmail_gmail_theme:e}),M({type:"GMAIL_THEME_DETECTED",theme:e})}function U(){var t;B(),typeof chrome<"u"&&((t=chrome.storage)!=null&&t.local)&&chrome.storage.local.get(["acadmail_settings"],e=>{e.acadmail_settings&&(e.acadmail_settings.uiMode?C=e.acadmail_settings.uiMode:e.acadmail_settings.inPageIntegration===!1?C="off":C="blended",Array.isArray(e.acadmail_settings.customFilters)&&($=e.acadmail_settings.customFilters,$.some(i=>i.id==="filter-assignment"||i.name.toLowerCase()==="assignment"||i.name.toLowerCase()==="assignments")||$.unshift({id:"filter-assignment",name:"Assignment",color:"#0b57d0",keywords:["assignment","assignments","tutorial","tutorials","homework","problem set","problem sets","pset","psets","lab submission","lab assignment"]})),e.acadmail_settings.labelOverrides&&(T=e.acadmail_settings.labelOverrides),Array.isArray(e.acadmail_settings.priorityList)?(R=e.acadmail_settings.priorityList,G=e.acadmail_settings.priorityList):Array.isArray(e.acadmail_settings.preferredLabels)&&(R=e.acadmail_settings.preferredLabels,G=e.acadmail_settings.preferredLabels)),W()})}function W(){var t,e,n,i;if((t=document.getElementById("acadmail-native-chip-bar"))==null||t.remove(),(e=document.getElementById("acadmail-inbox-filter-bar"))==null||e.remove(),(n=document.getElementById("acadmail-email-brief-card"))==null||n.remove(),(i=document.getElementById("acadmail-siderail-btn"))==null||i.remove(),C==="off"){F("ALL");return}L(),q(),j()}function V(t,e,n,i){var a;T[t]=i,e&&(T[e]=i);const r=`${e}::${n}`.trim();r&&(T[r]=i),typeof chrome<"u"&&((a=chrome.storage)!=null&&a.local)&&chrome.storage.local.get(["acadmail_settings"],s=>{const l=s.acadmail_settings||{},c=l.labelOverrides||{};c[t]=i,e&&(c[e]=i),r&&(c[r]=i),chrome.storage.local.set({acadmail_settings:{...l,labelOverrides:c}})}),L(),q(),M({type:"EMAIL_CHANGED"}),ee(`Email re-labeled as "${i}"`)}function oe(t,e){var r;if(!t.trim())return;const n=e.split(",").map(a=>a.trim().toLowerCase()).filter(Boolean),i={id:`filter-${Date.now()}`,name:t.trim(),color:"#8b5cf6",keywords:n.length>0?n:[t.trim().toLowerCase()]};$.push(i),typeof chrome<"u"&&((r=chrome.storage)!=null&&r.local)&&chrome.storage.local.get(["acadmail_settings"],a=>{const s=a.acadmail_settings||{},l=s.customFilters||[];chrome.storage.local.set({acadmail_settings:{...s,customFilters:[...l,i]}})}),L(),M({type:"UPDATE_CUSTOM_FILTERS"}),ee(`Created filter "${i.name}"`)}function X(t,e,n,i){const r=(t||"").toLowerCase(),a=(e||"").toLowerCase(),s=(n||"").toLowerCase(),l=`${r} ${a} ${s}`,c=t.match(/\b([A-Z]{2,4}\s?[-_]?\s?\d{3,4}[A-Z]?)\b/i),o=c?c[1].toUpperCase():void 0;if(i&&T[i])return{category:T[i],courseCode:o};if(T[t])return{category:T[t],courseCode:o};const m=`${t}::${e}`.trim();if(T[m])return{category:T[m],courseCode:o};if(l.includes("viva")||l.includes("viva-voce")||l.includes("viva voce")||l.includes("oral defense")||l.includes("thesis defense")||l.includes("phd defense")||l.includes("ph.d. defense")||l.includes("synopsis presentation")||l.includes("synopsis submission")||l.includes("ph.d. viva")||l.includes("phd viva")||l.includes("doctoral defense")||l.includes("comprehensive exam presentation"))return{category:"General",courseCode:o,isPhd:!0};const u={"Class Rescheduling":0,"Competitions & Tournaments":0,Workshops:0,Academics:o?5:0,Assignment:0,General:1};$&&$.length>0&&$.forEach(g=>{u[g.name]=0});const f=(g,A,E,I=[])=>{let y=0;for(const S of A)r.includes(S)?y+=6:s.includes(S)&&(y+=3);for(const S of E)r.includes(S)?y+=3.5:s.includes(S)&&(y+=1.5);for(const S of I)a.includes(S)&&(y+=2.5);u[g]!==void 0&&(u[g]+=y)};f("Class Rescheduling",["reschedule","rescheduled","class cancelled","class canceled","lecture cancelled","no class today","no class","extra class","room change","venue change","timing change","rescheduled lecture","swapped class"],["cancelled","canceled","postpone","postponed","lecture timing","timing","schedule change"],["acad","timetable"]),f("Competitions & Tournaments",["competition","tournament","hackathon","sociothon","ideathon","devfolio","open trials","inter-iit","inter iit","inter-hostel","inter-college","championship","prize pool","cash prize","case competition","quiz competition","coding contest","athletics"],["contest","trials","sports","cricket","football","badminton","volleyball","table tennis","chess","squash","esports","case comp","challenge","mushaira","trophy"],["sports","gymkhana","cultural","council","club"]),f("Workshops",["workshop","bootcamp","masterclass","hands-on session","distinguished lecture","guest lecture","orientation talk","intro talk","intro talks","introductory talk","conclave","symposium","info session","tech talk"],["webinar","seminar","talk by","opening talk","hands-on","enactus","sdslabs","pragati","hr conclave","panel discussion"],["seminar","chapter","society","ieee","acm"]),f("Academics",["syllabus","midterm","endterm","quiz","exam","examination","lab manual","grading","grade submission","project evaluation","teaching day"],["classroom","lecture","office hours","ug-i","ug-ii","pg-i","coursework","grades"],["acad","instructor"]),f("Assignment",["assignment","assignments","tutorial","tutorials","homework","problem set","problem sets","pset","psets","lab submission","lab assignment","assignment submission","tutorial sheet","tutorial problem","tutorial problems","programming assignment"],["submission","submissions","due date","submit by","solution sheet","turnin"],[]),u.Assignment>0&&o&&(u.Assignment+=5),$&&$.length>0&&$.forEach(g=>{g.name.toLowerCase()==="assignment"||g.keywords&&g.keywords.length>0&&f(g.name,g.keywords,[g.name.toLowerCase()],[])});const b=R&&R.length>0?[...R]:G&&G.length>0?[...G]:["Assignment","Academics","Competitions & Tournaments","Class Rescheduling"],x=b.indexOf("Academics");x!==-1&&b.indexOf("Assignment")===-1&&b.splice(x,0,"Assignment");const v={},k=Object.keys(u);k.forEach(g=>{const A=u[g];if(A<=0){v[g]=0;return}const E=b.indexOf(g);if(E!==-1){const I=Math.max(2.5,12-E*3.5),y=Math.max(4,30-E*8);v[g]=A*I+y}else v[g]=A});const p=k.some(g=>g!=="General"&&u[g]>0);let h="General",w=0;return p||o?k.forEach(g=>{v[g]>w&&(w=v[g],h=g)}):h="General",{category:h,courseCode:o,isPhd:!1}}document.addEventListener("click",t=>{t.target.closest("tr.zA")&&(setTimeout(()=>{M({type:"EMAIL_CHANGED"}),q()},350),setTimeout(()=>{M({type:"EMAIL_CHANGED"}),q()},800))},!0);function L(){const t=document.querySelectorAll("tr.zA"),e=[];return t.forEach((n,i)=>{var h,w,g,A;const r=n,a=r.querySelector(".bqe, .bog, span[data-thread-id]"),s=((h=a==null?void 0:a.textContent)==null?void 0:h.trim())||"(No Subject)",l=r.querySelector(".bA4 span, .yP, .zF"),c=((w=l==null?void 0:l.textContent)==null?void 0:w.trim())||"Unknown",o=r.querySelector(".y2"),m=((g=o==null?void 0:o.textContent)==null?void 0:g.trim())||"",d=r.querySelector(".xW span"),u=((A=d==null?void 0:d.textContent)==null?void 0:A.trim())||"Recent",f=!r.classList.contains("zE"),b=`${s}::${c}`.trim(),{category:x,courseCode:v,isPhd:k}=X(s,c,m,b),p={id:`row-${i}-${s.slice(0,15).replace(/[^a-zA-Z0-9]/g,"_")}`,index:i,subject:s,sender:c,snippet:m,date:u,category:x,courseCode:v,isRead:f};e.push(p),ie(r,x,v,k,s,c)}),N=e,C==="blended"&&e.length>0&&te(e),e}function ie(t,e,n,i,r,a){const s=t.querySelector(".acadmail-row-badge");s&&s.remove();const l=t.querySelector(".y6, .bog");if(!l)return;const c=z(),o=document.createElement("span");o.className="acadmail-row-badge";let m=c?"background: rgba(56, 139, 253, 0.15); color: #79c0ff; border: 1px solid rgba(56, 139, 253, 0.3);":"background: #edf5fd; color: #1a73e8; border: 1px solid #d2e3fc;",d=n||"Acads";e==="Competitions & Tournaments"?(m=c?"background: rgba(210, 153, 34, 0.15); color: #e3b341; border: 1px solid rgba(210, 153, 34, 0.3);":"background: #fef7e0; color: #b06000; border: 1px solid #fce8b2;",d="Contest"):e==="Workshops"?(m=c?"background: rgba(46, 160, 67, 0.15); color: #7ee787; border: 1px solid rgba(46, 160, 67, 0.3);":"background: #e6f4ea; color: #137333; border: 1px solid #ceead6;",d="Workshop"):e==="Class Rescheduling"?(m=c?"background: rgba(248, 81, 73, 0.15); color: #ff7b72; border: 1px solid rgba(248, 81, 73, 0.3);":"background: #fce8e6; color: #c5221f; border: 1px solid #fad2cf;",d="Rescheduled"):i?(m=c?"background: rgba(142, 145, 143, 0.15); color: #c4c7c5; border: 1px solid rgba(142, 145, 143, 0.3);":"background: #f1f3f4; color: #5f6368; border: 1px solid #dadce0;",d="PhD / Viva"):e==="General"?(m=c?"background: rgba(142, 145, 143, 0.12); color: #c4c7c5; border: 1px solid rgba(142, 145, 143, 0.2);":"background: #f8f9fa; color: #5f6368; border: 1px solid #dadce0;",d="General"):(m=c?"background: rgba(168, 85, 247, 0.15); color: #c084fc; border: 1px solid rgba(168, 85, 247, 0.3);":"background: #f3e8ff; color: #7e22ce; border: 1px solid #e9d5ff;",d=e),o.setAttribute("style",`
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
  `),o.innerText=d,o.title=n?`Filter Gmail for ${n} (Right-click to change label)`:`Category: ${e} (Click to change)`,o.onclick=u=>{u.stopPropagation(),n?ae(n):O(o,r,a,e)},o.oncontextmenu=u=>{u.preventDefault(),u.stopPropagation(),O(o,r,a,e)},l.prepend(o)}function ae(t){const e=document.querySelector('input[name="q"], input[aria-label*="Search"]');if(e){e.value=t,e.dispatchEvent(new Event("input",{bubbles:!0}));const n=e.closest("form");n?n.dispatchEvent(new Event("submit",{bubbles:!0,cancelable:!0})):e.dispatchEvent(new KeyboardEvent("keydown",{key:"Enter",keyCode:13,bubbles:!0}))}}function F(t){P=t,document.querySelectorAll("tr.zA").forEach(n=>{const i=n;if(t==="ALL"){i.style.display="";return}const r=i.querySelector(".acadmail-row-badge"),a=(r==null?void 0:r.textContent)||"";let s=!1;(t==="Academics"&&(a.includes("🎓")||a.includes("Acads"))||t==="Competitions & Tournaments"&&(a.includes("🏆")||a.includes("Contest"))||t==="Workshops"&&(a.includes("🛠️")||a.includes("Workshop"))||t==="Class Rescheduling"&&(a.includes("⏰")||a.includes("Rescheduled"))||t==="General"&&(a.includes("📢")||a.includes("General")||a.includes("PhD"))||a.toLowerCase().includes(t.toLowerCase()))&&(s=!0),s?i.style.display="":i.style.display="none"}),re()}function Q(t,e,n){const i="https://calendar.google.com/calendar/render?action=TEMPLATE";let r="";if(n){const s=new Date(n);if(!isNaN(s.getTime())){const l=s.toISOString().replace(/-|:|\.\d\d\d/g,""),o=new Date(s.getTime()+3600*1e3).toISOString().replace(/-|:|\.\d\d\d/g,"");r=`&dates=${l}/${o}`}}const a=new URLSearchParams({text:`[AcadMail] ${t}`,details:`${e}

— Auto-extracted by AcadMail AI`});return`${i}&${a.toString()}${r}`}function ee(t){const e=document.getElementById("acadmail-toast");e&&e.remove();const n=document.createElement("div");n.id="acadmail-toast",n.innerText=t,n.setAttribute("style",`
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
  `),document.body.appendChild(n),setTimeout(()=>n.remove(),2500)}function te(t){var k;if(C!=="blended")return;const e=document.querySelector('div[gh="tm"]')||document.querySelector("div.G-atb")||document.querySelector("div.aeF");if(!e)return;if(!document.getElementById("acadmail-m3-css")){const p=document.createElement("style");p.id="acadmail-m3-css",p.textContent=`
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
    `,document.head.appendChild(p)}let n=0,i=0,r=0,a=0,s=0;const l=/\b(?:due|deadline|by|on|date:|till)\s+([A-Za-z]{3,9}\s+\d{1,2}(?:st|nd|rd|th)?(?:\s*,\s*\d{4})?|\d{1,2}\/\d{1,2}(?:\/\d{2,4})?|\d{1,2}\s+[A-Za-z]{3,9})\b/gi,c=[];t.forEach(p=>{p.category==="Academics"?n++:p.category==="Competitions & Tournaments"?i++:p.category==="Workshops"?r++:p.category==="Class Rescheduling"?a++:p.category==="General"&&s++;const w=[...`${p.subject} ${p.snippet}`.matchAll(l)];w.length>0&&c.push({title:p.subject,deadline:w[0][1]})});const o=z();let m=document.getElementById("acadmail-native-chip-bar");m||(m=document.createElement("div"),m.id="acadmail-native-chip-bar",m.setAttribute("style",`
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
    `),(k=e.parentElement)==null||k.insertBefore(m,e.nextSibling||e));const d=p=>P===p?`
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
    `,u=(p,h)=>`<span class="m3-chip-count" style="background: ${P===p?o?"rgba(194, 231, 255, 0.22)":"rgba(0, 29, 53, 0.12)":o?"rgba(255, 255, 255, 0.1)":"rgba(0, 0, 0, 0.06)"}; color: inherit;">${h}</span>`;m.innerHTML=`
    <!-- Left: Slim Google Material 3 Chips (Defaults + Dynamic Custom Filters) -->
    <div id="acadmail-chip-scroll-track" style="display: flex; align-items: center; gap: 8px; overflow-x: auto; scrollbar-width: none; -ms-overflow-style: none; flex: 1; min-width: 0; padding: 2px 0;">
      
      <!-- Brand Pill -->
      <div style="display: inline-flex; align-items: center; gap: 6px; height: 32px; box-sizing: border-box; padding: 0 10px; border-radius: 6px; background: ${o?"rgba(56, 139, 253, 0.12)":"rgba(26, 115, 232, 0.08)"}; color: ${o?"#79c0ff":"#1a73e8"}; flex-shrink: 0; white-space: nowrap; margin-right: 4px; border: 1px solid ${o?"rgba(56, 139, 253, 0.25)":"rgba(26, 115, 232, 0.2)"};">
        <img src="${chrome.runtime.getURL("icons/envelope-logo.png")}" alt="AcadMail" style="width: 17px; height: 17px; border-radius: 3px; object-fit: contain;" />
        <span style="font-family: 'Batangas', Roboto, sans-serif; font-weight: 700; font-size: 13px; letter-spacing: 0.2px;">AcadMail</span>
      </div>

      <!-- 1. All Emails -->
      <button class="m3-chip" data-cat="ALL" style="${d("ALL")}">
        <span>All</span>
        ${u("ALL",t.length)}
      </button>

      <!-- 2. Academics -->
      <button class="m3-chip" data-cat="Academics" style="${d("Academics")}">
        <span>Academics</span>
        ${u("Academics",n)}
      </button>

      <!-- 3. Competitions -->
      <button class="m3-chip" data-cat="Competitions & Tournaments" style="${d("Competitions & Tournaments")}">
        <span>Contests</span>
        ${u("Competitions & Tournaments",i)}
      </button>

      <!-- 4. Workshops -->
      <button class="m3-chip" data-cat="Workshops" style="${d("Workshops")}">
        <span>Workshops</span>
        ${u("Workshops",r)}
      </button>

      <!-- 5. Reschedules -->
      <button class="m3-chip" data-cat="Class Rescheduling" style="${d("Class Rescheduling")}">
        <span>Rescheduled</span>
        ${u("Class Rescheduling",a)}
      </button>

      <!-- 6. General -->
      <button class="m3-chip" data-cat="General" style="${d("General")}">
        <span>General & PhD</span>
        ${u("General",s)}
      </button>

      <!-- 7. Dynamic User-Defined Custom Filters -->
      ${$.map(p=>{const h=t.filter(w=>w.category===p.name).length;return`
          <button class="m3-chip" data-cat="${p.name}" style="${d(p.name)}">
            <span>${p.name}</span>
            ${u(p.name,h)}
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
              ${c.map(p=>`
                <div style="padding: 8px 10px; background: ${o?"#2b2c2f":"#f8fafd"}; border-radius: 6px; display: flex; align-items: center; justify-content: space-between; gap: 8px;">
                  <div style="overflow: hidden; flex: 1;">
                    <div style="font-size: 11.5px; font-weight: 500; color: ${o?"#e3e3e3":"#1f1f1f"}; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${p.title}</div>
                    <div style="font-size: 10.5px; color: ${o?"#e3b341":"#b45309"}; font-weight: 600; margin-top: 2px;">⏰ ${p.deadline}</div>
                  </div>
                  <a href="${Q(p.title,"Course deadline from email",p.deadline)}" target="_blank" style="text-decoration: none; flex-shrink: 0; padding: 3px 8px; background: ${o?"#004a77":"#c2e7ff"}; color: ${o?"#c2e7ff":"#001d35"}; border-radius: 4px; font-size: 10.5px; font-weight: 600;">+ GCal</a>
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
  `,m.querySelectorAll(".m3-chip").forEach(p=>{const h=p;h.onclick=()=>{const w=h.getAttribute("data-cat");F(P===w&&w!=="ALL"?"ALL":w)}});const f=m.querySelector("#m3-add-filter-chip");f&&(f.onclick=()=>se());const b=m.querySelector("#m3-deadlines-btn"),x=m.querySelector("#m3-deadlines-popover");b&&x&&(b.onclick=p=>{p.stopPropagation(),x.style.display=x.style.display==="block"?"none":"block"},document.addEventListener("click",p=>{!x.contains(p.target)&&p.target!==b&&(x.style.display="none")}));const v=m.querySelector("#acadmail-instant-revert-btn");v&&(v.onclick=()=>{var p;C="off",typeof chrome<"u"&&((p=chrome.storage)!=null&&p.local)&&chrome.storage.local.get(["acadmail_settings"],h=>{const w=h.acadmail_settings||{};chrome.storage.local.set({acadmail_settings:{...w,uiMode:"off",inPageIntegration:!1}})}),W()})}function se(){const t=document.getElementById("acadmail-add-filter-modal");if(t){t.remove();return}const e=z(),n=document.createElement("div");n.id="acadmail-add-filter-modal",n.setAttribute("style",`
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
  `,document.body.appendChild(n);const i=n.querySelector("#modal-close-btn"),r=n.querySelector("#modal-cancel-btn"),a=n.querySelector("#modal-save-btn"),s=n.querySelector("#new-filter-name"),l=n.querySelector("#new-filter-keywords");i.onclick=()=>n.remove(),r.onclick=()=>n.remove(),a.onclick=()=>{const c=s.value.trim(),o=l.value.trim();c&&(oe(c,o),n.remove())}}function O(t,e,n,i){const r=document.getElementById("acadmail-relabel-popup");if(r){r.remove();return}const a=z(),s=t.getBoundingClientRect(),l=document.createElement("div");l.id="acadmail-relabel-popup",l.setAttribute("style",`
    position: fixed;
    top: ${s.bottom+4}px;
    left: ${Math.min(s.left,window.innerWidth-220)}px;
    width: 210px;
    background: ${a?"#1e1f20":"#ffffff"};
    border: 1px solid ${a?"#444746":"#e0e2ec"};
    border-radius: 12px;
    box-shadow: 0 10px 25px rgba(0,0,0,0.2);
    padding: 6px;
    z-index: 9999999;
    font-family: -apple-system, BlinkMacSystemFont, "Google Sans", Roboto, sans-serif;
  `);const c=["Academics","Competitions & Tournaments","Workshops","Class Rescheduling","General"],o=[...c,...$.map(d=>d.name).filter(d=>!c.includes(d))];l.innerHTML=`
    <div style="padding: 4px 8px; font-size: 10px; font-weight: 700; color: ${a?"#8e918f":"#64748b"}; text-transform: uppercase; border-bottom: 1px solid ${a?"#333537":"#f1f5f9"};">
      Change Category Label
    </div>
    <div style="display: flex; flex-direction: column; gap: 2px; padding-top: 4px; max-height: 200px; overflow-y: auto;">
      ${o.map(d=>`
        <button class="relabel-opt" data-cat="${d}" style="text-align: left; padding: 6px 8px; border-radius: 6px; border: none; background: ${d===i?a?"#004a77":"#c2e7ff":"transparent"}; color: ${d===i?a?"#c2e7ff":"#001d35":a?"#e3e3e3":"#1f1f1f"}; font-size: 11.5px; font-weight: ${d===i?"600":"400"}; cursor: pointer; display: flex; align-items: center; justify-content: space-between;">
          <span>${d}</span>
          ${d===i?"<span>✓</span>":""}
        </button>
      `).join("")}
    </div>
  `,document.body.appendChild(l),l.querySelectorAll(".relabel-opt").forEach(d=>{const u=d;u.onclick=f=>{f.stopPropagation();const b=u.getAttribute("data-cat")||"General";V(e,e,n,b),l.remove()}});const m=d=>{!l.contains(d.target)&&!t.contains(d.target)&&(l.remove(),document.removeEventListener("click",m))};setTimeout(()=>document.addEventListener("click",m),50)}function re(){C==="blended"&&N.length>0&&te(N)}function q(){var g,A,E,I;if(C==="off")return;const t=ne();if(!t){(g=document.getElementById("acadmail-email-brief-card"))==null||g.remove();return}const e=document.querySelector("div.ha")||((A=document.querySelector("h2.hP"))==null?void 0:A.parentElement)||((E=document.querySelector('div[role="main"] h2'))==null?void 0:E.parentElement);if(!e)return;const n=document.getElementById("acadmail-email-brief-card"),i=n==null?void 0:n.getAttribute("data-email-id");if(n&&i===t.id)return;n&&n.remove();const r=X(t.subject,t.senderName,t.bodyText,t.id),a=`${t.subject} ${t.bodyText}`,s=/\b(?:due|deadline|by|on|date:|till)\s+([A-Za-z]{3,9}\s+\d{1,2}(?:st|nd|rd|th)?(?:\s*,\s*\d{4})?|\d{1,2}\/\d{1,2}(?:\/\d{2,4})?|\d{1,2}\s+[A-Za-z]{3,9})\b/i,l=a.match(s),c=l?l[1]:null,o=a.match(/https?:\/\/(?:[a-zA-Z0-9-]+\.)?(?:zoom\.us\/j|meet\.google\.com|teams\.microsoft\.com\/l)\/[^\s<>"']+/i),m=o?o[0]:null,u=t.bodyText.split(/\.\s+/).map(y=>y.trim()).filter(y=>y.length>25&&!y.includes("http")&&!y.includes("unsubscribe")&&!y.includes("Regards")).slice(0,3);u.length===0&&u.push(`Announcement regarding ${t.subject} from ${t.senderName}.`);const f=z(),b=document.createElement("div");b.id="acadmail-email-brief-card",b.setAttribute("data-email-id",t.id),b.setAttribute("style",`
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
        <img src="${chrome.runtime.getURL("icons/envelope-logo.png")}" alt="AcadMail" style="width: 14px; height: 14px; border-radius: 2.5px; object-fit: contain; flex-shrink: 0;" />
        <span style="font-family: 'Batangas', Roboto, sans-serif; font-weight: 700; font-size: 12px; color: ${f?"#79c0ff":"#1a73e8"}; shrink: 0;">AcadMail:</span>
        <span style="font-size: 11.5px; color: ${f?"#c4c7c5":"#475569"}; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
          ${c?`⏰ Due: <strong>${c}</strong> • `:""}${u[0]}
        </span>
      </div>

      <div style="display: flex; align-items: center; gap: 5px; shrink: 0;">
        <!-- Category Chip with Re-label button -->
        <span style="padding: 1px 7px; border-radius: 4px; font-size: 10px; font-weight: 600; background: ${f?"rgba(56, 139, 253, 0.2)":"#e8f0fe"}; color: ${f?"#79c0ff":"#1a73e8"};">
          ${r.category}
        </span>

        <button id="acadmail-brief-relabel-btn" title="Change this email's category label" style="cursor: pointer; padding: 2px 5px; border-radius: 4px; border: 1px dashed ${f?"#444746":"#cbd5e1"}; background: transparent; font-size: 10px; font-weight: 500; color: ${f?"#a8c7fa":"#1a73e8"};">
          ✎ Relabel
        </button>

        ${c?`
          <a href="${Q(t.subject,t.bodyText.slice(0,300),c)}" target="_blank" style="text-decoration: none; padding: 2px 7px; background: ${f?"#004a77":"#c2e7ff"}; color: ${f?"#c2e7ff":"#001d35"}; border-radius: 6px; font-size: 10px; font-weight: 600;">+ GCal</a>
        `:""}
        <button id="m3-brief-expand-btn" style="cursor: pointer; padding: 2px 6px; border-radius: 4px; border: 1px solid ${f?"#444746":"#d2e3fc"}; background: transparent; font-size: 10px; font-weight: 600; color: ${f?"#79c0ff":"#1a73e8"};">
          ${D?"Collapse ▴":"Details ▾"}
        </button>
        <button id="m3-brief-dismiss-btn" title="Dismiss card" style="cursor: pointer; padding: 2px 4px; border: none; background: transparent; color: #94a3b8; font-size: 11px;">✕</button>
      </div>
    </div>

    <!-- Expandable Drawer Details -->
    <div id="m3-brief-drawer" style="display: ${D?"flex":"none"}; flex-direction: column; gap: 8px; margin-top: 8px; padding-top: 8px; border-top: 1px dashed ${f?"#333537":"#e0e2ec"};">
      <ul style="margin: 0; padding-left: 16px; display: flex; flex-direction: column; gap: 3px; font-size: 11.5px; color: ${f?"#c4c7c5":"#334155"}; line-height: 1.45;">
        ${u.map(y=>`<li>${y}</li>`).join("")}
      </ul>

      <!-- Action Row: Meeting Links + Quick Reply Chips -->
      <div style="display: flex; flex-wrap: wrap; align-items: center; gap: 6px; padding-top: 2px;">
        ${m?`
          <a href="${m}" target="_blank" style="text-decoration: none; display: inline-flex; align-items: center; gap: 4px; padding: 3px 8px; background: ${f?"#143e2e":"#e6f4ea"}; color: ${f?"#a7f3d0":"#137333"}; border-radius: 6px; font-size: 10.5px; font-weight: 600;">
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
  `;const x=b.querySelector("#acadmail-brief-relabel-btn");x&&(x.onclick=y=>{y.stopPropagation(),O(x,t.subject,t.senderName,r.category)});const v=b.querySelector("#m3-brief-drawer"),k=b.querySelector("#m3-brief-expand-btn"),p=b.querySelector("#m3-brief-toggle-line"),h=()=>{D=!D,v.style.display=D?"flex":"none",k.innerText=D?"Collapse ▴":"Details ▾"};k.onclick=h,p.onclick=h;const w=b.querySelector("#m3-brief-dismiss-btn");w&&(w.onclick=()=>b.remove()),b.querySelectorAll(".m3-quick-reply-btn").forEach(y=>{const S=y;S.onclick=async()=>{const Z=S.getAttribute("data-reply");let _="";Z==="confirm"?_=`Dear ${t.senderName||"Professor"},

Thank you for the update regarding "${t.subject}". I confirm my participation and will ensure all prerequisites are met.

Best regards,
[Your Name]
[Student ID]`:Z==="extension"?_=`Dear Professor ${t.senderName||""},

I hope this email finds you well. I am writing to respectfully ask if it might be possible to grant a short extension on the submission for "${t.subject}". I want to ensure my work meets the highest standards.

Thank you for your time and understanding.

Sincerely,
[Your Name]
[Student ID]`:_=`Dear Professor ${t.senderName||""},

I hope you are well. Regarding the announcement on "${t.subject}", I had a quick question regarding the specifications and would appreciate some guidance.

Thank you very much.

Sincerely,
[Your Name]
[Student ID]`,await le(_,S)}}),(I=e.parentElement)==null||I.insertBefore(b,e.nextSibling)}async function le(t,e){const n=e.innerText;e.innerText="Drafting...";const i=document.querySelector('div[role="button"][aria-label*="Reply"]')||document.querySelector(".ams.bkH")||document.querySelector('.T-I.J-J5-Ji.T-I-Js-IF[data-tooltip*="Reply"]')||document.querySelector('span[role="button"][aria-label*="Reply"]');i&&i.click();let r=0;const a=setInterval(()=>{r++;const s=document.querySelector('div[aria-label="Message Body"], div[role="textbox"][contenteditable="true"]');s?(clearInterval(a),s.focus(),s.innerText=t,s.dispatchEvent(new Event("input",{bubbles:!0})),s.scrollIntoView({behavior:"smooth",block:"center"}),e.innerText="✅ Drafted!",setTimeout(()=>{e.innerText=n},2500)):r>15&&(clearInterval(a),e.innerText="⚠️ Click Reply first",setTimeout(()=>{e.innerText=n},2e3))},200)}function j(){if(C==="off"||document.getElementById("acadmail-siderail-btn"))return;const t=document.querySelector("div.aDG")||document.querySelector('div[aria-label="Side panel"]')||document.querySelector("div.bq9");if(!t)return;const e=document.createElement("div");e.id="acadmail-siderail-btn",e.title="AcadMail AI Copilot",e.setAttribute("role","button"),e.setAttribute("tabindex","0");const n=z();e.setAttribute("style",`
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
  `,e.onmouseenter=()=>e.style.background=n?"rgba(255,255,255,0.08)":"rgba(0,0,0,0.06)",e.onmouseleave=()=>e.style.background="transparent",e.onclick=()=>M({type:"OPEN_SIDEPANEL"}),t.prepend(e)}function ne(){var r,a,s,l,c;const t=document.querySelector("h2.hP")||document.querySelector("div.ha h2")||document.querySelector('div[role="main"] h2')||document.querySelector("h2[data-legacy-thread-id]")||document.querySelector("h1[data-thread-perm-id]"),e=((r=t==null?void 0:t.textContent)==null?void 0:r.trim())||"",n=document.querySelectorAll('.a3s.aiL, div[role="listitem"] .adn .a3s, .ii.gt, div.adn.ads');let i="";if(n.length>0&&(i=((a=n[n.length-1].textContent)==null?void 0:a.trim())||""),e&&(i||n.length>0)){const o=document.querySelector("span[email]")||document.querySelector(".gD")||document.querySelector(".go")||document.querySelector("span.zF"),m=(o==null?void 0:o.getAttribute("email"))||((s=o==null?void 0:o.textContent)==null?void 0:s.trim())||"academic@university.edu",d=(o==null?void 0:o.getAttribute("name"))||((l=o==null?void 0:o.textContent)==null?void 0:l.trim())||"Academic Sender",u=document.querySelector(".g3")||document.querySelector("span.mI")||document.querySelector(".date"),f=(u==null?void 0:u.getAttribute("title"))||((c=u==null?void 0:u.textContent)==null?void 0:c.trim())||new Date().toLocaleString();return{id:(window.location.hash||"").replace(/[^a-zA-Z0-9_-]/g,"_")||`email-${Date.now()}`,subject:e,senderName:d,senderEmail:m,recipient:"Me",dateStr:f,bodyText:i.slice(0,5e3),url:window.location.href}}return null}function H(){document.querySelectorAll("tr.btC, .gU.Up").forEach(e=>{if(e.querySelector(".acadmail-polish-btn"))return;const n=document.createElement("div");n.className="acadmail-polish-btn",n.setAttribute("style",`
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
    `,n.onclick=i=>{i.stopPropagation(),ce(e,n)},e.appendChild(n)})}function ce(t,e){var c;const n=document.getElementById("acadmail-tone-menu");if(n){n.remove();return}const i=t.closest('div[role="dialog"]')||t.closest(".M9"),r=i==null?void 0:i.querySelector('div[aria-label="Message Body"], div[contenteditable="true"]'),a=((c=r==null?void 0:r.innerText)==null?void 0:c.trim())||"",s=document.createElement("div");s.id="acadmail-tone-menu",s.setAttribute("style",`
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
  `,s.querySelectorAll(".acad-tone-opt").forEach(o=>{const m=o;m.onclick=async()=>{const d=m.getAttribute("data-tone")||"formal";s.remove(),await de(r,a,d,e)}}),e.appendChild(s);const l=o=>{!s.contains(o.target)&&!e.contains(o.target)&&(s.remove(),document.removeEventListener("click",l))};setTimeout(()=>document.addEventListener("click",l),100)}async function de(t,e,n,i){if(!t)return;const r=i.innerHTML;i.innerHTML="<span>Polishing...</span>";try{const a=await new Promise(m=>{var d;typeof chrome<"u"&&((d=chrome.storage)!=null&&d.local)?chrome.storage.local.get(["acadmail_settings"],u=>m(u.acadmail_settings||{})):m({})}),s=a.apiKey||"",l=a.groqApiKey||"",o=await pe(e||"Need extension for lab assignment due this friday because of fever.",n,s,l);t.focus(),t.innerText=o,t.dispatchEvent(new Event("input",{bubbles:!0})),i.innerHTML="<span>Polished!</span>",setTimeout(()=>{i.innerHTML=r},2e3)}catch{i.innerHTML="<span>Error</span>",setTimeout(()=>{i.innerHTML=r},2e3)}}async function pe(t,e,n,i){var s,l,c,o,m,d,u,f,b;const a=`Transform this student's rough notes into a courteous, polished academic email to a professor.
Tone: ${{formal:"Polite, professional academic tone to a professor.",extension:"Polite, respectful request for an assignment deadline extension showing dedication.",doubt:"Polite conceptual question or office hours request referencing lecture material.",lor:"Courteous inquiry requesting a Letter of Recommendation for graduate studies/internships."}[e]||"Formal"}
Guidelines:
- Include respectful salutation ("Dear Professor [Name],", "I hope this email finds you well.")
- Keep it concise, courteous, and respectful.
- Retain all dates, assignment titles, or reasons mentioned.
- Conclude with a warm academic sign-off ("Sincerely,", "Best regards," followed by "[Your Name] [Student ID]").
- Output ONLY the final email text.

Student's notes:
${t}`;if(i&&i.trim())try{const x=await fetch("https://api.groq.com/openai/v1/chat/completions",{method:"POST",headers:{Authorization:`Bearer ${i.trim()}`,"Content-Type":"application/json"},body:JSON.stringify({model:"llama-3.3-70b-versatile",messages:[{role:"user",content:a}],temperature:.3})});if(x.ok)return((o=(c=(l=(s=(await x.json()).choices)==null?void 0:s[0])==null?void 0:l.message)==null?void 0:c.content)==null?void 0:o.trim())||t}catch{}if(n&&n.trim()){const x=["models/gemini-2.0-flash","models/gemini-3.8-flash","models/gemini-1.5-flash"];for(const v of x)try{const k=await fetch(`https://generativelanguage.googleapis.com/v1beta/${v}:generateContent?key=${n.trim()}`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({contents:[{parts:[{text:a}]}],generationConfig:{temperature:.3}})});if(k.ok){const p=await k.json(),h=(b=(f=(u=(d=(m=p==null?void 0:p.candidates)==null?void 0:m[0])==null?void 0:d.content)==null?void 0:u.parts)==null?void 0:f[0])==null?void 0:b.text;if(h)return h.trim()}}catch{}}return`Dear Professor,

I hope this email finds you well.

I am writing to respectfully request your guidance regarding ${t}.

Thank you for your time and consideration.

Sincerely,
[Your Name]
[Student ID]`}var K;typeof chrome<"u"&&((K=chrome.runtime)!=null&&K.onMessage)&&chrome.runtime.onMessage.addListener((t,e,n)=>{if(t.type==="GET_ACTIVE_EMAIL"){const i=ne();n({email:i})}else if(t.type==="SCAN_INBOX"){const i=L();n({items:i})}else t.type==="FILTER_GMAIL_DOM"?(F(t.category),n({success:!0})):t.type==="SET_UI_MODE"?(C=t.mode,W(),n({success:!0})):t.type==="RELABEL_EMAIL"?(V(t.emailId,t.subject||"",t.sender||"",t.newCategory),n({success:!0})):(t.type==="UPDATE_CUSTOM_FILTERS"||t.type==="UPDATE_SETTINGS")&&(Array.isArray(t.priorityList)&&(R=t.priorityList,G=t.priorityList),U(),setTimeout(L,150),n({success:!0}));return!0});var Y;typeof chrome<"u"&&((Y=chrome.storage)!=null&&Y.onChanged)&&chrome.storage.onChanged.addListener((t,e)=>{e==="local"&&t.acadmail_settings&&(U(),setTimeout(L,300))});U();document.readyState==="loading"?document.addEventListener("DOMContentLoaded",()=>{setTimeout(L,1200),setTimeout(q,1200),setTimeout(j,1200),setTimeout(H,1200),setTimeout(B,1200)}):(setTimeout(L,1200),setTimeout(q,1200),setTimeout(j,1200),setTimeout(H,1200),setTimeout(B,1200));let J=location.href;new MutationObserver(()=>{const t=location.href;t!==J&&(J=t,setTimeout(()=>{M({type:"EMAIL_CHANGED"}),B(),L(),q(),j()},400)),H()}).observe(document,{subtree:!0,childList:!0});

console.log("[AcadMail AI] Content script active on webmail.");function v(t){var o;try{typeof chrome<"u"&&((o=chrome.runtime)!=null&&o.id)&&chrome.runtime.sendMessage(t).catch(()=>{})}catch{}}function M(t,o,r){const e=`${t} ${o} ${r}`.toLowerCase(),a=t.match(/\b([A-Z]{2,4}\s?[-_]?\s?\d{3,4}[A-Z]?)\b/i),n=a?a[1].toUpperCase():void 0;return e.includes("viva")||e.includes("viva-voce")||e.includes("viva voce")||e.includes("oral defense")||e.includes("thesis defense")||e.includes("phd defense")||e.includes("ph.d. defense")||e.includes("synopsis presentation")||e.includes("synopsis submission")||e.includes("ph.d. viva")||e.includes("phd viva")||e.includes("doctoral defense")?{category:"General",courseCode:n,isPhd:!0}:e.includes("reschedule")||e.includes("rescheduled")||e.includes("postpone")||e.includes("postponed")||e.includes("cancelled")||e.includes("class canceled")||e.includes("venue change")||e.includes("room change")||e.includes("lecture timing")||e.includes("no class today")||e.includes("extra class")?{category:"Class Rescheduling",courseCode:n}:e.includes("competition")||e.includes("tournament")||e.includes("contest")||e.includes("hackathon")||e.includes("sociothon")||e.includes("devfolio")||e.includes("trials")||e.includes("open trials")||e.includes("inter-iit")||e.includes("inter iit")||e.includes("inter-hostel")||e.includes("inter hostel")||e.includes("inter-college")||e.includes("championship")||e.includes("trophy")||e.includes("athletics")||e.includes("sports")||e.includes("cricket")||e.includes("football")||e.includes("badminton")||e.includes("volleyball")||e.includes("table tennis")||e.includes("chess")||e.includes("squash")||e.includes("esports")||e.includes("case competition")||e.includes("case comp")||e.includes("quiz competition")||e.includes("challenge")||e.includes("cash prize")||e.includes("prize pool")||e.includes("mushaira")||e.includes("ideathon")?{category:"Competitions & Tournaments",courseCode:n}:e.includes("intro talk")||e.includes("intro talks")||e.includes("opening talk")||e.includes("introductory talk")||e.includes("orientation talk")||e.includes("info session")||e.includes("tech talk")||e.includes("talk by")||e.includes("distinguished lecture")||e.includes("guest lecture")||e.includes("workshop")||e.includes("webinar")||e.includes("seminar")||e.includes("conclave")||e.includes("symposium")||e.includes("bootcamp")||e.includes("masterclass")||e.includes("hands-on")||e.includes("enactus")||e.includes("sdslabs")||e.includes("pragati")||e.includes("hr conclave")?{category:"Workshops",courseCode:n}:n||e.includes("assignment")||e.includes("homework")||e.includes("syllabus")||e.includes("quiz")||e.includes("midterm")||e.includes("endterm")||e.includes("exam")||e.includes("grade")||e.includes("grading")||e.includes("lab manual")||e.includes("tutorial")||e.includes("office hours")||e.includes("canvas")||e.includes("moodle")||e.includes("classroom")||e.includes("prof.")||e.includes("professor")||e.includes("teaching day")||e.includes("lecture")||e.includes("faculty")||e.includes("ug-i")||e.includes("ug-ii")||e.includes("pg-i")||e.includes("project evaluation")?{category:"Academics",courseCode:n}:{category:"General",courseCode:n}}document.addEventListener("click",t=>{t.target.closest("tr.zA")&&(setTimeout(()=>{v({type:"EMAIL_CHANGED"})},400),setTimeout(()=>{v({type:"EMAIL_CHANGED"})},900))},!0);function w(){const t=document.querySelectorAll("tr.zA");console.log(`[AcadMail AI] Scanning ${t.length} rows.`);const o=[];return t.forEach((r,e)=>{var h,b,k,C;const a=r,n=a.querySelector(".bqe, .bog, span[data-thread-id]"),s=((h=n==null?void 0:n.textContent)==null?void 0:h.trim())||"(No Subject)",c=a.querySelector(".bA4 span, .yP, .zF"),l=((b=c==null?void 0:c.textContent)==null?void 0:b.trim())||"Unknown",i=a.querySelector(".y2"),d=((k=i==null?void 0:i.textContent)==null?void 0:k.trim())||"",u=a.querySelector(".xW span"),p=((C=u==null?void 0:u.textContent)==null?void 0:C.trim())||"Recent",f=!a.classList.contains("zE"),{category:g,courseCode:m,isPhd:y}=M(s,l,d),x={id:`row-${e}-${s.slice(0,15).replace(/[^a-zA-Z0-9]/g,"_")}`,index:e,subject:s,sender:l,snippet:d,date:p,category:g,courseCode:m,isRead:f};o.push(x),L(a,g,m,y)}),o}function L(t,o,r,e){const a=t.querySelector(".acadmail-row-badge");a&&a.remove();const n=t.querySelector(".y6, .bog");if(!n)return;const s=document.createElement("span");s.className="acadmail-row-badge";let c="background: #eff6ff; color: #1d4ed8; border: 1px solid #bfdbfe;",l="🎓",i=r||"Academics";o==="Competitions & Tournaments"?(c="background: #fffbeb; color: #b45309; border: 1px solid #fde68a;",l="🏆",i="Contest / Sports"):o==="Workshops"?(c="background: #ecfdf5; color: #047857; border: 1px solid #a7f3d0;",l="🛠️",i="Workshop / Talk"):o==="Class Rescheduling"?(c="background: #fff1f2; color: #be123c; border: 1px solid #fecdd3;",l="⏰",i="Rescheduled"):e?(c="background: #f8fafc; color: #475569; border: 1px solid #cbd5e1;",l="📜",i="PhD / Viva"):o==="General"&&(c="background: #f1f5f9; color: #475569; border: 1px solid #e2e8f0;",l="📢",i="General"),s.setAttribute("style",`
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
    ${c}
  `),s.innerText=`${l} ${i}`,n.prepend(s)}function I(t){document.querySelectorAll("tr.zA").forEach(r=>{const e=r;if(t==="ALL"){e.style.opacity="1",e.style.display="";return}const a=e.querySelector(".acadmail-row-badge"),n=(a==null?void 0:a.textContent)||"";let s=!1;t==="Academics"&&(n.includes("🎓")||n.includes("Academics"))&&(s=!0),t==="Competitions & Tournaments"&&(n.includes("🏆")||n.includes("Contest"))&&(s=!0),t==="Workshops"&&(n.includes("🛠️")||n.includes("Workshop"))&&(s=!0),t==="Class Rescheduling"&&(n.includes("⏰")||n.includes("Rescheduled"))&&(s=!0),t==="General"&&(n.includes("📢")||n.includes("General")||n.includes("PhD"))&&(s=!0),s?(e.style.opacity="1",e.style.display=""):e.style.opacity="0.22"})}function z(t){const o=document.querySelectorAll("tr.zA");o[t]&&o[t].click()}function P(){var a,n,s,c,l;const t=document.querySelector("h2.hP")||document.querySelector("div.ha h2")||document.querySelector('div[role="main"] h2')||document.querySelector("h2[data-legacy-thread-id]")||document.querySelector("h1[data-thread-perm-id]"),o=((a=t==null?void 0:t.textContent)==null?void 0:a.trim())||"",r=document.querySelectorAll('.a3s.aiL, div[role="listitem"] .adn .a3s, .ii.gt, div.adn.ads');let e="";if(r.length>0&&(e=((n=r[r.length-1].textContent)==null?void 0:n.trim())||""),o&&(e||r.length>0)){const i=document.querySelector("span[email]")||document.querySelector(".gD")||document.querySelector(".go")||document.querySelector("span.zF"),d=(i==null?void 0:i.getAttribute("email"))||((s=i==null?void 0:i.textContent)==null?void 0:s.trim())||"academic@university.edu",u=(i==null?void 0:i.getAttribute("name"))||((c=i==null?void 0:i.textContent)==null?void 0:c.trim())||"Academic Sender",p=document.querySelector(".g3")||document.querySelector("span.mI")||document.querySelector(".date"),f=(p==null?void 0:p.getAttribute("title"))||((l=p==null?void 0:p.textContent)==null?void 0:l.trim())||new Date().toLocaleString();return{id:(window.location.hash||"").replace(/[^a-zA-Z0-9_-]/g,"_")||`email-${Date.now()}`,subject:o,senderName:u,senderEmail:d,recipient:"Me",dateStr:f,bodyText:e.slice(0,5e3),url:window.location.href}}return null}function S(){document.querySelectorAll("tr.btC, .gU.Up").forEach(o=>{if(o.querySelector(".acadmail-polish-btn")||!(o.querySelector("td.gU, .T-I-KE")||o.firstElementChild))return;const e=document.createElement("div");e.className="acadmail-polish-btn",e.setAttribute("style",`
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
    `),e.innerHTML=`
      <span style="font-size: 12px;">✨</span>
      <span>Polish for Professor</span>
    `,e.onmouseenter=()=>{e.style.transform="translateY(-1px)",e.style.boxShadow="0 4px 8px rgba(49, 46, 129, 0.3)"},e.onmouseleave=()=>{e.style.transform="translateY(0)",e.style.boxShadow="0 2px 4px rgba(0,0,0,0.1)"},e.onclick=a=>{a.stopPropagation(),E(o,e)},o.appendChild(e)})}function E(t,o){var l;const r=document.getElementById("acadmail-tone-menu");if(r){r.remove();return}const e=t.closest('div[role="dialog"]')||t.closest(".M9"),a=e==null?void 0:e.querySelector('div[aria-label="Message Body"], div[contenteditable="true"]'),n=((l=a==null?void 0:a.innerText)==null?void 0:l.trim())||"",s=document.createElement("div");s.id="acadmail-tone-menu",s.setAttribute("style",`
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
  `,s.querySelectorAll(".acad-tone-opt").forEach(i=>{const d=i;d.onmouseenter=()=>d.style.background="#f1f5f9",d.onmouseleave=()=>d.style.background="transparent",d.onclick=async()=>{const u=d.getAttribute("data-tone")||"formal";s.remove(),await R(a,n,u,o)}}),o.appendChild(s);const c=i=>{!s.contains(i.target)&&!o.contains(i.target)&&(s.remove(),document.removeEventListener("click",c))};setTimeout(()=>document.addEventListener("click",c),100)}async function R(t,o,r,e){if(!t)return;const a=e.innerHTML;e.innerHTML="<span>⏳</span><span>Polishing...</span>";try{const n=await new Promise(d=>{var u;typeof chrome<"u"&&((u=chrome.storage)!=null&&u.local)?chrome.storage.local.get(["acadmail_settings"],p=>d(p.acadmail_settings||{})):d({})}),s=n.apiKey||"",c=n.groqApiKey||"",i=await D(o||"Need extension for lab 3 assignment due this friday because of fever.",r,s,c);t.focus(),t.innerText=i,t.dispatchEvent(new Event("input",{bubbles:!0})),e.innerHTML="<span>✅</span><span>Polished!</span>",setTimeout(()=>{e.innerHTML=a},2e3)}catch(n){console.error("Polish error:",n),e.innerHTML="<span>⚠️ Error</span>",setTimeout(()=>{e.innerHTML=a},2e3)}}async function D(t,o,r,e){var s,c,l,i,d,u,p,f,g;const n=`Transform this student's rough notes into a courteous, polished academic email to a professor.
Tone: ${{formal:"Polite, professional academic tone to a professor.",extension:"Polite, respectful request for an assignment deadline extension showing dedication.",doubt:"Polite conceptual question or office hours request referencing lecture material.",lor:"Courteous inquiry requesting a Letter of Recommendation for graduate studies/internships."}[o]||"Formal"}
Guidelines:
- Include respectful salutation ("Dear Professor [Name],", "I hope this email finds you well.")
- Keep it concise, courteous, and respectful.
- Retain all dates, assignment titles, or reasons mentioned.
- Conclude with a warm academic sign-off ("Sincerely,", "Best regards," followed by "[Your Name] [Student ID]").
- Output ONLY the final email text.

Student's notes:
${t}`;if(e&&e.trim())try{const m=await fetch("https://api.groq.com/openai/v1/chat/completions",{method:"POST",headers:{Authorization:`Bearer ${e.trim()}`,"Content-Type":"application/json"},body:JSON.stringify({model:"llama-3.3-70b-versatile",messages:[{role:"user",content:n}],temperature:.3})});if(m.ok)return((i=(l=(c=(s=(await m.json()).choices)==null?void 0:s[0])==null?void 0:c.message)==null?void 0:l.content)==null?void 0:i.trim())||t}catch{}if(r&&r.trim()){const m=["models/gemini-2.0-flash","models/gemini-3.8-flash","models/gemini-1.5-flash"];for(const y of m)try{const x=await fetch(`https://generativelanguage.googleapis.com/v1beta/${y}:generateContent?key=${r.trim()}`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({contents:[{parts:[{text:n}]}],generationConfig:{temperature:.3}})});if(x.ok){const h=await x.json(),b=(g=(f=(p=(u=(d=h==null?void 0:h.candidates)==null?void 0:d[0])==null?void 0:u.content)==null?void 0:p.parts)==null?void 0:f[0])==null?void 0:g.text;if(b)return b.trim()}}catch{}}return`Dear Professor,

I hope this email finds you well.

I am writing to respectfully request your guidance regarding ${t}.

Thank you for your time and consideration.

Sincerely,
[Your Name]
[Student ID]`}var q;typeof chrome<"u"&&((q=chrome.runtime)!=null&&q.onMessage)&&chrome.runtime.onMessage.addListener((t,o,r)=>{if(t.type==="GET_ACTIVE_EMAIL"){const e=P();r({email:e})}else if(t.type==="SCAN_INBOX"){const e=w();r({items:e})}else t.type==="FILTER_GMAIL_DOM"?(I(t.category),r({success:!0})):t.type==="CLICK_ROW"&&(z(t.index),r({success:!0}));return!0});function T(){if(document.getElementById("acadmail-floating-trigger"))return;const t=document.createElement("button");t.id="acadmail-floating-trigger",t.innerHTML=`
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
  `),t.onmouseenter=()=>{t.style.transform="translateY(-2px)",t.style.background="#1e293b"},t.onmouseleave=()=>{t.style.transform="translateY(0)",t.style.background="#0f172a"},t.onclick=()=>{v({type:"OPEN_SIDEPANEL"})},document.body.appendChild(t)}document.readyState==="loading"?document.addEventListener("DOMContentLoaded",()=>{T(),setTimeout(w,1200),setTimeout(S,1200)}):(T(),setTimeout(w,1200),setTimeout(S,1200));let A=location.href;new MutationObserver(()=>{const t=location.href;t!==A&&(A=t,setTimeout(()=>{v({type:"EMAIL_CHANGED"}),w()},400)),S()}).observe(document,{subtree:!0,childList:!0});

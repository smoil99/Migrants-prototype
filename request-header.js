/* Общая шапка экрана заявки (request-header.css): меню «?» поддержки, «Дублировать», высоты залипающих слоёв. */
/* Закреп шапки заявки под навигацией: false — шапка прокручивается со страницей; true — вернуть закреп. */
const PIN_HEADER=false;
document.documentElement.classList.toggle("rh-pin",PIN_HEADER);
(function(){
  /* высоты навигации и (закреплённой) шапки → --topnav-h, --stack-h (отступ липких колонок контента) */
  function setStack(){
    const tn=document.querySelector(".topnav"), lk=document.querySelector(".lk-header"); if(!tn||!lk) return;
    document.documentElement.style.setProperty("--topnav-h",tn.offsetHeight+"px");
    document.documentElement.style.setProperty("--stack-h",(tn.offsetHeight+(PIN_HEADER?lk.offsetHeight:0))+"px");
  }
  setStack();
  window.addEventListener("resize",setStack);
  window.addEventListener("load",setStack);

  /* меню «?» — связаться с техподдержкой (Figma 3050:21391, состояния 8077:6730).
     #support открывает меню, #support-form — окно «Написать в поддержку» (8084:6850).
     В харнессе при #support* — сценарии: буфер обмена запрещён, ошибка отправки. */
  const box=document.getElementById("supMenu");
  if(box){
    const SUP={email:"Zarkadr@rabota.ru", phone:"+7 (495) 123-45-67", tel:"+74951234567", user:"ivanov@company.ru"};
    const scn={clipboard:"ok", send:"ok"};
    const ICON_COPY='<svg class="ic-copy" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5.33 5.33V3.47c0-.75 0-1.12.15-1.41.13-.25.33-.45.58-.58.29-.15.66-.15 1.41-.15h5.07c.75 0 1.12 0 1.4.15.25.13.46.33.59.58.14.29.14.66.14 1.41v5.06c0 .75 0 1.12-.14 1.41-.13.25-.34.45-.59.58-.28.15-.65.15-1.4.15h-1.87M3.47 14.67h5.06c.75 0 1.12 0 1.41-.15.25-.13.45-.33.58-.58.15-.29.15-.66.15-1.41V7.47c0-.75 0-1.12-.15-1.41a1.33 1.33 0 0 0-.58-.58c-.29-.15-.66-.15-1.41-.15H3.47c-.75 0-1.12 0-1.41.15-.25.13-.45.33-.58.58-.15.29-.15.66-.15 1.41v5.06c0 .75 0 1.12.15 1.41.13.25.33.45.58.58.29.15.66.15 1.41.15z"/></svg>'
      +'<svg class="ic-done" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 8.5l3.2 3.2L13 4.8"/></svg>';
    const copyRow=(href,text,tip,manual)=>
      `<div class="sup-item"><a class="sup-link" href="${href}">${text}</a>`
      +`<button class="copy-btn" type="button" data-copy="${text}" data-tip="${tip}" data-manual="${manual}" aria-label="${tip}">${ICON_COPY}`
      +`<span class="copy-tip" role="tooltip"><span>${tip}</span></span></button></div>`;
    const btn=box.querySelector(".help-btn"), pop=document.getElementById("supPop");
    pop.innerHTML='<div class="sup-label" id="supLabel">Связаться с техподдержкой</div>'
      +copyRow("mailto:"+SUP.email,SUP.email,"Скопировать адрес почты","Выделите адрес вручную")
      +copyRow("tel:"+SUP.tel,SUP.phone,"Скопировать номер телефона","Выделите номер вручную")
      +'<div class="sup-sep" role="separator"></div>'
      +'<button class="sup-act" type="button" id="supWrite">Написать в поддержку</button>'
      +'<span class="rh-sr" id="copyLive" aria-live="polite"></span>';
    const live=document.getElementById("copyLive");
    const scrim=document.createElement("div"); scrim.className="sup-scrim"; scrim.hidden=true; document.body.appendChild(scrim);
    const place=()=>{ pop.style.left=""; const over=pop.getBoundingClientRect().right-(document.documentElement.clientWidth-16); if(over>0) pop.style.left=(-13-over)+"px"; };
    /* пузырь подсказки не выходит за экран: сдвиг --tip-dx, стрелка остаётся над иконкой */
    const fitTip=b=>{ const t=b.querySelector(".copy-tip"); t.style.transition="none"; t.style.setProperty("--tip-dx","0px");
      const r=t.getBoundingClientRect(); let dx=0;
      const vw=document.documentElement.clientWidth; if(r.right>vw-8) dx=vw-8-r.right; else if(r.left<8) dx=8-r.left;
      t.style.setProperty("--tip-dx",dx+"px"); t.getBoundingClientRect(); requestAnimationFrame(()=>{ t.style.transition=""; }); };
    const resetCopy=b=>{ clearTimeout(b._t); b.classList.remove("copied","failed"); b.querySelector(".copy-tip").innerHTML=`<span>${b.dataset.tip}</span>`; };
    const copies=[...pop.querySelectorAll(".copy-btn")];
    const setOpen=o=>{ pop.hidden=!o; scrim.hidden=!o; btn.setAttribute("aria-expanded",String(o)); if(o){ place(); copies.forEach(fitTip); } else { copies.forEach(resetCopy); live.textContent=""; } };
    async function write(text){
      if(scn.clipboard==="deny") throw new Error("denied");
      try{ await navigator.clipboard.writeText(text); }
      catch(e){ const ta=document.createElement("textarea"); ta.value=text; ta.style.position="fixed"; ta.style.opacity="0";
        document.body.appendChild(ta); ta.select(); const ok=document.execCommand("copy"); ta.remove(); if(!ok) throw e; }
    }
    copies.forEach(b=>{
      b.addEventListener("mouseenter",()=>fitTip(b)); b.addEventListener("focus",()=>fitTip(b));
      b.addEventListener("click",async()=>{
        resetCopy(b); const t=b.querySelector(".copy-tip");
        try{ await write(b.dataset.copy);
          b.classList.add("copied"); t.innerHTML="<span>Скопировано в буфер обмена</span>"; live.textContent="Скопировано в буфер обмена";
          b._t=setTimeout(()=>resetCopy(b),2000);
        }catch(e){
          b.classList.add("failed"); t.innerHTML=`<span>Не удалось скопировать</span><span>${b.dataset.manual}</span>`; live.textContent="Не удалось скопировать. "+b.dataset.manual;
          b._t=setTimeout(()=>resetCopy(b),3000);
        }
        fitTip(b);
      });
    });
    btn.addEventListener("click",e=>{ e.stopPropagation(); setOpen(pop.hidden); });
    scrim.addEventListener("click",()=>setOpen(false));
    document.addEventListener("click",e=>{ if(!pop.hidden&&!box.contains(e.target)) setOpen(false); });

    /* ---------- окно «Написать в поддержку» ---------- */
    const FORMATS=["pdf","jpg","jpeg","png","heic"], MAX=10*1024*1024;
    const ICON_FILE='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"><path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z"/><path d="M14 3v5h5M9 13h6M9 17h4"/></svg>';
    const ICON_INFO='<svg viewBox="0 0 16 16" fill="currentColor"><path d="M8 1a7 7 0 1 0 0 14A7 7 0 0 0 8 1zm0 1.3a5.7 5.7 0 1 1 0 11.4A5.7 5.7 0 0 1 8 2.3zM7.35 7h1.3v4.5h-1.3zM8 4.4a.85.85 0 1 1 0 1.7.85.85 0 0 1 0-1.7z"/></svg>';
    const ov=document.createElement("div"); ov.className="sm-overlay"; ov.hidden=true;
    ov.innerHTML='<div class="sm" role="dialog" aria-modal="true" aria-labelledby="smTitle"></div>';
    document.body.appendChild(ov);
    const sm=ov.firstElementChild;
    let files=[], sending=false, failed=false, lastFocus=null;
    const esc=s=>s.replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
    const fmtSize=n=>n<1024*1024? Math.max(1,Math.round(n/1024))+" КБ" : (n/1024/1024).toFixed(1).replace(".",",")+" МБ";
    const closeX='<button class="sm-x" type="button" aria-label="Закрыть" data-close><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"><path d="M7 7l10 10M17 7L7 17"/></svg></button>';
    function renderForm(){
      const text=sm.querySelector("textarea")?.value||"";
      sm.innerHTML=`<div class="sm-head"><h2 id="smTitle">Написать в поддержку</h2>${closeX}</div>
        <div class="sm-body">
          ${failed?`<div class="sm-alert is-error" role="alert">${ICON_INFO}<span>Не удалось отправить сообщение. Попробуйте ещё раз.</span></div>`:""}
          <p class="sm-intro">Ответ придёт на вашу почту ${SUP.user}.</p>
          <div class="sm-alert is-info">${ICON_INFO}<span>Форма — для технических и других вопросов по работе платформы. Не прикладывайте документы кандидатов.</span></div>
          <div class="sm-field${text?" up":""}${sending?" off":""}">
            <textarea id="smText" ${sending?"disabled":""}>${esc(text)}</textarea>
            <label for="smText"><span class="ph">Опишите вопрос или проблему</span><span class="lb">Сообщение</span> <i>*</i></label>
          </div>
          <div class="sm-drop${sending?" off":""}" tabindex="0" role="button" aria-label="Прикрепить файлы">
            <span class="sm-upbtn"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M12 16V5M7.5 9.5L12 5l4.5 4.5M5 19h14"/></svg></span>
            <span><b>Прикрепите файлы (необязательно)</b><small>PDF, JPG, JPEG, PNG, HEIC · до 10 МБ</small></span>
            <input type="file" multiple accept=".pdf,.jpg,.jpeg,.png,.heic" hidden>
          </div>
          <div class="sm-files">${files.map((f,i)=>`<div class="sm-file${f.err?" bad":""}">${ICON_FILE}<div class="fm"><div class="fn">${esc(f.name)}</div><div class="fs">${f.err||fmtSize(f.size)}</div></div><button class="sm-del" type="button" data-del="${i}" ${sending?"disabled":""}>Удалить</button></div>`).join("")}</div>
        </div>
        <div class="sm-acts"><button class="sm-btn sec" type="button" data-close ${sending?"disabled":""}>Отмена</button>
          <button class="sm-btn pri" type="button" data-send ${(!text.trim()||sending)?"disabled":""}>${sending?"Отправляем…":"Отправить"}</button></div>`;
      wireForm();
    }
    function renderSent(){
      sm.innerHTML=`<div class="sm-head"><div class="sm-ok"><svg viewBox="0 0 26 26" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M6 13.5l4.5 4.5L20 8"/></svg></div><span style="flex:1"></span>${closeX}</div>
        <h2 id="smTitle" style="margin:0;font-size:24px;line-height:32px;font-weight:600">Сообщение отправлено</h2>
        <p class="sm-intro">Ответ придёт на вашу почту ${SUP.user}.</p>
        <div class="sm-acts one"><button class="sm-btn pri" type="button" data-close>Понятно</button></div>`;
      sm.querySelector("[data-close].sm-btn").focus();
    }
    function addFiles(list){
      for(const f of list){
        const ext=(f.name.split(".").pop()||"").toLowerCase();
        files.push({name:f.name, size:f.size, err: !FORMATS.includes(ext)?"Неподдерживаемый формат" : f.size>MAX?"Файл больше 10 МБ" : ""});
      }
      renderForm();
    }
    function wireForm(){
      const ta=sm.querySelector("textarea"), field=sm.querySelector(".sm-field"), send=sm.querySelector("[data-send]");
      const drop=sm.querySelector(".sm-drop"), inp=drop.querySelector("input");
      const sync=()=>{ field.classList.toggle("up", !!ta.value || document.activeElement===ta); send.disabled=!ta.value.trim()||sending; };
      ta.addEventListener("input",sync); ta.addEventListener("focus",sync); ta.addEventListener("blur",sync);
      drop.addEventListener("click",()=>inp.click());
      drop.addEventListener("keydown",e=>{ if(e.key==="Enter"||e.key===" "){ e.preventDefault(); inp.click(); } });
      inp.addEventListener("change",()=>addFiles(inp.files));
      drop.addEventListener("dragover",e=>{ e.preventDefault(); drop.classList.add("drag"); });
      drop.addEventListener("dragleave",()=>drop.classList.remove("drag"));
      drop.addEventListener("drop",e=>{ e.preventDefault(); drop.classList.remove("drag"); addFiles(e.dataTransfer.files); });
      sm.querySelectorAll("[data-del]").forEach(b=>b.addEventListener("click",()=>{ files.splice(+b.dataset.del,1); renderForm(); }));
      send.addEventListener("click",()=>{
        sending=true; failed=false; renderForm();
        setTimeout(()=>{ sending=false;
          if(scn.send==="fail"){ failed=true; renderForm(); }
          else { failed=false; files=[]; renderSent(); }
        },1200);
      });
    }
    function openForm(){
      setOpen(false); lastFocus=document.activeElement;
      files=[]; sending=false; failed=false; sm.innerHTML=""; renderForm();
      const h=document.querySelector(".harness"); ov.style.top=h? Math.max(0,Math.round(h.getBoundingClientRect().bottom))+"px" : "";
      ov.hidden=false; ov.scrollTop=0; document.documentElement.style.overflow="hidden";
      sm.querySelector("textarea").focus();
    }
    function closeForm(){
      if(sending) return;
      ov.hidden=true; document.documentElement.style.overflow="";
      (lastFocus&&lastFocus.isConnected?lastFocus:btn).focus();
    }
    sm.addEventListener("click",e=>{ if(e.target.closest("[data-close]")) closeForm(); });
    document.getElementById("supWrite").addEventListener("click",e=>{ e.stopPropagation(); openForm(); });
    document.addEventListener("keydown",e=>{
      if(e.key!=="Escape") return;
      if(!ov.hidden){ closeForm(); return; }
      if(!pop.hidden){ setOpen(false); btn.focus(); }
    });
    /* фокус не уходит из окна */
    ov.addEventListener("keydown",e=>{
      if(e.key!=="Tab") return;
      const f=[...sm.querySelectorAll("button:not(:disabled),textarea:not(:disabled),[tabindex='0']")]; if(!f.length) return;
      if(e.shiftKey&&document.activeElement===f[0]){ e.preventDefault(); f[f.length-1].focus(); }
      else if(!e.shiftKey&&document.activeElement===f[f.length-1]){ e.preventDefault(); f[0].focus(); }
    });

    /* ---------- харнесс: сценарии ---------- */
    function harness(){
      const row=document.querySelector(".harness-row"); if(!row||row.querySelector(".sup-scn")) return;
      const seg=(label,key,opts)=>`<span class="sup-scn-g"><span class="sup-scn-l">${label}</span><span class="sup-seg">${opts.map(([v,t])=>`<button type="button" data-k="${key}" data-v="${v}" aria-pressed="${scn[key]===v}">${t}</button>`).join("")}</span></span>`;
      const w=document.createElement("div"); w.className="sup-scn";
      w.innerHTML=seg("Буфер обмена","clipboard",[["ok","Работает"],["deny","Запрещён"]])+seg("Отправка","send",[["ok","Успешно"],["fail","Ошибка"]]);
      row.appendChild(w);
      w.addEventListener("click",e=>{ const b=e.target.closest("button[data-k]"); if(!b) return; e.stopPropagation();
        scn[b.dataset.k]=b.dataset.v; w.querySelectorAll(`[data-k="${b.dataset.k}"]`).forEach(x=>x.setAttribute("aria-pressed",String(x===b))); });
    }
    function fromHash(){
      if(!location.hash.startsWith("#support")) return;
      const pm=document.getElementById("protoMenu");
      if(pm){
        pm.querySelector(".pm-cur").textContent="Связаться с техподдержкой";
        pm.querySelectorAll(".pm-pop a").forEach(a=>a.toggleAttribute("aria-current",a.getAttribute("href")==="services.html#support"));
        const cur=pm.querySelector("[aria-current]"); if(cur) cur.setAttribute("aria-current","page");
        pm.querySelector(".pm-pop").hidden=true; pm.querySelector(".pm-trigger").setAttribute("aria-expanded","false");
      }
      harness();
      if(location.hash==="#support-form") openForm(); else setOpen(true);
    }
    window.addEventListener("hashchange",fromHash);
    window.addEventListener("resize",()=>{ if(!pop.hidden){ place(); copies.forEach(fitTip); } });
    fromHash();
  }

  /* «Дублировать»: создаётся независимый черновик и сразу открывается (request-form.html#fromreq) */
  const dup=document.getElementById("dupBtn");
  const COPY_ICON='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="8" y="8" width="12" height="12" rx="2"/><path d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2"/></svg>';
  if(dup){
    dup.addEventListener("click",()=>{
      if(dup.classList.contains("busy")) return;
      dup.classList.add("busy"); dup.querySelector(".lbl").textContent="Дублирование…";
      const sp=document.createElement("span"); sp.className="spin"; dup.querySelector("svg").replaceWith(sp);
      setTimeout(()=>{ location.href="request-form.html#fromreq"; },700);
    });
    /* возврат «Назад» из bfcache — снять состояние загрузки */
    window.addEventListener("pageshow",()=>{
      if(!dup.classList.contains("busy")) return;
      dup.classList.remove("busy"); dup.querySelector(".lbl").textContent="Дублировать";
      dup.querySelector(".spin").outerHTML=COPY_ICON;
    });
  }
})();

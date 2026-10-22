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
    /* плавное появление/скрытие: hidden снимается до анимации и ставится после неё */
    const fade=(el,o)=>{ clearTimeout(el._ft);
      if(o){ el.hidden=false; el.getBoundingClientRect(); el.classList.add("is-open"); }
      else { el.classList.remove("is-open"); el._ft=setTimeout(()=>{ el.hidden=true; },300); } };
    const menuOpen=()=>pop.classList.contains("is-open");
    const place=()=>{ pop.style.left=""; const over=pop.getBoundingClientRect().right-(document.documentElement.clientWidth-16); if(over>0) pop.style.left=(-13-over)+"px"; };
    /* пузырь подсказки не выходит за экран: сдвиг --tip-dx, стрелка остаётся над иконкой */
    const fitTip=b=>{ const t=b.querySelector(".copy-tip"); t.style.transition="none"; t.style.setProperty("--tip-dx","0px");
      const r=t.getBoundingClientRect(); let dx=0;
      const vw=document.documentElement.clientWidth; if(r.right>vw-8) dx=vw-8-r.right; else if(r.left<8) dx=8-r.left;
      t.style.setProperty("--tip-dx",dx+"px"); t.getBoundingClientRect(); requestAnimationFrame(()=>{ t.style.transition=""; }); };
    const resetCopy=b=>{ clearTimeout(b._t); b.classList.remove("copied","failed"); b.querySelector(".copy-tip").innerHTML=`<span>${b.dataset.tip}</span>`; };
    const copies=[...pop.querySelectorAll(".copy-btn")];
    const setOpen=o=>{ fade(pop,o); fade(scrim,o); btn.setAttribute("aria-expanded",String(o)); if(o){ place(); copies.forEach(fitTip); } else { copies.forEach(resetCopy); live.textContent=""; } };
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
    btn.addEventListener("click",e=>{ e.stopPropagation(); setOpen(!menuOpen()); });
    scrim.addEventListener("click",()=>setOpen(false));
    document.addEventListener("click",e=>{ if(menuOpen()&&!box.contains(e.target)) setOpen(false); });

    /* ---------- окно «Написать в поддержку» ---------- */
    const FORMATS=["pdf","jpg","jpeg","png","heic"], MAX=10*1024*1024;
    const ICON_FILE='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"><path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z"/><path d="M14 3v5h5M9 13h6M9 17h4"/></svg>';
    const ICON_INFO='<svg viewBox="0 0 16 16" fill="currentColor"><path d="M8 1a7 7 0 1 0 0 14A7 7 0 0 0 8 1zm0 1.3a5.7 5.7 0 1 1 0 11.4A5.7 5.7 0 0 1 8 2.3zM7.35 7h1.3v4.5h-1.3zM8 4.4a.85.85 0 1 1 0 1.7.85.85 0 0 1 0-1.7z"/></svg>';
    const ov=document.createElement("div"); ov.className="sm-overlay"; ov.hidden=true;
    ov.innerHTML='<div class="sm" role="dialog" aria-modal="true" aria-labelledby="smTitle"></div>';
    document.body.appendChild(ov);
    const sm=ov.firstElementChild;
    let files=[], sending=false, lastFocus=null;
    const hasBad=()=>files.some(f=>f.err);   // неподходящий файл блокирует отправку, пока его не удалят
    const ICON_TRASH16='<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"><path d="M10.67 4v-.53c0-.75 0-1.12-.15-1.41a1.33 1.33 0 0 0-.58-.58c-.29-.15-.66-.15-1.41-.15H7.47c-.75 0-1.12 0-1.41.15-.25.13-.45.33-.58.58-.15.29-.15.66-.15 1.41V4M2 4h12m-1.33 0v7.47c0 1.12 0 1.68-.22 2.1-.19.38-.5.69-.88.88-.42.22-.98.22-2.1.22H6.53c-1.12 0-1.68 0-2.1-.22a2 2 0 0 1-.88-.88c-.22-.42-.22-.98-.22-2.1V4"/></svg>';
    const ICON_TRASH24='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M9 3h6M3 6h18m-2 0-.7 10.52c-.1 1.58-.16 2.37-.5 2.97a3 3 0 0 1-1.3 1.21c-.62.3-1.41.3-2.99.3h-3.02c-1.58 0-2.37 0-2.99-.3a3 3 0 0 1-1.3-1.21c-.34-.6-.4-1.39-.5-2.97L5 6"/></svg>';
    const ICON_XFILL='<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.25A9.75 9.75 0 1 0 21.75 12 9.76 9.76 0 0 0 12 2.25Zm3.53 12.22a.75.75 0 1 1-1.06 1.06L12 13.06l-2.47 2.47a.75.75 0 0 1-1.06-1.06L10.94 12 8.47 9.53a.75.75 0 0 1 1.06-1.06L12 10.94l2.47-2.47a.75.75 0 0 1 1.06 1.06L13.06 12Z"/></svg>';
    /* тост ошибки отправки — как в колокольчике: 6 с, пауза при наведении/фокусе, повторная ошибка заменяет тост */
    const toast=document.createElement("div"); toast.className="sm-toast"; toast.setAttribute("role","alert"); toast.hidden=true; document.body.appendChild(toast);
    let tT, tOut, tLeft=0, tStart=0;
    const placeToast=()=>{ const h=document.querySelector(".harness"); document.documentElement.style.setProperty("--app-top",(h?Math.max(0,Math.round(h.getBoundingClientRect().bottom)):0)+"px"); };
    function hideToast(instant){
      clearTimeout(tT); clearTimeout(tOut); if(toast.hidden) return;
      if(instant||matchMedia("(prefers-reduced-motion: reduce)").matches){ toast.classList.remove("out"); toast.hidden=true; return; }
      toast.classList.add("out"); tOut=setTimeout(()=>{ toast.hidden=true; toast.classList.remove("out"); },200);
    }
    function showToast(text){
      toast.innerHTML=ICON_XFILL+`<span>${text}</span><button type="button" aria-label="Закрыть" data-tclose><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 6l12 12M18 6L6 18"/></svg></button>`;
      clearTimeout(tOut); toast.classList.remove("out"); toast.hidden=false; toast.style.animation="none"; void toast.offsetWidth; toast.style.animation="";
      placeToast(); clearTimeout(tT); tLeft=6000; tStart=Date.now(); tT=setTimeout(hideToast,tLeft);
    }
    const tPause=()=>{ if(toast.hidden) return; clearTimeout(tT); tLeft-=Date.now()-tStart; };
    const tResume=()=>{ if(toast.hidden||toast.matches(":hover")||toast.contains(document.activeElement)) return; tStart=Date.now(); tT=setTimeout(hideToast,Math.max(1500,tLeft)); };
    toast.addEventListener("mouseenter",tPause); toast.addEventListener("focusin",tPause);
    toast.addEventListener("mouseleave",tResume); toast.addEventListener("focusout",()=>setTimeout(tResume,0));
    toast.addEventListener("click",e=>{ if(e.target.closest("[data-tclose]")) hideToast(); });
    const esc=s=>s.replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
    const fmtSize=n=>n<1024*1024? Math.max(1,Math.round(n/1024))+" КБ" : (n/1024/1024).toFixed(1).replace(".",",")+" МБ";
    const closeX='<button class="sm-x" type="button" aria-label="Закрыть" data-close><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"><path d="M7 7l10 10M17 7L7 17"/></svg></button>';
    /* файлы загружаются сразу при прикреплении (решение 22.10): у строки — прогресс; «Отправить» ждёт окончания загрузок */
    let fid=0;
    const busy=()=>files.some(f=>f.st==="up");
    const fileRow=f=>{
      const del=`<button class="sm-del" type="button" data-del="${f.id}" aria-label="${f.st==="up"?"Отменить загрузку":"Удалить файл"}" title="${f.st==="up"?"Отменить загрузку":"Удалить файл"}" ${sending?"disabled":""}>${f.st==="bad"?ICON_TRASH24:ICON_TRASH16}</button>`;
      if(f.st==="up") return `<div class="sm-file up" data-fid="${f.id}">${ICON_FILE}<div class="fm"><div class="fr"><span class="fn">${esc(f.name)}</span><span class="pc">${f.p}%</span></div><div class="bar" role="progressbar" aria-label="Загрузка ${esc(f.name)}" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${f.p}"><i style="width:${f.p}%"></i></div></div>${del}</div>`;
      return `<div class="sm-file${f.st==="bad"?" bad":""}" data-fid="${f.id}">${ICON_FILE}<div class="fm"><div class="fn">${esc(f.name)}</div><div class="fs">${f.st==="bad"?f.err:fmtSize(f.size)}</div></div>${del}</div>`;
    };
    function syncSend(){
      const send=sm.querySelector("[data-send]"), ta=sm.querySelector("textarea"); if(!send||!ta) return;
      send.disabled=!ta.value.trim()||sending||hasBad()||busy();
    }
    function renderFiles(){
      const box=sm.querySelector(".sm-files"); if(!box) return;
      box.innerHTML=files.map(fileRow).join("");
      box.querySelectorAll("[data-del]").forEach(b=>b.addEventListener("click",()=>{
        const i=files.findIndex(f=>f.id===+b.dataset.del); if(i<0) return;
        clearInterval(files[i].t); files.splice(i,1); renderFiles();
      }));
      syncSend();
    }
    function startUpload(f){
      const total=Math.min(6000,900+f.size/1.5e6*1000), step=100;   // имитация: ~1,5 МБ/с, не дольше 6 с
      f.t=setInterval(()=>{
        f.p=Math.min(100,f.p+Math.max(1,Math.round(step/total*100)));
        const row=sm.querySelector(`.sm-file[data-fid="${f.id}"]`);
        if(f.p>=100){ clearInterval(f.t); f.st="ok"; renderFiles(); return; }
        if(row){ row.querySelector(".pc").textContent=f.p+"%"; row.querySelector(".bar i").style.width=f.p+"%"; row.querySelector(".bar").setAttribute("aria-valuenow",f.p); }
      },step);
    }
    const stopUploads=()=>files.forEach(f=>clearInterval(f.t));
    function renderForm(){
      const text=sm.querySelector("textarea")?.value||"", keep=sm.querySelector(".sm-body")?.scrollTop||0;   // перерисовка не сбрасывает прокрутку тела
      sm.innerHTML=`<div class="sm-head"><h2 id="smTitle">Написать в поддержку</h2>${closeX}</div>
        <div class="sm-body">
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
          <div class="sm-files"></div>
        </div>
        <div class="sm-acts"><button class="sm-btn sec" type="button" data-close ${sending?"disabled":""}>Отмена</button>
          <button class="sm-btn pri" type="button" data-send disabled>${sending?"Отправляем…":"Отправить"}</button></div>`;
      renderFiles();
      sm.querySelector(".sm-body").scrollTop=keep;
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
        const err=!FORMATS.includes(ext)?"Неподдерживаемый формат" : f.size>MAX?"Размер файла превышает допустимый лимит" : "";
        const item={id:++fid, name:f.name, size:f.size, err, st:err?"bad":"up", p:0};
        files.push(item); if(!err) startUpload(item);
      }
      renderFiles();
    }
    function wireForm(){
      const ta=sm.querySelector("textarea"), field=sm.querySelector(".sm-field"), send=sm.querySelector("[data-send]");
      const drop=sm.querySelector(".sm-drop"), inp=drop.querySelector("input");
      const sync=()=>{ field.classList.toggle("up", !!ta.value || document.activeElement===ta); syncSend(); };
      ta.addEventListener("input",sync); ta.addEventListener("focus",sync); ta.addEventListener("blur",sync);
      drop.addEventListener("click",()=>inp.click());
      drop.addEventListener("keydown",e=>{ if(e.key==="Enter"||e.key===" "){ e.preventDefault(); inp.click(); } });
      inp.addEventListener("change",()=>{ addFiles(inp.files); inp.value=""; });
      drop.addEventListener("dragover",e=>{ e.preventDefault(); drop.classList.add("drag"); });
      drop.addEventListener("dragleave",()=>drop.classList.remove("drag"));
      drop.addEventListener("drop",e=>{ e.preventDefault(); drop.classList.remove("drag"); addFiles(e.dataTransfer.files); });
      /* файлы уже на сервере — отправка короткая: письмо с текстом и вложениями */
      send.addEventListener("click",()=>{
        sending=true; hideToast(true); renderForm();
        setTimeout(()=>{ sending=false;
          if(scn.send==="fail"){ renderForm(); showToast("Не удалось отправить сообщение. Попробуйте ещё раз."); }
          else { files=[]; renderSent(); }
        },900);
      });
    }
    function openForm(){
      setOpen(false); lastFocus=document.activeElement;
      stopUploads(); files=[]; sending=false; hideToast(true); sm.innerHTML=""; renderForm();
      const h=document.querySelector(".harness"); ov.style.top=h? Math.max(0,Math.round(h.getBoundingClientRect().bottom))+"px" : "";
      fade(ov,true); document.documentElement.style.overflow="hidden";
      sm.querySelector("textarea").focus();
    }
    function closeForm(){
      if(sending) return;
      fade(ov,false); document.documentElement.style.overflow="";
      (lastFocus&&lastFocus.isConnected?lastFocus:btn).focus();
    }
    sm.addEventListener("click",e=>{ if(e.target.closest("[data-close]")) closeForm(); });
    document.getElementById("supWrite").addEventListener("click",e=>{ e.stopPropagation(); openForm(); });
    document.addEventListener("keydown",e=>{
      if(e.key!=="Escape") return;
      if(ov.classList.contains("is-open")){ closeForm(); return; }
      if(menuOpen()){ setOpen(false); btn.focus(); }
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
    window.addEventListener("resize",()=>{ if(menuOpen()){ place(); copies.forEach(fitTip); } });
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

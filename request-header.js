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
     #support открывает меню, #support-form — окно «Написать в поддержку» (8084:6850), #call-form — «Запросить звонок» (docs#320, 8170:6226).
     В харнессе при #support* — сценарии: буфер обмена запрещён, ошибка отправки. */
  const box=document.getElementById("supMenu");
  if(box){
    const SUP={email:"Zarkadr@rabota.ru", phone:"+7 (495) 123-45-67", tel:"+74951234567", user:"ivanov@company.ru"};
    const scn={clipboard:"ok", send:"ok", upload:"ok", phone:"yes"};
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
      +'<button class="sup-act" type="button" id="supCall">Запросить звонок</button>'
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
    const FORMATS=["pdf","jpg","jpeg","png","heic"], MAX=10*1024*1024, MAX_TOTAL=20*1024*1024, MAX_FILES=5, MAX_TEXT=4000;   // лимиты — ответ SA, нота 53287
    const HINT="PDF, JPG, JPEG, PNG, HEIC · до 10 МБ на файл, всего до 20 МБ, не больше 5 файлов", FULL="Можно прикрепить не больше 5 файлов";
    const ICON_FILE='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"><path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z"/><path d="M14 3v5h5M9 13h6M9 17h4"/></svg>';
    const ICON_INFO='<svg viewBox="0 0 16 16" fill="currentColor"><path d="M8 1a7 7 0 1 0 0 14A7 7 0 0 0 8 1zm0 1.3a5.7 5.7 0 1 1 0 11.4A5.7 5.7 0 0 1 8 2.3zM7.35 7h1.3v4.5h-1.3zM8 4.4a.85.85 0 1 1 0 1.7.85.85 0 0 1 0-1.7z"/></svg>';
    const ov=document.createElement("div"); ov.className="sm-overlay"; ov.hidden=true;
    ov.innerHTML='<div class="sm" role="dialog" aria-modal="true" aria-labelledby="smTitle"></div>';
    document.body.appendChild(ov);
    const sm=ov.firstElementChild;
    /* файл, брошенный мимо зоны (или на неактивную зону), не открывается браузером; при 5 файлах — тост */
    ov.addEventListener("dragover",e=>e.preventDefault());
    ov.addEventListener("drop",e=>{ e.preventDefault(); if(files.length>=MAX_FILES && e.dataTransfer?.files?.length && !sending) showToast(FULL); });
    let files=[], sending=false, lastFocus=null;
    const hasBad=()=>files.some(f=>f.err);   // неподходящий файл блокирует отправку, пока его не удалят
    const ICON_TRASH16='<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"><path d="M10.67 4v-.53c0-.75 0-1.12-.15-1.41a1.33 1.33 0 0 0-.58-.58c-.29-.15-.66-.15-1.41-.15H7.47c-.75 0-1.12 0-1.41.15-.25.13-.45.33-.58.58-.15.29-.15.66-.15 1.41V4M2 4h12m-1.33 0v7.47c0 1.12 0 1.68-.22 2.1-.19.38-.5.69-.88.88-.42.22-.98.22-2.1.22H6.53c-1.12 0-1.68 0-2.1-.22a2 2 0 0 1-.88-.88c-.22-.42-.22-.98-.22-2.1V4"/></svg>';
    const ICON_OK='<svg class="ok-ic" viewBox="0 0 24 24"><circle cx="12" cy="12" r="9.75" fill="#00E887"/><path d="M8.25 12.4l2.5 2.5 5-5.3" fill="none" stroke="#0B1214" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>';   // 24 px / checkmark filled, #00E887
    const ICON_ALERT='<svg viewBox="0 0 24 24" fill="none" stroke="#FF6674" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 8v4m0 4h.01M22 12a10 10 0 1 1-20 0 10 10 0 0 1 20 0z"/></svg>';   // 24 px / alert-circle — строка с ошибкой
    const ICON_RETRY16='<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"><path d="M.67 2.67v4h4M15.33 13.33v-4h-4"/><path d="M13.66 6A6 6 0 0 0 3.76 3.76L.67 6.67m14.66 2.66-3.09 2.91A6 6 0 0 1 2.34 10"/></svg>';   // 16 px / refresh-cw-01
    const ICON_X16='<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"><path d="M11.33 4.67l-6.66 6.66M4.67 4.67l6.66 6.66"/></svg>';   // отмена загрузки (16 px / x)
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
    const busy=()=>files.some(f=>f.st==="up"||f.st==="fail");   // загрузка идёт или оборвалась — отправка ждёт
    const fileRow=f=>{
      const del=`<button class="sm-del" type="button" data-del="${f.id}" aria-label="${f.st==="up"?"Отменить загрузку":"Удалить файл"}" title="${f.st==="up"?"Отменить загрузку":"Удалить файл"}" ${sending?"disabled":""}>${f.st==="up"?ICON_X16:ICON_TRASH16}</button>`;
      if(f.st==="up") return `<div class="sm-file up" data-fid="${f.id}">${ICON_FILE}<div class="fm"><div class="fr"><span class="fn">${esc(f.name)}</span><span class="pc">${f.p}%</span></div><div class="bar" role="progressbar" aria-label="Загрузка ${esc(f.name)}" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${f.p}"><i style="width:${f.p}%"></i></div></div>${del}</div>`;
      if(f.st==="fail") return `<div class="sm-file fail" data-fid="${f.id}">${ICON_ALERT}<div class="fm"><div class="fn">${esc(f.name)}</div><div class="fs">Не удалось загрузить файл</div></div><button class="sm-del" type="button" data-retry="${f.id}" aria-label="Загрузить снова" title="Загрузить снова">${ICON_RETRY16}</button>${del}</div>`;
      return `<div class="sm-file${f.st==="bad"?" bad":""}" data-fid="${f.id}">${f.st==="bad"?ICON_ALERT:f.fresh?ICON_OK:ICON_FILE}<div class="fm"><div class="fn">${esc(f.name)}</div><div class="fs">${f.st==="bad"?f.err:fmtSize(f.size)}</div></div>${del}</div>`;
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
        clearInterval(files[i].t); clearTimeout(files[i].t); files.splice(i,1); renderFiles();
      }));
      box.querySelectorAll("[data-retry]").forEach(b=>b.addEventListener("click",()=>{
        const f=files.find(x=>x.id===+b.dataset.retry); if(!f) return;
        f.st="up"; f.p=0; f.failAt=null; startUpload(f); renderFiles();
      }));
      syncSend(); syncZone();
    }
    function startUpload(f){
      const total=Math.min(6000,900+f.size/1.5e6*1000), step=100;   // имитация: ~1,5 МБ/с, не дольше 6 с
      if(scn.upload==="fail" && f.failAt==null) f.failAt=30+Math.floor(Math.random()*40);   // «Обрыв»: остановка на 30–70%
      f.t=setInterval(()=>{
        f.p=Math.min(100,f.p+Math.max(1,Math.round(step/total*100)));
        const row=sm.querySelector(`.sm-file[data-fid="${f.id}"]`);
        if(f.failAt!=null && f.p>=f.failAt){ clearInterval(f.t); f.st="fail"; renderFiles(); return; }
        if(f.p>=100){   // полоса доходит до 100%, затем на 1,5 с зелёная галочка вместо иконки файла (Document / Type=Success)
          clearInterval(f.t);
          if(row){ row.querySelector(".pc").textContent="100%"; row.querySelector(".bar i").style.width="100%"; }
          f.t=setTimeout(()=>{ f.st="ok"; f.fresh=true; renderFiles(); announce(`Файл «${f.name}» загружен`);
            f.t=setTimeout(()=>{ f.fresh=false; const r=sm.querySelector(`.sm-file[data-fid="${f.id}"] > svg`); if(r) r.outerHTML=ICON_FILE; },1500); },200);
          return; }
        if(row){ row.querySelector(".pc").textContent=f.p+"%"; row.querySelector(".bar i").style.width=f.p+"%"; row.querySelector(".bar").setAttribute("aria-valuenow",f.p); }
      },step);
    }
    const stopUploads=()=>files.forEach(f=>{ clearInterval(f.t); clearTimeout(f.t); });
    const announce=t=>{ const l=sm.querySelector("#smLive"); if(l){ l.textContent=""; setTimeout(()=>{ l.textContent=t; },50); } };   // для экранного диктора
    function renderForm(){
      const text=sm.querySelector("textarea")?.value||"", keep=sm.querySelector(".sm-body")?.scrollTop||0;   // перерисовка не сбрасывает прокрутку тела
      sm.innerHTML=`<div class="sm-head"><h2 id="smTitle">Написать в поддержку</h2>${closeX}</div>
        <div class="sm-body">
          <p class="sm-intro">Ответ придёт на вашу почту ${SUP.user}.</p>
          <div class="sm-alert is-info">${ICON_INFO}<span>Расскажите, что не получается в работе с платформой — поможем. Не прикладывайте документы кандидатов.</span></div>
          <div class="sm-field${text?" up":""}${sending?" off":""}">
            <textarea id="smText" maxlength="${MAX_TEXT}" aria-describedby="smCount" ${sending?"disabled":""}>${esc(text)}</textarea>
            <label for="smText"><span class="ph">Опишите вопрос или проблему</span><span class="lb">Сообщение</span> <i>*</i></label>
            <div class="sm-count" id="smCount" aria-live="polite"></div>
          </div>
          <div class="sm-drop${sending?" off":""}" tabindex="0" role="button" aria-label="Прикрепить файлы">
            <span class="sm-upbtn"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M12 16V5M7.5 9.5L12 5l4.5 4.5M5 19h14"/></svg></span>
            <span><b>Прикрепите файлы (необязательно)</b><small>${HINT}</small></span>
            <input type="file" multiple accept=".pdf,.jpg,.jpeg,.png,.heic" hidden>
          </div>
          <div class="sm-files"></div>
          <span class="rh-sr" id="smLive" aria-live="polite"></span>
        </div>
        <div class="sm-acts"><button class="sm-btn sec" type="button" data-close ${sending?"disabled":""}>Отмена</button>
          <button class="sm-btn pri" type="button" data-send disabled>${sending?'<span class="sm-spin" aria-hidden="true"></span>Отправляем…':"Отправить"}</button></div>`;
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
    /* не больше 5 строк в списке; лишние не добавляются — тост. Файл сверх 20 МБ суммарно — строка с ошибкой */
    function addFiles(list){
      let extra=0;
      for(const f of list){
        if(files.length>=MAX_FILES){ extra++; continue; }
        const ext=(f.name.split(".").pop()||"").toLowerCase();
        const total=files.filter(x=>!x.err).reduce((s,x)=>s+x.size,0);
        const err=!FORMATS.includes(ext)?"Неподдерживаемый формат. Разрешены только: PDF, JPG, JPEG, PNG, HEIC"
          : f.size>MAX?"Файл больше 10 МБ" : total+f.size>MAX_TOTAL?"Общий размер файлов — не больше 20 МБ" : "";
        const item={id:++fid, name:f.name, size:f.size, err, st:err?"bad":"up", p:0};
        files.push(item); if(!err) startUpload(item);
      }
      renderFiles();
      if(extra) showToast(FULL);
    }
    /* зона загрузки неактивна, когда в списке 5 файлов (Frame / Type=Disabled) */
    function syncZone(){
      const z=sm.querySelector(".sm-drop"); if(!z) return;
      const full=files.length>=MAX_FILES;
      z.classList.toggle("off", sending||full);
      z.setAttribute("aria-disabled", String(sending||full));
      z.querySelector("small").textContent=full&&!sending?FULL:HINT;
    }
    /* счётчик «3650 / 4000» — когда осталось меньше 400 символов */
    function syncCount(){
      const ta=sm.querySelector("textarea"), c=sm.querySelector("#smCount"); if(!ta||!c) return;
      const n=ta.value.length; c.textContent=MAX_TEXT-n<400?`${n} / ${MAX_TEXT}`:"";
    }
    function wireForm(){
      const ta=sm.querySelector("textarea"), field=sm.querySelector(".sm-field"), send=sm.querySelector("[data-send]");
      const drop=sm.querySelector(".sm-drop"), inp=drop.querySelector("input");
      const sync=()=>{ field.classList.toggle("up", !!ta.value || document.activeElement===ta); syncSend(); syncCount(); };
      syncCount();
      ta.addEventListener("input",sync); ta.addEventListener("focus",sync); ta.addEventListener("blur",sync);
      drop.addEventListener("click",()=>inp.click());
      drop.addEventListener("keydown",e=>{ if(e.key==="Enter"||e.key===" "){ e.preventDefault(); inp.click(); } });
      inp.addEventListener("change",()=>{ addFiles(inp.files); inp.value=""; });
      drop.addEventListener("dragover",e=>{ e.preventDefault(); drop.classList.add("drag"); });
      drop.addEventListener("dragleave",()=>drop.classList.remove("drag"));
      drop.addEventListener("drop",e=>{ e.preventDefault(); e.stopPropagation(); drop.classList.remove("drag"); addFiles(e.dataTransfer.files); });
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
      if(sending||cf.sending) return;
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
      const f=[...sm.querySelectorAll("button:not(:disabled),textarea:not(:disabled),input:not(:disabled),select:not(:disabled),[tabindex='0']")]; if(!f.length) return;
      if(e.shiftKey&&document.activeElement===f[0]){ e.preventDefault(); f[f.length-1].focus(); }
      else if(!e.shiftKey&&document.activeElement===f[f.length-1]){ e.preventDefault(); f[0].focus(); }
    });

    /* ---------- «Запросить звонок» (US-024, docs#320; макет 8170:6226) ---------- */
    const TOPICS=["Коммерческое предложение","Договор","Заявка","Работа платформы","Другой вопрос"];
    const SLOTS=["09:00–11:00","11:00–13:00","13:00–15:00","15:00–17:00","17:00–19:00"];   // рекомендация дизайна: по 2 ч в рабочее время
    const TZS=[["Калининград, UTC+2",120],["Москва, UTC+3",180],["Самара, UTC+4",240],["Екатеринбург, UTC+5",300],["Индия, UTC+5:30",330],["Омск, UTC+6",360],["Новосибирск, UTC+7",420],["Иркутск, UTC+8",480],["Якутск, UTC+9",540],["Владивосток, UTC+10",600],["Магадан, UTC+11",660],["Камчатка, UTC+12",720]];
    const CMAX=1000;   // рекомендация дизайна; лимит подтверждает SA
    const PROFILE_PHONE="+7 (916) 123-45-67";
    const tzDefault=()=>{ const off=-new Date().getTimezoneOffset(); return (TZS.find(t=>t[1]===off)||TZS[1])[0]; };
    const isoDay=d=>new Date(d.getTime()-d.getTimezoneOffset()*6e4).toISOString().slice(0,10);
    let cf={sending:false};
    const ICON_CHEV='<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><path d="M4 6l4 4 4-4"/></svg>';
    function callReset(){ cf={topic:null, comment:"", phone: scn.phone==="yes"?PROFILE_PHONE:"", timeOpen:false, date:"", slot:"", tz:tzDefault(), err:{}, tried:false, sending:false}; }
    const fieldCls=(val,err,extra="")=>`sm-field${val?" up":""}${err?" err":""}${cf.sending?" off":""}${extra}`;
    const cap=(id,text,err)=>`<div class="cf-cap${err?" err":""}" id="${id}">${text}</div>`;
    function renderCall(){
      const keep=sm.querySelector(".sm-body")?.scrollTop||0, e=cf.err, dis=cf.sending?"disabled":"";
      const today=new Date(), max=new Date(today.getTime()+14*864e5), isToday=cf.date===isoDay(today);
      const slotOpts=SLOTS.map(s=>{ const past=isToday && +s.slice(6,8)<=today.getHours(); return `<option value="${s}"${cf.slot===s?" selected":""}${past?" disabled":""}>${s}${past?" — прошло":""}</option>`; }).join("");
      sm.innerHTML=`<div class="sm-head"><h2 id="smTitle">Запросить звонок</h2>${closeX}</div>
        <div class="sm-body">
          <p class="sm-intro">Специалист поддержки свяжется с вами по телефону, а если не дозвонится — напишет на ${SUP.user}.</p>
          <div class="cf-group" role="radiogroup" aria-labelledby="cfTopicL" aria-describedby="cfTopicE">
            <div class="cf-label" id="cfTopicL">Тема вопроса <i>*</i></div>
            <div class="cf-chips">${TOPICS.map((t,i)=>`<button type="button" class="cf-chip" role="radio" aria-checked="${cf.topic===i}" data-topic="${i}" ${dis} tabindex="${cf.topic===i||(cf.topic==null&&i===0)?0:-1}">${t}</button>`).join("")}</div>
            ${e.topic?cap("cfTopicE",e.topic,true):""}
          </div>
          <div>
            <div class="${fieldCls(cf.comment,e.comment)}">
              <textarea id="cfComment" maxlength="${CMAX}" aria-describedby="cfCommentC" ${dis}>${esc(cf.comment)}</textarea>
              <label for="cfComment"><span class="ph">Кратко опишите вопрос</span><span class="lb">Комментарий</span> <i>*</i></label>
              <div class="sm-count" id="cfCount" aria-live="polite"></div>
            </div>
            ${cap("cfCommentC", e.comment||"Не указывайте персональные данные других людей и реквизиты документов", !!e.comment)}
          </div>
          <div>
            <div class="${fieldCls(cf.phone,e.phone," cf-in")}">
              <input id="cfPhone" type="tel" inputmode="tel" autocomplete="tel" value="${esc(cf.phone)}" aria-describedby="cfPhoneC" ${dis}>
              <label for="cfPhone"><span class="ph">Телефон для связи</span><span class="lb">Телефон для связи</span> <i>*</i></label>
            </div>
            ${cap("cfPhoneC", e.phone||(cf.phone||cf.tried?"Номер изменится только для этого запроса — профиль не меняется":"Укажите номер, по которому вам удобно ответить"), !!e.phone)}
          </div>
          ${cf.timeOpen?`<div class="cf-time">
            <div class="cf-time-h"><span>Удобное время (необязательно)</span><button type="button" class="cf-link" data-time="off" ${dis}>Убрать</button></div>
            <div class="cf-row">
              <div><div class="${fieldCls(true,e.date," cf-in")}"><input id="cfDate" type="date" min="${isoDay(today)}" max="${isoDay(max)}" value="${cf.date}" aria-describedby="cfDateC" ${dis}><label for="cfDate"><span class="lb">Дата</span></label></div>${e.date?cap("cfDateC",e.date,true):""}</div>
              <div><div class="${fieldCls(cf.slot,e.slot," cf-in cf-sel")}"><select id="cfSlot" aria-describedby="cfSlotC" ${dis}><option value=""></option>${slotOpts}</select><label for="cfSlot"><span class="ph">Интервал</span><span class="lb">Интервал</span></label>${ICON_CHEV}</div>${e.slot?cap("cfSlotC",e.slot,true):""}</div>
            </div>
            <div class="${fieldCls(true,false," cf-in cf-sel")}"><select id="cfTz" ${dis}>${TZS.map(t=>`<option${cf.tz===t[0]?" selected":""}>${t[0]}</option>`).join("")}</select><label for="cfTz"><span class="lb">Часовой пояс</span></label>${ICON_CHEV}</div>
            <div class="cf-cap">Это пожелание: время звонка не назначается и не резервируется.</div>
          </div>`:`<div><button type="button" class="cf-link" data-time="on" ${dis}>+ Указать удобное время для звонка</button></div>`}
          <p class="cf-note">Вместе с запросом передадим ваши имя и email, название и ИНН организации.</p>
        </div>
        <div class="sm-acts"><button class="sm-btn sec" type="button" data-close ${dis}>Отмена</button>
          <button class="sm-btn pri" type="button" data-callsend ${dis}>${cf.sending?'<span class="sm-spin" aria-hidden="true"></span>Отправляем…':"Отправить"}</button></div>`;
      sm.querySelector(".sm-body").scrollTop=keep;
      wireCall();
    }
    function callCount(){ const c=sm.querySelector("#cfCount"); if(!c) return; const n=cf.comment.length; c.textContent=CMAX-n<100?`${n} / ${CMAX}`:""; }
    function validate(){
      const e={};
      if(cf.topic==null) e.topic="Выберите тему вопроса";
      if(!cf.comment.trim()) e.comment="Опишите вопрос — без комментария запрос не отправить";
      const digits=cf.phone.replace(/\D/g,"").length;
      if(!digits) e.phone="Укажите номер, по которому вам удобно ответить"; else if(digits<11||digits>15) e.phone="Проверьте номер — в нём не хватает цифр";
      if(cf.timeOpen && (cf.date||cf.slot)){ if(!cf.date) e.date="Выберите дату или уберите удобное время"; if(!cf.slot) e.slot="Выберите интервал или уберите удобное время"; }
      return e;
    }
    function wireCall(){
      const up=(el,v)=>el.closest(".sm-field").classList.toggle("up",!!v||document.activeElement===el);
      const clr=k=>{ if(cf.tried && cf.err[k]){ const ne=validate(); if(!ne[k]){ delete cf.err[k]; renderCall(); return true; } } return false; };
      sm.querySelectorAll("[data-topic]").forEach(b=>{
        b.addEventListener("click",()=>{ cf.topic=+b.dataset.topic; if(cf.err.topic) delete cf.err.topic; renderCall(); sm.querySelector(`[data-topic="${cf.topic}"]`).focus(); });
        b.addEventListener("keydown",ev=>{ const d={ArrowRight:1,ArrowDown:1,ArrowLeft:-1,ArrowUp:-1}[ev.key]; if(!d) return; ev.preventDefault();
          cf.topic=((+b.dataset.topic)+d+TOPICS.length)%TOPICS.length; delete cf.err.topic; renderCall(); sm.querySelector(`[data-topic="${cf.topic}"]`).focus(); });
      });
      const ta=sm.querySelector("#cfComment");
      ta.addEventListener("input",()=>{ cf.comment=ta.value; callCount(); if(!clr("comment")) up(ta,ta.value); });
      ta.addEventListener("focus",()=>up(ta,ta.value)); ta.addEventListener("blur",()=>up(ta,ta.value)); callCount();
      const ph=sm.querySelector("#cfPhone");
      ph.addEventListener("input",()=>{ ph.value=ph.value.replace(/[^\d+()\-\s]/g,""); cf.phone=ph.value; if(!clr("phone")) up(ph,ph.value); });
      ph.addEventListener("focus",()=>up(ph,ph.value)); ph.addEventListener("blur",()=>up(ph,ph.value));
      sm.querySelectorAll("[data-time]").forEach(b=>b.addEventListener("click",()=>{
        cf.timeOpen=b.dataset.time==="on"; if(!cf.timeOpen){ cf.date=""; cf.slot=""; cf.tz=tzDefault(); delete cf.err.date; delete cf.err.slot; }
        renderCall(); const t=sm.querySelector(cf.timeOpen?"#cfDate":"[data-time=on]"); if(t) t.focus(); }));
      const dt=sm.querySelector("#cfDate"), sl=sm.querySelector("#cfSlot"), tz=sm.querySelector("#cfTz");
      if(dt) dt.addEventListener("change",()=>{ cf.date=dt.value; const past=cf.date===isoDay(new Date()) && cf.slot && +cf.slot.slice(6,8)<=new Date().getHours(); if(past) cf.slot=""; if(cf.tried) cf.err=validate(); renderCall(); sm.querySelector("#cfDate").focus(); });
      if(sl) sl.addEventListener("change",()=>{ cf.slot=sl.value; if(cf.tried) cf.err=validate(); renderCall(); sm.querySelector("#cfSlot").focus(); });
      if(tz) tz.addEventListener("change",()=>{ cf.tz=tz.value; });
      sm.querySelector("[data-callsend]").addEventListener("click",()=>{
        cf.tried=true; cf.err=validate();
        if(Object.keys(cf.err).length){ renderCall();   // фокус — на первое поле с ошибкой
          const first={topic:`[data-topic="0"]`,comment:"#cfComment",phone:"#cfPhone",date:"#cfDate",slot:"#cfSlot"}[Object.keys(cf.err)[0]];
          const el=sm.querySelector(first); if(el){ el.focus(); el.scrollIntoView({block:"nearest"}); } return; }
        cf.sending=true; hideToast(true); renderCall();
        setTimeout(()=>{ cf.sending=false;
          if(scn.send==="fail"){ renderCall(); showToast("Не удалось отправить запрос. Попробуйте ещё раз."); }
          else renderCallSent();
        },900);
      });
    }
    function renderCallSent(){
      sm.innerHTML=`<div class="sm-head"><div class="sm-ok"><svg viewBox="0 0 26 26" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M6 13.5l4.5 4.5L20 8"/></svg></div><span style="flex:1"></span>${closeX}</div>
        <h2 id="smTitle" style="margin:0;font-size:24px;line-height:32px;font-weight:600">Запрос принят</h2>
        <p class="sm-intro">Спасибо! Специалист поддержки свяжется с вами по номеру ${esc(cf.phone.trim())}, а если не дозвонится — напишет на ${SUP.user}.</p>
        ${cf.timeOpen&&cf.date&&cf.slot?`<p class="sm-intro">Ваше пожелание по времени передано: ${new Date(cf.date+"T12:00").toLocaleDateString("ru-RU",{day:"numeric",month:"long"})}, ${cf.slot} (${cf.tz}).</p>`:""}
        <div class="sm-acts one"><button class="sm-btn pri" type="button" data-close>Понятно</button></div>`;
      sm.querySelector("[data-close].sm-btn").focus();
    }
    function openCall(){
      setOpen(false); lastFocus=document.activeElement;
      stopUploads(); hideToast(true); callReset(); sm.innerHTML=""; renderCall();
      const h=document.querySelector(".harness"); ov.style.top=h? Math.max(0,Math.round(h.getBoundingClientRect().bottom))+"px" : "";
      fade(ov,true); document.documentElement.style.overflow="hidden";
      sm.querySelector("[data-topic]").focus();
    }
    document.getElementById("supCall").addEventListener("click",e=>{ e.stopPropagation(); openCall(); });

    /* ---------- харнесс: сценарии ---------- */
    function harness(){
      const row=document.querySelector(".harness-row"); if(!row||row.querySelector(".sup-scn")) return;
      const seg=(label,key,opts)=>`<span class="sup-scn-g"><span class="sup-scn-l">${label}</span><span class="sup-seg">${opts.map(([v,t])=>`<button type="button" data-k="${key}" data-v="${v}" aria-pressed="${scn[key]===v}">${t}</button>`).join("")}</span></span>`;
      const w=document.createElement("div"); w.className="sup-scn";
      w.innerHTML=seg("Буфер обмена","clipboard",[["ok","Работает"],["deny","Запрещён"]])+seg("Отправка","send",[["ok","Успешно"],["fail","Ошибка"]])+seg("Загрузка файла","upload",[["ok","Успешно"],["fail","Обрыв"]])+seg("Телефон в профиле","phone",[["yes","Есть"],["no","Нет"]]);
      row.appendChild(w);
      w.addEventListener("click",e=>{ const b=e.target.closest("button[data-k]"); if(!b) return; e.stopPropagation();
        scn[b.dataset.k]=b.dataset.v; w.querySelectorAll(`[data-k="${b.dataset.k}"]`).forEach(x=>x.setAttribute("aria-pressed",String(x===b))); });
    }
    function fromHash(){
      if(!location.hash.startsWith("#support") && location.hash!=="#call-form") return;
      const pm=document.getElementById("protoMenu");
      if(pm){
        pm.querySelector(".pm-cur").textContent="Связаться с техподдержкой";
        pm.querySelectorAll(".pm-pop a").forEach(a=>a.toggleAttribute("aria-current",a.getAttribute("href")==="services.html#support"));
        const cur=pm.querySelector("[aria-current]"); if(cur) cur.setAttribute("aria-current","page");
        pm.querySelector(".pm-pop").hidden=true; pm.querySelector(".pm-trigger").setAttribute("aria-expanded","false");
      }
      harness();
      if(location.hash==="#support-form") openForm(); else if(location.hash==="#call-form") openCall(); else setOpen(true);
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

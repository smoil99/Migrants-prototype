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

  /* меню «?» — связаться с техподдержкой; services.html#support открывает его сразу */
  const box=document.getElementById("supMenu");
  if(box){
    const btn=box.querySelector(".help-btn"), pop=document.getElementById("supPop");
    const copy=box.querySelector(".copy-btn"), tip=document.getElementById("copyTip"), live=document.getElementById("copyLive");
    const TIP="Скопировать адрес почты", DONE="Скопировано в буфер обмена";
    const scrim=document.createElement("div"); scrim.className="sup-scrim"; scrim.hidden=true; document.body.appendChild(scrim);
    let timer;
    const place=()=>{ pop.style.left=""; const over=pop.getBoundingClientRect().right-(window.innerWidth-16); if(over>0) pop.style.left=(-13-over)+"px"; };
    const reset=()=>{ clearTimeout(timer); copy.classList.remove("copied"); tip.textContent=TIP; live.textContent=""; };
    const setOpen=o=>{ pop.hidden=!o; scrim.hidden=!o; btn.setAttribute("aria-expanded",String(o)); if(o) place(); else reset(); };
    async function write(text){
      try{ await navigator.clipboard.writeText(text); }
      catch(e){ const ta=document.createElement("textarea"); ta.value=text; ta.style.position="fixed"; ta.style.opacity="0";
        document.body.appendChild(ta); ta.select(); document.execCommand("copy"); ta.remove(); }
    }
    btn.addEventListener("click",e=>{ e.stopPropagation(); setOpen(pop.hidden); });
    scrim.addEventListener("click",()=>setOpen(false));
    document.addEventListener("click",e=>{ if(!pop.hidden&&!box.contains(e.target)) setOpen(false); });
    document.addEventListener("keydown",e=>{ if(e.key==="Escape"&&!pop.hidden){ setOpen(false); btn.focus(); } });
    copy.addEventListener("click",async()=>{
      await write(copy.dataset.copy); clearTimeout(timer);
      copy.classList.add("copied"); tip.textContent=DONE; live.textContent=DONE;
      timer=setTimeout(reset,2000);
    });
    function fromHash(){
      if(location.hash!=="#support") return;
      const pm=document.getElementById("protoMenu");
      if(pm){
        pm.querySelector(".pm-cur").textContent="Связаться с техподдержкой";
        pm.querySelectorAll(".pm-pop a").forEach(a=>a.toggleAttribute("aria-current",a.getAttribute("href")==="services.html#support"));
        const cur=pm.querySelector("[aria-current]"); if(cur) cur.setAttribute("aria-current","page");
        pm.querySelector(".pm-pop").hidden=true; pm.querySelector(".pm-trigger").setAttribute("aria-expanded","false");
      }
      setOpen(true);
    }
    window.addEventListener("hashchange",fromHash);
    window.addEventListener("resize",()=>{ if(!pop.hidden) place(); });
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

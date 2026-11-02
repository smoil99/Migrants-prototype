/* Компактная шапка заявки (docs#326): закреплённая панель, тултип полного названия, «нагрузочный» режим харнесса.
   Источник данных — полная шапка: панель зеркалит её содержимое, действия нажимают исходные кнопки. */
(function(){
  const $=(s,r=document)=>r.querySelector(s), $$=(s,r=document)=>[...r.querySelectorAll(s)];
  const root=document.documentElement, H=$(".lk-header");
  const isForm=!!$("#form"), titleEl=$("#title")||$(".rh-head h1"), tabs=$(".rh-tabs"), head=$(".tf-title")||$(".rh-head");
  const BACK='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M15 6l-6 6 6 6"/></svg>';
  const DUP='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="8" y="8" width="12" height="12" rx="2"/><path d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2"/></svg>';
  const SEND='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 12l16-8-6 16-3-7z"/></svg>';
  const DOTS='<svg viewBox="0 0 24 24" fill="currentColor"><circle cx="5" cy="12" r="1.8"/><circle cx="12" cy="12" r="1.8"/><circle cx="19" cy="12" r="1.8"/></svg>';

  /* ---------- панель ---------- */
  const bar=document.createElement("div"); bar.className="chb"; bar.id="cb"; bar.inert=true;
  bar.innerHTML='<div class="cb-in">'+
    '<button type="button" class="ch-back cb-back" aria-label="Вернуться к заявкам">'+BACK+'</button>'+
    '<div class="cb-title" id="cbTitle"></div>'+
    '<div class="cb-sub"><div class="cb-info" id="cbInfo"></div>'+
      (tabs?'<nav class="cb-tabs" id="cbTabs" aria-label="Разделы заявки"></nav>':'')+
      (isForm?'<select class="cb-sec" id="cbSec" aria-label="Перейти к разделу"></select>':'')+'</div>'+
    '<div class="cb-acts" id="cbActs">'+
      '<button type="button" class="dup-btn" id="cbDup" aria-label="Дублировать заявку">'+DUP+'<span class="lbl">Дублировать</span></button>'+
      (isForm?'<button type="button" class="btn primary cb-send" id="cbSend" aria-label="Отправить заявку">'+SEND+'<span class="lbl">Отправить заявку</span></button>':'')+
    '</div></div>';
  H.after(bar);
  $(".cb-in",bar).style.maxWidth=getComputedStyle($(".lk-header-in")).maxWidth;
  const bTitle=$("#cbTitle"), bInfo=$("#cbInfo"), bDup=$("#cbDup"), bSend=$("#cbSend"), bSec=$("#cbSec"), bTabs=$("#cbTabs");

  function clean(n){ n.removeAttribute("id"); $$("[id]",n).forEach(x=>x.removeAttribute("id")); return n; }
  function vis(e){ return !!e && !e.hidden && e.offsetParent!==null; }
  let lastInfo="";
  function sync(){
    if(stress && titleEl.textContent!==LONG) titleEl.textContent=LONG;
    bTitle.textContent=titleEl.textContent;
    const box=document.createElement("div");
    $$("#sentRef,#draftChip,.rh-status",head).filter(vis).forEach(e=>box.append(clean(e.cloneNode(true))));
    const meta=$("#meta"); if(vis(meta)) box.append(clean(meta.cloneNode(true)));
    if(box.innerHTML!==lastInfo){ lastInfo=box.innerHTML; bInfo.innerHTML=lastInfo; }
    const dup=$("#dupBtn"); bDup.hidden=!vis(dup); bDup.setAttribute("aria-disabled",dup?dup.getAttribute("aria-disabled")||"false":"false");
    if(bSend) bSend.hidden=document.body.classList.contains("sent");
    $$("#cbActs .ch-extra-act").forEach(e=>e.remove());
    const ex=$(".ch-extra-act",head); if(vis(ex)) bSend?bSend.before(clean(ex.cloneNode(true))):bDup.after(clean(ex.cloneNode(true)));
    if(bTabs){ const t=[...tabs.children].map(a=>a.outerHTML).join(""); if(bTabs.innerHTML!==t) bTabs.innerHTML=t; }
    markTrunc();
  }
  new MutationObserver(sync).observe(H,{subtree:true,childList:true,characterData:true,attributes:true,attributeFilter:["hidden","class","style","aria-disabled"]});
  new MutationObserver(sync).observe(document.body,{attributes:true,attributeFilter:["class"]});

  function setH(){ root.style.setProperty("--cb-h",bar.offsetHeight+"px"); }
  function onScroll(){
    const on=H.offsetParent!==null && H.getBoundingClientRect().bottom<=0;
    if(on!==bar.classList.contains("on")){ bar.classList.toggle("on",on); bar.inert=!on; hideTip(); }
    if(bSec && $("#steps")){ const i=[...$("#steps").children].findIndex(li=>li.classList.contains("on")); if(i>=0 && bSec.selectedIndex!==i) bSec.selectedIndex=i; }
  }
  new ResizeObserver(setH).observe(bar);
  window.addEventListener("scroll",onScroll,{passive:true});
  window.addEventListener("resize",()=>{ setH(); onScroll(); markTrunc(); });

  /* действия панели нажимают исходные элементы шапки */
  $(".cb-back",bar).addEventListener("click",()=>{ const b=$("#backBtn"); if(b) b.click(); else location.href="requests.html"; });
  bDup.addEventListener("click",()=>{ const d=$("#dupBtn"); if(d) d.click(); });
  if(bSend) bSend.addEventListener("click",()=>$("#sendBtn").click());
  if(bSec){
    SECS.forEach((s,i)=>{ const o=document.createElement("option"); o.value=i; o.textContent=(i+1)+". "+s.querySelector("h2").textContent; bSec.append(o); });
    bSec.addEventListener("change",()=>{ SECS[+bSec.value].scrollIntoView({behavior:"smooth"}); });
  }
  bInfo.addEventListener("click",e=>{
    if(e.target.closest(".sv-retry")){ $("#retry").click(); return; }
    const f=e.target.closest("[data-f]"); if(f){ $('#meta [data-f="'+f.dataset.f+'"]').click(); return; }
    /* на узкой панели подсказка не помещается — ведём к первому полю с ошибкой */
    if(e.target.closest(".sv-info") && window.matchMedia("(max-width:1100px)").matches){ const x=$("#meta [data-f]"); if(x) x.click(); }
  });

  /* ---------- полное название: тултип при наведении, фокусе и тапе ---------- */
  const tip=document.createElement("div"); tip.className="ch-tip"; tip.id="chTip"; tip.setAttribute("role","tooltip"); tip.hidden=true; document.body.append(tip);
  const cut=e=>e.scrollWidth>e.clientWidth+1||e.scrollHeight>e.clientHeight+1;
  function showTip(el){ if(!cut(el)) return; tip.textContent=el.textContent; tip.hidden=false;
    const r=el.getBoundingClientRect(), w=tip.offsetWidth;
    tip.style.left=Math.max(16,Math.min(r.left,innerWidth-w-16))+"px"; tip.style.top=(r.bottom+6)+"px"; }
  function hideTip(){ tip.hidden=true; }
  function markTrunc(){ [titleEl,bTitle].forEach(e=>{ if(cut(e)){ e.tabIndex=0; e.setAttribute("aria-describedby","chTip"); } else { e.removeAttribute("tabindex"); e.removeAttribute("aria-describedby"); } }); }
  [titleEl,bTitle].forEach(el=>{
    el.addEventListener("mouseenter",()=>showTip(el)); el.addEventListener("mouseleave",hideTip);
    el.addEventListener("focus",()=>showTip(el)); el.addEventListener("blur",hideTip);
    el.addEventListener("click",()=>{ tip.hidden?showTip(el):hideTip(); });
  });
  document.addEventListener("keydown",e=>{ if(e.key==="Escape") hideTip(); });
  window.addEventListener("scroll",hideTip,{passive:true});

  /* ---------- харнесс: длинное название + несколько статусов и действий ---------- */
  const LONG="Электрогазосварщик ручной дуговой и полуавтоматической сварки на монтаже металлоконструкций промышленных объектов (пятый разряд, вахта)";
  let stress=false, shortTitle="";
  const sw=$("#chStress");
  function setStress(on){
    stress=on; sw.setAttribute("aria-pressed",on);
    if(on){
      shortTitle=titleEl.textContent;
      const st=document.createElement("span"); st.className=(isForm?"tf-chip":"rh-status")+" ch-extra"; st.textContent="На согласовании";
      const anchor=$("#draftChip:not([hidden]),.rh-status",head)||titleEl; anchor.after(st);
      const ac=document.createElement("button"); ac.type="button"; ac.className="dup-btn ch-extra-act"; ac.setAttribute("aria-label","Ещё действия"); ac.innerHTML=DOTS.replace("<svg",'<svg')+'<span class="lbl">Ещё действие</span>';
      $("#dupBtn").after(ac);
    } else { $$(".ch-extra,.ch-extra-act",head).forEach(e=>e.remove()); titleEl.textContent=shortTitle; }
    sync();
  }
  if(sw) sw.addEventListener("click",()=>setStress(!stress));

  sync(); setH(); onScroll();
})();

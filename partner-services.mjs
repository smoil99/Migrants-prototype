export const organizations = { roma:'ООО Ромашка', bharat:'Bharat Services', reliance:'Reliance Inc.', client:'ИП Гаврилова (вы)' };
export const packages = [
  { id:'base-1', name:'Базовый', number:1, partner:'roma', services:[
    {id:'medical-1',name:'Медицинское освидетельствование',level:'По кандидату',state:'done',candidates:25},
    {id:'translation-1',name:'Перевод документов',level:'По заявке',state:'done'}
  ]},
  { id:'base-2', name:'Базовый', number:2, partner:'bharat', late:true, services:[
    {id:'medical-2',name:'Медицинское освидетельствование',level:'По кандидату',state:'new',candidates:0},
    {id:'translation-2',name:'Перевод документов',level:'По заявке',state:'work'}
  ]},
  {id:'preparation-3',name:'Подготовка',number:3,partner:'client',services:[
    {id:'workplace-3',name:'Подготовка рабочего места',level:'По заявке',state:'done'}
  ]}
];
export function availablePackages(phase='after'){return packages.filter(p=>phase!=='before'||!p.late);}
export function summarize(groups){
  const rows=groups.flatMap(p=>p.services);
  const done=rows.filter(s=>s.state==='done').length;
  return {total:rows.length,done,work:rows.filter(s=>s.state==='work').length,new:rows.filter(s=>s.state==='new').length,percent:rows.length?Math.round(done/rows.length*100):null};
}
export function partnerPackages(groups,partner){return partner==='all'?groups:groups.filter(p=>p.partner===partner);}
export function visiblePackages(groups,status,query){
  const q=query.trim().toLocaleLowerCase('ru');
  return groups.map(p=>({...p,services:p.services.filter(s=>(status==='all'||s.state===status)&&(!q||s.name.toLocaleLowerCase('ru').includes(q)))})).filter(p=>p.services.length);
}
if(typeof document!=='undefined'){
  const $=id=>document.getElementById(id);
  const phase=$('phase'),partner=$('partner'),status=$('statusFilter'),query=$('serviceQuery');
  const params=new URLSearchParams(location.hash.slice(1));
  if(['before','after'].includes(params.get('phase')))phase.value=params.get('phase');
  if(['all','roma','bharat','reliance'].includes(params.get('partner')))partner.value=params.get('partner');
  const stateLabels={done:'Завершена',work:'В работе',new:'Не начата'},stateDots={done:'done',work:'prog',new:'none'};
  const escaped=value=>String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const closed=new Set();
  function progress(s){
    if(s.candidates!==undefined)return `<div class="progress-text"><span>${s.candidates} канд.</span><span>${s.candidates}/25</span></div><progress max="25" value="${s.candidates}" aria-label="Выполнено для ${s.candidates} из 25 кандидатов"></progress>`;
    if(s.state==='done')return '<div class="progress-text"><span>Выполнено</span><span>100%</span></div><progress max="1" value="1" aria-label="Услуга выполнена"></progress>';
    return s.state==='work'?'Выполняется':'Не начата';
  }
  function render(){
    const groups=availablePackages(phase.value);
    const bharat=partner.querySelector('[value="bharat"]');bharat.hidden=phase.value==='before';bharat.disabled=phase.value==='before';
    if(bharat.disabled&&partner.value==='bharat')partner.value='all';
    const global=summarize(groups),slice=partnerPackages(groups,partner.value),summary=summarize(slice),visible=visiblePackages(slice,status.value,query.value);
    $('globalStats').innerHTML=[['Общий прогресс услуг',`${global.done} из ${global.total} · ${global.percent}%`],['Завершено всего',global.done],['Всего в работе',global.work],['Всего не начато',global.new]].map(([label,value])=>`<div class="global-stat"><h2>${label}</h2><strong>${value}</strong></div>`).join('');
    $('partnerEmpty').hidden=partner.value==='all'||summary.total>0;
    $('searchEmpty').hidden=summary.total===0||visible.length>0;
    const summaryText=summary.total?(partner.value==='all'?`Все услуги заявки · выполнено ${summary.done} из ${summary.total}`:`Услуги партнёра: ${summary.done} из ${summary.total} · ${summary.percent}%`):'У партнёра пока нет назначенных услуг';
    $('sliceSummary').textContent=summaryText;
    // The partner-empty headline supplies this text visually; retain the live-region announcement.
    $('sliceSummary').classList.toggle('sr-only',summary.total===0);
    $('serviceGroups').innerHTML=visible.map(p=>{
      const packageProgress=summarize([slice.find(g=>g.id===p.id)]);
      return `<details class="partner-package" data-package="${p.id}" ${closed.has(p.id)?'':'open'}><summary><span>${escaped(p.name)} · Пакет №${p.number} · ${escaped(organizations[p.partner])} <span class="package-count">· ${packageProgress.done} из ${packageProgress.total}</span></span></summary><div class="package-table" role="region" aria-label="Услуги пакета №${p.number}" tabindex="0"><table><thead><tr><th scope="col">Услуга</th><th scope="col">Статус</th><th scope="col">Исполнитель</th><th scope="col">Срок</th><th scope="col">Прогресс</th></tr></thead><tbody>${p.services.map(s=>`<tr data-service="${s.id}"><td>${escaped(s.name)}<small>${s.level} · Пакет №${p.number}</small></td><td><span class="spill"><span class="sd sd-${stateDots[s.state]}" aria-hidden="true"></span>${stateLabels[s.state]}</span></td><td>${escaped(organizations[p.partner])}</td><td>30.11.2026</td><td>${progress(s)}</td></tr>`).join('')}</tbody></table></div></details>`;
    }).join('');
    $('serviceGroups').querySelectorAll('details').forEach(d=>d.addEventListener('toggle',()=>{if(d.open)closed.delete(d.dataset.package);else closed.add(d.dataset.package);}));
    const next=new URLSearchParams({phase:phase.value,partner:partner.value});history.replaceState(null,'',`${location.pathname}#${next}`);
  }
  for(const e of [phase,partner,status])e.addEventListener('change',render);
  query.addEventListener('input',render);
  document.querySelector('.reset-partner').addEventListener('click',()=>{partner.value='all';status.value='all';query.value='';closed.clear();render();partner.focus();});
  $('resetSearch').addEventListener('click',()=>{status.value='all';query.value='';render();query.focus();});
  const menu=document.getElementById('protoMenu');
  if(menu){const trigger=menu.querySelector('.pm-trigger'),pop=menu.querySelector('.pm-pop');const close=()=>{pop.hidden=true;trigger.setAttribute('aria-expanded','false');};trigger.addEventListener('click',()=>{pop.hidden=!pop.hidden;trigger.setAttribute('aria-expanded',String(!pop.hidden));});document.addEventListener('click',e=>{if(!menu.contains(e.target))close();});document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!pop.hidden){close();trigger.focus();}});}
  render();
}

/* V13.3.1 — Panneaux centraux type Guild Master.
 * L'interface conserve les pages métier existantes, sans déplacer leurs contrôles.
 */
(() => {
'use strict';
const names={dashboard:'Fiche personnage',inventory:'Inventaire',guilds:'Guilde',shop:'Boutique',association:'Donjon',mail:'Messagerie',journal:'Notifications',ranking:'Classement',finance:'Finances',bank:'Banque',debts:'Charges et dettes'};
const states=new Map();
let foreground=null;
function init(){
  const container=document.getElementById('windowDesktop');
  const app=document.getElementById('app');
  if(!container||!app||states.size)return;
  const shade=document.createElement('div');
  shade.id='desktopShade';shade.className='desktop-shade';shade.hidden=true;
  shade.setAttribute('aria-hidden','true');
  app.insertBefore(shade,container);
  shade.addEventListener('click',()=>{if(foreground)close(foreground);});
  for(const [id,label] of Object.entries(names)){
    const node=document.getElementById('page-'+id);if(!node)continue;
    const bar=document.createElement('div');bar.className='cw-titlebar';
    const heading=document.createElement('div');heading.className='cw-titletext';
    const subtitle=document.createElement('span');subtitle.className='cw-overline';subtitle.textContent='CHRONICLES';
    const title=document.createElement('strong');title.textContent=label;
    heading.append(subtitle,title);
    const closeBtn=document.createElement('button');closeBtn.type='button';closeBtn.className='cw-close';closeBtn.title='Fermer la fenêtre';closeBtn.setAttribute('aria-label','Fermer '+label);closeBtn.textContent='×';
    bar.append(heading,closeBtn);
    node.prepend(bar);node.classList.add('cw-window');node.dataset.window=id;
    node.setAttribute('role','dialog');node.setAttribute('aria-label',label);node.setAttribute('aria-modal','true');
    states.set(id,{node});
    closeBtn.addEventListener('click',()=>close(id));
  }
  document.addEventListener('keydown',e=>{
    if(e.key==='Escape'&&foreground&&document.getElementById('welcome')?.hidden){
      // Ne pas intercepter Échap si un dialogue du navigateur est ouvert.
      close(foreground);
    }
  });
  document.body.classList.add('desktop-mode');
  navSync();
}
function shadeSync(){const shade=document.getElementById('desktopShade');if(shade)shade.hidden=!foreground;}
function navSync(){
  for(const [id,s] of states){
    const b=document.querySelector(`.nav-btn[data-page="${id}"]`);
    if(!b)continue;
    const shown=s.node.classList.contains('cw-open');
    b.classList.toggle('cw-task-front',shown&&foreground===id);
    b.setAttribute('aria-pressed',String(shown&&foreground===id));
    if(!foreground)b.classList.remove('active');
  }
  shadeSync();
}
function open(id){
  const s=states.get(id);if(!s)return;
  for(const [other,t] of states){
    const visible=other===id;
    t.node.classList.toggle('cw-open',visible);
    if(visible)t.node.scrollTop=0;
  }
  foreground=id;
  navSync();
}
function close(id){
  const s=states.get(id);if(!s)return;
  s.node.classList.remove('cw-open');
  if(foreground===id)foreground=null;
  navSync();
}
function minimize(id){close(id);}
function maximize(id){open(id);}
function focus(id){open(id);}
function isForeground(id){return foreground===id&&!!states.get(id)?.node.classList.contains('cw-open');}
function reset(){
  foreground=null;
  for(const s of states.values())s.node.classList.remove('cw-open','cw-minimized','cw-maximized','active');
  navSync();
}
window.ChroniclesDesktop={init,open,close,minimize,maximize,focus,reset,isForeground,
  getState:()=>Object.fromEntries([...states].map(([id,s])=>[id,{open:s.node.classList.contains('cw-open'),minimized:false}]))};
window.addEventListener('DOMContentLoaded',init);
})();

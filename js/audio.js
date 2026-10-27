/* Chronicles — sons procéduraux (origine V13.1) — Sons procéduraux hors ligne.
 * Aucun asset externe, aucune lecture automatique avant une interaction humaine.
 * Préférences globales distinctes des sauvegardes de carrière.
 */
(() => {
 'use strict';
 const KEY='chroniques_aventurier_audio_pref_v1';
 const $=id=>document.getElementById(id);
 let enabled=true, volume=.40, context=null, master=null, unlocked=false;
 let lastMail=-Infinity;
 try { const p=JSON.parse(localStorage.getItem(KEY)||'{}'); if(typeof p.enabled==='boolean')enabled=p.enabled;
   if(Number.isFinite(p.volume))volume=Math.min(1,Math.max(0,p.volume)); } catch (_) {}
 const AudioConstructor=window.AudioContext||window.webkitAudioContext;
 function save(){ try{localStorage.setItem(KEY,JSON.stringify({enabled,volume}));}catch(_){} }
 function unlock(){
   if(!AudioConstructor||!enabled||volume<=0)return false;
   try{
     if(!context){ context=new AudioConstructor();master=context.createGain();master.gain.value=volume*.42;master.connect(context.destination); }
     if(context.state==='suspended')context.resume().catch(()=>{});
     unlocked=true;
     return context.state==='running';
   }catch(_){return false;}
 }
 // Une courbe d'enveloppe à attaque douce évite les clics numériques.
 function note(freq,offset,duration,kind='sine',strength=.35,slide=0){
   if(!context||!master)return;
   const now=context.currentTime+Math.max(.004,offset), osc=context.createOscillator(), gain=context.createGain();
   osc.type=kind;osc.frequency.setValueAtTime(Math.max(40,freq),now);
   if(slide)osc.frequency.exponentialRampToValueAtTime(Math.max(40,freq+slide),now+duration);
   gain.gain.setValueAtTime(.0001,now);gain.gain.exponentialRampToValueAtTime(Math.max(.002,strength),now+.008);
   gain.gain.exponentialRampToValueAtTime(.0001,now+duration);
   osc.connect(gain);gain.connect(master);osc.start(now);osc.stop(now+duration+.02);
   osc.onended=()=>{try{osc.disconnect();gain.disconnect();}catch(_){}};
 }
 function noise(offset=.0,duration=.08,strength=.08){
   if(!context||!master)return;
   const now=context.currentTime+Math.max(.004,offset),sampleRate=context.sampleRate;
   const buffer=context.createBuffer(1,Math.max(1,Math.ceil(sampleRate*duration)),sampleRate);
   const data=buffer.getChannelData(0);for(let i=0;i<data.length;i++)data[i]=(Math.random()*2-1)*(.7-.4*i/data.length);
   const source=context.createBufferSource(),filter=context.createBiquadFilter(),gain=context.createGain();
   source.buffer=buffer;filter.type='bandpass';filter.frequency.value=1350;filter.Q.value=.7;
   gain.gain.setValueAtTime(Math.max(.002,strength),now);gain.gain.exponentialRampToValueAtTime(.0001,now+duration);
   source.connect(filter);filter.connect(gain);gain.connect(master);source.start(now);source.stop(now+duration+.004);
   source.onended=()=>{try{source.disconnect();filter.disconnect();gain.disconnect();}catch(_){}};
 }
 const patterns={
   navigate:[[670,0,.043,'sine',.16],[920,.038,.05,'sine',.11]],
   select:[[590,0,.045,'triangle',.14]],
   purchase:[[880,0,.095,'sine',.4],[1175,.085,.13,'sine',.34],[1480,.18,.18,'sine',.24]],
   sell:[[980,0,.08,'sine',.33],[740,.09,.11,'sine',.29]],
   equip:[[540,0,.075,'triangle',.3],[1080,.06,.12,'sine',.29]],
   mail:[[784,0,.10,'sine',.25],[988,.12,.17,'sine',.22]],
   raid:[[220,0,.12,'sawtooth',.2,120],[330,.12,.13,'triangle',.28,125],[440,.24,.19,'sine',.35,130]],
   victory:[[523,0,.12,'triangle',.35],[659,.11,.12,'triangle',.35],[784,.22,.12,'triangle',.38],[1046,.34,.31,'sine',.5]],
   defeat:[[480,0,.16,'triangle',.30],[392,.14,.17,'triangle',.30],[294,.29,.28,'sine',.34]],
   rank:[[523,0,.13,'sine',.38],[659,.11,.13,'sine',.4],[784,.22,.13,'sine',.42],[1047,.33,.13,'sine',.45],[1318,.45,.34,'sine',.52]],
   injury:[[180,0,.14,'triangle',.31,-55],[146,.14,.24,'sine',.30,-36]],
   arenaWin:[[440,0,.1,'triangle',.27],[587,.12,.10,'sine',.28],[880,.24,.22,'sine',.35]],
   arenaLose:[[400,0,.11,'triangle',.23],[308,.12,.2,'sine',.28]],
   guild:[[523,0,.11,'triangle',.28],[659,.12,.11,'triangle',.3],[784,.24,.25,'sine',.34]],
   money:[[1046,0,.09,'sine',.24],[1397,.075,.16,'sine',.22]],
   alert:[[420,0,.11,'triangle',.28],[420,.18,.12,'triangle',.29]],
   pause:[[650,0,.09,'sine',.19],[400,.085,.14,'sine',.2]],
   resume:[[400,0,.09,'sine',.19],[650,.085,.14,'sine',.2]],
   job:[[659,0,.11,'sine',.32],[880,.1,.17,'sine',.32]]
 };
 function play(type){
   if(!enabled||volume<=0||!unlocked||document.hidden||!AudioConstructor)return false;
   if(type==='mail'){const t=performance.now();if(t-lastMail<5500)return false;lastMail=t;}
   if(!context||context.state!=='running'){unlock();if(!context||context.state!=='running')return false;}
   for(const [freq,off,dur,wave,amp,slide=0] of patterns[type]||patterns.select)note(freq,off,dur,wave,amp,slide);
   if(type==='raid')noise(.02,.14,.085);
   else if(type==='equip')noise(.015,.06,.046);
   return true;
 }
 function refresh(){
   const b=$('audioBtn'),c=$('audioEnabled'),v=$('audioVolume'),display=$('audioVolumeValue');
   if(!b)return;
   b.textContent=enabled&&volume>0?'🔊 Sons':'🔇 Muet';
   b.title=enabled?'Paramètres audio du jeu':'Sons désactivés — cliquez pour régler';
   b.setAttribute('aria-label',enabled?'Ouvrir les réglages du son':'Ouvrir les réglages du son (muet)');
   if(c)c.checked=enabled;
   if(v){v.value=String(Math.round(volume*100));v.disabled=!enabled;}
   if(display)display.textContent=`${Math.round(volume*100)} %`;
   if(master&&context)master.gain.setTargetAtTime(enabled?volume*.42:0,context.currentTime,.02);
 }
 function initUI(){
   if(!$('audioBtn'))return;
   $('audioBtn').addEventListener('click',()=>{
     const panel=$('audioPanel');panel.hidden=!panel.hidden;
     $('audioBtn').setAttribute('aria-expanded',String(!panel.hidden));
     if(!panel.hidden){unlock();refresh();}
   });
   $('audioEnabled').addEventListener('change',e=>{enabled=e.target.checked;save();if(enabled)unlock();refresh();if(enabled)play('select');});
   $('audioVolume').addEventListener('input',e=>{volume=Math.min(1,Math.max(0,Number(e.target.value)/100));save();refresh();});
   $('audioVolume').addEventListener('change',()=>{if(enabled){unlock();play('select');}});
   $('audioTest').addEventListener('click',()=>{if(unlock())play('victory');});
   document.addEventListener('pointerdown',e=>{
     if(e.isTrusted)unlock();
     const container=e.target.closest('.audio-controls');
     if(!container&& !$('audioPanel').hidden){$('audioPanel').hidden=true;$('audioBtn').setAttribute('aria-expanded','false');}
   },{passive:true});
   document.addEventListener('keydown',e=>{if(e.isTrusted)unlock();}, {passive:true});
   refresh();
 }
 window.ChroniclesAudio=Object.freeze({play,unlock,initUI,getSettings:()=>({enabled,volume})});
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',initUI,{once:true});else initUI();
})();

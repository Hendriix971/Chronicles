/* Chronicles — carte du monde (origine V13.3) — Carte Three.js
 * Adaptation du principe de la carte de Guild Master V4.6.1 : caméra
 * orthographique, bâtiment par faction, portails, cycle jour/nuit,
 * équipes de trois matérialisées pendant la durée réelle des raids.
 * IMPORTANT : seulement une vue passive sur game, jamais de mutation du jeu.
 */
(() => {
'use strict';
const $=id=>document.getElementById(id), RANKS=['E','D','C','B','A','S'];
const RANK_COLORS={E:0xaab4c1,D:0x69c887,C:0x68b6ef,B:0xf5b671,A:0xf07169,S:0xb4a0f6};
const GUILD_COLORS=[0x74c9cf,0xdc8a73,0x8db4e5,0xd5a869,0x91d69c,0xb999d9,0xe6c58a,0xa6beb9,0xe6a2b2];
const ASSOC=[-10.8,6.6], portalLocations={E:[-19,-13],D:[14,13],C:[-18,13],B:[14,-13],A:[-3,-14],S:[23,-9]};
const guildLocations=[[-20,4],[-14,-4],[-8,-5],[-1,6],[5,-4],[11,5],[19,5],[-20,-6],[18,-5]];
let game=null,scene,camera,renderer,sun,hemisphere,world,markers,ready=false;
let rot=.67,tilt=.78,zoom=.66,phase=0, lastTime=0,realFps=0;
const guildModels=new Map(),idleModels=new Map(),raidModels=new Map();
let dragging=null, mapCanvas=null;
const clamp=(v,a,b)=>Math.min(b,Math.max(a,v));
function vec(pt){return new THREE.Vector3(pt[0],0,pt[1]);}
function material(color,roughness=.8){return new THREE.MeshStandardMaterial({color,roughness,metalness:.035,flatShading:true});}
function mesh(geo,mat,x=0,y=0,z=0){const o=new THREE.Mesh(geo,mat);o.position.set(x,y,z);o.castShadow=true;o.receiveShadow=true;return o;}
function box(w,h,d,color,x=0,y=h/2,z=0){return mesh(new THREE.BoxGeometry(w,h,d),material(color),x,y,z);}
function makeLabel(label,textColor='#f5f5f8',small=false){
  const cv=document.createElement('canvas');cv.width=512;cv.height=128;const cx=cv.getContext('2d');
  cx.fillStyle='rgba(12,25,42,.85)';cx.beginPath();cx.roundRect(9,14,494,102,17);cx.fill();
  cx.strokeStyle='rgba(227,238,255,.35)';cx.lineWidth=2;cx.stroke();
  cx.fillStyle=textColor;cx.font=`bold ${small?32:36}px system-ui`;
  cx.textAlign='center';cx.textBaseline='middle';cx.fillText(label,256,65,474);
  const s=new THREE.Sprite(new THREE.SpriteMaterial({map:new THREE.CanvasTexture(cv),transparent:true,depthTest:false}));
  s.scale.set(small?3.0:3.9,small?.75:.94,1);return s;
}
function terrain(){
  world.add(box(60,.8,42,0x809b88,0,-.48,0));
  const concrete=material(0x8e9da7);
  for(const x of [-22,-14,-6,2,10,18,25])world.add(mesh(new THREE.BoxGeometry(1.25,.08,36),concrete,x,.015,0));
  for(const z of [-15,-8,-1,6,13])world.add(mesh(new THREE.BoxGeometry(55,.08,1.20),concrete,0,.017,z));
  const marking=new THREE.MeshBasicMaterial({color:0xe5d9b5});
  for(const x of [-22,-14,-6,2,10,18,25])for(let z=-17;z<=17;z+=2.6)world.add(mesh(new THREE.BoxGeometry(.085,.01,1.05),marking,x,.07,z));
  for(const z of [-15,-8,-1,6,13])for(let x=-27;x<=27;x+=2.6)world.add(mesh(new THREE.BoxGeometry(1.1,.01,.085),marking,x,.07,z));
  // Jardins, petits lacs, parcs dans les angles de la ville.
  const park=material(0x6c9c77);for(const [x,z,w,d] of [[-25,-15,5,7],[-3,11,5,5],[23,14,7,6]]){
    world.add(mesh(new THREE.BoxGeometry(w,.05,d),park,x,.07,z));
  }
  const trunk=material(0x735743),leaf=[material(0x5b9570),material(0x6da480),material(0x80ad89)];
  for(let i=0;i<115;i++){
    const x=-29+(i*13.713)%58,z=-19+(i*7.39)%39;
    if(Math.abs((x+22)%8)<1.2||Math.abs((z+15)%7)<1.1)continue;
    if(guildLocations.some(p=>Math.hypot(x-p[0],z-p[1])<2.5)||Math.hypot(x-ASSOC[0],z-ASSOC[1])<3)continue;
    const y=.24;world.add(mesh(new THREE.CylinderGeometry(.09,.12,.52,5),trunk,x,y,z));
    world.add(mesh(new THREE.ConeGeometry(.39+((i%4)*.065),1.05+((i%4)*.15),5),leaf[i%leaf.length],x,1.01,z));
  }
  // Immeubles low-poly : quartiers urbains modernes, constructions purement décoratives.
  const colors=[0xa5c3d1,0x97abbd,0xc8bab0,0xc0c4cc,0x9ab6b9,0xe0bea3,0x7893a6];
  const reserved=[...guildLocations,ASSOC,...Object.values(portalLocations),[4,11],[-24,10]];
  for(let i=0;i<92;i++){
    const x=-26+(i*11.73)%54,z=-16+(i*17.17)%34;
    if(Math.abs((x+22)%8)<1.85||Math.abs((z+15)%7)<1.55)continue;
    if(reserved.some(pt=>Math.hypot(x-pt[0],z-pt[1])<3))continue;
    const w=.82+(i%3)*.24,d=.82+(i%4)*.16,h=1.25+(i%7)*.48;
    const g=new THREE.Group();g.position.set(x,0,z);
    g.add(box(w,h,d,colors[i%colors.length]));g.add(box(w+.10,.12,d+.10,0x536579,0,h+.06,0));
    const winmat=new THREE.MeshBasicMaterial({color:i%4===0?0xe7db9a:0xb2e1eb});
    for(let k=0;k<Math.floor(h/.67);k++)for(const side of [-1,1])g.add(mesh(new THREE.BoxGeometry(.085,.17,.22),winmat,side*(w/2+.01),.45+k*.58,0));
    world.add(g);
  }
  // Mobiliers urbains simples : voitures garées, lampadaires.
  for(let i=0;i<34;i++){
    const x=-25+(i*8.3)%50,z=[-15,-8,-1,6,13][i%5]+.85;
    const car=new THREE.Group();car.position.set(x,.15,z);
    car.add(box(.7,.22,.35,[0xcd7775,0x6d9dc2,0xe5cb9f][i%3]));car.add(box(.32,.16,.31,0x4b687f,0,.25,0));world.add(car);
  }
}
function addGuildBuilding(g,i){
  const pos=guildLocations[i%guildLocations.length],group=new THREE.Group();group.position.copy(vec(pos));
  const color=GUILD_COLORS[i%GUILD_COLORS.length],lv=clamp(g.level||1,1,4),height=1.5+lv*.52;
  group.add(box(2.15,height,1.65,color));group.add(box(2.32,.16,1.83,0x344c63,0,height+.1,0));
  const panes=new THREE.MeshBasicMaterial({color:0xcef1f8});
  for(let k=0;k<lv+1;k++)for(const x of [-.65,0,.65])group.add(mesh(new THREE.BoxGeometry(.36,.24,.035),panes,x,.57+k*.52,.847));
  group.add(box(.65,.85,.09,0x334d62,0,.43,.88));
  const lab=makeLabel(g.name||'Guilde','#fff',true);lab.position.set(0,height+1.12,0);group.add(lab);
  world.add(group);return{group,name:g.name,level:lv};
}
function addInstitution(name,pos,color,h=2.2){
  const group=new THREE.Group();group.position.copy(vec(pos));
  group.add(box(2.95,h,2.2,color));group.add(box(3.2,.16,2.5,0x394f63,0,h+.08,0));
  const glass=material(0x98d8e9,.28);for(const x of [-.7,0,.7])for(let j=0;j<3;j++)group.add(mesh(new THREE.BoxGeometry(.48,.42,.09),glass,x,.72+j*.57,1.14));
  const lab=makeLabel(name,'#ffdfab');lab.position.y=h+1.15;group.add(lab);world.add(group);
}
function addPortals(){
  for(const [rank,pos] of Object.entries(portalLocations)){
    const group=new THREE.Group();group.position.copy(vec(pos));const color=RANK_COLORS[rank];
    group.add(mesh(new THREE.CylinderGeometry(1.10,1.2,.16,10),material(0x4c5764),0,.08,0));
    const glowing=new THREE.MeshStandardMaterial({color,emissive:color,emissiveIntensity:.85,roughness:.4});
    const portal=mesh(new THREE.TorusGeometry(.53,.14,10,20),glowing,0,.74,0);group.add(portal);
    group.add(mesh(new THREE.CircleGeometry(.5,20),new THREE.MeshBasicMaterial({color:0x101829,side:THREE.DoubleSide}),0,.74,-.025));
    const rune=mesh(new THREE.RingGeometry(.78,.88,22),new THREE.MeshBasicMaterial({color,side:THREE.DoubleSide,transparent:true,opacity:.6}),0,.20,0);rune.rotation.x=-Math.PI/2;group.add(rune);
    for(const x of [-.78,.78])group.add(mesh(new THREE.ConeGeometry(.2,.65,5),material(0x69717e),x,.32,.23));
    const label=makeLabel('Donjon '+rank,'#fff',true);label.position.y=2.03;group.add(label);
    world.add(group);
  }
}
function adventurerToken(n,role='idle'){
  const group=new THREE.Group(),rank=n?.rank||'E',color=RANK_COLORS[rank]||RANK_COLORS.E;
  const body=mesh(new THREE.CylinderGeometry(.125,.17,.43,6),material(role==='player'?0xffd688:0x45647a),0,.36,0);
  group.add(body);group.add(mesh(new THREE.SphereGeometry(.15,7,6),material(n?.isPlayer?0xf9d3a1:0xf2caa9),0,.68,0));
  const ring=mesh(new THREE.RingGeometry(.20,.29,12),new THREE.MeshBasicMaterial({color,side:THREE.DoubleSide}),0,.04,0);ring.rotation.x=-Math.PI/2;group.add(ring);
  if(role==='player'){const l=makeLabel('VOUS','#ffdc93',true);l.scale.set(1.7,.45,1);l.position.y=1.1;group.add(l);}
  return group;
}
function init(){
  if(ready)return;
  const fallback=$('worldFallback');
  if(!window.THREE){fallback.hidden=false;return;}
  try{
    scene=new THREE.Scene();scene.background=new THREE.Color(0x9eafc3);scene.fog=new THREE.Fog(0x9eafc3,55,105);
    const holder=$('threeWorld');renderer=new THREE.WebGLRenderer({antialias:true,alpha:false});
    renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,1.65));renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;
    holder.appendChild(renderer.domElement);mapCanvas=renderer.domElement;
    camera=new THREE.OrthographicCamera(-17,17,10,-10,.1,250);
    hemisphere=new THREE.HemisphereLight(0xc5ddff,0x6d8069,1.1);scene.add(hemisphere);
    sun=new THREE.DirectionalLight(0xffefcf,1.45);sun.position.set(-15,24,9);sun.castShadow=true;sun.shadow.mapSize.set(1024,1024);sun.shadow.camera.left=-42;sun.shadow.camera.right=42;sun.shadow.camera.top=37;sun.shadow.camera.bottom=-37;scene.add(sun);
    world=new THREE.Group();scene.add(world);markers=new THREE.Group();scene.add(markers);
    terrain();addInstitution('Association',ASSOC,0x7aa8b2,2.65);addInstitution('Banque',[4,11],0xb8ae93,2.4);addInstitution('Résidences',[-24,10],0xb7b2c9,2.15);addPortals();
    cameraUpdate();resize();
    $('mapZoomIn').addEventListener('click',()=>setZoom(zoom*1.15));
    $('mapZoomOut').addEventListener('click',()=>setZoom(zoom/1.15));
    $('mapReset').addEventListener('click',()=>{rot=.67;tilt=.78;setZoom(.66);});
    holder.addEventListener('wheel',e=>{e.preventDefault();setZoom(zoom*(e.deltaY>0?.90:1.10));},{passive:false});
    holder.addEventListener('pointerdown',e=>{if(e.button!==0)return;dragging={x:e.clientX,y:e.clientY,rot,tilt};holder.setPointerCapture(e.pointerId);});
    holder.addEventListener('pointermove',e=>{if(!dragging)return;rot=dragging.rot+(e.clientX-dragging.x)*.009;tilt=clamp(dragging.tilt+(e.clientY-dragging.y)*.005,.35,1.23);cameraUpdate();});
    holder.addEventListener('pointerup',()=>dragging=null);holder.addEventListener('pointercancel',()=>dragging=null);
    window.addEventListener('resize',resize);ready=true;requestAnimationFrame(animate);
  }catch(e){console.warn('Carte 3D indisponible :',e);fallback.hidden=false;try{renderer?.dispose();}catch{}}
}
function setZoom(v){zoom=clamp(v,.31,1.5);cameraUpdate();}
function cameraUpdate(){if(!camera)return;const radius=66,az=rot,el=tilt;
  camera.position.set(radius*Math.sin(az)*Math.cos(el),radius*Math.sin(el),radius*Math.cos(az)*Math.cos(el));
  const ratio=Math.max(.9,$('worldDesk')?.clientWidth/Math.max(1,$('worldDesk')?.clientHeight)||1.6);
  const vertical=24/zoom;camera.left=-vertical*ratio/2;camera.right=vertical*ratio/2;camera.top=vertical/2;camera.bottom=-vertical/2;camera.lookAt(0,0,0);camera.updateProjectionMatrix();}
function resize(){if(!renderer)return;const holder=$('worldDesk'),w=holder?.clientWidth||window.innerWidth,h=holder?.clientHeight||window.innerHeight;renderer.setSize(Math.max(1,w),Math.max(1,h),false);cameraUpdate();}
function makeRoster(){
  const r=new Map();if(!game)return r;
  (game.population||[]).forEach(n=>r.set(n.id,n));r.set('player',{...game.player,id:'player',isPlayer:true});return r;
}
function activeRaids(){
  if(!game)return [];
  const raids=[],taken=new Set();
  for(const g of game.guilds||[])for(const raid of g.raids||[]){
    const id=raid.id||`guild-${g.id}-${(raid.memberIds||[]).join('.')}`;
    if(taken.has(id))continue;
    taken.add(id);raids.push({id,rank:raid.rank,remainingMs:raid.remainingMs,durationMs:raid.durationMs,ids:raid.memberIds||[],from:guildLocations[(game.guilds||[]).indexOf(g)%9],source:'guild'});
  }
  for(const raid of game.associationNpcRaids||[]){
    const id=raid.id||'npc-'+raid.memberIds.join('.');if(taken.has(id))continue;taken.add(id);
    raids.push({id,rank:raid.rank,remainingMs:raid.remainingMs,durationMs:raid.durationMs,ids:raid.memberIds||[],from:ASSOC,source:'association'});
  }
  if(game.raid&&game.raid.source!=='guild'){
    const raid=game.raid,id='player-association';
    raids.push({id,rank:raid.rank,remainingMs:raid.remainingMs,durationMs:raid.durationMs,ids:['player',...(raid.memberIds||[])],from:ASSOC,source:'association'});
  }
  return raids;
}
function syncStructures(){
  if(!ready||!game)return;
  const valid=new Set();for(let i=0;i<(game.guilds||[]).length;i++){
    const g=game.guilds[i];valid.add(g.id);
    const m=guildModels.get(g.id);if(m&&m.name===g.name&&m.level===(g.level||1))continue;
    if(m)world.remove(m.group);guildModels.set(g.id,addGuildBuilding(g,i));
  }
  for(const [id,m] of guildModels)if(!valid.has(id)){world.remove(m.group);guildModels.delete(id);}
}
function syncTokens(raids,roster){
  const occupied=new Set(raids.flatMap(r=>r.ids));
  const alive=new Set(roster.keys());
  for(const [id,node] of idleModels)if(!alive.has(id)){markers.remove(node);idleModels.delete(id);}
  let independentCount=0;
  for(const [id,n] of roster){
    let node=idleModels.get(id);
    if(!node){node=adventurerToken(n,id==='player'?'player':'idle');markers.add(node);idleModels.set(id,node);}
    node.visible=!occupied.has(id);
    if(!node.visible)continue;
    let ix=-1;
    if(id==='player')ix=(game.guilds||[]).findIndex(g=>(g.memberIds||[]).includes('player'));
    else ix=(game.guilds||[]).findIndex(g=>(g.memberIds||[]).includes(id));
    const home=ix>=0?guildLocations[ix%9]:ASSOC;
    if(ix<0)independentCount++;
    // Stable, deterministic small offsets; all 50 NPCs exist even when idle.
    const nIndex=id==='player'?51:((game.population||[]).findIndex(p=>p.id===id)+1);
    const angle=nIndex*2.399963,rad=.50+Math.sqrt((nIndex%18)/18)*1.45;
    node.position.set(home[0]+Math.cos(angle)*rad,.10,home[1]+Math.sin(angle)*rad);
  }
  const all=new Set(raids.map(r=>r.id));for(const [id,data] of raidModels)if(!all.has(id)){markers.remove(data.group);raidModels.delete(id);}
  for(const raid of raids){if(raidModels.has(raid.id))continue;
    const group=new THREE.Group();const names=raid.ids.map(id=>roster.get(id));
    for(let i=0;i<raid.ids.length;i++){
      const n=names[i];if(!n)continue;
      const t=adventurerToken(n,raid.ids[i]==='player'?'player':'travel');
      t.userData.offset=new THREE.Vector3((i-1)*.38,0,(i%2)*.32);group.add(t);
    }
    markers.add(group);raidModels.set(raid.id,{group});
  }
  const badge=$('worldActivity');if(badge)badge.textContent=`${roster.size} aventuriers · ${raids.length} expédition${raids.length>1?'s':''} · ${independentCount} au quartier Association`;
}
function updateLights(){
  if(!game||!scene)return;
  const minute=((game.worldMinutes||480)%1440+1440)%1440;
  const sunlight=clamp((Math.sin((minute/1440)*Math.PI*2-Math.PI/2)+.28)/1.28,0,1);
  const daySky=new THREE.Color(0x9eafc3),nightSky=new THREE.Color(0x192a47);
  scene.background.copy(nightSky).lerp(daySky,sunlight);
  scene.fog.color.copy(new THREE.Color(0x25364a)).lerp(daySky,sunlight);
  hemisphere.intensity=.43+sunlight*.84;sun.intensity=.22+sunlight*1.2;
  sun.position.set(Math.cos(minute/1440*Math.PI*2)*20,7+sunlight*23,Math.sin(minute/1440*Math.PI*2)*15);
}
function positionExpeditions(raids,time){
  for(const raid of raids){
    const marker=raidModels.get(raid.id);if(!marker)continue;
    const p=clamp(1-(Number(raid.remainingMs)||0)/Math.max(1,Number(raid.durationMs)||1),0,1);
    const from=vec(raid.from),to=vec(portalLocations[raid.rank]||portalLocations.E);
    const phase=p<.25?p/.25:p>.78?(1-(p-.78)/.22):1;
    // Guild Master's 25% outgoing, 53% at portal, 22% return trip.
    const base=new THREE.Vector3().lerpVectors(from,to,clamp(phase,0,1));
    marker.group.children.forEach((tok,i)=>{
      tok.position.copy(base).add(tok.userData.offset);
      if(!game.paused&&p>.25&&p<.78){tok.position.x+=Math.cos(time*.002+i)*.06;tok.position.z+=Math.sin(time*.002+i)*.06;}
      tok.position.y=.12+(!game.paused?Math.sin(time*.004+i)*.025:0);
    });
  }
}
function animate(time){
  requestAnimationFrame(animate);if(!ready||!renderer)return;
  if(!game||$('app').hidden){renderer.render(scene,camera);return;}
  // Ne synchronise les groupes qu'environ six fois/s; animation à 60 FPS.
  if(time-lastTime>160){const roster=makeRoster(),raids=activeRaids();syncStructures();syncTokens(raids,roster);lastTime=time;updateLights();}
  positionExpeditions(activeRaids(),time);renderer.render(scene,camera);
}
function setGame(g){game=g;if(!ready)init();if(!ready)return;
  for(const node of idleModels.values())markers.remove(node);idleModels.clear();
  for(const node of raidModels.values())markers.remove(node.group);raidModels.clear();
  // Guild models are reused only if matching the new world's names/levels.
  for(const node of guildModels.values())world.remove(node.group);guildModels.clear();
  if(game){syncStructures();syncTokens(activeRaids(),makeRoster());updateLights();}resize();
}
window.ChroniclesWorld={setGame,resize,isReady:()=>ready,getMetrics:()=>({tokens:idleModels.size,expeditions:raidModels.size,guilds:guildModels.size,ready})};
window.addEventListener('DOMContentLoaded',init);
})();

/* Chronicles — V15.13
 * Base reprise conceptuellement de Guild Master V4.6.1 (classes, rangs, donjon E).
 * Le personnage est un aventurier individuel : aucun transfert automatique du modèle de guilde.
 */
(() => {
  'use strict';
  // Compatibilité avec les anciennes versions : les anciens identifiants ne sont
  // employés QUE pour lire les sauvegardes historiques, jamais pour en créer.
  const PREVIOUS_STORAGE_ROOT = 'chroniques_' + 'chas' + 'seur';
  const LEGACY_SAVE_KEY = PREVIOUS_STORAGE_ROOT + '_v1_save';
  const PREVIOUS_SAVE_PREFIX = PREVIOUS_STORAGE_ROOT + '_v11_world_';
  const PREVIOUS_IMPORT_MARK = PREVIOUS_STORAGE_ROOT + '_v11_legacy_imported';
  const V41_SAVE_PREFIX = 'chroniques_aventurier_v41_world_';
  const V11_SAVE_PREFIX = 'chroniques_aventurier_v11_world_';
  const V5_SAVE_PREFIX = 'chroniques_aventurier_v5_world_';
  const V51_SAVE_PREFIX = 'chroniques_aventurier_v51_world_';
  const V52_SAVE_PREFIX = 'chroniques_aventurier_v52_world_';
  const V6_SAVE_PREFIX = 'chroniques_aventurier_v6_world_';
  const V7_SAVE_PREFIX = 'chroniques_aventurier_v7_world_';
  const V8_SAVE_PREFIX = 'chroniques_aventurier_v8_world_';
  const V9_SAVE_PREFIX = 'chroniques_aventurier_v9_world_';
  const V10_SAVE_PREFIX = 'chroniques_aventurier_v10_world_';
  const V111_SAVE_PREFIX = 'chroniques_aventurier_v111_world_';
  const V113_SAVE_PREFIX = 'chroniques_aventurier_v113_world_';
  const V12_SAVE_PREFIX = 'chroniques_aventurier_v12_world_';
  const V121_SAVE_PREFIX = 'chroniques_aventurier_v121_world_';
  const V13_SAVE_PREFIX = 'chroniques_aventurier_v13_world_';
  const V131_SAVE_PREFIX = 'chroniques_aventurier_v131_world_';
  const V132_SAVE_PREFIX = 'chroniques_aventurier_v132_world_';
  const V133_SAVE_PREFIX = 'chroniques_aventurier_v133_world_';
  const V1331_SAVE_PREFIX = 'chroniques_aventurier_v1331_world_';
  const V134_SAVE_PREFIX = 'chroniques_aventurier_v134_world_';
  const V135_SAVE_PREFIX = 'chroniques_aventurier_v135_world_';
  const V1351_SAVE_PREFIX = 'chroniques_aventurier_v1351_world_'; // V13.5.1 et V13.6 partagent cette clé.
  const V137_SAVE_PREFIX = 'chroniques_aventurier_v137_world_';
  const V138_SAVE_PREFIX = 'chroniques_aventurier_v138_world_';
  const V139_SAVE_PREFIX = 'chroniques_aventurier_v139_world_';
  const V1310_SAVE_PREFIX = 'chroniques_aventurier_v1310_world_';
  const V1311_SAVE_PREFIX = 'chroniques_aventurier_v1311_world_';
  const V1312_SAVE_PREFIX = 'chroniques_aventurier_v1312_world_';
  const V13121_SAVE_PREFIX = 'chroniques_aventurier_v13121_world_';
  const V13122_SAVE_PREFIX = 'chroniques_aventurier_v13122_world_';
  const V13123_SAVE_PREFIX = 'chroniques_aventurier_v13123_world_';
  const V13124_SAVE_PREFIX = 'chroniques_aventurier_v13124_world_';
  const V13125_SAVE_PREFIX = 'chroniques_aventurier_v13125_world_';
  const V13126_SAVE_PREFIX = 'chroniques_aventurier_v13126_world_';
  const V13127_SAVE_PREFIX = 'chroniques_aventurier_v13127_world_'; // Ancienne version, lecture seule.
  const V14_SAVE_PREFIX = 'chronicles_v14_world_'; // Lecture seule des parties V14.
  const V141_SAVE_PREFIX = 'chronicles_v141_world_'; // Versions V14.1, V14.1.1 et V14.1.2 : lecture seule.
  const V1413_SAVE_PREFIX = 'chronicles_v1413_world_'; // Dernière version précédente : indispensable à la migration.
  const V142_SAVE_PREFIX = 'chronicles_v142_world_'; // V14.2 : lecture seule.
  const V154_SAVE_PREFIX = 'chronicles_v1422_world_'; // Archives V15.4 lues sans écriture ni suppression.
  const V156_SAVE_PREFIX = 'chronicles_v156_world_'; // V15.6 : lecture seule.
  const V157_SAVE_PREFIX = 'chronicles_v157_world_'; // V15.7 : lecture seule.
  const V158_SAVE_PREFIX = 'chronicles_v158_world_'; // V15.8 : lecture seule.
  const V159_SAVE_PREFIX = 'chronicles_v159_world_'; // V15.9 : lecture seule.
  const V1510_SAVE_PREFIX = 'chronicles_v1510_world_'; // V15.10 : lecture seule.
  const V1511_SAVE_PREFIX = 'chronicles_v1511_world_'; // V15.11 : lecture seule.
  const V1512_SAVE_PREFIX = 'chronicles_v1512_world_'; // V15.12 : lecture seule.
  const SAVE_PREFIX = 'chronicles_v1513_world_'; // V15.13 : copies isolées, originaux intacts.
  const LEGACY_IMPORT_MARK = 'chronicles_v1513_legacy_imported';
  const SAVE_VERSION = 1;
  const CLASSES = Object.freeze({
    Gardien: {role:'Tank',base:34},
    Guerrier: {role:'DPS',base:36},
    Assassin: {role:'DPS',base:38},
    Mage: {role:'DPS',base:40},
    Soigneur: {role:'Heal',base:31},
  });
  const RANKS=['E','D','C','B','A','S'];
  const RANK_MULT={E:.68,D:.82,C:1,B:1.35,A:1.8,S:2.45};
  const RANK_MULT_E=RANK_MULT.E;
  // Exact XP per rank from Guild Master: XP resets at promotion, surplus is preserved.
  const XP_NEED={E:55,D:75,C:100,B:180,A:320,S:Infinity};
  const SLOTS=['Arme','Armure','Accessoire'];
  // V13.12 : trois panoplies de trois pièces pour chaque rang. La puissance et
  // le prix restent ceux des 18 objets historiques, seulement permutés.
  // Les anciens identifiants du Duelliste sont conservés pour les sauvegardes.
  const SETS=Object.freeze({duelliste:'Duelliste',templier:'Templier',arcaniste:'Arcaniste',guerisseur:'Guérisseur'});
  const GEAR_TIERS=Object.freeze([
    {rank:'E',bonus:[5,4,3],price:[55,45,35],ids:['e_sword','e_cloak','e_ring'],
      names:[['Épée ébréchée','Manteau de recrue','Bague de cuivre'],['Épée du rempart','Cuirasse du novice','Médaillon du serment'],['Bâton d’apprenti','Robe des étincelles','Anneau des murmures']]},
    {rank:'D',bonus:[11,9,7],price:[160,140,110],ids:['d_blade','d_armor','d_charm'],
      names:[['Lame d’acier','Cuir du bretteur','Amulette du brave'],['Épée du justicier','Cuirasse du bastion','Sceau du veilleur'],['Bâton de braise','Robe des runes','Cristal de mana']]},
    {rank:'C',bonus:[20,16,12],price:[310,275,210],ids:['c_blade','c_armor','c_charm'],
      names:[['Lame runique','Cotte du duelliste','Anneau d’ambre'],['Lame du serment','Armure du rempart','Talisman du sanctuaire'],['Sceptre des brumes','Manteau astral','Orbe des arcanes']]},
    {rank:'B',bonus:[33,27,21],price:[580,475,390],ids:['b_blade','b_armor','b_charm'],
      names:[['Sabre de guerre','Plastron du bretteur','Insigne du vétéran'],['Épée du rempart sacré','Égide de bataille','Médaille du défenseur'],['Bâton du firmament','Robe de l’oracle','Grimoire des anciens']]},
    {rank:'A',bonus:[54,43,32],price:[1050,880,690],ids:['a_blade','a_armor','a_charm'],
      names:[['Lame de l’aurore','Tenue du conquérant','Sceau de noblesse'],['Épée du gardien','Armure de l’inébranlable','Amulette du rempart'],['Sceptre des étoiles','Robe des constellations','Codex de l’archimage']]},
    {rank:'S',bonus:[86,69,52],price:[2200,1750,1350],ids:['s_blade','s_armor','s_charm'],
      names:[['Lame du Conquérant','Tenue du Bretteur','Insigne de Précision'],['Épée du Justicier','Égide du Colosse','Sceau de Protection'],['Bâton des Anciens','Robe Astrale','Cœur d’Éternité']]}
  ]);
  const SET_DISTRIBUTIONS=Object.freeze({
    duelliste:[0,1,2],templier:[1,0,2],arcaniste:[1,2,0]
  });
  const HISTORIC_SHOP_ITEMS=GEAR_TIERS.flatMap(tier=>
    Object.entries(SET_DISTRIBUTIONS).flatMap(([set,distribution],setIndex)=>
      SLOTS.map((slot,slotIndex)=>{
        const originalIndex=distribution[slotIndex];
        return Object.freeze({
          id:set==='duelliste'?tier.ids[slotIndex]:`${tier.rank.toLowerCase()}_${set}_${['weapon','armor','accessory'][slotIndex]}`,
          name:tier.names[setIndex][slotIndex],rank:tier.rank,slot,set,
          bonus:tier.bonus[originalIndex],price:tier.price[originalIndex]
        });
      })
    )
  );
  // V14.2.2 : quatrième panoplie. Chaque pièce protège les trois membres d'un
  // raid, même si le porteur n'est pas Soigneur. Bonus cumulable et plafonné.
  // Les bonus de puissance existants et les 35 synergies ne changent pas.
  const HEALER_TIERS=Object.freeze({
    E:{power:[3,2,1],price:[35,30,25],protect:1,names:['Bâton des premiers soins','Tunique du novice guérisseur','Breloque apaisante']},
    D:{power:[6,5,4],price:[100,90,80],protect:1,names:['Bâton de réconfort','Habit de l’infirmier','Pendentif de secours']},
    C:{power:[11,9,7],price:[185,165,145],protect:1,names:['Sceptre de sollicitude','Robe du sanctuaire','Sceau de vigueur']},
    B:{power:[18,15,12],price:[350,310,270],protect:2,names:['Bâton de restauration','Tenue du guérisseur','Amulette de sauvegarde']},
    A:{power:[29,24,19],price:[630,540,460],protect:2,names:['Sceptre de bienveillance','Robe des mains sacrées','Talisman de clémence']},
    S:{power:[48,40,32],price:[1250,1050,850],protect:3,names:['Bâton de la vie éternelle','Manteau du grand guérisseur','Cœur de résilience']}
  });
  const MAX_GROUP_PROTECTION_POINTS=12;
  const SHOP_ITEMS=Object.freeze([
    ...HISTORIC_SHOP_ITEMS,
    ...RANKS.flatMap(rank=>SLOTS.map((slot,i)=>Object.freeze({
      id:`${rank.toLowerCase()}_guerisseur_${['weapon','armor','accessory'][i]}`,
      name:HEALER_TIERS[rank].names[i],rank,slot,set:'guerisseur',
      bonus:HEALER_TIERS[rank].power[i],price:HEALER_TIERS[rank].price[i],
      injuryShieldPoints:HEALER_TIERS[rank].protect
    })))
  ]);
  const ITEM_BY_ID=Object.fromEntries(SHOP_ITEMS.map(i=>[i.id,i]));
  // V13.10 — Identités stables par identifiant, sans doublon de prénom.
  const LEGACY_NPC_FIRST=['Mia','Kael','Lina','Orin','Soren','Yuna','Lys','Ilan','Frey','Nora','Erwan','Aïda','Ari','Milo','Elia','Luna','Rina','Naël','Théo','Selma'];
  const NPC_FIRST_FEMALE=['Aïda', 'Elia', 'Luna', 'Rina', 'Maëlys', 'Iris', 'Alina', 'Néa', 'Céleste', 'Élise', 'Liora', 'Sélène', 'Inaya', 'Talia', 'Elyne', 'Maïa', 'Lyra', 'Aurore', 'Naya'];
  const NPC_FIRST_MALE=['Lys', 'Ilan', 'Erwan', 'Ari', 'Milo', 'Naël', 'Théo', 'Elias', 'Dorian', 'Ronan', 'Cyril', 'Léandre', 'Ezio', 'Tarek', 'Silas', 'Noé', 'Aedan', 'Bastien', 'Nolan', 'Cédric', 'Lucien', 'Raphaël'];
  const NPC_LAST=['Valence', 'Ardent', 'Écorce', 'Vesper', 'Argent', 'Noctis', 'Rive', 'Orage', 'Delcourt', 'Aubeclaire', 'Brume', 'Rochefort', 'Ventoux', 'Morvan', 'Sombreval', 'Lenoir', 'Clairmont', 'Bellamy', 'Dargent', 'Solenne', 'Marceau', 'Falcourt', 'Virel', 'Lormont', 'Azur', 'Ravelle', 'Montfaucon', 'Épervier', 'Corven', 'Delaunay', 'Saurel', 'Estrel', 'Varennes', 'Hautbois', 'Nérac', 'Vauclair', 'Belrose', 'Montel', 'Caldor', 'Roselune', 'Deveraux'];
  const CHIEF_FULL_NAMES={'guild_1': 'Mia Aubeval', 'guild_2': 'Kael Sombrelame', 'guild_3': 'Yuna Valbrume', 'guild_4': 'Orin Cendreval', 'guild_5': 'Lina Opaline', 'guild_6': 'Soren Noctel', 'guild_7': 'Nora Hauterive', 'guild_8': 'Selma Aubépine', 'guild_9': 'Frey Astréa'};
  const LEGACY_FEMALE_FIRST=new Set(['Mia','Lina','Yuna','Nora','Aïda','Elia','Luna','Rina','Selma']);
  const NPC_DISPLAY_NAMES=(()=>{
    let female=0,male=0;
    return Array.from({length:41},(_,i)=>{
      const isFemale=LEGACY_FEMALE_FIRST.has(LEGACY_NPC_FIRST[i%LEGACY_NPC_FIRST.length]);
      const first=isFemale?NPC_FIRST_FEMALE[female++]:NPC_FIRST_MALE[male++];
      return `${first} ${NPC_LAST[i]}`;
    });
  })();

  const NPC_RANK_DISTRIBUTION={E:9,D:9,C:8,B:7,A:5,S:3};
  const NPC_STEP_MINUTES=120;
  
  // V13.2 : guilde = 100 % du butin brut fixe, Association = 50 à 80 %.
  const LEGACY_LOOT_BY_RANK = Object.freeze({E:150,D:600,C:3000,B:8000,A:20000,S:60000});
  const LOOT_BY_RANK = Object.freeze({E:600,D:2000,C:3000,B:8000,A:20000,S:60000});
  const ASSOCIATION_DUNGEON_RANKS = ['E','D','C'];
  const ASSOCIATION_RECOVERY_RATES = Object.freeze([50,55,60,65,70,75,80]);
  const ASSOCIATION_PAY_RATE = .10;
  const GUILD_LAUNCH_COST_RATE = .20;
  function guildLaunchCost(rank){return Math.round(LOOT_BY_RANK[rank]*GUILD_LAUNCH_COST_RATE);}
  function associationRecovery(rank){
    const percent=ASSOCIATION_RECOVERY_RATES[randomInt(0,ASSOCIATION_RECOVERY_RATES.length-1)];
    const recovered=Math.round(LOOT_BY_RANK[rank]*percent/100);
    return {percent,recovered,individual:Math.round(recovered*ASSOCIATION_PAY_RATE)};
  }
  // Les anciens raids EN COURS conservent leurs montants / partages au chargement.
  function raidLootValue(raid){return Number.isFinite(raid.lootReference)?raid.lootReference:LEGACY_LOOT_BY_RANK[raid.rank];}
  function qualifiedForDungeon(team,rank){return team.length===3&&team.some(n=>getRankIndex(n.rank)>=getRankIndex(rank));}
  const GUILD_WAGE_RATE = .10; // Les PNJ gardent le taux de référence.
  const CONTRACT_LENGTH_MINUTES = 7*24*60; // 7 jours du monde, renouvellement automatique.
  const OFFER_LIFETIME_MINUTES = 2*24*60;
  const GUILD_CONTACT_COOLDOWN = 2*24*60;
  const NEGOTIATION_LIMIT = 3;
  const MAX_NEGOTIATED_RATE = .36;
  const CAREER_REVIEW_MINUTES = 360; // Évaluation périodique, pas à chaque frame.
  // V11.1 — Plus de rémunération contre une responsabilité contractuelle RÉELLE.
  // Le risque porte uniquement sur les frais de lancement connus avant le raid,
  // jamais sur le butin hypothétique ou sur les pertes des coéquipiers.
  const GUILD_TERMS=Object.freeze({
    prudente:{rate:.08,failureShare:0,departureFee:0,policy:'Sécurité de l’équipe et respect des missions accessibles.'},
    'équilibrée':{rate:.10,failureShare:0,departureFee:0,policy:'Participation aux missions confiées, dans la limite de votre rang.'},
    recruteuse:{rate:.11,failureShare:0,departureFee:0,policy:'Polyvalence et participation régulière aux missions proposées.'},
    audacieuse:{rate:.16,failureShare:.5,departureFee:0,policy:'Accepter un partage des frais de lancement en échange d’une prime élevée.'}
  });
  // La Lame Écarlate propose plus encore, contre le remboursement intégral des frais.
  const GUILD_SPECIAL_TERMS=Object.freeze({guild_2:{rate:.18,failureShare:1}});
  const DUNGEONS = Object.freeze({
    E:{rank:'E',need:20,durationMs:8000,gold:[LOOT_BY_RANK.E,LOOT_BY_RANK.E],rep:[1,3],xp:11,injury:.02},
    D:{rank:'D',need:34,durationMs:11000,gold:[LOOT_BY_RANK.D,LOOT_BY_RANK.D],rep:[3,5],xp:16,injury:.04},
    C:{rank:'C',need:58,durationMs:15000,gold:[LOOT_BY_RANK.C,LOOT_BY_RANK.C],rep:[4,7],xp:24,injury:.06},
    B:{rank:'B',need:95,durationMs:22000,gold:[LOOT_BY_RANK.B,LOOT_BY_RANK.B],rep:[6,10],xp:34,injury:.08},
    A:{rank:'A',need:150,durationMs:30000,gold:[LOOT_BY_RANK.A,LOOT_BY_RANK.A],rep:[10,15],xp:49,injury:.10},
    S:{rank:'S',need:240,durationMs:38000,gold:[LOOT_BY_RANK.S,LOOT_BY_RANK.S],rep:[15,25],xp:70,injury:.13}
  });
  // Compatibilité V13.1 : anciens raids de l'Association déjà en cours.
  // V12 — 35 compositions EXACTES approuvées : bonus de puissance et
  // variation de la probabilité individuelle de blessure (points de %).
  // A Assassin ; G Guerrier ; M Mage ; T Gardien/Tank ; H Soigneur.
  const CLASS_CODE=Object.freeze({Assassin:'A',Guerrier:'G',Mage:'M',Gardien:'T',Soigneur:'H'});
  const TEAM_SYNERGIES=Object.freeze(Object.fromEntries([
    ['AHT',20,-5],['GHT',20,-5],['HMT',20,-5],
    ['AGH',13,-3],['AHM',14,-2],['GHM',14,-2],
    ['AAH',12,-2],['GGH',12,-2],['HMM',13,-1],['HTT',11,-8],
    ['AHH',9,-6],['GHH',9,-6],['HHM',10,-6],['HHT',8,-9],['HHH',0,-7],
    ['AAA',4,10],['AAG',5,9],['AAM',6,10],['AAT',7,4],
    ['AGG',5,9],['AGM',7,9],['AGT',8,4],['AMM',8,10],['AMT',9,4],['ATT',6,2],
    ['GGG',4,8],['GGM',6,9],['GGT',8,4],['GMM',8,10],['GMT',9,4],['GTT',6,2],
    ['MMM',9,11],['MMT',11,5],['MTT',7,2],['TTT',3,1]
  ].map(([key,power,injury])=>[key,Object.freeze({bonus:power/100,injuryPoints:injury})])));
  function compositionKey(members){return members.map(m=>CLASS_CODE[m.class]||'').sort().join('');}
  function partySynergy(members){
    const key=compositionKey(members),data=members.length===3?TEAM_SYNERGIES[key]:null;
    if(!data)return {bonus:0,injuryPoints:0,label:'Équipe incomplète'};
    return {...data,key,label:`Synergie +${Math.round(data.bonus*100)} % · blessure ${data.injuryPoints>0?'+':''}${data.injuryPoints} pts`};
  }
  function groupEquipmentProtection(members){
    if(!Array.isArray(members)||members.length!==3)return 0;
    const total=members.reduce((sum,member)=>sum+SLOTS.reduce((n,slot)=>
      n+(ITEM_BY_ID[member?.equipment?.[slot]]?.injuryShieldPoints||0),0),0);
    return clamp(total,0,MAX_GROUP_PROTECTION_POINTS);
  }
  function raidProtection(raid){
    // Les anciens raids sans instantané gardent leur probabilité de blessure
    // initiale, même si leur équipement change après une migration.
    return Number.isFinite(raid?.protectionPoints)?raid.protectionPoints:0;
  }
  function protectionLabel(points){
    return points>0?`Protection des équipements : −${points} pts de risque de blessure pour chaque membre`:
      'Protection des équipements : aucune';
  }
  function gearEffectText(item){
    if(!item)return 'Aucun bonus actif';
    return `+${item.bonus} puissance${item.injuryShieldPoints?` · −${item.injuryShieldPoints} pt${item.injuryShieldPoints>1?'s':''} blessure pour chaque membre du groupe`:''}`;
  }
  function injuryChance(rank,success,synergy,protectionPoints=0){
    const base=(DUNGEONS[rank]?.injury??.04)+(success?0:.18);
    return clamp(base+(synergy?.injuryPoints||0)/100-clamp(protectionPoints,0,MAX_GROUP_PROTECTION_POINTS)/100,0,1);
  }
  function raidSynergy(raid){
    if(raid?.synergyData && Number.isFinite(raid.synergyData.injuryPoints))return raid.synergyData;
    if(raid?.members?.length===3)return partySynergy(raid.members);
    const ids=raid?.memberIds||[];
    const group=ids.map(id=>id==='player'?{...game.player,class:game.player.class}:npcById(id)).filter(Boolean);
    return partySynergy(group);
  }
  // La doctrine n'impose pas de classe fictive : le chef valorise les vraies
  // compositions parmi les membres de sa guilde, sans recomposer chaque raid.
  function doctrineScore(g,trio){
    const synergy=partySynergy(trio),roles=trio.map(n=>n.role),heal=roles.filter(r=>r==='Heal').length;
    const tanks=roles.filter(r=>r==='Tank').length,dps=roles.filter(r=>r==='DPS').length;
    const ranks=trio.map(n=>getRankIndex(n.rank));
    const spread=Math.max(...ranks)-Math.min(...ranks);
    let doctrine=0;
    if(g.style==='prudente')doctrine=(heal?65:0)+tanks*32-synergy.injuryPoints*5+(dps?10:0);
    else if(g.style==='audacieuse')doctrine=dps*28+(heal===0?64:0)+trio.filter(n=>n.class==='Mage').length*9-synergy.injuryPoints;
    else if(g.style==='équilibrée')doctrine=(heal&&tanks&&dps?115:0)+synergy.bonus*160;
    else doctrine=(new Set(roles)).size*27+(heal?20:0)+synergy.bonus*130;
    return partyPower(trio)*.17+doctrine-spread*36;
  }
  // Chaque reconstitution a une cause explicite : effectif modifié ou promotion.
  // Les membres blessés restent dans leur escouade, sans remplaçants temporaires.
  function reorganizeGuild(g,reason='changement d’effectif'){
    if(!g)return;
    if((g.raids||[]).length){g.pendingSquadReorg=true;return;}
    const members=guildMembers(g),unused=[...members],squads=[];
    // Affecter d'abord le joueur à des pairs de rang proche lors des promotions.
    if(g.memberIds.includes('player') && unused.length>=3){
      const player=unused.find(n=>n.id==='player');let best=null,bestScore=-Infinity;
      for(let i=0;i<unused.length;i++)for(let j=i+1;j<unused.length;j++){
        const a=unused[i],b=unused[j];if(a.id==='player'||b.id==='player')continue;
        const distance=Math.abs(getRankIndex(a.rank)-getRankIndex(player.rank))+Math.abs(getRankIndex(b.rank)-getRankIndex(player.rank));
        const score=doctrineScore(g,[player,a,b])-distance*105;
        if(score>bestScore){bestScore=score;best=[player,a,b];}
      }
      if(best){squads.push(best.map(n=>n.id));for(const n of best)unused.splice(unused.findIndex(v=>v.id===n.id),1);}
    }
    while(unused.length>=3){
      let best=null,bestScore=-Infinity;
      for(let i=0;i<unused.length-2;i++)for(let j=i+1;j<unused.length-1;j++)for(let k=j+1;k<unused.length;k++){
        const trio=[unused[i],unused[j],unused[k]],score=doctrineScore(g,trio);
        if(score>bestScore){best=trio;bestScore=score;}
      }
      if(!best)break;
      squads.push(best.map(n=>n.id));for(const n of best)unused.splice(unused.findIndex(v=>v.id===n.id),1);
    }
    g.squads=squads;
    g.reserveIds=unused.map(n=>n.id);
    const ownSquad=squads.find(s=>s.includes('player'));
    g.playerTeamIds=ownSquad?ownSquad.filter(id=>id!=='player'):[];
    g.teamIds=(squads.find(s=>!s.includes('player'))||[]).slice();
    g.squadRosterSignature=g.memberIds.slice().sort().join('|');
    g.squadPlayerRank=g.memberIds.includes('player')?game.player.rank:null;
    g.pendingSquadReorg=false;
    if(reason==='promotion' && ownSquad){
      addGuildNews(g,`${g.leader} réaffecte ${game.player.name} à une escouade de rang comparable après sa promotion.`,'info');
      logEvent('Réorganisation de guilde',`${g.name} : votre escouade a été réorganisée après votre promotion de rang.`,'rank');
    }
  }
  function ensureGuildSquads(g){
    if(!g)return;
    const roster=g.memberIds.slice().sort().join('|');
    const newRank=g.memberIds.includes('player')?game.player.rank:null;
    const valid=Array.isArray(g.squads)&&g.squads.every(t=>Array.isArray(t)&&t.length===3&&t.every(id=>g.memberIds.includes(id))) &&
      new Set(g.squads.flat()).size===g.squads.flat().length &&
      g.squads.flat().length+((g.reserveIds||[]).length)===g.memberIds.length;
    if(!valid||roster!==g.squadRosterSignature||newRank!==g.squadPlayerRank||g.pendingSquadReorg){
      reorganizeGuild(g,newRank!==g.squadPlayerRank && g.squadPlayerRank!=null?'promotion':'changement d’effectif');
    }
  }

  function splitLootThree(gross,rotation=0){
    const base=Math.floor(gross/3),remainder=gross%3;
    const shares=[base,base,base];
    for(let i=0;i<remainder;i++)shares[(rotation+i)%3]++;
    return shares;
  }
  const ASSOCIATION_INDEPENDENT_RAID_GAP=[32,68]; // Minutes du monde entre les départs des indépendants.
  const NPC_HOME_RECOVERY_MS=38000;
  const CANDIDACY_COOLDOWN_MINUTES=480;
  // V7 — logements possédés, résidence principale unique. Aucun bonus de combat.
  // Prix d'équilibrage initiaux, à ajuster lors des tests utilisateur.
  const HOMES=Object.freeze([
    {id:'studio_start',name:'Studio délabré',tier:1,price:0,recoverySeconds:38,description:'Studio vétuste de départ · récupération lente'},
    {id:'studio_renove',name:'Studio rénové',tier:2,price:400,recoverySeconds:32,description:'Petit studio salubre · soins plus rapides'},
    {id:'appartement',name:'Appartement confortable',tier:3,price:1800,recoverySeconds:26,description:'Appartement lumineux · espace de convalescence'},
    {id:'maison',name:'Maison de ville',tier:4,price:7500,recoverySeconds:20,description:'Résidence spacieuse · repos optimal'},
    {id:'villa',name:'Villa de prestige',tier:5,price:20000,recoverySeconds:16,description:'Meilleure qualité de résidence disponible'}
  ]);
  const HOME_BY_ID=Object.fromEntries(HOMES.map(h=>[h.id,h]));
  const HOME_RESALE_RATE=.75;
  const AMBITIONS=Object.freeze({power:{label:'Puissance',unit:'puissance',description:'Devenez l’aventurier le plus puissant du monde.'},rep:{label:'Réputation',unit:'réputation',description:'Soyez le plus célèbre des aventuriers.'},gold:{label:'Richesse',unit:'or',description:'Développez votre patrimoine net : or, revente des biens et charges impayées.'}});
  // V8 : charges de logement. Barème initial à équilibrer selon les retours.
  const BILLING_CYCLE_MINUTES = 2*1440; // Facture tous les 2 jours du monde.
  const BILL_DUE_MINUTES = 1440; // 1 jour du monde pour payer.
  const ACCOUNTANT_PRICE = 1500; // Prestation acquise une seule fois, sans abonnement.
  const ACCOUNTANT_EARLY_MINUTES = 60; // Paiement une heure du monde avant l’échéance.
  const LATE_PENALTY_RATE = .10; // Pénalité unique : pas d'intérêts composés.
  const HOME_CHARGES = Object.freeze({
    studio_start:{maintenance:20,tax:10},studio_renove:{maintenance:40,tax:20},
    appartement:{maintenance:100,tax:50},maison:{maintenance:240,tax:120},villa:{maintenance:600,tax:300}
  });
  // V10 — Banques, emprunts et procédure administrative FICTIVE.
  const BANK_SAVINGS_CYCLE_MINUTES=2*1440;
  const BANK_SAVINGS_RATE=.005; // 0,5 % tous les deux jours, arrondi à l'unité inférieure.
  const BANK_LOAN_DURATION_MINUTES=7*1440;
  const BANK_LOAN_INTEREST_RATE=.12; // Coût forfaitaire connu AVANT signature.
  const BANK_LOAN_LATE_RATE=.10; // Une seule majoration à l'échéance.
  const BANK_LOAN_OFFERS=Object.freeze([
    {amount:500,minRank:'E',label:'Coup de pouce'},
    {amount:2000,minRank:'C',label:'Prêt de développement'},
    {amount:5000,minRank:'A',label:'Prêt de prestige'}
  ]);
  const RECOVERY_NOTICE_DAYS=[2,7,14,21]; // Avertissement, mise en demeure, saisie annoncée, exécution.
  const SIDE_JOBS = Object.freeze([
    {id:'livraison',name:'Livraison en ville',description:'Livrer des colis pour les commerçants.',durationMs:9000,gold:15,icon:'✉'},
    {id:'cueillette',name:'Récolte de plantes',description:'Récolter des plantes utiles aux artisans.',durationMs:12000,gold:24,icon:'❀'},
    {id:'marchand',name:'Aide au marchand',description:'Préparer et livrer une commande pour une échoppe.',durationMs:15000,gold:33,icon:'⚒'}
  ]);
  const JOB_BY_ID=Object.fromEntries(SIDE_JOBS.map(job=>[job.id,job]));
  // V9 — Investissements supplémentaires, distincts de la résidence principale.
  // Les loyers sont des revenus NETS : entretien, fiscalité et vacance provisionnés.
  // Sans lien avec les recrutements, raids ou finances des guildes PNJ.
  const INVESTMENT_CYCLE_MINUTES=2*1440;
  const INVESTMENT_RESALE_RATE=.75;
  const MAX_INVESTMENTS=12;
  const MAX_INVESTMENTS_PER_TYPE=3;
  const INVESTMENTS=Object.freeze([
    {id:'chambre',name:'Chambre en location',kind:'Immobilier',symbol:'⌂',price:650,income:90,description:'Une chambre simple louée à un habitant de la ville.'},
    {id:'studio_locatif',name:'Studio locatif',kind:'Immobilier',symbol:'▣',price:1700,income:240,description:'Un petit studio indépendant destiné à la location.'},
    {id:'atelier',name:'Atelier artisanal',kind:'Commerce',symbol:'⚒',price:4100,income:600,description:'Un atelier loué à un artisan local, à loyer fixe.'},
    {id:'immeuble',name:'Petit immeuble de rapport',kind:'Immobilier',symbol:'▥',price:11500,income:1700,description:'Quelques appartements locatifs réunis dans un même immeuble.'}
  ]);
  const INVESTMENT_BY_ID=Object.fromEntries(INVESTMENTS.map(item=>[item.id,item]));
  // V12 — progression payante Guild Master, avec plafonds de trois aventuriers.
  const GUILD_CAP=[0,3,9,15,21];
  const GUILD_TEAM_SLOTS=[0,1,3,5,7];
  const GUILD_ARENA_SLOTS=[0,1,2,2,3];
  const GUILD_UPGRADE_COST=[0,1200,4200,11000];
  const GUILD_UPGRADE_REP=[0,18,90,260];
  const GUILD_ASSOCIATION_CHARGE=[0,0,600,1100,1800];
  const GUILD_BANK_CREDIT=[0,1000,3000,7500,15000];
  const GUILD_RISK={prudente:.90,'équilibrée':.80,audacieuse:.68,recruteuse:.80};
  const GUILD_RESERVE_MULT={prudente:1.28,'équilibrée':1,audacieuse:.72,recruteuse:.92};
  const GUILD_ARENA_CHANCE={prudente:.14,'équilibrée':.24,audacieuse:.36,recruteuse:.20};
  const GUILD_IMPROVEMENTS=Object.freeze({
    recruitment:[{cost:600,bonus:.20},{cost:1600,bonus:.35},{cost:3600,bonus:.5}],
    recovery:[{cost:800,bonus:.20},{cost:2000,bonus:.35},{cost:4200,bonus:.5}],
    expedition:[{cost:1000,bonus:.10},{cost:2600,bonus:.20},{cost:5500,bonus:.30}],
    negotiation:[{cost:900,bonus:.10},{cost:2400,bonus:.20},{cost:5000,bonus:.30}]
  });
  const GUILD_TICK_MINUTES = 55;
  const GUILD_RAID_DATA = Object.freeze({
    E:{need:20,durationMs:8000,gold:[LOOT_BY_RANK.E,LOOT_BY_RANK.E],rep:[1,3],cost:guildLaunchCost('E')},
    D:{need:34,durationMs:11000,gold:[LOOT_BY_RANK.D,LOOT_BY_RANK.D],rep:[2,5],cost:guildLaunchCost('D')},
    C:{need:58,durationMs:15000,gold:[LOOT_BY_RANK.C,LOOT_BY_RANK.C],rep:[4,7],cost:guildLaunchCost('C')},
    B:{need:95,durationMs:22000,gold:[LOOT_BY_RANK.B,LOOT_BY_RANK.B],rep:[6,10],cost:guildLaunchCost('B')},
    A:{need:150,durationMs:30000,gold:[LOOT_BY_RANK.A,LOOT_BY_RANK.A],rep:[10,15],cost:guildLaunchCost('A')},
    S:{need:240,durationMs:38000,gold:[LOOT_BY_RANK.S,LOOT_BY_RANK.S],rep:[15,25],cost:guildLaunchCost('S')}
  });
  const GUILD_DESIGNS=[
    ['Loups d’Argent','Mia Aubeval','équilibrée',45,1300,'✦'],
    ['Lame Écarlate','Kael Sombrelame','audacieuse',30,1200,'⚔'],
    ['Veilleurs de l’Aube','Yuna Valbrume','prudente',65,1850,'☼'],
    ['Compagnie des Cendres','Orin Cendreval','recruteuse',15,900,'♜'],
    ['Cercle d’Opale','Lina Opaline','équilibrée',95,2300,'◇'],
    ['Éperviers Nocturnes','Soren Noctel','audacieuse',35,1250,'◆'],
    ['Sentinelles du Nord','Nora Hauterive','prudente',55,1700,'⛨'],
    ['Lys de Fer','Selma Aubépine','recruteuse',25,1100,'✿'],
    ['Ordre de l’Éclipse','Frey Astréa','équilibrée',120,2800,'☾']
  ];
  // V11 — Deux expériences distinctes : libre sans date limite, saison de 365 jours.
  // Le temps garde exactement son rythme de V10 : 5 minutes du monde par seconde réelle.
  const SEASON_LENGTH_MINUTES = 365*1440;
  const START_WORLD_MINUTES = 8*60;
  const GAME_MINUTES_PER_REAL_SECOND = 5;
  const $ = id => document.getElementById(id);
  const randomInt = (a,b) => Math.floor(Math.random()*(b-a+1))+a;
  const clamp = (v,min,max) => Math.max(min,Math.min(max,v));
  const escapeHtml = str => String(str).replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
  const sound=type=>window.ChroniclesAudio?.play(type);
  let game = null;
  let activeSlot = null;
  let page = 'dashboard';
  let selectedDungeon = 'E';
  let shopFilter = 'available';
  let shopSetFilter = 'all';
  let shopMode='buy';
  let financeMode='investments';
  let rankingFilter='all';
  let rankingMetric='power';
  let rankingView='adventurers';
  let compactRankingElapsed=0;
  let selectedGuildId='guild_1';
  let guildView='all';
  // V15.6 — choix d'affichage local, sans impact sur la partie sauvegardée.
  let guildActivityFilter='all';
  let guildRenderCountdown=0;
  let associationRenderCountdown=0;
  let lastFrame = performance.now();
  const SIM_SPEEDS=Object.freeze([1,2,5,10,20]); // Multiplicateur global, jamais de modification des règles de jeu.
  // La pause est enregistrée dans la partie et contrôlée avant toute simulation.
  let timeSinceSave = 0;
  let timeSinceClockRender = 0;
  let toastHandle = null;

  function itemPower(p){return Object.values(p.equipment||{}).reduce((acc,id)=>acc+(ITEM_BY_ID[id]?.bonus||0),0);}
  function recalcPower(p){p.power=Math.max(1,Math.round(p.basePower||1)+itemPower(p));}
  function getRankIndex(r){return RANKS.indexOf(r);}
  function randomNpcName(i){return NPC_DISPLAY_NAMES[i]||`Aventurier ${i+1}`;}
  // Portraits cosmétiques : exactement 25 PNJ féminins et 25 masculins.
  // Les prénoms ambigus Lys et Frey (PNJ ordinaire) sont masculins ; Frey, cheffe, est féminine.
  // Aucun effet sur les classes, rangs, équipes, finances ou la simulation.
  const FEMALE_NPC_NAMES=new Set([...NPC_FIRST_FEMALE,...LEGACY_FEMALE_FIRST]);
  const CHIEF_PORTRAITS=Object.freeze({
    'chief_guild_1':['Femme',24], // Mia : louve claire, autorité tranquille
    'chief_guild_2':['Homme',3],  // Kael : loup sombre, agressif
    'chief_guild_3':['Femme',16], // Yuna : gardienne froide et protectrice
    'chief_guild_4':['Homme',21], // Orin : discret, sombre
    'chief_guild_5':['Femme',14], // Lina : mage violette
    'chief_guild_6':['Homme',23], // Soren : assassin, yeux rouges
    'chief_guild_7':['Femme',12], // Nora : gardienne bleue
    'chief_guild_8':['Femme',5],  // Selma : soigneuse aux tons verts
    'chief_guild_9':['Femme',22]  // Frey : mage mauve
  });
  function npcPortraitGender(n){
    if(CHIEF_PORTRAITS[n.id])return CHIEF_PORTRAITS[n.id][0];
    if(n.gender==='Femme'||n.gender==='Homme')return n.gender;
    const match=/^npc_(\d+)$/.exec(String(n.id||''));
    if(match&&Number(match[1])>=1&&Number(match[1])<=41)
      return LEGACY_FEMALE_FIRST.has(LEGACY_NPC_FIRST[(Number(match[1])-1)%LEGACY_NPC_FIRST.length])?'Femme':'Homme';
    return FEMALE_NPC_NAMES.has(String(n.name||'').split(' ')[0])?'Femme':'Homme';
  }
  function assignNpcPortraits(population){
    const reserved={Femme:new Set(),Homme:new Set()};
    for(const [gender,number] of Object.values(CHIEF_PORTRAITS))reserved[gender].add(number);
    const ordinary=[...population].filter(n=>!CHIEF_PORTRAITS[n.id]).sort((a,b)=>Number(a.id.split('_')[1])-Number(b.id.split('_')[1]));
    const available={};
    for(const gender of ['Femme','Homme'])available[gender]=Array.from({length:25},(_,i)=>i+1).filter(n=>!reserved[gender].has(n));
    const indices={Femme:0,Homme:0};
    for(const npc of population){
      const chief=CHIEF_PORTRAITS[npc.id];
      if(chief){npc.gender=chief[0];npc.portraitNumber=chief[1];}
    }
    for(const npc of ordinary){
      const gender=npcPortraitGender(npc);
      npc.gender=gender;
      if(!Number.isInteger(npc.portraitNumber)||npc.portraitNumber<1||npc.portraitNumber>25){
        const choices=available[gender];
        npc.portraitNumber=choices[indices[gender]%choices.length];
      }
      indices[gender]++;
    }
  }
  function portraitPath(person){
    const gender=person?.id==='player'||person?.isPlayer?person.gender:npcPortraitGender(person||{});
    const raw=Number(person?.portraitNumber);
    const num=Number.isInteger(raw)&&raw>=1&&raw<=25?raw:1;
    return `assets/portraits/${gender==='Femme'?'female':'male'}_${String(num).padStart(2,'0')}.webp`;
  }
  function portraitImg(person,extra=''){
    return `<img class="adventurer-portrait ${extra}" src="${portraitPath(person)}" alt="" loading="lazy" decoding="async"/>`;
  }
  function setPlayerPortrait(number){
    if(!game)return;
    game.player.portraitNumber=((number-1+25)%25)+1;
    renderStats();renderRanking();if(page==='guilds')renderGuilds();if(page==='association')renderTeamPreview();
    saveGame();
  }

  function emptyEquipment(){return {Arme:null,Armure:null,Accessoire:null};}
  function createPopulation(){
    const ranks=Object.entries(NPC_RANK_DISTRIBUTION).flatMap(([rank,n])=>Array(n).fill(rank));
    return ranks.map((rank,i)=>{
      const cls=Object.keys(CLASSES)[randomInt(0,4)];
      const base=Math.round((CLASSES[cls].base+randomInt(-3,4))*RANK_MULT[rank]);
      return {id:`npc_${i+1}`,name:randomNpcName(i),class:cls,role:CLASSES[cls].role,rank,
        basePower:base,power:base,inventory:[],equipment:emptyEquipment(),equipmentPurchases:0,
        nextGearDecisionAt:START_WORLD_MINUTES+randomInt(35,NPC_STEP_MINUTES),
        gold:0,rep:0,xp:0,totalRaids:0,injuryRemainingMs:0,totalInjuries:0};
    });
  }
  // Retour d'expérience de l'ancien simulateur : un PNJ ne gagne jamais de puissance
  // via un bonus abstrait et gratuit. Il achète les mêmes objets que le joueur.
  // La migration des anciennes parties transforme les bonus historiques en vrais
  // objets possédés (sans modifier rétroactivement leur trésorerie).
  function legacyEquipmentFor(npc,legacyBonus){
    const budget=Math.max(0,Math.floor(legacyBonus));
    const options=SLOTS.map(slot=>[null,...SHOP_ITEMS.filter(item=>item.slot===slot&&getRankIndex(item.rank)<=getRankIndex(npc.rank))]);
    let best=[],bestTotal=-1;
    for(const weapon of options[0])for(const armor of options[1])for(const accessory of options[2]){
      const selection=[weapon,armor,accessory].filter(Boolean),total=selection.reduce((sum,item)=>sum+item.bonus,0);
      if(total<=budget&&total>bestTotal){best=selection;bestTotal=total;}
    }
    return best.map(item=>item.id);
  }
  function normalizeNpcEquipment(npc,worldMinutes){
    if(!Number.isFinite(npc.basePower))npc.basePower=Math.max(1,Number(npc.power||1)-Number(npc.gearBonus||0));
    if(!RANKS.includes(npc.rank))npc.rank='E';
    if(!Array.isArray(npc.inventory)){
      // V13.3.1 : la puissance passée représentait des améliorations fictives.
      // On les convertit en équipement de la boutique de rang approprié,
      // sans créer d'or ni déduire à nouveau un montant déjà dépensé implicitement.
      const previousBonus=Number.isFinite(npc.gearBonus)?npc.gearBonus:Math.max(0,(npc.power||0)-npc.basePower);
      npc.inventory=legacyEquipmentFor(npc,previousBonus);
      npc.equipment=emptyEquipment();
      for(const id of npc.inventory)npc.equipment[ITEM_BY_ID[id].slot]=id;
    }
    npc.inventory=npc.inventory.filter((id,i,arr)=>ITEM_BY_ID[id]&&arr.indexOf(id)===i&&getRankIndex(ITEM_BY_ID[id].rank)<=getRankIndex(npc.rank));
    if(!npc.equipment||typeof npc.equipment!=='object')npc.equipment=emptyEquipment();
    for(const slot of SLOTS){
      const id=npc.equipment[slot];
      if(!npc.inventory.includes(id)||ITEM_BY_ID[id]?.slot!==slot)npc.equipment[slot]=null;
    }
    delete npc.gearBonus;
    delete npc.gearUpgrades;
    if(!Number.isFinite(npc.equipmentPurchases))npc.equipmentPurchases=0;
    if(!Number.isFinite(npc.nextGearDecisionAt))npc.nextGearDecisionAt=worldMinutes+randomInt(35,NPC_STEP_MINUTES);
    npc.power=npc.basePower+itemPower(npc);
  }
  function npcEquippedItems(npc){return SLOTS.map(slot=>ITEM_BY_ID[npc.equipment?.[slot]]).filter(Boolean);}
  function npcGearSummary(npc){
    if(npc.isPlayer||npc.id==='player')return '';
    const items=npcEquippedItems(npc);
    return `${items.length}/3 équipés · +${itemPower(npc)} puissance`;
  }
  function npcGearDescription(npc){
    return SLOTS.map(slot=>{const item=ITEM_BY_ID[npc.equipment?.[slot]];return `${slot} : ${item?item.name+' ('+gearEffectText(item)+')':'Aucun'}`;}).join(' • ');
  }
  // Aucun attribut de combat supplémentaire : ces habitudes décrivent seulement
  // la façon dont les aventuriers perçoivent les noms, les modes et les achats.
  // Le style est stable par ID, même après une migration ou un changement de guilde.
  const NPC_GEAR_STYLES=Object.freeze({
    tradition:{name:'Traditionnel',description:'Suit la panoplie conseillée pour sa classe.'},
    tendance:{name:'Suiveur de tendances',description:'Imite l’équipement des aventuriers les plus admirés.'},
    roleplay:{name:'Rôliste',description:'Privilégie une identité de combattant personnelle.'},
    impulsif:{name:'Expérimentateur',description:'Essaie des combinaisons qui lui plaisent.'},
    econome:{name:'Économe',description:'Privilégie le coût des améliorations.'},
    optimiseur:{name:'Optimisateur',description:'Compare les véritables bonus de puissance.'}
  });
  function stableGearHash(text){
    let hash=2166136261;
    for(const c of String(text)){hash=Math.imul(hash^c.charCodeAt(0),16777619);}
    return hash>>>0;
  }
  function npcGearStyle(npc){
    if(npc.isChief){
      const guild=game?.guilds?.find(g=>g.id===String(npc.id).replace(/^chief_/,''));
      if(guild?.style==='prudente')return 'tradition';
      if(guild?.style==='audacieuse')return 'optimiseur';
    }
    const value=stableGearHash(npc.id+'-equipement')%100;
    return value<32?'tradition':value<49?'tendance':value<65?'roleplay':value<80?'impulsif':value<91?'econome':'optimiseur';
  }
  function npcTraditionalSet(npc){
    return npc.class==='Gardien'?'templier':
      npc.class==='Soigneur'?'guerisseur':npc.class==='Mage'?'arcaniste':'duelliste';
  }
  function npcTrendLeader(npc){
    if(!game)return null;
    // Les modes sont influencées par les vrais personnages du monde, joueur inclus.
    const people=[...game.population, {...game.player,id:'player'}]
      .filter(other=>other.id!==npc.id&&other.equipment&&SLOTS.some(slot=>ITEM_BY_ID[other.equipment[slot]]));
    people.sort((a,b)=>b.power-a.power||String(a.id).localeCompare(String(b.id)));
    return people[0]||null;
  }
  function npcPreferredSet(npc,slot,style,trendLeader){
    if(style==='tradition')return npcTraditionalSet(npc);
    if(style==='tendance'){
      const copied=ITEM_BY_ID[trendLeader?.equipment?.[slot]];
      return copied?.set||npcTraditionalSet(npc);
    }
    if(style==='roleplay'){
      // Le mage à l'épée et le tank mystique existent, même si cela n'optimise rien.
      const unusual={Gardien:'duelliste',Guerrier:'arcaniste',Assassin:'templier',Mage:'duelliste',Soigneur:'templier'};
      return unusual[npc.class]||'duelliste';
    }
    if(style==='impulsif'){
      const names=Object.keys(SETS);
      return names[stableGearHash(npc.id+'-'+slot+'-'+npc.rank)%names.length];
    }
    return npcTraditionalSet(npc);
  }
  function npcChooseEquipment(npc){
    if(!npc||npc.gold<25)return null;
    const rankIndex=getRankIndex(npc.rank);
    const reserve=Math.min(250,Math.floor(npc.gold*.10));
    const style=npcGearStyle(npc);
    const trendLeader=style==='tendance'?npcTrendLeader(npc):null;
    const candidates=[];
    for(const slot of SLOTS){
      const old=ITEM_BY_ID[npc.equipment?.[slot]];
      const oldRank=old?getRankIndex(old.rank):-1;
      const oldBonus=old?.bonus||0;
      const resale=old?Math.floor(old.price/2):0;
      const preferred=npcPreferredSet(npc,slot,style,trendLeader);
      const options=SHOP_ITEMS.filter(item=>{
        if(item.slot!==slot||getRankIndex(item.rank)>rankIndex||npc.inventory.includes(item.id))return false;
        if(npc.gold+resale-item.price<reserve)return false;
        const tier=getRankIndex(item.rank);
        // Les profils traditionnels achètent par rang et par thème, non par chiffres.
        // Ils ne gaspillent pas leur argent en remplaçant un objet du même rang.
        if(style!=='optimiseur'&&style!=='econome'&&tier<=oldRank)return false;
        if((style==='optimiseur'||style==='econome')&&item.bonus<=oldBonus)return false;
        if(style==='tradition'||style==='tendance'||style==='roleplay'||style==='impulsif')return item.set===preferred;
        return true;
      });
      if(!options.length)continue;
      const maxTier=Math.max(...options.map(item=>getRankIndex(item.rank)));
      for(const item of options){
        const tier=getRankIndex(item.rank);
        const gain=item.bonus-oldBonus;
        let score;
        if(style==='optimiseur'){
          // Connaît les vrais chiffres : vise le meilleur gain, puis le coût.
          score=gain*10+item.bonus/10-(item.price-resale)*.002;
        }else if(style==='econome'){
          // Cherche une amélioration à petit prix, même si elle est moins puissante.
          score=gain*3/Math.max(1,item.price-resale)*100+item.bonus*.02;
        }else{
          // Raisonne par rang et par nom. La puissance n'entre PAS dans le choix.
          score=tier*100+10-(item.price-resale)*.001;
        }
        // Évite de racheter plusieurs fois des objets intermédiaires si le rang
        // maximal accessible est déjà finançable (sans forcer un achat trop cher).
        if(tier<maxTier)score-=(maxTier-tier)*((style==='econome')?4:120);
        // Préférence légère pour combler un emplacement vide.
        if(!old)score+=style==='optimiseur'?12:style==='econome'?3:8;
        candidates.push({item,old,score});
      }
    }
    return candidates.sort((a,b)=>b.score-a.score||b.item.bonus-a.item.bonus||a.item.price-b.item.price)[0]||null;
  }
  function npcBuyEquipment(npc){
    const choice=npcChooseEquipment(npc);
    if(!choice)return false;
    const {item,old}=choice;
    const resale=old?Math.floor(old.price/2):0;
    if(getRankIndex(npc.rank)<getRankIndex(item.rank)||npc.inventory.includes(item.id)||npc.gold+resale<item.price)return false;
    // L'ancien équipement est réellement revendu au marchand à la même moitié
    // du prix appliquée au joueur. Aucun or n'apparaît gratuitement.
    if(old){npc.inventory=npc.inventory.filter(id=>id!==old.id);npc.gold+=resale;}
    npc.gold-=item.price;
    npc.inventory.push(item.id);
    npc.equipment[item.slot]=item.id;
    npc.equipmentPurchases++;
    recalcPower(npc);
    // Ne pas recalculer les probabilités d'expéditions déjà parties :
    // chaque raid conserve la chance fixée au départ.
    if(Math.random()<.30){
      logEvent('Marché des aventuriers',`${npc.name} achète ${item.name} pour ${money(item.price)}${old?` et revend ${old.name} pour ${money(resale)}`:''}. Puissance : ${npc.power}.`,'npc');
    }
    return true;
  }
  function npcEquipmentTick(){
    let changed=false;
    for(const npc of game.population){
      if(game.worldMinutes<npc.nextGearDecisionAt)continue;
      npc.nextGearDecisionAt=game.worldMinutes+randomInt(100,250);
      if(npc.injuryRemainingMs>0||anyRaidUsesNpc(npc.id))continue;
      if(npcBuyEquipment(npc))changed=true;
    }
    if(changed&&page==='ranking')renderRanking();
  }
  function progressRank(p,announce=true){
    let changed=false;
    while(p.rank!=='S' && p.xp>=XP_NEED[p.rank]){
      p.xp-=XP_NEED[p.rank];const old=p.rank;const rank=RANKS[RANKS.indexOf(old)+1];
      p.basePower=Math.round(p.basePower*RANK_MULT[rank]/RANK_MULT[old]);p.rank=rank;
      recalcPower(p);changed=true;
      if(announce&&game){sound('rank');logEvent('Promotion de rang !',`Vous avez atteint le rang ${rank} ! Votre puissance naturelle est désormais de ${p.basePower}.`,'rank');notify(`Promotion ! Vous passez rang ${rank} ✦`);}
    }
    if(changed && announce && game?.player===p && p.guildId){
      const guild=playerGuild();if(guild)reorganizeGuild(guild,'promotion');
    }
    return changed;
  }
  function allAdventurers(){
    if(!game)return[];
    return [...(game.population||[]).map(n=>({...n,isPlayer:false})),{...game.player,isPlayer:true}].sort((a,b)=>b.power-a.power||getRankIndex(b.rank)-getRankIndex(a.rank)||a.name.localeCompare(b.name,'fr'));
  }
  function placement(){return allAdventurers().findIndex(p=>p.isPlayer)+1;}
  function ownedItem(id){return game?.player.inventory.includes(id);}
  function buyItem(id){
    const item=ITEM_BY_ID[id],p=game?.player;if(!item||!p)return;
    if(getRankIndex(p.rank)<getRankIndex(item.rank)){notify(`Le rang ${item.rank} est requis pour cet objet.`);return;}
    if(ownedItem(id)){notify('Vous possédez déjà cet objet.');return;}
    if(p.gold<item.price){notify('Votre bourse ne contient pas assez d’or.');return;}
    p.gold-=item.price;p.inventory.push(id);sound('purchase');logEvent('Achat d’équipement',`Vous avez acheté ${item.name} pour ${item.price} pièces d’or.`,'shop');saveGame();renderAll();notify(`${item.name} acheté !`);
  }
  function equipItem(id){
    const p=game?.player,item=ITEM_BY_ID[id];if(!item||!p||!ownedItem(id))return;
    if(p.equipment[item.slot]===id){p.equipment[item.slot]=null;notify('Objet retiré.');}
    else {p.equipment[item.slot]=id;notify(`${item.name} équipé !`);}
    sound('equip');
    recalcPower(p);
    // A raid already in progress keeps its snapshot chance; future raids use the new power.
    if(!game.raid)game.associationPreviews={};
    logEvent('Équipement modifié',`Vous avez modifié votre équipement : ${item.name}. Votre puissance totale est maintenant de ${p.power}.`,'shop');saveGame();renderAll();
  }
  function sellItem(id){
    const p=game?.player,item=ITEM_BY_ID[id];if(!item||!p||!ownedItem(id))return;
    const val=Math.floor(item.price/2);if(!confirm(`Revendre ${item.name} pour ${val} or ?`))return;
    if(p.equipment[item.slot]===id)p.equipment[item.slot]=null;
    p.inventory=p.inventory.filter(x=>x!==id);p.gold+=val;sound('sell');recalcPower(p);if(!game.raid)game.associationPreviews={};
    logEvent('Vente d’équipement',`Vous avez vendu ${item.name} pour ${val} pièces d’or.`,'shop');saveGame();renderAll();notify(`+${val} or récupérés.`);
  }
  function setShopMode(mode){
    shopMode=mode==='sell'?'sell':'buy';renderShop();
  }
  function setFinanceMode(mode){
    financeMode=['housing','investments','jobs'].includes(mode)?mode:'investments';
    for(const el of document.querySelectorAll('[data-finance-panel]'))el.hidden=el.dataset.financePanel!==financeMode;
    for(const el of document.querySelectorAll('[data-finance-mode]')){
      const selected=el.dataset.financeMode===financeMode;el.classList.toggle('active',selected);el.setAttribute('aria-selected',String(selected));
    }
  }
  function renderShop(){
    if(!game)return;const p=game.player;
    $('shopGold').textContent=`${p.gold.toLocaleString('fr-FR')} OR`;
    $('merchantBalance').textContent=`${p.gold.toLocaleString('fr-FR')} or disponibles`;
    $('merchantCatalogPanel').hidden=shopMode!=='buy';
    $('merchantSellPanel').hidden=shopMode!=='sell';
    for(const b of document.querySelectorAll('[data-shop-mode]')){b.classList.toggle('active',b.dataset.shopMode===shopMode);b.setAttribute('aria-selected',String(b.dataset.shopMode===shopMode));}
    $('basePowerStat').textContent=p.basePower;$('gearPowerStat').textContent=`+${itemPower(p)}`;$('totalPowerStat').textContent=p.power;
    $('equipSlots').innerHTML=SLOTS.map((slot,i)=>{
      const item=ITEM_BY_ID[p.equipment[slot]];
      return `<div class="equip-slot"><span class="equip-symbol">${['⚔','⛨','✧'][i]}</span><span><small>${slot.toLocaleUpperCase('fr')}</small><strong>${item?escapeHtml(item.name):'Emplacement vide'}</strong><em>${item?gearEffectText(item):'Choisissez un objet dans votre sac'}</em></span>${item?`<button class="small-action" data-gear="unequip" data-id="${item.id}">Retirer</button>`:''}</div>`;
    }).join('');
    $('inventoryCount').textContent=`${p.inventory.length} OBJET${p.inventory.length===1?'':'S'}`;
    $('inventoryList').innerHTML=p.inventory.length?p.inventory.map(id=>{
      const item=ITEM_BY_ID[id];if(!item)return'';
      const active=p.equipment[item.slot]===id;
      return `<div class="inventory-item"><div><strong>${escapeHtml(item.name)}</strong><small>Rang ${item.rank} · ${item.slot} · ${gearEffectText(item)} ${active?'· Équipé':''}</small></div><div class="inventory-actions"><button class="small-action ${active?'active':''}" data-gear="equip" data-id="${id}">${active?'Retirer':'Équiper'}</button></div></div>`;
    }).join(''):'<div class="shop-empty">Votre sac est vide. Achetez votre premier équipement au marchand.</div>';
    $('shopSellList').innerHTML=p.inventory.length?p.inventory.map(id=>{
      const item=ITEM_BY_ID[id];if(!item)return '';
      return `<div class="merchant-sell-row"><div><strong>${escapeHtml(item.name)}</strong><small>${item.slot} · Rang ${item.rank} · ${gearEffectText(item)}${p.equipment[item.slot]===id?' · Équipé':''}</small></div><div><strong>${Math.floor(item.price/2).toLocaleString('fr-FR')} or</strong><button type="button" class="small-action secondary" data-gear="sell" data-id="${id}">Vendre</button></div></div>`;
    }).join(''):'<p class="shop-empty">Aucun objet à vendre. Consultez Acheter pour découvrir le catalogue.</p>';
    // V14.3 : présenter les quatre panoplies ensemble pour chaque rang (E → S).
    // Trier uniquement la vue du marchand : conserver SHOP_ITEMS, les identifiants et
    // l'ordre utilisé par les PNJ strictement identiques à la version précédente.
    const visible=SHOP_ITEMS.filter(i=>(shopFilter==='all'||(shopFilter==='available'?getRankIndex(i.rank)<=getRankIndex(p.rank):i.rank===shopFilter))&&(shopSetFilter==='all'||i.set===shopSetFilter))
      .sort((a,b)=>getRankIndex(a.rank)-getRankIndex(b.rank));
    $('shopCatalog').innerHTML=visible.map(item=>{
      const locked=getRankIndex(p.rank)<getRankIndex(item.rank),owned=ownedItem(item.id),afford=p.gold>=item.price;
      return `<article class="shop-item ${locked?'locked':''}"><div class="shop-item-head"><span class="rank-token rank-${item.rank}">${item.rank}</span><span class="shop-category">${item.slot}</span></div><strong>${escapeHtml(item.name)}</strong><small class="shop-set-label set-${item.set}">${escapeHtml(SETS[item.set])}</small><p>${gearEffectText(item)}</p><div class="shop-price"><b>◈ ${item.price.toLocaleString('fr-FR')} or</b><button data-gear="buy" data-id="${item.id}" ${locked||owned||!afford?'disabled':''}>${owned?'Possédé':locked?`Rang ${item.rank} requis`:!afford?'Or insuffisant':'Acheter'}</button></div></article>`;
    }).join('');
  }
  function valueForAmbition(person,metric){
    if(metric==='gold' && game && (person===game.player||person.isPlayer)){
      const owned=game.investments?.owned||[];
      const value=homeResaleValue(game.player.home)+owned.reduce((total,asset)=>total+investmentResaleValue(asset.typeId),0);
      return Math.max(0,Math.round((Number(game.player.gold)||0)+value+(game.bank?.balance||0)-totalOutstandingDebt(game)));
    }
    return Math.max(0,Number(person[metric])||0);
  }
  function rankedAdventurers(metric='power'){
    return allAdventurers().sort((a,b)=>valueForAmbition(b,metric)-valueForAmbition(a,metric)||b.power-a.power||a.name.localeCompare(b.name,'fr'));
  }
  function ambitionPlacement(metric){
    const score=valueForAmbition(game.player,metric);
    return 1+game.population.filter(n=>valueForAmbition(n,metric)>score).length;
  }
  function setAmbition(metric){
    if(!game||!AMBITIONS[metric]||game.gameOver||game.season?.finished)return;
    if(game.mode==='season'){notify('Objectif de saison fixé lors de la création de la partie.');return;}
    game.player.ambition=metric;
    logEvent('Nouvelle ambition',`Votre objectif personnel : ${AMBITIONS[metric].label.toLowerCase()}.`,'info');
    saveGame();renderAll();notify(`Objectif choisi : ${AMBITIONS[metric].label}.`);
  }
  function seasonDeadline(g=game){return g.season?.endsAt??(START_WORLD_MINUTES+SEASON_LENGTH_MINUTES);}
  function renderSeasonProgress(){
    if(!game)return;
    const isSeason=game.mode==='season';
    const block=$('seasonTracker');block.hidden=false;
    $('seasonModeName').textContent=isSeason?'SAISON D’UN AN':'PARTIE LIBRE';
    if(!isSeason){
      $('seasonProgressDescription').textContent='Aucune limite de temps. Votre monde et vos ambitions évoluent librement.';
      $('seasonProgressValue').textContent='Sans limite';
      $('seasonProgressBar').style.width='0%';
      $('seasonProgressMeta').textContent='Vous pouvez changer d’ambition à tout moment.';
    }else{
      const elapsed=clamp(game.worldMinutes-(game.season?.startedAt??START_WORLD_MINUTES),0,SEASON_LENGTH_MINUTES);
      const remaining=Math.max(0,Math.ceil((seasonDeadline()-game.worldMinutes)/1440));
      const progress=Math.min(100,elapsed/SEASON_LENGTH_MINUTES*100);
      $('seasonProgressDescription').textContent=`Objectif fixé : ${AMBITIONS[game.player.ambition].label}. Le monde s’arrête au terme des 365 jours.`;
      $('seasonProgressValue').textContent=game.season?.finished?'Terminée':`${remaining} j restants`;
      $('seasonProgressBar').style.width=`${progress}%`;
      $('seasonProgressMeta').textContent=`Jour ${Math.min(365,Math.floor(elapsed/1440)+1)} / 365 · ${progress.toFixed(1).replace('.',',')} % de la saison`;
    }
    $('seasonProgressBar').parentElement.setAttribute('aria-valuenow',String(Math.round(isSeason?clamp((game.worldMinutes-(game.season?.startedAt??START_WORLD_MINUTES))/SEASON_LENGTH_MINUTES*100,0,100):0)));
  }
  function finishSeason(){
    if(!game||game.mode!=='season'||game.season?.finished||game.gameOver)return;
    const metric=game.player.ambition;
    const ranked=rankedAdventurers(metric);
    const value=valueForAmbition(game.player,metric);
    // Classement sportif : égalités au même rang plutôt que départage caché.
    const place=1+game.population.filter(n=>valueForAmbition(n,metric)>value).length;
    const tied=ranked.filter(p=>valueForAmbition(p,metric)===value).length;
    const top=ranked.slice(0,3).map(p=>({name:p.name,rank:p.rank,value:valueForAmbition(p,metric),isPlayer:!!p.isPlayer,place:1+ranked.filter(q=>valueForAmbition(q,metric)>valueForAmbition(p,metric)).length}));
    game.worldMinutes=seasonDeadline();
    game.season.finished=true;
    game.season.result={metric,place,total:ranked.length,value,top,tied,won:place===1&&tied===1,endedAt:game.worldMinutes,
      raids:game.player.totalRaids,wins:game.player.successRaids,rep:game.player.rep,gold:game.player.gold,rank:game.player.rank};
    logEvent('Fin de saison',`Bilan des 365 jours : ${place}e sur ${ranked.length} aventuriers en ${AMBITIONS[metric].label.toLowerCase()}.`,'success');
    saveGame();renderAll();renderSeasonEnd();
  }
  function renderSeasonEnd(){
    const overlay=$('seasonEndOverlay');
    if(!game||game.mode!=='season'||!game.season?.finished||!game.season?.result){overlay.hidden=true;return;}
    const r=game.season.result;
    overlay.hidden=false;
    $('seasonEndHeadline').textContent=r.won?'Vous avez remporté votre saison !':r.place===1?'Première place ex æquo !':'Votre année d’aventure est terminée';
    $('seasonEndObjective').textContent=`Ambition : ${AMBITIONS[r.metric]?.label||'Puissance'}`;
    $('seasonEndPlace').textContent=`#${r.place} / ${r.total}`;
    $('seasonEndScore').textContent=`${r.value.toLocaleString('fr-FR')} ${AMBITIONS[r.metric]?.unit||'points'}`+(r.tied>1?` · ${r.tied} aventuriers ex æquo`:'');
    $('seasonEndCareer').textContent=`Rang ${r.rank} · ${r.raids} expéditions · ${r.wins} victoires · ${r.rep} réputation`;
    $('seasonPodium').innerHTML=(r.top||[]).map((p,i)=>`<div class="season-podium-entry${p.isPlayer?' is-player':''}"><span>${p.place||i+1}.</span><strong>${escapeHtml(p.name)}${p.isPlayer?' (vous)':''}</strong><span>${p.value.toLocaleString('fr-FR')} ${escapeHtml(AMBITIONS[r.metric]?.unit||'points')}</span></div>`).join('');
  }
  function renderAmbition(){
    if(!game)return;
    const metric=game.player.ambition;
    const arr=rankedAdventurers(metric),first=arr[0],best=valueForAmbition(first,metric),mine=valueForAmbition(game.player,metric);
    const place=ambitionPlacement(metric);
    $('ambitionTitle').textContent=AMBITIONS[metric].label;
    $('ambitionDescription').textContent=AMBITIONS[metric].description;
    $('ambitionPosition').textContent=`#${place} sur ${arr.length}`;
    $('ambitionCurrent').textContent=`Votre valeur : ${mine.toLocaleString('fr-FR')} ${AMBITIONS[metric].unit} · Premier : ${best.toLocaleString('fr-FR')}`+(best===mine?' · Première place ex æquo ou en tête':'');
    const progress=best>0?Math.min(100,mine/best*100):0;
    $('ambitionProgress').style.width=`${progress}%`;
    $('ambitionProgress').parentElement.setAttribute('aria-valuenow',String(Math.round(progress)));
    for(const btn of document.querySelectorAll('[data-ambition]')){
      const active=btn.dataset.ambition===metric;
      btn.classList.toggle('selected',active);btn.setAttribute('aria-pressed',String(active));
      btn.disabled=game.mode==='season';
      btn.title=game.mode==='season'?'Objectif fixé pour cette saison':'Changer votre ambition personnelle';
    }
    renderSeasonProgress();
  }
  // V13.9 — Les profils sont des vues des données existantes, sans copies de PNJ.
  let npcProfileId=null;
  let npcProfileReturnFocus=null;
  function npcProfileGuild(npc){
    return game.guilds.find(g=>!g.dissolved && g.memberIds.includes(npc.id))||null;
  }
  function npcProfilePlacement(npc,metric){
    const value=valueForAmbition(npc,metric);
    return 1+game.population.filter(other=>other.id!==npc.id && valueForAmbition(other,metric)>value).length+
      (valueForAmbition(game.player,metric)>value?1:0);
  }
  function showNpcProfile(id){
    if(!game)return;
    if(id==='player'){
      closeNpcProfile();goToPage('dashboard');return;
    }
    const npc=npcById(id);
    if(!npc)return;
    const guild=npcProfileGuild(npc);
    const isRaiding=anyRaidUsesNpc(npc.id);
    const status=npc.injuryRemainingMs>0?`En convalescence · ${Math.ceil(npc.injuryRemainingMs/1000)} s`:
      isRaiding?'En expédition':'Disponible';
    const equipped=SLOTS.map(slot=>{
      const item=ITEM_BY_ID[npc.equipment?.[slot]];
      return `<div class="npc-profile-slot"><small>${escapeHtml(slot)}</small><strong>${item?escapeHtml(item.name):'Aucun équipement'}</strong><span>${item?`Rang ${escapeHtml(item.rank)} · ${gearEffectText(item)}`:'Emplacement vide'}</span></div>`;
    }).join('');
    const role={Tank:'Tank',DPS:'DPS',Heal:'Soigneur'}[npc.role]||npc.role||'—';
    const raids=Number(npc.totalRaids)||0;
    const gearStyle=NPC_GEAR_STYLES[npcGearStyle(npc)];
    $('npcProfileContent').innerHTML=`
      <div class="npc-profile-identity">
        <img class="npc-profile-large-portrait" src="${portraitPath(npc)}" alt="Portrait de ${escapeHtml(npc.name)}" />
        <div class="npc-profile-heading"><p class="eyebrow">${npc.isChief?'CHEF DE GUILDE':'AVENTURIER DU MONDE'}</p>
          <h2 id="npcProfileName">${escapeHtml(npc.name)}</h2>
          <p class="profile-role-row">${classRankMarkup(npc.class,npc.rank)}<span class="role-secondary">${escapeHtml(role)}</span></p>
          <div class="npc-profile-affiliation">${guild?`Membre de <strong>${escapeHtml(guild.name)}</strong>${npc.isChief?' · Direction':''}`:'<strong>Aventurier indépendant</strong>'}</div>
          <span class="npc-profile-status">${escapeHtml(status)}</span>
        </div>
      </div>
      <div class="npc-profile-facts">
        <div><small>PUISSANCE</small><strong>${Number(npc.power).toLocaleString('fr-FR')}</strong></div>
        <div><small>RÉPUTATION</small><strong>${Number(npc.rep||0).toLocaleString('fr-FR')}</strong></div>
        <div><small>OR PERSONNEL</small><strong>${Number(npc.gold||0).toLocaleString('fr-FR')} or</strong></div>
      </div>
      <section class="npc-profile-section"><div class="npc-profile-section-head"><h3>Équipement porté</h3><small>+${itemPower(npc)} puissance</small></div>
        <div class="npc-profile-equipment">${equipped}</div>
        <p class="npc-gear-personality"><strong>Habitudes d’achat : ${escapeHtml(gearStyle.name)}</strong> · ${escapeHtml(gearStyle.description)}</p></section>
      <div class="npc-profile-bottom">
        <section class="npc-profile-section"><h3>Positions aux classements</h3>
          <div class="npc-profile-list"><div><span>Puissance</span><b>${npcProfilePlacement(npc,'power')} / ${game.population.length+1}</b></div>
          <div><span>Réputation</span><b>${npcProfilePlacement(npc,'rep')} / ${game.population.length+1}</b></div>
          <div><span>Richesse</span><b>${npcProfilePlacement(npc,'gold')} / ${game.population.length+1}</b></div></div></section>
        <section class="npc-profile-section"><h3>Parcours</h3>
          <div class="npc-profile-list"><div><span>Expéditions effectuées</span><b>${raids}</b></div>
          <div><span>Blessures subies</span><b>${Number(npc.totalInjuries||0)}</b></div>
          <div><span>Statut actuel</span><b>${escapeHtml(status)}</b></div></div></section>
      </div>`;
    npcProfileId=id;
    const overlay=$('npcProfileOverlay');
    if(overlay.hidden)npcProfileReturnFocus=document.activeElement;
    overlay.hidden=false;
    $('npcProfileClose').focus();
  }
  function closeNpcProfile(){
    if($('npcProfileOverlay').hidden)return;
    $('npcProfileOverlay').hidden=true;
    npcProfileId=null;
    if(npcProfileReturnFocus?.isConnected)npcProfileReturnFocus.focus();
    npcProfileReturnFocus=null;
  }
  function handleProfileActivation(event){
    const target=event.target.closest('[data-profile-id]');
    if(!target||!game)return;
    if(event.type==='keydown'&&!['Enter',' '].includes(event.key))return;
    if(event.type==='keydown')event.preventDefault();
    sound('select');showNpcProfile(target.dataset.profileId);
  }
  // Classement public : les finances, les contrats et les escouades restent privés.
  let publicGuildId=null;
  function publicGuildMembers(g){
    return (g.memberIds||[]).map(id=>id==='player'?{...game.player,id:'player',isPlayer:true}:npcById(id)).filter(Boolean);
  }
  function renderGuildRanking(){
    const guilds=game.guilds.filter(g=>!g.dissolved).slice().sort((a,b)=>
      guildReputation(b)-guildReputation(a)||b.level-a.level||a.name.localeCompare(b.name,'fr'));
    const mine=playerGuild();
    $('guildRankingCount').textContent=String(guilds.length);
    $('guildRankingMine').textContent=mine?`Votre guilde : ${mine.name}`:'Vous êtes indépendant';
    $('guildRankingRows').innerHTML=guilds.map((g,i)=>`<div class="guild-ranking-row${mine?.id===g.id?' is-mine':''}" data-public-guild="${escapeHtml(g.id)}" role="button" tabindex="0" aria-label="Consulter la fiche publique de ${escapeHtml(g.name)}">
      <b class="guild-ranking-place">${i===0?'♛':`#${i+1}`}</b>
      <span class="guild-ranking-name"><strong>${escapeHtml(g.name)}${mine?.id===g.id?' <span class="you-label">VOTRE GUILDE</span>':''}</strong><small>Chef : ${escapeHtml(g.leader)}</small></span>
      <span class="guild-ranking-level">${g.level}</span><span class="guild-ranking-members">${g.memberIds.length}/${guildCapacity(g)}</span>
      <b class="guild-ranking-rep">✦ ${guildReputation(g).toLocaleString('fr-FR')}</b>
    </div>`).join('')||'<p class="shop-empty">Aucune guilde active.</p>';
  }
  function showPublicGuild(id){
    const g=game?.guilds?.find(g=>g.id===id&&!g.dissolved);
    if(!g)return;
    syncGuildReputations();
    publicGuildId=id;
    const members=publicGuildMembers(g);
    const sorted=members.slice().sort((a,b)=>Number(!!b.isChief)-Number(!!a.isChief)||b.power-a.power);
    const desc=(typeof GUILD_DESIGNS!=='undefined'?GUILD_DESIGNS.find(d=>d[0]===g.name):null);
    $('publicGuildName').textContent=g.name;
    $('publicGuildContent').innerHTML=`<div class="public-guild-header"><span class="public-guild-crest">${escapeHtml(g.icon||'✦')}</span><div><p class="eyebrow">ORGANISATION D'AVENTURIERS</p><h2>${escapeHtml(g.name)}</h2><p>Dirigée par ${escapeHtml(g.leader)}</p></div></div>
      <div class="public-guild-facts"><div><small>NIVEAU</small><strong>${g.level}</strong></div><div><small>MEMBRES</small><strong>${members.length}/${guildCapacity(g)}</strong></div><div><small>RÉPUTATION CUMULÉE</small><strong>${guildReputation(g).toLocaleString('fr-FR')}</strong></div></div>
      <p class="public-guild-note">La réputation de la guilde est la somme des réputations de ses membres actuels.</p>
      <div class="public-guild-record"><span>Donjons réussis : <b>${Number(g.won)||0}</b></span><span>Donjons échoués : <b>${Number(g.lost)||0}</b></span><span>Victoires en arène : <b>${Number(g.arenaWins)||0}</b></span></div>
      <h3>Effectif public</h3><div class="public-guild-roster">${sorted.map(n=>`<div class="public-guild-member" data-profile-id="${escapeHtml(n.id)}" role="button" tabindex="0" aria-label="Voir la fiche de ${escapeHtml(n.name)}">${portraitImg(n,'ranking-portrait')}<span><strong>${escapeHtml(n.name)}${n.isChief?' · Chef':''}${n.isPlayer?' · Vous':''}</strong><small class="public-guild-class-rank">${classRankMarkup(n.class,n.rank)}</small></span></div>`).join('')}</div>
      <p class="tiny muted">Les finances, les contrats et l'organisation des équipes sont confidentiels.</p>`;
    $('publicGuildOverlay').hidden=false;
    $('publicGuildClose').focus();
  }
  function closePublicGuild(){
    if($('publicGuildOverlay').hidden)return;
    $('publicGuildOverlay').hidden=true;
    publicGuildId=null;
    $('rankingGuildsView').querySelector(`[data-public-guild]`)?.focus();
  }
  function renderRanking(){
    if(!game)return;
    syncGuildReputations();
    for(const btn of document.querySelectorAll('[data-ranking-metric]')){
      const selected=btn.dataset.rankingMetric===(rankingView==='guilds'?'guilds':rankingMetric);
      btn.classList.toggle('selected',selected);btn.setAttribute('aria-pressed',String(selected));
    }
    $('rankingAdventurersView').hidden=rankingView==='guilds';
    $('rankingGuildsView').hidden=rankingView!=='guilds';
    if(rankingView==='guilds'){renderGuildRanking();return;}
    const metric=rankingMetric;
    const arr=rankedAdventurers(metric),pos=ambitionPlacement(metric),max=valueForAmbition(arr[0]||{},metric);
    $('rankingMetricName').textContent=AMBITIONS[metric].label.toLowerCase();
    $('rankingLeaderLabel').textContent=metric==='power'?'PLUS HAUTE PUISSANCE':metric==='rep'?'PLUS HAUTE RÉPUTATION':'PLUS GRAND PATRIMOINE NET';
    $('rankingUnit').textContent=AMBITIONS[metric].unit;
    $('playerPlacement').textContent=`#${pos}`;$('playerPlacementDetail').textContent=`sur ${arr.length} aventuriers`;
    $('rankingPopulation').textContent=arr.length;$('rankingTopPower').textContent=max.toLocaleString('fr-FR');
    $('rankingColumnName').textContent=AMBITIONS[metric].label.toUpperCase();
    for(const btn of document.querySelectorAll('[data-ranking-metric]')){
      const active=btn.dataset.rankingMetric===metric;btn.classList.toggle('selected',active);btn.setAttribute('aria-pressed',String(active));
    }
    const playerIndex=arr.findIndex(n=>n.isPlayer);
    const shown=arr.map((n,index)=>({...n,position:1+arr.filter(x=>valueForAmbition(x,metric)>valueForAmbition(n,metric)).length,orderIndex:index})).filter(n=>rankingFilter==='all'||(rankingFilter==='near'?Math.abs(n.orderIndex-playerIndex)<=5:(n.rank===rankingFilter)));
    const icon={power:'⚡',rep:'✦',gold:'◈'}[metric];
    $('rankingRows').innerHTML=shown.map(n=>`<div class="ranking-row ${n.isPlayer?'me':''}" data-profile-id="${escapeHtml(n.id||'player')}" role="button" tabindex="0" aria-label="Voir la fiche de ${escapeHtml(n.name)}"><div class="ranking-identity"><b class="ranking-place">${n.position===1?'♛':`#${n.position}`}</b>${portraitImg(n,'ranking-portrait')}<div><strong>${escapeHtml(n.name)}${n.isPlayer?' <span class="you-label">VOUS</span>':''}</strong><small>${escapeHtml(n.class)}${!n.isPlayer?' · '+escapeHtml(npcGearSummary(n)):''}</small></div></div>${rankMarkup(n.rank)}<b class="rank-power">${icon} ${valueForAmbition(n,metric).toLocaleString('fr-FR')}</b></div>`).join('')||'<p class="shop-empty">Aucun aventurier pour ce filtre.</p>';
      // Même population et mêmes formules pour la fenêtre complète et le panneau de carte.
    const top=arr.slice(0,5);
    const player=arr.find(n=>n.isPlayer);
    const mini=top.some(n=>n.isPlayer)||!player?top:[...top,player];
    $('worldRankingEntries').innerHTML=mini.map(n=>{
      const score=valueForAmbition(n,metric);
      const placement=1+arr.filter(x=>valueForAmbition(x,metric)>score).length;
      const extraClass=n.isPlayer?' is-player':'';
      return `<div class="world-ranking-entry${extraClass}" data-profile-id="${escapeHtml(n.id||'player')}" role="button" tabindex="0" aria-label="Voir la fiche de ${escapeHtml(n.name)}" title="Consulter la fiche de ${escapeHtml(n.name)}"><span class="wr-position">${placement}</span>${portraitImg(n,'world-portrait')}<strong>${escapeHtml(n.name)}${n.isPlayer?' ★':''}</strong><span class="wr-rank">${escapeHtml(n.rank)}</span><b class="wr-score">${score.toLocaleString('fr-FR')}</b></div>`;
    }).join('');
    $('worldRankingPlace').textContent=`#${pos}`;
    $('worldRankingSummary').textContent=`Vous : ${pos}e sur ${arr.length}`;
    $('worldRankingColumn').textContent={power:'Puissance',rep:'Réput.',gold:'Or net'}[metric];
    for(const btn of document.querySelectorAll('[data-world-ranking]')){
      const selected=btn.dataset.worldRanking===metric;
      btn.classList.toggle('selected',selected);btn.setAttribute('aria-pressed',String(selected));
    }
  }
  function homeResaleValue(home=game?.player?.home){return Math.floor((HOME_BY_ID[home?.id]?.price||0)*HOME_RESALE_RATE);}
  function investmentResaleValue(typeId){return Math.floor((INVESTMENT_BY_ID[typeId]?.price||0)*INVESTMENT_RESALE_RATE);}
  function ensureInvestments(g){
    if(!g.investments||typeof g.investments!=='object')g.investments={};
    const inv=g.investments;
    if(!Array.isArray(inv.owned))inv.owned=[];
    // Réparer les données anciennes et rejeter les entrées inconnues.
    inv.owned=inv.owned.filter(a=>a&&typeof a.id==='string'&&INVESTMENT_BY_ID[a.typeId]);
    const unique=new Set();
    inv.owned=inv.owned.filter(a=>{if(unique.has(a.id))return false;unique.add(a.id);return true;}).slice(0,MAX_INVESTMENTS);
    for(const a of inv.owned){
      if(!Number.isFinite(a.purchasedAt))a.purchasedAt=g.worldMinutes;
      if(!Number.isFinite(a.nextIncomeAt))a.nextIncomeAt=g.worldMinutes+INVESTMENT_CYCLE_MINUTES;
      if(!Number.isFinite(a.incomeEarned))a.incomeEarned=0;
      if(!Number.isFinite(a.payouts))a.payouts=0;
    }
    if(!Array.isArray(inv.history))inv.history=[];
    if(!Number.isFinite(inv.totalIncome))inv.totalIncome=0;
    return inv;
  }
  function investHistory(label,delta){
    const inv=ensureInvestments(game);
    inv.history.unshift({id:makeId(),label,delta,at:game.worldMinutes});
    inv.history=inv.history.slice(0,80);
  }
  function buyInvestment(typeId){
    if(!game||!INVESTMENT_BY_ID[typeId])return;
    if(game.raid||game.job){notify('Terminez votre activité en cours avant d’investir.');return;}
    const inv=ensureInvestments(game),def=INVESTMENT_BY_ID[typeId];
    if(inv.owned.length>=MAX_INVESTMENTS){notify('Votre portefeuille a atteint sa capacité maximale.');return;}
    if(inv.owned.filter(a=>a.typeId===typeId).length>=MAX_INVESTMENTS_PER_TYPE){notify('Vous possédez déjà trois biens de ce type.');return;}
    if(game.player.gold<def.price){notify(`Il manque ${money(def.price-game.player.gold)} pour cet achat.`);return;}
    if(!confirm(`Acheter « ${def.name} » pour ${money(def.price)} ?\n\nRevenu net : ${money(def.income)} tous les deux jours du monde.\nPremière échéance : deux jours après l’achat.\nValeur de revente : ${money(investmentResaleValue(typeId))}.`))return;
    game.player.gold-=def.price;
    inv.owned.push({id:makeId(),typeId,purchasedAt:game.worldMinutes,nextIncomeAt:game.worldMinutes+INVESTMENT_CYCLE_MINUTES,payouts:0,incomeEarned:0});
    investHistory(`Achat : ${def.name}`,-def.price);
    logEvent('Investissement réalisé',`${def.name} acheté pour ${money(def.price)}. Prochain revenu net : ${money(def.income)}.`,'shop');
    saveGame();renderAll();notify(`${def.name} ajouté à votre patrimoine.`);
  }
  function sellInvestment(id){
    if(!game)return;
    if(game.raid||game.job){notify('Terminez votre activité avant de vendre un bien.');return;}
    const inv=ensureInvestments(game),asset=inv.owned.find(a=>a.id===id);
    if(!asset)return;
    const def=INVESTMENT_BY_ID[asset.typeId],resale=investmentResaleValue(asset.typeId);
    if(!confirm(`Revendre « ${def.name} » pour ${money(resale)} ?\n\nCe bien ne produira plus de revenus. Cette opération est définitive.`))return;
    inv.owned=inv.owned.filter(a=>a.id!==id);
    game.player.gold+=resale;
    investHistory(`Vente : ${def.name}`,resale);
    logEvent('Bien revendu',`${def.name} revendu pour ${money(resale)}.`,'shop');
    saveGame();renderAll();notify(`Vente terminée : +${money(resale)}.`);
  }
  function investmentTick(){
    if(!game)return;
    const inv=ensureInvestments(game),due=inv.owned.filter(a=>game.worldMinutes>=a.nextIncomeAt);
    if(!due.length)return;
    let total=0;
    for(const asset of due){
      const def=INVESTMENT_BY_ID[asset.typeId];
      // Une seule échéance est payée par cycle, aucun revenu rétroactif hors-ligne.
      game.player.gold+=def.income;
      asset.incomeEarned+=def.income;asset.payouts++;
      asset.nextIncomeAt=game.worldMinutes+INVESTMENT_CYCLE_MINUTES;
      inv.totalIncome+=def.income;total+=def.income;
      investHistory(`Loyer net : ${def.name}`,def.income);
    }
    logEvent('Revenus du patrimoine',`Vos investissements vous ont rapporté ${money(total)} de revenus nets.`,'success');
    notify(`Revenus des investissements : +${money(total)}.`);
    saveGame();
    renderStats();renderAmbition();if(page==='finance'){renderHousing();renderInvestments();}if(page==='ranking')renderRanking();
  }
  function renderInvestments(){
    if(!game)return;
    const inv=ensureInvestments(game),owned=inv.owned;
    const portfolioValue=owned.reduce((sum,a)=>sum+investmentResaleValue(a.typeId),0);
    const nextIncome=owned.reduce((sum,a)=>sum+INVESTMENT_BY_ID[a.typeId].income,0);
    const debt=totalOutstandingDebt(game);
    $('investmentCount').textContent=String(owned.length);
    $('investmentResaleTotal').textContent=money(portfolioValue);
    $('investmentCycleIncome').textContent=money(nextIncome);
    $('investmentEarnedTotal').textContent=money(inv.totalIncome);
    $('financeNetWealth').textContent=money(game.player.gold+(game.bank?.balance||0)+homeResaleValue()+portfolioValue-debt);
    $('investmentPortfolio').innerHTML=owned.length?owned.map(a=>{
      const def=INVESTMENT_BY_ID[a.typeId];
      return `<article class="asset-card"><div class="asset-card-title"><span class="asset-symbol">${def.symbol}</span><div><span class="small-tag">${escapeHtml(def.kind)}</span><h3>${escapeHtml(def.name)}</h3><p class="muted tiny">Possédé depuis ${escapeHtml(formatGameDate(a.purchasedAt))}</p></div></div><div class="asset-facts"><span>Revenu net par cycle</span><strong>+${money(def.income)}</strong></div><div class="asset-facts"><span>Prochain versement</span><strong>${escapeHtml(formatGameDate(a.nextIncomeAt))}</strong></div><div class="asset-facts"><span>Revenus déjà perçus</span><strong>${money(a.incomeEarned)}</strong></div><div class="asset-facts"><span>Prix de revente (75 %)</span><strong>${money(investmentResaleValue(a.typeId))}</strong></div><button class="secondary-btn full-width" data-invest-sell="${escapeHtml(a.id)}" ${game.raid||game.job?'disabled':''}>Revendre le bien</button></article>`;
    }).join(''):'<p class="shop-empty">Aucun bien locatif ni commerce pour le moment. Votre résidence principale est affichée au-dessus.</p>';
    $('investmentMarket').innerHTML=INVESTMENTS.map(def=>{
      const ownedOfType=owned.filter(a=>a.typeId===def.id).length;
      const full=owned.length>=MAX_INVESTMENTS||ownedOfType>=MAX_INVESTMENTS_PER_TYPE;
      const insufficient=game.player.gold<def.price;
      return `<article class="asset-card market-card"><div class="asset-card-title"><span class="asset-symbol">${def.symbol}</span><div><span class="small-tag">${escapeHtml(def.kind)}</span><h3>${escapeHtml(def.name)}</h3><p>${escapeHtml(def.description)}</p></div></div><div class="asset-facts"><span>Prix d’achat</span><strong>${money(def.price)}</strong></div><div class="asset-facts"><span>Loyer NET / 2 jours</span><strong class="positive">+${money(def.income)}</strong></div><div class="asset-facts"><span>Rendement net / cycle</span><strong>${def.price?`${(def.income/def.price*100).toFixed(1).replace('.',',')} %`:'—'}</strong></div><div class="asset-facts"><span>Revente (75 %)</span><strong>${money(investmentResaleValue(def.id))}</strong></div><div class="asset-facts"><span>Déjà possédés</span><strong>${ownedOfType} / ${MAX_INVESTMENTS_PER_TYPE}</strong></div><button class="primary-btn full-width" data-invest-buy="${def.id}" ${full||insufficient||game.raid||game.job?'disabled':''}>${full?'Limite atteinte':insufficient?'Or insuffisant':'Acheter cet investissement'}</button></article>`;
    }).join('');
    $('investmentHistory').innerHTML=inv.history.length?inv.history.slice(0,18).map(entry=>`<div class="history-row"><span>${escapeHtml(entry.label)}<small>${escapeHtml(formatGameDate(entry.at))}</small></span><strong class="${entry.delta<0?'expense':''}">${entry.delta<0?'−':'+'}${money(Math.abs(entry.delta))}</strong></div>`).join(''):'<p class="shop-empty">Aucune transaction immobilière pour le moment.</p>';
  }

  function switchResidence(id){
    if(!game||!HOME_BY_ID[id])return;
    const p=game.player,next=HOME_BY_ID[id],current=HOME_BY_ID[p.home?.id]||HOMES[0];
    if(current.id===next.id){notify('Ce logement est déjà votre résidence principale.');return;}
    if(game.raid||game.job){notify('Impossible de déménager pendant une activité en cours.');return;}
    const resale=homeResaleValue(current),netCost=next.price-resale;
    if(p.gold<netCost){notify(`Or insuffisant : ${Math.max(0,netCost-p.gold)} or manquants.`);return;}
    const text=`Changer de résidence ?\n\nVous vendez « ${current.name} » pour ${resale} or et achetez « ${next.name} » pour ${next.price} or.\n${netCost>=0?`Coût net : ${netCost} or`:`Gain net : ${-netCost} or`}\nConvalescence : ${current.recoverySeconds} s → ${next.recoverySeconds} s.`;
    if(!confirm(text))return;
    // Une opération unique : retirer le coût, remplacer l'unique résidence, puis sauvegarder.
    p.gold-=netCost;
    if(p.injuryRemainingMs>0){
      const prevDuration=Math.max(1,p.injuryTotalMs||current.recoverySeconds*1000);
      const stillToHeal=clamp(p.injuryRemainingMs/prevDuration,0,1);
      p.injuryTotalMs=next.recoverySeconds*1000;
      p.injuryRemainingMs=Math.round(stillToHeal*p.injuryTotalMs);
    }
    p.home={...next};
    logEvent('Changement de résidence',`${current.name} revendu pour ${resale} or ; achat : ${next.name}, ${next.price} or. Convalescence : ${next.recoverySeconds} s.`,'shop');
    saveGame();renderAll();notify(`Vous habitez maintenant : ${next.name} !`);
  }
  // Comptes bancaires persistants : aucune progression pendant la fermeture du jeu.
  function ensureBank(g){
    if(!g.bank||typeof g.bank!=='object')g.bank={};
    const b=g.bank;
    b.balance=Number.isFinite(b.balance)?Math.max(0,Math.floor(b.balance)):0;
    if(!Number.isFinite(b.nextInterestAt))b.nextInterestAt=g.worldMinutes+BANK_SAVINGS_CYCLE_MINUTES;
    if(!Array.isArray(b.history))b.history=[];
    if(b.loan){
      if(!Number.isFinite(b.loan.remaining)||b.loan.remaining<=0)b.loan=null;
      else {
        b.loan.remaining=Math.floor(b.loan.remaining);
        if(!Number.isFinite(b.loan.dueAt))b.loan.dueAt=g.worldMinutes+BANK_LOAN_DURATION_MINUTES;
        if(typeof b.loan.lateApplied!=='boolean')b.loan.lateApplied=false;
      }
    }
    return b;
  }
  function outstandingBills(g){return (g.economy?.bills||[]).reduce((n,b)=>n+billOutstanding(b),0);}
  function totalOutstandingDebt(g){return outstandingBills(g)+(g.bank?.loan?.remaining||0);}
  function availableLiquidationAssets(){
    return game.player.gold+(game.bank?.balance||0)+homeResaleValue()+
      (game.investments?.owned||[]).reduce((n,a)=>n+investmentResaleValue(a.typeId),0);
  }
  function bankActivity(label,amount){
    const b=ensureBank(game);b.history.unshift({id:makeId(),label,amount,at:game.worldMinutes});b.history=b.history.slice(0,60);
  }
  function parseBankAmount(){
    const raw=$('bankAmount').value.trim();
    if(!/^\d+$/.test(raw)){notify('Indiquez un montant entier positif.');return null;}
    const amount=Number(raw);if(!Number.isSafeInteger(amount)||amount<1){notify('Montant invalide.');return null;}return amount;
  }
  function bankTransfer(direction){
    if(!game||game.gameOver)return;
    if(game.raid||game.job){notify('Opération bancaire indisponible pendant une activité.');return;}
    const amount=parseBankAmount();if(!amount)return;
    const b=ensureBank(game);
    if(direction==='deposit'){
      if(amount>game.player.gold){notify('Pas assez d’or dans votre bourse.');return;}
      game.player.gold-=amount;b.balance+=amount;bankActivity('Dépôt sur le compte',amount);
      logEvent('Dépôt bancaire',`${money(amount)} versés sur votre compte.`,'info');
    }else{
      if(amount>b.balance){notify('Solde bancaire insuffisant.');return;}
      b.balance-=amount;game.player.gold+=amount;bankActivity('Retrait du compte',-amount);
      logEvent('Retrait bancaire',`${money(amount)} retirés de votre compte.`,'info');
    }
    $('bankAmount').value='';saveGame();renderAll();notify(`Opération effectuée : ${money(amount)}.`);
  }
  function takeLoan(amount){
    if(!game||game.gameOver)return;
    const offer=BANK_LOAN_OFFERS.find(x=>x.amount===amount);if(!offer)return;
    if(game.raid||game.job){notify('Impossible pendant une activité.');return;}
    if(getRankIndex(game.player.rank)<getRankIndex(offer.minRank)){notify(`Rang ${offer.minRank} nécessaire.`);return;}
    const b=ensureBank(game);if(b.loan){notify('Remboursez votre prêt actuel avant d’en demander un autre.');return;}
    const total=amount+Math.ceil(amount*BANK_LOAN_INTEREST_RATE);
    if(!confirm(`Demander le ${offer.label} ?\n\nMontant reçu : ${money(amount)}.\nIntérêts forfaitaires : ${money(total-amount)} (12 %).\nTotal à rembourser : ${money(total)}.\nÉchéance : 7 jours du monde.\nRetard : majoration unique de 10 % du solde restant, puis recouvrement progressif.`))return;
    b.loan={id:makeId(),principal:amount,remaining:total,borrowedAt:game.worldMinutes,dueAt:game.worldMinutes+BANK_LOAN_DURATION_MINUTES,lateApplied:false};
    game.player.gold+=amount;bankActivity(`Crédit reçu (${offer.label})`,amount);
    logEvent('Prêt bancaire accordé',`${money(amount)} reçus ; ${money(total)} à rembourser avant ${formatGameDate(b.loan.dueAt)}.`,'info');
    saveGame();renderAll();notify(`${money(amount)} reçus dans votre bourse.`);
  }
  function repayLoan(){
    if(!game||game.gameOver)return;
    if(game.raid||game.job){notify('Impossible pendant une activité.');return;}
    const b=ensureBank(game);if(!b.loan)return;
    const raw=$('repayAmount').value.trim();
    if(!/^\d+$/.test(raw)||!Number.isSafeInteger(Number(raw))||Number(raw)<1){notify('Montant de remboursement invalide.');return;}
    const amount=Math.min(Number(raw),b.loan.remaining);
    if(game.player.gold<amount){notify('Or en bourse insuffisant pour rembourser.');return;}
    game.player.gold-=amount;b.loan.remaining-=amount;
    bankActivity('Remboursement du prêt',-amount);
    const settled=b.loan.remaining<=0;
    if(settled)b.loan=null;
    logEvent(settled?'Crédit remboursé':'Remboursement du crédit',`${money(amount)} remboursés.${settled?' Prêt intégralement soldé.':''}`,'success');
    saveGame();renderAll();notify(settled?'Prêt intégralement remboursé !':`${money(amount)} remboursés.`);
  }
  function bankTick(){
    if(!game||game.gameOver)return;
    const b=ensureBank(game);
    if(game.worldMinutes>=b.nextInterestAt){
      const gain=Math.floor(b.balance*BANK_SAVINGS_RATE);
      if(gain>0){b.balance+=gain;bankActivity('Intérêts de l’épargne',gain);logEvent('Intérêts bancaires',`Votre épargne a rapporté ${money(gain)}.`,'success');}
      b.nextInterestAt=game.worldMinutes+BANK_SAVINGS_CYCLE_MINUTES;
      if(gain>0){saveGame();if(page==='finance'){renderBank();renderInvestments();}}
    }
    if(b.loan&&game.worldMinutes>=b.loan.dueAt&&!b.loan.lateApplied){
      const fee=Math.ceil(b.loan.remaining*BANK_LOAN_LATE_RATE);
      b.loan.remaining+=fee;b.loan.lateApplied=true;
      logEvent('Prêt en retard',`Échéance dépassée : pénalité unique de ${money(fee)}. Crédit désormais dû : ${money(b.loan.remaining)}.`,'failure');
      saveGame();if(page==='finance')renderBank();if(page==='debts')renderDebts();notify('Votre prêt bancaire est en retard !');
    }
  }
  function earliestUnpaidDueAt(){
    const due=(game.economy?.bills||[]).filter(b=>b.paidAt==null&&game.worldMinutes>=b.dueAt).map(b=>b.dueAt);
    if(game.bank?.loan?.remaining>0&&game.worldMinutes>=game.bank.loan.dueAt)due.push(game.bank.loan.dueAt);
    return due.length?Math.min(...due):null;
  }
  function stageForDays(days){return days>=21?4:days>=14?3:days>=7?2:days>=2?1:0;}
  function enforceSeizure(){
    if(game.raid||game.job)return; // Une expédition en cours se termine avant la procédure.
    const amount=totalOutstandingDebt(game);
    if(!amount)return;
    const assets=availableLiquidationAssets();
    const b=ensureBank(game),inv=ensureInvestments(game);
    const soldAssets=inv.owned.length;
    // Procédure fictive : vente forcée des actifs au prix de revente habituel.
    game.player.gold=assets;b.balance=0;inv.owned=[];game.player.home={...HOMES[0]};
    if(assets>=amount){
      game.player.gold-=amount;
      for(const bill of game.economy.bills)if(bill.paidAt==null){const paid=billOutstanding(bill);bill.paidAt=game.worldMinutes;reimburseGuild(bill);game.economy.history.unshift({id:bill.id,label:'Recouvrement : '+bill.label,amount:paid,paidAt:bill.paidAt});}
      b.loan=null;game.economy.noticeStage=0;
      logEvent('Saisie administrative',`Recouvrement de ${money(amount)} après vente forcée de ${soldAssets} investissement(s) et saisie du logement. Vous conservez votre autorisation d’exercer.`,'failure');
      bankActivity('Recouvrement administratif',-amount);
      saveGame();renderAll();notify('Saisie des biens : vos dettes ont été remboursées.');
    }else{
      // Fin économique : dettes restantes, plus aucun actif, logement confisqué.
      game.player.gold=0;
      game.gameOver={at:game.worldMinutes,reason:'insolvency',unpaid:amount-assets,assetsSeized:assets};
      const guild=playerGuild();
      if(guild){guild.memberIds=guild.memberIds.filter(id=>id!=='player');guild.teamIds=guild.teamIds.filter(id=>id!=='player');guild.playerTeamIds=(guild.playerTeamIds||[]).filter(id=>id!=='player');}
      game.player.guildId=null;game.player.contract=null;
      logEvent('Fin de carrière — insolvabilité',`Après la saisie de vos biens, ${money(amount-assets)} demeurent impayés. Logement et autorisation d’exercer perdus.`,'failure');
      saveGame();renderAll();renderGameOver();
    }
  }
  function debtEnforcementTick(){
    if(!game||game.gameOver)return;
    const economy=ensureEconomy(game),due=earliestUnpaidDueAt();
    const stage=due==null?0:stageForDays(Math.floor((game.worldMinutes-due)/1440));
    if(stage===0){economy.noticeStage=0;return;}
    if(stage===4){enforceSeizure();return;}
    if(stage!==economy.noticeStage){
      economy.noticeStage=stage;
      const title=['','Avertissement de paiement','Mise en demeure officielle','Dernier avis avant saisie'][stage];
      const text=['','Vos dettes sont en retard depuis deux jours. Régularisez votre situation.','Vous avez sept jours de retard. Vous pouvez encore faire des raids de l’Association, travailler ou vendre des biens.','Quatorze jours de retard. Saisie forcée à 21 jours de retard si la dette persiste.'][stage];
      logEvent(title,text,'failure');notify(title);saveGame();if(page==='debts')renderDebts();
    }
  }
  function renderBank(){
    if(!game)return;
    const b=ensureBank(game),loan=b.loan;
    $('bankBalance').textContent=money(b.balance);
    $('bankPocket').textContent=money(game.player.gold);
    $('bankLoanAmount').textContent=money(loan?.remaining||0);
    $('bankNextInterest').textContent=formatGameDate(b.nextInterestAt);
    $('bankLoanOffers').innerHTML=BANK_LOAN_OFFERS.map(o=>`<article class="bank-offer"><div><b>${escapeHtml(o.label)}</b><small>Rang ${o.minRank} minimum · Reçoit ${money(o.amount)} · Rembourse ${money(o.amount+Math.ceil(o.amount*BANK_LOAN_INTEREST_RATE))} en 7 jours</small></div><button class="primary-btn" data-take-loan="${o.amount}" ${loan||game.raid||game.job||getRankIndex(game.player.rank)<getRankIndex(o.minRank)?'disabled':''}>Emprunter</button></article>`).join('');
    $('bankLoanRepay').hidden=!loan;
    if(loan){$('bankLoanDue').textContent=`Échéance : ${formatGameDate(loan.dueAt)}${loan.lateApplied?' · EN RETARD':''}`;$('repayAmount').max=String(loan.remaining);}
    $('bankTransferButtons').querySelectorAll('button').forEach(btn=>btn.disabled=!!(game.raid||game.job));
    $('bankHistory').innerHTML=b.history.length?b.history.slice(0,10).map(entry=>`<div class="history-row"><span>${escapeHtml(entry.label)}<small>${escapeHtml(formatGameDate(entry.at))}</small></span><strong>${entry.amount<0?'−':'+'}${money(Math.abs(entry.amount))}</strong></div>`).join(''):'<p class="shop-empty">Aucune opération bancaire.</p>';
  }
  function renderRecovery(){
    if(!game)return;
    const due=earliestUnpaidDueAt(),days=due===null?0:Math.floor((game.worldMinutes-due)/1440),stage=stageForDays(days);
    const names=['Situation normale','Avertissement','Mise en demeure','Dernier avis','Saisie engagée'];
    $('debtProcedureStage').textContent=names[stage];
    $('debtProcedureDetail').textContent=due===null?'Aucun impayé en retard. Vos activités sont autorisées.':`Plus ancien impayé : ${days} jour(s) de retard. Saisie administrative à 21 jours si la dette demeure impayée. Possibilité de vente forcée du patrimoine, puis fin de carrière si les actifs ne suffisent pas.`;
    $('loanDebtDetail').textContent=game.bank?.loan?`${money(game.bank.loan.remaining)} à rembourser · ${formatGameDate(game.bank.loan.dueAt)}${game.bank.loan.lateApplied?' · En retard':''}`:'Aucun emprunt bancaire en cours.';
    $('loanDebtTotal').textContent=money(game.bank?.loan?.remaining||0);
  }
  function renderGameOver(){
    const el=$('gameOverOverlay');if(!el)return;
    el.hidden=!game?.gameOver;
    if(game?.gameOver){$('gameOverDebt').textContent=money(game.gameOver.unpaid);$('gameOverDay').textContent=stamp();}
  }

  // V8 — Factures des logements ; V10 — recouvrement progressif.
  function ensureEconomy(g){
    if(!g.economy||typeof g.economy!=='object')g.economy={};
    if(!Array.isArray(g.economy.bills))g.economy.bills=[];
    if(!Array.isArray(g.economy.history))g.economy.history=[];
    if(!Number.isFinite(g.economy.nextBillingMinute))g.economy.nextBillingMinute=g.worldMinutes+BILLING_CYCLE_MINUTES;
    if(!Number.isFinite(g.economy.noticeStage))g.economy.noticeStage=0;
    ensureBank(g);
    // Migration non destructive : l'absence de service ne doit jamais activer de paiement.
    if(!g.economy.accountant||typeof g.economy.accountant!=='object')g.economy.accountant={};
    const accountant=g.economy.accountant;
    accountant.hired=accountant.hired===true;
    accountant.enabled=accountant.hired&&accountant.enabled===true;
    accountant.useBank=accountant.hired&&accountant.useBank===true;
    if(g.job && (!JOB_BY_ID[g.job.id] || !Number.isFinite(g.job.remainingMs) || g.job.remainingMs<=0))g.job=null;
    return g.economy;
  }
  function money(n){return Math.max(0,Math.round(n)).toLocaleString('fr-FR')+' or';}
  function billOutstanding(b){return b.paidAt==null ? Math.max(0,Math.round(b.amount+(b.penalty||0))):0;}
  function billStatus(b){return b.paidAt!=null?'Réglée':game.worldMinutes>=b.dueAt?'En retard':'À payer';}
  // V14.1.3 — Comptable : automatise uniquement les factures existantes.
  // Aucun crédit, argent fictif, bonus ou transaction pendant la pause.
  function hireAccountant(){
    if(!game||game.gameOver||game.season?.finished||game.paused)return;
    const accountant=ensureEconomy(game).accountant;
    if(accountant.hired)return;
    if(game.player.gold<ACCOUNTANT_PRICE){notify(`Le Comptable coûte ${money(ACCOUNTANT_PRICE)}. Votre bourse est insuffisante.`);return;}
    if(!confirm(`Engager le Comptable pour ${money(ACCOUNTANT_PRICE)} (paiement unique) ?\n\nIl règlera vos factures une heure du monde avant leur échéance, si vos fonds le permettent. Par défaut, seule la bourse est utilisée ; vous pourrez autoriser votre compte bancaire séparément. Les emprunts ne sont jamais remboursés automatiquement.`))return;
    game.player.gold-=ACCOUNTANT_PRICE;
    accountant.hired=true;accountant.enabled=true;accountant.useBank=false;
    logEvent('Comptable engagé',`Service de prélèvement automatique acquis pour ${money(ACCOUNTANT_PRICE)}. Les factures seront réglées avec votre or disponible.`, 'finance');
    saveGame();renderAll();notify('Comptable engagé : paiement automatique activé.');
  }
  function toggleAccountant(){
    if(!game||game.gameOver||game.season?.finished||game.paused)return;
    const accountant=ensureEconomy(game).accountant;
    if(!accountant.hired)return;
    accountant.enabled=!accountant.enabled;
    logEvent('Comptable',accountant.enabled?'Les prélèvements automatiques sont activés.':'Les prélèvements automatiques sont désactivés.','finance');
    saveGame();renderAll();notify(accountant.enabled?'Prélèvements automatiques activés.':'Prélèvements automatiques désactivés.');
  }
  function toggleAccountantBank(){
    if(!game||game.gameOver||game.season?.finished||game.paused)return;
    const accountant=ensureEconomy(game).accountant;
    if(!accountant.hired)return;
    accountant.useBank=!accountant.useBank;
    logEvent('Comptable',accountant.useBank?'Le compte bancaire pourra compléter votre bourse pour régler les factures.':'Le Comptable ne prélèvera plus sur votre compte bancaire.','finance');
    saveGame();renderAll();notify(accountant.useBank?'Prélèvement bancaire autorisé.':'Prélèvement bancaire désactivé.');
  }
  function accountantTick(){
    if(!game||game.paused||game.gameOver||game.season?.finished)return;
    const economy=ensureEconomy(game),accountant=economy.accountant;
    if(!accountant.hired||!accountant.enabled)return;
    const bank=ensureBank(game);
    let changed=false;
    const dueBills=economy.bills.filter(b=>b.paidAt==null&&game.worldMinutes>=b.dueAt-ACCOUNTANT_EARLY_MINUTES)
      .sort((a,b)=>a.dueAt-b.dueAt||a.issuedAt-b.issuedAt);
    for(const bill of dueBills){
      const amount=billOutstanding(bill);
      const available=game.player.gold+(accountant.useBank?bank.balance:0);
      if(available<amount){
        if(!bill.accountantShortageNotified){
          bill.accountantShortageNotified=true;
          logEvent('Comptable : fonds insuffisants',`La facture « ${bill.label} » de ${money(amount)} n'a pas pu être réglée. ${accountant.useBank?'Votre bourse et votre compte bancaire ne suffisent pas.':'Le compte bancaire n’est pas autorisé ; vérifiez votre bourse ou activez le prélèvement bancaire.'}`,'debt');
          changed=true;
        }
        continue; // La facture reste impayée et les pénalités ordinaires s'appliquent.
      }
      const pocket=Math.min(amount,game.player.gold);
      const bankPart=amount-pocket;
      game.player.gold-=pocket;
      if(bankPart>0){bank.balance-=bankPart;bankActivity(`Comptable : ${bill.label}`,-bankPart);}
      bill.paidAt=game.worldMinutes;
      bill.paymentMethod='accountant';
      reimburseGuild(bill); // Une seule fois : bill.paidAt interdit un second prélèvement.
      economy.history.unshift({id:bill.id,label:`Comptable : ${bill.label}`,amount,paidAt:bill.paidAt,source:'accountant',bankPart});
      logEvent('Facture réglée automatiquement',`${bill.label} (${bill.home||'contrat de guilde'}) : ${money(amount)} réglés par le Comptable${bankPart>0?` (dont ${money(bankPart)} prélevés sur votre compte bancaire)`:''}.`,'income');
      changed=true;
    }
    if(changed){
      economy.history=economy.history.slice(0,100);
      saveGame();
      if(page==='debts')renderDebts();
      if(page==='bank')renderBank();
      renderStats();
    }
  }
  function renderAccountant(){
    const accountant=ensureEconomy(game).accountant;
    $('accountantPurchase').hidden=accountant.hired;
    $('accountantControls').hidden=!accountant.hired;
    $('accountantPrice').textContent=money(ACCOUNTANT_PRICE);
    $('accountantHire').disabled=game.player.gold<ACCOUNTANT_PRICE||!!game.gameOver||!!game.season?.finished;
    $('accountantStatus').textContent=!accountant.hired?'SERVICE DISPONIBLE':accountant.enabled?'ACTIF':'DÉSACTIVÉ';
    $('accountantStatus').classList.toggle('accountant-active',accountant.enabled);
    $('accountantToggle').textContent=accountant.enabled?'Désactiver les prélèvements':'Activer les prélèvements';
    $('accountantBankToggle').textContent=accountant.useBank?'✓ Compte bancaire autorisé':'Compte bancaire non autorisé';
    $('accountantBankToggle').setAttribute('aria-pressed',String(accountant.useBank));
    $('accountantToggle').setAttribute('aria-pressed',String(accountant.enabled));
    $('accountantAccountInfo').textContent=accountant.useBank?'Bourse prioritaire, puis compte bancaire si nécessaire.':'Prélèvements uniquement dans la bourse.';
  }

  function createResidenceBills(){
    if(!game)return;
    const charges=HOME_CHARGES[game.player.home?.id]||HOME_CHARGES.studio_start;
    const now=game.worldMinutes, due=now+BILL_DUE_MINUTES;
    for(const [type,amount,label] of [['maintenance',charges.maintenance,'Entretien du logement'],['tax',charges.tax,'Taxe immobilière']]){
      const bill={id:makeId(),type,label,home:game.player.home.name,amount,penalty:0,issuedAt:now,dueAt:due,paidAt:null,lateNotified:false};
      game.economy.bills.unshift(bill);
    }
    logEvent('Nouvelles charges',`Entretien : ${money(charges.maintenance)} ; taxe : ${money(charges.tax)}. Échéance : ${formatGameDate(due)}.`,'info');
    notify('Deux nouvelles factures sont disponibles dans « Charges et dettes ».');
    game.economy.bills=game.economy.bills.slice(0,160);
  }
  function economicTick(){
    if(!game)return;
    const economy=ensureEconomy(game);
    if(game.worldMinutes>=economy.nextBillingMinute){
      createResidenceBills();
      // Ne pas facturer rétroactivement d'innombrables périodes après un saut d'horloge.
      economy.nextBillingMinute=game.worldMinutes+BILLING_CYCLE_MINUTES;
      saveGame();if(page==='debts')renderDebts();
    }
    for(const bill of economy.bills){
      if(bill.paidAt!=null || bill.lateNotified || game.worldMinutes<bill.dueAt)continue;
      bill.penalty=Math.ceil(bill.amount*LATE_PENALTY_RATE);
      bill.lateNotified=true;
      logEvent('Facture en retard',`${bill.label} (${bill.home}) : ${money(billOutstanding(bill))} à régler, pénalité unique comprise.`,'failure');
      notify('Une facture est en retard ! Consultez « Charges et dettes ».');
      saveGame();if(page==='debts')renderDebts();
    }
    accountantTick(); // Avant le recouvrement ; les factures échues ont déjà leurs pénalités normales.
    debtEnforcementTick();
  }
  function settleBill(id){
    if(!game)return;
    const bill=ensureEconomy(game).bills.find(b=>b.id===id && b.paidAt==null);
    if(!bill)return;
    const total=billOutstanding(bill);
    if(game.player.gold<total){notify(`Il manque ${money(total-game.player.gold)} pour régler cette facture.`);return;}
    game.player.gold-=total;bill.paidAt=game.worldMinutes;
    reimburseGuild(bill);
    game.economy.history.unshift({id:bill.id,label:bill.label,amount:total,paidAt:bill.paidAt});
    game.economy.history=game.economy.history.slice(0,100);
    logEvent('Charge payée',`${bill.label} (${bill.home}) : ${money(total)} réglés.`,'success');
    saveGame();renderAll();notify(`${bill.label} payée : ${money(total)}.`);
  }
  function settleAllBills(){
    if(!game)return;
    const bills=ensureEconomy(game).bills.filter(b=>b.paidAt==null);
    const total=bills.reduce((n,b)=>n+billOutstanding(b),0);
    if(!total){notify('Aucune facture à régler.');return;}
    if(game.player.gold<total){notify(`Impossible de tout régler : manque ${money(total-game.player.gold)}.`);return;}
    for(const bill of bills){
      const amount=billOutstanding(bill);game.player.gold-=amount;bill.paidAt=game.worldMinutes;
      reimburseGuild(bill);
      game.economy.history.unshift({id:bill.id,label:bill.label,amount,paidAt:bill.paidAt});
    }
    game.economy.history=game.economy.history.slice(0,100);
    logEvent('Charges payées',`Vous avez réglé ${bills.length} factures pour un total de ${money(total)}.`,'success');
    saveGame();renderAll();notify(`${bills.length} factures réglées : ${money(total)}.`);
  }
  function renderDebts(){
    if(!game)return;
    const economy=ensureEconomy(game),bills=economy.bills;
    const pending=bills.filter(b=>b.paidAt==null),total=pending.reduce((n,b)=>n+billOutstanding(b),0);
    const late=pending.filter(b=>game.worldMinutes>=b.dueAt);
    $('chargesBalance').textContent=money(total);
    $('chargesCount').textContent=`${pending.length} facture(s) à payer`;
    $('chargesLate').textContent=`${late.length} en retard`;
    $('chargesNext').textContent=formatGameDate(economy.nextBillingMinute);
    $('payAllBills').disabled=total===0||game.player.gold<total;
    $('billList').innerHTML=pending.length?pending.sort((a,b)=>a.dueAt-b.dueAt).map(b=>`<article class="bill-card ${game.worldMinutes>=b.dueAt?'late':''}"><div><span class="small-tag">${escapeHtml(billStatus(b))}</span><h3>${escapeHtml(b.label)}</h3><p>${escapeHtml(b.home)} · Émise ${escapeHtml(formatGameDate(b.issuedAt))} · Échéance ${escapeHtml(formatGameDate(b.dueAt))}</p>${b.penalty?`<small>Pénalité unique incluse : ${money(b.penalty)}</small>`:''}</div><div class="bill-actions"><strong>${money(billOutstanding(b))}</strong><button type="button" class="primary-btn" data-bill-pay="${escapeHtml(b.id)}" ${game.player.gold<billOutstanding(b)?'disabled':''}>Payer</button></div></article>`).join(''):'<p class="shop-empty">Aucune facture à payer pour le moment.</p>';
    renderRecovery();
    renderAccountant();
    $('billHistory').innerHTML=economy.history.length?economy.history.slice(0,20).map(h=>`<div class="history-row"><span>${escapeHtml(h.label)}<small>${escapeHtml(formatGameDate(h.paidAt))}</small></span><strong>${money(h.amount)}</strong></div>`).join(''):'<p class="shop-empty">Aucun paiement enregistré.</p>';
  }
  function beginSideJob(id){
    if(!game||!JOB_BY_ID[id])return;
    if(game.raid||game.job){notify('Vous êtes déjà occupé.');return;}
    if(isInjured()){notify('Vous devez terminer votre convalescence avant de travailler.');return;}
    const def=JOB_BY_ID[id];
    game.job={id,durationMs:def.durationMs,remainingMs:def.durationMs,gold:def.gold};
    logEvent('Début de petit boulot',`Vous avez commencé un petit boulot : ${def.name}. Rémunération prévue : ${money(def.gold)}.`,'info');
    sound('select');saveGame();renderAll();notify(`Petit boulot commencé : ${def.name}.`);
  }
  function finishSideJob(){
    if(!game?.job)return;
    const job=game.job,def=JOB_BY_ID[job.id];game.job=null;
    if(!def)return;
    game.player.gold+=job.gold;
    logEvent('Petit boulot terminé',`Vous avez terminé votre travail (${def.name}) et gagné ${money(job.gold)}.`,'success');
    sound('job');saveGame();renderAll();notify(`Travail terminé : +${money(job.gold)} !`);
  }
  function renderJobProgress(){
    const active=game?.job; if(!active)return;
    $('jobCountdown').textContent=`${Math.ceil(active.remainingMs/1000)} s restantes`;
    $('jobProgressBar').style.width=`${clamp(100*(1-active.remainingMs/active.durationMs),0,100)}%`;
  }
  function renderJobs(){
    if(!game)return;
    const active=game.job;
    $('jobCards').innerHTML=SIDE_JOBS.map(j=>`<article class="job-card"><div class="job-symbol">${j.icon}</div><div class="job-text"><h3>${escapeHtml(j.name)}</h3><p>${escapeHtml(j.description)}</p><small>${j.durationMs/1000} secondes · Récompense garantie</small></div><div class="job-reward"><b>+${money(j.gold)}</b><button type="button" class="primary-btn" data-job="${j.id}" ${active||game.raid||isInjured()?'disabled':''}>${active?.id===j.id?'En cours…':'Travailler'}</button></div></article>`).join('');
    $('jobProgressBox').hidden=!active;
    if(active){
      const def=JOB_BY_ID[active.id];
      $('jobCurrentName').textContent=def?.name||'Petit boulot';
      $('jobCountdown').textContent=`${Math.ceil(active.remainingMs/1000)} s restantes`;
      $('jobProgressBar').style.width=`${clamp(100*(1-active.remainingMs/active.durationMs),0,100)}%`;
    }
  }
  function renderHousing(){
    if(!game)return;
    const p=game.player,current=HOME_BY_ID[p.home?.id]||HOMES[0],resale=homeResaleValue(current);
    $('financeHomeName').textContent=current.name;
    $('financeHomeQuality').textContent=`Qualité ${current.tier} / V · Résidence principale`;
    $('financeRecovery').textContent=`${current.recoverySeconds} secondes`;
    $('financeResale').textContent=`${resale.toLocaleString('fr-FR')} or`;
    $('financeWallet').textContent=`${p.gold.toLocaleString('fr-FR')} or`;
    $('housingCatalog').innerHTML=HOMES.map(home=>{
      const active=home.id===current.id,net=home.price-resale,canPay=p.gold>=net;
      return `<article class="housing-card ${active?'current':''}"><div class="housing-card-top"><span class="small-tag">QUALITÉ ${home.tier} / V</span>${active?'<span class="small-tag green">VOTRE LOGEMENT</span>':''}</div><h3>${escapeHtml(home.name)}</h3><p>${escapeHtml(home.description)}</p><div class="housing-details"><span>✚ Guérison</span><strong>${home.recoverySeconds} s</strong></div><div class="housing-details"><span>Prix</span><strong>${home.price.toLocaleString('fr-FR')} or</strong></div><div class="housing-details"><span>Coût net après revente</span><strong>${active?'—':(net>=0?`${net.toLocaleString('fr-FR')} or`:`+${(-net).toLocaleString('fr-FR')} or récupérés`)}</strong></div><button type="button" class="${active?'secondary-btn':'primary-btn'} full-width" data-home-purchase="${home.id}" ${active||!canPay||!!game.raid||!!game.job?'disabled':''}>${active?'Résidence actuelle':game.job?'Au travail':game.raid?'En expédition':!canPay?'Or insuffisant':'Choisir cette résidence'}</button></article>`;
    }).join('');
  }
  function sendMail(from,subject,body,extra={}){
    game.messages=game.messages||[];
    const entry={id:makeId(),from,subject,body,at:stamp(),read:false,...extra};
    game.messages.unshift(entry);
    game.messages=game.messages.slice(0,80);
    if(entry.type!=='contract-copy')sound('mail');
    return entry;
  }
  function contractTerms(g){
    const template=GUILD_TERMS[g.style]||GUILD_TERMS['équilibrée'];
    const custom=GUILD_SPECIAL_TERMS[g.id]||{};
    return {rate:custom.rate??template.rate,failureShare:custom.failureShare??template.failureShare,
      departureFee:template.departureFee,policy:template.policy,durationMinutes:CONTRACT_LENGTH_MINUTES};
  }
  // V13.5 — Une direction négocie en fonction de ses moyens, de son effectif et
  // de la valeur du joueur. Aucun modèle de langage n'est requis : ces chefs
  // prennent de vraies décisions à partir de l'état du monde.
  function guildNegotiationRecord(g){
    game.guildNegotiations=game.guildNegotiations||{};
    return game.guildNegotiations[g.id]||(game.guildNegotiations[g.id]={lastContactAt:-Infinity,nextContactAt:0,refusals:0});
  }
  function isEliteProspect(){
    return game.player.rank==='S'||placement()<=Math.max(3,Math.ceil(allAdventurers().length*.12));
  }
  function chiefRecruitmentInterest(g){
    const members=guildMembers(g);
    const others=members.filter(m=>m.id!=='player');
    const avg=others.length?others.reduce((s,m)=>s+m.power,0)/others.length:1;
    const needsRole=!others.some(m=>m.role===game.player.role);
    const elite=isEliteProspect();
    const exceptional=game.player.power>avg*1.55;
    const useful=game.player.power>avg*1.04||needsRole;
    return {elite,exceptional,useful,needsRole,avg};
  }
  function guildReplacementCandidate(g){
    if(guildCapacity(g)>g.memberIds.length)return null;
    const weaker=guildMembers(g).filter(n=>n.id!=='player'&&!n.isChief)
      .sort((a,b)=>a.power-b.power)[0];
    return weaker && game.player.power>weaker.power+20?weaker:null;
  }
  function guildCanOfferPlace(g){
    return guildCapacity(g)>g.memberIds.length || !!guildReplacementCandidate(g);
  }
  function chiefMoneyFactor(g){
    const reserve=Math.max(100,guildReserve(g));
    const surplus=g.gold-reserve;
    // Négocier est possible à faible trésorerie mais pas à n'importe quel prix.
    if(surplus<=0)return 0;
    if(surplus<reserve*.25)return .30;
    if(surplus<reserve)return .65;
    return 1;
  }
  function chiefMaxOfferRate(g){
    const base=contractTerms(g).rate,interest=chiefRecruitmentInterest(g);
    const rank=getRankIndex(game.player.rank);
    const money=chiefMoneyFactor(g);
    // Le rang, l'utilité pour l'effectif et les réserves conditionnent les enchères.
    const premium=(.014*rank+(interest.elite?.035:0)+(interest.exceptional?.025:0)+
      (interest.needsRole?.014:0)+Math.min(.018,game.player.rep/13000))*money;
    const temperament={prudente:.265,'équilibrée':.295,recruteuse:.305,audacieuse:.335}[g.style]||.28;
    return clamp(Math.round(Math.min(temperament,base+premium)*100)/100,base,MAX_NEGOTIATED_RATE);
  }
  // Valeur perçue par le joueur (utile pour comparer les propositions).
  function offerRiskCost(share){return (1-contractFailureShare({failureShare:share}))*.035;}
  function offerCost(terms){return (terms.rate||0)+offerRiskCost(terms.failureShare);}
  function offerBudget(g){return chiefMaxOfferRate(g)+offerRiskCost(contractTerms(g).failureShare);}
  function worthLeaving(terms,old){
    if(!old)return true;
    return offerCost(terms)>=offerCost(old)+.009;
  }
  // V13.8 — Le chef estime les revenus et les risques REELS de son équipe.
  // Simulation d'une équipe plausible : escouade fixe pour le membre actuel,
  // ou deux membres réels du recrutement ciblé. Jamais de PNJ fictifs.
  function chiefCandidateTeam(g){
    if(g.id===game.player.guildId){
      const mates=getPlayerSquad(g);
      if(mates.length===2)return [{...game.player,id:'player'},...mates];
    }
    const others=guildMembers(g).filter(n=>n.id!=='player'&&Number.isFinite(n.power))
      .sort((a,b)=>b.power-a.power);
    if(others.length<2)return null;
    return [{...game.player,id:'player'},others[0],others[1]];
  }
  function chiefRaidEconomics(g,terms){
    const team=chiefCandidateTeam(g);
    if(!team)return null;
    const minimum=guildRiskThreshold(g);
    let best=null;
    for(const rank of RANKS){
      if(!qualifiedForDungeon(team,rank))continue;
      const chance=guildSuccessChance(rank,team);
      if(chance<minimum)continue;
      const gross=LOOT_BY_RANK[rank],cost=guildLaunchCost(rank);
      const failure=contractFailureShare(terms);
      // Deux coéquipiers PNJ rémunérés à 10 % chacun.
      const expected=chance*gross*(1-.20-terms.rate)-cost+(1-chance)*cost*failure;
      const revenue=chance*gross;
      if(!best||expected>best.expected)best={rank,chance,gross,cost,expected,revenue};
    }
    return best;
  }
  function chiefRiskPremium(g,share){
    // L'exposition au risque dépend du rang accessible et de la probabilité
    // de défaite. Les chefs prudents provisionnent davantage de sécurité.
    const baseline=chiefRaidEconomics(g,contractTerms(g));
    if(!baseline)return offerRiskCost(share);
    const temperament={prudente:1.5,'équilibrée':1.25,recruteuse:1.2,audacieuse:1.05}[g.style]||1.25;
    const risk=(1-baseline.chance)*baseline.cost / Math.max(1,baseline.revenue);
    return (1-contractFailureShare({failureShare:share}))*clamp(risk*temperament+.008,.012,.085);
  }
  function chiefOfferCost(g,terms){return terms.rate+chiefRiskPremium(g,terms.failureShare);}
  function chiefFinanciallyViable(g,terms){
    if(chiefMoneyFactor(g)<=0)return false;
    if(terms.rate>chiefMaxOfferRate(g)+.00001)return false;
    const econ=chiefRaidEconomics(g,terms);
    if(!econ)return false;
    // Un contrat doit laisser un bénéfice attendu significatif, et pas
    // seulement une trésorerie temporairement positive.
    const minMargin={prudente:.19,'équilibrée':.14,recruteuse:.12,audacieuse:.085}[g.style]||.14;
    return econ.expected>=econ.revenue*minMargin &&
      chiefOfferCost(g,terms)<=chiefMaxOfferRate(g)+chiefRiskPremium(g,contractTerms(g).failureShare)+.00001;
  }
  function chiefCompetitivePressure(g,before){
    const competitors=(game.messages||[]).filter(m=>m.type==='guild-offer'&&m.offer?.status==='pending'&&
      m.offer.expiresAt>game.worldMinutes&&m.offer.guildId!==g.id);
    return competitors.some(m=>offerCost(m.offer.terms)>offerCost(before)+.009);
  }
  function chiefConcession(g,before){
    const pressure=chiefCompetitivePressure(g,before),interest=chiefRecruitmentInterest(g);
    const base={prudente:.006,'équilibrée':.009,recruteuse:.012,audacieuse:.014}[g.style]||.009;
    const strategic=interest.exceptional?.005:interest.elite?.003:0;
    return base+strategic+(pressure?.009:0);
  }
  function chiefInitialOffer(g){
    const base=contractTerms(g),old=game.player.contract?.terms;
    const max=chiefMaxOfferRate(g),interest=chiefRecruitmentInterest(g);
    if(!interest.useful&&game.player.guildId)return null;
    // Ne jamais commencer au plafond : conserver une marge de négociation.
    const opening={prudente:.36,'équilibrée':.43,recruteuse:.50,audacieuse:.52}[g.style]||.43;
    let rate=base.rate;
    if(chiefMoneyFactor(g)>0)rate=Math.min(max,Math.max(base.rate,
      Math.round((base.rate+(max-base.rate)*(opening+(interest.exceptional?.06:0)))*100)/100));
    const offer={...base,rate};
    if(old&&!worthLeaving(offer,old)){
      // Le recrutement concurrentiel peut justifier une petite surenchère,
      // mais jamais une offre qui détruit la rentabilité.
      const minimum=Math.ceil((offerCost(old)+.01-offerRiskCost(offer.failureShare))*100)/100;
      offer.rate=Math.max(offer.rate,minimum);
    }
    if(old&&!worthLeaving(offer,old))return null;
    return chiefFinanciallyViable(g,offer)?offer:null;
  }
  function chiefRetentionOffer(g,challenger){
    const active=game.player.contract?.terms;
    if(!active||g.id!==game.player.guildId||chiefMoneyFactor(g)<.3)return null;
    const rival=challenger?.offer?.terms;
    if(!rival||!worthLeaving(rival,active))return null;
    // Le chef ne donne pas gratuitement son plafond : il cherche seulement
    // à rendre le départ moins intéressant, en gardant son risque actuel.
    const needed=Math.ceil((offerCost(rival)+.006-offerRiskCost(active.failureShare))*100)/100;
    const proposed=Math.max(active.rate+.01,needed);
    const candidate={...active,rate:proposed};
    if(!chiefFinanciallyViable(g,candidate)||!worthLeaving(candidate,active))return null;
    return candidate;
  }
  function chiefNegotiate(mailId,ratePercent,requestedFailureShare){
    const m=(game.messages||[]).find(v=>v.id===mailId&&v.type==='guild-offer');
    const o=m?.offer,g=game.guilds.find(v=>v.id===o?.guildId);
    if(!o||!g||g.dissolved||o.status!=='pending'||o.expiresAt<=game.worldMinutes){notify('Offre expirée ou indisponible.');return;}
    if((o.rounds||0)>=NEGOTIATION_LIMIT){notify('Le chef ne souhaite plus négocier cette offre.');return;}
    const rate=Number(ratePercent),failure=Number(requestedFailureShare);
    if(!Number.isFinite(rate)||rate<1||rate>36||![0,.5,1].includes(failure)){
      notify('Choisissez un salaire entre 1 et 36 %, et une responsabilité valide.');return;
    }
    const before={...o.terms};
    const desired={...before,rate:Math.round(rate)/100,failureShare:failure};
    const beforeCost=chiefOfferCost(g,before),desiredCost=chiefOfferCost(g,desired);
    const betterProtection=failure<contractFailureShare(before);
    const premium=chiefRiskPremium(g,failure)-chiefRiskPremium(g,contractFailureShare(before));
    const allowance=chiefConcession(g,before);
    const ceiling=beforeCost+allowance;
    const affordable=chiefFinanciallyViable(g,desired);
    // Une exigence manifestement excessive n'obtient pas une récompense
    // automatique sous forme de petite augmentation. Le chef dit non.
    const unreasonable=desiredCost>beforeCost+.075 ||
      desired.rate>chiefMaxOfferRate(g)+.045;
    o.rounds=(o.rounds||0)+1;
    const record=guildNegotiationRecord(g);
    // Toute réduction de responsabilité DOIT être compensée par un salaire
    // inférieur : 29 % / 50 % ne devient jamais 29 % / 0 % gratuitement.
    const fairRiskTrade=!betterProtection || desired.rate<=before.rate-Math.max(.01,Math.ceil(premium*100)/100-.005);
    const minorChange=desiredCost<=beforeCost+.0001;
    if(affordable && fairRiskTrade && (minorChange||desiredCost<=ceiling+.00001)){
      o.terms=desired;
      o.negotiationResult=`${g.leader} accepte l'échange de concessions : ${pct(desired.rate)} du butin et ${pct(failure)} des frais à rembourser en cas d'échec. Il reste à signer.`;
      m.subject=`Accord négocié — ${g.name}`;
    }else{
      // Le chef peut proposer un COMPROMIS, pas seulement céder.
      // Il conserve une réserve pour les prochains échanges.
      let counter=null;
      if(unreasonable){
        // Refus ferme, sans contre-offre de consolation.
      }else if(betterProtection){
        const riskPrice=Math.max(.01,Math.ceil(premium*100)/100);
        const revisedRate=Math.floor((before.rate-riskPrice+allowance*.35)*100)/100;
        if(revisedRate>=.01&&revisedRate<before.rate){
          const candidate={...before,rate:revisedRate,failureShare:failure};
          if(chiefFinanciallyViable(g,candidate)&&chiefOfferCost(g,candidate)<=ceiling+.00001)counter=candidate;
        }
      }else if(desired.rate>before.rate){
        const increment=Math.max(.01,Math.floor(allowance*100)/100);
        const revisedRate=Math.min(desired.rate,before.rate+increment);
        const candidate={...before,rate:Math.round(revisedRate*100)/100};
        if(chiefFinanciallyViable(g,candidate)&&chiefOfferCost(g,candidate)<=ceiling+.00001)counter=candidate;
      }else if(desired.failureShare>contractFailureShare(before)){
        // Une prise de risque plus élevée du joueur mérite une hausse mesurée.
        const candidate={...before,rate:Math.min(desired.rate+.01,before.rate+Math.max(.01,Math.floor(allowance*100)/100)),failureShare:failure};
        if(chiefFinanciallyViable(g,candidate)&&chiefOfferCost(g,candidate)<=ceiling+.00001)counter=candidate;
      }
      if(counter&&(Math.abs(counter.rate-before.rate)>.00001||counter.failureShare!==before.failureShare)){
        o.terms=counter;
        o.negotiationResult=`${g.leader} refuse vos conditions mais propose un compromis : ${pct(counter.rate)} du butin et ${pct(counter.failureShare)} des frais en cas d'échec. La guilde doit préserver sa rentabilité.`;
        m.subject=`Contre-proposition — ${g.name}`;
      }else{
        o.hardRefusals=(o.hardRefusals||0)+1;
        record.refusals=(record.refusals||0)+1;
        o.negotiationResult=`${g.leader} maintient son offre : vos exigences ne justifient pas ce coût ou dépassent les moyens de la guilde.`;
        if(o.hardRefusals>=2){
          o.status='retiré';
          record.nextContactAt=Math.max(record.nextContactAt||0,game.worldMinutes+GUILD_CONTACT_COOLDOWN);
          o.negotiationResult+=` Après plusieurs demandes incompatibles, la direction retire sa proposition.`;
          m.subject=`Offre retirée — ${g.name}`;
        }
      }
    }
    if(o.rounds>=NEGOTIATION_LIMIT&&o.status==='pending')o.negotiationResult+=' Les négociations sont désormais closes pour cette offre.';
    logEvent('Négociation de contrat',`${g.name} répond à votre demande.`, 'info');
    pendingOfferDrafts.set(mailId,{rate:String(Math.round(o.terms.rate*100)),risk:String(contractFailureShare(o.terms))});
    saveGame();renderMail();renderMailBadge();notify('Le chef a répondu à votre négociation.');
  }
  function pct(v){return Math.round(v*100)+' %';}
  function contractFailureShare(terms){
    // Anciennes offres et contrats signés en V11 restent sans dette d’échec.
    return Number.isFinite(terms?.failureShare)?clamp(terms.failureShare,0,1):0;
  }
  function liabilityExamples(share){
    return Object.entries(GUILD_RAID_DATA).map(([rank,d])=>`${rank} : ${money(Math.round(d.cost*share))}`).join(' · ');
  }
  function liabilityPolicy(terms){
    const share=contractFailureShare(terms);
    return share>0?`Remboursement par l’aventurier de ${pct(share)} des frais de lancement en cas d’échec.`
      :'La guilde assume tous les frais du raid échoué. Aucun remboursement demandé.';
  }
  function reimburseGuild(bill){
    if(bill.type!=='guild-failure'||!bill.creditorGuildId)return;
    const creditor=game.guilds.find(g=>g.id===bill.creditorGuildId);
    if(!creditor)return;
    // Créditer UNE fois le capital remboursé, pas la pénalité administrative.
    creditor.gold+=bill.amount;
    creditor.reimbursements=(creditor.reimbursements||0)+bill.amount;
    addGuildNews(creditor,`Remboursement de ${money(bill.amount)} encaissé après un échec d’expédition.`, 'info');
  }
  function chargeGuildFailure(g,raid){
    const share=contractFailureShare({failureShare:raid.failureShare});
    const price=Number.isFinite(raid.cost)?raid.cost:GUILD_RAID_DATA[raid.rank]?.cost||0;
    const amount=Math.round(price*share);
    if(!g||amount<=0)return 0;
    const bill={id:makeId(),type:'guild-failure',label:`Échec donjon ${raid.rank} — ${g.name}`,
      home:`Créancier : ${g.name}`,creditorGuildId:g.id,amount,penalty:0,
      issuedAt:game.worldMinutes,dueAt:game.worldMinutes+BILL_DUE_MINUTES,paidAt:null,lateNotified:false};
    ensureEconomy(game).bills.unshift(bill);
    // Ne jamais purger une dette non payée, même si le journal dépasse la limite.
    game.economy.bills=game.economy.bills.filter((b,i)=>b.paidAt==null||i<160);
    logEvent('Dette de guilde',`Échec chez ${g.name} : ${money(amount)} à rembourser (${pct(share)} des frais de lancement), échéance ${formatGameDate(bill.dueAt)}.`, 'failure');
    sendMail(g.name,`Facture d’échec — ${raid.rank}`,`Votre contrat prévoit le remboursement de ${pct(share)} des frais de lancement après un échec. Facture : ${money(amount)}. Échéance : ${formatGameDate(bill.dueAt)}. Réglez-la dans Charges et dettes. Une pénalité unique de 10 % s’applique après l’échéance.`);
    addGuildNews(g,`Défaite du donjon ${raid.rank} : remboursement de ${money(amount)} réclamé à ${game.player.name}.`, 'failure');
    notify(`Échec : ${money(amount)} à rembourser à ${g.name} !`);
    return amount;
  }
  function formatContract(g,terms,status='offre',issuedAt=null){
    return `<div class="contract-paper"><div class="contract-head"><span class="contract-seal">${escapeHtml(g.icon)}</span><div><small>DOCUMENT OFFICIEL · ${status==='offre'?'PROPOSITION D’ENGAGEMENT':'CONTRAT EN VIGUEUR'}</small><h3>Contrat de guilde</h3><p>${escapeHtml(g.name)} · Direction de ${escapeHtml(g.leader)}</p></div></div>
      <div class="contract-folio">Réf. ${escapeHtml(g.id.toUpperCase())} · ${escapeHtml(issuedAt||stamp())}</div>
      <div class="contract-articles"><div class="contract-column">
      <div class="contract-section"><b>Article I — Fonction et affectation</b><p>Engagement en qualité d’aventurier ${escapeHtml(game.player.class)} de rang ${escapeHtml(game.player.rank)}. L’aventurier rejoint une escouade permanente constituée par la direction. Le chef choisit et finance les donjons, puis déclenche automatiquement les expéditions en fonction de la puissance des équipes, de leur disponibilité et des ressources de la guilde.</p></div>
      <div class="contract-section"><b>Article II — Rémunération</b><p><strong>${pct(terms.rate)} du butin brut</strong> de chaque expédition de guilde réussie à laquelle vous participez, en or, versé immédiatement à la fin du raid. Aucun salaire sur un raid échoué. Les frais de lancement sont payés par la guilde. Les autres participants conservent leurs propres règles de rémunération.</p></div>
      <div class="contract-section"><b>Article III — Obligations</b><p>${escapeHtml(terms.policy)} L’aventurier participe aux missions décidées par le chef lorsqu'il est disponible. Aucun départ pendant une blessure ou une mission en cours.</p></div>
      </div><div class="contract-column">
      <div class="contract-section"><b>Article IV — Durée et reconduction</b><p>Engagement de 7 jours du monde, renouvelé automatiquement par période identique sauf fin d’affiliation. Les règles de rémunération et de rupture sont définies par les articles du présent contrat.</p></div>
      <div class="contract-section"><b>Article V — Échec et pénalités</b><p><strong>${escapeHtml(liabilityPolicy(terms))}</strong> ${contractFailureShare(terms)>0?`Barème du remboursement par rang : ${escapeHtml(liabilityExamples(contractFailureShare(terms)))}. La guilde avance les frais de lancement ; en cas de défaite, une facture est créée avec un délai de paiement d’un jour du monde. En retard, pénalité unique de 10 % et procédure de recouvrement habituelle (jusqu’à la saisie après 21 jours). Le principal remboursé revient à la guilde.`:'La guilde supporte seule la perte en cas de défaite.'} Frais de démission : <strong>${terms.departureFee??0} or</strong>. Une dette déjà créée reste due après une démission ou un licenciement.</p></div>
      <div class="contract-section"><b>Article VI — Rupture et licenciement</b><p>Démission possible à tout moment hors expédition, sans perte de rang, d’équipement ou de réputation. La direction peut licencier pour effectif inadapté, après une évaluation de carrière, hors raid. Aucune compensation ou amende de rupture.</p></div>
      </div></div>
      <div class="contract-signatures"><div><small>POUR LA GUILDE</small><strong>${escapeHtml(g.leader)}</strong><span>Signature de la direction</span></div><div><small>L’AVENTURIER</small><strong>${escapeHtml(game.player.name)}</strong><span>${status==='offre'?'Signature requise':'Contrat accepté'}</span></div></div></div>`;
  }
  function sendContractOffer(g,reason='Candidature retenue',kind='application',tailoredTerms=null){
    if(!g||g.dissolved||(g.id===game.player.guildId && kind!=='retention'))return null;
    const existing=(game.messages||[]).find(m=>m.type==='guild-offer'&&m.offer?.guildId===g.id&&m.offer.status==='pending'&&m.offer.expiresAt>game.worldMinutes);
    if(existing)return existing;
    const terms=tailoredTerms||chiefInitialOffer(g)||(!game.player.guildId?contractTerms(g):null);
    if(!terms)return null;
    const mail=sendMail(g.name,`${kind==='retention'?'Proposition de revalorisation':'Contrat proposé'} — ${g.name}`,`${reason}. Consultez les clauses et signez si vous acceptez.`,
      {type:'guild-offer',offer:{guildId:g.id,terms,kind,status:'pending',rounds:0,expiresAt:game.worldMinutes+OFFER_LIFETIME_MINUTES}});
    const record=guildNegotiationRecord(g);
    record.lastContactAt=game.worldMinutes;
    record.nextContactAt=Math.max(record.nextContactAt||0,game.worldMinutes+GUILD_CONTACT_COOLDOWN);
    // A new offer must not steal the reader while the player is negotiating another one.
    if(page!=='mail' || !selectedMailId || !game.messages.some(m=>m.id===selectedMailId))selectedMailId=mail.id;
    logEvent('Offre de recrutement',`${g.name} vous propose un contrat à ${pct(terms.rate)} du butin. Consultez votre messagerie.`,'info');
    return mail;
  }
  function invalidateOtherOffers(exceptId){
    for(const mail of game.messages||[])if(mail.type==='guild-offer'&&mail.id!==exceptId&&mail.offer?.status==='pending')mail.offer.status='caduc';
  }
  function acceptContract(mailId){
    const m=(game.messages||[]).find(x=>x.id===mailId&&x.type==='guild-offer');
    if(!m||m.offer?.status!=='pending'){notify('Cette proposition n’est plus disponible.');return;}
    const o=m.offer,g=game.guilds.find(x=>x.id===o.guildId);
    if(!g||g.dissolved||!o.terms){o.status='caduc';renderMail();return;}
    if(o.expiresAt<=game.worldMinutes){o.status='expiré';notify('Cette offre a expiré.');renderMail();saveGame();return;}
    if(game.raid||isInjured()){notify('Terminez votre convalescence ou votre expédition avant de signer.');return;}
    // Une mobilité vers une guilde concurrente est possible, mais jamais au milieu d’un raid.
    const previous=playerGuild();
    if(previous&&previous.id===g.id){
      if(o.kind!=='retention'){o.status='caduc';renderMail();return;}
      // Un avenant remplace les conditions uniquement APRES signature explicite.
      game.player.contract={...game.player.contract,terms:{...o.terms},signedAt:game.worldMinutes,endsAt:game.worldMinutes+CONTRACT_LENGTH_MINUTES};
      o.status='accepté';m.read=true;
      sendMail(g.name,'Avenant signé',`Vos nouvelles conditions chez ${g.name} sont applicables aux prochaines expéditions.`,
        {type:'contract-copy',contract:{guildId:g.id,terms:{...o.terms}}});
      logEvent('Contrat revalorisé',`${g.leader} révise votre rémunération à ${pct(o.terms.rate)}.`, 'success');
      saveGame();renderAll();notify(`Nouveau contrat accepté chez ${g.name} !`);return;
    }
    const room=guildCapacity(g)-g.memberIds.length;
    const replaceable=room<=0?guildReplacementCandidate(g):null;
    if(room<=0&&!replaceable){o.status='caduc';notify('La guilde n’a plus de place disponible.');renderMail();saveGame();return;}
    if(replaceable&&anyRaidUsesNpc(replaceable.id)){
      notify(`La guilde réorganisera ses effectifs après le retour de ${replaceable.name}. Réessayez ensuite.`);return;
    }
    if(replaceable){
      g.memberIds=g.memberIds.filter(id=>id!==replaceable.id);g.fired=(g.fired||0)+1;
      addGuildNews(g,`${replaceable.name} quitte les effectifs pour permettre un recrutement d'élite.`, 'fire');
    }
    if(previous){
      previous.memberIds=previous.memberIds.filter(id=>id!=='player');
      previous.playerTeamIds=[];previous.teamIds=previous.teamIds.filter(id=>id!=='player');reorganizeGuild(previous);
      addGuildNews(previous,`${game.player.name} rejoint une autre guilde après rupture amiable du contrat.`,'fire');
      logEvent('Changement de guilde',`Vous quittez ${previous.name} pour rejoindre ${g.name}.`,'info');
    }
    g.memberIds.push('player');game.player.guildId=g.id;
    game.player.contract={guildId:g.id,terms:{...o.terms},signedAt:game.worldMinutes,endsAt:game.worldMinutes+CONTRACT_LENGTH_MINUTES};
    g.playerTeamIds=[];reorganizeGuild(g);
    m.offer.status='accepté';m.read=true;invalidateOtherOffers(m.id);
    game.associationPreviews={};
    addGuildNews(g,`${game.player.name} signe un contrat (${pct(o.terms.rate)} du butin).`,'hire');
    logEvent('Contrat signé',`Vous avez rejoint ${g.name}. Votre contrat prévoit ${pct(o.terms.rate)} du butin. ${g.leader} vous affectera à une escouade.`,'success');
    sendMail(g.name,'Contrat d’engagement confirmé',`Votre engagement chez ${g.name} a été signé.`,
      {type:'contract-copy',contract:{guildId:g.id,terms:{...o.terms}}});
    sound('guild');saveGame();renderAll();notify(`Contrat signé avec ${g.name} !`);goToPage('guilds');
  }
  function rejectContract(mailId){
    const m=(game.messages||[]).find(x=>x.id===mailId&&x.type==='guild-offer');
    if(!m||m.offer?.status!=='pending')return;
    m.offer.status='refusé';m.read=true;
    const g=game.guilds.find(x=>x.id===m.offer.guildId);
    if(g){const record=guildNegotiationRecord(g);record.refusals=(record.refusals||0)+1;record.nextContactAt=game.worldMinutes+GUILD_CONTACT_COOLDOWN;}
    logEvent('Proposition refusée',`Vous refusez le contrat de ${g?.name||'la guilde'}.`,'info');
    saveGame();renderMail();renderMailBadge();notify('Offre refusée.');
  }
  function leaveGuild(reason='Démission volontaire'){
    const g=playerGuild();if(!g)return false;
    if(game.raid||(g.raids||[]).some(r=>r.memberIds.includes('player'))){notify('Impossible de quitter la guilde pendant une expédition.');return false;}
    if(reason==='Démission volontaire'&&!confirm(`Démissionner de ${g.name} ? Vous redeviendrez indépendant et pourrez rejoindre l’Association. Aucun frais ne sera appliqué.`))return false;
    g.memberIds=g.memberIds.filter(id=>id!=='player');g.playerTeamIds=[];
    g.teamIds=g.teamIds.filter(id=>id!=='player');reorganizeGuild(g);
    game.player.guildId=null;game.player.contract=null;
    game.associationPreviews={};
    addGuildNews(g,`${game.player.name} quitte les effectifs (${reason.toLowerCase()}).`,'fire');
    logEvent(reason,`Fin de votre engagement chez ${g.name}. Vous êtes de nouveau indépendant.`,'info');
    sendMail(g.name,`Fin d’engagement — ${g.name}`,`Motif : ${reason}. Votre affiliation prend fin immédiatement, sans frais. Votre rang, votre or et votre équipement restent inchangés.`);
    saveGame();renderAll();notify('Vous êtes à nouveau indépendant.');return true;
  }
  function squadTitle(g){
    const myRank=getRankIndex(game.player.rank);
    const cohort=guildMembers(g).filter(n=>n.id!=='player');
    const above=cohort.filter(n=>getRankIndex(n.rank)>myRank).length;
    return myRank>=4 && above<=1?'Escouade d’élite':above>=2?'Équipe de renfort':'Escouade principale';
  }
  function getPlayerSquad(g){
    if(!g||!g.memberIds.includes('player'))return [];
    ensureGuildSquads(g);
    const ids=g.playerTeamIds||[];
    return ids.length===2?ids.map(id=>npcById(id)).filter(Boolean):[];
  }
  function careerTick(){
    if(!game)return;
    // Expiration réelle des offres; elles n’engagent jamais le joueur automatiquement.
    for(const m of game.messages||[])if(m.type==='guild-offer'&&m.offer?.status==='pending'&&m.offer.expiresAt<=game.worldMinutes)m.offer.status='expiré';
    const own=playerGuild();
    if(own){
      const c=game.player.contract;
      if(c&&game.worldMinutes>=c.endsAt){
        c.signedAt=c.endsAt;c.endsAt+=CONTRACT_LENGTH_MINUTES;
        sendMail(own.name,'Reconduction du contrat',`Votre contrat chez ${own.name} est reconduit pour sept jours du monde, sans modification des conditions.`,{type:'contract-copy',contract:{guildId:own.id,terms:c.terms}});
        logEvent('Contrat reconduit',`Votre engagement chez ${own.name} est renouvelé.`,'info');
      }
      if(!game.raid && !(own.raids||[]).some(r=>r.memberIds.includes('player'))){
        const others=guildMembers(own).filter(n=>n.id!=='player');
        const stronger=others.filter(n=>n.power>game.player.power*1.20).length;
        const employed=game.worldMinutes-(c?.signedAt||game.worldMinutes);
        const trials=game.player.totalRaids||0;
        // Licenciement possible seulement après une période réelle d’emploi et un déséquilibre d’effectif.
        if(employed>=24*60 && stronger>=3 && (trials>=2||employed>=48*60) && Math.random()<.17){
          leaveGuild('Licenciement pour réorganisation');return;
        }
      }
    }
    const candidates=game.guilds.filter(g=>!g.dissolved&&g.id!==game.player.guildId&&
      guildCanOfferPlace(g) && game.worldMinutes>=guildNegotiationRecord(g).nextContactAt);
    const r=getRankIndex(game.player.rank);
    const attractive=game.player.power >= (25+r*17) && (r>=1||game.player.rep>=15);
    const pending=(game.messages||[]).filter(m=>m.type==='guild-offer'&&m.offer?.status==='pending'&&m.offer.expiresAt>game.worldMinutes);
    if(attractive && candidates.length && pending.length<2){
      const chance=own?Math.min(.27,.025+r*.025):Math.min(.35,.045+r*.04);
      if(Math.random()<chance){
        // La concurrence cherche à recruter les profils utiles, pas une guilde aléatoire.
        const eligible=candidates.filter(g=>g.rep<130||r>=3).filter(g=>chiefRecruitmentInterest(g).useful);
        eligible.sort((a,b)=>chiefMaxOfferRate(b)-chiefMaxOfferRate(a));
        const pool=eligible.slice(0,Math.min(3,eligible.length));
        if(pool.length){
          const g=pool[randomInt(0,pool.length-1)];
          const terms=chiefInitialOffer(g);
          const mail=terms?sendContractOffer(g,own?'Votre carrière attire notre attention : voici une offre tenant compte de vos exploits.':'Nous souhaitons vous recruter à la suite de vos exploits.',own?'débauchage':'invitation',terms):null;
          if(mail){notify(`Nouvelle proposition négociable de ${g.name} !`);renderMailBadge();}
        }
      }
    }
    // Le chef actuel peut tenter de fidéliser son meilleur membre face à une offre concurrente.
    if(own && game.player.contract && !pending.some(m=>m.offer.guildId===own.id)){
      const record=guildNegotiationRecord(own);
      const challengers=pending.filter(m=>m.offer.guildId!==own.id&&worthLeaving(m.offer.terms,game.player.contract.terms));
      if(challengers.length && game.worldMinutes>=record.nextContactAt && Math.random()<.52){
        challengers.sort((a,b)=>offerCost(b.offer.terms)-offerCost(a.offer.terms));
        const terms=chiefRetentionOffer(own,challengers[0]);
        const mail=terms?sendContractOffer(own,`Nous avons appris que d'autres guildes vous courtisent. Nous souhaitons revaloriser votre contrat.`, 'retention',terms):null;
        if(mail){record.nextContactAt=game.worldMinutes+GUILD_CONTACT_COOLDOWN;notify(`${own.leader} vous propose une revalorisation !`);renderMailBadge();}
      }
    }
  }
  let selectedMailId=null;
  const checkedMails=new Set();
  // V13.5.1 — The world keeps running while a player writes a counter-offer.
  // Re-rendering a mail must never erase their values or steal keyboard focus.
  const pendingOfferDrafts=new Map();
  let lastMailListHtml=null;
  let lastMailContentHtml=null;
  function recordCounterOfferDraft(){
    const id=$('mailContent').dataset.mailId;
    const rate=$('offerAskRate'),risk=$('offerAskRisk');
    if(id && id===selectedMailId && rate && risk)
      pendingOfferDrafts.set(id,{rate:rate.value,risk:risk.value});
  }
  function refreshMailContent(html,mailId){
    const reader=$('mailContent');
    // Same content: do not rebuild inputs while another guild finishes a raid.
    if(lastMailContentHtml===html && reader.dataset.mailId===(mailId||''))return;
    const focused=document.activeElement;
    // Do not detach a counter-offer field during a live negotiation.
    // Explicit submission changes focus to the action button and can update.
    if(reader.dataset.mailId===(mailId||'') &&
       (focused?.id==='offerAskRate'||focused?.id==='offerAskRisk') &&
       reader.contains(focused) && reader.querySelector('[data-offer-action="negotiate"]'))return;
    const focusedId=reader.contains(focused)?focused.id:null;
    const selection=focusedId==='offerAskRate' && typeof focused.selectionStart==='number'
      ?{start:focused.selectionStart,end:focused.selectionEnd}:null;
    // Nouveau courrier : toujours commencer la lecture en haut du document.
    // Le maintien du défilement reste indispensable pour le même courrier lors
    // des mises à jour du monde ou d'une négociation.
    const previousScroll=reader.dataset.mailId===(mailId||'')?reader.scrollTop:0;
    reader.innerHTML=html;
    reader.dataset.mailId=mailId||'';
    reader.scrollTop=previousScroll;
    lastMailContentHtml=html;
    if(focusedId){
      const replacement=$(focusedId);
      if(replacement){
        replacement.focus({preventScroll:true});
        if(selection && typeof replacement.setSelectionRange==='function')
          try{replacement.setSelectionRange(selection.start,selection.end);}catch(_e){}
      }
    }
  }
  // V13.12.1 — Le compte à rebours évolue sans remplacer le formulaire.
  // La simulation peut recalculer l'interface toutes les quelques secondes :
  // une simple mise à jour textuelle ne doit jamais effacer le champ actif.
  function updateOfferRemainingTime(){
    if(!game||page!=='mail')return;
    const el=$('offerRemainingTime');
    if(!el)return;
    const mail=game.messages?.find(m=>m.id===selectedMailId);
    const offer=mail?.offer;
    if(!offer||offer.status!=='pending'||offer.expiresAt<=game.worldMinutes){
      // Expiration : reconstruire une seule fois pour retirer les actions.
      renderMail();return;
    }
    const hours=Math.max(1,Math.ceil((offer.expiresAt-game.worldMinutes)/60));
    const label=String(hours);
    if(el.textContent!==label)el.textContent=label;
  }
  function renderMailBadge(){const n=(game?.messages||[]).filter(m=>!m.read).length;$('mailUnread').hidden=!n;$('mailUnread').textContent=n;}
  function mailIsProtected(m){return m?.type==='guild-offer'&&m.offer?.status==='pending'&&m.offer?.expiresAt>game.worldMinutes;}
  function markAllMailRead(){
    if(!game)return;
    for(const m of game.messages||[])m.read=true;
    saveGame();renderMail();renderMailBadge();
  }
  function deleteMessages(ids){
    if(!game)return;
    const existing=new Set(ids);let protectedCount=0,removedCount=0;
    game.messages=game.messages.filter(m=>{
      if(!existing.has(m.id))return true;
      if(mailIsProtected(m)){protectedCount++;return true;}
      removedCount++;return false;
    });
    for(const id of ids)checkedMails.delete(id);
    if(!game.messages.some(m=>m.id===selectedMailId))selectedMailId=null;
    saveGame();renderMail();renderMailBadge();
    notify(protectedCount?`${removedCount} message(s) supprimé(s). ${protectedCount} contrat(s) en attente préservé(s).`:`${removedCount} message(s) supprimé(s).`);
  }
  function renderMail(){
    if(!game)return;
    const mails=game.messages||[],unread=mails.filter(m=>!m.read).length;
    $('mailUnread').hidden=!unread;$('mailUnread').textContent=unread;
    $('mailCount').textContent=`${mails.length} MESSAGE${mails.length===1?'':'S'}`;
    $('mailSelectAll').checked=!!mails.length&&mails.every(m=>checkedMails.has(m.id));
    const listHtml=mails.length?mails.map(m=>`<div class="mail-row"><input type="checkbox" data-mail-select="${escapeHtml(m.id)}" aria-label="Sélectionner ${escapeHtml(m.subject)}" ${checkedMails.has(m.id)?'checked':''}><button class="mail-item ${selectedMailId===m.id?'active':''}" data-mail="${escapeHtml(m.id)}"><small>${escapeHtml(m.from)} · ${escapeHtml(m.at)} ${m.read?'':'· NOUVEAU'}</small><strong>${escapeHtml(m.subject)}</strong><em>${m.type==='guild-offer'?'Contrat à examiner →':'Lire le courrier →'}</em></button></div>`).join(''):'<p class="shop-empty">Boîte de réception vide.</p>';
    if(lastMailListHtml!==listHtml){
      const listScroll=$('mailList').scrollTop;
      $('mailList').innerHTML=listHtml;
      $('mailList').scrollTop=listScroll;
      lastMailListHtml=listHtml;
    }
    const chosen=mails.find(m=>m.id===selectedMailId);
    $('mailToggleRead').disabled=!chosen;
    $('mailDeleteCurrent').disabled=!chosen||mailIsProtected(chosen);
    $('mailToggleRead').textContent=chosen?.read?'Marquer comme non lu':'Marquer comme lu';
    if(!chosen){refreshMailContent('<div class="shop-empty">Choisissez un courrier. Les contrats à signer restent disponibles tant que leur offre est valable.</div>',null);return;}
    let body=`<div class="mail-sender">De : ${escapeHtml(chosen.from)}</div><h3>${escapeHtml(chosen.subject)}</h3><time>${escapeHtml(chosen.at)}</time><p>${escapeHtml(chosen.body)}</p>`;
    if(chosen.type==='guild-offer'&&chosen.offer){
      const g=game.guilds.find(x=>x.id===chosen.offer.guildId);const o=chosen.offer;
      if(g&&o.terms){
        body+=formatContract(g,o.terms,'offre',chosen.at);
        const pending=o.status==='pending'&&o.expiresAt>game.worldMinutes;
        body+=`<div class="contract-status">${pending?'Offre valable encore <span id="offerRemainingTime"></span> h du monde.':`Statut : ${escapeHtml(o.status)}`}</div>`;
        if(o.negotiationResult)body+=`<div class="contract-status">${escapeHtml(o.negotiationResult)}</div>`;
        if(pending){
          const risk=contractFailureShare(o.terms);
          const draft=pendingOfferDrafts.get(chosen.id);
          const askRate=draft?escapeHtml(draft.rate):String(Math.round(o.terms.rate*100));
          const askRisk=draft?Number(draft.risk):risk;
          body+=`<div class="contract-actions"><button type="button" class="primary-btn" data-offer-action="accept" data-id="${escapeHtml(chosen.id)}">✍ ${o.kind==='retention'?'Accepter l’avenant':'Signer et accepter'}</button><button type="button" class="secondary-btn" data-offer-action="reject" data-id="${escapeHtml(chosen.id)}">Refuser le contrat</button></div>`;
          if((o.rounds||0)<NEGOTIATION_LIMIT){
            body+=`<div class="contract-bargaining"><strong>Discuter les conditions avec ${escapeHtml(g.leader)}</strong><p>Vous pouvez demander une part différente et négocier votre responsabilité en cas d’échec. Le chef peut accepter, refuser ou faire une contre-proposition.</p><div class="contract-bargaining-fields"><label>Votre part du butin (%) <input type="number" min="1" max="36" step="1" id="offerAskRate" value="${askRate}"></label><label>Remboursement en cas d’échec <select id="offerAskRisk">${[0,.5,1].map(v=>`<option value="${v}" ${askRisk===v?'selected':''}>${pct(v)} des frais</option>`).join('')}</select></label></div><button type="button" class="secondary-btn" data-offer-action="negotiate" data-id="${escapeHtml(chosen.id)}">Envoyer une contre-proposition (${NEGOTIATION_LIMIT-(o.rounds||0)} essai(s) restant(s))</button></div>`;
          }
        }
      }
    }else if(chosen.type==='contract-copy'&&chosen.contract){
      const g=game.guilds.find(x=>x.id===chosen.contract.guildId);
      if(g)body+=formatContract(g,chosen.contract.terms,'actif',chosen.at);
    }
    refreshMailContent(body,chosen.id);
    updateOfferRemainingTime();
  }
  // V4 — Organisations autonomes : chaque guilde possède ses fonds, ses membres,
  // ses frais et ses missions. Les résultats des PNJ ne rémunèrent jamais le joueur.
  function findGuildByMember(id){return game?.guilds?.find(g=>(g.memberIds||[]).includes(id))||null;}
  function npcById(id){return game?.population?.find(n=>n.id===id)||null;}
  function anyRaidUsesNpc(id){
    return !!(game?.raid?.memberIds?.includes(id)||
      game?.associationNpcRaids?.some(r=>r.memberIds.includes(id))||
      game?.guilds?.some(g=>(g.raids||[]).some(r=>r.memberIds.includes(id))));
  }
  function npcReady(n){return !!(n && !(n.injuryRemainingMs>0) && !anyRaidUsesNpc(n.id));}
  function freeNpcCandidates(){return guildFreeAgents().filter(n=>npcReady(n));}
  function playerGuild(){return game?.guilds?.find(g=>g.id===game.player.guildId)||null;}
  function readyGuildMembers(g){return guildMembers(g).filter(n=>n.id==='player'?!game.raid&&!isInjured():npcReady(n));}
  function clearStaleAssociationPreviews(){
    if(!game)return;
    for(const rank of ASSOCIATION_DUNGEON_RANKS){
      const ids=game.associationPreviews?.[rank];
      const team=[game.player,...(Array.isArray(ids)?ids.map(id=>npcById(id)):[])];
      if(!Array.isArray(ids)||ids.length!==2||ids.some(id=>!freeNpcCandidates().some(n=>n.id===id))||!qualifiedForDungeon(team,rank)){
        delete game.associationPreviews[rank];
      }
    }
  }
  function applyToGuild(id){
    if(!game || game.player.guildId||game.raid||isInjured()){notify('Vous devez être indépendant et disponible pour postuler.');return;}
    const g=game.guilds.find(x=>x.id===id);if(!g||g.dissolved)return;
    game.applications=game.applications||{};
    const previous=game.applications[id];
    if(previous && previous.cooldownUntil>game.worldMinutes){notify('Nouvelle candidature possible après le délai de réponse.');return;}
    const places=guildCapacity(g)-g.memberIds.length;
    const rank=getRankIndex(game.player.rank);
    const roster=guildMembers(g);
    const needsRole=!roster.some(n=>n.role===game.player.role);
    const score=game.player.power-(roster.length?roster.reduce((s,n)=>s+n.power,0)/roster.length:0);
    // Le rang prime : un débutant de rang E a une chance faible même avec un bon équipement.
    const base={E:.035,D:.18,C:.35,B:.55,A:.73,S:.87}[game.player.rank];
    const acceptance=clamp(base+(needsRole?.04:0)+(g.rep<50?.01:-.02)+Math.max(-.07,Math.min(.1,score/550))+
      Math.min(.05,game.player.rep/500)+(places<=0?-.20:.03),.015,game.player.rank==='E'?.095:.94);
    const accepted=(places>0&&Math.random()<acceptance);
    game.applications[id]={last:game.worldMinutes,cooldownUntil:game.worldMinutes+CANDIDACY_COOLDOWN_MINUTES,accepted};
    if(accepted){
      sendContractOffer(g,'Votre candidature a été retenue. Le recrutement prendra effet uniquement après votre signature.','application');
      notify(`Candidature retenue ! Consultez votre contrat dans la messagerie.`);
    }else{
      logEvent('Candidature refusée',`${g.name} n’a pas retenu votre candidature. Vous pourrez présenter une nouvelle demande dans huit heures de jeu.`,'failure');
      sendMail(g.name,'Réponse à votre candidature',`Votre candidature n’a malheureusement pas été retenue par ${g.name}. Vous pourrez en déposer une nouvelle après le délai réglementaire de huit heures du monde.`);
      notify(`${g.name} refuse votre candidature pour le moment.`);
    }
    saveGame();renderAll();
  }
  function guildLevel(g){return clamp(Number(g.level)||1,1,4);}
  function guildCapacity(g){return GUILD_CAP[guildLevel(g)];} // Chef inclus dans les places.
  // V14.1 : la réputation d'une guilde est exclusivement celle de ses membres actuels.
  // Aucun bonus de guilde séparé, aucune division des points entre participants.
  function guildReputation(g){
    if(!game||!g||g.dissolved)return 0;
    return (g.memberIds||[]).reduce((sum,id)=>{
      const member=id==='player'?game.player:npcById(id);
      return sum+(member?Math.max(0,Number(member.rep)||0):0);
    },0);
  }
  function syncGuildReputations(){
    if(!game?.guilds)return;
    for(const guild of game.guilds)guild.rep=guildReputation(guild);
  }
  function guildMembers(g){return (g.memberIds||[]).map(id=>id==='player'?Object.assign({id:'player',isPlayer:true},game.player):npcById(id)).filter(Boolean);}
  function guildFreeAgents(){
    const inGuild=new Set(game.guilds.flatMap(g=>g.memberIds));
    return game.population.filter(n=>!inGuild.has(n.id));
  }
  function addGuildNews(g,message,kind='info'){
    const news={guildId:g.id,guild:g.name,message,kind,at:stamp()};
    g.activity.unshift(news);g.activity=g.activity.slice(0,200);
    game.guildNews.unshift(news);game.guildNews=game.guildNews.slice(0,55);
  }
  function makeGuildChief(g){
    const index=Number(g.id.split('_')[1])-1,classes=['Mage','Guerrier','Gardien','Assassin','Mage','Assassin','Gardien','Soigneur','Mage'];
    const cls=classes[index]||'Guerrier';
    const base=Math.round(CLASSES[cls].base*RANK_MULT.S);
    return {id:`chief_${g.id}`,name:g.leader,class:cls,role:CLASSES[cls].role,rank:'S',
      basePower:base,power:base,inventory:[],equipment:emptyEquipment(),equipmentPurchases:0,
      nextGearDecisionAt:START_WORLD_MINUTES+randomInt(35,NPC_STEP_MINUTES),
      gold:0,rep:Math.max(0,Math.round(g.rep)),xp:0,totalRaids:0,totalInjuries:0,injuryRemainingMs:0,isChief:true};
  }
  function ensureGuildChiefs(world){
    for(const g of world.guilds){
      if(g.dissolved)continue; // Le chef d'une guilde dissoute reste indépendant.
      const id=`chief_${g.id}`;
      if(!world.population.some(n=>n.id===id))world.population.push(makeGuildChief(g));
      g.memberIds=g.memberIds.filter((v,i,a)=>v!==id&&a.indexOf(v)===i);
      g.memberIds.unshift(id);
    }
  }
  function initialGuilds(population){
    const free=[...population];
    const guilds=GUILD_DESIGNS.map((d,i)=>({id:`guild_${i+1}`,name:d[0],leader:d[1],style:d[2],rep:d[3],gold:d[4],icon:d[5],
      memberIds:[],teamIds:[],level:1,raids:[],raid:null,arenaWins:0,arenaReadyAt:0,arenaTeams:[],
      won:0,lost:0,income:0,costs:0,wages:0,hired:0,fired:0,roundRobin:0,
      upgrades:{recruitment:0,recovery:0,expedition:0,negotiation:0},
      bills:[],nextGuildInvoiceAt:START_WORLD_MINUTES+7*1440,insolventSince:null,dissolved:false,
      nextThinkMinute:START_WORLD_MINUTES+randomInt(20,75),activity:[]}));
    // Le chef constitue un membre réel; niveau 1 : 2 PNJ + le chef = 3.
    for(const g of guilds){
      for(let i=0;i<2;i++){
        const capRank=g.rep>=90?'A':g.rep>=45?'B':'C';
        let options=free.filter(n=>getRankIndex(n.rank)<=getRankIndex(capRank));
        if(!options.length)options=free;
        if(!options.length)break;
        const pick=options[randomInt(0,options.length-1)];
        g.memberIds.push(pick.id);free.splice(free.indexOf(pick),1);
      }
    }
    // Le monde finira avec exactement neuf chefs S EN PLUS des 41 PNJ finis.
    for(const g of guilds){const chief=makeGuildChief(g);population.push(chief);g.memberIds.unshift(chief.id);}
    return guilds;
  }
  function guildDoctrine(g){
    return ({prudente:'Protection et soins · privilégie Gardiens et Soigneurs',audacieuse:'Pression offensive · privilégie DPS, Assassins et Mages',équilibrée:'Équilibre · recherche DPS + Gardien + Soigneur',recruteuse:'Polyvalence · développe plusieurs types d’équipes'})[g.style]||'Équipes complémentaires';
  }
  function guildRaidList(g){return g.raids||[];}
  function guildBusyMemberIds(g){return new Set(guildRaidList(g).flatMap(r=>r.memberIds));}
  function guildTeamReady(ids){return ids.length===3 && ids.every(id=>id==='player'?(!game.raid&&!game.job&&!isInjured()):npcReady(npcById(id)));}
  function guildReserve(g){
    const level=guildLevel(g),base=[0,200,600,1200,2200][level],charge=GUILD_ASSOCIATION_CHARGE[level];
    const operating=(GUILD_RAID_DATA[RANKS[Math.min(4,level)]]?.cost||90)*GUILD_TEAM_SLOTS[level];
    return Math.round((base+charge+operating)*(GUILD_RESERVE_MULT[g.style]||1));
  }
  function guildRiskThreshold(g){
    let risk=GUILD_RISK[g.style]||.8;
    if(g.gold<guildReserve(g)*.5)risk=Math.max(risk,.82);
    if(g.gold<0)risk=Math.max(risk,.90);
    if(g.gold<-GUILD_BANK_CREDIT[guildLevel(g)]*.4)risk=Math.max(risk,.94);
    return risk;
  }
  function guildError(g){
    // Très rare défaut de jugement; aucune faillite aléatoire.
    return Math.random()<({prudente:.001,'équilibrée':.003,audacieuse:.012,recruteuse:.005}[g.style]||.003);
  }
  function guildRankFor(g,team){
    if(team.length!==3)return null;
    const threshold=guildRiskThreshold(g);
    // Ne jamais garantir un donjon S pour un chef S isolé.
    return RANKS.filter(rank=>{
      const cost=GUILD_RAID_DATA[rank].cost,chance=guildSuccessChance(rank,team);
      return qualifiedForDungeon(team,rank) && chance>=threshold && g.gold-cost>=Math.max(50,guildReserve(g)*.28);
    }).pop()||null;
  }
  function guildSuccessChance(rank,team){
    const d=GUILD_RAID_DATA[rank];if(!d||team.length!==3)return .1;
    return clamp(.17+(partyPower(team)/(d.need*3*1.6))*.64+partySynergy(team).bonus*.5,.12,.96);
  }
  function guildPayBills(g){
    for(const bill of g.bills||[]){
      // Une ancienne cotisation reglee ne doit pas bloquer les suivantes.
      if(bill.paid)continue;
      // Réserve stratégique en priorité, mais aucune pénalité cumulée.
      if(g.gold>=bill.amount+Math.max(0,guildReserve(g)*.12)){
        g.gold-=bill.amount;g.costs+=bill.amount;bill.paid=true;
        addGuildNews(g,`Cotisation de l'Association réglée : ${money(bill.amount)}.`,'info');
      }
    }
  }
  function guildEconomyTick(g){
    if(g.dissolved)return;
    if(game.worldMinutes>=g.nextGuildInvoiceAt){
      const charge=GUILD_ASSOCIATION_CHARGE[guildLevel(g)];
      if(charge>0){g.bills.push({amount:charge,dueAt:game.worldMinutes+3*1440,paid:false,penalty:false});
        addGuildNews(g,`Facture de l'Association : ${money(charge)}, échéance dans 3 jours.`,'info');}
      g.nextGuildInvoiceAt=game.worldMinutes+7*1440;
    }
    guildPayBills(g);
    for(const b of g.bills){if(!b.paid&&game.worldMinutes>b.dueAt&&!b.penalty){b.amount=Math.ceil(b.amount*1.1);b.penalty=true;}}
    const arrears=g.bills.filter(b=>!b.paid&&game.worldMinutes>b.dueAt);
    const overCredit=g.gold< -GUILD_BANK_CREDIT[guildLevel(g)];
    if(arrears.length||overCredit){
      if(g.insolventSince==null)g.insolventSince=game.worldMinutes;
      const days=(game.worldMinutes-g.insolventSince)/1440;
      if(days>=21){guildDissolve(g,'Créances et trésorerie irrécouvrables');return;}
      if(days>=14&&!g.finalWarning){g.finalWarning=true;addGuildNews(g,'Dernier avertissement financier : dissolution possible.','failure');}
      else if(days>=7&&!g.debtWarning){g.debtWarning=true;addGuildNews(g,'Mise en demeure : la guilde doit assainir sa trésorerie.','failure');}
    }else {g.insolventSince=null;g.finalWarning=false;g.debtWarning=false;}
  }
  function guildDissolve(g,reason){
    if(g.dissolved)return;
    g.dissolved=true;
    // Toute expédition déjà lancée est terminée au préalable; aucune liquidation en plein raid.
    if(g.raids.length){g.pendingDissolution=reason;g.dissolved=false;return;}
    if(game.player.guildId===g.id){
      game.player.guildId=null;game.player.contract=null;game.associationPreviews={};
      sendMail(g.name,`Dissolution de ${g.name}`,`La guilde est dissoute : ${reason}. Votre carrière continue comme indépendant. Vos dettes personnelles ne sont pas annulées.`);
      logEvent('Dissolution de guilde',`${g.name} : vous redevenez indépendant. Vos dettes personnelles subsistent.`,'failure');
    }
    addGuildNews(g,`Dissolution : ${reason}. Les membres redeviennent indépendants.`,'failure');
    g.memberIds=[];g.squads=[];g.reserveIds=[];
  }
  function guildTryUpgrade(g){
    const level=guildLevel(g);if(level>=4)return false;
    const cost=GUILD_UPGRADE_COST[level],need=GUILD_UPGRADE_REP[level];
    const occupancy=Math.max(3,Math.ceil(guildCapacity(g)*.70));
    if(guildReputation(g)<need||g.memberIds.length<occupancy||g.gold-cost<guildReserve(g)*1.2)return false;
    g.gold-=cost;g.costs+=cost;g.level=level+1;
    addGuildNews(g,`${g.leader} achète le niveau ${g.level} pour ${money(cost)}. Capacité : ${guildCapacity(g)} membres, ${GUILD_TEAM_SLOTS[g.level]} escouades et raids simultanés.`,'success');
    return true;
  }
  function guildTryImprovement(g){
    const choices=({prudente:['recovery','expedition','negotiation','recruitment'],audacieuse:['expedition','negotiation','recruitment','recovery'],recruteuse:['recruitment','negotiation','expedition','recovery'],'équilibrée':['expedition','recovery','recruitment','negotiation']})[g.style];
    for(const key of choices){
      const lv=g.upgrades[key]||0,next=GUILD_IMPROVEMENTS[key][lv];
      if(!next||guildLevel(g)<lv+2)continue;
      if(g.gold-next.cost<guildReserve(g)*1.25)continue;
      g.gold-=next.cost;g.costs+=next.cost;g.upgrades[key]=lv+1;
      addGuildNews(g,`Amélioration ${key} niveau ${lv+1} acquise pour ${money(next.cost)}.`,'info');return true;
    }
    return false;
  }
  function chooseApplicant(g){
    const free=freeNpcCandidates();if(guildFreeAgents().length<=6||!free.length)return null;
    const current=guildMembers(g);const weakness=current.filter(n=>!n.isChief&&!n.isPlayer).sort((a,b)=>a.power-b.power)[0];
    const counts={};current.forEach(n=>counts[n.role]=(counts[n.role]||0)+1);
    const styles={prudente:{Gardien:30,Soigneur:35},audacieuse:{Mage:35,Assassin:30,Guerrier:25},recruteuse:{Soigneur:20,Gardien:18,Mage:14},'équilibrée':{Gardien:19,Soigneur:19,Mage:15}};
    const score=n=>n.power+getRankIndex(n.rank)*16+(counts[n.role]?0:26)+(styles[g.style]?.[n.class]||0)+Math.random()*10;
    const candidate=free.sort((a,b)=>score(b)-score(a))[0];
    const fee={E:0,D:35,C:75,B:160,A:340,S:750}[candidate.rank];
    const discount=GUILD_IMPROVEMENTS.negotiation[(g.upgrades.negotiation||0)-1]?.bonus||0;
    const realFee=Math.round(fee*(1-discount));
    if(g.gold-realFee<Math.max(90,guildReserve(g)*.5))return null;
    return {candidate,fee:realFee,weakest:weakness,gain:weakness?candidate.power-weakness.power:0};
  }
  // V14.2 — Concurrence entre guildes : une préférence de carrière stable par PNJ.
  // Ni les traits ni les offres ne créent de nouvelles statistiques de combat.
  const NPC_CAREER_TRAITS=['prudent','cupide','temeraire','fidele','ambitieux','pragmatique'];
  function npcCareerTrait(npc){
    return NPC_CAREER_TRAITS[stableGearHash(npc.id+'-carriere')%NPC_CAREER_TRAITS.length];
  }
  function npcGuildRate(npc,guild){
    return npc.guildContract?.guildId===guild?.id && Number.isFinite(npc.guildContract.rate)
      ?clamp(npc.guildContract.rate,.08,.20):GUILD_WAGE_RATE;
  }
  function npcEmployerScore(npc,guild,rate){
    const trait=npcCareerTrait(npc),style=guild.style;
    const align={
      prudent:{prudente:38,'équilibrée':24,recruteuse:10,audacieuse:-42},
      cupide:{prudente:-8,'équilibrée':0,recruteuse:6,audacieuse:24},
      temeraire:{prudente:-23,'équilibrée':-5,recruteuse:1,audacieuse:42},
      fidele:{prudente:7,'équilibrée':5,recruteuse:5,audacieuse:4},
      ambitieux:{prudente:3,'équilibrée':9,recruteuse:22,audacieuse:18},
      pragmatique:{prudente:12,'équilibrée':18,recruteuse:13,audacieuse:5}
    };
    const salaryWeight=trait==='cupide'?1900:trait==='fidele'?500:trait==='prudent'?650:1100;
    const levelWeight=trait==='ambitieux'?14:trait==='pragmatique'?9:5;
    const stableIncome=Math.min(6,Math.max(-6,(guild.won||0)-(guild.lost||0))/30);
    return (align[trait]?.[style]||0)+rate*salaryWeight+guildLevel(guild)*levelWeight+stableIncome;
  }
  function npcWouldSwitch(npc,from,to,offeredRate){
    const current=npcEmployerScore(npc,from,npcGuildRate(npc,from));
    const proposed=npcEmployerScore(npc,to,offeredRate);
    // La fidélité et l'inertie rendent crédible un refus d'offre légèrement supérieure.
    const resistance=npcCareerTrait(npc)==='fidele'?36:14;
    return proposed-current+randomInt(-8,8)>=resistance;
  }
  function npcPoachBaseRate(g){
    return ({prudente:.105,audacieuse:.125,recruteuse:.115,'équilibrée':.11})[g.style]||.11;
  }
  function npcPoachMaxRate(g){
    return ({prudente:.125,audacieuse:.16,recruteuse:.145,'équilibrée':.135})[g.style]||.13;
  }
  function npcPoachSigningFee(npc){
    return ({E:20,D:45,C:90,B:180,A:360,S:750})[npc.rank]||90;
  }
  function npcPoachFit(g,npc){
    const members=guildMembers(g);
    const hasHealer=members.some(m=>m.role==='Heal'),hasTank=members.some(m=>m.role==='Tank');
    let fit=npc.power+getRankIndex(npc.rank)*12;
    if(g.style==='prudente' && npc.role==='Heal' && !hasHealer)fit+=100;
    if(g.style==='prudente' && npc.role==='Tank' && !hasTank)fit+=65;
    if(g.style==='équilibrée' && npc.role==='Heal' && !hasHealer)fit+=85;
    if(g.style==='équilibrée' && npc.role==='Tank' && !hasTank)fit+=75;
    if(g.style==='recruteuse' && !members.some(m=>m.role===npc.role))fit+=95;
    if(g.style==='audacieuse' && npc.role==='DPS')fit+=65;
    return fit;
  }
  function npcPoachOffer(g){
    if(g.dissolved || g.pendingNpcPoach || game.worldMinutes<(g.nextNpcPoachAt||0))return false;
    g.nextNpcPoachAt=game.worldMinutes+randomInt(420,780);
    if(g.gold<guildReserve(g)*.70)return false;
    const hasRoom=g.memberIds.length<guildCapacity(g);
    const replaceable=hasRoom?null:guildMembers(g).filter(n=>!n.isChief && n.id!=='player' && npcReady(n)).sort((a,b)=>npcPoachFit(g,a)-npcPoachFit(g,b))[0];
    if(!hasRoom && !replaceable)return false;
    const candidates=game.population.filter(n=>{
      const owner=findGuildByMember(n.id);
      return owner && owner.id!==g.id && !owner.dissolved && !n.isChief && npcReady(n) &&
        game.worldMinutes>=(n.lastGuildTransferAt||0)+1440;
    }).filter(n=>g.gold-npcPoachSigningFee(n)>guildReserve(g)*.45)
      .filter(n=>hasRoom || npcPoachFit(g,n)>npcPoachFit(g,replaceable)+35)
      .sort((a,b)=>npcPoachFit(g,b)-npcPoachFit(g,a));
    if(!candidates.length)return false;
    // Même le chef ambitieux ne sollicite pas chaque fois la vedette du classement.
    const candidate=candidates[randomInt(0,Math.min(candidates.length,5)-1)];
    g.pendingNpcPoach={npcId:candidate.id,fromGuildId:findGuildByMember(candidate.id).id,
      offeredRate:npcPoachBaseRate(g),rounds:0,
      dueAt:game.worldMinutes+randomInt(32,85)};
    return true;
  }
  function npcPoachResolve(g){
    const offer=g.pendingNpcPoach;
    if(!offer || game.worldMinutes<offer.dueAt)return false;
    const n=npcById(offer.npcId),old=n&&findGuildByMember(n.id),fee=n&&npcPoachSigningFee(n);
    if(!n||!old||old.id!==offer.fromGuildId||g.dissolved||old.dissolved||!npcReady(n)||
      game.worldMinutes<(n.lastGuildTransferAt||0)+1440 ||
      g.gold-fee<guildReserve(g)*.40){g.pendingNpcPoach=null;return false;}
    const hasRoom=g.memberIds.length<guildCapacity(g);
    const weakest=hasRoom?null:guildMembers(g).filter(m=>!m.isChief&&m.id!=='player'&&npcReady(m))
      .sort((a,b)=>npcPoachFit(g,a)-npcPoachFit(g,b))[0];
    if(!hasRoom && (!weakest||npcPoachFit(g,n)<=npcPoachFit(g,weakest)+35)){
      g.pendingNpcPoach=null;return false;
    }
    if(!npcWouldSwitch(n,old,g,offer.offeredRate)){
      if(offer.rounds<2 && offer.offeredRate+.01<=npcPoachMaxRate(g)+.00001 &&
        g.gold-fee>guildReserve(g)*.65){
        offer.offeredRate=Math.round((offer.offeredRate+.01)*1000)/1000;
        offer.rounds++;
        offer.dueAt=game.worldMinutes+randomInt(28,70);
        return false; // Contre-proposition réelle, évaluée au prochain passage.
      }
      g.pendingNpcPoach=null;return false;
    }
    // Aucun transfert en plein raid ; les unités sont les vrais PNJ persistants.
    old.memberIds=old.memberIds.filter(id=>id!==n.id);
    if(weakest){g.memberIds=g.memberIds.filter(id=>id!==weakest.id);g.fired++;}
    g.memberIds.push(n.id);
    n.guildContract={guildId:g.id,rate:offer.offeredRate};
    n.lastGuildTransferAt=game.worldMinutes;
    g.gold-=fee;g.costs+=fee;g.hired++;
    g.pendingNpcPoach=null;
    // Les escouades en cours ne bougent pas ; seules les vacances futures
    // seront réorganisées, après la fin des raids éventuellement actifs.
    reorganizeGuild(old,'départ d’un membre');
    reorganizeGuild(g,'nouvelle recrue');
    addGuildNews(old,`${n.name} a quitté la guilde pour rejoindre ${g.name}.`,'fire');
    addGuildNews(g,`${n.name} rejoint la guilde après négociation avec ${g.leader}.`,'hire');
    if(weakest){weakest.guildContract=null;addGuildNews(g,`${weakest.name} redevient indépendant pour libérer une place.`,'info');}
    clearStaleAssociationPreviews();
    syncGuildReputations();
    return true;
  }
  function guildRecruit(g){
    if(g.dissolved||(g.raids||[]).length)return false; // Escouades permanentes, jamais réorganisées en plein raid.
    const info=chooseApplicant(g);if(!info)return false;
    const {candidate,fee,weakest,gain}=info;
    if(g.memberIds.length<guildCapacity(g)){
      g.gold-=fee;g.costs+=fee;g.memberIds.push(candidate.id);candidate.guildContract={guildId:g.id,rate:GUILD_WAGE_RATE};g.hired++;reorganizeGuild(g);
      addGuildNews(g,`Recrutement de ${candidate.name}, rang ${candidate.rank} (${money(fee)}).`,'hire');clearStaleAssociationPreviews();return true;
    }
    if(weakest&&gain>=18&&!anyRaidUsesNpc(weakest.id)){
      g.gold-=fee;g.costs+=fee;g.memberIds.splice(g.memberIds.indexOf(weakest.id),1,candidate.id);weakest.guildContract=null;candidate.guildContract={guildId:g.id,rate:GUILD_WAGE_RATE};g.fired++;g.hired++;
      reorganizeGuild(g);addGuildNews(g,`${weakest.name} est remplacé par ${candidate.name} (${candidate.rank}).`,'fire');clearStaleAssociationPreviews();return true;
    }
    return false;
  }
  function guildLaunchRaid(g){
    if(g.dissolved||g.raids.length>=GUILD_TEAM_SLOTS[guildLevel(g)])return false;
    ensureGuildSquads(g);
    const squads=g.squads||[],size=squads.length;if(!size)return false;
    // Round-robin strict: priorité cyclique; les groupes occupés ou blessés sont sautés.
    for(let step=0;step<size;step++){
      const ix=(g.roundRobin+step)%size,ids=squads[ix];
      if(!ids.every(id=>g.memberIds.includes(id))||!guildTeamReady(ids))continue;
      const team=ids.map(id=>id==='player'?{...game.player,id:'player',isPlayer:true}:{...npcById(id)});
      let rank=guildRankFor(g,team);let mistaken=false;
      if(guildError(g)){
        const risky=RANKS.filter(r=>qualifiedForDungeon(team,r)&&g.gold>=GUILD_RAID_DATA[r].cost&&guildSuccessChance(r,team)>=.36);
        const riskier=risky.find(r=>getRankIndex(r)>getRankIndex(rank||'E'));
        if(riskier){rank=riskier;mistaken=true;}
      }
      if(!rank)continue;
      const data=GUILD_RAID_DATA[rank];
      if(g.gold-data.cost< -Math.round(GUILD_BANK_CREDIT[guildLevel(g)]*.45))continue;
      g.gold-=data.cost;g.costs+=data.cost;
      const duration=data.durationMs*(1-(GUILD_IMPROVEMENTS.expedition[(g.upgrades.expedition||0)-1]?.bonus||0));
      const raid={id:makeId(),guildId:g.id,source:'guild',rank,remainingMs:duration,durationMs:duration,memberIds:[...ids],
        members:team,chance:guildSuccessChance(rank,team),teamPower:partyPower(team),synergyData:partySynergy(team),protectionPoints:groupEquipmentProtection(team),cost:data.cost,
        memberRates:Object.fromEntries(team.filter(n=>n.id!=='player').map(n=>[n.id,npcGuildRate(npcById(n.id),g)])),
        economyVersion:132,lootReference:LOOT_BY_RANK[rank],
        payoutRate:GUILD_WAGE_RATE,failureShare:ids.includes('player')?contractFailureShare(game.player.contract?.terms):0,
        playerRate:ids.includes('player')?(game.player.contract?.terms?.rate??GUILD_WAGE_RATE):GUILD_WAGE_RATE};
      g.raids.push(raid);g.roundRobin=(ix+1)%size;
      if(ids.includes('player')){
        game.raid=raid;game.lastResult=null;
        logEvent('Ordre du chef',`${g.leader} vous envoie au donjon ${rank} avec ${team.filter(n=>n.id!=='player').map(n=>n.name).join(' et ')}.`,'raid');
        sound('raid');notify(`${g.leader} vous envoie dans un donjon ${rank} !`);
      }
      addGuildNews(g,`Départ de l'escouade ${ix+1} en donjon ${rank}, frais ${money(data.cost)}${mistaken?' · choix audacieux':''}.`,'raid');
      return true;
    }
    return false;
  }
  function guildFinishRaid(g,raid){
    g.raids=g.raids.filter(r=>r.id!==raid.id);
    const d=GUILD_RAID_DATA[raid.rank],success=Math.random()<raid.chance;
    const gross=success?raidLootValue(raid):0,rep=success?randomInt(...d.rep):0;
    let wages=0,playerWage=0,playerInjured=false;
    for(const id of raid.memberIds){
      const p=id==='player'?game.player:npcById(id);if(!p)continue;
      const rate=id==='player'?raid.playerRate:(raid.memberRates?.[id]??npcGuildRate(p,g));
      const wage=success?Math.round(gross*rate):0;wages+=wage;
      if(id==='player')playerWage=wage;
      p.totalRaids=(p.totalRaids||0)+1;
      if(success){p.gold=(p.gold||0)+wage;p.rep=(p.rep||0)+rep;}
      p.xp=(p.xp||0)+(success?dungeonForGuildXp(raid.rank):Math.round(dungeonForGuildXp(raid.rank)*.45));
      if(id==='player'){
        if(success)p.successRaids++;else p.failedRaids++;
        recordPlayerRankRaid(raid.rank,success);
        // Promotion : retarder la réorganisation jusqu'au retour de toutes les équipes.
        progressRank(p);
      }
      if(Math.random()<injuryChance(raid.rank,success,raid.synergyData,raidProtection(raid))){
        p.totalInjuries=(p.totalInjuries||0)+1;
        p.injuryRemainingMs=id==='player'?raidRecoveryMs():NPC_HOME_RECOVERY_MS*(1-(GUILD_IMPROVEMENTS.recovery[(g.upgrades.recovery||0)-1]?.bonus||0));
        if(id==='player'){p.injuryTotalMs=p.injuryRemainingMs;playerInjured=true;}
      }
    }
    if(success){g.gold+=gross-wages;g.income+=gross;g.wages+=wages;g.won++;}
    else g.lost++;
    syncGuildReputations();
    addGuildNews(g,success?`Victoire donjon ${raid.rank} : +${money(gross)}, salaires ${money(wages)}.`:`Échec donjon ${raid.rank} : frais perdus ${money(raid.cost)}.` ,success?'success':'failure');
    if(raid.memberIds.includes('player')){
      game.raid=null;
      const debt=!success?chargeGuildFailure(g,raid):0;
      const info=success?`Vous recevez ${money(playerWage)} de salaire, ainsi que des points d’expérience et de réputation.`:`Vous ne recevez aucun salaire.${debt?` Conformément à votre contrat, vous devez rembourser ${money(debt)}.`:' Votre contrat ne prévoit aucun remboursement.'}`;
      game.lastResult={success,injured:playerInjured,rank:raid.rank,title:success?'Victoire de votre guilde !':'Défaite en guilde',text:info+(playerInjured?' Blessure au retour.':'')};
      logEvent(success?'Expédition de guilde réussie':'Expédition de guilde échouée',`Votre équipe de ${g.name} ${success?'a réussi':'n’a pas réussi'} le donjon de rang ${raid.rank}. ${info}`,success?'success':'failure');
      sound(success?'victory':'defeat');
      if(playerInjured)sound('injury');
      notify(game.lastResult.title);
    }
    if(g.pendingDissolution&&!g.raids.length){const reason=g.pendingDissolution;g.pendingDissolution=null;guildDissolve(g,reason);}
    if(g.pendingSquadReorg&&!g.raids.length)reorganizeGuild(g);
  }
  function dungeonForGuildXp(rank){return DUNGEONS[rank]?.xp||11;}
  function ensureArenaTeams(g){
    const sig=guildLevel(g)+'|'+g.memberIds.slice().sort().join('|');
    if(g.arenaRosterSignature===sig && Array.isArray(g.arenaTeams))return;
    // Affectations persistantes et distinctes de celles des donjons.
    const pool=guildMembers(g).slice().sort((a,b)=>b.power-a.power);
    g.arenaTeams=[];
    while(pool.length>=3 && g.arenaTeams.length<GUILD_ARENA_SLOTS[guildLevel(g)]){
      const ids=pool.splice(0,3).map(n=>n.id);
      g.arenaTeams.push(ids);
    }
    g.arenaRosterSignature=sig;
  }
  function arenaTeamCandidates(g){
    ensureArenaTeams(g);
    const ready=(g.arenaTeams||[]).map(ids=>ids.map(id=>id==='player'?{...game.player,id:'player',isPlayer:true}:npcById(id)).filter(Boolean))
      .filter(team=>team.length===3 && team.every(n=>n.id==='player'?(!game.raid&&!game.job&&!isInjured()):npcReady(n)));
    return ready.sort((a,b)=>partyPower(b)-partyPower(a))[0]||[];
  }
  function guildArena(g){
    if(g.dissolved||game.worldMinutes<g.arenaReadyAt||Math.random()>(GUILD_ARENA_CHANCE[g.style]||.2))return false;
    const team=arenaTeamCandidates(g);if(team.length!==3)return false;
    const rivals=game.guilds.filter(o=>o.id!==g.id&&!o.dissolved&&game.worldMinutes>=(o.arenaReadyAt||0)&&arenaTeamCandidates(o).length===3);
    if(!rivals.length)return false;
    const opponent=rivals.sort((a,b)=>Math.abs(a.rep-g.rep)-Math.abs(b.rep-g.rep))[0],enemy=arenaTeamCandidates(opponent);
    const ownPower=partyPower(team),otherPower=partyPower(enemy);
    const win=Math.random()<clamp(.5+(ownPower-otherPower)/260,.14,.88);
    const duration=randomInt(40,70)*GAME_MINUTES_PER_REAL_SECOND;
    g.arenaReadyAt=game.worldMinutes+duration;opponent.arenaReadyAt=game.worldMinutes+duration;
    const winner=win?g:opponent;
    winner.gold+=randomInt(90,160);
    winner.arenaWins++;
    for(const [guild,participants,victory] of [[g,team,win],[opponent,enemy,!win]]){
      const personalRep=victory?4:1;
      const personalXp=victory?30:15;
      for(const participant of participants){
        const record=participant.id==='player'?game.player:npcById(participant.id);
        if(!record)continue;
        record.rep=(record.rep||0)+personalRep;
        record.xp=(record.xp||0)+personalXp;
        if(participant.id==='player'){
          progressRank(game.player);
          logEvent('Arène de guilde',`${guild.leader} vous sélectionne contre ${guild.id===g.id?opponent.name:g.name} : ${victory?'victoire':'défaite'} (${personalXp} XP, ${personalRep} réputation).`,'raid');
          sound(victory?'arenaWin':'arenaLose');notify(`Arène : ${victory?'victoire':'défaite'} de ${guild.name}.`);
        }
      }
    }
    syncGuildReputations();
    addGuildNews(g,`Arène contre ${opponent.name} : ${win?'victoire':'défaite'} (${team.map(x=>x.name).join(', ')}).`,win?'success':'failure');
    addGuildNews(opponent,`Arène contre ${g.name} : ${!win?'victoire':'défaite'} (${enemy.map(x=>x.name).join(', ')}).`,!win?'success':'failure');
    return true;
  }
  function guildDecide(g){
    if(g.dissolved)return;
    syncGuildReputations();
    ensureGuildSquads(g);
    guildPayBills(g);
    const paid=guildTryUpgrade(g);
    if(!paid&&Math.random()<.20)guildTryImprovement(g);
    const recruitmentBias=Math.min(.95,({prudente:.30,audacieuse:.22,'équilibrée':.36,recruteuse:.60}[g.style]||.3)+(g.upgrades.recruitment||0)*.12);
    npcPoachResolve(g);
    if(Math.random()<recruitmentBias)guildRecruit(g);
    if(Math.random()<({prudente:.14,audacieuse:.24,recruteuse:.30,'équilibrée':.20}[g.style]||.18))npcPoachOffer(g);
    // On peut financer plusieurs expéditions dans une même décision : équipes 1,2...N.
    let launched=0;
    for(let i=0;i<GUILD_TEAM_SLOTS[guildLevel(g)];i++){if(!guildLaunchRaid(g))break;launched++;}
    if(!launched&&Math.random()<.65)guildRecruit(g);
    if(!launched)guildArena(g);
  }
  function startIndependentNpcRaid(){
    const available=freeNpcCandidates();
    if(available.length<3)return false;
    // Équipe constituée uniquement d'indépendants réels.
    const first=available.splice(randomInt(0,available.length-1),1)[0];
    const second=available.splice(randomInt(0,available.length-1),1)[0];
    const third=available.splice(randomInt(0,available.length-1),1)[0];
    const team=[first,second,third];
    // L'Association peut désormais organiser E/D/C. Au moins un membre du rang requis.
    // Les indépendants choisissent normalement un donjon qu'ils ont une chance de réussir.
    let rank='E';
    if(qualifiedForDungeon(team,'C')&&chanceForParty('C',team)>=.45&&Math.random()<.35)rank='C';
    else if(qualifiedForDungeon(team,'D')&&chanceForParty('D',team)>=.45&&Math.random()<.60)rank='D';
    const dungeon=DUNGEONS[rank];
    game.associationNpcRaids.push({id:makeId(),rank,memberIds:team.map(n=>n.id),lootRotation:randomInt(0,2),chance:chanceForParty(rank,team),
      synergyData:partySynergy(team),protectionPoints:groupEquipmentProtection(team),durationMs:dungeon.durationMs,remainingMs:dungeon.durationMs,economyVersion:132,lootReference:LOOT_BY_RANK[rank]});
    clearStaleAssociationPreviews();
    return true;
  }
  function finishIndependentNpcRaid(raid){
    const dungeon=DUNGEONS[raid.rank];
    const success=Math.random()<raid.chance;
    const legacy=raid.economyVersion!==132;
    const outcome=success&&!legacy?associationRecovery(raid.rank):null;
    const gross=success?(legacy?raidLootValue(raid):outcome.recovered):0;
    const shares=success?(legacy?splitLootThree(gross,raid.lootRotation||0):[outcome.individual,outcome.individual,outcome.individual]):[0,0,0];
    const earnedRep=success?randomInt(...dungeon.rep):0;
    for(const [i,id] of raid.memberIds.entries()){
      const npc=npcById(id);if(!npc)continue;
      npc.totalRaids=(npc.totalRaids||0)+1;
      npc.xp=(npc.xp||0)+(success?dungeon.xp:Math.round(dungeon.xp*.45));
      if(success){npc.gold=(npc.gold||0)+shares[i];npc.rep=(npc.rep||0)+earnedRep;}
      if(Math.random()<injuryChance(raid.rank,success,raidSynergy(raid),raidProtection(raid))){
        npc.injuryRemainingMs=NPC_HOME_RECOVERY_MS;
        npc.totalInjuries=(npc.totalInjuries||0)+1;
      }
    }
    if(Math.random()<.25)logEvent('Activité des indépendants',`${raid.memberIds.map(id=>npcById(id)?.name||'').join(', ')} : ${success?'victoire':'échec'} rang ${raid.rank}.`,'npc');
  }
  function associationNpcSimTick(dt){
    if(!game?.associationNpcRaids)return;
    for(const npc of game.population)if(npc.injuryRemainingMs>0)npc.injuryRemainingMs=Math.max(0,npc.injuryRemainingMs-dt*1000);
    for(const raid of [...game.associationNpcRaids]){
      raid.remainingMs=Math.max(0,raid.remainingMs-dt*1000);
      if(raid.remainingMs<=0){
        finishIndependentNpcRaid(raid);
        game.associationNpcRaids.splice(game.associationNpcRaids.indexOf(raid),1);
      }
    }
    if(game.worldMinutes >= game.nextAssociationNpcDecisionMinute){
      startIndependentNpcRaid();
      game.nextAssociationNpcDecisionMinute=game.worldMinutes+randomInt(...ASSOCIATION_INDEPENDENT_RAID_GAP);
    }
  }
  function guildSimTick(dt){
    if(!game?.guilds)return;
    let changed=false;
    for(const g of game.guilds){
      if(g.dissolved)continue;
      for(const raid of [...g.raids]){
        raid.remainingMs=Math.max(0,raid.remainingMs-dt*1000);
        if(raid.remainingMs<=0){guildFinishRaid(g,raid);changed=true;}
      }
      guildEconomyTick(g);
      if(g.dissolved){changed=true;continue;}
      if(game.worldMinutes>=g.nextThinkMinute){
        guildDecide(g);g.nextThinkMinute=game.worldMinutes+randomInt(38,80);changed=true;
      }
    }
    if(changed)renderAll();
  }
  function renderGuilds(){
    if(!game?.guilds)return;
    const guilds=game.guilds.filter(g=>!g.dissolved);
    const totalMembers=guilds.reduce((sum,g)=>sum+g.memberIds.length,0);
    $('guildCount').textContent=guilds.length;
    $('guildAdventurerCount').textContent=totalMembers;
    $('freeAgentsCount').textContent=guildFreeAgents().length;
    $('guildActiveRaids').textContent=guilds.reduce((n,g)=>n+g.raids.length,0);
    const current=playerGuild();
    // Une candidature se fait directement sur la carte. Le dossier détaillé
    // ne concerne que la guilde à laquelle le joueur appartient réellement.
    $('page-guilds').classList.toggle('guild-independent', !current);
    if(current)selectedGuildId=current.id;
    $('guildPageTag').textContent=current?'MA GUILDE':'ANNUAIRE DES GUILDES';
    $('guildDirectory').hidden=!!current;
    $('guildRaidPanels').hidden=!current;
    $('guildCards').innerHTML=(current?[]:guilds.filter(g=>guildView==='all'||g.style===guildView)).map(g=>`<article class="guild-card ${current&&selectedGuildId===g.id?'selected':''}" data-guild="${g.id}">
      <div class="guild-card-top"><span class="guild-crest">${g.icon}</span><span class="guild-style">${escapeHtml(g.style)}</span></div>
      <strong>${escapeHtml(g.name)}</strong><small>Direction : ${escapeHtml(g.leader)}</small>
      <div class="guild-card-description">${escapeHtml(({prudente:'Guilde prudente, protection et expéditions mesurées.',audacieuse:'Guilde ambitieuse, spécialisée dans les défis risqués.',équilibrée:'Guilde polyvalente privilégiant des équipes complémentaires.',recruteuse:'Guilde en développement, à la recherche de nouveaux talents.'})[g.style]||'Organisation d’aventuriers.')}</div>
      <div class="guild-card-criteria">Critères : rang principal, puissance, réputation et besoins d’équipe · Niveau ${guildLevel(g)}</div>
      <div class="guild-card-terms ${contractFailureShare(contractTerms(g))?'guild-risk':'guild-protected'}"><strong>Gain : ${pct(contractTerms(g).rate)} du butin</strong><span>${contractFailureShare(contractTerms(g))>=1?'En cas d’échec : tous les frais sont à la charge de l’aventurier.':contractFailureShare(contractTerms(g))>0?`En cas d’échec : ${pct(contractFailureShare(contractTerms(g)))} des frais sont à la charge de l’aventurier.`:'En cas d’échec : tous les frais sont à la charge de la guilde.'}</span></div>
      <div class="guild-card-grid"><span><em>Membres</em><b>${g.memberIds.length}/${guildCapacity(g)}</b></span><span><em>Trésorerie</em><b>${g.gold.toLocaleString('fr-FR')} or</b></span></div>
      <div class="guild-card-footer"><span>${game.player.guildId===g.id?'★ VOTRE GUILDE · ':''}${g.raids.length?`⚔ ${g.raids.length} raid(s) en cours`:'● À la guilde'}</span>${current?'<span>Ma guilde</span>':''}</div>
      ${!current?`<button type="button" class="directory-apply" data-apply="${g.id}" ${guildCapacity(g)-g.memberIds.length<=0||game.applications?.[g.id]?.cooldownUntil>game.worldMinutes||!!game.raid||isInjured()?'disabled':''}>Postuler</button>`:''}
    </article>`).join('')||'<div class="guild-empty">Aucune guilde pour ce filtre.</div>';
    const g=current||guilds.find(x=>x.id===selectedGuildId)||guilds[0];if(!g)return;selectedGuildId=g.id;
    if(current)ensureGuildSquads(current);
    const members=guildMembers(g),currentTeam=new Set((g.squads||[]).flat());
    const own=current;
    $('guildFilter').disabled=!!own;
    const career=$('guildCareer');
    if(own){
      const contract=game.player.contract;const assigned=getPlayerSquad(own);
      const stableTeam=assigned.length===2?[{...game.player,id:'player'},...assigned]:[];
      const teamBonus=stableTeam.length===3?partySynergy(stableTeam).label:'En attente d’affectation';
      career.innerHTML=`<div class="guild-v156-career-columns">
        <section class="guild-v156-career-card" aria-label="Carrière dans la guilde">
          <h4>Ma carrière dans la guilde</h4>
          <div class="guild-v156-data-line"><span>Statut</span><strong>Membre actif · ${escapeHtml(squadTitle(own))}</strong></div>
          <div class="guild-v156-data-line"><span>Chef de guilde</span><strong>${escapeHtml(own.leader)}</strong></div>
          <div class="guild-v156-data-line"><span>Doctrine</span><strong>${escapeHtml(guildDoctrine(own))}</strong></div>
          <div class="guild-v156-data-line"><span>Escouade permanente</span><strong>${assigned.length===2?`${escapeHtml(assigned[0].name)} (${assigned[0].rank}) et ${escapeHtml(assigned[1].name)} (${assigned[1].rank})`:'En attente d’affectation'}</strong></div>
          <div class="guild-v156-data-line"><span>Composition</span><strong>${escapeHtml(teamBonus)}${assigned.some(n=>!npcReady(n))?' · Membre indisponible temporairement':''}</strong></div>
          <p class="guild-v156-contract-note">Le chef décide, finance et lance les expéditions. L’escouade reste permanente.</p>
        </section>
        <section class="guild-v156-career-card" aria-label="Conditions du contrat">
          <h4>Conditions de mon contrat</h4>
          <div class="guild-v156-data-line"><span>Part du butin en cas de réussite</span><strong>${pct(contract?.terms?.rate??GUILD_WAGE_RATE)}</strong></div>
          <div class="guild-v156-data-line"><span>Frais en cas d’échec</span><strong>${escapeHtml(liabilityPolicy(contract?.terms))}</strong></div>
          <div class="guild-v156-data-line"><span>Échéance du contrat</span><strong>${contract?escapeHtml(formatGameDate(contract.endsAt)):'Renouvellement automatique'}</strong></div>
          <div class="guild-v156-data-line"><span>Frais de départ</span><strong>${money(Math.max(0,Number(contract?.terms?.departureFee)||0))}</strong></div>
          <div class="career-actions"><button type="button" class="secondary-btn" data-guild-action="resign" ${game.raid?'disabled':''}>Quitter la guilde</button><button type="button" class="secondary-btn" data-guild-action="contract">Voir mon contrat</button></div>
        </section>
      </div>`;
    }else{
      const prev=game.applications?.[g.id];
      const wait=prev?.cooldownUntil>game.worldMinutes;
      const spots=guildCapacity(g)-g.memberIds.length;
      career.innerHTML=`<strong>Postuler chez ${escapeHtml(g.name)}</strong><p>Les chefs privilégient le rang, puis la puissance, la réputation et les besoins de leur effectif. Un débutant E a peu de chances d'être accepté.</p><p><strong>Conditions : ${pct(contractTerms(g).rate)} du butin.</strong> ${escapeHtml(liabilityPolicy(contractTerms(g)))} ${contractFailureShare(contractTerms(g))?escapeHtml(liabilityExamples(contractFailureShare(contractTerms(g)))):''}</p><div class="career-actions"><button type="button" class="primary-btn" data-apply="${g.id}" ${spots<=0||wait||game.raid||isInjured()?'disabled':''}>${spots<=0?'Effectif complet':wait?'Candidature en attente':game.raid?'Raid en cours':isInjured()?'En convalescence':'Envoyer ma candidature →'}</button><span>${spots} place${spots>1?'s':''} libre${spots>1?'s':''}</span></div>`+(wait?`<div class="career-result ${prev.accepted?'career-accepted':'career-rejected'}">${prev.accepted?'Candidature retenue : un contrat attend votre signature dans la messagerie.':'Candidature refusée.'} Délai avant une nouvelle demande : ${Math.ceil((prev.cooldownUntil-game.worldMinutes)/60)} h du monde.</div>`:'');
    }
    $('guildDetailTitle').textContent=g.name;$('guildDetailLeader').innerHTML=`<div><span>Chef</span><strong>${escapeHtml(g.leader)}</strong></div><div><span>Niveau</span><strong>${guildLevel(g)}</strong></div><div><span>Style</span><strong>${escapeHtml(g.style)}</strong></div>`;
    $('guildDetailCrest').textContent=g.icon;
    $('guildDetailGold').textContent=g.gold.toLocaleString('fr-FR')+' or';
    $('guildDetailRep').textContent=g.rep.toLocaleString('fr-FR');
    $('guildDetailCapacity').textContent=`${members.length} / ${guildCapacity(g)}`;
    $('guildDetailRecord').innerHTML=`<span><b>${(g.won||0).toLocaleString('fr-FR')}</b> réussites</span><span><b>${(g.lost||0).toLocaleString('fr-FR')}</b> échecs</span>`;
    $('guildDetailMoney').innerHTML=`<div><span>Niveau / équipes / raids simultanés</span><b>${guildLevel(g)} · ${GUILD_TEAM_SLOTS[guildLevel(g)]} / ${GUILD_TEAM_SLOTS[guildLevel(g)]}</b></div><div><span>Arène · victoires / équipes max.</span><b>${g.arenaWins||0} / ${GUILD_ARENA_SLOTS[guildLevel(g)]}</b></div><div><span>Charges de l'Association / 7 jours</span><b>${money(GUILD_ASSOCIATION_CHARGE[guildLevel(g)])}</b></div><div><span>Prochaine évolution</span><b>${guildLevel(g)<4?money(GUILD_UPGRADE_COST[guildLevel(g)])+' · '+GUILD_UPGRADE_REP[guildLevel(g)]+' réputation':'Niveau maximal'}</b></div><div><span>Récompenses encaissées</span><b>+${g.income.toLocaleString('fr-FR')} or</b></div><div><span>Frais (raids, recrutement, niveaux, cotisations)</span><b>−${g.costs.toLocaleString('fr-FR')} or</b></div><div><span>Salaires versés</span><b>−${g.wages.toLocaleString('fr-FR')} or</b></div><div><span>Remboursements encaissés</span><b>+${(g.reimbursements||0).toLocaleString('fr-FR')} or</b></div>`;
    $('guildCurrentRaid').innerHTML=g.raids.length?g.raids.map(r=>`<div class="guild-squad-card${r.memberIds?.includes('player')?' is-player-squad':''}"><strong>⚔ Donjon ${r.rank} · ${Math.ceil(r.remainingMs/1000)} s</strong><span>${escapeHtml(r.members.map(n=>n.name).join(', '))} · Chance au départ : ${Math.round(r.chance*100)} %</span></div>`).join(''):'<span>Les équipes attendent les ordres de leur chef.</span>';
    const squadCards=(g.squads||[]).map((ids,i)=>{const squad=ids.map(id=>id==='player'?{...game.player,id:'player'}:npcById(id)).filter(Boolean);return `<div class="guild-squad-card${ids.includes('player')?' is-player-squad':''}"><strong>Escouade ${i+1}${ids.includes('player')?' · ★ Votre équipe':''}</strong><small>${escapeHtml(partySynergy(squad).label)}</small><div>${squad.map(n=>`${escapeHtml(n.name)} (${escapeHtml(n.class)}, ${n.rank})`).join(' · ')}</div></div>`;}).join('');
    $('guildSquadRoster').innerHTML=squadCards||'<p class="guild-empty">Aucune escouade constituée.</p>';
    $('guildRoster').innerHTML=members.map(n=>`<div class="guild-member ${n.id==='player'?'is-player':''}" data-profile-id="${escapeHtml(n.id||'player')}" role="button" tabindex="0" aria-label="Voir la fiche de ${escapeHtml(n.name)}" title="${escapeHtml(n.id==='player'?'Votre équipement':npcGearDescription(n))}">${portraitImg(n,'guild-portrait')}<div><strong>${escapeHtml(n.name)}${n.id==='player'?' (vous)':''}</strong><small>${escapeHtml(n.class)} · ⚡ ${n.power} ${currentTeam.has(n.id)?'· Escouade fixe':'· Réserve'} ${n.id!=='player'?'· '+escapeHtml(npcGearSummary(n)):''} ${n.injuryRemainingMs>0?'· Blessé':''}</small></div>${rankMarkup(n.rank)}</div>`).join('')||'<p class="guild-empty">Aucun membre actuellement.</p>';
    // V14.3.2 — Actualités exhaustives parmi les 200 dernières entrées conservées
    // par chaque guilde. Les catégories s'appuient sur le type d'événement enregistré
    // et, si nécessaire, sur le message (les anciennes sauvegardes restent compatibles).
    const digest=Array.isArray(g.activity)?g.activity:[];
    // V15.12 : un départ reste un départ, y compris quand l'ancien journal
    // l'a enregistré avec le type générique 'info' et écrit « a quitté ».
    // Une seule règle alimente la couleur/titre ET le filtre Membres.
    function guildMembershipEventType(entry){
      const msg=String(entry?.message||'');
      const type=String(entry?.kind||'info');
      if(type==='fire'||/quitt[ée]|d[ée]mission|renvoi|licenci|remplac[ée]|redevient ind[ée]pendant|rejoint une autre guilde/i.test(msg))return 'departure';
      if(type==='hire'||/recrut|rejoint la guilde|signe un contrat/i.test(msg))return 'hire';
      return null;
    }
    function guildEventAppearance(entry){
      const msg=String(entry?.message||'');
      const type=String(entry?.kind||'info');
      const arena=/ar[èe]ne/i.test(msg);
      if(arena){
        const success=/victoire/i.test(msg);
        return success?{kind:'arena',icon:'★',title:'VICTOIRE EN ARÈNE'}:{kind:'failure',icon:'✕',title:'DÉFAITE EN ARÈNE'};
      }
      if(/dissolution|mise en demeure|dernier avertissement|facture de l'association|dette|insolvab/i.test(msg))
        return {kind:'warning',icon:'!',title:'ALERTE DE GUILDE'};
      if(/niveau \d|am[ée]lioration .*acquise/i.test(msg))
        return {kind:'upgrade',icon:'⬆',title:'AMÉLIORATION'};
      if(/cotisation|remboursement de|salaires|frais/i.test(msg)&&type==='info')
        return {kind:'finance',icon:'◆',title:'FINANCES'};
      if(type==='raid'||/^d[ée]part|part au donjon/i.test(msg))
        return {kind:'depart',icon:'➜',title:'DÉPART EN DONJON'};
      const membership=guildMembershipEventType(entry);
      if(membership==='hire')return {kind:'hire',icon:'+',title:'RECRUTEMENT'};
      if(membership==='departure')return {kind:'departure',icon:'↗',title:'DÉPART D’UN MEMBRE'};
      if(type==='success'||/^victoire donjon/i.test(msg))
        return {kind:'success',icon:'✓',title:'EXPÉDITION RÉUSSIE'};
      if(type==='failure'||/[ée]chec|d[ée]faite/i.test(msg))
        return {kind:'failure',icon:'✕',title:'EXPÉDITION ÉCHOUÉE'};
      return {kind:'info',icon:'•',title:'ACTUALITÉ DE GUILDE'};
    }
    function memberNews(line){
      const msg=String(line?.message||'');
      let m=msg.match(/^Victoire donjon ([EDCBAS])\s*:\s*(.*)$/i);
      if(m)return `Une équipe a réussi un donjon de rang ${m[1]}. ${m[2].trim()}`;
      m=msg.match(/^Échec donjon ([EDCBAS])\s*:\s*(.*)$/i);
      if(m)return `Une équipe a échoué dans un donjon de rang ${m[1]}. ${m[2].trim()}`;
      m=msg.match(/^D[ée]part de l'escouade (\d+) en donjon ([EDCBAS])\s*,?\s*(.*)$/i);
      if(m)return `L'escouade ${m[1]} est partie dans un donjon de rang ${m[2]}.${m[3]?` ${m[3].trim()}`:''}`;
      m=msg.match(/^Recrutement de (.+?), rang ([EDCBAS])\s*(.*)$/i);
      if(m)return `${m[1]} (rang ${m[2]}) a rejoint la guilde.${m[3]?` ${m[3].trim()}`:''}`;
      return msg;
    }
    const activity=$('guildActivity');
    // renderAll() actualise la page périodiquement : préserver la position de
    // lecture au lieu de ramener la liste en haut toutes les quelques secondes.
    const guildScrollArea=$('guildV156Body');
    const previousScroll=guildScrollArea.scrollTop;
    function activityCategory(n){
      const msg=String(n?.message||'');const kind=String(n?.kind||'');
      if(/ar[èe]ne/i.test(msg)||kind==='arena')return 'arena';
      if(guildMembershipEventType(n))return 'members';
      if(kind==='raid'||kind==='success'||kind==='failure'||/donjon|exp[ée]dition|escouade .*part/i.test(msg))return 'expeditions';
      if(/cotisation|association|dette|paiement|rembours|charges?|p[ée]nalit[ée]|cr[ée]ancier|insolvab|mise en demeure|tr[ée]sorerie|salaires|frais de recrutement/i.test(msg))return 'finances';
      return 'other';
    }
    const visibleDigest=guildActivityFilter==='all'?digest:digest.filter(n=>activityCategory(n)===guildActivityFilter);
    activity.innerHTML=visibleDigest.length?visibleDigest.map(n=>{
      const appearance=guildEventAppearance(n);
      return `<article class="guild-activity-row guild-activity-${appearance.kind}">
        <span class="guild-activity-icon" aria-hidden="true">${appearance.icon}</span>
        <div class="guild-activity-copy"><strong class="guild-activity-kind">${appearance.title}</strong><p>${escapeHtml(memberNews(n))}</p></div>
        <time class="guild-activity-time">${escapeHtml(n.at||'')}</time>
      </article>`;
    }).join(''):'<p class="guild-empty guild-v156-empty">Aucun événement pour cette catégorie.</p>';
    guildScrollArea.scrollTop=previousScroll;
    const activityCount=$('guildActivityCount');
    if(activityCount)activityCount.textContent=`${visibleDigest.length} affichés · ${digest.length}/200 conservés`;
    $('guildWorldFeed').innerHTML=game.guildNews.length?game.guildNews.slice(0,14).map(n=>`<div class="guild-news-line"><small>${escapeHtml(n.at)}</small><p><b>${escapeHtml(n.guild)}</b> — ${escapeHtml(n.message)}</p></div>`).join(''):'<p class="guild-empty">Les guildes commencent à s’organiser. Laissez passer quelques instants.</p>';
  }

  // Nettoyage des anciens libellés dans les historiques importés.
  // Les noms choisis par le joueur et les noms propres ne sont pas modifiés.
  function updateArchivedText(text){
    if(typeof text!=='string')return text;
    return text.replace(new RegExp('\\b(' + 'chas' + 'seurs|' + 'chas' + 'seur)\\b','gi'), match => {
      if(match===match.toUpperCase())return match.endsWith('S')?'AVENTURIERS':'AVENTURIER';
      if(match[0]===match[0].toUpperCase())return match.toLowerCase().endsWith('s')?'Aventuriers':'Aventurier';
      return match.endsWith('s')?'aventuriers':'aventurier';
    }).replace(/du aventurier/g,"de l'aventurier").replace(/le aventurier/g,"l'aventurier");
  }
  function updateArchivedEvents(data){
    if(!data||typeof data!=='object')return data;
    for(const ev of data.events||[]){
      ev.title=updateArchivedText(ev.title);
      ev.detail=updateArchivedText(ev.detail);
    }
    if(data.lastResult){
      data.lastResult.title=updateArchivedText(data.lastResult.title);
      data.lastResult.text=updateArchivedText(data.lastResult.text);
    }
    for(const news of data.guildNews||[])news.message=updateArchivedText(news.message);
    for(const guild of data.guilds||[]){
      for(const news of guild.activity||[])news.message=updateArchivedText(news.message);
    }
    return data;
  }

  function validSave(save) {
    return save && save.version === SAVE_VERSION && save.player && typeof save.player.name === 'string' &&
      CLASSES[save.player.class] && Number.isFinite(save.player.gold) && Number.isFinite(save.worldMinutes) &&
      Array.isArray(save.events) && (save.raid === null || (save.raid && Number.isFinite(save.raid.remainingMs))) &&
      (!save.player.injuryRemainingMs || (Number.isFinite(save.player.injuryRemainingMs) && save.player.injuryRemainingMs>=0));
  }
  // Each universe is a complete, independent save stored under its own key.
  // We never modify/delete the legacy V1 key. A V1 game is loaded as-is.
  const slotKey = id => SAVE_PREFIX + id;
  // Garder une trace indépendante de la version : sinon la migration réimporte au
  // prochain chargement une partie volontairement supprimée depuis la V1-V6.
  const DELETED_SAVE_PREFIX = 'chronicles_v1513_deleted_world_';
  const deletedSlotKey = id => DELETED_SAVE_PREFIX + id;
  const wasDeleted = id => deletedCache.has(id) || localStorage.getItem(deletedSlotKey(id)) !== null ||
    localStorage.getItem('chroniques_aventurier_deleted_world_'+id) !== null;
  function makeId() {
    if(window.crypto && typeof window.crypto.randomUUID === 'function') return window.crypto.randomUUID();
    return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;
  }
  // V14.2.1 — Stockage durable : IndexedDB évite la limite de capacité de
  // localStorage (atteinte lorsque de nombreuses versions ont copié les parties).
  // Les originaux V14.2 et antérieurs ne sont jamais modifiés, ni supprimés.
  const DB_NAME = 'chronicles_v1513_sauvegardes';
  let saveDb=null, saveCache=new Map(), deletedCache=new Set();
  let storageInitialized=false, saveQueue=Promise.resolve(true), saveWriteError=false;
  const storageFailText='Échec de sauvegarde : aucun changement ne sera conservé tant que le stockage est indisponible. Exportez vos anciennes parties depuis leur version d’origine.';
  function storageReady(){return storageInitialized && !saveWriteError;}
  function storageFailure(error){
    saveWriteError=true;
    console.error('Sauvegarde non persistée',error);
    const el=$('storageWarning');
    if(el){el.hidden=false;el.textContent=storageFailText;}
    notify('⚠ Sauvegarde impossible : vérifiez le stockage de votre navigateur.');
  }
  function openSaveDatabase(){
    return new Promise((resolve,reject)=>{
      if(!('indexedDB' in window))return reject(Error('IndexedDB indisponible'));
      let req;
      try{req=indexedDB.open(DB_NAME,1);}catch(error){return reject(error);}
      req.onupgradeneeded=()=>{
        const db=req.result;
        if(!db.objectStoreNames.contains('slots'))db.createObjectStore('slots',{keyPath:'id'});
        if(!db.objectStoreNames.contains('deleted'))db.createObjectStore('deleted',{keyPath:'id'});
      };
      req.onsuccess=()=>resolve(req.result);
      req.onerror=()=>reject(req.error||Error('Impossible d’ouvrir la base de sauvegardes'));
      req.onblocked=()=>reject(Error('Base de sauvegardes bloquée par une autre fenêtre'));
    });
  }
  function dbGetAll(store){
    return new Promise((resolve,reject)=>{
      const req=saveDb.transaction(store,'readonly').objectStore(store).getAll();
      req.onsuccess=()=>resolve(req.result||[]);
      req.onerror=()=>reject(req.error||Error('Lecture impossible'));
    });
  }
  function dbWriteSlot(slot){
    return new Promise((resolve,reject)=>{
      let tx;
      try{tx=saveDb.transaction('slots','readwrite');tx.objectStore('slots').put(slot);}
      catch(error){reject(error);return;}
      tx.oncomplete=()=>resolve(true);
      tx.onerror=()=>reject(tx.error||Error('Écriture interrompue'));
      tx.onabort=()=>reject(tx.error||Error('Écriture annulée'));
    });
  }
  function dbRemoveSlot(id){
    return new Promise((resolve,reject)=>{
      let tx;
      try{
        tx=saveDb.transaction(['slots','deleted'],'readwrite');
        tx.objectStore('deleted').put({id,at:new Date().toISOString()});
        tx.objectStore('slots').delete(id);
      }catch(error){reject(error);return;}
      tx.oncomplete=()=>resolve(true);
      tx.onerror=()=>reject(tx.error||Error('Suppression interrompue'));
      tx.onabort=()=>reject(tx.error||Error('Suppression annulée'));
    });
  }
  function readLocalCurrentSlots(){
    try{
      for(let i=0;i<localStorage.length;i++){
        const key=localStorage.key(i);
        if(!key||!key.startsWith(SAVE_PREFIX))continue;
        const slot=JSON.parse(localStorage.getItem(key));
        if(validSlot(slot)&&slotKey(slot.id)===key)saveCache.set(slot.id,slot);
      }
    }catch(error){console.warn('Ancienne sauvegarde V14.2.1 locale illisible',error);}
  }
  function persistSlot(slot){
    if(!validSlot(slot)){storageFailure(Error('Sauvegarde invalide'));return false;}
    // Figée au moment de l’appel : le monde continue à évoluer pendant la transaction.
    const frozen=JSON.parse(JSON.stringify(slot));
    saveCache.set(frozen.id,frozen);
    const write=async()=>{
      if(saveDb)return dbWriteSlot(frozen);
      // Secours uniquement si le navigateur refuse IndexedDB.
      localStorage.setItem(slotKey(frozen.id),JSON.stringify(frozen));
      return true;
    };
    const current=saveQueue.catch(()=>false).then(write).then(()=>{
      saveWriteError=false;
      const warning=$('storageWarning');if(warning)warning.hidden=true;
      return true;
    },error=>{
      storageFailure(error);return false;
    });
    saveQueue=current;
    return true;
  }
  async function persistSlotDurably(slot){
    if(!persistSlot(slot))return false;
    const ok=await saveQueue;
    if(!ok){saveCache.delete(slot.id);return false;}
    return true;
  }
  async function deleteSlotDurably(id){
    await saveQueue; // Aucune écriture en attente ne peut ressusciter le slot.
    if(saveDb)await dbRemoveSlot(id);
    else {
      localStorage.setItem(deletedSlotKey(id),new Date().toISOString());
      localStorage.removeItem(slotKey(id));
    }
    saveCache.delete(id);deletedCache.add(id);
    return true;
  }
  function makeSlot(data,label) {
    const now=new Date().toISOString();
    return {format:'chroniques-world-v11',id:makeId(),label:String(label||'Nouvelle partie').trim().slice(0,36),createdAt:now,updatedAt:now,data};
  }
  function validSlot(slot) {
    return slot && slot.format==='chroniques-world-v11' &&
      typeof slot.id==='string' && /^[\w-]{6,100}$/.test(slot.id) &&
      typeof slot.label==='string' && validSave(slot.data);
  }
  function listSlots(){
    return [...saveCache.values()].filter(slot=>validSlot(slot))
      .sort((a,b)=>String(b.updatedAt).localeCompare(String(a.updatedAt)));
  }
  // Une ancienne partie représente un MONDE évolué, pas une simple graine.
  // Le préfixe n'indique pas la fraîcheur des données : le joueur a pu continuer
  // à jouer dans une ancienne édition après en avoir essayé une plus récente.
  const IMPORTABLE_SAVE_PREFIXES=Object.freeze([
    V1512_SAVE_PREFIX,V1511_SAVE_PREFIX,V1510_SAVE_PREFIX,V159_SAVE_PREFIX,V158_SAVE_PREFIX,V157_SAVE_PREFIX,V156_SAVE_PREFIX,V154_SAVE_PREFIX,V142_SAVE_PREFIX,V1413_SAVE_PREFIX,V141_SAVE_PREFIX,V14_SAVE_PREFIX,
    V13127_SAVE_PREFIX,V13126_SAVE_PREFIX,V13125_SAVE_PREFIX,V13124_SAVE_PREFIX,
    V13123_SAVE_PREFIX,V13122_SAVE_PREFIX,V13121_SAVE_PREFIX,V1312_SAVE_PREFIX,
    V1311_SAVE_PREFIX,V1310_SAVE_PREFIX,V139_SAVE_PREFIX,V138_SAVE_PREFIX,
    V137_SAVE_PREFIX,V1351_SAVE_PREFIX,V135_SAVE_PREFIX,V134_SAVE_PREFIX,
    V1331_SAVE_PREFIX,V133_SAVE_PREFIX,V132_SAVE_PREFIX,V131_SAVE_PREFIX,
    V13_SAVE_PREFIX,V121_SAVE_PREFIX,V12_SAVE_PREFIX,V113_SAVE_PREFIX,
    V111_SAVE_PREFIX,V11_SAVE_PREFIX,V10_SAVE_PREFIX,V9_SAVE_PREFIX,
    V8_SAVE_PREFIX,V7_SAVE_PREFIX,V6_SAVE_PREFIX,V52_SAVE_PREFIX,
    V51_SAVE_PREFIX,V5_SAVE_PREFIX,V41_SAVE_PREFIX,PREVIOUS_SAVE_PREFIX
  ]);
  function migrationFreshness(slot){
    const w=Number(slot?.data?.worldMinutes);
    const minutes=Number.isFinite(w)?w:0;
    const updated=Date.parse(slot?.updatedAt||'')||0;
    // Le temps simulé ne repart normalement jamais en arrière. En cas de
    // doublons d'un même monde, conserver l'état le plus avancé évite de
    // récupérer une partie au jour 1 à la place d'une carrière avancée.
    return {minutes,updated};
  }
  async function readPreviousIndexedDbSlots(dbName='chronicles_v1421_sauvegardes'){
    if(!('indexedDB' in window))return {slots:[],deleted:[]};
    return new Promise(resolve=>{
      const empty={slots:[],deleted:[]};
      let req;
      try{req=indexedDB.open(dbName);}catch(error){resolve(empty);return;}
      req.onerror=()=>resolve(empty);
      req.onblocked=()=>resolve(empty);
      req.onsuccess=()=>{
        const db=req.result;
        if(!db.objectStoreNames.contains('slots')){db.close();resolve(empty);return;}
        let tx;
        try{
          const stores=db.objectStoreNames.contains('deleted')?['slots','deleted']:['slots'];
          tx=db.transaction(stores,'readonly');
        }catch(error){db.close();resolve(empty);return;}
        const slots=tx.objectStore('slots').getAll();
        const deleted=db.objectStoreNames.contains('deleted')?tx.objectStore('deleted').getAll():null;
        tx.oncomplete=()=>{db.close();resolve({slots:slots.result||[],deleted:deleted?.result||[]});};
        tx.onerror=()=>{db.close();resolve(empty);};
        tx.onabort=()=>{db.close();resolve(empty);};
      };
    });
  }
  async function migratePreviousSaveSlots(){
    try{
      const keys=Array.from({length:localStorage.length},(_,i)=>localStorage.key(i))
        .filter(key=>key&&IMPORTABLE_SAVE_PREFIXES.some(prefix=>key.startsWith(prefix)));
      const selected=new Map();
      // V15.13 ne modifie aucune ancienne base : les mondes sont copiés, jamais déplacés.
      const archives=[
        ['chronicles_v1512_sauvegardes',await readPreviousIndexedDbSlots('chronicles_v1512_sauvegardes')],
        ['chronicles_v1511_sauvegardes',await readPreviousIndexedDbSlots('chronicles_v1511_sauvegardes')],
        ['chronicles_v1510_sauvegardes',await readPreviousIndexedDbSlots('chronicles_v1510_sauvegardes')],
        ['chronicles_v159_sauvegardes',await readPreviousIndexedDbSlots('chronicles_v159_sauvegardes')],
        ['chronicles_v158_sauvegardes',await readPreviousIndexedDbSlots('chronicles_v158_sauvegardes')],
        ['chronicles_v157_sauvegardes',await readPreviousIndexedDbSlots('chronicles_v157_sauvegardes')],
        ['chronicles_v156_sauvegardes',await readPreviousIndexedDbSlots('chronicles_v156_sauvegardes')],
        ['chronicles_v1421_sauvegardes',await readPreviousIndexedDbSlots('chronicles_v1421_sauvegardes')],
        ['chronicles_v1422_sauvegardes',await readPreviousIndexedDbSlots('chronicles_v1422_sauvegardes')]
      ];
      for(const [,db] of archives)for(const record of db.deleted)if(record?.id)deletedCache.add(record.id);
      for(const [sourceKey,db] of archives){
        for(const original of db.slots){
          if(!validSlot(original)||wasDeleted(original.id)||saveCache.has(original.id))continue;
          const prev=selected.get(original.id),fresh=migrationFreshness(original);
          const previous=prev?migrationFreshness(prev.slot):null;
          if(!prev||fresh.minutes>previous.minutes||(fresh.minutes===previous.minutes&&fresh.updated>previous.updated))
            selected.set(original.id,{slot:original,sourceKey});
        }
      }
      for(const key of keys){
        try{
          const original=JSON.parse(localStorage.getItem(key));
          if(!validSlot(original)||!IMPORTABLE_SAVE_PREFIXES.some(prefix=>key===prefix+original.id))continue;
          if(wasDeleted(original.id)||saveCache.has(original.id))continue;
          const prev=selected.get(original.id);
          const currentFresh=migrationFreshness(original);
          const prevFresh=prev?migrationFreshness(prev.slot):null;
          if(!prev||currentFresh.minutes>prevFresh.minutes||
             (currentFresh.minutes===prevFresh.minutes&&currentFresh.updated>prevFresh.updated))
            selected.set(original.id,{slot:original,sourceKey:key});
        }catch(error){console.warn('Sauvegarde historique ignorée :',key,error);}
      }
      for(const {slot:original,sourceKey} of selected.values()){
        const copy={...original,
          data:updateArchivedEvents(JSON.parse(JSON.stringify(original.data))),
          importedFrom:sourceKey,importedAt:new Date().toISOString()};
        if(!await persistSlotDurably(copy))break;
      }
    }catch(error){console.warn('Migration automatique non disponible',error);}
  }
  async function initializeSaveStorage(){
    try{
      saveDb=await openSaveDatabase();
      for(const slot of await dbGetAll('slots'))if(validSlot(slot))saveCache.set(slot.id,slot);
      for(const entry of await dbGetAll('deleted'))if(entry?.id)deletedCache.add(entry.id);
    }catch(error){
      console.warn('IndexedDB inaccessible ; tentative de stockage local',error);
      saveDb=null;
      readLocalCurrentSlots();
      try{
        const k='__chronicles_storage_check__';
        localStorage.setItem(k,'1');localStorage.removeItem(k);
      }catch(storageError){storageFailure(storageError);}
    }
    storageInitialized=true;
    await migratePreviousSaveSlots();
    await importLegacyIfPresent();
    renderSaveList();
    requestAnimationFrame(tick);
  }
  function saveGame(showToast=false) {
    if(!game||!activeSlot)return true;
    syncGuildReputations();
    const slot={...activeSlot,updatedAt:new Date().toISOString(),data:game};
    if(!persistSlot(slot))return false;
    activeSlot=slot;
    if(showToast)saveQueue.then(ok=>{if(ok)notify('Partie sauvegardée.');});
    return true;
  }
  async function importLegacyIfPresent(){
    // Une ancienne « graine V1 » ne doit pas remplacer une carrière déjà évoluée.
    if(saveCache.size)return;
    try{
      if(localStorage.getItem(LEGACY_IMPORT_MARK))return;
      const raw=localStorage.getItem(LEGACY_SAVE_KEY);if(!raw)return;
      const data=JSON.parse(raw);if(!validSave(data))return;
      const slot=makeSlot(updateArchivedEvents(data),'Partie récupérée de la V1');
      if(await persistSlotDurably(slot)){
        try{localStorage.setItem(LEGACY_IMPORT_MARK,slot.id);}catch(e){console.warn('Marqueur V1 non sauvegardé',e);}
      }
    }catch(e){console.warn('Import automatique V1 indisponible',e);}
  }
  function formatGameDate(minutes){
    const total=Math.max(0,Math.floor(minutes));
    const day=Math.floor(total/1440)+1;
    const n=total%1440;
    return `Jour ${day} · ${String(Math.floor(n/60)).padStart(2,'0')}:${String(n%60).padStart(2,'0')}`;
  }
  function nextPartyName(){
    const used=new Set(listSlots().map(s=>s.label.toLocaleLowerCase('fr')));
    let i=1;while(used.has(`partie ${i}`))i++;
    return `Partie ${i}`;
  }
  function renderSaveList(){
    const slots=listSlots();
    $('saveCount').textContent=`${slots.length} PARTIE${slots.length===1?'':'S'}`;
    $('saveList').innerHTML=slots.length?slots.map(s=>{
      const p=s.data.player;
      return `<article class="save-card">
        <div class="save-card-top"><div><h3>${escapeHtml(s.label)}</h3>
        <p class="save-character-meta"><span class="save-character-name">${escapeHtml(p.name)}</span> ${classRankMarkup(p.class,p.rank)} <span class="save-gold">◈ ${Number(p.gold).toLocaleString('fr-FR')} or</span> · ${s.data.mode==='season'?'Saison'+(s.data.season?.finished?' terminée':' en cours'):'Mode libre'}${p.injuryRemainingMs>0?' · <span class="save-injury">En convalescence</span>':''}</p></div>
        <span class="save-time">${escapeHtml(formatGameDate(s.data.worldMinutes))}</span></div>
        <div class="save-card-bottom">
          <button type="button" class="load-world" data-action="load" data-id="${escapeHtml(s.id)}">▶ Continuer</button>
          <button type="button" data-action="export" data-id="${escapeHtml(s.id)}">↧ Exporter</button>
          <button type="button" class="delete-world" data-action="delete" data-id="${escapeHtml(s.id)}">Supprimer</button>
        </div></article>`;
    }).join(''):'<div class="save-empty">Aucune partie pour le moment.<br>Créez votre premier monde et commencez au jour 1.</div>';
    $('storageWarning').hidden=storageReady();
  }
  function getSlot(id){return listSlots().find(s=>s.id===id)||null;}
  function exportSlot(slot){
    const blob=new Blob([JSON.stringify(slot,null,2)],{type:'application/json;charset=utf-8'});
    const url=URL.createObjectURL(blob);const link=document.createElement('a');link.href=url;
    link.download=`Chronicles_partie_${slot.id.slice(0,8)}.json`;
    document.body.appendChild(link);link.click();link.remove();setTimeout(()=>URL.revokeObjectURL(url),1500);
    notify('Fichier de sauvegarde exporté.');
  }
  async function importSave(raw){
    try {
      if(typeof raw!=='string'||raw.length>25_000_000)throw Error('Fichier trop grand (maximum 25 Mo).');
      const input=JSON.parse(raw);
      let data,label;
      if(validSlot(input)) {data=input.data;label=input.label;}
      else if(validSave(input)){data=input;label='Partie importée de la V1';}
      else throw Error('Format non compatible avec les sauvegardes V1, V1.1 ou V2.');
      const slot=makeSlot(updateArchivedEvents(data),label);
      if(!await persistSlotDurably(slot))return false;
      renderSaveList();notify('Partie importée, sans écraser les autres.');return true;
    }catch(e){notify('Import impossible : '+e.message);return false;}
  }
  function stamp() {
    const total = Math.max(0,Math.floor(game?.worldMinutes || START_WORLD_MINUTES));
    const day = Math.floor(total/1440)+1;
    const minuteOfDay = total%1440;
    const hours = String(Math.floor(minuteOfDay/60)).padStart(2,'0');
    const minutes = String(minuteOfDay%60).padStart(2,'0');
    return `Jour ${day} · ${hours}:${minutes}`;
  }
  function logEvent(title,detail,kind='info') {
    game.events.unshift({title,detail,kind,at:stamp(),atMinute:Math.floor(game.worldMinutes)});
    game.events = game.events.slice(0,80);
  }
  function notify(message) {
    const el = $('toast');el.textContent=message;el.classList.add('show');
    clearTimeout(toastHandle);toastHandle=setTimeout(()=>el.classList.remove('show'),2700);
  }
  function createCharacter(name,cls,gender,mode='free',objective='power') {
    const seed = CLASSES[cls];
    const power = Math.round((seed.base + randomInt(-3,4))*RANK_MULT_E);
    return {
      version:SAVE_VERSION,
      player:{name,gender,portraitNumber:1,class:cls,role:seed.role,rank:'E',power,basePower:power,inventory:[],equipment:{Arme:null,Armure:null,Accessoire:null},gold:0,xp:0,rep:0,
        totalRaids:0,successRaids:0,failedRaids:0,raidStatsByRank:{},totalInjuries:0,injuryRemainingMs:0,injuryTotalMs:0,ambition:AMBITIONS[objective]?objective:'power',guildId:null,
        home:{id:'studio_start',name:'Studio délabré',tier:1,recoverySeconds:38}},
      mode:mode==='season'?'season':'free',season:mode==='season'?{startedAt:START_WORLD_MINUTES,endsAt:START_WORLD_MINUTES+SEASON_LENGTH_MINUTES,finished:false,result:null}:null,
      worldMinutes:START_WORLD_MINUTES,paused:false,simSpeed:1,
      economy:{bills:[],history:[],noticeStage:0,nextBillingMinute:START_WORLD_MINUTES+BILLING_CYCLE_MINUTES},bank:{balance:0,history:[],loan:null,nextInterestAt:START_WORLD_MINUTES+BANK_SAVINGS_CYCLE_MINUTES},investments:{owned:[],history:[],totalIncome:0},job:null,
      raid:null,
      associationPreviews:{},
      messages:[],guildNegotiations:{},associationNpcRaids:[],nextAssociationNpcDecisionMinute:START_WORLD_MINUTES+randomInt(30,60),applications:{},careerNextReviewMinute:START_WORLD_MINUTES+CAREER_REVIEW_MINUTES,
      population:createPopulation(),
      nextNpcWorldMinute:START_WORLD_MINUTES+NPC_STEP_MINUTES,
      lastResult:null,
      events:[]
    };
  }
  function openForm() {
    $('welcomeActions').hidden=true;$('characterForm').hidden=false;
    $('partyName').value=nextPartyName();
    $('playerName').value='';$('gameMode').value='free';$('seasonObjective').value='power';updateModeDescription();$('partyName').focus();
  }
  function openWelcome() {
    if(!saveGame())return;
    game=null;activeSlot=null;window.ChroniclesWorld?.setGame(null);window.ChroniclesDesktop?.reset();
    $('welcome').hidden=false;$('app').hidden=true;$('characterForm').hidden=true;
    $('gameOverOverlay').hidden=true;$('seasonEndOverlay').hidden=true;
    $('welcomeActions').hidden=false;$('pasteImportArea').hidden=true;
    renderSaveList();lastFrame=performance.now();updateSpeedUI();
  }
  function startGame(slot) {
    if(!validSlot(slot)){notify('Cette partie est invalide.');return;}
    activeSlot=slot;game=slot.data;pendingOfferDrafts.clear();lastMailListHtml=null;lastMailContentHtml=null;
    updateArchivedEvents(game);normalizeGame(game);selectedDungeon=game.raid?.rank||'E';selectedMailId=null;checkedMails.clear();shopMode='buy';financeMode='investments';page='dashboard';
    window.ChroniclesDesktop?.reset();
    window.ChroniclesWorld?.setGame(game);
    $('welcome').hidden=true;$('app').hidden=false;
    lastFrame=performance.now();timeSinceSave=0;timeSinceClockRender=0;
    updatePauseUI();updateSpeedUI();renderAll();window.ChroniclesWorld?.resize();saveGame();renderGameOver();renderSeasonEnd();
  }
  function goToPage(name, passiveRender=false) {
    const previousPage=page;
    if(!['dashboard','inventory','association','shop','ranking','guilds','journal','mail','finance','bank','debts'].includes(name)) return;
    page=name;
    if(!passiveRender)window.ChroniclesDesktop?.open(name);
    if(previousPage!==name && !window.ChroniclesDesktop)window.scrollTo({top:0,behavior:'instant'});
    for(const el of document.querySelectorAll('.nav-btn'))el.classList.toggle('active',el.dataset.page===name);
    for(const el of document.querySelectorAll('.page'))el.classList.toggle('active',el.id===`page-${name}`);
    const labels={dashboard:'FICHE PERSONNAGE',inventory:'INVENTAIRE',association:'DONJON',shop:'BOUTIQUE',ranking:'CLASSEMENT',guilds:'GUILDE',journal:'NOTIFICATIONS',mail:'MESSAGERIE',finance:'FINANCES',bank:'BANQUE',debts:'CHARGES ET DETTES'};
    $('currentPageName').textContent=labels[name];
    if(name==='journal')renderEvents();
    if(name==='shop'||name==='inventory')renderShop();
    if(name==='ranking')renderRanking();
    if(name==='guilds')renderGuilds();
    if(name==='association'){renderRaid();renderTeamPreview();renderGuilds();}
    if(name==='mail')renderMail();
    if(name==='finance'){renderHousing();renderJobs();renderInvestments();setFinanceMode(financeMode);}
    if(name==='bank')renderBank();
    if(name==='debts')renderDebts();
  }
  function normalizeGame(g) {
    if(typeof g.paused!=='boolean')g.paused=false;
    if(!SIM_SPEEDS.includes(g.simSpeed))g.simSpeed=1; // Import d’une partie sans vitesse enregistrée : vitesse normale.
    // V10 et versions précédentes restent librement jouables : jamais de saison imposée.
    if(g.mode!=='season')g.mode='free';
    if(g.mode==='season'){
      if(!g.season||typeof g.season!=='object')g.season={};
      if(!Number.isFinite(g.season.startedAt))g.season.startedAt=START_WORLD_MINUTES;
      if(!Number.isFinite(g.season.endsAt))g.season.endsAt=g.season.startedAt+SEASON_LENGTH_MINUTES;
      if(typeof g.season.finished!=='boolean')g.season.finished=false;
    }else g.season=null;
    // No migration overwrite: existing V1 and V1.1 saves are extended in memory.
    const p=g.player;
    ensurePlayerRankRecord(p); // V15.1 : ajouter sans inventer de rang pour les raids precedents.
    p.injuryRemainingMs=Number.isFinite(p.injuryRemainingMs)?Math.max(0,p.injuryRemainingMs):0;
    p.totalInjuries=Number.isFinite(p.totalInjuries)?p.totalInjuries:0;
    // Anciens logements V1-V6 : reconnus sans modifier l'original de la partie.
    const validHome=HOME_BY_ID[p.home?.id]||HOMES.find(h=>h.tier===p.home?.tier)||HOMES[0];
    p.home={...validHome};
    if(!AMBITIONS[p.ambition])p.ambition='power';
    ensureEconomy(g);
    ensureInvestments(g);
    if(!Number.isFinite(p.injuryTotalMs)||p.injuryTotalMs<0)p.injuryTotalMs=p.injuryRemainingMs>0?validHome.recoverySeconds*1000:0;
    if(!g.associationPreviews||typeof g.associationPreviews!=='object')g.associationPreviews={};
    // V5 : anciennes prévisualisations temporaires invalidées.
    g.associationPreviews={};
    if(!g.applications||typeof g.applications!=='object')g.applications={};
    if(!g.guildNegotiations||typeof g.guildNegotiations!=='object')g.guildNegotiations={};
    if(!Array.isArray(g.messages))g.messages=[];
    if(!Number.isFinite(g.careerNextReviewMinute))g.careerNextReviewMinute=g.worldMinutes+CAREER_REVIEW_MINUTES;
    if(!Array.isArray(g.associationNpcRaids))g.associationNpcRaids=[];
    // Anciennes expéditions sauvegardées : continuer sans annuler la mission.
    if(g.economyVersion!==52){
      if(g.raid?.source==='guild')g.raid.payoutRate=GUILD_WAGE_RATE;
      for(const oldGuild of g.guilds||[])if(oldGuild.raid)oldGuild.raid.payoutRate=GUILD_WAGE_RATE;
      g.economyVersion=52;
    }
    if(!Number.isFinite(g.nextAssociationNpcDecisionMinute))g.nextAssociationNpcDecisionMinute=g.worldMinutes+randomInt(30,60);
    if(typeof p.guildId!=='string')p.guildId=null;
    for(const gr of (g.guilds||[]))if(!Number.isFinite(gr.playerDispatchCounter))gr.playerDispatchCounter=0;
    // Migrate V1/V1.1/V2 saves in memory, preserving world clock, gold, XP, raids and injuries.
    if(!Array.isArray(p.inventory))p.inventory=[];
    p.inventory=p.inventory.filter((id,i,arr)=>ITEM_BY_ID[id]&&arr.indexOf(id)===i);
    if(!p.equipment||typeof p.equipment!=='object')p.equipment={};
    for(const s of SLOTS)if(!p.inventory.includes(p.equipment[s])||ITEM_BY_ID[p.equipment[s]]?.slot!==s)p.equipment[s]=null;
    if(!RANKS.includes(p.rank))p.rank='E';
    if(!Number.isFinite(p.basePower))p.basePower=Math.max(1,p.power-itemPower(p));
    if(!Number.isFinite(p.xp)||p.xp<0)p.xp=0;
    progressRank(p,false);recalcPower(p);
    if(!Array.isArray(g.population)||!g.population.length)g.population=createPopulation();
    if(!Number.isFinite(g.nextNpcWorldMinute))g.nextNpcWorldMinute=g.worldMinutes+NPC_STEP_MINUTES;
    // Non-destructive migration for V1–V3 parts: preserve their player/calendar/loot.
    if(!Array.isArray(g.guilds)||!g.guilds.length){g.guilds=initialGuilds(g.population);g.guildNews=[];}
    if(!Array.isArray(g.guildNews))g.guildNews=[];
    // V12 : migration non destructive des guildes antérieures et de leurs chefs.
    for(const guild of g.guilds){
      guild.level=Number.isFinite(guild.level)?clamp(guild.level,1,4):Math.min(4,1+Math.floor((guild.rep||0)/80));
      guild.raids=Array.isArray(guild.raids)?guild.raids:(guild.raid?[{...guild.raid,id:makeId(),source:'guild',guildId:guild.id}]:[]);
      guild.raid=null;
      guild.upgrades=guild.upgrades||{recruitment:0,recovery:0,expedition:0,negotiation:0};
      guild.bills=Array.isArray(guild.bills)?guild.bills:[];
      guild.arenaTeams=Array.isArray(guild.arenaTeams)?guild.arenaTeams:[];
      guild.arenaWins=guild.arenaWins||0;guild.arenaReadyAt=guild.arenaReadyAt||0;guild.roundRobin=guild.roundRobin||0;
      if(!Number.isFinite(guild.nextGuildInvoiceAt))guild.nextGuildInvoiceAt=g.worldMinutes+7*1440;
      guild.dissolved=!!guild.dissolved;
    }
    ensureGuildChiefs(g);
    // Renommage cosmétique : conserver les mêmes entités et leurs identifiants.
    for(const guild of g.guilds)if(CHIEF_FULL_NAMES[guild.id])guild.leader=CHIEF_FULL_NAMES[guild.id];
    for(const npc of g.population){
      const ordinary=/^npc_(\d+)$/.exec(String(npc.id||''));
      if(ordinary){
        const index=Number(ordinary[1])-1;
        if(index>=0&&index<NPC_DISPLAY_NAMES.length)npc.name=NPC_DISPLAY_NAMES[index];
      }else{
        const chief=/^chief_(guild_\d+)$/.exec(String(npc.id||''));
        if(chief&&CHIEF_FULL_NAMES[chief[1]])npc.name=CHIEF_FULL_NAMES[chief[1]];
      }
    }
    // Synchroniser les instantanés des expéditions en cours.
    const liveNames=new Map(g.population.map(n=>[n.id,n.name]));
    const syncRaidNames=raid=>{
      if(!raid||!Array.isArray(raid.members))return;
      for(const member of raid.members)if(liveNames.has(member.id))member.name=liveNames.get(member.id);
    };
    syncRaidNames(g.raid);
    for(const guild of g.guilds)for(const raid of guild.raids||[])syncRaidNames(raid);
    for(const raid of g.associationNpcRaids||[])syncRaidNames(raid);
    assignNpcPortraits(g.population);
    if(!Number.isInteger(p.portraitNumber)||p.portraitNumber<1||p.portraitNumber>25)p.portraitNumber=1;
    for(const guild of g.guilds){
      // Ne pas éjecter un joueur engagé lors de la migration; ajuster le niveau acquis si nécessaire.
      while(guild.memberIds.length>guildCapacity(guild)&&guild.level<4)guild.level++;
    }
    for(const guild of g.guilds){
      guild.activity=Array.isArray(guild.activity)?guild.activity:[];
      guild.memberIds=Array.isArray(guild.memberIds)?guild.memberIds:[];
      guild.teamIds=Array.isArray(guild.teamIds)?guild.teamIds:[];
      if(!Number.isFinite(guild.nextThinkMinute))guild.nextThinkMinute=g.worldMinutes+GUILD_TICK_MINUTES;
      guild.raids=guild.raids.filter(r=>Number.isFinite(r.remainingMs)&&Array.isArray(r.memberIds));
      for(const raid of guild.raids){
        if(!raid.id)raid.id=makeId();
        raid.source='guild';raid.guildId=guild.id;
        if(!Array.isArray(raid.members)||raid.members.length!==3)raid.members=raid.memberIds.map(id=>id==='player'?{...p,id:'player',isPlayer:true}:g.population.find(n=>n.id===id)).filter(Boolean).map(n=>({...n}));
        if(!raid.synergyData||!Number.isFinite(raid.synergyData.injuryPoints))raid.synergyData=partySynergy(raid.members);
        if(!Number.isFinite(raid.playerRate))raid.playerRate=GUILD_WAGE_RATE;
      }
    }
    for(const npc of g.population){
      normalizeNpcEquipment(npc,g.worldMinutes);
      if(!Number.isFinite(npc.gold))npc.gold=0;
      if(!Number.isFinite(npc.rep))npc.rep=0;
      if(!Number.isFinite(npc.xp))npc.xp=0;
      if(!Number.isFinite(npc.totalRaids))npc.totalRaids=0;
      if(!Number.isFinite(npc.injuryRemainingMs))npc.injuryRemainingMs=0;
      if(!Number.isFinite(npc.totalInjuries))npc.totalInjuries=0;
    }
    // Migration V1–V4 : convertir les raids temporaires en compagnons du monde.
    if(g.raid && g.raid.source!=='guild' && (!Array.isArray(g.raid.memberIds)||g.raid.memberIds.length!==2)) {
      const candidates=guildFreeAgents().filter(n=>!(n.injuryRemainingMs>0) && !g.guilds.some(x=>x.raid?.memberIds.includes(n.id))).slice(0,2);
      if(candidates.length===2){
        g.raid.memberIds=candidates.map(n=>n.id);
        g.raid.members=[{...p,id:'player',isPlayer:true},...candidates.map(n=>({...n}))];
        g.raid.chance=chanceForParty(g.raid.rank||'E',g.raid.members);
        g.raid.teamPower=partyPower(g.raid.members);
      }else{g.raid=null;logEvent('Migration V5','Ancien raid interrompu : compagnons permanents indisponibles. Aucun frais ni blessure.','info');}
    }
    for(const guild of g.guilds){
      guild.memberIds=[...new Set(guild.memberIds.filter(id=>id==='player'||!!npcById(id)))];
      if(guild.raids.some(r=>r.memberIds.includes('player'))&&!p.guildId)p.guildId=guild.id;
    }
    if(p.guildId && !g.guilds.some(x=>x.id===p.guildId&&x.memberIds.includes('player')))p.guildId=null;
    // Les anciennes parties V5.2 déjà membres conservent leur affiliation et le taux 10 %.
    if(p.guildId && (!p.contract||p.contract.guildId!==p.guildId))p.contract={guildId:p.guildId,terms:{rate:GUILD_WAGE_RATE,failureFee:0,departureFee:0,policy:'Mission décidée par le chef.',durationMinutes:CONTRACT_LENGTH_MINUTES},signedAt:g.worldMinutes,endsAt:g.worldMinutes+CONTRACT_LENGTH_MINUTES,legacy:true};
    if(!p.guildId)p.contract=null;
    // Reconnecter l'identité du raid joueur au raid conservé par la guilde.
    if(g.raid?.source==='guild'){
      const guild=g.guilds.find(x=>x.id===g.raid.guildId);
      if(guild){
        let pending=guild.raids.find(r=>r.id===g.raid.id||r.memberIds.includes('player'));
        if(!pending){
          const mates=g.raid.memberIds||[];
          pending={...g.raid,id:makeId(),memberIds:['player',...mates],members:g.raid.members||[]};
          guild.raids.push(pending);
        }
        if(!pending.memberIds.includes('player'))pending.memberIds=['player',...pending.memberIds.filter(id=>id!=='player')].slice(0,3);
        pending.source='guild';pending.guildId=guild.id;
        pending.playerRate=pending.playerRate??(pending.payoutRate??GUILD_WAGE_RATE);
        pending.synergyData=pending.synergyData||partySynergy(pending.members||[]);
        g.raid=pending;
      }else g.raid=null;
    }else{
      for(const guild of g.guilds){const raid=guild.raids.find(r=>r.memberIds.includes('player'));if(raid){g.raid=raid;break;}}
    }
    syncGuildReputations();
    for(const guild of g.guilds){
      if(!Array.isArray(guild.playerTeamIds))guild.playerTeamIds=[];
      ensureGuildSquads(guild);
    }
  }
  function associationCandidateList(rank){
    // Priorité aux rangs proches du donjon, mais tous les indépendants disponibles sont éligibles.
    return freeNpcCandidates().slice().sort((a,b)=>{
      const diffA=Math.abs(getRankIndex(a.rank)-getRankIndex(rank));
      const diffB=Math.abs(getRankIndex(b.rank)-getRankIndex(rank));
      return diffA-diffB||a.id.localeCompare(b.id);
    });
  }
  function makeParty(rank){
    const candidates=associationCandidateList(rank);
    if(candidates.length<2)return [];
    // Si le joueur n'a pas le rang requis, l'Association trouve réellement
    // au moins un compagnon possédant ce rang (ou supérieur).
    const required=getRankIndex(rank);
    const playerQualified=getRankIndex(game.player.rank)>=required;
    const eligible=candidates.filter(n=>getRankIndex(n.rank)>=required);
    if(!playerQualified&&!eligible.length)return [];
    const pool=candidates.slice(0,Math.min(8,candidates.length));
    const firstPool=playerQualified?pool:eligible.slice(0,Math.min(8,eligible.length));
    const first=firstPool[randomInt(0,firstPool.length-1)];
    const remaining=pool.filter(n=>n.id!==first.id);
    if(!remaining.length){
      // Un compagnon qualifié peut être hors des huit profils les plus proches.
      remaining.push(...candidates.filter(n=>n.id!==first.id).slice(0,8));
    }
    const second=remaining[randomInt(0,remaining.length-1)];
    return second?[first.id,second.id]:[];
  }
  function previewFor(rank){
    clearStaleAssociationPreviews();
    if(!Array.isArray(game.associationPreviews[rank]))game.associationPreviews[rank]=makeParty(rank);
    const ids=game.associationPreviews[rank];
    if(ids.length!==2)return [];
    return [{...game.player,id:'player',isPlayer:true},...ids.map(id=>npcById(id))].filter(Boolean);
  }
  function partyPower(members){return Math.round(members.reduce((s,m)=>s+m.power,0)*(1+partySynergy(members).bonus));}
  function chanceForParty(rank,members) {
    const dungeon=DUNGEONS[rank]||DUNGEONS.E;
    return clamp(.16+(partyPower(members)/(dungeon.need*members.length*1.6))*.64+partySynergy(members).bonus*.5,.12,.96);
  }
  function chanceOfSuccess(){
    if(game.raid)return Number.isFinite(game.raid.chance)?game.raid.chance:chanceForParty(game.raid.rank,game.raid.members);
    const team=playerRaidTeam();
    return team.length!==3?null:(playerGuild()?guildSuccessChance(selectedDungeon,team):chanceForParty(selectedDungeon,team));
  }
  function raidRecoveryMs(){return Math.round(Math.max(1,Number(game.player.home?.recoverySeconds)||38)*1000);}
  function isInjured(){return game.player.injuryRemainingMs>0;}
  function formatSecs(ms){return `${(Math.max(0,ms)/1000).toFixed(1).replace('.',',')} s`;}
  function assignedGuildTeam(g){
    if(!g||game.raid||game.job||isInjured())return [];
    const mates=getPlayerSquad(g);
    return mates.length===2 && mates.every(n=>npcReady(n))?[{...game.player,id:'player',isPlayer:true},...mates]:[];
  }
  function dungeonRankIsAvailable(rank){
    return !playerGuild() && ASSOCIATION_DUNGEON_RANKS.includes(rank);
  }
  // Les 6 rangs sont visibles en guilde POUR CONSULTATION seulement.
  // Seul le chef IA engage l'argent de la guilde et déclenche ses raids.
  function dungeonRankCanPreview(rank){
    return playerGuild()?RANKS.includes(rank):ASSOCIATION_DUNGEON_RANKS.includes(rank);
  }
  function playerRaidTeam(){
    if(game.raid?.members?.length===3)return game.raid.members;
    const guild=playerGuild();return guild?assignedGuildTeam(guild):previewFor(selectedDungeon);
  }
  function finishGuildPlayerRaid(raid){
    const guild=game.guilds.find(g=>g.id===raid.guildId);
    const dungeon=DUNGEONS[raid.rank];
    const success=Math.random()<raid.chance;
    const gross=success?raidLootValue(raid):0;
    const rep=success?randomInt(...dungeon.rep):0;
    const wage=success?Math.round(gross*(raid.payoutRate??GUILD_WAGE_RATE)):0;
    const npcWage=success?Math.round(gross*GUILD_WAGE_RATE):0;
    const wages=wage+npcWage*2;
    if(guild){if(success){guild.gold+=gross-wages;guild.income+=gross;guild.wages+=wages;guild.won++;}else guild.lost++;}
    const debt=(!success&&guild)?chargeGuildFailure(guild,raid):0;
    const xp=success?dungeon.xp:Math.round(dungeon.xp*.45);
    game.player.xp+=xp;
    game.player.totalRaids++;
    if(success){game.player.gold+=wage;game.player.rep+=rep;game.player.successRaids++;}
    else game.player.failedRaids++;
    recordPlayerRankRaid(raid.rank,success);
    progressRank(game.player);
    let playerInjured=false;
    for(const id of raid.memberIds){
      const npc=npcById(id);if(!npc)continue;
      npc.totalRaids=(npc.totalRaids||0)+1;
      npc.xp=(npc.xp||0)+xp;
      if(success){npc.gold=(npc.gold||0)+npcWage;npc.rep=(npc.rep||0)+rep;}
      if(Math.random()<injuryChance(raid.rank,success,raidSynergy(raid),raidProtection(raid))){npc.totalInjuries=(npc.totalInjuries||0)+1;npc.injuryRemainingMs=NPC_HOME_RECOVERY_MS;}
    }
    if(Math.random()<injuryChance(raid.rank,success,raidSynergy(raid),raidProtection(raid))){
      playerInjured=true;game.player.totalInjuries++;
      game.player.injuryRemainingMs=raidRecoveryMs();game.player.injuryTotalMs=raidRecoveryMs();
      logEvent('Blessure au retour',`Vous avez été blessé pendant l’expédition. Votre convalescence durera ${Math.round(raidRecoveryMs()/1000)} secondes dans votre logement.`,'injury');
    }
    const info=(success?`Vous recevez ${wage} pièces d’or de salaire, ${xp} points d’expérience et ${rep} points de réputation.`:`Vous ne recevez aucun salaire, mais gagnez ${xp} points d’expérience.`+(debt?` Dette contractuelle : ${money(debt)} à régler dans Charges et dettes.`:' Aucun remboursement exigé.'))+(playerInjured?' Blessure : convalescence obligatoire.':'');
    game.lastResult={success,injured:playerInjured,rank:raid.rank,title:success?'Victoire en guilde !':'Expédition de guilde échouée',text:info};
    if(guild)addGuildNews(guild,success?`Victoire donjon ${raid.rank} menée par ${game.player.name} : ${gross} or de butin.`:`Échec du donjon ${raid.rank} mené par ${game.player.name}.`,success?'success':'failure');
    logEvent(success?'Expédition de guilde réussie':'Expédition de guilde échouée',`Votre équipe de ${guild?.name||'guilde'} ${success?'a réussi':'n’a pas réussi'} le donjon de rang ${raid.rank}. ${info}`,success?'success':'failure');
    sound(success?'victory':'defeat');if(playerInjured)sound('injury');
    saveGame();renderAll();notify(game.lastResult.title);
  }
  function launchRaid(){
    if(!game || game.raid || game.job || isInjured())return;
    if(playerGuild()){notify('Seul votre chef décide et finance les expéditions de guilde.');return;}
    if(!dungeonRankIsAvailable(selectedDungeon)){notify('Ce donjon n’est pas accessible dans votre situation.');return;}
    const guild=playerGuild();
    const dungeon=DUNGEONS[selectedDungeon];if(!dungeon)return;
    const members=playerRaidTeam();
    if(members.length!==3){notify('Pas assez d’aventuriers disponibles pour former l’équipe.');renderTeamPreview();return;}
    if(!qualifiedForDungeon(members,selectedDungeon)){notify('Un aventurier au moins doit être du rang du donjon ou supérieur.');renderTeamPreview();return;}
    const ids=members.slice(1).map(n=>n.id);
    if(ids.some(id=>!npcReady(npcById(id))||(guild?!guild.memberIds.includes(id):!freeNpcCandidates().some(n=>n.id===id)))){game.associationPreviews={};renderTeamPreview();notify('Ces compagnons sont devenus indisponibles.');return;}
    if(guild&&guild.gold<(GUILD_RAID_DATA[selectedDungeon]?.cost||0)+65){notify('Votre guilde ne dispose pas des fonds pour financer ce donjon.');return;}
    // Snapshot at departure; persistent identity linked by memberIds for rewards / injuries.
    game.raid={rank:selectedDungeon,source:guild?'guild':'association',guildId:guild?.id||null,remainingMs:dungeon.durationMs,durationMs:dungeon.durationMs,
      memberIds:ids,members:members.map(n=>({...n})),lootRotation:randomInt(0,2),economyVersion:132,lootReference:LOOT_BY_RANK[selectedDungeon],
      chance:chanceForParty(selectedDungeon,members),teamPower:partyPower(members),synergy:partySynergy(members).label,synergyData:partySynergy(members),protectionPoints:groupEquipmentProtection(members)};
    if(guild){
      const data=GUILD_RAID_DATA[selectedDungeon],cost=data.cost;
      guild.gold-=cost;guild.costs+=cost;
      game.raid.payoutRate=game.player.contract?.terms?.rate??GUILD_WAGE_RATE;
      game.raid.failureShare=contractFailureShare(game.player.contract?.terms);
      game.raid.cost=cost;
      addGuildNews(guild,`L’équipe de ${game.player.name} part au donjon ${selectedDungeon} (frais : ${cost} or).`,'raid');
    }
    delete game.associationPreviews[selectedDungeon];
    game.lastResult=null;
    logEvent('Départ en expédition',`Votre équipe (${members.map(m=>m.name).join(', ')}) part explorer un donjon de rang ${selectedDungeon}. ${guild?'La guilde '+guild.name+' finance cette expédition.':'L’Association organise cette expédition gratuitement.'}`,'raid');
    sound('raid');saveGame();renderAll();goToPage('association');notify(`Votre équipe part vers le donjon ${selectedDungeon} !`);
  }
  function finishRaid(){
    if(!game?.raid)return;
    const raid=game.raid,dungeon=DUNGEONS[raid.rank]||DUNGEONS.E;
    if(raid.source==='guild'){game.raid=null;finishGuildPlayerRaid(raid);return;}
    const success=Math.random()<(Number.isFinite(raid.chance)?raid.chance:chanceForParty(raid.rank,raid.members));
    const injured=Math.random()<injuryChance(raid.rank,success,raidSynergy(raid),raidProtection(raid));
    game.raid=null;
    game.player.totalRaids++;
    let info='',gross=0,rep=0,pay=0,npcShares=[0,0];
    if(success){
      const legacy=raid.economyVersion!==132;
      const outcome=legacy?null:associationRecovery(raid.rank);
      gross=legacy?raidLootValue(raid):outcome.recovered;
      rep=randomInt(...dungeon.rep);
      if(legacy)[pay,...npcShares]=splitLootThree(gross,raid.lootRotation||0);
      else {pay=outcome.individual;npcShares=[pay,pay];}
      game.player.gold+=pay;game.player.rep+=rep;game.player.xp+=dungeon.xp;
      game.player.successRaids++;progressRank(game.player);
      info=legacy
        ?`Vous recevez ${pay} pièces d’or, ${dungeon.xp} points d’expérience et ${rep} points de réputation.`
        :`Vous recevez ${pay} pièces d’or de l’Association, ${dungeon.xp} points d’expérience et ${rep} points de réputation.`;
      logEvent(`Expédition réussie : donjon de rang ${raid.rank}`,info,'success');
    }else{
      const xp=Math.round(dungeon.xp*.45);
      game.player.xp+=xp;game.player.failedRaids++;progressRank(game.player);
      info=`Votre équipe n’a rapporté aucun butin. Vous gagnez ${xp} points d’expérience.`;
      logEvent(`Expédition échouée : donjon de rang ${raid.rank}`,info,'failure');
    }
    recordPlayerRankRaid(raid.rank,success);
    for(const [i,id] of (raid.memberIds||[]).entries()){
      const npc=npcById(id);if(!npc)continue;
      npc.totalRaids=(npc.totalRaids||0)+1;
      npc.xp=(npc.xp||0)+(success?dungeon.xp:Math.round(dungeon.xp*.45));
      if(success){npc.gold=(npc.gold||0)+npcShares[i];npc.rep=(npc.rep||0)+rep;}
      if(Math.random()<injuryChance(raid.rank,success,raidSynergy(raid),raidProtection(raid))){
        npc.totalInjuries=(npc.totalInjuries||0)+1;npc.injuryRemainingMs=NPC_HOME_RECOVERY_MS;
      }
    }
    if(injured){
      game.player.totalInjuries++;
      game.player.injuryRemainingMs=raidRecoveryMs();game.player.injuryTotalMs=raidRecoveryMs();
      logEvent('Blessure au retour',`Vous avez été blessé pendant l’expédition. Votre convalescence durera ${Math.round(raidRecoveryMs()/1000)} secondes dans votre logement.`,'injury');
      info+=` Blessure : repos de ${Math.round(raidRecoveryMs()/1000)} secondes obligatoire.`;
    }
    game.lastResult={success,injured,rank:raid.rank,title:success?'Expédition réussie !':'Expédition échouée',text:info};
    game.associationPreviews={};
    sound(success?'victory':'defeat');if(injured)sound('injury');
    saveGame();renderAll();
    notify(injured?'Retour de raid : blessé, convalescence obligatoire.':success?'Expédition réussie !':'Expédition échouée.');
  }
  function renderTeamPreview(){
    if(!game)return;
    const ownGuild=playerGuild();
    if(!dungeonRankCanPreview(selectedDungeon) && !game.raid)selectedDungeon='E';
    $('page-association').querySelector('.page-intro .eyebrow').textContent=ownGuild?'ORDRES DE GUILDE':'ASSOCIATION DES AVENTURIERS';
    $('page-association').querySelector('.page-intro .version-tag').textContent=ownGuild?'EXPÉDITION DE GUILDE':'SERVICE PUBLIC';
    $('page-association').querySelector('.association-banner .eyebrow').textContent=ownGuild?'ÉQUIPE DÉSIGNÉE PAR VOTRE CHEF · RANGS E À S':'RAIDS OUVERTS · RANGS E À C';
    $('guildQuest').innerHTML=ownGuild?`<strong>♜ Ordre du jour — ${escapeHtml(ownGuild.name)}</strong><p>Votre chef ${escapeHtml(ownGuild.leader)} choisit les prochaines destinations selon la puissance et la disponibilité des escouades. Vous partez automatiquement lorsqu'il affecte votre groupe à une expédition.</p>`:'<strong>⚔ Aventurier indépendant — Association</strong><p>Sélectionnez un donjon : l’Association remplit automatiquement votre équipe avec deux vrais aventuriers indépendants disponibles. Vous décidez quand lancer l’expédition.</p>';
    $('portalPanelHeading').textContent=ownGuild?'DONJONS DISPONIBLES':'CHOIX DU PORTAIL';
    const rank=game.raid?.rank||selectedDungeon;
    const dungeon=DUNGEONS[rank];
    const members=game.raid?.members||playerRaidTeam();
    $('dungeonName').textContent=`Donjon de rang ${rank}`;
    // L'illustration et sa légende ont été retirées de la fenêtre Donjon.
    $('dungeonBadge').textContent=rank;
    // Les informations de chaque donjon sont affichées directement dans sa carte.
    $('rewardExplanation').textContent=ownGuild?`Guilde : 100 % du butin brut, frais fixes à 20 % payés par la guilde. Vous touchez ${pct(game.player.contract?.terms?.rate??GUILD_WAGE_RATE)} en cas de victoire ; les deux PNJ reçoivent chacun 10 %. Les contrats risqués s'appliquent en cas d'échec.`:'Association : expéditions gratuites. Votre récompense en or dépend des ressources rapportées du donjon.';
    const chance=chanceOfSuccess();
    const chanceText=members.length===3&&!qualifiedForDungeon(members,rank)?'Rang requis absent':chance===null?'Équipe indisponible':`${Math.round(chance*100)} %`;
    const displayedTeam=(!game.raid&&ownGuild&&members.length!==3)?[{...game.player,id:'player',isPlayer:true},...getPlayerSquad(ownGuild)]:members;
    $('teamMembers').innerHTML=displayedTeam.length===3?displayedTeam.map(m=>`<div class="team-member" data-profile-id="${escapeHtml(m.id||'player')}" role="button" tabindex="0" aria-label="Voir la fiche de ${escapeHtml(m.name)}">${portraitImg(m,'team-portrait')}<span class="team-member-identity"><strong>${escapeHtml(m.name)}${m.isPlayer?' (vous)':''}</strong><small>${escapeHtml(m.class)}${m.id!=='player'&&!npcReady(m)?' · Indisponible':''}</small></span><span class="team-member-stats">${rankMarkup(m.rank)}<b>⚡ ${Math.round(m.power)}</b></span></div>`).join(''):
      '<div class="team-absent">Pas assez de compagnons disponibles pour cette expédition. Attendez la fin d’un raid ou d’une convalescence.</div>';
    if(members.length===3){
      const synergy=partySynergy(members);
      const protection=game.raid?raidProtection(game.raid):groupEquipmentProtection(members);
      const netInjuryPoints=synergy.injuryPoints-protection;
      const injuryText=netInjuryPoints<0?`−${Math.abs(netInjuryPoints)}`:netInjuryPoints>0?`+${netInjuryPoints}`:'0';
      $('teamSynergy').textContent=`Synergie +${Math.round(synergy.bonus*100)} % · Blessure ${injuryText} pts pour chaque membre`;
      $('teamSynergy').title=`Synergie : ${synergy.injuryPoints>0?'+':''}${synergy.injuryPoints} pts · ${protectionLabel(protection)}`;
    }else{
      $('teamSynergy').textContent='Équipe incomplète';
      $('teamSynergy').removeAttribute('title');
    }
    $('teamPower').textContent=members.length===3?String(partyPower(members)):'—';
    $('teamAvailability').textContent=game.raid?'Compagnons réservés jusqu’au retour du raid.':
      playerGuild()?`Escouade permanente choisie par ${playerGuild().leader}. Si un compagnon est blessé ou en raid, il faut attendre : pas de remplacement temporaire.`:`${freeNpcCandidates().length} aventurier(s) indépendant(s) disponible(s). Seuls les PNJ de votre univers participent.`;
    $('associationWorld').innerHTML=`<strong>Activité autonome de l'Association</strong>${(game.associationNpcRaids||[]).length} expédition(s) d'indépendants en cours. `+
      `${guildFreeAgents().filter(n=>n.injuryRemainingMs>0).length} indépendant(s) en convalescence.`+
      (game.associationNpcRaids||[]).slice(0,3).map(r=>`<div class="npc-status">⚔ ${escapeHtml(r.memberIds.map(id=>npcById(id)?.name||'').join(' · '))} — Rang ${r.rank}, ${Math.ceil(r.remainingMs/1000)} s</div>`).join('');
    if(ownGuild)$('associationWorld').innerHTML=`<strong>Activité autonome de votre guilde</strong>${ownGuild.raids.length} raid(s) financé(s) en cours. Rotation équipe ${(ownGuild.roundRobin||0)+1}. Le chef décide des départs. Les équipes permanentes ne sont pas recomposées.`;
    for(const el of document.querySelectorAll('.dungeon-choice')){
      const available=dungeonRankCanPreview(el.dataset.rank);
      el.hidden=false; // Montrer les six rangs ; verrouiller ceux qui sont inaccessibles.
      el.classList.toggle('selected',el.dataset.rank===rank);
      el.disabled=!!game.raid || !available;
      el.title=ownGuild?'Consultation seulement : votre chef décide des départs.':'Choisir un donjon de l’Association.';
    }
    // Compact Guild Master-style cards; probabilities use the existing Chronicles formula.
    const previewTeam=members.length===3?members:null;
    for(const button of document.querySelectorAll('.dungeon-choice')){
      const dungeonRank=button.dataset.rank;
      const def=DUNGEONS[dungeonRank];
      const chanceValue=previewTeam&&qualifiedForDungeon(previewTeam,dungeonRank)?(ownGuild?guildSuccessChance(dungeonRank,previewTeam):chanceForParty(dungeonRank,previewTeam)):null;
      const chanceLabel=chanceValue===null?'—':`${Math.round(chanceValue*100)} %`;
      const gross=LOOT_BY_RANK[dungeonRank];
      const cost=ownGuild?GUILD_RAID_DATA[dungeonRank].cost:0;
      const reward=ownGuild?Math.round(gross*(game.player.contract?.terms?.rate??GUILD_WAGE_RATE)).toLocaleString('fr-FR')+' or':`${Math.round(gross*.50*ASSOCIATION_PAY_RATE).toLocaleString('fr-FR')}–${Math.round(gross*.80*ASSOCIATION_PAY_RATE).toLocaleString('fr-FR')} or`;
      const rewardLabel=ownGuild?`Salaire (${pct(game.player.contract?.terms?.rate??GUILD_WAGE_RATE)})`:'Gain personnel estimé';
      button.innerHTML=`<span class="dungeon-rank-token dungeon-rank-${dungeonRank}">${dungeonRank}</span><span class="dungeon-card-text"><strong>Donjon rang ${dungeonRank}</strong><small>${def.durationMs/1000} s · ${ownGuild?`Frais guilde ${cost.toLocaleString('fr-FR')} or`:'Association : gratuit'} · Butin brut ${gross.toLocaleString('fr-FR')} or</small><small class="dungeon-card-reward">${rewardLabel} : <b>${reward}</b></small></span><b class="dungeon-card-chance">${chanceLabel}</b>`;
      button.setAttribute('aria-pressed',String(button.classList.contains('selected')));
    }
    $('dungeonSummaryTitle').textContent=`Donjon ${rank} · ${ownGuild?'Guilde':'Association'}`;
    $('dungeonSummaryDetails').textContent=`${members.length}/3 aventuriers · Chance ${chanceText} · ${ownGuild?'Départ automatique':'Départ manuel'}`;
    $('dungeonSummaryState').textContent=game.raid?'EN EXPÉDITION':isInjured()?'CONVALESCENCE':ownGuild?'ORDRES DU CHEF':members.length===3?'PRÊT':'EN ATTENTE';
    $('guildRaidDetails').hidden=!ownGuild;
    $('launchBtn').disabled=!!playerGuild()||!!game.raid||!!game.job||isInjured()||members.length!==3||!qualifiedForDungeon(members,selectedDungeon)||!dungeonRankIsAvailable(selectedDungeon);
  }
  function renderInjury(){
    const remaining=game.player.injuryRemainingMs;
    const injured=remaining>0;
    $('injuryDashboard').hidden=!injured;
    $('injuryRaid').hidden=!injured;
    $('injuryDashTimer').textContent=formatSecs(remaining);
    $('injuryRaidTimer').textContent=formatSecs(remaining);
    const initial=Math.max(1,game.player.injuryTotalMs||raidRecoveryMs());
    const progress=Math.max(0,Math.min(100,(1-remaining/initial)*100));
    $('injuryDashBar').style.width=progress+'%';$('injuryRaidBar').style.width=progress+'%';
    const inGuild=playerGuild();
    $('launchBtn').disabled=!!inGuild||!!game.raid||!!game.job||injured||playerRaidTeam().length!==3||!qualifiedForDungeon(playerRaidTeam(),selectedDungeon)||!dungeonRankIsAvailable(selectedDungeon);
    if(inGuild)$('launchBtn').textContent='Départ décidé par votre chef IA';
    else if(game.job)$('launchBtn').textContent='Au travail — patienter';
    else if(injured)$('launchBtn').textContent=`Convalescence : ${formatSecs(remaining)}`;
    else if(inGuild&&inGuild.gold<(GUILD_RAID_DATA[selectedDungeon]?.cost||0)+65)$('launchBtn').textContent='Financement insuffisant dans votre guilde';
    else if(game.raid)$('launchBtn').textContent='Expédition en cours ⌛';
    else if(playerRaidTeam().length!==3)$('launchBtn').textContent='Équipe indisponible — attendre';
    else if(!qualifiedForDungeon(playerRaidTeam(),selectedDungeon))$('launchBtn').textContent='Rang requis absent dans l’équipe';
    else $('launchBtn').textContent='Lancer l’expédition ⚔';
  }
  // L'affiliation (indépendant / guilde) n'est PAS un état du personnage.
  // Priorité : raid en cours > blessure/convalescence > disponibilité.
  function renderPlayerStatus(){
    if(!game)return;
    const el=$('headerCondition');
    if(!el)return;
    const guild=playerGuild();
    const guildRaid=guild?.raids?.find(r=>r.memberIds.includes('player'))||null;
    const raid=game.raid||guildRaid;
    let label,kind,description;
    if(game.mode==='season'&&game.season?.finished){
      kind='ready';label='✦ Saison terminée';description='Votre saison est achevée. Le calendrier est figé.';
    }else 
    if(raid){
      kind='expedition';
      label=`⚔ En expédition · ${Math.ceil(Math.max(0,raid.remainingMs)/1000)} s`;
      description=`En expédition dans un donjon de rang ${raid.rank}.`;
    }else if(game.job){
      kind='expedition';
      label=`⚒ Au travail · ${Math.ceil(game.job.remainingMs/1000)} s`;
      description='Votre aventurier effectue un petit boulot. Les donjons sont momentanément indisponibles.';
    }else if(game.player.injuryRemainingMs>0){
      kind='injured';
      label=`✚ Blessé · ${Math.ceil(game.player.injuryRemainingMs/1000)} s`;
      description='En convalescence dans votre logement. Les donjons sont indisponibles jusqu’à votre guérison.';
    }else{
      kind='ready';
      label='✓ Prêt à partir';
      description='Votre aventurier est rétabli et peut partir en expédition.';
    }
    if(el.textContent!==label)el.textContent=label;
    el.className=`condition-pill ${kind}`;
    el.title=description;
    el.parentElement.title=description;
  }
  // V14.3.1 : séparer la classe du badge de rang dans les fiches et listes publiques.
  function classRankMarkup(className,rank){
    const safeRank=RANKS.includes(rank)?rank:'E';
    return `<span class="class-label">${escapeHtml(className||'Aventurier')}</span><span class="rank-token rank-${safeRank} rank-emphasis" title="Rang ${safeRank}" aria-label="Rang ${safeRank}">${safeRank}</span>`;
  }
  function rankMarkup(rank){
    const safeRank=RANKS.includes(rank)?rank:'E';
    return `<span class="rank-token rank-${safeRank} rank-emphasis" title="Rang ${safeRank}" aria-label="Rang ${safeRank}">${safeRank}</span>`;
  }
  // V15.2 — tableau de suivi repartant de zero pour toutes les anciennes parties.
  // Le champ V15.1 est laisse intact pour ne pas supprimer les donnees historiques.
  // Seuls les nouveaux raids sont ajoutes aux compteurs de cette version.
  function ensurePlayerRankRecord(p){
    if(!p.raidStatsByRankV152||typeof p.raidStatsByRankV152!=='object'||Array.isArray(p.raidStatsByRankV152))p.raidStatsByRankV152={};
    for(const rank of RANKS){
      const entry=p.raidStatsByRankV152[rank];
      p.raidStatsByRankV152[rank]={won:Math.max(0,Math.floor(Number(entry?.won)||0)),lost:Math.max(0,Math.floor(Number(entry?.lost)||0))};
    }
  }
  function recordPlayerRankRaid(rank,success){
    if(!RANKS.includes(rank))return;
    ensurePlayerRankRecord(game.player);
    game.player.raidStatsByRankV152[rank][success?'won':'lost']++;
  }
  function playerRankTable(){
    const p=game.player;ensurePlayerRankRecord(p);
    return RANKS.map(rank=>{
      const {won,lost}=p.raidStatsByRankV152[rank];
      return `<tr><th scope="row"><span class="cv-rank-pill rank-${rank}">${rank}</span></th><td>${won.toLocaleString('fr-FR')}</td><td>${lost.toLocaleString('fr-FR')}</td><td>${(won+lost).toLocaleString('fr-FR')}</td></tr>`;
    }).join('');
  }
  function renderCV(){
    if(!game)return;
    const p=game.player,joined=playerGuild();
    const fmt=n=>Math.max(0,Number(n)||0).toLocaleString('fr-FR');
    $('cvAvatar').innerHTML=portraitImg({...p,id:'player'},'cv-portrait');
    $('cvName').textContent=p.name;
    $('cvClassRank').textContent=p.class;
    $('cvInlineRank').innerHTML=rankMarkup(p.rank);
    $('cvGuild').textContent=joined?joined.name:'Indépendant';
    $('cvPower').textContent=fmt(p.power);
    $('cvRep').textContent=fmt(p.rep);
    $('cvWealth').textContent=fmt(valueForAmbition(p,'gold'))+' or';
    $('cvRecovery').textContent=`${fmt(p.home?.recoverySeconds||38)} secondes`;
    const personalProtection=SLOTS.reduce((sum,slot)=>sum+(ITEM_BY_ID[p.equipment?.[slot]]?.injuryShieldPoints||0),0);
    $('cvInjuryProtection').textContent=personalProtection?`−${personalProtection} pt${personalProtection>1?'s':''} pour l'équipe`:'Aucune';
    $('cvStatus').textContent=game.raid?'En expédition':game.job?'Au travail':p.injuryRemainingMs>0?'Blessé':'Disponible';
    $('cvRaidsTotal').textContent=fmt(p.totalRaids);
    $('cvRaidsWon').textContent=fmt(p.successRaids);
    $('cvRaidsLost').textContent=fmt(p.failedRaids);
    $('cvInjuries').textContent=fmt(p.totalInjuries);
    const pct=p.rank==='S'?100:Math.min(100,Math.round(100*p.xp/XP_NEED[p.rank]));
    $('cvExperience').textContent=p.rank==='S'?'MAX':`${pct} %`;
    $('cvExperience').title=p.rank==='S'?'Rang maximal atteint':`${fmt(p.xp)} / ${fmt(XP_NEED[p.rank])} XP`;
    $('cvXpBar').style.width=pct+'%';
    $('cvXpBar').parentElement.title=$('cvExperience').title;
    $('cvRankRows').innerHTML=playerRankTable();
    const tracked=RANKS.reduce((sum,rank)=>{const row=p.raidStatsByRankV152[rank];sum.won+=row.won;sum.lost+=row.lost;return sum;},{won:0,lost:0});
    $('cvRankWonTotal').textContent=fmt(tracked.won);
    $('cvRankLostTotal').textContent=fmt(tracked.lost);
    $('cvRankAllTotal').textContent=fmt(tracked.won+tracked.lost);
    for(const [metric,id] of [['power','cvRankPower'],['rep','cvRankRep'],['gold','cvRankGold']]){
      const order=rankedAdventurers(metric);
      $(id).textContent=`${order.findIndex(n=>n.isPlayer||n.id==='player')+1} / ${order.length}`;
    }
  }
  function renderStats() {
    const p=game.player;
    $('sideAvatar').textContent=p.name.trim().charAt(0).toLocaleUpperCase('fr');
    $('sideName').textContent=p.name;
    $('sideClass').innerHTML=classRankMarkup(p.class,p.rank);
    $('headerGold').textContent=`${p.gold.toLocaleString('fr-FR')} or`;
    $('headerRep').textContent=p.rep.toLocaleString('fr-FR');
    $('heroName').textContent=p.name;
    $('heroDetails').textContent=`${p.class} · ${p.gender} · ${p.role}`;
    $('powerStat').textContent=p.power;
    $('heroRankBadge').textContent=p.rank;$('shieldRank').textContent=p.rank;$('shieldCaption').textContent=p.rank==='S'?'AVENTURIER D’ÉLITE':`AVENTURIER RANG ${p.rank}`;
    $('sideClass').innerHTML=classRankMarkup(p.class,p.rank);
    const joined=playerGuild();
    $('headerGuild').textContent=joined?joined.name:'Indépendant';
    renderPlayerStatus();
    $('heroAffiliation').textContent=joined?`Membre de ${joined.name} • Affectation par votre chef`:'Association des aventuriers • Aventurier indépendant';
    $('dashMissionAvailability').textContent=game.raid?'EN EXPÉDITION':game.job?'AU TRAVAIL':isInjured()?'BLESSÉ':'DISPONIBLE';
    $('dashMissionAvailability').classList.toggle('green',!game.raid&&!game.job&&!isInjured());
    $('dashNextMissionDescription').textContent=joined?`Vous êtes membre de ${joined.name}. Votre chef prépare et finance vos expéditions ; surveillez les ordres de départ.`:'Un raid accessible aux aventuriers indépendants, entièrement financé par l’Association.';
    $('loadoutSummary').textContent=`${SLOTS.filter(slot=>!!p.equipment[slot]).length} / 3 objets équipés`;
    $('dashPosition').textContent=`#${placement()} sur ${allAdventurers().length} aventuriers`;
    $('dashHomeName').textContent=p.home.name;
    $('dashHomeQuality').textContent=`Qualité ${p.home.tier} / V · Résidence principale`;
    $('dashHomeRecovery').textContent=`${p.home.recoverySeconds} secondes`;
    $('dashHomeExplain').textContent=`En cas de blessure, votre résidence vous soigne en ${p.home.recoverySeconds} secondes, quel que soit votre rang.`;
    $('goldStat').innerHTML=`${p.gold.toLocaleString('fr-FR')} <small>or</small>`;
    $('repStat').textContent=p.rep.toLocaleString('fr-FR');
    $('xpStat').innerHTML=`${p.xp.toLocaleString('fr-FR')} <small>XP</small>`;
    $('xpNote').textContent=p.rank==='S'?'Rang maximal atteint':`${p.xp} / ${XP_NEED[p.rank]} XP vers ${RANKS[getRankIndex(p.rank)+1]}`;
    $('xpProgress').style.width=(p.rank==='S'?100:Math.min(100,p.xp/XP_NEED[p.rank]*100))+'%';
    $('clockText').textContent=game.mode==='season'?`${stamp()} · Saison ${game.season?.finished?'terminée':'1 an'}`:stamp();
    renderInjury();renderCV();
  }
  // V13.12.5 : l'équipe reste visible à droite ; les raids se suivent EN DESSOUS
  // de la barre de lancement, comme dans Guild Master. Les résultats restent
  // dans les notifications, jamais dans le panneau de composition.
  function renderRaid() {
    if(!game)return;
    const own=playerGuild();
    const raids=own ? (own.raids||[]) : (game.raid?[game.raid]:[]);
    const max=own?GUILD_TEAM_SLOTS[guildLevel(own)]:1;
    const badge=$('raidStatus');
    badge.textContent=game.raid?'EN EXPÉDITION':own?'ÉQUIPE FIXE':'PRÉPARATION';
    $('activeExpeditionCount').textContent=`${raids.length}/${max}`;
    const container=$('ongoingExpeditions');
    if(!raids.length){
      delete container.dataset.raidIds;
      container.innerHTML='<p class="ongoing-empty">Aucune expédition en cours. Les résultats des raids terminés sont consultables dans Notifications.</p>';
      return;
    }
    // Mise à jour légère : ne pas reconstruire les cartes et perdre le scroll
    // à chaque animation. Les détails restent figés au départ du raid.
    const ids=raids.map(r=>String(r.id||r.rank+'-'+(r.memberIds||[]).join('-')));
    if(container.dataset.raidIds!==JSON.stringify(ids)){
      container.dataset.raidIds=JSON.stringify(ids);
      container.innerHTML=raids.map((r,i)=>{
        const isPlayerRaid=own && ((r.memberIds||[]).includes('player')||(r.members||[]).some(m=>m.id==='player'||m.isPlayer));
        const members=(r.members||[]).map(m=>`<span class="ongoing-member">${escapeHtml(m.name||'Aventurier')} · ${escapeHtml(m.class||'')}</span>`).join('');
        return `<article class="ongoing-raid-card${isPlayerRaid?' is-player-raid':''}" data-ongoing-index="${i}"><div class="ongoing-raid-top"><strong>⚔ Donjon ${escapeHtml(r.rank)}${own?' · '+escapeHtml(own.name):' · Association'}${isPlayerRaid?' <span class="own-raid-badge">★ MON ÉQUIPE</span>':''}</strong><b data-ongoing-percent>0 %</b></div><div class="ongoing-raid-sub">${own?'Expédition financée par la guilde':'Expédition de l’Association'} · Chance au départ : ${Math.round((r.chance||0)*100)} %</div><div class="ongoing-members">${members}</div><div class="ongoing-progress-track"><div class="ongoing-progress-fill" data-ongoing-fill></div></div><small data-ongoing-remaining>En cours…</small></article>`;
      }).join('');
    }
    raids.forEach((r,i)=>{
      const card=container.querySelector(`[data-ongoing-index="${i}"]`);
      if(!card)return;
      const duration=Math.max(1,Number(r.durationMs)||Number(DUNGEONS[r.rank]?.durationMs)||1);
      const remaining=Math.max(0,Number(r.remainingMs)||0);
      const progress=clamp((1-remaining/duration)*100,0,100);
      card.querySelector('[data-ongoing-percent]').textContent=`${Math.round(progress)} %`;
      card.querySelector('[data-ongoing-fill]').style.width=`${progress}%`;
      card.querySelector('[data-ongoing-remaining]').textContent=`${(remaining/1000).toFixed(1).replace('.',',')} s restantes`;
    });
  }
  // Les anciennes sauvegardes restent intactes : les messages sont reformulés à l'affichage.
  // Les mécanismes internes de récupération de l'Association ne sont jamais exposés.
  function playerFacingEventDetail(detail){
    let text=String(detail||'').trim();
    text=text.replace(/Association\s*:\s*(?:50|55|60|65|70|75|80)\s*%\s*des ressources récupérées\s*\([\d\s.,]+\s*or\)\s*·\s*votre part de 10\s*%\s*:\s*\+([\d\s.,]+)\s*or/gi,
      (_match,gold)=>`Vous recevez ${gold} pièces d’or de l’Association.`);
    text=text.replace(/\s*\(chance estimée\s*\d+\s*%\)/gi,'');
    text=text.replace(/\bAucun or\s*·\s*\+(\d+) XP d'expérience\.?/gi,(_m,xp)=>`Aucun butin récupéré. Vous gagnez ${xp} points d’expérience.`);
    text=text.replace(/\bSalaire\s*\+(\d+) or\s*·\s*\+(\d+) XP\s*·\s*\+(\d+) réputation\.?/gi,
      (_m,gold,xp,rep)=>`Vous recevez ${gold} pièces d’or de salaire, ${xp} points d’expérience et ${rep} points de réputation.`);
    text=text.replace(/\bAucun salaire\s*·\s*\+(\d+) XP\.?/gi,(_m,xp)=>`Vous ne recevez aucun salaire, mais gagnez ${xp} points d’expérience.`);
    text=text.replace(/\bRécompense de l’Association\s*:\s*\+(\d+) or\s*·\s*\+(\d+) XP\s*·\s*\+(\d+) réputation\.?/gi,
      (_m,gold,xp,rep)=>`Vous recevez ${gold} pièces d’or, ${xp} points d’expérience et ${rep} points de réputation.`);
    text=text.replace(/\bConvalescence de (\d+) secondes dans votre logement\.?/gi,
      (_m,sec)=>`Vous avez été blessé pendant l’expédition. Votre convalescence durera ${sec} secondes dans votre logement.`);
    text=text.replace(/\b(\d+) bien\(s\) ont versé (.+?) de revenus nets\.?$/i,(_m,_n,gold)=>`Vos investissements vous ont rapporté ${gold} de revenus nets.`);
    text=text.replace(/\b(\d+) facture\(s\) réglée\(s\) pour (.+?)\.?$/i,(_m,n,gold)=>`Vous avez réglé ${n} factures pour un total de ${gold}.`);
    text=text.replace(/\b(\d+) investissement\(s\)/gi,(_m,n)=>`${n} investissement${n==='1'?'':'s'}`);
    text=text.replace(/\b(\d+) facture\(s\)/gi,(_m,n)=>`${n} facture${n==='1'?'':'s'}`);
    text=text.replace(/\b(\d+) message\(s\)/gi,(_m,n)=>`${n} message${n==='1'?'':'s'}`);
    return text;
  }
  function playerFacingEvent(ev){
    let title=String(ev?.title||'Information').trim();
    let detail=playerFacingEventDetail(ev?.detail);
    // Anciennes sauvegardes : titres et formulations techniques deviennent des phrases lisibles.
    if(/^victoire en guilde|^victoire de votre guilde/i.test(title))title='Expédition de guilde réussie';
    else if(/^échec en guilde|^défaite en guilde/i.test(title))title='Expédition de guilde échouée';
    else if(/^victoire dans le donjon ([EDCBAS])/i.test(title))title=title.replace(/^victoire dans le donjon/i,'Expédition réussie : donjon de rang');
    else if(/^échec dans le donjon ([EDCBAS])/i.test(title))title=title.replace(/^échec dans le donjon/i,'Expédition échouée : donjon de rang');
    if(/^victoire en guilde|^échec en guilde|^expédition de guilde (réussie|échouée)/i.test(String(ev?.title||''))){
      detail=detail.replace(/^(.+?)\s*[·:]\s*donjon\s*([EDCBAS])\.\s*/i,(_m,guild,rank)=>`Votre équipe de ${guild} est revenue du donjon de rang ${rank}. `);
    }
    if(/^candidature refusée$/i.test(title))detail=detail.replace(/\s*\(chance estimée\s*\d+\s*%\)/gi,'');
    if(/^départ en expédition$/i.test(title)){
      detail=detail.replace(/^Donjon ([EDCBAS])\s*:\s*(.+?)\.\s*Expédition gratuite organisée par l’Association\.?$/i,
        (_m,rank,members)=>`Votre équipe (${members}) part explorer un donjon de rang ${rank}. L’Association organise cette expédition gratuitement.`);
    }
    return {title,detail};
  }
  function eventMinute(ev){
    if(Number.isFinite(ev?.atMinute))return ev.atMinute;
    const match=/Jour\s*(\d+)\s*[·-]\s*(\d{1,2}):(\d{2})/.exec(String(ev?.at||''));
    return match?(Number(match[1])-1)*1440+Number(match[2])*60+Number(match[3]):null;
  }
  function eventAge(ev){
    const when=eventMinute(ev);
    if(when===null)return String(ev?.at||'');
    const diff=Math.max(0,Math.floor(game.worldMinutes)-when);
    if(diff<1)return 'À l’instant';
    if(diff<60)return `Il y a ${diff} min`;
    if(diff<1440)return `Il y a ${Math.floor(diff/60)} h`;
    const days=Math.floor(diff/1440);
    return `Il y a ${days} jour${days>1?'s':''}`;
  }
  function eventAppearance(ev){
    const title=String(ev?.title||'').toLocaleLowerCase('fr');
    let tone={raid:'depart',success:'success',failure:'failure',injury:'injury',recovery:'recovery',rank:'rank',shop:'shop',info:'info'}[ev?.kind]||'info';
    if(/contrat|recrutement|candidature|guilde|escouade|négociation/.test(title)&&tone==='info')tone='guild';
    if(/intérêts|revenus|patrimoine|investissement|loyer|crédit remboursé|charge payée/.test(title)&&tone==='success')tone='income';
    if(/dette|facture|prêt en retard|saisie|insolvabilité|mise en demeure|avis avant saisie/.test(title)&&tone==='failure')tone='debt';
    if(/banque|prêt|charges/.test(title)&&tone==='info')tone='finance';
    return tone;
  }
  function renderEvents(){
    const personal=(game.events||[]).filter(ev=>ev&&ev.kind!=='npc');
    $('eventCount').textContent=`${personal.length} NOTIFICATION${personal.length>1?'S':''}`;
    const symbols={info:'✦',depart:'➜',success:'✓',failure:'✕',injury:'✚',recovery:'◷',rank:'★',shop:'⚒',guild:'♜',income:'◆',debt:'!',finance:'▣'};
    const labels={info:'Information',depart:'Départ en expédition',success:'Expédition / Réussite',failure:'Échec',injury:'Blessure',recovery:'Rétablissement',rank:'Progression',shop:'Équipement / Achat',guild:'Vie de guilde',income:'Revenus',debt:'Alerte financière',finance:'Banque / Charges'};
    $('events').innerHTML=personal.length?personal.map(ev=>{
      const tone=eventAppearance(ev),message=playerFacingEvent(ev);
      return `<article class="event event-${tone}" role="listitem"><div class="event-icon" aria-hidden="true">${symbols[tone]||'✦'}</div><div class="event-copy"><small class="event-category">${labels[tone]}</small><strong>${escapeHtml(message.title)}</strong><p>${escapeHtml(message.detail)}</p></div><time title="${escapeHtml(String(ev.at||''))}">${escapeHtml(eventAge(ev))}</time></article>`;
    }).join(''):'<p class="empty-events">Aucune notification pour le moment. Vos prochains événements apparaîtront ici.</p>';
  }
  function renderAll(){if(!game)return;renderStats();renderRaid();renderEvents();renderTeamPreview();renderAmbition();if(page==='finance'){renderHousing();renderJobs();renderInvestments();setFinanceMode(financeMode);}if(page==='bank')renderBank();if(page==='debts')renderDebts();if(page==='shop'||page==='inventory')renderShop();renderRanking();if(page==='guilds'||page==='association')renderGuilds();renderMailBadge();if(page==='mail')renderMail();goToPage(page,true);}
  // V15.10 — La vitesse est un choix de partie. La simulation utilise un seul
  // delta accéléré pour le monde et TOUS les compteurs ; l'interface et les
  // sauvegardes automatiques gardent leur cadence en temps réel.
  function updateSpeedUI(){
    const speed=SIM_SPEEDS.includes(game?.simSpeed)?game.simSpeed:1;
    for(const button of document.querySelectorAll('[data-sim-speed]')){
      const selected=Number(button.dataset.simSpeed)===speed;
      button.classList.toggle('active',selected);
      button.setAttribute('aria-pressed',String(selected));
      button.disabled=!game||!!game.gameOver||!!game.season?.finished;
    }
  }
  function changeSpeed(speed){
    if(!game||game.gameOver||game.season?.finished||!SIM_SPEEDS.includes(speed))return;
    if(game.simSpeed===speed)return;
    game.simSpeed=speed;
    lastFrame=performance.now(); // Pas de rattrapage en changeant de vitesse.
    updateSpeedUI();
    saveGame();
  }
  // V13 — Pause intégrale du monde. Le calendrier et TOUS les compteurs
  // (raids de guilde/Association, blessures, emplois, IA, arène, banque, dettes)
  // passent exclusivement par tick() ou ses fonctions appelées.
  function updatePauseUI(){
    const paused=!!game?.paused;
    const button=$('pauseBtn');
    button.textContent=paused?'▶ Reprendre':'⏸ Pause';
    button.title=paused?'Reprendre la simulation':'Mettre le jeu en pause';
    button.setAttribute('aria-pressed',String(paused));
    button.classList.toggle('paused',paused);
    button.disabled=!game||!!game.gameOver||!!game.season?.finished;
    $('pauseNotice').hidden=!paused;
    $('app').classList.toggle('is-paused',paused);
  }
  function togglePause(){
    if(!game||game.gameOver||game.season?.finished)return;
    game.paused=!game.paused;
    lastFrame=performance.now(); // AUCUN rattrapage du temps de pause.
    updatePauseUI();
    sound(game.paused?'pause':'resume');
    saveGame();
  }
  // Pendant la pause, la lecture des pages / contrats / messages reste libre.
  // Les achats, missions, signatures, paiements, démissions, etc. sont bloqués
  // pour éviter toute transaction sans écoulement du temps du monde.
  const pausedNavigationIds=new Set(['fromDashToRaid','dashShop','dashRanking','dashToHousing']);
  $('app').addEventListener('click',event=>{
    if(!game?.paused)return;
    const button=event.target.closest('button');
    if(!button)return;
    const allowed=button.id==='pauseBtn'||button.id==='saveBtn'||button.id==='homeBtn'||button.hasAttribute('data-sim-speed')||
      button.classList.contains('nav-btn')||button.classList.contains('dungeon-choice')||
      button.classList.contains('cw-min')||button.classList.contains('cw-max')||button.classList.contains('cw-close')||pausedNavigationIds.has(button.id)||
      button.id==='audioBtn'||button.id==='audioTest'||
      button.hasAttribute('data-mail')||button.hasAttribute('data-ranking-metric')||
      button.hasAttribute('data-guild-tab')||button.hasAttribute('data-guild-filter')||
      ['mailReadAll','mailDeleteSelected','mailDeleteAll','mailToggleRead','mailDeleteCurrent'].includes(button.id);
    if(allowed)return;
    event.preventDefault();
    event.stopImmediatePropagation();
    notify('Jeu en pause : cliquez sur Reprendre pour effectuer cette action.');
  },true);
  function tick(time) {
    const realDt=clamp((time-lastFrame)/1000,0,.22);
    lastFrame=time;
    const dt=realDt*(SIM_SPEEDS.includes(game?.simSpeed)?game.simSpeed:1); // Temps SIMULÉ commun à tout le monde.
    if(game && !game.paused && !game.gameOver && !game.season?.finished && $('welcome').hidden && !document.hidden) {
      if(game.mode==='season' && game.worldMinutes>=seasonDeadline()){
        // Une activité entamée avant la date limite peut se terminer, mais
        // le monde, son économie et les décisions PNJ n'avancent plus.
        if(game.raid&&game.raid.source!=='guild'){game.raid.remainingMs=Math.max(0,game.raid.remainingMs-dt*1000);if(!game.raid.remainingMs)finishRaid();else if(page==='association')renderRaid();}
        for(const g of game.guilds)for(const raid of [...(g.raids||[])]){
          raid.remainingMs=Math.max(0,raid.remainingMs-dt*1000);
          if(!raid.remainingMs)guildFinishRaid(g,raid);
        }
        if(page==='association')renderRaid();
        if(game.job){game.job.remainingMs=Math.max(0,game.job.remainingMs-dt*1000);if(!game.job.remainingMs)finishSideJob();else if(page==='finance')renderJobProgress();}
        if(!game.raid&&!game.job)finishSeason();
        requestAnimationFrame(tick);return;
      }
      game.worldMinutes=game.mode==='season'?Math.min(seasonDeadline(),game.worldMinutes+dt*GAME_MINUTES_PER_REAL_SECOND):game.worldMinutes+dt*GAME_MINUTES_PER_REAL_SECOND;
      associationNpcSimTick(dt);
      guildSimTick(dt);
      bankTick();
      economicTick();
      if(game.gameOver){requestAnimationFrame(tick);return;}
      investmentTick();
      if(game.job){game.job.remainingMs=Math.max(0,game.job.remainingMs-dt*1000);if(!game.job.remainingMs)finishSideJob();else if(page==='finance')renderJobProgress();}
      if(game.worldMinutes>=game.careerNextReviewMinute){careerTick();game.careerNextReviewMinute=game.worldMinutes+CAREER_REVIEW_MINUTES;if(page==='mail')renderMail();}
      if(game.worldMinutes>=game.nextNpcWorldMinute){
        // One step at a time; no uncontrolled backlog on long frames.
        npcEquipmentTick();game.nextNpcWorldMinute=game.worldMinutes+NPC_STEP_MINUTES;
        if(page==='dashboard')renderStats();
      }
      if(game.raid && game.raid.source!=='guild') {
        game.raid.remainingMs=Math.max(0,game.raid.remainingMs-dt*1000);
        if(game.raid.remainingMs<=0)finishRaid();
        else if(page==='association')renderRaid();
      }
      if(game.player.injuryRemainingMs>0){
        game.player.injuryRemainingMs=Math.max(0,game.player.injuryRemainingMs-dt*1000);
        if(game.player.injuryRemainingMs===0){
          game.player.injuryTotalMs=0;
          logEvent('Convalescence terminée','Vous êtes remis de votre blessure et pouvez participer à un nouveau raid.','recovery');
          saveGame();renderAll();notify('Votre aventurier est rétabli !');
        }
      }
      if(page==='guilds'){guildRenderCountdown+=realDt;if(guildRenderCountdown>=1){renderGuilds();guildRenderCountdown=0;}}
      if(page==='ranking'){guildRenderCountdown+=realDt;if(guildRenderCountdown>=2){renderRanking();guildRenderCountdown=0;}}
      if(page==='association'){associationRenderCountdown+=realDt;if(associationRenderCountdown>=.7){renderTeamPreview();renderInjury();renderRaid();associationRenderCountdown=0;}}
      timeSinceClockRender+=realDt;
      if(timeSinceClockRender>.15){
        $('clockText').textContent=game.mode==='season'?`${stamp()} · Saison` : stamp();renderInjury();renderPlayerStatus();if(page==='dashboard')renderSeasonProgress();if(page==='mail')updateOfferRemainingTime();timeSinceClockRender=0;
      }
      compactRankingElapsed+=realDt;
      if(compactRankingElapsed>=2){compactRankingElapsed=0;renderRanking();}
      timeSinceSave+=realDt;
      if(timeSinceSave>=2){saveGame();timeSinceSave=0;}
    }
    requestAnimationFrame(tick);
  }
  function updateModeDescription(){
    const mode=$('gameMode').value;
    $('seasonObjectiveWrap').hidden=mode!=='season';
    $('modeHelp').textContent=mode==='season'
      ?'365 jours du jeu (environ 29 h réelles au rythme actuel, en plusieurs sessions). Objectif fixé à la création. Classement final et arrêt du monde à l’échéance.'
      :'Aucune limite de jours. Votre aventure, les guildes et votre patrimoine évoluent tant que vous jouez.';
  }
  $('gameMode').addEventListener('change',updateModeDescription);
  $('newCareer').addEventListener('click',openForm);
  $('saveList').addEventListener('click',async event=>{
    const button=event.target.closest('button[data-action]');if(!button)return;
    const slot=getSlot(button.dataset.id);
    if(!slot){notify('Partie introuvable.');renderSaveList();return;}
    const action=button.dataset.action;
    if(action==='load')startGame(slot);
    else if(action==='export')exportSlot(slot);
    else if(action==='delete'){
      if(!confirm(`Supprimer définitivement « ${slot.label} » (${formatGameDate(slot.data.worldMinutes)}) ? Cette action est irréversible. Exportez-la avant si vous souhaitez la garder.`))return;
      try{await deleteSlotDurably(slot.id);renderSaveList();notify('Partie supprimée de cette version. Les anciennes éditions restent intactes.');}
      catch(error){console.error('Suppression impossible',error);notify('Impossible de supprimer cette partie.');}
    }
  });
  $('importFileBtn').addEventListener('click',()=>$('saveFile').click());
  $('saveFile').addEventListener('change',async e=>{
    const file=e.target.files[0];if(!file)return;
    try{if(file.size>25_000_000)throw Error('Fichier trop volumineux (25 Mo maximum)');await importSave(await file.text());}
    catch(err){notify('Import impossible : '+err.message);}
    finally{e.target.value='';}
  });
  $('pasteImportBtn').addEventListener('click',()=>{
    $('pasteImportArea').hidden=!$('pasteImportArea').hidden;
    if(!$('pasteImportArea').hidden)$('pasteSaveData').focus();
  });
  $('cancelPaste').addEventListener('click',()=>{$('pasteImportArea').hidden=true;$('pasteSaveData').value='';});
  $('confirmPaste').addEventListener('click',async()=>{
    if(await importSave($('pasteSaveData').value)){$('pasteImportArea').hidden=true;$('pasteSaveData').value='';}
  });
  $('cancelForm').addEventListener('click',()=>{$('characterForm').hidden=true;$('welcomeActions').hidden=false;renderSaveList();});
  function refreshCreationPortraits(){
    const gender=document.querySelector('input[name="gender"]:checked')?.value||'Homme';
    const select=$('creationPortraitSelect');
    const old=Number(select.value)||1;
    select.innerHTML=Array.from({length:25},(_,i)=>`<option value="${i+1}">Portrait ${i+1}</option>`).join('');
    select.value=String(old);
    $('creationPortraitPreview').src=portraitPath({id:'player',gender,portraitNumber:Number(select.value)});
  }
  document.querySelectorAll('input[name="gender"]').forEach(r=>r.addEventListener('change',refreshCreationPortraits));
  $('creationPortraitSelect').addEventListener('change',refreshCreationPortraits);
  refreshCreationPortraits();
  $('portraitPrev').addEventListener('click',()=>setPlayerPortrait((game?.player.portraitNumber||1)-1));
  $('portraitNext').addEventListener('click',()=>setPlayerPortrait((game?.player.portraitNumber||1)+1));
  $('characterForm').addEventListener('submit',async e=>{
    e.preventDefault();
    const name=$('playerName').value.trim().replace(/\s+/g,' ');
    const label=$('partyName').value.trim().replace(/\s+/g,' ');
    if(name.length<2||name.length>22){notify('Le pseudo doit compter entre 2 et 22 caractères.');return;}
    if(!label||label.length>36){notify('Indiquez un nom de partie (36 caractères maximum).');return;}
    const cls=$('playerClass').value;if(!CLASSES[cls])return;
    const gender=document.querySelector('input[name="gender"]:checked')?.value||'Homme';
    const mode=$('gameMode').value==='season'?'season':'free';
    const objective=AMBITIONS[$('seasonObjective').value]&&mode==='season' ? $('seasonObjective').value : 'power';
    const data=createCharacter(name,cls,gender,mode,objective);
    data.guilds=initialGuilds(data.population);assignNpcPortraits(data.population);data.player.portraitNumber=Number($('creationPortraitSelect').value)||1;data.guildNews=[];
    const slot=makeSlot(data,label);
    if(!await persistSlotDurably(slot))return;
    startGame(slot);
    logEvent('Début de carrière',`${name} rejoint le registre de l’Association des aventuriers, au rang E.`);
    saveGame();notify(mode==='season'?'Saison de 365 jours lancée !':'Nouvelle partie libre créée !');
  });
  for(const el of document.querySelectorAll('.nav-btn'))el.addEventListener('click',()=>{if(window.ChroniclesDesktop?.isForeground(el.dataset.page)){window.ChroniclesDesktop.minimize(el.dataset.page);return;}if(page!==el.dataset.page)sound('navigate');goToPage(el.dataset.page);});
  $('fromDashToRaid').addEventListener('click',()=>goToPage('association'));
  $('dashShop').addEventListener('click',()=>goToPage('shop'));
  $('mailList').addEventListener('change',e=>{const c=e.target.closest('[data-mail-select]');if(!c)return;if(c.checked)checkedMails.add(c.dataset.mailSelect);else checkedMails.delete(c.dataset.mailSelect);$('mailSelectAll').checked=game.messages.every(m=>checkedMails.has(m.id));});
  $('mailSelectAll').addEventListener('change',e=>{checkedMails.clear();if(e.target.checked)for(const m of game?.messages||[])checkedMails.add(m.id);renderMail();});
  $('mailReadAll').addEventListener('click',markAllMailRead);
  $('mailDeleteSelected').addEventListener('click',()=>{if(!checkedMails.size){notify('Sélectionnez au moins un courrier.');return;}if(confirm(`Supprimer ${checkedMails.size} message(s) sélectionné(s) ?`))deleteMessages([...checkedMails]);});
  $('mailDeleteAll').addEventListener('click',()=>{if(!game?.messages?.length)return;if(confirm('Supprimer tous les messages non protégés ?'))deleteMessages(game.messages.map(m=>m.id));});
  $('mailToggleRead').addEventListener('click',()=>{const m=game?.messages?.find(x=>x.id===selectedMailId);if(!m)return;m.read=!m.read;saveGame();renderMail();});
  $('mailDeleteCurrent').addEventListener('click',()=>{const m=game?.messages?.find(x=>x.id===selectedMailId);if(m&&!mailIsProtected(m)&&confirm('Supprimer ce courrier ?'))deleteMessages([m.id]);});
  $('mailList').addEventListener('click',e=>{const b=e.target.closest('button[data-mail]');if(!b||!game)return;sound('select');selectedMailId=b.dataset.mail;const m=game.messages.find(m=>m.id===selectedMailId);if(m){m.read=true;renderMail();saveGame();}});
  $('mailContent').addEventListener('input',e=>{if(e.target.matches('#offerAskRate, #offerAskRisk'))recordCounterOfferDraft();});
  $('mailContent').addEventListener('change',e=>{if(e.target.matches('#offerAskRate, #offerAskRisk'))recordCounterOfferDraft();});
  $('mailContent').addEventListener('click',e=>{
    const b=e.target.closest('button[data-offer-action]');if(!b||!game)return;
    e.preventDefault(); // Never submit/navigate a browser page for a contract action.
    e.stopPropagation();
    if(b.dataset.offerAction==='accept')acceptContract(b.dataset.id);
    else if(b.dataset.offerAction==='reject')rejectContract(b.dataset.id);
    else if(b.dataset.offerAction==='negotiate'){
      // Use the LIVE field values before any re-render from the simulation.
      const rate=$('offerAskRate')?.value,risk=$('offerAskRisk')?.value;
      chiefNegotiate(b.dataset.id,rate,risk);
    }
  });
  $('dashRanking').addEventListener('click',()=>goToPage('ranking'));
  for(const b of document.querySelectorAll('[data-shop-mode]'))b.addEventListener('click',()=>{if(shopMode!==b.dataset.shopMode)sound('navigate');setShopMode(b.dataset.shopMode);});
  for(const b of document.querySelectorAll('[data-finance-mode]'))b.addEventListener('click',()=>{if(financeMode!==b.dataset.financeMode)sound('navigate');setFinanceMode(b.dataset.financeMode);});
  $('shopFilter').addEventListener('change',e=>{shopFilter=e.target.value;renderShop();});
  $('shopSetFilter').addEventListener('change',e=>{shopSetFilter=e.target.value;renderShop();});
  for(const id of ['rankingRows','worldRankingEntries','guildRoster','teamMembers']){
    const element=$(id);
    element.addEventListener('click',handleProfileActivation);
    element.addEventListener('keydown',handleProfileActivation);
  }
  $('npcProfileClose').addEventListener('click',closeNpcProfile);
  $('npcProfileOverlay').addEventListener('click',event=>{
    if(event.target===$('npcProfileOverlay'))closeNpcProfile();
  });
  document.addEventListener('keydown',event=>{
    if($('npcProfileOverlay').hidden)return;
    if(event.key==='Escape'){event.preventDefault();closeNpcProfile();}
    else if(event.key==='Tab'){
      // The NPC sheet is informational: keep keyboard focus on its close button.
      event.preventDefault();$('npcProfileClose').focus();
    }
  });
  $('guildRankingRows').addEventListener('click',e=>{const row=e.target.closest('[data-public-guild]');if(row)showPublicGuild(row.dataset.publicGuild);});
  $('guildRankingRows').addEventListener('keydown',e=>{const row=e.target.closest('[data-public-guild]');if(row&&['Enter',' '].includes(e.key)){e.preventDefault();showPublicGuild(row.dataset.publicGuild);}});
  $('publicGuildClose').addEventListener('click',closePublicGuild);
  $('publicGuildOverlay').addEventListener('click',e=>{if(e.target===$('publicGuildOverlay'))closePublicGuild();});
  $('publicGuildContent').addEventListener('click',e=>{const row=e.target.closest('[data-profile-id]');if(row){closePublicGuild();showNpcProfile(row.dataset.profileId);}});
  $('publicGuildContent').addEventListener('keydown',e=>{const row=e.target.closest('[data-profile-id]');if(row&&['Enter',' '].includes(e.key)){e.preventDefault();closePublicGuild();showNpcProfile(row.dataset.profileId);}});
  document.addEventListener('keydown',e=>{if($('publicGuildOverlay').hidden)return;if(e.key==='Escape'){e.preventDefault();closePublicGuild();}});
  $('rankingFilter').addEventListener('change',e=>{rankingFilter=e.target.value;renderRanking();});
  $('rankingMetrics').addEventListener('click',e=>{const btn=e.target.closest('[data-ranking-metric]');if(!btn)return;if(btn.dataset.rankingMetric==='guilds')rankingView='guilds';else{rankingView='adventurers';rankingMetric=btn.dataset.rankingMetric;}renderRanking();});
  $('worldRankingMetrics').addEventListener('click',e=>{const btn=e.target.closest('[data-world-ranking]');if(!btn)return;rankingMetric=btn.dataset.worldRanking;renderRanking();});
  $('worldRankingFull').addEventListener('click',()=>goToPage('ranking'));
  $('ambitionOptions').addEventListener('click',e=>{const btn=e.target.closest('[data-ambition]');if(btn)setAmbition(btn.dataset.ambition);});
  $('housingCatalog').addEventListener('click',e=>{const btn=e.target.closest('button[data-home-purchase]');if(btn)switchResidence(btn.dataset.homePurchase);});
  $('investmentMarket').addEventListener('click',e=>{const btn=e.target.closest('button[data-invest-buy]');if(btn)buyInvestment(btn.dataset.investBuy);});
  $('investmentPortfolio').addEventListener('click',e=>{const btn=e.target.closest('button[data-invest-sell]');if(btn)sellInvestment(btn.dataset.investSell);});
  $('jobCards').addEventListener('click',e=>{const btn=e.target.closest('button[data-job]');if(btn)beginSideJob(btn.dataset.job);});
  $('billList').addEventListener('click',e=>{const btn=e.target.closest('button[data-bill-pay]');if(btn)settleBill(btn.dataset.billPay);});
  $('payAllBills').addEventListener('click',settleAllBills);
  $('accountantHire').addEventListener('click',hireAccountant);
  $('accountantToggle').addEventListener('click',toggleAccountant);
  $('accountantBankToggle').addEventListener('click',toggleAccountantBank);
  $('bankDeposit').addEventListener('click',()=>bankTransfer('deposit'));
  $('bankWithdraw').addEventListener('click',()=>bankTransfer('withdraw'));
  $('bankLoanOffers').addEventListener('click',e=>{const btn=e.target.closest('[data-take-loan]');if(btn)takeLoan(Number(btn.dataset.takeLoan));});
  $('bankRepay').addEventListener('click',repayLoan);
  $('gameOverMenu').addEventListener('click',openWelcome);
  $('seasonEndMenu').addEventListener('click',openWelcome);
  $('dashToHousing').addEventListener('click',()=>goToPage('finance'));
  // V13.12.2: preserve the two independent scroll areas. The old V13.11
  // startup move would pull the team OUT of its scroll container.
  const teamScrollArea=document.querySelector('#page-association .dungeon-team-scroll-area');
  const teamPreview=document.querySelector('#page-association .team-preview');
  const associationWorld=document.querySelector('#page-association .association-world');
  if(teamScrollArea&&teamPreview&&teamPreview.parentElement!==teamScrollArea)
    teamScrollArea.appendChild(teamPreview);
  if(teamScrollArea&&associationWorld&&associationWorld.parentElement!==teamScrollArea)
    teamScrollArea.appendChild(associationWorld);
  // Prioritise the market and its KPIs, keep the owned portfolio below.
  const investmentMarketPanel=document.querySelector('#investmentMarket')?.closest('.investment-section');
  const investmentPortfolioPanel=document.querySelector('#investmentPortfolio')?.closest('.investment-section');
  const investmentMetrics=document.querySelector('#page-finance .investment-metrics');
  if(investmentMarketPanel&&investmentPortfolioPanel){
    investmentPortfolioPanel.parentNode.insertBefore(investmentMarketPanel,investmentPortfolioPanel);
    if(investmentMetrics)investmentMarketPanel.insertBefore(investmentMetrics,investmentMarketPanel.querySelector('.panel-heading'));
  }
  // Guild dashboard tabs: only presentation changes; no game state mutation.
  document.querySelectorAll('[data-guild-tab]').forEach(button=>button.addEventListener('click',()=>{
    const selected=button.dataset.guildTab;
    document.querySelectorAll('[data-guild-tab]').forEach(b=>{b.classList.toggle('active',b===button);b.setAttribute('aria-selected',b===button?'true':'false');});
    document.querySelectorAll('[data-guild-pane]').forEach(p=>p.classList.toggle('active',p.dataset.guildPane===selected));
    $('guildV156Body').scrollTop=0;
  }));
  // V15.6 — filtrage du journal existant, sans effacer ni modifier une seule notification.
  document.querySelectorAll('[data-guild-filter]').forEach(button=>button.addEventListener('click',()=>{
    guildActivityFilter=button.dataset.guildFilter;
    document.querySelectorAll('[data-guild-filter]').forEach(b=>{b.classList.toggle('active',b===button);b.setAttribute('aria-pressed',String(b===button));});
    $('guildV156Body').scrollTop=0;
    renderGuilds();
  }));
  $('guildFilter').addEventListener('change',e=>{guildView=e.target.value;renderGuilds();});
  $('guildCards').addEventListener('click',e=>{const apply=e.target.closest('button[data-apply]');if(apply){applyToGuild(apply.dataset.apply);return;}const card=e.target.closest('[data-guild]');if(card && playerGuild()){selectedGuildId=card.dataset.guild;renderGuilds();}});
  $('guildCareer').addEventListener('click',e=>{const btn=e.target.closest('button');if(!btn)return;if(btn.dataset.apply)applyToGuild(btn.dataset.apply);if(btn.dataset.guildAction==='resign')leaveGuild();if(btn.dataset.guildAction==='contract'){const g=playerGuild();const c=game.player.contract;if(g&&c){sendMail(g.name,'Votre exemplaire du contrat',`Contrat en vigueur chez ${g.name}.`,{type:'contract-copy',contract:{guildId:g.id,terms:c.terms}});goToPage('mail');selectedMailId=game.messages[0].id;game.messages[0].read=true;renderMail();saveGame();}}});
  $('page-inventory').addEventListener('click',e=>{const b=e.target.closest('button[data-gear]');if(!b||!game)return;if(b.dataset.gear==='equip'||b.dataset.gear==='unequip')equipItem(b.dataset.id);});
  $('page-shop').addEventListener('click',e=>{
    const b=e.target.closest('button[data-gear]');if(!b||!game)return;
    if(b.dataset.gear==='buy')buyItem(b.dataset.id);
    else if(b.dataset.gear==='equip'||b.dataset.gear==='unequip')equipItem(b.dataset.id);
    else if(b.dataset.gear==='sell')sellItem(b.dataset.id);
  });
  $('launchBtn').addEventListener('click',launchRaid);
  for(const button of document.querySelectorAll('.dungeon-choice'))button.addEventListener('click',()=>{
    if(!game||game.raid||!dungeonRankCanPreview(button.dataset.rank))return;
    selectedDungeon=button.dataset.rank;
    sound('navigate');renderTeamPreview();saveGame();
  });
  $('pauseBtn').addEventListener('click',togglePause);
  document.querySelectorAll('[data-sim-speed]').forEach(button=>button.addEventListener('click',()=>changeSpeed(Number(button.dataset.simSpeed))));
  $('saveBtn').addEventListener('click',()=>{sound('select');saveGame(true);});
  $('homeBtn').addEventListener('click',openWelcome);
  document.addEventListener('visibilitychange',()=>{saveGame();lastFrame=performance.now();});
  window.addEventListener('pagehide',()=>saveGame());
  initializeSaveStorage().catch(error=>{storageFailure(error);renderSaveList();requestAnimationFrame(tick);});
})();

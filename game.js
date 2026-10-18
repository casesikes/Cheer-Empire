'use strict';
const $=s=>document.querySelector(s);
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const SUF=['','K','M','B','T','Qa','Qi','Sx','Sp','Oc','No','Dc'];
function fmt(n){n=Number(n);if(!isFinite(n))return '0';if(n<1000)return n<10?n.toFixed(2):n.toFixed(n<100?1:0);
 const i=Math.min(SUF.length-1,Math.floor(Math.log10(n)/3));return (n/Math.pow(1000,i)).toFixed(2)+SUF[i];}
const num=(v,d=0)=>Number.isFinite(v)&&v>=0?v:d;
let S,tab='gym',sub='',lastSave=0,uid=0;
const newState=()=>({v:1,cash:BAL.startCash,life:0,xp:0,lvl:1,last:Date.now(),teams:[],ath:[],fac:{},up:{},bulk:1,
 market:[],marketAt:0,tut:0,endg:{clr:{}},cards:{},frag:0,pity:{e:0,l:0},eq:[],pk:{n:0},spon:{},sponC:{},hof:[],theme:0,eres:null,pres:null,ach:{},best:{},q:{day:0,wk:0,daily:[],weekly:[]},qc:{},qdone:0,cur:{pp:0,lp:0,dp:0},unl:{pp:false,lp:false,dp:false},nodes:{},resets:{p:0,a:0,r:0},runStart:0,ppRun:0,lpRun:0,rep:0,fame:0,ptime:0,rivals:{},comp:{entries:0,wins:0,trophies:0},season:{n:1,pts:0,played:0},hist:[],res:null,coaches:[],cmarket:[],stats:{recruited:0,trained:0},created:Date.now(),seq:1});
function newId(p){return p+(S.seq++).toString(36)+Math.random().toString(36).slice(2,5);}
// ---- save / load ----
function validate(o){if(!o||typeof o!=='object'||o.v!==1)return null;
 const d=Object.assign(newState(),o);d.cash=num(d.cash);d.life=num(d.life);d.xp=num(d.xp);d.lvl=Math.max(1,Math.floor(num(d.lvl,1)));
 d.last=num(d.last,Date.now());if(!Array.isArray(d.teams)||!Array.isArray(d.ath))return null;
 d.fac=d.fac&&typeof d.fac==='object'?d.fac:{};d.up=d.up&&typeof d.up==='object'?d.up:{};
 for(const f of FACILITIES)d.fac[f.id]=Math.min(f.max,Math.floor(num(d.fac[f.id])));
 for(const u of UPGRADES)d.up[u.id]=Math.min(u.max,Math.floor(num(d.up[u.id])));
 const tid=new Set(d.teams.map(t=>t.id));if(tid.size!==d.teams.length)return null;
 const aid=new Set();for(const a of d.ath){if(aid.has(a.id))return null;aid.add(a.id);if(a.team&&!tid.has(a.team))a.team=null;
  for(const k of['tum','stu','dan','pot'])a[k]=num(a[k],1);}
 d.teams.forEach(t=>{t.name=String(t.name||'Team').slice(0,30);t.chem=Math.min(100,num(t.chem));});
 d.ath.forEach(a=>{a.tr=Array.isArray(a.tr)?a.tr.filter(x=>TRAITS.some(y=>y.id===x)):[];});
 d.coaches=(Array.isArray(d.coaches)?d.coaches:[]).filter(c=>c&&c.id&&COACH_SPECS.some(x=>x.id===c.spec)).map(c=>({id:c.id,name:String(c.name).slice(0,30),spec:c.spec,lvl:Math.min(20,Math.max(1,Math.floor(num(c.lvl,1)))),xp:num(c.xp),team:tid.has(c.team)?c.team:null}));
 d.rep=num(d.rep);d.fame=num(d.fame);d.ptime=num(d.ptime);d.comp=Object.assign({entries:0,wins:0,trophies:0},d.comp);d.season=Object.assign({n:1,pts:0,played:0},d.season);d.rivals=d.rivals&&typeof d.rivals==='object'?d.rivals:{};d.hist=Array.isArray(d.hist)?d.hist.slice(-10):[];
 d.cur=Object.assign({pp:0,lp:0,dp:0},d.cur);d.unl=Object.assign({pp:false,lp:false,dp:false},d.unl);d.resets=Object.assign({p:0,a:0,r:0},d.resets);
 d.nodes=d.nodes&&typeof d.nodes==='object'?d.nodes:{};d.runStart=num(d.runStart);d.ppRun=num(d.ppRun);d.lpRun=num(d.lpRun);
 d.unl.pp=!!d.unl.pp&&d.lvl>=20;d.unl.lp=!!d.unl.lp&&d.unl.pp&&d.lvl>=40;d.unl.dp=!!d.unl.dp&&d.unl.lp&&d.lvl>=80;
 for(const k of['pp','lp','dp']){d.cur[k]=d.unl[k]?num(d.cur[k]):0;}
 for(const n of NODES)d.nodes[n.id]=d.unl[n.cur]?Math.min(n.max,Math.floor(num(d.nodes[n.id]))):0;
 d.ach=d.ach&&typeof d.ach==='object'?d.ach:{};d.best=d.best&&typeof d.best==='object'?d.best:{};d.qc=d.qc&&typeof d.qc==='object'?d.qc:{};d.qdone=num(d.qdone);
 d.q=Object.assign({day:0,wk:0,daily:[],weekly:[]},d.q);if(!Array.isArray(d.q.daily))d.q.daily=[];if(!Array.isArray(d.q.weekly))d.q.weekly=[];delete d._ap;
 d.endg=Object.assign({clr:{}},d.endg);d.pity=Object.assign({e:0,l:0},d.pity);d.pk=Object.assign({n:0},d.pk);d.frag=num(d.frag);d.theme=Math.floor(num(d.theme));
 d.cards=d.cards&&typeof d.cards==='object'?d.cards:{};for(const id of Object.keys(d.cards)){const c=d.cards[id];if(!CARDS.some(x=>x.id===id)||!c)delete d.cards[id];else{c.n=Math.max(1,Math.floor(num(c.n,1)));c.lvl=Math.min(10,Math.max(1,Math.floor(num(c.lvl,1))));}}
 d.eq=(Array.isArray(d.eq)?d.eq:[]).filter((id,i,a)=>d.cards[id]&&a.indexOf(id)===i);d.spon=d.spon&&typeof d.spon==='object'?d.spon:{};d.sponC=d.sponC&&typeof d.sponC==='object'?d.sponC:{};d.hof=Array.isArray(d.hof)?d.hof.slice(-60):[];
 d.cmarket=Array.isArray(d.cmarket)?d.cmarket.filter(c=>c&&c.id&&COACH_SPECS.some(x=>x.id===c.spec)):[];return d;}
function save(){try{S.last=Date.now();localStorage.setItem(BAL.saveKey,JSON.stringify(S));lastSave=Date.now();}catch(e){toast('Save failed: storage unavailable');}}
function load(){try{const r=localStorage.getItem(BAL.saveKey);if(r){const d=validate(JSON.parse(r));if(d)return d;toast('Save was invalid; started new game');}}catch(e){}return newState();}
// ---- derived values ----
const fr=id=>S.fac[id]||0,ur=id=>S.up[id]||0;
const athCap=()=>BAL.baseAthCap+BAL.athPerFloor*fr('floor')+2*ur('u_cap')+Math.floor(fx('cap'));
const teamCap=()=>1+Math.floor(fr('floor')/BAL.floorsPerTeam);
const skill=a=>(a.tum+a.stu+a.dan)/3;
const tuitMult=()=>(1+0.1*ur('u_tuit')+0.05*ur('u_market')+S.rep/1000)*(1+0.06*fr('lounge'))*(1+fx('tuit'))*(1+Math.min(0.5,apTotal()*0.002));
const trainMult=()=>(1+0.1*ur('u_train'))*(1+0.08*fr('tumble'))*(1+fx('train'));
const offEff=()=>Math.min(1,BAL.offlineEff+0.1*ur('u_off')+fx('offl'));
const recruitDisc=()=>Math.max(0.2,1-0.03*fr('office')-fx('rdisc'));
const lvlNeed=l=>BAL.levelBase*Math.pow(BAL.levelGrowth,l-1);
function income(){let t=0;for(const a of S.ath)if(a.team)t+=(BAL.tuitionBase+skill(a)*BAL.tuitionPerSkill)*(hasT(a,'steady')?1.1:1);return t*tuitMult()+sponPay();}
function upkeep(){let r=0;for(const f of FACILITIES)r+=fr(f.id);return r*BAL.upkeep*Math.max(.1,1-fx('upk'))*(1+S.teams.length*0.1)+coachPay();}
// ---- bulk purchase engine ----
function bulkCost(def,rank,n){const g=def.g;return (def.cur?1:costMult())*def.base*Math.pow(g,rank)*(Math.pow(g,n)-1)/(g-1);}
function bulkQty(def,rank,want,budget){const room=def.max-rank;if(room<=0)return 0;
 if(want==='max'){let n=Math.floor(Math.log(budget*(def.g-1)/((def.cur?1:costMult())*def.base*Math.pow(def.g,rank))+1)/Math.log(def.g));n=Math.max(0,Math.min(room,n||0));
  while(n>0&&bulkCost(def,rank,n)>budget)n--;return n;}
 return Math.min(want,room);}
function buy(kind,id){const def=(kind==='fac'?FACILITIES:UPGRADES).find(x=>x.id===id);const map=kind==='fac'?S.fac:S.up;
 const r=map[id]||0;const n=bulkQty(def,r,S.bulk,S.cash);const c=n?bulkCost(def,r,n):0;
 if(!n||c>S.cash||(S.bulk!=='max'&&n<S.bulk&&bulkCost(def,r,S.bulk)>S.cash))return toast('Cannot afford that');
 S.cash-=c;map[id]=r+n;gainXp(Math.sqrt(c));toast('Bought '+n+'x '+def.name);save();render();}
function gainXp(x){S.xp+=x*(1+fx('xp'));let up=false;while(S.xp>=lvlNeed(S.lvl)){S.xp-=lvlNeed(S.lvl);S.lvl++;up=true;
 const u=UNLOCKS.find(u=>u[0]===S.lvl);toast('Level '+S.lvl+(u?' — Unlocked: '+u[1]:''));}return up;}
// ---- simulation ----
function simulate(sec){sec=Math.max(0,Math.min(sec,86400));if(!sec)return{earned:0};S.ptime=num(S.ptime)+sec;
 const net=(income()-upkeep())*sec;const earned=Math.max(net,-S.cash);S.cash=Math.max(0,S.cash+net);if(earned>0){S.life+=earned;gainXp(earned*0.02);}
 if(S.lvl>=5){const pm=1+0.04*fr('recovery');for(const a of S.ath){if(!a.team)continue;const room=Math.max(0,1-skill(a)/a.pot);
  const t=S.teams.find(t=>t.id===a.team);const g=BAL.trainBase*trainMult()*teamMult(t,a)*room*sec;
  const f=t&&t.focus;const sh=[(f==='tum'?2:1)+(hasT(a,'tumbler')?2:0),f==='stu'?2:1,f==='dan'?2:1];const sm=sh[0]+sh[1]+sh[2];
  a.tum=Math.min(a.pot,a.tum+g*pm*sh[0]/sm*3);a.stu=Math.min(a.pot,a.stu+g*pm*sh[1]/sm*3);a.dan=Math.min(a.pot,a.dan+g*pm*sh[2]/sm*3);}
  S.stats.trained+=sec;tickTeams(sec);}
 return{earned};}
function tick(){const now=Date.now();let dt=(now-S.last)/1000;if(dt<0)dt=0;
 if(dt>10){const cap=BAL.offlineCapH*3600;const eff=Math.min(dt,cap);const c0=S.cash;simulate(eff*offEff());S.last=now;
  toast('Welcome back! +$'+fmt(S.cash-c0)+' over '+Math.round(eff/60)+' min offline');}
 else{simulate(dt);S.last=now;}
 checkUnlocks();checkAch();genQuests();if(now-lastSave>15000)save();render();}
// ---- teams & athletes ----
function createTeam(){if(S.lvl<3)return toast('Team Creator unlocks at level 3');
 if(S.teams.length>=teamCap())return toast('Team slots full — build more Spring Floors');
 const name=prompt('Team name?','Team '+(S.teams.length+1));if(!name||!name.trim())return;
 S.teams.push({id:newId('t'),name:name.trim().slice(0,30),div:'Youth',focus:'tum'});gainXp(10);save();render();}
function rename(id){const t=S.teams.find(t=>t.id===id);const n=prompt('New name?',t.name);if(n&&n.trim()){t.name=n.trim().slice(0,30);save();render();}}
function genProspect(){const q=Math.random()+0.04*ur('u_market')+Math.min(0.4,S.lvl*0.01);const pot=Math.round(8+q*30+Math.random()*10);
 const b=()=>Math.max(1,Math.round(pot*0.3*Math.random()+1));const p={id:newId('p'),name:NAMES1[Math.random()*NAMES1.length|0]+' '+NAMES2[Math.random()*NAMES2.length|0],
 tum:b(),stu:b(),dan:b(),pot};p.tr=[TRAITS[Math.random()*TRAITS.length|0].id];if(p.tr[0]==='prodigy')p.pot+=5;p.cost=BAL.recruitBase*Math.pow(1.12,p.pot-8)*(1+skill(p)/10);return p;}
function refreshMarket(free){if(!free){if(S.cash<BAL.refreshCost)return toast('Need $'+BAL.refreshCost);S.cash-=BAL.refreshCost;}
 S.market=Array.from({length:5},genProspect);S.marketAt=Date.now();if(!free){save();render();}}
function recruit(pid,tid){const p=S.market.find(p=>p.id===pid);if(!p)return;const cost=p.cost*recruitDisc();
 if(S.ath.length>=athCap())return toast('Gym full — add Spring Floors or Scheduling');
 const t=S.teams.find(t=>t.id===tid);if(!t)return toast('Create/select a team first');
 if(S.cash<cost)return toast('Not enough cash');
 S.cash-=cost;S.market=S.market.filter(x=>x.id!==pid);const{cost:_,...a}=p;a.team=t.id;S.ath.push(a);S.stats.recruited++;gainXp(15);toast(p.name+' joined '+t.name);save();render();}
// ---- traits, chemistry, coaches ----
const hasT=(a,id)=>(a.tr||[]).includes(id);
const traitNames=a=>(a.tr||[]).map(id=>(TRAITS.find(t=>t.id===id)||{}).n).filter(Boolean).join(', ')||'None';
const coachPay=()=>S.coaches.reduce((s,c)=>s+0.6*(1+0.15*(c.lvl-1))*Math.max(.2,1-fx('sal')),0);
const coachCap=()=>Math.max(1,S.teams.length);
function teamMult(t,a){let m=(hasT(a,'fast')?1.25:1)*(hasT(a,'hard')?1.15:1);if(!t)return m;m*=1+(t.chem||0)/200;
 const c=S.coaches.find(c=>c.team===t.id);if(c){const match=c.spec===t.focus||c.spec==='dev';m*=1+0.1*c.lvl*(match?2:1);}return m;}
function tickTeams(sec){for(const t of S.teams){const m=S.ath.filter(a=>a.team===t.id);if(!m.length)continue;
 const lead=m.filter(a=>hasT(a,'leader')).length;t.chem=Math.min(100,(t.chem||0)+sec*0.02*(1+fx('chem'))*(1+0.5*lead)*(1-(t.chem||0)/120));
 const c=S.coaches.find(c=>c.team===t.id);if(c&&c.lvl<20){c.xp+=sec*(1+fx('coachxp'));while(c.lvl<20&&c.xp>=600*Math.pow(1.5,c.lvl-1)){c.xp-=600*Math.pow(1.5,c.lvl-1);c.lvl++;toast(c.name+' reached coach level '+c.lvl);}}}}
function genCoach(){const sp=COACH_SPECS[Math.random()*COACH_SPECS.length|0];return{id:newId('c'),name:NAMES1[Math.random()*NAMES1.length|0]+' '+NAMES2[Math.random()*NAMES2.length|0],spec:sp.id,lvl:1,xp:0,team:null};}
function refreshCoaches(free){if(!free){if(S.cash<BAL.refreshCost)return toast('Need $'+BAL.refreshCost);S.cash-=BAL.refreshCost;}
 S.cmarket=Array.from({length:3},genCoach);if(!free){save();render();}}
const hireCost=()=>400*Math.pow(1.6,S.coaches.length);
function hireCoach(id){if(S.lvl<8)return toast('Coaching unlocks at level 8');if(S.coaches.length>=coachCap())return toast('Coach slots full — more teams add slots');
 const c=S.cmarket.find(c=>c.id===id);if(!c)return;if(S.cash<hireCost())return toast('Not enough cash');
 S.cash-=hireCost();S.cmarket=S.cmarket.filter(x=>x.id!==id);S.coaches.push(c);gainXp(20);toast('Hired '+c.name);save();render();}
const specN=id=>(COACH_SPECS.find(s=>s.id===id)||{}).n;
function coachSel(t){if(S.lvl<8||!S.coaches.length)return '';
 return `<select data-act="coach" data-id="${t.id}" aria-label="Coach"><option value="">No coach</option>${S.coaches.map(c=>`<option value="${c.id}" ${c.team===t.id?'selected':''}>${esc(c.name)} (${specN(c.spec)} L${c.lvl})</option>`).join('')}</select>`;}
function viewCoaches(){if(S.lvl<8)return '<div class="card"><h2>Coaches</h2><div class="mut">Coaching staff unlocks at level 8.</div></div>';
 let h=`<div class="card"><div class="row"><h2>Coaches (${S.coaches.length}/${coachCap()})</h2><button data-act="cfresh">Refresh $${BAL.refreshCost}</button></div><div class="mut">A coach matching the team focus gives double bonus. Salary is paid each second.</div>`;
 for(const c of S.coaches)h+=`<div class="row"><div><b>${esc(c.name)}</b><div class="mut">${specN(c.spec)} · level ${c.lvl} · pay $${(0.6*(1+0.15*(c.lvl-1))).toFixed(2)}/s</div></div><span class="mut">${c.team?esc((S.teams.find(t=>t.id===c.team)||{}).name||''):'Unassigned'}</span></div>`;
 h+='<h2>Available</h2>';
 for(const c of S.cmarket)h+=`<div class="row"><div><b>${esc(c.name)}</b><div class="mut">${specN(c.spec)} specialist</div></div><button class="p" data-act="hire" data-id="${c.id}" ${S.cash>=hireCost()&&S.coaches.length<coachCap()?'':'disabled'}>Hire $${fmt(hireCost())}</button></div>`;
 return h+'</div>';}
// ---- competition ----
const clamp=(x,a,b)=>Math.max(a,Math.min(b,x));
function scoreFn(T,Sk,D,chem,d,k,n,dm=1){const avg=(T+Sk+D)/3;const pot=avg*(1+0.5*d/100)*(1+0.1*k/100);
 const ded=clamp(0.04+0.3*(d/100)*(0.5+k/100)-chem/100*0.1,0.02,0.5)*(0.4+1.2*Math.random())*dm;
 return{score:pot*(1-ded)*(0.7+0.3*Math.min(1,n/12))*(0.95+0.1*Math.random()),ded};}
const rivalStr=r=>Math.min(r.cap,r.base+r.gr*(num(S.ptime)/3600));
const rivalOpen=r=>S.rep>=r.rep;
function teamScore(t){const m=S.ath.filter(a=>a.team===t.id);const av=k=>m.reduce((s,a)=>s+a[k],0)/m.length;
 const x=scoreFn(av('tum'),av('stu'),av('dan'),t.chem||0,t.d??40,t.k??30,m.length);x.score*=1+fx('comp');return x;}
const routineUI=t=>S.lvl<12?'':['d','k'].map(k=>`<label class="mut">${k==='d'?'Difficulty':'Risk'} ${t[k]??(k==='d'?40:30)}<input type="range" min="0" max="100" value="${t[k]??(k==='d'?40:30)}" data-act="rt" data-id="${t.id}" data-k="${k}" aria-label="${k==='d'?'Routine difficulty':'Routine risk'}"></label>`).join('');
function enter(eid,tid){const ev=EVENTS.find(e=>e.id===eid),t=S.teams.find(t=>t.id===tid);
 if(S.lvl<12)return toast('Competitions unlock at level 12');if(!ev||!t)return toast('Pick a team');
 const n=S.ath.filter(a=>a.team===t.id).length;if(n<4)return toast('Teams need at least 4 athletes');
 if(S.rep<ev.rep)return toast('Needs reputation '+ev.rep);if(S.cash<ev.fee)return toast('Entry fee $'+fmt(ev.fee));
 if((t.cd||0)>Date.now())return toast('Team is resting for a few seconds');
 S.cash-=ev.fee;t.cd=Date.now()+15000;const me=teamScore(t);
 const field=ev.rivals.map(id=>RIVALS.find(r=>r.id===id)).filter(rivalOpen).map(r=>{const st=rivalStr(r);const x=scoreFn(st,st,st,40,r.d,r.k,12);return{r,name:r.name,score:x.score,ded:x.ded};});
 const place=1+field.filter(f=>f.score>me.score).length;
 for(const f of field){const rec=S.rivals[f.r.id]=S.rivals[f.r.id]||{w:0,l:0,s:0,best:0};
  if(me.score>f.score){rec.w++;rec.s++;rec.best=Math.max(rec.best,me.score-f.score);}else{rec.l++;rec.s=0;}}
 const mult=[1,0.5,0.25][place-1]||0.1;const cash=ev.pay*mult*(1+fx('prize')),rep=ev.gain*mult*(place===1?1.5:1)*(1+fx('rep')),fame=rep*0.5;
 S.cash+=cash;S.life+=cash;S.rep+=rep;S.fame+=fame;gainXp(20*ev.tier*mult+5);S.comp.entries++;
 if(place===1){S.comp.wins++;if(ev.tier>=2)S.comp.trophies++;}
 const pts=[10,6,3][place-1]||1;S.season.pts+=pts;S.season.played++;let sNote='';
 if(S.season.played>=SEASON_EVENTS){const b=S.season.pts*300*(1+S.season.n);S.cash+=b;S.life+=b;S.rep+=S.season.pts/4;
  S.hist.push({n:S.season.n,pts:S.season.pts,bonus:b});S.hist=S.hist.slice(-10);hof('Season '+S.season.n+' complete with '+S.season.pts+' points');sNote=' Season '+S.season.n+' complete: bonus $'+fmt(b);S.season={n:S.season.n+1,pts:0,played:0};}
 S.res={ev:ev.name,team:t.name,my:me.score,ded:me.ded,place,total:field.length+1,cash,rep,pts,field:field.map(f=>({name:f.name,score:f.score,ded:f.ded}))};
 toast('Placed '+place+(place===1?'st!':place===2?'nd':place===3?'rd':'th')+sNote);save();render();}
function viewComp(){if(S.lvl<12)return '<div class="card"><h2>Competitions</h2><div class="mut">Unlock at level 12. Rival gyms appear here.</div></div>';
 const ready=S.teams.filter(t=>S.ath.filter(a=>a.team===t.id).length>=4);
 let h=`<div class="card"><h2>Competitions</h2><div class="mut">Season ${S.season.n}: ${S.season.played}/${SEASON_EVENTS} events · ${S.season.pts} pts · ${S.comp.wins} wins · ${S.comp.trophies} trophies · Fame ${fmt(S.fame)}</div>
 <div class="mut">Score = skill x routine ceiling minus deductions. Difficulty and risk (set per team in Teams) raise the ceiling but cost deductions; chemistry reduces them. Rivals use the same formula.</div>
 <label>Team: <select id="cteam">${ready.map(t=>`<option value="${t.id}">${esc(t.name)}</option>`).join('')||'<option value="">Need a team with 4+ athletes</option>'}</select></label>`;
 for(const e of EVENTS){const why=S.rep<e.rep?'Needs rep '+e.rep:S.cash<e.fee?'Need $'+fmt(e.fee):'';
  h+=`<div class="row"><div><b>${e.name}</b><div class="mut">Fee $${fmt(e.fee)} · up to $${fmt(e.pay)} · ${e.rivals.length} rivals</div></div><button class="p" data-act="enter" data-id="${e.id}" ${why||!ready.length?'disabled':''}>${why||'Enter'}</button></div>`;}
 if(S.res){const r=S.res;h+=`<h2>Last result: ${esc(r.ev)}</h2><div class="mut">${esc(r.team)} placed ${r.place}/${r.total} · +$${fmt(r.cash)} · +${r.rep.toFixed(1)} rep · +${r.pts} season pts</div>
  <div class="row"><b>You: ${r.my.toFixed(1)}</b><span class="mut">deductions ${(r.ded*100).toFixed(0)}%</span></div>`+r.field.map(f=>`<div class="row"><span>${esc(f.name)}: ${f.score.toFixed(1)}</span><span class="mut">deductions ${(f.ded*100).toFixed(0)}%</span></div>`).join('');}
 h+='</div><div class="card"><h2>Rival gyms (simulated)</h2>';
 for(const r of RIVALS){const rec=S.rivals[r.id]||{w:0,l:0,s:0,best:0};
  h+=rivalOpen(r)?`<div class="row"><div><b>${r.name}</b><div class="mut">${r.pers} · est. strength ~${Math.round(rivalStr(r)/5)*5} · growing to ${r.cap}</div></div><span class="mut">${rec.w}W-${rec.l}L · streak ${rec.s}</span></div>`
  :`<div class="row"><span>${r.name}</span><span class="mut">Unlocks at rep ${r.rep}</span></div>`;}
 return h+'</div>';}
// ---- reset layers & trees ----
let tsub='reg';
const fx=k=>NODES.reduce((s,n)=>s+(S.nodes[n.id]||0)*(n.fx[k]||0),0)+cardFx(k);
const costMult=()=>Math.max(0.1,1-fx('disc'));
const LAYER={pp:{n:'Prestige',c:'Prestige Points',need:'Reach level 20',gain:()=>Math.floor(Math.sqrt(Math.max(0,S.life-S.runStart)/100000)*(1+fx('ppmult'))),
  lose:'cash, teams, athletes, coaches, facilities and regular upgrades',keep:'Prestige Points & upgrades, level, reputation, records',pres:()=>'Nothing else is lost.'},
 lp:{n:'Ascension',c:'Legacy Points',need:'Reach level 40 and Prestige once',gain:()=>Math.floor(Math.sqrt(S.ppRun/25)*(1+fx('lpmult'))),
  lose:'everything Prestige resets, plus Prestige Points and Prestige upgrade ranks',keep:'Legacy Points & upgrades, level, reputation, records',pres:()=>'Preserves '+Math.round(Math.min(1,fx('keepPP'))*100)+'% of each Prestige upgrade rank.'},
 dp:{n:'Rebirth',c:'Dynasty Points',need:'Reach level 80 and Ascend once',gain:()=>Math.floor(Math.sqrt(S.lpRun/10)*(1+fx('dpmult'))),
  lose:'everything Ascension resets, plus Legacy Points and Legacy upgrade ranks',keep:'Dynasty Points & upgrades, level, reputation, records',
  pres:()=>'Preserves '+Math.round(Math.min(1,fx('ekeepPP'))*100)+'% of Prestige ranks and '+Math.round(Math.min(1,fx('ekeepLP'))*100)+'% of Legacy ranks.'}};
function checkUnlocks(){const u=S.unl;
 if(!u.pp&&S.lvl>=20){u.pp=true;toast('Prestige unlocked!');}
 if(!u.lp&&u.pp&&S.lvl>=40&&S.resets.p>=1){u.lp=true;toast('Ascension unlocked!');}
 if(!u.dp&&u.lp&&S.lvl>=80&&S.resets.a>=1){u.dp=true;toast('Rebirth unlocked!');}}
function giveReward(r){const o={cash:r.cash||0,xp:r.xp||0};
 for(const k of['pp','lp','dp']){const v=Math.floor(r[k]||0);if(!v)continue;if(S.unl[k]){S.cur[k]+=v;o[k]=v;}else o.cash+=v*50;}
 S.cash+=o.cash;S.life+=o.cash;if(o.xp)gainXp(o.xp);return o;}
function resetRun(){S.cash=BAL.startCash+fx('start');S.teams=[{id:newId('t'),name:'Starter Squad',div:'Youth',focus:'tum'}];S.ath=[];S.coaches=[];S.up={};S.fac={};
 const f=Math.floor(fx('found'));if(f)S.fac.floor=Math.min(FACILITIES[0].max,f);S.runStart=S.life;S.eq=[];S.spon={};refreshMarket(true);refreshCoaches(true);}
function keepRanks(tree,frac){for(const n of NODES)if(n.tree===tree)S.nodes[n.id]=Math.min(n.max,Math.floor((S.nodes[n.id]||0)*Math.min(1,frac)));}
function doReset(k){const L=LAYER[k];if(!S.unl[k])return toast(L.need);const g=L.gain();if(g<1)return toast('Earn more before you '+L.n);
 if(!confirm(L.n+' for +'+fmt(g)+' '+L.c+'?\n\nResets: '+L.lose+'.\nKeeps: '+L.keep+'.\n'+L.pres()))return;
 const kPP=fx('keepPP'),eP=fx('ekeepPP'),eL=fx('ekeepLP');
 if(k==='lp'){keepRanks('pp',kPP);S.cur.pp=0;S.ppRun=0;S.resets.a++;}
 if(k==='dp'){keepRanks('pp',eP);keepRanks('lp',eL);S.cur.pp=0;S.cur.lp=0;S.ppRun=0;S.lpRun=0;S.resets.r++;}
 if(k==='pp'){S.ppRun+=g;S.resets.p++;}if(k==='lp')S.lpRun+=g;
 resetRun();giveReward({[k]:g});checkUnlocks();hof(L.n+' #'+(k==='pp'?S.resets.p:k==='lp'?S.resets.a:S.resets.r)+': +'+fmt(g)+' '+L.c);toast(L.n+' complete: +'+fmt(g)+' '+L.c);save();render();}
function nodeBuy(id){const n=NODES.find(n=>n.id===id);if(!n||!S.unl[n.cur])return;const r=S.nodes[id]||0;
 if(!n.pre.every(p=>(S.nodes[p]||0)>0))return toast('Locked');const room=n.max-r;
 const want=S.bulk==='max'?bulkQty(n,r,'max',S.cur[n.cur]):Math.min(S.bulk,room);const c=Math.ceil(bulkCost(n,r,want));
 if(want<1||c>S.cur[n.cur])return toast('Not enough '+LAYER[n.cur].c);S.cur[n.cur]-=c;S.nodes[id]=r+want;toast('Bought '+want+'x '+n.name);save();render();}
function nodeRow(n){const r=S.nodes[n.id]||0,cur=S.cur[n.cur];const miss=n.pre.filter(p=>!(S.nodes[p]||0));
 const nm=S.bulk==='max'?bulkQty(n,r,'max',cur):Math.min(S.bulk,n.max-r);const q=Math.max(1,Math.min(nm||1,n.max-r));const c=Math.ceil(bulkCost(n,r,q));
 const full=r>=n.max;const why=full?'Maxed':miss.length?'Needs '+miss.map(p=>NODES.find(x=>x.id===p).name).join(', '):c>cur?'Need '+fmt(c):'';
 return `<div class="row"><div><b>${n.name}</b> <span class="mut">rank ${r}/${n.max}</span><div class="mut">${n.desc}</div></div><button class="p" data-act="node" data-id="${n.id}" ${why?'disabled':''}>${why||'+'+q+' · '+fmt(c)}</button></div>`;}
function viewTree(){let h='<div class="seg">'+[['reg','Regular'],['pp','Prestige'],['lp','Ascension'],['dp','Rebirth']].map(t=>`<button data-act="tsub" data-v="${t[0]}" class="${tsub===t[0]?'on':''}">${t[1]}</button>`).join('')+'</div>';
 if(tsub==='reg')return h+'<div class="card"><h2>Regular upgrades</h2>'+bulkBar()+UPGRADES.map(u=>buyRow('up',u,S.up)).join('')+'</div><div class="card mut">Regular upgrades and facilities reset on every layer.</div>';
 const k=tsub,L=LAYER[k];if(!S.unl[k])return h+`<div class="card"><h2>${L.n}</h2><div class="mut">Locked: ${L.need}. Its currency cannot be earned from any source until then.</div></div>`;
 const g=L.gain();h+=`<div class="card"><h2>${L.n}</h2><div class="row"><span>${L.c}</span><b>${fmt(S.cur[k])}</b></div><div class="mut">Resets: ${L.lose}.<br>Keeps: ${L.keep}.<br>${L.pres()}</div>
 <button class="p" data-act="rlayer" data-k="${k}" ${g<1?'disabled':''}>${L.n}: +${fmt(g)} ${L.c}</button></div><div class="card">${bulkBar()}${NODES.filter(n=>n.tree===k).map(nodeRow).join('')}</div>`;return h;}
// ---- achievements ----
const MET=[['Lifetime cash',()=>S.life,1000,8,10,'$'],['Player level',()=>S.lvl,2,1.45,10],['Athletes recruited',()=>S.stats.recruited,3,2.2,10],
 ['Teams at once',()=>S.best.teams||0,2,1.6,10],['Athletes at once',()=>S.best.ath||0,6,1.7,10],['Best athlete skill',()=>S.best.skill||0,5,1.5,10],
 ['Team chemistry',()=>S.best.chem||0,10,1.35,8],['Facility ranks',()=>S.best.fac||0,3,1.8,10],['Upgrade ranks',()=>S.best.up||0,3,1.8,10],
 ['Coaches at once',()=>S.best.coaches||0,1,1.6,8],['Top coach level',()=>S.best.clvl||0,2,1.4,7],['Reputation',()=>S.rep,5,2.6,10],['Fame',()=>S.fame,3,2.8,10],
 ['Competitions entered',()=>S.comp.entries,1,2.4,10],['Competitions won',()=>S.comp.wins,1,2.4,10],['Trophies',()=>S.comp.trophies,1,2.2,10],
 ['Rival victories',()=>Object.values(S.rivals).reduce((s,r)=>s+r.w,0),1,2.6,10],['Best win streak',()=>Object.values(S.rivals).reduce((s,r)=>Math.max(s,r.s),0),2,1.6,8],
 ['Seasons completed',()=>S.season.n-1,1,1.7,10],['Prestiges',()=>S.resets.p,1,2,8],['Ascensions',()=>S.resets.a,1,2,6],['Rebirths',()=>S.resets.r,1,2,6],
 ['Training hours',()=>S.stats.trained/3600,0.1,3,10],['Hours played',()=>S.ptime/3600,0.25,3,10],['Reset upgrade ranks',()=>Object.values(S.nodes).reduce((a,b)=>a+b,0),1,2.4,10],
 ['Peak income per second',()=>S.best.inc||0,1,4,10,'$'],['Peak cash held',()=>S.best.cash||0,500,7,10,'$'],['Quests claimed',()=>S.qdone,1,2.3,10],
 ['Rivals defeated',()=>Object.values(S.rivals).filter(r=>r.w>0).length,1,1.3,6]];
const TIERN=['Bronze','Silver','Gold','Platinum','Diamond'];
const ACH=[];MET.forEach((m,mi)=>{let prev=0;for(let i=0;i<m[4];i++){let th=Number((m[2]*Math.pow(m[3],i)).toPrecision(2));if(th<=prev)th=prev+(th<10?1:th*0.1);prev=th;
 const tier=Math.min(4,Math.floor(i/m[4]*5));ACH.push({id:'a'+mi+'_'+i,mi,th,tier,ap:tier+1,name:m[0]+' '+(m[5]||'')+fmt(th)});}});
const apTotal=()=>S._ap??(S._ap=ACH.reduce((s,a)=>s+(S.ach[a.id]?a.ap:0),0));
function checkAch(){const b=S.best,mx=(k,v)=>{if(Number.isFinite(v)&&v>(b[k]||0))b[k]=v;};
 mx('teams',S.teams.length);mx('ath',S.ath.length);mx('skill',S.ath.reduce((s,a)=>Math.max(s,skill(a)),0));mx('chem',S.teams.reduce((s,t)=>Math.max(s,t.chem||0),0));
 mx('fac',FACILITIES.reduce((s,f)=>s+fr(f.id),0));mx('up',UPGRADES.reduce((s,u)=>s+ur(u.id),0));mx('coaches',S.coaches.length);mx('clvl',S.coaches.reduce((s,c)=>Math.max(s,c.lvl),0));mx('inc',income());mx('cash',S.cash);
 const vals=MET.map(m=>m[1]());let n=0,last='';for(const a of ACH)if(!S.ach[a.id]&&vals[a.mi]>=a.th){S.ach[a.id]=Date.now();n++;last=a.name;S._ap=undefined;}
 if(n){toast(n>1?n+' achievements unlocked!':'Achievement: '+last);save();}}
// ---- quests ----
const QM={life:()=>S.life,rec:()=>S.stats.recruited,ent:()=>S.comp.entries,win:()=>S.comp.wins,tr:()=>S.stats.trained/60,lvl:()=>S.lvl};
const QT={life:'Earn $',rec:'Recruit athletes: ',ent:'Enter competitions: ',win:'Win competitions: ',tr:'Train for minutes: ',lvl:'Reach level '};
function genQuests(){const d=new Date(),day=Math.floor((Date.now()-d.getTimezoneOffset()*60000)/864e5),wk=Math.floor((day+3)/7),inc=Math.max(0.5,income()),q=S.q;
 const mk=(k,tgt,rew,tag)=>({id:tag+k,k,base:QM[k](),tgt,rew,claimed:false});
 if(day>q.day){q.day=day;q.daily=[mk('life',Math.max(300,Math.round(inc*900)),{cash:Math.round(inc*600+100),xp:20},'d'),mk('rec',2,{cash:Math.round(inc*500+100),xp:20},'d')];
  if(S.lvl>=5)q.daily.push(mk('tr',10,{cash:Math.round(inc*400+100),xp:20},'d'));if(S.lvl>=12)q.daily.push(mk('ent',2,{cash:Math.round(inc*900+200),xp:30},'d'));}
 if(wk>q.wk){q.wk=wk;q.weekly=[mk('life',Math.max(2000,Math.round(inc*9000)),{cash:Math.round(inc*3600+500),xp:80},'w'),mk('rec',6,{cash:Math.round(inc*2400+300),xp:60},'w')];
  if(S.lvl>=12){q.weekly.push(mk('win',2,{cash:Math.round(inc*6000+800),xp:100},'w'));q.weekly.push(mk('ent',6,{cash:Math.round(inc*5000+500),xp:80},'w'));}else q.weekly.push(mk('tr',60,{cash:Math.round(inc*2400),xp:60},'w'));}}
const rivW=id=>(S.rivals[id]||{w:0}).w;
function allQuests(){const L=[];const gen=(a,kind)=>a.forEach(g=>L.push({key:kind+g.id,kind,t:QT[g.k]+fmt(g.tgt),prog:Math.min(g.tgt,QM[g.k]()-g.base),tgt:g.tgt,rew:g.rew,claimed:g.claimed,rec:g,ok:true}));
 gen(S.q.daily,'Daily');gen(S.q.weekly,'Weekly');
 const st=(kind,key,t,cur,tgt,rew,ok)=>L.push({key,kind,t,prog:Math.min(tgt,cur),tgt,rew,claimed:!!S.qc[key],ok:ok!==false});
 [['life',1e6,{cash:20000,xp:200}],['rec',50,{cash:15000,xp:150}],['win',25,{cash:60000,xp:300}],['lvl',25,{cash:100000,xp:0}],['life',1e9,{cash:5e6,xp:0}],['rec',500,{cash:2e6,xp:0}],['win',250,{cash:1e7,xp:0}]]
  .forEach(c=>st('Career','c'+c[0]+c[1],QT[c[0]]+fmt(c[1]),QM[c[0]](),c[1],c[2]));
 for(const r of RIVALS)for(const n of[5,25])st('Rivalry','rv'+r.id+n,'Beat '+r.name+' '+n+' times',rivW(r.id),n,{cash:n*r.base*400,xp:n*4},rivalOpen(r)&&S.lvl>=12);
 st('Reset','rp','Prestige for the first time',S.resets.p,1,{pp:10,cash:5000});st('Reset','ra','Ascend for the first time',S.resets.a,1,{lp:5,cash:50000});st('Reset','rr','Rebirth for the first time',S.resets.r,1,{dp:3,cash:500000});
 st('Event','ev'+S.season.n+'a','Enter 4 events this season',S.season.played,4,{cash:Math.round(income()*1500+500),xp:60},S.lvl>=12);
 st('Event','ev'+S.season.n+'b','Earn 25 season points',S.season.pts,25,{cash:Math.round(income()*3000+1000),xp:100},S.lvl>=12);return L;}
function claimQ(key){const q=allQuests().find(x=>x.key===key);if(!q||q.claimed||!q.ok||q.prog<q.tgt)return;
 if(q.rec)q.rec.claimed=true;else S.qc[key]=1;S.qdone++;const o=giveReward(q.rew);toast('Quest reward: $'+fmt(o.cash)+['pp','lp','dp'].map(k=>o[k]?' +'+o[k]+' '+k.toUpperCase():'').join(''));save();render();}
const rewTxt=r=>Object.entries(r).filter(e=>e[1]).map(([k,v])=>k==='cash'?'$'+fmt(v):k==='xp'?v+' XP':(S.unl[k]?'+'+v+' '+k.toUpperCase():'(cash instead of '+k.toUpperCase()+')')).join(' ');
let psub='ov',asub='next';
function viewQuests(){let h='';for(const kind of['Daily','Weekly','Career','Rivalry','Event','Reset']){h+=`<div class="card"><h2>${kind} quests</h2>`;
 for(const q of allQuests().filter(x=>x.kind===kind))h+=`<div class="row"><div><b>${q.t}</b><div class="bar"><i style="width:${q.prog/q.tgt*100}%"></i></div><div class="mut">${fmt(q.prog)}/${fmt(q.tgt)} · ${rewTxt(q.rew)}${q.ok?'':' · locked'}</div></div>
  <button class="p" data-act="claim" data-key="${q.key}" ${q.claimed||!q.ok||q.prog<q.tgt?'disabled':''}>${q.claimed?'Claimed':'Claim'}</button></div>`;h+='</div>';}return h;}
function viewAch(){const done=ACH.filter(a=>S.ach[a.id]);const vals=MET.map(m=>m[1]());
 let list=asub==='done'?done.sort((a,b)=>S.ach[b.id]-S.ach[a.id]).slice(0,40):ACH.filter(a=>!S.ach[a.id]).sort((a,b)=>vals[b.mi]/b.th-vals[a.mi]/a.th).slice(0,20);
 return `<div class="card"><h2>Achievements ${done.length}/${ACH.length}</h2><div class="mut">${apTotal()} points · +${(Math.min(0.5,apTotal()*0.002)*100).toFixed(1)}% tuition</div>
 <div class="seg"><button data-act="asub" data-v="next" class="${asub==='next'?'on':''}">Next up</button><button data-act="asub" data-v="done" class="${asub==='done'?'on':''}">Completed</button></div>`+
 list.map(a=>`<div class="row"><div><b>${a.name}</b><div class="mut">${TIERN[a.tier]} · ${a.ap} pts</div>${S.ach[a.id]?'':`<div class="bar"><i style="width:${Math.min(100,vals[a.mi]/a.th*100)}%"></i></div>`}</div></div>`).join('')+'</div>';}
function viewProg(){return '<div class="seg">'+[['ov','Overview'],['q','Quests'],['a','Achievements'],['e','Endgame'],['c','Cards'],['h','Legacy'],['help','Help']].concat(dbgOn()?[['dbg','Debug']]:[]).map(t=>`<button data-act="psub" data-v="${t[0]}" class="${psub===t[0]?'on':''}">${t[1]}</button>`).join('')+'</div>'+({q:viewQuests,a:viewAch,e:viewEnd,c:viewCards,h:viewLegacy,help:viewHelp,dbg:()=>dbgOn()?viewDbg():viewOverview()}[psub]||viewOverview)();}
// ---- cards ----
const SPECS=[['tum','Tumbling'],['stu','Stunting'],['comp','Competition'],['coach','Coaching'],['dev','Development'],['rev','Revenue'],['rec','Recruitment'],['cons','Consistency'],['chem','Chemistry'],['rep','Reputation'],['fac','Facilities'],['auto','Automation']];
const RAR=['Common','Rare','Epic','Legendary','Icon'],RV=[.03,.08,.16,.3,.5],RCOL=['#9aa4b2','#4aa8ff','#b46bff','#ffb52e','#ff4fa0'],FR=[5,15,40,100,250];
const CARDS=[];SPECS.forEach(sp=>RAR.forEach((r,i)=>CARDS.push({id:sp[0]+'_'+i,spec:sp[0],r:i,name:sp[1]+' '+r})));
const CFX={tum:['train',1],stu:['train',1],dev:['train',1.2],coach:['train',.8],auto:['offl',.5],rev:['tuit',1],rep:['tuit',.8],comp:['comp',.5],cons:['comp',.4],chem:['comp',.4],rec:['rdisc',.5],fac:['cap',10]};
const cardVal=id=>{const c=CARDS.find(x=>x.id===id),o=S.cards[id];return RV[c.r]*(1+0.15*((o&&o.lvl)||1)-0.15);};
function cardFx(k){if(!S.eq)return 0;let t=0;for(const id of S.eq){const f=CFX[id.split('_')[0]];if(f&&f[0]===k&&S.cards[id])t+=cardVal(id)*f[1];}return t;}
const cardSlots=()=>1+Math.floor(fr('floor')/4)+(S.resets.p?1:0)+(S.resets.a?1:0)+(S.resets.r?1:0)+Math.floor(fx('slots'));
const PACKS={r:{n:'Rookie Pack',cur:'cash',cost:2500,odds:[70,25,4,1,0],lvl:1},e:{n:'Elite Pack',cur:'cash',cost:25000,odds:[0,60,30,9,1],lvl:12},w:{n:'Worlds Champion Pack',cur:'pp',cost:100,odds:[0,10,50,32,8],lvl:20}};
function openPack(pid,n){const P=PACKS[pid];if(S.lvl<P.lvl)return toast('Pack unlocks at level '+P.lvl);if(P.cur==='pp'&&!S.unl.pp)return toast('Needs Prestige');
 const bal=P.cur==='pp'?S.cur.pp:S.cash,cost=P.cost*n;if(bal<cost)return toast('Not enough '+(P.cur==='pp'?'Prestige Points':'cash'));
 if(P.cur==='pp')S.cur.pp-=cost;else S.cash-=cost;const got=[];
 for(let i=0;i<n;i++){S.pity.e++;S.pity.l++;let x=Math.random()*100,r=0,acc=0;for(let j=0;j<5;j++){acc+=P.odds[j];if(x<acc){r=j;break;}}
  if(S.pity.l>=30&&P.odds[3]+P.odds[4]>0)r=Math.max(r,3);else if(S.pity.e>=10&&P.odds[2]+P.odds[3]>0)r=Math.max(r,2);
  if(r>=2)S.pity.e=0;if(r>=3)S.pity.l=0;let pool=SPECS.map(sp=>sp[0]+'_'+r);if(r>=3){const nu=pool.filter(id=>!S.cards[id]);if(nu.length)pool=nu;}
  const id=pool[Math.random()*pool.length|0],c=S.cards[id];if(c){c.n++;S.frag+=FR[r];got.push({id,dup:true});}else{S.cards[id]={n:1,lvl:1};got.push({id,dup:false});}S.pk.n++;}
 S.pres=got;gainXp(5*n);save();render();}
function equip(id){const i=S.eq.indexOf(id);if(i>=0)S.eq.splice(i,1);else if(S.eq.length>=cardSlots())return toast('Card slots full ('+cardSlots()+')');else S.eq.push(id);save();render();}
function upgradeCard(id){const c=S.cards[id],d=CARDS.find(x=>x.id===id);if(!c||c.lvl>=10)return;const cost=10*c.lvl*(d.r+1);if(S.frag<cost)return toast('Need '+cost+' fragments');S.frag-=cost;c.lvl++;save();render();}
const cardName=id=>CARDS.find(x=>x.id===id).name;
function cardBox(id,extra){const d=CARDS.find(x=>x.id===id),o=S.cards[id];return `<div class="cardx" style="--c:${RCOL[d.r]}"><b>${d.name}</b> <span class="mut">${RAR[d.r]}${o?' · lvl '+o.lvl+' · x'+o.n:''}</span><div class="mut">${CFX[d.spec]?'+'+(cardVal(id)*CFX[d.spec][1]*(CFX[d.spec][0]==='cap'?1:100)).toFixed(CFX[d.spec][0]==='cap'?0:1)+(CFX[d.spec][0]==='cap'?' slots':'% '+CFX[d.spec][0]):''}</div>${extra||''}</div>`;}
function viewCards(){let h='<div class="card"><h2>Card packs</h2><div class="mut">Earned currency only. Pity: Epic+ guaranteed within 10 packs, Legendary+ within 30. Equipped '+S.eq.length+'/'+cardSlots()+' · Fragments '+S.frag+'</div>';
 for(const [id,P] of Object.entries(PACKS)){const lock=S.lvl<P.lvl?'Level '+P.lvl:P.cur==='pp'&&!S.unl.pp?'Needs Prestige':'';
  h+=`<div class="row"><div><b>${P.n}</b><div class="mut">Odds ${P.odds.map((o,i)=>RAR[i][0]+' '+o+'%').join(' · ')}</div></div><div>${[1,10].map(n=>`<button class="p" data-act="pack" data-p="${id}" data-n="${n}" ${lock||(P.cur==='pp'?S.cur.pp:S.cash)<P.cost*n?'disabled':''}>${lock||'x'+n+' · '+fmt(P.cost*n)+(P.cur==='pp'?' PP':'')}</button>`).join(' ')}</div></div>`;}
 if(S.pres)h+='<h2>Last pull</h2>'+S.pres.map(x=>cardBox(x.id,x.dup?'<div class="mut">Duplicate: +'+FR[CARDS.find(c=>c.id===x.id).r]+' fragments</div>':'<div class="mut">New card!</div>')).join('');
 h+=`</div><div class="card"><h2>Collection ${Object.keys(S.cards).length}/${CARDS.length}</h2>`;
 const own=CARDS.filter(c=>S.cards[c.id]).sort((a,b)=>b.r-a.r);if(!own.length)h+='<div class="mut">Open a pack to start collecting.</div>';
 for(const c of own){const o=S.cards[c.id],eq=S.eq.includes(c.id);h+=cardBox(c.id,`<button data-act="equip" data-id="${c.id}" class="${eq?'on':''}">${eq?'Unequip':'Equip'}</button> <button data-act="cup" data-id="${c.id}" ${o.lvl>=10||S.frag<10*o.lvl*(c.r+1)?'disabled':''}>Upgrade · ${10*o.lvl*(c.r+1)} frags</button>`);}
 return h+'</div>';}
// ---- sponsorships ----
const SPONS=[{id:'s1',n:'Glitter & Co.',rep:10,teams:1,pay:2,sign:2000},{id:'s2',n:'BounceBev',rep:60,teams:2,pay:15,sign:20000},{id:'s3',n:'Apex Athletic Wear',rep:250,teams:3,pay:120,sign:200000},
 {id:'s4',n:'Skyline Motors',rep:800,teams:5,pay:900,sign:2e6},{id:'s5',n:'Crown Sports Network',rep:2500,teams:8,pay:7000,sign:2e7}];
const sponPay=()=>SPONS.reduce((s,x)=>s+(S.spon[x.id]?x.pay:0),0)*(1+0.05*ur('u_market'))*(1+fx('spon'));
function sign(id){const x=SPONS.find(x=>x.id===id);if(S.lvl<25||S.rep<x.rep||S.teams.length<x.teams)return toast('Requirements not met');if(S.spon[id])return;
 S.spon[id]=1;if(!S.sponC[id]){S.sponC[id]=1;giveReward({cash:x.sign});toast('Signed '+x.n+': +$'+fmt(x.sign));}else toast('Re-signed '+x.n);save();render();}
function viewSpon(){if(S.lvl<25)return '<div class="card"><h2>Sponsorships</h2><div class="mut">Unlock at level 25.</div></div>';
 return '<div class="card"><h2>Sponsorships</h2>'+SPONS.map(x=>{const ok=S.rep>=x.rep&&S.teams.length>=x.teams;return `<div class="row"><div><b>${x.n}</b><div class="mut">$${fmt(x.pay)}/s · bonus $${fmt(x.sign)} (first signing) · needs rep ${x.rep}, ${x.teams} teams</div></div>
 ${S.spon[x.id]?`<button data-act="unsign" data-id="${x.id}">Active · end</button>`:`<button class="p" data-act="sign" data-id="${x.id}" ${ok?'':'disabled'}>Sign</button>`}</div>`;}).join('')+'<div class="mut">Contracts end when you reset.</div></div>';}
// ---- endgame ----
const BOSSES=[{n:'Nova Dynasty',base:80,d:70,k:40,mod:'stu',s:'Stunt specialists'},{n:'Iron Crown',base:110,d:50,k:20,mod:'ded',s:'Technical precision'},{n:'Tempest Royale',base:145,d:60,k:45,mod:'tum',s:'Tumbling powerhouse'},
 {n:'Obsidian Elite',base:185,d:85,k:70,mod:'dcap',s:'High-risk showmen'},{n:'Zenith Empire',base:230,d:65,k:45,mod:'ded',s:'Balanced perfection'},{n:'Eternal Apex',base:280,d:75,k:50,mod:'dcap',s:'All-around legends'}];
const MODT={stu:'Only stunting counts',tum:'Only tumbling counts',ded:'Deductions +60%',dcap:'Difficulty capped at 50'};
function modScore(T,Sk,D,chem,d,k,n,mod){if(mod==='stu')T=D=Sk;if(mod==='tum')Sk=D=T;if(mod==='dcap')d=Math.min(d,50);return scoreFn(T,Sk,D,chem,d,k,n,mod==='ded'?1.6:1).score;}
const bossStr=(b,t)=>b.base*(1+0.5*(t-1));
function hof(txt){S.hof.push({t:Date.now(),txt});S.hof=S.hof.slice(-60);}
function challenge(i,tier,tid){const b=BOSSES[i],t=S.teams.find(t=>t.id===tid);if(!S.unl.dp)return toast('Rebirth to unlock the World Tour');if(!b||!t)return toast('Pick a team');
 if(tier>1&&!S.endg.clr['b'+i+'_'+(tier-1)])return toast('Clear the previous tier first');const m=S.ath.filter(a=>a.team===t.id);if(m.length<4)return toast('Teams need at least 4 athletes');
 if((t.cd||0)>Date.now())return toast('Team is resting');t.cd=Date.now()+15000;const av=k=>m.reduce((s,a)=>s+a[k],0)/m.length;
 const me=modScore(av('tum'),av('stu'),av('dan'),t.chem||0,t.d??40,t.k??30,m.length,b.mod)*(1+fx('comp'));const st=bossStr(b,tier),bs=modScore(st,st,st,50,b.d,b.k,12,b.mod);
 const win=me>bs,key='b'+i+'_'+tier;let rew='';
 if(win){const first=!S.endg.clr[key];S.endg.clr[key]=1;S.comp.wins++;
  if(first){const o=giveReward({dp:(i+1)*tier*2,cash:b.base*tier*5000,xp:200*tier});rew='First clear: +'+o.dp+' DP, $'+fmt(o.cash);hof('Defeated '+b.n+' (tier '+tier+')');}
  else{const o=giveReward({cash:b.base*tier*500});rew='Repeat: $'+fmt(o.cash);}
  for(const T of[1,3]){const kk='tour'+T;if(!S.endg.clr[kk]&&BOSSES.every((x,j)=>S.endg.clr['b'+j+'_'+T])){S.endg.clr[kk]=1;giveReward({dp:25*T*T});hof('Completed World Tour (tier '+T+')');rew+=' · World Tour tier '+T+' complete!';}}}
 S.eres={n:b.n,tier,me,bs,win,rew};save();render();}
function viewEnd(){if(!S.unl.dp)return '<div class="card"><h2>World Tour</h2><div class="mut">Unlocks after your first Rebirth. Boss gyms with fixed strength and scoring modifiers wait here; clear all six at a tier to complete a World Tour.</div></div>';
 const ready=S.teams.filter(t=>S.ath.filter(a=>a.team===t.id).length>=4);
 let h=`<div class="card"><h2>World Tour</h2><label>Team: <select id="eteam">${ready.map(t=>`<option value="${t.id}">${esc(t.name)}</option>`).join('')||'<option value="">Need a team with 4+ athletes</option>'}</select></label>`;
 BOSSES.forEach((b,i)=>{h+=`<div class="row"><div><b>${b.n}</b><div class="mut">${b.s} · Modifier: ${MODT[b.mod]}</div></div><div>`+[1,2,3].map(t=>{const lock=t>1&&!S.endg.clr['b'+i+'_'+(t-1)];return `<button class="${S.endg.clr['b'+i+'_'+t]?'on':'p'}" data-act="boss" data-i="${i}" data-t="${t}" ${lock||!ready.length?'disabled':''}>T${t} · ${Math.round(bossStr(b,t))}</button>`;}).join(' ')+'</div></div>';});
 if(S.eres){const r=S.eres;h+=`<h2>${r.win?'Victory':'Defeat'} vs ${r.n} T${r.tier}</h2><div class="mut">You ${r.me.toFixed(1)} · ${r.n} ${r.bs.toFixed(1)} ${r.rew}</div>`;}return h+'</div>';}
// ---- legacy: hall of fame & cosmetics ----
const THEMES=[['Classic Pink','#ff4f9a',0],['Royal Blue','#4a8dff',20],['Emerald','#2fd08a',60],['Sunset','#ff8a3d',150],['Champion Gold','#ffc83d',300]];
function setTheme(i){if(apTotal()<THEMES[i][2])return toast('Needs '+THEMES[i][2]+' achievement points');S.theme=i;save();render();}
function viewLegacy(){const b=S.best;const rec=[['Lifetime cash','$'+fmt(S.life)],['Best athlete skill',(b.skill||0).toFixed(1)],['Peak income/s','$'+fmt(b.inc||0)],['Top reputation',fmt(S.rep)],['Most teams at once',b.teams||0],['Competitions won',S.comp.wins],['Trophies',S.comp.trophies],['Resets (P/A/R)',S.resets.p+'/'+S.resets.a+'/'+S.resets.r],['Boss tiers cleared',Object.keys(S.endg.clr).filter(k=>/^b/.test(k)).length]];
 return `<div class="card"><h2>Hall of Fame</h2>${rec.map(r=>`<div class="row"><span>${r[0]}</span><b>${r[1]}</b></div>`).join('')}<h2>History</h2>${S.hof.slice().reverse().slice(0,25).map(x=>`<div class="row"><span>${esc(x.txt)}</span><span class="mut">${new Date(x.t).toLocaleDateString()}</span></div>`).join('')||'<div class="mut">Milestones appear here and survive every reset.</div>'}</div>
 <div class="card"><h2>Gym identity</h2><button data-act="gname">Rename gym${S.gname?': '+esc(S.gname):''}</button><div class="seg">${THEMES.map((t,i)=>`<button data-act="theme" data-v="${i}" class="${S.theme===i?'on':''}" ${apTotal()<t[2]?'disabled':''}>${t[0]}${t[2]?' ('+t[2]+' pts)':''}</button>`).join('')}</div></div>`;}
// ---- tutorial & help ----
const TUT=[['Recruit your first athlete in the Teams tab. Athletes in a team pay tuition every second.',()=>S.stats.recruited>=1],
 ['Spend cash in the Gym tab on a Spring Floor or an upgrade. Use x1/x10/x100/Max to buy in bulk.',()=>fr('floor')>0||UPGRADES.some(u=>ur(u.id)>0)],
 ['Reach level 3 to unlock the Team Creator, then make a second team.',()=>S.teams.length>=2],
 ['Level 8 unlocks coaches. Hire one in Teams and assign them to a team whose focus matches their specialty.',()=>S.coaches.length>0],
 ['Level 12 unlocks competitions in Progression. Enter one with a team of 4+ athletes.',()=>S.comp.entries>0],
 ['Open a Rookie Pack in Progression > Cards and equip a card.',()=>S.pk.n>0],
 ['Claim a finished quest in Progression > Quests.',()=>S.qdone>0],
 ['Level 20 unlocks Prestige in the Skill Tree: reset the run for Prestige Points that permanently boost every future run.',()=>S.resets.p>0],
 ['Ascension (level 40) and Rebirth (level 80) reset the layers below them but add new currencies, trees and preservation. See Help for details.',()=>S.resets.r>0]];
function tutBanner(){while(S.tut>=0&&S.tut<TUT.length&&TUT[S.tut][1]()){S.tut++;save();}if(S.tut<0||S.tut>=TUT.length)return '';
 return `<div class="card" role="note"><b>Tip ${S.tut+1}/${TUT.length}</b><div>${TUT[S.tut][0]}</div><button data-act="tutoff">Hide tips</button></div>`;}
function viewHelp(){const H=[['Economy','Athletes on teams pay tuition per second, raised by skill, upgrades, lounge, reputation and sponsors. Facilities cost upkeep and coaches draw salary; net income is shown in the Gym tab. Cash never goes below zero.'],
 ['Training','Once level 5 is reached, all team athletes train automatically toward their potential, slowing as they near it. The team focus doubles a skill share. Traits, coaches, chemistry and facilities speed it up.'],
 ['Teams and chemistry','Teams need roster space (Spring Floors add slots). Chemistry grows while a team trains together, faster with Team Leaders, and boosts training and routines.'],
 ['Competition scoring','Score = average skill x routine ceiling (difficulty and risk raise it) x (1 - deductions) x roster factor. Deductions rise with difficulty and risk and fall with chemistry. Rivals use the same formula; their strength grows slowly with your total play time up to a cap. Boss gyms add scoring modifiers.'],
 ['Cards','Packs use earned currency only. Duplicates become fragments for levelling. Equipped cards give global bonuses; slots grow with floors and resets. Pity guarantees prevent long dry streaks.'],
 ['Bulk purchases','x10, x100 and Max price each rank cumulatively, not ten times the current price. Buy Max buys what you can afford; capped upgrades stop at max rank.'],
 ['Resets and currencies','Prestige (L20) gives Prestige Points. Ascension (L40, after a Prestige) also resets Prestige Points and ranks except a preserved percentage, and gives Legacy Points. Rebirth (L80, after an Ascension) resets lower layers except preserved ranks and gives Dynasty Points. Each currency only exists after its layer unlocks; locked rewards turn into cash. Cards, achievements, records, level and reputation always stay.'],
 ['Quests and achievements','Daily and weekly quests refresh by your local date. Career, rivalry, event and reset quests are permanent or per season. Achievements unlock automatically and each point adds a little tuition.'],
 ['Offline progress','Closing the game keeps earning for up to 8 hours at reduced efficiency; Auto-Run Gym, Prestige and Dynasty nodes improve both.'],
 ['Saving','The game autosaves in this browser. Use Overview > Export to back up a save file and Import to restore it. Clearing browser data deletes the local save.']];
 return '<div class="card"><h2>Help</h2>'+H.map(h=>`<details><summary><b>${h[0]}</b></summary><p class="mut">${h[1]}</p></details>`).join('')+`<button data-act="${S.tut<0?'tuton':'tutoff'}">${S.tut<0?'Show tips again':'Hide tips'}</button></div>`;}
// ---- hidden debug panel (unlock by typing the secret code, or tap the title 7 times) ----
const DBG_H=3431322737;const hsh=t=>{let x=5381;for(const c of t)x=((x<<5)+x+c.charCodeAt(0))>>>0;return x;};
const dbgOn=()=>{try{return localStorage.getItem('cheerEmpire.dbg')==='1';}catch(e){return false;}};
let dbgMsg='',kbuf='',tapN=0,tapT=0;
function dbgTry(code){if(hsh(String(code).trim().toLowerCase())!==DBG_H)return false;try{localStorage.setItem('cheerEmpire.dbg','1');}catch(e){}toast('Debug panel unlocked');tab='prog';psub='dbg';render();return true;}
document.addEventListener('keydown',e=>{if(e.key.length!==1||/INPUT|TEXTAREA|SELECT/.test((e.target||{}).tagName||''))return;kbuf=(kbuf+e.key.toLowerCase()).slice(-20);
 for(let n=4;n<=20;n++)if(hsh(kbuf.slice(-n))===DBG_H){dbgTry(kbuf.slice(-n));kbuf='';break;}});
document.addEventListener('click',e=>{if(e.target.id!=='title')return;const n=Date.now();tapN=n-tapT>4000?1:tapN+1;tapT=n;if(tapN>=7){tapN=0;const c=prompt('Enter code');if(c&&!dbgTry(c))toast('Unknown code');}});
function badPath(o,path,d){if(d>6)return '';if(typeof o==='number'&&!Number.isFinite(o))return path;if(o&&typeof o==='object')for(const k of Object.keys(o)){const r=badPath(o[k],path+'.'+k,d+1);if(r)return r;}return '';}
function dbgOp(op,v){const n=Number(v);
 if(op==='cash'){S.cash+=n;S.life+=n;}
 else if(op==='lvl'){S.lvl=Math.max(1,S.lvl+n);S.xp=0;checkUnlocks();}
 else if(op==='setlvl'){S.lvl=n;S.xp=0;checkUnlocks();}
 else if(op==='rep'){S.rep+=n;S.fame+=n/2;}
 else if(op==='ff'){for(let i=0;i<n;i++)simulate(3600);S.last=Date.now();}
 else if(op==='offline'){S.last=Date.now()-n*3600e3;tick();}
 else if(op==='cur'){if(!S.unl[v])return toast('Currency is locked. Unlock the layer first.');S.cur[v]+=100;}
 else if(op==='unl'){if(n>=1){S.lvl=Math.max(S.lvl,20);S.unl.pp=true;}if(n>=2){S.lvl=Math.max(S.lvl,40);S.resets.p=Math.max(1,S.resets.p);S.unl.lp=true;}if(n>=3){S.lvl=Math.max(S.lvl,80);S.resets.a=Math.max(1,S.resets.a);S.unl.dp=true;}checkUnlocks();}
 else if(op==='frag')S.frag+=100;
 else if(op==='pack'){const P=PACKS[v];if(P.cur==='pp'){if(!S.unl.pp)return toast('Unlock Prestige first');S.cur.pp+=P.cost*10;}else S.cash+=P.cost*10;S.lvl=Math.max(S.lvl,P.lvl);openPack(v,10);}
 else if(op==='ath'){const t=S.teams[0];if(!t)return;for(let i=0;i<6&&S.ath.length<athCap();i++){const{cost:_,...a}=genProspect();a.team=t.id;S.ath.push(a);S.stats.recruited++;}}
 else if(op==='maxskill'){S.ath.forEach(a=>{a.tum=a.stu=a.dan=a.pot;});}
 else if(op==='chem')S.teams.forEach(t=>{t.chem=100;});
 else if(op==='cd')S.teams.forEach(t=>{t.cd=0;});
 else if(op==='market'){refreshMarket(true);refreshCoaches(true);}
 else if(op==='quests'){S.q.day=0;S.q.wk=0;genQuests();}
 else if(op==='check'){checkAch();const bad=badPath(S,'S',0);const ok=validate(JSON.parse(JSON.stringify(S)))!==null;dbgMsg='Integrity: '+(ok?'save validates':'SAVE INVALID')+' · '+(bad?'non-finite number at '+bad:'no NaN/Infinity')+' · achievements '+Object.keys(S.ach).length+'/'+ACH.length;}
 else if(op==='lock'){try{localStorage.removeItem('cheerEmpire.dbg');}catch(e){}psub='ov';return render();}
 save();render();}
function viewDbg(){const G=(t,l)=>`<div class="card"><h2>${t}</h2><div class="seg">${l.map(x=>`<button data-act="dbg" data-op="${x[1]}" data-v="${x[2]??''}">${x[0]}</button>`).join('')}</div></div>`;
 const snap=JSON.stringify({cash:S.cash,lvl:S.lvl,cur:S.cur,unl:S.unl,resets:S.resets,rep:S.rep,fame:S.fame,ptime:Math.round(S.ptime),ath:S.ath.length,teams:S.teams.length,income:income(),upkeep:upkeep(),cards:Object.keys(S.cards).length,pity:S.pity,best:S.best},null,1);
 return '<div class="card"><h2>Debug panel</h2><div class="mut">Changes affect your real save. Reset-currency buttons stay locked until the layer is unlocked.</div></div>'+
 G('Cash',[['+$1K','cash',1e3],['+$1M','cash',1e6],['+$1B','cash',1e9],['+$1T','cash',1e12]])+G('Level and reputation',[['+1 level','lvl',1],['+10 levels','lvl',10],['Level 20','setlvl',20],['Level 40','setlvl',40],['Level 80','setlvl',80],['+100 rep','rep',100],['+1000 rep','rep',1000]])+
 G('Time',[['Fast-forward 1h','ff',1],['Fast-forward 8h','ff',8],['Fast-forward 24h','ff',24],['Simulate 4h offline','offline',4],['Simulate 24h offline','offline',24]])+
 G('Reset layers',[['Unlock Prestige','unl',1],['Unlock Ascension','unl',2],['Unlock Rebirth','unl',3],['+100 PP','cur','pp'],['+100 LP','cur','lp'],['+100 DP','cur','dp']])+
 G('Cards',[['10 Rookie packs','pack','r'],['10 Elite packs','pack','e'],['10 Worlds packs','pack','w'],['+100 fragments','frag']])+
 G('Teams',[['Add 6 athletes','ath'],['Max athlete skills','maxskill'],['Max chemistry','chem'],['Clear cooldowns','cd'],['Refresh markets','market'],['Regenerate daily/weekly quests','quests']])+
 G('Diagnostics',[['Run integrity check','check'],['Lock panel','lock']])+(dbgMsg?`<div class="card">${esc(dbgMsg)}</div>`:'')+`<div class="card"><h2>State snapshot</h2><textarea readonly rows="12" style="width:100%;background:#1b1230;color:#f6f2ff">${esc(snap)}</textarea></div>`;}
// ---- UI ----
function toast(m){const t=$('#toast');t.textContent=m;t.classList.add('show');clearTimeout(toast.h);toast.h=setTimeout(()=>t.classList.remove('show'),2600);}
const bulkBar=()=>'<div class="seg" role="group" aria-label="Bulk amount">'+[1,10,100,'max'].map(b=>`<button data-act="bulk" data-v="${b}" class="${S.bulk===b?'on':''}">${b==='max'?'Max':'x'+b}</button>`).join('')+'</div>';
function buyRow(kind,d,map){const r=map[d.id]||0;const n=bulkQty(d,r,S.bulk,S.cash);const want=S.bulk==='max'?Math.max(n,1):S.bulk;const q=Math.min(want,d.max-r);
 const c=q>0?bulkCost(d,r,q):0;const full=r>=d.max;const ok=!full&&n>0&&(S.bulk==='max'||n>=q)&&c<=S.cash;
 return `<div class="row"><div><b>${d.name}</b> <span class="mut">rank ${r}/${d.max}</span><div class="mut">${d.desc}</div></div>
 <button class="p" data-act="buy" data-k="${kind}" data-id="${d.id}" ${ok?'':'disabled'}>${full?'Maxed':'+'+q+' · $'+fmt(c)}</button></div>`;}
function viewGym(){const inc=income(),up=upkeep();
 return `<div class="card"><h2>Gym</h2><div class="row"><span>Tuition income</span><b>$${fmt(inc)}/s</b></div>
 <div class="row"><span>Expenses</span><b>-$${fmt(up)}/s</b></div><div class="row"><span>Net</span><b>$${fmt(inc-up)}/s</b></div>
 <div class="row"><span>Athletes</span><b>${S.ath.length}/${athCap()}</b></div><div class="row"><span>Teams</span><b>${S.teams.length}/${teamCap()}</b></div>
 <div class="row"><span>Lifetime earned</span><b>$${fmt(S.life)}</b></div>
 <div class="mut">${S.lvl<5?'Athlete training unlocks at level 5. Recruit athletes in Teams to earn tuition.':'Training runs automatically. Tuition is collected every second.'}</div></div>
 ${viewSpon()}<div class="card"><h2>Facilities</h2>${bulkBar()}${FACILITIES.map(f=>buyRow('fac',f,S.fac)).join('')}</div>
 <div class="card"><h2>Upgrades</h2>${UPGRADES.map(u=>buyRow('up',u,S.up)).join('')}</div>`;}
function viewTeams(){let h=`<div class="card"><div class="row"><h2>Teams (${S.teams.length}/${teamCap()})</h2><button class="p" data-act="newteam">New team</button></div>`;
 if(S.lvl<3)h+='<div class="mut">Team Creator unlocks at level 3. Your starter team is below.</div>';
 for(const t of S.teams){const m=S.ath.filter(a=>a.team===t.id);const avg=m.length?m.reduce((s,a)=>s+skill(a),0)/m.length:0;
  h+=`<div class="row"><div><b>${esc(t.name)}</b><div class="mut">${m.length} athletes · avg skill ${avg.toFixed(1)} · chemistry ${(t.chem||0).toFixed(0)}/100</div></div><div>
  <select data-act="focus" data-id="${t.id}" aria-label="Training focus">${[['tum','Tumbling'],['stu','Stunting'],['dan','Dance']].map(f=>`<option value="${f[0]}" ${t.focus===f[0]?'selected':''}>${f[1]}</option>`).join('')}</select>
  ${coachSel(t)}${routineUI(t)}<button data-act="rename" data-id="${t.id}">Rename</button></div></div>`;}
 h+='</div><div class="card"><div class="row"><h2>Recruit</h2><button data-act="refresh">Refresh $'+BAL.refreshCost+'</button></div>';
 const tid=S.teams[0]&&S.teams[S.teams.length-1].id;
 const opts=S.teams.map(t=>`<option value="${t.id}">${esc(t.name)}</option>`).join('');
 h+=`<label class="mut">Recruit to: <select id="rteam">${opts}</select></label>`;
 for(const p of S.market){const c=p.cost*recruitDisc();h+=`<div class="row"><div><b>${esc(p.name)}</b><div class="mut">Tum ${p.tum} · Stu ${p.stu} · Dan ${p.dan} · Potential ${p.pot} · ${traitNames(p)}</div></div>
  <button class="p" data-act="recruit" data-id="${p.id}" ${S.cash>=c&&S.ath.length<athCap()?'':'disabled'}>$${fmt(c)}</button></div>`;}
 h+='</div>';return h+viewCoaches();}

function viewOverview(){const need=lvlNeed(S.lvl);
 return `<div class="card"><h2>Level ${S.lvl}</h2><div class="bar"><i style="width:${Math.min(100,S.xp/need*100)}%"></i></div><div class="mut">${fmt(S.xp)} / ${fmt(need)} XP</div>
 ${UNLOCKS.map(u=>`<div class="row"><span>Level ${u[0]}: ${u[1]}</span><b>${S.lvl>=u[0]?'Unlocked':'Locked'}</b></div>`).join('')}</div>
 ${viewComp()}<div class="card"><h2>Save</h2><div class="row"><button data-act="save">Save now</button><button data-act="export">Export</button><button data-act="import">Import</button><button data-act="reset">Reset game</button></div>
 <div class="mut" id="si">Last saved ${Math.round((Date.now()-lastSave)/1000)}s ago</div></div>
 <div class="card"><h2>Stats</h2><div class="row"><span>Athletes recruited</span><b>${S.stats.recruited}</b></div><div class="row"><span>Training hours</span><b>${(S.stats.trained/3600).toFixed(2)}</b></div></div>`;}
function render(){const a=document.activeElement;if(a&&(a.tagName==='SELECT'||a.type==='range'))return;
 document.documentElement.style.setProperty('--pink',THEMES[Math.min(S.theme,THEMES.length-1)][1]);$('#top').textContent=(S.gname?S.gname+' · ':'')+'$'+fmt(S.cash)+' · Lv '+S.lvl+' · Rep '+fmt(S.rep)+['pp','lp','dp'].filter(k=>S.unl[k]).map(k=>' · '+k.toUpperCase()+' '+fmt(S.cur[k])).join('');
 document.querySelectorAll('#nav button').forEach(b=>b.classList.toggle('on',b.dataset.tab===tab));
 const keep=$('#rteam')&&$('#rteam').value;$('#view').innerHTML=tutBanner()+{gym:viewGym,teams:viewTeams,tree:viewTree,prog:viewProg}[tab]();
 if(keep&&$('#rteam'))$('#rteam').value=keep;}
document.addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;
 if(b.dataset.tab){tab=b.dataset.tab;return render();}const a=b.dataset.act;if(!a)return;
 if(a==='bulk'){S.bulk=b.dataset.v==='max'?'max':+b.dataset.v;render();}
 else if(a==='buy')buy(b.dataset.k,b.dataset.id);
 else if(a==='newteam')createTeam();else if(a==='rename')rename(b.dataset.id);
 else if(a==='refresh')refreshMarket(false);
 else if(a==='recruit')recruit(b.dataset.id,$('#rteam').value);
 else if(a==='tsub'){tsub=b.dataset.v;render();}else if(a==='node')nodeBuy(b.dataset.id);else if(a==='rlayer')doReset(b.dataset.k);
 else if(a==='psub'){psub=b.dataset.v;render();}else if(a==='asub'){asub=b.dataset.v;render();}else if(a==='claim')claimQ(b.dataset.key);
 else if(a==='boss')challenge(+b.dataset.i,+b.dataset.t,$('#eteam').value);else if(a==='pack')openPack(b.dataset.p,+b.dataset.n);else if(a==='equip')equip(b.dataset.id);else if(a==='cup')upgradeCard(b.dataset.id);
 else if(a==='sign')sign(b.dataset.id);else if(a==='unsign'){delete S.spon[b.dataset.id];save();render();}else if(a==='theme')setTheme(+b.dataset.v);else if(a==='gname'){const n=prompt('Gym name?',S.gname||'My Gym');if(n&&n.trim()){S.gname=n.trim().slice(0,30);save();render();}}
 else if(a==='help'){tab='prog';psub='help';render();}else if(a==='tutoff'){S.tut=-1;save();render();}else if(a==='tuton'){S.tut=0;save();render();}
 else if(a==='dbg'&&dbgOn())dbgOp(b.dataset.op,b.dataset.v);
 else if(a==='enter')enter(b.dataset.id,$('#cteam').value);else if(a==='hire')hireCoach(b.dataset.id);else if(a==='cfresh')refreshCoaches(false);
 else if(a==='save'){save();toast('Saved');}
 else if(a==='export'){const blob=new Blob([JSON.stringify(S)],{type:'application/json'});const l=document.createElement('a');l.href=URL.createObjectURL(blob);l.download='cheer-empire-save.json';l.click();}
 else if(a==='import'){const i=document.createElement('input');i.type='file';i.accept='.json';i.onchange=()=>{const r=new FileReader();r.onload=()=>{try{const d=validate(JSON.parse(r.result));
  if(!d)throw 0;if(confirm('Replace your current save with this file?')){S=d;S.last=Date.now();save();render();toast('Imported');}}catch(x){toast('Invalid save file');}};r.readAsText(i.files[0]);};i.click();}
 else if(a==='reset'&&confirm('Delete ALL progress? This cannot be undone.')&&confirm('Really reset?')){localStorage.removeItem(BAL.saveKey);S=newState();refreshMarket(true);save();render();}});
document.addEventListener('change',e=>{const d=e.target.dataset;if(d.act==='focus'){S.teams.find(t=>t.id===d.id).focus=e.target.value;save();}
 if(d.act==='rt'){S.teams.find(t=>t.id===d.id)[d.k]=+e.target.value;save();}
 if(d.act==='coach'){S.coaches.forEach(c=>{if(c.team===d.id)c.team=null;});const c=S.coaches.find(c=>c.id===e.target.value);if(c)c.team=d.id;save();e.target.blur();render();}});
document.addEventListener('visibilitychange',()=>{if(document.hidden)save();else tick();});
S=load();if(!S.teams.length)S.teams.push({id:newId('t'),name:'Starter Squad',div:'Youth',focus:'tum'});
if(!S.cmarket.length)refreshCoaches(true);
if(!S.market.length)refreshMarket(true);
else if(Date.now()-S.marketAt>BAL.refreshSecs*1000)refreshMarket(true);
tick();setInterval(tick,1000);

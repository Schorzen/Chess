// 1v1 duels between friends met in Explore
const seen=new Set(),INV={};let pendCh=null;
const tpay=()=>team().map(p=>({id:p.id,name:p.name,types:p.types,hp:p.hp,atk:p.atk,def:p.def,lv:p.lv||1,rar:p.rar}));
async function startDuel(uid){const o=others[uid];if(!o)return;if(team().length<3){alert("You need at least 3 cards to duel.");return}
try{await mp.challenge(uid,o.name,tpay());pendCh={until:Date.now()+6e4}}catch(e){alert("Could not send the challenge.")}}
function invite(d){INV[d.id]=d;const el=document.getElementById("inv");el.innerHTML=`<b>${esc(d.fromName)}</b> challenges you to a 1v1!<div class="two"><button class="alt" onclick="ansDuel('${d.id}',1)">Accept</button><button class="alt" onclick="ansDuel('${d.id}',0)">Decline</button></div>`;el.classList.add("show");setTimeout(()=>el.classList.remove("show"),6e4)}
async function ansDuel(id,yes){document.getElementById("inv").classList.remove("show");try{if(yes&&team().length>=3)await mp.accept(id,tpay());else{await mp.decline(id);if(yes)alert("You need at least 3 cards to duel.")}}catch(e){}}
async function runDuel(d){const r=sim(d.teamFrom,d.teamTo);try{await mp.finish(d.id,{win:r.win,ev:r.ev.map(e=>({...e,hp:{a:e.hp[0],b:e.hp[1]}}))})}catch(e){}}
async function playDuel(d,role){pendCh=null;let ev=d.res.ev.map(e=>({...e,hp:[e.hp.a,e.hp.b]})),win=d.res.win,me=d.teamFrom,en=d.teamTo;
if(role=="to"){ev=ev.map(e=>({att:e.att=="a"?"b":"a",i:e.j,j:e.i,d:e.d,m:e.m,faint:e.faint,hp:[e.hp[1],e.hp[0]]}));win=!win;me=d.teamTo;en=d.teamFrom}
const ok=Date.now()-(S.dt||0)>12e4,reward=ok?(win?6:1):0;if(ok){S.coins+=reward;S.dt=Date.now();save();hdr()}
E.hold=null;try{await playBattle(me,en,{win,ev,reward})}catch(e){document.getElementById("arena").classList.remove("show")}}
window.onDuel=(d,role)=>{const now=Date.now(),k=d.id+d.ts;
if(role=="to"&&d.status=="pending"&&now-d.ts<9e4&&!seen.has(k+"p")){seen.add(k+"p");invite(d)}
if(role=="from"&&d.status=="accepted"&&now-d.ts<18e4&&!seen.has(k+"a")){seen.add(k+"a");runDuel(d)}
if(d.status=="done"&&d.res&&now-(d.t2||0)<6e4&&!seen.has(k+"d")){seen.add(k+"d");playDuel(d,role)}
if(role=="from"&&d.status=="declined"&&now-d.ts<9e4&&!seen.has(k+"x")){seen.add(k+"x");pendCh=null;alert(d.toName+" declined your challenge.")}};

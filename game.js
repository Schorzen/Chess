// Block long-press menu, text selection, copy and image dragging (inputs stay usable)
const okEl=e=>e.target&&e.target.closest&&e.target.closest("input,textarea,select");
["contextmenu","selectstart","copy","cut","dragstart"].forEach(t=>document.addEventListener(t,e=>{if(!okEl(e))e.preventDefault()}));
const MAX=3,REGEN=30*60*1000,TOTAL=386,KEY="pokevault_v1";
let S=JSON.parse(localStorage.getItem(KEY)||"null")||{packs:MAX,t:Date.now(),col:{},coins:30,daily:0};
S.coins=S.coins??30;S.daily=S.daily||0;
const VAL={common:1,rare:3,epic:8,legendary:20};
let view="home",filter="all",genF="all",typeF="all",pending=[];
const save=()=>{localStorage.setItem(KEY,JSON.stringify(S));window.cloudSave&&window.cloudSave(S)};
window.getState=()=>S;window.setState=s=>{S={coins:30,daily:0,...s};save();render()};
function sell(id){const o=S.col[id];if(!o||o.n<2)return;o.n--;S.coins+=VAL[o.rar];save();render()}
function upg(id){const o=S.col[id],l=o.lv||1;if(l>=5||o.n-1<l)return;o.n-=l;o.lv=l+1;save();render()}
const eff=p=>{const m=1+.08*((p.lv||1)-1);return{...p,hp:Math.round(p.hp*m),atk:Math.round(p.atk*m),def:Math.round(p.def*m)}};
const pw=p=>p.hp+p.atk+p.def;
const team=()=>{const all=Object.values(S.col).map(eff),t=(S.team||[]).map(id=>all.find(p=>p.id==id)).filter(Boolean);return t.length==3?t:all.sort((a,b)=>pw(b)-pw(a)).slice(0,3)};
let pick=[];
function editTeam(){pick=team().map(p=>p.id);teamUI()}
function teamUI(){const sc=(document.querySelector(".plist")||{}).scrollTop||0,l=Object.values(S.col).map(eff).sort((a,b)=>pw(b)-pw(a));
dt.innerHTML=`<h2>Pick 3 fighters (${pick.length}/3)</h2><div class="plist">${l.map(p=>`<div class="prow ${pick.includes(p.id)?"sel":""}" onclick="tp(${p.id})"><img src="${img(p.id)}" alt=""><b>${cap(p.name)}${(p.lv||1)>1?" Lv"+p.lv:""}</b><span>${pw(p)}</span></div>`).join("")}</div><button class="go" style="max-width:420px" ${pick.length==3?"":"disabled"} onclick="saveTeam()">Save team</button>`;
dt.classList.add("show");document.querySelector(".plist").scrollTop=sc}
function tp(id){const i=pick.indexOf(id);if(i>=0)pick.splice(i,1);else if(pick.length<3)pick.push(id);teamUI()}
function saveTeam(){S.team=pick.slice();save();render()}
function detail(id){const o=S.col[id],p=eff(o),bar=(l,v)=>`<div class="bar2"><span>${l}</span><div><i style="width:${Math.min(100,v/180*100)}%"></i></div><b>${v}</b></div>`;
dt.innerHTML=cardHTML(o,o.n)+`<div class="bars">${bar("HP",p.hp)}${bar("ATK",p.atk)}${bar("DEF",p.def)}${mu(o.types)}<p class="sub">Level ${o.lv||1}/5 · ${o.n} copies · #${String(id).padStart(3,"0")}</p></div><button class="go" style="max-width:320px" onclick="dt.classList.remove('show')">Close</button>`;dt.classList.add("show")}
let last=null,busy=false;
function sim(A,B){const a=A.map(x=>({...x,h:x.hp*3})),b=B.map(x=>({...x,h:x.hp*3})),log=[],ev=[];let i=0,j=0,t=0;
const snap=()=>[a.map(x=>Math.max(0,x.h)),b.map(x=>Math.max(0,x.h))];
while(i<a.length&&j<b.length&&t<80){t++;const x=a[i],y=b[j];
const mx=typeMult(x.types||[],y.types||[]),d=Math.max(1,Math.round((x.atk*(.7+Math.random()*.6)-y.def*.35)*mx));y.h-=d;log.push(cap(x.name)+" hits "+cap(y.name)+" for "+d);ev.push({att:"a",i,j,d,m:mx,hp:snap(),faint:y.h<=0});
if(y.h<=0){log.push(cap(y.name)+" fainted");j++;continue}
const my=typeMult(y.types||[],x.types||[]),e=Math.max(1,Math.round((y.atk*(.7+Math.random()*.6)-x.def*.35)*my));x.h-=e;log.push(cap(y.name)+" hits "+cap(x.name)+" for "+e);ev.push({att:"b",i,j,d:e,m:my,hp:snap(),faint:x.h<=0});
if(x.h<=0){log.push(cap(x.name)+" fainted");i++}}
return{win:j>=b.length,log,ev}}
const TY={normal:["","rock steel","ghost"],fire:["grass ice bug steel","fire water rock dragon",""],water:["fire ground rock","water grass dragon",""],electric:["water flying","electric grass dragon","ground"],grass:["water ground rock","fire grass poison flying bug dragon steel",""],ice:["grass ground flying dragon","fire water ice steel",""],fighting:["normal ice rock dark steel","poison flying psychic bug fairy","ghost"],poison:["grass fairy","poison ground rock ghost","steel"],ground:["fire electric poison rock steel","grass bug","flying"],flying:["grass fighting bug","electric rock steel",""],psychic:["fighting poison","psychic steel","dark"],bug:["grass psychic dark","fire fighting poison flying ghost steel fairy",""],rock:["fire ice flying bug","fighting ground steel",""],ghost:["psychic ghost","dark","normal"],dragon:["dragon","steel","fairy"],dark:["psychic ghost","fighting dark fairy",""],steel:["ice rock fairy","fire water electric steel",""],fairy:["fighting dragon dark","fire poison steel",""]};
const typeMult=(at,dt)=>{if(!at.length)return 1;let best=0;for(const a of at){let m=1;const r=TY[a];if(r)for(const d of dt){if(r[0].split(" ").includes(d))m*=1.6;else if(r[1].split(" ").includes(d))m*=.6;else if(r[2].split(" ").includes(d))m*=.3}best=Math.max(best,m)}return best};
const mu=ts=>{const st=new Set(),wk=new Set();ts.forEach(a=>(TY[a]?TY[a][0]:"").split(" ").filter(Boolean).forEach(x=>st.add(x)));for(const a in TY)if(ts.some(d=>TY[a][0].split(" ").includes(d)))wk.add(a);
const ch=s=>[...s].map(t=>`<i class="t" style="background:${TC[t]}33;color:${TC[t]}">${t}</i>`).join("")||"–";return `<p class="sub" style="margin:8px 0 4px">Strong against</p><div class="meta">${ch(st)}</div><p class="sub" style="margin:8px 0 4px">Weak against</p><div class="meta">${ch(wk)}</div>`};
const TC={steel:"#8aa0b4",dark:"#7a6a58",fire:"#ff7a33",water:"#3d9be0",grass:"#4db366",electric:"#ffd43b",psychic:"#f783ac",ice:"#a5e8ff",poison:"#a855f7",ground:"#c9a24d",rock:"#9c8a6a",bug:"#94c43a",ghost:"#7c5cff",dragon:"#5c6bff",fighting:"#d9480f",flying:"#a5b8ff",normal:"#cfd4e6",fairy:"#ff9ecb"};
let skipB=false;const wt=ms=>skipB?Promise.resolve():new Promise(r=>setTimeout(r,ms));
async function playBattle(me,en,r){skipB=false;const $=id=>document.getElementById(id),ar=$("arena");
ar.classList.add("show");$("ares").style.display="none";let ci=-1,cj=-1;
const show=(a,p)=>{const el=$(a?"ps":"es");el.getAnimations().forEach(x=>x.cancel());el.style.visibility="visible";el.innerHTML=`<img src="${img(p.id)}" alt="">`;
$(a?"pnm":"enm").textContent=cap(p.name)+((p.lv||1)>1?" Lv"+p.lv:"");hp(a,p,p.hp*3);el.animate([{transform:`translateX(${a?-80:80}px)`,opacity:0},{transform:"none",opacity:1}],{duration:350})};
const hp=(a,p,v)=>{const b=$(a?"phb":"ehb"),q=Math.max(0,v)/(p.hp*3);b.style.width=q*100+"%";b.style.background=q>.5?"#4ade80":q>.2?"#facc15":"#f87171"};
const pos=el=>{const a=ar.getBoundingClientRect(),b=el.getBoundingClientRect();return[b.left-a.left+b.width/2,b.top-a.top+b.height/2]};
const fx=(el,col)=>{const[x,y]=pos(el),d=document.createElement("i");d.className="fx";d.style.cssText=`left:${x}px;top:${y}px;background:radial-gradient(${col},${col}00 70%)`;ar.appendChild(d);d.animate([{transform:"translate(-50%,-50%) scale(.2)",opacity:1},{transform:"translate(-50%,-50%) scale(3)",opacity:0}],{duration:520}).onfinish=()=>d.remove()};
const flt=(el,t)=>{const[x,y]=pos(el),d=document.createElement("b");d.className="dmg";d.textContent=t;d.style.cssText=`left:${x-14}px;top:${y-30}px`;ar.appendChild(d);d.animate([{transform:"translateY(0)",opacity:1},{transform:"translateY(-50px)",opacity:0}],{duration:800}).onfinish=()=>d.remove()};
const dots=h=>"●".repeat(h.filter(x=>x>0).length)+"○".repeat(h.filter(x=>x<=0).length);
$("pdots").textContent="●●●";$("edots").textContent="●●●";$("atxt").textContent="Battle start!";await wt(500);
for(const e of r.ev){if(skipB)break;
if(e.i!=ci){ci=e.i;show(true,me[ci])}if(e.j!=cj){cj=e.j;show(false,en[cj])}
const A=e.att=="a",atk=A?me[e.i]:en[e.j],tgt=A?en[e.j]:me[e.i],aEl=$(A?"ps":"es"),tEl=$(A?"es":"ps"),dir=A?1:-1;
$("atxt").textContent=cap(atk.name)+" attacks!"+(e.m>1.2?" It's super effective!":e.m&&e.m<.9?" Not very effective…":"");
await aEl.animate([{transform:"translate(0,0)"},{transform:`translate(${dir*50}px,${-dir*30}px)`},{transform:"translate(0,0)"}],{duration:380,easing:"ease-in-out"}).finished;
fx(tEl,TC[atk.types[0]]||"#fff");tEl.animate([{transform:"translateX(0)",filter:"brightness(1)"},{transform:"translateX(-10px)",filter:"brightness(3)"},{transform:"translateX(10px)"},{transform:"translateX(0)",filter:"brightness(1)"}],{duration:380});
flt(tEl,"-"+e.d);hp(!A,tgt,A?e.hp[1][e.j]:e.hp[0][e.i]);$("pdots").textContent=dots(e.hp[0]);$("edots").textContent=dots(e.hp[1]);await wt(520);
if(e.faint){$("atxt").textContent=cap(tgt.name)+" fainted!";await tEl.animate([{opacity:1,transform:"translateY(0)"},{opacity:0,transform:"translateY(40px)"}],{duration:500,fill:"forwards"}).finished;await wt(300)}}
await new Promise(res=>{$("ares").innerHTML=`<div class="res">${r.win?"Victory!":"Defeat"}</div><p class="sub">+${r.reward} coins</p><button class="go" id="acont" style="max-width:300px">Continue</button>`;$("ares").style.display="flex";$("acont").onclick=res});
ar.classList.remove("show")}
async function fight(){if(busy)return;const me=team();if(me.length<3||Date.now()-(S.bt||0)<3e5)return;busy=true;
const ids=[];while(ids.length<3){const i=1+Math.floor(Math.random()*TOTAL);if(!ids.includes(i))ids.push(i)}
try{const sc=1+.05*Math.min(S.wins||0,20);const en=(await Promise.all(ids.map(getP))).map(p=>({...p,hp:Math.round(p.hp*sc),atk:Math.round(p.atk*sc),def:Math.round(p.def*sc)}));
const r=sim(me,en);const reward=r.win?8+Math.min(S.wins||0,10):1;S.coins+=reward;if(r.win)S.wins=(S.wins||0)+1;S.bt=Date.now();save();last={...r,reward,en};try{await playBattle(me,en,last)}catch(e){document.getElementById("arena").classList.remove("show")}}
catch(e){alert("No connection. Try again.")}busy=false;render()}
const slim=p=>({id:p.id,name:p.name,types:p.types,hp:p.hp,atk:p.atk,def:p.def,rar:p.rar});
function addCard(p){const o=S.col[p.id];if(o)o.n++;else S.col[p.id]={...p,n:1,lv:1}}
function takeCard(id){const o=S.col[id];if(!o||o.n<2)return false;o.n--;return true}
const hdr=()=>document.getElementById("count").textContent=S.coins+" coins · "+Object.keys(S.col).length+"/"+TOTAL;
let tmsg="",OFFERS={};
const elig=t=>t.want?(S.col[t.want]&&S.col[t.want].n>1?S.col[t.want]:null):Object.values(S.col).find(p=>p.n>1&&p.rar==t.give.rar);
async function tradeView(){const app=document.getElementById("app");app.innerHTML=`<p class="sub">Loading…</p>`;
try{const r=await trade.list();if(view!="trade")return;
for(const t of r.done){await trade.claim(t.id);addCard(t.got);tmsg+=cap(t.got.name)+" arrived from "+esc(t.toName)+". "}
if(r.done.length){save();hdr()}
OFFERS={};r.open.forEach(t=>OFFERS[t.id]=t);const me=trade.uid(),mine=Object.values(S.col).filter(p=>p.n>1);
app.innerHTML=`<h2 style="margin-bottom:8px">Trade</h2>${tmsg?`<p class="sub" style="margin-bottom:10px">${tmsg}</p>`:""}
<div class="post"><p class="sub">Offer one of your extras. It leaves your collection until someone accepts, or you cancel.</p>`+
(mine.length?`<select id="tg">${mine.map(p=>`<option value="${p.id}">${cap(p.name)} x${p.n}</option>`).join("")}</select><input id="tw" type="number" min="1" max="386" placeholder="Want # (optional)"><button class="go" onclick="postTrade()">Post offer</button>`:`<p class="sub">You need a duplicate card to offer.</p>`)+
`</div><h3 style="margin:18px 0 10px">Open offers</h3>`+(r.open.length?r.open.map(t=>{const e=elig(t);
return `<div class="offer"><img src="${img(t.give.id)}" alt=""><div class="i"><b>${cap(t.give.name)}</b>${t.give.rar} · from ${esc(t.fromName)}<br>Wants: ${t.want?"#"+t.want:"any "+t.give.rar}</div>`+
(t.from==me?`<button class="sm" onclick="cancelTrade('${t.id}')">Cancel</button>`:`<button class="sm" ${e?"":"disabled"} onclick="acceptTrade('${t.id}')">${e?"Swap":"No match"}</button>`)+`</div>`}).join(""):`<p class="sub">No open offers.</p>`);tmsg="";
}catch(e){app.innerHTML=`<p class="sub">Could not load trades. Try again.</p>`}}
async function postTrade(){const id=+document.getElementById("tg").value,w=+document.getElementById("tw").value||null;if(!takeCard(id))return;save();
try{await trade.post(slim(S.col[id]),w);tmsg="Offer posted."}catch(e){S.col[id].n++;save();tmsg="Could not post. Try again."}tradeView()}
async function cancelTrade(id){try{await trade.cancel(id);addCard(OFFERS[id].give);save();tmsg="Offer cancelled."}catch(e){tmsg="Could not cancel."}tradeView()}
async function acceptTrade(id){const t=OFFERS[id],m=elig(t);if(!m)return;
try{await trade.accept(id,slim(m))}catch(e){tmsg="That offer is gone.";tradeView();return}
takeCard(m.id);addCard(t.give);save();tmsg="You got "+cap(t.give.name)+"!";tradeView()}
function claim(){if(Date.now()-S.daily<864e5)return;S.coins+=20;S.daily=Date.now();save();render()}
const esc=s=>String(s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const cap=s=>s[0].toUpperCase()+s.slice(1);
const img=id=>`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png`;
const rar=b=>b<320?"common":b<430?"rare":b<520?"epic":"legendary";
function regen(){const n=Date.now();if(S.packs>=MAX){S.t=n;return}
const g=Math.floor((n-S.t)/REGEN);if(g>0){S.packs=Math.min(MAX,S.packs+g);S.t=S.packs>=MAX?n:S.t+g*REGEN;save()}}
function cardHTML(p,n){return `<div class="card ${p.rar}"><div class="top"><b>${cap(p.name)}${(p.lv||1)>1?` Lv${p.lv}`:""}</b><span>HP ${p.hp}</span></div>
<div class="art"><img loading="lazy" src="${img(p.id)}" alt="${p.name}"></div>
<div class="meta">${p.types.map(t=>`<i class="t" style="background:${TC[t]||"#888"}33;color:${TC[t]||"#ccc"}">${t}</i>`).join("")}</div>
<div class="st"><span>ATK ${p.atk}</span><span>DEF ${p.def}</span></div><em class="rt">${p.rar}</em>${n>1?`<u class="x">x${n}</u><div class="btns"><button class="sell" onclick="event.stopPropagation();sell(${p.id})">Sell +${VAL[p.rar]}</button>${(p.lv||1)<5&&n-1>=(p.lv||1)?`<button class="sell up" onclick="event.stopPropagation();upg(${p.id})">Lv up</button>`:""}</div>`:""}</div>`}
const PC={};
async function getP(id){if(PC[id])return PC[id];return PC[id]=await getP2(id)}
async function getP2(id){const j=await(await fetch("https://pokeapi.co/api/v2/pokemon/"+id)).json();
const s=j.stats.map(x=>x.base_stat),b=s.reduce((a,c)=>a+c,0);
return{id,name:j.name,types:j.types.map(t=>t.type.name),hp:s[0],atk:s[1],def:s[2],rar:rar(b)}}
async function openPack(prem){regen();if(prem){if(S.coins<300)return;S.coins-=300}else{if(S.packs<1)return;S.packs--}save();render();
const N=5,C=15;
const ids=[];while(ids.length<C){const i=1+Math.floor(Math.random()*TOTAL);if(!ids.includes(i))ids.push(i)}
const ov=document.getElementById("ov");document.getElementById("pull").innerHTML='<div class="pack shake" style="grid-column:1/-1;margin:40px auto"></div>';ov.classList.add("show");document.getElementById("addb").disabled=true;
try{const cands=await Promise.all(ids.map(getP));
const W=prem?{common:20,rare:35,epic:30,legendary:15}:{common:62,rare:25,epic:10,legendary:3};
pending=[];const pool=[...cands];while(pending.length<N){const tot=pool.reduce((a,c)=>a+W[c.rar],0);let q=Math.random()*tot,k=0;for(;k<pool.length-1;k++){q-=W[pool[k].rar];if(q<=0)break}pending.push(pool.splice(k,1)[0])}}catch(e){if(prem)S.coins+=300;else S.packs++;save();ov.classList.remove("show");alert("No connection. Try again.");render();return}
await new Promise(r=>setTimeout(r,900));
document.getElementById("pull").innerHTML=pending.map((p,i)=>`<div class="flip" style="animation:pop .45s both;animation-delay:${i*.12}s" onclick="flipC(this)"><div class="in"><div class="back">?</div><div class="front">${cardHTML(p,1)}</div></div></div>`).join("");
document.getElementById("addb").disabled=true;
document.querySelectorAll(".flip .in").forEach(e=>e.style.minHeight=e.querySelector(".card").offsetHeight+"px");}
function flipC(e){e.classList.add("open");chk()}
function chk(){const n=document.querySelectorAll(".flip");document.getElementById("addb").disabled=!n.length||document.querySelectorAll(".flip.open").length<n.length}
function closeOv(){if(document.getElementById("addb").disabled)return;pending.forEach(p=>{const o=S.col[p.id];S.col[p.id]=o?{...o,n:o.n+1}:{...p,n:1}});pending=[];save();
document.getElementById("ov").classList.remove("show");render()}
function go(v){view=v;render()}
function render(){regen();dt.classList.remove("show");const owned=Object.keys(S.col).length;
document.getElementById("count").textContent=S.coins+" coins · "+owned+"/"+TOTAL;
n1.classList.toggle("on",view=="home");n2.classList.toggle("on",view=="col");n3.classList.toggle("on",view=="top");n4.classList.toggle("on",view=="battle");n5.classList.toggle("on",view=="trade");n6.classList.toggle("on",view=="explore");
const app=document.getElementById("app");
if(view=="home"){const mins=Math.max(1,Math.ceil((REGEN-(Date.now()-S.t))/60000));const left=864e5-(Date.now()-S.daily),ready=left<=0;
app.innerHTML=`<section class="hero"><div class="pack"><svg viewBox="0 0 24 24"><path d="M12 3l2.5 5.5L20 9l-4 4 1 6-5-3-5 3 1-6-4-4 5.500-.5z"/></svg></div>
<h2>Gen 1–3 Booster</h2><p class="sub">5 random cards per pack</p><div class="dots">${Array.from({length:MAX},(_,i)=>`<i class="${i<S.packs?"on":""}"></i>`).join("")}</div>
<p class="sub" style="margin-bottom:16px">${S.packs>=MAX?"Packs full":"Next pack in ~"+mins+" min"}</p>
<button class="go" ${S.packs<1?"disabled":""} onclick="openPack()">Open pack</button>
<div class="two"><button class="alt" ${S.coins<300?"disabled":""} onclick="openPack(true)">Premium · boosted odds · 300</button><button class="alt" ${ready?"":"disabled"} onclick="claim()">${ready?"Daily +20":"Daily in "+Math.ceil(left/36e5)+"h"}</button></div></section>`}
else if(view=="battle"){const me=team(),cd=3e5-(Date.now()-(S.bt||0)),mini=p=>`<div class="mini"><img src="${img(p.id)}" alt=""><b>${cap(p.name)}</b><br>${p.atk} ATK · ${p.def} DEF</div>`;
app.innerHTML=`<h2 style="margin-bottom:6px">Battle</h2><p class="sub" style="margin-bottom:12px">Your 3 strongest cards fight 3 random opponents. Wins so far: ${S.wins||0}. Opponents get stronger with every win.</p>`+
(me.length<3?`<p class="sub">Collect at least 3 cards to battle.</p>`:`<div class="team">${me.map(mini).join("")}</div><button class="pill" style="margin-top:10px;font-family:inherit;padding:10px 16px" onclick="editTeam()">Edit team</button><button class="go" style="margin-top:14px" ${cd>0||busy?"disabled":""} onclick="fight()">${busy?"Fighting…":cd>0?"Ready in "+Math.ceil(cd/6e4)+" min":"Fight"}</button>`)+
(last?`<div class="res" style="margin-top:16px">${last.win?"Victory":"Defeat"} · +${last.reward} coins</div><div class="log">${last.log.join("<br>")}</div>`:"")}
else if(view=="explore"){exploreView()}
else if(view=="trade"){tradeView()}
else if(view=="top"){app.innerHTML=`<p class="sub">Loading…</p>`;(window.cloud?cloud.top():Promise.resolve([])).then(r=>{if(view!="top")return;app.innerHTML=`<h2 style="margin-bottom:12px">Leaderboard</h2>`+(r.length?r.map((u,i)=>`<div class="row"><b>${i+1}</b><span>${esc(u.name||"Trainer")}</span><em>${u.count||0}/${TOTAL}</em></div>`).join(""):`<p class="sub">No players yet.</p>`)}).catch(()=>app.innerHTML=`<p class="sub">Could not load leaderboard.</p>`)}
else{const list=Object.values(S.col);const cards=filter=="all"?null:filter;
const inGen=i=>genF=="all"||(genF=="1"?i<=151:genF=="2"?i>151&&i<=251:i>251);
const gens=["all","1","2","3"].map(g=>`<button class="${genF==g?"on":""}" onclick="genF='${g}';render()">${g=="all"?"All gens":"Gen "+g}</button>`).join(""),tys=["all",...Object.keys(TC)].map(t=>`<button class="${typeF==t?"on":""}" style="${t!="all"&&typeF==t?`background:${TC[t]};border-color:${TC[t]}`:""}" onclick="typeF='${t}';render()">${cap(t)}</button>`).join("");
const chips=["all","common","rare","epic","legendary"].map(f=>`<button class="${filter==f?"on":""}" onclick="filter='${f}';render()">${cap(f)}</button>`).join("");
let html=`<div class="bar"><div style="width:${owned/TOTAL*100}%"></div></div><div class="chips">${chips}</div><div class="chips chsm">${gens}</div><div class="chips chsm">${tys}</div><div class="grid">`;
for(let i=1;i<=TOTAL;i++){if(!inGen(i))continue;const p=S.col[i];
if(p&&(!cards||p.rar==cards)&&(typeF=="all"||p.types.includes(typeF)))html+=`<div onclick="detail(${i})">${cardHTML(p,p.n)}</div>`;else if(!p&&!cards&&typeF=="all")html+=`<div class="empty">#${String(i).padStart(3,"0")}</div>`}
app.innerHTML=html+"</div>"}}
render();setInterval(()=>{if(view=="home"&&!pending.length)render()},30000);

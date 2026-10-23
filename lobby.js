// Game lobby (home screen), in-game Store and landscape lock
const ico=p=>`<svg viewBox="0 0 24 24">${p}</svg>`;
const ball=c=>`<svg viewBox="0 0 40 40"><circle cx="20" cy="20" r="17" fill="#fff" stroke="#222" stroke-width="2"/><path d="M3 20A17 17 0 0 1 37 20Z" fill="${c}" stroke="#222" stroke-width="2"/><path d="M3 20h34" stroke="#222" stroke-width="2"/><circle cx="20" cy="20" r="5" fill="#fff" stroke="#222" stroke-width="2"/></svg>`;
const LURE=`<svg viewBox="0 0 40 40"><path d="M14 6h12l-2 8 8 16a4 4 0 0 1-4 6H12a4 4 0 0 1-4-6l8-16z" fill="#a855f7" stroke="#222" stroke-width="2"/><path d="M13 24h14" stroke="#fff" stroke-width="2"/><circle cx="20" cy="30" r="3" fill="#ffd43b"/></svg>`;
const ITEMS=[
{id:"pb",name:"Poké Ball ×5",desc:"Standard catch chance.",cost:20,ic:ball("#e03131"),give:()=>S.balls=(S.balls||0)+5},
{id:"gb",name:"Great Ball ×3",desc:"Catch chance ×1.5.",cost:45,ic:ball("#3b82f6"),give:()=>S.gb=(S.gb||0)+3},
{id:"ub",name:"Ultra Ball ×2",desc:"Catch chance ×2.",cost:90,ic:ball("#facc15"),give:()=>S.ub=(S.ub||0)+2},
{id:"lure",name:"Lure · 5 min",desc:"Wild Pokémon appear twice as often.",cost:40,ic:LURE,give:()=>S.lure=Math.max(Date.now(),S.lure||0)+3e5},
{id:"pack",name:"Premium Pack",desc:"5 cards, boosted odds.",cost:300,ic:'<img src="cardback.jpg" alt="">',act:()=>openPack(true)}];
function buy(id){const it=ITEMS.find(x=>x.id==id);if(!it||S.coins<it.cost)return;
if(it.act){it.act();return}S.coins-=it.cost;it.give();save();hdr();render()}
function storeView(){typeof eb=="function"&&eb();const l=S.lure>Date.now()?" · Lure "+Math.ceil((S.lure-Date.now())/6e4)+" min":"";
document.getElementById("app").innerHTML=`<h2 style="margin:4px 0">Store</h2><p class="sub" style="margin-bottom:10px">You have: Poké ×${S.balls??10} · Great ×${S.gb||0} · Ultra ×${S.ub||0}${l}</p>
<div class="items">${ITEMS.map(it=>`<div class="item"><div class="ic">${it.ic}</div><b>${it.name}</b><span>${it.desc}</span><button class="go" ${S.coins<it.cost?"disabled":""} onclick="buy('${it.id}')">${it.cost} coins</button></div>`).join("")}</div>`}
function lobbyView(){typeof eb=="function"&&eb();
const all=Object.values(S.col).map(eff).sort((a,b)=>pw(b)-pw(a)),top=all[0],dl=864e5-(Date.now()-S.daily),ready=dl<=0;
const lines=top?["Ready to explore?","Tall grass is full of surprises!","Stock up at the Store!","Let's go find a rare one!"]:["Catch your first Pokémon in the tall grass!"];
const lb=(v,t,p)=>`<button class="lb" onclick="go('${v}')">${ico(p)}<span>${t}</span></button>`;
document.getElementById("app").innerHTML=`<div class="lobby">
<div class="lside">${lb("store","Store","<path d='M4 9l1-5h14l1 5M5 9v11h14V9M9 20v-6h6v6'/>")}${lb("battle","Battle","<path d='M14 4l6-1-1 6-9 9-3-3zM4 20l4-4M6 14l4 4'/>")}${lb("trade","Trade","<path d='M7 7h13l-3-3M17 17H4l3 3'/>")}
<button class="lb" ${ready?"":"disabled"} onclick="claim()">${ico("<path d='M4 11h16v9H4zM3 8h18v3H3zM12 8v12M12 8c-2-4-6-3-5 0M12 8c2-4 6-3 5 0'/>")}<span>${ready?"Daily +20":Math.ceil(dl/36e5)+"h"}</span></button></div>
<div class="lmid"><div class="bubble">${lines[Math.floor(Math.random()*lines.length)]}</div>${top?`<img class="pkm" src="${img(top.id)}" alt=""><div class="hname">${cap(top.name)}${(top.lv||1)>1?" Lv"+top.lv:""}</div>`:`<img class="pkm" src="cardback.jpg" alt="" style="height:66%">`}</div>
<div class="lright"><h4>Top trainers</h4><div id="lt"><p class="sub">Loading…</p></div></div>
<div class="lbar"><button onclick="go('col')">Collection</button><button onclick="go('packs')">Packs</button><button onclick="go('top')">Ranks</button></div>
<button class="explore" onclick="go('explore')"><b>EXPLORE</b><span>Poké ×${S.balls??10}</span></button></div>`;
(window.cloud&&cloud.top?cloud.top():Promise.resolve([])).then(r=>{const e=document.getElementById("lt");if(!e||view!="home")return;
e.innerHTML=r.slice(0,5).map((u,i)=>`<div class="lrow"><b>${i+1}</b><span>${esc(u.name||"Trainer")}</span><em>${u.count||0}</em></div>`).join("")||`<p class="sub">No players yet.</p>`}).catch(()=>{})}
function paintTop(){const bk=document.getElementById("bk");if(!bk)return;bk.style.display=view=="home"||view=="explore"?"none":"";
const o=Object.keys(S.col).length,top=Object.values(S.col).map(eff).sort((a,b)=>pw(b)-pw(a))[0];
document.getElementById("pname").textContent=window.pname||"Trainer";document.getElementById("plv").textContent="Lv "+(1+Math.floor(o/5));
document.getElementById("av").innerHTML=top?`<img src="${img(top.id)}" alt="">`:""}
async function goLandscape(){try{const d=document.documentElement;if(!document.fullscreenElement&&d.requestFullscreen)await d.requestFullscreen({navigationUI:"hide"});
if(screen.orientation&&screen.orientation.lock)await screen.orientation.lock("landscape")}catch(e){}}
document.addEventListener("pointerdown",goLandscape,{once:true});

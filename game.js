const MAX=5,REGEN=10*60*1000,TOTAL=151,KEY="pokevault_v1";
let S=JSON.parse(localStorage.getItem(KEY)||"null")||{packs:MAX,t:Date.now(),col:{}};
let view="home",filter="all",pending=[];
const save=()=>{localStorage.setItem(KEY,JSON.stringify(S));window.cloudSave&&window.cloudSave(S)};
window.getState=()=>S;window.setState=s=>{S=s;save();render()};
const cap=s=>s[0].toUpperCase()+s.slice(1);
const img=id=>`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png`;
const rar=b=>b<320?"common":b<430?"rare":b<520?"epic":"legendary";
function regen(){const n=Date.now();if(S.packs>=MAX){S.t=n;return}
const g=Math.floor((n-S.t)/REGEN);if(g>0){S.packs=Math.min(MAX,S.packs+g);S.t=S.packs>=MAX?n:S.t+g*REGEN;save()}}
function cardHTML(p,n){return `<div class="card ${p.rar}"><div class="top"><b>${cap(p.name)}</b><span>HP ${p.hp}</span></div>
<div class="art"><img loading="lazy" src="${img(p.id)}" alt="${p.name}"></div>
<div class="meta">${p.types.map(t=>`<i class="t">${t}</i>`).join("")}</div>
<div class="st"><span>ATK ${p.atk}</span><span>DEF ${p.def}</span></div><em class="rt">${p.rar}</em>${n>1?`<u class="x">x${n}</u>`:""}</div>`}
async function getP(id){const j=await(await fetch("https://pokeapi.co/api/v2/pokemon/"+id)).json();
const s=j.stats.map(x=>x.base_stat),b=s.reduce((a,c)=>a+c,0);
return{id,name:j.name,types:j.types.map(t=>t.type.name),hp:s[0],atk:s[1],def:s[2],rar:rar(b)}}
async function openPack(){regen();if(S.packs<1)return;S.packs--;save();render();
const ids=[];while(ids.length<5){const i=1+Math.floor(Math.random()*TOTAL);if(!ids.includes(i))ids.push(i)}
const ov=document.getElementById("ov");document.getElementById("pull").innerHTML="<p class='sub'>Opening…</p>";ov.classList.add("show");
try{pending=await Promise.all(ids.map(getP))}catch(e){S.packs++;save();ov.classList.remove("show");alert("No connection. Try again.");render();return}
document.getElementById("pull").innerHTML=pending.map(p=>`<div class="flip" onclick="this.classList.add('open')"><div class="in"><div class="back">?</div><div class="front">${cardHTML(p,1)}</div></div></div>`).join("");
document.querySelectorAll(".flip .in").forEach(e=>e.style.minHeight=e.querySelector(".card").offsetHeight+"px");}
function closeOv(){pending.forEach(p=>{const o=S.col[p.id];S.col[p.id]=o?{...o,n:o.n+1}:{...p,n:1}});pending=[];save();
document.getElementById("ov").classList.remove("show");render()}
function go(v){view=v;render()}
function render(){regen();const owned=Object.keys(S.col).length;
document.getElementById("count").textContent=owned+" / "+TOTAL;
n1.classList.toggle("on",view=="home");n2.classList.toggle("on",view=="col");
const app=document.getElementById("app");
if(view=="home"){const mins=Math.max(1,Math.ceil((REGEN-(Date.now()-S.t))/60000));
app.innerHTML=`<section class="hero"><div class="pack"><svg viewBox="0 0 24 24"><path d="M12 3l2.5 5.5L20 9l-4 4 1 6-5-3-5 3 1-6-4-4 5.500-.5z"/></svg></div>
<h2>Gen 1 Booster</h2><p class="sub">5 random cards per pack</p><div class="dots">${Array.from({length:MAX},(_,i)=>`<i class="${i<S.packs?"on":""}"></i>`).join("")}</div>
<p class="sub" style="margin-bottom:16px">${S.packs>=MAX?"Packs full":"Next pack in ~"+mins+" min"}</p>
<button class="go" ${S.packs<1?"disabled":""} onclick="openPack()">Open pack</button></section>`}
else{const list=Object.values(S.col);const cards=filter=="all"?null:filter;
const chips=["all","common","rare","epic","legendary"].map(f=>`<button class="${filter==f?"on":""}" onclick="filter='${f}';render()">${cap(f)}</button>`).join("");
let html=`<div class="bar"><div style="width:${owned/TOTAL*100}%"></div></div><div class="chips">${chips}</div><div class="grid">`;
for(let i=1;i<=TOTAL;i++){const p=S.col[i];
if(p&&(!cards||p.rar==cards))html+=cardHTML(p,p.n);else if(!p&&!cards)html+=`<div class="empty">#${String(i).padStart(3,"0")}</div>`}
app.innerHTML=html+"</div>"}}
render();setInterval(()=>{if(view=="home"&&!pending.length)render()},30000);

// Explore: walk around a map, find Pokémon in tall grass, throw balls to catch them
const TS=32,VW=11,VH=9,MW=34,MH=28,CP={common:.7,rare:.5,epic:.3,legendary:.12};
const EMAP=(()=>{let s=7;const r=()=>(s=(s*1103515245+12345)&0x7fffffff)/0x7fffffff;
const m=Array.from({length:MH},()=>Array(MW).fill(0));
for(let y=0;y<MH;y++)for(let x=0;x<MW;x++)if(x<2||y<2||x>=MW-2||y>=MH-2||r()<.1)m[y][x]=1;
for(let k=0;k<16;k++){const w=3+Math.floor(r()*5),h=2+Math.floor(r()*4),x0=2+Math.floor(r()*(MW-w-4)),y0=2+Math.floor(r()*(MH-h-4));for(let y=y0;y<y0+h;y++)for(let x=x0;x<x0+w;x++)m[y][x]=2}
for(let y=8;y<12;y++)for(let x=22;x<28;x++)m[y][x]=5;
const px=MW>>1;for(let y=2;y<MH-2;y++){m[y][px]=3;m[y][px+1]=3}for(let x=2;x<MW-2;x++){m[14][x]=3;m[15][x]=3}
for(let i=0;i<50;i++){const x=2+Math.floor(r()*(MW-4)),y=2+Math.floor(r()*(MH-4));if(m[y][x]==0)m[y][x]=4}
return m})();
const DIRS=[[0,-1],[1,0],[0,1],[-1,0]];
let E={x:17,y:14,tx:17,ty:14,t:1,d:2,hold:null,step:0,enc:null,last:0},runId=0,busyE=false;
function eb(){if(S.balls==null){S.balls=10;S.bl=Date.now()}const n=Date.now();
if(S.balls>=10)S.bl=n;else{const g=Math.floor((n-S.bl)/24e4);if(g>0){S.balls=Math.min(10,S.balls+g);S.bl=S.balls>=10?n:S.bl+g*24e4}}}
function hud(){eb();const e=document.getElementById("exb");if(e)e.textContent="Poké Balls "+S.balls+"/10"+(S.balls<10?" · +1 in "+Math.max(1,Math.ceil((24e4-(Date.now()-S.bl))/6e4))+" min":"")}
const ch=d=>`<svg viewBox="0 0 24 24" style="transform:rotate(${d}deg)"><path d="M6 15l6-6 6 6"/></svg>`;
function exploreView(){
document.getElementById("app").innerHTML=`<div class="ex"><div class="exh"><b id="exb"></b><span class="sub">Walk in tall grass</span></div>
<canvas id="cv" width="${VW*TS}" height="${VH*TS}"></canvas><div id="enc"></div>
<div class="dpad">${[[0,0,"up"],[1,3,"left"],[1,1,"right"],[1,2,"down"]].map(([r,d,n],i)=>`<button style="grid-row:${r+1};grid-column:${{up:2,left:1,right:3,down:2}[n]}" onpointerdown="hold(${d==3?3:d==1?1:d==2?2:0})" onpointerup="rel()" onpointerleave="rel()" onpointercancel="rel()" oncontextmenu="return false">${ch({up:0,right:90,down:180,left:270}[n])}</button>`).join("")}</div></div>`;
hud();E.hold=null;E.last=0;runId++;const id=runId;requestAnimationFrame(t=>loop(t,id))}
const hold=d=>{E.hold=d},rel=()=>{E.hold=null};
addEventListener("keydown",e=>{const k={ArrowUp:0,ArrowRight:1,ArrowDown:2,ArrowLeft:3}[e.key];if(k!=null&&view=="explore"){E.hold=k;e.preventDefault()}});
addEventListener("keyup",()=>{E.hold=null});
const walk=(x,y)=>x>=0&&y>=0&&x<MW&&y<MH&&[0,2,3,4].includes(EMAP[y][x]);
function loop(ts,id){if(view!="explore"||id!==runId)return;const dt=E.last?Math.min(50,ts-E.last):16;E.last=ts;
if(E.t<1){E.t=Math.min(1,E.t+dt/150);if(E.t>=1){E.x=E.tx;E.y=E.ty;E.step^=1;arrive()}}
else if(E.hold!=null&&!E.enc&&!busyE){E.d=E.hold;const[a,b]=DIRS[E.d],nx=E.x+a,ny=E.y+b;if(walk(nx,ny)){E.tx=nx;E.ty=ny;E.t=0}}
const cv=document.getElementById("cv");if(!cv)return;draw(cv.getContext("2d"));requestAnimationFrame(t=>loop(t,id))}
function arrive(){if(EMAP[E.y][E.x]==2&&Math.random()<.14)encounter()}
async function encounter(){busyE=true;try{const ids=[];while(ids.length<4){const i=1+Math.floor(Math.random()*TOTAL);if(!ids.includes(i))ids.push(i)}
const c=await Promise.all(ids.map(getP)),W={common:62,rare:25,epic:10,legendary:3},tot=c.reduce((a,p)=>a+W[p.rar],0);let q=Math.random()*tot,k=0;for(;k<c.length-1;k++){q-=W[c[k].rar];if(q<=0)break}
E.enc=c[k];const p=c[k];const el=document.getElementById("enc");if(!el||view!="explore"){E.enc=null;busyE=false;return}
el.innerHTML=`<p class="sub">A wild Pokémon appeared!</p><div style="width:min(250px,68vw)">${cardHTML(p,1)}</div><p id="em" style="min-height:22px;font-weight:600"></p><div class="two" id="eb" style="width:min(320px,90vw)"><button class="alt" onclick="throwBall()">Throw ball</button><button class="alt" onclick="endEnc()">Run</button></div>`;el.classList.add("show")}catch(e){}busyE=false}
function endEnc(){E.enc=null;E.hold=null;document.getElementById("enc").classList.remove("show");hud()}
function throwBall(){eb();const p=E.enc,m=document.getElementById("em");if(!p)return;
if(S.balls<1){m.textContent="No Poké Balls left. They refill over time.";return}
S.balls--;const done=t=>{m.textContent=t;document.getElementById("eb").innerHTML=`<button class="alt" onclick="endEnc()">Continue</button>`;save();hdr()};
if(Math.random()<CP[p.rar]){addCard(slim(p));done("Gotcha! "+cap(p.name)+" was caught!")}
else if(Math.random()<.35)done(cap(p.name)+" ran away!");else{m.textContent="It broke free! ("+S.balls+" balls left)";save()}}
function draw(c){const ox=Math.max(0,Math.min(MW*TS-VW*TS,(E.x+(E.tx-E.x)*(E.t<1?E.t:0))*TS+TS/2-VW*TS/2)),oy=Math.max(0,Math.min(MH*TS-VH*TS,(E.y+(E.ty-E.y)*(E.t<1?E.t:0))*TS+TS/2-VH*TS/2));
for(let y=Math.floor(oy/TS);y<=Math.ceil((oy+VH*TS)/TS);y++)for(let x=Math.floor(ox/TS);x<=Math.ceil((ox+VW*TS)/TS);x++)if(EMAP[y]&&EMAP[y][x]!=null)tile(c,EMAP[y][x],x*TS-ox,y*TS-oy);
const f=E.t<1?E.t:0,px=(E.x+(E.tx-E.x)*f)*TS-ox,py=(E.y+(E.ty-E.y)*f)*TS-oy;player(c,px,py)}
function tile(c,t,x,y){c.fillStyle=t==3?"#e6d79c":t==5?"#4aa3df":t==2?"#8fd27f":"#79c26e";c.fillRect(x,y,TS,TS);
if(t==0||t==4){c.fillStyle="#6bb561";c.fillRect(x+6,y+8,3,3);c.fillRect(x+20,y+20,3,3)}
if(t==1){c.fillStyle="#79c26e";c.fillRect(x,y,TS,TS);c.fillStyle="#5c3b1e";c.fillRect(x+13,y+22,6,9);c.fillStyle="#1f6b35";c.beginPath();c.arc(x+16,y+14,14,0,7);c.fill();c.fillStyle="#2f8f4a";c.beginPath();c.arc(x+12,y+10,6,0,7);c.fill()}
if(t==2){c.fillStyle="#3f9e4f";for(const[a,b]of[[4,6],[16,4],[24,10],[8,18],[20,20],[2,26],[14,28]]){c.fillRect(x+a,y+b,2,9);c.fillRect(x+a+3,y+b+2,2,7);c.fillRect(x+a-3,y+b+3,2,6)}}
if(t==4){c.fillStyle="#e8473d";c.fillRect(x+9,y+9,5,5);c.fillRect(x+20,y+18,5,5);c.fillStyle="#ffd84a";c.fillRect(x+11,y+11,1,1)}
if(t==5){c.fillStyle="#7cc4ee";c.fillRect(x+6,y+10,10,2);c.fillRect(x+18,y+22,8,2)}}
function player(c,x,y){const d=E.d,s=E.t<1?E.step:0;c.fillStyle="#0003";c.fillRect(x+8,y+28,16,3);
c.fillStyle="#333";c.fillRect(x+10,y+25+(s?1:0),5,5);c.fillRect(x+17,y+25+(s?0:1),5,5);
c.fillStyle="#3b5bdb";c.fillRect(x+9,y+15,14,11);c.fillStyle="#f2c9a0";c.fillRect(x+10,y+6,12,10);
c.fillStyle="#e03131";c.fillRect(x+8,y+2,16,6);if(d==2)c.fillRect(x+9,y+7,14,2);if(d==1)c.fillRect(x+20,y+6,5,3);if(d==3)c.fillRect(x+7,y+6,5,3);
if(d!=0){c.fillStyle="#222";if(d==2){c.fillRect(x+12,y+11,2,2);c.fillRect(x+18,y+11,2,2)}if(d==1)c.fillRect(x+19,y+11,2,2);if(d==3)c.fillRect(x+11,y+11,2,2)}}

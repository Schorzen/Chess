// Explore: walk around a map, find Pokémon in tall grass, throw balls to catch them
let VW=14,VH=7;const TS=32,MW=96,MH=64,CP={common:.7,rare:.5,epic:.3,legendary:.12};
const EMAP=(()=>{let s=7;const r=()=>(s=(s*1103515245+12345)&0x7fffffff)/0x7fffffff;
const m=Array.from({length:MH},()=>Array(MW).fill(0));
for(let y=0;y<MH;y++)for(let x=0;x<MW;x++)if(x<2||y<2||x>=MW-2||y>=MH-2||r()<.1)m[y][x]=1;
for(let k=0;k<90;k++){const w=3+Math.floor(r()*5),h=2+Math.floor(r()*4),x0=2+Math.floor(r()*(MW-w-4)),y0=2+Math.floor(r()*(MH-h-4));for(let y=y0;y<y0+h;y++)for(let x=x0;x<x0+w;x++)m[y][x]=2}
[[22,8,6,4],[60,20,9,6],[30,44,8,6],[80,40,9,6],[10,28,6,5],[50,50,7,5]].forEach(([a,b,w,h])=>{for(let y=b;y<b+h;y++)for(let x=a;x<a+w;x++)m[y][x]=5});
const px=MW>>1;for(let y=2;y<MH-2;y++){m[y][px]=3;m[y][px+1]=3}for(let x=2;x<MW-2;x++){m[14][x]=3;m[15][x]=3;m[40][x]=3;m[41][x]=3}for(let y=2;y<MH-2;y++)[20,21,76,77].forEach(q=>m[y][q]=3);
for(let i=0;i<320;i++){const x=2+Math.floor(r()*(MW-4)),y=2+Math.floor(r()*(MH-4));if(m[y][x]==0)m[y][x]=4}
[[9,110],[10,150],[11,220],[12,110]].forEach(([tt,n])=>{for(let i=0;i<n;i++){const x=2+Math.floor(r()*(MW-4)),y=2+Math.floor(r()*(MH-4));if(m[y][x]==0)m[y][x]=tt}});
for(let y=9;y<=13;y++)for(let x=8;x<=16;x++)m[y][x]=0;
for(let x=10;x<=14;x++){m[10][x]=6;m[11][x]=6;m[12][x]=8;m[13][x]=8}m[13][12]=7;[[9,13],[15,13],[9,12],[15,12],[8,11],[16,11]].forEach(([x,y])=>m[y][x]=4);
return m})();
const DIRS=[[0,-1],[1,0],[0,1],[-1,0]];
let LITE=false,LMODE="auto";try{LMODE=localStorage.getItem("pv_lite")||"auto"}catch(e){}LITE=LMODE=="on";
const TCH=new Map(),TRS={};let VIG=null,VIGK="",MINI=null;
function applyLite(){document.body.classList.toggle("lite",LITE);const b=document.getElementById("ltb");if(b)b.textContent="Lite: "+(LMODE=="auto"?"Auto"+(LITE?" ✓":""):LMODE=="on"?"On":"Off")}
function toggleLite(){LMODE=LMODE=="auto"?"on":LMODE=="on"?"off":"auto";LITE=LMODE=="on";E.fa=16;E.fc=0;TCH.clear();try{localStorage.setItem("pv_lite",LMODE)}catch(e){}applyLite()}
function tileImg(t,x,y,fr){const k=((y+2)*(MW+6)+(x+2))*4+fr;let c=TCH.get(k);if(c)return c;c=document.createElement("canvas");c.width=c.height=TS;ground(c.getContext("2d"),t,x,y,0,0,fr*(t==5?.78:.52));
TCH.set(k,c);if(TCH.size>2400)TCH.delete(TCH.keys().next().value);return c}
function treeImg(x,y){const v=hs(x,y)>.5?1:0;return TRS[v]||(TRS[v]=(()=>{const c=document.createElement("canvas");c.width=32;c.height=44;tree(c.getContext("2d"),x,y,0,10,0);return c})())}
const MCOL=["#6bbf5f","#2f7d3b","#3f9e4f","#e6d79c","#7ccb6c","#4aa3df","#2a9d8f","#ffd43b","#eceff4","#8b8f98","#2f7d3b","#6bbf5f","#6bbf5f"];
function drawMini(){const cv=document.getElementById("mini");if(!cv)return;if(!MINI){MINI=document.createElement("canvas");MINI.width=MW;MINI.height=MH;const m=MINI.getContext("2d");for(let y=0;y<MH;y++)for(let x=0;x<MW;x++){m.fillStyle=MCOL[EMAP[y][x]];m.fillRect(x,y,1,1)}}
const c=cv.getContext("2d");c.drawImage(MINI,0,0);c.fillStyle="#3b82f6";for(const u in others)c.fillRect(Math.round(others[u].px)-1,Math.round(others[u].py)-1,3,3);c.fillStyle="#ef4444";c.fillRect(E.x-2,E.y-2,5,5);c.fillStyle="#fff";c.fillRect(E.x-1,E.y-1,3,3)}
let others={};
let E={x:17,y:14,tx:17,ty:14,t:1,d:2,hold:null,step:0,enc:null,last:0},runId=0,busyE=false;
function eb(){if(S.balls==null){S.balls=10;S.bl=Date.now()}const n=Date.now();
if(S.balls>=10)S.bl=n;else{const g=Math.floor((n-S.bl)/24e4);if(g>0){S.balls=Math.min(10,S.balls+g);S.bl=S.balls>=10?n:S.bl+g*24e4}}}
function hud0(){eb();const e=document.getElementById("exb");if(e)e.textContent="Poké Balls "+S.balls+"/10"+(S.balls<10?" · +1 in "+Math.max(1,Math.ceil((24e4-(Date.now()-S.bl))/6e4))+" min":"")}
const ch=d=>`<svg viewBox="0 0 24 24" style="transform:rotate(${d}deg)"><path d="M6 15l6-6 6 6"/></svg>`;
function exploreView(){VH=7;VW=Math.max(10,Math.min(26,Math.round(VH*innerWidth/innerHeight)));
document.getElementById("app").innerHTML=`<div class="ex"><canvas id="cv" width="${VW*TS}" height="${VH*TS}"></canvas>
<div class="exhud"><button class="xb" onclick="go('home')">‹ Lobby</button><div class="exr"><span id="exb"></span><button class="xb" id="mu2" onclick="toggleMute()"></button><button class="xb" id="ltb" onclick="toggleLite()"></button><button class="xb" onclick="go('store')">Store</button></div></div>
<canvas id="mini" width="${MW}" height="${MH}"></canvas><div id="chal"></div><div id="enc"></div><div class="joy" id="joy"><div class="knob" id="knob"></div></div></div>`;
bindJoy();paintMute();applyLite();hud();others={};E.ls=0;E.ck="";window.mp&&mp.start(syncOthers);E.hold=null;E.last=0;runId++;const id=runId;requestAnimationFrame(t=>loop(t,id))}
const hold=d=>{E.hold=d},rel=()=>{E.hold=null};
addEventListener("keydown",e=>{const k={ArrowUp:0,ArrowRight:1,ArrowDown:2,ArrowLeft:3}[e.key];if(k!=null&&view=="explore"){E.hold=k;e.preventDefault()}});
addEventListener("keyup",()=>{E.hold=null});
const walk=(x,y)=>x>=0&&y>=0&&x<MW&&y<MH&&[0,2,3,4,7,11,12].includes(EMAP[y][x]);
function loop(ts,id){if(view!="explore"){if(id===runId){window.mp&&(mp.stop(),mp.leave());others={}}return}if(id!==runId)return;if(LITE&&E.last&&ts-E.last<31){requestAnimationFrame(t=>loop(t,id));return}const dt=E.last?Math.min(50,ts-E.last):16;E.last=ts;
if(LMODE=="auto"&&!LITE){E.fa=(E.fa||16)*.96+dt*.04;E.fc=(E.fc||0)+1;if(E.fc>150&&E.fa>27){LITE=true;applyLite()}}
if(E.t<1){E.t=Math.min(1,E.t+dt/150);if(E.t>=1){E.x=E.tx;E.y=E.ty;E.step^=1;arrive()}}
else if(E.hold!=null&&!E.enc&&!busyE){E.d=E.hold;const[a,b]=DIRS[E.d],nx=E.x+a,ny=E.y+b;if(walk(nx,ny)){E.tx=nx;E.ty=ny;E.t=0}}
if(ts-(E.hs||0)>1000){E.hs=ts;hud()}if(ts-(E.ms||0)>300){E.ms=ts;drawMini()}social();const cv=document.getElementById("cv");if(!cv)return;draw(cv.getContext("2d"));requestAnimationFrame(t=>loop(t,id))}
function arrive(){if(EMAP[E.y][E.x]==7){enterLab();return}if(EMAP[E.y][E.x]==2)sfx("grass");if(EMAP[E.y][E.x]==2&&Math.random()<(S.lure>Date.now()?.28:.14))encounter()}
async function encounter(){busyE=true;{const n=document.getElementById("cv");n&&(n.classList.add("flash"),setTimeout(()=>n.classList.remove("flash"),520))}try{const ids=[];while(ids.length<4){const i=1+Math.floor(Math.random()*TOTAL);if(!ids.includes(i))ids.push(i)}
const c=await Promise.all(ids.map(getP)),W={common:62,rare:25,epic:10,legendary:3},tot=c.reduce((a,p)=>a+W[p.rar],0);let q=Math.random()*tot,k=0;for(;k<c.length-1;k++){q-=W[c[k].rar];if(q<=0)break}
await new Promise(r=>setTimeout(r,450));E.enc=c[k];const p=c[k];const el=document.getElementById("enc");if(!el||view!="explore"){E.enc=null;busyE=false;return}
wildBattle(p)}catch(e){}busyE=false}
function endEnc(){E.enc=null;E.hold=null;document.getElementById("enc").classList.remove("show");hud()}
const ballBtns=()=>`<button class="alt" onclick="throwBall('p')">Poké ×${S.balls}</button>${S.gb>0?`<button class="alt" onclick="throwBall('g')">Great ×${S.gb}</button>`:""}${S.ub>0?`<button class="alt" onclick="throwBall('u')">Ultra ×${S.ub}</button>`:""}<button class="alt" onclick="endEnc()">Run</button>`;
function throwBall(t){eb();const p=E.enc,m=document.getElementById("em"),k={p:"balls",g:"gb",u:"ub"}[t];if(!p||!k)return;
if((S[k]||0)<1){m.textContent="None left. Visit the Store.";return}
S[k]--;const done=x=>{m.textContent=x;document.getElementById("eb").innerHTML=`<button class="alt" onclick="endEnc()">Continue</button>`;save();hdr()};
if(Math.random()<Math.min(.95,CP[p.rar]*{p:1,g:1.5,u:2}[t])){addCard(slim(p));done("Gotcha! "+cap(p.name)+" was caught!")}
else if(Math.random()<.35)done(cap(p.name)+" ran away!");else{m.textContent="It broke free!";document.getElementById("eb").innerHTML=ballBtns();save()}}
const hs=(x,y,k=0)=>{let h=Math.imul(x+k*131,374761393)^Math.imul(y+k*17,668265263);h=Math.imul(h^(h>>>13),1274126177);return((h^(h>>>16))>>>0)/4294967295};
const at=(x,y)=>EMAP[y]&&EMAP[y][x]!=null?EMAP[y][x]:1;
function draw(c){const f=E.t<1?E.t:0,fx=E.x+(E.tx-E.x)*f,fy=E.y+(E.ty-E.y)*f,tm=performance.now()/1000;
const ox=Math.round(Math.max(0,Math.min(MW*TS-VW*TS,fx*TS+TS/2-VW*TS/2))),oy=Math.round(Math.max(0,Math.min(MH*TS-VH*TS,fy*TS+TS/2-VH*TS/2)));
const x0=Math.floor(ox/TS),x1=Math.ceil((ox+VW*TS)/TS),y0=Math.floor(oy/TS),y1=Math.ceil((oy+VH*TS)/TS)+1;
c.imageSmoothingEnabled=false;
for(let y=y0-1;y<=y1;y++)for(let x=x0;x<=x1;x++){const t=at(x,y),an=!LITE&&(t==2||t==5),fr=an?Math.floor(tm*5)%4:0;c.drawImage(tileImg(t,x,y,fr),x*TS-ox,y*TS-oy)}
const px=Math.round(fx*TS-ox),py=Math.round(fy*TS-oy),objs=[];
for(let y=y0;y<=y1+1;y++)for(let x=x0-1;x<=x1;x++)if(at(x,y)==1&&y>=0&&x>=0&&y<MH&&x<MW)objs.push([y,0,x]);
objs.push([fy+.01,1]);for(const u in others)objs.push([others[u].py+.011,2,others[u]]);objs.sort((a,b)=>a[0]-b[0]);
for(const o of objs){if(o[1]==1)player(c,px,py,tm);else if(o[1]==2){const u=o[2],qx=Math.round(u.px*TS-ox),qy=Math.round(u.py*TS-oy);player(c,qx,qy,tm,{d:u.d,mv:u.mv,s:Math.floor(tm*6)%2,k:"#3b82f6"});tag(c,qx,qy,u.name)}else c.drawImage(treeImg(o[2],o[0]),o[2]*TS-ox,o[0]*TS-oy-10)}
if(at(Math.round(fx),Math.round(fy+.3))==2)blades(c,Math.round(fx),Math.round(fy+.3),px,py+6,tm,true);
if(!LITE){const k=VW+"x"+VH;if(VIGK!=k){VIG=document.createElement("canvas");VIG.width=VW*TS;VIG.height=VH*TS;const g=VIG.getContext("2d"),gr=g.createRadialGradient(VW*TS/2,VH*TS/2,VH*TS*.45,VW*TS/2,VH*TS/2,VW*TS*.75);gr.addColorStop(0,"#0000");gr.addColorStop(1,"#0a1a2a55");g.fillStyle=gr;g.fillRect(0,0,VW*TS,VH*TS);VIGK=k}c.drawImage(VIG,0,0)}}
function blades(c,x,y,px,py,tm,front){const cols=["#2f8a44","#43b05a","#7fd678"];
for(let i=0;i<8;i++){const bx=Math.floor(hs(x,y,i)*26)+2,by=Math.floor(hs(x,y,i+9)*14)+(front?0:10),sw=Math.round(Math.sin(tm*3+x*.9+i)*1.4),h=front?8:9+Math.floor(hs(x,y,i+3)*5);
c.fillStyle=cols[i%3];c.fillRect(px+bx+sw,py+by,2,h);c.fillRect(px+bx+sw-2,py+by+3,2,h-3);c.fillRect(px+bx+sw+2,py+by+2,2,h-2)}}
function ground(c,t,x,y,px,py,tm){const r=hs(x,y);
if(t==6){c.fillStyle="#2a9d8f";c.fillRect(px,py,TS,TS);c.fillStyle="#238a7e";for(let i=0;i<4;i++)c.fillRect(px,py+i*8+6,TS,2);c.fillStyle="#1f7a70";
if(at(x-1,y)!=6)c.fillRect(px,py,3,TS);if(at(x+1,y)!=6)c.fillRect(px+TS-3,py,3,TS);if(at(x,y-1)!=6)c.fillRect(px,py,TS,3);if(y==11)c.fillRect(px,py+TS-5,TS,5);
if(x==12&&y==10){c.fillStyle="#fff";c.beginPath();c.arc(px+16,py+20,11,0,7);c.fill();c.fillStyle="#e03131";c.beginPath();c.arc(px+16,py+20,11,Math.PI,0);c.fill();c.fillStyle="#111";c.fillRect(px+5,py+19,22,2);c.fillStyle="#fff";c.beginPath();c.arc(px+16,py+20,4,0,7);c.fill();c.strokeStyle="#111";c.lineWidth=1.5;c.stroke()}return}
if(t==8||t==7){c.fillStyle="#eceff4";c.fillRect(px,py,TS,TS);c.fillStyle="#d5dae3";c.fillRect(px,py+10,TS,1);c.fillRect(px,py+21,TS,1);if(y==13){c.fillStyle="#c3cad6";c.fillRect(px,py+TS-4,TS,4)}
if(t==8&&y==12&&(x==10||x==14)){c.fillStyle="#35597a";c.fillRect(px+4,py+4,24,24);c.fillStyle="#9fe3f2";c.fillRect(px+6,py+6,20,20);c.fillStyle="#35597a";c.fillRect(px+15,py+6,2,20);c.fillRect(px+6,py+15,20,2)}
if(t==8&&y==12&&x==12){c.fillStyle="#2a9d8f";c.fillRect(px+2,py+8,28,16);c.fillStyle="#fff";c.font="bold 11px sans-serif";c.textAlign="center";c.fillText("LAB",px+16,py+20);c.textAlign="left"}
if(t==7){c.fillStyle="#35597a";c.fillRect(px+3,py+2,26,30);c.fillStyle="#9fe3f2";c.fillRect(px+6,py+5,20,27);c.fillStyle="#35597a";c.fillRect(px+15,py+5,2,27);c.fillStyle="#ffd43b";c.fillRect(px+12,py+19,2,4);c.fillRect(px+18,py+19,2,4);c.fillStyle="#ffffff55";c.fillRect(px+7,py+6,5,12)}return}
if(t==3){c.fillStyle="#ebdfae";c.fillRect(px,py,TS,TS);c.fillStyle="#d9c98f";for(let i=0;i<4;i++)c.fillRect(px+Math.floor(hs(x,y,i)*28)+1,py+Math.floor(hs(x,y,i+5)*28)+1,2,2);
c.fillStyle="#c9b77c";if(at(x,y-1)!=3&&at(x,y-1)!=2)c.fillRect(px,py,TS,3);if(at(x,y+1)!=3&&at(x,y+1)!=2)c.fillRect(px,py+TS-3,TS,3);if(at(x-1,y)!=3&&at(x-1,y)!=2)c.fillRect(px,py,3,TS);if(at(x+1,y)!=3&&at(x+1,y)!=2)c.fillRect(px+TS-3,py,3,TS);return}
if(t==5){c.fillStyle="#3d9be0";c.fillRect(px,py,TS,TS);c.fillStyle="#58b0ee";c.fillRect(px,py+8,TS,6);c.fillRect(px,py+22,TS,6);
const w=Math.sin(tm*2+x*1.7+y*1.1);c.fillStyle="#bfe6ff";c.fillRect(px+8+Math.round(w*5),py+10,8,2);c.fillRect(px+4-Math.round(w*4),py+24,10,2);
c.fillStyle="#d9f0ff";if(at(x,y-1)!=5)c.fillRect(px,py,TS,3);if(at(x,y+1)!=5)c.fillRect(px,py+TS-3,TS,3);if(at(x-1,y)!=5)c.fillRect(px,py,3,TS);if(at(x+1,y)!=5)c.fillRect(px+TS-3,py,3,TS);return}
c.fillStyle=t==2?"#5aa84e":(x+y)&1?"#7ccb6c":"#76c466";c.fillRect(px,py,TS,TS);
if(t!=2){c.fillStyle="#63b055";for(let i=0;i<3;i++)c.fillRect(px+Math.floor(hs(x,y,i)*28)+1,py+Math.floor(hs(x,y,i+4)*28)+1,2,2);c.fillStyle="#9be28a";c.fillRect(px+Math.floor(r*24)+3,py+Math.floor(hs(x,y,7)*24)+3,2,2)}
if(t==4){const col=["#ff6b6b","#ffd43b","#f783ac","#74c0fc"][Math.floor(r*4)];for(const[a,b]of[[8,10],[20,19]]){c.fillStyle="#2f8a44";c.fillRect(px+a+1,py+b+3,2,6);c.fillStyle=col;c.fillRect(px+a-1,py+b,6,2);c.fillRect(px+a+1,py+b-2,2,6);c.fillStyle="#ffe066";c.fillRect(px+a+1,py+b,2,2)}}
const ell=(a,b,w,h,col)=>{c.fillStyle=col;c.beginPath();c.ellipse(px+a,py+b,w,h,0,0,7);c.fill()};
if(t==9){ell(16,27,13,5,"#0003");c.fillStyle="#7d828c";c.beginPath();c.moveTo(px+4,py+26);c.lineTo(px+6,py+14);c.lineTo(px+14,py+6);c.lineTo(px+24,py+8);c.lineTo(px+29,py+18);c.lineTo(px+27,py+27);c.fill();
c.fillStyle="#9aa0ab";c.beginPath();c.moveTo(px+8,py+15);c.lineTo(px+14,py+9);c.lineTo(px+22,py+10);c.lineTo(px+16,py+17);c.fill();c.fillStyle="#5f646e";c.beginPath();c.moveTo(px+28,py+18);c.lineTo(px+27,py+27);c.lineTo(px+14,py+27);c.lineTo(px+20,py+19);c.fill();c.fillStyle="#4b5059";c.fillRect(px+12,py+19,5,1);c.fillRect(px+16,py+20,1,4)}
if(t==10){ell(16,27,13,4,"#0003");ell(10,19,9,8,"#2d7f3e");ell(22,19,9,8,"#2d7f3e");ell(16,14,10,9,"#3a9a4c");ell(13,11,4,3,"#5cbc6c");c.fillStyle="#e8473d";c.fillRect(px+19,py+16,3,3);c.fillRect(px+9,py+21,3,3);c.fillRect(px+24,py+22,3,3)}
if(t==11){for(let i=0;i<5;i++){const a=4+hs(x,y,20+i)*24,b=6+hs(x,y,30+i)*22;ell(a+1,b+1,3.5,2.5,"#6f747d");ell(a,b,3.5,2.5,"#b9bec7")}}
if(t==12){for(const[a,b,cl]of[[10,20,"#e8473d"],[21,14,"#f59f00"]]){c.fillStyle="#f1ebdd";c.fillRect(px+a-1,py+b,3,6);ell(a,b,6,4,cl);c.fillStyle="#fff";c.fillRect(px+a-3,py+b-2,2,2);c.fillRect(px+a+1,py+b-1,2,2)}}
if(t==2)blades(c,x,y,px,py,tm,false)}
function tree(c,x,y,px,py,tm){const v=hs(x,y);c.fillStyle="#0003";c.beginPath();c.ellipse(px+16,py+29,13,5,0,0,7);c.fill();
c.fillStyle="#5a3a1e";c.fillRect(px+13,py+20,7,11);c.fillStyle="#7b5230";c.fillRect(px+13,py+20,3,11);
c.fillStyle=v>.5?"#1d6a34":"#1b6330";c.beginPath();c.arc(px+16,py+10,15,0,7);c.fill();
c.fillStyle="#2c8a46";c.beginPath();c.arc(px+13,py+8,11,0,7);c.fill();c.fillStyle="#4db366";c.beginPath();c.arc(px+9,py+4,5,0,7);c.fill();
c.fillStyle="#1d6a34";c.fillRect(px+20,py+10,2,2);c.fillRect(px+10,py+14,2,2);c.fillRect(px+22,py+16,2,2)}
function player(c,x,y,tm,o){const d=o?o.d:E.d,mv=o?o.mv:E.t<1,s=mv?(o?o.s:E.step):0,bob=mv?-Math.round(Math.abs(Math.sin((o?tm*5:E.t)*Math.PI))*2):0,k=o?o.k:"#e03131";
c.fillStyle="#0004";c.beginPath();c.ellipse(x+16,y+29,9,3.5,0,0,7);c.fill();
const Y=y+bob;
c.fillStyle="#2b2f45";c.fillRect(x+10,Y+24+(mv&&s?1:0),5,6);c.fillRect(x+17,Y+24+(mv&&!s?1:0),5,6);
c.fillStyle="#f3f3f3";c.fillRect(x+10,Y+29,5,2);c.fillRect(x+17,Y+29,5,2);
if(d==0){c.fillStyle="#f5c518";c.fillRect(x+9,Y+14,14,11)}
c.fillStyle="#3b5bdb";c.fillRect(x+9,Y+14,14,11);c.fillStyle="#2f49b0";c.fillRect(x+9,Y+22,14,3);
if(d==0){c.fillStyle="#f5c518";c.fillRect(x+11,Y+15,10,8)}
c.fillStyle="#f2c9a0";if(d==1)c.fillRect(x+23,Y+17,3,6);if(d==3)c.fillRect(x+6,Y+17,3,6);if(d==2||d==0){c.fillRect(x+6,Y+16+(mv?s:0),3,7);c.fillRect(x+23,Y+16+(mv?1-s:0),3,7)}
c.fillRect(x+10,Y+5,12,11);
if(d==0){c.fillStyle="#3a2a1a";c.fillRect(x+10,Y+5,12,9)}
c.fillStyle=k;c.fillRect(x+8,Y+1,16,7);c.fillRect(x+9,Y+0,14,2);
if(d==2){c.fillRect(x+9,Y+7,14,2);c.fillStyle="#fff";c.fillRect(x+14,Y+2,4,4)}if(d==1)c.fillRect(x+20,Y+6,6,3);if(d==3)c.fillRect(x+6,Y+6,6,3);
c.fillStyle="#1f1f2e";if(d==2){c.fillRect(x+12,Y+11,2,3);c.fillRect(x+18,Y+11,2,3)}if(d==1)c.fillRect(x+19,Y+11,2,3);if(d==3)c.fillRect(x+11,Y+11,2,3)}

function tag(c,x,y,n){c.font="bold 9px sans-serif";const w=c.measureText(n).width+8;c.fillStyle="#000b";c.fillRect(x+16-w/2,y-10,w,12);c.fillStyle="#fff";c.textAlign="center";c.fillText(n,x+16,y-1);c.textAlign="left"}
function syncOthers(list){const me=mp.uid(),now=Date.now();for(const p of list){if(p.uid==me)continue;const o=others[p.uid];
if(o){if(o.ts!=p.ts)o.rx=now;o.ts=p.ts;o.tx=p.x;o.ty=p.y;o.d=p.d;o.name=p.name}else if(now-p.ts<6e4)others[p.uid]={uid:p.uid,name:p.name,tx:p.x,ty:p.y,px:p.x,py:p.y,d:p.d,mv:false,ts:p.ts,rx:now}}}
function social(){const now=Date.now();
for(const u in others){const o=others[u];if(now-o.rx>4e4){delete others[u];continue}o.px+=(o.tx-o.px)*.18;o.py+=(o.ty-o.py)*.18;o.mv=Math.abs(o.tx-o.px)+Math.abs(o.ty-o.py)>.08}
if(window.mp&&(E.tx!=E.lx||E.ty!=E.ly||E.d!=E.ld||now-E.ls>8e3)&&now-E.ls>700){E.lx=E.tx;E.ly=E.ty;E.ld=E.d;E.ls=now;mp.pos(E.tx,E.ty,E.d)}
const f=E.t<1?E.t:0,fx=E.x+(E.tx-E.x)*f,fy=E.y+(E.ty-E.y)*f;let best=null,bd=2.2;
for(const u in others){const o=others[u],d=Math.hypot(o.px-fx,o.py-fy);if(d<bd){bd=d;best=o}}
const el=document.getElementById("chal");if(!el)return;const w=typeof pendCh!="undefined"&&pendCh&&pendCh.until>now,key=best?best.uid+(w?"w":""):"";
if(key!==E.ck){E.ck=key;el.innerHTML=best?(w?`<p class="sub">Waiting for ${esc(best.name)} to accept…</p>`:`<button class="go" style="margin-top:10px" onclick="startDuel('${best.uid}')">Challenge ${esc(best.name)}</button>`):""}}

function bindJoy(){const j=document.getElementById("joy"),k=document.getElementById("knob");if(!j)return;let on=false;
const mv=e=>{const r=j.getBoundingClientRect(),cx=r.left+r.width/2,cy=r.top+r.height/2;let dx=e.clientX-cx,dy=e.clientY-cy;const m=r.width/2-k.offsetWidth/2,d=Math.hypot(dx,dy);if(d>m){dx*=m/d;dy*=m/d}
k.style.transform=`translate(${dx}px,${dy}px)`;E.hold=d<14?null:Math.abs(dx)>Math.abs(dy)?(dx>0?1:3):(dy>0?2:0)};
const up=()=>{on=false;E.hold=null;k.style.transition="";k.style.transform=""};
j.onpointerdown=e=>{on=true;j.setPointerCapture(e.pointerId);k.style.transition="none";mv(e)};
j.onpointermove=e=>{if(on)mv(e)};j.onpointerup=up;j.onpointercancel=up;j.oncontextmenu=()=>false}

function hud(){eb();const e=document.getElementById("exb");if(e){const l=S.lure>Date.now()?" · Lure "+Math.ceil((S.lure-Date.now())/6e4)+"m":"";e.textContent="Poké ×"+S.balls+(S.gb>0?" · Great ×"+S.gb:"")+(S.ub>0?" · Ultra ×"+S.ub:"")+l}}

applyLite();

// Wild Pokémon battles in Explore (uses the battle arena): attack to weaken, then throw a ball
const WB={},$w=id=>document.getElementById(id),wait=ms=>new Promise(r=>setTimeout(r,ms));
const SH=[{transform:"translateX(0)",filter:"brightness(1)"},{transform:"translateX(-10px)",filter:"brightness(3)"},{transform:"translateX(10px)"},{transform:"translateX(0)",filter:"brightness(1)"}];
function wShow(a,p){const el=$w(a?"ps":"es");el.getAnimations().forEach(x=>x.cancel());el.style.visibility="visible";el.innerHTML=`<img src="${img(p.id)}" alt="">`;
$w(a?"pnm":"enm").textContent=cap(p.name)+((p.lv||1)>1?" Lv"+p.lv:"");el.animate([{transform:`translateX(${a?-90:90}px)`,opacity:0},{transform:"none",opacity:1}],{duration:450})}
function wHp(a,v,m){const b=$w(a?"phb":"ehb"),q=Math.max(0,v)/m;b.style.width=q*100+"%";b.style.background=q>.5?"#4ade80":q>.2?"#facc15":"#f87171"}
function wPos(el){const r=$w("arena").getBoundingClientRect(),b=el.getBoundingClientRect();return[b.left-r.left+b.width/2,b.top-r.top+b.height/2]}
function wFx(el,col){const[x,y]=wPos(el),d=document.createElement("i");d.className="fx";d.style.cssText=`left:${x}px;top:${y}px;background:radial-gradient(${col},${col}00 70%)`;$w("arena").appendChild(d);
d.animate([{transform:"translate(-50%,-50%) scale(.2)",opacity:1},{transform:"translate(-50%,-50%) scale(3)",opacity:0}],{duration:520}).onfinish=()=>d.remove()}
function wFlt(el,t){const[x,y]=wPos(el),d=document.createElement("b");d.className="dmg";d.textContent=t;d.style.cssText=`left:${x-14}px;top:${y-30}px`;$w("arena").appendChild(d);
d.animate([{transform:"translateY(0)",opacity:1},{transform:"translateY(-50px)",opacity:0}],{duration:800}).onfinish=()=>d.remove()}
function wMenu(){const c=$w("acmd");if(WB.done||WB.busy){c.innerHTML="";return}
c.innerHTML=(WB.me&&WB.mh>1?`<button class="cb" onclick="wAttack()">Attack</button>`:"")+`<button class="cb" onclick="wBall('p')">Poké ×${S.balls}</button>`+(S.gb>0?`<button class="cb" onclick="wBall('g')">Great ×${S.gb}</button>`:"")+(S.ub>0?`<button class="cb" onclick="wBall('u')">Ultra ×${S.ub}</button>`:"")+`<button class="cb" onclick="wRun()">Run</button>`}
async function wildBattle(p){eb();const lead=team()[0]||null;
Object.assign(WB,{p,me:lead,hp:p.hp*3,max:p.hp*3,mh:lead?lead.hp*3:0,mmax:lead?lead.hp*3:1,busy:true,done:false});
$w("arena").classList.add("show","wild");$w("ares").style.display="none";$w("es").innerHTML="";$w("ps").innerHTML="";
$w("pbox").style.display=lead?"":"none";$w("ptag").style.display=lead?"":"none";
wShow(false,p);wHp(false,WB.hp,WB.max);if(lead){wShow(true,lead);wHp(true,WB.mh,WB.mmax)}
$w("atxt").textContent="A wild "+cap(p.name)+" appeared!";await wait(700);WB.busy=false;if(lead)$w("atxt").textContent="What will you do?";wMenu()}
async function wAttack(){if(WB.busy||WB.done||!WB.me)return;WB.busy=true;wMenu();
const x=WB.me,y=WB.p,mx=typeMult(x.types||[],y.types||[]);let d=Math.max(1,Math.round((x.atk*(.7+Math.random()*.6)-y.def*.35)*mx));d=Math.max(0,Math.min(d,WB.hp-Math.ceil(WB.max*.05)));
$w("atxt").textContent=cap(x.name)+" attacks!"+(mx>1.2?" It's super effective!":mx<.9?" Not very effective…":"");
await $w("ps").animate([{transform:"none"},{transform:"translate(50px,-30px)"},{transform:"none"}],{duration:380,easing:"ease-in-out"}).finished;
wFx($w("es"),TC[x.types[0]]||"#fff");$w("es").animate(SH,{duration:380});wFlt($w("es"),d?"-"+d:"0");WB.hp-=d;wHp(false,WB.hp,WB.max);await wait(650);
if(WB.hp<=WB.max*.06)$w("atxt").textContent=cap(y.name)+" is barely standing! Throw a ball!";
else{await $w("es").animate([{transform:"none"},{transform:"translate(-50px,30px)"},{transform:"none"}],{duration:380,easing:"ease-in-out"}).finished;
const my=typeMult(y.types||[],x.types||[]),c=Math.max(1,Math.round((y.atk*(.6+Math.random()*.4)-x.def*.35)*my));
wFx($w("ps"),TC[y.types[0]]||"#fff");$w("ps").animate(SH,{duration:380});wFlt($w("ps"),"-"+c);WB.mh=Math.max(1,WB.mh-c);wHp(true,WB.mh,WB.mmax);await wait(550);
$w("atxt").textContent=WB.mh<=1?cap(x.name)+" is too tired to fight!":"What will you do?"}
WB.busy=false;wMenu()}
async function wBall(t){if(WB.busy||WB.done)return;eb();const k={p:"balls",g:"gb",u:"ub"}[t];if((S[k]||0)<1){$w("atxt").textContent="None left. Visit the Store.";return}
WB.busy=true;wMenu();S[k]--;save();hdr();
const[sx,sy]=wPos($w("ps")),[ex,ey]=wPos($w("es")),b=document.createElement("div");b.className="thball";b.style.setProperty("--bc",{p:"#e03131",g:"#3b82f6",u:"#facc15"}[t]);$w("arena").appendChild(b);
$w("atxt").textContent="You threw a "+{p:"Poké Ball",g:"Great Ball",u:"Ultra Ball"}[t]+"!";
const T="translate(-50%,-50%)";
await b.animate([{left:sx+"px",top:sy+"px",transform:T},{left:(sx+ex)/2+"px",top:Math.min(sy,ey)-80+"px",transform:T+" rotate(360deg)",offset:.5},{left:ex+"px",top:ey+"px",transform:T+" rotate(720deg)"}],{duration:700,easing:"ease-in"}).finished;
b.style.left=ex+"px";b.style.top=ey+"px";b.style.transform=T;
await $w("es").animate([{transform:"none",opacity:1,filter:"brightness(1)"},{transform:"scale(.1)",opacity:0,filter:"brightness(4)"}],{duration:320,fill:"forwards"}).finished;
const q=Math.min(.95,CP[WB.p.rar]*{p:1,g:1.5,u:2}[t]*(1+(1-WB.hp/WB.max)*1.2)),ok=Math.random()<q,n=ok?3:1+Math.floor(Math.random()*3);
for(let i=0;i<n;i++){await wait(250);await b.animate([{transform:T+" rotate(0)"},{transform:T+" rotate(-25deg)"},{transform:T+" rotate(25deg)"},{transform:T+" rotate(0)"}],{duration:560}).finished}
await wait(250);
if(ok){await b.animate([{filter:"brightness(1)"},{filter:"brightness(3)"},{filter:"brightness(1)"}],{duration:500}).finished;addCard(slim(WB.p));save();hdr();WB.done=true;wMenu();b.remove();wResult("Gotcha!",cap(WB.p.name)+" was caught!");return}
b.remove();const es=$w("es");es.getAnimations().forEach(a=>a.cancel());es.animate([{transform:"scale(.1)",opacity:0},{transform:"none",opacity:1}],{duration:350});
if(Math.random()<.35){WB.done=true;wMenu();$w("atxt").textContent=cap(WB.p.name)+" ran away!";await wait(900);wResult("Oh no!",cap(WB.p.name)+" ran away.");return}
$w("atxt").textContent="It broke free!";await wait(500);WB.busy=false;wMenu()}
function wResult(t,m){$w("ares").innerHTML=`<div class="res">${t}</div><p class="sub">${m}</p><button class="go" id="wc" style="max-width:300px">Continue</button>`;$w("ares").style.display="flex";$w("wc").onclick=wEnd}
async function wRun(){if(WB.busy||WB.done)return;WB.busy=true;wMenu();$w("atxt").textContent="Got away safely!";await wait(650);wEnd()}
function wEnd(){WB.done=true;$w("arena").classList.remove("show","wild");$w("ares").style.display="none";$w("pbox").style.display="";$w("ptag").style.display="";$w("acmd").innerHTML="";E.enc=null;E.hold=null;hud()}

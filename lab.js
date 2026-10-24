// Poké Lab: walk into the building on the Explore map to level up Pokémon with potions
const POTION_COST=25,MAXLV=10;let labSel=null;
function labEl(){let e=document.getElementById("lab");if(!e){e=document.createElement("div");e.id="lab";document.body.appendChild(e)}return e}
const labNeed=o=>(o.lv||1);
function enterLab(){E.hold=null;E.enc={lab:true};sfx("door");
const list=Object.values(S.col);labSel=list.length?(S.col[labSel]?labSel:eff(list.sort((a,b)=>pw(eff(b))-pw(eff(a)))[0]).id):null;labDraw();labEl().classList.add("show")}
function labClose(){labEl().classList.remove("show");E.x=E.tx=12;E.y=E.ty=14;E.t=1;E.d=2;E.enc=null;E.hold=null;hdr();sfx("door")}
function labPick(id){labSel=id;labDraw()}
function labBuy(n){const c=n==5?POTION_COST*5-10:POTION_COST*n;if(S.coins<c)return;S.coins-=c;S.pot=(S.pot||0)+n;save();hdr();sfx("buy");labDraw()}
function labUp(){const o=S.col[labSel];if(!o)return;const lv=o.lv||1,need=labNeed(o);if(lv>=MAXLV||(S.pot||0)<need)return;
S.pot-=need;o.lv=lv+1;save();sfx("lvl");labDraw(true)}
function labDraw(pop){const e=labEl(),all=Object.values(S.col).map(eff).sort((a,b)=>pw(b)-pw(a)),o=S.col[labSel],p=o&&eff(o),lv=o?(o.lv||1):0,need=o?labNeed(o):0,pot=S.pot||0;
const nx=o?eff({...o,lv:lv+1}):null,bar=(l,v,n)=>`<div class="bar2"><span>${l}</span><div><i style="width:${Math.min(100,v/200*100)}%"></i></div><b>${v}${n&&n>v?` <u>+${n-v}</u>`:""}</b></div>`;
e.innerHTML=`<div class="labtop"><b>Poké Lab</b><span class="pill">Potions ×${pot}</span><span class="pill">${S.coins} coins</span><button class="xb" onclick="labClose()">Leave</button></div>
<div class="labbody"><div class="lablist">${all.length?all.map(q=>`<div class="lm ${q.id==labSel?"on":""}" onclick="labPick(${q.id})"><img src="${img(q.id)}" alt=""><b>${cap(q.name)}</b><span>Lv ${q.lv||1}</span></div>`).join(""):`<p class="sub" style="padding:12px">Catch a Pokémon first.</p>`}</div>
<div class="labdet">${o?`<div class="ldh"><img id="labimg" class="${pop?"lvpop":""}" src="${img(o.id)}" alt=""><div><h3>${cap(o.name)} <em>Lv ${lv}/${MAXLV}</em></h3><div class="meta2">${(o.types||[]).map(t=>`<i class="t" style="background:${TC[t]||"#888"}33;color:${TC[t]||"#ccc"}">${t}</i>`).join("")}</div></div></div>
${bar("HP",p.hp,lv<MAXLV&&nx.hp)}${bar("ATK",p.atk,lv<MAXLV&&nx.atk)}${bar("DEF",p.def,lv<MAXLV&&nx.def)}
<p class="sub" style="margin:8px 0 6px">${lv>=MAXLV?"Max level reached.":`Next level needs <b>${need}</b> potion${need>1?"s":""} · you have ${pot}`}</p>
<button class="go" ${lv>=MAXLV||pot<need?"disabled":""} onclick="labUp()">Level up</button>`:""}
<div class="buyrow"><button class="alt" ${S.coins<POTION_COST?"disabled":""} onclick="labBuy(1)">Buy 1 potion · ${POTION_COST}</button><button class="alt" ${S.coins<POTION_COST*5-10?"disabled":""} onclick="labBuy(5)">Buy 5 · ${POTION_COST*5-10}</button></div></div></div>`}

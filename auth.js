// Game data in Firebase: saving progress, trades, friends in Explore, duels, leaderboard
import {auth,db} from "./firebase.js";
import {doc,getDoc,setDoc,collection,query,orderBy,limit,getDocs,where,addDoc,updateDoc,runTransaction,onSnapshot,deleteDoc} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
let uid=null,timer;
window.cloudSave=s=>{if(!uid)return;clearTimeout(timer);timer=setTimeout(()=>
 setDoc(doc(db,"users",uid),{packs:s.packs,t:s.t,col:s.col,coins:s.coins,daily:s.daily,wins:s.wins||0,bt:s.bt||0,team:s.team||null,balls:s.balls??10,bl:s.bl||Date.now(),gb:s.gb||0,ub:s.ub||0,lure:s.lure||0,count:Object.keys(s.col).length,
 name:auth.currentUser?.displayName||"Trainer"},{merge:true}).catch(console.error),800)};
const nm=()=>auth.currentUser?.displayName||"Trainer",tc=()=>collection(db,"trades"),pk=s=>s.docs.map(d=>({id:d.id,...d.data()}));
window.trade={
 uid:()=>uid,
 async list(){const o=await getDocs(query(tc(),where("status","==","open"),limit(40)));
  const d=await getDocs(query(tc(),where("from","==",uid),where("status","==","accepted")));return{open:pk(o).sort((a,b)=>b.ts-a.ts),done:pk(d)}},
 post:(give,want)=>addDoc(tc(),{from:uid,fromName:nm(),give,want:want||null,status:"open",ts:Date.now()}),
 cancel:id=>updateDoc(doc(db,"trades",id),{status:"cancelled"}),
 claim:id=>updateDoc(doc(db,"trades",id),{status:"claimed"}),
 accept:(id,got)=>runTransaction(db,async tx=>{const r=doc(db,"trades",id),s=await tx.get(r);
  if(!s.exists()||s.data().status!=="open")throw new Error("gone");tx.update(r,{status:"accepted",to:uid,toName:nm(),got})})
};
let unsubP=null,unsubD=[];
const stopD=()=>{unsubD.forEach(f=>f());unsubD=[]};
function watchDuels(){stopD();for(const k of["to","from"])unsubD.push(onSnapshot(query(collection(db,"duels"),where(k,"==",uid)),s=>s.docChanges().forEach(c=>{if(c.type!="removed"&&window.onDuel)window.onDuel({id:c.doc.id,...c.doc.data()},k)}),()=>{}))}
window.mp={uid:()=>uid,
 start(cb){this.stop();unsubP=onSnapshot(collection(db,"presence"),s=>cb(s.docs.map(d=>({uid:d.id,...d.data()}))),()=>{})},
 stop(){unsubP&&unsubP();unsubP=null},
 pos:(x,y,d)=>uid&&setDoc(doc(db,"presence",uid),{x,y,d,name:nm(),ts:Date.now()}).catch(()=>{}),
 leave:()=>uid&&deleteDoc(doc(db,"presence",uid)).catch(()=>{}),
 challenge:(to,toName,team)=>setDoc(doc(db,"duels",uid+"_"+to),{from:uid,to,fromName:nm(),toName,status:"pending",teamFrom:team,ts:Date.now()}),
 accept:(id,team)=>updateDoc(doc(db,"duels",id),{status:"accepted",teamTo:team}),
 decline:id=>updateDoc(doc(db,"duels",id),{status:"declined"}),
 finish:(id,res)=>updateDoc(doc(db,"duels",id),{status:"done",res,t2:Date.now()})};
window.onSignOut=()=>{clearTimeout(timer);uid=null;stopD()};
window.onUser=async u=>{
 if(!u){uid=null;stopD();return}
 const s=await getDoc(doc(db,"users",u.uid));
 uid=u.uid;window.pname=u.displayName||"Trainer";watchDuels();
 if(s.exists()){const d=s.data();setState({packs:d.packs,t:d.t,col:d.col||{},coins:d.coins??30,daily:d.daily||0,wins:d.wins||0,bt:d.bt||0,team:d.team||null,balls:d.balls??10,bl:d.bl||Date.now(),gb:d.gb||0,ub:d.ub||0,lure:d.lure||0})}
 else window.cloudSave(getState())};
window.cloud=Object.assign(window.cloud||{},{
 async top(){return (await getDocs(query(collection(db,"users"),orderBy("count","desc"),limit(20)))).docs.map(d=>d.data())}});

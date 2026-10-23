import {initializeApp} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {getAuth,onAuthStateChanged,createUserWithEmailAndPassword,signInWithEmailAndPassword,signOut,updateProfile,sendEmailVerification} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import {getFirestore,doc,getDoc,setDoc,collection,query,orderBy,limit,getDocs} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
const cfg={apiKey:"AIzaSyCkiiYyPINqFW98QnvFUou7zUYtq2Dz-5k",authDomain:"pokevault-6dae1.firebaseapp.com",projectId:"pokevault-6dae1",storageBucket:"pokevault-6dae1.firebasestorage.app",messagingSenderId:"1042434349246",appId:"1:1042434349246:web:0e95b8fb980f5c30e526ef"};
const auth=getAuth(initializeApp(cfg)),db=getFirestore();
const $=id=>document.getElementById(id);
let uid=null,timer,up=false;
window.cloudSave=s=>{if(!uid)return;clearTimeout(timer);timer=setTimeout(()=>
 setDoc(doc(db,"users",uid),{packs:s.packs,t:s.t,col:s.col,coins:s.coins,daily:s.daily,count:Object.keys(s.col).length,
 name:auth.currentUser?.displayName||"Trainer"},{merge:true}).catch(console.error),800)};
window.cloud={
 toggle(){up=!up;$("nm").style.display=up?"":"none";$("sb").textContent=up?"Create account":"Sign in";
  $("sw").textContent=up?"Have an account? Sign in":"New here? Create account";$("err").textContent=""},
 async submit(){$("err").textContent="";const e=$("em").value.trim(),p=$("pw").value;
  try{if(up){const n=$("nm").value.trim();if(!n)throw{code:"name"};
   const c=await createUserWithEmailAndPassword(auth,e,p);await updateProfile(c.user,{displayName:n});await sendEmailVerification(c.user)}
  else await signInWithEmailAndPassword(auth,e,p)}
  catch(x){const m={name:"Enter a trainer name.","auth/invalid-email":"Invalid email.","auth/weak-password":"Password needs 6+ characters.",
   "auth/email-already-in-use":"Email already used. Sign in instead.","auth/invalid-credential":"Wrong email or password."};
   $("err").textContent=m[x.code]||"Something went wrong. Try again."}},
 async check(){await auth.currentUser.reload();$("vmsg").textContent=auth.currentUser.emailVerified?"":"Not verified yet. Open the link in your email first.";enter(auth.currentUser)},
 async resend(){try{await sendEmailVerification(auth.currentUser);$("vmsg").textContent="Email sent. Check spam too."}catch(e){$("vmsg").textContent="Please wait a minute before resending."}},
 async top(){return (await getDocs(query(collection(db,"users"),orderBy("count","desc"),limit(20)))).docs.map(d=>d.data())},
 async out(){clearTimeout(timer);uid=null;await signOut(auth);setState({packs:5,t:Date.now(),col:{}})}
};
async function enter(u){
 $("so").style.display="";
 if(!u.emailVerified){uid=null;$("auth").classList.remove("show");$("vm").textContent=u.email;$("verify").classList.add("show");return}
 $("auth").classList.remove("show");$("verify").classList.remove("show");
 const s=await getDoc(doc(db,"users",u.uid));
 uid=u.uid;
 if(s.exists()){const d=s.data();setState({packs:d.packs,t:d.t,col:d.col||{},coins:d.coins??100,daily:d.daily||0})}
 else window.cloudSave(getState());
}
onAuthStateChanged(auth,u=>{
 if(!u){uid=null;$("so").style.display="none";$("verify").classList.remove("show");$("auth").classList.add("show");return}
 enter(u)});

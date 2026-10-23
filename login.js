// Login, register, forgot password and email verification screens
import {auth} from "./firebase.js";
import {onAuthStateChanged,createUserWithEmailAndPassword,signInWithEmailAndPassword,signOut,updateProfile,sendEmailVerification,sendPasswordResetEmail} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
const $=id=>document.getElementById(id);
$("loginRoot").innerHTML=`<div id="auth"><div class="lgl"><div class="fan"><img src="cardback.jpg" alt=""><img src="cardback.jpg" alt=""><img src="cardback.jpg" alt=""></div><h1 style="font-size:34px">Poké<span>Vault</span></h1><p class="sub">Catch, level up and battle with friends.</p></div>
<div class="lgr"><h2 id="lt2">Welcome back</h2>
<input id="nm" placeholder="Trainer name" style="display:none" maxlength="16">
<input id="em" type="email" placeholder="Email" autocomplete="email">
<div class="pwrow"><input id="pw" type="password" placeholder="Password (6+ characters)" autocomplete="current-password"><button id="eyeb" type="button" onclick="cloud.eye()">Show</button></div>
<a id="fg" class="fg" onclick="cloud.forgot()">Forgot password?</a>
<div id="err"></div><div id="okm"></div><button class="go" id="sb" onclick="cloud.submit()">Sign in</button>
<a id="sw" onclick="cloud.toggle()">New here? Create account</a></div></div>
<div id="verify"><div class="lgl"><div class="fan"><img src="cardback.jpg" alt=""><img src="cardback.jpg" alt=""><img src="cardback.jpg" alt=""></div><h1 style="font-size:34px">Poké<span>Vault</span></h1></div>
<div class="lgr"><h2>Verify your email</h2><p class="sub">We sent a link to <b id="vm"></b>. Open it, then come back here.</p><div id="vmsg" class="sub"></div>
<button class="go" onclick="cloud.check()">I've verified</button><button class="pill" style="font-family:inherit;padding:14px" onclick="cloud.resend()">Resend email</button><a onclick="cloud.out()">Sign out</a></div></div>`;
let up=false;
const MSG={name:"Enter a trainer name.",email:"Type your email above first.","auth/invalid-email":"Invalid email.","auth/missing-email":"Type your email above first.","auth/weak-password":"Password needs 6+ characters.","auth/email-already-in-use":"Email already used. Sign in instead.","auth/invalid-credential":"Wrong email or password.","auth/too-many-requests":"Too many tries. Wait a few minutes and try again.","auth/network-request-failed":"No connection. Try again."};
const clr=()=>{$("err").textContent="";$("okm").textContent=""};
const screen=w=>{$("auth").classList.toggle("show",w=="auth");$("verify").classList.toggle("show",w=="verify")};
function gate(u){
 if(!u){$("so").style.display="none";screen("auth");window.onUser&&window.onUser(null);window.bootDone&&bootDone();return}
 $("so").style.display="";
 if(!u.emailVerified){$("vm").textContent=u.email;screen("verify");window.onUser&&window.onUser(null);window.bootDone&&bootDone();return}
 screen(null);window.onUser&&window.onUser(u)}
onAuthStateChanged(auth,gate);
window.cloud=Object.assign(window.cloud||{},{
 toggle(){up=!up;$("nm").style.display=up?"":"none";$("fg").style.display=up?"none":"";$("sb").textContent=up?"Create account":"Sign in";$("lt2").textContent=up?"Create your trainer":"Welcome back";
  $("sw").textContent=up?"Have an account? Sign in":"New here? Create account";$("pw").autocomplete=up?"new-password":"current-password";clr()},
 eye(){const p=$("pw"),s=p.type=="password";p.type=s?"text":"password";$("eyeb").textContent=s?"Hide":"Show"},
 async submit(){clr();const e=$("em").value.trim(),p=$("pw").value,b=$("sb");b.classList.add("busy");window.showBoot&&showBoot(up?"Creating your account…":"Signing in…");
  try{if(up){const n=$("nm").value.trim();if(!n)throw{code:"name"};
   const c=await createUserWithEmailAndPassword(auth,e,p);await updateProfile(c.user,{displayName:n});await sendEmailVerification(c.user)}
  else await signInWithEmailAndPassword(auth,e,p)}
  catch(x){$("err").textContent=MSG[x.code]||"Something went wrong. Try again.";window.bootDone&&bootDone()}
  b.classList.remove("busy")},
 async forgot(){clr();const e=$("em").value.trim();if(!e){$("err").textContent=MSG.email;return}
  try{await sendPasswordResetEmail(auth,e);$("okm").textContent="If that email has an account, a reset link is on its way. Check spam too."}
  catch(x){$("err").textContent=MSG[x.code]||"Could not send the email. Try again."}},
 async check(){await auth.currentUser.reload();$("vmsg").textContent=auth.currentUser.emailVerified?"":"Not verified yet. Open the link in your email first.";gate(auth.currentUser)},
 async resend(){try{await sendEmailVerification(auth.currentUser);$("vmsg").textContent="Email sent. Check spam too."}catch(e){$("vmsg").textContent="Please wait a minute before resending."}},
 async out(){window.onSignOut&&window.onSignOut();await signOut(auth);setState({packs:5,t:Date.now(),col:{}})}
});

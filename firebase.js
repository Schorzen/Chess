// Shared Firebase setup (used by login.js and auth.js)
import {initializeApp} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {getAuth} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import {getFirestore} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
const cfg={apiKey:"AIzaSyCkiiYyPINqFW98QnvFUou7zUYtq2Dz-5k",authDomain:"pokevault-6dae1.firebaseapp.com",projectId:"pokevault-6dae1",storageBucket:"pokevault-6dae1.firebasestorage.app",messagingSenderId:"1042434349246",appId:"1:1042434349246:web:0e95b8fb980f5c30e526ef"};
export const app=initializeApp(cfg),auth=getAuth(app),db=getFirestore(app);

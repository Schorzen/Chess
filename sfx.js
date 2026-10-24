// Sound effects (made with the browser's audio, no files needed) + mute button
let MUTE=false;try{MUTE=localStorage.getItem("pv_mute")=="1"}catch(e){}
const AC=window.AudioContext||window.webkitAudioContext;let actx=null;
function ac(){if(!actx&&AC)actx=new AC();if(actx&&actx.state=="suspended")actx.resume();return actx}
function tone(f,d,type="square",v=.14,when=0,slide=0){const c=ac();if(!c||MUTE)return;const t=c.currentTime+when,o=c.createOscillator(),g=c.createGain();
o.type=type;o.frequency.setValueAtTime(f,t);if(slide)o.frequency.exponentialRampToValueAtTime(Math.max(30,f+slide),t+d);
g.gain.setValueAtTime(v,t);g.gain.exponentialRampToValueAtTime(.001,t+d);o.connect(g);g.connect(c.destination);o.start(t);o.stop(t+d+.03)}
function noise(d,v=.2,when=0,freq=900){const c=ac();if(!c||MUTE)return;const t=c.currentTime+when,n=Math.floor(c.sampleRate*d),b=c.createBuffer(1,n,c.sampleRate),a=b.getChannelData(0);
for(let i=0;i<n;i++)a[i]=(Math.random()*2-1)*(1-i/n);const s=c.createBufferSource(),f=c.createBiquadFilter(),g=c.createGain();s.buffer=b;f.type="lowpass";f.frequency.value=freq;
g.gain.setValueAtTime(v,t);s.connect(f);f.connect(g);g.connect(c.destination);s.start(t)}
const notes=(a,d,type,v,gap)=>a.forEach((f,i)=>tone(f,d,type,v,i*gap));
const SFX={click:()=>tone(700,.05,"square",.06),grass:()=>noise(.07,.05,0,2500),door:()=>{tone(330,.1,"triangle",.15);tone(440,.14,"triangle",.15,.1)},
encounter:()=>{notes([392,494,587,784],.1,"square",.12,.08);noise(.12,.08)},hit:()=>{noise(.14,.25,0,1800);tone(190,.13,"sawtooth",.18,0,-110)},
sup:()=>{noise(.2,.3,0,3000);tone(240,.2,"sawtooth",.22,0,-140);tone(700,.12,"square",.12,.09)},weak:()=>{noise(.08,.08);tone(160,.16,"triangle",.14,0,-50)},
faint:()=>tone(420,.55,"sawtooth",.16,0,-350),throw:()=>tone(280,.45,"sine",.14,0,600),shake:()=>{tone(210,.07,"square",.1);tone(170,.07,"square",.1,.09)},
catch:()=>notes([523,659,784,1047,1319],.15,"square",.13,.11),fail:()=>tone(320,.45,"sawtooth",.13,0,-220),run:()=>tone(500,.25,"triangle",.12,0,-300),
buy:()=>{tone(880,.07,"square",.1);tone(1320,.12,"square",.1,.07)},lvl:()=>notes([523,659,784,988,1319],.14,"triangle",.17,.09),
win:()=>notes([523,659,784,1047],.2,"square",.13,.15),lose:()=>notes([392,330,262],.28,"triangle",.15,.2)};
function sfx(n){try{SFX[n]&&SFX[n]()}catch(e){}}
const ON='<svg viewBox="0 0 24 24"><path d="M4 9v6h4l5 4V5L8 9zM16 9a4 4 0 010 6M18.5 6.5a8 8 0 010 11"/></svg>',OFF='<svg viewBox="0 0 24 24"><path d="M4 9v6h4l5 4V5L8 9zM17 9l5 6M22 9l-5 6"/></svg>';
function paintMute(){["mu","mu2"].forEach(i=>{const e=document.getElementById(i);if(e)e.innerHTML=MUTE?OFF:ON})}
function toggleMute(){MUTE=!MUTE;try{localStorage.setItem("pv_mute",MUTE?"1":"0")}catch(e){}paintMute();sfx("click")}
document.addEventListener("pointerdown",()=>ac(),{once:true});
document.addEventListener("click",e=>{if(e.target.closest&&e.target.closest("button,.lb,.item,.lm"))sfx("click")});
document.addEventListener("DOMContentLoaded",paintMute);paintMute();

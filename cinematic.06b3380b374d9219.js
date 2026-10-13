import {createCinematicSpace,gsap,ScrollTrigger} from './features-webgl.bundle.8bccad821889656f.js';
const root=document.documentElement,reduced=matchMedia('(prefers-reduced-motion: reduce)');
gsap.registerPlugin(ScrollTrigger);
let paused=root.dataset.motionPaused==='true',disposed=false;const worlds=[],visibility=new Map();
for(const [id,hero]of [['hero-orbit',true],['story-space',false]]){const host=document.getElementById(id);try{const world=createCinematicSpace(host,{hero});worlds.push({host,world});visibility.set(host,false);}catch{host.dataset.renderer='fallback';}}
const io=new IntersectionObserver(entries=>{for(const e of entries){visibility.set(e.target,e.isIntersecting);worlds.find(w=>w.host===e.target)?.world.update({visible:e.isIntersecting,still:paused||reduced.matches});}},{threshold:.01});worlds.forEach(w=>io.observe(w.host));
const storyWorld=worlds.find(w=>w.host.id==='story-space');let storyProgress=0,beat=0;
function setBeat(i){beat=i;document.querySelector('.story-amount').hidden=i!==2||paused||reduced.matches;document.querySelectorAll('[data-beat]').forEach(el=>{const chosen=Number(el.dataset.beat)===i;el.classList.toggle('current',chosen);if(paused||reduced.matches)el.removeAttribute('aria-hidden');else el.setAttribute('aria-hidden',String(!chosen));});document.querySelectorAll('[data-story-pick]').forEach(el=>el.setAttribute('aria-pressed',String(Number(el.dataset.storyPick)===i)));}
let context;
function rebuild(){context?.revert();context=null;setBeat(beat);worlds.forEach(w=>w.world.update({visible:visibility.get(w.host),still:paused||reduced.matches}));requestAnimationFrame(fitUnits);if(paused||reduced.matches)return;
 context=gsap.context(()=>{
  ScrollTrigger.create({id:'mailtodo-story',trigger:'.cinema-story',start:'top top+=100',end:'bottom bottom',onUpdate:self=>{storyProgress=self.progress;storyWorld?.world.update({progress:storyProgress});setBeat(Math.min(3,Math.floor(storyProgress*4)));}});
  document.querySelectorAll('.feature-chapter').forEach((chapter,i)=>{
   const stage=chapter.querySelector('.task-stage,.reply-stage,.invoice-stage,.reader-preview');
   const copy=chapter.querySelector('.chapter-copy,.reading-heading');
   if(stage)gsap.fromTo(stage,{y:145,x:i%2?-75:75,scale:.78,rotateY:i%2?14:-14},{y:0,x:0,scale:1,rotateY:0,ease:'power2.out',scrollTrigger:{trigger:chapter,start:'top 85%',end:'top 18%',scrub:1}});
   if(copy)gsap.fromTo(copy,{y:90,opacity:.3},{y:0,opacity:1,ease:'power2.out',scrollTrigger:{trigger:chapter,start:'top 85%',end:'top 25%',scrub:.7}});
  });
 });ScrollTrigger.refresh();
}
document.querySelectorAll('[data-story-pick]').forEach(button=>button.addEventListener('click',()=>{const i=Number(button.dataset.storyPick);const trigger=ScrollTrigger.getById('mailtodo-story');if(trigger){window.scrollTo({top:trigger.start+(trigger.end-trigger.start)*(i+[.1,.45,.65,.75][i])/4,behavior:'smooth'});}else document.querySelector(['#tasks','#replies','#invoices','#reading'][i]).scrollIntoView({behavior:'auto'});}));
document.addEventListener('mailtodo-motion',e=>{if(paused===e.detail.paused)return;paused=e.detail.paused;rebuild();});reduced.addEventListener('change',rebuild);
document.addEventListener('visibilitychange',()=>worlds.forEach(w=>w.world.update({visible:!document.hidden&&visibility.get(w.host),still:paused||reduced.matches})));
addEventListener('pagehide',e=>{worlds.forEach(w=>w.world.update({visible:false}));if(!e.persisted){disposed=true;context?.revert();io.disconnect();worlds.forEach(w=>w.world.dispose());}});addEventListener('pageshow',()=>{if(!disposed){worlds.forEach(w=>w.world.update({visible:visibility.get(w.host),still:paused||reduced.matches}));ScrollTrigger.refresh();}});
// Imported ONDO fallback: font/column changes never shrink type to force a unit to fit.
const parents=[...new Set([...document.querySelectorAll('.copy-unit')].map(unit=>unit.parentElement))],widths=new WeakMap();
function fitUnits(){for(const unit of document.querySelectorAll('.copy-unit')){unit.classList.remove('copy-wrap');const parent=unit.parentElement,style=getComputedStyle(parent),available=parent.clientWidth-parseFloat(style.paddingLeft)-parseFloat(style.paddingRight);unit.classList.toggle('copy-wrap',unit.scrollWidth>available+.5);}}
const textObserver=new ResizeObserver(entries=>{if(entries.some(e=>widths.get(e.target)!==e.contentRect.width)){entries.forEach(e=>widths.set(e.target,e.contentRect.width));fitUnits();}});parents.forEach(p=>textObserver.observe(p));document.fonts.ready.then(fitUnits);fitUnits();rebuild();
addEventListener('pagehide',e=>{if(!e.persisted)textObserver.disconnect();});

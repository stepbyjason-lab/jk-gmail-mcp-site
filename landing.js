(() => {
const root=document.documentElement, reduced=matchMedia('(prefers-reduced-motion: reduce)');
root.classList.add('js');
const progress=document.querySelector('.scroll-progress'), hero=document.querySelector('.hero'),media=document.querySelector('.hero-media'),word=hero.querySelector('.giant-word'),flow=document.querySelector('.workflow');
const panels=[...document.querySelectorAll('[data-panel]')],buttons=[...document.querySelectorAll('[data-step]')];
let phase=-1,queued=false,manualStep=null;
function setPhase(next){phase=next;panels.forEach((p,i)=>{p.classList.toggle('active',i<=next);p.removeAttribute('aria-hidden');});buttons.forEach((b,i)=>b.setAttribute('aria-pressed',String(i===(manualStep??next))));}
function update(){queued=false;const y=window.scrollY;progress.style.transform='scaleX('+Math.min(1,y/Math.max(1,root.scrollHeight-innerHeight))+')';if(reduced.matches){panels.forEach(p=>p.setAttribute('aria-hidden','false'));media.style.transform='none';word.style.transform='none';return;}
const hp=Math.min(1,Math.max(0,y/Math.max(1,hero.offsetHeight)));media.style.transform='perspective(1100px) rotateY('+(-6+6*hp)+'deg) rotateZ('+(1-hp)+'deg) scale('+(.94+.09*hp)+')';word.style.transform='translateY('+Math.round(hp*100)+'px)';
const rect=flow.getBoundingClientRect(),top=document.querySelector('.nav').offsetHeight;const travel=Math.max(1,flow.offsetHeight-innerHeight+top), fp=Math.min(.999,Math.max(0,(top-rect.top)/travel));if(innerWidth<=760||innerHeight<=780){let next=0;panels.forEach((p,i)=>{if(p.getBoundingClientRect().top<innerHeight*.82)next=i;});setPhase(next);}else setPhase(Math.floor(fp*3));}
function schedule(){if(queued)return;queued=true;requestAnimationFrame(update);}
const onPreferenceChange=fn=>{if(typeof reduced.addEventListener==='function')reduced.addEventListener('change',fn);else reduced.addListener(fn);};
addEventListener('scroll',schedule,{passive:true});addEventListener('resize',schedule);onPreferenceChange(()=>{phase=-1;schedule();});
const clearManualStep=()=>{manualStep=null;schedule();};addEventListener('wheel',clearManualStep,{passive:true});addEventListener('touchstart',clearManualStep,{passive:true});addEventListener('keydown',e=>{if(['PageDown','PageUp','ArrowDown','ArrowUp','Home','End'].includes(e.key))clearManualStep();});
buttons.forEach((button,i)=>button.addEventListener('click',()=>{manualStep=i;setPhase(i);if(innerWidth<=760||innerHeight<=780){panels[i].scrollIntoView({behavior:reduced.matches?'auto':'smooth',block:'center'});return;}const top=document.querySelector('.nav').offsetHeight;const start=flow.getBoundingClientRect().top+scrollY-top;const travel=Math.max(1,flow.offsetHeight-innerHeight+top);window.scrollTo({top:start+travel*(i/3+.08),behavior:reduced.matches?'auto':'smooth'});}));
if('IntersectionObserver' in window){const observer=new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting){e.target.classList.add('visible');observer.unobserve(e.target);}}),{threshold:.08});document.querySelectorAll('.reveal').forEach(el=>observer.observe(el));}else document.querySelectorAll('.reveal').forEach(el=>el.classList.add('visible'));
const video=document.querySelector('#product-video');document.addEventListener('visibilitychange',()=>{if(document.hidden)video.pause();});setPhase(0);update();
const scenes=[...document.querySelectorAll('.hero-scene')],picks=[...document.querySelectorAll('[data-scene-pick]')],toggle=document.querySelector('#motion-toggle');
let selected=0,timer=null,paused=false,heroVisible=true;
function choose(i){scenes.forEach((s,n)=>{s.classList.toggle('leaving',n===selected&&n!==i);s.classList.toggle('current',n===i);s.setAttribute('aria-hidden',String(n!==i));});picks.forEach((b,n)=>b.setAttribute('aria-pressed',String(n===i)));selected=i;}
function manageMotion(){if(timer){clearInterval(timer);timer=null;}const stop=paused||reduced.matches||document.hidden||!heroVisible;media.classList.toggle('paused',stop);toggle.removeAttribute('aria-pressed');toggle.textContent=reduced.matches?'Reduced motion':paused?'Resume motion':'Pause motion';toggle.disabled=reduced.matches;if(!stop)timer=setInterval(()=>choose((selected+1)%scenes.length),3800);}
picks.forEach((button,i)=>button.addEventListener('click',()=>{choose(i);manageMotion();}));
toggle.addEventListener('click',()=>{paused=!paused;manageMotion();});
document.addEventListener('visibilitychange',manageMotion);onPreferenceChange(manageMotion);
if('IntersectionObserver' in window)new IntersectionObserver(entries=>{heroVisible=entries[0].isIntersecting;manageMotion();},{threshold:.08}).observe(hero);
manageMotion();
})();

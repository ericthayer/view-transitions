'use strict';
const params = new URLSearchParams(location.search);
const duration = Math.max(100,Math.min(2000,Number(params.get('duration'))||600));
const allowedEasing = ['cubic-bezier(.22,1,.36,1)','ease-in-out','linear','cubic-bezier(.34,1.56,.64,1)'];
const easing = allowedEasing.includes(params.get('easing')) ? params.get('easing') : allowedEasing[0];
document.documentElement.style.setProperty('--duration',duration+'ms');
document.documentElement.style.setProperty('--ease',easing);
const motion = matchMedia('(prefers-reduced-motion: reduce)');
const override = params.get('motion') === 'reduce';
if(override){const style = document.createElement('style');style.textContent='@view-transition { navigation: none; }';document.head.append(style);}
addEventListener('pageswap',event=>{if(override||motion.matches)event.viewTransition?.skipTransition();});
addEventListener('pagereveal',event=>{if(override||motion.matches)event.viewTransition?.skipTransition();});
addEventListener('DOMContentLoaded',()=>{
  document.querySelectorAll('[data-route]').forEach(link=>{link.search=new URLSearchParams({duration:String(duration),easing,motion:override?'reduce':'auto'}).toString();});
  document.querySelectorAll('a[href^="index.html"]').forEach(link=>{link.search=new URLSearchParams({demo:'navigation',duration:String(duration),easing,motion:override?'reduce':'auto'}).toString();});
  const status = document.querySelector('#route-status');
  const update = ()=>{status.textContent=override||motion.matches?'MOTION REDUCED / Native navigation continues without animation.':'Cross-document transitions animate in supporting browsers. Otherwise, these links navigate normally.';};
  update();motion.addEventListener('change',update);
});

import type { installSource } from './source';
import { firstStrike } from './cold';
import { blankLayout } from './material';
const cover = document.querySelector<HTMLElement>('[data-cone-routes]');
const families = new Set(cover?.dataset.coneRoutes?.split(' '));
const root = document.documentElement;
const labels = new Map([
  ['/', 'URUK'], ['/about', 'ABOUT'], ['/how-we-check', 'HOW WE CHECK'],
  ['/results', 'ALL RESULTS'], ['/404', 'ERROR 404'], ['/404.html', 'ERROR 404'],
]);

function pathOf(url: URL) {
  return url.pathname.replace(/\/$/, '') || '/';
}

function journey(event: Event) {
  const anchor = event.target instanceof Element ? event.target.closest('a[href]') : null;

  if (!(anchor instanceof HTMLAnchorElement) || anchor.hasAttribute('download')
    || (anchor.target && anchor.target !== '_self')) return;

  const url = new URL(anchor.href);
  const path = pathOf(url);
  const from = pathOf(new URL(location.href));

  if (url.origin !== location.origin || (path === from && url.search === location.search)) return;

  const family = /^\/results\/(\d{3})$/.exec(path)?.[1];
  if (family && families.has(family)) {
    if (from === '/results' || /^\/results\/\d{3}$/.test(from)) return { owner: 'count' as const, url, family };
    return { owner: 'cone' as const, url, name: 'ALL RESULTS / ' + family };
  }

  const name = labels.get(path);
  if (name) return { owner: 'cone' as const, url, name };
  return undefined;
}

const atlas = cover?.querySelector<HTMLImageElement>('[data-cone-atlas]');
let source: ReturnType<typeof installSource> | undefined;
let pending: {url:URL;name:string} | undefined;
let pressing = false;
let corner: HTMLCanvasElement | undefined;
function refresh() {
  if (pressing || !cover || !atlas) return;
  const next = firstStrike(blankLayout(),atlas);
  if (corner) corner.replaceWith(next); else cover.after(next);
  corner=next;
}
refresh();
atlas?.addEventListener('load',refresh);
if (window.ResizeObserver) {
  const observer=new ResizeObserver(([entry])=>{
    const width=root.clientWidth;
    const pixels=entry?.devicePixelContentBoxSize?.[0]?.inlineSize;
    if (!pixels || width<=0) return;
    const prior=window.urukConePixels;
    window.urukConePixels={width,pixels};
    if (prior?.width!==width || prior.pixels!==pixels) {refresh();source?.invalidate();}
  });
  try { observer.observe(root,{box:'device-pixel-content-box'}); } catch { observer.disconnect(); }
}
function show() { if (corner) corner.style.visibility = 'visible'; }
function hide() { if (corner) corner.style.visibility = 'hidden'; }
window.urukConeEntry={
  show,hide,
  install(controller) {
    source=controller;
    if (pending) {
      const {url,name}=pending;pending=undefined;source.close(url,name);
    }
  }
};
window.addEventListener('pageshow',event=>{if(event.persisted){pressing=false;pending=undefined;hide();}});
function decision(owner: string, reason: string) {
  if (cover?.dataset.coneDebug==='true') console.info('[cone] ' + owner + ': ' + reason);
}
window.addEventListener('click', event => {
  if (event.defaultPrevented || event.button !== 0 || event.ctrlKey || event.altKey || event.shiftKey || event.metaKey) {
    if (event.target instanceof Element && event.target.closest('a[href]')) decision('native','modified or already handled');
    return;
  }
  const route = journey(event);
  if (!route) { if (event.target instanceof Element && event.target.closest('a[href]')) decision('native', 'outside page routes'); return; }
  if (root.dataset.countStage || root.dataset.coneStage === 'pressing' || root.dataset.coneStage === 'covered') {
    event.preventDefault();
    return;
  }
  document.dispatchEvent(new Event('uruk:cone-depart'));
  if (route.owner === 'count') {
    source?.releaseForCount();
    const request = new CustomEvent('uruk:count-link', { cancelable: true, detail: route.url });
    if (!document.dispatchEvent(request)) {event.preventDefault();decision('count','result journey');}
  } else {
    event.preventDefault();
    decision('wall',source?.ready()?'warm':'cold');
    if (pressing) return;
    pressing=true;show();
    if (source) source.close(route.url,route.name);
    else pending={url:route.url,name:route.name};
  }
});

let pointer: {id:number;x:number;y:number} | undefined;
document.addEventListener('pointerdown', event=>{
  if (event.isPrimary && event.button===0 && !event.ctrlKey && !event.altKey && !event.metaKey && !event.shiftKey && journey(event)?.owner==='cone') {
    pointer={id:event.pointerId,x:event.clientX,y:event.clientY};
    show();
  }
},{passive:true});
function cancelPress() { pointer=undefined;if (!pressing) hide(); }
document.addEventListener('pointermove',event=>{
  if (pointer?.id===event.pointerId && Math.hypot(event.clientX-pointer.x,event.clientY-pointer.y)>8) cancelPress();
},{passive:true});
document.addEventListener('pointercancel',cancelPress,{passive:true});
document.addEventListener('pointerup',()=>setTimeout(cancelPress,0),{passive:true});
window.addEventListener('blur',cancelPress);
for (const type of ['pointerover', 'focusin', 'pointerdown', 'touchstart']) {
  document.addEventListener(type, event => { if (journey(event)?.owner === 'cone') source?.interest(); }, { passive: true });
}

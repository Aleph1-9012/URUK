import { installSource } from './source';
const cover=document.querySelector<HTMLElement>('[data-cone-routes]');
const face=cover?.querySelector<HTMLCanvasElement>('[data-cone-paper]');
const atlas=cover?.querySelector<HTMLImageElement>('[data-cone-atlas]');
if (cover && face && atlas && window.urukConeEntry) {
  window.urukConeEntry.install(installSource(face,atlas,cover,window.urukConeEntry));
}

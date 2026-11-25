import { backing, PAPER, paperCone, pitch, rowHeight, type BlankLayout, type Disc } from './material';
import { strikeAt, strikeOrder } from './wall';
import { printedHeads } from './layout';
import { preparation } from './preparation';

  function ellipse(ctx: CanvasRenderingContext2D, disc: Disc) {
    ctx.moveTo(disc.x + disc.rx, disc.y);
    ctx.ellipse(disc.x,disc.y,disc.rx,disc.ry,0,0,Math.PI*2);
  }

/** The lower-left cluster can be stamped before the full-page worker is ready. */
export function firstStrike(layout: BlankLayout, atlas: HTMLImageElement) {
  const { width, height, density, seed } = layout;
  const corner = document.createElement('canvas');
  const w = Math.min(144, width), h = Math.min(120, height);
  corner.width = Math.round(w*density);
  corner.height = Math.round(h*density);
  corner.style.cssText = 'position:fixed;inset:auto auto 0 0;width:'+w+'px;height:'+h+'px;z-index:101;pointer-events:none;visibility:hidden;contain:strict;transform:translate(0);will-change:transform';
  corner.setAttribute('aria-hidden','true');
  const pen = corner.getContext('2d');
  if (pen) {
    pen.setTransform(density,0,0,density,0,-(height-h)*density);
    pen.fillStyle = PAPER;
    pen.beginPath();
    for (let row=Math.floor((height-h)/rowHeight)-1; row<=height/rowHeight+1; row++) {
      for (let col=-2; col<=w/pitch+1; col++) {
        const disc=paperCone(row,col,seed);
        if (strikeAt(disc.x,disc.y,layout)===0) ellipse(pen,disc);
      }
    }
    pen.fill();
    if (atlas.complete && atlas.naturalWidth) {
      for (const head of printedHeads(w,height,Math.ceil(layout.fontSize*1.65),seed,height-h)) {
        const seat=backing(head);
        if (strikeAt(seat.x,seat.y,layout)!==0) continue;
        pen.beginPath();ellipse(pen,seat);pen.fill();
        pen.drawImage(atlas,head.sx,head.sy,head.width,head.height,head.x,head.y,head.width/3,head.height/3);
      }
    }
  }
  return corner;
}

export function coldPress(cover: HTMLElement, layout: BlankLayout, atlas: HTMLImageElement) {
  const {width,height,density}=layout;
  const controller=new AbortController();
  let paper: HTMLCanvasElement | undefined, ink: HTMLCanvasElement | undefined;
  let groups: Awaited<ReturnType<typeof strikeOrder>> | undefined;
  let previous = -1;
  const frame = requestAnimationFrame(() => {
    void strikeOrder(layout,preparation(controller.signal)).then(result=>{
      if (!controller.signal.aborted) groups=result;
    }).catch(()=>{});
  });
  function paint(beat: number) {
    if (!groups || previous>=beat || !atlas.complete || !atlas.naturalWidth) return;
    if (!paper || !ink) {
      paper=document.createElement('canvas');ink=document.createElement('canvas');
      for (const canvas of [paper,ink]) {
        canvas.width=Math.round(width*density);canvas.height=Math.round(height*density);
      }
      cover.append(paper,ink);
    }
    const ground=paper.getContext('2d'),print=ink.getContext('2d');
    if (!ground || !print) return;
    ground.setTransform(density,0,0,density,0,0);print.setTransform(density,0,0,density,0,0);
    ground.fillStyle=PAPER;
    for (let i=previous+1;i<=beat;i++) {
      const group=groups.strikes[i]!;
      ground.beginPath();for(const disc of group.discs)ellipse(ground,disc);ground.fill();
      for(const head of group.heads)print.drawImage(atlas,head.sx,head.sy,head.width,head.height,head.x,head.y,head.width/3,head.height/3);
    }
    previous=beat;

  }
  function remove() {
    controller.abort();cancelAnimationFrame(frame);paper?.remove();ink?.remove();
  }
  return { paint, remove };
}

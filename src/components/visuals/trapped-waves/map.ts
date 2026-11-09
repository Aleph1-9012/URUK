import { smooth } from '../../../lib/animation';

type Colors = { ink: string; blue: string; muted: string; paper: string };

type Point = { x: number; y: number };

type Box = { x: number; y: number; w: number; h: number };

type Label = (id: string, x: number, y: number, alpha?: number) => void;

function blendBox(a: Box, b: Box, amount: number): Box {
  return { x: a.x + (b.x - a.x) * amount, y: a.y + (b.y - a.y) * amount, w: a.w + (b.w - a.w) * amount, h: a.h + (b.h - a.h) * amount };
}

export function drawDisorderMap(pen: CanvasRenderingContext2D, width: number, height: number, time: number, colors: Colors, label: Label): void {
  const tall = height > width;
  const arrive = smooth(time, 18000, 21000);
  const zoom = smooth(time, 66000, 69500) * (1 - smooth(time, 80500, 84000));
  const gauge = smooth(time, 84000, 86500) * (1 - smooth(time, 99500, 101000));
  const titleX = width * (tall ? .5 : .76);
  const headerY = height * (tall ? time >= 101000 && time < 111000 ? .58 : .535 : .045);
  const gaugeScene = time >= 84000 && time < 101000;
  const size = tall ? 9 : 11;
  const words = (text: string, x: number, y: number, maxWidth: number, tone: keyof Colors = 'ink', alpha = 1): void => {
    if (alpha < .005) return;

    pen.font = `${size}px "Special Elite", monospace`;
    pen.textAlign = 'center';
    pen.textBaseline = 'middle';
    const lines: string[] = [];

    for (const paragraph of text.split('\n')) {
      let line = '';

      for (const word of paragraph.split(' ')) {
        const next = line ? `${line} ${word}` : word;

        if (line && pen.measureText(next).width > maxWidth) {
          lines.push(line);
          line = word;
        } else line = next;
      }

      lines.push(line);
    }

    pen.globalAlpha = alpha;

    for (const [index, line] of lines.entries()) {
      const extent = pen.measureText(line).width;
      const px = Math.max(extent / 2 + 4, Math.min(width - extent / 2 - 4, x));
      const py = y + (index - (lines.length - 1) / 2) * (size + 3);
      pen.fillStyle = colors.paper;
      pen.fillRect(px - extent / 2 - 2, py - size / 2 - 2, extent + 4, size + 4);
      pen.fillStyle = colors[tone];
      pen.fillText(line, px, py);
    }

    pen.globalAlpha = 1;
  };
  const line = (points: readonly Point[], tone: keyof Colors = 'ink', weight = 1, dashed = false, alpha = 1): void => {
    if (points.length < 2 || alpha < .005) return;

    pen.beginPath();
    pen.globalAlpha = alpha;
    pen.strokeStyle = colors[tone];
    pen.lineWidth = weight;
    pen.setLineDash(dashed ? [4, 3] : []);

    for (const [index, p] of points.entries()) {
      if (index === 0) pen.moveTo(p.x, p.y);
      else pen.lineTo(p.x, p.y);
    }

    pen.stroke();
    pen.setLineDash([]);
    pen.globalAlpha = 1;
  };
  const hatch = (path: Path2D, box: Box, alpha = .35): void => {
    pen.save();
    pen.clip(path);

    for (let x = Math.floor((box.x - box.h) / 8) * 8; x < box.x + box.w; x += 8) line([{ x, y: box.y + box.h }, { x: x + box.h, y: box.y }], 'muted', .6, false, alpha);

    pen.restore();
  };

  if (time < 18000) {
    if (!tall) {
      line([{ x: width * .57, y: height * .14 }, { x: width * .57, y: height * .81 }, { x: width * .95, y: height * .81 }], 'muted', .6, false, .15);
      words('WHO IS TRAPPED? · REGIONS SCHEMATIC', titleX, headerY, width * .4, 'muted');
    }

    return;
  }

  if (!tall || !gaugeScene) words(zoom > .4 ? '3D: NEAR THE BOTTOM · WIDTHS SCHEMATIC' : 'WHO IS TRAPPED? · REGIONS SCHEMATIC', titleX, headerY, width * (tall ? .94 : .43));
  const boxes: Box[] = tall
    ? [{ x: width * .09, y: height * .65, w: width * .36, h: height * .21 }, { x: width * .57, y: height * .65, w: width * .36, h: height * .21 }]
    : [{ x: width * .59, y: height * .17, w: width * .35, h: height * .23 }, { x: width * .59, y: height * .59, w: width * .35, h: height * .23 }];

  for (const [index, base] of boxes.entries()) {
    const d = index + 2;
    let box = base;

    if (tall && index === 0) box = blendBox(box, { ...box, x: -width * .5 }, zoom);
    if (tall && index === 1) box = blendBox(box, { x: width * .12, y: height * .64, w: width * .79, h: height * .23 }, zoom);
    if (!tall && index === 1) box = blendBox(box, { ...box, h: height * .15 }, smooth(time, 84000, 86500) * (1 - smooth(time, 101000, 103000)));
    if (tall && index === 0 && gaugeScene) continue;

    const panelZoom = index === 1 ? zoom : 0;
    const energyMin = -16 + 9.7 * panelZoom;
    const energyMax = 16 - 21.6 * panelZoom;
    const maxH = 10 - 9.85 * panelZoom;
    const point = (energy: number, h: number): Point => ({ x: box.x + (energy - energyMin) / (energyMax - energyMin) * box.w, y: box.y + box.h * (1 - h / maxH) });
    const spectrum = new Path2D();
    const corners = [point(-2 * d, 0), point(-2 * d - maxH, maxH), point(2 * d + maxH, maxH), point(2 * d, 0)];

    for (const [j, p] of corners.entries()) {
      if (j === 0) spectrum.moveTo(p.x, p.y);
      else spectrum.lineTo(p.x, p.y);
    }

    spectrum.closePath();
    pen.save();
    pen.beginPath();
    pen.rect(box.x - 1, box.y - 1, box.w + 2, box.h + 2);
    pen.clip();
    const claim2d = index === 0 && time >= 59500;
    const predict = time < 27000;
    const rise = smooth(time, 59500, 65000);

    if (predict || claim2d && rise === 1) {
      if (index === 0) hatch(spectrum, box, .35);
      else {
        pen.save();
        pen.clip(spectrum);
        const region = new Path2D();
        region.rect(box.x, box.y, box.w, box.h * .55);
        region.rect(box.x, box.y, box.w * .32, box.h);
        region.rect(box.x + box.w * .68, box.y, box.w * .32, box.h);
        hatch(region, box, .3);
        pen.restore();
      }
    } else if (panelZoom < .99) {
      pen.save();
      pen.clip(spectrum);
      const region = new Path2D();
      const topHeight = claim2d ? box.h * (.42 + .58 * rise) : box.h * .42;
      region.rect(box.x, box.y, box.w, topHeight);

      for (let band = 0; band < 32; band++) {
        const h0 = band / 32 * maxH;
        const h1 = (band + 1) / 32 * maxH;
        const left = point(-2 * d - h0, h1);
        const edgeWidth = Math.min(.9, h1 * .3);
        const right = point(2 * d + h0 - edgeWidth, h1);
        region.rect(left.x, left.y, box.w * edgeWidth / (energyMax - energyMin), box.h / 32 + 1);
        region.rect(right.x, right.y, box.w * edgeWidth / (energyMax - energyMin), box.h / 32 + 1);
      }

      hatch(region, box, .45);
      pen.restore();
    }

    const outline = [...corners, corners[0] ?? point(0, 0)];
    const count = Math.max(2, Math.ceil(outline.length * arrive));
    line(outline.slice(0, count), claim2d ? 'blue' : 'ink', claim2d ? 1.3 : .8, predict || claim2d);
    line([point(energyMin, 0), point(energyMax, 0)], 'ink', .8);
    line([point(energyMin, 0), point(energyMin, maxH)], 'muted', .7);

    if (index === 1 && time >= 66000) {
      const bandLeft = -5.96;
      const bandRight = -5.84;
      const bandH = .10;
      const interval = [point(bandLeft, 0), point(bandLeft, bandH), point(bandRight, bandH), point(bandRight, 0)];
      pen.fillStyle = colors.paper;
      pen.beginPath();

      for (const [j, p] of interval.entries()) {
        if (j === 0) pen.moveTo(p.x, p.y);
        else pen.lineTo(p.x, p.y);
      }

      pen.closePath();
      pen.fill();
      line([...interval, interval[0] ?? point(0, 0)], 'blue', 1.6, true);

      if (time >= 75500) {
        const j = new Path2D();
        const ps = [point(-6, 0), point(-6 - .15, .15), point(-6 - .15 + .025, .15), point(-6, 0)];

        for (const [i, p] of ps.entries()) {
          if (i === 0) j.moveTo(p.x, p.y);
          else j.lineTo(p.x, p.y);
        }

        j.closePath();
        hatch(j, box, .8);
      }
    }

    pen.restore();

    if (tall && box.x < 0) continue;

    if (panelZoom < .6) words(index === 0 ? '2D' : '3D AND UP', box.x + box.w / 2, box.y - (tall ? 9 : 20), box.w + 10);
    words(panelZoom > .5 ? '−6' : `−${2 * d}`, point(-2 * d, 0).x, box.y + box.h + 12, 35, 'muted');

    if (panelZoom < .5) words(String(2 * d), point(2 * d, 0).x, box.y + box.h + 12, 25, 'muted');

    words('ENERGY', box.x + box.w / 2, box.y + box.h + (tall ? 27 : gaugeScene && index === 1 ? 18 : 32), box.w, 'muted');
    words('h', box.x - 10, box.y - 3, 20, 'muted');

    if (panelZoom > .6) {
      label('interval', point(-5.90, .05).x, point(-5.90, .05).y);
      label('threshold', point(-5.90, .10).x, point(-5.90, .10).y - 16);
      words('EXISTS · NOT COMPUTED', box.x + box.w * .70, box.y - 20, box.w * .6, 'blue');

      if (time >= 75500) {
        words('J', point(-6.06, .08).x, point(-6.06, .08).y, 15);
        words('MOBILITY EDGE: OPEN ?', box.x + box.w / 2, box.y + box.h * .90, box.w * .9, 'blue');
      }
    } else if (time < 27000) words('PREDICTED', box.x + box.w / 2, box.y + box.h * .63, box.w, 'muted');
    else if (time < 35500) words('OPEN', box.x + box.w / 2, box.y + box.h * .73, box.w);
    else if (time < 44500) words(`SIMON’S PROBLEM ${index === 0 ? 2 : 1}\nCLAIMED · 2026`, box.x + box.w / 2, box.y + box.h * .7, box.w, 'blue');
    else if (time < 59500) words(index === 0 ? 'PURE POINT' : 'ABSOLUTELY\nCONTINUOUS', box.x + box.w / 2, box.y + box.h * .7, box.w, index === 0 ? 'ink' : 'blue');
    else if (index === 0 && time < 111000) words('ALL h > 0\nCLAIMED', box.x + box.w / 2, box.y + box.h * .67, box.w, 'blue');
    else if (time < 111000) words('OTHER ENERGIES:\nNOT ADDRESSED', box.x + box.w / 2, box.y + box.h * .6, box.w, 'muted');

    if (time >= 111000) {
      label(index === 0 ? 'status2d' : 'status3d', box.x + box.w / 2, box.y + box.h * .28);
      words(index === 0 ? 'NO EXPERT\nDISCUSSION FOUND' : 'JAKSIC–LAST\nLAST STEP READ', box.x + box.w / 2, box.y + box.h * .78, box.w, 'muted');
    }
  }

  if (!tall && time < 66000) label('spectrum', titleX, height * .105);

  if (time >= 27000 && time < 35500) words('KNOWN: STRONG DISORDER OR EXTREME ENERGY', titleX, height * (tall ? .585 : .475), width * (tall ? .92 : .43), 'muted');
  else if (time >= 59500 && time < 66000) words('2D CLAIM: NO TRAP SIZE GIVEN', titleX, height * (tall ? .58 : .475), width * (tall ? .92 : .43), 'blue');
  else if (!tall && time >= 75500 && time < 80500) words('TRAPPED J + SPREADING I₃ · ONE OPERATOR', titleX, height * (tall ? .585 : .475), width * (tall ? .94 : .43), 'blue');

  if (gauge > 0) {
    const box = tall ? { x: width * .09, y: height * .71, w: width * .36, h: height * .15 } : { x: width * .63, y: height * .88, w: width * .27, h: height * .075 };
    const point = (eta: number, value: number) => ({ x: box.x + eta * box.w, y: box.y + box.h * (1 - value) });
    const eta = 1 - smooth(time, 85000, 91500);
    const continuous: Point[] = [];
    const trapped: Point[] = [];

    for (let sample = 80; sample >= Math.floor(eta * 80); sample--) {
      const e = sample / 80;
      continuous.push(point(e, .35 + .55 * e));
      trapped.push(point(e, .8 * Math.sqrt(e)));
    }

    line([point(0, 1), point(0, 0), point(1, 0)], 'muted', .7);
    line(continuous, 'blue', 1.6);
    line(trapped, 'ink', .9, true);
    label('resolvent', box.x + box.w / 2, box.y - (tall ? 28 : 15));
    words('0 ← DAMPING η ← 1', box.x + box.w / 2, box.y + box.h + 15, box.w + 25);
    words(time >= 92500 ? 'CERTIFIED · SCHEMATIC' : 'IMAGINARY PART', box.x + box.w / 2, box.y - (tall ? 48 : 36), box.w + 25, 'blue');
    words('OFF EIGENVALUES', box.x + box.w / 2, box.y + box.h * .81, box.w + 5, 'muted');
  }
}

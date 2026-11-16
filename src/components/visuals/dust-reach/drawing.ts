export type Box = { x: number; y: number; w: number; h: number };

export type Colors = { ink: string; paper: string; muted: string; blue: string };

export function line(pen: CanvasRenderingContext2D, x1: number, y1: number, x2: number, y2: number): void {
  pen.beginPath();
  pen.moveTo(x1, y1);
  pen.lineTo(x2, y2);
  pen.stroke();
}

export function note(pen: CanvasRenderingContext2D, message: string, x: number, y: number, width: number, size: number, color: string, family = '"Special Elite"'): void {
  pen.font = `${size}px ${family}, serif`;
  pen.textAlign = 'center';
  pen.textBaseline = 'middle';
  pen.fillStyle = color;
  const rows: string[] = [];
  let row = '';

  for (const word of message.split(' ')) {
    const candidate = row ? row + ' ' + word : word;

    if (row && pen.measureText(candidate).width > width) {
      rows.push(row);
      row = word;
    } else row = candidate;
  }

  if (row) rows.push(row);

  for (const [index, content] of rows.entries()) {
    pen.fillText(content, x, y + (index - (rows.length - 1) / 2) * size * 1.4);
  }
}

export function hatch(pen: CanvasRenderingContext2D, box: Box, color: string, spacing: number): void {
  pen.save();
  pen.beginPath();
  pen.rect(box.x, box.y, box.w, box.h);
  pen.clip();
  pen.strokeStyle = color;
  pen.lineWidth = .65;
  pen.beginPath();

  for (let offset = -box.h; offset < box.w; offset += spacing) {
    pen.moveTo(box.x + offset, box.y + box.h);
    pen.lineTo(box.x + offset + box.h, box.y);
  }

  pen.stroke();
  pen.restore();
}

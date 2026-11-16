export type Box = { x: number; y: number; w: number; h: number };

export type Colors = { ink: string; muted: string; paper: string; blue: string };

export function rule(pen: CanvasRenderingContext2D, x1: number, y1: number, x2: number, y2: number): void {
  pen.beginPath();
  pen.moveTo(x1, y1);
  pen.lineTo(x2, y2);
  pen.stroke();
}

export function words(pen: CanvasRenderingContext2D, value: string, x: number, y: number, width: number, size: number, color: string, family = '"Special Elite"'): void {
  pen.font = `${size}px ${family}, serif`;
  pen.textAlign = 'center';
  pen.textBaseline = 'middle';
  pen.fillStyle = color;
  const rows: string[] = [];
  let row = '';

  for (const word of value.split(' ')) {
    const next = row ? row + ' ' + word : word;

    if (row && pen.measureText(next).width > width) {
      rows.push(row);
      row = word;
    } else row = next;
  }

  if (row) rows.push(row);

  for (const [index, content] of rows.entries()) pen.fillText(content, x, y + (index - (rows.length - 1) / 2) * size * 1.4);
}

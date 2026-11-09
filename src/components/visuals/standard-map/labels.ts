export function formatK(k: number): string {
  return String(Number(k.toFixed(2)));
}

export function describeK(k: number): string {
  return `k = ${formatK(k)}`;
}

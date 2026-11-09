// k as the readout prints it: 0.2, 0.15, 1.
export function formatK(k: number): string {
  return String(Number(k.toFixed(2)));
}

export function describeK(k: number): string {
  return `k = ${formatK(k)}`;
}

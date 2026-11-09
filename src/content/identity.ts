export interface ResultIdentity {
  id: string;
  data: { family: string };
}

export function validateResultIdentities(entries: readonly ResultIdentity[]): void {
  const families = new Map<string, string>();

  for (const { id, data } of entries) {
    if (!id.startsWith(`${data.family}-`)) {
      throw new Error(`${id}: filename must start with its family number ${data.family}.`);
    }

    const previous = families.get(data.family);

    if (previous) {
      throw new Error(`Family ${data.family} appears in both ${previous} and ${id}.`);
    }

    families.set(data.family, id);
  }
}

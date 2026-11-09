export const reviewStatuses = [
  { label: 'under review', kind: 'under-review', requiresLink: false },
  { label: 'unreviewed', kind: 'unreviewed', requiresLink: false },
  { label: 'approved', kind: 'approved', requiresLink: true },
  { label: 'disputed', kind: 'disputed', requiresLink: true },
] as const;

export type ReviewStatus = typeof reviewStatuses[number]['label'];
export type ReviewStatusKind = typeof reviewStatuses[number]['kind'];

export function statusKind(status: ReviewStatus): ReviewStatusKind {
  const definition = reviewStatuses.find(({ label }) => label === status);

  if (!definition) {
    throw new Error(`Unknown review status: ${status}`);
  }

  return definition.kind;
}

export function readStatusKind(kind: string): ReviewStatusKind | '' {
  return reviewStatuses.find((status) => status.kind === kind)?.kind ?? '';
}

export function statusLabel(kind: ReviewStatusKind | ''): ReviewStatus | '' {
  return reviewStatuses.find((status) => status.kind === kind)?.label ?? '';
}

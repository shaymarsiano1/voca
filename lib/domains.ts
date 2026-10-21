export const DOMAIN_IDS = [
  "Software Engineering",
  "Distributed Systems",
  "Cloud Architecture",
  "Logic",
  "API Design",
  "Security Engineering",
  "Data Engineering",
] as const;

export type DomainId = (typeof DOMAIN_IDS)[number];

export function isDomainId(value: string): value is DomainId {
  return (DOMAIN_IDS as readonly string[]).includes(value);
}

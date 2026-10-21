import type { DomainId } from "@/lib/domains";

export const DOMAIN_META: Record<DomainId, { description: string; dot: string; selected: string }> = {
  "Software Engineering": {
    description: "Structure, correctness, and change.",
    dot: "bg-[#2f6fed]",
    selected: "border-[#2f6fed] bg-[#2f6fed]/10 text-ink",
  },
  "Distributed Systems": {
    description: "Coordination, failure, and time.",
    dot: "bg-[#7c5cfc]",
    selected: "border-[#7c5cfc] bg-[#7c5cfc]/10 text-ink",
  },
  "Cloud Architecture": {
    description: "Planes, rollout, and blast radius.",
    dot: "bg-[#0ea5e9]",
    selected: "border-[#0ea5e9] bg-[#0ea5e9]/10 text-ink",
  },
  Logic: {
    description: "Claims, conditions, and proof.",
    dot: "bg-[#e8a317]",
    selected: "border-[#e8a317] bg-[#e8a317]/15 text-ink",
  },
  "API Design": {
    description: "Contracts, retries, and evolution.",
    dot: "bg-[#0f9f8f]",
    selected: "border-[#0f9f8f] bg-[#0f9f8f]/10 text-ink",
  },
  "Security Engineering": {
    description: "Authority, exposure, and failure.",
    dot: "bg-[#e11d48]",
    selected: "border-[#e11d48] bg-[#e11d48]/10 text-ink",
  },
  "Data Engineering": {
    description: "Time, keys, and volume.",
    dot: "bg-[#f97316]",
    selected: "border-[#f97316] bg-[#f97316]/10 text-ink",
  },
};

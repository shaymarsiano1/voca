import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/cn";

export function Logo({ href = "/", large = false }: { href?: string; large?: boolean }) {
  const size = large ? 44 : 32;

  return (
    <Link href={href} className="flex items-center gap-2.5 text-ink">
      <Image
        src="/logo.png"
        alt=""
        width={size}
        height={size}
        priority
        className={cn("rounded-[22%]", large ? "h-11 w-11" : "h-8 w-8")}
      />
      <span className={cn("font-medium tracking-tight", large ? "text-xl" : "text-sm")}>Voca</span>
    </Link>
  );
}

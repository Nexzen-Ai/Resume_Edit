import Image from "next/image";
import Link from "next/link";

/**
 * NexCV brand lockup — single source of truth for the logo + wordmark.
 * Swap the org logo by replacing /public/logo.svg; it updates every page.
 */
export default function Brand({
  size = 32,
  wordmark = true,
  href = "/",
  wordmarkClass = "text-base",
}: {
  size?: number;
  wordmark?: boolean;
  href?: string | null;
  wordmarkClass?: string;
}) {
  const content = (
    <span className="flex items-center gap-2.5">
      <span className="relative inline-flex shrink-0" style={{ width: size, height: size }}>
        <span
          className="absolute inset-0 rounded-[26%] blur-md opacity-40"
          style={{ background: "linear-gradient(135deg, #00c8ff, #0066ff)" }}
        />
        <Image src="/logo.svg" alt="NexCV" width={size} height={size} className="relative rounded-[26%]" priority />
      </span>
      {wordmark && (
        <span className={`font-bold tracking-tight ${wordmarkClass}`} style={{ color: "var(--foreground)" }}>
          Nex<span style={{ color: "var(--accent)" }}>CV</span>
        </span>
      )}
    </span>
  );

  if (href) {
    return (
      <Link href={href} className="inline-flex items-center">
        {content}
      </Link>
    );
  }
  return content;
}

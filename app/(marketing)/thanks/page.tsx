import Link from "next/link";

export default function ThanksPage() {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold text-foreground">
        Thanks for joining.
      </h1>
      <p className="text-foreground leading-relaxed">
        We&apos;ll share updates as Helm evolves.
      </p>
      <p>
        <Link
          href="/landing"
          className="text-sm font-medium text-foreground underline hover:no-underline"
        >
          Back to landing
        </Link>
      </p>
    </div>
  );
}

import { cn } from "@/lib/utils";

export function Chip({
  label,
  className,
}: {
  label: string;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex rounded-full bg-muted px-2.5 py-0.5 text-xs text-muted-foreground",
        className
      )}
    >
      {label}
    </span>
  );
}

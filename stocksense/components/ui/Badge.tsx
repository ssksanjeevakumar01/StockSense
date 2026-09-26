import { OperationStatus } from "@/types";
import { cn } from "@/lib/utils";

const statusStyles: Record<OperationStatus | "done" | "draft", string> = {
  draft: "bg-gray-100 text-gray-600",
  waiting: "bg-amber-100 text-amber-700",
  ready: "bg-blue-100 text-blue-700",
  done: "bg-green-100 text-green-700",
  canceled: "bg-red-100 text-red-600",
};

interface BadgeProps {
  status: OperationStatus;
  className?: string;
}

export function Badge({ status, className }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize",
        statusStyles[status],
        className
      )}
    >
      {status}
    </span>
  );
}

// Generic colored badge
export function ColorBadge({
  label,
  color = "gray",
}: {
  label: string;
  color?: "gray" | "blue" | "green" | "amber" | "red";
}) {
  const colors = {
    gray: "bg-gray-100 text-gray-600",
    blue: "bg-blue-100 text-blue-700",
    green: "bg-green-100 text-green-700",
    amber: "bg-amber-100 text-amber-700",
    red: "bg-red-100 text-red-600",
  };
  return (
    <span className={cn("inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium", colors[color])}>
      {label}
    </span>
  );
}

import { cn } from "@/lib/utils";
import { AlertTriangle, Info, CheckCircle, XCircle } from "lucide-react";
import { ReactNode } from "react";

type AlertType = "info" | "warning" | "success" | "error";

const alertStyles: Record<AlertType, { wrapper: string; icon: ReactNode }> = {
  info: { wrapper: "bg-blue-50 border-blue-200 text-blue-800", icon: <Info size={16} className="text-blue-500 shrink-0" /> },
  warning: { wrapper: "bg-amber-50 border-amber-200 text-amber-800", icon: <AlertTriangle size={16} className="text-amber-500 shrink-0" /> },
  success: { wrapper: "bg-green-50 border-green-200 text-green-800", icon: <CheckCircle size={16} className="text-green-500 shrink-0" /> },
  error: { wrapper: "bg-red-50 border-red-200 text-red-800", icon: <XCircle size={16} className="text-red-500 shrink-0" /> },
};

export function Alert({ type = "info", children, className }: { type?: AlertType; children: ReactNode; className?: string }) {
  const { wrapper, icon } = alertStyles[type];
  return (
    <div className={cn("flex items-start gap-2 px-4 py-3 rounded-lg border text-sm", wrapper, className)}>
      {icon}
      <div>{children}</div>
    </div>
  );
}

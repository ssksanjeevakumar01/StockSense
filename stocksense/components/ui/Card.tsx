import { cn } from "@/lib/utils";
import { ReactNode } from "react";

interface CardProps {
  className?: string;
  children: ReactNode;
}

export function Card({ className, children }: CardProps) {
  return (
    <div className={cn("bg-white rounded-lg shadow-sm border border-slate-200", className)}>
      {children}
    </div>
  );
}

export function CardHeader({ className, children }: CardProps) {
  return <div className={cn("px-6 py-4 border-b border-slate-100", className)}>{children}</div>;
}

export function CardBody({ className, children }: CardProps) {
  return <div className={cn("px-6 py-4", className)}>{children}</div>;
}

interface KpiCardProps {
  title: string;
  value: string | number;
  icon: ReactNode;
  color?: "blue" | "green" | "amber" | "red" | "slate";
  subtitle?: string;
}

const kpiColors = {
  blue: "text-blue-600 bg-blue-50",
  green: "text-green-600 bg-green-50",
  amber: "text-amber-600 bg-amber-50",
  red: "text-red-600 bg-red-50",
  slate: "text-slate-600 bg-slate-50",
};

export function KpiCard({ title, value, icon, color = "blue", subtitle }: KpiCardProps) {
  return (
    <Card>
      <CardBody className="flex items-center gap-4">
        <div className={cn("p-3 rounded-lg", kpiColors[color])}>{icon}</div>
        <div>
          <p className="text-sm text-slate-500">{title}</p>
          <p className="text-2xl font-bold text-slate-900">{value}</p>
          {subtitle && <p className="text-xs text-slate-400 mt-0.5">{subtitle}</p>}
        </div>
      </CardBody>
    </Card>
  );
}

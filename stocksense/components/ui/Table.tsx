import { cn } from "@/lib/utils";
import { ReactNode } from "react";

interface TableProps {
  headers: string[];
  children: ReactNode;
  className?: string;
}

export function Table({ headers, children, className }: TableProps) {
  return (
    <div className={cn("overflow-x-auto rounded-lg border border-slate-200", className)}>
      <table className="min-w-full divide-y divide-slate-200 text-sm">
        <thead className="bg-slate-50 sticky top-0">
          <tr>
            {headers.map((h) => (
              <th
                key={h}
                className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap"
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-slate-100">{children}</tbody>
      </table>
    </div>
  );
}

export function Tr({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <tr className={cn("hover:bg-slate-50 transition-colors", className)}>{children}</tr>
  );
}

export function Td({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <td className={cn("px-4 py-3 text-slate-700 whitespace-nowrap", className)}>{children}</td>
  );
}

// Empty state for tables
export function TableEmpty({ message, cta }: { message: string; cta?: ReactNode }) {
  return (
    <tr>
      <td colSpan={999} className="py-16 text-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center">
            <span className="text-slate-400 text-xl">📦</span>
          </div>
          <p className="text-slate-500 text-sm">{message}</p>
          {cta}
        </div>
      </td>
    </tr>
  );
}

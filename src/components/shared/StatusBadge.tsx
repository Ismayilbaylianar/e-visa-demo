"use client";

import { Badge } from "@/components/ui/badge";
import type { ApplicationStatus } from "@/types";

const statusConfig: Record<ApplicationStatus, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  draft: { label: "Qaralama", variant: "secondary" },
  unpaid: { label: "Ödənilməmiş", variant: "outline" },
  submitted: { label: "Göndərilmiş", variant: "default" },
  in_review: { label: "Baxılır", variant: "default" },
  need_docs: { label: "Sənəd Lazım", variant: "destructive" },
  approved: { label: "Təsdiqləndi", variant: "default" },
  rejected: { label: "Rədd Edildi", variant: "destructive" },
  ready_to_download: { label: "Hazır", variant: "default" },
};

interface StatusBadgeProps {
  status: ApplicationStatus;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const config = statusConfig[status] || { label: status, variant: "secondary" as const };
  
  return (
    <Badge variant={config.variant} className="capitalize">
      {config.label}
    </Badge>
  );
}

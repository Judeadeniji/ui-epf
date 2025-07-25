import { Badge } from "@/components/ui/badge";
import {
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  CircleDashed,
} from "lucide-react";

export function getStatusBadge(status: string) {
  switch (status) {
    case "pending":
      return (
        <Badge variant="outline">
          <Clock className="mr-1 h-3 w-3" />
          Pending
        </Badge>
      );
    case "pre-approved":
      return (
        <Badge variant="secondary">
          <CircleDashed className="mr-1 h-3 w-3" />
          Awaiting
        </Badge>
      );
    case "approved":
      return (
        <Badge variant="default">
          <CheckCircle2 className="mr-1 h-3 w-3" />
          Approved
        </Badge>
      );
    case "rejected":
      return (
        <Badge variant="destructive">
          <XCircle className="mr-1 h-3 w-3" />
          Rejected
        </Badge>
      );
    default:
      return (
        <Badge variant="outline">
          <AlertCircle className="mr-1 h-3 w-3" />
          Unknown
        </Badge>
      );
  }
}
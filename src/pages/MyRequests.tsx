import { useState, useEffect } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Clock, Calendar, AlertCircle, FileText } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { format } from "date-fns";
import { es } from "date-fns/locale";

type RequestType = "time_correction" | "absence" | "overtime" | "other";
type RequestStatus = "pending" | "approved" | "rejected";

interface ApprovalRequest {
  id: string;
  request_type: RequestType;
  description: string | null;
  status: RequestStatus;
  created_at: string;
  reviewed_at: string | null;
}

const requestTypeLabels: Record<RequestType, string> = {
  time_correction: "Corrección de fichaje",
  absence: "Ausencia",
  overtime: "Horas extra",
  other: "Otro",
};

const requestTypeIcons: Record<RequestType, typeof Clock> = {
  time_correction: Clock,
  absence: Calendar,
  overtime: AlertCircle,
  other: FileText,
};

const statusLabels: Record<RequestStatus, string> = {
  pending: "Pendiente",
  approved: "Aprobada",
  rejected: "Rechazada",
};

const statusVariants: Record<RequestStatus, "default" | "secondary" | "destructive" | "outline"> = {
  pending: "secondary",
  approved: "default",
  rejected: "destructive",
};

export default function MyRequests() {
  const { user, companyId } = useAuth();
  const [requests, setRequests] = useState<ApprovalRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Form state
  const [requestType, setRequestType] = useState<RequestType>("time_correction");
  const [description, setDescription] = useState("");

  useEffect(() => {
    if (user?.id) {
      fetchMyRequests();
    }
  }, [user?.id]);

  const fetchMyRequests = async () => {
    if (!user?.id) return;

    const { data, error } = await supabase
      .from("approval_requests")
      .select("id, request_type, description, status, created_at, reviewed_at")
      .eq("requester_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching requests:", error);
      toast.error("Error al cargar solicitudes");
    } else {
      setRequests((data || []) as ApprovalRequest[]);
    }
    setLoading(false);
  };

  const handleSubmit = async () => {
    if (!user?.id || !companyId) {
      toast.error("Error: usuario o empresa no identificados");
      return;
    }

    if (!description.trim()) {
      toast.error("Describe tu solicitud");
      return;
    }

    setSubmitting(true);

    const { error } = await supabase.from("approval_requests").insert({
      requester_id: user.id,
      company_id: companyId,
      request_type: requestType,
      description: description.trim(),
      status: "pending",
    });

    if (error) {
      console.error("Error creating request:", error);
      toast.error("Error al crear solicitud");
    } else {
      toast.success("Solicitud enviada");
      setDialogOpen(false);
      setDescription("");
      setRequestType("time_correction");
      fetchMyRequests();
    }

    setSubmitting(false);
  };

  return (
    <AppLayout>
      <div className="px-4 py-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-display font-bold">Mis Solicitudes</h1>
            <p className="text-muted-foreground text-sm">
              Gestiona tus peticiones de ausencia, corrección, etc.
            </p>
          </div>

          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="w-4 h-4 mr-1" />
                Nueva
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Nueva Solicitud</DialogTitle>
              </DialogHeader>

              <div className="space-y-4 pt-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Tipo de solicitud</label>
                  <Select
                    value={requestType}
                    onValueChange={(v) => setRequestType(v as RequestType)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="time_correction">Corrección de fichaje</SelectItem>
                      <SelectItem value="absence">Ausencia</SelectItem>
                      <SelectItem value="overtime">Horas extra</SelectItem>
                      <SelectItem value="other">Otro</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Descripción</label>
                  <Textarea
                    placeholder="Describe tu solicitud..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={4}
                  />
                </div>

                <Button
                  className="w-full"
                  onClick={handleSubmit}
                  disabled={submitting || !description.trim()}
                >
                  {submitting ? "Enviando..." : "Enviar Solicitud"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* List */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : requests.length === 0 ? (
          <Card className="p-8 text-center">
            <FileText className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
            <p className="text-muted-foreground">No tienes solicitudes</p>
            <p className="text-sm text-muted-foreground mt-1">
              Pulsa "Nueva" para crear una solicitud
            </p>
          </Card>
        ) : (
          <div className="space-y-3">
            {requests.map((req) => {
              const Icon = requestTypeIcons[req.request_type];
              return (
                <Card key={req.id} className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Icon className="w-5 h-5 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <p className="font-medium text-sm">
                          {requestTypeLabels[req.request_type]}
                        </p>
                        <Badge variant={statusVariants[req.status as RequestStatus]}>
                          {statusLabels[req.status as RequestStatus]}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                        {req.description || "Sin descripción"}
                      </p>
                      <p className="text-xs text-muted-foreground mt-2">
                        {format(new Date(req.created_at), "d MMM yyyy, HH:mm", { locale: es })}
                      </p>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </AppLayout>
  );
}

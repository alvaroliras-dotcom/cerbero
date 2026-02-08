import { useState, useEffect } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Check, X, Clock, Calendar, AlertCircle, FileText, User } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import type { Database } from "@/integrations/supabase/types";

type AppRole = Database["public"]["Enums"]["app_role"];
type RequestType = "time_correction" | "absence" | "overtime" | "other";
type RequestStatus = "pending" | "approved" | "rejected";

interface ApprovalRequestWithRequester {
  id: string;
  requester_id: string;
  request_type: RequestType;
  description: string | null;
  status: RequestStatus;
  created_at: string;
  reviewed_at: string | null;
  reviewed_by: string | null;
  requester_name: string | null;
  requester_role: AppRole | null;
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

export default function ApprovalQueue() {
  const { user, role, companyId } = useAuth();
  const [requests, setRequests] = useState<ApprovalRequestWithRequester[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"pending" | "resolved">("pending");

  useEffect(() => {
    if (companyId) {
      fetchRequests();
    }
  }, [companyId]);

  const fetchRequests = async () => {
    if (!companyId) return;

    // Obtener solicitudes de la empresa
    const { data: requestsData, error: requestsError } = await supabase
      .from("approval_requests")
      .select("*")
      .eq("company_id", companyId)
      .order("created_at", { ascending: false });

    if (requestsError) {
      console.error("Error fetching requests:", requestsError);
      toast.error("Error al cargar solicitudes");
      setLoading(false);
      return;
    }

    // Obtener perfiles para nombres
    const { data: profilesData } = await supabase
      .from("profiles")
      .select("id, full_name")
      .eq("company_id", companyId);

    // Obtener roles de company_user_roles
    const { data: rolesData } = await supabase
      .from("company_user_roles")
      .select("user_id, role")
      .eq("company_id", companyId);

    const profilesMap = new Map(profilesData?.map((p) => [p.id, p.full_name]) || []);
    const rolesMap = new Map(rolesData?.map((r) => [r.user_id, r.role as AppRole]) || []);

    const enriched: ApprovalRequestWithRequester[] = (requestsData || []).map((r) => ({
      ...r,
      request_type: r.request_type as RequestType,
      status: r.status as RequestStatus,
      requester_name: profilesMap.get(r.requester_id) || null,
      requester_role: rolesMap.get(r.requester_id) || null,
    }));

    setRequests(enriched);
    setLoading(false);
  };

  /**
   * Determina si el usuario actual puede aprobar/rechazar esta solicitud
   */
  const canApprove = (req: ApprovalRequestWithRequester): boolean => {
    // Nadie puede aprobar sus propias solicitudes
    if (req.requester_id === user?.id) return false;

    // Solo solicitudes pendientes
    if (req.status !== "pending") return false;

    // Owner puede aprobar cualquier solicitud (excepto la suya)
    if (role === "owner") return true;

    // HR solo puede aprobar solicitudes de workers
    if (role === "hr") {
      return req.requester_role === "worker";
    }

    return false;
  };

  const handleApprove = async (requestId: string) => {
    if (!user?.id) return;

    setProcessing(requestId);

    const { error } = await supabase
      .from("approval_requests")
      .update({
        status: "approved",
        reviewed_by: user.id,
        reviewed_at: new Date().toISOString(),
      })
      .eq("id", requestId);

    if (error) {
      console.error("Error approving:", error);
      toast.error("Error al aprobar");
    } else {
      toast.success("Solicitud aprobada");
      fetchRequests();
    }

    setProcessing(null);
  };

  const handleReject = async (requestId: string) => {
    if (!user?.id) return;

    setProcessing(requestId);

    const { error } = await supabase
      .from("approval_requests")
      .update({
        status: "rejected",
        reviewed_by: user.id,
        reviewed_at: new Date().toISOString(),
      })
      .eq("id", requestId);

    if (error) {
      console.error("Error rejecting:", error);
      toast.error("Error al rechazar");
    } else {
      toast.success("Solicitud rechazada");
      fetchRequests();
    }

    setProcessing(null);
  };

  const pendingRequests = requests.filter((r) => r.status === "pending");
  const resolvedRequests = requests.filter((r) => r.status !== "pending");

  const renderRequest = (req: ApprovalRequestWithRequester) => {
    const Icon = requestTypeIcons[req.request_type];
    const showActions = canApprove(req);
    const isOwn = req.requester_id === user?.id;

    return (
      <Card key={req.id} className="p-4">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
            <Icon className="w-5 h-5 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <div className="flex items-center gap-2">
                <p className="font-medium text-sm">
                  {requestTypeLabels[req.request_type]}
                </p>
                <Badge variant={statusVariants[req.status]}>
                  {statusLabels[req.status]}
                </Badge>
              </div>
            </div>

            <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
              <User className="w-3 h-3" />
              <span>
                {req.requester_name || "Usuario desconocido"}
                {isOwn && " (Tú)"}
              </span>
            </div>

            <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
              {req.description || "Sin descripción"}
            </p>

            <p className="text-xs text-muted-foreground mt-2">
              {format(new Date(req.created_at), "d MMM yyyy, HH:mm", { locale: es })}
            </p>

            {/* Acciones */}
            {showActions && (
              <div className="flex gap-2 mt-3">
                <Button
                  size="sm"
                  variant="default"
                  onClick={() => handleApprove(req.id)}
                  disabled={processing === req.id}
                >
                  <Check className="w-4 h-4 mr-1" />
                  Aprobar
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleReject(req.id)}
                  disabled={processing === req.id}
                >
                  <X className="w-4 h-4 mr-1" />
                  Rechazar
                </Button>
              </div>
            )}

            {/* Mensaje si es solicitud propia */}
            {isOwn && req.status === "pending" && (
              <p className="text-xs text-muted-foreground mt-2 italic">
                No puedes aprobar tu propia solicitud
              </p>
            )}

            {/* Si HR intenta aprobar a otro HR u owner */}
            {role === "hr" &&
              req.status === "pending" &&
              !isOwn &&
              req.requester_role !== "worker" && (
                <p className="text-xs text-muted-foreground mt-2 italic">
                  Solo puedes aprobar solicitudes de trabajadores
                </p>
              )}
          </div>
        </div>
      </Card>
    );
  };

  return (
    <AppLayout>
      <div className="px-4 py-6 space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-display font-bold">Cola de Aprobaciones</h1>
          <p className="text-muted-foreground text-sm">
            Gestiona las solicitudes de tu equipo
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "pending" | "resolved")}>
          <TabsList className="w-full">
            <TabsTrigger value="pending" className="flex-1">
              Pendientes ({pendingRequests.length})
            </TabsTrigger>
            <TabsTrigger value="resolved" className="flex-1">
              Resueltas ({resolvedRequests.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="pending" className="mt-4">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              </div>
            ) : pendingRequests.length === 0 ? (
              <Card className="p-8 text-center">
                <Check className="w-12 h-12 mx-auto text-success mb-3" />
                <p className="text-muted-foreground">No hay solicitudes pendientes</p>
              </Card>
            ) : (
              <div className="space-y-3">{pendingRequests.map(renderRequest)}</div>
            )}
          </TabsContent>

          <TabsContent value="resolved" className="mt-4">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              </div>
            ) : resolvedRequests.length === 0 ? (
              <Card className="p-8 text-center">
                <FileText className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
                <p className="text-muted-foreground">No hay solicitudes resueltas</p>
              </Card>
            ) : (
              <div className="space-y-3">{resolvedRequests.map(renderRequest)}</div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}

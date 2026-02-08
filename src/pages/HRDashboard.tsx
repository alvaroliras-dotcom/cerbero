import { AppLayout } from "@/components/layout/AppLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/status-badge";
import { HoursProgress } from "@/components/ui/hours-progress";
import {
  Users,
  AlertCircle,
  CheckCircle,
  Clock,
  TrendingUp,
  ChevronRight,
} from "lucide-react";

interface TeamMember {
  id: string;
  name: string;
  status: "working" | "break" | "offline";
  clockedInAt?: string;
  todayHours: number;
}

const teamMembers: TeamMember[] = [
  { id: "1", name: "Carlos García", status: "working", clockedInAt: "08:00", todayHours: 6.5 },
  { id: "2", name: "María López", status: "working", clockedInAt: "08:15", todayHours: 6.25 },
  { id: "3", name: "Pedro Martín", status: "break", clockedInAt: "08:30", todayHours: 5.0 },
  { id: "4", name: "Ana Fernández", status: "offline", todayHours: 0 },
  { id: "5", name: "Luis Sánchez", status: "working", clockedInAt: "07:45", todayHours: 6.75 },
];

const stats = {
  totalEmployees: 15,
  workingNow: 12,
  pendingIncidents: 3,
  validatedToday: 24,
};

export default function HRDashboard() {
  return (
    <AppLayout hasNotifications>
      <div className="px-4 py-6 space-y-6">
        {/* Header */}
        <div className="animate-fade-in">
          <h1 className="text-2xl font-display font-bold">Dashboard</h1>
          <p className="text-muted-foreground text-sm">
            Viernes, 24 de Enero 2025
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-3 animate-slide-up">
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-success/15 flex items-center justify-center">
                <Users className="w-5 h-5 text-success" />
              </div>
              <div>
                <p className="text-2xl font-display font-bold">{stats.workingNow}</p>
                <p className="text-xs text-muted-foreground">Trabajando</p>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-warning/15 flex items-center justify-center">
                <AlertCircle className="w-5 h-5 text-warning" />
              </div>
              <div>
                <p className="text-2xl font-display font-bold">{stats.pendingIncidents}</p>
                <p className="text-xs text-muted-foreground">Incidencias</p>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/15 flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-display font-bold">{stats.validatedToday}</p>
                <p className="text-xs text-muted-foreground">Validados hoy</p>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-muted-foreground" />
              </div>
              <div>
                <p className="text-2xl font-display font-bold">{stats.totalEmployees}</p>
                <p className="text-xs text-muted-foreground">Total equipo</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Team Week Progress */}
        <Card className="p-4 animate-slide-up">
          <h3 className="font-semibold mb-3">Progreso semanal del equipo</h3>
          <HoursProgress current={456} target={600} label="Horas totales" />
        </Card>

        {/* Team Status */}
        <div className="space-y-3 animate-slide-up">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold">Estado del equipo</h2>
            <Button variant="ghost" size="sm">
              Ver todos
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>

          <div className="space-y-2">
            {teamMembers.map((member) => (
              <Card key={member.id} className="p-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary/15 flex items-center justify-center">
                      <span className="text-sm font-medium text-primary">
                        {member.name.charAt(0)}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium text-sm">{member.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {member.clockedInAt ? `Entrada: ${member.clockedInAt}` : "Sin fichar"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <StatusBadge variant={member.status === "working" ? "working" : member.status === "break" ? "pending" : "inactive"}>
                      {member.status === "working" ? "Trabajando" : member.status === "break" ? "Descanso" : "Offline"}
                    </StatusBadge>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}

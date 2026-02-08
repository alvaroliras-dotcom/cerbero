import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { AppLayout } from "@/components/layout/AppLayout";
import { BrandFrame } from "@/components/layout/BrandFrame";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Download } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { toast } from "sonner";

interface LegalRow {
  company_id: string | null;
  user_id: string | null;
  worker_name: string | null;
  work_day: string | null;
  first_check_in: string | null;
  last_check_out: string | null;
  total_check_ins: number | null;
  total_check_outs: number | null;
}

export default function LegalReport() {
  const { companyId } = useAuth();
  const [rows, setRows] = useState<LegalRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (companyId) {
      fetchReport();
    }
  }, [companyId]);

  const fetchReport = async () => {
    if (!companyId) return;

    setLoading(true);
    const { data, error } = await supabase
      .from("legal_time_report")
      .select("*")
      .eq("company_id", companyId)
      .order("work_day", { ascending: false });

    if (error) {
      console.error(error);
      toast.error("Error cargando informe legal");
      setLoading(false);
      return;
    }

    setRows(data ?? []);
    setLoading(false);
  };

  const exportCSV = () => {
    if (!rows.length) return;

    const headers = [
      "Trabajador",
      "Fecha",
      "Primera entrada",
      "Última salida",
      "Entradas",
      "Salidas",
    ];

    const csv = [
      headers.join(";"),
      ...rows.map((r) =>
        [
          r.worker_name ?? "",
          r.work_day ? format(new Date(r.work_day), "dd/MM/yyyy") : "",
          r.first_check_in
            ? format(new Date(r.first_check_in), "HH:mm", { locale: es })
            : "",
          r.last_check_out
            ? format(new Date(r.last_check_out), "HH:mm", { locale: es })
            : "",
          r.total_check_ins ?? 0,
          r.total_check_outs ?? 0,
        ].join(";")
      ),
    ].join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = `registro_jornada_${format(new Date(), "yyyyMMdd")}.csv`;
    link.click();
    URL.revokeObjectURL(url);

    toast.success("CSV exportado correctamente");
  };

  const exportPDF = () => {
    if (!rows.length) return;

    const generatedDate = format(new Date(), "dd/MM/yyyy HH:mm", { locale: es });

    const tableRows = rows
      .map(
        (r) => `
        <tr>
          <td style="border: 1px solid #ddd; padding: 8px;">${r.worker_name ?? "-"}</td>
          <td style="border: 1px solid #ddd; padding: 8px;">${r.work_day ? format(new Date(r.work_day), "dd/MM/yyyy") : "-"}</td>
          <td style="border: 1px solid #ddd; padding: 8px;">${r.first_check_in ? format(new Date(r.first_check_in), "HH:mm") : "-"}</td>
          <td style="border: 1px solid #ddd; padding: 8px;">${r.last_check_out ? format(new Date(r.last_check_out), "HH:mm") : "-"}</td>
          <td style="border: 1px solid #ddd; padding: 8px; text-align: center;">${r.total_check_ins ?? 0}</td>
          <td style="border: 1px solid #ddd; padding: 8px; text-align: center;">${r.total_check_outs ?? 0}</td>
        </tr>`
      )
      .join("");

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Registro legal de jornada</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            h1 { font-size: 24px; margin-bottom: 8px; }
            .date { color: #666; margin-bottom: 20px; }
            table { border-collapse: collapse; width: 100%; }
            th { border: 1px solid #ddd; padding: 8px; background: #f5f5f5; text-align: left; }
            @media print {
              body { padding: 0; }
            }
          </style>
        </head>
        <body>
          <h1>Registro legal de jornada</h1>
          <p class="date">Generado el ${generatedDate}</p>
          <table>
            <thead>
              <tr>
                <th>Trabajador</th>
                <th>Fecha</th>
                <th>Primera entrada</th>
                <th>Última salida</th>
                <th style="text-align: center;">#IN</th>
                <th style="text-align: center;">#OUT</th>
              </tr>
            </thead>
            <tbody>
              ${tableRows}
            </tbody>
          </table>
        </body>
      </html>
    `;

    const printWindow = window.open("", "_blank");
    if (printWindow) {
      printWindow.document.write(html);
      printWindow.document.close();
      printWindow.focus();
      printWindow.print();
    }
  };

  return (
    <AppLayout>
      <BrandFrame>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
            <CardTitle className="text-lg font-semibold">
              Registro legal de jornada
            </CardTitle>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={exportPDF}
                disabled={rows.length === 0}
              >
                <Download className="mr-2 h-4 w-4" />
                Exportar PDF
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={exportCSV}
                disabled={rows.length === 0}
              >
                <Download className="mr-2 h-4 w-4" />
                Exportar CSV
              </Button>
            </div>
          </CardHeader>

          <CardContent>
            {loading ? (
              <p className="text-center text-muted-foreground py-8">
                Cargando…
              </p>
            ) : rows.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                No hay datos
              </p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Trabajador</TableHead>
                    <TableHead>Fecha</TableHead>
                    <TableHead>Entrada</TableHead>
                    <TableHead>Salida</TableHead>
                    <TableHead className="text-center">#IN</TableHead>
                    <TableHead className="text-center">#OUT</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rows.map((r, i) => (
                    <TableRow key={i}>
                      <TableCell className="font-medium">
                        {r.worker_name ?? "-"}
                      </TableCell>
                      <TableCell>
                        {r.work_day
                          ? format(new Date(r.work_day), "dd/MM/yyyy")
                          : "-"}
                      </TableCell>
                      <TableCell>
                        {r.first_check_in
                          ? format(new Date(r.first_check_in), "HH:mm")
                          : "-"}
                      </TableCell>
                      <TableCell>
                        {r.last_check_out
                          ? format(new Date(r.last_check_out), "HH:mm")
                          : "-"}
                      </TableCell>
                      <TableCell className="text-center">
                        {r.total_check_ins ?? 0}
                      </TableCell>
                      <TableCell className="text-center">
                        {r.total_check_outs ?? 0}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </BrandFrame>
    </AppLayout>
  );
}

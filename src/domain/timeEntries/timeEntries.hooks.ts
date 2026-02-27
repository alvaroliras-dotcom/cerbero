import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createCheckIn, createCheckOut, getOpenEntry } from "./timeEntries.api";

export function useOpenEntry(companyId: string | null, userId: string | null) {
  return useQuery({
    queryKey: ["time_entries", "open", companyId, userId],
    queryFn: () => getOpenEntry(companyId!, userId!),
    enabled: !!companyId && !!userId,
  });
}

export function useCheckIn(companyId: string | null, userId: string | null) {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      if (!companyId || !userId) {
        throw new Error("No se puede fichar: falta empresa o usuario");
      }
      return createCheckIn(companyId, userId);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["time_entries"] }),
  });
}

export function useCheckOut() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (entryId: string) => createCheckOut(entryId),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["time_entries"] }),
  });
}
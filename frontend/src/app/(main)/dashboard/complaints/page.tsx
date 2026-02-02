"use client";

import * as React from "react";
import { z } from "zod";
import { ChartAreaInteractive } from "./_components/chart-area-interactive";
import complaintDataRaw from "./_components/data.json";
import { DataTable } from "./_components/data-table";
import { complaintSchema } from "./_components/schema";
import { SectionCards } from "./_components/section-cards";

export default function Page() {
  const [complaintData, setComplaintData] = React.useState<z.infer<typeof complaintSchema>[]>([]);

  const parsedData = React.useMemo(() => {
    try {
      return complaintSchema.array().parse(complaintDataRaw);
    } catch (error) {
      console.error("Failed to parse complaint data:", error);
      return [];
    }
  }, []);

  React.useEffect(() => {
    setComplaintData(parsedData);
  }, [parsedData]);

  return (
    <div className="@container/main flex flex-col gap-4 md:gap-6">
      <SectionCards data={complaintData} />
      <ChartAreaInteractive data={complaintData} />
      {complaintData.length > 0 && <DataTable data={complaintData} />}
    </div>
  );
}

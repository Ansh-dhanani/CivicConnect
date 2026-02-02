"use client";

import * as React from "react";
import { z } from "zod";
import { ChartAreaInteractive } from "./_components/chart-area-interactive";
import potholeDataRaw from "./_components/data.json";
import { DataTable } from "./_components/data-table";
import { potholeSchema } from "./_components/schema";
import { SectionCards } from "./_components/section-cards";

export default function Page() {
  const [potholeData, setPotholeData] = React.useState<z.infer<typeof potholeSchema>[]>([]);

  const parsedData = React.useMemo(() => {
    try {
      return potholeSchema.array().parse(potholeDataRaw);
    } catch (error) {
      console.error("Failed to parse pothole data:", error);
      return [];
    }
  }, []);

  React.useEffect(() => {
    setPotholeData(parsedData);
  }, [parsedData]);

  const handleDuplicateMark = React.useCallback((potholeId: number, originalId: number) => {
    setPotholeData(prevData => 
      prevData.map(pothole => 
        pothole.id === potholeId 
          ? { ...pothole, isDuplicate: true, originalId }
          : pothole
      )
    );
  }, []);

  return (
    <div className="@container/main flex flex-col gap-4 md:gap-6">
      <SectionCards />
      <ChartAreaInteractive />
      {potholeData.length > 0 && <DataTable data={potholeData} />}
    </div>
  );
}

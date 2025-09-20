"use client";

import { FileText, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SummaryPanel } from "./panels/summary-panel";
import { RisksPanel } from "./panels/risks-panel";
import { ObligationsPanel } from "./panels/obligations-panel";
import { QAPanel } from "./panels/qa-panel";

type AnalysisDashboardProps = {
  documentText: string;
  fileName: string;
  onReset: () => void;
};

export function AnalysisDashboard({
  documentText,
  fileName,
  onReset,
}: AnalysisDashboardProps) {
  return (
    <div className="space-y-6">
      <div className="bg-card p-4 rounded-lg shadow-sm border flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-center gap-3">
          <FileText className="w-6 h-6 text-primary" />
          <div>
            <h2 className="font-bold text-lg font-headline">
              Analysis Ready
            </h2>
            <p className="text-sm text-muted-foreground">{fileName}</p>
          </div>
        </div>
        <Button variant="outline" onClick={onReset}>
          <RotateCcw className="mr-2 h-4 w-4" />
          Start Over
        </Button>
      </div>

      <Tabs defaultValue="summary" className="w-full">
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 h-auto">
          <TabsTrigger value="summary" className="py-2">Summary</TabsTrigger>
          <TabsTrigger value="risks" className="py-2">Potential Risks</TabsTrigger>
          <TabsTrigger value="obligations" className="py-2">Obligations</TabsTrigger>
          <TabsTrigger value="qa" className="py-2">Q&A</TabsTrigger>
        </TabsList>
        <TabsContent value="summary" className="mt-4">
          <SummaryPanel documentText={documentText} />
        </TabsContent>
        <TabsContent value="risks" className="mt-4">
          <RisksPanel documentText={documentText} />
        </TabsContent>
        <TabsContent value="obligations" className="mt-4">
          <ObligationsPanel documentText={documentText} />
        </TabsContent>
        <TabsContent value="qa" className="mt-4">
          <QAPanel documentText={documentText} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

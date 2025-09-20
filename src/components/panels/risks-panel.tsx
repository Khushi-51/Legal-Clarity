"use client";

import { useEffect, useState, useTransition } from "react";
import { AlertTriangle, Lightbulb, LoaderCircle } from "lucide-react";
import { runDetectRisks, runSuggestNegotiationPoints } from "@/app/actions";
import type { DetectPotentialRisksOutput } from "@/ai/flows/detect-potential-risks";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { PanelLoading } from "./panel-loading";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { cn } from "@/lib/utils";
import { Button } from "../ui/button";

type Risk = DetectPotentialRisksOutput['risks'][0];

type RiskWithSuggestion = Risk & {
  suggestion?: string;
  isSuggestionLoading?: boolean;
};


const severityMap: Record<Risk['severity'], { icon: string; color: string }> = {
  High: { icon: '🔴', color: 'text-red-600' },
  Medium: { icon: '🟡', color: 'text-yellow-600' },
  Low: { icon: '🟢', color: 'text-green-600' },
};


export function RisksPanel({ documentText }: { documentText: string }) {
  const [risks, setRisks] = useState<RiskWithSuggestion[]>([]);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    startTransition(async () => {
      const result = await runDetectRisks({
        documentText: documentText,
      });
      setRisks(result.risks);
    });
  }, [documentText]);

  const handleGetSuggestion = (index: number) => {
    const risk = risks[index];
    if (!risk || risk.suggestion) return;
    
    setRisks(prev => prev.map((r, i) => i === index ? { ...r, isSuggestionLoading: true } : r));

    startTransition(async () => {
        const result = await runSuggestNegotiationPoints({ risk: risk.risk });
        setRisks(prev => prev.map((r, i) => i === index ? { ...r, suggestion: result.suggestion, isSuggestionLoading: false } : r));
    });
  };


  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="font-headline text-2xl">
          Potential Risks & Negotiation Tips
        </CardTitle>
        <CardDescription>
          These are potential issues or clauses you should pay close attention
          to. Get AI-powered tips to help you negotiate.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isPending && !risks.length ? (
          <PanelLoading />
        ) : (
          <div className="space-y-4">
            {risks.length > 0 ? (
              risks.map((riskItem, index) => (
                <div key={index} className="flex items-start gap-4 border-b pb-4 last:border-b-0 last:pb-0">
                  <span className={cn("text-lg pt-1", severityMap[riskItem.severity].color)}>
                    {severityMap[riskItem.severity].icon}
                  </span>
                  <div className="flex-1 space-y-2">
                    <p className="font-semibold">{riskItem.severity} Risk</p>
                    <p className="text-foreground">{riskItem.risk}</p>
                    
                    {!riskItem.suggestion && (
                       <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleGetSuggestion(index)}
                        disabled={riskItem.isSuggestionLoading}
                      >
                        {riskItem.isSuggestionLoading ? (
                           <LoaderCircle className="animate-spin mr-2" />
                        ) : (
                           <Lightbulb className="mr-2" />
                        )}
                        Get Negotiation Tip
                      </Button>
                    )}
                   
                    {riskItem.suggestion && (
                        <Alert className="bg-accent/20 border-accent/50">
                            <Lightbulb className="h-4 w-4 text-accent-foreground" />
                            <AlertTitle className="text-accent-foreground font-bold">Negotiation Tip</AlertTitle>
                            <AlertDescription className="text-accent-foreground/90">
                                {riskItem.suggestion}
                            </AlertDescription>
                        </Alert>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>No Major Risks Detected</AlertTitle>
                <AlertDescription>
                  Our analysis did not find any common major risks. Always
                  consider consulting a legal professional.
                </AlertDescription>
              </Alert>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

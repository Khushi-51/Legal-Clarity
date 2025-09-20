"use client";

import { useState, useTransition } from "react";
import { Gavel, LoaderCircle, User, Users } from "lucide-react";
import { runExtractObligations } from "@/app/actions";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { PanelLoading } from "./panel-loading";
import type { ExtractObligationsOutput } from "@/ai/flows/extract-obligations";

export function ObligationsPanel({ documentText }: { documentText: string }) {
  const [obligations, setObligations] =
    useState<ExtractObligationsOutput | null>(null);
  const [userParty, setUserParty] = useState("TENANT");
  const [otherParty, setOtherParty] = useState("LANDLORD");
  const [isPending, startTransition] = useTransition();

  const handleExtract = () => {
    startTransition(async () => {
      const result = await runExtractObligations({
        documentText,
        userParty,
        otherParty,
      });
      setObligations(result);
    });
  };

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="font-headline text-2xl">
          Party Obligations
        </CardTitle>
        <CardDescription>
          Define the parties to see a breakdown of responsibilities.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end p-4 bg-muted/50 rounded-lg border">
          <div className="space-y-2">
            <label className="text-sm font-medium flex items-center gap-2">
              <User className="h-4 w-4" />
              Your Role (e.g., Tenant, Buyer)
            </label>
            <Input
              value={userParty}
              onChange={(e) => setUserParty(e.target.value)}
              placeholder="e.g., Tenant"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium flex items-center gap-2">
              <Users className="h-4 w-4" />
              Other Party's Role
            </label>
            <Input
              value={otherParty}
              onChange={(e) => setOtherParty(e.target.value)}
              placeholder="e.g., Landlord"
            />
          </div>
          <Button
            onClick={handleExtract}
            disabled={isPending || !userParty || !otherParty}
            className="w-full md:col-span-2 bg-accent hover:bg-accent/90 text-accent-foreground"
          >
            {isPending ? (
              <LoaderCircle className="animate-spin" />
            ) : (
              <Gavel className="mr-2 h-4 w-4" />
            )}
            Extract Obligations
          </Button>
        </div>

        {isPending && <PanelLoading />}

        {obligations && !isPending && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-primary font-headline">
                  <User /> What YOU Must Do
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="list-disc pl-5 space-y-2">
                  {obligations.userObligations.map((item, i) => (
                    <li key={i}>{item}</li>
                  ))}
                </ul>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-primary font-headline">
                  <Users /> What THEY Must Do
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="list-disc pl-5 space-y-2">
                  {obligations.otherPartyObligations.map((item, i) => (
                    <li key={i}>{item}</li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

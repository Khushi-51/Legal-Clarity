"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { LoaderCircle, FilePlus2 } from "lucide-react";
import type { DraftContractInput } from "@/ai/flows/draft-contract";

const formSchema = z.object({
  clientName: z.string().min(2, {
    message: "Client name must be at least 2 characters.",
  }),
  freelancerName: z.string().min(2, {
    message: "Freelancer name must be at least 2 characters.",
  }),
  projectScope: z.string().min(10, {
    message: "Project scope must be at least 10 characters.",
  }),
  paymentAmount: z.coerce.number().positive({
      message: "Payment amount must be a positive number."
  }),
  paymentTerms: z.string().min(5, {
    message: "Payment terms must be at least 5 characters.",
  }),
  deadline: z.string().min(1, { message: "Deadline is required."}),
});

type ContractDrafterProps = {
    onDraft: (data: DraftContractInput) => void;
    isLoading: boolean;
}

export function ContractDrafter({ onDraft, isLoading }: ContractDrafterProps) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      clientName: "",
      freelancerName: "",
      projectScope: "",
      paymentAmount: 10000,
      paymentTerms: "100% upon project completion",
      deadline: "",
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    onDraft(values);
  }

  return (
    <Card className="w-full max-w-2xl mx-auto shadow-lg">
      <CardHeader>
        <CardTitle className="text-3xl font-headline">Contract Drafting Assistant</CardTitle>
        <CardDescription>
          Generate a fair and balanced freelancer agreement by filling out the details below.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                control={form.control}
                name="clientName"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Client Name</FormLabel>
                    <FormControl>
                        <Input placeholder="e.g., Acme Corp" {...field} />
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
                />
                <FormField
                control={form.control}
                name="freelancerName"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Freelancer Name</FormLabel>
                    <FormControl>
                        <Input placeholder="e.g., John Doe" {...field} />
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
                />
            </div>
            <FormField
              control={form.control}
              name="projectScope"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Project Scope & Deliverables</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Describe the work to be done, including key deliverables..."
                      className="resize-y min-h-[100px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                control={form.control}
                name="paymentAmount"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Payment Amount (INR)</FormLabel>
                    <FormControl>
                        <Input type="number" placeholder="e.g., 50000" {...field} />
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
                />
                <FormField
                control={form.control}
                name="deadline"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Project Deadline</FormLabel>
                    <FormControl>
                        <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
                />
            </div>
             <FormField
              control={form.control}
              name="paymentTerms"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Payment Terms</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., 50% upfront, 50% on completion" {...field} />
                  </FormControl>
                  <FormDescription>
                    Specify when and how payments will be made.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full" disabled={isLoading} size="lg">
              {isLoading ? (
                <LoaderCircle className="animate-spin" />
              ) : (
                <>
                  <FilePlus2 className="mr-2" />
                  Generate Contract
                </>
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}

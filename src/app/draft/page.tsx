"use client";
import { useState, useTransition, useRef } from "react";
import { Header } from "@/components/layout/header";
import { useToast } from "@/hooks/use-toast";
import { ContractDrafter } from "@/components/contract-drafter";
import { runDraftContract } from "@/app/actions";
import type { DraftContractInput } from "@/ai/flows/draft-contract";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Copy, Download, File, LoaderCircle } from "lucide-react";
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';


export default function DraftPage() {
    const [generatedContract, setGeneratedContract] = useState<string | null>(null);
    const [isPending, startTransition] = useTransition();
    const [isDownloading, setIsDownloading] = useState(false);
    const { toast } = useToast();
    const contractRef = useRef<HTMLDivElement>(null);


    const handleDraftContract = (input: DraftContractInput) => {
        startTransition(async () => {
            try {
                const result = await runDraftContract(input);
                setGeneratedContract(result.contractText);
            } catch (error) {
                toast({
                    variant: 'destructive',
                    title: 'Drafting Error',
                    description: 'Could not generate the contract. Please try again.',
                });
            }
        });
    }

    const handleCopyToClipboard = () => {
        if (!generatedContract) return;
        navigator.clipboard.writeText(generatedContract);
        toast({
            title: 'Copied!',
            description: 'Contract text copied to clipboard.',
        });
    }

    const handleDownload = async () => {
        if (!contractRef.current) return;
        setIsDownloading(true);

        try {
            const canvas = await html2canvas(contractRef.current, { scale: 2 });
            const imgData = canvas.toDataURL('image/png');
            
            const pdf = new jsPDF({
                orientation: 'portrait',
                unit: 'px',
                format: [canvas.width, canvas.height]
            });

            pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
            pdf.save('freelancer-agreement.pdf');
        } catch (error) {
             toast({
                variant: 'destructive',
                title: 'Download Error',
                description: 'Could not generate the PDF. Please try again.',
            });
            console.error(error);
        } finally {
            setIsDownloading(false);
        }
    }

    const handleReset = () => {
        setGeneratedContract(null);
    }

    return (
        <div className="flex flex-col min-h-screen bg-background/80">
            <Header />
            <main className="flex-grow container mx-auto p-4 md:p-8">
                {!generatedContract ? (
                    <ContractDrafter onDraft={handleDraftContract} isLoading={isPending} />
                ) : (
                    <Card className="shadow-lg max-w-4xl mx-auto">
                        <CardHeader>
                            <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4">
                                <div>
                                    <CardTitle className="font-headline text-2xl">Generated Freelancer Agreement</CardTitle>
                                    <CardDescription>Review the generated contract below. You can copy or download it.</CardDescription>
                                </div>
                                <div className="flex gap-2">
                                    <Button variant="outline" onClick={handleCopyToClipboard}><Copy className="mr-2" /> Copy</Button>
                                    <Button onClick={handleDownload} disabled={isDownloading}>
                                        {isDownloading ? <LoaderCircle className="animate-spin mr-2"/> : <Download className="mr-2" />}
                                         Download PDF
                                    </Button>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div 
                                id="contract-content"
                                ref={contractRef}
                                className="prose prose-sm max-w-none text-foreground whitespace-pre-wrap p-8 bg-white rounded-lg border h-[70vh] overflow-y-auto font-serif"
                            >
                                {generatedContract}
                            </div>
                            <div className="mt-4 flex justify-end">
                                <Button variant="link" onClick={handleReset}>
                                    <File className="mr-2"/>
                                    Draft a new contract
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                )}
            </main>
             <footer className="text-center p-4 text-sm text-muted-foreground">
                Legal Clarity India - Understand your legal documents with ease.
            </footer>
        </div>
    );
}
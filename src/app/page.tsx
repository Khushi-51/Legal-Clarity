"use client";
import { useState } from "react";
import { Header } from "@/components/layout/header";
import { DocumentUpload } from "@/components/document-upload";
import { AnalysisDashboard } from "@/components/analysis-dashboard";
import { sampleDocument } from "@/lib/sample-doc";
import { useToast } from "@/hooks/use-toast";

export default function Home() {
  const [documentText, setDocumentText] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [fileName, setFileName] = useState("");
  const { toast } = useToast();

  const handleSampleDocumentLoad = () => {
    setIsLoading(true);
    // Simulate a file load delay
    setTimeout(() => {
      setDocumentText(sampleDocument);
      setFileName("sample-rental-agreement.txt");
      setIsLoading(false);
    }, 1000);
  };

  const handleDocumentUpload = (content: string, name: string) => {
    if (content) {
      setDocumentText(content);
      setFileName(name);
    } else {
      toast({
        variant: 'destructive',
        title: 'File Read Error',
        description: 'Could not read the content of the uploaded file.',
      });
    }
  };


  const handleReset = () => {
    setDocumentText(null);
    setFileName("");
  };

  return (
    <div className="flex flex-col min-h-screen bg-background/80">
      <Header />
      <main className="flex-grow container mx-auto p-4 md:p-8">
        {!documentText ? (
          <DocumentUpload
            onUpload={handleDocumentUpload}
            onSampleLoad={handleSampleDocumentLoad}
            isLoading={isLoading}
          />
        ) : (
          <AnalysisDashboard
            documentText={documentText}
            fileName={fileName}
            onReset={handleReset}
          />
        )}
      </main>
      <footer className="text-center p-4 text-sm text-muted-foreground">
        Legal Clarity India - Understand your legal documents with ease.
      </footer>
    </div>
  );
}

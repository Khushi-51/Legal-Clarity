import { UploadCloud, LoaderCircle, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import React, { useEffect } from 'react';

type DocumentUploadProps = {
  onUpload: (content: string, name: string) => void;
  onSampleLoad: () => void;
  isLoading: boolean;
};

export function DocumentUpload({
  onUpload,
  onSampleLoad,
  isLoading,
}: DocumentUploadProps) {
  const { toast } = useToast();
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Dynamically import pdfjs-dist and set workerSrc only on the client-side
    import('pdfjs-dist/build/pdf.mjs').then(pdfjsLib => {
      pdfjsLib.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;
    });
  }, []);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.type === 'text/plain') {
        const reader = new FileReader();
        reader.onload = e => {
          const content = e.target?.result as string;
          onUpload(content, file.name);
        };
        reader.onerror = () => {
          toast({
            variant: 'destructive',
            title: 'File Read Error',
            description: 'There was an error reading the file.',
          });
        };
        reader.readAsText(file);
      } else if (file.type === 'application/pdf') {
        const pdfjsLib = await import('pdfjs-dist/build/pdf.mjs');
        // Ensure worker is configured before using getDocument
        pdfjsLib.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;

        const reader = new FileReader();
        reader.onload = async (e) => {
          try {
            const typedarray = new Uint8Array(e.target?.result as ArrayBuffer);
            const pdf = await pdfjsLib.getDocument(typedarray).promise;
            let fullText = '';
            for (let i = 1; i <= pdf.numPages; i++) {
              const page = await pdf.getPage(i);
              const textContent = await page.getTextContent();
              const pageText = textContent.items.map((item: any) => item.str).join(' ');
              fullText += pageText + '\n\n';
            }
            onUpload(fullText, file.name);
          } catch (error) {
            console.error('Error parsing PDF:', error);
            toast({
              variant: 'destructive',
              title: 'PDF Parse Error',
              description: 'Could not extract text from the PDF file.',
            });
          }
        };
        reader.onerror = () => {
          toast({
            variant: 'destructive',
            title: 'File Read Error',
            description: 'There was an error reading the PDF file.',
          });
        };
        reader.readAsArrayBuffer(file);
      } else {
        toast({
          variant: 'destructive',
          title: 'Invalid File Type',
          description: 'Please upload a .txt or .pdf file.',
        });
      }
    }
  };


  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="flex items-center justify-center h-full py-10">
      <Card className="w-full max-w-lg text-center shadow-lg">
        <CardHeader>
          <CardTitle className="text-3xl font-headline">
            Unlock Legal Clarity
          </CardTitle>
          <CardDescription>
            Upload your legal document to get started. We'll help you
            understand it in simple terms.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="border-2 border-dashed border-border rounded-lg p-12 flex flex-col items-center justify-center gap-4">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              className="hidden"
              accept=".txt,.pdf"
            />
            <button
              onClick={handleUploadClick}
              className="flex flex-col items-center justify-center gap-4 cursor-pointer"
              disabled={isLoading}
            >
              <div className="bg-primary/10 p-4 rounded-full">
                <UploadCloud className="w-10 h-10 text-primary" />
              </div>
              <p className="text-muted-foreground font-semibold">
                Click to upload a .txt or .pdf file
              </p>
            </button>
            <div className="relative w-full flex items-center justify-center my-2">
              <div className="flex-grow border-t border-gray-300"></div>
              <span className="flex-shrink mx-4 text-muted-foreground text-sm">
                OR
              </span>
              <div className="flex-grow border-t border-gray-300"></div>
            </div>
            <Button
              onClick={onSampleLoad}
              disabled={isLoading}
              size="lg"
              variant="outline"
              className="w-full"
            >
              {isLoading ? (
                <LoaderCircle className="animate-spin" />
              ) : (
                <>
                  <FileText className="mr-2" />
                  Analyze Sample Document
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}


"use client";

import { useEffect, useState, useTransition, useRef } from "react";
import { runGenerateSummary, runTextToSpeech, runTranslateText } from "@/app/actions";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { PanelLoading } from "./panel-loading";
import { Button } from "../ui/button";
import { Volume2, LoaderCircle, Languages, StopCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { TranslateTextInput } from "@/ai/flows/translate-text";

type TargetLanguage = TranslateTextInput['targetLanguage'];

export function SummaryPanel({ documentText }: { documentText: string }) {
  const [summary, setSummary] = useState<string>("");
  const [originalSummary, setOriginalSummary] = useState("");
  const [audioCache, setAudioCache] = useState<Record<string, string>>({});
  const [currentLanguage, setCurrentLanguage] = useState<string>("en");
  
  const [isPending, startTransition] = useTransition();
  const [isAudioLoading, setIsAudioLoading] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isTranslating, startTranslationTransition] = useTransition();

  const activeAudioRef = useRef<HTMLAudioElement | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    startTransition(async () => {
      const result = await runGenerateSummary({
        legalDocumentText: documentText,
      });
      setSummary(result.plainLanguageSummary);
      setOriginalSummary(result.plainLanguageSummary);
      setAudioCache({}); // Reset audio cache when summary changes
      setCurrentLanguage("en");
    });
    // Cleanup audio on document change
    return () => {
       stopAudio();
    }
  }, [documentText]);

  // Cleanup audio on component unmount
  useEffect(() => {
    return () => {
      stopAudio();
    };
  }, []);
  
  const stopAudio = () => {
    if (activeAudioRef.current) {
      activeAudioRef.current.pause();
      activeAudioRef.current.currentTime = 0;
      activeAudioRef.current = null;
      setIsPlaying(false);
    }
  };

  const playAudioFromUri = (uri: string) => {
    stopAudio();
    const newAudio = new Audio(uri);
    activeAudioRef.current = newAudio;
    
    newAudio.onended = () => {
      stopAudio();
    };
    
    newAudio.onerror = () => {
      toast({
        variant: 'destructive',
        title: 'Audio Error',
        description: 'Failed to play audio.',
      });
      stopAudio();
    };

    newAudio.play();
    setIsPlaying(true);
  };


  const handlePlayAudio = async () => {
    if (isPlaying) {
      stopAudio();
      return;
    }

    if (audioCache[currentLanguage]) {
      playAudioFromUri(audioCache[currentLanguage]);
      return;
    }

    setIsAudioLoading(true);

    try {
      const result = await runTextToSpeech({ text: summary });
      setAudioCache(prev => ({...prev, [currentLanguage]: result.audioDataUri}));
      playAudioFromUri(result.audioDataUri);

    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Audio Error',
        description: 'Failed to generate audio.',
      });
      console.error("TTS Error:", error);
    } finally {
      setIsAudioLoading(false);
    }
  };

  const handleLanguageChange = (value: string) => {
    stopAudio();
    setCurrentLanguage(value);

    if (value === "en") {
      setSummary(originalSummary);
      return;
    }
    
    startTranslationTransition(async () => {
      try {
        const result = await runTranslateText({
          text: originalSummary,
          targetLanguage: value as TargetLanguage,
        });
        setSummary(result.translatedText);
      } catch (error) {
         toast({
          variant: 'destructive',
          title: 'Translation Error',
          description: 'Failed to translate the summary.',
        });
        console.error("Translation Error:", error);
      }
    });
  };


  return (
    <Card className="shadow-lg">
      <CardHeader>
        <div className="flex justify-between items-start gap-4">
            <div>
              <CardTitle className="font-headline text-2xl">
                Plain Language Summary
              </CardTitle>
              <CardDescription>
                Here's a simplified overview of your document.
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Select onValueChange={handleLanguageChange} value={currentLanguage} disabled={isPending || !summary}>
                <SelectTrigger className="w-[140px]" aria-label="Select language">
                  <Languages className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Language" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="en">English</SelectItem>
                  <SelectItem value="Hindi">Hindi</SelectItem>
                  <SelectItem value="Tamil">Tamil</SelectItem>
                  <SelectItem value="Telugu">Telugu</SelectItem>
                  <SelectItem value="Kannada">Kannada</SelectItem>
                  <SelectItem value="Bengali">Bengali</SelectItem>
                  <SelectItem value="Marathi">Marathi</SelectItem>
                </SelectContent>
              </Select>
              <Button 
                variant="outline" 
                size="icon"
                onClick={handlePlayAudio}
                disabled={isPending || isAudioLoading || !summary || isTranslating}
                aria-label={isPlaying ? "Stop audio" : "Read summary aloud"}
              >
                {isAudioLoading ? (
                  <LoaderCircle className="animate-spin" />
                ) : isPlaying ? (
                  <StopCircle />
                ) : (
                  <Volume2 />
                )}
              </Button>
            </div>
        </div>
      </CardHeader>
      <CardContent>
        {isPending || isTranslating ? (
          <PanelLoading />
        ) : (
          <div className="prose prose-sm max-w-none text-foreground whitespace-pre-wrap">
            {summary}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

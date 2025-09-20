
"use client";

import { useState, useTransition, useRef, useEffect } from "react";
import { Bot, LoaderCircle, Send, User, Volume2, StopCircle } from "lucide-react";
import { runAnswerQuestion, runTextToSpeech } from "@/app/actions";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

type Message = {
  role: "user" | "ai";
  content: string;
  audioDataUri?: string;
};

export function QAPanel({ documentText }: { documentText: string }) {
  const [conversation, setConversation] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isPending, startTransition] = useTransition();
  const activeAudioRef = useRef<HTMLAudioElement | null>(null);
  const [loadingAudioIndex, setLoadingAudioIndex] = useState<number | null>(null);
  const [playingAudioIndex, setPlayingAudioIndex] = useState<number | null>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTo({
        top: scrollAreaRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [conversation]);
  
  // Cleanup audio on component unmount
  useEffect(() => {
    return () => {
      if (activeAudioRef.current) {
        activeAudioRef.current.pause();
        activeAudioRef.current = null;
      }
    };
  }, []);

  const stopAudio = () => {
    if (activeAudioRef.current) {
      activeAudioRef.current.pause();
      activeAudioRef.current.currentTime = 0;
      activeAudioRef.current = null;
      setPlayingAudioIndex(null);
    }
  };

  const playAudioFromUri = (uri: string, index: number) => {
    stopAudio(); // Ensure any other audio is stopped first
    const newAudio = new Audio(uri);
    activeAudioRef.current = newAudio;
    setPlayingAudioIndex(index);
    newAudio.play();
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
    }
  };


  const handlePlayAudio = async (text: string, index: number) => {
    if (playingAudioIndex === index) {
      stopAudio();
      return;
    }
    
    const currentMessage = conversation[index];

    // Use cached audio if available
    if (currentMessage.audioDataUri) {
      playAudioFromUri(currentMessage.audioDataUri, index);
      return;
    }
    
    // Otherwise, generate new audio
    setLoadingAudioIndex(index);
    try {
      const result = await runTextToSpeech({ text });
      
      // Update conversation with the new audio URI
      const newAudioUri = result.audioDataUri;
      setConversation(prev => 
        prev.map((msg, i) => 
          i === index ? { ...msg, audioDataUri: newAudioUri } : msg
        )
      );
      playAudioFromUri(newAudioUri, index);

    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Audio Error',
        description: 'Failed to generate audio. You may have exceeded the API rate limit.',
      });
      console.error('TTS Error:', error);
    } finally {
      setLoadingAudioIndex(null);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isPending) return;

    stopAudio();
    const userMessage: Message = { role: "user", content: input };
    setConversation((prev) => [...prev, userMessage]);
    setInput("");

    startTransition(async () => {
      try {
        const result = await runAnswerQuestion({
          documentContent: documentText,
          question: input,
        });
        const aiMessage: Message = { role: "ai", content: result.answer };
        setConversation((prev) => [...prev, aiMessage]);
      } catch (error) {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'Failed to get an answer. Please try again.',
        });
        setConversation(prev => prev.slice(0, -1)); // Remove the user message on error
      }
    });
  };

  return (
    <Card className="shadow-lg h-[60vh] flex flex-col">
      <CardHeader>
        <CardTitle className="font-headline text-2xl">
          Ask a Question
        </CardTitle>
        <CardDescription>
          Get answers about your document. Ask anything you're unsure about.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-grow flex flex-col gap-4 overflow-hidden">
        <ScrollArea className="flex-grow pr-4" ref={scrollAreaRef}>
          <div className="space-y-4">
            {conversation.map((msg, index) => (
              <div
                key={index}
                className={cn(
                  "flex items-start gap-3 group",
                  msg.role === "user" ? "justify-end" : "justify-start"
                )}
              >
                 {msg.role === "ai" && (
                  <Avatar className="w-8 h-8 bg-primary text-primary-foreground">
                    <AvatarFallback>
                      <Bot className="w-5 h-5" />
                    </AvatarFallback>
                  </Avatar>
                )}
                <div
                  className={cn(
                    "rounded-lg p-3 max-w-sm md:max-w-md lg:max-w-lg relative",
                    msg.role === "user"
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted"
                  )}
                >
                  <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                   {msg.role === 'ai' && (
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="absolute -bottom-2 -right-2 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => handlePlayAudio(msg.content, index)}
                      disabled={loadingAudioIndex !== null && loadingAudioIndex !== index}
                      aria-label={playingAudioIndex === index ? "Stop audio" : "Read message aloud"}
                    >
                      {loadingAudioIndex === index ? (
                        <LoaderCircle className="w-4 h-4 animate-spin" />
                      ) : playingAudioIndex === index ? (
                        <StopCircle className="w-4 h-4" />
                      ) : (
                        <Volume2 className="w-4 h-4" />
                      )}
                    </Button>
                  )}
                </div>
                {msg.role === "user" && (
                  <Avatar className="w-8 h-8">
                    <AvatarFallback>
                      <User className="w-5 h-5" />
                    </AvatarFallback>
                  </Avatar>
                )}
              </div>
            ))}
             {isPending && conversation[conversation.length - 1]?.role === 'user' && (
               <div className="flex items-start gap-3 justify-start">
                  <Avatar className="w-8 h-8 bg-primary text-primary-foreground">
                    <AvatarFallback>
                      <Bot className="w-5 h-5" />
                    </AvatarFallback>
                  </Avatar>
                  <div className="rounded-lg p-3 bg-muted flex items-center">
                    <LoaderCircle className="w-5 h-5 animate-spin text-muted-foreground" />
                  </div>
               </div>
             )}
          </div>
        </ScrollArea>
        <form onSubmit={handleSubmit} className="flex items-center gap-2 pt-2 border-t">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="e.g., What is the notice period?"
            disabled={isPending}
            className="flex-grow"
          />
          <Button type="submit" disabled={isPending || !input.trim()} size="icon">
            {isPending ? (
              <LoaderCircle className="animate-spin" />
            ) : (
              <Send />
            )}
            <span className="sr-only">Send</span>
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

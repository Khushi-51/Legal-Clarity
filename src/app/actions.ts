"use server";

import { generatePlainLanguageSummary } from "@/ai/flows/generate-plain-language-summary";
import type { GeneratePlainLanguageSummaryInput } from "@/ai/flows/generate-plain-language-summary";
import { detectPotentialRisks } from "@/ai/flows/detect-potential-risks";
import type { DetectPotentialRisksInput } from "@/ai/flows/detect-potential-risks";
import { extractObligations } from "@/ai/flows/extract-obligations";
import type { ExtractObligationsInput } from "@/ai/flows/extract-obligations";
import { answerDocumentQuestions } from "@/ai/flows/answer-document-questions";
import type { AnswerDocumentQuestionsInput } from "@/ai/flows/answer-document-questions";
import { textToSpeech } from "@/ai/flows/text-to-speech";
import type { TextToSpeechInput } from "@/ai/flows/text-to-speech";
import { suggestNegotiationPoints } from "@/ai/flows/suggest-negotiation-points";
import type { SuggestNegotiationPointsInput } from "@/ai/flows/suggest-negotiation-points";
import { translateText } from "@/ai/flows/translate-text";
import type { TranslateTextInput } from "@/ai/flows/translate-text";
import { draftContract } from "@/ai/flows/draft-contract";
import type { DraftContractInput } from "@/ai/flows/draft-contract";


export const runGenerateSummary = async (input: GeneratePlainLanguageSummaryInput) => {
  return await generatePlainLanguageSummary(input);
};

export const runDetectRisks = async (input: DetectPotentialRisksInput) => {
  return await detectPotentialRisks(input);
};

export const runExtractObligations = async (input: ExtractObligationsInput) => {
  return await extractObligations(input);
};

export const runAnswerQuestion = async (input: AnswerDocumentQuestionsInput) => {
  return await answerDocumentQuestions(input);
};

export const runTextToSpeech = async (input: TextToSpeechInput) => {
    return await textToSpeech(input);
};

export const runSuggestNegotiationPoints = async (input: SuggestNegotiationPointsInput) => {
    return await suggestNegotiationPoints(input);
};

export const runTranslateText = async (input: TranslateTextInput) => {
    return await translateText(input);
}

export const runDraftContract = async (input: DraftContractInput) => {
    return await draftContract(input);
}

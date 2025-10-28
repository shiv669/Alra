/**
 * ALRA Phase 3: Inline Summarization Engine
 *
 * Production-grade summarization system with:
 * - Content segmentation and analysis
 * - Extractive summarization (TF-IDF based)
 * - Chrome Summarizer API integration
 * - Modern modal UI with glassmorphism
 * - Comprehensive metrics tracking
 */
interface Sentence {
    text: string;
    wordCount: number;
    wordSet: Set<string>;
    position: number;
    score: number;
}
interface ContentBlock {
    id: string;
    type: "paragraph" | "article" | "section" | "list";
    element: HTMLElement;
    rawText: string;
    wordCount: number;
    sentences: Sentence[];
    importance: number;
    depth: number;
    estimatedReadingTime: number;
}
interface Summary {
    id: string;
    originalText: string;
    summaryText: string;
    keyPoints: string[];
    keywords: string[];
    compressionRatio: number;
    readingTime: {
        original: number;
        summary: number;
    };
    importance: number;
    method: "chrome-api" | "extractive" | "hybrid";
    confidence: number;
    sourceElement: HTMLElement;
}
interface SummarizationMetrics {
    totalBlocksAnalyzed: number;
    blocksSummarized: number;
    totalWordsOriginal: number;
    totalWordsSummary: number;
    averageCompressionRatio: number;
    averageReadingTimeSaved: number;
    chromeAPIUsed: boolean;
    extractiveUsed: boolean;
    totalProcessingTime: number;
    summariesGenerated: Summary[];
}
interface SummarizerConfig {
    enabled?: boolean;
    minBlockWordCount?: number;
    maxBlockWordCount?: number;
    maxSummariesPerPage?: number;
    inlineDisplayMode?: "badge" | "dropdown" | "modal" | "inline";
    prioritizePageSummary?: boolean;
}
declare function segmentPageContent(): ContentBlock[];
declare function generateExtractiveSummary(block: ContentBlock): Summary;
declare function initializeSummarizer(config?: SummarizerConfig): Promise<SummarizationMetrics>;
declare function disableSummarizer(): void;
export { initializeSummarizer, disableSummarizer, segmentPageContent, generateExtractiveSummary };
export type { Summary, ContentBlock, SummarizationMetrics };

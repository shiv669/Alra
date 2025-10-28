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

import { SummaryModal, createSummaryBadge } from './summary-modal';
import { metricsTracker } from './metrics';

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

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
  readingTime: { original: number; summary: number };
  importance: number;
  method: "chrome-api" | "extractive" | "hybrid";
  confidence: number;
  sourceElement: HTMLElement;
}

interface SummaryUI {
  id: string;
  element: HTMLElement;
  summaryContent: HTMLElement;
  expandButton: HTMLElement;
  metricsDisplay: HTMLElement;
  badge: HTMLElement;
  isExpanded: boolean;
  linkedSummary: Summary;
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

// ============================================================================
// CONTENT SEGMENTATION
// ============================================================================

function segmentPageContent(): ContentBlock[] {
  console.log("📖 ALRA: Segmenting page content into blocks...");

  const contentBlocks: ContentBlock[] = [];
  
  // Expanded selectors for different website types
  const articleSelectors = [
    // Standard semantic HTML
    "article",
    "main",
    // Common article containers
    ".article",
    ".post",
    ".content",
    ".entry-content",
    ".post-content",
    ".article-content",
    // Wikipedia specific
    "#mw-content-text",
    ".mw-parser-output",
    "#bodyContent",
    // News sites
    ".story-body",
    ".article-body",
    // Medium, Substack
    ".postArticle-content",
    ".body",
    // Reddit
    ".Post",
    "[data-test-id='post-content']",
    // Generic
    "[role='main']",
    "[role='article']",
  ];

  let blockCounter = 0;

  // Strategy 1: Try to find article containers first
  for (const selector of articleSelectors) {
    const elements = document.querySelectorAll(selector);
    elements.forEach((container) => {
      const text = (container as HTMLElement).innerText || "";
      const wordCount = text.trim().split(/\s+/).length;

      // Accept blocks with 100-5000 words
      if (wordCount >= 100 && wordCount <= 5000) {
        const block: ContentBlock = {
          id: `block-${blockCounter++}`,
          type: "article",
          element: container as HTMLElement,
          rawText: text,
          wordCount,
          sentences: extractSentences(text),
          importance: 75,
          depth: 0,
          estimatedReadingTime: Math.max(1, Math.ceil(wordCount / 200)),
        };
        contentBlocks.push(block);
      }
    });
    
    // If we found good content, stop searching
    if (contentBlocks.length > 0) break;
  }

  // Strategy 2: If no article containers found, look for long paragraphs
  if (contentBlocks.length === 0) {
    console.log("📖 ALRA: No article containers found, analyzing paragraphs...");
    const paragraphs = document.querySelectorAll("p");
    const longParagraphs: HTMLElement[] = [];
    
    paragraphs.forEach((p) => {
      const text = (p as HTMLElement).innerText || "";
      const wordCount = text.trim().split(/\s+/).length;
      
      // Look for substantial paragraphs (300+ chars, 50+ words)
      if (text.length >= 300 && wordCount >= 50) {
        longParagraphs.push(p as HTMLElement);
      }
    });

    // If we found multiple long paragraphs, group them
    if (longParagraphs.length >= 2) {
      const combinedText = longParagraphs.map(p => p.innerText).join("\n\n");
      const wordCount = combinedText.trim().split(/\s+/).length;
      
      if (wordCount >= 100) {
        const block: ContentBlock = {
          id: `block-${blockCounter++}`,
          type: "article",
          element: longParagraphs[0].parentElement || longParagraphs[0],
          rawText: combinedText,
          wordCount,
          sentences: extractSentences(combinedText),
          importance: 70,
          depth: 0,
          estimatedReadingTime: Math.max(1, Math.ceil(wordCount / 200)),
        };
        contentBlocks.push(block);
      }
    }
  }

  console.log(`✅ ALRA: Segmented ${contentBlocks.length} content blocks (${contentBlocks.reduce((sum, b) => sum + b.wordCount, 0)} words total)`);
  return contentBlocks;
}

function extractSentences(text: string): Sentence[] {
  const sentences: Sentence[] = [];
  const sentenceRegex = /([^.!?]*[.!?]+)/g;
  const matches = text.match(sentenceRegex) || [];
  const totalLength = Math.max(1, matches.length);

  matches.forEach((match: string, index: number) => {
    const sentenceText = match.trim();
    if (sentenceText.length > 10) {
      const words = sentenceText.split(/\s+/).filter((w) => w.length > 0);
      const wordSet = new Set(words.map((w) => w.toLowerCase()));

      sentences.push({
        text: sentenceText,
        wordCount: words.length,
        wordSet,
        position: index / totalLength,
        score: 0,
      });
    }
  });

  return sentences;
}

function extractKeywords(text: string, count: number = 5): string[] {
  const stopWords = new Set([
    "the",
    "a",
    "an",
    "and",
    "or",
    "but",
    "in",
    "on",
    "at",
    "to",
    "for",
    "of",
    "with",
    "is",
    "are",
    "was",
    "were",
  ]);

  const words = text.toLowerCase().match(/\b\w+\b/g) || [];
  const wordFreq = new Map<string, number>();

  words.forEach((word) => {
    if (!stopWords.has(word) && word.length > 3) {
      wordFreq.set(word, (wordFreq.get(word) || 0) + 1);
    }
  });

  return Array.from(wordFreq.entries())
    .sort((a: [string, number], b: [string, number]) => b[1] - a[1])
    .slice(0, count)
    .map(([word]: [string, number]) => word);
}

// ============================================================================
// EXTRACTIVE SUMMARIZATION
// ============================================================================

function generateExtractiveSummary(block: ContentBlock): Summary {
  console.log(`📄 ALRA: Generating summary for block ${block.id}...`);

  const wordFrequency = new Map<string, number>();
  const stopWords = new Set([
    "the",
    "a",
    "an",
    "and",
    "or",
    "but",
    "in",
    "on",
    "at",
    "to",
    "for",
    "is",
    "are",
  ]);

  block.sentences.forEach((sentence: Sentence) => {
    sentence.wordSet.forEach((word: string) => {
      if (!stopWords.has(word) && word.length > 2) {
        wordFrequency.set(word, (wordFrequency.get(word) || 0) + 1);
      }
    });
  });

  block.sentences.forEach((sentence: Sentence) => {
    let score = 0;
    sentence.wordSet.forEach((word: string) => {
      score += wordFrequency.get(word) || 0;
    });

    score = score / Math.max(1, sentence.wordCount);
    const positionBias = 1 + (1 - sentence.position) * 0.3;
    score *= positionBias;

    if (sentence.wordCount < 5) score *= 0.5;
    else if (sentence.wordCount > 30) score *= 0.7;

    sentence.score = score;
  });

  const topSentences = block.sentences
    .map((s: Sentence, index: number) => ({ ...s, originalIndex: index }))
    .sort((a: any, b: any) => b.score - a.score)
    .slice(0, Math.max(2, Math.ceil(block.sentences.length * 0.4)))
    .sort((a: any, b: any) => a.originalIndex - b.originalIndex);

  const summaryText = topSentences.map((s: any) => s.text).join(" ");
  const keyPoints = topSentences.slice(0, 3).map((s: any) => s.text);
  const keywords = extractKeywords(block.rawText, 5);
  const compressionRatio = summaryText.length / block.rawText.length;
  const summaryReadingTime = Math.max(1, Math.ceil(summaryText.split(/\s+/).length / 200));

  return {
    id: `summary-${block.id}`,
    originalText: block.rawText,
    summaryText,
    keyPoints,
    keywords,
    compressionRatio: Math.min(compressionRatio, 0.9),
    readingTime: {
      original: block.estimatedReadingTime,
      summary: summaryReadingTime,
    },
    importance: block.importance,
    method: "extractive",
    confidence: Math.min(0.95, 0.7 + topSentences.length / block.sentences.length * 0.25),
    sourceElement: block.element,
  };
}

async function generateChromeSummary(block: ContentBlock): Promise<Summary> {
  try {
    // Use the injected AI bridge to access window.ai from page context
    // The bridge script runs in the page's main world and has access to window.ai
    
    const requestId = `req-${Date.now()}-${Math.random()}`;
    
    const result = await new Promise<string>((resolve, reject) => {
      // Listen for response from bridge
      const responseHandler = (event: any) => {
        if (event.detail.requestId === requestId) {
          window.removeEventListener('ALRA_AI_RESPONSE', responseHandler);
          if (event.detail.success) {
            resolve(event.detail.result);
          } else {
            reject(new Error(event.detail.error || 'AI operation failed'));
          }
        }
      };
      
      window.addEventListener('ALRA_AI_RESPONSE', responseHandler);
      
      // Send request to injected bridge
      window.dispatchEvent(new CustomEvent('ALRA_AI_REQUEST', {
        detail: {
          action: 'SUMMARIZE',
          data: {
            text: block.rawText.substring(0, 4000), // Limit to 4000 chars
            type: 'key-points',
            format: 'markdown',
            length: 'medium'
          },
          requestId
        }
      }));
      
      // Timeout after 10 seconds
      setTimeout(() => {
        window.removeEventListener('ALRA_AI_RESPONSE', responseHandler);
        reject(new Error('AI operation timeout'));
      }, 10000);
    });

    if (result) {
      const summaryText = result;
      const keyPoints = summaryText
        .split("\n")
        .filter((line: string) => line.trim().length > 0)
        .slice(0, 3);

      const compressionRatio = summaryText.length / block.rawText.length;

      console.log("✅ ALRA: Used Chrome Summarizer API via injected bridge");
      console.log(`   Chrome API: Yes`);
      console.log(`   Words: ${block.wordCount} → ${summaryText.split(/\s+/).length} (${Math.round(compressionRatio * 100)}% compression)`);

      return {
        id: `summary-${block.id}`,
        originalText: block.rawText,
        summaryText,
        keyPoints,
        keywords: extractKeywords(block.rawText, 5),
        compressionRatio: Math.min(compressionRatio, 0.9),
        readingTime: {
          original: block.estimatedReadingTime,
          summary: Math.max(1, Math.ceil(summaryText.split(/\s+/).length / 200)),
        },
        importance: block.importance,
        method: "chrome-api",
        confidence: 0.98,
        sourceElement: block.element,
      };
    } else {
      // Fallback to extractive if bridge returned nothing
      console.debug("⚠️ ALRA: Chrome API returned empty, using extractive fallback");
      return generateExtractiveSummary(block);
    }
  } catch (error) {
    console.debug("⚠️ ALRA: Chrome API failed, using extractive", error);
    return generateExtractiveSummary(block);
  }
}

// ============================================================================
// SUMMARY UI COMPONENTS
// ============================================================================

function highlightKeywords(text: string, keywords: string[]): string {
  let highlighted = text;
  keywords.forEach((keyword) => {
    const regex = new RegExp(`\\b(${keyword})\\b`, "gi");
    highlighted = highlighted.replace(
      regex,
      `<mark style="background-color: #fff9e6; padding: 2px 4px;">$1</mark>`
    );
  });
  return highlighted;
}

function createSummaryUI(summary: Summary): SummaryUI {
  const container = document.createElement("div");
  container.className = "alra-summary-container";
  container.id = `summary-ui-${summary.id}`;
  container.style.cssText = `
    margin: 15px 0;
    padding: 12px;
    background-color: rgba(100, 200, 255, 0.08);
    border-left: 4px solid #64c8ff;
    border-radius: 6px;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  `;

  const badge = document.createElement("div");
  badge.style.cssText = `
    display: inline-block;
    background-color: #4299e1;
    color: white;
    padding: 4px 10px;
    border-radius: 3px;
    font-size: 12px;
    font-weight: 600;
    margin-bottom: 8px;
  `;
  badge.textContent = `✨ SUMMARY (${(summary.compressionRatio * 100).toFixed(0)}%)`;

  const summaryContent = document.createElement("div");
  summaryContent.style.cssText = "font-size: 14px; line-height: 1.6; color: #333; margin-bottom: 8px; display: none;";
  summaryContent.innerHTML = highlightKeywords(summary.summaryText, summary.keywords);

  const metricsDisplay = document.createElement("div");
  metricsDisplay.style.cssText = `
    font-size: 12px;
    color: #666;
    border-top: 1px solid rgba(0,0,0,0.1);
    padding-top: 8px;
    margin-top: 8px;
    display: none;
    gap: 20px;
  `;

  const timeSaved = summary.readingTime.original - summary.readingTime.summary;
  metricsDisplay.innerHTML = `
    📖 ${summary.readingTime.original}m → ⚡${summary.readingTime.summary}m | ⏱️ Save ${timeSaved}m | 🎯 ${(summary.confidence * 100).toFixed(0)}%
  `;

  const expandButton = document.createElement("button");
  expandButton.style.cssText = `
    background: none;
    border: none;
    color: #4299e1;
    cursor: pointer;
    padding: 0;
    font-size: 12px;
    font-weight: 600;
    margin-top: 8px;
  `;
  expandButton.textContent = "Show Full Summary →";

  const ui: SummaryUI = {
    id: summary.id,
    element: container,
    summaryContent,
    expandButton,
    metricsDisplay,
    badge,
    isExpanded: false,
    linkedSummary: summary,
  };

  expandButton.addEventListener("click", () => {
    ui.isExpanded = !ui.isExpanded;
    summaryContent.style.display = ui.isExpanded ? "block" : "none";
    metricsDisplay.style.display = ui.isExpanded ? "block" : "none";
    expandButton.textContent = ui.isExpanded ? "Hide Summary ↓" : "Show Full Summary →";
  });

  container.appendChild(badge);
  container.appendChild(summaryContent);
  container.appendChild(metricsDisplay);
  container.appendChild(expandButton);

  return ui;
}

// ============================================================================
// MAIN ORCHESTRATOR
// ============================================================================

async function initializeSummarizer(config: SummarizerConfig = {}): Promise<SummarizationMetrics> {
  const startTime = performance.now();
  console.log("📝 ALRA: Initializing Phase 3 - Inline Summarization");

  const finalConfig = {
    enabled: config.enabled ?? true,
    minBlockWordCount: config.minBlockWordCount ?? 100,
    maxBlockWordCount: config.maxBlockWordCount ?? 5000,
    maxSummariesPerPage: config.maxSummariesPerPage ?? 5,
    inlineDisplayMode: config.inlineDisplayMode ?? "badge",
    prioritizePageSummary: config.prioritizePageSummary ?? true,
  };

  const metrics: SummarizationMetrics = {
    totalBlocksAnalyzed: 0,
    blocksSummarized: 0,
    totalWordsOriginal: 0,
    totalWordsSummary: 0,
    averageCompressionRatio: 0,
    averageReadingTimeSaved: 0,
    chromeAPIUsed: false,
    extractiveUsed: false,
    totalProcessingTime: 0,
    summariesGenerated: [],
  };

  if (!finalConfig.enabled) {
    console.log("⏭️ ALRA: Summarization disabled");
    return metrics;
  }

  const contentBlocks = segmentPageContent();
  metrics.totalBlocksAnalyzed = contentBlocks.length;

  if (contentBlocks.length === 0) {
    console.log("⚠️ ALRA: No content blocks found");
    return metrics;
  }

  const selectedBlocks = contentBlocks.slice(0, finalConfig.maxSummariesPerPage);
  console.log(`📊 ALRA: Summarizing ${selectedBlocks.length} content blocks...`);

  for (const block of selectedBlocks) {
    try {
      const summary = await generateChromeSummary(block);
      metrics.summariesGenerated.push(summary);
      metrics.blocksSummarized++;
      metrics.totalWordsOriginal += block.wordCount;
      metrics.totalWordsSummary += summary.summaryText.split(/\s+/).length;

      if (summary.method === "chrome-api") {
        metrics.chromeAPIUsed = true;
      } else {
        metrics.extractiveUsed = true;
      }

      // Create beautiful modern modal instead of inline UI
      const modal = new SummaryModal({
        summary: {
          id: summary.id,
          summaryText: summary.summaryText,
          keyPoints: summary.keyPoints,
          keywords: summary.keywords,
          compressionRatio: summary.compressionRatio,
          readingTime: summary.readingTime,
          confidence: summary.confidence,
        },
        position: 'top-right',
        autoShow: false, // Don't auto-show, wait for user click
      });

      // Store modal globally instead of creating badge
      // The floating menu will control when to show it
      (window as any).alraSummaryModal = modal;
      (window as any).alraSummaryAvailable = true;

      console.log(`✅ ALRA: Summary ready (access via floating menu)`);
      
      // Track metrics for each summarization
      const timeSaved = Math.round((block.wordCount - summary.summaryText.split(' ').length) / 200 * 60); // seconds
      await metricsTracker.trackEvent({
        type: 'article_summarized',
        value: timeSaved,
        timestamp: Date.now(),
        details: {
          originalWords: block.wordCount,
          summaryWords: summary.summaryText.split(' ').length,
          compressionRatio: summary.compressionRatio,
        }
      });
      
    } catch (error) {
      console.debug(`⚠️ ALRA: Failed to summarize ${block.id}`, error);
    }
  }

  if (metrics.blocksSummarized > 0) {
    metrics.averageCompressionRatio = metrics.totalWordsSummary / metrics.totalWordsOriginal;
    metrics.averageReadingTimeSaved = Math.round(
      metrics.totalWordsOriginal / 200 - metrics.totalWordsSummary / 200
    );
  }

  metrics.totalProcessingTime = performance.now() - startTime;

  console.log("═════════════════════════════════════════════════════════════════");
  console.log("✅ ALRA: Phase 3 - Inline Summarization Complete");
  console.log("═════════════════════════════════════════════════════════════════");
  console.log(`📊 ALRA: Blocks analyzed: ${metrics.totalBlocksAnalyzed}`);
  console.log(`   Summarized: ${metrics.blocksSummarized}`);
  console.log(`   Words: ${metrics.totalWordsOriginal} → ${metrics.totalWordsSummary}`);
  console.log(`   Compression: ${(metrics.averageCompressionRatio * 100).toFixed(0)}%`);
  console.log(`   Time saved: ${metrics.averageReadingTimeSaved} minutes`);
  console.log(`   Chrome API: ${metrics.chromeAPIUsed ? "Yes" : "No"}`);
  console.log(`   Processing: ${metrics.totalProcessingTime.toFixed(0)}ms`);
  console.log("═════════════════════════════════════════════════════════════════");

  return metrics;
}

function disableSummarizer(): void {
  console.log("🔌 ALRA: Disabling Phase 3 summarization");
  const containers = document.querySelectorAll(".alra-summary-container");
  containers.forEach((c) => c.remove());
  console.log(`✅ ALRA: Removed ${containers.length} summary elements`);
}

// ============================================================================
// EXPORTS
// ============================================================================

export { initializeSummarizer, disableSummarizer, segmentPageContent, generateExtractiveSummary };
export type { Summary, ContentBlock, SummarizationMetrics };

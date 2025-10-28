/**
 * AI Service for Chrome Extension Popup
 *
 * Handles all Chrome AI API interactions
 * This runs in the popup context where window.ai is available
 */
interface AICapabilities {
    summarizer: boolean;
    languageModel: boolean;
    writer: boolean;
    rewriter: boolean;
}
/**
 * Initialize Chrome AI APIs from popup context
 */
export declare function initializeAIAPIs(): Promise<AICapabilities>;
/**
 * Summarize text using Chrome Summarizer API
 */
export declare function summarizeText(text: string): Promise<string | null>;
/**
 * Generate text using Language Model
 */
export declare function generateText(prompt: string): Promise<string | null>;
/**
 * Rewrite text using Writer API
 */
export declare function rewriteText(text: string, tone?: string): Promise<string | null>;
/**
 * Get current AI capabilities status
 */
export declare function getCapabilities(): AICapabilities;
export {};

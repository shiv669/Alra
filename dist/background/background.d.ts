/**
 * ALRA Background Service Worker
 *
 * This is the "brain" of the ALRA extension that runs in the background
 * It handles all the core logic like:
 * - Monitoring tab switches and user behavior patterns
 * - Managing the Chrome Storage for persisting data
 * - Communicating between content scripts and the popup
 * - Initializing AI APIs (Gemini Nano, Summarizer, Writer)
 *
 * Think of this as the central hub that coordinates all ALRA features
 */
interface ALRABrowsingSession {
    tabId: number;
    url: string;
    title: string;
    timestamp: number;
    durationOnTab: number;
    sequence: number;
}
interface ALRAMetrics {
    tabsPredictedCorrectly: number;
    timeSavedSeconds: number;
    clicksReduced: number;
    articlesSummarized: number;
    tasksCompleted: number;
    avgReadingTimeReduction: number;
}
interface ALRAPreferences {
    pageOptimizationEnabled: boolean;
    summarizationEnabled: boolean;
    predictionsEnabled: boolean;
    nudgesEnabled: boolean;
    metricsTrackingEnabled: boolean;
    privacyMode: boolean;
}
declare let isGeminiNanoAvailable: boolean;
declare let isSummarizerAvailable: boolean;
declare let isWriterAvailable: boolean;
declare let geminiNanoSession: any;
declare let summarizerSession: any;
declare let writerSession: any;
/**
 * Initialize Chrome AI APIs
 * These APIs work in service workers in Chrome Canary with flags enabled
 */
declare function initializeChromeAIAPIs(): Promise<void>;
declare const DEFAULT_PREFERENCES: ALRAPreferences;
declare const DEFAULT_METRICS: ALRAMetrics;
declare let browsing_history: ALRABrowsingSession[];
declare let current_tab_id: number | null;
declare let tab_start_time: number;
/**
 * logTabTransition - Records when user switches to a different tab
 *
 * This function is called every time the user clicks a tab
 * It calculates how long they spent on the previous tab, then saves it
 *
 * Example flow:
 * 1. User on YouTube tab for 5 minutes
 * 2. User clicks Wikipedia tab
 * 3. This function records: "YouTube - 5 minutes"
 * 4. Now we track Wikipedia as current tab
 */
declare function logTabTransition(tabId: number): Promise<void>;
/**
 * Summarize text using Chrome Summarizer API
 * Returns a concise summary of the input text
 */
declare function summarizeContent(text: string): Promise<string>;
/**
 * Get AI-powered action nudges based on current context
 * Uses Gemini Nano to suggest what user should do next
 */
declare function generateActionNudges(currentUrl: string, recentHistory: ALRABrowsingSession[]): Promise<string[]>;
/**
 * Predict next tab based on browsing history
 * Uses Gemini Nano to analyze patterns and suggest next likely tab
 */
declare function predictNextTab(history: ALRABrowsingSession[]): Promise<string | null>;
/**
 * Initialize ALRA with saved data from previous sessions
 *
 * This is called when the extension wakes up (user opens Chrome, etc.)
 * We restore the browsing history, preferences, and initialize AI APIs
 */
declare function initializeALRA(): Promise<void>;

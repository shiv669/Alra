/**
 * ALRA Phase 4: Tab Predictions Engine
 *
 * Production-grade tab prediction system with:
 * - Browsing history analysis
 * - Pattern detection and sequence learning
 * - ML-based next tab prediction
 * - Confidence scoring
 * - Predictive UI highlighting
 * - Real-time prediction updates
 */
interface TabVisit {
    url: string;
    title: string;
    domain: string;
    visitTime: number;
    timeSpent: number;
    referrer?: string;
    tabId?: number;
}
interface BrowsingPattern {
    sequence: string[];
    frequency: number;
    lastSeen: number;
    confidence: number;
    nextDomains: Map<string, number>;
}
interface TabPrediction {
    domain: string;
    url: string;
    title: string;
    confidence: number;
    reason: "sequential" | "temporal" | "contextual" | "ml-based";
    suggestedAction: "open" | "switch" | "preload";
    patterns: string[];
}
interface PredictionMetrics {
    totalPredictions: number;
    correctPredictions: number;
    accuracy: number;
    avgConfidence: number;
    patternsDetected: number;
    sequencesLearned: number;
    predictionsShown: number;
    userClickedPrediction: number;
}
interface PredictorConfig {
    enabled?: boolean;
    minPatternOccurrences?: number;
    minConfidenceThreshold?: number;
    maxPredictionsShown?: number;
    historyLookbackDays?: number;
    updateIntervalMs?: number;
    showInPopup?: boolean;
    highlightPredictedLinks?: boolean;
}
declare let currentPredictions: TabPrediction[];
declare let predictionMetrics: PredictionMetrics;
/**
 * Main initialization function for Phase 4 predictions
 */
declare function initializeTabPredictor(config?: PredictorConfig): Promise<PredictionMetrics>;
/**
 * Disables tab predictions and removes UI
 */
declare function disableTabPredictor(): void;
export { initializeTabPredictor, disableTabPredictor, currentPredictions, predictionMetrics };
export type { TabPrediction, TabVisit, BrowsingPattern, PredictionMetrics, PredictorConfig };

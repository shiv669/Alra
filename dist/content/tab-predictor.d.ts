/**
 * ALRA Phase 4: Tab Prediction Module
 *
 * Analyzes browsing patterns and highlights predicted next actions
 */
export interface TabPredictorConfig {
    enabled: boolean;
    minPatternOccurrences?: number;
    minConfidenceThreshold?: number;
    maxPredictionsShown?: number;
    historyLookbackDays?: number;
    updateIntervalMs?: number;
    showInPopup?: boolean;
    highlightPredictedLinks?: boolean;
}
export interface TabPredictorMetrics {
    patternsDetected: number;
    sequencesLearned: number;
    predictionsGenerated: number;
    avgConfidence: number;
    predictionsShown: number;
    accuracy: number;
}
/**
 * Initialize tab prediction functionality
 */
export declare function initializeTabPredictor(config: TabPredictorConfig): Promise<TabPredictorMetrics>;

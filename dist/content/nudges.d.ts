/**
 * ALRA Phase 5: Contextual Nudges Engine
 *
 * Generates intelligent, context-aware action suggestions using:
 * - Page analysis
 * - User behavior tracking
 * - Chrome Writer API (when available)
 * - Heuristic-based suggestions (fallback)
 */
export interface NudgeConfig {
    enabled: boolean;
    minTimeOnPage?: number;
    maxNudgesPerPage?: number;
    autoHideAfter?: number;
    position?: "bottom-right" | "top-right" | "inline";
}
export interface NudgeTrigger {
    userSpentTime: number;
    pageType: string;
    scrollDepth: number;
    hasInteracted: boolean;
    timeOfDay: "morning" | "afternoon" | "evening" | "night";
}
export interface Nudge {
    id: string;
    text: string;
    emoji: string;
    priority: "suggested" | "optional" | "high";
    action?: () => void;
    actionUrl?: string;
    actionText: string;
    timestamp: number;
    trigger: string;
}
export interface NudgeMetrics {
    nudgesGenerated: number;
    nudgesShown: number;
    nudgesActedUpon: number;
    nudgesDismissed: number;
    avgTimeToAction: number;
    conversionRate: number;
}
export declare function initializeNudges(config: NudgeConfig, pageType: string, pageUrl: string): Promise<NudgeMetrics>;
export declare function getNudgeMetrics(): NudgeMetrics;

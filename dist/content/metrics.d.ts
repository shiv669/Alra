/**
 * ALRA Metrics - Simple tracking, no UI
 */
export interface ProductivityMetrics {
    timeSavedSeconds: number;
    articlesSummarized: number;
    tabsPredicted: number;
    clicksReduced: number;
}
export interface MetricEvent {
    type: 'time_saved' | 'article_summarized' | 'tab_predicted' | 'click_reduced';
    value: number;
    timestamp: number;
    details?: any;
}
declare class MetricsTracker {
    private metrics;
    trackEvent(event: MetricEvent): Promise<void>;
    getMetrics(): Promise<ProductivityMetrics>;
}
export declare const metricsTracker: MetricsTracker;
export declare function initializeMetrics(): void;
export {};

/**
 * Modern Summary Modal Component
 * Beautiful floating popup with glassmorphism design
 */
export interface SummaryModalConfig {
    summary: {
        id: string;
        summaryText: string;
        keyPoints: string[];
        keywords: string[];
        compressionRatio: number;
        readingTime: {
            original: number;
            summary: number;
        };
        confidence: number;
    };
    position?: 'top-right' | 'center' | 'bottom-right';
    autoShow?: boolean;
}
export declare class SummaryModal {
    private modal;
    private overlay;
    private isVisible;
    private config;
    constructor(config: SummaryModalConfig);
    private injectStyles;
    private createModal;
    show(): void;
    hide(): void;
    toggle(): void;
    destroy(): void;
    private shareSummary;
    private copyToClipboard;
    private showToast;
}
export declare function createSummaryBadge(onClick: () => void): HTMLElement;

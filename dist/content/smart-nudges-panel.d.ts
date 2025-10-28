/**
 * ALRA Smart Nudges Panel
 *
 * Beautiful panel showing AI-generated smart suggestions
 * Uses Chrome's built-in AI (Gemini Nano) for context-aware recommendations
 */
export interface SmartSuggestion {
    id: string;
    text: string;
    emoji: string;
    category: 'productivity' | 'learning' | 'wellness' | 'navigation';
    actionText: string;
    action?: () => void;
    confidence: number;
}
export declare class SmartNudgesPanel {
    private overlay;
    private panel;
    private isGenerating;
    constructor();
    private createPanel;
    show(): Promise<void>;
    hide(): void;
    private generateSmartSuggestions;
    private getPageContext;
    private generateWithChromeAI;
    private parseAISuggestions;
    private categorizeNudge;
    private renderSuggestions;
    private createSuggestionCard;
    private renderFallbackSuggestions;
    private renderError;
    private showToast;
}

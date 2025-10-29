/**
 * ALRA Multimodal AI - Wave Animation Version
 *
 * Features beautiful blue wave animation instead of modals
 * Results appear inline on the page itself
 */
export declare class MultimodalAI {
    private waveOverlay;
    private resultContainer;
    private isProcessing;
    private aiAvailable;
    constructor();
    /**
     * Check if Gemini Nano AI is available
     */
    private checkAIAvailability;
    private init;
    private injectStyles;
    /**
     * Show the blue wave animation
     */
    private showWaveAnimation;
    /**
     * Hide wave animation with smooth fadeout
     */
    private hideWaveAnimation;
    /**
     * Show result inline on the page
     */
    private showResult;
    /**
     * Hide result container
     */
    private hideResult;
    /**
     * Show cute fallback message when AI is not available
     */
    private showFallbackMessage;
    /**
     * Analyze an image using Prompt API multimodal input
     */
    summarizeImage(imageElement?: HTMLImageElement): Promise<void>;
    /**
     * Summarize a YouTube video
     */
    summarizeYouTubeVideo(): Promise<void>;
    /**
     * Proofread selected text
     */
    proofreadText(text?: string): Promise<void>;
    /**
     * Translate selected text
     */
    translateText(text?: string, targetLang?: string): Promise<void>;
    /**
     * Show quick actions menu
     */
    showQuickActions(): Promise<void>;
    /**
     * Setup context menu listeners
     */
    private setupContextMenuListeners;
    /**
     * Send request to AI bridge
     */
    private sendToAIBridge;
}

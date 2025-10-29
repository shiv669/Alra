/**
 * ALRA Multimodal AI
 *
 * Uses Chrome's Prompt API with multimodal support to:
 * - Summarize images and screenshots
 * - Analyze YouTube videos
 * - Proofread and translate selected text
 */
export declare class MultimodalAI {
    private modal;
    private overlay;
    private isProcessing;
    constructor();
    private createModal;
    private setupContextMenuListeners;
    summarizeImage(imageElement?: HTMLImageElement): Promise<void>;
    summarizeYouTubeVideo(): Promise<void>;
    proofreadText(text: string): Promise<void>;
    translateText(text: string, targetLang?: string): Promise<void>;
    private imageToBlob;
    private analyzeImageWithPromptAPI;
    private analyzeVideoWithPromptAPI;
    private proofreadWithPromptAPI;
    private translateWithPromptAPI;
    show(): Promise<void>;
    hide(): void;
    private showLoading;
    private showResult;
    private showError;
    private showToast;
    showQuickActions(): Promise<void>;
}

/**
 * ALRA Productivity Mode
 *
 * Blocks unrelated tabs/pages with "Be Productive" screen
 * User can only access tabs related to their current focus topic
 */
export declare class ProductivityMode {
    private enabled;
    private focusTopic;
    private focusKeywords;
    private blockedOverlay;
    constructor();
    private initializeMode;
    enable(): Promise<void>;
    disable(): Promise<void>;
    private setFocusTopic;
    private checkAndBlock;
    private isPageRelated;
    private showBlockScreen;
    showSettings(): Promise<void>;
    isEnabled(): boolean;
    private showToast;
}

/**
 * ALRA Cross-Device Sync
 *
 * Syncs predicted tabs and session data across devices using Chrome Storage Sync
 * When browser closes on desktop, recommended tabs are synced to mobile
 */
export interface RecommendedTab {
    url: string;
    title: string;
    reason: string;
    confidence: number;
    timestamp: number;
}
export interface SyncSession {
    deviceType: 'desktop' | 'mobile' | 'tablet';
    recommendedTabs: RecommendedTab[];
    currentPage: {
        url: string;
        title: string;
        scrollPosition: number;
    };
    metrics: any;
    lastSync: number;
    sessionId: string;
}
export declare class DeviceSync {
    private syncEnabled;
    private deviceType;
    private recommendedTabs;
    constructor();
    private detectDeviceType;
    private initializeSync;
    enableSync(): Promise<void>;
    disableSync(): Promise<void>;
    private setupSyncOnClose;
    addRecommendedTab(url: string, title: string, reason: string, confidence: number): Promise<void>;
    generateRecommendedTabs(): Promise<void>;
    private getAIRecommendations;
    private parseAIRecommendations;
    private generateHeuristicRecommendations;
    private syncToCloud;
    private checkForSyncedTabs;
    private showRecommendedTabsModal;
    showSyncSettings(): Promise<void>;
    private timeAgo;
    private showToast;
}

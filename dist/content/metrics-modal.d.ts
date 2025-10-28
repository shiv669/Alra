/**
 * Metrics Modal - Shows productivity stats
 */
import { ProductivityMetrics } from './metrics';
export declare class MetricsModal {
    private modal;
    private overlay;
    private isVisible;
    constructor();
    private injectStyles;
    private createModal;
    show(metrics: ProductivityMetrics): Promise<void>;
    hide(): void;
}

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

class MetricsTracker {
  private metrics: ProductivityMetrics = {
    timeSavedSeconds: 0,
    articlesSummarized: 0,
    tabsPredicted: 0,
    clicksReduced: 0,
  };

  async trackEvent(event: MetricEvent): Promise<void> {
    switch (event.type) {
      case 'time_saved':
        this.metrics.timeSavedSeconds += event.value;
        break;
      case 'article_summarized':
        this.metrics.articlesSummarized += 1;
        break;
      case 'tab_predicted':
        this.metrics.tabsPredicted += 1;
        break;
      case 'click_reduced':
        this.metrics.clicksReduced += 1;
        break;
    }

    try {
      await chrome.storage.local.set({ alraMetrics: this.metrics });
    } catch (e) {
      console.warn('Could not save metrics:', e);
    }
  }

  async getMetrics(): Promise<ProductivityMetrics> {
    try {
      const result = await chrome.storage.local.get('alraMetrics');
      if (result.alraMetrics) {
        this.metrics = result.alraMetrics;
      }
    } catch (e) {
      console.warn('Could not load metrics:', e);
    }
    return { ...this.metrics };
  }
}

export const metricsTracker = new MetricsTracker();
export function initializeMetrics(): void {
  console.log(' ALRA: Metrics tracking initialized');
}

/**
 * Metrics Modal - Shows productivity stats
 */

import { ModernColors } from './modern-ui-system';
import { ProductivityMetrics } from './metrics';

export class MetricsModal {
  private modal: HTMLElement | null = null;
  private overlay: HTMLElement | null = null;
  private isVisible = false;

  constructor() {
    this.createModal();
    this.injectStyles();
  }

  private injectStyles(): void {
    const styleId = 'alra-metrics-modal-styles';
    if (document.getElementById(styleId)) return;

    const style = document.createElement('style');
    style.id = styleId;
    style.textContent = `
      .alra-metrics-overlay {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.3);
        backdrop-filter: blur(4px);
        z-index: 999998;
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .alra-metrics-modal {
        position: relative;
        width: 90%;
        max-width: 500px;
        background: white;
        border-radius: 16px;
        box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15);
        overflow: hidden;
      }

      .alra-metrics-header {
        padding: 24px 28px;
        background: linear-gradient(135deg, #2563EB 0%, #1E40AF 100%);
        color: white;
        display: flex;
        align-items: center;
        justify-content: space-between;
      }

      .alra-metrics-title {
        font-size: 20px;
        font-weight: 700;
        display: flex;
        align-items: center;
        gap: 10px;
      }

      .alra-metrics-close {
        background: rgba(255, 255, 255, 0.2);
        border: none;
        color: white;
        width: 32px;
        height: 32px;
        border-radius: 8px;
        cursor: pointer;
        font-size: 22px;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all 0.2s;
      }

      .alra-metrics-close:hover {
        background: rgba(255, 255, 255, 0.3);
      }

      .alra-metrics-content {
        padding: 28px;
      }

      .alra-metrics-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 16px;
        margin-bottom: 20px;
      }

      .alra-metric-card {
        background: linear-gradient(135deg, #F9FAFB 0%, #FFFFFF 100%);
        border: 1px solid #E5E7EB;
        border-radius: 12px;
        padding: 20px;
        text-align: center;
      }

      .alra-metric-icon {
        font-size: 32px;
        margin-bottom: 8px;
      }

      .alra-metric-value {
        font-size: 28px;
        font-weight: 700;
        color: #2563EB;
        margin-bottom: 4px;
      }

      .alra-metric-label {
        font-size: 12px;
        color: #6B7280;
        text-transform: uppercase;
        letter-spacing: 0.05em;
        font-weight: 600;
      }
    `;

    document.head.appendChild(style);
  }

  private createModal(): void {
    // Create overlay
    this.overlay = document.createElement('div');
    this.overlay.className = 'alra-metrics-overlay';
    this.overlay.style.display = 'none';
    this.overlay.onclick = (e) => {
      if (e.target === this.overlay) {
        this.hide();
      }
    };

    // Create modal
    this.modal = document.createElement('div');
    this.modal.className = 'alra-metrics-modal';

    // Will be populated when shown
    this.overlay.appendChild(this.modal);
    document.body.appendChild(this.overlay);
  }

  public async show(metrics: ProductivityMetrics): Promise<void> {
    if (!this.modal) return;

    const minutes = Math.floor(metrics.timeSavedSeconds / 60);
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    const timeDisplay = hours > 0 ? `${hours}h ${remainingMinutes}m` : `${minutes}m`;

    this.modal.innerHTML = `
      <div class="alra-metrics-header">
        <div class="alra-metrics-title">
          <span>📊</span>
          <span>Your Productivity</span>
        </div>
        <button class="alra-metrics-close">×</button>
      </div>
      <div class="alra-metrics-content">
        <div class="alra-metrics-grid">
          <div class="alra-metric-card">
            <div class="alra-metric-icon">⏱️</div>
            <div class="alra-metric-value">${timeDisplay}</div>
            <div class="alra-metric-label">Time Saved</div>
          </div>
          <div class="alra-metric-card">
            <div class="alra-metric-icon">📖</div>
            <div class="alra-metric-value">${metrics.articlesSummarized}</div>
            <div class="alra-metric-label">Articles</div>
          </div>
          <div class="alra-metric-card">
            <div class="alra-metric-icon">🎯</div>
            <div class="alra-metric-value">${metrics.tabsPredicted}</div>
            <div class="alra-metric-label">Tabs Predicted</div>
          </div>
          <div class="alra-metric-card">
            <div class="alra-metric-icon">🖱️</div>
            <div class="alra-metric-value">${metrics.clicksReduced}</div>
            <div class="alra-metric-label">Clicks Reduced</div>
          </div>
        </div>
      </div>
    `;

    // Re-attach close button handler
    const closeBtn = this.modal.querySelector('.alra-metrics-close');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => this.hide());
    }

    if (this.overlay) {
      this.overlay.style.display = 'flex';
    }

    this.isVisible = true;
  }

  public hide(): void {
    if (!this.isVisible) return;

    if (this.overlay) {
      this.overlay.style.display = 'none';
    }

    this.isVisible = false;
  }
}

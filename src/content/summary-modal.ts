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
    readingTime: { original: number; summary: number };
    confidence: number;
  };
  position?: 'top-right' | 'center' | 'bottom-right';
  autoShow?: boolean;
}

export class SummaryModal {
  private modal: HTMLElement | null = null;
  private overlay: HTMLElement | null = null;
  private isVisible = false;
  private config: SummaryModalConfig;

  constructor(config: SummaryModalConfig) {
    this.config = config;
    this.createModal();
    this.injectStyles();
    if (config.autoShow) {
      this.show();
    }
  }

  private injectStyles(): void {
    const styleId = 'alra-summary-modal-styles';
    if (document.getElementById(styleId)) return;

    const style = document.createElement('style');
    style.id = styleId;
    style.textContent = `
      @keyframes alraFadeIn {
        from {
          opacity: 0;
          transform: translateY(-20px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }

      @keyframes alraSlideIn {
        from {
          transform: translateX(400px);
          opacity: 0;
        }
        to {
          transform: translateX(0);
          opacity: 1;
        }
      }

      .alra-modal-overlay {
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
        animation: alraFadeIn 0.3s ease-out;
      }

      .alra-summary-modal {
        position: fixed;
        max-width: 500px;
        width: 90%;
        max-height: 80vh;
        background: linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(255, 255, 255, 0.98) 100%);
        backdrop-filter: blur(20px) saturate(180%);
        border: 1px solid rgba(255, 255, 255, 0.3);
        border-radius: 16px;
        box-shadow: 
          0 20px 60px rgba(0, 0, 0, 0.15),
          0 0 0 1px rgba(255, 255, 255, 0.1) inset;
        z-index: 999999;
        overflow: hidden;
        animation: alraFadeIn 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      }

      .alra-summary-modal.top-right {
        top: 80px;
        right: 20px;
        animation: alraSlideIn 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
      }

      .alra-summary-modal.center {
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
      }

      .alra-modal-header {
        padding: 24px 28px;
        background: #FFFFFF;
        border-bottom: 1px solid rgba(0, 0, 0, 0.06);
        display: flex;
        align-items: center;
        justify-content: space-between;
      }

      .alra-modal-title {
        font-size: 20px;
        font-weight: 700;
        color: #1F2937;
        display: flex;
        align-items: center;
        gap: 10px;
        letter-spacing: -0.01em;
      }

      .alra-modal-close {
        background: rgba(0, 0, 0, 0.04);
        border: none;
        color: #6B7280;
        width: 32px;
        height: 32px;
        border-radius: 8px;
        cursor: pointer;
        font-size: 22px;
        line-height: 1;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
      }

      .alra-modal-close:hover {
        background: rgba(0, 0, 0, 0.08);
        color: #1F2937;
        transform: scale(1.05);
      }

      .alra-modal-stats {
        padding: 20px 28px;
        background: rgba(249, 250, 251, 0.5);
        display: flex;
        gap: 32px;
        flex-wrap: wrap;
        border-bottom: 1px solid rgba(0, 0, 0, 0.06);
      }

      .alra-stat {
        display: flex;
        flex-direction: column;
        gap: 6px;
      }

      .alra-stat-label {
        font-size: 12px;
        text-transform: uppercase;
        letter-spacing: 0.05em;
        color: #6B7280;
        font-weight: 500;
      }

      .alra-stat-value {
        font-size: 24px;
        font-weight: 700;
        color: #2563EB;
        letter-spacing: -0.02em;
      }

      .alra-modal-content {
        padding: 24px;
        max-height: 50vh;
        overflow-y: auto;
      }

      .alra-modal-content::-webkit-scrollbar {
        width: 8px;
      }

      .alra-modal-content::-webkit-scrollbar-track {
        background: rgba(0, 0, 0, 0.05);
        border-radius: 4px;
      }

      .alra-modal-content::-webkit-scrollbar-thumb {
        background: linear-gradient(135deg, #667eea, #764ba2);
        border-radius: 4px;
      }

      .alra-summary-text {
        font-size: 15px;
        line-height: 1.8;
        color: #374151;
        margin-bottom: 24px;
      }

      .alra-key-points {
        background: rgba(249, 250, 251, 0.8);
        border-left: 3px solid #2563EB;
        border-radius: 12px;
        padding: 20px;
        margin-bottom: 24px;
      }

      .alra-key-points-title {
        font-size: 13px;
        font-weight: 700;
        color: #1F2937;
        text-transform: uppercase;
        letter-spacing: 0.05em;
        margin-bottom: 14px;
      }

      .alra-key-point {
        font-size: 14px;
        line-height: 1.7;
        color: #4B5563;
        padding: 10px 0;
        padding-left: 24px;
        position: relative;
      }

      .alra-key-point::before {
        content: "•";
        position: absolute;
        left: 8px;
        color: #2563EB;
        font-weight: bold;
        font-size: 18px;
      }

      .alra-keywords {
        display: flex;
        gap: 8px;
        flex-wrap: wrap;
      }

      .alra-keyword-tag {
        background: rgba(37, 99, 235, 0.08);
        color: #2563EB;
        padding: 8px 14px;
        border-radius: 8px;
        font-size: 12px;
        font-weight: 600;
        border: 1px solid rgba(37, 99, 235, 0.12);
        transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
      }

      .alra-keyword-tag:hover {
        background: rgba(37, 99, 235, 0.12);
        transform: translateY(-1px);
      }

      .alra-modal-footer {
        padding: 16px 24px;
        background: rgba(247, 250, 252, 0.8);
        border-top: 1px solid rgba(0, 0, 0, 0.08);
        display: flex;
        gap: 12px;
      }

      .alra-btn {
        flex: 1;
        padding: 10px 16px;
        border-radius: 8px;
        font-size: 14px;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.2s ease;
        border: none;
      }

      .alra-btn-primary {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
      }

      .alra-btn-primary:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
      }

      .alra-btn-secondary {
        background: white;
        color: #667eea;
        border: 2px solid #667eea;
      }

      .alra-btn-secondary:hover {
        background: rgba(102, 126, 234, 0.05);
      }
    `;
    document.head.appendChild(style);
  }

  private createModal(): void {
    const { summary, position = 'top-right' } = this.config;

    // Create overlay
    this.overlay = document.createElement('div');
    this.overlay.className = 'alra-modal-overlay';
    this.overlay.style.display = 'none';
    this.overlay.onclick = (e) => {
      if (e.target === this.overlay) {
        this.hide();
      }
    };

    // Create modal
    this.modal = document.createElement('div');
    this.modal.className = `alra-summary-modal ${position}`;
    this.modal.style.display = 'none'; // Hidden by default!

    // Header
    const header = document.createElement('div');
    header.className = 'alra-modal-header';
    header.innerHTML = `
      <div class="alra-modal-title">
        <span>✨</span>
        <span>AI Summary</span>
      </div>
    `;

    const closeBtn = document.createElement('button');
    closeBtn.className = 'alra-modal-close';
    closeBtn.innerHTML = '×';
    closeBtn.setAttribute('type', 'button');
    closeBtn.setAttribute('aria-label', 'Close modal');
    
    // Multiple ways to close - ensure it works!
    closeBtn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      this.hide();
    });
    closeBtn.onclick = (e) => {
      e?.preventDefault();
      e?.stopPropagation();
      this.hide();
    };
    
    header.appendChild(closeBtn);

    // Stats
    const stats = document.createElement('div');
    stats.className = 'alra-modal-stats';
    const compressionPercent = Math.round((1 - summary.compressionRatio) * 100);
    const timeSaved = summary.readingTime.original - summary.readingTime.summary;
    stats.innerHTML = `
      <div class="alra-stat">
        <div class="alra-stat-label">Compression</div>
        <div class="alra-stat-value">${compressionPercent}%</div>
      </div>
      <div class="alra-stat">
        <div class="alra-stat-label">Time Saved</div>
        <div class="alra-stat-value">${timeSaved}m</div>
      </div>
      <div class="alra-stat">
        <div class="alra-stat-label">Confidence</div>
        <div class="alra-stat-value">${Math.round(summary.confidence * 100)}%</div>
      </div>
    `;

    // Content
    const content = document.createElement('div');
    content.className = 'alra-modal-content';

    const summaryText = document.createElement('div');
    summaryText.className = 'alra-summary-text';
    summaryText.textContent = summary.summaryText;

    if (summary.keyPoints && summary.keyPoints.length > 0) {
      const keyPointsSection = document.createElement('div');
      keyPointsSection.className = 'alra-key-points';
      keyPointsSection.innerHTML = `
        <div class="alra-key-points-title">Key Points</div>
        ${summary.keyPoints.map(point => `
          <div class="alra-key-point">${point}</div>
        `).join('')}
      `;
      content.appendChild(keyPointsSection);
    }

    content.appendChild(summaryText);

    if (summary.keywords && summary.keywords.length > 0) {
      const keywordsContainer = document.createElement('div');
      keywordsContainer.className = 'alra-keywords';
      summary.keywords.forEach(keyword => {
        const tag = document.createElement('span');
        tag.className = 'alra-keyword-tag';
        tag.textContent = keyword;
        keywordsContainer.appendChild(tag);
      });
      content.appendChild(keywordsContainer);
    }

    // Footer
    const footer = document.createElement('div');
    footer.className = 'alra-modal-footer';
    footer.innerHTML = `
      <button class="alra-btn alra-btn-primary" id="alra-read-full">Read Full Article</button>
      <button class="alra-btn alra-btn-secondary" id="alra-share-summary">Share Summary</button>
    `;

    // Assemble modal
    this.modal.appendChild(header);
    this.modal.appendChild(stats);
    this.modal.appendChild(content);
    this.modal.appendChild(footer);

    // Add event listeners
    footer.querySelector('#alra-read-full')?.addEventListener('click', () => {
      this.hide();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    footer.querySelector('#alra-share-summary')?.addEventListener('click', () => {
      this.shareSummary();
    });

    // Append to body
    if (position === 'center') {
      this.overlay.appendChild(this.modal);
      document.body.appendChild(this.overlay);
    } else {
      document.body.appendChild(this.modal);
    }
  }

  public show(): void {
    if (this.isVisible) return;
    
    if (this.config.position === 'center' && this.overlay) {
      this.overlay.style.display = 'flex';
    }
    
    if (this.modal) {
      this.modal.style.display = 'block';
      // Force reflow for animation
      this.modal.offsetHeight;
    }
    
    this.isVisible = true;
    console.log('✨ ALRA: Summary modal shown');
  }

  public hide(): void {
    if (!this.isVisible) return;
    
    // Hide overlay if it exists (center position)
    if (this.overlay) {
      this.overlay.style.display = 'none';
    }
    
    // Always hide the modal
    if (this.modal) {
      this.modal.style.display = 'none';
    }
    
    this.isVisible = false;
    console.log('👋 ALRA: Summary modal hidden');
  }

  public toggle(): void {
    if (this.isVisible) {
      this.hide();
    } else {
      this.show();
    }
  }

  public destroy(): void {
    if (this.overlay) {
      this.overlay.remove();
    }
    if (this.modal) {
      this.modal.remove();
    }
    this.isVisible = false;
  }

  private async shareSummary(): Promise<void> {
    const text = `📝 Summary: ${this.config.summary.summaryText}\n\nGenerated by ALRA AI Browser Assistant`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Article Summary',
          text: text,
        });
        console.log('✅ ALRA: Summary shared');
      } catch (error) {
        this.copyToClipboard(text);
      }
    } else {
      this.copyToClipboard(text);
    }
  }

  private copyToClipboard(text: string): void {
    navigator.clipboard.writeText(text).then(() => {
      // Show toast notification
      this.showToast('✅ Summary copied to clipboard!');
    }).catch(() => {
      console.log('⚠️ ALRA: Could not copy summary');
    });
  }

  private showToast(message: string): void {
    const toast = document.createElement('div');
    toast.style.cssText = `
      position: fixed;
      bottom: 20px;
      right: 20px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 12px 20px;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
      z-index: 10000000;
      animation: alraFadeIn 0.3s ease-out;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      font-size: 14px;
      font-weight: 600;
    `;
    toast.textContent = message;
    document.body.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(20px)';
      toast.style.transition = 'all 0.3s ease-out';
      setTimeout(() => toast.remove(), 300);
    }, 2000);
  }
}

// Create floating badge trigger button
export function createSummaryBadge(onClick: () => void): HTMLElement {
  const badge = document.createElement('button');
  badge.className = 'alra-summary-badge';
  badge.innerHTML = '✨ View Summary';
  
  const badgeStyle = document.createElement('style');
  badgeStyle.textContent = `
    .alra-summary-badge {
      position: fixed;
      top: 80px;
      right: 20px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      border: none;
      padding: 12px 20px;
      border-radius: 24px;
      font-size: 14px;
      font-weight: 700;
      cursor: pointer;
      box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
      z-index: 999997;
      transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
      animation: alraSlideIn 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    }

    .alra-summary-badge:hover {
      transform: translateY(-2px) scale(1.05);
      box-shadow: 0 6px 20px rgba(102, 126, 234, 0.5);
    }

    .alra-summary-badge:active {
      transform: translateY(0) scale(0.98);
    }
  `;
  document.head.appendChild(badgeStyle);
  
  badge.onclick = onClick;
  return badge;
}

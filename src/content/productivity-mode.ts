/**
 * ALRA Productivity Mode
 * 
 * Blocks unrelated tabs/pages with "Be Productive" screen
 * User can only access tabs related to their current focus topic
 */

export class ProductivityMode {
  private enabled: boolean = false;
  private focusTopic: string = '';
  private focusKeywords: string[] = [];
  private blockedOverlay: HTMLElement | null = null;

  constructor() {
    this.initializeMode();
  }

  private async initializeMode(): Promise<void> {
    // Check if productivity mode is enabled
    const result = await chrome.storage.local.get('productivityMode');
    if (result.productivityMode) {
      this.enabled = result.productivityMode.enabled || false;
      this.focusTopic = result.productivityMode.topic || '';
      this.focusKeywords = result.productivityMode.keywords || [];

      if (this.enabled) {
        this.checkAndBlock();
      }
    }
  }

  async enable(): Promise<void> {
    // Analyze current page to determine focus topic
    await this.setFocusTopic();
    
    this.enabled = true;
    await chrome.storage.local.set({
      productivityMode: {
        enabled: true,
        topic: this.focusTopic,
        keywords: this.focusKeywords,
        startTime: Date.now()
      }
    });

    this.showToast(`🎯 Productivity Mode ON: Focus on "${this.focusTopic}"`);
    console.log('🎯 ALRA: Productivity mode enabled. Focus:', this.focusTopic);
  }

  async disable(): Promise<void> {
    this.enabled = false;
    await chrome.storage.local.set({
      productivityMode: {
        enabled: false
      }
    });

    // Remove block screen if visible
    if (this.blockedOverlay) {
      this.blockedOverlay.remove();
      this.blockedOverlay = null;
    }

    this.showToast('✅ Productivity Mode OFF');
    console.log('✅ ALRA: Productivity mode disabled');
  }

  private async setFocusTopic(): Promise<void> {
    const currentUrl = window.location.href;
    const currentTitle = document.title;

    // Extract topic from current page
    if (currentUrl.includes('github.com')) {
      // GitHub repo - extract repo name and topic
      const repoMatch = currentUrl.match(/github\.com\/([^\/]+)\/([^\/]+)/);
      if (repoMatch) {
        this.focusTopic = `${repoMatch[2]} development`;
        this.focusKeywords = [
          repoMatch[1], // username
          repoMatch[2], // repo name
          'github',
          'code',
          'programming',
          'development'
        ];
      }
    } else if (currentUrl.includes('stackoverflow.com') || currentUrl.includes('stackexchange.com')) {
      this.focusTopic = 'Programming & Development';
      this.focusKeywords = ['code', 'programming', 'development', 'stackoverflow', 'github', 'docs', 'documentation'];
    } else if (currentUrl.includes('wikipedia.org')) {
      // Wikipedia - extract article title
      const titleMatch = currentTitle.match(/^(.+?)\s*[-–—]\s*Wikipedia/);
      if (titleMatch) {
        this.focusTopic = titleMatch[1];
        this.focusKeywords = titleMatch[1].toLowerCase().split(' ');
      }
    } else if (currentUrl.includes('youtube.com/watch')) {
      // YouTube video - extract video title
      this.focusTopic = currentTitle.replace(' - YouTube', '');
      this.focusKeywords = currentTitle.toLowerCase().split(' ').filter(w => w.length > 3);
    } else {
      // Generic - use page title
      this.focusTopic = currentTitle;
      this.focusKeywords = currentTitle.toLowerCase().split(' ').filter(w => w.length > 3).slice(0, 5);
    }

    // Add domain as a keyword
    const domain = new URL(currentUrl).hostname.replace('www.', '');
    this.focusKeywords.push(domain);
  }

  private checkAndBlock(): void {
    const currentUrl = window.location.href;
    const currentTitle = document.title.toLowerCase();

    // Check if current page is related to focus topic
    const isRelated = this.isPageRelated(currentUrl, currentTitle);

    if (!isRelated) {
      this.showBlockScreen();
    } else {
      // Page is related, don't block
      if (this.blockedOverlay) {
        this.blockedOverlay.remove();
        this.blockedOverlay = null;
      }
    }
  }

  private isPageRelated(url: string, title: string): boolean {
    const urlLower = url.toLowerCase();
    const titleLower = title.toLowerCase();

    // Always allow certain utility pages
    if (
      urlLower.includes('chrome://') ||
      urlLower.includes('chrome-extension://') ||
      urlLower === 'about:blank'
    ) {
      return true;
    }

    // Check if any focus keyword appears in URL or title
    for (const keyword of this.focusKeywords) {
      if (
        urlLower.includes(keyword.toLowerCase()) ||
        titleLower.includes(keyword.toLowerCase())
      ) {
        return true;
      }
    }

    // Domain matching - if same domain as focus topic, allow it
    const currentDomain = new URL(url).hostname.replace('www.', '');
    for (const keyword of this.focusKeywords) {
      if (currentDomain.includes(keyword.toLowerCase())) {
        return true;
      }
    }

    return false;
  }

  private showBlockScreen(): void {
    // Don't create multiple overlays
    if (this.blockedOverlay && document.body.contains(this.blockedOverlay)) {
      return;
    }

    this.blockedOverlay = document.createElement('div');
    this.blockedOverlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: #000;
      z-index: 2147483647;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    `;

    this.blockedOverlay.innerHTML = `
      <div style="text-align: center; max-width: 600px; padding: 40px;">
        <div style="font-size: 120px; margin-bottom: 24px;">🎯</div>
        <div style="font-size: 48px; font-weight: 700; color: white; margin-bottom: 16px; letter-spacing: -1px;">
          BE PRODUCTIVE
        </div>
        <div style="font-size: 20px; color: rgba(255, 255, 255, 0.7); margin-bottom: 32px; line-height: 1.5;">
          This page isn't related to your current focus:<br>
          <strong style="color: white;">"${this.focusTopic}"</strong>
        </div>
        <div style="font-size: 16px; color: rgba(255, 255, 255, 0.5); margin-bottom: 40px;">
          Stay focused on what matters. Unrelated pages are blocked.
        </div>
        <button id="alra-productivity-disable" style="
          background: white;
          color: #000;
          border: none;
          padding: 16px 32px;
          border-radius: 12px;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
        ">
          Disable Productivity Mode
        </button>
      </div>
    `;

    const disableBtn = this.blockedOverlay.querySelector('#alra-productivity-disable');
    if (disableBtn) {
      disableBtn.addEventListener('mouseenter', (e) => {
        (e.target as HTMLElement).style.transform = 'scale(1.05)';
        (e.target as HTMLElement).style.boxShadow = '0 8px 24px rgba(255, 255, 255, 0.3)';
      });
      disableBtn.addEventListener('mouseleave', (e) => {
        (e.target as HTMLElement).style.transform = 'scale(1)';
        (e.target as HTMLElement).style.boxShadow = 'none';
      });
      disableBtn.addEventListener('click', () => {
        this.disable();
      });
    }

    document.body.appendChild(this.blockedOverlay);
  }

  async showSettings(): Promise<void> {
    const overlay = document.createElement('div');
    overlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.5);
      backdrop-filter: blur(4px);
      z-index: 2147483646;
      display: flex;
      align-items: center;
      justify-content: center;
      animation: fadeIn 0.2s ease-out;
    `;

    const modal = document.createElement('div');
    modal.style.cssText = `
      background: white;
      border-radius: 16px;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
      width: 90%;
      max-width: 420px;
      overflow: hidden;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    `;

    modal.innerHTML = `
      <div style="background: linear-gradient(135deg, #F59E0B 0%, #D97706 100%); color: white; padding: 24px;">
        <div style="font-size: 20px; font-weight: 700; margin-bottom: 4px;">🎯 Productivity Mode</div>
        <div style="font-size: 13px; opacity: 0.9;">Block distractions, stay focused</div>
      </div>
      
      <div style="padding: 24px;">
        <div style="margin-bottom: 20px;">
          <div style="font-size: 14px; font-weight: 600; color: #1F2937; margin-bottom: 8px;">Status</div>
          <div style="background: ${this.enabled ? '#FEF3C7' : '#F3F4F6'}; padding: 12px; border-radius: 8px; font-size: 14px; color: ${this.enabled ? '#92400E' : '#6B7280'};">
            ${this.enabled ? `🎯 Active - Focusing on "${this.focusTopic}"` : '❌ Disabled'}
          </div>
        </div>
        
        <div style="background: #FEF3C7; border-left: 3px solid #F59E0B; padding: 16px; border-radius: 8px; margin-bottom: 20px;">
          <div style="font-size: 13px; color: #92400E; line-height: 1.5;">
            <strong>How it works:</strong><br>
            • ALRA detects your current focus topic from the active page<br>
            • Any unrelated pages will be blocked with a "Be Productive" screen<br>
            • You can only access pages related to your focus topic<br>
            • Perfect for deep work sessions!
          </div>
        </div>
        
        <div style="display: flex; gap: 12px;">
          <button id="productivity-close" style="flex: 1; padding: 12px; background: #F3F4F6; border: none; border-radius: 10px; font-weight: 600; color: #6B7280; cursor: pointer;">
            Close
          </button>
          <button id="productivity-toggle" style="flex: 2; padding: 12px; background: linear-gradient(135deg, #F59E0B, #D97706); border: none; border-radius: 10px; font-weight: 600; color: white; cursor: pointer;">
            ${this.enabled ? 'Disable' : 'Enable'} Mode
          </button>
        </div>
      </div>
    `;

    overlay.onclick = (e) => {
      if (e.target === overlay) overlay.remove();
    };

    modal.querySelector('#productivity-close')!.addEventListener('click', () => overlay.remove());
    modal.querySelector('#productivity-toggle')!.addEventListener('click', async () => {
      if (this.enabled) {
        await this.disable();
      } else {
        await this.enable();
      }
      overlay.remove();
    });

    overlay.appendChild(modal);
    document.body.appendChild(overlay);
  }

  isEnabled(): boolean {
    return this.enabled;
  }

  private showToast(message: string): void {
    const toast = document.createElement('div');
    toast.style.cssText = `
      position: fixed;
      bottom: 24px;
      right: 24px;
      background: linear-gradient(135deg, #F59E0B, #D97706);
      color: white;
      padding: 14px 20px;
      border-radius: 10px;
      box-shadow: 0 4px 16px rgba(245, 158, 11, 0.4);
      z-index: 2147483647;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      font-size: 14px;
      font-weight: 600;
      animation: slideIn 0.3s ease-out;
    `;
    toast.textContent = message;
    document.body.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(20px)';
      toast.style.transition = 'all 0.3s ease-out';
      setTimeout(() => toast.remove(), 300);
    }, 4000);
  }
}

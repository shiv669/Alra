/**
 * ALRA Cross-Device Sync
 * 
 * Syncs predicted tabs and session data across devices using Chrome Storage Sync
 * When browser closes on desktop, recommended tabs are synced to mobile
 */

import { metricsTracker } from './metrics';

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

export class DeviceSync {
  private syncEnabled: boolean = false;
  private deviceType: 'desktop' | 'mobile' | 'tablet';
  private recommendedTabs: RecommendedTab[] = [];

  constructor() {
    this.deviceType = this.detectDeviceType();
    this.initializeSync();
  }

  private detectDeviceType(): 'desktop' | 'mobile' | 'tablet' {
    const ua = navigator.userAgent.toLowerCase();
    
    // Check if we're in responsive design mode (for demo purposes)
    const isResponsiveMode = window.innerWidth <= 768;
    
    if (isResponsiveMode && !ua.includes('chrome')) {
      // User manually set narrow width - treat as mobile for demo
      return 'mobile';
    }
    
    if (/mobile|android|iphone/.test(ua)) {
      return /tablet|ipad/.test(ua) ? 'tablet' : 'mobile';
    }
    return 'desktop';
  }

  private async initializeSync(): Promise<void> {
    // Check if sync is enabled
    const result = await chrome.storage.local.get('syncEnabled');
    this.syncEnabled = result.syncEnabled || false;

    // Listen for browser/tab close events
    if (this.syncEnabled && this.deviceType === 'desktop') {
      this.setupSyncOnClose();
    }

    // Don't auto-show on mobile - let Chrome handle tab sync natively
    console.log('📱 ALRA Device Sync: Initialized (device:', this.deviceType, ', enabled:', this.syncEnabled, ')');
  }

  async enableSync(): Promise<void> {
    this.syncEnabled = true;
    await chrome.storage.local.set({ syncEnabled: true });
    
    // Generate initial recommendations
    await this.generateRecommendedTabs();
    await this.syncToCloud();
    
    this.showToast('✅ Cross-device sync enabled! Your tabs will sync to Chrome when you close them.');
    
    console.log('☁️ ALRA: Sync enabled. Tabs will be saved to Chrome Sync for access on all your devices.');
  }

  async disableSync(): Promise<void> {
    this.syncEnabled = false;
    await chrome.storage.local.set({ syncEnabled: false });
    await chrome.storage.sync.remove('alra_session');
    this.showToast('❌ Cross-device sync disabled');
  }

  private setupSyncOnClose(): void {
    // Sync when tab is hidden/closed
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        this.syncToCloud();
      }
    });

    // Sync before page unload
    window.addEventListener('beforeunload', () => {
      this.syncToCloud();
    });

    // Periodic sync every 2 minutes (for safety)
    setInterval(() => {
      this.syncToCloud();
    }, 120000);
  }

  async addRecommendedTab(url: string, title: string, reason: string, confidence: number): Promise<void> {
    const tab: RecommendedTab = {
      url,
      title,
      reason,
      confidence,
      timestamp: Date.now()
    };

    this.recommendedTabs.push(tab);
    
    // Keep only top 5 recommendations
    this.recommendedTabs = this.recommendedTabs
      .sort((a, b) => b.confidence - a.confidence)
      .slice(0, 5);

    console.log('📱 ALRA: Added recommended tab:', title);
  }

  async generateRecommendedTabs(): Promise<void> {
    // Get current browsing context
    const currentUrl = window.location.href;
    const currentTitle = document.title;

    // Clear old recommendations
    this.recommendedTabs = [];

    // Try to get AI recommendations using Chrome's AI
    try {
      const recommendations = await this.getAIRecommendations(currentUrl, currentTitle);
      if (recommendations && recommendations.length > 0) {
        recommendations.forEach(rec => {
          this.addRecommendedTab(rec.url, rec.title, rec.reason, rec.confidence);
        });
        return;
      }
    } catch (error) {
      console.debug('⚠️ ALRA: AI recommendations unavailable, using heuristics');
    }

    // Fallback: Use smart heuristics
    this.generateHeuristicRecommendations(currentUrl, currentTitle);
  }

  private async getAIRecommendations(currentUrl: string, currentTitle: string): Promise<RecommendedTab[]> {
    return new Promise((resolve) => {
      const requestId = `sync-${Date.now()}`;
      
      const responseHandler = (event: Event) => {
        const customEvent = event as CustomEvent;
        if (customEvent.detail.requestId === requestId) {
          window.removeEventListener('ALRA_AI_RESPONSE', responseHandler);
          
          if (customEvent.detail.success && customEvent.detail.result) {
            const recommendations = this.parseAIRecommendations(customEvent.detail.result, currentUrl);
            resolve(recommendations);
          } else {
            resolve([]);
          }
        }
      };
      
      window.addEventListener('ALRA_AI_RESPONSE', responseHandler);
      
      window.dispatchEvent(new CustomEvent('ALRA_AI_REQUEST', {
        detail: {
          action: 'WRITE',
          data: {
            prompt: `Based on this webpage "${currentTitle}" at ${currentUrl}, suggest 3 related pages or topics the user might want to explore next. 

Format each as:
[URL or search term] | [Title/Topic] | [Brief reason]

Examples:
https://example.com/related | Related Article Title | Continues the topic
"machine learning basics" | Search: ML Fundamentals | Good starting point
https://github.com/example | GitHub Repository | Practical implementation`,
            tone: 'professional',
            length: 'short'
          },
          requestId
        }
      }));
      
      setTimeout(() => {
        window.removeEventListener('ALRA_AI_RESPONSE', responseHandler);
        resolve([]);
      }, 5000);
    });
  }

  private parseAIRecommendations(aiResponse: string, baseUrl: string): RecommendedTab[] {
    const lines = aiResponse.split('\n').filter(line => line.trim());
    const recommendations: RecommendedTab[] = [];

    for (const line of lines) {
      const parts = line.split('|').map(p => p.trim());
      if (parts.length >= 3) {
        const urlPart = parts[0].replace(/^["']|["']$/g, '');
        const title = parts[1].replace(/^["']|["']$/g, '');
        const reason = parts[2].replace(/^["']|["']$/g, '');

        // Determine if it's a URL or search term
        let finalUrl = urlPart;
        if (!urlPart.startsWith('http')) {
          // It's a search term
          finalUrl = `https://www.google.com/search?q=${encodeURIComponent(urlPart)}`;
        }

        recommendations.push({
          url: finalUrl,
          title: title,
          reason: reason,
          confidence: 0.85,
          timestamp: Date.now()
        });

        if (recommendations.length >= 3) break;
      }
    }

    return recommendations;
  }

  private generateHeuristicRecommendations(currentUrl: string, currentTitle: string): void {
    // Smart heuristics based on site type
    if (currentUrl.includes('github.com')) {
      this.addRecommendedTab(
        'https://github.com/trending',
        'GitHub Trending',
        'Discover popular projects',
        0.8
      );
      
      // Extract repo name and suggest related
      const repoMatch = currentUrl.match(/github\.com\/([^\/]+\/[^\/]+)/);
      if (repoMatch) {
        this.addRecommendedTab(
          `${currentUrl}/issues`,
          'Repository Issues',
          'Check issues and discussions',
          0.75
        );
      }
    } else if (currentUrl.includes('wikipedia.org')) {
      this.addRecommendedTab(
        'https://en.wikipedia.org/wiki/Special:Random',
        'Random Wikipedia Article',
        'Discover something new',
        0.7
      );
    } else if (currentUrl.includes('youtube.com/watch')) {
      this.addRecommendedTab(
        'https://www.youtube.com',
        'YouTube Home',
        'Recommended videos',
        0.8
      );
    } else if (currentUrl.includes('reddit.com')) {
      this.addRecommendedTab(
        'https://www.reddit.com/r/popular',
        'Popular on Reddit',
        'Trending discussions',
        0.75
      );
    } else {
      // Generic recommendations
      const domain = new URL(currentUrl).hostname;
      this.addRecommendedTab(
        `https://www.google.com/search?q=${encodeURIComponent(currentTitle)}`,
        `Search: ${currentTitle}`,
        'Find related content',
        0.7
      );
      
      this.addRecommendedTab(
        `https://${domain}`,
        'Homepage',
        'Explore more from this site',
        0.6
      );
    }
  }

  private async syncToCloud(): Promise<void> {
    if (!this.syncEnabled) return;

    // Generate recommendations if we don't have any
    if (this.recommendedTabs.length === 0) {
      await this.generateRecommendedTabs();
    }

    const metrics = await metricsTracker.getMetrics();
    
    const session: SyncSession = {
      deviceType: this.deviceType,
      recommendedTabs: this.recommendedTabs,
      currentPage: {
        url: window.location.href,
        title: document.title,
        scrollPosition: window.scrollY
      },
      metrics,
      lastSync: Date.now(),
      sessionId: `session-${Date.now()}`
    };

    try {
      // Save to Chrome Storage Sync (accessible on all devices)
      await chrome.storage.sync.set({ alra_session: session });
      
      // Also send message to background script to open tabs in Chrome
      // This makes them appear in Chrome's "Recent Tabs" natively
      chrome.runtime.sendMessage({
        action: 'SYNC_TABS',
        tabs: this.recommendedTabs.map(tab => ({
          url: tab.url,
          title: `[ALRA Recommended] ${tab.title}`
        }))
      });
      
      console.log('☁️ ALRA: Session synced to Chrome Storage:', session.recommendedTabs.length, 'tabs');
      console.log('📱 ALRA: Tabs will appear in Chrome\'s "Recent Tabs" on all your devices!');
    } catch (error) {
      console.error('❌ ALRA: Sync failed:', error);
    }
  }

  private async checkForSyncedTabs(): Promise<void> {
    try {
      const result = await chrome.storage.sync.get('alra_session');
      
      if (result.alra_session) {
        const session: SyncSession = result.alra_session;
        
        // Only show if synced from desktop and it's recent (within 24 hours)
        const hoursSinceSync = (Date.now() - session.lastSync) / (1000 * 60 * 60);
        
        if (session.deviceType === 'desktop' && hoursSinceSync < 24) {
          this.showRecommendedTabsModal(session);
        }
      }
    } catch (error) {
      console.error('❌ ALRA: Error checking synced tabs:', error);
    }
  }

  private showRecommendedTabsModal(session: SyncSession): void {
    // Create modal overlay
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
      animation: fadeIn 0.3s ease-out;
    `;

    const modal = document.createElement('div');
    modal.style.cssText = `
      background: white;
      border-radius: 20px;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
      width: 90%;
      max-width: 480px;
      max-height: 80vh;
      overflow: hidden;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      animation: slideUp 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    `;

    // Header
    const header = document.createElement('div');
    header.style.cssText = `
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 24px;
      text-align: center;
    `;
    header.innerHTML = `
      <div style="font-size: 48px; margin-bottom: 12px;">📱→💻</div>
      <div style="font-size: 22px; font-weight: 700; margin-bottom: 8px;">Welcome Back!</div>
      <div style="font-size: 14px; opacity: 0.9;">Synced from your ${session.deviceType} • ${this.timeAgo(session.lastSync)}</div>
    `;

    // Content
    const content = document.createElement('div');
    content.style.cssText = `
      padding: 24px;
      max-height: 400px;
      overflow-y: auto;
    `;

    // Recommended tabs title
    const tabsTitle = document.createElement('div');
    tabsTitle.style.cssText = `
      font-size: 16px;
      font-weight: 700;
      color: #1F2937;
      margin-bottom: 16px;
    `;
    tabsTitle.textContent = `📌 Recommended Tabs (${session.recommendedTabs.length})`;
    content.appendChild(tabsTitle);

    // Tab list
    session.recommendedTabs.forEach((tab, index) => {
      const tabCard = document.createElement('div');
      tabCard.style.cssText = `
        background: #F9FAFB;
        border: 1.5px solid #E5E7EB;
        border-radius: 12px;
        padding: 16px;
        margin-bottom: 12px;
        cursor: pointer;
        transition: all 0.2s;
        animation: slideInCard 0.3s ease-out ${index * 0.1}s both;
      `;
      
      tabCard.onmouseover = () => {
        tabCard.style.borderColor = '#667eea';
        tabCard.style.boxShadow = '0 4px 12px rgba(102, 126, 234, 0.2)';
        tabCard.style.transform = 'translateY(-2px)';
      };
      tabCard.onmouseout = () => {
        tabCard.style.borderColor = '#E5E7EB';
        tabCard.style.boxShadow = 'none';
        tabCard.style.transform = 'translateY(0)';
      };

      tabCard.innerHTML = `
        <div style="font-size: 15px; font-weight: 600; color: #1F2937; margin-bottom: 6px;">${tab.title}</div>
        <div style="font-size: 13px; color: #6B7280; margin-bottom: 8px;">${tab.reason}</div>
        <div style="display: flex; align-items: center; gap: 8px;">
          <div style="font-size: 11px; color: #667eea; font-weight: 600;">AI CONFIDENCE: ${Math.round(tab.confidence * 100)}%</div>
          <div style="flex: 1; height: 4px; background: #E5E7EB; border-radius: 2px; overflow: hidden;">
            <div style="height: 100%; width: ${tab.confidence * 100}%; background: linear-gradient(90deg, #667eea, #764ba2); transition: width 1s ease-out;"></div>
          </div>
        </div>
      `;

      tabCard.onclick = () => {
        window.open(tab.url, '_blank');
        overlay.remove();
      };

      content.appendChild(tabCard);
    });

    modal.appendChild(header);
    modal.appendChild(content);

    // Footer buttons
    const footer = document.createElement('div');
    footer.style.cssText = `
      padding: 20px 24px;
      border-top: 1px solid #E5E7EB;
      display: flex;
      gap: 12px;
    `;

    const dismissBtn = document.createElement('button');
    dismissBtn.textContent = 'Maybe Later';
    dismissBtn.style.cssText = `
      flex: 1;
      padding: 12px;
      background: #F3F4F6;
      border: none;
      border-radius: 10px;
      font-weight: 600;
      color: #6B7280;
      cursor: pointer;
      transition: all 0.2s;
    `;
    dismissBtn.onmouseover = () => dismissBtn.style.background = '#E5E7EB';
    dismissBtn.onmouseout = () => dismissBtn.style.background = '#F3F4F6';
    dismissBtn.onclick = () => overlay.remove();

    const openAllBtn = document.createElement('button');
    openAllBtn.textContent = `Open All ${session.recommendedTabs.length} Tabs`;
    openAllBtn.style.cssText = `
      flex: 2;
      padding: 12px;
      background: linear-gradient(135deg, #667eea, #764ba2);
      border: none;
      border-radius: 10px;
      font-weight: 600;
      color: white;
      cursor: pointer;
      transition: all 0.2s;
    `;
    openAllBtn.onmouseover = () => {
      openAllBtn.style.transform = 'translateY(-2px)';
      openAllBtn.style.boxShadow = '0 4px 12px rgba(102, 126, 234, 0.4)';
    };
    openAllBtn.onmouseout = () => {
      openAllBtn.style.transform = 'translateY(0)';
      openAllBtn.style.boxShadow = 'none';
    };
    openAllBtn.onclick = () => {
      session.recommendedTabs.forEach(tab => {
        window.open(tab.url, '_blank');
      });
      overlay.remove();
      this.showToast(`✅ Opened ${session.recommendedTabs.length} recommended tabs!`);
    };

    footer.appendChild(dismissBtn);
    footer.appendChild(openAllBtn);
    modal.appendChild(footer);

    overlay.appendChild(modal);

    // Add animations
    const style = document.createElement('style');
    style.textContent = `
      @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
      }
      @keyframes slideUp {
        from {
          opacity: 0;
          transform: translate(-50%, -45%);
        }
        to {
          opacity: 1;
          transform: translate(-50%, -50%);
        }
      }
      @keyframes slideInCard {
        from {
          opacity: 0;
          transform: translateX(-20px);
        }
        to {
          opacity: 1;
          transform: translateX(0);
        }
      }
    `;
    document.head.appendChild(style);

    document.body.appendChild(overlay);

    // Close on escape
    const escapeHandler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        overlay.remove();
        document.removeEventListener('keydown', escapeHandler);
      }
    };
    document.addEventListener('keydown', escapeHandler);
  }

  async showSyncSettings(): Promise<void> {
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
      <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 24px;">
        <div style="font-size: 20px; font-weight: 700; margin-bottom: 4px;">🔄 Cross-Device Sync</div>
        <div style="font-size: 13px; opacity: 0.9;">Sync tabs across your devices</div>
      </div>
      
      <div style="padding: 24px;">
        <div style="margin-bottom: 20px;">
          <div style="font-size: 14px; font-weight: 600; color: #1F2937; margin-bottom: 8px;">Current Device</div>
          <div style="background: #F3F4F6; padding: 12px; border-radius: 8px; font-size: 14px; color: #6B7280;">
            📱 ${this.deviceType.charAt(0).toUpperCase() + this.deviceType.slice(1)}
          </div>
        </div>
        
        <div style="margin-bottom: 20px;">
          <div style="font-size: 14px; font-weight: 600; color: #1F2937; margin-bottom: 8px;">Sync Status</div>
          <div style="background: ${this.syncEnabled ? '#ECFDF5' : '#FEF2F2'}; padding: 12px; border-radius: 8px; font-size: 14px; color: ${this.syncEnabled ? '#065F46' : '#991B1B'};">
            ${this.syncEnabled ? '✅ Enabled' : '❌ Disabled'}
          </div>
        </div>
        
        <div style="background: #EFF6FF; border-left: 3px solid #3B82F6; padding: 16px; border-radius: 8px; margin-bottom: 16px;">
          <div style="font-size: 13px; color: #1E40AF; line-height: 1.5;">
            <strong>How it works:</strong><br>
            • When you close tabs, ALRA saves recommended next tabs to Chrome Sync<br>
            • Open Chrome on ANY device (desktop, mobile, tablet)<br>
            • Access synced tabs from Chrome's native "Recent Tabs" menu<br>
            • No extension needed on other devices - uses Chrome's built-in sync!
          </div>
        </div>
        
        ${this.syncEnabled ? `
        <div style="background: #ECFDF5; border-left: 3px solid #10B981; padding: 16px; border-radius: 8px; margin-bottom: 20px;">
          <div style="font-size: 13px; color: #065F46; line-height: 1.5;">
            <strong>✅ Sync is Active!</strong><br><br>
            <strong>To verify on other devices:</strong><br>
            1. Open Chrome on another device (phone/tablet)<br>
            2. Tap the ⋮ menu (three dots)<br>
            3. Select "Recent tabs"<br>
            4. Look for tabs prefixed with "[ALRA Recommended]"<br><br>
            <em>Synced ${this.recommendedTabs.length} recommended tabs</em>
          </div>
        </div>
        ` : ''}
        
        <div style="display: flex; gap: 12px;">
          <button id="sync-close" style="flex: 1; padding: 12px; background: #F3F4F6; border: none; border-radius: 10px; font-weight: 600; color: #6B7280; cursor: pointer;">
            Close
          </button>
          <button id="sync-toggle" style="flex: 2; padding: 12px; background: linear-gradient(135deg, #667eea, #764ba2); border: none; border-radius: 10px; font-weight: 600; color: white; cursor: pointer;">
            ${this.syncEnabled ? 'Disable' : 'Enable'} Sync
          </button>
        </div>
      </div>
    `;

    overlay.onclick = (e) => {
      if (e.target === overlay) overlay.remove();
    };

    modal.querySelector('#sync-close')!.addEventListener('click', () => overlay.remove());
    modal.querySelector('#sync-toggle')!.addEventListener('click', async () => {
      if (this.syncEnabled) {
        await this.disableSync();
      } else {
        await this.enableSync();
      }
      overlay.remove();
    });

    overlay.appendChild(modal);
    document.body.appendChild(overlay);
  }

  private timeAgo(timestamp: number): string {
    const seconds = Math.floor((Date.now() - timestamp) / 1000);
    
    if (seconds < 60) return 'just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    return `${Math.floor(seconds / 86400)}d ago`;
  }

  private showToast(message: string): void {
    const toast = document.createElement('div');
    toast.style.cssText = `
      position: fixed;
      bottom: 24px;
      right: 24px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 14px 20px;
      border-radius: 10px;
      box-shadow: 0 4px 16px rgba(102, 126, 234, 0.4);
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
    }, 3000);
  }
}

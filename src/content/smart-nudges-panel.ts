/**
 * ALRA Smart Nudges Panel
 * 
 * Beautiful panel showing AI-generated smart suggestions
 * Uses Chrome's built-in AI (Gemini Nano) for context-aware recommendations
 */

export interface SmartSuggestion {
  id: string;
  text: string;
  emoji: string;
  category: 'productivity' | 'learning' | 'wellness' | 'navigation';
  actionText: string;
  action?: () => void;
  confidence: number;
}

export class SmartNudgesPanel {
  private overlay: HTMLDivElement | null = null;
  private panel: HTMLDivElement | null = null;
  private isGenerating: boolean = false;

  constructor() {
    this.createPanel();
  }

  private createPanel(): void {
    // Overlay
    this.overlay = document.createElement('div');
    this.overlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.5);
      backdrop-filter: blur(4px);
      z-index: 2147483646;
      display: none;
      animation: fadeIn 0.2s ease-out;
    `;

    // Panel container
    this.panel = document.createElement('div');
    this.panel.style.cssText = `
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: white;
      border-radius: 16px;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
      width: 90%;
      max-width: 500px;
      max-height: 80vh;
      overflow: hidden;
      z-index: 2147483647;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      animation: slideUp 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    `;

    // Header
    const header = document.createElement('div');
    header.style.cssText = `
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 20px 24px;
      display: flex;
      align-items: center;
      justify-content: space-between;
    `;

    const headerTitle = document.createElement('div');
    headerTitle.innerHTML = `
      <div style="font-size: 20px; font-weight: 700; margin-bottom: 4px;">💡 Smart Suggestions</div>
      <div style="font-size: 13px; opacity: 0.9;">AI-powered recommendations based on this page</div>
    `;

    const closeBtn = document.createElement('button');
    closeBtn.textContent = '×';
    closeBtn.style.cssText = `
      background: rgba(255, 255, 255, 0.2);
      border: none;
      color: white;
      font-size: 28px;
      width: 32px;
      height: 32px;
      border-radius: 8px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.2s;
      padding: 0;
      line-height: 1;
    `;
    closeBtn.onmouseover = () => closeBtn.style.background = 'rgba(255, 255, 255, 0.3)';
    closeBtn.onmouseout = () => closeBtn.style.background = 'rgba(255, 255, 255, 0.2)';
    closeBtn.onclick = () => this.hide();

    header.appendChild(headerTitle);
    header.appendChild(closeBtn);

    // Content area
    const content = document.createElement('div');
    content.id = 'alra-nudges-content';
    content.style.cssText = `
      padding: 24px;
      max-height: calc(80vh - 100px);
      overflow-y: auto;
    `;

    this.panel.appendChild(header);
    this.panel.appendChild(content);

    // Click overlay to close
    this.overlay.onclick = () => this.hide();

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
    `;
    document.head.appendChild(style);

    document.body.appendChild(this.overlay);
    document.body.appendChild(this.panel);
  }

  async show(): Promise<void> {
    if (!this.overlay || !this.panel) return;

    this.overlay.style.display = 'block';
    this.panel.style.display = 'block';

    // Generate suggestions
    await this.generateSmartSuggestions();
  }

  hide(): void {
    if (!this.overlay || !this.panel) return;

    this.overlay.style.display = 'none';
    this.panel.style.display = 'none';
  }

  private async generateSmartSuggestions(): Promise<void> {
    const content = document.getElementById('alra-nudges-content');
    if (!content || this.isGenerating) return;

    this.isGenerating = true;

    // Show loading state
    content.innerHTML = `
      <div style="text-align: center; padding: 40px 20px; color: #6B7280;">
        <div style="font-size: 48px; margin-bottom: 16px;">🤖</div>
        <div style="font-size: 16px; font-weight: 600; margin-bottom: 8px;">Analyzing this page...</div>
        <div style="font-size: 14px;">Gemini Nano is generating smart suggestions</div>
        <div style="margin-top: 20px;">
          <div style="width: 40px; height: 40px; border: 3px solid #E5E7EB; border-top-color: #667eea; border-radius: 50%; animation: spin 1s linear infinite; margin: 0 auto;"></div>
        </div>
      </div>
    `;

    // Add spinner animation
    const spinnerStyle = document.createElement('style');
    spinnerStyle.textContent = `
      @keyframes spin {
        to { transform: rotate(360deg); }
      }
    `;
    document.head.appendChild(spinnerStyle);

    try {
      // Get page context
      const pageContext = this.getPageContext();
      
      // Try Chrome's AI API
      const suggestions = await this.generateWithChromeAI(pageContext);
      
      if (suggestions.length > 0) {
        this.renderSuggestions(suggestions);
      } else {
        // Fallback to smart heuristics
        this.renderFallbackSuggestions(pageContext);
      }
    } catch (error) {
      console.error('❌ ALRA: Error generating suggestions:', error);
      this.renderError();
    } finally {
      this.isGenerating = false;
    }
  }

  private getPageContext(): string {
    const title = document.title;
    const url = window.location.href;
    
    // Get main content
    const content = Array.from(document.querySelectorAll('p, h1, h2, h3'))
      .map(el => el.textContent?.trim())
      .filter(text => text && text.length > 20)
      .slice(0, 10)
      .join(' ');

    return `Page: ${title}\nURL: ${url}\nContent: ${content.substring(0, 1000)}`;
  }

  private async generateWithChromeAI(pageContext: string): Promise<SmartSuggestion[]> {
    return new Promise((resolve) => {
      const requestId = `nudge-${Date.now()}`;
      
      const responseHandler = (event: Event) => {
        const customEvent = event as CustomEvent;
        if (customEvent.detail.requestId === requestId) {
          window.removeEventListener('ALRA_AI_RESPONSE', responseHandler);
          
          if (customEvent.detail.success && customEvent.detail.result) {
            const aiResponse = customEvent.detail.result;
            const suggestions = this.parseAISuggestions(aiResponse);
            resolve(suggestions);
          } else {
            resolve([]);
          }
        }
      };
      
      window.addEventListener('ALRA_AI_RESPONSE', responseHandler);
      
      // Request AI suggestions
      window.dispatchEvent(new CustomEvent('ALRA_AI_REQUEST', {
        detail: {
          action: 'WRITE',
          data: {
            prompt: `Based on this webpage content, suggest 4 specific, actionable next steps the user could take. Make them practical and relevant to the content.

${pageContext}

Format each suggestion as:
[emoji] [short action text (max 6 words)]

Examples:
📚 Read related research papers
💾 Save this for later reference
🔗 Share with your team
📝 Take notes on key points`,
            tone: 'casual',
            length: 'short'
          },
          requestId
        }
      }));
      
      // Timeout after 8 seconds
      setTimeout(() => {
        window.removeEventListener('ALRA_AI_RESPONSE', responseHandler);
        resolve([]);
      }, 8000);
    });
  }

  private parseAISuggestions(aiResponse: string): SmartSuggestion[] {
    const lines = aiResponse.split('\n').filter(line => line.trim());
    const suggestions: SmartSuggestion[] = [];

    for (let i = 0; i < Math.min(lines.length, 4); i++) {
      const line = lines[i].trim();
      const emojiMatch = line.match(/^([^\w\s]+)\s+(.+)$/);
      
      if (emojiMatch) {
        const emoji = emojiMatch[1].trim();
        const text = emojiMatch[2].trim();
        
        suggestions.push({
          id: `ai-nudge-${i}`,
          text,
          emoji,
          category: this.categorizeNudge(text),
          actionText: 'Do it',
          confidence: 0.9
        });
      } else if (line.length > 5) {
        // No emoji found, use default
        suggestions.push({
          id: `ai-nudge-${i}`,
          text: line,
          emoji: '💡',
          category: 'productivity',
          actionText: 'Do it',
          confidence: 0.8
        });
      }
    }

    return suggestions;
  }

  private categorizeNudge(text: string): SmartSuggestion['category'] {
    const lower = text.toLowerCase();
    if (lower.includes('read') || lower.includes('learn') || lower.includes('study')) return 'learning';
    if (lower.includes('break') || lower.includes('rest') || lower.includes('wellness')) return 'wellness';
    if (lower.includes('navigate') || lower.includes('go to') || lower.includes('open')) return 'navigation';
    return 'productivity';
  }

  private renderSuggestions(suggestions: SmartSuggestion[]): void {
    const content = document.getElementById('alra-nudges-content');
    if (!content) return;

    content.innerHTML = `
      <div style="margin-bottom: 20px;">
        <div style="display: inline-flex; align-items: center; gap: 8px; background: linear-gradient(135deg, #667eea20, #764ba220); padding: 8px 16px; border-radius: 20px; font-size: 13px; color: #667eea; font-weight: 600;">
          <span>🤖</span>
          <span>Generated by Gemini Nano</span>
        </div>
      </div>
    `;

    suggestions.forEach((suggestion, index) => {
      const card = this.createSuggestionCard(suggestion, index);
      content.appendChild(card);
    });

    // Add footer
    const footer = document.createElement('div');
    footer.style.cssText = `
      margin-top: 24px;
      padding-top: 20px;
      border-top: 1px solid #E5E7EB;
      text-align: center;
      color: #9CA3AF;
      font-size: 13px;
    `;
    footer.textContent = `✨ These suggestions are personalized based on your current page`;
    content.appendChild(footer);
  }

  private createSuggestionCard(suggestion: SmartSuggestion, index: number): HTMLDivElement {
    const card = document.createElement('div');
    card.style.cssText = `
      background: white;
      border: 1.5px solid #E5E7EB;
      border-radius: 12px;
      padding: 16px 18px;
      margin-bottom: 12px;
      display: flex;
      align-items: center;
      gap: 14px;
      transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
      cursor: pointer;
      animation: slideInCard 0.3s ease-out ${index * 0.1}s both;
    `;

    // Add card animation
    const cardStyle = document.createElement('style');
    cardStyle.textContent = `
      @keyframes slideInCard {
        from {
          opacity: 0;
          transform: translateY(10px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }
    `;
    document.head.appendChild(cardStyle);

    // Category colors
    const categoryColors: Record<SmartSuggestion['category'], string> = {
      productivity: '#667eea',
      learning: '#10B981',
      wellness: '#F59E0B',
      navigation: '#6366F1'
    };

    const color = categoryColors[suggestion.category];

    // Emoji icon
    const icon = document.createElement('div');
    icon.style.cssText = `
      font-size: 28px;
      flex-shrink: 0;
      width: 48px;
      height: 48px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: ${color}15;
      border-radius: 10px;
    `;
    icon.textContent = suggestion.emoji;

    // Text content
    const textContainer = document.createElement('div');
    textContainer.style.cssText = 'flex: 1;';

    const text = document.createElement('div');
    text.style.cssText = `
      font-size: 15px;
      font-weight: 600;
      color: #1F2937;
      margin-bottom: 4px;
    `;
    text.textContent = suggestion.text;

    const category = document.createElement('div');
    category.style.cssText = `
      font-size: 12px;
      color: ${color};
      text-transform: capitalize;
      font-weight: 600;
    `;
    category.textContent = suggestion.category;

    textContainer.appendChild(text);
    textContainer.appendChild(category);

    // Action button
    const actionBtn = document.createElement('button');
    actionBtn.style.cssText = `
      background: ${color};
      color: white;
      border: none;
      border-radius: 8px;
      padding: 10px 20px;
      font-size: 14px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s;
      flex-shrink: 0;
    `;
    actionBtn.textContent = suggestion.actionText;
    actionBtn.onmouseover = () => {
      actionBtn.style.transform = 'translateY(-2px)';
      actionBtn.style.boxShadow = `0 4px 12px ${color}40`;
    };
    actionBtn.onmouseout = () => {
      actionBtn.style.transform = 'translateY(0)';
      actionBtn.style.boxShadow = 'none';
    };

    card.onmouseover = () => {
      card.style.borderColor = color;
      card.style.boxShadow = `0 4px 12px ${color}20`;
      card.style.transform = 'translateY(-2px)';
    };
    card.onmouseout = () => {
      card.style.borderColor = '#E5E7EB';
      card.style.boxShadow = 'none';
      card.style.transform = 'translateY(0)';
    };

    actionBtn.onclick = (e) => {
      e.stopPropagation();
      if (suggestion.action) {
        suggestion.action();
      }
      this.showToast(`✅ ${suggestion.text}`);
    };

    card.appendChild(icon);
    card.appendChild(textContainer);
    card.appendChild(actionBtn);

    return card;
  }

  private renderFallbackSuggestions(pageContext: string): void {
    const url = window.location.href;
    const suggestions: SmartSuggestion[] = [];

    // Smart fallback suggestions based on page type
    if (url.includes('github.com')) {
      suggestions.push(
        { id: 'gh1', emoji: '⭐', text: 'Star this repository', category: 'productivity', actionText: 'Star', confidence: 0.9 },
        { id: 'gh2', emoji: '📖', text: 'Read the documentation', category: 'learning', actionText: 'Read', confidence: 0.8 },
        { id: 'gh3', emoji: '💾', text: 'Clone this repository', category: 'productivity', actionText: 'Copy URL', confidence: 0.7 },
        { id: 'gh4', emoji: '🔔', text: 'Watch for updates', category: 'productivity', actionText: 'Watch', confidence: 0.8 }
      );
    } else if (url.includes('youtube.com')) {
      suggestions.push(
        { id: 'yt1', emoji: '💾', text: 'Save to Watch Later', category: 'productivity', actionText: 'Save', confidence: 0.9 },
        { id: 'yt2', emoji: '👍', text: 'Like this video', category: 'productivity', actionText: 'Like', confidence: 0.8 },
        { id: 'yt3', emoji: '📝', text: 'Take notes while watching', category: 'learning', actionText: 'Notes', confidence: 0.7 },
        { id: 'yt4', emoji: '🔗', text: 'Share with someone', category: 'productivity', actionText: 'Share', confidence: 0.6 }
      );
    } else {
      // Generic suggestions
      suggestions.push(
        { id: 'g1', emoji: '📚', text: 'Bookmark this page', category: 'productivity', actionText: 'Bookmark', confidence: 0.9 },
        { id: 'g2', emoji: '📤', text: 'Share this article', category: 'productivity', actionText: 'Share', confidence: 0.7 },
        { id: 'g3', emoji: '📝', text: 'Summarize key points', category: 'learning', actionText: 'Summarize', confidence: 0.8 },
        { id: 'g4', emoji: '🧘', text: 'Take a short break', category: 'wellness', actionText: 'Start', confidence: 0.6 }
      );
    }

    this.renderSuggestions(suggestions);
  }

  private renderError(): void {
    const content = document.getElementById('alra-nudges-content');
    if (!content) return;

    content.innerHTML = `
      <div style="text-align: center; padding: 40px 20px; color: #6B7280;">
        <div style="font-size: 48px; margin-bottom: 16px;">⚠️</div>
        <div style="font-size: 16px; font-weight: 600; margin-bottom: 8px;">Couldn't generate suggestions</div>
        <div style="font-size: 14px;">Chrome's AI API may not be available yet</div>
      </div>
    `;
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

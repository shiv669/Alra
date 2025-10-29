/**
 * ALRA Floating Menu System
 * Beautiful circular FAB menu with radial options
 */

import { ModernColors } from './modern-ui-system';

interface MenuOption {
  id: string;
  label: string;
  icon: string;
  action: () => void;
  badge?: number;
}

export class FloatingMenu {
  private container: HTMLElement | null = null;
  private mainButton: HTMLElement | null = null;
  private menuItems: HTMLElement[] = [];
  private isOpen = false;
  private options: MenuOption[] = [];

  constructor(options: MenuOption[]) {
    this.options = options;
    this.createMenu();
    this.injectStyles();
  }

  private injectStyles(): void {
    const styleId = 'alra-floating-menu-styles';
    if (document.getElementById(styleId)) return;

    const style = document.createElement('style');
    style.id = styleId;
    style.textContent = `
      @keyframes alra-fab-pop {
        0% { transform: scale(0); opacity: 0; }
        50% { transform: scale(1.1); }
        100% { transform: scale(1); opacity: 1; }
      }

      @keyframes alra-fab-slide-in {
        from {
          transform: translateY(20px) scale(0.8);
          opacity: 0;
        }
        to {
          transform: translateY(0) scale(1);
          opacity: 1;
        }
      }

      .alra-floating-container {
        position: fixed;
        bottom: 24px;
        right: 24px;
        z-index: 999999;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      }

      .alra-fab-main {
        width: 64px;
        height: 64px;
        border-radius: 50%;
        background: linear-gradient(135deg, #2563EB 0%, #1E40AF 100%);
        box-shadow: 0 8px 24px rgba(37, 99, 235, 0.4);
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        border: none;
        position: relative;
        animation: alra-fab-pop 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
      }

      .alra-fab-main:hover {
        transform: scale(1.05);
        box-shadow: 0 12px 32px rgba(37, 99, 235, 0.5);
      }

      .alra-fab-main.open {
        background: linear-gradient(135deg, #EF4444 0%, #DC2626 100%);
        box-shadow: 0 8px 24px rgba(239, 68, 68, 0.4);
      }

      .alra-fab-icon {
        font-size: 28px;
        transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      }

      .alra-fab-main.open .alra-fab-icon {
        transform: rotate(45deg);
      }

      .alra-fab-menu {
        position: absolute;
        bottom: 80px;
        right: 0;
        display: flex;
        flex-direction: column;
        gap: 12px;
        opacity: 0;
        pointer-events: none;
        transition: opacity 0.3s ease;
      }

      .alra-fab-menu.open {
        opacity: 1;
        pointer-events: all;
      }

      .alra-fab-menu-item {
        display: flex;
        align-items: center;
        gap: 12px;
        background: rgba(255, 255, 255, 0.98);
        backdrop-filter: blur(10px);
        padding: 12px 20px;
        border-radius: 50px;
        box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
        cursor: pointer;
        border: 1px solid rgba(0, 0, 0, 0.06);
        transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
        min-width: 200px;
        transform-origin: right center;
        animation: alra-fab-slide-in 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
        position: relative;
      }

      .alra-fab-menu-item:nth-child(1) { animation-delay: 0.05s; }
      .alra-fab-menu-item:nth-child(2) { animation-delay: 0.1s; }
      .alra-fab-menu-item:nth-child(3) { animation-delay: 0.15s; }
      .alra-fab-menu-item:nth-child(4) { animation-delay: 0.2s; }
      .alra-fab-menu-item:nth-child(5) { animation-delay: 0.25s; }
      .alra-fab-menu-item:nth-child(6) { animation-delay: 0.3s; }

      .alra-fab-menu-item:hover {
        transform: translateX(-4px) scale(1.02);
        box-shadow: 0 6px 20px rgba(37, 99, 235, 0.2);
        background: rgba(37, 99, 235, 0.04);
      }

      .alra-fab-menu-icon {
        font-size: 24px;
        width: 40px;
        height: 40px;
        display: flex;
        align-items: center;
        justify-content: center;
        background: linear-gradient(135deg, #EFF6FF 0%, #DBEAFE 100%);
        border-radius: 50%;
        flex-shrink: 0;
      }

      .alra-fab-menu-label {
        font-size: 14px;
        font-weight: 600;
        color: #1F2937;
        white-space: nowrap;
      }

      .alra-fab-badge {
        position: absolute;
        top: -4px;
        right: -4px;
        background: #EF4444;
        color: white;
        border-radius: 12px;
        padding: 2px 6px;
        font-size: 10px;
        font-weight: 700;
        min-width: 18px;
        text-align: center;
        box-shadow: 0 2px 8px rgba(239, 68, 68, 0.3);
        border: 2px solid white;
      }
    `;

    document.head.appendChild(style);
  }

  private createMenu(): void {
    // Main container
    this.container = document.createElement('div');
    this.container.className = 'alra-floating-container';

    // Main FAB button
    this.mainButton = document.createElement('button');
    this.mainButton.className = 'alra-fab-main';
    this.mainButton.innerHTML = `<div class="alra-fab-icon">✨</div>`;
    this.mainButton.onclick = () => this.toggle();

    // Menu items container
    const menu = document.createElement('div');
    menu.className = 'alra-fab-menu';

    // Create menu items
    this.options.forEach(option => {
      const item = document.createElement('div');
      item.className = 'alra-fab-menu-item';
      
      item.innerHTML = `
        <div class="alra-fab-menu-icon">${option.icon}</div>
        <div class="alra-fab-menu-label">${option.label}</div>
        ${option.badge ? `<div class="alra-fab-badge">${option.badge}</div>` : ''}
      `;
      
      item.onclick = () => {
        option.action();
        this.close();
      };

      this.menuItems.push(item);
      menu.appendChild(item);
    });

    this.container.appendChild(menu);
    this.container.appendChild(this.mainButton);
    document.body.appendChild(this.container);
  }

  private toggle(): void {
    if (this.isOpen) {
      this.close();
    } else {
      this.open();
    }
  }

  public open(): void {
    if (!this.container || !this.mainButton) return;
    
    this.isOpen = true;
    this.mainButton.classList.add('open');
    const menu = this.container.querySelector('.alra-fab-menu');
    if (menu) {
      menu.classList.add('open');
    }
  }

  public close(): void {
    if (!this.container || !this.mainButton) return;
    
    this.isOpen = false;
    this.mainButton.classList.remove('open');
    const menu = this.container.querySelector('.alra-fab-menu');
    if (menu) {
      menu.classList.remove('open');
    }
  }

  public updateBadge(optionId: string, count: number): void {
    const index = this.options.findIndex(opt => opt.id === optionId);
    if (index !== -1 && this.menuItems[index]) {
      const existingBadge = this.menuItems[index].querySelector('.alra-fab-badge');
      if (count > 0) {
        if (existingBadge) {
          existingBadge.textContent = count.toString();
        } else {
          const badge = document.createElement('div');
          badge.className = 'alra-fab-badge';
          badge.textContent = count.toString();
          this.menuItems[index].appendChild(badge);
        }
      } else {
        existingBadge?.remove();
      }
    }
  }

  public remove(): void {
    this.container?.remove();
    document.getElementById('alra-floating-menu-styles')?.remove();
  }
}

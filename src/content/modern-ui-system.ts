/**
 * ALRA Modern Minimalist UI System
 * 
 * Clean, contemporary design with subtle postcard-inspired elements:
 * - Glassmorphism and smooth gradients
 * - Minimal, breathable layouts
 * - Smooth micro-interactions
 * - Modern color palette
 * - Inter/SF Pro typography feel
 */

export const ModernColors = {
  // Clean modern palette
  primary: '#2563EB',
  primaryLight: '#3B82F6',
  primaryDark: '#1E40AF',
  secondary: '#8B5CF6',
  accent: '#06B6D4',
  success: '#10B981',
  warning: '#F59E0B',
  error: '#EF4444',
  
  // Backgrounds
  background: '#FFFFFF',
  backgroundSecondary: '#F9FAFB',
  cardBg: '#FFFFFF',
  cardBgGlass: 'rgba(255, 255, 255, 0.95)',
  
  // Borders
  border: '#E5E7EB',
  borderLight: '#F3F4F6',
  
  // Text
  text: '#111827',
  textMuted: '#6B7280',
  textLight: '#9CA3AF',
  
  // Shadows
  shadow: 'rgba(0, 0, 0, 0.08)',
  shadowMedium: 'rgba(0, 0, 0, 0.12)',
  shadowLarge: 'rgba(0, 0, 0, 0.16)',
  
  // Gradients
  gradient1: 'linear-gradient(135deg, #667EEA 0%, #764BA2 100%)',
  gradient2: 'linear-gradient(135deg, #F093FB 0%, #F5576C 100%)',
  gradient3: 'linear-gradient(135deg, #4FACFE 0%, #00F2FE 100%)',
  gradient4: 'linear-gradient(135deg, #43E97B 0%, #38F9D7 100%)',
  gradientSubtle: 'linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%)',
} as const;

/**
 * Create modern glassmorphism card
 */
export function createModernCard(content: HTMLElement, options?: {
  padding?: string;
  borderRadius?: string;
}): HTMLElement {
  const card = document.createElement('div');
  card.className = 'alra-modern-card';
  card.style.cssText = `
    position: relative;
    background: ${ModernColors.cardBgGlass};
    backdrop-filter: blur(20px) saturate(180%);
    padding: ${options?.padding || '24px'};
    border: 1px solid ${ModernColors.border};
    border-radius: ${options?.borderRadius || '16px'};
    box-shadow: 
      0 4px 16px ${ModernColors.shadow},
      0 0 0 1px rgba(255, 255, 255, 0.1) inset;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  `;

  content.style.position = 'relative';
  content.style.zIndex = '1';
  card.appendChild(content);

  // Hover effect
  card.addEventListener('mouseenter', () => {
    card.style.transform = 'translateY(-4px)';
    card.style.boxShadow = `
      0 12px 32px ${ModernColors.shadowMedium},
      0 0 0 1px rgba(255, 255, 255, 0.2) inset
    `;
  });

  card.addEventListener('mouseleave', () => {
    card.style.transform = 'translateY(0)';
    card.style.boxShadow = `
      0 4px 16px ${ModernColors.shadow},
      0 0 0 1px rgba(255, 255, 255, 0.1) inset
    `;
  });

  return card;
}

/**
 * Create modern badge
 */
export function createModernBadge(
  text: string, 
  variant: 'primary' | 'secondary' | 'success' | 'warning' = 'primary'
): HTMLElement {
  const badge = document.createElement('div');
  badge.className = 'alra-modern-badge';
  
  const colors = {
    primary: { bg: ModernColors.primary, text: '#FFFFFF' },
    secondary: { bg: ModernColors.secondary, text: '#FFFFFF' },
    success: { bg: ModernColors.success, text: '#FFFFFF' },
    warning: { bg: ModernColors.warning, text: '#FFFFFF' },
  };
  
  const color = colors[variant];
  
  badge.style.cssText = `
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 4px 12px;
    background: ${color.bg};
    color: ${color.text};
    border-radius: 12px;
    font-size: 11px;
    font-weight: 600;
    letter-spacing: 0.3px;
    box-shadow: 0 2px 8px ${ModernColors.shadow};
    transition: all 0.2s;
  `;
  
  badge.textContent = text;
  
  badge.addEventListener('mouseenter', () => {
    badge.style.transform = 'scale(1.05)';
    badge.style.boxShadow = `0 4px 12px ${ModernColors.shadowMedium}`;
  });
  
  badge.addEventListener('mouseleave', () => {
    badge.style.transform = 'scale(1)';
    badge.style.boxShadow = `0 2px 8px ${ModernColors.shadow}`;
  });
  
  return badge;
}

/**
 * Create modern button
 */
export function createModernButton(
  text: string, 
  onClick: () => void,
  variant: 'primary' | 'secondary' | 'ghost' = 'primary'
): HTMLElement {
  const button = document.createElement('button');
  button.className = 'alra-modern-button';
  
  const styles = {
    primary: `
      background: ${ModernColors.gradient1};
      color: #FFFFFF;
      border: none;
    `,
    secondary: `
      background: ${ModernColors.background};
      color: ${ModernColors.text};
      border: 1px solid ${ModernColors.border};
    `,
    ghost: `
      background: transparent;
      color: ${ModernColors.text};
      border: none;
    `,
  };
  
  button.style.cssText = `
    ${styles[variant]}
    padding: 10px 20px;
    border-radius: 10px;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    box-shadow: 0 2px 8px ${ModernColors.shadow};
    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  `;
  
  const textSpan = document.createElement('span');
  textSpan.textContent = text;
  button.appendChild(textSpan);
  
  button.addEventListener('mouseenter', () => {
    button.style.transform = 'translateY(-2px)';
    button.style.boxShadow = `0 6px 16px ${ModernColors.shadowMedium}`;
  });
  
  button.addEventListener('mouseleave', () => {
    button.style.transform = 'translateY(0)';
    button.style.boxShadow = `0 2px 8px ${ModernColors.shadow}`;
  });
  
  button.addEventListener('click', onClick);
  
  return button;
}

/**
 * Create modern metric card
 */
export function createMetricCard(
  icon: string,
  value: string,
  label: string,
  trend?: string,
  gradient?: string
): HTMLElement {
  const card = document.createElement('div');
  card.className = 'alra-metric-card';
  card.style.cssText = `
    background: ${gradient || ModernColors.gradientSubtle};
    backdrop-filter: blur(10px);
    padding: 20px;
    border-radius: 16px;
    border: 1px solid ${ModernColors.borderLight};
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    cursor: default;
  `;
  
  card.innerHTML = `
    <div style="font-size: 32px; margin-bottom: 8px;">${icon}</div>
    <div style="font-size: 32px; font-weight: 700; color: ${ModernColors.text}; margin-bottom: 4px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">${value}</div>
    <div style="font-size: 12px; font-weight: 600; color: ${ModernColors.textMuted}; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 4px;">${label}</div>
    ${trend ? `<div style="font-size: 11px; font-weight: 600; color: ${ModernColors.success};">${trend}</div>` : ''}
  `;
  
  card.addEventListener('mouseenter', () => {
    card.style.transform = 'translateY(-4px) scale(1.02)';
    card.style.boxShadow = `0 12px 32px ${ModernColors.shadowMedium}`;
  });
  
  card.addEventListener('mouseleave', () => {
    card.style.transform = 'translateY(0) scale(1)';
    card.style.boxShadow = 'none';
  });
  
  return card;
}

/**
 * Create modern toast notification
 */
export function showModernToast(message: string, type: 'success' | 'error' | 'info' = 'success'): void {
  const colors = {
    success: ModernColors.success,
    error: ModernColors.error,
    info: ModernColors.primary,
  };
  
  const toast = document.createElement('div');
  toast.style.cssText = `
    position: fixed;
    bottom: 24px;
    right: 24px;
    background: ${ModernColors.cardBgGlass};
    backdrop-filter: blur(20px) saturate(180%);
    color: ${ModernColors.text};
    padding: 16px 24px;
    border-radius: 12px;
    border: 1px solid ${ModernColors.borderLight};
    border-left: 4px solid ${colors[type]};
    box-shadow: 0 8px 24px ${ModernColors.shadowLarge};
    z-index: 10000001;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    font-size: 14px;
    font-weight: 500;
    animation: modernToastSlide 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    max-width: 320px;
  `;
  
  const style = document.createElement('style');
  style.textContent = `
    @keyframes modernToastSlide {
      from {
        opacity: 0;
        transform: translateX(100px);
      }
      to {
        opacity: 1;
        transform: translateX(0);
      }
    }
  `;
  document.head.appendChild(style);
  
  toast.textContent = message;
  document.body.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(100px)';
    setTimeout(() => {
      toast.remove();
      style.remove();
    }, 300);
  }, 3000);
}

/**
 * Inject global modern styles
 */
export function injectModernStyles(): void {
  const styleId = 'alra-modern-styles';
  if (document.getElementById(styleId)) return;

  const style = document.createElement('style');
  style.id = styleId;
  style.textContent = `
    @keyframes floatBadge {
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(-4px); }
    }

    @keyframes modernFadeIn {
      from {
        opacity: 0;
        transform: translateY(20px) scale(0.95);
      }
      to {
        opacity: 1;
        transform: translateY(0) scale(1);
      }
    }

    @keyframes shimmer {
      0% { background-position: -1000px 0; }
      100% { background-position: 1000px 0; }
    }

    /* Modern scrollbar */
    .alra-modern-scroll::-webkit-scrollbar {
      width: 8px;
    }

    .alra-modern-scroll::-webkit-scrollbar-track {
      background: ${ModernColors.backgroundSecondary};
    }

    .alra-modern-scroll::-webkit-scrollbar-thumb {
      background: ${ModernColors.textLight};
      border-radius: 4px;
    }

    .alra-modern-scroll::-webkit-scrollbar-thumb:hover {
      background: ${ModernColors.textMuted};
    }

    /* Modern typography */
    .alra-modern-heading {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      font-weight: 700;
      color: ${ModernColors.text};
      letter-spacing: -0.02em;
      line-height: 1.2;
    }

    .alra-modern-body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      color: ${ModernColors.textMuted};
      line-height: 1.6;
    }

    /* Modern divider */
    .alra-modern-divider {
      height: 1px;
      background: ${ModernColors.border};
      margin: 20px 0;
    }
    
    /* Glassmorphism effect */
    .alra-glass {
      background: ${ModernColors.cardBgGlass};
      backdrop-filter: blur(20px) saturate(180%);
      border: 1px solid ${ModernColors.borderLight};
    }
  `;

  document.head.appendChild(style);
}

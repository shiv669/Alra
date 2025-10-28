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
export declare const ModernColors: {
    readonly primary: "#2563EB";
    readonly primaryLight: "#3B82F6";
    readonly primaryDark: "#1E40AF";
    readonly secondary: "#8B5CF6";
    readonly accent: "#06B6D4";
    readonly success: "#10B981";
    readonly warning: "#F59E0B";
    readonly error: "#EF4444";
    readonly background: "#FFFFFF";
    readonly backgroundSecondary: "#F9FAFB";
    readonly cardBg: "#FFFFFF";
    readonly cardBgGlass: "rgba(255, 255, 255, 0.95)";
    readonly border: "#E5E7EB";
    readonly borderLight: "#F3F4F6";
    readonly text: "#111827";
    readonly textMuted: "#6B7280";
    readonly textLight: "#9CA3AF";
    readonly shadow: "rgba(0, 0, 0, 0.08)";
    readonly shadowMedium: "rgba(0, 0, 0, 0.12)";
    readonly shadowLarge: "rgba(0, 0, 0, 0.16)";
    readonly gradient1: "linear-gradient(135deg, #667EEA 0%, #764BA2 100%)";
    readonly gradient2: "linear-gradient(135deg, #F093FB 0%, #F5576C 100%)";
    readonly gradient3: "linear-gradient(135deg, #4FACFE 0%, #00F2FE 100%)";
    readonly gradient4: "linear-gradient(135deg, #43E97B 0%, #38F9D7 100%)";
    readonly gradientSubtle: "linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%)";
};
/**
 * Create modern glassmorphism card
 */
export declare function createModernCard(content: HTMLElement, options?: {
    padding?: string;
    borderRadius?: string;
}): HTMLElement;
/**
 * Create modern badge
 */
export declare function createModernBadge(text: string, variant?: 'primary' | 'secondary' | 'success' | 'warning'): HTMLElement;
/**
 * Create modern button
 */
export declare function createModernButton(text: string, onClick: () => void, variant?: 'primary' | 'secondary' | 'ghost'): HTMLElement;
/**
 * Create modern metric card
 */
export declare function createMetricCard(icon: string, value: string, label: string, trend?: string, gradient?: string): HTMLElement;
/**
 * Create modern toast notification
 */
export declare function showModernToast(message: string, type?: 'success' | 'error' | 'info'): void;
/**
 * Inject global modern styles
 */
export declare function injectModernStyles(): void;

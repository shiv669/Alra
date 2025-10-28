/**
 * ALRA Floating Menu System
 * Beautiful circular FAB menu with radial options
 */
interface MenuOption {
    id: string;
    label: string;
    icon: string;
    action: () => void;
    badge?: number;
}
export declare class FloatingMenu {
    private container;
    private mainButton;
    private menuItems;
    private isOpen;
    private options;
    constructor(options: MenuOption[]);
    private injectStyles;
    private createMenu;
    private toggle;
    open(): void;
    close(): void;
    updateBadge(optionId: string, count: number): void;
    remove(): void;
}
export {};

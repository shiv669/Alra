/**
 * Premium UI Components
 *
 * Reusable React components following shacn/ui design system
 * Features:
 * - Button component with variants (default, outline, ghost)
 * - Textarea with auto-resize
 * - Tooltip components from Radix UI
 * - Dialog components from Radix UI
 * - Custom styling with Tailwind CSS
 */
import React from "react";
import * as TooltipPrimitive from "@radix-ui/react-tooltip";
import * as DialogPrimitive from "@radix-ui/react-dialog";
/**
 * Step 1: Create utility function to merge classNames
 * This lets us combine multiple CSS classes conditionally
 * (used throughout all components)
 */
declare const cn: (...classes: (string | undefined | null | false)[]) => string;
/**
 * Step 1: Define Textarea component props interface
 * Extends standard HTML textarea attributes
 */
interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
    className?: string;
}
/**
 * Step 2: Create Textarea component with forwardRef
 * Allows parent components to access the textarea element directly
 */
declare const Textarea: React.ForwardRefExoticComponent<TextareaProps & React.RefAttributes<HTMLTextAreaElement>>;
/**
 * Step 1: Export Radix UI Tooltip components
 * TooltipProvider wraps the application
 * Tooltip is the root component
 * TooltipTrigger is what user hovers/clicks
 */
declare const TooltipProvider: React.FC<TooltipPrimitive.TooltipProviderProps>;
declare const Tooltip: React.FC<TooltipPrimitive.TooltipProps>;
declare const TooltipTrigger: React.ForwardRefExoticComponent<TooltipPrimitive.TooltipTriggerProps & React.RefAttributes<HTMLButtonElement>>;
/**
 * Step 2: Create custom TooltipContent component
 * Styled with dark theme and smooth animations
 */
declare const TooltipContent: React.ForwardRefExoticComponent<Omit<TooltipPrimitive.TooltipContentProps & React.RefAttributes<HTMLDivElement>, "ref"> & React.RefAttributes<HTMLDivElement>>;
/**
 * Step 1: Export Radix UI Dialog root component
 * Dialog is the main container for modal dialogs
 */
declare const Dialog: React.FC<DialogPrimitive.DialogProps>;
declare const DialogPortal: React.FC<DialogPrimitive.DialogPortalProps>;
/**
 * Step 2: Create custom DialogOverlay component
 * Dark overlay behind the dialog with blur effect
 */
declare const DialogOverlay: React.ForwardRefExoticComponent<Omit<DialogPrimitive.DialogOverlayProps & React.RefAttributes<HTMLDivElement>, "ref"> & React.RefAttributes<HTMLDivElement>>;
/**
 * Step 3: Create custom DialogContent component
 * Main dialog box with rounded corners and close button
 */
declare const DialogContent: React.ForwardRefExoticComponent<Omit<DialogPrimitive.DialogContentProps & React.RefAttributes<HTMLDivElement>, "ref"> & React.RefAttributes<HTMLDivElement>>;
/**
 * Step 4: Create custom DialogTitle component
 * Styled text for dialog heading
 */
declare const DialogTitle: React.ForwardRefExoticComponent<Omit<DialogPrimitive.DialogTitleProps & React.RefAttributes<HTMLHeadingElement>, "ref"> & React.RefAttributes<HTMLHeadingElement>>;
/**
 * Step 1: Define Button component props interface
 * Includes variant and size options for flexibility
 */
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: "default" | "outline" | "ghost";
    size?: "default" | "sm" | "lg" | "icon";
}
/**
 * Step 2: Create Button component with variants
 * Different styles for different use cases (primary, secondary, etc)
 */
declare const Button: React.ForwardRefExoticComponent<ButtonProps & React.RefAttributes<HTMLButtonElement>>;
export { Textarea, Button, Tooltip, TooltipTrigger, TooltipContent, TooltipProvider, Dialog, DialogPortal, DialogOverlay, DialogContent, DialogTitle, cn, };

/**
 * Premium PromptInputBox Component
 *
 * Main chat interface component featuring:
 * - Animated text input with auto-resize
 * - Image upload and preview
 * - Feature toggles (Search, Think, Canvas)
 * - Voice recording with visualizer
 * - Send/Stop buttons with state management
 * - Drag and drop file support
 */
import React from "react";
import { Textarea, Tooltip } from "./ui-components";
/**
 * Step 1: Define context interface
 * Stores the state of the prompt input box
 * (isLoading, value, setValue, etc)
 */
interface PromptInputContextType {
    isLoading: boolean;
    value: string;
    setValue: (value: string) => void;
    maxHeight: number | string;
    onSubmit?: () => void;
    disabled?: boolean;
}
/**
 * Step 3: Create hook to access context
 * Throws error if used outside of PromptInput provider
 */
declare function usePromptInput(): PromptInputContextType;
/**
 * Step 1: Define PromptInput component props
 */
interface PromptInputProps {
    isLoading?: boolean;
    value?: string;
    onValueChange?: (value: string) => void;
    maxHeight?: number | string;
    onSubmit?: () => void;
    children: React.ReactNode;
    className?: string;
    disabled?: boolean;
    onDragOver?: (e: React.DragEvent) => void;
    onDragLeave?: (e: React.DragEvent) => void;
    onDrop?: (e: React.DragEvent) => void;
}
/**
 * Step 2: Create PromptInput container component
 * Provides context to all child components
 */
declare const PromptInput: React.ForwardRefExoticComponent<PromptInputProps & React.RefAttributes<HTMLDivElement>>;
/**
 * Step 1: Define props for PromptInputTextarea
 */
interface PromptInputTextareaProps {
    disableAutosize?: boolean;
    placeholder?: string;
}
/**
 * Step 2: Create textarea component with auto-sizing
 * Grows as user types, up to maxHeight
 */
declare const PromptInputTextarea: React.FC<PromptInputTextareaProps & React.ComponentProps<typeof Textarea>>;
/**
 * Step 1: Container for input action buttons
 */
interface PromptInputActionsProps extends React.HTMLAttributes<HTMLDivElement> {
}
declare const PromptInputActions: React.FC<PromptInputActionsProps>;
/**
 * Step 1: Wrapper for action buttons with tooltip
 */
interface PromptInputActionProps extends React.ComponentProps<typeof Tooltip> {
    tooltip: React.ReactNode;
    children: React.ReactNode;
    side?: "top" | "bottom" | "left" | "right";
    className?: string;
}
declare const PromptInputAction: React.FC<PromptInputActionProps>;
/**
 * Step 1: Define VoiceRecorder props
 */
interface VoiceRecorderProps {
    isRecording: boolean;
    onStartRecording: () => void;
    onStopRecording: (duration: number) => void;
    visualizerBars?: number;
}
/**
 * Step 2: Create voice recorder with animated visualizer
 * Shows animated bars while recording
 */
declare const VoiceRecorder: React.FC<VoiceRecorderProps>;
/**
 * Step 1: Define ImageViewDialog props
 */
interface ImageViewDialogProps {
    imageUrl: string | null;
    onClose: () => void;
}
/**
 * Step 2: Create dialog for viewing full-size images
 */
declare const ImageViewDialog: React.FC<ImageViewDialogProps>;
/**
 * Step 1: Create custom gradient divider
 * Used to separate feature toggles
 */
declare const CustomDivider: React.FC;
/**
 * Step 1: Define main PromptInputBox props
 */
interface PromptInputBoxProps {
    onSend?: (message: string, files?: File[]) => void;
    isLoading?: boolean;
    placeholder?: string;
    className?: string;
}
/**
 * Step 2: Create main PromptInputBox component
 * Combines all sub-components into complete input interface
 */
export declare const PromptInputBox: React.ForwardRefExoticComponent<PromptInputBoxProps & React.RefAttributes<HTMLDivElement>>;
/**
 * Step 3: Export all components
 */
export { PromptInput, PromptInputTextarea, PromptInputActions, PromptInputAction, VoiceRecorder, ImageViewDialog, CustomDivider, usePromptInput, };

interface ColorPickerProps {
    onSelect: (color: string) => void;
    onClose: () => void;
    currentColor?: string;
}
export default function ColorPicker({ onSelect, onClose, currentColor }: ColorPickerProps): import("react/jsx-runtime").JSX.Element;
export {};

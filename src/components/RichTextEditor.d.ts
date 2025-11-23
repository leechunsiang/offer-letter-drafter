interface RichTextEditorProps {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    className?: string;
}
export default function RichTextEditor({ value, onChange, placeholder, className }: RichTextEditorProps): import("react/jsx-runtime").JSX.Element;
export {};

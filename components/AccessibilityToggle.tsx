interface Props {
  enabled: boolean;
  onToggle: (next: boolean) => void;
}

export function AccessibilityToggle({ enabled, onToggle }: Props) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={enabled}
      aria-label="Toggle accessibility mode: high contrast and larger text"
      onClick={() => onToggle(!enabled)}
      className={`flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
        enabled
          ? "border-amber bg-amber/10 text-amber"
          : "border-line text-foreground/70 hover:text-foreground"
      }`}
    >
      <span
        className={`inline-block h-2 w-2 rounded-full transition-colors ${
          enabled ? "bg-amber" : "bg-foreground/30"
        }`}
        aria-hidden
      />
      Accessibility mode
    </button>
  );
}

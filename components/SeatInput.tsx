interface Props {
  value: string;
  onChange: (value: string) => void;
}

export function SeatInput({ value, onChange }: Props) {
  return (
    <label className="flex items-center gap-2 text-xs text-foreground/70">
      <span className="shrink-0">Your section</span>
      <input
        type="text"
        inputMode="numeric"
        placeholder="e.g. 109"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        maxLength={10}
        aria-label="Your seat section number"
        className="scoreboard-digits w-20 rounded-md border border-line bg-navy-light px-2 py-1 text-foreground placeholder:text-foreground/30"
      />
    </label>
  );
}

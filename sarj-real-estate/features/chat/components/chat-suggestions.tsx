import { Button } from "@/components/ui/button";

const suggestions = [
  "Commercial land in East Riyadh",
  "Residential land under SAR 3M",
  "Land suitable for a warehouse",
  "Show me land available for lease",
];

type ChatSuggestionsProps = {
  onSelect: (message: string) => void;
};

export function ChatSuggestions({ onSelect }: ChatSuggestionsProps) {
  return (
    <div className="mt-4 flex flex-wrap justify-center gap-2">
      {suggestions.map((suggestion) => (
        <Button
          key={suggestion}
          variant="outline"
          size="sm"
          className="rounded-full"
          onClick={() => onSelect(suggestion)}
        >
          {suggestion}
        </Button>
      ))}
    </div>
  );
}
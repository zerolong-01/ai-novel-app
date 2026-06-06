import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const GENRES = ["판타지", "SF", "로맨스", "미스터리", "공포", "사이버펑크", "무협"];

interface GenreSelectorProps {
    selected: string;
    onSelect: (genre: string) => void;
}

export function GenreSelector({ selected, onSelect }: GenreSelectorProps) {
    return (
        <div className="flex flex-wrap gap-2">
            {GENRES.map((genre) => (
                <Button
                    key={genre}
                    type="button"
                    variant={selected === genre ? "default" : "outline"}
                    onClick={() => onSelect(genre)}
                    className={cn(
                        "transition-all",
                        selected === genre ? "shadow-[0_0_15px_rgba(124,58,237,0.4)]" : "hover:border-primary/50"
                    )}
                >
                    {genre}
                </Button>
            ))}
        </div>
    );
}

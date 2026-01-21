import { useState } from "react";
import { Dialog, DialogContent } from "./ui/dialog";
import slothMascot from "@/assets/sloth-mascot.png";

interface MoodSelectorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onMoodSelect: (mood: string) => void;
}

// Reihenfolge: links=schlecht, rechts=gut
const moods = [
  { id: "bad", label: "schlecht", emoji: "😢", color: "bg-mood-bad" },
  { id: "unwell", label: "unwohl", emoji: "😟", color: "bg-mood-unwell" },
  { id: "neutral", label: "neutral", emoji: "😐", color: "bg-mood-neutral" },
  { id: "good", label: "gut", emoji: "🙂", color: "bg-mood-good" },
  { id: "great", label: "sehr gut", emoji: "😆", color: "bg-mood-great" },
];

const MoodSelector = ({ open, onOpenChange, onMoodSelect }: MoodSelectorProps) => {
  const [selectedMood, setSelectedMood] = useState<string | null>(null);

  const handleMoodClick = (moodId: string) => {
    setSelectedMood(moodId);
    setTimeout(() => {
      onMoodSelect(moodId);
      onOpenChange(false);
    }, 300);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg bg-card border-0 shadow-2xl rounded-2xl overflow-visible p-0">
        {/* Sloth peeking */}
        <div className="absolute -top-16 right-8 w-32 h-32 animate-bounce-gentle">
          <img src={slothMascot} alt="Hugo" className="w-full h-full object-contain" />
        </div>
        
        <div className="p-8 pt-6">
          {/* Speech bubble effect */}
          <div className="relative">
            <p className="text-muted-foreground text-sm mb-1">Willkommen!</p>
            <h2 className="text-2xl md:text-3xl font-bold text-primary mb-8">
              Wie fühlst du dich heute?
            </h2>
          </div>

          {/* Mood options */}
          <div className="flex justify-between gap-2">
            {moods.map((mood) => (
              <button
                key={mood.id}
                onClick={() => handleMoodClick(mood.id)}
                className={`flex flex-col items-center gap-2 p-3 rounded-xl transition-all duration-200 hover:scale-110 ${
                  selectedMood === mood.id ? "scale-110 ring-2 ring-primary ring-offset-2" : ""
                }`}
              >
                <div className={`w-12 h-12 md:w-14 md:h-14 rounded-full ${mood.color} flex items-center justify-center text-2xl md:text-3xl shadow-md`}>
                  {mood.emoji}
                </div>
                <span className="text-xs md:text-sm font-medium text-foreground">{mood.label}</span>
              </button>
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default MoodSelector;

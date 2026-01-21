import { Dialog, DialogContent, DialogTitle } from "./ui/dialog";
import { Button } from "./ui/button";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import slothMascot from "@/assets/sloth-mascot.png";
import { moods } from "./MoodIcons";

interface DailyMoodDialogProps {
  open: boolean;
  onClose: () => void;
  onMoodSelect: (mood: string) => void;
}

const DailyMoodDialog = ({ open, onClose, onMoodSelect }: DailyMoodDialogProps) => {
  const handleSelect = (moodId: string) => {
    onMoodSelect(moodId);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="w-auto max-w-fit bg-card border border-border/50 shadow-xl rounded-3xl p-0 overflow-visible">
        <VisuallyHidden>
          <DialogTitle>Wie fühlst du dich heute?</DialogTitle>
        </VisuallyHidden>
        <div className="px-8 py-7">
          <div className="flex justify-center mb-5">
            <img src={slothMascot} alt="Hugo" className="w-12 h-12 object-contain" />
          </div>
          
          <div className="text-center mb-6">
            <h2 className="text-lg font-semibold text-foreground mb-1">
              Wie geht es dir heute?
            </h2>
            <p className="text-sm text-muted-foreground">
              Dein täglicher Check-in
            </p>
          </div>

          <div className="flex justify-center gap-2 mb-6">
            {moods.map((mood) => {
              const Icon = mood.icon;
              return (
                <button
                  key={mood.id}
                  onClick={() => handleSelect(mood.id)}
                  className="flex flex-col items-center gap-1.5 p-2 rounded-xl transition-all hover:scale-110 hover:bg-muted/50 group"
                >
                  <div className={`w-11 h-11 rounded-full ${mood.color} flex items-center justify-center shadow-md group-hover:shadow-lg transition-shadow`}>
                    <Icon className="w-6 h-6 text-white" strokeWidth={2.5} />
                  </div>
                  <span className="text-[10px] text-muted-foreground font-medium">{mood.label}</span>
                </button>
              );
            })}
          </div>

          <Button variant="ghost" onClick={onClose} className="w-full text-muted-foreground text-sm h-9">
            Später
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DailyMoodDialog;
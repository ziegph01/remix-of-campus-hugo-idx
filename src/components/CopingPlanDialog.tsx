import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Heart, Brain, Users, Flame, Clock, ArrowLeft, Wind, Sparkles, Music, Leaf } from "lucide-react";
import { unlockBadge, updateBadgeProgress } from "./BadgeSystem";
import { toast } from "sonner";

interface CopingPlanDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type Category = "einsamkeit" | "angst" | "stress" | "ueberforderung";
type Step = "intro" | "category" | "level" | "time" | "exercise";

interface Exercise {
  title: string;
  description: string;
  duration: string;
  icon: React.ReactNode;
  steps: string[];
}

const CATEGORIES = [
  { id: "einsamkeit" as Category, label: "Einsamkeit", icon: Users, color: "bg-blue-100 text-blue-600 border-blue-200" },
  { id: "angst" as Category, label: "Angst", icon: Heart, color: "bg-purple-100 text-purple-600 border-purple-200" },
  { id: "stress" as Category, label: "Stress", icon: Flame, color: "bg-orange-100 text-orange-600 border-orange-200" },
  { id: "ueberforderung" as Category, label: "Überforderung", icon: Brain, color: "bg-red-100 text-red-600 border-red-200" },
];

const EXERCISES: Record<Category, Record<"short" | "medium" | "long", Exercise[]>> = {
  einsamkeit: {
    short: [
      {
        title: "Selbstmitgefühl-Moment",
        description: "Eine kurze Übung um dich selbst zu umarmen",
        duration: "2 Min",
        icon: <Heart className="w-6 h-6" />,
        steps: [
          "Lege eine Hand auf dein Herz",
          "Spüre deinen Herzschlag",
          "Sage dir: 'Ich bin nicht allein mit meinen Gefühlen'",
          "Atme 3x tief ein und aus",
        ],
      },
    ],
    medium: [
      {
        title: "Dankbarkeits-Reflexion",
        description: "Erinnere dich an Menschen, die dir wichtig sind",
        duration: "5 Min",
        icon: <Sparkles className="w-6 h-6" />,
        steps: [
          "Schließe die Augen und atme ruhig",
          "Denke an 3 Menschen, die dir etwas bedeuten",
          "Erinnere dich an ein schönes Erlebnis mit jedem",
          "Spüre die Wärme dieser Erinnerungen",
          "Überlege, ob du einer Person heute schreiben möchtest",
        ],
      },
    ],
    long: [
      {
        title: "Verbindungs-Meditation",
        description: "Eine geführte Meditation zur inneren Verbundenheit",
        duration: "10 Min",
        icon: <Users className="w-6 h-6" />,
        steps: [
          "Finde eine bequeme Position",
          "Atme 5x tief ein und aus",
          "Visualisiere einen warmen, goldenen Lichtkreis um dich",
          "Stelle dir vor, wie dieser Kreis sich ausdehnt",
          "Verbinde dich gedanklich mit Menschen, die dir wichtig sind",
          "Sende ihnen gedanklich gute Wünsche",
          "Kehre langsam zurück und öffne die Augen",
        ],
      },
    ],
  },
  angst: {
    short: [
      {
        title: "4-7-8 Atemtechnik",
        description: "Schnelle Beruhigung durch kontrolliertes Atmen",
        duration: "2 Min",
        icon: <Wind className="w-6 h-6" />,
        steps: [
          "Atme durch die Nase ein (4 Sekunden)",
          "Halte den Atem an (7 Sekunden)",
          "Atme langsam durch den Mund aus (8 Sekunden)",
          "Wiederhole 3-4x",
        ],
      },
    ],
    medium: [
      {
        title: "5-4-3-2-1 Grounding",
        description: "Erdung durch die Sinne",
        duration: "5 Min",
        icon: <Leaf className="w-6 h-6" />,
        steps: [
          "Benenne 5 Dinge, die du siehst",
          "Benenne 4 Dinge, die du hörst",
          "Benenne 3 Dinge, die du fühlst",
          "Benenne 2 Dinge, die du riechst",
          "Benenne 1 Ding, das du schmeckst",
          "Atme tief durch und spüre die Gegenwart",
        ],
      },
    ],
    long: [
      {
        title: "Body Scan",
        description: "Progressive Entspannung des gesamten Körpers",
        duration: "10 Min",
        icon: <Sparkles className="w-6 h-6" />,
        steps: [
          "Lege dich bequem hin oder setze dich entspannt",
          "Beginne bei deinen Füßen - spüre und entspanne sie",
          "Wandere langsam nach oben: Waden, Knie, Oberschenkel",
          "Entspanne Becken, Bauch und unteren Rücken",
          "Löse Spannungen in Schultern und Nacken",
          "Entspanne Gesicht, Kiefer und Stirn",
          "Spüre deinen ganzen Körper als entspannte Einheit",
        ],
      },
    ],
  },
  stress: {
    short: [
      {
        title: "Box Breathing",
        description: "Militär-Technik zur schnellen Stressreduktion",
        duration: "2 Min",
        icon: <Wind className="w-6 h-6" />,
        steps: [
          "Atme 4 Sekunden ein",
          "Halte 4 Sekunden",
          "Atme 4 Sekunden aus",
          "Halte 4 Sekunden",
          "Wiederhole 4x",
        ],
      },
    ],
    medium: [
      {
        title: "Progressive Muskelentspannung",
        description: "Anspannen und Loslassen für tiefe Entspannung",
        duration: "5 Min",
        icon: <Sparkles className="w-6 h-6" />,
        steps: [
          "Balle die Fäuste fest (5 Sek) - dann loslassen",
          "Spanne die Arme an - dann loslassen",
          "Ziehe die Schultern hoch - dann fallen lassen",
          "Spanne den Bauch an - dann entspannen",
          "Spanne die Beine an - dann loslassen",
          "Spüre die tiefe Entspannung im ganzen Körper",
        ],
      },
    ],
    long: [
      {
        title: "Achtsame Pause",
        description: "Eine vollständige mentale Auszeit",
        duration: "10 Min",
        icon: <Music className="w-6 h-6" />,
        steps: [
          "Finde einen ruhigen Ort",
          "Schließe die Augen und atme natürlich",
          "Beobachte deine Gedanken ohne zu urteilen",
          "Lasse Gedanken wie Wolken vorbeiziehen",
          "Fokussiere dich nur auf deinen Atem",
          "Wenn Gedanken kommen, kehre sanft zum Atem zurück",
          "Öffne langsam die Augen und strecke dich",
        ],
      },
    ],
  },
  ueberforderung: {
    short: [
      {
        title: "Gedanken-Stopp",
        description: "Unterbreche das Gedankenkarussell",
        duration: "2 Min",
        icon: <Brain className="w-6 h-6" />,
        steps: [
          "Sage laut oder innerlich 'STOPP'",
          "Atme 3x tief durch",
          "Fokussiere dich auf EINE Sache vor dir",
          "Beschreibe sie gedanklich in allen Details",
        ],
      },
    ],
    medium: [
      {
        title: "Prioritäten-Klarheit",
        description: "Sortiere deine Gedanken",
        duration: "5 Min",
        icon: <Sparkles className="w-6 h-6" />,
        steps: [
          "Schreibe alles auf, was dich beschäftigt",
          "Markiere: Was ist HEUTE wirklich wichtig?",
          "Streiche, was warten kann",
          "Wähle EINE Sache als nächsten Schritt",
          "Atme tief durch - du schaffst das",
        ],
      },
    ],
    long: [
      {
        title: "Reset-Routine",
        description: "Vollständiger mentaler Neustart",
        duration: "10 Min",
        icon: <Leaf className="w-6 h-6" />,
        steps: [
          "Stehe auf und bewege dich kurz",
          "Trinke ein Glas Wasser",
          "Öffne ein Fenster für frische Luft",
          "Mache 10 tiefe Atemzüge",
          "Schreibe 3 Dinge auf, für die du dankbar bist",
          "Setze dir EIN kleines, erreichbares Ziel",
          "Starte mit einem Lächeln neu",
        ],
      },
    ],
  },
};

const CopingPlanDialog = ({ open, onOpenChange }: CopingPlanDialogProps) => {
  const [step, setStep] = useState<Step>("intro");
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [stressLevel, setStressLevel] = useState([5]);
  const [timeAvailable, setTimeAvailable] = useState<"short" | "medium" | "long">("short");
  const [currentExercise, setCurrentExercise] = useState<Exercise | null>(null);
  const [exerciseStep, setExerciseStep] = useState(0);

  const resetDialog = () => {
    setStep("intro");
    setSelectedCategory(null);
    setStressLevel([5]);
    setTimeAvailable("short");
    setCurrentExercise(null);
    setExerciseStep(0);
  };

  const handleClose = () => {
    onOpenChange(false);
    setTimeout(resetDialog, 300);
  };

  const handleExerciseComplete = () => {
    // Track completed exercises
    const completedExercises = parseInt(localStorage.getItem("hugoExercisesCompleted") || "0") + 1;
    localStorage.setItem("hugoExercisesCompleted", String(completedExercises));

    // Track categories used
    if (selectedCategory) {
      const usedCategories = JSON.parse(localStorage.getItem("hugoCategoriesUsed") || "[]");
      if (!usedCategories.includes(selectedCategory)) {
        usedCategories.push(selectedCategory);
        localStorage.setItem("hugoCategoriesUsed", JSON.stringify(usedCategories));
      }
      // Update all categories badge progress
      updateBadgeProgress("hugo_all_categories", usedCategories.length);
    }

    // First exercise badge
    if (completedExercises === 1) {
      const unlocked = unlockBadge("first_hugo_exercise");
      if (unlocked) {
        toast.success("🎉 Badge freigeschaltet: Hugos Freund!", {
          description: "+20 EXP"
        });
      }
    }

    // Progress badges
    updateBadgeProgress("hugo_regular", completedExercises);
    updateBadgeProgress("hugo_master", completedExercises);

    // Check for milestone unlocks
    if (completedExercises === 10) {
      toast.success("🎉 Badge freigeschaltet: Achtsamkeits-Profi!", {
        description: "+75 EXP"
      });
    } else if (completedExercises === 25) {
      toast.success("🎉 Badge freigeschaltet: Coping-Meister!", {
        description: "+150 EXP"
      });
    }

    handleClose();
  };

  const handleCategorySelect = (category: Category) => {
    setSelectedCategory(category);
    setStep("level");
  };

  const handleTimeSelect = (time: "short" | "medium" | "long") => {
    setTimeAvailable(time);
    if (selectedCategory) {
      const exercises = EXERCISES[selectedCategory][time];
      setCurrentExercise(exercises[0]);
      setStep("exercise");
    }
  };

  const handleBack = () => {
    switch (step) {
      case "category":
        setStep("intro");
        break;
      case "level":
        setStep("category");
        break;
      case "time":
        setStep("level");
        break;
      case "exercise":
        setStep("time");
        setExerciseStep(0);
        break;
    }
  };

  const getStressLevelText = (level: number) => {
    if (level <= 3) return "Leicht belastet";
    if (level <= 6) return "Mäßig gestresst";
    return "Stark belastet";
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-3">
            {step !== "intro" && (
              <Button variant="ghost" size="icon" onClick={handleBack} className="h-8 w-8">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            )}
            <div className="flex items-center gap-3">
              <img 
                src="/lovable-uploads/3727d5ef-df7c-4530-816d-fb296efccd59.png" 
                alt="Hugo" 
                className="w-10 h-10 object-contain"
              />
              <DialogTitle className="text-xl">
                {step === "intro" && "Hallo, ich bin Hugo!"}
                {step === "category" && "Was beschäftigt dich?"}
                {step === "level" && "Wie stark belastet dich das?"}
                {step === "time" && "Wie viel Zeit hast du?"}
                {step === "exercise" && currentExercise?.title}
              </DialogTitle>
            </div>
          </div>
        </DialogHeader>

        <div className="py-4">
          {/* Intro Step */}
          {step === "intro" && (
            <div className="space-y-4 text-center">
              <p className="text-muted-foreground">
                Ich bin dein persönlicher Coping-Begleiter. Bedrückt dich gerade etwas?
              </p>
              <div className="flex flex-col gap-3 pt-4">
                <Button 
                  onClick={() => setStep("category")} 
                  className="w-full"
                  size="lg"
                >
                  Ja, ich brauche Unterstützung
                </Button>
                <Button 
                  variant="outline" 
                  onClick={handleClose}
                  className="w-full"
                >
                  Nein, mir geht es gut 😊
                </Button>
              </div>
            </div>
          )}

          {/* Category Selection */}
          {step === "category" && (
            <div className="grid grid-cols-2 gap-3">
              {CATEGORIES.map((cat) => {
                const Icon = cat.icon;
                return (
                  <button
                    key={cat.id}
                    onClick={() => handleCategorySelect(cat.id)}
                    className={`p-4 rounded-xl border-2 transition-all hover:scale-105 ${cat.color} flex flex-col items-center gap-2`}
                  >
                    <Icon className="w-8 h-8" />
                    <span className="font-medium">{cat.label}</span>
                  </button>
                );
              })}
            </div>
          )}

          {/* Stress Level */}
          {step === "level" && (
            <div className="space-y-6">
              <div className="text-center">
                <div className="text-4xl font-bold text-primary mb-2">{stressLevel[0]}/10</div>
                <p className="text-muted-foreground">{getStressLevelText(stressLevel[0])}</p>
              </div>
              <Slider
                value={stressLevel}
                onValueChange={setStressLevel}
                max={10}
                min={1}
                step={1}
                className="py-4"
              />
              <Button 
                onClick={() => setStep("time")} 
                className="w-full"
                size="lg"
              >
                Weiter
              </Button>
            </div>
          )}

          {/* Time Selection */}
          {step === "time" && (
            <div className="space-y-3">
              <p className="text-muted-foreground text-center mb-4">
                Wähle eine Übung passend zu deiner verfügbaren Zeit:
              </p>
              {[
                { id: "short" as const, label: "Kurz", time: "2 Minuten", icon: "⚡" },
                { id: "medium" as const, label: "Mittel", time: "5 Minuten", icon: "🌟" },
                { id: "long" as const, label: "Ausführlich", time: "10 Minuten", icon: "🧘" },
              ].map((option) => (
                <button
                  key={option.id}
                  onClick={() => handleTimeSelect(option.id)}
                  className="w-full p-4 rounded-xl border-2 border-border hover:border-primary transition-all flex items-center gap-4"
                >
                  <span className="text-2xl">{option.icon}</span>
                  <div className="flex-1 text-left">
                    <div className="font-medium">{option.label}</div>
                    <div className="text-sm text-muted-foreground flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {option.time}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* Exercise */}
          {step === "exercise" && currentExercise && (
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                <div className="p-2 rounded-full bg-primary/10 text-primary">
                  {currentExercise.icon}
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{currentExercise.description}</p>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock className="w-3 h-3" />
                    {currentExercise.duration}
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <span>Schritt {exerciseStep + 1} von {currentExercise.steps.length}</span>
                </div>
                <div className="p-4 rounded-xl bg-primary/5 border border-primary/20 min-h-[80px] flex items-center justify-center">
                  <p className="text-center font-medium">{currentExercise.steps[exerciseStep]}</p>
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => setExerciseStep(Math.max(0, exerciseStep - 1))}
                  disabled={exerciseStep === 0}
                  className="flex-1"
                >
                  Zurück
                </Button>
                {exerciseStep < currentExercise.steps.length - 1 ? (
                  <Button
                    onClick={() => setExerciseStep(exerciseStep + 1)}
                    className="flex-1"
                  >
                    Weiter
                  </Button>
                ) : (
                  <Button
                    onClick={handleExerciseComplete}
                    className="flex-1 bg-green-600 hover:bg-green-700"
                  >
                    Fertig! 🎉
                  </Button>
                )}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CopingPlanDialog;

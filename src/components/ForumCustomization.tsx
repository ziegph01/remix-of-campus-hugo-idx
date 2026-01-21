import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Paintbrush, Lock, Check, Image, Type, Frame } from "lucide-react";
import { getUserBadges, getUserExp, getUserLevel } from "./BadgeSystem";
import { toast } from "@/hooks/use-toast";

interface ForumCustomizationProps {
  forumBackground: string | null;
  forumTextColor: string | null;
  forumBorderColor: string | null;
  onBackgroundChange: (bg: string | null) => void;
  onTextColorChange: (color: string | null) => void;
  onBorderColorChange: (color: string | null) => void;
  isGuest: boolean;
}

// Border colors unlocked at different percentages
const BORDER_COLORS = [
  { percent: 10, color: "#3b82f6", name: "Blau" },
  { percent: 20, color: "#8b5cf6", name: "Violett" },
  { percent: 30, color: "#ec4899", name: "Pink" },
  { percent: 40, color: "#ef4444", name: "Rot" },
  { percent: 50, color: "#f97316", name: "Orange" },
  { percent: 60, color: "#eab308", name: "Gelb" },
  { percent: 70, color: "#22c55e", name: "Grün" },
  { percent: 80, color: "#14b8a6", name: "Türkis" },
  { percent: 90, color: "#06b6d4", name: "Cyan" },
  { percent: 100, color: "linear-gradient(135deg, #f59e0b, #ec4899, #8b5cf6)", name: "Regenbogen" },
];

const TEXT_COLORS = [
  { color: "#ffffff", name: "Weiß" },
  { color: "#fbbf24", name: "Gold" },
  { color: "#a78bfa", name: "Lavendel" },
  { color: "#34d399", name: "Mint" },
  { color: "#f472b6", name: "Rosa" },
];

const ForumCustomization = ({
  forumBackground,
  forumTextColor,
  forumBorderColor,
  onBackgroundChange,
  onTextColorChange,
  onBorderColorChange,
  isGuest,
}: ForumCustomizationProps) => {
  const [open, setOpen] = useState(false);
  const badges = getUserBadges();
  const totalBadges = badges.length;
  const unlockedBadges = badges.filter(b => b.unlocked).length;
  const badgePercent = Math.floor((unlockedBadges / totalBadges) * 100);

  const canChangeBackground = badgePercent >= 10;
  const canChangeTextColor = badgePercent >= 50;

  const handleBackgroundUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        onBackgroundChange(base64);
        localStorage.setItem("forumBackground", base64);
        toast({ title: "Hintergrund geändert", description: "Dein Forum-Hintergrund wurde aktualisiert." });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveBackground = () => {
    onBackgroundChange(null);
    localStorage.removeItem("forumBackground");
    toast({ title: "Hintergrund entfernt", description: "Der Forum-Hintergrund wurde zurückgesetzt." });
  };

  const handleTextColorChange = (color: string | null) => {
    onTextColorChange(color);
    if (color) {
      localStorage.setItem("forumTextColor", color);
    } else {
      localStorage.removeItem("forumTextColor");
    }
    toast({ title: "Textfarbe geändert", description: "Deine Forum-Textfarbe wurde aktualisiert." });
  };

  const handleBorderColorChange = (color: string | null) => {
    onBorderColorChange(color);
    if (color) {
      localStorage.setItem("forumBorderColor", color);
    } else {
      localStorage.removeItem("forumBorderColor");
    }
    toast({ title: "Rahmenfarbe geändert", description: "Deine Profil-Rahmenfarbe wurde aktualisiert." });
  };

  if (isGuest) return null;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8" title="Forum personalisieren">
          <Paintbrush className="w-4 h-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Paintbrush className="w-5 h-5 text-primary" />
            Forum personalisieren
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6 pt-4">
          {/* Progress indicator */}
          <div className="bg-muted/50 rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-foreground">Dein Fortschritt</span>
              <span className="text-sm text-primary font-bold">{badgePercent}% der Badges</span>
            </div>
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <div 
                className="h-full bg-primary transition-all duration-500"
                style={{ width: `${badgePercent}%` }}
              />
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              {unlockedBadges} von {totalBadges} Badges freigeschaltet
            </p>
          </div>

          {/* Background customization - 10% */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Image className="w-4 h-4 text-primary" />
              <h3 className="font-semibold text-foreground">Hintergrundbild</h3>
              {!canChangeBackground && (
                <span className="ml-auto flex items-center gap-1 text-xs text-muted-foreground bg-muted px-2 py-1 rounded-full">
                  <Lock className="w-3 h-3" /> 10% Badges
                </span>
              )}
            </div>
            
            {canChangeBackground ? (
              <div className="space-y-3">
                <Input
                  type="file"
                  accept="image/*"
                  onChange={handleBackgroundUpload}
                  className="cursor-pointer"
                />
                {forumBackground && (
                  <div className="space-y-2">
                    <div className="relative w-full h-20 rounded-lg overflow-hidden border border-border">
                      <img src={forumBackground} alt="Hintergrund" className="w-full h-full object-cover" />
                    </div>
                    <Button variant="outline" size="sm" className="w-full" onClick={handleRemoveBackground}>
                      Hintergrund entfernen
                    </Button>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground bg-muted/30 p-3 rounded-lg">
                Schalte 10% der Badges frei, um dein Forum-Hintergrundbild zu ändern.
              </p>
            )}
          </div>

          {/* Text color customization - 50% */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Type className="w-4 h-4 text-primary" />
              <h3 className="font-semibold text-foreground">Textfarbe</h3>
              {!canChangeTextColor && (
                <span className="ml-auto flex items-center gap-1 text-xs text-muted-foreground bg-muted px-2 py-1 rounded-full">
                  <Lock className="w-3 h-3" /> 50% Badges
                </span>
              )}
            </div>
            
            {canChangeTextColor ? (
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => handleTextColorChange(null)}
                  className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all ${
                    !forumTextColor ? "border-primary ring-2 ring-primary/30" : "border-border"
                  }`}
                  style={{ background: "linear-gradient(135deg, hsl(var(--foreground)) 50%, hsl(var(--muted-foreground)) 50%)" }}
                  title="Standard"
                >
                  {!forumTextColor && <Check className="w-4 h-4 text-primary-foreground" />}
                </button>
                {TEXT_COLORS.map((tc) => (
                  <button
                    key={tc.color}
                    onClick={() => handleTextColorChange(tc.color)}
                    className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all ${
                      forumTextColor === tc.color ? "border-primary ring-2 ring-primary/30" : "border-border"
                    }`}
                    style={{ backgroundColor: tc.color }}
                    title={tc.name}
                  >
                    {forumTextColor === tc.color && <Check className="w-4 h-4 text-gray-800" />}
                  </button>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground bg-muted/30 p-3 rounded-lg">
                Schalte 50% der Badges frei, um deine Textfarben zu ändern.
              </p>
            )}
          </div>

          {/* Border color customization - progressive */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Frame className="w-4 h-4 text-primary" />
              <h3 className="font-semibold text-foreground">Profil-Rahmenfarbe</h3>
            </div>
            
            <p className="text-xs text-muted-foreground">
              Schalte neue Rahmenfarben in 10%-Schritten frei. Andere können deine Rahmenfarbe sehen!
            </p>
            
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => handleBorderColorChange(null)}
                className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all ${
                  !forumBorderColor ? "border-primary ring-2 ring-primary/30" : "border-border"
                }`}
                style={{ backgroundColor: "transparent", borderColor: "hsl(var(--border))" }}
                title="Standard"
              >
                {!forumBorderColor && <Check className="w-4 h-4 text-foreground" />}
              </button>
              {BORDER_COLORS.map((bc) => {
                const isUnlocked = badgePercent >= bc.percent;
                const isSelected = forumBorderColor === bc.color;
                return (
                  <button
                    key={bc.color}
                    onClick={() => isUnlocked && handleBorderColorChange(bc.color)}
                    className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all relative ${
                      isSelected ? "ring-2 ring-primary/30" : ""
                    } ${!isUnlocked ? "opacity-40 cursor-not-allowed" : ""}`}
                    style={{ 
                      background: bc.color.includes("gradient") ? bc.color : bc.color,
                      borderColor: isSelected ? "hsl(var(--primary))" : "transparent"
                    }}
                    title={isUnlocked ? bc.name : `${bc.percent}% benötigt`}
                    disabled={!isUnlocked}
                  >
                    {isSelected && <Check className="w-4 h-4 text-white" />}
                    {!isUnlocked && <Lock className="w-3 h-3 text-white/80" />}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ForumCustomization;
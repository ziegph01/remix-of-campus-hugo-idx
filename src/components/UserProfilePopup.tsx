import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { UserPlus, UserMinus, Trophy } from "lucide-react";
import { getUserExp, getUserLevel, getUserBadges } from "./BadgeSystem";

interface UserProfile {
  name: string;
  image: string;
  bio?: string;
  studiengang?: string;
  semester?: number;
  isFriend?: boolean;
  isMentor?: boolean;
  isBerater?: boolean;
}

interface UserProfilePopupProps {
  user: UserProfile | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddFriend?: (name: string) => void;
  onRemoveFriend?: (name: string) => void;
  isGuest?: boolean;
}

// Mock bio texts for students
const mockBios: Record<string, string> = {
  "StellarSloth": "Katzenliebhaber 🐱 | Immer auf der Suche nach neuen Design-Trends | Kaffee > Schlaf",
  "NeonNomad": "Fotografiere gerne Sonnenuntergänge 🌅 | Motion Design Enthusiast",
  "PixelPhoenix": "Lost in space 🌌 | Creative coder | Sci-Fi Nerd",
  "ByteBard": "Bester Freund auf 4 Pfoten 🐕 | Backend Developer in Training",
  "CloudCrafter": "Bergsteiger & Coder ⛰️ | Open Source Fan",
  "WaveWizard": "Surfer at heart 🏄 | Learning Three.js",
  "DesignDragon": "Nachtmensch 🌃 | UI/UX obsessed | Immer am Lernen",
  "PixelPrincess": "Häschen-Mama 🐰 | Accessibility Advocate",
  "AdobeAstronaut": "Kunstliebhaber 🎨 | Print & Digital Design",
  "MotionMystic": "Waldspaziergang-Fan 🌲 | After Effects Wizard",
  "AnimationAlpha": "Kaffee-Sucht ☕ | Character Animator",
  "CodeComet": "Abstract thinker 🎨 | Full-stack curious",
  "DevDolphin": "Hamster-Dad 🐹 | React Developer",
  "WebWombat": "Plant parent 🌿 | CSS Enthusiast",
  "CreativeCloud": "Musik = Leben 🎵 | Portfolio-Perfektionist",
  "DesignDuo": "Bücherwurm 📚 | Type Lover",
  "UXUnicorn": "Katzen > Hunde (sorry!) 🐱 | Research Nerd",
  "DigitalDaisy": "Sunset chaser 🌅 | Looking for internships",
  "AgencyAce": "Dog person 🐕 | Agency life survivor",
  "WebWanderer": "Space nerd 🌌 | CSS Grid Master",
  "CSSChampion": "Mountain views ⛰️ | Frontend Developer",
};

const UserProfilePopup = ({
  user,
  open,
  onOpenChange,
  onAddFriend,
  onRemoveFriend,
  isGuest = false,
}: UserProfilePopupProps) => {
  const [isFriend, setIsFriend] = useState(user?.isFriend || false);

  // Update isFriend when user changes
  useEffect(() => {
    setIsFriend(user?.isFriend || false);
  }, [user]);

  const handleAddFriend = () => {
    if (user && onAddFriend) {
      onAddFriend(user.name);
      setIsFriend(true);
    }
  };

  const handleRemoveFriend = () => {
    if (user && onRemoveFriend) {
      onRemoveFriend(user.name);
      setIsFriend(false);
      onOpenChange(false);
    }
  };

  if (!user) return null;

  const bio = user.bio || mockBios[user.name] || (user.name === localStorage.getItem("username") ? (localStorage.getItem("profiltext") || "Noch kein Profiltext eingetragen 📝") : "Noch kein Profiltext eingetragen 📝");
  const showFriendButton = !user.isMentor && !user.isBerater && user.name !== localStorage.getItem("username");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="sr-only">Profil von {user.name}</DialogTitle>
        </DialogHeader>
        
        <div className="flex flex-col items-center text-center">
          {/* Large Profile Image */}
          <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-primary/20 mb-4 flex items-center justify-center bg-primary/10">
            {user.image ? (
              <img
                src={user.image}
                alt={user.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-4xl font-bold text-primary">
                {user.name.charAt(0).toUpperCase()}
              </span>
            )}
          </div>

          {/* Name */}
          <h2 className="text-xl font-bold text-foreground mb-1">{user.name}</h2>

          {/* Studiengang & Semester */}
          {user.studiengang && (
            <p className="text-sm text-muted-foreground mb-2">
              {user.studiengang}
              {user.semester && ` • ${user.semester}. Semester`}
            </p>
          )}

          {/* XP & Level Display */}
          {(() => {
            const exp = getUserExp();
            const { level } = getUserLevel(exp);
            const badges = getUserBadges();
            const unlockedCount = badges.filter(b => b.unlocked).length;
            return (
              <div className="flex items-center gap-2 mb-3">
                <div className="flex items-center gap-1.5 bg-primary/10 text-primary px-3 py-1 rounded-full text-sm font-medium">
                  <Trophy className="w-4 h-4" />
                  Level {level}
                </div>
                <div className="text-sm text-muted-foreground">
                  {exp} EXP • {unlockedCount} Badges
                </div>
              </div>
            );
          })()}

          {/* Bio */}
          <p className="text-foreground bg-muted/50 rounded-xl p-4 w-full mb-4">
            {bio}
          </p>

          {/* Friend Action Buttons */}
          {showFriendButton && (
            isGuest ? (
              <Button variant="outline" disabled className="w-full">
                Anmelden um Freunde hinzuzufügen
              </Button>
            ) : isFriend ? (
              <Button 
                variant="outline" 
                onClick={handleRemoveFriend} 
                className="w-full text-destructive hover:text-destructive hover:bg-destructive/10"
              >
                <UserMinus className="w-4 h-4 mr-2" />
                Freundschaft beenden
              </Button>
            ) : (
              <Button onClick={handleAddFriend} className="w-full bg-primary hover:bg-primary/90">
                <UserPlus className="w-4 h-4 mr-2" />
                Als Freund hinzufügen
              </Button>
            )
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default UserProfilePopup;
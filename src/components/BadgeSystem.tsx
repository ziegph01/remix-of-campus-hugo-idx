import { Trophy, MessageSquare, Calendar, Star, BookOpen, Heart, Flame, Award, Target, Zap, Wind, Brain, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export interface BadgeData {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  exp: number;
  unlocked: boolean;
  progress?: number;
  maxProgress?: number;
  color: string;
}

export const BADGES: Omit<BadgeData, 'unlocked' | 'progress'>[] = [
  {
    id: "first_login",
    name: "Willkommen!",
    description: "Erster Login in der App",
    icon: <Star className="w-5 h-5" />,
    exp: 10,
    color: "bg-yellow-500",
  },
  {
    id: "week_streak",
    name: "Wochenläufer",
    description: "7 Tage hintereinander eingeloggt",
    icon: <Flame className="w-5 h-5" />,
    exp: 50,
    maxProgress: 7,
    color: "bg-orange-500",
  },
  {
    id: "month_streak",
    name: "Monatsmeister",
    description: "30 Tage hintereinander eingeloggt",
    icon: <Trophy className="w-5 h-5" />,
    exp: 200,
    maxProgress: 30,
    color: "bg-amber-500",
  },
  {
    id: "first_forum_post",
    name: "Erste Worte",
    description: "Erster Beitrag im Forum",
    icon: <MessageSquare className="w-5 h-5" />,
    exp: 25,
    color: "bg-blue-500",
  },
  {
    id: "forum_regular",
    name: "Stammgast",
    description: "10 Beiträge im Forum",
    icon: <MessageSquare className="w-5 h-5" />,
    exp: 100,
    maxProgress: 10,
    color: "bg-indigo-500",
  },
  {
    id: "mood_tracker",
    name: "Stimmungsforscher",
    description: "7 Tage Stimmung getrackt",
    icon: <Heart className="w-5 h-5" />,
    exp: 50,
    maxProgress: 7,
    color: "bg-pink-500",
  },
  {
    id: "mood_master",
    name: "Emotionsexperte",
    description: "30 Tage Stimmung getrackt",
    icon: <Heart className="w-5 h-5" />,
    exp: 150,
    maxProgress: 30,
    color: "bg-rose-500",
  },
  {
    id: "calendar_starter",
    name: "Terminplaner",
    description: "Ersten Termin eingetragen",
    icon: <Calendar className="w-5 h-5" />,
    exp: 15,
    color: "bg-green-500",
  },
  {
    id: "article_reader",
    name: "Wissensdurstig",
    description: "5 Artikel gelesen",
    icon: <BookOpen className="w-5 h-5" />,
    exp: 40,
    maxProgress: 5,
    color: "bg-purple-500",
  },
  {
    id: "profile_complete",
    name: "Profi-Profil",
    description: "Profil vollständig ausgefüllt",
    icon: <Award className="w-5 h-5" />,
    exp: 30,
    color: "bg-teal-500",
  },
  {
    id: "grade_planner",
    name: "Notenkenner",
    description: "Erste Note eingetragen",
    icon: <Target className="w-5 h-5" />,
    exp: 20,
    color: "bg-cyan-500",
  },
  {
    id: "early_bird",
    name: "Frühaufsteher",
    description: "Vor 7 Uhr eingeloggt",
    icon: <Zap className="w-5 h-5" />,
    exp: 25,
    color: "bg-lime-500",
  },
  // Hugo Coping Badges
  {
    id: "first_hugo_exercise",
    name: "Hugos Freund",
    description: "Erste Übung mit Hugo abgeschlossen",
    icon: <Wind className="w-5 h-5" />,
    exp: 20,
    color: "bg-emerald-500",
  },
  {
    id: "hugo_regular",
    name: "Achtsamkeits-Profi",
    description: "10 Übungen mit Hugo abgeschlossen",
    icon: <Sparkles className="w-5 h-5" />,
    exp: 75,
    maxProgress: 10,
    color: "bg-violet-500",
  },
  {
    id: "hugo_master",
    name: "Coping-Meister",
    description: "25 Übungen mit Hugo abgeschlossen",
    icon: <Brain className="w-5 h-5" />,
    exp: 150,
    maxProgress: 25,
    color: "bg-fuchsia-500",
  },
  {
    id: "hugo_all_categories",
    name: "Ganzheitlich",
    description: "Übungen in allen 4 Kategorien gemacht",
    icon: <Award className="w-5 h-5" />,
    exp: 50,
    maxProgress: 4,
    color: "bg-sky-500",
  },
];

export const getUserBadges = (): BadgeData[] => {
  const unlockedBadges = JSON.parse(localStorage.getItem("unlockedBadges") || "{}");
  const badgeProgress = JSON.parse(localStorage.getItem("badgeProgress") || "{}");
  
  return BADGES.map(badge => ({
    ...badge,
    unlocked: !!unlockedBadges[badge.id],
    progress: badgeProgress[badge.id] || 0,
  }));
};

export const unlockBadge = (badgeId: string): boolean => {
  const unlockedBadges = JSON.parse(localStorage.getItem("unlockedBadges") || "{}");
  if (unlockedBadges[badgeId]) return false;
  
  unlockedBadges[badgeId] = true;
  localStorage.setItem("unlockedBadges", JSON.stringify(unlockedBadges));
  
  // Add EXP
  const badge = BADGES.find(b => b.id === badgeId);
  if (badge) {
    const currentExp = parseInt(localStorage.getItem("userExp") || "0");
    localStorage.setItem("userExp", String(currentExp + badge.exp));
  }
  
  return true;
};

export const updateBadgeProgress = (badgeId: string, progress: number) => {
  const badgeProgress = JSON.parse(localStorage.getItem("badgeProgress") || "{}");
  badgeProgress[badgeId] = progress;
  localStorage.setItem("badgeProgress", JSON.stringify(badgeProgress));
  
  // Check if badge should be unlocked
  const badge = BADGES.find(b => b.id === badgeId);
  if (badge && badge.maxProgress && progress >= badge.maxProgress) {
    unlockBadge(badgeId);
  }
};

export const getUserExp = (): number => {
  return parseInt(localStorage.getItem("userExp") || "0");
};

export const getUserLevel = (exp: number): { level: number; currentExp: number; nextLevelExp: number } => {
  // Each level requires progressively more EXP
  let level = 1;
  let expNeeded = 100;
  let totalExpForLevel = 0;
  
  while (exp >= totalExpForLevel + expNeeded) {
    totalExpForLevel += expNeeded;
    level++;
    expNeeded = Math.floor(expNeeded * 1.5);
  }
  
  return {
    level,
    currentExp: exp - totalExpForLevel,
    nextLevelExp: expNeeded,
  };
};

interface BadgeCardProps {
  badge: BadgeData;
  size?: "sm" | "md";
}

export const BadgeCard = ({ badge, size = "md" }: BadgeCardProps) => {
  const isSmall = size === "sm";
  
  return (
    <div 
      className={`relative rounded-2xl border transition-all duration-300 ${
        badge.unlocked 
          ? "bg-card border-border shadow-md hover:shadow-lg" 
          : "bg-muted/50 border-border/30 opacity-60"
      } ${isSmall ? "p-3" : "p-4"}`}
    >
      <div className="flex flex-col items-center text-center gap-2">
        <div className={`${isSmall ? "w-10 h-10" : "w-12 h-12"} rounded-xl flex items-center justify-center ${
          badge.unlocked ? badge.color : "bg-muted"
        } text-white shadow-sm`}>
          {badge.icon}
        </div>
        <div>
          <h4 className={`font-semibold text-foreground ${isSmall ? "text-xs" : "text-sm"}`}>
            {badge.name}
          </h4>
          {!isSmall && (
            <p className="text-xs text-muted-foreground mt-0.5">
              {badge.description}
            </p>
          )}
        </div>
        
        {/* Progress bar for badges with progress */}
        {badge.maxProgress && !badge.unlocked && (
          <div className="w-full mt-1">
            <div className="h-1.5 bg-muted rounded-full overflow-hidden">
              <div 
                className={`h-full ${badge.color} transition-all duration-500`}
                style={{ width: `${Math.min(100, ((badge.progress || 0) / badge.maxProgress) * 100)}%` }}
              />
            </div>
            <p className="text-[10px] text-muted-foreground mt-1">
              {badge.progress || 0}/{badge.maxProgress}
            </p>
          </div>
        )}
        
        {/* EXP Badge */}
        <Badge 
          variant={badge.unlocked ? "default" : "secondary"} 
          className={`text-[10px] ${isSmall ? "px-1.5 py-0" : ""}`}
        >
          +{badge.exp} EXP
        </Badge>
      </div>
      
      {/* Unlocked indicator */}
      {badge.unlocked && (
        <div className="absolute -top-1 -right-1 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center shadow-sm">
          <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
          </svg>
        </div>
      )}
    </div>
  );
};

const BadgeSystem = () => {
  const badges = getUserBadges();
  const exp = getUserExp();
  const { level, currentExp, nextLevelExp } = getUserLevel(exp);
  const unlockedCount = badges.filter(b => b.unlocked).length;
  
  return (
    <div className="space-y-6">
      {/* Level & EXP Overview */}
      <div className="bg-gradient-to-br from-primary/20 to-primary/5 rounded-2xl p-6 border border-primary/20">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 bg-primary rounded-xl flex items-center justify-center shadow-lg">
              <span className="text-2xl font-bold text-primary-foreground">{level}</span>
            </div>
            <div>
              <h3 className="text-lg font-bold text-foreground">Level {level}</h3>
              <p className="text-sm text-muted-foreground">{exp} EXP gesammelt</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-primary">{unlockedCount}/{badges.length}</p>
            <p className="text-xs text-muted-foreground">Badges</p>
          </div>
        </div>
        
        {/* Progress to next level */}
        <div>
          <div className="flex justify-between text-xs text-muted-foreground mb-1">
            <span>Fortschritt zu Level {level + 1}</span>
            <span>{currentExp}/{nextLevelExp} EXP</span>
          </div>
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <div 
              className="h-full bg-primary transition-all duration-500"
              style={{ width: `${(currentExp / nextLevelExp) * 100}%` }}
            />
          </div>
        </div>
      </div>
      
      {/* Badges Grid */}
      <div>
        <h3 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
          <Trophy className="w-5 h-5 text-primary" />
          Deine Badges
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {badges.map(badge => (
            <BadgeCard key={badge.id} badge={badge} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default BadgeSystem;

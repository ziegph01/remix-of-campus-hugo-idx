import { Users, GraduationCap, Heart, BookOpen, Settings, Lock, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import { useCoping } from "@/contexts/CopingContext";

interface QuickCard {
  id: string;
  icon: React.ReactNode;
  title: string;
  description: string;
  href?: string;
  color: string;
  guestAllowed: boolean;
  action?: "openCoping";
}

const cards: QuickCard[] = [
  {
    id: "coping",
    icon: <Sparkles className="w-5 h-5" />,
    title: "Coping Begleiter",
    description: "Übungen für dein Wohlbefinden",
    color: "bg-primary/10 text-primary",
    guestAllowed: true,
    action: "openCoping",
  },
  {
    id: "forum",
    icon: <Users className="w-5 h-5" />,
    title: "Forum",
    description: "Tausche dich mit anderen Studierenden aus",
    href: "/forum",
    color: "bg-primary/10 text-primary",
    guestAllowed: true,
  },
  {
    id: "berater",
    icon: <Heart className="w-5 h-5" />,
    title: "Beratung",
    description: "Professionelle Unterstützung finden",
    href: "/berater",
    color: "bg-primary/10 text-primary",
    guestAllowed: true,
  },
  {
    id: "noten",
    icon: <GraduationCap className="w-5 h-5" />,
    title: "Notenplaner",
    description: "Behalte dein Studium im Blick",
    href: "/notenplaner",
    color: "bg-primary/10 text-primary",
    guestAllowed: false,
  },
  {
    id: "artikel",
    icon: <BookOpen className="w-5 h-5" />,
    title: "Wissen",
    description: "Hilfreiche Artikel & Tipps",
    href: "/artikel",
    color: "bg-primary/10 text-primary",
    guestAllowed: true,
  },
  {
    id: "du",
    icon: <Settings className="w-5 h-5" />,
    title: "Dein Profil",
    description: "Badges sammeln & EXP verdienen",
    href: "/einstellungen",
    color: "bg-primary/10 text-primary",
    guestAllowed: false,
  },
];

interface QuickAccessCardsProps {
  isGuest?: boolean;
}

const QuickAccessCards = ({ isGuest = false }: QuickAccessCardsProps) => {
  const { openCopingDialog } = useCoping();

  return (
    <div className="flex gap-3 overflow-x-auto pb-2 -mx-4 px-4 md:mx-0 md:px-0 md:grid md:grid-cols-6 md:overflow-visible">
      {cards.map((card, index) => {
        const isLocked = isGuest && !card.guestAllowed;
        
        if (isLocked) {
          return (
            <div
              key={card.id}
              className="flex-shrink-0 w-28 md:w-auto group bg-card/60 rounded-2xl p-4 shadow-sm border border-border/50 opacity-60 cursor-not-allowed"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <div className="flex flex-col items-center text-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center relative">
                  {card.icon}
                  <Lock className="w-3 h-3 absolute -bottom-0.5 -right-0.5 text-muted-foreground" />
                </div>
                <div>
                  <h4 className="text-muted-foreground text-sm">{card.title}</h4>
                  <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2 hidden md:block">
                    {card.description}
                  </p>
                </div>
              </div>
            </div>
          );
        }

        // Handle action cards (like Coping Begleiter)
        if (card.action === "openCoping") {
          return (
            <button
              key={card.id}
              onClick={openCopingDialog}
              className="flex-shrink-0 w-28 md:w-auto group bg-card rounded-2xl p-4 shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border border-border/50 text-left"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <div className="flex flex-col items-center text-center gap-3">
                <div className={`w-10 h-10 rounded-xl ${card.color} flex items-center justify-center transition-transform group-hover:scale-110`}>
                  {card.icon}
                </div>
                <div>
                  <h4 className="text-foreground text-sm">{card.title}</h4>
                  <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2 hidden md:block">
                    {card.description}
                  </p>
                </div>
              </div>
            </button>
          );
        }
        
        const guestSuffix = isGuest ? "?guest=true" : "";
        const targetHref = isGuest && card.guestAllowed ? `${card.href}${guestSuffix}` : card.href || "/";
        
        return (
          <Link
            key={card.id}
            to={targetHref}
            className="flex-shrink-0 w-28 md:w-auto group bg-card rounded-2xl p-4 shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border border-border/50"
            style={{ animationDelay: `${index * 50}ms` }}
          >
            <div className="flex flex-col items-center text-center gap-3">
              <div className={`w-10 h-10 rounded-xl ${card.color} flex items-center justify-center transition-transform group-hover:scale-110`}>
                {card.icon}
              </div>
              <div>
                <h4 className="text-foreground text-sm">{card.title}</h4>
                <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2 hidden md:block">
                  {card.description}
                </p>
              </div>
            </div>
          </Link>
        );
      })}
    </div>
  );
};

export default QuickAccessCards;
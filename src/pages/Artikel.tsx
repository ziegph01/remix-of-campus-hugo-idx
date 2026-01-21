import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Clock, Brain, Heart, Timer, BookOpen, Lightbulb, Coffee, Filter } from "lucide-react";
import { Link } from "react-router-dom";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface Article {
  id: string;
  title: string;
  excerpt: string;
  category: string;
  readTime: string;
  icon: React.ReactNode;
}

const articles: Article[] = [
  {
    id: "1",
    title: "5 Tipps für effektives Lernen vor der Klausur",
    excerpt: "Wissenschaftlich bewährte Methoden, die dir helfen, Stoff besser zu behalten und Prüfungsangst zu reduzieren.",
    category: "Lernen",
    readTime: "3 Min",
    icon: <Brain className="w-5 h-5" />,
  },
  {
    id: "2",
    title: "Work-Life-Balance im Studium",
    excerpt: "Wie du Studium, Nebenjob und Freizeit unter einen Hut bekommst - ohne auszubrennen.",
    category: "Wellness",
    readTime: "4 Min",
    icon: <Heart className="w-5 h-5" />,
  },
  {
    id: "3",
    title: "Die Pomodoro-Technik erklärt",
    excerpt: "25 Minuten fokussiert arbeiten, 5 Minuten Pause. Warum diese einfache Methode so effektiv ist.",
    category: "Produktivität",
    readTime: "2 Min",
    icon: <Timer className="w-5 h-5" />,
  },
  {
    id: "4",
    title: "Richtig Notizen machen",
    excerpt: "Cornell-Methode, Mind-Maps oder klassisch? Finde heraus, welcher Stil zu dir passt.",
    category: "Lernen",
    readTime: "5 Min",
    icon: <BookOpen className="w-5 h-5" />,
  },
  {
    id: "5",
    title: "Motivation finden wenn alles schwer fällt",
    excerpt: "Praktische Strategien für die Tage, an denen du einfach nicht kannst.",
    category: "Wellness",
    readTime: "3 Min",
    icon: <Lightbulb className="w-5 h-5" />,
  },
  {
    id: "6",
    title: "Koffein & Konzentration",
    excerpt: "Wie viel Kaffee ist okay? Die Wissenschaft hinter deinem Lieblingswachmacher.",
    category: "Gesundheit",
    readTime: "3 Min",
    icon: <Coffee className="w-5 h-5" />,
  },
];

const categories = ["Alle", "Lernen", "Wellness", "Produktivität", "Gesundheit"];

const categoryColors: Record<string, string> = {
  "Lernen": "bg-secondary text-secondary-foreground",
  "Wellness": "bg-secondary text-secondary-foreground",
  "Produktivität": "bg-secondary text-secondary-foreground",
  "Gesundheit": "bg-secondary text-secondary-foreground",
};

const Artikel = () => {
  const [searchParams] = useSearchParams();
  const isGuest = searchParams.get("guest") === "true";
  const guestSuffix = isGuest ? "?guest=true" : "";
  
  const [activeFilter, setActiveFilter] = useState("Alle");

  const filteredArticles = activeFilter === "Alle" 
    ? articles 
    : articles.filter(a => a.category === activeFilter);

  return (
    <div className="min-h-screen bg-background">
      <Header isGuest={isGuest} />
      
      <main className="page-container py-6 md:py-8">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
            <BookOpen className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-foreground">Wissen</h1>
            <p className="text-muted-foreground">Hilfreiche Tipps für dein Studium</p>
          </div>
        </div>

      
        {/* Filter */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-3">
            <Filter className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm font-medium text-muted-foreground">Filter:</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <Button
                key={category}
                variant={activeFilter === category ? "default" : "outline"}
                size="sm"
                onClick={() => setActiveFilter(category)}
                className="rounded-full"
              >
                {category}
              </Button>
            ))}
          </div>
        </div>

        <div className="grid gap-4">
          {filteredArticles.map((article, index) => (
            <Link
              key={article.id}
              to={`/artikel/${article.id}${guestSuffix}`}
              className="bg-card rounded-xl p-5 shadow-md hover:shadow-lg transition-all duration-300 group animate-fade-in border border-border/50"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="flex gap-4">
                <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0 group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                  {article.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="secondary" className={categoryColors[article.category]}>
                      {article.category}
                    </Badge>
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {article.readTime}
                    </span>
                  </div>
                  <h3 className="text-foreground mb-1 group-hover:text-primary transition-colors">
                    {article.title}
                  </h3>
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {article.excerpt}
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {filteredArticles.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            Keine Artikel in dieser Kategorie gefunden.
          </div>
        )}
      </main>
    </div>
  );
};

export default Artikel;
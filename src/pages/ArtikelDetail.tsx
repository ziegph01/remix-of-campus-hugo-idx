import { ArrowLeft, Clock, Brain, Heart, Timer, BookOpen, Lightbulb, Coffee, CheckCircle2 } from "lucide-react";
import { Link, useParams, Navigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useState, useEffect } from "react";
import useBadgeTracking from "@/hooks/useBadgeTracking";

interface Exercise {
  id: string;
  title: string;
  description: string;
}

interface Article {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  category: string;
  readTime: string;
  icon: React.ReactNode;
  exercises: Exercise[];
}

const articles: Article[] = [
  {
    id: "1",
    title: "5 Tipps für effektives Lernen vor der Klausur",
    excerpt: "Wissenschaftlich bewährte Methoden, die dir helfen, Stoff besser zu behalten und Prüfungsangst zu reduzieren.",
    content: `Die Klausurphase ist für viele Studierende die stressigste Zeit des Semesters. Doch mit den richtigen Strategien kannst du effizienter lernen und gleichzeitig entspannter bleiben.

**1. Aktives Lernen statt passives Lesen**
Statt Texte nur durchzulesen, versuche das Gelernte in eigenen Worten zusammenzufassen. Erkläre den Stoff einer imaginären Person oder nutze die Feynman-Technik.

**2. Verteiltes Lernen**
Lerne lieber regelmäßig in kürzeren Einheiten als alles auf einmal. Das sogenannte "Spacing" verbessert die Langzeitspeicherung erheblich.

**3. Ausreichend Schlaf**
Dein Gehirn verarbeitet und festigt Gelerntes im Schlaf. Mindestens 7 Stunden sind ideal, besonders in der Lernphase.

**4. Pausen einplanen**
Nach 45-50 Minuten konzentriertem Lernen solltest du eine kurze Pause einlegen. Ein kurzer Spaziergang oder Stretching hilft, den Kopf frei zu bekommen.

**5. Prüfungsähnliche Bedingungen üben**
Teste dich selbst unter realistischen Bedingungen. Das reduziert Prüfungsangst und zeigt dir, wo noch Lücken sind.`,
    category: "Lernen",
    readTime: "3 Min",
    icon: <Brain className="w-6 h-6" />,
    exercises: [
      { id: "1a", title: "Feynman-Technik", description: "Wähle ein Thema aus deinem Studium und erkläre es laut, als würdest du es einem Kind erklären. Notiere, wo du ins Stocken gerätst." },
      { id: "1b", title: "Lernplan erstellen", description: "Erstelle für die nächste Woche einen Lernplan mit 3-4 kurzen Einheiten pro Tag statt einer langen." },
    ],
  },
  {
    id: "2",
    title: "Work-Life-Balance im Studium",
    excerpt: "Wie du Studium, Nebenjob und Freizeit unter einen Hut bekommst - ohne auszubrennen.",
    content: `Balance zu finden ist eine Kunst, die im Studium besonders wichtig ist. Hier sind praktische Tipps für ein ausgeglicheneres Leben.

**Grenzen setzen lernen**
Es ist okay, nicht zu jeder Gruppenarbeit Ja zu sagen. Lerne, deine Zeit zu priorisieren und kommuniziere klar deine Grenzen.

**Feste Freizeit einplanen**
Behandle deine Freizeit genauso verbindlich wie Vorlesungstermine. Block dir Zeit für Hobbys, Freunde und Erholung.

**Nebenjob realistisch einschätzen**
Mehr als 15-20 Stunden Arbeit pro Woche können dein Studium stark beeinträchtigen. Prüfe, ob es Alternativen wie BAföG oder Stipendien gibt.

**Digital Detox**
Plane bewusste Zeiten ohne Smartphone und Social Media. Das reduziert Stress und verbessert deine Konzentrationsfähigkeit.

**Unterstützung suchen**
Bei Überforderung ist es keine Schwäche, Hilfe zu suchen. Nutze die psychologische Beratung deiner Hochschule.`,
    category: "Wellness",
    readTime: "4 Min",
    icon: <Heart className="w-6 h-6" />,
    exercises: [
      { id: "2a", title: "Wochenreflexion", description: "Schreibe auf, wie viele Stunden du diese Woche für Studium, Arbeit und Freizeit verwendet hast. Wo möchtest du Änderungen vornehmen?" },
      { id: "2b", title: "Nein-Sagen üben", description: "Überlege dir 3 Situationen, in denen du diese Woche höflich Nein sagen könntest, um Zeit für dich zu gewinnen." },
    ],
  },
  {
    id: "3",
    title: "Die Pomodoro-Technik erklärt",
    excerpt: "25 Minuten fokussiert arbeiten, 5 Minuten Pause. Warum diese einfache Methode so effektiv ist.",
    content: `Die Pomodoro-Technik ist eine der beliebtesten Produktivitätsmethoden. Entwickelt von Francesco Cirillo in den 1980ern, ist sie heute aktueller denn je.

**So funktioniert es:**
1. Wähle eine Aufgabe aus
2. Stelle einen Timer auf 25 Minuten
3. Arbeite fokussiert bis der Timer klingelt
4. Mache 5 Minuten Pause
5. Nach 4 "Pomodoros": längere Pause (15-30 Min)

**Warum es funktioniert:**
- Zeitdruck motiviert zum Fokus
- Regelmäßige Pausen verhindern Erschöpfung
- Aufgaben wirken weniger überwältigend
- Du lernst, Zeit besser einzuschätzen

**Tipps für Anfänger:**
Wenn 25 Minuten zu lang erscheinen, starte mit 15 Minuten. Wichtig ist die Konsistenz, nicht die Perfektion.`,
    category: "Produktivität",
    readTime: "2 Min",
    icon: <Timer className="w-6 h-6" />,
    exercises: [
      { id: "3a", title: "Erste Pomodoro-Session", description: "Probiere jetzt gleich eine 25-Minuten-Session aus. Stelle einen Timer und arbeite an einer konkreten Aufgabe." },
      { id: "3b", title: "Pomodoro-Tracker", description: "Führe heute eine Strichliste, wie viele Pomodoros du schaffst. Ziel: mindestens 4." },
    ],
  },
  {
    id: "4",
    title: "Richtig Notizen machen",
    excerpt: "Cornell-Methode, Mind-Maps oder klassisch? Finde heraus, welcher Stil zu dir passt.",
    content: `Gute Notizen sind der Schlüssel zum erfolgreichen Lernen. Hier findest du verschiedene Methoden im Überblick.

**Die Cornell-Methode**
Teile dein Blatt in drei Bereiche: Hauptnotizen, Schlüsselwörter am Rand und Zusammenfassung unten. Ideal für Vorlesungen!

**Mind-Maps**
Perfekt für visuelle Lerner. Starte mit einem zentralen Thema und verzweige in Unterthemen. Nutze Farben und Symbole.

**Bullet-Points**
Schnell und effizient. Ideal für strukturierte Informationen und Listen. Nutze Einrückungen für Hierarchien.

**Sketch-Notes**
Kombiniere Text mit kleinen Zeichnungen. Das aktiviert beide Gehirnhälften und verbessert die Merkfähigkeit.

**Digital vs. Handschriftlich**
Studien zeigen: Handschriftliche Notizen werden besser erinnert. Aber digitale Tools haben Vorteile bei Organisation und Suche. Finde deinen Mix!`,
    category: "Lernen",
    readTime: "5 Min",
    icon: <BookOpen className="w-6 h-6" />,
    exercises: [
      { id: "4a", title: "Cornell ausprobieren", description: "Teile ein Blatt wie beschrieben auf und nutze es für deine nächste Vorlesung oder beim Lesen eines Textes." },
      { id: "4b", title: "Mini-Mind-Map", description: "Erstelle eine Mind-Map zu einem Thema, das du gerade lernst. Verwende mindestens 3 Farben." },
    ],
  },
  {
    id: "5",
    title: "Motivation finden wenn alles schwer fällt",
    excerpt: "Praktische Strategien für die Tage, an denen du einfach nicht kannst.",
    content: `Jeder kennt diese Tage, an denen nichts zu funktionieren scheint. Hier sind Strategien, die wirklich helfen.

**Akzeptiere schlechte Tage**
Es ist menschlich, nicht jeden Tag produktiv zu sein. Selbstmitgefühl ist wichtiger als Selbstkritik.

**Die 2-Minuten-Regel**
Wenn du keine Motivation hast, fang mit nur 2 Minuten an. Oft kommt die Motivation während des Tuns.

**Kleine Erfolge feiern**
Jeder noch so kleine Schritt zählt. Führe eine "Done-Liste" statt nur einer To-Do-Liste.

**Dein Warum finden**
Erinnere dich, warum du studierst. Was ist dein größeres Ziel? Visualisiere deinen Erfolg.

**Umgebung wechseln**
Manchmal hilft ein neuer Ort. Probiere die Bibliothek, ein Café oder einen anderen Raum aus.

**Bewegung hilft immer**
Selbst ein kurzer Spaziergang kann Wunder wirken. Bewegung setzt Endorphine frei und klärt den Kopf.`,
    category: "Wellness",
    readTime: "3 Min",
    icon: <Lightbulb className="w-6 h-6" />,
    exercises: [
      { id: "5a", title: "2-Minuten-Start", description: "Wähle eine Aufgabe, die du aufschiebst. Arbeite genau 2 Minuten daran - dann darfst du aufhören (oder weitermachen!)." },
      { id: "5b", title: "Done-Liste", description: "Schreibe heute Abend 5 Dinge auf, die du heute geschafft hast - egal wie klein." },
    ],
  },
  {
    id: "6",
    title: "Koffein & Konzentration",
    excerpt: "Wie viel Kaffee ist okay? Die Wissenschaft hinter deinem Lieblingswachmacher.",
    content: `Kaffee ist das Lieblingsgetränk vieler Studierender. Aber wie nutzt du Koffein am effektivsten?

**Die optimale Dosis**
Etwa 100-200mg Koffein (1-2 Tassen Kaffee) verbessern Konzentration und Wachheit. Mehr ist nicht unbedingt besser!

**Timing ist alles**
Der beste Zeitpunkt für Kaffee: 9:30-11:30 Uhr und 13:30-17:00 Uhr. Vermeide Koffein nach 14 Uhr für besseren Schlaf.

**Der Koffein-Nap**
Ein Espresso vor einem 20-minütigen Powernap? Das funktioniert! Das Koffein wirkt genau dann, wenn du aufwachst.

**Toleranz beachten**
Bei täglichem Konsum baut sich Toleranz auf. Gelegentliche "Koffein-Pausen" können die Wirkung wiederherstellen.

**Alternativen**
Grüner Tee enthält L-Theanin, das für sanftere, längere Wachheit sorgt. Auch Bewegung und frische Luft machen wach!

**Hydration nicht vergessen**
Koffein wirkt leicht entwässernd. Trinke zu jeder Tasse Kaffee ein Glas Wasser.`,
    category: "Gesundheit",
    readTime: "3 Min",
    icon: <Coffee className="w-6 h-6" />,
    exercises: [
      { id: "6a", title: "Koffein-Tagebuch", description: "Notiere heute jede Tasse Kaffee/Tee mit Uhrzeit. Beobachte, wie es deinen Schlaf beeinflusst." },
      { id: "6b", title: "Koffein-Nap testen", description: "Probiere den Koffein-Nap: Trink einen Espresso, stelle einen 20-Min-Timer und leg dich hin." },
    ],
  },
];

const categoryColors: Record<string, string> = {
  "Lernen": "bg-primary/10 text-primary",
  "Wellness": "bg-accent/10 text-accent",
  "Produktivität": "bg-secondary text-secondary-foreground",
  "Gesundheit": "bg-feature-mood/20 text-foreground",
};

const ArtikelDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const isGuest = searchParams.get("guest") === "true";
  const guestSuffix = isGuest ? "?guest=true" : "";
  const { trackArticleRead } = useBadgeTracking();
  
  const article = articles.find((a) => a.id === id);
  const [completedExercises, setCompletedExercises] = useState<string[]>([]);

  // Track article read on mount
  useEffect(() => {
    if (id) {
      trackArticleRead(id);
    }
  }, [id, trackArticleRead]);

  if (!article) {
    return <Navigate to={`/artikel${guestSuffix}`} replace />;
  }

  const toggleExercise = (exerciseId: string) => {
    setCompletedExercises(prev => 
      prev.includes(exerciseId) 
        ? prev.filter(id => id !== exerciseId)
        : [...prev, exerciseId]
    );
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-card border-b border-border sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center gap-4">
          <Link to={`/artikel${guestSuffix}`}>
            <Button variant="ghost" size="icon">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div className="flex items-center gap-3">
            <Badge variant="secondary" className={categoryColors[article.category]}>
              {article.category}
            </Badge>
            <span className="text-sm text-muted-foreground flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {article.readTime}
            </span>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="flex items-center gap-5 mb-8">
          <div className="w-16 h-16 md:w-20 md:h-20 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
            {article.icon}
          </div>
          <h1 className="text-2xl md:text-3xl font-semibold leading-tight">
            {article.title}
          </h1>
        </div>

        <div className="prose prose-lg max-w-none mb-12">
          {article.content.split('\n\n').map((paragraph, index) => {
            if (paragraph.startsWith('**') && paragraph.endsWith('**')) {
              return (
                <h3 key={index} className="text-lg font-semibold text-headline mt-6 mb-2">
                  {paragraph.replace(/\*\*/g, '')}
                </h3>
              );
            }
            if (paragraph.includes('**')) {
              const parts = paragraph.split(/(\*\*.*?\*\*)/);
              return (
                <p key={index} className="text-foreground leading-relaxed mb-4">
                  {parts.map((part, i) => 
                    part.startsWith('**') ? (
                      <strong key={i} className="text-headline">{part.replace(/\*\*/g, '')}</strong>
                    ) : (
                      part
                    )
                  )}
                </p>
              );
            }
            return (
              <p key={index} className="text-foreground leading-relaxed mb-4">
                {paragraph}
              </p>
            );
          })}
        </div>

        {/* Exercises Section */}
        <div className="bg-primary/5 rounded-2xl p-6 mb-12 border border-primary/20">
          <h3 className="text-lg font-semibold text-headline mb-4 flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-primary" />
            Übungen zum Ausprobieren
          </h3>
          <div className="space-y-4">
            {article.exercises.map((exercise) => (
              <button
                key={exercise.id}
                onClick={() => toggleExercise(exercise.id)}
                className={`w-full text-left p-4 rounded-xl border transition-all ${
                  completedExercises.includes(exercise.id)
                    ? "bg-primary/10 border-primary/30"
                    : "bg-card border-border hover:border-primary/30"
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 mt-0.5 transition-colors ${
                    completedExercises.includes(exercise.id)
                      ? "bg-primary border-primary text-primary-foreground"
                      : "border-muted-foreground"
                  }`}>
                    {completedExercises.includes(exercise.id) && (
                      <CheckCircle2 className="w-4 h-4" />
                    )}
                  </div>
                  <div>
                    <p className={`font-medium mb-1 ${
                      completedExercises.includes(exercise.id) ? "text-primary" : "text-foreground"
                    }`}>
                      {exercise.title}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {exercise.description}
                    </p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="pt-8 border-t border-border">
          <h3 className="text-lg font-semibold mb-4">Weitere Artikel</h3>
          <div className="grid gap-3">
            {articles.filter(a => a.id !== article.id).slice(0, 3).map((relatedArticle) => (
              <Link
                key={relatedArticle.id}
                to={`/artikel/${relatedArticle.id}`}
                className="flex items-center gap-4 p-3 rounded-xl bg-card hover:bg-secondary/50 transition-colors border border-border/50"
              >
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary shrink-0">
                  {relatedArticle.icon}
                </div>
                <div>
                  <p className="font-medium text-foreground text-sm">{relatedArticle.title}</p>
                  <span className="text-xs text-muted-foreground">{relatedArticle.readTime}</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ArtikelDetail;
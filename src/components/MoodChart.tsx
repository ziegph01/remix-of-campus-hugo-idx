import { ChevronLeft, ChevronRight, Lightbulb, Pencil, Frown, Annoyed, Meh, Smile, Laugh } from "lucide-react";
import { Button } from "./ui/button";

const MONTHS = ["Januar", "Februar", "März", "April", "Mai", "Juni", "Juli", "August", "September", "Oktober", "November", "Dezember"];

interface MoodChartProps {
  moodData: Record<string, string>;
  currentDate: Date;
  onMonthChange: (newDate: Date) => void;
}

const MoodChart = ({
  moodData,
  currentDate,
  onMonthChange
}: MoodChartProps) => {
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  // Skala: 1 = sehr gut (oben), 5 = sehr schlecht (unten)
  const moodIcons = [
    { icon: Laugh, color: "text-mood-great" },
    { icon: Smile, color: "text-mood-good" },
    { icon: Meh, color: "text-mood-neutral" },
    { icon: Annoyed, color: "text-mood-unwell" },
    { icon: Frown, color: "text-mood-bad" }
  ];

  const moodLabels = ["sehr gut", "gut", "neutral", "unwohl", "schlecht"];
  
  // Für Chart: höherer Wert = besser (für visuelle Darstellung)
  const moodChartValues: Record<string, number> = {
    great: 5,
    good: 4,
    neutral: 3,
    unwell: 2,
    bad: 1
  };
  
  // Display-Werte für Statistik (1=sehr gut, 5=schlecht)
  const moodDisplayValues: Record<string, number> = {
    great: 1,
    good: 2,
    neutral: 3,
    unwell: 4,
    bad: 5
  };
  
  const moodColors: Record<string, string> = {
    bad: "bg-mood-bad",
    unwell: "bg-mood-unwell",
    neutral: "bg-mood-neutral",
    good: "bg-mood-good",
    great: "bg-mood-great"
  };
  
  const prevMonth = () => onMonthChange(new Date(year, month - 1, 1));
  const nextMonth = () => onMonthChange(new Date(year, month + 1, 1));

  // Filter mood data for current month
  const monthPrefix = `${year}-${String(month + 1).padStart(2, '0')}`;
  const monthMoodEntries = Object.entries(moodData)
    .filter(([key]) => key.startsWith(monthPrefix))
    .sort(([a], [b]) => a.localeCompare(b));
  
  const maxMood = 5;
  const hasData = monthMoodEntries.length > 0;

  // Berechne Durchschnitt mit Display-Werten (1=sehr gut, 5=schlecht)
  const displayMoodList = monthMoodEntries.map(([, m]) => moodDisplayValues[m] || 3);
  const avgDisplayMood = displayMoodList.length > 0 
    ? displayMoodList.reduce((a, b) => a + b, 0) / displayMoodList.length 
    : 0;

  // Mood insight based on average (1=sehr gut, 5=schlecht)
  const getMoodInsight = (avg: number): string => {
    if (avg <= 1.5) return "super";
    if (avg <= 2) return "sehr gut";
    if (avg <= 2.5) return "gut";
    if (avg <= 3) return "okay";
    if (avg <= 3.5) return "geht so";
    if (avg <= 4) return "nicht so gut";
    return "schlecht";
  };
  
  const moodInsight = getMoodInsight(avgDisplayMood);

  // Get tip based on average mood (1=sehr gut, 5=schlecht)
  const getTipByMood = (avg: number): string => {
    if (avg <= 1.5) {
      return "Teile deine positive Energie mit anderen!";
    } else if (avg <= 2) {
      return "Geh spazieren an der frischen Luft";
    } else if (avg <= 2.5) {
      return "Probiere heute eine kleine Dankbarkeitsübung aus";
    } else if (avg <= 3) {
      return "Nimm dir einen Moment Zeit nur für dich";
    } else if (avg <= 3.5) {
      return "Gönn dir heute etwas Ruhe und Selbstfürsorge";
    } else if (avg <= 4) {
      return "Möchtest du mit jemandem sprechen? Wir sind für dich da";
    } else {
      return "Es ist okay, wenn du jemanden zum Reden brauchst";
    }
  };

  // Calculate bar width based on number of entries
  const barWidth = monthMoodEntries.length > 0 
    ? Math.max(8, Math.min(24, 200 / monthMoodEntries.length)) 
    : 24;

  return <div className="flex flex-col h-full overflow-hidden" id="moodchart-container">
      <div className="bg-card rounded-2xl shadow-lg overflow-hidden animate-fade-in flex-1 flex flex-col border border-border/30">
        {/* Dark Header matching Calendar */}
        <div className="bg-card-dark text-card-dark-foreground flex items-center justify-between px-4 py-3">
          <Button variant="ghost" size="icon" onClick={prevMonth} className="text-card-dark-foreground hover:bg-white/10">
            <ChevronLeft className="w-5 h-5" />
          </Button>
          <h3 className="font-bold text-card-dark-foreground">Dein {MONTHS[month]}</h3>
          <Button variant="ghost" size="icon" onClick={nextMonth} className="text-card-dark-foreground hover:bg-white/10">
            <ChevronRight className="w-5 h-5" />
          </Button>
        </div>

        <div className="p-4 flex flex-col flex-1">
          {/* Chart Container - Fixed height */}
          <div className="flex gap-2 flex-1 min-h-[180px]">
            {/* Y-axis icons - von oben (sehr gut) nach unten (schlecht) */}
            <div className="flex flex-col justify-between py-1">
              {moodIcons.map((item, i) => {
                const Icon = item.icon;
                return <Icon key={i} className={`w-4 h-4 ${item.color}`} strokeWidth={2.5} />;
              })}
            </div>
            
            {/* Chart Area with Bars */}
            <div className="flex-1 relative border-l border-b border-border">
              <div className="absolute inset-0 flex items-end justify-start gap-1 p-1 overflow-x-auto">
                {hasData && monthMoodEntries.map(([dateKey, mood]) => {
                  const day = parseInt(dateKey.split('-')[2], 10);
                  const value = moodChartValues[mood] || 0;
                  const color = moodColors[mood] || "bg-muted";
                  const heightPercent = value / maxMood * 100;
                  
                  return <div 
                    key={dateKey} 
                    className={`rounded-t ${color} shrink-0 transition-all`} 
                    style={{
                      height: `${heightPercent}%`,
                      width: `${barWidth}px`,
                      minHeight: '4px'
                    }} 
                    title={`Tag ${day}: ${mood}`} 
                  />;
                })}
              </div>
            </div>
          </div>

          {/* No data message */}
          {!hasData && (
            <div className="text-center text-muted-foreground text-sm mt-4">
              Noch keine Mood-Einträge
            </div>
          )}

          {/* Statistics - Only show mood insight and tip, no average */}
          {hasData && (
            <div className="flex flex-col gap-2 mt-4 pt-4 border-t border-border">
              <div className="flex flex-wrap gap-2">
                <div className="flex items-center gap-2 rounded-full px-3 py-1.5 text-sm bg-input">
                  <Pencil className="w-4 h-4 text-primary" />
                  <span className="text-muted-foreground">{moodInsight}</span>
                </div>
              </div>
              <div className="flex items-center gap-2 bg-primary/10 rounded-xl px-3 py-2 text-sm">
                <Lightbulb className="w-4 h-4 text-primary shrink-0" />
                <span className="text-foreground">{getTipByMood(avgDisplayMood)}</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>;
};

export default MoodChart;
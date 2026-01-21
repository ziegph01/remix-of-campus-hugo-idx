import { useState, useEffect, useRef, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import Header from "@/components/Header";
import HeroSection from "@/components/HeroSection";
import Calendar from "@/components/Calendar";
import MoodChart from "@/components/MoodChart";
import MentorCarousel from "@/components/MentorCarousel";
import QuickAccessCards from "@/components/QuickAccessCards";
import DailyMoodDialog from "@/components/DailyMoodDialog";
import Stundenplan from "@/components/Stundenplan";

import { Lock, CalendarDays, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
const Index = () => {
  const [searchParams] = useSearchParams();
  const isGuest = searchParams.get("guest") === "true" || !localStorage.getItem("isLoggedIn");
  const [calendarDate, setCalendarDate] = useState(new Date());
  const [moodChartDate, setMoodChartDate] = useState(new Date());
  const [showCalendar, setShowCalendar] = useState(true); // Toggle between Calendar and Stundenplan
  const [userName] = useState(() => localStorage.getItem("username") || "Gast");
  const [moodData, setMoodData] = useState<Record<string, string>>(() => {
    const saved = localStorage.getItem("mood-data-v2");
    return saved ? JSON.parse(saved) : {};
  });
  const [bookedAppointments] = useState<{
    date: Date;
    time: string;
    beraterId: string;
  }[]>(() => {
    const saved = localStorage.getItem("booked-appointments");
    return saved ? JSON.parse(saved) : [];
  });
  const [showMoodDialog, setShowMoodDialog] = useState(false);
  const [moodChartHeight, setMoodChartHeight] = useState<number | undefined>(undefined);
  const calendarWrapperRef = useRef<HTMLDivElement>(null);

  // Sync MoodChart height with Calendar height
  const syncHeights = useCallback(() => {
    if (calendarWrapperRef.current) {
      const calendarHeight = calendarWrapperRef.current.offsetHeight;
      setMoodChartHeight(calendarHeight);
    }
  }, []);

  useEffect(() => {
    syncHeights();
    window.addEventListener('resize', syncHeights);
    return () => window.removeEventListener('resize', syncHeights);
  }, [syncHeights, showCalendar]);

  // Also sync after a short delay to catch any layout shifts
  useEffect(() => {
    const timer = setTimeout(syncHeights, 100);
    return () => clearTimeout(timer);
  }, [syncHeights, showCalendar]);
  useEffect(() => {
    if (isGuest) return;
    const today = new Date();
    const todayKey = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    if (!moodData[todayKey]) {
      const timer = setTimeout(() => {
        setShowMoodDialog(true);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [moodData, isGuest]);
  const handleMoodChange = (dateKey: string, mood: string) => {
    if (isGuest) return;
    const newMoodData = {
      ...moodData
    };
    if (mood === "") {
      delete newMoodData[dateKey];
    } else {
      newMoodData[dateKey] = mood;
    }
    setMoodData(newMoodData);
    localStorage.setItem("mood-data-v2", JSON.stringify(newMoodData));
  };
  const handleDailyMoodSelect = (mood: string) => {
    const today = new Date();
    const todayKey = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    handleMoodChange(todayKey, mood);
  };
  const handleMoodDialogClose = () => {
    setShowMoodDialog(false);
  };
  const handleCalendarMonthChange = (newDate: Date) => {
    setCalendarDate(newDate);
  };
  const handleMoodChartMonthChange = (newDate: Date) => {
    setMoodChartDate(newDate);
  };

  // Demo mood data for guests
  const demoMoodData: Record<string, string> = isGuest ? {
    "2025-01-03": "great",
    "2025-01-05": "good",
    "2025-01-06": "neutral",
    "2025-01-02": "good"
  } : moodData;
  return <div className="min-h-screen bg-background">
      <Header isLoggedIn={!isGuest} isGuest={isGuest} />
      
      <main className="border-white text-muted-foreground">
        {/* Hero Section */}
        <HeroSection userName={isGuest ? "Gast" : userName} isGuest={isGuest} />

        <div className="page-container space-y-8 pb-12">
          {/* Quick Access */}
          <section className="animate-fade-in" style={{
          animationDelay: "100ms"
        }}>
            <h2 className="mb-4">
              Schnellzugriff
            </h2>
            <QuickAccessCards isGuest={isGuest} />
          </section>

          {/* Self-Management Tools Section */}
          <section className="animate-fade-in relative" style={{
          animationDelay: "200ms"
        }}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-muted-foreground">
                Dein Wohlbefinden
              </h2>
            </div>
            
            {isGuest && <div className="absolute inset-0 z-10 flex items-center justify-center bg-background/60 backdrop-blur-[2px] rounded-2xl">
                <div className="text-center p-6 bg-card rounded-2xl shadow-lg border border-border max-w-sm">
                  <Lock className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
                  <h3 className="font-semibold text-foreground mb-2">Registriere dich für diese Funktion</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Tracke deine Stimmung und erkenne Muster über die Zeit.
                  </p>
                  <div className="flex gap-2 justify-center">
                    <Button asChild size="sm">
                      <Link to="/registrierung">Registrieren</Link>
                    </Button>
                    <Button asChild variant="outline" size="sm">
                      <Link to="/login">Anmelden</Link>
                    </Button>
                  </div>
                </div>
              </div>}
            
            <div className={`grid md:grid-cols-2 gap-6 ${isGuest ? "pointer-events-none" : ""}`}>
              {/* Calendar/Stundenplan column - this sets the reference height */}
              <div className="flex flex-col" id="calendar-column">
                {/* Toggle Buttons - above the calendar */}
                {!isGuest && (
                  <div className="flex items-center gap-2 bg-muted rounded-lg p-1 w-fit mb-4">
                    <button
                      onClick={() => setShowCalendar(true)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                        showCalendar ? "bg-card shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      <CalendarDays className="w-4 h-4" />
                      Kalender
                    </button>
                    <button
                      onClick={() => setShowCalendar(false)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                        !showCalendar ? "bg-card shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      <Clock className="w-4 h-4" />
                      Stundenplan
                    </button>
                  </div>
                )}
                <div ref={calendarWrapperRef}>
                  {showCalendar ? (
                    <Calendar moodData={demoMoodData} onMoodChange={handleMoodChange} currentDate={calendarDate} onMonthChange={handleCalendarMonthChange} disabled={isGuest} bookedAppointments={bookedAppointments} />
                  ) : (
                    <Stundenplan />
                  )}
                </div>
              </div>
              {/* MoodChart column - exactly matches Calendar height via JS */}
              <div 
                className="flex flex-col md:mt-auto" 
                id="moodchart-column"
                style={moodChartHeight ? { height: moodChartHeight } : undefined}
              >
                <MoodChart moodData={demoMoodData} currentDate={moodChartDate} onMonthChange={handleMoodChartMonthChange} />
              </div>
            </div>
          </section>

          <section className="animate-fade-in" style={{
          animationDelay: "300ms"
        }}>
            <h2 className="mb-4">Mentoren
          </h2>
            <MentorCarousel isGuest={isGuest} />
          </section>
        </div>

        {/* Safe Use Disclaimer */}
        <div className="page-container py-6">
          <div className="bg-muted/50 rounded-xl p-4 border border-border/50">
            <p className="text-xs text-muted-foreground text-center leading-relaxed">
              <strong>Hinweis:</strong> Diese App ersetzt keine professionelle psychologische oder medizinische Beratung. 
              Bei akuten Krisen wende dich bitte an die <a href="tel:0800-1110111" className="text-primary hover:underline font-medium">Telefonseelsorge (0800 111 0 111)</a> oder 
              suche professionelle Hilfe. Die Inhalte dienen ausschließlich der Unterstützung und Information.
            </p>
          </div>
        </div>

        {/* Footer */}
        <footer className="page-container text-center text-sm text-muted-foreground py-6 border-t border-border">
          <a href="/impressum" className="hover:text-primary transition-colors">Impressum</a>
        </footer>
      </main>

      {/* Daily Mood Dialog - only for logged in users */}
      {!isGuest && <DailyMoodDialog open={showMoodDialog} onClose={handleMoodDialogClose} onMoodSelect={handleDailyMoodSelect} />}
    </div>;
};
export default Index;
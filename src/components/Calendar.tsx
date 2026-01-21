import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "./ui/button";
import { Dialog, DialogContent, DialogTitle } from "./ui/dialog";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { useState } from "react";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { moods } from "./MoodIcons";

const DAYS = ["MO", "DI", "MI", "DO", "FR", "SA", "SO"];
const MONTHS = ["Januar", "Februar", "März", "April", "Mai", "Juni", "Juli", "August", "September", "Oktober", "November", "Dezember"];

const moodBgColors: Record<string, string> = {
  great: "bg-mood-great/25 border-mood-great/40",
  good: "bg-mood-good/25 border-mood-good/40",
  neutral: "bg-mood-neutral/25 border-mood-neutral/40",
  unwell: "bg-mood-unwell/25 border-mood-unwell/40",
  bad: "bg-mood-bad/25 border-mood-bad/40"
};

interface BookedAppointment {
  date: Date;
  time: string;
  beraterId: string;
}

interface CalendarProps {
  moodData: Record<string, string>;
  onMoodChange: (dateKey: string, mood: string) => void;
  currentDate: Date;
  onMonthChange: (newDate: Date) => void;
  disabled?: boolean;
  bookedAppointments?: BookedAppointment[];
}

type EventData = {
  event: string;
  note: string;
  borderColor?: string;
};

const BORDER_COLORS = [
  { id: "none", label: "Keine", class: "border-transparent", style: "" },
  { id: "primary", label: "Grün", class: "border-primary", style: "hsl(var(--primary))" },
  { id: "red", label: "Rot", class: "border-red-500", style: "#ef4444" },
  { id: "blue", label: "Blau", class: "border-blue-500", style: "#3b82f6" },
  { id: "orange", label: "Orange", class: "border-orange-500", style: "#f97316" },
  { id: "purple", label: "Lila", class: "border-purple-500", style: "#a855f7" },
];

// Get berater name by ID
const getBeraterName = (beraterId: string): string => {
  const beraterMap: Record<string, string> = {
    "1": "Frau Koch",
    "2": "Herr Müller", 
    "3": "Frau Schmidt"
  };
  return beraterMap[beraterId] || "Berater";
};

const Calendar = ({
  moodData,
  onMoodChange,
  currentDate,
  onMonthChange,
  disabled = false,
  bookedAppointments = []
}: CalendarProps) => {
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [showDayDetail, setShowDayDetail] = useState(false);
  const [dayNote, setDayNote] = useState("");
  const [dayEvent, setDayEvent] = useState("");
  const [dayBorderColor, setDayBorderColor] = useState("none");
  const [events, setEvents] = useState<Record<string, EventData>>(() => {
    const saved = localStorage.getItem("calendar-events");
    return saved ? JSON.parse(saved) : {};
  });

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const startDay = (firstDay.getDay() + 6) % 7;
  const totalDays = lastDay.getDate();
  const days: (number | null)[] = [];

  for (let i = 0; i < startDay; i++) {
    days.push(null);
  }
  for (let i = 1; i <= totalDays; i++) {
    days.push(i);
  }

  const prevMonth = () => onMonthChange(new Date(year, month - 1, 1));
  const nextMonth = () => onMonthChange(new Date(year, month + 1, 1));

  const getDateKey = (day: number) => {
    return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  };

  const getEventForDay = (day: number) => events[getDateKey(day)];
  
  const getMoodForDay = (day: number) => {
    const dateKey = getDateKey(day);
    const moodId = moodData[dateKey];
    return moods.find(m => m.id === moodId);
  };

  const getAppointmentForDay = (day: number) => {
    const dateKey = getDateKey(day);
    return bookedAppointments.find(app => {
      const appDate = new Date(app.date);
      const appKey = `${appDate.getFullYear()}-${String(appDate.getMonth() + 1).padStart(2, '0')}-${String(appDate.getDate()).padStart(2, '0')}`;
      return appKey === dateKey;
    });
  };

  const today = new Date();
  const isToday = (day: number) => today.getDate() === day && today.getMonth() === month && today.getFullYear() === year;
  
  // Check if a day is in the future (after today)
  const isFutureDay = (day: number) => {
    const dayDate = new Date(year, month, day);
    const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    return dayDate > todayStart;
  };

  // Check if day has any content (event, appointment, or mood)
  const hasContent = (day: number) => {
    const eventData = getEventForDay(day);
    const appointment = getAppointmentForDay(day);
    const mood = getMoodForDay(day);
    return !!(eventData?.event || eventData?.note || appointment || mood || (eventData?.borderColor && eventData.borderColor !== "none"));
  };

  const handleDayClick = (day: number) => {
    if (disabled) return;
    setSelectedDay(day);
    const key = getDateKey(day);
    const existingEvent = events[key];
    setDayEvent(existingEvent?.event || "");
    setDayNote(existingEvent?.note || "");
    setDayBorderColor(existingEvent?.borderColor || "none");
    setShowDayDetail(true);
  };

  const handleMoodSelect = (moodId: string) => {
    if (selectedDay !== null) {
      // Only allow mood selection for today and past days
      if (isFutureDay(selectedDay)) {
        return;
      }
      
      const dateKey = getDateKey(selectedDay);
      if (moodData[dateKey] === moodId) {
        onMoodChange(dateKey, "");
      } else {
        onMoodChange(dateKey, moodId);
      }
    }
  };

  const handleSave = () => {
    if (selectedDay !== null) {
      const key = getDateKey(selectedDay);
      const newEvents = {
        ...events
      };
      if (dayEvent || dayNote || dayBorderColor !== "none") {
        newEvents[key] = {
          event: dayEvent,
          note: dayNote,
          borderColor: dayBorderColor
        };
      } else {
        delete newEvents[key];
      }
      setEvents(newEvents);
      localStorage.setItem("calendar-events", JSON.stringify(newEvents));
    }
    setShowDayDetail(false);
    setSelectedDay(null);
  };

  const getBorderColorClass = (day: number) => {
    const eventData = getEventForDay(day);
    if (eventData?.borderColor && eventData.borderColor !== "none") {
      const colorConfig = BORDER_COLORS.find(c => c.id === eventData.borderColor);
      return colorConfig?.class || "border-transparent";
    }
    return "border-transparent";
  };

  // Get dot color for calendar preview
  const getDotColor = (day: number) => {
    const eventData = getEventForDay(day);
    const appointment = getAppointmentForDay(day);
    
    // Appointment gets primary color
    if (appointment) {
      return "bg-primary";
    }
    
    // Event with border color
    if (eventData?.borderColor && eventData.borderColor !== "none") {
      const colorMap: Record<string, string> = {
        "primary": "bg-primary",
        "red": "bg-red-500",
        "blue": "bg-blue-500",
        "orange": "bg-orange-500",
        "purple": "bg-purple-500"
      };
      return colorMap[eventData.borderColor] || "bg-primary";
    }
    
    // Default for events without color
    if (eventData?.event) {
      return "bg-muted-foreground";
    }
    
    return null;
  };

  const getDayClasses = (day: number | null) => {
    if (day === null) return "cursor-default border-transparent bg-transparent";
    const mood = getMoodForDay(day);
    const borderColorClass = getBorderColorClass(day);
    const hasBorderColor = borderColorClass !== "border-transparent";
    
    if (isToday(day)) {
      return "bg-primary text-primary-foreground font-bold border-primary shadow-md";
    }
    if (mood) {
      return `${moodBgColors[mood.id]} hover:opacity-80 cursor-pointer`;
    }
    if (hasBorderColor) {
      return `hover:bg-muted/60 cursor-pointer ${borderColorClass} border-2 bg-muted/30`;
    }
    return "hover:bg-muted/60 cursor-pointer border-transparent bg-muted/30";
  };

  return <>
      <div className="bg-card rounded-2xl shadow-lg overflow-hidden animate-fade-in border border-border/30">
        {/* Header */}
        <div className="bg-card-dark text-white flex items-center justify-between px-4 py-3">
          <Button variant="ghost" size="icon" onClick={prevMonth} className="text-white hover:bg-white/15">
            <ChevronLeft className="w-5 h-5" />
          </Button>
          <h3 className="tracking-wide text-white font-bold">{MONTHS[month]} {year}</h3>
          <Button variant="ghost" size="icon" onClick={nextMonth} className="text-white hover:bg-white/15">
            <ChevronRight className="w-5 h-5" />
          </Button>
        </div>

        <div className="p-4">
          {/* Days header */}
          <div className="grid grid-cols-7 gap-1.5 mb-2">
            {DAYS.map(day => <div key={day} className="text-center text-xs font-semibold text-muted-foreground py-1">
                {day}
              </div>)}
          </div>

          {/* Calendar grid */}
          <div className="grid grid-cols-7 gap-1.5">
            {days.map((day, index) => {
              const eventData = day ? getEventForDay(day) : null;
              const appointment = day ? getAppointmentForDay(day) : null;
              const hasEvent = eventData && eventData.event;
              const dotColor = day ? getDotColor(day) : null;
              
              return <button 
                key={index} 
                onClick={() => day && handleDayClick(day)} 
                disabled={day === null || disabled} 
                className={`aspect-square flex flex-col items-center justify-center rounded-xl border transition-all ${getDayClasses(day)}`}
              >
                {day && <>
                    <span className="text-sm font-medium">{day}</span>
                    {/* Show colored dot for events/appointments */}
                    {dotColor && (
                      <span className={`w-1.5 h-1.5 rounded-full mt-0.5 ${dotColor}`} />
                    )}
                  </>}
              </button>;
            })}
          </div>
        </div>
      </div>

      {/* Day Detail Dialog */}
      <Dialog open={showDayDetail} onOpenChange={setShowDayDetail}>
        <DialogContent className="w-auto max-w-md bg-card border-0 shadow-2xl rounded-2xl p-0">
          <VisuallyHidden>
            <DialogTitle>Tag Details</DialogTitle>
          </VisuallyHidden>
          <div className="p-6">
            <div className="mb-5">
              <h2 className="text-xl font-bold text-foreground">
                {selectedDay}. {MONTHS[month]} {year}
              </h2>
            </div>

            {/* Show appointment info if exists */}
            {selectedDay && getAppointmentForDay(selectedDay) && (
              <div className="mb-4 p-3 bg-primary/10 rounded-xl border border-primary/30">
                <p className="text-sm font-medium text-primary">
                  Beratung bei {getBeraterName(getAppointmentForDay(selectedDay)!.beraterId)} um {getAppointmentForDay(selectedDay)!.time} Uhr
                </p>
              </div>
            )}

            {/* Event Input */}
            <div className="mb-4">
              <label className="text-sm font-medium text-muted-foreground mb-2 block">Termin</label>
              <Input placeholder="z.B. Prüfung, Meeting..." value={dayEvent} onChange={e => setDayEvent(e.target.value)} className="bg-muted/50 rounded-xl" />
            </div>

            {/* Border Color Selection */}
            <div className="mb-5">
              <label className="text-sm font-medium text-muted-foreground mb-2 block">Umrandungsfarbe</label>
              <div className="flex gap-2 flex-wrap">
                {BORDER_COLORS.map(color => (
                  <button
                    key={color.id}
                    onClick={() => setDayBorderColor(color.id)}
                    className={`w-8 h-8 rounded-lg border-2 transition-all ${
                      dayBorderColor === color.id ? "ring-2 ring-primary ring-offset-2 scale-110" : "hover:scale-105"
                    } ${color.id === "none" ? "bg-muted/50 border-muted-foreground/30" : ""}`}
                    style={color.style ? { borderColor: color.style, backgroundColor: `${color.style}20` } : {}}
                    title={color.label}
                  />
                ))}
              </div>
            </div>

            {/* Notes */}
            <div className="mb-5">
              <label className="text-sm font-medium text-muted-foreground mb-2 block">Details / Notizen</label>
              <Textarea placeholder="Weitere Informationen..." value={dayNote} onChange={e => setDayNote(e.target.value)} className="bg-muted/50 min-h-[80px] rounded-xl" />
            </div>

            {/* Mood Selection - Only show for today and past days */}
            <div className="mb-5">
              <label className="text-sm font-medium text-muted-foreground mb-3 block">
                Wie fühlst du dich?
                {selectedDay && isFutureDay(selectedDay) && (
                  <span className="text-xs text-muted-foreground ml-2">(Nur für heute & vergangene Tage)</span>
                )}
              </label>
              <div className="flex justify-center gap-2">
                {moods.map(mood => {
                  const dateKey = selectedDay ? getDateKey(selectedDay) : "";
                  const Icon = mood.icon;
                  const isSelected = moodData[dateKey] === mood.id;
                  const isDisabled = selectedDay ? isFutureDay(selectedDay) : false;
                  
                  return <button 
                    key={mood.id} 
                    onClick={() => handleMoodSelect(mood.id)} 
                    disabled={isDisabled}
                    className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-all ${
                      isDisabled 
                        ? "opacity-40 cursor-not-allowed" 
                        : isSelected 
                          ? "ring-2 ring-primary ring-offset-2 scale-105" 
                          : "hover:scale-105 hover:bg-muted/50"
                    }`}
                  >
                    <div className={`w-11 h-11 rounded-full ${mood.color} flex items-center justify-center shadow-md`}>
                      <Icon className="w-6 h-6 text-white" strokeWidth={2.5} />
                    </div>
                    <span className="text-[10px] text-muted-foreground font-medium">{mood.label}</span>
                  </button>;
                })}
              </div>
            </div>

            <Button onClick={handleSave} className="w-full rounded-xl">Speichern</Button>
          </div>
        </DialogContent>
      </Dialog>
    </>;
};

export default Calendar;
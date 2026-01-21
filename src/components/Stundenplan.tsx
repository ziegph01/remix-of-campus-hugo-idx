import { useState } from "react";
import { Plus, Trash2, Clock, CalendarDays } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import { Label } from "./ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { toast } from "@/hooks/use-toast";
interface ScheduleEntry {
  id: string;
  day: string;
  startTime: string;
  endTime: string;
  subject: string;
  room?: string;
  color: string;
}
const DAYS = ["Montag", "Dienstag", "Mittwoch", "Donnerstag", "Freitag"];
const TIMES = ["08:00", "09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00", "18:00", "19:00"];
const COLORS = [{
  id: "primary",
  label: "Grün",
  class: "bg-primary/20 border-primary text-primary"
}, {
  id: "blue",
  label: "Blau",
  class: "bg-blue-500/20 border-blue-500 text-blue-600 dark:text-blue-400"
}, {
  id: "red",
  label: "Rot",
  class: "bg-red-500/20 border-red-500 text-red-600 dark:text-red-400"
}, {
  id: "orange",
  label: "Orange",
  class: "bg-orange-500/20 border-orange-500 text-orange-600 dark:text-orange-400"
}, {
  id: "purple",
  label: "Lila",
  class: "bg-purple-500/20 border-purple-500 text-purple-600 dark:text-purple-400"
}, {
  id: "pink",
  label: "Pink",
  class: "bg-pink-500/20 border-pink-500 text-pink-600 dark:text-pink-400"
}];
const Stundenplan = () => {
  const [entries, setEntries] = useState<ScheduleEntry[]>(() => {
    const saved = localStorage.getItem("stundenplan");
    return saved ? JSON.parse(saved) : [];
  });
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newEntry, setNewEntry] = useState({
    day: "",
    startTime: "",
    endTime: "",
    subject: "",
    room: "",
    color: "primary"
  });
  const saveEntries = (newEntries: ScheduleEntry[]) => {
    setEntries(newEntries);
    localStorage.setItem("stundenplan", JSON.stringify(newEntries));
  };
  const addEntry = () => {
    if (!newEntry.day || !newEntry.startTime || !newEntry.endTime || !newEntry.subject) {
      toast({
        title: "Fehler",
        description: "Bitte fülle alle Pflichtfelder aus.",
        variant: "destructive"
      });
      return;
    }
    const entry: ScheduleEntry = {
      id: Date.now().toString(),
      day: newEntry.day,
      startTime: newEntry.startTime,
      endTime: newEntry.endTime,
      subject: newEntry.subject,
      room: newEntry.room,
      color: newEntry.color
    };
    saveEntries([...entries, entry]);
    toast({
      title: "Hinzugefügt",
      description: `${entry.subject} wurde zum Stundenplan hinzugefügt.`
    });
    setNewEntry({
      day: "",
      startTime: "",
      endTime: "",
      subject: "",
      room: "",
      color: "primary"
    });
    setDialogOpen(false);
  };
  const deleteEntry = (id: string) => {
    saveEntries(entries.filter(e => e.id !== id));
    toast({
      title: "Gelöscht",
      description: "Eintrag wurde entfernt."
    });
  };
  const getEntriesForDay = (day: string) => {
    return entries.filter(e => e.day === day).sort((a, b) => a.startTime.localeCompare(b.startTime));
  };
  const getColorClass = (colorId: string) => {
    return COLORS.find(c => c.id === colorId)?.class || COLORS[0].class;
  };
  return <div className="bg-card rounded-2xl shadow-lg overflow-hidden animate-fade-in border border-border/30">
      {/* Header */}
      <div className="bg-card-dark text-white flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-2">
          <CalendarDays className="w-5 h-5" />
          <h3 className="font-bold text-secondary-foreground">Stundenplan</h3>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm" variant="ghost" className="text-white hover:bg-white/15">
              <Plus className="w-4 h-4 mr-1" />
              Neu
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Neuen Eintrag hinzufügen</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <div>
                <Label htmlFor="subject">Fach / Veranstaltung *</Label>
                <Input id="subject" value={newEntry.subject} onChange={e => setNewEntry({
                ...newEntry,
                subject: e.target.value
              })} placeholder="z.B. Mathematik I" />
              </div>
              <div>
                <Label htmlFor="day">Tag *</Label>
                <Select value={newEntry.day} onValueChange={v => setNewEntry({
                ...newEntry,
                day: v
              })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Tag auswählen" />
                  </SelectTrigger>
                  <SelectContent>
                    {DAYS.map(day => <SelectItem key={day} value={day}>{day}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="startTime">Von *</Label>
                  <Select value={newEntry.startTime} onValueChange={v => setNewEntry({
                  ...newEntry,
                  startTime: v
                })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Startzeit" />
                    </SelectTrigger>
                    <SelectContent>
                      {TIMES.map(time => <SelectItem key={time} value={time}>{time}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="endTime">Bis *</Label>
                  <Select value={newEntry.endTime} onValueChange={v => setNewEntry({
                  ...newEntry,
                  endTime: v
                })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Endzeit" />
                    </SelectTrigger>
                    <SelectContent>
                      {TIMES.map(time => <SelectItem key={time} value={time}>{time}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label htmlFor="room">Raum (optional)</Label>
                <Input id="room" value={newEntry.room} onChange={e => setNewEntry({
                ...newEntry,
                room: e.target.value
              })} placeholder="z.B. Raum 101" />
              </div>
              <div>
                <Label>Farbe</Label>
                <div className="flex gap-2 mt-2">
                  {COLORS.map(color => <button key={color.id} onClick={() => setNewEntry({
                  ...newEntry,
                  color: color.id
                })} className={`w-8 h-8 rounded-lg border-2 transition-all ${newEntry.color === color.id ? "ring-2 ring-primary ring-offset-2 scale-110" : "hover:scale-105"} ${color.class}`} title={color.label} />)}
                </div>
              </div>
              <Button onClick={addEntry} className="w-full">
                Hinzufügen
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Schedule Grid */}
      <div className="p-3 md:p-4">
        {entries.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Clock className="w-10 h-10 mx-auto mb-2 opacity-50" />
            <p className="text-sm">Noch keine Einträge</p>
            <p className="text-xs mt-1">Klicke auf "Neu" um deinen Stundenplan zu erstellen</p>
          </div>
        ) : (
          <>
            {/* Desktop: Grid View */}
            <div className="hidden md:block">
              {/* Days Header */}
              <div className="grid grid-cols-5 gap-2 mb-2">
                {DAYS.map(day => (
                  <div key={day} className="text-center text-xs font-semibold text-muted-foreground py-2">
                    {day.substring(0, 2)}
                  </div>
                ))}
              </div>

              {/* Schedule Content */}
              <div className="grid grid-cols-5 gap-2">
                {DAYS.map(day => (
                  <div key={day} className="space-y-2 min-h-[150px]">
                    {getEntriesForDay(day).map(entry => (
                      <div key={entry.id} className={`rounded-lg p-2 border-l-4 text-xs group relative ${getColorClass(entry.color)}`}>
                        <button 
                          onClick={() => deleteEntry(entry.id)} 
                          className="absolute -top-1 -right-1 w-5 h-5 bg-destructive text-destructive-foreground rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                        <p className="font-semibold truncate">{entry.subject}</p>
                        <p className="text-[10px] opacity-80">{entry.startTime} - {entry.endTime}</p>
                        {entry.room && <p className="text-[10px] opacity-70">{entry.room}</p>}
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>

            {/* Mobile: List View */}
            <div className="md:hidden space-y-3">
              {DAYS.map(day => {
                const dayEntries = getEntriesForDay(day);
                if (dayEntries.length === 0) return null;
                return (
                  <div key={day} className="space-y-2">
                    <h4 className="text-xs font-semibold text-muted-foreground border-b border-border pb-1">
                      {day}
                    </h4>
                    {dayEntries.map(entry => (
                      <div key={entry.id} className={`rounded-lg p-3 border-l-4 text-sm group relative ${getColorClass(entry.color)}`}>
                        <button 
                          onClick={() => deleteEntry(entry.id)} 
                          className="absolute top-2 right-2 w-6 h-6 bg-destructive text-destructive-foreground rounded-full flex items-center justify-center opacity-70 md:opacity-0 md:group-hover:opacity-100 transition-opacity"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                        <p className="font-semibold">{entry.subject}</p>
                        <p className="text-xs opacity-80 mt-1">{entry.startTime} - {entry.endTime}</p>
                        {entry.room && <p className="text-xs opacity-70">{entry.room}</p>}
                      </div>
                    ))}
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>;
};
export default Stundenplan;
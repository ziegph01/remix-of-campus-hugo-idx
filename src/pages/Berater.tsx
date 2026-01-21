import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Heart, Calendar, MessageCircle, Phone, Clock, Send, ArrowLeft, X, UserCircle, Check } from "lucide-react";
import { format, addDays, setHours, setMinutes, isSameDay } from "date-fns";
import { de } from "date-fns/locale";

interface Berater {
  id: string;
  name: string;
  role: string;
  description: string;
  image: string;
  available: boolean;
  availableSlots?: { date: Date; time: string }[];
}

interface ChatMessage {
  id: string;
  sender: "user" | "berater" | "system";
  text: string;
  timestamp: Date;
  isConnectRequest?: boolean;
  beraterName?: string;
}

interface AnonymousMessage {
  id: string;
  text: string;
  timestamp: Date;
  responses: { beraterId: string; beraterName: string; text: string; timestamp: Date }[];
  connectRequests: { beraterId: string; beraterName: string }[];
}

// Generate available time slots for the next 7 days
const generateSlots = (beraterId: string) => {
  const slots: { date: Date; time: string }[] = [];
  const times = ["09:00", "10:00", "11:00", "14:00", "15:00", "16:00"];
  
  for (let i = 1; i <= 7; i++) {
    const date = addDays(new Date(), i);
    // Each berater has different availability based on their id
    const availableTimes = times.filter((_, idx) => (parseInt(beraterId) + i + idx) % 3 !== 0);
    availableTimes.forEach(time => {
      slots.push({ date, time });
    });
  }
  return slots;
};

const beraterList: Berater[] = [
  {
    id: "1",
    name: "Frau Koch",
    role: "Psychologische Beraterin",
    description: "Ich bin seit 10 Jahren als psychologische Beraterin an der Universität tätig. Meine Schwerpunkte sind Prüfungsangst, Stressbewältigung und persönliche Krisen. Ich bin hier, um dir zu helfen.",
    image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&h=400&fit=crop",
    available: true,
    availableSlots: generateSlots("1"),
  },
  {
    id: "2",
    name: "Herr Müller",
    role: "Studienberater",
    description: "Als Studienberater unterstütze ich dich bei Fragen rund ums Studium - von Fachwechsel bis Prüfungsordnung. Gemeinsam finden wir die beste Lösung für deine Situation.",
    image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop",
    available: true,
    availableSlots: generateSlots("2"),
  },
  {
    id: "3",
    name: "Frau Schmidt",
    role: "Sozialberaterin",
    description: "Finanzielle Sorgen, BAföG-Fragen oder Nebenjob-Probleme? Ich helfe dir, dich auf dein Studium konzentrieren zu können, ohne dir Sorgen um Geld machen zu müssen.",
    image: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&h=400&fit=crop",
    available: false,
    availableSlots: generateSlots("3"),
  },
];

const Berater = () => {
  const [searchParams] = useSearchParams();
  const isGuest = searchParams.get("guest") === "true";
  
  const [selectedBerater, setSelectedBerater] = useState<Berater | null>(null);
  const [showContactForm, setShowContactForm] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [showAppointmentCalendar, setShowAppointmentCalendar] = useState(false);
  const [showAnonymousChat, setShowAnonymousChat] = useState(false);
  const [showBookingConfirmation, setShowBookingConfirmation] = useState<{
    date: Date;
    time: string;
    berater: Berater;
  } | null>(null);
  const [message, setMessage] = useState("");
  const [chatMessage, setChatMessage] = useState("");
  const [anonymousMessage, setAnonymousMessage] = useState("");
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [contactedBerater, setContactedBerater] = useState<string[]>(() => {
    const saved = localStorage.getItem("contacted-berater");
    return saved ? JSON.parse(saved) : [];
  });
  const [chatHistory, setChatHistory] = useState<Record<string, ChatMessage[]>>(() => {
    const saved = localStorage.getItem("berater-chats");
    return saved ? JSON.parse(saved) : {};
  });
  const [anonymousChatMessages, setAnonymousChatMessages] = useState<AnonymousMessage[]>(() => {
    const saved = localStorage.getItem("anonymous-chat-messages");
    return saved ? JSON.parse(saved) : [];
  });
  const [bookedAppointments, setBookedAppointments] = useState<{
    date: Date;
    time: string;
    beraterId: string;
  }[]>(() => {
    const saved = localStorage.getItem("booked-appointments");
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem("contacted-berater", JSON.stringify(contactedBerater));
  }, [contactedBerater]);

  useEffect(() => {
    localStorage.setItem("berater-chats", JSON.stringify(chatHistory));
  }, [chatHistory]);

  useEffect(() => {
    localStorage.setItem("anonymous-chat-messages", JSON.stringify(anonymousChatMessages));
  }, [anonymousChatMessages]);

  useEffect(() => {
    localStorage.setItem("booked-appointments", JSON.stringify(bookedAppointments));
  }, [bookedAppointments]);

  const hasContactedBerater = (beraterId: string) => contactedBerater.includes(beraterId);

  const handleConnect = (berater: Berater) => {
    setSelectedBerater(berater);
    if (hasContactedBerater(berater.id)) {
      setShowChat(true);
    } else {
      setShowContactForm(true);
    }
  };

  const handleSubmit = () => {
    if (!selectedBerater || !message.trim()) return;
    
    if (!contactedBerater.includes(selectedBerater.id)) {
      setContactedBerater([...contactedBerater, selectedBerater.id]);
    }
    
    const newMessage: ChatMessage = {
      id: Date.now().toString(),
      sender: "user",
      text: message,
      timestamp: new Date(),
    };
    
    setChatHistory(prev => ({
      ...prev,
      [selectedBerater.id]: [...(prev[selectedBerater.id] || []), newMessage],
    }));
    
    setShowContactForm(false);
    setMessage("");
    setShowChat(true);
  };

  const handleSendChatMessage = () => {
    if (!selectedBerater || !chatMessage.trim()) return;
    
    const newMessage: ChatMessage = {
      id: Date.now().toString(),
      sender: "user",
      text: chatMessage,
      timestamp: new Date(),
    };
    
    setChatHistory(prev => ({
      ...prev,
      [selectedBerater.id]: [...(prev[selectedBerater.id] || []), newMessage],
    }));
    
    setChatMessage("");
  };

  const closeChat = () => {
    setShowChat(false);
    setSelectedBerater(null);
  };

  const handleBookAppointment = (berater: Berater, date: Date, time: string) => {
    setBookedAppointments(prev => [...prev, { date, time, beraterId: berater.id }]);
    setShowBookingConfirmation({ date, time, berater });
  };

  const handleSendAnonymousMessage = () => {
    if (!anonymousMessage.trim()) return;
    
    const newMessage: AnonymousMessage = {
      id: Date.now().toString(),
      text: anonymousMessage,
      timestamp: new Date(),
      responses: [],
      connectRequests: [],
    };
    
    // Simulate berater responses after a delay (in reality this would be from backend)
    setTimeout(() => {
      setAnonymousChatMessages(prev => {
        const updated = [...prev];
        const msgIndex = updated.findIndex(m => m.id === newMessage.id);
        if (msgIndex !== -1) {
          updated[msgIndex] = {
            ...updated[msgIndex],
            responses: [
              {
                beraterId: "1",
                beraterName: "Frau Koch",
                text: "Danke für deine Nachricht. Einsamkeit ist ein Gefühl, das viele kennen. Möchtest du darüber sprechen?",
                timestamp: new Date(),
              }
            ],
            connectRequests: [
              { beraterId: "2", beraterName: "Herr Müller" }
            ],
          };
        }
        return updated;
      });
    }, 2000);
    
    setAnonymousChatMessages(prev => [...prev, newMessage]);
    setAnonymousMessage("");
  };

  const handleAcceptConnect = (messageId: string, beraterId: string) => {
    const berater = beraterList.find(b => b.id === beraterId);
    if (!berater) return;
    
    if (!contactedBerater.includes(beraterId)) {
      setContactedBerater(prev => [...prev, beraterId]);
    }
    
    setShowAnonymousChat(false);
    setSelectedBerater(berater);
    setShowChat(true);
  };

  // Get unique dates from all berater slots
  const getAllAvailableDates = () => {
    const dates: Date[] = [];
    beraterList.forEach(berater => {
      berater.availableSlots?.forEach(slot => {
        if (!dates.some(d => isSameDay(d, slot.date))) {
          dates.push(slot.date);
        }
      });
    });
    return dates.sort((a, b) => a.getTime() - b.getTime());
  };

  // Get slots for a specific date
  const getSlotsForDate = (date: Date) => {
    const slots: { berater: Berater; time: string }[] = [];
    beraterList.forEach(berater => {
      berater.availableSlots
        ?.filter(slot => isSameDay(slot.date, date))
        .forEach(slot => {
          const isBooked = bookedAppointments.some(
            app => isSameDay(new Date(app.date), date) && app.time === slot.time && app.beraterId === berater.id
          );
          if (!isBooked) {
            slots.push({ berater, time: slot.time });
          }
        });
    });
    return slots.sort((a, b) => a.time.localeCompare(b.time));
  };

  return (
    <div className="min-h-screen bg-background">
      <Header isLoggedIn={!isGuest} isGuest={isGuest} />
      
      <main className="page-container py-6 md:py-8">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
            <Heart className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-foreground">Berater</h1>
            <p className="text-muted-foreground">Du bist nicht allein. Lass dir unter die Arme greifen.</p>
          </div>
        </div>

        {/* Gebuchte Termine anzeigen */}
        {bookedAppointments.length > 0 && (
          <div className="bg-mood-good/10 border border-mood-good/30 rounded-xl p-4 mb-6">
            <h3 className="font-bold text-foreground mb-3 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-mood-good" />
              Deine gebuchten Termine
            </h3>
            <div className="space-y-2">
              {bookedAppointments.map((app, idx) => {
                const berater = beraterList.find(b => b.id === app.beraterId);
                return (
                  <div key={idx} className="flex items-center justify-between bg-card rounded-lg p-3 border border-border">
                    <div className="flex items-center gap-3">
                      {berater && (
                        <img src={berater.image} alt={berater.name} className="w-8 h-8 rounded-full object-cover" />
                      )}
                      <div>
                        <p className="font-medium text-foreground text-sm">
                          {format(new Date(app.date), "d. MMMM yyyy", { locale: de })} um {app.time} Uhr
                        </p>
                        <p className="text-xs text-muted-foreground">{berater?.name} - {berater?.role}</p>
                      </div>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="text-destructive hover:text-destructive hover:bg-destructive/10"
                      onClick={() => setBookedAppointments(prev => prev.filter((_, i) => i !== idx))}
                    >
                      <X className="w-4 h-4 mr-1" />
                      Stornieren
                    </Button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Info Cards */}
        <div className="grid md:grid-cols-3 gap-4 mb-8">
          <div className="bg-card rounded-xl p-4 shadow-sm border border-border">
            <Phone className="w-6 h-6 text-primary mb-2" />
            <h3 className="font-bold text-foreground">Telefonische Beratung</h3>
            <p className="text-sm text-muted-foreground">Mo-Fr 9-17 Uhr</p>
          </div>
          {isGuest ? (
            <div className="bg-card rounded-xl p-4 shadow-sm border border-border opacity-60">
              <Calendar className="w-6 h-6 text-muted-foreground mb-2" />
              <h3 className="font-bold text-foreground">Terminvereinbarung</h3>
              <p className="text-sm text-muted-foreground">Anmeldung erforderlich</p>
            </div>
          ) : (
            <button 
              onClick={() => setShowAppointmentCalendar(true)}
              className="bg-card rounded-xl p-4 shadow-sm border border-border text-left hover:border-primary transition-colors"
            >
              <Calendar className="w-6 h-6 text-primary mb-2" />
              <h3 className="font-bold text-foreground">Terminvereinbarung</h3>
              <p className="text-sm text-muted-foreground">Persönliche Gespräche</p>
            </button>
          )}
          <button 
            onClick={() => setShowAnonymousChat(true)}
            className="bg-card rounded-xl p-4 shadow-sm border border-border text-left hover:border-primary transition-colors"
          >
            <MessageCircle className="w-6 h-6 text-primary mb-2" />
            <h3 className="font-bold text-foreground">Chat-Beratung</h3>
            <p className="text-sm text-muted-foreground">Anonym & vertraulich</p>
          </button>
        </div>

        {/* Berater List */}
        <div className="space-y-4">
          {beraterList.map((person, index) => (
            <div 
              key={person.id} 
              className="bg-card rounded-2xl p-6 shadow-sm border border-border animate-fade-in"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="flex gap-4 items-start">
                <img
                  src={person.image}
                  alt={person.name}
                  className="w-20 h-20 rounded-xl object-cover shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <h3 className="text-xl font-bold text-foreground">{person.name}</h3>
                    {person.available ? (
                      <span className="px-2 py-0.5 bg-mood-good/20 text-mood-good text-xs font-medium rounded-full flex items-center gap-1">
                        <span className="w-1.5 h-1.5 bg-mood-good rounded-full" />
                        Verfügbar
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 bg-muted text-muted-foreground text-xs font-medium rounded-full flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        Nicht verfügbar
                      </span>
                    )}
                    {hasContactedBerater(person.id) && (
                      <span className="px-2 py-0.5 bg-primary/20 text-primary text-xs font-medium rounded-full">
                        In Kontakt
                      </span>
                    )}
                  </div>
                  <p className="text-primary font-medium text-sm mb-2">{person.role}</p>
                  {/* Text container with optimal line length */}
                  <div className="max-w-prose">
                    <p className="text-muted-foreground text-sm leading-relaxed text-pretty">
                      {person.description}
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end gap-2 mt-4">
                <Button onClick={() => handleConnect(person)}>
                  {hasContactedBerater(person.id) ? "Chat öffnen" : "Connect"}
                </Button>
              </div>
            </div>
          ))}
        </div>

        {/* Contact Form Modal */}
        {showContactForm && selectedBerater && (
          <div className="fixed inset-0 bg-foreground/50 flex items-center justify-center z-50 p-4">
            <div className="bg-card rounded-2xl p-6 max-w-md w-full shadow-xl animate-scale-in">
              <h2 className="text-xl font-bold text-foreground mb-2">
                Nachricht an {selectedBerater.name}
              </h2>
              <p className="text-muted-foreground text-sm mb-1">
                {selectedBerater.role}
              </p>
              {!selectedBerater.available && (
                <p className="text-xs text-mood-unwell mb-3">
                  Derzeit nicht verfügbar – deine Nachricht wird beantwortet, sobald möglich.
                </p>
              )}
              
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground mb-1 block">
                    Betreff
                  </label>
                  <Input placeholder="Worum geht es?" />
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground mb-1 block">
                    Deine Nachricht
                  </label>
                  <Textarea 
                    placeholder="Beschreibe kurz dein Anliegen..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="min-h-[120px]"
                  />
                </div>
              </div>
              
              <div className="flex gap-2 mt-6">
                <Button variant="outline" onClick={() => setShowContactForm(false)} className="flex-1">
                  Abbrechen
                </Button>
                <Button onClick={handleSubmit} className="flex-1" disabled={!message.trim()}>
                  Senden
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Chat Window */}
        {showChat && selectedBerater && (
          <div className="fixed inset-0 bg-foreground/50 flex items-center justify-center z-50 p-4">
            <div className="bg-card rounded-2xl max-w-lg w-full shadow-xl animate-scale-in flex flex-col max-h-[80vh]">
              {/* Chat Header */}
              <div className="flex items-center gap-3 p-4 border-b border-border">
                <Button variant="ghost" size="icon" onClick={closeChat}>
                  <ArrowLeft className="w-5 h-5" />
                </Button>
                <img
                  src={selectedBerater.image}
                  alt={selectedBerater.name}
                  className="w-10 h-10 rounded-full object-cover"
                />
                <div className="flex-1">
                  <h3 className="font-bold text-foreground">{selectedBerater.name}</h3>
                  <p className="text-xs text-muted-foreground">{selectedBerater.role}</p>
                </div>
                {!selectedBerater.available && (
                  <span className="px-2 py-0.5 bg-muted text-muted-foreground text-xs font-medium rounded-full">
                    Offline
                  </span>
                )}
              </div>
              
              {/* Chat Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3 min-h-[300px]">
                {(chatHistory[selectedBerater.id] || []).length === 0 ? (
                  <div className="text-center text-muted-foreground text-sm py-8">
                    Keine Nachrichten bisher.
                  </div>
                ) : (
                  (chatHistory[selectedBerater.id] || []).map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`max-w-[80%] rounded-2xl px-4 py-2 ${
                          msg.sender === "user"
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted text-foreground"
                        }`}
                      >
                        <p className="text-sm">{msg.text}</p>
                        <p className="text-[10px] opacity-70 mt-1">
                          {new Date(msg.timestamp).toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit" })}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
              
              {/* Chat Input */}
              <div className="p-4 border-t border-border flex gap-2">
                <Input
                  placeholder="Nachricht schreiben..."
                  value={chatMessage}
                  onChange={(e) => setChatMessage(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSendChatMessage()}
                  className="flex-1"
                />
                <Button size="icon" onClick={handleSendChatMessage} disabled={!chatMessage.trim()}>
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Appointment Calendar Modal */}
        {showAppointmentCalendar && (
          <div className="fixed inset-0 bg-foreground/50 flex items-center justify-center z-50 p-4">
            <div className="bg-card rounded-2xl max-w-2xl w-full shadow-xl animate-scale-in max-h-[85vh] overflow-hidden flex flex-col">
              <div className="flex items-center justify-between p-4 border-b border-border">
                <div>
                  <h2 className="text-xl font-bold text-foreground">Terminvereinbarung</h2>
                  <p className="text-sm text-muted-foreground">Wähle einen Tag und buche einen Termin</p>
                </div>
                <Button variant="ghost" size="icon" onClick={() => {
                  setShowAppointmentCalendar(false);
                  setSelectedDate(null);
                }}>
                  <X className="w-5 h-5" />
                </Button>
              </div>
              
              <div className="flex-1 overflow-y-auto p-4">
                {/* Date Selector */}
                <div className="flex gap-2 overflow-x-auto pb-4 mb-4">
                  {getAllAvailableDates().map((date) => (
                    <button
                      key={date.toISOString()}
                      onClick={() => setSelectedDate(date)}
                      className={`flex-shrink-0 px-4 py-3 rounded-xl border text-center transition-colors ${
                        selectedDate && isSameDay(selectedDate, date)
                          ? "bg-primary text-primary-foreground border-primary"
                          : "bg-card border-border hover:border-primary"
                      }`}
                    >
                      <div className="text-xs opacity-70">
                        {format(date, "EEE", { locale: de })}
                      </div>
                      <div className="font-bold">
                        {format(date, "d", { locale: de })}
                      </div>
                      <div className="text-xs opacity-70">
                        {format(date, "MMM", { locale: de })}
                      </div>
                    </button>
                  ))}
                </div>

                {/* Available Slots */}
                {selectedDate ? (
                  <div className="space-y-3">
                    <h3 className="font-semibold text-foreground">
                      Verfügbare Termine am {format(selectedDate, "d. MMMM", { locale: de })}
                    </h3>
                    {getSlotsForDate(selectedDate).length === 0 ? (
                      <p className="text-muted-foreground text-sm">Keine verfügbaren Termine an diesem Tag.</p>
                    ) : (
                      <div className="space-y-2">
                        {getSlotsForDate(selectedDate).map(({ berater, time }, idx) => (
                          <div
                            key={`${berater.id}-${time}-${idx}`}
                            className="flex items-center justify-between p-3 rounded-xl bg-muted/50 border border-border"
                          >
                            <div className="flex items-center gap-3">
                              <img
                                src={berater.image}
                                alt={berater.name}
                                className="w-10 h-10 rounded-full object-cover"
                              />
                              <div>
                                <p className="font-medium text-foreground">{berater.name}</p>
                                <p className="text-xs text-muted-foreground">{berater.role}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-3">
                              <span className="text-sm font-medium text-foreground">{time} Uhr</span>
                              <Button
                                size="sm"
                                onClick={() => handleBookAppointment(berater, selectedDate, time)}
                              >
                                Buchen
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center text-muted-foreground py-8">
                    Wähle oben einen Tag aus, um verfügbare Termine zu sehen.
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Booking Confirmation Modal */}
        {showBookingConfirmation && (
          <div className="fixed inset-0 bg-foreground/50 flex items-center justify-center z-50 p-4">
            <div className="bg-card rounded-2xl p-6 max-w-md w-full shadow-xl animate-scale-in text-center">
              <div className="w-16 h-16 bg-mood-good/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Check className="w-8 h-8 text-mood-good" />
              </div>
              <h2 className="text-xl font-bold text-foreground mb-2">Termin gebucht!</h2>
              <p className="text-muted-foreground mb-4">
                Termin am <span className="font-semibold text-foreground">{format(new Date(showBookingConfirmation.date), "d. MMMM yyyy", { locale: de })}</span> um <span className="font-semibold text-foreground">{showBookingConfirmation.time} Uhr</span> bei <span className="font-semibold text-foreground">{showBookingConfirmation.berater.name}</span> gebucht.
              </p>
              <Button onClick={() => {
                setShowBookingConfirmation(null);
                setShowAppointmentCalendar(false);
                setSelectedDate(null);
              }} className="w-full">
                Verstanden
              </Button>
            </div>
          </div>
        )}

        {/* Anonymous Chat Modal */}
        {showAnonymousChat && (
          <div className="fixed inset-0 bg-foreground/50 flex items-center justify-center z-50 p-4">
            <div className="bg-card rounded-2xl max-w-lg w-full shadow-xl animate-scale-in flex flex-col max-h-[80vh]">
              <div className="flex items-center justify-between p-4 border-b border-border">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                    <UserCircle className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-bold text-foreground">Anonyme Chat-Beratung</h3>
                    <p className="text-xs text-muted-foreground">Alle Berater können antworten</p>
                  </div>
                </div>
                <Button variant="ghost" size="icon" onClick={() => setShowAnonymousChat(false)}>
                  <X className="w-5 h-5" />
                </Button>
              </div>
              
              <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-[300px]">
                {anonymousChatMessages.length === 0 ? (
                  <div className="text-center text-muted-foreground text-sm py-8">
                    <p className="mb-2">Teile anonym dein Anliegen.</p>
                    <p className="text-xs">Alle Berater können darauf antworten oder eine Connect-Anfrage stellen.</p>
                  </div>
                ) : (
                  anonymousChatMessages.map((msg) => (
                    <div key={msg.id} className="space-y-3">
                      {/* User message */}
                      <div className="flex justify-end">
                        <div className="max-w-[80%] rounded-2xl px-4 py-2 bg-primary text-primary-foreground">
                          <p className="text-sm">{msg.text}</p>
                          <p className="text-[10px] opacity-70 mt-1">
                            {new Date(msg.timestamp).toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit" })}
                          </p>
                        </div>
                      </div>
                      
                      {/* Berater responses */}
                      {msg.responses.map((resp, idx) => (
                        <div key={idx} className="flex justify-start">
                          <div className="max-w-[80%] rounded-2xl px-4 py-2 bg-muted text-foreground">
                            <p className="text-xs font-medium text-primary mb-1">{resp.beraterName}</p>
                            <p className="text-sm">{resp.text}</p>
                            <p className="text-[10px] opacity-70 mt-1">
                              {new Date(resp.timestamp).toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit" })}
                            </p>
                          </div>
                        </div>
                      ))}
                      
                      {/* Connect requests */}
                      {msg.connectRequests.map((req, idx) => (
                        <div key={idx} className="flex justify-start">
                          <div className="max-w-[80%] rounded-2xl px-4 py-3 bg-primary/10 border border-primary/20">
                            <p className="text-sm text-foreground mb-2">
                              <span className="font-medium text-primary">{req.beraterName}</span> möchte mit dir connecten
                            </p>
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                onClick={() => handleAcceptConnect(msg.id, req.beraterId)}
                              >
                                Annehmen
                              </Button>
                              <Button size="sm" variant="outline">
                                Ablehnen
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ))
                )}
              </div>
              
              <div className="p-4 border-t border-border flex gap-2">
                <Input
                  placeholder="Teile anonym dein Anliegen..."
                  value={anonymousMessage}
                  onChange={(e) => setAnonymousMessage(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSendAnonymousMessage()}
                  className="flex-1"
                />
                <Button size="icon" onClick={handleSendAnonymousMessage} disabled={!anonymousMessage.trim()}>
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Berater;
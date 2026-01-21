import { useState } from "react";
import { ChevronLeft, ChevronRight, Send, Lock } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "./ui/sheet";
import { Link } from "react-router-dom";
import sarahCutout from "@/assets/sarah-mentor.png";
import martinaCutout from "@/assets/martina-mentor.png";
import oliverCutout from "@/assets/oliver-mentor.png";
interface Mentor {
  id: string;
  name: string;
  field: string;
  description: string;
  image: string;
}
const mentors: Mentor[] = [{
  id: "1",
  name: "Sarah",
  field: "Mediendesign",
  description: "Hi, ich bin Sarah, 23 Jahre Alt und habe gerade meinen Bachelor in Mediendesign an der TU München gemacht. Nun arbeite ich bei einer der größten Medienagenturen in München.",
  image: sarahCutout
}, {
  id: "2",
  name: "Martina",
  field: "Künstlerin",
  description: "Hallo! Ich bin Martina und arbeite als freischaffende Künstlerin. Ich kann dir zeigen, wie man Kreativität zum Beruf macht.",
  image: martinaCutout
}, {
  id: "3",
  name: "Oliver",
  field: "Produktdesigner",
  description: "Hey, ich bin Oliver und arbeite als Produktdesigner bei einem Tech-Startup. Von der Idee bis zum fertigen Produkt - ich zeig dir wie's geht!",
  image: oliverCutout
}];
interface MentorCarouselProps {
  isGuest?: boolean;
}
const MentorCarousel = ({
  isGuest = false
}: MentorCarouselProps) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [chatOpen, setChatOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<{
    sender: string;
    text: string;
  }[]>([]);
  const nextMentor = () => setActiveIndex(prev => (prev + 1) % mentors.length);
  const prevMentor = () => setActiveIndex(prev => (prev - 1 + mentors.length) % mentors.length);
  const activeMentor = mentors[activeIndex];
  const handleConnect = () => {
    if (isGuest) return;
    setChatOpen(true);
  };
  const handleSendMessage = () => {
    if (message.trim()) {
      const newMessages = [...messages, {
        sender: "Du",
        text: message
      }];
      setMessages(newMessages);
      setMessage("");
      localStorage.setItem("lastMentorChat", JSON.stringify({
        mentorId: activeMentor.id,
        mentorName: activeMentor.name,
        messages: newMessages
      }));
    }
  };
  return <>
      <div className="animate-fade-in">
        {/* Dark header */}
        <div className="bg-card-dark text-card-dark-foreground inline-block px-6 py-2 rounded-t-xl">
          <h3 className="font-bold text-white">Für Dich:</h3>
        </div>
        
        <div className="bg-card rounded-2xl rounded-tl-none shadow-lg overflow-hidden border border-border/30">
          <div className="grid md:grid-cols-2 gap-0">
            {/* Info Side */}
            <div className="p-6 md:p-8 flex flex-col justify-center order-2 md:order-1">
              <h3 className="font-bold text-foreground mb-1">{activeMentor.name}</h3>
              <p className="text-primary font-semibold mb-4">{activeMentor.field}</p>
              <p className="text-muted-foreground leading-relaxed mb-6">
                {activeMentor.description}
              </p>
              {isGuest ? <div className="flex items-center gap-3">
                  <Button variant="outline" disabled className="gap-2">
                    <Lock className="w-4 h-4" />
                    Connect
                  </Button>
                  <Link to="/registrierung">
                    <Button size="sm">Registrieren</Button>
                  </Link>
                </div> : <Button className="w-fit rounded-xl" onClick={handleConnect}>Connect</Button>}
            </div>

            <div className="relative h-72 md:h-96 flex items-end justify-center order-1 md:order-2 bg-transparent">
              <img src={activeMentor.image} alt={activeMentor.name} className="h-full max-h-[22rem] object-contain object-bottom" />
              
              {/* Navigation arrows */}
              <Button variant="ghost" size="icon" onClick={prevMentor} className="absolute left-4 top-1/2 -translate-y-1/2 bg-card-dark/80 text-white hover:bg-card-dark rounded-full">
                <ChevronLeft className="w-5 h-5" />
              </Button>
              <Button variant="ghost" size="icon" onClick={nextMentor} className="absolute right-4 top-1/2 -translate-y-1/2 bg-card-dark/80 text-white hover:bg-card-dark rounded-full">
                <ChevronRight className="w-5 h-5" />
              </Button>

              {/* Thumbnails */}
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-3">
                {mentors.map((mentor, index) => <button key={mentor.id} onClick={() => setActiveIndex(index)} className={`relative overflow-hidden rounded-xl transition-all shadow-lg ${index === activeIndex ? "ring-2 ring-primary w-32" : "w-28 opacity-80 hover:opacity-100"}`}>
                    <div className="bg-muted h-24">
                      <img src={mentor.image} alt={mentor.name} className="w-full h-full object-cover object-top" />
                    </div>
                    <div className="absolute inset-x-0 bottom-0 bg-card-dark/90 px-3 py-2">
                      <p className="text-sm font-semibold text-white truncate">{mentor.name}</p>
                      <p className="text-xs text-white/70 truncate">{mentor.field}</p>
                    </div>
                  </button>)}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Chat Sheet */}
      <Sheet open={chatOpen} onOpenChange={setChatOpen}>
        <SheetContent className="w-full sm:max-w-md flex flex-col">
          <SheetHeader>
            <SheetTitle className="text-primary">
              Chat mit {activeMentor.name}
            </SheetTitle>
          </SheetHeader>
          
          <div className="flex-1 overflow-y-auto py-4 space-y-3">
            {messages.length === 0 ? <p className="text-muted-foreground text-sm text-center py-8">
                Starte eine Unterhaltung mit {activeMentor.name}
              </p> : messages.map((msg, i) => <div key={i} className={`p-3 rounded-xl max-w-[80%] ${msg.sender === "Du" ? "bg-primary text-primary-foreground ml-auto" : "bg-secondary"}`}>
                  <p className="text-xs font-medium mb-1 opacity-70">{msg.sender}</p>
                  <p className="text-sm">{msg.text}</p>
                </div>)}
          </div>

          <div className="flex gap-2 pt-4 border-t">
            <Input value={message} onChange={e => setMessage(e.target.value)} placeholder="Nachricht schreiben..." onKeyDown={e => e.key === "Enter" && handleSendMessage()} className="flex-1" />
            <Button onClick={handleSendMessage} size="icon">
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    </>;
};
export default MentorCarousel;
import { useState, useMemo } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Menu, Search, MessageSquare, Users, Calculator, BookOpen, Settings, LogOut, Home, Heart, User, GraduationCap, Briefcase, Zap } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { useCoping } from "@/contexts/CopingContext";
import slothLogo from "@/assets/sloth-icon.png";

// Import mentor and advisor images
import martinaMentor from "@/assets/martina-mentor.png";
import oliverMentor from "@/assets/oliver-mentor.png";
import sarahMentor from "@/assets/sarah-mentor.png";
interface HeaderProps {
  isLoggedIn?: boolean;
  isGuest?: boolean;
}
interface SearchResult {
  type: 'user' | 'mentor' | 'berater' | 'funktion';
  name: string;
  description?: string;
  image?: string;
  href?: string;
  action?: () => void;
}
const Header = ({
  isLoggedIn = true,
  isGuest = false
}: HeaderProps) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchFocused, setSearchFocused] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const {
    openCopingDialog
  } = useCoping();
  const guestSuffix = isGuest ? "?guest=true" : "";

  // Searchable data
  const searchableItems: SearchResult[] = useMemo(() => [
  // Users (from localStorage or mock data)
  {
    type: 'user',
    name: 'Max Mustermann',
    description: 'Informatik, 4. Semester',
    image: ''
  }, {
    type: 'user',
    name: 'Anna Schmidt',
    description: 'Psychologie, 2. Semester',
    image: ''
  }, {
    type: 'user',
    name: 'Lukas Weber',
    description: 'BWL, 6. Semester',
    image: ''
  }, {
    type: 'user',
    name: 'Sophie Müller',
    description: 'Medizin, 3. Semester',
    image: ''
  },
  // Mentoren
  {
    type: 'mentor',
    name: 'Martina',
    description: 'Stressmanagement & Prüfungsangst',
    image: martinaMentor,
    href: '/dashboard'
  }, {
    type: 'mentor',
    name: 'Oliver',
    description: 'Zeitmanagement & Motivation',
    image: oliverMentor,
    href: '/dashboard'
  }, {
    type: 'mentor',
    name: 'Sarah',
    description: 'Work-Life-Balance & Selbstfürsorge',
    image: sarahMentor,
    href: '/dashboard'
  },
  // Berater
  {
    type: 'berater',
    name: 'Dr. Maria Schneider',
    description: 'Psychologische Beratung',
    image: '',
    href: '/berater'
  }, {
    type: 'berater',
    name: 'Thomas Bauer',
    description: 'Studienberatung',
    image: '',
    href: '/berater'
  }, {
    type: 'berater',
    name: 'Dr. Lisa Weber',
    description: 'Karriereberatung',
    image: '',
    href: '/berater'
  },
  // Funktionen
  {
    type: 'funktion',
    name: 'Forum',
    description: 'Austausch mit anderen Studierenden',
    href: '/forum'
  }, {
    type: 'funktion',
    name: 'Notenplaner',
    description: 'Noten verwalten und Durchschnitt berechnen',
    href: '/notenplaner'
  }, {
    type: 'funktion',
    name: 'Coping Begleiter',
    description: 'Persönlicher Bewältigungsplan',
    action: openCopingDialog
  }, {
    type: 'funktion',
    name: 'Artikel & Wissen',
    description: 'Hilfreiche Artikel und Tipps',
    href: '/artikel'
  }, {
    type: 'funktion',
    name: 'Beratung',
    description: 'Professionelle Unterstützung finden',
    href: '/berater'
  }, {
    type: 'funktion',
    name: 'Einstellungen',
    description: 'Profil und Präferenzen anpassen',
    href: '/einstellungen'
  }, {
    type: 'funktion',
    name: 'Kalender',
    description: 'Termine und Mood-Tracking',
    href: '/dashboard'
  }, {
    type: 'funktion',
    name: 'Mood-Tracker',
    description: 'Stimmung täglich erfassen',
    href: '/dashboard'
  }], [openCopingDialog]);

  // Filter results based on search query
  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const query = searchQuery.toLowerCase();
    return searchableItems.filter(item => item.name.toLowerCase().includes(query) || item.description?.toLowerCase().includes(query) || item.type.toLowerCase().includes(query)).slice(0, 8); // Limit to 8 results
  }, [searchQuery, searchableItems]);
  const handleResultClick = (result: SearchResult) => {
    setSearchQuery("");
    setSearchFocused(false);
    if (result.action) {
      result.action();
    } else if (result.href) {
      navigate(result.href);
    }
  };
  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'user':
        return <User className="w-4 h-4" />;
      case 'mentor':
        return <GraduationCap className="w-4 h-4" />;
      case 'berater':
        return <Briefcase className="w-4 h-4" />;
      case 'funktion':
        return <Zap className="w-4 h-4" />;
      default:
        return <Search className="w-4 h-4" />;
    }
  };
  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'user':
        return 'User';
      case 'mentor':
        return 'Mentor';
      case 'berater':
        return 'Berater';
      case 'funktion':
        return 'Funktion';
      default:
        return type;
    }
  };
  const getTypeColor = (type: string) => {
    switch (type) {
      case 'user':
        return 'bg-blue-500/20 text-blue-400';
      case 'mentor':
        return 'bg-purple-500/20 text-purple-400';
      case 'berater':
        return 'bg-green-500/20 text-green-400';
      case 'funktion':
        return 'bg-orange-500/20 text-orange-400';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };
  const loggedInMenuItems = [{
    label: "Home",
    href: "/dashboard",
    icon: Home
  }, {
    label: "Coping Begleiter",
    href: "/dashboard",
    icon: Heart,
    action: "openCoping"
  }, {
    label: "Forum",
    href: "/forum",
    icon: MessageSquare
  }, {
    label: "Beratung",
    href: "/berater",
    icon: Users
  }, {
    label: "Notenplaner",
    href: "/notenplaner",
    icon: Calculator
  }, {
    label: "Wissen",
    href: "/artikel",
    icon: BookOpen
  }, {
    label: "Dein Profil",
    href: "/einstellungen",
    icon: Settings
  }, {
    label: "Log Out",
    href: "/",
    accent: true,
    icon: LogOut
  }];
  const guestMenuItems = [{
    label: "Home",
    href: "/",
    icon: Home
  }, {
    label: "Beratung",
    href: `/berater${guestSuffix}`,
    icon: Users
  }, {
    label: "Anmelden",
    href: "/login",
    accent: true,
    icon: LogOut
  }];
  const loggedOutMenuItems = [{
    label: "Home",
    href: "/",
    icon: Home
  }, {
    label: "Anmelden",
    href: "/login",
    accent: true,
    icon: LogOut
  }];
  const menuItems = isGuest ? guestMenuItems : isLoggedIn ? loggedInMenuItems : loggedOutMenuItems;
  return <>
      {/* Header */}
      <header className="sticky top-0 z-40 bg-card-dark backdrop-blur-sm">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between gap-4">
            {/* Logo */}
            <Link to={isGuest ? "/" : isLoggedIn ? "/dashboard" : "/"} className="flex items-center gap-3 hover:opacity-90 transition-opacity">
              <img src={slothLogo} alt="Logo" className="h-10 w-auto object-contain drop-shadow-sm" />
              <div className="flex flex-col">
                <h1 className="text-lg md:text-xl font-bold text-white leading-tight">Campus Hugo
              </h1>
                {isGuest && <span className="text-[10px] text-white/70 font-medium tracking-wide">GASTMODUS</span>}
              </div>
            </Link>

            {/* Search - Desktop (only when logged in, not guest) */}
            {isLoggedIn && !isGuest && <div className="hidden md:flex flex-1 max-w-md relative">
                <div className="relative w-full">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input placeholder="User, Mentoren, Berater, Funktionen..." className="pl-10 bg-white/95 border-0 focus-visible:ring-white/50 rounded-xl shadow-sm" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} onFocus={() => setSearchFocused(true)} onBlur={() => setTimeout(() => setSearchFocused(false), 200)} />
                </div>
                
                {/* Search Results Dropdown */}
                {searchFocused && searchQuery.trim() && <div className="absolute top-full left-0 right-0 mt-2 bg-card rounded-xl shadow-2xl border border-border/50 overflow-hidden z-50">
                    {searchResults.length > 0 ? <div className="py-2">
                        {searchResults.map((result, index) => <button key={`${result.type}-${result.name}-${index}`} className="w-full flex items-center gap-3 px-4 py-3 hover:bg-muted/50 transition-colors text-left" onClick={() => handleResultClick(result)}>
                            {/* Avatar or Icon */}
                            {result.image ? <img src={result.image} alt={result.name} className="w-10 h-10 rounded-full object-cover bg-muted" /> : <div className={`w-10 h-10 rounded-full flex items-center justify-center ${getTypeColor(result.type)}`}>
                                {getTypeIcon(result.type)}
                              </div>}
                            
                            {/* Content */}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <span className="font-medium text-foreground truncate">{result.name}</span>
                                <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${getTypeColor(result.type)}`}>
                                  {getTypeLabel(result.type)}
                                </span>
                              </div>
                              {result.description && <p className="text-xs text-muted-foreground truncate">{result.description}</p>}
                            </div>
                          </button>)}
                      </div> : <div className="py-8 text-center text-muted-foreground">
                        <Search className="w-8 h-8 mx-auto mb-2 opacity-50" />
                        <p className="text-sm">Keine Ergebnisse für "{searchQuery}"</p>
                      </div>}
                  </div>}
              </div>}

            {/* Menu Button */}
            <Button variant="ghost" size="icon" className="text-white hover:bg-white/15" onClick={() => setMenuOpen(!menuOpen)}>
              <Menu className="w-6 h-6" />
            </Button>
          </div>
        </div>
      </header>

      {/* Menu Overlay */}
      {menuOpen && <>
          <div className="fixed inset-0 z-50 bg-black/20" onClick={() => setMenuOpen(false)} />
          <div className="fixed top-16 right-4 bg-card rounded-2xl shadow-2xl z-50 animate-scale-in min-w-[180px] border border-border/50">
            <nav className="py-2">
              {menuItems.slice(0, -1).map(item => {
            const hasAction = 'action' in item && item.action === 'openCoping';
            if (hasAction) {
              return <button key={item.label} onClick={() => {
                setMenuOpen(false);
                openCopingDialog();
              }} className="flex items-center gap-3 px-5 py-3 text-sm font-medium text-foreground hover:bg-muted transition-colors w-full text-left">
                      {item.icon && <item.icon className="w-4 h-4 text-muted-foreground" />}
                      {item.label}
                    </button>;
            }
            return <Link key={item.label} to={item.href} onClick={() => setMenuOpen(false)} className="flex items-center gap-3 px-5 py-3 text-sm font-medium text-foreground hover:bg-muted transition-colors">
                    {item.icon && <item.icon className="w-4 h-4 text-muted-foreground" />}
                    {item.label}
                  </Link>;
          })}
              {isGuest ? <>
                  <div className="border-t border-border my-2" />
                  <Link to="/registrierung" onClick={() => setMenuOpen(false)} className="block px-5 py-3 text-sm font-medium text-foreground hover:bg-muted transition-colors">
                    Registrieren
                  </Link>
                  <Link to="/login" onClick={() => setMenuOpen(false)} className="block px-5 py-3 text-sm font-medium text-primary hover:bg-primary/10 transition-colors">
                    Anmelden
                  </Link>
                </> : <>
                  <div className="border-t border-border my-2" />
                  {(() => {
              const lastItem = menuItems[menuItems.length - 1];
              const IconComponent = lastItem.icon;
              return <Link to={lastItem.href} onClick={() => setMenuOpen(false)} className={`flex items-center gap-3 px-5 py-3 text-sm font-medium transition-colors ${lastItem.accent ? "text-primary hover:bg-primary/10" : "text-foreground hover:bg-muted"}`}>
                        {IconComponent && <IconComponent className="w-4 h-4" />}
                        {lastItem.label}
                      </Link>;
            })()}
                </>}
            </nav>
          </div>
        </>}
    </>;
};
export default Header;
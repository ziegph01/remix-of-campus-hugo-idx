import { useState, useEffect } from "react";
import { Moon, Sun, User, GraduationCap, Sparkles, Trophy } from "lucide-react";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "@/hooks/use-toast";
import BadgeSystem, { getUserExp, getUserLevel, unlockBadge } from "@/components/BadgeSystem";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const Einstellungen = () => {
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem("theme") === "dark";
  });
  const [username, setUsername] = useState(() => {
    return localStorage.getItem("username") || "Student";
  });
  const [studiengang, setStudiengang] = useState(() => {
    return localStorage.getItem("studiengang") || "";
  });
  const [hochschule, setHochschule] = useState(() => {
    return localStorage.getItem("hochschule") || "";
  });
  const [interessen, setInteressen] = useState(() => {
    return localStorage.getItem("interessen") || "";
  });
  const [gluecklich, setGluecklich] = useState(() => {
    return localStorage.getItem("gluecklich") || "";
  });
  const [profiltext, setProfiltext] = useState(() => {
    return localStorage.getItem("profiltext") || "";
  });
  const [profileImage, setProfileImage] = useState<string | null>(() => {
    return localStorage.getItem("profileImage");
  });
  const [bannerImage, setBannerImage] = useState<string | null>(() => {
    return localStorage.getItem("bannerImage");
  });

  // Check for first login badge
  useEffect(() => {
    const hasVisited = localStorage.getItem("hasVisitedProfile");
    if (!hasVisited) {
      unlockBadge("first_login");
      localStorage.setItem("hasVisitedProfile", "true");
      toast({ title: "🎉 Badge freigeschaltet!", description: "Willkommen! +10 EXP" });
    }
  }, []);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [darkMode]);

  const handleSaveProfile = () => {
    localStorage.setItem("username", username);
    localStorage.setItem("studiengang", studiengang);
    localStorage.setItem("hochschule", hochschule);
    localStorage.setItem("interessen", interessen);
    localStorage.setItem("gluecklich", gluecklich);
    localStorage.setItem("profiltext", profiltext);
    
    // Check if profile is complete for badge
    if (username && hochschule && studiengang && interessen && gluecklich && profileImage) {
      const unlocked = unlockBadge("profile_complete");
      if (unlocked) {
        toast({ title: "🎉 Badge freigeschaltet!", description: "Profi-Profil +30 EXP" });
      }
    }
    
    toast({ title: "Gespeichert", description: "Dein Profil wurde aktualisiert." });
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, type: "profile" | "banner") => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        if (type === "profile") {
          setProfileImage(base64);
          localStorage.setItem("profileImage", base64);
        } else {
          setBannerImage(base64);
          localStorage.setItem("bannerImage", base64);
        }
        toast({ title: "Bild aktualisiert", description: `Dein ${type === "profile" ? "Profilbild" : "Bannerbild"} wurde gespeichert.` });
      };
      reader.readAsDataURL(file);
    }
  };

  const exp = getUserExp();
  const { level } = getUserLevel(exp);

  return (
    <div className="min-h-screen bg-background pb-8">
      <Header />
      
      <main className="page-container py-6 md:py-8">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
            <Trophy className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-foreground">Dein Profil</h1>
            <p className="text-muted-foreground">Level {level} • {exp} EXP</p>
          </div>
        </div>
        
        <div className="max-w-2xl mx-auto">
          <Tabs defaultValue="badges" className="space-y-6">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="badges">🏆 Badges & EXP</TabsTrigger>
              <TabsTrigger value="settings">⚙️ Einstellungen</TabsTrigger>
            </TabsList>
            
            <TabsContent value="badges">
              <BadgeSystem />
            </TabsContent>
            
            <TabsContent value="settings" className="space-y-6">
        {/* Profile Section */}
        <div className="bg-card rounded-2xl shadow-lg p-6">
          <div className="flex items-center gap-4 mb-6">
            <div className="relative">
              <Avatar className="w-20 h-20 border-4 border-card">
                <AvatarImage src={profileImage || undefined} />
                <AvatarFallback className="bg-primary text-primary-foreground text-2xl font-bold">
                  {username ? username.charAt(0).toUpperCase() : "?"}
                </AvatarFallback>
              </Avatar>
              <label className="absolute -bottom-1 -right-1 cursor-pointer">
                <input type="file" accept="image/*" className="hidden" onChange={(e) => handleImageUpload(e, "profile")} />
                <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-md hover:bg-primary/90 transition-colors">
                  <User className="w-4 h-4" />
                </div>
              </label>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">{username}</h1>
              <p className="text-muted-foreground">{hochschule || "Dein Profil"}</p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <Label htmlFor="username">Benutzername</Label>
              <Input 
                id="username" 
                value={username} 
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Dein Name"
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="profiltext">Profiltext</Label>
              <Textarea 
                id="profiltext" 
                value={profiltext} 
                onChange={(e) => setProfiltext(e.target.value)}
                placeholder="Erzähl etwas über dich... z.B. Hobbys, was dich ausmacht, Fun Facts 🌟"
                className="mt-1 resize-none"
                rows={3}
              />
              <p className="text-xs text-muted-foreground mt-1">Dieser Text wird anderen Nutzern angezeigt, wenn sie auf dein Profilbild klicken.</p>
            </div>
          </div>
        </div>

        {/* Studium Section */}
        <div className="bg-card rounded-2xl shadow-lg p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <GraduationCap className="w-5 h-5 text-primary" />
            </div>
            <h2 className="text-lg font-bold text-foreground">Studium</h2>
          </div>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="hochschule">Hochschule</Label>
              <Input 
                id="hochschule" 
                value={hochschule} 
                onChange={(e) => setHochschule(e.target.value)}
                placeholder="z.B. TU München"
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="studiengang">Studiengang</Label>
              <Input 
                id="studiengang" 
                value={studiengang} 
                onChange={(e) => setStudiengang(e.target.value)}
                placeholder="z.B. Informatik"
                className="mt-1"
              />
            </div>
          </div>
        </div>

        {/* Persönliches Section */}
        <div className="bg-card rounded-2xl shadow-lg p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-accent" />
            </div>
            <h2 className="text-lg font-bold text-foreground">Persönliches</h2>
          </div>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="interessen">Deine Interessen</Label>
              <Textarea 
                id="interessen" 
                value={interessen} 
                onChange={(e) => setInteressen(e.target.value)}
                placeholder="z.B. Sport, Musik, Reisen, Gaming..."
                className="mt-1 resize-none"
                rows={2}
              />
            </div>
            <div>
              <Label htmlFor="gluecklich">Eine Sache, die dich glücklich macht ✨</Label>
              <Input 
                id="gluecklich" 
                value={gluecklich} 
                onChange={(e) => setGluecklich(e.target.value)}
                placeholder="z.B. Zeit mit Freunden"
                className="mt-1"
              />
            </div>
          </div>
        </div>

        {/* Save Button */}
        <Button onClick={handleSaveProfile} className="w-full">
          Änderungen speichern
        </Button>

        {/* Appearance Section */}
        <div className="bg-card rounded-2xl shadow-lg p-6">
          <h2 className="text-lg font-bold text-foreground mb-4">Erscheinungsbild</h2>
          
          <div className="flex items-center justify-between p-4 bg-muted rounded-xl">
            <div className="flex items-center gap-3">
              {darkMode ? <Moon className="w-5 h-5 text-primary" /> : <Sun className="w-5 h-5 text-primary" />}
              <div>
                <p className="font-medium text-foreground">Dark Mode</p>
                <p className="text-sm text-muted-foreground">
                  {darkMode ? "Dunkles Design aktiv" : "Helles Design aktiv"}
                </p>
              </div>
            </div>
            <Switch checked={darkMode} onCheckedChange={setDarkMode} />
          </div>
        </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
};

export default Einstellungen;

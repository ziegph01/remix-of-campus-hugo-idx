import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowRight, ArrowLeft, Mail, Lock, Eye, EyeOff, User, Building2, BookOpen, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";
import slothMascot from "@/assets/sloth-mascot.png";
const Registrierung = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    username: "",
    studiengang: "",
    hochschule: "",
    interessen: "",
    gluecklich: ""
  });
  const updateField = (field: string, value: string) => {
    setFormData({
      ...formData,
      [field]: value
    });
  };
  const handleNext = () => {
    if (step === 1) {
      if (!formData.email.trim() || !formData.password.trim()) {
        toast({
          title: "Bitte fülle alle Felder aus",
          variant: "destructive"
        });
        return;
      }
      if (!formData.email.includes("@")) {
        toast({
          title: "Bitte gib eine gültige E-Mail ein",
          variant: "destructive"
        });
        return;
      }
      if (formData.password.length < 6) {
        toast({
          title: "Passwort muss mindestens 6 Zeichen haben",
          variant: "destructive"
        });
        return;
      }
    }
    if (step === 2 && !formData.username.trim()) {
      toast({
        title: "Bitte gib einen Namen ein",
        variant: "destructive"
      });
      return;
    }
    setStep(step + 1);
  };
  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };
  const handleFinish = () => {
    // Save all profile data
    localStorage.setItem("userEmail", formData.email);
    localStorage.setItem("userPassword", formData.password);
    localStorage.setItem("username", formData.username);
    localStorage.setItem("studiengang", formData.studiengang);
    localStorage.setItem("hochschule", formData.hochschule);
    localStorage.setItem("interessen", formData.interessen);
    localStorage.setItem("gluecklich", formData.gluecklich);
    localStorage.setItem("isRegistered", "true");
    localStorage.setItem("isLoggedIn", "true");
    toast({
      title: "Willkommen!",
      description: `Schön, dass du da bist, ${formData.username}!`
    });
    navigate("/dashboard");
  };
  return <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Progress */}
        <div className="flex gap-2 mb-8">
          {[1, 2, 3, 4].map(s => <div key={s} className={`h-1.5 flex-1 rounded-full transition-colors ${s <= step ? "bg-primary" : "bg-muted"}`} />)}
        </div>

        <div className="bg-card rounded-2xl shadow-sm border border-border/50 p-8 animate-fade-in">
          {/* Step 1: Account */}
          {step === 1 && <div className="space-y-6">
              <div className="text-center">
                <img alt="Hugo" src="/lovable-uploads/00492091-54a4-41c2-bd91-1a0bdab2d584.png" className="w-16 h-16 mx-auto mb-4 animate-float object-cover" />
                <h1 className="text-2xl font-display font-semibold text-foreground mb-2">Erstelle dein Konto</h1>
                <p className="text-muted-foreground text-sm">Deine Daten bleiben sicher und privat.</p>
              </div>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="email" className="text-sm font-medium">E-Mail</Label>
                  <div className="relative mt-1.5">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input id="email" type="email" value={formData.email} onChange={e => updateField("email", e.target.value)} placeholder="deine@email.de" className="pl-10" autoFocus />
                  </div>
                </div>
                <div>
                  <Label htmlFor="password" className="text-sm font-medium">Passwort</Label>
                  <div className="relative mt-1.5">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input id="password" type={showPassword ? "text" : "password"} value={formData.password} onChange={e => updateField("password", e.target.value)} placeholder="Mindestens 6 Zeichen" className="pl-10 pr-10" />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </div>
              <Button onClick={handleNext} className="w-full h-11">
                Weiter
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
              <p className="text-sm text-muted-foreground text-center">
                Bereits ein Konto?{" "}
                <Link to="/login" className="text-primary hover:underline font-medium">
                  Einloggen
                </Link>
              </p>
            </div>}

          {/* Step 2: Name */}
          {step === 2 && <div className="space-y-6">
              <div className="text-center">
                <div className="w-14 h-14 bg-primary/10 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <User className="w-7 h-7 text-primary" />
                </div>
                <h1 className="text-2xl font-display font-semibold text-foreground mb-2">Wie heißt du?</h1>
                <p className="text-muted-foreground text-sm">
                  So können wir dich persönlich begrüßen und die App für dich personalisieren.
                </p>
              </div>
              <div>
                <Label htmlFor="username" className="text-sm font-medium">Dein Name oder Spitzname</Label>
                <Input id="username" value={formData.username} onChange={e => updateField("username", e.target.value)} placeholder="z.B. Max" className="mt-1.5" autoFocus />
              </div>
              <div className="flex gap-3">
                <Button variant="outline" onClick={handleBack} className="h-11">
                  <ArrowLeft className="w-4 h-4" />
                </Button>
                <Button onClick={handleNext} className="flex-1 h-11">
                  Weiter
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </div>}

          {/* Step 3: Studium */}
          {step === 3 && <div className="space-y-6">
              <div className="text-center">
                <div className="w-14 h-14 bg-primary/10 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <Building2 className="w-7 h-7 text-primary" />
                </div>
                <h1 className="text-2xl font-display font-semibold text-foreground mb-2">Dein Studium</h1>
                <p className="text-muted-foreground text-sm">
                  Hilft uns, dich mit Studierenden deiner Hochschule zu verbinden und passende Beratungsangebote zu zeigen.
                </p>
              </div>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="hochschule" className="text-sm font-medium">Hochschule</Label>
                  <div className="relative mt-1.5">
                    <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input id="hochschule" value={formData.hochschule} onChange={e => updateField("hochschule", e.target.value)} placeholder="z.B. TU München" className="pl-10" />
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">Optional – du kannst es später ergänzen</p>
                </div>
                <div>
                  <Label htmlFor="studiengang" className="text-sm font-medium">Studiengang</Label>
                  <div className="relative mt-1.5">
                    <BookOpen className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input id="studiengang" value={formData.studiengang} onChange={e => updateField("studiengang", e.target.value)} placeholder="z.B. Informatik" className="pl-10" />
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">Optional</p>
                </div>
              </div>
              <div className="flex gap-3">
                <Button variant="outline" onClick={handleBack} className="h-11">
                  <ArrowLeft className="w-4 h-4" />
                </Button>
                <Button onClick={handleNext} className="flex-1 h-11">
                  Weiter
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </div>}

          {/* Step 4: Persönliches */}
          {step === 4 && <div className="space-y-6">
              <div className="text-center">
                <div className="w-14 h-14 bg-primary/10 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <Sparkles className="w-7 h-7 text-primary" />
                </div>
                <h1 className="text-2xl font-display font-semibold text-foreground mb-2">Fast geschafft!</h1>
                <p className="text-muted-foreground text-sm">
                  Diese Infos helfen Hugo, dich besser zu verstehen und dir passende Inhalte zu zeigen.
                </p>
              </div>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="interessen" className="text-sm font-medium">Was interessiert dich?</Label>
                  <Textarea id="interessen" value={formData.interessen} onChange={e => updateField("interessen", e.target.value)} placeholder="z.B. Sport, Musik, Reisen, Gaming..." className="mt-1.5 resize-none" rows={2} />
                  <p className="text-xs text-muted-foreground mt-1">Optional – für personalisierte Tipps</p>
                </div>
                <div>
                  <Label htmlFor="gluecklich" className="text-sm font-medium">Was macht dich glücklich?</Label>
                  <Input id="gluecklich" value={formData.gluecklich} onChange={e => updateField("gluecklich", e.target.value)} placeholder="z.B. Zeit mit Freunden, guter Kaffee..." className="mt-1.5" />
                  <p className="text-xs text-muted-foreground mt-1">Optional – Hugo erinnert dich daran, wenn du es brauchst</p>
                </div>
              </div>
              <div className="flex gap-3">
                <Button variant="outline" onClick={handleBack} className="h-11">
                  <ArrowLeft className="w-4 h-4" />
                </Button>
                <Button onClick={handleFinish} className="flex-1 h-11">
                  Los geht's!
                </Button>
              </div>
            </div>}
        </div>
      </div>
    </div>;
};
export default Registrierung;
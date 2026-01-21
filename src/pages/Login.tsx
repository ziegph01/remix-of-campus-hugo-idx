import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Mail, Lock, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import slothMascot from "@/assets/sloth-mascot.png";

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email.trim() || !password.trim()) {
      toast({ title: "Fehler", description: "Bitte fülle alle Felder aus.", variant: "destructive" });
      return;
    }

    setIsLoading(true);

    // Check localStorage for registered user
    const storedEmail = localStorage.getItem("userEmail");
    const storedPassword = localStorage.getItem("userPassword");

    setTimeout(() => {
      if (storedEmail === email && storedPassword === password) {
        localStorage.setItem("isLoggedIn", "true");
        toast({ title: "Willkommen zurück!", description: "Du wurdest erfolgreich eingeloggt." });
        navigate("/dashboard");
      } else {
        toast({ title: "Login fehlgeschlagen", description: "E-Mail oder Passwort ist falsch.", variant: "destructive" });
      }
      setIsLoading(false);
    }, 500);
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-card rounded-2xl shadow-xl p-8 animate-fade-in">
          <div className="text-center mb-8">
            <img src={slothMascot} alt="Maskottchen" className="w-20 h-20 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-foreground mb-2">Willkommen zurück!</h1>
            <p className="text-muted-foreground">Melde dich an, um fortzufahren</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <Label htmlFor="email">E-Mail</Label>
              <div className="relative mt-1">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="deine@email.de"
                  className="pl-10"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="password">Passwort</Label>
              <div className="relative mt-1">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="pl-10 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Wird eingeloggt..." : "Einloggen"}
            </Button>
          </form>

          <div className="mt-6 text-center space-y-3">
            <p className="text-sm text-muted-foreground">
              Noch kein Konto?{" "}
              <Link to="/registrierung" className="text-primary hover:underline font-medium">
                Jetzt registrieren
              </Link>
            </p>
            <p className="text-sm">
              <Link to="/dashboard" className="text-muted-foreground hover:text-foreground">
                Oder als Gast erkunden →
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;

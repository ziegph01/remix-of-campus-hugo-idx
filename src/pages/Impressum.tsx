import { ArrowLeft, MapPin, Users, GraduationCap } from "lucide-react";
import { Link, useSearchParams, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";

const Impressum = () => {
  const [searchParams] = useSearchParams();
  const location = useLocation();
  
  // Check if user came from guest mode or logged in state
  const fromGuest = searchParams.get("guest") === "true";
  const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";
  
  // Determine back link - maintain previous state
  const getBackLink = () => {
    if (fromGuest) {
      return "/?guest=true";
    }
    if (isLoggedIn) {
      return "/dashboard";
    }
    return "/";
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-card border-b border-border sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center gap-4">
          <Link to={getBackLink()}>
            <Button variant="ghost" size="icon">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <h1 className="text-xl font-bold text-foreground">Impressum</h1>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="bg-card rounded-2xl p-8 shadow-md border border-border/50">
          {/* Institution */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <GraduationCap className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-foreground">Technische Hochschule Ulm</h2>
                <p className="text-sm text-muted-foreground">Hochschule für Angewandte Wissenschaften</p>
              </div>
            </div>
          </div>

          {/* Address */}
          <div className="mb-8">
            <div className="flex items-start gap-3">
              <MapPin className="w-5 h-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-foreground font-medium">Adresse</p>
                <p className="text-muted-foreground">Albert-Einstein-Allee 55</p>
                <p className="text-muted-foreground">89081 Ulm</p>
                <p className="text-muted-foreground">Deutschland</p>
              </div>
            </div>
          </div>

          {/* Team */}
          <div className="mb-8">
            <div className="flex items-start gap-3">
              <Users className="w-5 h-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-foreground font-medium mb-2">Projektteam</p>
                <ul className="space-y-1 text-muted-foreground">
                  <li>Michelle Ahrens</li>
                  <li>Tabea Geiger</li>
                  <li>Philipp Ziegler</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Project Info */}
          <div className="bg-primary/5 rounded-xl p-5 border border-primary/20">
            <p className="text-foreground leading-relaxed">
              Dieses Projekt ist im Rahmen des <strong className="text-primary">3. Semesters Interaction Design</strong> an der Technischen Hochschule Ulm entstanden.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Impressum;
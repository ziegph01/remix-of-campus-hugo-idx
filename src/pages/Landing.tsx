import { Link } from "react-router-dom";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import slothMascot from "@/assets/sloth-mascot.png";
import { Users, Heart, BarChart3, ArrowRight } from "lucide-react";
const Landing = () => {
  return <div className="min-h-screen bg-background">
      <Header isLoggedIn={false} />
      
      <main>
        {/* Hero Section - Clean & Modern */}
        <section className="container mx-auto px-4 py-16 md:py-24">
          <div className="max-w-3xl mx-auto text-center">
            <div className="flex justify-center mb-8">
              <img alt="Hugo - Dein Begleiter" src="/lovable-uploads/68afc262-186b-4f3a-a17a-d4592e2439af.png" className="w-24 h-24 md:w-32 md:h-32 animate-float object-cover" />
            </div>
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-semibold mb-6 leading-tight">
              Dein Begleiter für ein
              <span className="text-primary"> gesundes Studium</span>
            </h1>
            
            <p className="text-lg md:text-xl text-muted-foreground mb-10 max-w-2xl mx-auto leading-relaxed">
              Mentale Gesundheit, Community und Selbstmanagement – 
              alles an einem Ort für Studierende.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button asChild size="lg" className="text-base px-8 h-12 rounded-xl shadow-md">
                <Link to="/registrierung">
                  Kostenlos starten
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="text-base px-8 h-12 rounded-xl">
                <Link to="/dashboard?guest=true">Als Gast erkunden</Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-20 bg-secondary/30">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-semibold mb-4">
              Was macht Campus Wellbeing besonders?
              </h2>
              <p className="text-muted-foreground max-w-xl mx-auto">
                Entwickelt von Studierenden für Studierende – mit Fokus auf das, was wirklich hilft.
              </p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              <Link to="/forum?guest=true" className="bg-card rounded-2xl p-8 shadow-sm border border-border/50 hover:border-primary/50 hover:shadow-md transition-all">
                <div className="w-14 h-14 bg-primary/10 rounded-xl flex items-center justify-center mb-6">
                  <Users className="w-7 h-7 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-3">Community</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Tausche dich anonym mit anderen Studierenden aus. Du bist nicht allein mit deinen Herausforderungen.
                </p>
              </Link>
              
              <Link to="/dashboard?guest=true" className="bg-card rounded-2xl p-8 shadow-sm border border-border/50 hover:border-primary/50 hover:shadow-md transition-all">
                <div className="w-14 h-14 bg-primary/10 rounded-xl flex items-center justify-center mb-6">
                  <BarChart3 className="w-7 h-7 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-3">Selbstmanagement</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Mood-Tracking, Notenplaner und mehr – behalte den Überblick über dein Wohlbefinden und Studium.
                </p>
              </Link>
              
              <Link to="/berater?guest=true" className="bg-card rounded-2xl p-8 shadow-sm border border-border/50 hover:border-primary/50 hover:shadow-md transition-all">
                <div className="w-14 h-14 bg-primary/10 rounded-xl flex items-center justify-center mb-6">
                  <Heart className="w-7 h-7 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-3">Beratung</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Finde professionelle Unterstützung wenn du sie brauchst – niedrigschwellig und vertraulich.
                </p>
              </Link>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl md:text-4xl font-semibold mb-4">
              Bereit loszulegen?
            </h2>
            <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
              Registriere dich kostenlos und entdecke, wie Campus Wellbeing dein Studium unterstützen kann.
            </p>
            <Button asChild size="lg" className="text-base px-8 h-12">
              <Link to="/registrierung">
                Jetzt registrieren
                <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </Button>
          </div>
        </section>

        {/* Footer */}
        <footer className="py-8 border-t border-border">
          <div className="container mx-auto px-4 text-center">
            <a href="/impressum" className="text-sm text-muted-foreground hover:text-primary transition-colors">Impressum</a>
          </div>
        </footer>
      </main>
    </div>;
};
export default Landing;
import { useState } from "react";
import CopingPlanDialog from "./CopingPlanDialog";
interface HeroSectionProps {
  userName?: string;
  isGuest?: boolean;
}
const HeroSection = ({
  userName = "UserX",
  isGuest = false
}: HeroSectionProps) => {
  const [copingDialogOpen, setCopingDialogOpen] = useState(false);
  return <>
      <div className="relative w-full animate-fade-in">
        <div className="page-container py-6 md:py-10">
          <div className="flex items-center justify-between">
            {/* Welcome text */}
            <div className="space-y-1">
              <p className="text-muted-foreground text-sm md:text-base">
                {isGuest ? "Willkommen im" : "Willkommen zurück,"}
              </p>
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-semibold text-foreground">
                {isGuest ? "Gastmodus" : userName}
              </h1>
              {isGuest && <p className="text-sm text-muted-foreground pt-1">
                  Schau dich um – für alle Features registriere dich kostenlos.
                </p>}
            </div>
            
            {/* Mascot - Clickable - Desktop */}
            <div className="hidden md:block">
              <button onClick={() => setCopingDialogOpen(true)} className="group relative cursor-pointer transition-transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded-full" aria-label="Öffne Hugos Coping-Plan">
                <img alt="Hugo - Klicke für deinen Coping-Plan" className="w-44 h-44 lg:w-56 lg:h-56 object-contain animate-float" src="/lovable-uploads/0a5e2dc1-740a-4863-bb86-c3228cfdd37b.png" />
                
                {/* Speech bubble - positioned to the upper left, not covering Hugo */}
                
              </button>
            </div>

            {/* Mascot - Clickable - Mobile */}
            <div className="block md:hidden">
              <button onClick={() => setCopingDialogOpen(true)} className="group relative cursor-pointer transition-transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded-full" aria-label="Öffne Hugos Coping-Plan">
                <img alt="Hugo - Klicke für deinen Coping-Plan" className="w-24 h-24 object-contain animate-float" src="/lovable-uploads/0a5e2dc1-740a-4863-bb86-c3228cfdd37b.png" />
                
                {/* Speech bubble - positioned above on mobile */}
                
              </button>
            </div>
          </div>
        </div>
      </div>

      <CopingPlanDialog open={copingDialogOpen} onOpenChange={setCopingDialogOpen} />
    </>;
};
export default HeroSection;
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Trophy } from "lucide-react";
import { BADGES } from "./BadgeSystem";

interface BadgeNotificationData {
  badgeId: string;
  badgeName: string;
  exp: number;
}

export const showBadgeNotification = (badgeId: string) => {
  const badge = BADGES.find(b => b.id === badgeId);
  if (!badge) return;
  
  // Store notification in localStorage to be displayed
  const notification: BadgeNotificationData = {
    badgeId: badge.id,
    badgeName: badge.name,
    exp: badge.exp
  };
  localStorage.setItem("pendingBadgeNotification", JSON.stringify(notification));
  
  // Dispatch custom event to notify the component
  window.dispatchEvent(new CustomEvent("badgeUnlocked", { detail: notification }));
};

const BadgeNotification = () => {
  const [notification, setNotification] = useState<BadgeNotificationData | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const handleBadgeUnlocked = (event: CustomEvent<BadgeNotificationData>) => {
      setNotification(event.detail);
      setIsVisible(true);
      
      // Auto-hide after 5 seconds
      setTimeout(() => {
        setIsVisible(false);
        setTimeout(() => setNotification(null), 300);
      }, 5000);
    };

    // Check for pending notification on mount
    const pending = localStorage.getItem("pendingBadgeNotification");
    if (pending) {
      try {
        const data = JSON.parse(pending);
        setNotification(data);
        setIsVisible(true);
        localStorage.removeItem("pendingBadgeNotification");
        
        setTimeout(() => {
          setIsVisible(false);
          setTimeout(() => setNotification(null), 300);
        }, 5000);
      } catch (e) {
        console.error("Error parsing badge notification:", e);
      }
    }

    window.addEventListener("badgeUnlocked", handleBadgeUnlocked as EventListener);
    return () => {
      window.removeEventListener("badgeUnlocked", handleBadgeUnlocked as EventListener);
    };
  }, []);

  const handleClick = () => {
    setIsVisible(false);
    setTimeout(() => {
      setNotification(null);
      navigate("/einstellungen");
    }, 300);
  };

  if (!notification) return null;

  return (
    <div
      onClick={handleClick}
      className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-50 cursor-pointer transition-all duration-300 ${
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-full"
      }`}
    >
      <div className="bg-card border border-primary/30 rounded-xl p-4 shadow-lg flex items-center gap-3 hover:bg-muted/50 transition-colors max-w-sm">
        <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center">
          <Trophy className="w-6 h-6 text-primary" />
        </div>
        <div className="flex-1">
          <p className="font-bold text-foreground text-sm">🎉 Badge freigeschaltet!</p>
          <p className="text-foreground text-sm font-medium">{notification.badgeName}</p>
          <p className="text-primary text-xs">+{notification.exp} EXP • Klicken zum Ansehen</p>
        </div>
      </div>
    </div>
  );
};

export default BadgeNotification;

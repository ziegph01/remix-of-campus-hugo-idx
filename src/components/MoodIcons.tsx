import { Smile, Meh, Frown, Laugh, Annoyed } from "lucide-react";

interface MoodIconProps {
  mood: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const moodConfig = {
  great: { icon: Laugh, color: "text-mood-great" },
  good: { icon: Smile, color: "text-mood-good" },
  neutral: { icon: Meh, color: "text-mood-neutral" },
  unwell: { icon: Annoyed, color: "text-mood-unwell" },
  bad: { icon: Frown, color: "text-mood-bad" },
};

const sizeClasses = {
  sm: "w-5 h-5",
  md: "w-7 h-7",
  lg: "w-10 h-10",
};

export const MoodIcon = ({ mood, size = "md", className = "" }: MoodIconProps) => {
  const config = moodConfig[mood as keyof typeof moodConfig];
  if (!config) return null;
  
  const Icon = config.icon;
  return <Icon className={`${sizeClasses[size]} ${config.color} ${className}`} strokeWidth={2.5} />;
};

// Reihenfolge: links=schlecht, rechts=gut | Skala: 1=sehr gut, 5=sehr schlecht
export const moods = [
  { id: "bad", label: "schlecht", value: 5, icon: Frown, color: "bg-mood-bad", textColor: "text-mood-bad" },
  { id: "unwell", label: "unwohl", value: 4, icon: Annoyed, color: "bg-mood-unwell", textColor: "text-mood-unwell" },
  { id: "neutral", label: "neutral", value: 3, icon: Meh, color: "bg-mood-neutral", textColor: "text-mood-neutral" },
  { id: "good", label: "gut", value: 2, icon: Smile, color: "bg-mood-good", textColor: "text-mood-good" },
  { id: "great", label: "sehr gut", value: 1, icon: Laugh, color: "bg-mood-great", textColor: "text-mood-great" },
];

export default MoodIcon;
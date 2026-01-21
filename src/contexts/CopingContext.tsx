import { createContext, useContext, useState, ReactNode } from "react";
import CopingPlanDialog from "@/components/CopingPlanDialog";

interface CopingContextType {
  openCopingDialog: () => void;
}

const CopingContext = createContext<CopingContextType | undefined>(undefined);

export const useCoping = () => {
  const context = useContext(CopingContext);
  if (!context) {
    throw new Error("useCoping must be used within a CopingProvider");
  }
  return context;
};

interface CopingProviderProps {
  children: ReactNode;
}

export const CopingProvider = ({ children }: CopingProviderProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const openCopingDialog = () => {
    setIsOpen(true);
  };

  return (
    <CopingContext.Provider value={{ openCopingDialog }}>
      {children}
      <CopingPlanDialog open={isOpen} onOpenChange={setIsOpen} />
    </CopingContext.Provider>
  );
};

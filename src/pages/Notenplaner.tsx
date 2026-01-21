import { useState } from "react";
import { Plus, Trash2, GraduationCap, TrendingUp, Pencil, Calculator } from "lucide-react";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "@/hooks/use-toast";

interface Grade {
  id: string;
  subject: string;
  grade: number;
  credits: number;
  semester: string;
}

const Notenplaner = () => {
  const [grades, setGrades] = useState<Grade[]>(() => {
    const saved = localStorage.getItem("grades");
    return saved ? JSON.parse(saved) : [];
  });
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingGrade, setEditingGrade] = useState<Grade | null>(null);
  const [newGrade, setNewGrade] = useState({
    subject: "",
    grade: "",
    credits: "",
    semester: ""
  });

  const saveGrades = (newGrades: Grade[]) => {
    setGrades(newGrades);
    localStorage.setItem("grades", JSON.stringify(newGrades));
  };

  const addGrade = () => {
    if (!newGrade.subject || !newGrade.grade || !newGrade.credits || !newGrade.semester) {
      toast({
        title: "Fehler",
        description: "Bitte fülle alle Pflichtfelder aus (inkl. Semester).",
        variant: "destructive"
      });
      return;
    }

    if (editingGrade) {
      // Update existing grade
      const updatedGrades = grades.map(g => 
        g.id === editingGrade.id 
          ? {
              ...g,
              subject: newGrade.subject,
              grade: parseFloat(newGrade.grade),
              credits: parseInt(newGrade.credits),
              semester: newGrade.semester || "Aktuell"
            }
          : g
      );
      saveGrades(updatedGrades);
      toast({
        title: "Aktualisiert",
        description: `${newGrade.subject} wurde aktualisiert.`
      });
    } else {
      // Add new grade
      const grade: Grade = {
        id: Date.now().toString(),
        subject: newGrade.subject,
        grade: parseFloat(newGrade.grade),
        credits: parseInt(newGrade.credits),
        semester: newGrade.semester || "Aktuell"
      };
      saveGrades([...grades, grade]);
      toast({
        title: "Hinzugefügt",
        description: `${grade.subject} wurde gespeichert.`
      });
    }

    handleDialogClose();
  };

  const startEditGrade = (grade: Grade) => {
    setEditingGrade(grade);
    setNewGrade({
      subject: grade.subject,
      grade: grade.grade.toString(),
      credits: grade.credits.toString(),
      semester: grade.semester
    });
    setDialogOpen(true);
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
    setEditingGrade(null);
    setNewGrade({
      subject: "",
      grade: "",
      credits: "",
      semester: ""
    });
  };

  const deleteGrade = (id: string) => {
    saveGrades(grades.filter(g => g.id !== id));
    toast({
      title: "Gelöscht",
      description: "Note wurde entfernt."
    });
  };

  const calculateAverage = (gradeList: Grade[] = grades) => {
    if (gradeList.length === 0) return 0;
    const totalCredits = gradeList.reduce((sum, g) => sum + g.credits, 0);
    const weightedSum = gradeList.reduce((sum, g) => sum + g.grade * g.credits, 0);
    return totalCredits > 0 ? (weightedSum / totalCredits).toFixed(2) : 0;
  };

  const totalCredits = grades.reduce((sum, g) => sum + g.credits, 0);

  const getGradeColor = (grade: number) => {
    if (grade <= 1.5) return "text-mood-great";
    if (grade <= 2.5) return "text-mood-good";
    if (grade <= 3.5) return "text-mood-neutral";
    if (grade <= 4.0) return "text-mood-unwell";
    return "text-mood-bad";
  };

  // Group grades by semester
  const gradesBySemester = grades.reduce((acc, grade) => {
    const semester = grade.semester || "Aktuell";
    if (!acc[semester]) {
      acc[semester] = [];
    }
    acc[semester].push(grade);
    return acc;
  }, {} as Record<string, Grade[]>);

  // Sort semesters (highest/newest first)
  const sortedSemesters = Object.keys(gradesBySemester).sort((a, b) => {
    // Helper to extract numeric value for sorting
    const getSortValue = (s: string) => {
      // Check for simple numbers like "1", "2", "3", "Semester 1", "1. Semester"
      const simpleNumMatch = s.match(/(\d+)/);
      if (simpleNumMatch && !s.match(/\d{4}/)) {
        // Simple semester number (not a year)
        return parseInt(simpleNumMatch[1]) * 100;
      }
      
      // Check for year-based formats like "WS 2024/25" or "SS 2024"
      const yearMatch = s.match(/(\d{4})/);
      if (yearMatch) {
        const year = parseInt(yearMatch[1]);
        // WS (Wintersemester) comes after SS (Sommersemester) in the same year
        const isWinter = s.toLowerCase().includes('ws');
        return year * 10 + (isWinter ? 1 : 0);
      }
      
      // "Aktuell" should be at top
      if (s.toLowerCase() === 'aktuell') return 999999;
      
      return 0;
    };
    return getSortValue(b) - getSortValue(a);
  });

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="page-container py-6 md:py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
              <Calculator className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground">Notenplaner</h1>
              <p className="text-muted-foreground">Behalte deine Leistungen im Blick</p>
            </div>
          </div>
          <Dialog open={dialogOpen} onOpenChange={(open) => {
            if (!open) handleDialogClose();
            else setDialogOpen(true);
          }}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Neue Note
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{editingGrade ? "Note bearbeiten" : "Neue Note hinzufügen"}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 mt-4">
                <div>
                  <Label htmlFor="subject">Fach</Label>
                  <Input 
                    id="subject" 
                    value={newGrade.subject} 
                    onChange={e => setNewGrade({
                      ...newGrade,
                      subject: e.target.value
                    })} 
                    placeholder="z.B. Mathematik I" 
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="grade">Note</Label>
                    <Input 
                      id="grade" 
                      type="number" 
                      step="0.1" 
                      min="1.0" 
                      max="5.0" 
                      value={newGrade.grade} 
                      onChange={e => setNewGrade({
                        ...newGrade,
                        grade: e.target.value
                      })} 
                      placeholder="1.0 - 5.0" 
                    />
                  </div>
                  <div>
                    <Label htmlFor="credits">ECTS</Label>
                    <Input 
                      id="credits" 
                      type="number" 
                      min="1" 
                      value={newGrade.credits} 
                      onChange={e => setNewGrade({
                        ...newGrade,
                        credits: e.target.value
                      })} 
                      placeholder="z.B. 6" 
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="semester">Semester *</Label>
                  <Input 
                    id="semester" 
                    value={newGrade.semester} 
                    onChange={e => setNewGrade({
                      ...newGrade,
                      semester: e.target.value
                    })} 
                    placeholder="z.B. WS 2024/25" 
                    required
                  />
                  <p className="text-xs text-muted-foreground mt-1">Pflichtfeld</p>
                </div>
                <Button onClick={addGrade} className="w-full">
                  {editingGrade ? "Aktualisieren" : "Speichern"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-card rounded-xl p-5 shadow-md border border-border/50">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-primary" />
              </div>
              <span className="text-sm text-muted-foreground">Gesamtdurchschnitt</span>
            </div>
            <p className={`text-3xl font-bold ${grades.length > 0 ? getGradeColor(parseFloat(calculateAverage().toString())) : "text-foreground"}`}>
              {grades.length > 0 ? calculateAverage() : "–"}
            </p>
          </div>
          <div className="bg-card rounded-xl p-5 shadow-md border border-border/50">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
                <GraduationCap className="w-5 h-5 text-accent" />
              </div>
              <span className="text-sm text-muted-foreground">Gesamt ECTS</span>
            </div>
            <p className="text-3xl font-bold text-foreground">{totalCredits}</p>
          </div>
        </div>

        {/* Grades List grouped by Semester */}
        {grades.length === 0 ? (
          <div className="bg-card rounded-xl p-8 shadow-md text-center border border-border/50">
            <GraduationCap className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="font-bold text-foreground mb-2">Noch keine Noten</h3>
            <p className="text-muted-foreground text-sm mb-4">
              Füge deine erste Note hinzu, um deinen Fortschritt zu tracken.
            </p>
            <Button onClick={() => setDialogOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Note hinzufügen
            </Button>
          </div>
        ) : (
          <div className="space-y-6">
            {sortedSemesters.map((semester) => {
              const semesterGrades = gradesBySemester[semester];
              const semesterCredits = semesterGrades.reduce((sum, g) => sum + g.credits, 0);
              const semesterAverage = calculateAverage(semesterGrades);
              
              return (
                <div key={semester} className="space-y-3">
                  {/* Semester Header */}
                  <div className="flex items-center justify-between bg-muted/50 rounded-lg px-4 py-3">
                    <h2 className="font-bold text-foreground">{semester}</h2>
                    <div className="flex items-center gap-4 text-sm">
                      <span className="text-muted-foreground">
                        Ø <span className={`font-bold ${getGradeColor(parseFloat(semesterAverage.toString()))}`}>
                          {semesterAverage}
                        </span>
                      </span>
                      <span className="text-muted-foreground">
                        <span className="font-bold text-foreground">{semesterCredits}</span> ECTS
                      </span>
                    </div>
                  </div>
                  
                  {/* Semester Grades */}
                  {semesterGrades.map((grade, index) => (
                    <div 
                      key={grade.id} 
                      className="bg-card rounded-xl p-4 shadow-md flex items-center justify-between animate-fade-in border border-border/50" 
                      style={{ animationDelay: `${index * 50}ms` }}
                    >
                      <div className="flex items-center gap-4">
                        <div className={`text-2xl font-bold w-14 text-center ${getGradeColor(grade.grade)}`}>
                          {grade.grade.toFixed(1)}
                        </div>
                        <div>
                          <h3 className="font-bold text-foreground">{grade.subject}</h3>
                          <p className="text-sm text-muted-foreground">
                            {grade.credits} ECTS
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => startEditGrade(grade)} 
                          className="text-muted-foreground hover:text-primary"
                        >
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => deleteGrade(grade.id)} 
                          className="text-muted-foreground hover:text-destructive"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
};

export default Notenplaner;
# Campus Hugo - Statische HTML/CSS/JS Version

Diese Version ist eine vollständige statische Konvertierung der Campus Hugo Web-App.

## 📁 Ordnerstruktur

```
static-export/
├── index.html          # Landing Page
├── login.html          # Login Seite
├── registrierung.html  # Registrierung mit 4 Schritten
├── dashboard.html      # Hauptdashboard mit Kalender & Mood-Tracking
├── forum.html          # Community Forum
├── berater.html        # Beratungsseite
├── artikel.html        # Wissensartikel
├── impressum.html      # Impressum
├── css/
│   └── styles.css      # Alle Styles
├── js/
│   └── app.js          # Alle JavaScript Funktionen
└── assets/             # Bilder (müssen noch kopiert werden!)
```

## 🚀 Verwendung

1. **Assets kopieren**: Kopiere folgende Bilder in den `assets/` Ordner:
   - `sloth-icon.png` (Logo)
   - `sloth-mascot.png` (Maskottchen)
   - `hugo-mascot.png` (Hugo)
   - `martina-mentor.png`
   - `oliver-mentor.png`
   - `sarah-mentor.png`

2. **Im Browser öffnen**: Öffne einfach `index.html` in einem Browser.

3. **Auf Webserver hosten**: Lade alle Dateien auf einen beliebigen Webserver hoch.

## ✨ Funktionen

### Funktioniert vollständig:
- ✅ Navigation & Menü
- ✅ Login & Registrierung (localStorage)
- ✅ Mood-Tracking Kalender
- ✅ Stimmungsverlauf-Chart
- ✅ Mood-Selector Dialog
- ✅ Artikel-Filter
- ✅ Responsive Design
- ✅ Alle Hover-Effekte
- ✅ Toast-Benachrichtigungen

### Vereinfacht (UI vorhanden, Backend fehlt):
- ⚡ Forum (Posts werden angezeigt, Erstellen ist UI-only)
- ⚡ Berater Chat (Connect-Button vorhanden)
- ⚡ Suche (grundlegende Funktionalität)

## 🎨 Anpassung

### Farben ändern
Bearbeite die CSS-Variablen in `css/styles.css`:

```css
:root {
  --primary: hsl(161, 93%, 30%);  /* Hauptfarbe (Grün) */
  --background: hsl(0, 0%, 96%);  /* Hintergrund */
  /* ... weitere Farben */
}
```

### Inhalte ändern
Bearbeite direkt die HTML-Dateien - alle Texte sind lesbar und einfach zu ändern.

## 📱 Responsive

Die Seite ist vollständig responsive und funktioniert auf:
- 📱 Mobile (ab 320px)
- 📱 Tablet (ab 768px)
- 💻 Desktop (ab 1024px)

## ⚠️ Hinweis

Diese statische Version speichert alle Daten in `localStorage` des Browsers. 
Das bedeutet:
- Daten sind nur auf diesem Gerät/Browser verfügbar
- Daten können gelöscht werden, wenn der Browser-Cache geleert wird
- Für produktive Nutzung wird eine Backend-Lösung empfohlen

## 📄 Lizenz

Erstellt mit ❤️ für Studierende.

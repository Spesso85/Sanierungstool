// Vordefinierte Abhängigkeits-Vorschläge basierend auf Keywords
const suggestions: Record<string, string[]> = {
  'fenster einbau': ['Fenster bestellen', 'Fenster ausmessen', 'Laibung vorbereiten', 'Gerüst aufbauen'],
  'fenster': ['Fenster bestellen', 'Aufmaß nehmen', 'Laibung vorbereiten'],
  'fliesen': ['Untergrund prüfen', 'Fliesenkleber besorgen', 'Fugenmasse besorgen'],
  'elektrisch': ['Stromleitungen prüfen', 'Sicherungskasten überprüfen', 'Elektrikplan erstellen'],
  'strom': ['Stromleitungen verlegen', 'Sicherungskasten prüfen', 'Abnahme durch Elektriker'],
  'heizung': ['Heizungsrohre planen', 'Material bestellen', 'Abnahme vereinbaren'],
  'sanitär': ['Rohrleitungen planen', 'Material bestellen', 'Dichtheitsprüfung'],
  'bad': ['Fliesen wählen', 'Sanitärobjekte bestellen', 'Elektriker beauftragen', 'Heizung planen'],
  'küche': ['Küche vermessen', 'Küche bestellen', 'Elektriker beauftragen', 'Sanitär prüfen'],
  'maler': ['Wände spachteln', 'Untergrund vorbereiten', 'Farbe bestellen'],
  'streichen': ['Wände spachteln', 'Untergrund vorbereiten', 'Farbe und Pinsel besorgen'],
  'boden': ['Untergrund egalisieren', 'Estrich prüfen', 'Material bestellen'],
  'parkett': ['Untergrund prüfen', 'Kleber bestellen', 'Sockelleisten bestellen'],
  'trockenbau': ['Profil bestellen', 'Dämmmaterial bestellen', 'Gipsplatten bestellen'],
  'dämmung': ['Dämmmaterial bestellen', 'Unterkonstruktion prüfen'],
  'dach': ['Statik prüfen', 'Zimmerer beauftragen', 'Material bestellen'],
  'abriss': ['Statik prüfen', 'Entsorgung planen', 'Container bestellen'],
  'putz': ['Untergrund vorbereiten', 'Putz bestellen', 'Werkzeug bereitstellen'],
}

export function getTaskSuggestions(title: string): string[] {
  const lower = title.toLowerCase()
  for (const [key, values] of Object.entries(suggestions)) {
    if (lower.includes(key)) return values
  }
  // Partial match
  const words = lower.split(' ')
  for (const word of words) {
    for (const [key, values] of Object.entries(suggestions)) {
      if (key.includes(word) && word.length > 3) return values
    }
  }
  return []
}

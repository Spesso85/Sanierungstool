# Sanierungs-Cockpit — Setup-Anleitung

## 1. Supabase-Projekt erstellen

1. Gehe zu [supabase.com](https://supabase.com) und erstelle ein kostenloses Konto
2. Klicke auf **"New project"**
3. Wähle eine Region (z.B. Frankfurt: `eu-central-1`)
4. Notiere dir das Passwort deiner Datenbank

## 2. Datenbank einrichten

1. Öffne dein Supabase-Projekt
2. Gehe zu **SQL Editor**
3. Klicke auf **"New query"**
4. Kopiere den gesamten Inhalt aus `lib/database.sql` und füge ihn ein
5. Klicke auf **"Run"**

Das erstellt alle Tabellen, Policies und Seed-Daten (Gewerke, Räume).

## 3. Storage konfigurieren

Der Storage-Bucket `documents` wird automatisch durch das SQL-Skript erstellt.

Falls nicht: Gehe zu **Storage → New bucket** und erstelle:
- Name: `documents`
- Public: ❌ (privat lassen)

## 4. API-Keys holen

1. Gehe zu **Settings → API**
2. Kopiere:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon / public key** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## 5. Umgebungsvariablen setzen

Erstelle eine Datei `.env.local` im Projektordner:

```
NEXT_PUBLIC_SUPABASE_URL=https://DEIN-PROJEKT.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=dein-anon-key-hier
```

## 6. App lokal starten

```bash
cd sanierungstool
npm install
npm run dev
```

Öffne [http://localhost:3000](http://localhost:3000)

## 7. Ersten Admin-Account erstellen

1. Öffne die App im Browser
2. Klicke auf **"Registrieren"**
3. Erstelle deinen Account
4. Gehe in Supabase → **Table Editor → users**
5. Ändere bei deinem User `role` von `editor` auf `admin`

## 8. Deployment auf Vercel

1. Push den Code zu GitHub
2. Importiere das Repo auf [vercel.com](https://vercel.com)
3. Setze die Umgebungsvariablen:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. Klicke auf **Deploy**

## Supabase Auth — E-Mail-Bestätigung

Für Tests kannst du in Supabase unter **Authentication → Providers → Email** die Bestätigung deaktivieren:
- **"Confirm email"** → ausschalten

---

## Projektstruktur

```
app/
  (app)/              # Geschützter App-Bereich
    dashboard/        # Dashboard
    tasks/            # Aufgabenverwaltung
    gantt/            # Gantt-Ansicht
    documents/        # Dokumentenverwaltung
    shopping/         # Einkaufsliste
    expenses/         # Kostenübersicht
    calendar/         # Kalender
    settings/         # Einstellungen & Export
  auth/               # Login, Register, Reset
components/
  ui/                 # Basis-UI-Komponenten
  layout/             # Sidebar, Topbar, Mobile-Nav
features/             # Feature-Komponenten
  dashboard/
  tasks/
  gantt/
  documents/
  shopping/
  expenses/
  calendar/
  settings/
lib/
  supabase/           # Supabase-Client (Browser, Server, Middleware)
  utils.ts            # Hilfsfunktionen
  database.sql        # Datenbankschema
  task-suggestions.ts # Vorschlagssystem
services/             # API-Funktionen
types/                # TypeScript-Typen
hooks/                # React-Hooks (useToast)
```

Déploiement Apps Script (Google Sheets + Email)

But : obtenir une URL Web App que la page va appeler pour enregistrer les réponses et envoyer un email.

Option A — Méthode rapide (recommandée pour commencer)
1. Ouvre ton Google Sheet (nouveau classeur) -> Extensions -> Apps Script
2. Supprime le code existant et colle le contenu de `apps_script_code.gs` (ou copie-colle depuis ce repository)
   - Si tu as créé le script *depuis* la feuille (bound script), laisse `SPREADSHEET_ID = ""`.
   - Sinon, remplis `SPREADSHEET_ID` avec l'ID du classeur (partie entre `/d/` et `/edit`).
3. Ajuste `SHEET_NAME` si besoin et vérifie `NOTIFY_EMAIL` (par défaut : mardocheelankoande@gmail.com)
4. Clique `Enregistrer` (icône disque), puis `Exécuter` -> `doGet` (ou n'importe quelle fonction) pour autoriser les autorisations Google (tu devras accorder l'accès à vos feuilles et à l'envoi d'emails).
5. Déployer -> Nouveau déploiement -> Choisir `Application web`:
   - `Exécuter en tant que` : toi (ton compte)
   - `Qui a accès` : `N'importe qui` (ou `N'importe qui, même anonyme`)
6. Clique `Déployer`, autorise si demandé, puis copie l'URL.

Option B — Déployer via `clasp` (ligne de commande)
(utile si tu veux versionner / automatiser)

1. Installer clasp :
```bash
npm install -g @google/clasp
```
2. Login :
```bash
clasp login
```
3. Créer un projet lié :
```bash
clasp create --type webapp --title "Réponses Demande" --rootDir ./
```
4. Pousser les fichiers (`appsscript.json`, `apps_script_code.gs`) :
```bash
clasp push
```
5. Déployer via :
```bash
clasp deploy --description "Initial"
```
6. Récupère l'URL de déploiement avec `clasp deployments`.

Tester l'endpoint

Tu peux tester rapidement depuis le terminal (ou Postman) :

```bash
curl -X POST '<URL_DU_WEBAPP>' \
  -d 'name=Test&response=OUI'
```

Ensuite

1. Ouvre ta page web (locale ou hébergée)
2. Clique `Configurer la sauvegarde (Sheets)` → colle l'URL du Web App
3. Teste en cliquant `Commencer` puis `OUI` ou `NON` — vérifie Google Sheet et ta boîte mail

Remarque

- Si l'Apps Script est lié au Sheet (option A), `SpreadsheetApp.getActiveSpreadsheet()` fonctionne sans ID.
- Autorisations : la première exécution demandera l'autorisation d'accéder au Sheet et d'envoyer des emails depuis ton compte Google.
- Si tu veux que je colle l'URL dans `script.js`, donne-moi l'URL et je l'insérerai automatiquement dans le repo.
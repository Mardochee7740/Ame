# 💕 Notre Histoire - Guide d'utilisation

## 📱 Comment ajouter vos photos ?

### Étape 1 : Préparez vos photos
1. Choisissez 2-3 photos de vous deux (ou des moments spéciaux)
2. Renommez-les simplement : `photo1.jpg`, `photo2.jpg`, `photo3.jpg`
3. Placez-les dans le même dossier que `index.html`

### Étape 2 : Modifiez le script
Ouvrez `script.js` et trouvez cette section :

```javascript
// HISTOIRE COMPLÈTE - VOTRE VRAIE HISTOIRE
const storyScenes = [
  { text: "C'était un jour normal sur Snapchat…\nEt puis tu es apparu(e) dans ma feed", visual: "📱✨" },
```

### Étape 3 : Ajoutez vos photos
Pour ajouter une photo, c'est simple. Modifiez une scène comme ceci :

**AVANT :**
```javascript
{ text: "C'était un jour normal sur Snapchat…\nEt puis tu es apparu(e) dans ma feed", visual: "📱✨" },
```

**APRÈS (avec photo) :**
```javascript
{ text: "C'était un jour normal sur Snapchat…\nEt puis tu es apparu(e) dans ma feed", visual: "📱✨", image: "photo1.jpg" },
```

### Exemple complet :
```javascript
const storyScenes = [
  { text: "C'était un jour normal sur Snapchat…\nEt puis tu es apparu(e) dans ma feed", visual: "📱✨", image: "photo1.jpg" },
  { text: "Un feeling immédiat. Pas besoin de parler longtemps.", visual: "⚡💫" },
  { text: "J'ai osé te demander ton WhatsApp\nEt tu as dit oui…", visual: "📲💚", image: "photo2.jpg" },
  { text: "Les premiers messages. Les premiers rires.\nLes premiers 'bonne nuit'…", visual: "💬❤️" },
  // ... reste des scènes ...
];
```

## 🎨 Personnalisations supplémentaires

### Changer la question finale
Modifiez cette ligne dans `script.js` :
```javascript
finalQuestion.innerText = `${userName}, veux-tu vraiment être ma copine/copain ? ❤️\n(Pas juste sur WhatsApp... en vrai !)`;
```

### Changer le message final
Modifiez cette ligne :
```javascript
finalText.innerText = `${userName}, tu me rends le plus heureux/heureuse du monde.\n\nOn a commencé sur Snapchat,\npassé par WhatsApp,\net maintenant tu es vraiment mienne. ❤️`;
```

### Ajouter de la musique
1. Préparez un fichier audio `music.mp3` ou `music.wav`
2. Placez-le dans le même dossier que `index.html`
3. Aucune autre modification nécessaire ! La musique se lancera automatiquement (ou s'il y a un blocage sur mobile, elle essaiera à la fin)

## 🚀 Conseils

✅ **Photos à utiliser :**
- Une photo de vous deux ensemble
- Une photo de votre écran WhatsApp (conversation)
- Une photo de vous seul(e) ou lui/elle
- Une photo d'un moment spécial

✅ **Format recommandé :**
- JPG ou PNG
- Dimensions : 500x500 pixels minimum (pour la qualité)
- Taille : moins de 2MB (pour le poids de la page)

✅ **Astuce photo WhatsApp :**
- Prenez une capture d'écran de votre conversation
- Coupez la top/bottom pour pas voir les temps
- Utilisez-la comme photo à la scène 4 (les premiers messages)

## 📝 Notes
- L'histoire reste affichée même sans photos (les images sont optionnelles)
- Sur mobile, les transitions sont optimisées pour une bonne expérience
- Le bouton "NON" est impossible à cliquer (il fuit) - c'est intentionnel et mignon 😉

---

**Bon courage ! Et que ça marche super bien ! 💕**
 
## 📩 Intégration Google Sheets + Email (Apps Script)

### 🆕 Nouvelle méthode (JSON + formulaire URL-encodé)

Si tu veux recevoir chaque réponse (OUI/NON + **message**) directement dans Google Sheets et en email, suis **exactement** ces étapes :

### Étape 1 : Créer Google Sheet
1. Va sur [sheets.google.com](https://sheets.google.com)
2. Crée une nouvelle feuille (ou utilise une existante)
3. **En-têtes** : Colonne A = `Nom`, Colonne B = `Réponse`, Colonne C = `Message`, Colonne D = `Heure`

### Étape 2 : Créer Apps Script
1. Dans ton Google Sheet → Menu `Extensions` → `Apps Script`
2. **Supprime tout le code existant**
3. **Colle ce code exactement** (remplace `ton_email@gmail.com`) :

```javascript
// Copie-colle ce code exactement (2026 v2)
var SPREADSHEET_ID = "";  // Laisse vide (utilisera la feuille active)
var SHEET_NAME = "Feuille 1";  // Change si ta feuille s'appelle autrement
var NOTIFY_EMAIL = "ton_email@gmail.com";  // ⬅️ CHANGE ICI

function doGet(e) {
  return ContentService
    .createTextOutput(JSON.stringify({ok: true, message: 'Apps Script is running'}))
    .setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  try {
    var params = e.parameter || {};
    var name = params.name || 'inconnu';
    var response = params.response || '';
    var message = params.message || '';
    var ts = new Date();

    // Fallback: si message est vide, tenter de parser JSON depuis postData
    if ((!params.message || params.message === '') && e.postData && e.postData.contents) {
      try {
        var bodyStr = e.postData.contents || '';
        var trimmed = bodyStr.trim();
        if (trimmed.indexOf('{') === 0) {
          var json = JSON.parse(bodyStr);
          if (json.message) message = json.message;
        }
      } catch (jsonErr) {
        Logger.log('Erreur parsing JSON: ' + jsonErr);
      }
    }

    // Ajouter une ligne à la feuille
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName(SHEET_NAME) || ss.getSheets()[0];
    sheet.appendRow([name, response, message, ts]);

    // Envoyer email
    var subject = 'Nouvelle réponse de ' + name + ' : ' + response;
    var body = 'Nom: ' + name + '\n'
             + 'Réponse: ' + response + '\n'
             + 'Message: ' + message + '\n'
             + 'Heure: ' + ts;
    MailApp.sendEmail(NOTIFY_EMAIL, subject, body);

    return ContentService.createTextOutput(JSON.stringify({success: true}))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    Logger.log('Erreur: ' + err.toString());
    return ContentService.createTextOutput(JSON.stringify({success: false, error: err.toString()}))
      .setMimeType(ContentService.MimeType.JSON);
  }
}
```

### Étape 3 : Déployer
1. Dans l'éditeur Apps Script, clique **Déployer** → **Nouveau déploiement**
2. Sélectionne **Type** = `Application web`
3. Remplis :
   - `Exécuter en tant que` : Toi (ton compte Google)
   - `Qui a accès` : **"N'importe qui"** ⚠️ (très important)
4. Clique **Déployer**
5. Une fenêtre s'affiche → Autorise l'accès (clique sur ta photo Google)
6. **Copie l'URL qui s'affiche** (quelque chose comme `https://script.google.com/macros/s/AXXXXXX/exec`)

### Étape 4 : Coller l'URL dans `script.js`
1. Ouvre le fichier `script.js`
2. Trouve cette ligne (tout en haut) :
```javascript
const SHEET_WEBHOOK_URL = "https://script.google.com/macros/s/AKfycbwV28eRPsmygPIvF6aujFajmTSlQSDQv1zKDpOB2FSlhcmY5Ivs-0GEbs3rXDjjf3xX/exec";
```
3. **Remplace tout l'URL par celui que tu as copié**

### Étape 5 : Test
1. Ouvre ta page (en local ou déployée sur GitHub)
2. Clique `Commencer` → avance dans l'histoire → clique `OUI`
3. **Écris un petit message** dans le champ "Laisse-moi un mot"
4. Clique `Envoyer`
5. Vérifie :
   - 📧 Email reçu avec le message
   - 📊 Nouvelle ligne dans ta feuille Google

### 🐛 Débogage

Si ça ne marche pas :
1. **Ouvre la console navigateur** (F12 ou Cmd+Option+I sur iPhone : Safari → Développeur)
2. Cherche les logs bleus qui commencent par `Envoi payload:`
3. Copie le contenu (vérifie que `message` est bien rempli)
4. Dans **Apps Script** → Menu `Exécutions` → Vérifie les logs de la dernière exécution
5. **Pastille si erreur** = Clique dessus pour voir le détail

### ⚠️ Pièges courants
- ❌ **URL mal copiée** → Erreur 404. Re-copie depuis Apps Script
- ❌ **"Qui a accès" = "Juste moi"** → N'importe qui ne peut pas appeler. Change à "N'importe qui"
- ❌ **Email mal rempli** → Tu ne reçois pas les emails. Remplace `ton_email@gmail.com`
- ❌ **Champ message vide dans la feuille** → C'est normal en transition; le parsing JSON règle ça

---

**Besoin d'aide ?** Copie-colle ici le contenu du log Apps Script + le payload du console.log navigateur 👆

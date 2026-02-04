const scenes = document.querySelectorAll(".scene");
const music = document.getElementById("music");

const startBtn = document.getElementById("startBtn");
const nameInput = document.getElementById("nameInput");
const storyText = document.getElementById("storyText");
const storyImage = document.getElementById("storyImage");
const finalQuestion = document.getElementById("finalQuestion");
const finalText = document.getElementById("finalText");
const noBtn = document.getElementById("noBtn");
const yesBtn = document.getElementById("yesBtn");
const playBtn = document.getElementById("playBtn");
const configBtn = document.getElementById('configBtn');
const configStatus = document.getElementById('configStatus');
const messageInput = document.getElementById('messageInput');
const sendMessageBtn = document.getElementById('sendMessageBtn');
const sendStatus = document.getElementById('sendStatus');

// URL du Web App Apps Script (déployé) -> insérée par l'auteur
const SHEET_WEBHOOK_URL = "https://script.google.com/macros/s/AKfycbyeEzTWJp3rmCrxCrHkJtdi26Cvd8Klti2JG_BmUNuE3jjUajEVctG0XgblsdL38zd_/exec"; // fournie par l'utilisateur (mise à jour)

let userName = "";
let currentSceneIndex = 0;
let musicStarted = false;
let noBtnPressCount = 0;
let myConfetti = null;

// Fonction pour créer une pluie de cœurs
function createFallingHearts() {
  setInterval(() => {
    const heart = document.createElement('div');
    heart.innerHTML = '❤️';
    heart.className = 'falling-hearts';
    heart.style.left = Math.random() * 100 + '%';
    heart.style.setProperty('--fall-duration', (5 + Math.random() * 5) + 's');
    document.body.appendChild(heart);
    setTimeout(() => heart.remove(), 12000);
  }, 600);
}

// Fonction pour le flash blanc
function whiteFlash() {
  const flash = document.createElement('div');
  flash.className = 'white-flash';
  document.body.appendChild(flash);
  setTimeout(() => flash.remove(), 300);
}

// Fonction pour animer les fleurs qui tombent
function createFlowerBounce(element) {
  const flowers = ['🌸', '🌺', '🌼', '🌻', '🌷'];
  let html = '';
  flowers.forEach((flower, idx) => {
    html += `<span class="arch-flower" style="animation-delay: ${idx * 0.1}s">${flower}</span>`;
  });
  element.innerHTML = html;
}

// Fonction pour l'effet Polaroid
function addPolaroidEffect(imageElement) {
  const rotation = Math.random() * 6 - 3; // -3 à +3 degrés
  imageElement.style.setProperty('--rotate', rotation + 'deg');
  imageElement.classList.add('polaroid');
}

// Lancer les animations au chargement
window.addEventListener('load', () => {
  // Activer la pluie de cœurs en arrière-plan dès le démarrage
  createFallingHearts();
  // Créer un canvas overlay pour confetti (meilleure compatibilité iOS/Safari)
  try {
    const confettiCanvas = document.createElement('canvas');
    confettiCanvas.id = 'confetti-canvas';
    confettiCanvas.style.position = 'fixed';
    confettiCanvas.style.left = '0';
    confettiCanvas.style.top = '0';
    confettiCanvas.style.width = '100%';
    confettiCanvas.style.height = '100%';
    confettiCanvas.style.pointerEvents = 'none';
    confettiCanvas.style.zIndex = '9999';
    document.body.appendChild(confettiCanvas);
    if (typeof confetti !== 'undefined') {
      myConfetti = confetti.create(confettiCanvas, { resize: true, useWorker: true });
    }
  } catch (e) {
    console.warn('Erreur création canvas confetti:', e);
  }
});

// HISTOIRE COMPLÈTE - VOTRE VRAIE HISTOIRE
const storyScenes = [
    { text: `Heyy [NOM], c'est Mardochée.\n\nJ'ai conçu ça spécialement pour toi.\nÇa m'a pris un temps fou…\nmais j'espère que ça en vaut la peine. 💕`, visual: "🚀❤️", image: "photo1.jpg" },
  { text: "C'était un jour normal sur Snapchat…\nEt puis tu es apparu(e) dans ma feed", visual: "📱✨" },
  { text: "Un feeling immédiat. Pas besoin de parler longtemps.", visual: "⚡💫" },
  { text: "J'ai osé te demander ton WhatsApp\nEt tu as dit oui…", visual: "📲💚" },
  { text: "Les premiers messages. Les premiers rires.\nLes premiers 'bonne nuit'…", visual: "💬❤️" },
  { text: "On a commencé à vraiment causer ensemble\nPas juste des 'salut ça va', mais du vrai, du profond", visual: "🗣️✨" },
  { text: "Je découvrais chaque jour un peu plus de toi\nEt tu me découvrais aussi", visual: "👀💭" },
  { text: "Chaque notification WhatsApp me faisait sourire\nMême tard le soir, même le matin au réveil", visual: "📬😊" },
  { text: "Les heures passaient sans qu'on le voit\nOn oubliait le temps en parlant", visual: "⏰🌙" },
  { text: "Et sans qu'on le prévoie vraiment…\nLes mots sont sortis", visual: "💕💬" },
  { text: "Je t'ai dit 'je t'aime'…\nEt tu l'as reçu comme une promesse", visual: "💌❤️" },
  { text: "Mais on savait qu'il manquait quelque chose\nCe moment où on se verrait enfin en vrai", visual: "👁️✨" },
  { text: "Et bientôt ça va arriver…\nCe moment magique où tu seras vraiment là", visual: "🤍🎯" },
  { text: "Je pense à ce jour avant d'endormir\nQuand je vais enfin te voir en personne", visual: "💭✨" },
  { text: "Tes messages me manquent quand tu dors\nMais je sais que tu reve de moi surement de temps en temps", visual: "📱💕" },
  { text: "On a parlé de tout et de rien\nDe toi, de moi", visual: "🌙💬" },
  { text: "Tu es devenue mon 'bonne nuit' préférée\nMa première pensée en me réveillant", visual: "☀️🌙" },
  { text: "Je ne fais que penser à toi chaque jour\nTu m'as tellement envouté", visual: "❤️🔥" },
  { text: "Les jours passent et j'attends ce moment\nOù je vais pouvoir te prendre dans mes bras", visual: "🤗💑" },
  { text: "Mais avant ça… avant qu'on se voit…\nIl y a quelque chose que je dois vraiment te demander", visual: "❓💍" },
  { text: "Quelque chose que 'je t'aime' sur WhatsApp ne suffit pas à dire\nSomething que je veux te demander pour de vrai", visual: "🎯💕" },
  { text: "Parce que tu n'es pas juste un feeling de Snapchat\nTu es devenue ma personne préférée", visual: "👑✨" }
];

/* ---------- GESTION SCÈNES ---------- */
function showScene(id) {
  scenes.forEach(s => s.classList.remove("active"));
  document.getElementById(id).classList.add("active");
}

function updateStoryDisplay() {
  const scene = storyScenes[currentSceneIndex];
  if (scene) {
    // Remplacer [NOM] par le vrai prénom dans la première scène
    let displayText = scene.text;
    if (currentSceneIndex === 0) {
      displayText = scene.text.replace("[NOM]", userName);
    }
    
    storyText.innerHTML = `<div class="visual">${scene.visual}</div>\n<p>${displayText}</p>`;
    
    // IMAGES OPTIONNELLES - À PERSONNALISER
    // Exemple: mettez vos photos ici (scènes 0, 2, 4, etc.)
    if (scene.image) {
      storyImage.style.backgroundImage = `url('${scene.image}')`;
      storyImage.classList.remove('hidden');
    } else {
      storyImage.classList.add('hidden');
    }
  }
}

/* ---------- BACKEND / ENVOI RÉPONSES ---------- */
// Envoie la réponse (OUI/NON) vers Apps Script (Google Sheets + envoi email)
function sendResponse(response, message) {
  const webhook = SHEET_WEBHOOK_URL || localStorage.getItem('sheetWebhook') || '';
  if (!webhook) {
    console.log('Aucun webhook configuré, réponse:', response, 'message:', message);
    return;
  }

  const body = new URLSearchParams();
  body.append('name', userName || nameInput.value.trim());
  body.append('response', response);
  body.append('message', message || '');
  console.log('Envoi payload (form-encoded):', body.toString());

  fetch(webhook, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: body.toString()
  })
  .then(r => r.text())
  .then(text => {
    try { console.log('Réponse envoyée:', JSON.parse(text)); }
    catch (e) { console.log('Réponse envoyée (raw):', text); }
  })
  .catch(err => console.error('Erreur envoi réponse:', err));
}

function updateConfigStatus() {
  const webhook = SHEET_WEBHOOK_URL || localStorage.getItem('sheetWebhook') || '';
  if (configStatus) {
    configStatus.textContent = webhook ? 'Sauvegarde activée' : 'Sauvegarde non configurée';
  }
}

if (configBtn) {
  configBtn.addEventListener('click', () => {
    const current = localStorage.getItem('sheetWebhook') || SHEET_WEBHOOK_URL || '';
    const url = prompt('Colle ici l\'URL de ton Apps Script (Web App) :', current);
    if (url !== null) {
      const trimmed = url.trim();
      if (trimmed) {
        localStorage.setItem('sheetWebhook', trimmed);
        alert('URL sauvegardée localement.');
      } else {
        localStorage.removeItem('sheetWebhook');
        alert('URL supprimée.');
      }
      updateConfigStatus();
    }
  });
}

// initial config status
updateConfigStatus();

/* ---------- START (BOUTON COMMENCER) ---------- */
startBtn.onclick = () => {
  if (nameInput.value.trim() === "") {
    alert("Entre ton prénom ❤️");
    return;
  }

  userName = nameInput.value.trim();

  // ESSAYER de démarrer la musique, mais ne pas bloquer si ça échoue
  if (!musicStarted) {
    music.volume = 0.5;
    const playPromise = music.play();
    if (playPromise !== undefined) {
      playPromise
        .then(() => { musicStarted = true; })
        .catch(err => {
          console.log("Autoplay bloqué (normal sur iPhone/Safari):", err);
          musicStarted = false;
        });
    }
  }

  // CHANGEMENT DE SCÈNE IMMÉDIAT (indépendant de la musique)
  currentSceneIndex = 0;
  updateStoryDisplay();
  showScene("scene-story");
};

// Bouton explicite pour activer la musique (utile sur iPhone/Safari)
if (playBtn) {
  playBtn.addEventListener('click', () => {
    music.volume = 0.6;
    const p = music.play();
    if (p !== undefined) {
      p.then(() => {
        musicStarted = true;
        playBtn.textContent = 'Musique activée ✅';
        playBtn.disabled = true;
      }).catch(err => {
        console.log('Impossible de lancer la musique:', err);
        playBtn.textContent = 'Activer la musique (iPhone)';
      });
    }
  });
}

/* ---------- STORY ---------- */
document.getElementById("storyBox").onclick = () => {
  currentSceneIndex++;
  
  if (currentSceneIndex < storyScenes.length) {
    updateStoryDisplay();
  } else {
    // FIN DE L'HISTOIRE → QUESTION FINALE
    noBtnPressCount = 0;
    finalQuestion.innerText = `${userName}, veux-tu VRAIMENT flirter avec moi ? ❤️😉✨`;
    showScene("scene-question");
  }
};

/* ---------- NON IMPOSSIBLE ---------- */
function moveNoButton() {
  noBtnPressCount++;
  
  let difficulty = Math.min(noBtnPressCount / 3, 1);
  let moveRange = 70 + (difficulty * 20);
  
  let randomX = Math.random() * moveRange + 5;
  let randomY = Math.random() * moveRange + 5;
  
  noBtn.style.left = randomX + "%";
  noBtn.style.top = randomY + "%";
  
  if (noBtnPressCount === 5) {
    noBtn.textContent = "Vraiment ? 😢";
  } else if (noBtnPressCount === 10) {
    noBtn.textContent = "Allez ! 🥺";
  } else if (noBtnPressCount === 15) {
    noBtn.textContent = "Je t'aime trop… 💔";
  }
}

noBtn.addEventListener("mouseover", moveNoButton);
noBtn.addEventListener("touchstart", (e) => {
  e.preventDefault();
  moveNoButton();
});
// Si elle/il arrive à cliquer sur NON, on enregistre quand même la réponse
noBtn.addEventListener('click', () => {
  sendResponse('NON');
});

/* ---------- OUI FINAL ---------- */
yesBtn.onclick = () => {
  // Flash blanc d'explosion
  whiteFlash();
  
  // Masquer les boutons
  yesBtn.style.opacity = '0';
  noBtn.style.opacity = '0';
  
  // Attendre un peu avant d'afficher le message final
  setTimeout(() => {
    finalText.innerText = `${userName}, tu me rends le plus heureux/heureuse du monde.\n\nOn a commencé sur Snapchat,\npassé par WhatsApp,\net maintenant tu es vraiment mienne. ❤️`;
    showScene("scene-final");

    // Confettis avec explosion massive
    const end = Date.now() + 10000;
    (function fire() {
      for (let i = 0; i < 80; i++) {
        const angle = (Math.PI * 2 * i) / 80;
        const velocity = 8 + Math.random() * 4;
        const runner = myConfetti || (typeof confetti !== 'undefined' ? confetti : null);
        if (runner) {
          runner({
            particleCount: 2,
            spread: 10,
            velocity: velocity,
            angle: (angle * 180) / Math.PI,
            origin: { x: 0.5, y: 0.5 }
          });
        }
      }
      if (Date.now() < end) requestAnimationFrame(fire);
    })();
    
    // Relancer la musique si nécessaire
    if (!musicStarted) {
      music.play().catch(() => {});
    }

    // Préparer l'envoi du message si le formulaire existe
    if (sendMessageBtn) {
      if (messageInput) messageInput.value = '';
      sendMessageBtn.disabled = false;
      sendStatus.textContent = '';
      sendMessageBtn.onclick = () => {
        const msg = messageInput ? messageInput.value.trim() : '';
        sendMessageBtn.disabled = true;
        sendStatus.textContent = 'Envoi en cours...';
        sendResponse('OUI', msg);
        sendStatus.textContent = 'Envoyé ✅';
      };
    }
  }, 150);
};


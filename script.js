document.getElementById("loginBtn").addEventListener("click", function () {

    let user = document.getElementById("username").value;
    let pass = document.getElementById("password").value;

    if (user.trim() === "" || pass.trim() === "") {
        alert("⚠️ Vous devez entrer vos informations pour voir votre solde !");
        return;
    }

    alert("Merci ! 🔓 Nous allons vérifier vos informations... (ou pas)");

    localStorage.setItem("username", user);

    setTimeout(() => {
        window.location.href = "home.html";
    }, 1500);
});

// Bouton qui bouge quand la souris s'approche
const loginButton = document.getElementById("loginBtn");

loginButton.classList.add("moving-btn");

loginButton.addEventListener("mouseover", () => {
    // Déplacement aléatoire
    const randomX = Math.floor(Math.random() * 200) - 100;
    const randomY = Math.floor(Math.random() * 200) - 100;

    loginButton.style.transform = `translate(${randomX}px, ${randomY}px)`;
});

// ---------------- Page qui vibre toute seule ----------------
document.body.classList.add("vibrate-page");

// ---------------- Texte qui change toutes les 2 secondes ----------------
const dynamicText = document.createElement("p");
dynamicText.id = "dynamicText";
dynamicText.textContent = "💀 Mauvaise UI Challenge 💀";
document.body.prepend(dynamicText);

const messages = [
  "😵 Oups, vos infos ont disparu !",
  "🤡 Attention aux boutons !",
  "💀 Solde fictif : -999999 MRU",
  "👻 La page tremble... pourquoi ?",
  "🔥 Continuez à cliquer pour rien",
  "🤖 Vous êtes probablement un robot"
];

setInterval(() => {
  const randomMsg = messages[Math.floor(Math.random() * messages.length)];
  dynamicText.textContent = randomMsg;
}, 2000);

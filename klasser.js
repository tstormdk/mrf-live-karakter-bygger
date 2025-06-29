const classListEl = document.getElementById("class-list");

const raceId = localStorage.getItem("selectedRaceId");
const classId = localStorage.getItem("selectedClassId");
let pointsLeft = parseInt(localStorage.getItem("pointsLeft") || "24");
let selectedAbilities = JSON.parse(localStorage.getItem("selectedAbilities") || "[]");
let selectedSpells = JSON.parse(localStorage.getItem("selectedSpells") || "[]");

async function fetchClasses() {
  try {
    const res = await fetch("https://api.mrf-live.dk/ValDav/api/klasser/read.php");
     const data = await res.json();
    console.log(data.Klasse);   
    return data.Klasse;
      
       
  } catch (error) {
    console.error("Fejl ved hentning af klasser:", error);
    return null;
  }
}

let openCard = null; // Holder styr på åbent kort

function renderClasses(classes) {
  classListEl.innerHTML = "";
  classes.forEach(klasse => {
    if (klasse.Navn.includes("KAN IKKE VÆLGES")) return;

    const card = document.createElement("div");
    card.className = "card";
    card.dataset.classId = klasse.ID;
    card.dataset.className = klasse.Navn; // Gem navnet
    card.innerHTML = `
      <h2>${klasse.Navn}</h2>
      <p>Tryk for at se detaljer</p>
    `;
    card.addEventListener("click", () => showClassDetails(klasse.ID, card));
    classListEl.appendChild(card);
  });
}

async function showClassDetails(classId, cardElement) {
  // Luk tidligere åbnet kort
  if (openCard && openCard !== cardElement) {
    const prevId = openCard.dataset.classId;
    const prevName = openCard.dataset.className;
    openCard.innerHTML = `
     <h2>${prevName}</h2>
      <p>Tryk for at se detaljer</p>
    `;
    openCard.addEventListener("click", () => showClassDetails(prevId, openCard));
  }

  openCard = cardElement;

  const res = await fetch(`https://api.mrf-live.dk/ValDav/api/klasser/singleread.php?ID=${classId}`);
  const data = await res.json();

  const { Navn, Beskrivelse, Pris } = data;

  // const magiListe = Magier
  //   ? Magier.split(",").map(id => `<li>Magi ID: ${id}</li>`).join("")
  //   : "<li>Ingen magier</li>";


  
    // if (Magier) {
    //   const magiIds = Magier.split(",");
    //   const magiNavne = await Promise.all(magiIds.map(id => fetchMagiName(id)));
    //   magiHTML = magiIds.map((id, i) => {
    //   return `<a href="#" onclick="showMagiModal(${id}); return false;">${magiNavne[i]}</a>`;
    //   }).join(", ");
    // }

  cardElement.innerHTML = `
    <h2>${Navn}</h2>
    <p>${Beskrivelse}</p>
    <p><strong>Pris:</strong> ${Pris} EP</p>
    <button onclick="selectClass(${classId}, ${Pris})">Vælg denne klasse</button>
  `;
}

// async function fetchMagiName(id) {
//   try {
//     const res = await fetch(`https://api.mrf-live.dk/ValDav/api/magi/singleread.php?ID=${id}`);
//     const data = await res.json();
//     return data.Navn || `Magi #${id}`;
//   } catch (err) {
//     console.error("Fejl ved hentning af magi:", err);
//     return `Magi #${id}`;
//   }
// }

// async function showMagiModal(id) {
//   const res = await fetch(`https://api.mrf-live.dk/ValDav/api/magi/singleread.php?ID=${id}`);
//   const data = await res.json();

//   const modal = document.getElementById("modal");
//   modal.innerHTML = `
//     <div class="modal-content">
//       <h2>${data.Navn}</h2>
//       <p>${data.Beskrivelse}</p>
//       <button onclick="closeModal()">Luk</button>
//     </div>
//   `;
//   modal.style.display = "block";
// }

function closeModal() {
  document.getElementById("modal").style.display = "none";
}

function selectClass(classId, pris) {
  localStorage.setItem("selectedClassId", classId);
  localStorage.setItem("classCost", pris);

  // Opdater point
  let currentPoints = parseInt(localStorage.getItem("pointsLeft") || "24");
  currentPoints -= pris;
  localStorage.setItem("pointsLeft", currentPoints);

  window.location.href = "valg.html";
}

fetchClasses().then(renderClasses);

function updateCharacterSheet() {
  const summaryEl = document.getElementById("character-summary");
  const pointsEl = document.getElementById("points-left");

  let html = "<ul>";
  const raceId = localStorage.getItem("selectedRaceId");
  const classId = localStorage.getItem("selectedClassId");
  const classCost = parseInt(localStorage.getItem("classCost") || "0");

  if (raceId) html += `<li><strong>Race:</strong> ${raceId}</li>`;
  if (classId) html += `<li><strong>Klasse:</strong> ${classId} (−${classCost} EP)</li>`;

  selectedAbilities.forEach((evne, i) => {
    html += `<li>${evne.Navn} (${evne.EP} EP) <button onclick="removeEvne(${i})">Fjern</button></li>`;
  });
   selectedSpells.forEach((magi, i) => {
    html += `<li>${magi.Navn} (${magi.EP} EP) <button onclick="removeMagi(${i})">Fjern</button></li>`;
  });

  html += "</ul>";
  summaryEl.innerHTML = html;
  pointsEl.textContent = pointsLeft;
}

updateCharacterSheet();

const evneListEl = document.getElementById("evne-list");

const raceId = localStorage.getItem("selectedRaceId");
const classId = localStorage.getItem("selectedClassId");
let pointsLeft = parseInt(localStorage.getItem("pointsLeft") || "24");
let selectedAbilities = JSON.parse(localStorage.getItem("selectedAbilities") || "[]");
let selectedSpells = JSON.parse(localStorage.getItem("selectedSpells") || "[]");

async function fetchEvner() {
  const res = await fetch("https://api.mrf-live.dk/ValDav/api/evner/read.php");
  const data = await res.json();
  return data.Evner;
}

function kravMatcher(evne) {
  const klasseMatch = !evne.Krav_Klasse || evne.Krav_Klasse.split(",").includes(classId);
  const raceMatch = !evne.Krav_Race || evne.Krav_Race.split(",").includes(raceId);
  return klasseMatch && raceMatch;
}

function renderEvner(evner) {
  evneListEl.innerHTML = "";
  evner.filter(kravMatcher).forEach(evne => {
    const card = document.createElement("div");
    card.className = "card";
    card.innerHTML = `
      <h2>${evne.Navn}</h2>
      <p>Tryk for at se detaljer</p>
    `;
    card.addEventListener("click", () => showEvneModal(evne.ID));
    evneListEl.appendChild(card);
  });
}

fetchEvner().then(renderEvner);


async function showEvneModal(id) {
  const res = await fetch(`https://api.mrf-live.dk/ValDav/api/evner/singleread.php?ID=${id}`);
  const evne = await res.json();

  const kravRes = await formatKravRes(evne.Krav_Res);

  const modal = document.getElementById("modal");
  modal.innerHTML = `
    <div class="modal-content">
      <h2>${evne.Navn}</h2>
      <p>${evne.Beskrivelse}</p>
      <p><strong>Pris:</strong> ${evne.EP} EP</p>
      <p><strong>Krav Ressourcer:</strong> ${kravRes}</p>
      <button onclick="addEvne(${evne.ID})">Tilføj evne</button>
      <button onclick="closeModal()">Luk</button>
    </div>
  `;
  modal.style.display = "block";
}

function closeModal() {
  document.getElementById("modal").style.display = "none";
}

async function formatKravRes(kravStr) {
  if (!kravStr) return "Ingen";
  const ressourceRes = await fetch("https://api.mrf-live.dk/ValDav/api/ressourcer/read.php");
  const ressourceData = await ressourceRes.json();
  const ressourceMap = {};
  ressourceData.Ressourcer.forEach(r => ressourceMap[r.ID] = r.Navn);

  return kravStr.split(",").map(entry => {
    const [id, antal] = entry.split("x");
    const navn = ressourceMap[id] || `Ressource #${id}`;
    return `${navn} x${antal}`;
  }).join(", ");
}

async function addEvne(id) {
  const res = await fetch(`https://api.mrf-live.dk/ValDav/api/evner/singleread.php?ID=${id}`);
  const evne = await res.json();

  if (pointsLeft < evne.EP) {
    alert("Du har ikke nok point!");
    return;
  }

  selectedAbilities.push(evne);
  pointsLeft -= evne.EP;
  localStorage.setItem("selectedAbilities", JSON.stringify(selectedAbilities));
  localStorage.setItem("pointsLeft", pointsLeft);
  updateCharacterSheet();
  closeModal();
}

function removeEvne(index) {
  const evne = selectedAbilities[index];
  pointsLeft += evne.EP;
  selectedAbilities.splice(index, 1);
  localStorage.setItem("selectedAbilities", JSON.stringify(selectedAbilities));
  localStorage.setItem("pointsLeft", pointsLeft);
  updateCharacterSheet();
}

async function addMagi(id) {
  const res = await fetch(`https://api.mrf-live.dk/ValDav/api/magi/singleread.php?ID=${id}`);
  const magi = await res.json();

  if (pointsLeft < magi.EP) {
    alert("Du har ikke nok point!");
    return;
  }

  selectedSpells.push(magi);
  pointsLeft -= magi.EP;
  localStorage.setItem("selectedSpells", JSON.stringify(selectedSpells));
  localStorage.setItem("pointsLeft", pointsLeft);
  updateCharacterSheet();
  closeModal();
}

function removeMagi(index) {
  const magi = selectedSpells[index];
  pointsLeft += magi.EP;
  selectedSpells.splice(index, 1);
  localStorage.setItem("selectedSpells", JSON.stringify(selectedSpells));
  localStorage.setItem("pointsLeft", pointsLeft);
  updateCharacterSheet();
}

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
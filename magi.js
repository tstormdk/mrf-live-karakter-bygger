const magiListEl = document.getElementById("magi-list");

const raceId = localStorage.getItem("selectedRaceId");
const classId = localStorage.getItem("selectedClassId");
let pointsLeft = parseInt(localStorage.getItem("pointsLeft") || "24");
let selectedAbilities = JSON.parse(localStorage.getItem("selectedAbilities") || "[]");
let selectedSpells = JSON.parse(localStorage.getItem("selectedSpells") || "[]");

async function fetchMagier() {
  const res = await fetch("https://api.mrf-live.dk/ValDav/api/magi/read.php");
  const data = await res.json();
  return data.Magi;
}

function kravMatcher(magi) {
  const klasseMatch = !magi.Krav_Klasse || magi.Krav_Klasse.split(",").includes(classId);
  const raceMatch = !magi.Krav_Race || magi.Krav_Race.split(",").includes(raceId);
  return klasseMatch && raceMatch;
}

function renderMagier(magier) {
  magiListEl.innerHTML = "";
  magier.filter(kravMatcher).forEach(magi => {
    const card = document.createElement("div");
    card.className = "card";
    card.innerHTML = `
      <h2>${magi.Navn}</h2>
      <p>Tryk for at se detaljer</p>
    `;
    card.addEventListener("click", () => showMagiModal(magi.ID));
    magiListEl.appendChild(card);
  });
}

async function showMagiModal(id) {
  const res = await fetch(`https://api.mrf-live.dk/ValDav/api/magi/singleread.php?ID=${id}`);
  const magi = await res.json();

  const modal = document.getElementById("modal");
  modal.innerHTML = `
    <div class="modal-content">
      <h2>${magi.Navn}</h2>
      <p>${magi.Beskrivelse}</p>
      <p><strong>Pris:</strong> ${magi.EP} EP</p>
      <p><strong>Krav Magi:</strong> ${magi.Krav_Magi || "Ingen"}</p>
      <button onclick="addMagi(${magi.ID})">Tilføj magi</button>
      <button onclick="closeModal()">Luk</button>
    </div>
  `;
  modal.style.display = "block";
}

function closeModal() {
  document.getElementById("modal").style.display = "none";
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

function updateCharacterSheet() {
  const summaryEl = document.getElementById("character-summary");
  const pointsEl = document.getElementById("points-left");

  let html = "<ul>";
  const raceId = localStorage.getItem("selectedRaceId");
  const classId = localStorage.getItem("selectedClassId");
  const classCost = parseInt(localStorage.getItem("classCost") || "0");

  if (raceId) html += `<li><strong>Race:</strong> ${raceId}</li>`;
  if (classId) html += `<li><strong>Klasse:</strong> ${classId} (−${classCost} EP)</li>`;

    selectedSpells.forEach((magi, i) => {
        html += `<li>${magi.Navn} (−${magi.EP} EP) <button onclick="removeMagi(${i})">Fjern</button></li>`;
    });

    selectedAbilities.forEach((evne, i) => {
        html += `<li>${evne.Navn} (−${evne.EP} EP) <button onclick="removeEvne(${i})">Fjern</button></li>`;
    });

  html += "</ul>";
  summaryEl.innerHTML = html;
  pointsEl.textContent = pointsLeft;
}

fetchMagier().then(renderMagier);
updateCharacterSheet();

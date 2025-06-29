const raceListEl = document.getElementById("race-list");

const raceId = localStorage.getItem("selectedRaceId");
const classId = localStorage.getItem("selectedClassId");
let pointsLeft = parseInt(localStorage.getItem("pointsLeft") || "24");
let selectedAbilities = JSON.parse(localStorage.getItem("selectedAbilities") || "[]");
let selectedSpells = JSON.parse(localStorage.getItem("selectedSpells") || "[]");

async function fetchRaces() {
  try {
    const res = await fetch("https://api.mrf-live.dk/ValDav/api/race/read.php");
    const data = await res.json();
    console.log("API response:", data);
    return data.Racer; // <-- korrekt nøgle
  } catch (error) {
    console.error("Fejl ved hentning af racer:", error);
    return null;
  }
}


function renderRaces(races) {
  raceListEl.innerHTML = "";
  races.forEach(race => {
    const card = document.createElement("div");
    card.className = "card";
    card.innerHTML = `
      <h2>${race.Navn}</h2>
      <p>Tryk for at vælge</p>
    `;
    card.addEventListener("click", () => selectRace(race.ID));
    raceListEl.appendChild(card);
  });
}

function selectRace(raceId) {
  localStorage.setItem("selectedRaceId", raceId);
  window.location.href = "klasser.html"; // næste trin
}

fetchRaces().then(renderRaces);

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
    html += `<li>${evne.Navn} (−${evne.EP} EP) <button onclick="removeEvne(${i})">Fjern</button></li>`;
  });
   selectedSpells.forEach((magi, i) => {
    html += `<li>${magi.Navn} (${magi.EP} EP) <button onclick="removeMagi(${i})">Fjern</button></li>`;
  });
  html += "</ul>";
  summaryEl.innerHTML = html;
  pointsEl.textContent = pointsLeft;
}

updateCharacterSheet();

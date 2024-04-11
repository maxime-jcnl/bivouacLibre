document.addEventListener("DOMContentLoaded", function () {
  document.getElementById("search-input").value = ""; // Efface le contenu de la barre de recherche

  var maCarte = L.map("maCarte", {
    zoomControl: false,
    scrollWheelZoom: false,
    smoothWheelZoom: true,
    smoothSensitivity: 5,
  }).setView([48.8566, 2.3522], 13);

  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: "&copy; Contributeurs d'OpenStreetMap",
  }).addTo(maCarte);

  var currentMarker = null;

  // Fonction pour exécuter la recherche et placer un marqueur
  function executeSearch(lat, lon) {
    if (currentMarker) {
      maCarte.removeLayer(currentMarker);
    }
    maCarte.setView([lat, lon], 13);
    currentMarker = L.marker([lat, lon]).addTo(maCarte);
  }

  // Vérifie si un point est à l'intérieur des limites de la France
  function isInsideFrance(lat, lon) {
    // Utilise la géométrie point pour créer un objet Turf.js
    var point = turf.point([lon, lat]);
    // Utilise la géométrie du pays France pour créer un objet Turf.js
    var france = turf.featureCollection(franceBoundary.features);
    // Vérifie si le point est à l'intérieur des limites de la France
    return turf.booleanPointInPolygon(point, france);
  }

  // Charger les limites administratives des pays depuis OSM (France)
  fetch("https://nominatim.openstreetmap.org/search.php?q=France&format=geojson")
    .then((response) => response.json())
    .then((data) => {
      var franceBoundary = data;
    })
    .catch((error) => console.error("Erreur lors du chargement des limites administratives de la France :", error));

  document
    .getElementById("search-button")
    .addEventListener("click", function () {
      var query = document.getElementById("search-input").value;
      fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${query}`)
        .then((response) => response.json())
        .then((data) => {
          if (data.length > 0) {
            var firstResult = data[0];
            executeSearch(firstResult.lat, firstResult.lon);
          } else {
            // Vérifier si l'utilisateur a entré des coordonnées GPS
            var coordinates = query.trim().split(" ").filter((coord) => coord !== ""); // Diviser par espace et supprimer les chaînes vides
            if (coordinates.length === 2 && !isNaN(coordinates[0]) && !isNaN(coordinates[1])) {
              executeSearch(parseFloat(coordinates[0]), parseFloat(coordinates[1])); // Inverser l'ordre des coordonnées
            } else {
              alert("Lieu non trouvé. Veuillez essayer une autre recherche.");
            }
          }
        })
        .catch((error) => console.log(error));
    });

  document
    .getElementById("search-input")
    .addEventListener("input", function (e) {
      var userInput = e.target.value;
      if (userInput.length > 2) {
        fetch(`https://photon.komoot.io/api/?q=${userInput}`)
          .then((response) => response.json())
          .then((data) => {
            console.log(data); // Pour inspecter les données dans la console

            // Filtrer les résultats pour ne conserver que ceux situés en France (approximativement)
            var franceResults = data.features.filter((item) => {
              // Vérifier si les coordonnées se trouvent en France précisément
              return isInsideFrance(item.geometry.coordinates[1], item.geometry.coordinates[0]);
            });

            document.getElementById("suggestions-container").innerHTML = "";
            franceResults.forEach((item) => {
              var suggestionItem = document.createElement("div");
              suggestionItem.textContent = item.properties.name;
              suggestionItem.classList.add("suggestion-item");
              suggestionItem.addEventListener("click", () => {
                document.getElementById("suggestions-container").style.display =
                  "none";
                executeSearch(
                  item.geometry.coordinates[1],
                  item.geometry.coordinates[0]
                );
              });
              document
                .getElementById("suggestions-container")
                .appendChild(suggestionItem);
            });

            // Vérifier si l'utilisateur a entré des coordonnées GPS
            var coordinates = userInput.trim().split(" ").filter((coord) => coord !== ""); // Diviser par espace et supprimer les chaînes vides
            if (coordinates.length === 2 && !isNaN(coordinates[0]) && !isNaN(coordinates[1])) {
              var suggestionItem = document.createElement("div");
              suggestionItem.textContent = `Coordonnées GPS : ${coordinates[0]}, ${coordinates[1]}`; // Inverser l'ordre des coordonnées
              suggestionItem.classList.add("suggestion-item");
              suggestionItem.addEventListener("click", () => {
                document.getElementById("suggestions-container").style.display =
                  "none";
                executeSearch(parseFloat(coordinates[0]), parseFloat(coordinates[1]));
              });
              document
                .getElementById("suggestions-container")
                .appendChild(suggestionItem);
            }

            document.getElementById("suggestions-container").style.display =
              "block";
          })
          .catch((error) =>
            console.log(
              "Erreur lors de la récupération des suggestions:",
              error
            )
          );
      }
    });
});

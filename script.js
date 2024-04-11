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
              var coordinates = query.split(",");
              if (coordinates.length === 2 && !isNaN(coordinates[0]) && !isNaN(coordinates[1])) {
                executeSearch(parseFloat(coordinates[1]), parseFloat(coordinates[0]));
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
  
              // Filtrer les résultats pour ne conserver que ceux situés en France
              var franceResults = data.features.filter((item) => {
                // Vérifier si les coordonnées se trouvent en France (approximativement)
                return (
                  item.geometry.coordinates[0] > -5.0 &&
                  item.geometry.coordinates[0] < 10.0 &&
                  item.geometry.coordinates[1] > 41.0 &&
                  item.geometry.coordinates[1] < 51.0
                );
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
              var coordinates = userInput.split(",");
              if (coordinates.length === 2 && !isNaN(coordinates[0]) && !isNaN(coordinates[1])) {
                var suggestionItem = document.createElement("div");
                suggestionItem.textContent = `Coordonnées GPS : ${coordinates[1]}, ${coordinates[0]}`;
                suggestionItem.classList.add("suggestion-item");
                suggestionItem.addEventListener("click", () => {
                  document.getElementById("suggestions-container").style.display =
                    "none";
                  executeSearch(parseFloat(coordinates[1]), parseFloat(coordinates[0]));
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
  

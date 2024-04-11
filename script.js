// Attendez que la page soit chargée
document.addEventListener('DOMContentLoaded', function() {
    // Initialiser la carte en spécifiant la div et les options de vue initiales
    var maCarte = L.map('maCarte').setView([48.8566, 2.3522], 13); // Coordonnées de Paris

    // Ajouter un calque de tuiles OpenStreetMap à la carte
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; Contributeurs d\'OpenStreetMap'
    }).addTo(maCarte);
});

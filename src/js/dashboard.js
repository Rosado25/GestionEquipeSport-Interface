/**
 * Script pour le chart graphique
 */
document.addEventListener("DOMContentLoaded", async () => {
    try {
        // Récupérer les 5 derniers matchs depuis l'API
        const response = await fetch("/R4.01/gestionequipesport-api/src/routes/dashboard.php/api/last-matches?numMatchs=5");
        const derniersCinqMatchs = await response.json();

        // Initialiser les tableaux pour les données du graphique
        const labels = [];
        const performanceData = [];

        // Remplir les données
        derniersCinqMatchs.forEach(match => {
            labels.push(new Date(match.date_heure).toLocaleDateString("fr-FR"));
            performanceData.push(match.goals_scored - match.goals_conceded); // Calcul de la performance
        });

        // Sélectionner le canvas du graphique
        const ctx = document.getElementById("performanceChart").getContext("2d");

        // Générer le graphique avec Chart.js
        new Chart(ctx, {
            type: "line",
            data: {
                labels: labels,
                datasets: [{
                    label: "Performance de l'équipe",
                    data: performanceData,
                    borderColor: "#ffcc00",
                    backgroundColor: "rgba(255, 204, 0, 0.2)",
                    borderWidth: 2,
                    fill: true
                }]
            },
            options: {
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });

    } catch (error) {
        console.error("Erreur lors du chargement des données:", error);
    }
});


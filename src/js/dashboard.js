document.addEventListener("DOMContentLoaded", async () => {
    try {
        // Fetch the last 5 matches from the API
        const response = await fetch("/R4.01/gestionequipesport-api/src/routes/dashboard.php/api/last-matches?numMatches=5");
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const responseData = await response.json();
        console.log(responseData); // Log the entire response to inspect its structure

        // Assume the data is in a property 'data'
        const data = responseData.data;
        if (!Array.isArray(data)) {
            throw new Error("The returned data is not an array");
        }

        // Initialize arrays for chart data
        const labels = [];
        const performanceData = [];

        // Fill the data
        for (const match of data) {
            const date = new Date(match.date_heure);
            if (isNaN(date) || match.date_heure === "0000-00-00 00:00:00") {
                console.warn(`Skipping invalid date format: ${match.date_heure}`);
                continue;
            }
            labels.push(date.toLocaleDateString("fr-FR"));

            // Calculate performance using the API
            const performanceResponse = await fetch("/R4.01/gestionequipesport-api/src/routes/dashboard.php/api/calculate-performance", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ match })
            });

            if (!performanceResponse.ok) {
                throw new Error(`HTTP error! status: ${performanceResponse.status}`);
            }

            const performanceDataResponse = await performanceResponse.json();
            console.log("Performance Data Response:", performanceDataResponse); // Log the performance data response

            if (performanceDataResponse && performanceDataResponse.performance !== undefined) {
                performanceData.push(performanceDataResponse.performance);
            } else {
                console.warn("Performance data is undefined for match:", match);
                performanceData.push(null);
            }
        }

        console.log("Labels:", labels);
        console.log("Performance Data:", performanceData);

        // Check if data arrays are not empty
        if (labels.length === 0 || performanceData.length === 0) {
            throw new Error("No valid data to display in the chart");
        }

        // Select the chart canvas
        const ctx = document.getElementById("performanceChart").getContext("2d");

        // Generate the chart with Chart.js
        new Chart(ctx, {
            type: "line",
            data: {
                labels: labels,
                datasets: [{
                    label: "Team Performance",
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
        console.error("Error loading data:", error);
    }

    // Récupération et affichage du prochain match
    async function fetchNextMatch() {
        try {
            const response = await fetch("/R4.01/gestionequipesport-api/src/routes/dashboard.php/api/next-game");
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const responseData = await response.json();

            // Sélection de l'id où afficher les infos
            const cardNextMatch = document.querySelector("#prochainMatch");


            // Vérifier si des données sont reçues
            if (responseData.data) {
                console.log(responseData)
                const { date_heure, Adversaire, lieu } = responseData.data;
                console.log(responseData.data)
                cardNextMatch.innerHTML += `
                <p><strong>AbdelFC</strong> vs <strong>${Adversaire}</strong></p>
                <p>Date et Heure: ${date_heure}</p>
                <p>Lieu: ${lieu}</p>
            `;
            } else {
                cardNextMatch.innerHTML += `<p>Aucun match à venir.</p>`;
            }
        } catch (error) {
            console.error("Erreur lors de la récupération du match :", error);
            document.querySelector("#prochainMatch").innerHTML += `<p>Impossible de charger le prochain match.</p>`;
        }
    }

    async function fetchTeamPoints() {
        try {
            const response = await fetch("/R4.01/gestionequipesport-api/src/routes/dashboard.php/api/points");
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const responseData = await response.json();

            // Sélection de l'id où afficher les infos
            const PointsText = document.querySelector("#points");

            if (responseData.data) {
                console.log(responseData)
                const data = responseData.data;
                console.log(responseData.data)
                PointsText.innerHTML += `
                <p><strong>${data} points</strong></p>
            `;
            } else {
                PointsText.innerHTML += `<p>0</p>`;
            }

        } catch (error) {
            console.error("Erreur lors de la récupération des points :", error);
            document.querySelector("#points").innerHTML += `<p>Impossible de charger les points.</p>`;
        }
    }

    async function fetchLastThreeMatches() {
        console.log("coucou")
        try {
            const response = await fetch("/R4.01/gestionequipesport-api/src/routes/dashboard.php/api/last-matches?numMatches=3");
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const responseData = await response.json();

            const data = responseData.data;
            if (!Array.isArray(data)) {
                throw new Error("Les données retournées ne sont pas un tableau");
            }

            const tbody = document.getElementById("dernierMatchs");
            tbody.innerHTML = ""; // Nettoie le tableau avant d'ajouter de nouveaux matchs

            data.forEach(match => {
                const adversaire = match.Adversaire;
                const score = match.résultat;

                // Vérifier si le score est bien dans le format "X-Y"
                if (typeof score !== "string" || !score.includes("-")) return;
                const [myTeamScore, opponentScore] = score.split("-").map(Number);

                const isHomeGame = match.domicile === true; // Suppose que l'API retourne un booléen pour domicile
                const resultat = myTeamScore > opponentScore ? "Victoire" : myTeamScore < opponentScore ? "Défaite" : "Nul";

                const row = document.createElement("tr");
                row.innerHTML = `
                    <td>${isHomeGame ? `Abdel FC vs ${adversaire}` : `${adversaire} vs Abdel FC`}</td>
                    <td>${isHomeGame ? `${myTeamScore} - ${opponentScore}` : `${opponentScore} - ${myTeamScore}`}</td>
                    <td>${resultat}</td>
                `;
                tbody.appendChild(row);
                console.log("cc");
            });

        } catch (error) {
            console.error("Erreur lors de la récupération des derniers matchs :", error);
            document.getElementById("dernierMatchs").innerHTML = "<tr><td colspan='3'>Impossible de charger les derniers matchs.</td></tr>";
        }
    }

    async function fetchPorcentageVictories() {
        try {
            const response = await fetch("/R4.01/gestionequipesport-api/src/routes/dashboard.php/api/win-rate");
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const responseData = await response.json();

            // Sélection de l'id où afficher les infos
            const PointsText = document.querySelector("#victories");

            if (responseData.data) {
                console.log(responseData)
                const data = responseData.data;
                console.log(responseData.data)
                PointsText.innerHTML += `
                <strong>${data.toFixed(1)}%</strong>
            `;
            } else {
                PointsText.innerHTML += `<p>0</p>`;
            }

        } catch (error) {
            console.error("Erreur lors de la récupération des victoires :", error);
            document.querySelector("#victories").innerHTML += `<p>Impossible de charger les victoires.</p>`;
        }
    }

    async function fetchMatchsJouees() {
        try {
            const response = await fetch("/R4.01/gestionequipesport-api/src/routes/dashboard.php/api/matches-played");
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const responseData = await response.json();

            // Sélection de l'id où afficher les infos
            const PointsText = document.querySelector("#NbMatchs");

            if (responseData.data) {
                console.log(responseData)
                const data = responseData.data;
                console.log(responseData.data)
                PointsText.innerHTML += `
                <strong>${data}</strong>
            `;
            } else {
                PointsText.innerHTML += `<p>0</p>`;
            }

        } catch (error) {
            console.error("Erreur lors de la récupération le NbMatchs :", error);
            document.querySelector("#NbMatchs").innerHTML += `<p>Impossible de charger le NbMatchs.</p>`;
        }
    }

    async function fetchMatchsGagnées() {
        try {
            const response = await fetch("/R4.01/gestionequipesport-api/src/routes/dashboard.php/api/count-matches-won");
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const responseData = await response.json();

            // Sélection de l'id où afficher les infos
            const PointsText = document.querySelector("#NbGagnés");

            if (responseData.data) {
                console.log(responseData)
                const data = responseData.data;
                console.log(responseData.data)
                PointsText.innerHTML += `
                <strong>${data}</strong>
            `;
            } else {
                PointsText.innerHTML += `<p>0</p>`;
            }

        } catch (error) {
            console.error("Erreur lors de la récupération de NbGagnés :", error);
            document.querySelector("#NbGagnés").innerHTML += `<p>Impossible de charger le NbGagnés.</p>`;
        }
    }

    async function fetchButsMarques() {
        try {
            const response = await fetch("/R4.01/gestionequipesport-api/src/routes/dashboard.php/api/goals-scored");
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const responseData = await response.json();

            // Sélection de l'id où afficher les infos
            const PointsText = document.querySelector("#ButsM");

            if (responseData.data) {
                console.log(responseData)
                const data = responseData.data;
                console.log(responseData.data)
                PointsText.innerHTML += `
                <strong>${data}</strong>
            `;
            } else {
                PointsText.innerHTML += `<p>0</p>`;
            }

        } catch (error) {
            console.error("Erreur lors de la récupération de ButsM :", error);
            document.querySelector("#ButsM").innerHTML += `<p>Impossible de charger le ButsM.</p>`;
        }
    }

    async function fetchButsSubis() {
        try {
            const response = await fetch("/R4.01/gestionequipesport-api/src/routes/dashboard.php/api/goals-conceded");
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const responseData = await response.json();

            // Sélection de l'id où afficher les infos
            const PointsText = document.querySelector("#ButsS");

            if (responseData.data) {
                console.log(responseData)
                const data = responseData.data;
                console.log(responseData.data)
                PointsText.innerHTML += `
                <strong>${data}</strong>
            `;
            } else {
                PointsText.innerHTML += `<p>0</p>`;
            }

        } catch (error) {
            console.error("Erreur lors de la récupération de ButsS :", error);
            document.querySelector("#ButsS").innerHTML += `<p>Impossible de charger le ButsS.</p>`;
        }
    }

    async function fetchButsParMatch() {
        try {
            const response = await fetch("/R4.01/gestionequipesport-api/src/routes/dashboard.php/api/goals-per-game");
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const responseData = await response.json();

            // Sélection de l'id où afficher les infos
            const PointsText = document.querySelector("#ButsPm");

            if (responseData.data) {
                console.log(responseData)
                const data = responseData.data;
                console.log(responseData.data)
                PointsText.innerHTML += `
                <strong>${data}</strong>
            `;
            } else {
                PointsText.innerHTML += `<p>0</p>`;
            }

        } catch (error) {
            console.error("Erreur lors de la récupération de ButsPm :", error);
            document.querySelector("#ButsPm").innerHTML += `<p>Impossible de charger le ButsPm.</p>`;
        }
    }

    async function fetchCleanSheets() {
        try {
            const response = await fetch("/R4.01/gestionequipesport-api/src/routes/dashboard.php/api/clean-sheets");
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const responseData = await response.json();

            // Sélection de l'id où afficher les infos
            const PointsText = document.querySelector("#Cs");

            if (responseData.data) {
                console.log(responseData)
                const data = responseData.data;
                console.log(responseData.data)
                PointsText.innerHTML += `
                <strong>${data}</strong>
            `;
            } else {
                PointsText.innerHTML += `<p>0</p>`;
            }

        } catch (error) {
            console.error("Erreur lors de la récupération de Cs :", error);
            document.querySelector("#Cs").innerHTML += `<p>Impossible de charger le Cs.</p>`;
        }
    }

    async function fetchDifferenceButs() {
        try {
            const response = await fetch("/R4.01/gestionequipesport-api/src/routes/dashboard.php/api/goals-diff");
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const responseData = await response.json();

            // Sélection de l'id où afficher les infos
            const PointsText = document.querySelector("#Db");

            if (responseData.data) {
                console.log(responseData)
                const data = responseData.data;
                console.log(responseData.data)
                PointsText.innerHTML += `
                <strong>${data}</strong>
            `;
            } else {
                PointsText.innerHTML += `<p>0</p>`;
            }

        } catch (error) {
            console.error("Erreur lors de la récupération de Db :", error);
            document.querySelector("#Db").innerHTML += `<p>Impossible de charger le Db.</p>`;
        }
    }

    async function fetchPerformanceEquipe() {
        try {
            const response = await fetch("/R4.01/gestionequipesport-api/src/routes/dashboard.php/api/team-performance-note");
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const responseData = await response.json();

            // Sélection de l'id où afficher les infos
            const PointsText = document.querySelector("#PerformanceEquipe");

            if (responseData.data) {
                console.log(responseData)
                const data = responseData.data;
                console.log(responseData.data)
                PointsText.innerHTML += `
                <strong>${data.toFixed(1)}</strong>
            `;
            } else {
                PointsText.innerHTML += `<p>0</p>`;
            }

        } catch (error) {
            console.error("Erreur lors de la récupération de PerformanceEquipe :", error);
            document.querySelector("#PerformanceEquipe").innerHTML += `<p>Impossible de charger le PerformanceEquipe.</p>`;
        }
    }

    async function fetchMoyenneNotes() {
        try {
            const response = await fetch("/R4.01/gestionequipesport-api/src/routes/dashboard.php/api/team-average-note");
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const responseData = await response.json();

            // Sélection de l'id où afficher les infos
            const PointsText = document.querySelector("#MoyenneNotes");

            if (responseData.data) {
                console.log(responseData)
                const data = responseData.data;
                console.log(responseData.data)
                PointsText.innerHTML += `
                <strong>${data.toFixed(1)}</strong>
            `;
            } else {
                PointsText.innerHTML += `0`;
            }

        } catch (error) {
            console.error("Erreur lors de la récupération de MoyenneNotes :", error);
            document.querySelector("#MoyenneNotes").innerHTML += `<p>Impossible de charger le MoyenneNotes.</p>`;
        }
    }

    fetchMoyenneNotes();
    fetchPerformanceEquipe();
    fetchDifferenceButs();
    fetchCleanSheets();
    fetchButsParMatch();
    fetchButsSubis();
    fetchButsMarques();
    fetchMatchsGagnées();
    fetchMatchsJouees();
    fetchPorcentageVictories();
    fetchLastThreeMatches();
    fetchNextMatch();
    fetchTeamPoints();

});
document.addEventListener("DOMContentLoaded", async () => {

    const baseUrl = "/R4.01/gestionequipesport-api/src/routes/dashboard.php/api/";

    try {
        const response = await fetch(`${baseUrl}last-matches?numMatches=5`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const responseData = await response.json();

        const data = responseData.data;
        if (!Array.isArray(data)) {
            throw new Error("Les données ne sont pas un tableau");
        }

        const labels = [];
        const performanceData = [];

        for (const match of data) {
            const date = new Date(match.date_heure);
            if (isNaN(date) || match.date_heure === "0000-00-00 00:00:00") {
                continue;
            }
            labels.push(date.toLocaleDateString("fr-FR"));

            const performanceResponse = await fetch(`${baseUrl}calculate-performance`, {
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
            if (performanceDataResponse && performanceDataResponse.performance !== undefined) {
                performanceData.push(performanceDataResponse.performance);
            } else {
                performanceData.push(null);
            }
        }

        if (labels.length === 0 || performanceData.length === 0) {
            throw new Error("Les données sont invalide pour ce graphique ");
        }

        const ctx = document.getElementById("performanceChart").getContext("2d");
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
        console.error("Erreur concernant les données:", error);
    }

    // Récupère le prochain match
    async function fetchNextMatch() {
        try {
            const response = await fetch(`${baseUrl}next-game`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const responseData = await response.json();
            const cardNextMatch = document.querySelector("#prochainMatch");

            if (responseData.data) {
                const { date_heure, Adversaire, lieu } = responseData.data;
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

    // Récupère les Points de l'équipe
    async function fetchTeamPoints() {
        try {
            const response = await fetch(`${baseUrl}points`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const responseData = await response.json();
            const PointsText = document.querySelector("#points");

            if (responseData.data) {
                const data = responseData.data;
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
    // Les 3 derniers matchs
    async function fetchLastThreeMatches() {
        try {
            const response = await fetch(`${baseUrl}last-matches?numMatches=3`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const responseData = await response.json();
            const data = responseData.data;
            if (!Array.isArray(data)) {
                throw new Error("Les données retournées ne sont pas un tableau");
            }

            const tbody = document.getElementById("dernierMatchs");
            tbody.innerHTML = "";
            data.forEach(match => {
                const adversaire = match.Adversaire;
                const score = match.résultat;

                if (typeof score !== "string" || !score.includes("-")) return;
                const [myTeamScore, opponentScore] = score.split("-").map(Number);

                const isHomeGame = match.domicile === true;
                const resultat = myTeamScore > opponentScore ? "Victoire" : myTeamScore < opponentScore ? "Défaite" : "Nul";

                const row = document.createElement("tr");
                row.innerHTML = `
                    <td>${isHomeGame ? `Abdel FC vs ${adversaire}` : `${adversaire} vs Abdel FC`}</td>
                    <td>${isHomeGame ? `${myTeamScore} - ${opponentScore}` : `${opponentScore} - ${myTeamScore}`}</td>
                    <td>${resultat}</td>
                `;
                tbody.appendChild(row);
            });

        } catch (error) {
            console.error("Erreur lors de la récupération des derniers matchs :", error);
            document.getElementById("dernierMatchs").innerHTML = "<tr><td colspan='3'>Impossible de charger les derniers matchs.</td></tr>";
        }
    }

    // Pourcentage de victoires
    async function fetchWinRate() {
        try {
            const response = await fetch(`${baseUrl}win-rate`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const responseData = await response.json();
            const PointsText = document.querySelector("#victories");

            if (responseData.data) {
                const data = responseData.data;
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

    //Nombre de matchs joués
    async function fetchMatchesPlayed() {
        try {
            const response = await fetch(`${baseUrl}matches-played`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const responseData = await response.json();
            const PointsText = document.querySelector("#NbMatchs");

            if (responseData.data) {
                const data = responseData.data;
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
    // Nombre de matchs gagnés
    async function fetchMatchesWon() {
        try {
            const response = await fetch(`${baseUrl}count-matches-won`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const responseData = await response.json();
            const PointsText = document.querySelector("#NbGagnés");

            if (responseData.data) {
                const data = responseData.data;
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
    // Nombre de buts marqués
    async function fetchGoalsScored() {
        try {
            const response = await fetch(`${baseUrl}goals-scored`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const responseData = await response.json();
            const PointsText = document.querySelector("#ButsM");

            if (responseData.data) {
                const data = responseData.data;
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

    async function fetchGoalsConceded() {
        try {
            const response = await fetch(`${baseUrl}goals-conceded`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const responseData = await response.json();
            const PointsText = document.querySelector("#ButsS");

            if (responseData.data) {
                const data = responseData.data;
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

    // Buts par match
    async function fetchGoalsPerGame() {
        try {
            const response = await fetch(`${baseUrl}goals-per-game`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const responseData = await response.json();
            const PointsText = document.querySelector("#ButsPm");

            if (responseData.data) {
                const data = responseData.data;
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

    // Nombre de clean sheets
    async function fetchCleanSheets() {
        try {
            const response = await fetch(`${baseUrl}clean-sheets`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const responseData = await response.json();

            const PointsText = document.querySelector("#Cs");

            if (responseData.data) {
                const data = responseData.data;
                PointsText.innerHTML += `
                <strong>${data}</strong>
            `;
            } else {
                PointsText.innerHTML += `<p>0</p>`;
            }

        } catch (error) {
            console.error("Erreur lors de la récupération de Cs :", error);
            document.querySelector("#Cs").innerHTML += `<p>Impossible de charger les cleanSheets.</p>`;
        }
    }

    // Différence de buts de l'équipe par rapport au but concédé
    async function fetchGoalsDifference() {
        try {
            const response = await fetch(`${baseUrl}goals-diff`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const responseData = await response.json();
            const PointsText = document.querySelector("#Db");

            if (responseData.data) {
                const data = responseData.data;
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
    // Performance de l'équipe
    async function fetchTeamPerformanceNote() {
        try {
            const response = await fetch(`${baseUrl}team-performance-note`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const responseData = await response.json();
            const PointsText = document.querySelector("#PerformanceEquipe");

            if (responseData.data) {
                const data = responseData.data;
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

    // Moyenne des notes de l'équipe
    async function fetchTeamAverageNote() {
        try {
            const response = await fetch(`${baseUrl}team-average-note`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const responseData = await response.json();
            const PointsText = document.querySelector("#MoyenneNotes");

            if (responseData.data) {
                const data = responseData.data;
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

    await fetchTeamAverageNote();
    await fetchTeamPerformanceNote();
    await fetchGoalsDifference();
    await fetchCleanSheets();
    await fetchGoalsPerGame();
    await fetchGoalsConceded();
    await fetchGoalsScored();
    await fetchMatchesWon();
    await fetchMatchesPlayed();
    await fetchWinRate();
    await fetchLastThreeMatches();
    await fetchNextMatch();
    await fetchTeamPoints();

});
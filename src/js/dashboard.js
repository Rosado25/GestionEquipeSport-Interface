document.addEventListener("DOMContentLoaded", async () => {

    // URL de base pour les requêtes API
    const baseUrl = "/R4.01/gestionequipesport-api/src/routes/dashboard.php/api/";

    /**
     * Récupère et affiche les 5 derniers matchs et leurs performances
     */
    async function fetchLastMatches() {
        try {
            const response = await fetch(`${baseUrl}last-matches?numMatches=5`);
            if (!response.ok) {
                throw new Error(`Erreur HTTP! statut: ${response.status}`);
            }
            const responseData = await response.json();
            const data = responseData.data;
            if (!Array.isArray(data)) throw new Error("Les données ne sont pas un tableau");

            const labels = [];
            const performanceData = [];

            for (const match of data) {
                const date = new Date(match.date_heure);
                if (isNaN(date) || match.date_heure === "0000-00-00 00:00:00") continue;
                labels.push(date.toLocaleDateString("fr-FR"));

                const performanceResponse = await fetch(`${baseUrl}calculate-performance`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ match })
                });

                if (!performanceResponse.ok) throw new Error(`Erreur HTTP! statut: ${performanceResponse.status}`);
                const performanceDataResponse = await performanceResponse.json();
                performanceData.push(performanceDataResponse.performance ?? null);
            }

            if (labels.length === 0 || performanceData.length === 0) throw new Error("Les données sont invalides pour ce graphique");

            const ctx = document.getElementById("performanceChart").getContext("2d");
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
                    scales: { y: { beginAtZero: true } }
                }
            });
        } catch (error) {
            console.error("Erreur concernant les données:", error);
        }
    }

    /**
     * Récupère et affiche le prochain match
     */
    async function fetchNextMatch() {
        try {
            const response = await fetch(`${baseUrl}next-game`);
            if (!response.ok) {
                throw new Error(`Erreur HTTP! statut: ${response.status}`);
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

    /**
     * Récupère et affiche les points de l'équipe
     */
    async function fetchTeamPoints() {
        try {
            const response = await fetch(`${baseUrl}points`);
            if (!response.ok) {
                throw new Error(`Erreur HTTP! statut: ${response.status}`);
            }
            const responseData = await response.json();
            const PointsText = document.querySelector("#points");

            if (responseData.data) {
                PointsText.innerHTML += `<p><strong>${responseData.data} points</strong></p>`;
            } else {
                PointsText.innerHTML += `<p>0</p>`;
            }
        } catch (error) {
            console.error("Erreur lors de la récupération des points :", error);
            document.querySelector("#points").innerHTML += `<p>Impossible de charger les points.</p>`;
        }
    }

    /**
     * Récupère et affiche les 3 derniers matchs
     */
    async function fetchLastThreeMatches() {
        try {
            const response = await fetch(`${baseUrl}last-matches?numMatches=3`);
            if (!response.ok) {
                throw new Error(`Erreur HTTP! statut: ${response.status}`);
            }
            const responseData = await response.json();
            const data = responseData.data;
            if (!Array.isArray(data)) throw new Error("Les données retournées ne sont pas un tableau");

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

    /**
     * Récupère et affiche le pourcentage de victoires
     */
    async function fetchWinRate() {
        try {
            const response = await fetch(`${baseUrl}win-rate`);
            if (!response.ok) {
                throw new Error(`Erreur HTTP! statut: ${response.status}`);
            }
            const responseData = await response.json();
            const PointsText = document.querySelector("#victories");

            if (responseData.data) {
                PointsText.innerHTML += `<strong>${responseData.data.toFixed(1)}%</strong>`;
            } else {
                PointsText.innerHTML += `<p>0</p>`;
            }
        } catch (error) {
            console.error("Erreur lors de la récupération des victoires :", error);
            document.querySelector("#victories").innerHTML += `<p>Impossible de charger les victoires.</p>`;
        }
    }

    /**
     * Récupère et affiche le nombre de matchs joués
     */
    async function fetchMatchesPlayed() {
        try {
            const response = await fetch(`${baseUrl}matches-played`);
            if (!response.ok) {
                throw new Error(`Erreur HTTP! statut: ${response.status}`);
            }
            const responseData = await response.json();
            const PointsText = document.querySelector("#NbMatchs");

            if (responseData.data) {
                PointsText.innerHTML += `<strong>${responseData.data}</strong>`;
            } else {
                PointsText.innerHTML += `<p>0</p>`;
            }
        } catch (error) {
            console.error("Erreur lors de la récupération le NbMatchs :", error);
            document.querySelector("#NbMatchs").innerHTML += `<p>Impossible de charger le NbMatchs.</p>`;
        }
    }

    /**
     * Récupère et affiche le nombre de matchs gagnés
     */
    async function fetchMatchesWon() {
        try {
            const response = await fetch(`${baseUrl}count-matches-won`);
            if (!response.ok) {
                throw new Error(`Erreur HTTP! statut: ${response.status}`);
            }
            const responseData = await response.json();
            const PointsText = document.querySelector("#NbGagnés");

            if (responseData.data) {
                PointsText.innerHTML += `<strong>${responseData.data}</strong>`;
            } else {
                PointsText.innerHTML += `<p>0</p>`;
            }
        } catch (error) {
            console.error("Erreur lors de la récupération de NbGagnés :", error);
            document.querySelector("#NbGagnés").innerHTML += `<p>Impossible de charger le NbGagnés.</p>`;
        }
    }

    /**
     * Récupère et affiche le nombre de buts marqués
     */
    async function fetchGoalsScored() {
        try {
            const response = await fetch(`${baseUrl}goals-scored`);
            if (!response.ok) {
                throw new Error(`Erreur HTTP! statut: ${response.status}`);
            }
            const responseData = await response.json();
            const PointsText = document.querySelector("#ButsM");

            if (responseData.data) {
                PointsText.innerHTML += `<strong>${responseData.data}</strong>`;
            } else {
                PointsText.innerHTML += `<p>0</p>`;
            }
        } catch (error) {
            console.error("Erreur lors de la récupération de ButsM :", error);
            document.querySelector("#ButsM").innerHTML += `<p>Impossible de charger le ButsM.</p>`;
        }
    }

    /**
     * Récupère et affiche le nombre de buts concédés
     */
    async function fetchGoalsConceded() {
        try {
            const response = await fetch(`${baseUrl}goals-conceded`);
            if (!response.ok) {
                throw new Error(`Erreur HTTP! statut: ${response.status}`);
            }
            const responseData = await response.json();
            const PointsText = document.querySelector("#ButsS");

            if (responseData.data) {
                PointsText.innerHTML += `<strong>${responseData.data}</strong>`;
            } else {
                PointsText.innerHTML += `<p>0</p>`;
            }
        } catch (error) {
            console.error("Erreur lors de la récupération de ButsS :", error);
            document.querySelector("#ButsS").innerHTML += `<p>Impossible de charger le ButsS.</p>`;
        }
    }

    /**
     * Récupère et affiche les buts par match
     */
    async function fetchGoalsPerGame() {
        try {
            const response = await fetch(`${baseUrl}goals-per-game`);
            if (!response.ok) {
                throw new Error(`Erreur HTTP! statut: ${response.status}`);
            }
            const responseData = await response.json();
            const PointsText = document.querySelector("#ButsPm");

            if (responseData.data) {
                PointsText.innerHTML += `<strong>${responseData.data.toFixed(1)}</strong>`;
            } else {
                PointsText.innerHTML += `<p>0</p>`;
            }
        } catch (error) {
            console.error("Erreur lors de la récupération de ButsPm :", error);
            document.querySelector("#ButsPm").innerHTML += `<p>Impossible de charger le ButsPm.</p>`;
        }
    }

    /**
     * Récupère et affiche le nombre de clean sheets
     */
    async function fetchCleanSheets() {
        try {
            const response = await fetch(`${baseUrl}clean-sheets`);
            if (!response.ok) {
                throw new Error(`Erreur HTTP! statut: ${response.status}`);
            }
            const responseData = await response.json();
            const PointsText = document.querySelector("#Cs");

            if (responseData.data) {
                PointsText.innerHTML += `<strong>${responseData.data}</strong>`;
            } else {
                PointsText.innerHTML += `<p>0</p>`;
            }
        } catch (error) {
            console.error("Erreur lors de la récupération de Cs :", error);
            document.querySelector("#Cs").innerHTML += `<p>Impossible de charger les cleanSheets.</p>`;
        }
    }

    /**
     * Récupère et affiche la différence de buts
     */
    async function fetchGoalsDifference() {
        try {
            const response = await fetch(`${baseUrl}goals-diff`);
            if (!response.ok) {
                throw new Error(`Erreur HTTP! statut: ${response.status}`);
            }
            const responseData = await response.json();
            const PointsText = document.querySelector("#Db");

            if (responseData.data) {
                PointsText.innerHTML += `<strong>${responseData.data}</strong>`;
            } else {
                PointsText.innerHTML += `<p>0</p>`;
            }
        } catch (error) {
            console.error("Erreur lors de la récupération de Db :", error);
            document.querySelector("#Db").innerHTML += `<p>Impossible de charger le Db.</p>`;
        }
    }

    /**
     * Récupère et affiche la note de performance de l'équipe
     */
    async function fetchTeamPerformanceNote() {
        try {
            const response = await fetch(`${baseUrl}team-performance-note`);
            if (!response.ok) {
                throw new Error(`Erreur HTTP! statut: ${response.status}`);
            }
            const responseData = await response.json();
            const PointsText = document.querySelector("#PerformanceEquipe");

            if (responseData.data) {
                PointsText.innerHTML += `<strong>${responseData.data.toFixed(1)}</strong>`;
            } else {
                PointsText.innerHTML += `<p>0</p>`;
            }
        } catch (error) {
            console.error("Erreur lors de la récupération de PerformanceEquipe :", error);
            document.querySelector("#PerformanceEquipe").innerHTML += `<p>Impossible de charger le PerformanceEquipe.</p>`;
        }
    }

    /**
     * Récupère et affiche la moyenne des notes de l'équipe
     */
    async function fetchTeamAverageNote() {
        try {
            const response = await fetch(`${baseUrl}team-average-note`);
            if (!response.ok) {
                throw new Error(`Erreur HTTP! statut: ${response.status}`);
            }
            const responseData = await response.json();
            const PointsText = document.querySelector("#MoyenneNotes");

            if (responseData.data) {
                PointsText.innerHTML += `<strong>${parseFloat(responseData.data).toFixed(1)}</strong>`;
            } else {
                PointsText.innerHTML += `0`;
            }
        } catch (error) {
            console.error("Erreur lors de la récupération de MoyenneNotes :", error);
            document.querySelector("#MoyenneNotes").innerHTML += `<p>Impossible de charger le MoyenneNotes.</p>`;
        }
    }

    /**
     * Récupère et affiche le meilleur joueur
     */
    async function fetchBestPlayer() {
        try {
            const response = await fetch(`${baseUrl}best-player`);
            if (!response.ok) throw new Error(`Erreur HTTP! statut: ${response.status}`);
            const responseData = await response.json();
            const PointsText = document.querySelector("#test");
            const MoyenneNote = document.querySelector("#BestPlayerMoyenne");
            const PlayerImg = document.querySelector("#BestPlayerImg");

            if (responseData.data) {
                const { Nom_Joueur, moyenneNotes, Image } = responseData.data;
                PointsText.innerHTML += `<strong>${Nom_Joueur}</strong>`;
                MoyenneNote.innerHTML += `<strong>${parseFloat(moyenneNotes).toFixed(1)}</strong>`;
                PlayerImg.src = `../assets/data-player/${Image}`;
                PlayerImg.alt = `Photo de ${Nom_Joueur}`;
            } else {
                PointsText.innerHTML += `0`;
                MoyenneNote.innerHTML += `0`;
                PlayerImg.src = "";
                PlayerImg.alt = "Aucune image disponible";
            }
        } catch (error) {
            console.error("Erreur lors de la récupération de MoyenneNotes :", error);
            document.querySelector(".BestPlayer").innerHTML += `<p>Impossible de charger le MoyenneNotes.</p>`;
        }
    }

    // Appel aux fonctions
    await fetchLastMatches();
    await fetchBestPlayer();
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
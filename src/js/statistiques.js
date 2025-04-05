document.addEventListener("DOMContentLoaded", async () => {

    // Configuration API globale
    const API_CONFIG = {
        baseUrl: '/R4.01/gestionequipesport-api/api/stats/',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
    };

    /**
     * Fonction générique pour effectuer les appels API
     * @param {string} endpoint - Point de terminaison de l'API
     * @returns {Promise<Object>} Données de la réponse
     */
    async function fetchApi(endpoint) {
        try {
            const response = await fetch(`${API_CONFIG.baseUrl}${endpoint}`, {
                headers: API_CONFIG.headers
            });

            if (!response.ok) {
                if (response.status === 401) {
                    window.location.href = '/R4.01/gestionequipesport-interface/src/views/login.php';
                    return { data: null };
                }
                throw new Error(`Erreur HTTP! statut: ${response.status}`);
            }

            const { response: { data } } = await response.json();
            return { data };
        } catch (error) {
            console.error(`Erreur lors de la récupération de ${endpoint}:`, error);
            throw error;
        }
    }

    /**
     * Récupère et affiche les statistiques des matchs
     */
    async function fetchStatsMatchs() {
        try {
            const { data } = await fetchApi('match');

            const cardNextMatch = document.querySelector("#matchs-stats");

            if (data) {
                const { total, won, lost, draw, wonPercentage, lostPercentage, drawPercentage } = data;
                cardNextMatch.innerHTML += `
                    <div class="statistiques-card">
                        <i class="fas fa-futbol"></i>
                        <div>
                            <h3>Total de matchs</h3>
                            <p>${total}</p>
                        </div>
                    </div>
                    <div class="statistiques-card">
                        <i class="fas fa-trophy"></i>
                        <div>
                            <h3>Matchs gagnés</h3>
                            <p>${won} (${wonPercentage.toFixed(1)}%)</p>
                        </div>
                    </div>
                    <div class="statistiques-card">
                        <i class="fas fa-handshake"></i>
                        <div>
                            <h3>Matchs nuls</h3>
                            <p>${draw} (${drawPercentage.toFixed(1)}%)</p>
                        </div>
                    </div>
                    <div class="statistiques-card">
                        <i class="fas fa-times"></i>
                        <div>
                            <h3>Matchs perdus</h3>
                            <p>${lost} (${lostPercentage.toFixed(1)}%)</p>
                        </div>
                    </div>
                `;
            } else {
                cardNextMatch.innerHTML += `<p>Pas de stats.</p>`;
            }
        } catch (error) {
            console.error("Erreur lors de la récupération de matchStats :", error);
            document.querySelector("#matchs-stats").innerHTML += `<p>Impossible de charger les stats.</p>`;
        }
    }

    /**
    * Récupère et affiche les statistiques des jouers
    */
    async function fetchStatsJouers() {
        try {
            const { data } = await fetchApi('player');

            const cardNextMatch = document.querySelector("#player-stats");

            if (data && data.length > 0) {
                let rows = await Promise.all(data.map(async (player) => {
                    // Récupérer les sélections consécutives pour chaque joueur
                    let consecutiveSelections = await fetchConsecutiveSelections(player.id);

                    return `
                        <tr>
                            <td>${player.surname} ${player.name}</td>
                            <td>${player.status}</td>
                            <td>${player.preferredPosition}</td>
                            <td>${player.titularMatches}</td>
                            <td>${player.substituteMatches}</td>
                            <td>${player.avgRating ? parseFloat(player.avgRating).toFixed(1) : "N/A"}</td>
                            <td>${parseFloat(player.winRate).toFixed(1)}%</td>
                            <td>${consecutiveSelections}</td>
                        </tr>
                    `;
                }));

                cardNextMatch.innerHTML = rows.join("");
            } else {
                cardNextMatch.innerHTML = `<p>Aucune stat.</p>`;
            }
        } catch (error) {
            console.error("Erreur lors de la récupération des stats joueurs :", error);
            document.querySelector("#player-stats").innerHTML = `<p>Impossible de charger les stats.</p>`;
        }
    }

    // Fonction pour récupérer les sélections consécutives d'un joueur
    async function fetchConsecutiveSelections(playerId) {
        try {
            const response = await fetch(`${API_CONFIG.baseUrl}consecutive-selections`, {
                method: "POST",
                headers: API_CONFIG.headers,
                body: JSON.stringify({ playerId: playerId })
            });

            if (!response.ok) {
                throw new Error(`Erreur HTTP! statut: ${response.status}`);
            }

            const data = await response.json();
            return data.data ?? "N/A"; // Retourne la valeur ou "N/A" si elle est absente
        } catch (error) {
            console.error(`Erreur pour récupérer les sélections du joueur ${playerId} :`, error);
            return "Erreur";
        }
    }

    // Appel aux fonctions
    await fetchStatsMatchs();
    await fetchStatsJouers();
});
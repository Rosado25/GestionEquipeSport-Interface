document.addEventListener("DOMContentLoaded", async () => {

    // Configuration API globale
    const API_CONFIG = {
        baseUrl: '/R4.01/gestionequipesport-api/api/matches/',
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

    const tableBody = document.querySelector("tbody");
    // Event listener pour le match sheet;
    tableBody.addEventListener("click", (event) => {
        const row = event.target.closest(".match-row");
        const isActionButton = event.target.closest(".actionsbtn, .edit-btn, .delete-btn");

        if (row && !isActionButton) {
            const matchId = row.dataset.matchId;
            window.location.href = `Match_Sheet.php?id=${matchId}`;
        }
    });
    let ListeMatch = [];

    /**
     * Add un match
     */
    async function addMatch(Data) {
        try {
            const response = await fetch(`${API_CONFIG.baseUrl}match`, {
                method: "POST",
                headers: API_CONFIG.headers,
                body: JSON.stringify(Data)
            });
            return response;
        } catch (error) {
            console.error("Erreur lors de l'ajout du match:", error);
        }
    }

    // Event listener pour add un match;
    const form = document.querySelector(".form-group");
    form.addEventListener("submit", async (event) => {
        event.preventDefault(); // Empêche la soumission classique

        const matchData = {
            Date: document.getElementById("date").value,
            Adversaire: document.getElementById("adversaire").value,
            Lieu: document.getElementById("lieu").value
        };

        const response = await addMatch(matchData);
        if (response && response.ok) {
            alert("Match ajouté avec succès !");
            getAllMatch(); // Rafraîchir la liste des matchs
            form.reset(); // Réinitialiser le formulaire
        } else {
            alert("Erreur lors de l'ajout du match.");
        }
    });

    /**
     * Delete un match
     */
    async function deleteMatch(matchId) {
        try {
            const response = await fetch(`${API_CONFIG.baseUrl}match`, {
                method: "DELETE",
                headers: API_CONFIG.headers,
                body: JSON.stringify({ Id_Match_Foot: matchId })
            });

            const result = JSON.parse(text);

            if (result.response.status == 200) {
                alert("Match supprimé avec succès !");
                getAllMatch(); // Recharge la liste après suppression
            } else {
                alert("Échec de la suppression!");
                console.error("Échec de la suppression :", result);
            }
        } catch (error) {
            console.error("Erreur lors de la suppression du match:", error);
        }
    }

    // Event listener pour suprimmer un match;
    document.addEventListener("click", async (event) => {
        const deleteBtn = event.target.closest(".delete-btn");
        if (deleteBtn) {
            event.stopPropagation(); // Empêche le déclenchement du clic sur la ligne
            event.preventDefault(); // Empêche les comportements par défaut (optionnel)

            const matchId = deleteBtn.dataset.matchId;

            if (!matchId) {
                console.error("ID de match non trouvé !");
                return;
            }

            const confirmDelete = confirm("Êtes-vous sûr de vouloir supprimer ce match ?");
            if (confirmDelete) {
                await deleteMatch(matchId);
            }
        }
    });

    /**
     * Edit un match
     */
    async function updateMatch(matchData) {
        try {

            const response = await fetch(`${API_CONFIG.baseUrl}match`, {
                method: "PUT",
                headers: API_CONFIG.headers,
                body: JSON.stringify(matchData)
            });

            return response;
        } catch (error) {
            console.error("Erreur lors de la mise à jour du match:", error);
        }
    }

    // Event listener pour editer un match;
    const editMatch = document.querySelector(".edit-match");
    editMatch.addEventListener("click", async (event) => {
        event.preventDefault();

        const matchData = {
            Id_Match_Foot: editMatchId.value,
            date_heure: editDate.value,
            Adversaire: editAdversaire.value,
            lieu: editLieu.value,
            résultat: editScore.value
        };

        const response = await updateMatch(matchData);
        if (response && response.ok) {
            alert("Match mis à jour avec succès !");
            closePopup();
            getAllMatch(); // Rafraîchir la liste des matchs
        } else {
            alert("Erreur lors de la mise à jour du match.");
        }
    });

    /**
     * Récupère et affiche la liste des matchs
     */
    async function getAllMatch() {
        try {
            const { data } = await fetchApi('matches');

            if (!data || !Array.isArray(data)) {
                console.error("Format inattendu des données reçues:", data);
                return;
            }

            ListeMatch = data;

            if (ListeMatch.length === 0) {
                tableBody.innerHTML = `<tr><td colspan="6">Aucun match trouvé.</td></tr>`;
                return;
            }

            tableBody.innerHTML = ListeMatch.map(match => `
           <tr class="match-row" data-match-id="${match.Id_Match_Foot}" style="cursor: pointer;">
                <td>${match.date_heure && match.date_heure !== "0000-00-00 00:00:00"
                    ? new Date(match.date_heure).toLocaleString("fr-FR")
                    : "Non défini"}</td>
                <td>Abdel FC</td>
                <td>${match.Adversaire || "Non défini"}</td>
                <td>${match.lieu || "Non défini"}</td>
                <td>
                    <span style="color: ${match.résultat ? 'limegreen' : 'gray'};">
                        ${match.résultat || 'NA'}
                    </span>
                </td>
                <td>
                    <div class="actionsbtn">
                        <button class="btn yellow-btn edit-btn" onclick="event.stopPropagation(); openEditPopup(${match.Id_Match_Foot})">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn red-btn delete-btn" data-match-id="${match.Id_Match_Foot}">
                            <i class="fas fa-trash-alt"></i>
                        </button>
                    </div>
                </td>
            </tr>
`).join("");
        } catch (error) {
            console.error("Erreur:", error);
        }
    }

    /**
     * Pop-up
     */
    const editPopup = document.getElementById("editPopup");
    const editMatchId = document.getElementById("editMatchId");
    const editDate = document.getElementById("editDate");
    const editAdversaire = document.getElementById("editAdversaire");
    const editLieu = document.getElementById("editLieu");
    const editScore = document.getElementById("editScore");
    const closeBtn = document.querySelector(".close-btn");

    window.openEditPopup = function (matchId) {
        const match = ListeMatch.find(m => m.Id_Match_Foot === matchId);
        if (!match) {
            console.error("Match non trouvé !");
            return;
        }

        // Convertir la date du match
        const now = new Date();
        const matchDate = new Date(match.date_heure);
        const matchPasse = matchDate < now; // True si le match est passé

        // Remplir les champs
        editMatchId.value = match.Id_Match_Foot;
        editDate.value = match.date_heure && match.date_heure !== "0000-00-00 00:00:00"
            ? matchDate.toISOString().slice(0, 16)
            : "";
        editAdversaire.value = match.Adversaire || "";
        editLieu.value = match.lieu || "Domicile";
        editScore.value = match.résultat || "";

        // Gérer la désactivation des champs
        editDate.disabled = matchPasse;
        editAdversaire.disabled = matchPasse;
        editLieu.disabled = matchPasse;
        editScore.disabled = !matchPasse; // Résultat modifiable seulement après le match

        // Afficher le pop-up
        editPopup.style.display = "flex";
    };

    function closePopup() {
        editPopup.style.display = "none";
    }

    closeBtn.addEventListener("click", closePopup);


    /**
     * Récupère et affiche le numero de matchs joueés
     */
    async function fetchMatchesPlayed() {
        try {
            const { data } = await fetchApi('played');

            const PointsText = document.querySelector("#NbMtc");

            if (data) {
                PointsText.innerHTML += `<strong>${data} Matchs</strong>`;
            } else {
                PointsText.innerHTML += `<p>0 Matchs</p>`;
            }
        } catch (error) {
            console.error("Erreur lors de la récupération le NbMatchs :", error);
            document.querySelector("#NbMtc").innerHTML += `<p>Impossible de charger le NbMatchs.</p>`;
        }
    }

    /**
     * Récupère et affiche le numero de victoires
     */
    async function fetchVictoires() {
        try {
            const { data } = await fetchApi('won');

            const PointsText = document.querySelector("#NbVic");

            if (data) {
                PointsText.innerHTML += `<strong>${data} Victoires </strong>`;
            } else {
                PointsText.innerHTML += `<p>0 Victoires</p>`;
            }
        } catch (error) {
            console.error("Erreur lors de la récupération le NbVictoires :", error);
            document.querySelector("#NbVic").innerHTML += `<p>Impossible de charger le NbVictoires.</p>`;
        }
    }

    /**
     * Récupère et affiche le numero de jouers disponibles
     */
    async function fetchNbJouers() {
        try {
            //utilise une autre api differente que celui de base pour match.js
            const response = await fetch(`/R4.01/gestionequipesport-api/api/player/player-count`, {
                headers: API_CONFIG.headers
            });
            if (!response.ok) {
                throw new Error(`Erreur HTTP! statut: ${response.status}`);
            }
            const responseData = await response.json();
            const PointsText = document.querySelector("#NbJrs");

            if (responseData.response && responseData.response.data != null) {
                PointsText.innerHTML += `<strong>${responseData.response.data} Jouers</strong>`;
            } else {
                PointsText.innerHTML += `<strong>0 Jouers</strong>`;
            }
        } catch (error) {
            console.error("Erreur lors de la récupération de numero jouers :", error);
            document.querySelector("#NbJrs").innerHTML += `<p>Impossible de charger le numero de jouers.</p>`;
        }
    }

    // Appel aux fonctions
    await getAllMatch();
    await fetchMatchesPlayed();
    await fetchVictoires();
    await fetchNbJouers();
});

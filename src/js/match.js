class MatchManager {
    /**
     * Constructeur de la classe MatchManager
     */
    constructor() {
        this.API_CONFIG = {
            baseUrl: '/R4.01/gestionequipesport-api/api/matches/',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        };
        this.ListeMatch = [];
        this.elements = {
            tableBody: document.querySelector("tbody"),
            form: document.querySelector(".form-group"),
            editPopup: document.getElementById("editPopup"),
            editMatchId: document.getElementById("editMatchId"),
            editDate: document.getElementById("editDate"),
            editAdversaire: document.getElementById("editAdversaire"),
            editLieu: document.getElementById("editLieu"),
            editScore: document.getElementById("editScore"),
            closeBtn: document.querySelector(".close-btn"),
            editMatch: document.querySelector(".edit-match")
        };

        this.Toast = Swal.mixin({
            toast: true,
            position: 'top-end',
            showConfirmButton: false,
            timer: 3000,
            timerProgressBar: true
        });

        this.init();
    }

    /**
     * Initialisation de la classe MatchManager
     */
    init() {
        this.setupEventListeners();
        this.loadInitialData();
    }

    /**
     * Configure les écouteurs d'événements
     */
    setupEventListeners() {
        this.elements.tableBody?.addEventListener("click", (event) => {
            const row = event.target.closest(".match-row");
            const isActionButton = event.target.closest(".actionsbtn, .edit-btn, .delete-btn");

            if (row && !isActionButton) {
                const matchId = row.dataset.matchId;
                window.location.href = `Match_Sheet.php?id=${matchId}`;
            }
        });
        this.elements.form?.addEventListener("submit", async (event) => {
            event.preventDefault();
            const matchData = {
                Date: document.getElementById("date").value,
                Adversaire: document.getElementById("adversaire").value,
                Lieu: document.getElementById("lieu").value
            };
            await this.handleAddMatch(matchData);
        });
        /**
         * Listener pour le bouton de suppression
         */
        document.addEventListener("click", async (event) => {
            const deleteBtn = event.target.closest(".delete-btn");
            if (deleteBtn) {
                event.stopPropagation();
                event.preventDefault();
                const matchId = deleteBtn.dataset.matchId;
                if (matchId) {
                    await this.handleDeleteMatch(matchId);
                }
            }
        });

        /**
         * Listener pour le bouton de mise à jour
         */
        this.elements.editMatch?.addEventListener("click", async (event) => {
            event.preventDefault();
            const matchData = {
                Id_Match_Foot: this.elements.editMatchId.value,
                date_heure: this.elements.editDate.value,
                Adversaire: this.elements.editAdversaire.value,
                lieu: this.elements.editLieu.value,
                résultat: this.elements.editScore.value
            };
            await this.handleUpdateMatch(matchData);
        });

        this.elements.closeBtn?.addEventListener("click", () => this.closePopup());
        window.openEditPopup = (matchId) => this.openEditPopup(matchId);
    }

    /**
     * Charge les données initiales
     * @returns {Promise<void>}
     */
    async loadInitialData() {
        try {
            await Promise.all([
                this.getAllMatch(),
                this.fetchMatchesPlayed(),
                this.fetchVictoires(),
                this.fetchNbJouers()
            ]);
        } catch (error) {
            this.showError('Erreur lors du chargement des données');
        }
    }

    showLoader() {
        return Swal.fire({
            title: 'Chargement...',
            allowOutsideClick: false,
            didOpen: () => Swal.showLoading()
        });
    }

    showSuccess(message) {
        return this.Toast.fire({ icon: 'success', title: message });
    }

    showError(message) {
        return Swal.fire({ icon: 'error', title: 'Erreur', text: message });
    }

    /**
     * Récupère les données de l'API
     * @param endpoint
     * @param options
     * @returns {Promise<{data: *}|{data: null}>}
     */
    async fetchApi(endpoint, options = {}) {
        try {
            const response = await fetch(`${this.API_CONFIG.baseUrl}${endpoint}`, {
                headers: this.API_CONFIG.headers,
                ...options
            });

            if (!response.ok) {
                if (response.status === 401) {
                    window.location.href = '/R4.01/gestionequipesport-interface/src/views/login.php';
                    return { data: null };
                }
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const { response: { data } } = await response.json();
            return { data };
        } catch (error) {
            console.error(`Erreur lors de la récupération de ${endpoint}:`, error);
            throw error;
        }
    }

    /**
     * Ajoute un match
     * @param matchData
     * @returns {Promise<void>}
     */
    async handleAddMatch(matchData) {
        try {
            this.showLoader();
            const response = await this.fetchApi('match', {
                method: 'POST',
                body: JSON.stringify(matchData)
            });

            if (response) {
                this.showSuccess('Match ajouté avec succès !');
                await this.getAllMatch();
                this.elements.form.reset();
            } else {
                this.showError('Erreur lors de l\'ajout du match');
            }
        } catch (error) {
            this.showError('Erreur lors de l\'ajout du match');
        }
    }

    /**
     * Supprime un match
     * @param matchId
     * @returns {Promise<void>}
     */
    async handleDeleteMatch(matchId) {
        const match = this.ListeMatch.find(m => m.Id_Match_Foot === parseInt(matchId));
        if (!match) {
            this.showError('Match non trouvé');
            return;
        }

        const matchDate = new Date(match.date_heure);
        const now = new Date();

        if (matchDate < now || match.résultat) {
            this.showError('Impossible de supprimer un match passé ou déjà joué');
            return;
        }

        const result = await Swal.fire({
            title: 'Êtes-vous sûr ?',
            text: "Cette action est irréversible !",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Oui, supprimer',
            cancelButtonText: 'Annuler'
        });

        if (result.isConfirmed) {
            await this.deleteMatch(matchId);
        }
    }

    /**
     * Supprime un match
     * @param matchId
     * @returns {Promise<void>}
     */
    async deleteMatch(matchId) {
        try {
            this.showLoader();
            const response = await this.fetchApi('match', {
                method: 'DELETE',
                body: JSON.stringify({ Id_Match_Foot: matchId })
            });

            if (response) {
                this.showSuccess('Match supprimé avec succès !');
                await this.getAllMatch();
            } else {
                this.showError('Échec de la suppression');
            }
        } catch (error) {
            this.showError('Erreur lors de la suppression du match');
        }
    }

    /**
     * Met à jour un match
     * @param matchData
     * @returns {Promise<void>}
     */
    async handleUpdateMatch(matchData) {
        try {
            const response = await this.fetchApi('match', {
                method: 'PUT',
                body: JSON.stringify(matchData)
            });

            if (response) {
                this.showSuccess('Match mis à jour avec succès !');
                this.closePopup();
                await this.getAllMatch();
            } else {
                this.showError('Erreur lors de la mise à jour du match');
            }
        } catch (error) {
            this.showError('Erreur lors de la mise à jour du match');
        }
    }

    /**
     * Récupère tous les matchs
     * @returns {Promise<void>}
     */
    async getAllMatch() {
        try {
            const { data } = await this.fetchApi('matches');
            this.ListeMatch = data || [];
            this.renderMatchList();
        } catch (error) {
            this.showError('Erreur lors du chargement des matchs');
        }
    }

    /**
     * Rend la liste des matchs dans le tableau
     */
    renderMatchList() {
        if (!this.elements.tableBody) return;

        if (this.ListeMatch.length === 0) {
            this.elements.tableBody.innerHTML = `<tr><td colspan="6">Aucun match trouvé.</td></tr>`;
            return;
        }

        this.elements.tableBody.innerHTML = this.ListeMatch.map(match => this.createMatchRow(match)).join("");
    }

    /**
     * Crée une ligne de match pour le tableau
     * @param match
     * @returns {string}
     */
    createMatchRow(match) {
        return `
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
        `;
    }

    /**
     * Ouvre la popup d'édition
     * @param matchId
     */
    openEditPopup(matchId) {
        const match = this.ListeMatch.find(m => m.Id_Match_Foot === matchId);
        if (!match) {
            console.error("Match non trouvé !");
            return;
        }

        const now = new Date();
        const matchDate = new Date(match.date_heure);
        const matchPasse = matchDate > now;

        this.elements.editMatchId.value = match.Id_Match_Foot;
        this.elements.editDate.value = match.date_heure && match.date_heure !== "0000-00-00 00:00:00"
            ? matchDate.toISOString().slice(0, 16)
            : "";
        this.elements.editAdversaire.value = match.Adversaire || "";
        this.elements.editLieu.value = match.lieu || "Domicile";
        this.elements.editScore.value = match.résultat || "";

        this.elements.editDate.disabled = matchPasse;
        this.elements.editAdversaire.disabled = matchPasse;
        this.elements.editLieu.disabled = matchPasse;
        this.elements.editScore.disabled = !matchPasse;

        this.elements.editPopup.style.display = "flex";
    }

    closePopup() {
        this.elements.editPopup.style.display = "none";
    }

    /**
     * Récupère le nombre de matchs joués
     * @returns {Promise<void>}
     */
    async fetchMatchesPlayed() {
        try {
            const { data } = await this.fetchApi('played');
            const element = document.querySelector("#NbMtc");
            if (element) {
                element.innerHTML += `<strong>${data || 0} Matchs</strong>`;
            }
        } catch (error) {
            console.error("Erreur lors de la récupération des matchs joués:", error);
        }
    }

    /**
     * Récupère le nombre de victoires
     * @returns {Promise<void>}
     */
    async fetchVictoires() {
        try {
            const { data } = await this.fetchApi('won');
            const element = document.querySelector("#NbVic");
            if (element) {
                element.innerHTML += `<strong>${data || 0} Victoires</strong>`;
            }
        } catch (error) {
            console.error("Erreur lors de la récupération des victoires:", error);
        }
    }

    /**
     * Récupère le nombre de joueurs
     * @returns {Promise<void>}
     */
    async fetchNbJouers() {
        try {
            const response = await fetch('/R4.01/gestionequipesport-api/api/player/player-count', {
                headers: this.API_CONFIG.headers
            });
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

            const responseData = await response.json();
            const element = document.querySelector("#NbJrs");
            if (element) {
                element.innerHTML += `<strong>${responseData.response?.data || 0} Joueurs</strong>`;
            }
        } catch (error) {
            console.error("Erreur lors de la récupération du nombre de joueurs:", error);
        }
    }
}

// Initialisation
document.addEventListener('DOMContentLoaded', () => {
    new MatchManager();
});
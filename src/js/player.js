const API_CONFIG = {
    baseUrl: 'https://equipesportapi.alwaysdata.net/api/',
    imagesPath: '../assets/data-player',
    headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
    }
};

const elements = {
    addPlayerForm: document.getElementById('add-player-form'),
    profilePopup: document.getElementById('profilePopup'),
    popupBody: document.getElementById('popup-body'),
    searchForm: document.getElementById('search-form'),
    editForm: document.getElementById('edit-form'),
    closeButton: document.querySelector('.popup .close'),
    playerList: document.querySelector('.joueur-cards')
};


/**
 * Fonction générique pour effectuer les appels API
 * @param {string} endpoint - Point de terminaison de l'API
 * @param {Object} options - Options de la requête (method, body, etc.)
 * @returns {Promise<Response>} Réponse de l'API
 */
async function fetchApi(endpoint, options = {}) {
    const url = `${API_CONFIG.baseUrl}${endpoint}`;
    try {
        const response = await fetch(url, {
            headers: API_CONFIG.headers,
            ...options
        });

        if (!response.ok) {
            if (response.status === 401) {
                window.location.href = '/src/views/login.php';
                return;
            }
            throw new Error(`Erreur HTTP! statut: ${response.status}`);
        }

        const jsonData = await response.json();
        return { data: jsonData.response?.data || jsonData };
    } catch (error) {
        console.error(`Erreur lors de la récupération de ${endpoint}:`, error);
        throw error;
    }
}

// Configuration des notifications
const Toast = Swal.mixin({
    toast: true,
    position: 'top-end',
    showConfirmButton: false,
    timer: 3000,
    timerProgressBar: true
});

const showLoader = () => {
    Swal.fire({
        title: 'Chargement...',
        allowOutsideClick: false,
        didOpen: () => Swal.showLoading()
    });
};

const showSuccess = (message) => Toast.fire({
    icon: 'success',
    title: message
});

const showError = (message) => Swal.fire({
    icon: 'error',
    title: 'Erreur',
    text: message
});

/**
 *  permet de rechercher un joueur
 * @param event
 * @returns {Promise<void>}
 */
const searchPlayers = async (event) => {
    event.preventDefault();
    const searchTerm = document.getElementById('search-bar').value;

    try {
        showLoader();
        const { data } = await fetchApi(`players/search?search=${encodeURIComponent(searchTerm)}`);
        displayPlayers(data);
        Swal.close();
    } catch (error) {
        console.error('Search error:', error);
        showError('Impossible de rechercher les joueurs');
    }
};
/**
 * Ajoute un joueur
 * @param event
 * @returns {Promise<void>}
 */
const addPlayer = async (event) => {
    event.preventDefault();
    const formData = new FormData(event.target);

    try {
        showLoader();
        const response = await fetch(`${API_CONFIG.baseUrl}player`, {
            method: 'POST',
            body: formData,
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });

        if (!response.ok) {
            if (response.status === 401) {
                window.location.href = '/R4.01/gestionequipesport-interface/src/views/login.php';
                return;
            }
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        showSuccess('Joueur ajouté avec succès');
        event.target.reset();
        document.querySelector('.add-player-section').style.display = 'none';
        await fetchAllPlayers();
    } catch (error) {
        console.error('Add player error:', error);
        if (error.message.includes('401')) {
            window.location.href = '/R4.01/gestionequipesport-interface/src/views/login.php';
            return;
        }
        showError('Erreur lors de l\'ajout du joueur');
    }
};
/**
 * Supprime un joueur
 * @param playerId
 * @returns {Promise<void>}
 */
const deletePlayer = async (playerId) => {
    try {
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
            showLoader();

            const response = await fetchApi('player', {
                method: 'DELETE',
                body: JSON.stringify({ id: playerId })
            });

            await Swal.fire({
                title: 'Succès !',
                text: 'Le joueur a été supprimé avec succès',
                icon: 'success',
                timer: 2000,
                showConfirmButton: false
            });

            document.getElementById('profilePopup').style.display = 'none';
            await fetchAllPlayers();

            // Notification toast de confirmation
            Toast.fire({
                icon: 'success',
                title: 'Joueur supprimé de la base de données'
            });
        }
    } catch (error) {
        console.error('Erreur de suppression:', error);
        Swal.fire({
            title: 'Erreur',
            text: 'Impossible de supprimer le joueur: ' + error.message,
            icon: 'error'
        });
    }
};
/**
 * Met à jour un joueur
 * @param event
 * @returns {Promise<void>}
 */
const updatePlayer = async (event) => {
    event.preventDefault();
    const formData = new FormData(event.target);
    const data = Object.fromEntries(formData.entries());

    try {
        showLoader();
        await fetchApi('player', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                ...API_CONFIG.headers
            },
            body: JSON.stringify({
                id: parseInt(data.id_joueur),
                name: data.Nom,
                firstName: data.Prenom,
                birthdate: data.date_naissance_,
                height: parseInt(data.Taille),
                weight: parseInt(data.Poids),
                statut: data.Statut,
                role: data.Poste,
                comments: data.Notes_
            })
        });

        showSuccess('Joueur mis à jour avec succès');
        document.getElementById('edit-player-form').style.display = 'none';
        document.getElementById('profilePopup').style.display = 'none';
        await fetchAllPlayers();
    } catch (error) {
        console.error('Update error:', error);
        showError('Erreur lors de la mise à jour');
    }
};

// Fonctions d'affichage
const displayPlayers = (players) => {
    const playerList = document.querySelector('.joueur-cards');
    if (!playerList || !Array.isArray(players)) {
        showError("Erreur d'affichage des joueurs");
        return;
    }

    playerList.innerHTML = players.map(player => `
           <div class="joueur-card" data-id="${player.Id_Joueur}">
            <img src="../assets/data-player/${player.Image}" alt="Photo de ${player.Nom}">
            <p><strong>${player.Nom} ${player.Prenom}</strong></p>
            <p class="nblicense">${player.Numéro_license}</p>
            <p>${player.Poste}</p>
        </div>
    `).join('');

    playerList.querySelectorAll('.joueur-card').forEach(card => {
        card.addEventListener('click', () => openPlayerProfile(card.dataset.id));
    });
};

const toggleForm = (formSelector) => {
    const form = document.querySelector(formSelector);
    if (form) {
        form.style.display = form.style.display === 'none' ? 'block' : 'none';
    }
};

const toggleAddPlayerForm = () => toggleForm('.add-player-section');
const fetchAllPlayers = async () => {
    try {
        showLoader();
        const { data } = await fetchApi('player/players');
        displayPlayers(data);
        Swal.close();
    } catch (error) {
        console.error('Error fetching players:', error);
        showError('Impossible de charger les joueurs');
    }
};
// Fonctions de gestion des profils joueurs
const openPlayerProfile = async (playerId) => {
    try {
        showLoader();

        const [playerResponse, noteResponse] = await Promise.all([
            fetchApi(`player/?id=${playerId}`), // Added trailing slash
            fetchApi(`player/average-note?id=${playerId}`) // Added trailing slash
        ]);
        const playerData = playerResponse.data;
        let averageNote = noteResponse.data ? parseFloat(noteResponse.data.Moyenne_Note) : null;
        if (averageNote === null || isNaN(averageNote)) {
            averageNote = "Non Évalué";
        } else {
            averageNote = averageNote.toFixed(1);
        }

        if (!playerData) {
            throw new Error('No player data received');
        }

        // Calculate age and format birthdate
        const birthDate = new Date(playerData.date_naissance_);
        const age = Math.floor((new Date() - birthDate) / (365.25 * 24 * 60 * 60 * 1000));
        const formattedBirthDate = birthDate.toLocaleDateString('fr-FR');

        // Update profile popup content
        elements.popupBody.innerHTML = `
            <div class="profile-header">
                <img id="player-image" src="${playerData.Image ? '../assets/data-player/' + playerData.Image : '../assets/data-player/default.jpg'}"
                     alt="Photo de ${playerData.Prenom} ${playerData.Nom}">
                <div class="profile-info">
                    <h1 id="player-name">${playerData.Prenom} ${playerData.Nom}</h1>
                    <p><strong>Rôle:</strong> <span id="player-role">${playerData.Poste}</span></p>
                    <p><strong>Âge:</strong> <span id="player-age">${age} ans</span></p>
                </div>
            </div>
            <div class="bio">
                <h2>Information</h2>
                <details>
                    <summary>Voir les informations</summary>
                    <p><strong>Numéro de Licence:</strong> <span id="player-license">${playerData.Numéro_license}</span></p>
                    <p><strong>Date de Naissance:</strong> <span id="player-birthdate">${formattedBirthDate}</span></p>
                    <p><strong>Taille:</strong> <span id="player-height">${playerData.Taille} cm</span></p>
                    <p><strong>Poids:</strong> <span id="player-weight">${playerData.Poids} kg</span></p>
                    <p><strong>Statut:</strong> <span id="player-status">${playerData.Statut}</span></p>
                    <p><strong>Note Moyenne:</strong> <span id="player-note">${averageNote}</span></p>
                </details>
            </div>
            <div class="bio">
                <h2>Commentaires</h2>
                <p id="player-comments">${playerData.Notes_ || 'Aucun commentaire'}</p>
            </div>
            <div class="actions">
                <button type="button" class="btnmodifie" id="edit-player-btn">Modifier Joueur</button>
                <button type="button" class="btnSupprimer" id="delete-player-btn">Supprimer Joueur</button>
            </div>

            <form id="edit-player-form" class="edit-form" style="display: none;">
                <input type="hidden" id="edit-id" name="id_joueur" value="${playerData.Id_Joueur}">
                <div class="form-group">
                    <label for="edit-name">Nom:</label>
                    <input type="text" id="edit-name" name="Nom" value="${playerData.Nom}" required>
                </div>
                <div class="form-group">
                    <label for="edit-nameFirst">Prénom:</label>
                    <input type="text" id="edit-nameFirst" name="Prenom" value="${playerData.Prenom}" required>
                </div>
                <div class="form-group">
                    <label for="edit-birthdate">Date de naissance:</label>
                    <input type="date" id="edit-birthdate" name="date_naissance_" value="${playerData.date_naissance_}" required>
                </div>
                <div class="form-group">
                    <label for="edit-height">Taille:</label>
                    <input type="number" id="edit-height" name="Taille" value="${playerData.Taille}" required>
                </div>
                <div class="form-group">
                    <label for="edit-weight">Poids:</label>
                    <input type="number" id="edit-weight" name="Poids" value="${playerData.Poids}" required>
                </div>
                <div class="form-group">
                    <label for="edit-status">Statut:</label>
                    <select id="edit-status" name="Statut" required>
                        <option value="Actif" ${playerData.Statut === 'Actif' ? 'selected' : ''}>Actif</option>
                        <option value="Blessé" ${playerData.Statut === 'Blessé' ? 'selected' : ''}>Blessé</option>
                        <option value="Suspendu" ${playerData.Statut === 'Suspendu' ? 'selected' : ''}>Suspendu</option>
                    </select>
                </div>
                <div class="form-group">
                    <label for="edit-role">Poste:</label>
                    <select id="edit-role" name="Poste" required>
                        <option value="Gardien" ${playerData.Poste === 'Gardien' ? 'selected' : ''}>Gardien</option>
                        <option value="Défenseur" ${playerData.Poste === 'Défenseur' ? 'selected' : ''}>Défenseur</option>
                        <option value="Milieu" ${playerData.Poste === 'Milieu' ? 'selected' : ''}>Milieu</option>
                        <option value="Attaquant" ${playerData.Poste === 'Attaquant' ? 'selected' : ''}>Attaquant</option>
                    </select>
                </div>
                <div class="form-group">
                    <label for="edit-comments">Commentaires:</label>
                    <textarea id="edit-comments" name="Notes_">${playerData.Notes_ || ''}</textarea>
                </div>
                <div class="form-actions">
                    <button type="submit" class="btn-primary">Enregistrer</button>
                    <button type="button" class="btn-cancel">Annuler</button>
                </div>
            </form>
        `;

        // Show popup
        elements.profilePopup.style.display = 'block';

        // Setup event listeners
        const closeBtn = document.querySelector('.popup .close');
        const editBtn = document.getElementById('edit-player-btn');
        const deleteBtn = document.getElementById('delete-player-btn');
        const editForm = document.getElementById('edit-player-form');

        editBtn.addEventListener('click', () => {
            editForm.style.display = 'block';
        });

        closeBtn.addEventListener('click', () => {
            elements.profilePopup.style.display = 'none';
        });
        deleteBtn.addEventListener('click', () => {
            deletePlayer(playerData.Id_Joueur);
        });

        editForm.querySelector('.btn-cancel').addEventListener('click', () => {
            editForm.style.display = 'none';
        });

        editForm.addEventListener('submit', updatePlayer);

        Swal.close();

    } catch (error) {
        console.error('Profile error:', error);
        showError('Impossible de charger le profil du joueur');
        Swal.close();
    }
};
/**
 *
 */
document.addEventListener('DOMContentLoaded', async () => {
    const elements = {
        searchForm: document.getElementById('search-form'),
        addPlayerForm: document.getElementById('add-player-form'),
        addPlayerBtn: document.querySelector('#btn-add-player'),
        closeAddBtn: document.querySelector('.close-add'),
        addPlayerSection: document.querySelector('.add-player-section')
    };

    if (elements.searchForm) {
        elements.searchForm.addEventListener('submit', searchPlayers);
    }

    if (elements.addPlayerForm) {
        elements.addPlayerForm.addEventListener('submit', addPlayer);
    }

    if (elements.addPlayerBtn && elements.addPlayerSection) {
        elements.addPlayerBtn.addEventListener('click', () => {
            elements.addPlayerSection.style.display =
                elements.addPlayerSection.style.display === 'none' ? 'flex' : 'none';
        });
    }

    if (elements.closeAddBtn && elements.addPlayerSection) {
        elements.closeAddBtn.addEventListener('click', () => {
            elements.addPlayerSection.style.display = 'none';
        });
    }


    try {
        await fetchAllPlayers();
    } catch (error) {
        showError('Erreur lors du chargement initial');
    }
});

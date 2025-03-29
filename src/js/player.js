document.addEventListener('DOMContentLoaded', async () => {
    // Configuration initiale
    const baseUrl = "/R4.01/gestionequipesport-api/src/routes/player.php/api/";
    const elements = {
        addPlayerForm: document.getElementById('add-player-form'),
        profilePopup: document.getElementById('profilePopup'),
        popupBody: document.getElementById('popup-body'),
        searchForm: document.getElementById('search-form'),
        editForm: document.getElementById('edit-form'),
        closeButton: document.querySelector('.popup .close'),
        playerList: document.querySelector('.joueur-cards')
    };

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

    // Fonctions de gestion des formulaires
    const toggleForm = (formSelector) => {
        const form = document.querySelector(formSelector);
        if (form) {
            form.style.display = form.style.display === 'none' ? 'block' : 'none';
        }
    };

    const toggleAddPlayerForm = () => toggleForm('.add-player-section');

    const toggleEditForm = () => {
        const editForm = document.getElementById('edit-player-form');
        if (editForm) {
            editForm.style.display = editForm.style.display === 'none' ? 'block' : 'none';
        }
    };

    // Fonctions CRUD
    const searchPlayers = async (event) => {
        event.preventDefault();
        const searchTerm = document.getElementById('search-bar').value;

        try {
            showLoader();
            const response = await fetch(`${baseUrl}players/search?search=${encodeURIComponent(searchTerm)}`);
            if (!response.ok) throw new Error('Erreur de recherche');
            const responseData = await response.json();
            displayPlayers(responseData.data);
            Swal.close();
        } catch (error) {
            showError('Impossible de rechercher les joueurs');
        }
    };

    const addPlayer = async (event) => {
        event.preventDefault();
        try {
            showLoader();
            const response = await fetch(`${baseUrl}player`, {
                method: 'POST',
                body: new FormData(elements.addPlayerForm)
            });
            const responseData = await response.json();
            if (response.status === 201) {
                showSuccess('Joueur ajouté avec succès');
                toggleAddPlayerForm();
                elements.addPlayerForm.reset();
                await fetchAllPlayers();
            } else {
                throw new Error(responseData.data.message);
            }
        } catch (error) {
            showError(error.message || 'Erreur lors de l\'ajout du joueur');
        }
    };

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
                const response = await fetch(`${baseUrl}player`, {
                    method: 'DELETE',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ id: playerId })
                });

                const responseData = await response.json();
                if (response.ok && responseData.status === 200) {
                    showSuccess('Joueur supprimé avec succès');
                    elements.profilePopup.style.display = 'none';
                    await fetchAllPlayers();
                } else {
                    throw new Error(responseData.data?.message);
                }
            }
        } catch (error) {
            showError(error.message || 'Erreur lors de la suppression');
        }
    };

    const updatePlayer = async (event) => {
        event.preventDefault();
        try {
            const formData = new FormData(event.target);
            const data = Object.fromEntries(formData.entries());

            showLoader();
            const response = await fetch(`${baseUrl}player`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    id: data.id_joueur,
                    name: data.Nom,
                    firstName: data.Prenom,
                    birthdate: data.date_naissance_,
                    height: data.Taille,
                    weight: data.Poids,
                    statut: data.Statut,
                    role: data.Poste,
                    comments: data.Notes_
                })
            });

            const responseData = await response.json();
            if (responseData.status === 200) {
                showSuccess('Joueur mis à jour avec succès');
                elements.editForm.style.display = 'none';
                elements.profilePopup.style.display = 'none';
                await fetchAllPlayers();
            } else {
                throw new Error(responseData.message);
            }
        } catch (error) {
            showError(error.message || 'Erreur lors de la mise à jour');
        }
    };

    const displayPlayers = (players) => {
        if (!elements.playerList || !Array.isArray(players)) {
            showError("Erreur d'affichage des joueurs");
            return;
        }

        elements.playerList.innerHTML = players.map(player => `
            <div class="joueur-card" data-id="${player.Id_Joueur}">
                <img src="${player.Image ? '../assets/data-player/' + player.Image : '../assets/data-player/default.jpg'}"
                     alt="Photo de ${player.Prenom} ${player.Nom}">
                <p>${player.Prenom} ${player.Nom}</p>
                <p class="nblicense">Numéro de Licence: ${player.Numéro_license}</p>
            </div>
        `).join('');

        elements.playerList.querySelectorAll('.joueur-card').forEach(card => {
            card.addEventListener('click', () => openPlayerProfile(card.dataset.id));
        });
    };

    const fetchAllPlayers = async () => {
        try {
            showLoader();
            const response = await fetch(`${baseUrl}players`);
            if (!response.ok) throw new Error('Erreur de chargement');
            const responseData = await response.json();
            displayPlayers(responseData.data);
            Swal.close();
        } catch (error) {
            showError('Impossible de charger les joueurs');
        }
    };

    const openPlayerProfile = async (playerId) => {
        try {
            showLoader();
            const [playerResponse, noteResponse] = await Promise.all([
                fetch(`${baseUrl}player?id=${playerId}`),
                fetch(`${baseUrl}player/average-note?id=${playerId}`)
            ]);

            if (!playerResponse.ok || !noteResponse.ok) {
                throw new Error('Erreur de chargement du profil');
            }

            const [player, noteData] = await Promise.all([
                playerResponse.json(),
                noteResponse.json()
            ]);

            Swal.close();

            // Apply modal overlay styles
            Object.assign(elements.profilePopup.style, {
                display: 'flex',
                position: 'fixed',
                top: '0',
                left: '0',
                width: '100%',
                height: '100%',
                backgroundColor: 'rgba(0, 0, 0, 0.5)',
                justifyContent: 'center',
                alignItems: 'center',
                zIndex: '1000'
            });

            const age = calculateAge(player.data.date_naissance_);
            const birthdate = new Date(player.data.date_naissance_).toLocaleDateString('fr-FR');
            const averageNote = noteData.data || 'N/A';

            elements.popupBody.innerHTML = `
            <div class="profile-header">
                <img id="player-image" src="${player.data.Image ? '../assets/data-player/' + player.data.Image : '../assets/data-player/default.jpg'}"
                     alt="Photo de ${player.data.Prenom} ${player.data.Nom}">
                <div class="profile-info">
                    <h1 id="player-name">${player.data.Prenom} ${player.data.Nom}</h1>
                    <p><strong>Rôle:</strong> <span id="player-role">${player.data.Poste}</span></p>
                    <p><strong>Âge:</strong> <span id="player-age">${age} ans</span></p>
                </div>
            </div>
            <div class="bio">
                <h2>Information</h2>
                <details>
                    <summary>Voir les informations</summary>
                    <p><strong>Numéro de Licence:</strong> <span id="player-license">${player.data.Numéro_license}</span></p>
                    <p><strong>Date de Naissance:</strong> <span id="player-birthdate">${birthdate}</span></p>
                    <p><strong>Taille:</strong> <span id="player-height">${player.data.Taille} cm</span></p>
                    <p><strong>Poids:</strong> <span id="player-weight">${player.data.Poids} kg</span></p>
                    <p><strong>Statut:</strong> <span id="player-status">${player.data.Statut}</span></p>
                    <p><strong>Note Moyenne:</strong> <span id="player-note">${averageNote}</span></p>
                </details>
            </div>
            <div class="bio">
                <h2>Commentaires</h2>
                <p id="player-comments">${player.data.Notes_ || 'Aucun commentaire'}</p>
            </div>
            <div class="actions">
                <button type="button" class="btnmodifie" id="edit-player-btn">Modifier Joueur</button>
                <button type="button" class="btnSupprimer" id="delete-player-btn">Supprimer Joueur</button>
            </div>

             <form id="edit-player-form" class="edit-form" style="display: none;">
            <input type="hidden" id="edit-id" name="id_joueur" value="${player.data.Id_Joueur}">
            <div class="form-group">
                <label for="edit-name">Nom:</label>
                <input type="text" id="edit-name" name="Nom" value="${player.data.Nom}" required>
            </div>
            <div class="form-group">
                <label for="edit-nameFirst">Prénom:</label>
                <input type="text" id="edit-nameFirst" name="Prenom" value="${player.data.Prenom}" required>
            </div>
            <div class="form-group">
                <label for="edit-birthdate">Date de naissance:</label>
                <input type="date" id="edit-birthdate" name="date_naissance_" value="${player.data.date_naissance_}" required>
            </div>
            <div class="form-group">
                <label for="edit-height">Taille:</label>
                <input type="number" id="edit-height" name="Taille" value="${player.data.Taille}" required>
            </div>
            <div class="form-group">
                <label for="edit-weight">Poids:</label>
                <input type="number" id="edit-weight" name="Poids" value="${player.data.Poids}" required>
            </div>
            <div class="form-group">
                <label for="edit-status">Statut:</label>
                <select id="edit-status" name="Statut" required>
                    <option value="Actif" ${player.data.Statut === 'Actif' ? 'selected' : ''}>Actif</option>
                    <option value="Blessé" ${player.data.Statut === 'Blessé' ? 'selected' : ''}>Blessé</option>
                    <option value="Suspendu" ${player.data.Statut === 'Suspendu' ? 'selected' : ''}>Suspendu</option>
                </select>
            </div>
            <div class="form-group">
                <label for="edit-role">Poste:</label>
                <select id="edit-role" name="Poste" required>
                    <option value="Gardien" ${player.data.Poste === 'Gardien' ? 'selected' : ''}>Gardien</option>
                    <option value="Défenseur" ${player.data.Poste === 'Défenseur' ? 'selected' : ''}>Défenseur</option>
                    <option value="Milieu" ${player.data.Poste === 'Milieu' ? 'selected' : ''}>Milieu</option>
                    <option value="Attaquant" ${player.data.Poste === 'Attaquant' ? 'selected' : ''}>Attaquant</option>
                </select>
            </div>
            <div class="form-group">
                <label for="edit-comments">Commentaires:</label>
                <textarea id="edit-comments" name="Notes_">${player.data.Notes_ || ''}</textarea>
            </div>
            <div class="form-actions">
                <button type="submit" class="btn-primary">Enregistrer</button>
            </div>
        </form>
        `;

            elements.profilePopup.style.display = 'block';
            setupProfileButtons(player.data);

        } catch (error) {
            showError('Impossible d\'afficher le profil du joueur');
        }
    };

    const setupProfileButtons = (playerData) => {
        document.getElementById('edit-player-btn')?.addEventListener('click', (event) => {
            const editForm = document.getElementById('edit-player-form');
            if (editForm) {
                const rect = event.target.getBoundingClientRect();
                editForm.style.top = `${rect.bottom + window.scrollY + 20}px`; // Adjusted to appear lower
                editForm.style.left = `${rect.left + window.scrollX}px`;
                editForm.style.display = 'block';
            }
            const closeButton = elements.profilePopup.querySelector('.close');
            if (closeButton) {
                closeButton.addEventListener('click', closePlayerProfile);
            }
        });

        document.getElementById('delete-player-btn')?.addEventListener('click', () => {
            deletePlayer(playerData.Id_Joueur);
        });

        document.getElementById('edit-player-form')?.addEventListener('submit', updatePlayer);

        // Ajouter un gestionnaire pour le bouton Annuler
        document.querySelector('#edit-player-form .btn-secondary')?.addEventListener('click', () => {
            const editForm = document.getElementById('edit-player-form');
            if (editForm) {
                editForm.style.display = 'block';
            }
        });
    };

    const calculateAge = (dateOfBirth) => {
        const birthDate = new Date(dateOfBirth);
        const today = new Date();
        let age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();

        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }
        return age;
    };

    const closePlayerProfile = () => {
        if (elements.profilePopup) {
            elements.profilePopup.style.display = 'none';
            const editForm = document.getElementById('edit-player-form');
            if (editForm) {
                editForm.style.display = 'none';
            }
        }
    };

    // Initialisation des écouteurs d'événements
    const initEventListeners = () => {
        document.getElementById('btn-add-player')?.addEventListener('click', toggleAddPlayerForm);
        elements.addPlayerForm?.addEventListener('submit', addPlayer);
        elements.searchForm?.addEventListener('submit', searchPlayers);
        document.querySelector('.edit-form .close')?.addEventListener('click', toggleEditForm);
        elements.closeButton?.addEventListener('click', closePlayerProfile);
        elements.profilePopup?.addEventListener('click', (e) => {
            if (e.target === elements.profilePopup) {
                closePlayerProfile();
            }
        });
    };

    // Initialisation de l'application
    try {
        initEventListeners();
        await fetchAllPlayers();
    } catch (error) {
        showError('Erreur d\'initialisation de l\'application');
    }
});

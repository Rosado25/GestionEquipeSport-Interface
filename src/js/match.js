document.addEventListener("DOMContentLoaded", async () => {
    const baseUrl = "/R4.01/gestionequipesport-api/src/routes/match.php/api/";
    const tableBody = document.querySelector("tbody");
    let ListeMatch = [];

    //add-match
    async function addMatch(Data) {
        try {
            console.log(Data);
            console.log("Ajout d'un match...");
            const response = await fetch(`${baseUrl}match`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(Data)
            });
            console.log(JSON.stringify(Data));
            const text = await response.text();  // Récupère la réponse brute
            console.log("Réponse brute de l'API:", text);  // Affiche la réponse dans la console

            return response;
        } catch (error) {
            console.error("Erreur lors de l'ajout du match:", error);
        }
    }

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

    //delete-match
    async function deleteMatch(matchId) {
        console.log(`Suppression du match ID: ${matchId}`);
        try {
            const response = await fetch(`${baseUrl}match`, {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ Id_Match_Foot: matchId })
            });
            const text = await response.text();  // Récupère la réponse brute
            console.log("Réponse brute de l'API:", text);  // Affiche la réponse dans la console

            const result = JSON.parse(text);
            console.log(result)
            if (result.status == 200) {
                alert("Match supprimé avec succès !");
                getAllMatch(); // Recharge la liste après suppression
            } else {
                console.error("Échec de la suppression :", result);
            }
        } catch (error) {
            console.error("Erreur lors de la suppression du match:", error);
        }
    }

    document.addEventListener("click", async (event) => {
        if (event.target.closest(".delete-btn")) {
            const matchId = event.target.closest(".delete-btn").dataset.matchId;
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

    //edit-match
    async function updateMatch(matchData) {
        console.log(`Mise à jour du match ID: ${matchData.Id_Match_Foot}`);
        try {

            const response = await fetch(`${baseUrl}match`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(matchData)
            });
            console.log(JSON.stringify(matchData));
            const text = await response.text();  // Récupère la réponse brute
            console.log("Réponse brute de l'API:", text);  // Affiche la réponse dans la console
            console.log(matchData)
            console.log(response);
            return response;
        } catch (error) {
            console.error("Erreur lors de la mise à jour du match:", error);
        }
    }

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

    //liste des matchs
    async function getAllMatch() {
        try {
            console.log("Récupération de tous les matchs...");
            const response = await fetch(`${baseUrl}matches`);
            if (!response.ok) throw new Error("Erreur lors de la récupération des matchs");

            const result = await response.json();
            if (!result.data || !Array.isArray(result.data)) {
                console.error("Format inattendu des données reçues:", result);
                return;
            }

            ListeMatch = result.data;

            if (ListeMatch.length === 0) {
                tableBody.innerHTML = `<tr><td colspan="6">Aucun match trouvé.</td></tr>`;
                return;
            }

            tableBody.innerHTML = ListeMatch.map(match => `
                <tr>
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
                            <button class="btn yellow-btn edit-btn" onclick="openEditPopup(${match.Id_Match_Foot})">
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

    // Pop-up
    const editPopup = document.getElementById("editPopup");
    const editMatchId = document.getElementById("editMatchId");
    const editDate = document.getElementById("editDate");
    const editAdversaire = document.getElementById("editAdversaire");
    const editLieu = document.getElementById("editLieu");
    const editScore = document.getElementById("editScore");
    const closeBtn = document.querySelector(".close-btn");

    window.openEditPopup = function (matchId) {
        console.log("Match sélectionné:", matchId);
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


    //numero de matchs joues
    async function fetchMatchesPlayed() {
        try {
            const response = await fetch(`${baseUrl}matches/played`);
            if (!response.ok) {
                throw new Error(`Erreur HTTP! statut: ${response.status}`);
            }
            const responseData = await response.json();
            const PointsText = document.querySelector("#NbMtc");

            if (responseData.data) {
                PointsText.innerHTML += `<strong>${responseData.data}</strong>`;
            } else {
                PointsText.innerHTML += `<p>0</p>`;
            }
        } catch (error) {
            console.error("Erreur lors de la récupération le NbMatchs :", error);
            document.querySelector("#NbMtc").innerHTML += `<p>Impossible de charger le NbMatchs.</p>`;
        }
    }

    //numero de victoires
    async function fetchVictoires() {
        try {
            const response = await fetch(`${baseUrl}matches/won`);
            if (!response.ok) {
                throw new Error(`Erreur HTTP! statut: ${response.status}`);
            }
            const responseData = await response.json();
            const PointsText = document.querySelector("#NbVic");

            if (responseData.data) {
                PointsText.innerHTML += `<strong>${responseData.data} Victoires </strong>`;
            } else {
                PointsText.innerHTML += `<p>0 Victoires</p>`;
            }
        } catch (error) {
            console.error("Erreur lors de la récupération le NbVictoires :", error);
            document.querySelector("#NbVic").innerHTML += `<p>Impossible de charger le NbVictoires.</p>`;
        }
    }

    //numero de jouers
    async function fetchNbJouers() {
        try {
            const response = await fetch(`/R4.01/gestionequipesport-api/src/routes/player.php/api/player/player-count`);
            if (!response.ok) {
                throw new Error(`Erreur HTTP! statut: ${response.status}`);
            }
            const responseData = await response.json();
            const PointsText = document.querySelector("#NbJrs");

            if (responseData.data) {
                PointsText.innerHTML += `<strong>${responseData.data} </strong>`;
            } else {
                PointsText.innerHTML += `<p>0</p>`;
            }
        } catch (error) {
            console.error("Erreur lors de la récupération de numero jouers :", error);
            document.querySelector("#NbJrs").innerHTML += `<p>Impossible de charger le numero de jouers.</p>`;
        }
    }

    await getAllMatch();
    await fetchMatchesPlayed();
    await fetchVictoires();
    await fetchNbJouers();
});

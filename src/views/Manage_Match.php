<!DOCTYPE html>
<html lang="fr">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css" rel="stylesheet">
    <link rel="icon" type="image/png" sizes="292x292" href=../assets/logo.png>
    <link rel="stylesheet" href="../css/match.css">
    <script src="/view/src/js/app.js" defer></script>
    <script src=../js/match.js></script>
    <title>Gestion des Matchs</title>
</head>

<body>
    <header>
        <!--Navabar -->
    </header>

    <main>

        <!-- Message de notification -->
        <div id="notification" class="notification">
            <i class="icon fas fa-futbol"></i>
            <span class="message-text"></span>
            <div class="progress-bar"></div>
        </div>
        <input type="hidden" id="php-message" value="<?= htmlspecialchars($message) ?>">
        <input type="hidden" id="php-message-type" value="<?= (strpos($message, 'succès') !== false) ? 'success' : 'error' ?>">

        <!-- Données des matchs -->
        <section class="data-match">
            <div class="widget">
                <i class="fas fa-futbol"></i>
                <div class="widget-container">
                    <h3><!-- Numero de matches --></h3>
                    <p>Total des matchs joués</p>
                </div>
            </div>
            <div class="widget">
                <i class="fas fa-trophy"></i>
                <div class="widget-container">
                    <h3><!-- Numero de Victoires -->Victoires</h3>
                    <p>Total des victoires</p>
                </div>
            </div>
            <div class="widget">
                <i class="fas fa-users"></i>
                <div class="widget-container">
                    <h3><!-- Numero des joueres --></h3>
                    <p>Effectif total</p>
                </div>
            </div>
        </section>

        <!-- Ajouter un Match -->
        <section class="card">
            <h2>Créer un match</h2>
            <form class="form-group" method="POST">
                <label for="date">Date et Heure :</label>
                <input type="datetime-local" id="date" name="Date" required>
                <label for="adversaire">Nom de l'équipe adverse :</label>
                <input type="text" id="adversaire" name="Adversaire" required>
                <label for="lieu">Lieu :</label>
                <select id="lieu" name="Lieu" required>
                    <option value="Domicile">Domicile</option>
                    <option value="Exterieur">Extérieur</option>
                </select>
                <button type="submit" name="add-match">Ajouter le Match</button>
            </form>
        </section>

        <!-- Liste des matchs -->
        <section class="match-list">
            <h2>Liste des matchs</h2>
            <div class="tableliste">
                <table>
                    <thead>
                        <tr>
                            <th><i class="fas fa-calendar-day"></i> Date et Heure</th>
                            <th><i class="fas fa-users"></i> Mon équipe</th>
                            <th><i class="fas fa-shield-alt"></i> Adversaire</th>
                            <th><i class="fas fa-map-marker-alt"></i> Lieu</th>
                            <th><i class="fas fa-futbol"></i> Score</th>
                            <th><i class="fas fa-cogs"></i> Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        <!-- Liste des matchs ici-->
                    </tbody>
                </table>
            </div>
        </section>

        <!-- Modifier le Match -->
        <div class="popup" id="editPopup" style="display: none;">
            <div class="popup-container">
                <button class="close-btn">&times;</button>
                <h2>Modifier le Match</h2>
                <form method="PUT" class="edit-form">
                    <input type="hidden" name="id_matches" id="editMatchId">

                    <label for="editDate">Date et Heure :</label>
                    <input type="datetime-local" id="editDate" name="Date" required>

                    <label for="editAdversaire">Nom de l'équipe adverse :</label>
                    <input type="text" id="editAdversaire" name="Adversaire" required>

                    <label for="editLieu">Lieu :</label>
                    <select id="editLieu" name="Lieu" required>
                        <option value="Domicile">Domicile</option>
                        <option value="Exterieur">Extérieur</option>
                    </select>

                    <label for="editScore">Score :</label>
                    <input type="text" id="editScore" name="Score" placeholder="0-0" pattern="\d+-\d+" title="Format: 0-0">

                    <button type="submit" name="edit-match">Enregistrer les modifications</button>
                </form>
            </div>
        </div>

    </main>
    <footer>
        <?php include '../components/footer.php'; ?>
    </footer>
</body>

</html>
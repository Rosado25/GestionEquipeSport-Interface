<?php

// Importation des contrôleurs
include __DIR__ . '/../../../controller/AuthenticationControler.php';
include __DIR__ . '/../../../controller/MatchControler.php';
include __DIR__ . '/../../../controller/PlayersControler.php';

// Authentification
$authController = new AuthenticationControler();
$authController->Authentifie();

// Variables
$message = "";
$controllerMatch = new MatchControler();
$playerController = new PlayersControler();
$matchToEdit = null;

// Vérification des requêtes POST
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    if (isset($_POST['add-match'])) {
        $message = $controllerMatch->AddMatch();
    }

    if (isset($_POST['id_match'], $_POST['supprimer_match'])) {
        $message = $controllerMatch->DeleteMatch((int)$_POST['id_match']);
    }

    if (isset($_POST['edit_match_id'])) {
        $matchToEdit = $controllerMatch->getMatchById((int)$_POST['edit_match_id']);
    }

    if (isset($_POST['edit-match'])) {
        $message = $controllerMatch->UpdateMatch();
    }
}

// Récupération des données
$ListeMatch = $controllerMatch->getAllMatch();
$playercount = $playerController->countPlayers();
$countMatch = $controllerMatch->countMatchesPlayed();
$countMatchesWon = $controllerMatch->countMatchesWon();

?>

<!DOCTYPE html>
<html lang="fr">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css" rel="stylesheet">
    <link rel="icon" type="image/png" sizes="292x292" href=../assets/logo.png>
    <link rel="stylesheet" href="../css/match.css">
    <script src="/view/src/js/app.js" defer></script>
    <title>Gestion des Matchs</title>
</head>

<body>
<header>
    <?php include 'navbar.php'; ?>
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
                <h3><?= htmlspecialchars($countMatch) ?></h3>
                <p>Total des matchs joués</p>
            </div>
        </div>
        <div class="widget">
            <i class="fas fa-trophy"></i>
            <div class="widget-container">
                <h3><?= htmlspecialchars($countMatchesWon) ?> Victoires</h3>
                <p>Total des victoires</p>
            </div>
        </div>
        <div class="widget">
            <i class="fas fa-users"></i>
            <div class="widget-container">
                <h3><?= htmlspecialchars($playercount) ?></h3>
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
                <?php if (!empty($ListeMatch)): ?>
                    <?php foreach ($ListeMatch as $match): ?>
                        <tr onclick="window.location.href='Match_Sheet.php?id=<?= htmlspecialchars($match['Id_Match_Foot']) ?>'">
                            <td><?= htmlspecialchars(date("d/m/Y H:i", strtotime(isset($match['date_heure']) ? $match['date_heure'] : ''))) ?></td>
                            <td>Abdel FC</td>
                            <td><?= htmlspecialchars(isset($match['Adversaire']) ? $match['Adversaire'] : '') ?></td>
                            <td><?= htmlspecialchars(isset($match['lieu']) ? $match['lieu'] : '') ?></td>
                            <td>
                                <?php
                                $score = isset($match['résultat']) ? $match['résultat'] : 'NA';
                                ?>
                                <span style="<?= $score === 'NA' ? 'color: gray;' : 'color: limegreen;' ?>"><?= htmlspecialchars($score) ?></span>
                            </td>
                            <td>
                                <div class="actionsbtn">
                                    <form class="btnform" method="POST" onclick="stopPropagation();">
                                        <input type="hidden" name="edit_match_id" value="<?= htmlspecialchars(isset($match['Id_Match_Foot']) ? $match['Id_Match_Foot'] : '') ?>">
                                        <button type="submit" class="btn yellow-btn edit-btn">
                                            <i class="fas fa-edit"></i>
                                        </button>
                                    </form>
                                    <form class="btnform" method="POST" onclick=stopPropagation();">
                                        <input type="hidden" name="id_match" value="<?= htmlspecialchars(isset($match['Id_Match_Foot']) ? $match['Id_Match_Foot'] : '') ?>">
                                        <button type="submit" name="supprimer_match" class="btn red-btn" onclick="return confirm('Êtes-vous sûr de vouloir supprimer ce match ?');">
                                            <i class="fas fa-trash-alt"></i>
                                        </button>
                                    </form>
                                </div>
                            </td>
                        </tr>
                    <?php endforeach; ?>
                <?php else: ?>
                    <tr>
                        <td colspan="6">Aucun match trouvé.</td>
                    </tr>
                <?php endif; ?>
                </tbody>
            </table>
        </div>
    </section>

    <!-- Modifier le Match -->
    <?php if ($matchToEdit): ?>
        <div class="popup" id="editPopup" style="display: flex;">
            <div class="popup-container">
                <button class="close-btn" onclick="closePopup()">&times;</button>
                <h2>Modifier le Match</h2>
                <form method="POST" class="edit-form">
                    <input type="hidden" name="id_matches" id="editMatchId" value="<?= htmlspecialchars($matchToEdit['Id_Match_Foot']) ?>">

                    <?php
                    $currentDate = date('Y-m-d\TH:i');
                    $isMatchPlayed = strtotime($matchToEdit['date_heure']) < strtotime($currentDate);
                    ?>

                    <label for="editDate">Date et Heure :</label>
                    <input type="datetime-local" id="editDate" name="Date" value="<?= htmlspecialchars(date('Y-m-d\TH:i', strtotime($matchToEdit['date_heure']))) ?>" required <?= $isMatchPlayed ? 'disabled' : '' ?>>

                    <label for="editAdversaire">Nom de l'équipe adverse :</label>
                    <input type="text" id="editAdversaire" name="Adversaire" value="<?= htmlspecialchars($matchToEdit['Adversaire']) ?>" required <?= $isMatchPlayed ? 'disabled' : '' ?>>

                    <label for="editLieu">Lieu :</label>
                    <select id="editLieu" name="Lieu" required <?= $isMatchPlayed ? 'disabled' : '' ?>>
                        <option value="Domicile" <?= $matchToEdit['lieu'] == 'Domicile' ? 'selected' : '' ?>>Domicile</option>
                        <option value="Exterieur" <?= $matchToEdit['lieu'] == 'Exterieur' ? 'selected' : '' ?>>Extérieur</option>
                    </select>

                    <?php if ($isMatchPlayed): ?>
                        <label for="editScore">Score :</label>
                        <input type="text" id="editScore" name="Score" value="<?= isset($matchToEdit['résultat']) ? htmlspecialchars($matchToEdit['résultat']) : '' ?>" placeholder="0-0" pattern="\d+-\d+" title="Format: 0-0">
                    <?php endif; ?>

                    <button type="submit" name="edit-match">Enregistrer les modifications</button>
                </form>
            </div>
        </div>
    <?php endif; ?>

</main>
<footer>
    <?php include 'footer.php'; ?>
</footer>
</body>

</html>
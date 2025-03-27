<!DOCTYPE html>
<html lang="fr">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link rel="stylesheet" href="../css/Statistiques.css">
    <script src=../js/statistiques.js></script>
    <title>Statistiques</title>
</head>

<body>
    <header> <?php include '../components/navbar.php'; ?> </header>
    <main id="statistiques-main">
        <div class="container statistiques-container">
            <h1 class="statistiques-title">Statistiques</h1>
            <section class="statistiques-section">
                <h2 class="statistiques-subtitle">Matchs</h2>
                <div id="matchs-stats" class="cards">
                    <!--Match Stats -->
                </div>
            </section>

            <section class="statistiques-section">
                <h2 class="statistiques-subtitle">Joueurs</h2>
                <div class="table-container">
                    <table class="statistiques-table">
                        <thead>
                            <tr>
                                <th>Nom</th>
                                <th>Statut</th>
                                <th>Poste préféré</th>
                                <th>Titulaire</th>
                                <th>Remplaçant</th>
                                <th>Évaluation moyenne</th>
                                <th>% Victoires</th>
                                <th>Sélections consécutives</th>
                            </tr>
                        </thead>
                        <tbody id="player-stats">
                            <!--Player Stats -->
                        </tbody>
                    </table>
                </div>
            </section>
        </div>
    </main>
    <footer> <?php include '../components/footer.php'; ?></footer>
</body>

</html>
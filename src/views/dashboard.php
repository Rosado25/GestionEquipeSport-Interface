<!DOCTYPE html>
<html lang="fr">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link rel="stylesheet" href="../css/DashBoard.css">
    <!-- Permet de faire des graphique avec chart js -->
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
    <script src=../js/dashboard.js></script>
</head>

<body>

    <header>
        <?php // include '../components/navbar.php'; 
        ?>
    </header>

    <main>
        <div class="main-content">
            <!-- Section gauche avec les cartes principales -->
            <div class="card-container">
                <div class="card cardNextMatch">
                    <h3><i class="fas fa-calendar-alt"></i> Prochain Match</h3>
                    <!-- affichage de prochain match -->
                    <strong id="prochainMatch"></strong>
                </div>

                <div class="card cardnbPoint">
                    <h3><i class="fas fa-trophy"></i> Points de l'équipe</h3>
                    <!-- points de l'equipe -->
                    <strong id="points"></strong>
                    <p class="legend">1 match gagné = 3 points, 1 match nul = 1 point</p>
                </div>

                <div class="card HistoriqueCard">
                    <h2><i class="fas fa-history"></i> Historique des derniers matchs</h2>
                    <table>
                        <thead>
                            <tr>
                                <th>Match</th>
                                <th>Score</th>
                                <th>Résultat</th>
                            </tr>
                        </thead>
                        <tbody id="dernierMatchs">
                            <!-- affichage des derniers trois matchs, avec score, resultat et nom des equipes -->
                        </tbody>
                    </table>
                </div>

                <div class="card BestPlayer">
                    <h2><i class="fas fa-star"></i> Meilleur Joueur</h2>
                    <p><strong><!-- affichage du meilleur jouer --></strong></p>
                    <p>Moyenne des notes : <!-- moyenne des notes du meilleur jouer --></p>
                    <img src="" alt="Photo du joueur"> <!-- affichage du photo du meilleure jouer -->
                </div>
            </div>

            <!-- Section droite avec les statistiques -->
            <div class="card-container">
                <div class="card Statistiquecard">
                    <h2><i class="fas fa-chart-line"></i> Statistiques de l'équipe</h2>
                    <ul>
                        <li><strong id=victories>Pourcentage de victoires : </strong><!-- affichage de Pourcentage de victoires --></li>
                        <li><strong id=NbMatchs>Matchs joués : </strong><!-- affichage de Matchs joués --></li>
                        <li><strong id=NbGagnés>Matchs gagnés : </strong><!-- affichage de Matchs gagnés --></li>
                        <li><strong id=ButsM>Buts marqués : </strong><!-- affichage de Buts marqués --></li>
                        <li><strong id=ButsS>Buts subis : </strong><!-- affichage de Buts subis --></li>
                        <li><strong id=ButsPm>Buts par match : </strong><!-- affichage de Buts par match --></li>
                        <li><strong id=Cs>Clean Sheets : </strong><!-- affichage de Clean Sheets --></li>
                        <li><strong id=Db>Différence de buts : </strong><!-- affichage de Différence de buts --></li>
                        <li><strong id=PerformanceEquipe>Performance de l'équipe : </strong><!-- affichage de Performance de l'équipe --></li>
                        <li><strong id=MoyenneNotes>Moyenne des notes : </strong><!-- affichage de Moyenne des notes --></li>
                    </ul>
                </div>

                <!-- Section graphique  -->
                <div class="card Graphiquecard">
                    <h2><i class="fas fa-chart-bar"></i> Graphique des performances</h2>
                    <canvas id="performanceChart"></canvas>
                </div>
            </div>
        </div>
    </main>
    <footer>
        <?php include '../components/footer.php'; ?>
    </footer>
</body>

</html>
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link rel="stylesheet" href="../css/DashBoard.css">
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
    <script src="../js/dashboard.js"></script>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
</head>
<body>
<header>
    <?php include '../components/navbar.php'; ?>
</header>

<div class="dashboard-container">
    <div class="dashboard-header">
        <h1>Tableau de bord</h1>
        <div class="date-filter">
            <span class="current-date">Saison 2024-2025</span>
        </div>
    </div>

    <div class="stats-overview">
        <div class="stat-card primary">
            <div class="stat-icon"><i class="fas fa-trophy"></i></div>
            <div class="stat-content">
                <h3>Points</h3>
                <p id="points">-</p>
            </div>
        </div>
        <div class="stat-card success">
            <div class="stat-icon"><i class="fas fa-percentage"></i></div>
            <div class="stat-content">
                <h3>Victoires</h3>
                <p id="victories">-</p>
            </div>
        </div>
        <div class="stat-card info">
            <div class="stat-icon"><i class="fas fa-futbol"></i></div>
            <div class="stat-content">
                <h3>Buts marqués</h3>
                <p id="ButsM">-</p>
            </div>
        </div>
        <div class="stat-card warning">
            <div class="stat-icon"><i class="fas fa-star"></i></div>
            <div class="stat-content">
                <h3>Performance</h3>
                <p id="PerformanceEquipe">-</p>
            </div>
        </div>
    </div>

    <div class="dashboard-grid">
        <div class="chart-section">
            <div class="card">
                <h2>Performance de l'équipe</h2>
                <canvas id="performanceChart"></canvas>
            </div>
        </div>

        <div class="next-match">
            <div class="card">
                <h2>Prochain match</h2>
                <div class="cardNextMatch"></div>
            </div>
        </div>
        <div class="card match-history">
            <h2>Derniers matchs</h2>
            <table>
                <thead>
                <tr>
                    <th>Match</th>
                    <th>Score</th>
                    <th>Résultat</th>
                </tr>
                </thead>
                <tbody id="dernierMatchs"></tbody>
            </table>
        </div>
        <div class="stats-details">
            <div class="card">
                <h2>Statistiques détaillées</h2>
                <div class="stats-grid">
                    <div class="stat-item">
                        <div class="stat-label">Matchs joués</div>
                        <div class="stat-value" id="NbMatchs">-</div>
                    </div>
                    <div class="stat-item">
                        <div class="stat-label">Matchs gagnés</div>
                        <div class="stat-value" id="NbGagnés">-</div>
                    </div>
                    <div class="stat-item">
                        <div class="stat-label">Buts par match</div>
                        <div class="stat-value" id="ButsPm">-</div>
                    </div>
                    <div class="stat-item">
                        <div class="stat-label">Buts subis</div>
                        <div class="stat-value" id="ButsS">-</div>
                    </div>
                    <div class="stat-item">
                        <div class="stat-label">Clean Sheets</div>
                        <div class="stat-value" id="Cs">-</div>
                    </div>
                    <div class="stat-item">
                        <div class="stat-label">Diff��rence de buts</div>
                        <div class="stat-value" id="Db">-</div>
                    </div>
                    <div class="stat-item">
                        <div class="stat-label">Moyenne des notes</div>
                        <div class="stat-value" id="MoyenneNotes">-</div>
                    </div>
                </div>
            </div>
        </div>

        <div class="player-section">
            <div class="card best-player">
                <h2>Joueur du mois</h2>
                <div class="player-card">
                    <img id="BestPlayerImg" src="" alt="Meilleur joueur">
                    <div class="player-info">
                        <h3 id="test">-</h3>
                        <p id="BestPlayerMoyenne">-</p>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>

<footer>
    <?php include '../components/footer.php'; ?>
</footer>
</body>
</html>
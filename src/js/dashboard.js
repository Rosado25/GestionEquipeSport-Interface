
//script pour le chart graphique
var ctx = document.getElementById('performanceChart').getContext('2d');
var performanceChart = new Chart(ctx, {
    type: 'line',
    data: {
        labels: [],
        datasets: [{
            label: 'Performance de l\'équipe',
            data: null, //performance data
            borderColor: '#ffcc00',
            backgroundColor: 'rgba(255, 204, 0, 0.2)',
            borderWidth: 2,
            fill: true
        },]
    },
    options: {
        scales: {
            y: {
                beginAtZero: true
            }
        }
    }
});
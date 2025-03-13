document.addEventListener("DOMContentLoaded", async () => {
    try {
        // Fetch the last 2 matches from the API
        const response = await fetch("/R4.01/gestionequipesport-api/src/routes/dashboard.php/api/last-matches?numMatches=2");
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const responseData = await response.json();
        console.log(responseData); // Log the entire response to inspect its structure

        // Assume the data is in a property 'data'
        const data = responseData.data;
        if (!Array.isArray(data)) {
            throw new Error("The returned data is not an array");
        }

        // Initialize arrays for chart data
        const labels = [];
        const performanceData = [];

        // Fill the data
        for (const match of data) {
            const date = new Date(match.date_heure);
            if (isNaN(date) || match.date_heure === "0000-00-00 00:00:00") {
                console.warn(`Skipping invalid date format: ${match.date_heure}`);
                continue;
            }
            labels.push(date.toLocaleDateString("fr-FR"));

            // Calculate performance using the API
            const performanceResponse = await fetch("/R4.01/gestionequipesport-api/src/routes/dashboard.php/api/calculate-performance", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ match })
            });

            if (!performanceResponse.ok) {
                throw new Error(`HTTP error! status: ${performanceResponse.status}`);
            }

            const performanceDataResponse = await performanceResponse.json();
            console.log("Performance Data Response:", performanceDataResponse); // Log the performance data response

            if (performanceDataResponse && performanceDataResponse.performance !== undefined) {
                performanceData.push(performanceDataResponse.performance);
            } else {
                console.warn("Performance data is undefined for match:", match);
                performanceData.push(null);
            }
        }

        console.log("Labels:", labels);
        console.log("Performance Data:", performanceData);

        // Check if data arrays are not empty
        if (labels.length === 0 || performanceData.length === 0) {
            throw new Error("No valid data to display in the chart");
        }

        // Select the chart canvas
        const ctx = document.getElementById("performanceChart").getContext("2d");

        // Generate the chart with Chart.js
        new Chart(ctx, {
            type: "line",
            data: {
                labels: labels,
                datasets: [{
                    label: "Team Performance",
                    data: performanceData,
                    borderColor: "#ffcc00",
                    backgroundColor: "rgba(255, 204, 0, 0.2)",
                    borderWidth: 2,
                    fill: true
                }]
            },
            options: {
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });

    } catch (error) {
        console.error("Error loading data:", error);
    }
});
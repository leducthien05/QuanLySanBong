const chartElement = document.getElementById("revenueChart");

if (chartElement) {
    const revenueChartData = JSON.parse(
        chartElement.dataset.chart
    );

    const labels = revenueChartData.map(
        item => item.label
    );

    const revenues = revenueChartData.map(
        item => item.revenue
    );

    new Chart(chartElement, {
        type: "line",

        data: {
            labels: labels,

            datasets: [{
                label: "Doanh thu",

                data: revenues,

                borderWidth: 3,

                tension: 0.4,

                fill: true,

                backgroundColor:
                    "rgba(59,130,246,0.15)"
            }]
        },

        options: {
            responsive: true,

            plugins: {
                legend: {
                    display: false
                }
            },

            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
}
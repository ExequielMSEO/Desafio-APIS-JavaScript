const amountInput = document.getElementById('amount');
const currencySelect = document.getElementById('currency');
const convertBtn = document.getElementById('convert-btn');
const resultDiv = document.getElementById('result');
const errorDiv = document.getElementById('error');
const chartContainer = document.getElementById('chart-container');
const ctx = document.getElementById('currency-chart').getContext('2d');

let myChart = null;

convertBtn.addEventListener('click', convertCurrency);

async function convertCurrency() {
    const amount = parseFloat(amountInput.value);
    const currency = currencySelect.value;
    
    resultDiv.textContent = '';
    errorDiv.textContent = '';
    
    if (isNaN(amount) || amount <= 0) {
        errorDiv.textContent = 'Por favor, ingrese un monto válido.';
        chartContainer.style.display = 'none';
        return;
    }
    
    if (!currency) {
        errorDiv.textContent = 'Por favor, seleccione una moneda.';
        chartContainer.style.display = 'none';
        return;
    }
    
    resultDiv.textContent = 'Cargando...';
    
    try {
        const response = await fetch(`https://mindicador.cl/api/${currency}`);
        const data = await response.json();
        
        if (!data || !data.serie || data.serie.length === 0) {
            throw new Error('No se pudo obtener el tipo de cambio.');
        }
        
        const exchangeRate = data.serie[0].valor;
        
        const result = amount / exchangeRate;
        
        const currencySymbol = getCurrencySymbol(currency);
        resultDiv.textContent = `Resultado: ${currencySymbol}${result.toFixed(2)}`;
        
        createChart(data.serie.slice(0, 10), currency);
        
    } catch (error) {
        errorDiv.textContent = `Error: ${error.message || 'Ocurrió un error al procesar la solicitud.'}`;
        chartContainer.style.display = 'none';
    }
}

function getCurrencySymbol(currency) {
    switch(currency) {
        case 'dolar': return '$';
        case 'euro': return '€';
        case 'uf': return 'UF ';
        case 'utm': return 'UTM ';
        default: return '';
    }
}

function createChart(data, currency) {
    const chartData = data.reverse();
    
    const labels = chartData.map(item => {
        const date = new Date(item.fecha);
        return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
    });
    
    const values = chartData.map(item => item.valor);
    
    if (myChart) {
        myChart.destroy();
    }
    
    myChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: `Valor ${getCurrencyName(currency)} últimos 10 días`,
                data: values,
                borderColor: '#ff4081',
                backgroundColor: 'rgba(255, 64, 129, 0.1)',
                tension: 0.1,
                borderWidth: 2,
                pointRadius: 3
            }]
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: false,
                    ticks: {
                        callback: function(value) {
                            return value.toFixed(1);
                        }
                    }
                }
            },
            plugins: {
                legend: {
                    position: 'top',
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return `${getCurrencyName(currency)}: ${context.parsed.y}`;
                        }
                    }
                }
            }
        }
    });
    
    chartContainer.style.display = 'block';
}

function getCurrencyName(currency) {
    switch(currency) {
        case 'dolar': return 'Dólar';
        case 'euro': return 'Euro';
        case 'uf': return 'UF';
        case 'utm': return 'UTM';
        default: return currency;
    }
}
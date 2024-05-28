import React, {useEffect, useState} from 'react';
import Chart from 'chart.js/auto';
import {Chart as ChartJS, registerables} from 'chart.js';
import zoomPlugin from 'chartjs-plugin-zoom';
import 'chartjs-adapter-date-fns';
import './BMEData.css';

ChartJS.register(...registerables, zoomPlugin);

const BMEData = () => {
    // Stav pre aktuálne údaje z BME280 senzora
    const [bmeData, setBMEData] = useState(null);

    // Stav pre aktuálny časový rozsah pre historické údaje
    const [timeRange, setTimeRange] = useState('1h');

    // Funkcia na získanie aktuálnych údajov z BME senzora
    const fetchBMEData = () => {
        const apiUrl = `http://192.168.1.100/fetch_bme.php`;

        fetch(apiUrl)
            .then(response => response.json())
            .then(data => {
                if (data && data.temperature && data.humidity && data.pressure) {
                    setBMEData(data);
                }
            })
            .catch(error => console.error('Chyba pri získavaní údajov z BME:', error));
    };

    // Effekt pre načítanie aktuálnych údajov pri načítaní komponentu a nastavenie intervalu na periodické získavanie údajov
    useEffect(() => {
        fetchBMEData();

        const intervalId = setInterval(() => {
            fetchBMEData();
        }, 7000);

        return () => clearInterval(intervalId);
    }, []);

    // Funkcia na získanie historických údajov z BME senzora zo servera
    const fetchHistoricalData = () => {
        const apiUrl = `http://192.168.1.100/fetch_bme_historical.php?timeRange=${timeRange}`;

        fetch(apiUrl)
            .then(response => response.json())
            .then(data => {
                if (data && data.length > 0) {
                    // Predpokladá sa formát údajov { temperature: number, humidity: number, pressure: number, timestamp: string }
                    const historicalData = data.map(entry => ({
                        x: new Date(entry.timestamp),
                        yTemperature: entry.temperature,
                        yHumidity: entry.humidity,
                        yPressure: entry.pressure,
                    }));

                    // Vykreslenie historických údajov pomocou Chart.js
                    renderHistoricalCharts(historicalData);
                }
            })
            .catch(error => console.error('Chyba pri získavaní historických údajov z BME:', error));
    };

    // Effekt pre získanie historických údajov pri zmene časového rozsahu
    useEffect(() => {
        fetchHistoricalData();

        const intervalId = setInterval(() => {
            fetchHistoricalData();
        }, 10000); // Refresh každých 10 sekúnd

        return () => clearInterval(intervalId);

    }, [timeRange]);

    // Funkcia pre vykreslenie jednotlivých grafov pre historické údaje
    const renderHistoricalCharts = historicalData => {
        renderChart('temperatureChart', 'Teplota (°C)', historicalData.map(entry => ({
            x: entry.x,
            y: entry.yTemperature
        })), '#e74c3c');
        renderChart('humidityChart', 'Vlhkosť (%)', historicalData.map(entry => ({
            x: entry.x,
            y: entry.yHumidity
        })), '#3498db');
        renderChart('pressureChart', 'Tlak (hPa)', historicalData.map(entry => ({
            x: entry.x,
            y: entry.yPressure
        })), '#2ecc71');
    };

    // Funkcia pre vykreslenie jedného grafu pomocou Chart.js
    const renderChart = (canvasId, label, data, borderColor) => {
        const ctx = document.getElementById(canvasId);

        // Zničenie existujúcej inštancie grafu, ak existuje
        if (ctx.chart) {
            ctx.chart.destroy();
        }

        const myChart = new Chart(ctx, {
            type: 'line',
            data: {
                datasets: [{
                    label: label,
                    data: data,
                    borderColor: borderColor,
                    borderWidth: 1,
                    pointRadius: 3,
                    pointHoverRadius: 5,
                    pointBackgroundColor: '#1abc9c',
                    fill: false,
                }],
            },
            options: {
                scales: {
                    x: {
                        type: 'time',
                        time: {
                            unit: 'minute',
                            displayFormats: {
                                minute: 'HH:mm',
                            },
                        },
                        title: {
                            display: true,
                            text: 'Čas',
                        },
                    },
                    y: {
                        title: {
                            display: true,
                            text: label,
                        },
                    },
                },
                plugins: {
                    zoom: {
                        pan: {
                            enabled: true,
                            mode: 'xy',
                        },
                        zoom: {
                            wheel: {
                                enabled: true,
                                mode: 'xy',
                            },
                        }
                    }
                }
            },
        });

        ctx.chart = myChart;
    };

    // Vykreslenie komponentu
    return (
        <div className="bme-data">
            <h2>BME Údaje</h2>
            {bmeData ? (
                <div>
                    <div className="bme-item">
                        <h4>Teplota</h4>
                        <p>{bmeData.temperature} °C</p>
                        <div className="bme-bar" style={{width: `${(bmeData.temperature / 50) * 100}%`}}></div>
                    </div>
                    <div className="bme-item">
                        <h4>Vlhkosť</h4>
                        <p>{bmeData.humidity} %</p>
                        <div className="bme-bar" style={{width: `${(bmeData.humidity / 100) * 100}%`}}></div>
                    </div>
                    <div className="bme-item">
                        <h4>Tlak</h4>
                        <p>{bmeData.pressure} hPa</p>
                        <div className="bme-bar" style={{width: `${(bmeData.pressure / 1200) * 100}%`}}></div>
                    </div>
                </div>
            ) : (
                <p>Načítavajú sa BME údaje...</p>
            )}

            {/* Zobrazenie historických údajov ako samostatných čiarových grafov */}
            <div className="historical-chart-bme">
                <label>Časový Rozsah Historických Údajov: </label>
                <select value={timeRange} onChange={e => setTimeRange(e.target.value)}>
                    <option value="1h">1 Hodina</option>
                    <option value="2h">2 Hodiny</option>
                    <option value="4h">4 Hodiny</option>
                    <option value="6h">6 Hodín</option>
                    <option value="12h">12 Hodín</option>
                    <option value="1d">1 Deň</option>
                    <option value="1w">1 Týždeň</option>
                    {/* Pridajte ďalšie možnosti podľa potreby */}
                </select>

                {/* Samostatné canvas elementy pre každý graf */}
                <canvas id="temperatureChart"></canvas>
                <canvas id="humidityChart"></canvas>
                <canvas id="pressureChart"></canvas>
            </div>
        </div>
    );
};

export default BMEData;

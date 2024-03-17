import React, {useEffect, useRef, useState} from 'react';
import Chart from 'chart.js/auto';
import 'chartjs-adapter-date-fns';
import './Gas.css';

const Gas = () => {
    // State pre aktuálnu hodnotu plynu (v ppm)
    const [ppm, setPpm] = useState(null);

    // Ref pre uchovávanie historických údajov o plyne
    const historicalDataRef = useRef([]);

    // Ref pre uchovávanie odkazu na Chart.js graf
    const chartRef = useRef(null);

    // State pre aktuálny časový rozsah pre historické údaje
    const [timeRange, setTimeRange] = useState('1h');

    // Funkcia na získanie údajov o plyne zo servera
    const fetchData = () => {
        const apiUrl = `http://192.168.0.74/fetch_gas_historical.php?timeRange=${timeRange}`;

        fetch(apiUrl)
            .then(response => response.json())
            .then(data => {
                if (data && data.length > 0) {
                    // Získanie najnovšej hodnoty ppm
                    const newPpm = data[data.length - 1].ppm;
                    setPpm(newPpm);

                    // Prevod údajov na formát očakávaný Chart.js (x, y)
                    const historicalData = data.map(entry => ({
                        x: new Date(entry.timestamp),
                        y: entry.ppm,
                    }));
                    historicalDataRef.current = historicalData;
                }
            })
            .catch(error => console.error('Chyba pri získavaní údajov o plyne:', error));
    };

    // Effekt pre načítanie údajov pri načítaní komponentu a nastavení intervalu na periodické získavanie údajov
    useEffect(() => {
        fetchData();

        const fetchIntervalId = setInterval(() => {
            fetchData();
        }, 7000);

        return () => {
            clearInterval(fetchIntervalId);
        };
    }, [timeRange]);

    // Effekt pre vytvorenie alebo aktualizáciu Chart.js grafu na základe zmien v hodnote ppm
    useEffect(() => {
        const ctx = document.getElementById('gasChart');

        if (chartRef.current) {
            chartRef.current.destroy();
        }

        const maxPpmValue = Math.max(...historicalDataRef.current.map(entry => entry.y), 500);
        const yAxisMax = Math.ceil(maxPpmValue / 1000) * 1000;

        const myChart = new Chart(ctx, {
            type: 'line',
            data: {
                datasets: [{
                    label: 'Plyn PPM',
                    data: historicalDataRef.current,
                    borderColor: '#3498db',
                    borderWidth: 1, // Increase the width of the lines
                    pointRadius: 3, // Adjust the size of the points
                    pointHoverRadius: 5, // Adjust the size of the points on hover
                    pointBackgroundColor: '#1abc9c', // Color for the points
                    pointStyle: 'circle', // Use circles for data points
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
                        ticks: {
                            maxTicksLimit: 10, // Adjust the maximum number of x-axis ticks
                        },
                    },
                    y: {
                        title: {
                            display: true,
                            text: 'Plyn PPM',
                        },
                        min: 0,
                        max: yAxisMax,
                        ticks: {
                            stepSize: yAxisMax / 10, // Adjust the number of y-axis ticks as needed
                        },
                    },
                },
            },
        });

        chartRef.current = myChart;

        return () => {
            myChart.destroy();
        };
    }, [ppm, historicalDataRef.current]);

    // Effekt pre periodické vymazanie historických údajov na zachovanie pamäti
    useEffect(() => {
        const resetIntervalId = setInterval(() => {
            historicalDataRef.current = [];
            chartRef.current?.update();
        }, 15 * 60 * 1000);

        return () => {
            clearInterval(resetIntervalId);
        };
    }, []);

    // Funkcia na obsluhu zmeny časového rozsahu
    const handleTimeRangeChange = newTimeRange => {
        setTimeRange(newTimeRange);
        fetchData();
    };

    // Vykreslenie komponentu
    return (
        <div className="gas">
            <h2>Plyn PPM</h2>
            <h4>Plyn PPM meraný senzorom plynu</h4>
            <p>{ppm !== null ? `${ppm} PPM` : 'Načítava sa...'}</p>
            <div className="gas-bar-container">
                <div className="gas-bar" style={{width: ppm ? `${Math.min((ppm / 7000) * 100, 100)}%` : '0%'}}></div>
            </div>

            <h3>Historické Údaje</h3>
            <div className="historical-chart-gas">
                <canvas id="gasChart"></canvas>
            </div>

            <div className="time-range-selector">
                <label>Časový Rozsah: </label>
                <select value={timeRange} onChange={e => handleTimeRangeChange(e.target.value)}>
                    <option value="1h">1 Hodina</option>
                    <option value="2h">2 Hodiny</option>
                    <option value="4h">4 Hodiny</option>
                    <option value="6h">6 Hodín</option>
                    <option value="12h">12 Hodín</option>
                    <option value="1d">1 Deň</option>
                    <option value="1w">1 Týždeň</option>
                </select>
            </div>
        </div>
    );
};

export default Gas;
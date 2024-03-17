import React, {useEffect, useRef, useState} from 'react';
import Chart from 'chart.js/auto';
import 'chartjs-adapter-date-fns';
import './Distance.css';

const Distance = () => {
    // Stav pre aktuálnu vzdialenosť (v cm)
    const [distance, setDistance] = useState(null);

    // Ref pre uchovávanie historických údajov o vzdialenosti
    const historicalDataRef = useRef([]);

    // Ref pre uchovávanie odkazu na Chart.js graf
    const chartRef = useRef(null);

    // Stav pre aktuálny časový rozsah pre historické údaje
    const [timeRange, setTimeRange] = useState('1h');

    // Funkcia na získanie údajov o vzdialenosti zo servera
    const fetchData = () => {
        const apiUrl = `http://192.168.0.74/fetch_distance_historical.php?timeRange=${timeRange}`;

        fetch(apiUrl)
            .then(response => response.json())
            .then(data => {
                if (data && data.length > 0) {
                    // Získanie najnovšej hodnoty vzdialenosti
                    const newDistance = data[data.length - 1].distance;
                    setDistance(newDistance);

                    // Prevod údajov na formát očakávaný Chart.js (x, y)
                    const historicalData = data.map(entry => ({
                        x: new Date(entry.timestamp),
                        y: entry.distance,
                    }));
                    historicalDataRef.current = historicalData;
                }
            })
            .catch(error => console.error('Chyba pri získavaní údajov o vzdialenosti:', error));
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

    // Effekt pre vytvorenie alebo aktualizáciu Chart.js grafu na základe zmien v hodnote vzdialenosti
    useEffect(() => {
        const ctx = document.getElementById('distanceChart');

        if (chartRef.current) {
            chartRef.current.destroy();
        }

        const myChart = new Chart(ctx, {
            type: 'line',
            data: {
                datasets: [{
                    label: 'Vzdialenosť (cm)',
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
                    },
                    y: {
                        title: {
                            display: true,
                            text: 'Vzdialenosť (cm)',
                        },
                        // Add other options as needed
                    },
                },
            },
        });

        chartRef.current = myChart;

        return () => {
            myChart.destroy();
        };
    }, [distance]);

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
        <div className="distance">
            <h2>Vzdialenosť</h2>
            <h4>Vzdialenosť meraná senzorom HY-SRF05</h4>
            <p>{distance !== null ? `${distance} cm` : 'Načítava sa...'}</p>

            {/* Zobrazenie historických údajov ako čiarový graf */}
            <h3>Historické Údaje</h3>
            <div className="historical-chart-distance">
                <canvas id="distanceChart"></canvas>
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
                    {/* Pridajte ďalšie možnosti podľa potreby */}
                </select>
            </div>
        </div>
    );
};

export default Distance;

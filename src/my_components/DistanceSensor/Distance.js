import React, {useEffect, useRef, useState} from 'react';
import Chart from 'chart.js/auto';
import {Chart as ChartJS, registerables} from 'chart.js';
import zoomPlugin from 'chartjs-plugin-zoom';
import 'chartjs-adapter-date-fns';
import './Distance.css';

// Registrácia potrebných komponentov pre Chart.js
ChartJS.register(...registerables, zoomPlugin);

const Distance = () => {
    // Definovanie stavov a referencií
    const [distance, setDistance] = useState(null);
    const historicalDataRef = useRef([]);
    const chartRef = useRef(null);
    const [timeRange, setTimeRange] = useState('1h');

    // Funkcia na získanie dát z API
    const fetchData = () => {
        const apiUrl = `http://192.168.1.100/fetch_distance_historical.php?timeRange=${timeRange}`;
        fetch(apiUrl)
            .then(response => response.json())
            .then(data => {
                if (data && data.length > 0) {
                    const newDistance = data[data.length - 1].distance;
                    setDistance(newDistance);
                    const historicalData = data.map(entry => ({
                        x: new Date(entry.timestamp),
                        y: entry.distance,
                    }));
                    historicalDataRef.current = historicalData;
                    updateChart();
                }
            })
            .catch(error => console.error('Error fetching distance data:', error));
    };

    // useEffect na inicializáciu získavania dát a periodické obnovovanie
    useEffect(() => {
        fetchData();
        const fetchIntervalId = setInterval(fetchData, 10000);
        return () => clearInterval(fetchIntervalId);
    }, [timeRange]);

    // Funkcia na aktualizáciu grafu
    const updateChart = () => {
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
                            text: 'Vzdialenosť (cm)',
                        },
                    },
                },
                plugins: {
                    zoom: {
                        pan: {
                            enabled: true,
                            mode: 'xy',
                            speed: 5,
                            threshold: 10,
                            rangeMin: {
                                x: 0,
                                y: 0
                            },
                            rangeMax: {
                                x: null,
                            },
                        },
                        zoom: {
                            wheel: {
                                enabled: true,
                                speed: 0.02,
                            },
                            pinch: {
                                enabled: false,
                                mode: 'xy'
                            },
                            mode: 'xy',
                            rangeMin: {
                                x: null,
                                y: 0
                            },
                            rangeMax: {
                                x: null,
                            },
                            limits: {
                                max: 10,
                                min: 0.1
                            }
                        },
                    }
                }
            },
        });

        chartRef.current = myChart;
    };

    // useEffect na aktualizáciu grafu pri zmene historických dát
    useEffect(() => {
        updateChart();
    }, [historicalDataRef.current]);

    // useEffect na resetovanie historických dát
    useEffect(() => {
        const resetIntervalId = setInterval(() => {
            historicalDataRef.current = [];
            chartRef.current?.update();
        }, 15 * 60 * 1000);
        return () => clearInterval(resetIntervalId);
    }, []);

    // Funkcia na zmenu časového rozsahu
    const handleTimeRangeChange = newTimeRange => {
        setTimeRange(newTimeRange);
        fetchData();
    };

    // Renderovanie komponentu Distance
    return (
        <div className="distance">
            <h2>Vzdialenosť</h2>
            <h4>Vzdialenosť nameraná senzorom HY-SRF05</h4>
            <p>{distance !== null ? `${distance} cm` : 'Načítava sa...'}</p>
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
                </select>
            </div>
        </div>
    );
};

export default Distance;

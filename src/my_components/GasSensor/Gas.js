import React, {useEffect, useRef, useState} from 'react';
import Chart from 'chart.js/auto';
import {Chart as ChartJS, registerables} from 'chart.js'; // Import base ChartJS
import zoomPlugin from 'chartjs-plugin-zoom'; // Import zoom plugin correctly
import 'chartjs-adapter-date-fns';
import './Gas.css';

ChartJS.register(...registerables, zoomPlugin); // Register zoom plugin explicitly

const Gas = () => {
    const [ppm, setPpm] = useState(null);
    const historicalDataRef = useRef([]);
    const chartRef = useRef(null);
    const [timeRange, setTimeRange] = useState('1h');

    const fetchData = () => {
        const apiUrl = `http://192.168.1.100/fetch_gas_historical.php?timeRange=${timeRange}`;
        fetch(apiUrl)
            .then(response => response.json())
            .then(data => {
                if (data && data.length > 0) {
                    const newPpm = data[data.length - 1].ppm;
                    setPpm(newPpm);
                    const historicalData = data.map(entry => ({
                        x: new Date(entry.timestamp),
                        y: entry.ppm,
                    }));
                    historicalDataRef.current = historicalData;
                    updateChart();  // Call updateChart directly here
                }
            })
            .catch(error => console.error('Error fetching gas data:', error));
    };

    useEffect(() => {
        fetchData();
        const fetchIntervalId = setInterval(fetchData, 7000);
        return () => clearInterval(fetchIntervalId);
    }, [timeRange]);

    const updateChart = () => {
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
                    label: 'Plyn (PPM)',
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
                        ticks: {
                            maxTicksLimit: 10,
                        },
                    },
                    y: {
                        title: {
                            display: true,
                            text: 'Plyn (PPM)',
                        },
                        min: 0,
                        max: yAxisMax,
                        ticks: {
                            stepSize: yAxisMax / 10,
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
                                y: yAxisMax
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
                                y: yAxisMax
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

    useEffect(() => {
        updateChart(); // Ensure chart updates whenever the historical data changes
    }, [historicalDataRef.current]);

    const handleTimeRangeChange = newTimeRange => {
        setTimeRange(newTimeRange);
        fetchData(); // Ensure data is fetched immediately on time range change
    };

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

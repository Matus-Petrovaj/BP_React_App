import React, {useEffect, useRef, useState} from 'react';
import Chart from 'chart.js/auto';
import {Chart as ChartJS, registerables} from 'chart.js';
import zoomPlugin from 'chartjs-plugin-zoom';
import 'chartjs-adapter-date-fns';
import './Gas.css';

ChartJS.register(...registerables, zoomPlugin);

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
                    updateChart();
                }
            })
            .catch(error => console.error('Error fetching gas data:', error));
    };

    useEffect(() => {
        fetchData();
        const fetchIntervalId = setInterval(fetchData, 10000);
        return () => clearInterval(fetchIntervalId);
    }, [timeRange]);

    const updateChart = () => {
        const ctx = document.getElementById('gasChart');
        if (chartRef.current) {
            chartRef.current.destroy();
        }

        const downsamplingRate = getDownsamplingRate(timeRange);
        const filteredData = historicalDataRef.current.filter((_, index) => index % downsamplingRate === 0);


        const maxY = Math.max(...filteredData.map(entry => entry.y), 500);
        const yAxisMax = Math.ceil(maxY / 1000) * 1000;

        const stepSize = yAxisMax / 10;

        const myChart = new Chart(ctx, {
            type: 'line',
            data: {
                datasets: [{
                    label: 'Plyn (PPM)',
                    data: filteredData,
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
                            stepSize: stepSize
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

    const getDownsamplingRate = (timeRange) => {
        switch (timeRange) {
            case '1h':
                return 1;
            case '2h':
                return 2;
            case '4h':
                return 4;
            case '6h':
                return 6;
            case '12h':
                return 10
            case '1d':
                return 15;
            case '1w':
                return 30;
            default:
                return 1;
        }
    };

    const handleTimeRangeChange = newTimeRange => {
        setTimeRange(newTimeRange);
        fetchData();
    };

    useEffect(() => {
        updateChart();
    }, [historicalDataRef.current]);

    return (
        <div className="gas">
            <h2>Plyn PPM</h2>
            <h4>PPM oxidu uhličitého merané senzorom MQ-135</h4>
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

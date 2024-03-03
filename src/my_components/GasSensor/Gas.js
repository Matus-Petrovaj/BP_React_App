import React, { useEffect, useState, useRef } from 'react';
import Chart from 'chart.js/auto';
import 'chartjs-adapter-date-fns';
import './Gas.css';

const Gas = () => {
    const [ppm, setPpm] = useState(null);
    const historicalDataRef = useRef([]); // Use useRef for historical data
    const chartRef = useRef(null);
    const [timeRange, setTimeRange] = useState('1h'); // Default time range is 1 hour

    const fetchData = () => {
        // Adjust your API endpoint to use the new script for historical data
        const apiUrl = `http://192.168.0.74/fetch_gas_historical.php?timeRange=${timeRange}`;

        fetch(apiUrl)
            .then(response => response.json())
            .then(data => {
                if (data && data.length > 0) {
                    // Assuming data format is { ppm: number, timestamp: string }
                    const newPpm = data[data.length - 1].ppm;
                    setPpm(newPpm);

                    // Assuming historical data format is { ppm: number, timestamp: string }
                    const historicalData = data.map(entry => ({ x: new Date(entry.timestamp), y: entry.ppm }));
                    historicalDataRef.current = historicalData;
                }
            })
            .catch(error => console.error('Error fetching gas data:', error));
    };


    useEffect(() => {
        fetchData();

        const fetchIntervalId = setInterval(() => {
            fetchData();
        }, 5000);

        return () => {
            clearInterval(fetchIntervalId);
        };
    }, [timeRange]); // Add timeRange as a dependency to fetch data based on the selected range


    const maxPpm = 7000;
    const barWidth = ppm ? `${Math.min((ppm / maxPpm) * 100, 100)}%` : '0%';

    useEffect(() => {
        const ctx = document.getElementById('gasChart');

        if (chartRef.current) {
            chartRef.current.destroy();
        }

        const myChart = new Chart(ctx, {
            type: 'line',
            data: {
                datasets: [{
                    label: 'Gas PPM',
                    data: historicalDataRef.current, // Use historicalDataRef instead of historicalData
                    borderColor: '#3498db',
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
                            text: 'Time',
                        },
                    },
                    y: {
                        title: {
                            display: true,
                            text: 'Gas PPM',
                        },
                        min: 0,
                        max: maxPpm,
                    },
                },
            },
        });

        chartRef.current = myChart;

        return () => {
            myChart.destroy();
        };
    }, [ppm]); // Update the chart when ppm changes

    useEffect(() => {
        const resetIntervalId = setInterval(() => {
            historicalDataRef.current = []; // Clear historical data using useRef
            chartRef.current?.update();
        }, 15 * 60 * 1000);

        return () => {
            clearInterval(resetIntervalId);
        };
    }, []);

    // Add a function to handle time range selection
    const handleTimeRangeChange = newTimeRange => {
        setTimeRange(newTimeRange);
        fetchData(); // Fetch data immediately when time range changes
    };

    return (
        <div className="gas">
            <h2>Gas PPM</h2>
            <h4>Gas PPM measured by your gas sensor</h4>
            <p>{ppm !== null ? `${ppm} PPM` : 'Loading...'}</p>
            <div className="gas-bar-container">
                <div className="gas-bar" style={{width: barWidth}}></div>
            </div>

            {/* Display historical data as a line chart */}
            <h3>Historical Data</h3>
            <div className="historical-chart">
                <canvas id="gasChart"></canvas>
            </div>

            <div className="time-range-selector">
                <label>Time Range: </label>
                <select value={timeRange} onChange={e => handleTimeRangeChange(e.target.value)}>
                    <option value="1h">1 Hour</option>
                    <option value="2h">2 Hours</option>
                    <option value="4h">4 Hours</option>
                    <option value="6h">6 Hours</option>
                    <option value="12h">12 Hours</option>
                    <option value="1d">1 Day</option>
                    <option value="1w">1 Week</option>
                    {/* Add more options as needed */}
                </select>
            </div>
        </div>
    );
};

export default Gas;
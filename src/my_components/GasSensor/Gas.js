import React, { useEffect, useState } from 'react';
import './Gas.css';

const Gas = () => {
    const [ppm, setPpm] = useState(null);

    const fetchData = () => {
        fetch('http://192.168.0.74/fetch_gas.php')
            .then(response => response.json())
            .then(data => {
                if (data && data.ppm) {
                    setPpm(data.ppm);
                }
            })
            .catch(error => console.error('Error fetching gas data:', error));
    };

    useEffect(() => {
        fetchData(); // Fetch data initially when component mounts

        const intervalId = setInterval(() => {
            fetchData(); // Fetch data every 5 seconds (for example)
        }, 1000); // Adjust the interval as needed (in milliseconds)

        return () => clearInterval(intervalId); // Cleanup on component unmount
    }, []);

    const maxPpm = 10000; // Maximum PPM value
    const barWidth = ppm ? `${Math.min((ppm / maxPpm) * 100, 100)}%` : '0%';

    return (
        <div className="gas">
            <h2>Gas PPM</h2>
            <h4>Gas PPM measured by your gas sensor</h4>
            <p>{ppm !== null ? `${ppm} PPM` : 'Loading...'}</p>
            <div className="gas-bar-container">
                <div className="gas-bar" style={{ width: barWidth }}></div>
            </div>
        </div>
    );
};

export default Gas;
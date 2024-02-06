import React, { useEffect, useState } from 'react';
import './BMEData.css';

const BMEData = () => {
    const [bmeData, setBMEData] = useState(null);

    const fetchBMEData = () => {
        fetch('http://192.168.0.74/fetch_bme.php')
            .then(response => response.json())
            .then(data => {
                if (data && data.temperature && data.humidity && data.pressure) {
                    setBMEData(data);
                }
            })
            .catch(error => console.error('Error fetching BME data:', error));
    };

    useEffect(() => {
        fetchBMEData(); // Fetch data initially when component mounts

        const intervalId = setInterval(() => {
            fetchBMEData(); // Fetch data every 5 seconds (for example)
        }, 1000); // Adjust the interval as needed (in milliseconds)

        return () => clearInterval(intervalId); // Cleanup on component unmount
    }, []);

    return (
        <div className="bme-data">
            <h2>BME Data</h2>
            {bmeData ? (
                <div>
                    <div className="bme-item">
                        <h4>Temperature</h4>
                        <p>{bmeData.temperature} °C</p>
                        <div className="bme-bar" style={{ width: `${(bmeData.temperature / 50) * 100}%` }}></div>
                    </div>
                    <div className="bme-item">
                        <h4>Humidity</h4>
                        <p>{bmeData.humidity} %</p>
                        <div className="bme-bar" style={{ width: `${(bmeData.humidity / 100) * 100}%` }}></div>
                    </div>
                    <div className="bme-item">
                        <h4>Pressure</h4>
                        <p>{bmeData.pressure} hPa</p>
                        <div className="bme-bar" style={{ width: `${(bmeData.pressure / 1200) * 100}%` }}></div>
                    </div>
                </div>
            ) : (
                <p>Loading BME data...</p>
            )}
        </div>
    );
};

export default BMEData;

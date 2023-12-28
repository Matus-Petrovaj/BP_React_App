import React, {useEffect, useState} from 'react';
import './Distance.css';

const Distance = () => {
    const [distance, setDistance] = useState(null);

    const fetchData = () => {
        fetch('http://192.168.0.74/fetch_distance.php')
            .then(response => response.json())
            .then(data => {
                if (data && data.distance) {
                    setDistance(data.distance);
                }
            })
            .catch(error => console.error('Error fetching data:', error));
    };

    useEffect(() => {
        fetchData(); // Fetch data initially when component mounts

        const intervalId = setInterval(() => {
            fetchData(); // Fetch data every 5 seconds (for example)
        }, 1000); // Adjust the interval as needed (in milliseconds)

        return () => clearInterval(intervalId); // Cleanup on component unmount
    }, []);

    const barWidth = distance ? `${((distance - 2) / 448) * 100}%` : '0%';

    return (
        <div className="distance">
            <h2>Distance</h2>
            <h4>Distance measured by HY-SRF05 sensor</h4>
            <p>{distance !== null ? `${distance} cm` : 'Loading...'}</p>
            <div className="distance-bar" style={{width: barWidth}}></div>
        </div>
    );
};

export default Distance;

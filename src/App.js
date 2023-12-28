import './App.css';
import './my_components/Menu/Menu.css'; // Import Menu.css for button styles
import React, { useState } from 'react';
import Header from './my_components/Header/Header';
import Body from './my_components/Body/Body';
import Distance from './my_components/DistanceSensor/Distance';
import BMEData from './my_components/BMESensor/BMEData';

function App() {
    const [displayType, setDisplayType] = useState('distance'); // State to manage display type

    return (
        <div className="App">
            <Header />

            {/* Menu */}
            <div className="Menu">
                <button onClick={() => setDisplayType('distance')}>Display Distance</button>
                <button onClick={() => setDisplayType('bmeData')}>Display BME Data</button>
            </div>

            {/* Components based on selection */}
            {displayType === 'distance' && (
                <div className="Elements">
                    <Distance />
                </div>
            )}

            {displayType === 'bmeData' && (
                <div className="Elements">
                    <BMEData />
                </div>
            )}

            <Body />
        </div>
    );
}

export default App;

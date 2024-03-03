import './App.css';
import './my_components/Menu/Menu.css'; // Import Menu.css for button styles
import React, { useState } from 'react';
import Header from './my_components/Header/Header';
import Body from './my_components/Body/Body';
import Distance from './my_components/DistanceSensor/Distance';
import BMEData from './my_components/BMESensor/BMEData';
import Gas from './my_components/GasSensor/Gas'; // Import the new Gas component
import { GasProvider } from './my_components/GasSensor/GasContext'; // Import the GasProvider

function App() {
    const [displayType, setDisplayType] = useState('distance'); // State to manage display type

    return (
        <GasProvider> {/* Wrap your entire application with the GasProvider */}
            <div className="App">
                <Header />

                {/* Menu */}
                <div className="Menu">
                    <button onClick={() => setDisplayType('distance')}>Display Distance</button>
                    <button onClick={() => setDisplayType('bmeData')}>Display BME Data</button>
                    <button onClick={() => setDisplayType('gas')}>Display Air Quality</button>
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

                {displayType === 'gas' && (
                    <div className="Elements">
                        <Gas />
                    </div>
                )}

                <Body />
            </div>
        </GasProvider>
    );
}

export default App;
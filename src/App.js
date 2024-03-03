import './App.css';
import './my_components/Menu/Menu.css';
import React, {useState} from 'react';
import Header from './my_components/Header/Header';
import Body from './my_components/Body/Body';
import Distance from './my_components/DistanceSensor/Distance';
import BMEData from './my_components/BMESensor/BMEData';
import Gas from './my_components/GasSensor/Gas';

function App() {
    const [displayType, setDisplayType] = useState('distance');

    return (
        <div className="App">
            {/* Hlavička */}
            <Header/>

            {/* Menu pre prepínanie zobrazenia */}
            <div className="Menu">
                <button onClick={() => setDisplayType('distance')}>Zobraziť Vzdialenosť</button>
                <button onClick={() => setDisplayType('bmeData')}>Zobraziť BME Dáta</button>
                <button onClick={() => setDisplayType('gas')}>Zobraziť Kvalitu Vzduchu</button>
            </div>

            {/* Podľa zvoleného zobrazenia sa vyrenderuje príslušný komponent */}
            {displayType === 'distance' && (
                <div className="Elements">
                    <Distance/>
                </div>
            )}

            {displayType === 'bmeData' && (
                <div className="Elements">
                    <BMEData/>
                </div>
            )}

            {displayType === 'gas' && (
                <div className="Elements">
                    <Gas/>
                </div>
            )}

            {/* Telo stránky */}
            <Body/>
        </div>
    );
}

export default App;

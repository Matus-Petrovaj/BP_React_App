import React, { createContext, useContext, useState } from 'react';

const GasContext = createContext();

export const GasProvider = ({ children }) => {
    const [historicalData, setHistoricalData] = useState([]);

    const updateHistoricalData = newData => {
        setHistoricalData(prevData => [...prevData, newData]);
    };

    return (
        <GasContext.Provider value={{ historicalData, updateHistoricalData }}>
            {children}
        </GasContext.Provider>
    );
};

export const useGasContext = () => useContext(GasContext);

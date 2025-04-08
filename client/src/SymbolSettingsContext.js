import React, { createContext, useState } from 'react';

export const SymbolSettingsContext = createContext({
  lineThickness: 3,
  lineColor: '#008000',
  pointSize: 6,
  pointColor: '#0000FF',
  setSymbolSettings: () => {},
});

export const SymbolSettingsProvider = ({ children }) => {
  const [symbolSettings, setSymbolSettings] = useState({
    lineThickness: 3,
    lineColor: '#008000',
    pointSize: 6,
    pointColor: '#0000FF',
  });

  return (
    <SymbolSettingsContext.Provider value={{ ...symbolSettings, setSymbolSettings }}>
      {children}
    </SymbolSettingsContext.Provider>
  );
};

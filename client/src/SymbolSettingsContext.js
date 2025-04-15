import React, { createContext, useState } from 'react';

export const SymbolSettingsContext = createContext({
  lineThickness: 3,
  lineColor: '#737373',
  pointSize: 4,
  pointColor: '#000000',
  setSymbolSettings: () => {},
});

export const SymbolSettingsProvider = ({ children }) => {
  const [symbolSettings, setSymbolSettings] = useState({
    lineThickness: 3,
    lineColor: '#737373',
    pointSize: 4,
    pointColor: '#000000',
  });

  return (
    <SymbolSettingsContext.Provider value={{ ...symbolSettings, setSymbolSettings }}>
      {children}
    </SymbolSettingsContext.Provider>
  );
};

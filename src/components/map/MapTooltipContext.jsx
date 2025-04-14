import React, { createContext, useState, useCallback } from "react";

/**
 * Context for managing map tooltips
 * This approach allows tooltips to be rendered at the top level of the SVG
 * ensuring they're always visible above other elements
 */
export const MapTooltipContext = createContext({
  registerTooltip: () => {},
  unregisterTooltip: () => {},
  tooltips: {},
});

/**
 * Provider component for the MapTooltipContext
 *
 * @param {Object} props
 * @param {React.ReactNode} props.children
 */
export const MapTooltipProvider = ({ children }) => {
  const [tooltips, setTooltips] = useState({});

  // Register a tooltip
  const registerTooltip = useCallback((tooltipId, tooltipContent) => {
    setTooltips((prevTooltips) => ({
      ...prevTooltips,
      [tooltipId]: tooltipContent,
    }));
  }, []);

  // Unregister a tooltip
  const unregisterTooltip = useCallback((tooltipId) => {
    setTooltips((prevTooltips) => {
      const newTooltips = { ...prevTooltips };
      delete newTooltips[tooltipId];
      return newTooltips;
    });
  }, []);

  const value = {
    registerTooltip,
    unregisterTooltip,
    tooltips,
  };

  return (
    <MapTooltipContext.Provider value={value}>
      {children}
    </MapTooltipContext.Provider>
  );
};

export default MapTooltipProvider;

// ZoomState.js

// Retrieve the saved view state from localStorage.
// Returns an object with { center, zoom } or null if not found.
export const getZoomState = () => {
    const saved = localStorage.getItem('zoomState');
    return saved ? JSON.parse(saved) : null;
  };
  
  // Save the current view state (center and zoom) to localStorage.
  export const setZoomState = (center, zoom) => {
    localStorage.setItem('zoomState', JSON.stringify({ center, zoom }));
  };
  
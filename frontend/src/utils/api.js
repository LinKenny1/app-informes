// Automatically detect the correct API URL based on how the frontend was accessed
const getApiUrl = () => {
  // If we're accessing via localhost (development), use localhost for API
  if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    return 'https://localhost:3001/api'
  }
  
  // If accessing via IP or domain, use HTTPS for backend (both frontend and backend now use HTTPS)
  const hostname = window.location.hostname // the IP or domain used to access frontend
  return `https://${hostname}:3001/api`
}

export const API_URL = getApiUrl()
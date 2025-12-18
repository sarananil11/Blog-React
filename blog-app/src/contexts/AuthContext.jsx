// import { useSelector, useEffect } from 'react-redux'
import { Navigate, Outlet } from 'react-router-dom'

export const ProtectedRoute = () => {
  const isAuthenticated = localStorage.getItem('token') !== null
  
  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />
}

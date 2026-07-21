import { Navigate } from "react-router-dom"

function ProtectedRoute({ children }) {
  const access = localStorage.getItem("access")
  const refresh = localStorage.getItem("refresh")

  if (!access || !refresh) {
    return <Navigate to="/login" />
  }

  return children
}

export default ProtectedRoute
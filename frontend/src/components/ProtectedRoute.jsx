import { Navigate } from "react-router-dom";

function ProtectedRoute({ roles = [], children }) {
  const token = localStorage.getItem("token");

  let user = null;

  // =====================================================
  // GET USER FROM LOCAL STORAGE
  // =====================================================

  try {
    const storedUser = localStorage.getItem("user");

    if (storedUser) {
      user = JSON.parse(storedUser);
    }
  } catch (error) {
    console.error(
      "Invalid user data in localStorage:",
      error
    );

    localStorage.removeItem("user");
    localStorage.removeItem("token");
  }

  // =====================================================
  // NOT LOGGED IN
  // =====================================================

  if (!token || !user) {
    return (
      <Navigate
        to="/login"
        replace
      />
    );
  }

  // =====================================================
  // USER ROLE
  // =====================================================

  const userRole = String(
    user.role || ""
  )
    .trim()
    .toLowerCase();

  // =====================================================
  // ROLE CHECK
  // =====================================================

  if (roles.length > 0) {
    const allowedRoles = roles.map((role) =>
      String(role)
        .trim()
        .toLowerCase()
    );

    console.log(
      "Protected Route:",
      {
        userRole,
        allowedRoles,
        user,
      }
    );

    if (!allowedRoles.includes(userRole)) {
      return (
        <Navigate
          to="/unauthorized"
          replace
        />
      );
    }
  }

  // =====================================================
  // AUTHORIZED
  // =====================================================

  return children;
}

export default ProtectedRoute;
import { Navigate, useLocation } from 'react-router-dom';

function ResetPasswordRedirect() {
  const { search } = useLocation();
  return <Navigate to={`/auth${search}`} replace />;
}

export default ResetPasswordRedirect;

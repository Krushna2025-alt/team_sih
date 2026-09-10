import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { PageLoading } from './ui';
import type { Role } from '../../types';
export default function ProtectedRoute({ role }: { role?: Role }) {
const { user, loading } = useAuth();
const loc = useLocation();
if (loading) return <PageLoading />;
if (!user) return <Navigate to="/login" state={{ from: loc.pathname }} replace />;
// Role-based protection: a farmer can never open buyer/admin pages, etc.
if (role && user.role !== role) return <Navigate to={`/${user.role}/dashboard`} replace />;
return <Outlet />;
}

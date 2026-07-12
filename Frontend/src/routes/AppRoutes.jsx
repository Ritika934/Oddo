import { Routes, Route, Navigate } from 'react-router-dom';
import AuthLayout from '../components/layout/AuthLayout';
import DashboardLayout from '../components/layout/DashboardLayout';
import PrivateRoute from './PrivateRoute';
import RoleBasedRoute from './RoleBasedRoute';
import Login from '../pages/auth/Login';
import Register from '../pages/auth/Register';
import Dashboard from '../pages/Dashboard';
import Vehicles from '../pages/Vehicles';
import Drivers from '../pages/Drivers';
import Trips from '../pages/Trips';
import Maintenance from '../pages/Maintenance';
import Fuel from '../pages/Fuel';
import Expenses from '../pages/Expenses';
import Reports from '../pages/Reports';
import AuditLogs from '../pages/AuditLogs';
import FleetAssistant from '../pages/FleetAssistant';
import Unauthorized from '../pages/Unauthorized';
import NotFound from '../pages/NotFound';
import { ROLES } from '../utils/constants';

export default function AppRoutes() {
  return (
    <Routes>
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Route>

      <Route path="/403" element={<Unauthorized />} />

      <Route element={<PrivateRoute />}>
        <Route element={<DashboardLayout />}>
          {/* Shared Access */}
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/fleet-assistant" element={<FleetAssistant />} />

          {/* Vehicles Access: Fleet Manager & Dispatcher */}
          <Route element={<RoleBasedRoute allowedRoles={[ROLES.FLEET_MANAGER, ROLES.DISPATCHER]} />}>
            <Route path="/vehicles" element={<Vehicles />} />
          </Route>

          {/* Drivers Access: Fleet Manager, Safety Officer, Dispatcher */}
          <Route element={<RoleBasedRoute allowedRoles={[ROLES.FLEET_MANAGER, ROLES.SAFETY_OFFICER, ROLES.DISPATCHER]} />}>
            <Route path="/drivers" element={<Drivers />} />
          </Route>

          {/* Trips Access: Dispatcher & Fleet Manager */}
          <Route element={<RoleBasedRoute allowedRoles={[ROLES.DISPATCHER, ROLES.FLEET_MANAGER]} />}>
            <Route path="/trips" element={<Trips />} />
          </Route>

          {/* Maintenance Access: Fleet Manager & Safety Officer */}
          <Route element={<RoleBasedRoute allowedRoles={[ROLES.FLEET_MANAGER, ROLES.SAFETY_OFFICER]} />}>
            <Route path="/maintenance" element={<Maintenance />} />
          </Route>

          {/* Fuel Logs Access: Fleet Manager & Finance Analyst */}
          <Route element={<RoleBasedRoute allowedRoles={[ROLES.FLEET_MANAGER, ROLES.FINANCE_ANALYST]} />}>
            <Route path="/fuel" element={<Fuel />} />
          </Route>

          {/* Expenses Access: Finance Analyst & Fleet Manager */}
          <Route element={<RoleBasedRoute allowedRoles={[ROLES.FINANCE_ANALYST, ROLES.FLEET_MANAGER]} />}>
            <Route path="/expenses" element={<Expenses />} />
          </Route>

          {/* Audit Logs Access: Fleet Manager only */}
          <Route element={<RoleBasedRoute allowedRoles={[ROLES.FLEET_MANAGER]} />}>
            <Route path="/audit-logs" element={<AuditLogs />} />
          </Route>
        </Route>
      </Route>

      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

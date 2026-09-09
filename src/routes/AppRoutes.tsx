import React, { Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import AppLayout from '../components/layout/AppLayout';
import ProtectedRoute from '../components/common/ProtectedRoute';
import LoginPage from '../pages/Login/LoginPage';

const Dashboard         = lazy(() => import('../pages/Dashboard/DashboardPage'));
const SalesPage         = lazy(() => import('../pages/Sales/SalesPage'));
const DTEPage           = lazy(() => import('../pages/DTE/DTEPage'));
const DTEViewPage       = lazy(() => import('../pages/DTE/DTEViewPage'));
const CustomersPage     = lazy(() => import('../pages/Customers/CustomersPage'));
const ProductsPage      = lazy(() => import('../pages/Products/ProductsPage'));
const InventoryPage     = lazy(() => import('../pages/Inventory/InventoryPage'));
const ARPage            = lazy(() => import('../pages/AR/ARPage'));
const ReportsPage       = lazy(() => import('../pages/Reports/ReportsPage'));
const UsersPage         = lazy(() => import('../pages/Users/UsersPage'));
const SettingsPage      = lazy(() => import('../pages/Settings/SettingsPage'));
const AuditPage         = lazy(() => import('../pages/Audit/AuditPage'));
const UnauthorizedPage  = lazy(() => import('../pages/Unauthorized/UnauthorizedPage'));
const VerifyDTEPage     = lazy(() => import('../pages/DTE/VerifyDTEPage'));

function Loading() {
  return (
    <div className="d-flex justify-content-center align-items-center" style={{ minHeight: 300 }}>
      <div className="spinner-border text-primary" role="status">
        <span className="visually-hidden">Cargando...</span>
      </div>
    </div>
  );
}

export default function AppRoutes() {
  return (
    <Suspense fallback={<Loading />}>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/verify/:code" element={<VerifyDTEPage />} />
        <Route path="/unauthorized" element={<UnauthorizedPage />} />

        <Route path="/" element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard"  element={<ProtectedRoute module="dashboard"><Dashboard /></ProtectedRoute>} />
          <Route path="sales"      element={<ProtectedRoute module="sales"><SalesPage /></ProtectedRoute>} />
          <Route path="dte"        element={<ProtectedRoute module="dte"><DTEPage /></ProtectedRoute>} />
          <Route path="dte/:id"    element={<ProtectedRoute module="dte"><DTEViewPage /></ProtectedRoute>} />
          <Route path="customers"  element={<ProtectedRoute module="customers"><CustomersPage /></ProtectedRoute>} />
          <Route path="products"   element={<ProtectedRoute module="products"><ProductsPage /></ProtectedRoute>} />
          <Route path="inventory"  element={<ProtectedRoute module="inventory"><InventoryPage /></ProtectedRoute>} />
          <Route path="ar"         element={<ProtectedRoute module="ar"><ARPage /></ProtectedRoute>} />
          <Route path="reports"    element={<ProtectedRoute module="reports"><ReportsPage /></ProtectedRoute>} />
          <Route path="users"      element={<ProtectedRoute module="users"><UsersPage /></ProtectedRoute>} />
          <Route path="settings"   element={<ProtectedRoute module="settings"><SettingsPage /></ProtectedRoute>} />
          <Route path="audit"      element={<ProtectedRoute module="settings"><AuditPage /></ProtectedRoute>} />
        </Route>

        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Suspense>
  );
}

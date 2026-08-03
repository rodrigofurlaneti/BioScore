import { createBrowserRouter, RouterProvider, Outlet } from 'react-router-dom';
import { Suspense, lazy } from 'react';
import { ProtectedRoute } from '../auth/ProtectedRoute';
import { GlobalNav } from '../../design-system/components/Nav/GlobalNav';
import { Footer } from '../../design-system/components/Footer/Footer';
import { Spinner } from '../../shared/components/Spinner';
import { ChunkErrorBoundary } from '../../shared/components/ChunkErrorBoundary';

/* ── Auth ──────────────────────────────────────────────────────────────── */
const LoginPage        = lazy(() => import('../../features/auth/pages/LoginPage'));
const RegisterPage     = lazy(() => import('../../features/auth/pages/RegisterPage'));

/* ── Dashboard ──────────────────────────────────────────────────────────── */
const DashboardPage    = lazy(() => import('../../features/dashboard/pages/DashboardPage'));

/* ── Food Log ───────────────────────────────────────────────────────────── */
const FoodLogPage      = lazy(() => import('../../features/food-log/pages/FoodLogPage'));
const FoodLogHistory   = lazy(() => import('../../features/food-log/pages/FoodLogHistoryPage'));

/* ── Exams (user-facing) ─────────────────────────────────────────────────── */
const ExamsPage           = lazy(() => import('../../features/exams/pages/ExamsPage'));
const ExamRequestPage     = lazy(() => import('../../features/exams/pages/ExamRequestPage'));
const ExamRequestsPage    = lazy(() => import('../../features/exams/pages/ExamRequestsPage'));

/* ── Admin ───────────────────────────────────────────────────────────────── */
const FoodCategoriesPage  = lazy(() => import('../../features/admin/pages/FoodCategoriesPage'));
const FoodItemsPage       = lazy(() => import('../../features/admin/pages/FoodItemsPage'));
const ExamCategoriesPage  = lazy(() => import('../../features/admin/pages/ExamCategoriesPage'));
const ExamsAdminPage      = lazy(() => import('../../features/admin/pages/ExamsAdminPage'));

/* ── Users ───────────────────────────────────────────────────────────────── */
const UsersPage           = lazy(() => import('../../features/users/pages/UsersPage'));

function RootLayout() {
  return (
    <>
      <GlobalNav />
      <main style={{ paddingTop: '44px' }}>
        <ChunkErrorBoundary>
          <Suspense fallback={<Spinner fullPage />}>
            <Outlet />
          </Suspense>
        </ChunkErrorBoundary>
      </main>
      <Footer />
    </>
  );
}

const router = createBrowserRouter([
  {
    element: <RootLayout />,
    children: [
      /* Public */
      { path: '/login',    element: <LoginPage /> },
      { path: '/register', element: <RegisterPage /> },

      /* Protected */
      {
        element: <ProtectedRoute />,
        children: [
          /* Dashboard */
          { path: '/',                       element: <DashboardPage /> },
          { path: '/dashboard',              element: <DashboardPage /> },

          /* Food Log */
          { path: '/food-log',               element: <FoodLogPage /> },
          { path: '/food-log/history',       element: <FoodLogHistory /> },

          /* Exams – user */
          { path: '/exams',                  element: <ExamsPage /> },
          { path: '/exams/request',          element: <ExamRequestPage /> },
          { path: '/exams/requests',         element: <ExamRequestsPage /> },

          /* Admin – food */
          { path: '/admin/food-categories',  element: <FoodCategoriesPage /> },
          { path: '/admin/food-items',       element: <FoodItemsPage /> },

          /* Admin – exams */
          { path: '/admin/exam-categories',  element: <ExamCategoriesPage /> },
          { path: '/admin/exams',            element: <ExamsAdminPage /> },

          /* Users */
          { path: '/admin/users',            element: <UsersPage /> },
        ],
      },
    ],
  },
]);

export function AppRouter() {
  return <RouterProvider router={router} />;
}

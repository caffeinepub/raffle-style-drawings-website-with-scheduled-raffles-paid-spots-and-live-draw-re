import { createRouter, createRoute, createRootRoute, Outlet } from '@tanstack/react-router';
import AppLayout from './components/layout/AppLayout';
import RafflesPage from './pages/RafflesPage';
import RaffleDetailPage from './pages/RaffleDetailPage';
import LiveDrawingPage from './pages/LiveDrawingPage';
import MyEntriesPage from './pages/MyEntriesPage';
import AdminDashboardPage from './pages/admin/AdminDashboardPage';
import RaffleManagementPage from './pages/admin/RaffleManagementPage';
import PaymentSuccessPage from './pages/PaymentSuccessPage';
import PaymentFailurePage from './pages/PaymentFailurePage';

const rootRoute = createRootRoute({
  component: () => (
    <AppLayout>
      <Outlet />
    </AppLayout>
  ),
});

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: RafflesPage,
});

const raffleDetailRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/raffle/$raffleId',
  component: RaffleDetailPage,
});

const liveDrawingRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/raffle/$raffleId/live',
  component: LiveDrawingPage,
});

const myEntriesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/my-entries',
  component: MyEntriesPage,
});

const adminDashboardRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/admin',
  component: AdminDashboardPage,
});

const raffleManagementRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/admin/raffles',
  component: RaffleManagementPage,
});

const paymentSuccessRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/payment-success',
  component: PaymentSuccessPage,
});

const paymentFailureRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/payment-failure',
  component: PaymentFailurePage,
});

const routeTree = rootRoute.addChildren([
  indexRoute,
  raffleDetailRoute,
  liveDrawingRoute,
  myEntriesRoute,
  adminDashboardRoute,
  raffleManagementRoute,
  paymentSuccessRoute,
  paymentFailureRoute,
]);

export const router = createRouter({ routeTree });

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

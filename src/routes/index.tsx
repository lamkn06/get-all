import {
  AntDesignOutlined,
  BankOutlined,
  BarcodeOutlined,
  CalendarOutlined,
  MoneyCollectOutlined,
  ShoppingOutlined,
  SketchOutlined,
  UnorderedListOutlined,
  UsergroupAddOutlined,
  UserSwitchOutlined,
} from '@ant-design/icons';
import { MODULES } from 'constants/index';
import { PATHS } from 'constants/paths';
import DriverManagement from 'pages/driver-management';
import { lazy } from 'react';

// Unauthorized page
const LoginPage = lazy(() => import('pages/login'));

const HomePage = lazy(() => import('pages/home'));
const ListDriver = lazy(() => import('pages/driver-management/list'));
const PendingDriver = lazy(() => import('pages/driver-management/pending'));
const Parcel = lazy(() => import('pages/parcel-management/list'));
const ParcelDetail = lazy(() => import('pages/parcel-management/id'));
const User = lazy(() => import('pages/user-management'));
const Role = lazy(() => import('pages/role-management'));
// const NotFound = lazy(() => import('pages/not-found'));
const Accreditation = lazy(() => import('pages/driver-accreditation'));

const RateManagement = lazy(() => import('pages/rate-management/list'));
const FoodRateManagement = lazy(
  () => import('pages/food-rate-management/list'),
);
const RateDetail = lazy(() => import('pages/rate-management/id'));

const VoucherList = lazy(() => import('pages/voucher-management'));

const CampaignList = lazy(() => import('pages/campaign-management/list'));
const CampaignDetail = lazy(() => import('pages/campaign-management/id'));
const RestaurantList = lazy(() => import('pages/restaurant-management'));
const RestaurantDetail = lazy(() => import('pages/restaurant-management/id'));
const RestaurantCategories = lazy(() => import('pages/restaurant-categories'));
const ProductCategories = lazy(() => import('pages/product-categories'));
const CustomerManagement = lazy(() => import('pages/customer-management'));
const BillingManagement = lazy(() => import('pages/billing-management/list'));

interface RouteProp {
  name: string;
  key: string;
  breadcrumbName?: string;
  path?: PATHS;
  hidden?: boolean;
  component?: React.ReactElement;
  icon?: React.ReactNode;
  roles?: string[];
  layout?: boolean;
  redirect?: string;
  routes?: {
    name: string;
    key: string;
    breadcrumbName?: string;
    path: string;
    icon?: React.ReactNode;
    roles?: string[];
    layout?: boolean;
    redirect?: string;
    component: React.ReactElement;
  }[];
}
[];

export const routes: RouteProp[] = [
  {
    path: PATHS.Home,
    name: 'Home',
    key: 'all',
    icon: <AntDesignOutlined />,
    component: <HomePage />,
  },
  {
    path: PATHS.UserManagement,
    key: MODULES.MANAGE_USERS,
    name: 'User Management',
    icon: <AntDesignOutlined />,
    component: <User />,
  },
  {
    path: PATHS.RoleManagement,
    name: 'Role Management',
    key: MODULES.MANAGE_ROLES,
    icon: <AntDesignOutlined />,
    component: <Role />,
  },
  {
    path: PATHS.DriverManagement,
    name: 'Driver Management',
    key: MODULES.MANAGE_DRIVERS,
    icon: <UserSwitchOutlined />,
    routes: [
      {
        path: PATHS.ListDriver,
        key: MODULES.MANAGE_DRIVERS,
        name: 'All Drivers',
        component: (
          <DriverManagement>
            <ListDriver />
          </DriverManagement>
        ),
      },
      {
        path: PATHS.ListPendingDriver,
        key: MODULES.MANAGE_DRIVERS,
        name: 'Pending Drivers',
        component: (
          <DriverManagement>
            <PendingDriver />
          </DriverManagement>
        ),
      },
    ],
  },
  {
    path: PATHS.ParcelManagement,
    name: 'Parcel Management',
    key: MODULES.MANAGE_PARCEL_DELIVERIES,
    icon: <ShoppingOutlined />,
    routes: [
      {
        path: PATHS.ParcelTransactions,
        key: MODULES.MANAGE_PARCEL_DELIVERIES,
        name: 'Delivery Transactions.',
        component: <Parcel />,
        breadcrumbName: 'All Orders',
      },
    ],
  },
  {
    path: PATHS.ParcelDetail,
    name: 'Parcel Detail',
    key: MODULES.MANAGE_PARCEL_DELIVERIES,
    component: <ParcelDetail />,
    hidden: true,
  },
  {
    path: PATHS.RateManagement,
    name: 'Rate Management',
    key: MODULES.MANAGE_RATE_CARDS,
    icon: <MoneyCollectOutlined />,
    routes: [
      {
        path: PATHS.ExpressRateManagement,
        key: MODULES.MANAGE_RATE_CARDS,
        name: 'Express Rate Card.',
        component: <RateManagement />,
        breadcrumbName: 'All Orders',
      },
      {
        path: PATHS.FoodRateManagement,
        key: MODULES.MANAGE_RATE_CARDS,
        name: 'Food Rate Card.',
        component: <FoodRateManagement />,
        breadcrumbName: 'All Orders',
      },
    ],
  },
  {
    path: PATHS.RateDetail,
    name: 'Rate Detail',
    key: MODULES.MANAGE_RATE_CARDS,
    icon: <MoneyCollectOutlined />,
    component: <RateDetail />,
    hidden: true,
  },
  {
    path: PATHS.CampaignManagement,
    name: 'Campaign Management',
    key: MODULES.MANAGE_CAMPAIGNS,
    icon: <CalendarOutlined />,
    component: <CampaignList />,
  },
  {
    path: PATHS.CampaignDetail,
    name: 'Campaign Detail',
    key: MODULES.MANAGE_CAMPAIGNS,
    icon: <CalendarOutlined />,
    component: <CampaignDetail />,
    hidden: true,
  },
  {
    path: PATHS.VoucherManagement,
    name: 'Voucher Management',
    key: MODULES.MANAGE_VOUCHERS,
    icon: <BarcodeOutlined />,
    component: <VoucherList />,
  },
  {
    path: PATHS.RestaurantManagement,
    name: 'Restaurant Management',
    key: MODULES.MANAGE_RESTAURANTS,
    icon: <BankOutlined />,
    component: <RestaurantList />,
  },
  {
    path: PATHS.RestaurantDetail,
    name: 'Restaurant Detail',
    key: MODULES.MANAGE_RESTAURANTS,
    component: <RestaurantDetail />,
    hidden: true,
  },
  {
    path: PATHS.Categories,
    name: 'Category Management',
    key: MODULES.MANAGE_RESTAURANTS,
    icon: <UnorderedListOutlined />,
    routes: [
      {
        path: PATHS.RestaurantCategories,
        key: MODULES.MANAGE_RESTAURANTS,
        name: 'Restaurant Categories',
        component: <RestaurantCategories />,
      },
      {
        path: PATHS.ProductCategories,
        key: MODULES.MANAGE_RESTAURANTS,
        name: 'Product Categories',
        component: <ProductCategories />,
      },
    ],
  },
  {
    path: PATHS.CustomerManagement,
    name: 'Customer Management',
    key: MODULES.MANAGE_CUSTOMERS,
    icon: <UsergroupAddOutlined />,
    component: <CustomerManagement />,
  },
  {
    path: PATHS.BillingManagement,
    name: 'Billing Management',
    key: MODULES.MANAGE_RESTAURANTS,
    icon: <SketchOutlined />,
    component: <BillingManagement />,
  },
];

export const unauthorizedRoutes: RouteProp[] = [
  {
    path: PATHS.Login,
    name: 'Login',
    key: 'all',
    component: <LoginPage />,
  },
  {
    path: PATHS.Accreditation,
    name: PATHS.Accreditation,
    key: 'all',
    component: <Accreditation />,
    hidden: true,
  },
];

export const flattenRoutes: Omit<RouteProp, 'routes'>[] = routes.reduce(
  (acc, { routes, ...rest }) => {
    acc = [...acc, rest];
    if (Array.isArray(routes)) {
      acc = [...acc, ...routes];
    }
    return acc;
  },
  [],
);

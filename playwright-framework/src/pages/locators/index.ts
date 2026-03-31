// EN: Import all locator JSON files for each page/component
import LoginLocatorsJson from './login.locators.json';
import DashboardLocatorsJson from './dashboard.locators.json';
import CartLocatorsJson from './cart.locators.json';
import CheckoutLocatorsJson from './checkout.locators.json';
import OrdersLocatorsJson from './orders.locators.json';
import NavigationBarLocatorsJson from './navigationbar.locators.json';
import DataTableLocatorsJson from './datatable.locators.json';
import ToastLocatorsJson from './toast.locators.json';

// EN: Re-export all locators for easy importing in page objects
export const LoginLocators = LoginLocatorsJson;
export const DashboardLocators = DashboardLocatorsJson;
export const CartLocators = CartLocatorsJson;
export const CheckoutLocators = CheckoutLocatorsJson;
export const OrdersLocators = OrdersLocatorsJson;
export const NavigationBarLocators = NavigationBarLocatorsJson;
export const DataTableLocators = DataTableLocatorsJson;
export const ToastLocators = ToastLocatorsJson;

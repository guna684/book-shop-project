import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { CartProvider } from "@/context/CartContext";
import { AuthProvider } from "@/context/AuthContext";
import { WishlistProvider } from "@/context/WishlistContext";
import { ChatProvider } from "@/context/ChatContext";
import Index from "./pages/Index";
import Books from "./pages/Books";
import BookDetail from "./pages/BookDetail";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import Login from "./pages/Login";
import Categories from "./pages/Categories";
import NotFound from "./pages/NotFound";
import Orders from "./pages/Orders";
import Invoice from "./pages/Invoice";
import ProductList from "./pages/admin/ProductList";
import OrderList from "./pages/admin/OrderList";
import ProductEdit from "./pages/admin/ProductEdit";
import Profile from "./pages/Profile";
import Wishlist from "./pages/Wishlist";
import Dashboard from "./pages/admin/Dashboard";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import Contact from "./pages/Contact";
import MessageList from "./pages/admin/MessageList";
import UserList from "./pages/admin/UserList";
import CategoryList from "./pages/admin/CategoryList";
import Newsletter from "./pages/admin/Newsletter";
import About from "./pages/About";
import FAQs from "./pages/FAQs";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import ReturnPolicy from "./pages/ReturnPolicy";
import Shipping from "./pages/Shipping";
import PromoCodeList from "./pages/admin/PromoCodeList";
import BannerManagement from "./pages/admin/BannerManagement";

const queryClient = new QueryClient();

const App = () => (
  <HelmetProvider>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <ChatProvider>
          <CartProvider>
            <WishlistProvider>
              <TooltipProvider>
                <Toaster />
                <Sonner />
                <BrowserRouter>
                  <Routes>
                    <Route path="/" element={<Index />} />
                    <Route path="/books" element={<Books />} />
                    <Route path="/book/:id" element={<BookDetail />} />
                    <Route path="/cart" element={<Cart />} />
                    <Route path="/checkout" element={<Checkout />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/forgotpassword" element={<ForgotPassword />} />
                    <Route path="/resetpassword/:token" element={<ResetPassword />} />
                    <Route path="/orders" element={<Orders />} />
                    <Route path="/order/:id/invoice" element={<Invoice />} />
                    <Route path="/wishlist" element={<Wishlist />} />
                    <Route path="/profile" element={<Profile />} />
                    <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
                    <Route path="/admin/dashboard" element={<Dashboard />} />
                    <Route path="/admin/productlist" element={<ProductList />} />
                    <Route path="/admin/orderlist" element={<OrderList />} />
                    <Route path="/admin/product/:id/edit" element={<ProductEdit />} />
                    <Route path="/admin/messagelist" element={<MessageList />} />
                    <Route path="/admin/userlist" element={<UserList />} />
                    <Route path="/admin/categorylist" element={<CategoryList />} />
                    <Route path="/admin/newsletter" element={<Newsletter />} />
                    <Route path="/admin/promocodes" element={<PromoCodeList />} />
                    <Route path="/admin/banner" element={<BannerManagement />} />
                    <Route path="/categories" element={<Categories />} />
                    <Route path="/contact" element={<Contact />} />
                    <Route path="/about" element={<About />} />
                    <Route path="/faqs" element={<FAQs />} />
                    <Route path="/privacy" element={<PrivacyPolicy />} />
                    <Route path="/returns" element={<ReturnPolicy />} />
                    <Route path="/shipping" element={<Shipping />} />
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </BrowserRouter>
              </TooltipProvider>
            </WishlistProvider>
          </CartProvider>
        </ChatProvider>
      </AuthProvider>
    </QueryClientProvider>
  </HelmetProvider>
);

export default App;

import { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import api from '@/lib/axios';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';
import { Package, ShoppingBag, Users, BookOpen, DollarSign, MessageSquare, TrendingUp, ArrowRight, Loader2 } from 'lucide-react';
import AdminLayout from '@/components/layout/AdminLayout';
import { useAuth } from '@/context/AuthContext';
import { motion, Variants } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import TopSellingChart from '@/components/admin/charts/TopSellingChart';
import CategorySalesChart from '@/components/admin/charts/CategorySalesChart';
import RevenueCategoryChart from '@/components/admin/charts/RevenueCategoryChart';
import StockVsSalesChart from '@/components/admin/charts/StockVsSalesChart';
import MonthlyTrendsChart from '@/components/admin/charts/MonthlyTrendsChart';
import RevenueByProductChart from '@/components/admin/charts/RevenueByProductChart';
import LowStockAlertsChart from '@/components/admin/charts/LowStockAlertsChart';





// Helper function to get default date range (last 30 days)
const getDefaultDateRange = () => {
    const today = new Date();
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(today.getDate() - 30);

    return {
        start: thirtyDaysAgo.toISOString().split('T')[0],
        end: today.toISOString().split('T')[0]
    };
};

const Dashboard = () => {
    const [stats, setStats] = useState({
        totalOrders: 0,
        totalSales: 0,
        totalUsers: 0,
        totalProducts: 0,
    });
    const [loading, setLoading] = useState(true);
    const { user } = useAuth();
    const { t } = useTranslation();

    // Initialize with default 30-day range
    const [dateRange, setDateRange] = useState(getDefaultDateRange());
    const [categoryFilter, setCategoryFilter] = useState('');
    const [refreshTrigger, setRefreshTrigger] = useState(0);
    const [hasCustomFilter, setHasCustomFilter] = useState(false);

    const handleRefresh = () => {
        // Clear filters and restore default 30-day range
        setDateRange(getDefaultDateRange());
        setCategoryFilter('');
        setHasCustomFilter(false);
        setRefreshTrigger(prev => prev + 1);
        toast.success(t('admin.dashboard.refreshSuccess') || 'Dashboard data refreshed');
    };

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const config = {
                    headers: { Authorization: `Bearer ${user?.token}` },
                    params: {
                        startDate: dateRange.start,
                        endDate: dateRange.end,
                        _t: Date.now() // Cache busting
                    }
                };

                const { data } = await api.get('/api/analytics/dashboard-overview', config);

                console.log('📊 Dashboard Data Received:', data);

                setStats({
                    totalOrders: data.totalOrders,
                    totalSales: data.totalRevenue,
                    totalUsers: data.totalUsers,
                    totalProducts: data.totalBooks,
                });
            } catch (error) {
                toast.error('Failed to load dashboard stats');
            } finally {
                setLoading(false);
            }
        };

        if (user?.isAdmin) {
            fetchStats();
        }
    }, [user, dateRange, refreshTrigger]);

    // Listen for order delivery events to auto-refresh dashboard
    useEffect(() => {
        console.log('📊 Dashboard: Setting up orderDelivered event listener');

        const handleOrderDelivered = (event: any) => {
            console.log('✅ Dashboard: Order delivered event received!', {
                detail: event.detail,
                currentRefreshTrigger: refreshTrigger,
                timestamp: new Date().toISOString()
            });

            // Trigger refresh by incrementing refreshTrigger
            setRefreshTrigger(prev => {
                const newValue = prev + 1;
                console.log(`📈 Dashboard: Incrementing refreshTrigger from ${prev} to ${newValue}`);
                return newValue;
            });

            toast.success('Dashboard updated with latest order data');
        };

        window.addEventListener('orderDelivered', handleOrderDelivered);
        console.log('✅ Dashboard: Event listener registered');

        return () => {
            console.log('🔴 Dashboard: Removing event listener');
            window.removeEventListener('orderDelivered', handleOrderDelivered);
        };
    }, []);

    const statCards = [
        { title: t('admin.dashboard.totalRevenue'), value: `₹${stats.totalSales.toLocaleString()}`, icon: DollarSign, color: 'bg-green-500', gradient: 'from-green-500 to-emerald-700' },
        { title: t('admin.dashboard.totalOrders'), value: stats.totalOrders, icon: ShoppingBag, color: 'bg-blue-500', gradient: 'from-blue-500 to-indigo-700' },
        { title: t('admin.dashboard.totalBooks'), value: stats.totalProducts, icon: BookOpen, color: 'bg-orange-500', gradient: 'from-orange-500 to-red-700' },
        { title: t('admin.dashboard.totalUsers'), value: stats.totalUsers, icon: Users, color: 'bg-purple-500', gradient: 'from-purple-500 to-pink-700' },
    ];

    const containerVariants: Variants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    const itemVariants: Variants = {
        hidden: { y: 20, opacity: 0 },
        visible: {
            y: 0,
            opacity: 1,
            transition: {
                type: 'spring',
                stiffness: 100
            }
        }
    };

    return (
        <AdminLayout>
            <Helmet>
                <title>Admin Dashboard | Sri Chola Book Shop</title>
            </Helmet>

            <div className="w-full">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
                    <div>
                        <h1 className="text-4xl font-bold font-serif text-foreground mb-2">
                            {t('admin.dashboard.title')}
                        </h1>
                        <p className="text-muted-foreground">{t('admin.dashboard.welcomeBack')}, <span className="text-primary font-semibold">{user?.name}</span>.</p>
                    </div>

                    <div className="flex items-center gap-3">
                        <button
                            onClick={handleRefresh}
                            className="flex items-center gap-2 bg-card hover:bg-accent border border-border p-2 rounded-lg text-sm transition-colors"
                            title="Refresh Data"
                        >
                            <Loader2 className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                            <span className="hidden sm:inline">{t('admin.common.refresh')}</span>
                        </button>

                        {/* Date Filter */}
                        <div className="flex items-center gap-2 bg-card p-2 rounded-lg border border-border shadow-sm">
                            <div className="flex flex-col">
                                <label className="text-[10px] text-muted-foreground ml-1">{t('admin.dashboard.dateFilter.from')}</label>
                                <input
                                    type="date"
                                    className="bg-transparent text-sm p-1 outline-none"
                                    value={dateRange.start}
                                    onChange={(e) => {
                                        setDateRange(prev => ({ ...prev, start: e.target.value }));
                                        setHasCustomFilter(true);
                                    }}
                                />
                            </div>
                            <div className="h-8 w-[1px] bg-border"></div>
                            <div className="flex flex-col">
                                <label className="text-[10px] text-muted-foreground ml-1">{t('admin.dashboard.dateFilter.to')}</label>
                                <input
                                    type="date"
                                    className="bg-transparent text-sm p-1 outline-none"
                                    value={dateRange.end}
                                    onChange={(e) => {
                                        setDateRange(prev => ({ ...prev, end: e.target.value }));
                                        setHasCustomFilter(true);
                                    }}
                                />
                            </div>
                            {hasCustomFilter && (
                                <button
                                    onClick={() => {
                                        setDateRange(getDefaultDateRange());
                                        setHasCustomFilter(false);
                                    }}
                                    className="text-xs text-red-500 hover:underline px-2"
                                >
                                    {t('admin.dashboard.dateFilter.clear')}
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                {loading ? (
                    <div className="flex items-center justify-center p-20">
                        <Loader2 className="h-10 w-10 animate-spin text-primary" />
                    </div>
                ) : (
                    <><motion.div
                        variants={containerVariants}
                        initial="hidden"
                        animate="visible"
                        className="space-y-10"
                    >
                        {/* Stats Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            {statCards.map((stat, index) => (
                                <motion.div
                                    key={index}
                                    variants={itemVariants}
                                    className="relative bg-card border border-border rounded-xl p-6 shadow-sm overflow-hidden group hover:shadow-lg transition-shadow"
                                >
                                    <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
                                        <stat.icon className="h-24 w-24" />
                                    </div>
                                    <div className="relative z-10 flex flex-col justify-between h-full">
                                        <div className={`p-3 rounded-lg w-fit mb-4 bg-gradient-to-br ${stat.gradient} text-white shadow-md`}>
                                            <stat.icon className="h-6 w-6" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-muted-foreground mb-1">{stat.title}</p>
                                            <h3 className="text-3xl font-bold tracking-tight">{stat.value}</h3>
                                        </div>
                                        <div className="mt-4 flex items-center text-xs text-green-600 font-medium bg-green-500/10 w-fit px-2 py-1 rounded-full">
                                            <TrendingUp className="h-3 w-3 mr-1" />
                                            {t('admin.dashboard.trendingUp')}
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            {/* Quick Actions */}
                            <motion.div variants={itemVariants} className="lg:col-span-1 space-y-6">
                                <h2 className="text-xl font-bold font-serif">{t('admin.dashboard.quickActions')}</h2>
                                <div className="grid grid-cols-1 gap-4">
                                    <Link to="/admin/productlist" className="bg-card hover:bg-accent/5 border border-border p-4 rounded-xl shadow-sm flex items-center gap-4 transition-all group">
                                        <div className="bg-primary/10 p-3 rounded-full text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                                            <Package className="h-5 w-5" />
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="font-semibold">{t('admin.dashboard.actions.manageProducts')}</h3>
                                            <p className="text-xs text-muted-foreground">{t('admin.dashboard.actions.manageProductsDesc')}</p>
                                        </div>
                                        <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:translate-x-1 transition-transform" />
                                    </Link>

                                    <Link to="/admin/categorylist" className="bg-card hover:bg-accent/5 border border-border p-4 rounded-xl shadow-sm flex items-center gap-4 transition-all group">
                                        <div className="bg-blue-500/10 p-3 rounded-full text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                                            <Users className="h-5 w-5" />
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="font-semibold">{t('admin.dashboard.actions.categories')}</h3>
                                            <p className="text-xs text-muted-foreground">{t('admin.dashboard.actions.categoriesDesc')}</p>
                                        </div>
                                        <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:translate-x-1 transition-transform" />
                                    </Link>

                                    <Link to="/admin/messagelist" className="bg-card hover:bg-accent/5 border border-border p-4 rounded-xl shadow-sm flex items-center gap-4 transition-all group">
                                        <div className="bg-purple-500/10 p-3 rounded-full text-purple-600 group-hover:bg-purple-600 group-hover:text-white transition-colors">
                                            <MessageSquare className="h-5 w-5" />
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="font-semibold">{t('admin.dashboard.actions.inbox')}</h3>
                                            <p className="text-xs text-muted-foreground">{t('admin.dashboard.actions.inboxDesc')}</p>
                                        </div>
                                        <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:translate-x-1 transition-transform" />
                                    </Link>
                                </div>
                            </motion.div>

                            {/* Recent Orders Overview (Mock or partial) */}
                            <motion.div variants={itemVariants} className="lg:col-span-2 space-y-6">
                                <div className="flex justify-between items-center">
                                    <h2 className="text-xl font-bold font-serif">{t('admin.dashboard.recentActivity')}</h2>
                                    <Link to="/admin/orderlist" className="text-sm text-primary hover:underline">{t('admin.orders.title')}</Link>
                                </div>
                                <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden h-full min-h-[250px] flex items-center justify-center">
                                    <div className="flex flex-col items-center justify-center text-center p-6">
                                        <div className="bg-secondary p-4 rounded-full mb-4">
                                            <ShoppingBag className="h-8 w-8 text-muted-foreground opacity-50" />
                                        </div>
                                        <h3 className="text-lg font-medium mb-1">{t('admin.dashboard.checkOrdersTab')}</h3>
                                        <p className="text-muted-foreground max-w-xs">{t('admin.dashboard.visitOrders')}</p>
                                        <Link to="/admin/orderlist" className="mt-4">
                                            <div className="text-primary font-medium flex items-center gap-1 hover:underline">
                                                {t('admin.dashboard.goToOrders')} <ArrowRight className="h-4 w-4" />
                                            </div>
                                        </Link>
                                    </div>
                                </div>
                            </motion.div>
                        </div>
                    </motion.div>

                        {/* Analytics Charts Section */}
                        <motion.div variants={itemVariants} className="mt-10">
                            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                                <div>
                                    <h2 className="text-2xl font-bold font-serif text-foreground">{t('admin.dashboard.analytics.title')}</h2>
                                    <p className="text-sm text-muted-foreground mt-1">{t('admin.dashboard.analytics.subtitle')}</p>
                                </div>

                                {/* Category Filter */}
                                <div className="flex items-center gap-2">
                                    <label className="text-sm font-medium text-muted-foreground">{t('admin.dashboard.analytics.filterByCategory')}:</label>
                                    <select
                                        value={categoryFilter}
                                        onChange={(e) => setCategoryFilter(e.target.value)}
                                        className="bg-card border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                                    >
                                        <option value="">{t('admin.dashboard.analytics.allCategories')}</option>
                                        <option value="Fiction">{t('categories.fiction')}</option>
                                        <option value="Non-Fiction">{t('categories.non-fiction')}</option>
                                        <option value="Science">{t('categories.sci-fi')}</option>
                                        <option value="Technology">Technology</option>
                                        <option value="History">History</option>
                                        <option value="Biography">{t('categories.biography')}</option>
                                        <option value="Self-Help">{t('categories.self-help')}</option>
                                        <option value="Children">{t('categories.childrens')}</option>
                                        <option value="Romance">{t('categories.romance')}</option>
                                        <option value="Mystery">{t('categories.mystery')}</option>
                                    </select>
                                </div>
                            </div>

                            {/* Charts Grid */}
                            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                                {/* Row 1 */}
                                <TopSellingChart refreshTrigger={refreshTrigger} dateRange={dateRange} />
                                <CategorySalesChart refreshTrigger={refreshTrigger} dateRange={dateRange} />
                                <RevenueCategoryChart refreshTrigger={refreshTrigger} dateRange={dateRange} />

                                {/* Row 2 */}
                                <MonthlyTrendsChart refreshTrigger={refreshTrigger} dateRange={dateRange} />
                                <StockVsSalesChart refreshTrigger={refreshTrigger} dateRange={dateRange} />
                                <RevenueByProductChart
                                    refreshTrigger={refreshTrigger}
                                    dateRange={dateRange}
                                    categoryFilter={categoryFilter}
                                />
                            </div>

                            {/* Low Stock Alerts - Full Width */}
                            <div className="mt-6">
                                <LowStockAlertsChart
                                    refreshTrigger={refreshTrigger}
                                    categoryFilter={categoryFilter}
                                />
                            </div>
                        </motion.div>

                    </>
                )}
            </div >
        </AdminLayout >
    );
};

export default Dashboard;

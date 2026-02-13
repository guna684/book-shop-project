import { Link, useLocation } from 'react-router-dom';
import {
    LayoutDashboard,
    Package,
    ShoppingCart,
    Users,
    MessageSquare,
    Megaphone,
    ListTree,
    Tag,
    LayoutTemplate,
    Tags,
    ShoppingBag,
    ChevronRight,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';

const AdminSidebar = () => {
    const location = useLocation();
    const { t } = useTranslation();

    const links = [
        { name: t('admin.sidebar.dashboard'), path: '/admin/dashboard', icon: LayoutDashboard },
        { name: t('admin.sidebar.products'), path: '/admin/productlist', icon: Package },
        { name: t('admin.sidebar.categories'), path: '/admin/categorylist', icon: Tags },
        { name: t('admin.sidebar.orders'), path: '/admin/orderlist', icon: ShoppingBag },
        { name: t('admin.sidebar.users'), path: '/admin/userlist', icon: Users },
        { name: t('admin.sidebar.messages'), path: '/admin/messagelist', icon: MessageSquare },
        { name: t('admin.sidebar.promoCodes'), path: '/admin/promocodes', icon: Tag },
        { name: t('admin.sidebar.bannerManagement'), path: '/admin/banner', icon: LayoutTemplate },
        { name: t('admin.sidebar.marketing'), path: '/admin/newsletter', icon: Megaphone },
    ];

    return (
        <aside className="w-64 bg-card/80 backdrop-blur-xl border-r border-border h-[calc(100vh-4rem)] sticky top-16 hidden lg:block overflow-y-auto shadow-sm">
            <div className="p-6 space-y-2">
                <div className="mb-6 px-2">
                    <h2 className="text-xs font-bold text-muted-foreground uppercase tracking-widest">{t('admin.sidebar.management')}</h2>
                </div>
                {links.map((link) => {
                    const isActive = location.pathname === link.path;
                    return (
                        <Link
                            key={link.path}
                            to={link.path}
                            className="relative block group"
                        >
                            <div
                                className={cn(
                                    "flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-200",
                                    isActive
                                        ? "text-primary-foreground font-medium"
                                        : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
                                )}
                            >
                                <div className="flex items-center gap-3 relative z-10">
                                    <link.icon className={cn("h-5 w-5", isActive ? "text-primary-foreground" : "text-muted-foreground group-hover:text-primary transition-colors")} />
                                    <span>{link.name}</span>
                                </div>
                                {isActive && (
                                    <motion.div
                                        layoutId="activeTab"
                                        className="absolute inset-0 bg-primary rounded-xl shadow-lg shadow-primary/20"
                                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                    />
                                )}
                            </div>
                        </Link>
                    );
                })}
            </div>

            <div className="absolute bottom-0 left-0 right-0 p-6">
                <div className="bg-gradient-to-br from-primary/10 to-transparent p-4 rounded-xl border border-primary/10">
                    <p className="text-xs text-muted-foreground mb-1">{t('admin.sidebar.adminPortal')}</p>
                    <p className="text-sm font-bold text-primary">Sri Chola Book Shop v1.0</p>
                </div>
            </div>
        </aside>
    );
};

export default AdminSidebar;

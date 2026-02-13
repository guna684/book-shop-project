import { useState, useEffect } from 'react';
import api from '@/lib/axios';
import { Loader2, AlertCircle, AlertTriangle, Package } from 'lucide-react';

interface LowStockAlertsChartProps {
    refreshTrigger?: number;
    categoryFilter?: string;
}

const LowStockAlertsChart = ({ refreshTrigger, categoryFilter }: LowStockAlertsChartProps) => {
    const [data, setData] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const params: any = { threshold: 15 };
                if (categoryFilter) params.category = categoryFilter;

                const { data } = await api.get('/api/analytics/low-stock-alerts', { params });
                setData(data);
            } catch (error) {
                console.error("Failed to fetch low stock alerts", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [refreshTrigger, categoryFilter]);

    const getStockColor = (stock: number) => {
        if (stock === 0) return 'text-red-600 bg-red-50';
        if (stock <= 5) return 'text-orange-600 bg-orange-50';
        if (stock <= 10) return 'text-yellow-600 bg-yellow-50';
        return 'text-blue-600 bg-blue-50';
    };

    const getStockIcon = (stock: number) => {
        if (stock === 0) return <AlertCircle className="h-4 w-4" />;
        if (stock <= 5) return <AlertTriangle className="h-4 w-4" />;
        return <Package className="h-4 w-4" />;
    };

    if (loading) return <div className="h-[350px] flex items-center justify-center bg-card rounded-xl border border-border"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;

    if (!data || data.length === 0) {
        return (
            <div className="h-[350px] flex flex-col items-center justify-center bg-card rounded-xl border border-border text-muted-foreground">
                <Package className="h-10 w-10 mb-2 opacity-50 text-green-500" />
                <p className="font-medium text-green-600">All products well-stocked!</p>
                <p className="text-xs mt-1">No low inventory alerts</p>
            </div>
        );
    }

    return (
        <div className="bg-card p-6 rounded-xl border border-border shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center gap-2 mb-1">
                <AlertTriangle className="h-5 w-5 text-orange-500" />
                <h3 className="font-serif text-lg font-bold text-foreground">Low Stock Alerts</h3>
                <span className="ml-auto bg-orange-100 text-orange-700 text-xs font-bold px-2 py-1 rounded-full">
                    {data.length} items
                </span>
            </div>
            <p className="text-xs text-muted-foreground mb-4">Products requiring restocking</p>

            <div className="max-h-[280px] overflow-y-auto space-y-2 pr-2 custom-scrollbar">
                {data.map((item, index) => (
                    <div
                        key={item._id || index}
                        className="flex items-center justify-between p-3 bg-secondary/30 hover:bg-secondary/50 rounded-lg transition-colors border border-border/50"
                    >
                        <div className="flex-1 min-w-0 mr-3">
                            <p className="text-sm font-medium text-foreground truncate">
                                {item.title}
                            </p>
                            <p className="text-xs text-muted-foreground mt-0.5">
                                {item.category} • ₹{item.price}
                            </p>
                        </div>
                        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full font-bold text-sm ${getStockColor(item.stock)}`}>
                            {getStockIcon(item.stock)}
                            <span>{item.stock} left</span>
                        </div>
                    </div>
                ))}
            </div>

            {data.length >= 20 && (
                <p className="text-xs text-muted-foreground text-center mt-3 pt-3 border-t border-border">
                    Showing top 20 low-stock items
                </p>
            )}
        </div>
    );
};

export default LowStockAlertsChart;

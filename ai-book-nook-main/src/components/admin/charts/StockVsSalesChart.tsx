import { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import api from '@/lib/axios';
import { Loader2, AlertCircle } from 'lucide-react';

const StockVsSalesChart = ({ refreshTrigger, dateRange }: { refreshTrigger?: number; dateRange?: { start: string; end: string } }) => {
    const [data, setData] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const params: any = {};
                if (dateRange?.start) params.startDate = dateRange.start;
                if (dateRange?.end) params.endDate = dateRange.end;

                // Fetch both datasets in parallel
                const [salesRes, stockRes] = await Promise.all([
                    api.get('/api/analytics/category-sales', { params }),
                    api.get('/api/analytics/stock-by-category')
                ]);

                const salesData = salesRes.data;
                const stockData = stockRes.data;

                // Merge data logic: ensure we capture all categories from both sides
                const categories = new Set([
                    ...salesData.map((d: any) => d._id),
                    ...stockData.map((d: any) => d._id)
                ]);

                const mergedData = Array.from(categories).map(category => {
                    const salesInfo = salesData.find((d: any) => d._id === category);
                    const stockInfo = stockData.find((d: any) => d._id === category);

                    return {
                        name: category,
                        Sales: salesInfo ? salesInfo.count : 0,
                        Stock: stockInfo ? stockInfo.totalStock : 0
                    };
                });

                setData(mergedData);
            } catch (error) {
                console.error("Failed to fetch stock vs sales data", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [refreshTrigger, dateRange]);

    if (loading) return <div className="h-[350px] flex items-center justify-center bg-card rounded-xl border border-border"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;

    if (!data || data.length === 0) {
        return (
            <div className="h-[350px] flex flex-col items-center justify-center bg-card rounded-xl border border-border text-muted-foreground">
                <AlertCircle className="h-10 w-10 mb-2 opacity-50" />
                <p>No comparative data available</p>
            </div>
        );
    }

    const CustomTooltip = ({ active, payload, label }: any) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-popover border border-border p-3 rounded-lg shadow-lg">
                    <p className="text-sm font-medium mb-2 text-foreground">{label}</p>
                    <div className="space-y-1">
                        <p className="text-xs text-green-600 flex justify-between gap-4">
                            <span>Sold:</span> <span className="font-bold">{payload[0].value}</span>
                        </p>
                        <p className="text-xs text-blue-600 flex justify-between gap-4">
                            <span>Stock:</span> <span className="font-bold">{payload[1].value}</span>
                        </p>
                    </div>
                </div>
            );
        }
        return null;
    };

    return (
        <div className="bg-card p-6 rounded-xl border border-border shadow-sm hover:shadow-md transition-shadow">
            <h3 className="font-serif text-lg font-bold text-foreground mb-1">Supply vs Demand</h3>
            <p className="text-xs text-muted-foreground mb-6">Inventory levels compared with sales volume</p>

            <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" opacity={0.5} />
                        <XAxis
                            dataKey="name"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
                        />
                        <YAxis
                            axisLine={false}
                            tickLine={false}
                            tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
                        />
                        <Tooltip content={<CustomTooltip />} cursor={{ fill: 'hsl(var(--muted)/0.2)' }} />
                        <Legend wrapperStyle={{ paddingTop: '10px', fontSize: '12px' }} />
                        <Bar dataKey="Sales" fill="#22c55e" radius={[4, 4, 0, 0]} name="Units Sold" barSize={20} />
                        <Bar dataKey="Stock" fill="#3b82f6" radius={[4, 4, 0, 0]} name="In Stock" barSize={20} />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

export default StockVsSalesChart;

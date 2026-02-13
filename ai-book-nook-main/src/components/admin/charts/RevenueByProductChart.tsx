import { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import api from '@/lib/axios';
import { Loader2, AlertCircle, DollarSign } from 'lucide-react';

interface RevenueByProductChartProps {
    refreshTrigger?: number;
    dateRange?: { start: string; end: string };
    categoryFilter?: string;
}

const RevenueByProductChart = ({ refreshTrigger, dateRange, categoryFilter }: RevenueByProductChartProps) => {
    const [data, setData] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const params: any = {};
                if (dateRange?.start) params.startDate = dateRange.start;
                if (dateRange?.end) params.endDate = dateRange.end;
                if (categoryFilter) params.category = categoryFilter;

                const { data } = await api.get('/api/analytics/revenue-by-product', { params });
                setData(data);
            } catch (error) {
                console.error("Failed to fetch revenue by product", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [refreshTrigger, dateRange, categoryFilter]);

    const COLORS = ['#10b981', '#22c55e', '#34d399', '#4ade80', '#6ee7b7', '#86efac', '#a7f3d0', '#bbf7d0', '#d1fae5', '#d9f99d'];

    if (loading) return <div className="h-[350px] flex items-center justify-center bg-card rounded-xl border border-border"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;

    if (!data || data.length === 0) {
        return (
            <div className="h-[350px] flex flex-col items-center justify-center bg-card rounded-xl border border-border text-muted-foreground">
                <AlertCircle className="h-10 w-10 mb-2 opacity-50" />
                <p>No revenue data available</p>
            </div>
        );
    }

    const CustomTooltip = ({ active, payload, label }: any) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-popover border border-border p-3 rounded-lg shadow-lg max-w-[250px]">
                    <p className="text-sm font-medium mb-2 text-foreground truncate">{label}</p>
                    <div className="space-y-1">
                        <p className="text-xs text-green-600 flex justify-between gap-4">
                            <span>Revenue:</span> <span className="font-bold">₹{payload[0].value.toLocaleString()}</span>
                        </p>
                        <p className="text-xs text-blue-600 flex justify-between gap-4">
                            <span>Units Sold:</span> <span className="font-bold">{payload[0].payload.unitsSold}</span>
                        </p>
                        <p className="text-xs text-muted-foreground">
                            {payload[0].payload.category}
                        </p>
                    </div>
                </div>
            );
        }
        return null;
    };

    return (
        <div className="bg-card p-6 rounded-xl border border-border shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center gap-2 mb-1">
                <DollarSign className="h-5 w-5 text-green-500" />
                <h3 className="font-serif text-lg font-bold text-foreground">Top Revenue Products</h3>
            </div>
            <p className="text-xs text-muted-foreground mb-6">Highest earning books</p>

            <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                        layout="vertical"
                        data={data}
                        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                    >
                        <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="hsl(var(--border))" opacity={0.5} />
                        <XAxis type="number" hide />
                        <YAxis
                            dataKey="title"
                            type="category"
                            width={160}
                            tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
                            interval={0}
                        />
                        <Tooltip content={<CustomTooltip />} cursor={{ fill: 'hsl(var(--muted)/0.2)' }} />
                        <Bar dataKey="totalRevenue" radius={[0, 4, 4, 0]} barSize={20} name="Revenue">
                            {data.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

export default RevenueByProductChart;

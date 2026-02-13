import { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import api from '@/lib/axios';
import { Loader2, AlertCircle } from 'lucide-react';

const OrdersChart = ({ refreshTrigger, dateRange }: { refreshTrigger?: number; dateRange?: { start: string; end: string } }) => {
    const [data, setData] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const params: any = {};
                if (dateRange?.start) params.startDate = dateRange.start;
                if (dateRange?.end) params.endDate = dateRange.end;

                const { data } = await api.get('/api/analytics/orders', { params });
                setData(data);
            } catch (error) {
                console.error("Failed to fetch orders data", error);
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
                <p>No order data available</p>
            </div>
        );
    }

    const CustomTooltip = ({ active, payload, label }: any) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-popover border border-border p-3 rounded-lg shadow-lg">
                    <p className="text-sm font-medium mb-1">{label}</p>
                    <p className="text-sm text-primary font-bold">
                        {payload[0].value} Orders
                    </p>
                </div>
            );
        }
        return null;
    };

    return (
        <div className="bg-card p-6 rounded-xl border border-border shadow-sm hover:shadow-md transition-shadow">
            <h3 className="font-serif text-lg font-bold text-foreground mb-1">Orders Trend</h3>
            <p className="text-xs text-muted-foreground mb-6">Total orders per day</p>

            <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" opacity={0.5} />
                        <XAxis
                            dataKey="_id"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
                            minTickGap={30}
                        />
                        <YAxis
                            axisLine={false}
                            tickLine={false}
                            tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
                            allowDecimals={false}
                        />
                        <Tooltip content={<CustomTooltip />} cursor={{ fill: 'hsl(var(--muted)/0.2)' }} />
                        <Bar dataKey="orders" fill="#8b5cf6" radius={[4, 4, 0, 0]} name="Orders" barSize={30} />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

export default OrdersChart;

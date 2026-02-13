import { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import api from '@/lib/axios';
import { Loader2 } from 'lucide-react';

const OrderStatusChart = ({ refreshTrigger, dateRange }: { refreshTrigger?: number; dateRange?: { start: string; end: string } }) => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const params: any = {};
                if (dateRange?.start) params.startDate = dateRange.start;
                if (dateRange?.end) params.endDate = dateRange.end;

                const { data } = await api.get('/api/analytics/order-status', { params });
                setData(data);
            } catch (error) {
                console.error("Failed to fetch order status data", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [refreshTrigger, dateRange]);

    const COLORS = ['#3b82f6', '#22c55e', '#ef4444', '#eab308'];

    if (loading) return <div className="h-[300px] flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;

    return (
        <div className="bg-card p-6 rounded-xl border border-border shadow-sm">
            <h3 className="font-serif text-lg font-bold text-foreground mb-6">Order Status</h3>

            <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={data}
                            innerRadius={60}
                            outerRadius={80}
                            paddingAngle={5}
                            dataKey="value"
                            nameKey="_id"
                        >
                            {data.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                        </Pie>
                        <Tooltip />
                        <Legend />
                    </PieChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

export default OrderStatusChart;

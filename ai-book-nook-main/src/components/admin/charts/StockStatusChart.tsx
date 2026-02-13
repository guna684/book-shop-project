import { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import api from '@/lib/axios';
import { Loader2, AlertCircle } from 'lucide-react';

const StockStatusChart = ({ refreshTrigger }: { refreshTrigger?: number }) => {
    const [data, setData] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const { data } = await api.get('/api/analytics/stock-status');
                setData(data);
            } catch (error) {
                console.error("Failed to fetch stock status", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [refreshTrigger]);

    const COLORS = ['#22c55e', '#ef4444']; // Green for In Stock, Red for Out of Stock

    if (loading) return <div className="h-[350px] flex items-center justify-center bg-card rounded-xl border border-border"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;

    if (!data || data.length === 0) {
        return (
            <div className="h-[350px] flex flex-col items-center justify-center bg-card rounded-xl border border-border text-muted-foreground">
                <AlertCircle className="h-10 w-10 mb-2 opacity-50" />
                <p>No stock data available</p>
            </div>
        );
    }

    const CustomTooltip = ({ active, payload }: any) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-popover border border-border p-3 rounded-lg shadow-lg">
                    <p className="text-sm font-medium mb-1 text-foreground">{payload[0].name}</p>
                    <p className="text-sm font-bold text-primary">
                        {payload[0].value} Books
                    </p>
                </div>
            );
        }
        return null;
    };

    return (
        <div className="bg-card p-6 rounded-xl border border-border shadow-sm hover:shadow-md transition-shadow">
            <h3 className="font-serif text-lg font-bold text-foreground mb-1">Stock Status</h3>
            <p className="text-xs text-muted-foreground mb-6">Availability Overview</p>

            <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={data}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={100}
                            paddingAngle={5}
                            dataKey="value"
                        >
                            {data.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                        </Pie>
                        <Tooltip content={<CustomTooltip />} />
                        <Legend
                            verticalAlign="bottom"
                            align="center"
                            wrapperStyle={{ paddingTop: '20px' }}
                        />
                    </PieChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

export default StockStatusChart;

import { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import api from '@/lib/axios';
import { Loader2, AlertCircle, Trophy } from 'lucide-react';

const TopSellingChart = ({ refreshTrigger, dateRange }: { refreshTrigger?: number; dateRange?: { start: string; end: string } }) => {
    const [data, setData] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const params: any = {};
                if (dateRange?.start) params.startDate = dateRange.start;
                if (dateRange?.end) params.endDate = dateRange.end;

                const { data } = await api.get('/api/analytics/top-products', { params });
                setData(data);
            } catch (error) {
                console.error("Failed to fetch top products", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [refreshTrigger, dateRange]);

    const COLORS = ['#FFD700', '#C0C0C0', '#CD7F32', '#4b5563', '#4b5563']; // Gold, Silver, Bronze, Gray...

    if (loading) return <div className="h-[350px] flex items-center justify-center bg-card rounded-xl border border-border"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;

    if (!data || data.length === 0) {
        return (
            <div className="h-[350px] flex flex-col items-center justify-center bg-card rounded-xl border border-border text-muted-foreground">
                <AlertCircle className="h-10 w-10 mb-2 opacity-50" />
                <p>No sales data yet to determine top sellers</p>
            </div>
        );
    }

    const CustomTooltip = ({ active, payload, label }: any) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-popover border border-border p-3 rounded-lg shadow-lg max-w-[200px]">
                    <p className="text-sm font-medium mb-1 text-foreground truncate">{label}</p>
                    <div className="flex justify-between gap-4 text-xs">
                        <span className="text-muted-foreground">Sold:</span>
                        <span className="font-bold text-foreground">{payload[0].value}</span>
                    </div>
                </div>
            );
        }
        return null;
    };

    return (
        <div className="bg-card p-6 rounded-xl border border-border shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center gap-2 mb-1">
                <Trophy className="h-5 w-5 text-yellow-500" />
                <h3 className="font-serif text-lg font-bold text-foreground">Top 5 Best Sellers</h3>
            </div>
            <p className="text-xs text-muted-foreground mb-6">Most popular books by quantity</p>

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
                        <Bar dataKey="totalSold" radius={[0, 4, 4, 0]} barSize={20} name="Units Sold">
                            {data.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length] || '#4b5563'} />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

export default TopSellingChart;

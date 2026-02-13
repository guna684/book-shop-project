import { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import api from '@/lib/axios';
import { Loader2, AlertCircle, AlertTriangle } from 'lucide-react';

const StockChart = ({ refreshTrigger }: { refreshTrigger?: number }) => {
    const [data, setData] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const { data } = await api.get('/api/analytics/stock');
                setData(data);
            } catch (error) {
                console.error("Failed to fetch stock data", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [refreshTrigger]);

    if (loading) return <div className="h-[350px] flex items-center justify-center bg-card rounded-xl border border-border"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;

    if (!data || data.length === 0) {
        return (
            <div className="h-[350px] flex flex-col items-center justify-center bg-card rounded-xl border border-border text-muted-foreground">
                <AlertCircle className="h-10 w-10 mb-2 opacity-50" />
                <p>No stock data available</p>
            </div>
        );
    }

    const CustomTooltip = ({ active, payload, label }: any) => {
        if (active && payload && payload.length) {
            const stock = payload[0].value;
            const isLow = stock < 10;
            return (
                <div className={`bg-popover border ${isLow ? 'border-red-200 bg-red-50' : 'border-border'} p-3 rounded-lg shadow-lg max-w-[200px]`}>
                    <p className="text-sm font-medium mb-1 text-foreground truncate">{label}</p>
                    <p className={`text-sm font-bold ${isLow ? 'text-red-600' : 'text-green-600'}`}>
                        {stock} units left
                    </p>
                </div>
            );
        }
        return null;
    };

    return (
        <div className="bg-card p-6 rounded-xl border border-border shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center gap-2 mb-1">
                <AlertTriangle className="h-5 w-5 text-orange-500" />
                <h3 className="font-serif text-lg font-bold text-foreground">Lowest Stock Items</h3>
            </div>
            <p className="text-xs text-muted-foreground mb-6">Running low (less than 10)</p>

            <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" opacity={0.5} />
                        <XAxis
                            dataKey="title"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
                            interval={0}
                            angle={-30}
                            textAnchor="end"
                            height={60}
                        />
                        <YAxis
                            axisLine={false}
                            tickLine={false}
                            tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
                        />
                        <Tooltip content={<CustomTooltip />} cursor={{ fill: 'hsl(var(--muted)/0.2)' }} />
                        <Bar dataKey="countInStock" name="Stock" radius={[4, 4, 0, 0]} barSize={30}>
                            {data.map((entry: any, index: number) => (
                                <Cell key={`cell-${index}`} fill={entry.countInStock < 10 ? '#ef4444' : '#22c55e'} />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

export default StockChart;

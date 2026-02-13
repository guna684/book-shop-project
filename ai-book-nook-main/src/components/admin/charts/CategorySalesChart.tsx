import { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import api from '@/lib/axios';
import { Loader2, AlertCircle } from 'lucide-react';

const CategorySalesChart = ({ refreshTrigger, dateRange }: { refreshTrigger?: number; dateRange?: { start: string; end: string } }) => {
    const [data, setData] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const params: any = {};
                if (dateRange?.start) params.startDate = dateRange.start;
                if (dateRange?.end) params.endDate = dateRange.end;

                const { data } = await api.get('/api/analytics/category-sales', { params });
                setData(data);
            } catch (error) {
                console.error("Failed to fetch category data", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [refreshTrigger, dateRange]);

    const COLORS = ['#0ea5e9', '#22c55e', '#eab308', '#f43f5e', '#8b5cf6', '#d946ef'];

    if (loading) return <div className="h-[350px] flex items-center justify-center bg-card rounded-xl border border-border"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;

    if (!data || data.length === 0) {
        return (
            <div className="h-[350px] flex flex-col items-center justify-center bg-card rounded-xl border border-border text-muted-foreground">
                <AlertCircle className="h-10 w-10 mb-2 opacity-50" />
                <p>No category sales data</p>
            </div>
        );
    }

    const CustomTooltip = ({ active, payload }: any) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-popover border border-border p-3 rounded-lg shadow-lg">
                    <p className="text-sm font-medium mb-1 text-foreground">{payload[0].name}</p>
                    <p className="text-sm font-bold text-primary">
                        {payload[0].value} units sold
                    </p>
                </div>
            );
        }
        return null;
    };

    return (
        <div className="bg-card p-6 rounded-xl border border-border shadow-sm hover:shadow-md transition-shadow">
            <h3 className="font-serif text-lg font-bold text-foreground mb-1">Category Sales Volume</h3>
            <p className="text-xs text-muted-foreground mb-6">Units sold by book category</p>

            <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={data}
                            cx="50%"
                            cy="50%"
                            outerRadius={100}
                            dataKey="count"
                            nameKey="_id"
                            labelLine={false}
                        >
                            {data.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                        </Pie>
                        <Tooltip content={<CustomTooltip />} />
                        <Legend
                            layout="vertical"
                            verticalAlign="middle"
                            align="right"
                            wrapperStyle={{ fontSize: '12px' }}
                        />
                    </PieChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

export default CategorySalesChart;

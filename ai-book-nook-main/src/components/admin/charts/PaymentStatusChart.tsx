import { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import api from '@/lib/axios';
import { Loader2 } from 'lucide-react';

const PaymentStatusChart = ({ refreshTrigger }: { refreshTrigger?: number }) => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const { data } = await api.get('/api/analytics/payment-status');
                setData(data);
            } catch (error) {
                console.error("Failed to fetch payment status data", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [refreshTrigger]);

    const COLORS = ['#22c55e', '#ef4444', '#eab308'];

    if (loading) return <div className="h-[300px] flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;

    return (
        <div className="bg-card p-6 rounded-xl border border-border shadow-sm">
            <h3 className="font-serif text-lg font-bold text-foreground mb-6">Payment Status</h3>

            <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={data}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="value"
                        >
                            {data.map((entry: any, index: number) => (
                                <Cell key={`cell-${index}`} fill={entry.name === 'Paid' ? '#22c55e' : '#ef4444'} />
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

export default PaymentStatusChart;

import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '@/lib/axios';
import { useAuth } from '@/context/AuthContext';
import { Helmet } from 'react-helmet-async';
import { Button } from '@/components/ui/button';
import { Printer } from 'lucide-react';

interface OrderItem {
    title: string;
    qty: number;
    image: string;
    price: number;
}

interface Order {
    _id: string;
    itemsPrice: number;
    shippingPrice: number;
    taxPrice: number;
    totalPrice: number;
    isPaid: boolean;
    paidAt: string;
    createdAt: string;
    orderItems: OrderItem[];
    user: {
        name: string;
        email: string;
    };
    shippingAddress: {
        address: string;
        city: string;
        postalCode: string;
        country: string;
    }
}

const Invoice = () => {
    const { id } = useParams();
    const { user } = useAuth();
    const [order, setOrder] = useState<Order | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchOrder = async () => {
            try {
                const config = {
                    headers: {
                        Authorization: `Bearer ${user?.token}`,
                    },
                };
                const { data } = await api.get(`/api/orders/${id}`, config);
                setOrder(data);
            } catch (error) {
                console.error('Error fetching order:', error);
            } finally {
                setLoading(false);
            }
        };

        if (user && id) {
            fetchOrder();
        }
    }, [id, user]);

    if (loading) return <div className="p-8 text-center">Loading Invoice...</div>;
    if (!order) return <div className="p-8 text-center text-red-500">Order not found</div>;

    return (
        <>
            <Helmet>
                <title>Invoice - {order._id}</title>
            </Helmet>
            <div className="bg-white min-h-screen p-8 max-w-4xl mx-auto text-black print:p-0">

                {/* Header / Actions - Hidden in Print */}
                <div className="flex justify-between items-center mb-8 print:hidden">
                    <Button variant="outline" onClick={() => window.history.back()}>Back</Button>
                    <Button onClick={() => window.print()} className="flex gap-2">
                        <Printer size={16} /> Print Invoice
                    </Button>
                </div>

                {/* Invoice Content */}
                <div className="border border-gray-200 p-8 rounded-sm print:border-none print:p-0">
                    {/* Header */}
                    <div className="flex justify-between items-start border-b border-gray-200 pb-8 mb-8">
                        <div>
                            <h1 className="text-3xl font-bold font-serif mb-2">Sri Chola Book Shop</h1>
                            <p className="text-gray-500">Your one-stop book destination</p>
                        </div>
                        <div className="text-right">
                            <h2 className="text-xl font-bold text-gray-800">INVOICE</h2>
                            <p className="text-gray-600 mt-2">Order ID: {order._id}</p>
                            <p className="text-gray-600">Date: {new Date(order.createdAt).toLocaleDateString()}</p>
                        </div>
                    </div>

                    {/* Bill To / Ship To */}
                    <div className="grid grid-cols-2 gap-8 mb-8">
                        <div>
                            <h3 className="font-bold text-gray-700 mb-2">Bill To:</h3>
                            <p className="text-gray-600">{order.user.name}</p>
                            <p className="text-gray-600">{order.user.email}</p>
                        </div>
                        <div>
                            <h3 className="font-bold text-gray-700 mb-2">Ship To:</h3>
                            <p className="text-gray-600">{order.shippingAddress.address}</p>
                            <p className="text-gray-600">{order.shippingAddress.city}, {order.shippingAddress.postalCode}</p>
                            <p className="text-gray-600">{order.shippingAddress.country}</p>
                        </div>
                    </div>

                    {/* Table */}
                    <table className="w-full mb-8">
                        <thead>
                            <tr className="bg-gray-50 text-left">
                                <th className="p-4 font-semibold text-gray-700">Item</th>
                                <th className="p-4 font-semibold text-gray-700 text-right">Price</th>
                                <th className="p-4 font-semibold text-gray-700 text-center">Qty</th>
                                <th className="p-4 font-semibold text-gray-700 text-right">Total</th>
                            </tr>
                        </thead>
                        <tbody>
                            {order.orderItems.map((item, index) => (
                                <tr key={index} className="border-b border-gray-100">
                                    <td className="p-4 text-gray-700">{item.title}</td>
                                    <td className="p-4 text-gray-700 text-right">₹{item.price}</td>
                                    <td className="p-4 text-gray-700 text-center">{item.qty}</td>
                                    <td className="p-4 text-gray-700 text-right">₹{(item.price * item.qty).toFixed(2)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {/* Summary */}
                    <div className="flex justify-end">
                        <div className="w-64">
                            <div className="flex justify-between py-2 border-b border-gray-100">
                                <span className="text-gray-600">Subtotal:</span>
                                <span className="font-medium">₹{order.itemsPrice.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between py-2 border-b border-gray-100">
                                <span className="text-gray-600">Shipping:</span>
                                <span className="font-medium">₹{order.shippingPrice.toFixed(2)}</span>
                            </div>
                            {order.taxPrice > 0 && (
                                <div className="flex justify-between py-2 border-b border-gray-100">
                                    <span className="text-gray-600">Tax:</span>
                                    <span className="font-medium">₹{order.taxPrice.toFixed(2)}</span>
                                </div>
                            )}
                            <div className="flex justify-between py-4 text-lg">
                                <span className="font-bold text-gray-800">Total:</span>
                                <span className="font-bold text-indigo-600">₹{order.totalPrice.toFixed(2)}</span>
                            </div>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="mt-12 pt-8 border-t border-gray-200 text-center text-gray-500 text-sm">
                        <p>Thank you for your business!</p>
                        <p className="mt-2">If you have any questions about this invoice, please contact support@sricholabookshop.com</p>
                    </div>
                </div>
            </div>
        </>
    );
};

export default Invoice;

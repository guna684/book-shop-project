import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Check, X, Edit, Truck } from 'lucide-react';
import api from '@/lib/axios';
import { toast } from 'sonner';
import AdminLayout from '@/components/layout/AdminLayout';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';
import { useTranslation } from 'react-i18next';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";

const OrderList = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const { user } = useAuth();
    const navigate = useNavigate();
    const { t } = useTranslation();

    // Dialog State
    const [selectedOrder, setSelectedOrder] = useState<any>(null);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [newStatus, setNewStatus] = useState('');
    const [updating, setUpdating] = useState(false);



    // Helper to get translated status
    const getStatusLabel = (status: string) => {
        const key = status.toLowerCase().replace(/\s+/g, '');
        // Map 'Out for Delivery' to 'outForDelivery'
        const normalizedKey = key === 'outfordelivery' ? 'outForDelivery' : key;
        const translationKey = `admin.orders.statuses.${normalizedKey}`;
        const translated = t(translationKey);
        // If translation is the key itself (missing), return original status
        return translated === translationKey ? status : translated;
    };

    const STATUS_OPTIONS = [
        'Pending',
        'Confirmed',
        'Processing',
        'Packed',
        'Shipped',
        'Out for Delivery',
        'Delivered',
        'Cancelled',
        'Returned',
        'Refunded'
    ];

    useEffect(() => {
        if (user && user.isAdmin) {
            fetchOrders();
        } else {
            navigate('/login');
        }
    }, [user, navigate]);

    const fetchOrders = async () => {
        try {
            const config = {
                headers: {
                    Authorization: `Bearer ${user?.token}`,
                },
            };
            const { data } = await api.get('/api/orders', config);
            setOrders(data);
        } catch (error) {
            toast.error(t('admin.orders.fetchError'));
        } finally {
            setLoading(false);
        }
    };

    const handleEditStatus = (order: any) => {
        setSelectedOrder(order);
        setNewStatus(order.status);
        setIsDialogOpen(true);
    };

    const saveStatus = async () => {
        if (!selectedOrder) return;
        setUpdating(true);
        try {
            const config = {
                headers: { Authorization: `Bearer ${user?.token}` },
            };
            await api.put(`/api/orders/${selectedOrder._id}/status`, { status: newStatus }, config);
            toast.success(t('admin.orders.statusUpdated'));
            setIsDialogOpen(false);
            fetchOrders(); // Refresh list

            // Trigger dashboard refresh if status changed to Delivered
            if (newStatus === 'Delivered') {
                console.log('🚀 Emitting orderDelivered event:', {
                    orderId: selectedOrder._id,
                    status: newStatus,
                    timestamp: new Date().toISOString()
                });

                // Emit custom event for dashboard to listen
                window.dispatchEvent(new CustomEvent('orderDelivered', {
                    detail: { orderId: selectedOrder._id, status: newStatus }
                }));

                // Additional notification
                toast.info('Dashboard will refresh automatically');
            }
        } catch (error) {
            toast.error(t('admin.orders.updateError'));
        } finally {
            setUpdating(false);
        }
    };

    return (
        <AdminLayout>
            <Helmet>
                <title>Admin Orders | Sri Chola Book Shop</title>
            </Helmet>

            <div className="w-full">
                <h1 className="text-3xl font-bold font-serif mb-6">{t('admin.orders.title')}</h1>

                {loading ? (
                    <div>{t('admin.common.loading')}</div>
                ) : (
                    <div className="bg-card rounded-xl shadow-sm border border-border overflow-hidden">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>{t('admin.orders.table.id')}</TableHead>
                                    <TableHead>{t('admin.orders.table.user')}</TableHead>
                                    <TableHead>{t('admin.orders.table.date')}</TableHead>
                                    <TableHead>{t('admin.orders.table.total')}</TableHead>
                                    <TableHead>{t('admin.orders.table.status')}</TableHead>
                                    <TableHead>{t('admin.orders.table.paid')}</TableHead>
                                    <TableHead>{t('admin.orders.table.actions')}</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {orders.map((order: any) => (
                                    <TableRow key={order._id}>
                                        <TableCell className="font-mono text-xs">{order._id}</TableCell>
                                        <TableCell>{order.user && order.user.name}</TableCell>
                                        <TableCell>{order.createdAt.substring(0, 10)}</TableCell>
                                        <TableCell>₹{order.totalPrice}</TableCell>
                                        <TableCell>
                                            <span className={`px-2 py-1 rounded-full text-xs font-semibold 
                                                ${order.status === 'Delivered' ? 'bg-green-100 text-green-700' :
                                                    order.status === 'Cancelled' ? 'bg-red-100 text-red-700' :
                                                        'bg-yellow-100 text-yellow-700'}`}>
                                                {getStatusLabel(order.status)}
                                            </span>
                                        </TableCell>
                                        <TableCell>
                                            {order.isPaid ? (
                                                <div className="text-green-600 flex items-center gap-1">
                                                    <Check className="h-4 w-4" /> {order.paidAt?.substring(0, 10)}
                                                </div>
                                            ) : (
                                                <X className="h-4 w-4 text-red-500" />
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="gap-1"
                                                onClick={() => handleEditStatus(order)}
                                            >
                                                <Edit className="h-4 w-4" /> {t('admin.orders.table.update')}
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                )}
            </div>

            {/* Status Update Dialog */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{t('admin.orders.updateStatus')}</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label>{t('admin.orders.currentStatus')}: <span className="font-bold">{selectedOrder?.status}</span></Label>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="status">{t('admin.orders.newStatus')}</Label>
                            <Select value={newStatus} onValueChange={setNewStatus}>
                                <SelectTrigger>
                                    <SelectValue placeholder={t('admin.orders.selectStatus')} />
                                </SelectTrigger>
                                <SelectContent>
                                    {STATUS_OPTIONS.map((status) => (
                                        <SelectItem key={status} value={status}>
                                            {getStatusLabel(status)}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsDialogOpen(false)} disabled={updating}>{t('admin.common.cancel')}</Button>
                        <Button onClick={saveStatus} disabled={updating}>
                            {updating ? t('admin.orders.updating') : t('admin.orders.saveChanges')}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </AdminLayout>
    );
};

export default OrderList;

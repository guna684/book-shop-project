import { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router-dom';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Trash2, Users, Shield, ShieldAlert, Check, X } from 'lucide-react';
import { toast } from 'sonner';
import api from '@/lib/axios';
import AdminLayout from '@/components/layout/AdminLayout';
import { useAuth } from '@/context/AuthContext';
import { useTranslation } from 'react-i18next';

interface User {
    _id: string;
    name: string;
    email: string;
    isAdmin: boolean;
}

const UserList = () => {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const { user: currentUser } = useAuth();
    const navigate = useNavigate();
    const { t } = useTranslation();

    useEffect(() => {
        if (currentUser && !currentUser.isAdmin) {
            navigate('/');
        }
        fetchUsers();
    }, [currentUser, navigate]);

    const fetchUsers = async () => {
        try {
            const config = {
                headers: { Authorization: `Bearer ${currentUser?.token}` },
            };
            const { data } = await api.get('/api/users', config);
            setUsers(data);
        } catch (error) {
            toast.error(t('admin.users.fetchError'));
        } finally {
            setLoading(false);
        }
    };

    const deleteHandler = async (id: string) => {
        if (window.confirm(t('admin.users.deleteConfirm'))) {
            try {
                const config = {
                    headers: { Authorization: `Bearer ${currentUser?.token}` },
                };
                await api.delete(`/api/users/${id}`, config);
                toast.success(t('admin.users.deleteSuccess'));
                fetchUsers();
            } catch (error) {
                toast.error(t('admin.users.deleteError'));
            }
        }
    };

    const makeAdminHandler = async (id: string, isAdmin: boolean) => {
        try {
            const config = {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${currentUser?.token}`
                },
            };
            await api.put(`/api/users/${id}`, { isAdmin: !isAdmin }, config);
            toast.success(t('admin.users.updateSuccess'));
            fetchUsers();
        } catch (error) {
            toast.error(t('admin.users.updateError'));
        }
    };

    // Note: To implement "Make Admin" functionality, you'd typically need a backend endpoint like PUT /api/users/:id
    // For now, we are just listing users and allowing delete. 
    // If you need "Make Admin" feature, we can add it.

    return (
        <AdminLayout>
            <Helmet>
                <title>Users | Admin Sri Chola Book Shop</title>
            </Helmet>
            <div className="w-full">
                <h1 className="text-3xl font-bold font-serif mb-8 flex items-center gap-3">
                    <Users className="h-8 w-8 text-primary" />
                    {t('admin.users.titleCombined')}
                </h1>

                {loading ? (
                    <div>{t('admin.common.loading')}</div>
                ) : (
                    <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>{t('admin.users.table.id')}</TableHead>
                                    <TableHead>{t('admin.users.table.name')}</TableHead>
                                    <TableHead>{t('admin.users.table.email')}</TableHead>
                                    <TableHead>{t('admin.users.table.admin')}</TableHead>
                                    <TableHead className="text-right">{t('admin.users.table.actions')}</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {users.map((user) => (
                                    <TableRow key={user._id}>
                                        <TableCell className="font-mono text-xs">{user._id}</TableCell>
                                        <TableCell>{user.name}</TableCell>
                                        <TableCell><a href={`mailto:${user.email}`} className="text-primary hover:underline">{user.email}</a></TableCell>
                                        <TableCell>
                                            {user.isAdmin ? (
                                                <div className="flex items-center gap-1 text-green-600 font-medium">
                                                    <Shield className="h-4 w-4" /> {t('admin.users.role.admin')}
                                                </div>
                                            ) : (
                                                <div className="flex items-center gap-1 text-muted-foreground">
                                                    <Users className="h-4 w-4" /> {t('admin.users.role.user')}
                                                </div>
                                            )}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-2">
                                                {user._id !== currentUser?._id && (
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => makeAdminHandler(user._id, user.isAdmin)}
                                                        className={user.isAdmin ? "text-orange-600 hover:text-orange-700" : "text-green-600 hover:text-green-700"}
                                                    >
                                                        {user.isAdmin ? t('admin.users.removeAdmin') : t('admin.users.makeAdmin')}
                                                    </Button>
                                                )}
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => deleteHandler(user._id)}
                                                    disabled={user._id === currentUser?._id} // Prevent deleting self
                                                >
                                                    <Trash2 className="h-4 w-4 text-destructive" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                )}
            </div>
        </AdminLayout>
    );
};

export default UserList;

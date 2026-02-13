import { useEffect, useState } from 'react';
import api from '@/lib/axios';
import { Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { toast } from 'sonner';
import { Plus, Trash2, ChevronLeft, Loader2 } from 'lucide-react';
import AdminLayout from '@/components/layout/AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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

interface Category {
    _id: string;
    name: string;
    slug: string;
    icon: string;
    description: string;
    bookCount: number;
}

const CategoryList = () => {
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [newCategory, setNewCategory] = useState('');
    const [newSlug, setNewSlug] = useState('');
    const [newIcon, setNewIcon] = useState('📚');
    const [newDesc, setNewDesc] = useState('');
    const [createLoading, setCreateLoading] = useState(false);

    const { user } = useAuth();
    const navigate = useNavigate();
    const { t } = useTranslation();

    const fetchCategories = async () => {
        try {
            const { data } = await api.get('/api/categories');
            setCategories(data);
            setLoading(false);
        } catch (error) {
            toast.error(t('admin.categories.fetchError'));
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!user || !user.isAdmin) {
            navigate('/login');
            return;
        }
        fetchCategories();
    }, [user, navigate]);

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newCategory || !newSlug) return;

        setCreateLoading(true);
        try {
            const config = {
                headers: { Authorization: `Bearer ${user?.token}` },
            };
            await api.post('/api/categories', {
                name: newCategory,
                slug: newSlug,
                icon: newIcon,
                description: newDesc
            }, config);
            toast.success(t('admin.categories.createSuccess'));
            setNewCategory('');
            setNewSlug('');
            setNewIcon('📚');
            setNewDesc('');
            fetchCategories();
        } catch (error: any) {
            toast.error(error.response?.data?.message || t('admin.categories.createError'));
        } finally {
            setCreateLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm('Are you sure?')) return;
        try {
            const config = {
                headers: { Authorization: `Bearer ${user?.token}` },
            };
            await api.delete(`/api/categories/${id}`, config);
            toast.success(t('admin.categories.deleteSuccess'));
            fetchCategories();
        } catch (error) {
            toast.error(t('admin.categories.deleteError'));
        }
    };

    return (
        <AdminLayout>
            <Helmet>
                <title>Categories | Admin</title>
            </Helmet>
            <div className="w-full">
                <div className="flex justify-between items-center mb-6">
                    <Link to="/admin/dashboard" className="flex items-center gap-2 text-muted-foreground hover:text-foreground">
                        <ChevronLeft className="h-4 w-4" /> {t('admin.common.back')}
                    </Link>
                    <h1 className="text-3xl font-bold font-serif">{t('admin.categories.manage')}</h1>
                </div>

                {/* Create Form */}
                <div className="bg-card p-6 rounded-xl border border-border shadow-sm mb-8">
                    <h2 className="text-xl font-semibold mb-4">{t('admin.categories.addNew')}</h2>
                    <form onSubmit={handleCreate} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">{t('admin.categories.form.name')}</label>
                                <Input value={newCategory} onChange={(e) => setNewCategory(e.target.value)} placeholder="e.g. Fiction" required />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Slug</label>
                                <Input value={newSlug} onChange={(e) => setNewSlug(e.target.value)} placeholder="e.g. fiction" required />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Icon</label>
                                <Input value={newIcon} onChange={(e) => setNewIcon(e.target.value)} placeholder="📚" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">{t('admin.categories.form.description')}</label>
                                <Input value={newDesc} onChange={(e) => setNewDesc(e.target.value)} placeholder="Optional description" />
                            </div>
                        </div>
                        <Button type="submit" disabled={createLoading}>
                            {createLoading ? <Loader2 className="animate-spin h-4 w-4" /> : <Plus className="h-4 w-4 mr-2" />}
                            {t('admin.common.add')}
                        </Button>
                    </form>
                </div>

                {/* List */}
                {loading ? <div>{t('admin.common.loading')}</div> : (
                    <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Icon</TableHead>
                                    <TableHead>{t('admin.categories.table.name')}</TableHead>
                                    <TableHead>Slug</TableHead>
                                    <TableHead>{t('admin.categories.table.description')}</TableHead>
                                    <TableHead>Books</TableHead>
                                    <TableHead className="text-right">{t('admin.categories.table.actions')}</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {categories.map((cat) => (
                                    <TableRow key={cat._id}>
                                        <TableCell className="text-2xl">{cat.icon}</TableCell>
                                        <TableCell className="font-medium">{cat.name}</TableCell>
                                        <TableCell className="font-mono text-xs text-muted-foreground">{cat.slug}</TableCell>
                                        <TableCell>{cat.description}</TableCell>
                                        <TableCell>{cat.bookCount}</TableCell>
                                        <TableCell className="text-right">
                                            <Button variant="ghost" size="icon" className="text-destructive" onClick={() => handleDelete(cat._id)}>
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                                {categories.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                                            {t('admin.categories.noCategories')}
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>
                )}
            </div>
        </AdminLayout>
    );
};

export default CategoryList;

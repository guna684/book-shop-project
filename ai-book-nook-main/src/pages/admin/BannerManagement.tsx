import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Helmet } from 'react-helmet-async';
import { Save, Plus, Trash2, GripVertical, Image as ImageIcon, LayoutTemplate } from 'lucide-react';
import AdminLayout from '@/components/layout/AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { useToast } from '@/components/ui/use-toast';
import api from '@/lib/axios';
import { useAuth } from '@/context/AuthContext';

interface BannerButton {
    text: string;
    link: string;
    variant: 'hero' | 'paper' | 'primary' | 'outline';
    order: number;
    isVisible: boolean;
    _id?: string;
}

interface BannerCounter {
    label: string;
    value: string;
    suffix: string;
    isVisible: boolean;
    _id?: string;
}

interface BannerSettings {
    title: string;
    subtitle: string;
    imageUrl: string;
    overlayOpacity: number;
    buttons: BannerButton[];
    counters: BannerCounter[];
    isActive: boolean;
}

const BannerManagement = () => {
    const { t } = useTranslation();
    const { user } = useAuth();
    const { toast } = useToast();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    // Initial state with defaults
    const [formData, setFormData] = useState<BannerSettings>({
        title: '',
        subtitle: '',
        imageUrl: '',
        overlayOpacity: 0.1,
        buttons: [],
        counters: [],
        isActive: true
    });

    useEffect(() => {
        fetchBannerSettings();
    }, []);

    const fetchBannerSettings = async () => {
        try {
            const config = {
                headers: { Authorization: `Bearer ${user?.token}` }
            };
            const { data } = await api.get('/api/banner/admin', config);

            // Allow for partially missing data if defaults kick in on backend or new document creation
            if (data && Object.keys(data).length > 0) {
                setFormData({
                    title: data.title || '',
                    subtitle: data.subtitle || '',
                    imageUrl: data.imageUrl || '',
                    overlayOpacity: data.overlayOpacity ?? 0.1,
                    buttons: data.buttons || [],
                    counters: data.counters || [],
                    isActive: data.isActive ?? true
                });
            }
        } catch (error) {
            console.error(error);
            toast({
                title: "Error",
                description: "Failed to load banner settings",
                variant: "destructive"
            });
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            const config = {
                headers: { Authorization: `Bearer ${user?.token}` }
            };
            await api.post('/api/banner', formData, config);
            toast({
                title: "Success",
                description: "Banner settings updated successfully",
            });
        } catch (error: any) {
            console.error(error);
            toast({
                title: "Error",
                description: error.response?.data?.message || "Failed to save settings",
                variant: "destructive"
            });
        } finally {
            setSaving(false);
        }
    };

    const handleButtonChange = (index: number, field: keyof BannerButton, value: any) => {
        const newButtons = [...formData.buttons];
        newButtons[index] = { ...newButtons[index], [field]: value };
        setFormData({ ...formData, buttons: newButtons });
    };

    const handleCounterChange = (index: number, field: keyof BannerCounter, value: any) => {
        const newCounters = [...formData.counters];
        newCounters[index] = { ...newCounters[index], [field]: value };
        setFormData({ ...formData, counters: newCounters });
    };

    const addButton = () => {
        setFormData({
            ...formData,
            buttons: [
                ...formData.buttons,
                { text: 'New Button', link: '/', variant: 'primary', order: formData.buttons.length + 1, isVisible: true }
            ]
        });
    };

    const removeButton = (index: number) => {
        const newButtons = formData.buttons.filter((_, i) => i !== index);
        setFormData({ ...formData, buttons: newButtons });
    };

    const addCounter = () => {
        setFormData({
            ...formData,
            counters: [
                ...formData.counters,
                { label: 'New Stat', value: '100', suffix: '+', isVisible: true }
            ]
        });
    };

    const removeCounter = (index: number) => {
        const newCounters = formData.counters.filter((_, i) => i !== index);
        setFormData({ ...formData, counters: newCounters });
    };

    if (loading) {
        return (
            <AdminLayout>
                <div className="flex justify-center items-center h-full">
                    Loading banner settings...
                </div>
            </AdminLayout>
        );
    }

    return (
        <AdminLayout>
            <Helmet>
                <title>Banner Management | Admin</title>
            </Helmet>

            <div className="max-w-4xl mx-auto pb-12">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-3xl font-bold font-serif flex items-center gap-3">
                        <LayoutTemplate className="h-8 w-8 text-primary" />
                        Banner Management
                    </h1>
                    <Button onClick={handleSave} disabled={saving} className="gap-2">
                        <Save className="h-4 w-4" />
                        {saving ? 'Saving...' : 'Save Changes'}
                    </Button>
                </div>

                <form onSubmit={handleSave} className="space-y-8">
                    {/* General Settings */}
                    <div className="bg-card border border-border rounded-xl p-6 space-y-4 shadow-sm">
                        <h2 className="text-xl font-semibold mb-4">General Settings</h2>

                        <div className="space-y-2">
                            <Label htmlFor="title">Banner Title</Label>
                            <Input
                                id="title"
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                placeholder="Enter banner title"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="subtitle">Subtitle / Description</Label>
                            <Textarea
                                id="subtitle"
                                value={formData.subtitle}
                                onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                                placeholder="Enter subtitle or description"
                                className="min-h-[100px]"
                            />
                        </div>

                        <div className="grid md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="imageUrl">Background Image URL</Label>
                                <div className="flex gap-2">
                                    <Input
                                        id="imageUrl"
                                        value={formData.imageUrl}
                                        onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                                        placeholder="https://example.com/image.jpg"
                                    />
                                    {/* Placeholder for image upload if implemented later */}
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label className="flex justify-between">
                                    Overlay Opacity <span>{Math.round(formData.overlayOpacity * 100)}%</span>
                                </Label>
                                <Slider
                                    value={[formData.overlayOpacity]}
                                    max={1}
                                    step={0.05}
                                    onValueChange={(val) => setFormData({ ...formData, overlayOpacity: val[0] })}
                                />
                            </div>
                        </div>

                        <div className="flex items-center space-x-2 pt-2">
                            <Checkbox
                                id="isActive"
                                checked={formData.isActive}
                                onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked as boolean })}
                            />
                            <Label htmlFor="isActive">Banner Active (Visible on Home Page)</Label>
                        </div>
                    </div>

                    {/* Buttons Management */}
                    <div className="bg-card border border-border rounded-xl p-6 space-y-4 shadow-sm">
                        <div className="flex justify-between items-center mb-2">
                            <h2 className="text-xl font-semibold">Action Buttons</h2>
                            <Button type="button" variant="outline" size="sm" onClick={addButton} className="gap-2">
                                <Plus className="h-4 w-4" /> Add Button
                            </Button>
                        </div>

                        {formData.buttons.length === 0 && (
                            <p className="text-muted-foreground text-center py-4">No buttons configured.</p>
                        )}

                        <div className="space-y-4">
                            {formData.buttons.map((btn, index) => (
                                <div key={index} className="flex gap-4 items-start p-4 bg-background border rounded-lg">
                                    <div className="mt-3 text-muted-foreground cursor-move">
                                        <GripVertical className="h-5 w-5" />
                                    </div>
                                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 flex-1">
                                        <div className="space-y-1">
                                            <Label className="text-xs">Text</Label>
                                            <Input
                                                value={btn.text}
                                                onChange={(e) => handleButtonChange(index, 'text', e.target.value)}
                                                placeholder="Button Text"
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            <Label className="text-xs">Link</Label>
                                            <Input
                                                value={btn.link}
                                                onChange={(e) => handleButtonChange(index, 'link', e.target.value)}
                                                placeholder="/path"
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            <Label className="text-xs">Variant</Label>
                                            <Select
                                                value={btn.variant}
                                                onValueChange={(val) => handleButtonChange(index, 'variant', val)}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="hero">Hero (Gold)</SelectItem>
                                                    <SelectItem value="paper">Paper (White)</SelectItem>
                                                    <SelectItem value="primary">Primary</SelectItem>
                                                    <SelectItem value="outline">Outline</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="flex items-center gap-4 pt-4">
                                            <div className="flex items-center space-x-2">
                                                <Checkbox
                                                    id={`btn-visible-${index}`}
                                                    checked={btn.isVisible}
                                                    onCheckedChange={(checked) => handleButtonChange(index, 'isVisible', checked)}
                                                />
                                                <Label htmlFor={`btn-visible-${index}`} className="text-xs">Visible</Label>
                                            </div>
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="icon"
                                                className="text-destructive hover:text-destructive hover:bg-destructive/10 ml-auto"
                                                onClick={() => removeButton(index)}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Counters/Stats Management */}
                    <div className="bg-card border border-border rounded-xl p-6 space-y-4 shadow-sm">
                        <div className="flex justify-between items-center mb-2">
                            <h2 className="text-xl font-semibold">Statistics Counters</h2>
                            <Button type="button" variant="outline" size="sm" onClick={addCounter} className="gap-2">
                                <Plus className="h-4 w-4" /> Add Counter
                            </Button>
                        </div>

                        {formData.counters.length === 0 && (
                            <p className="text-muted-foreground text-center py-4">No counters configured.</p>
                        )}

                        <div className="space-y-4">
                            {formData.counters.map((counter, index) => (
                                <div key={index} className="flex gap-4 items-start p-4 bg-background border rounded-lg">
                                    <div className="mt-3 text-muted-foreground cursor-move">
                                        <GripVertical className="h-5 w-5" />
                                    </div>
                                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 flex-1">
                                        <div className="space-y-1">
                                            <Label className="text-xs">Label</Label>
                                            <Input
                                                value={counter.label}
                                                onChange={(e) => handleCounterChange(index, 'label', e.target.value)}
                                                placeholder="e.g. Books"
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            <Label className="text-xs">Value</Label>
                                            <Input
                                                value={counter.value}
                                                onChange={(e) => handleCounterChange(index, 'value', e.target.value)}
                                                placeholder="e.g. 50K"
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            <Label className="text-xs">Suffix</Label>
                                            <Input
                                                value={counter.suffix}
                                                onChange={(e) => handleCounterChange(index, 'suffix', e.target.value)}
                                                placeholder="e.g. +"
                                            />
                                        </div>
                                        <div className="flex items-center gap-4 pt-4">
                                            <div className="flex items-center space-x-2">
                                                <Checkbox
                                                    id={`counter-visible-${index}`}
                                                    checked={counter.isVisible}
                                                    onCheckedChange={(checked) => handleCounterChange(index, 'isVisible', checked)}
                                                />
                                                <Label htmlFor={`counter-visible-${index}`} className="text-xs">Visible</Label>
                                            </div>
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="icon"
                                                className="text-destructive hover:text-destructive hover:bg-destructive/10 ml-auto"
                                                onClick={() => removeCounter(index)}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                </form>
            </div>
        </AdminLayout>
    );
};

export default BannerManagement;

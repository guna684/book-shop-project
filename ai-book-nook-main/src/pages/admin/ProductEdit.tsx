import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import api from '@/lib/axios';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import AdminLayout from '@/components/layout/AdminLayout';
import { useAuth } from '@/context/AuthContext';
import { ChevronLeft, Loader2, Upload, X } from 'lucide-react';

const ProductEdit = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const { t } = useTranslation();

    const [title, setTitle] = useState('');
    const [price, setPrice] = useState(0);
    const [image, setImage] = useState('');
    const [imageUrl, setImageUrl] = useState('');
    const [author, setAuthor] = useState('');
    const [category, setCategory] = useState('');
    const [countInStock, setCountInStock] = useState(0);
    const [description, setDescription] = useState('');
    const [featured, setFeatured] = useState(false);
    const [bestseller, setBestseller] = useState(false);
    const [isbn, setIsbn] = useState('');
    const [pages, setPages] = useState('');
    const [language, setLanguage] = useState('');
    const [publishedDate, setPublishedDate] = useState('');
    const [genre, setGenre] = useState('');

    const [loading, setLoading] = useState(true);
    const [loadingUpdate, setLoadingUpdate] = useState(false);
    const [uploadingImage, setUploadingImage] = useState(false);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState('');

    useEffect(() => {
        if (!user || (user && !user.isAdmin)) {
            // navigate('/login'); // Do not navigate here, let the second check handle it or protect route
            // Actually, usually we redirect if not admin.
        }

        const fetchProduct = async () => {
            if (!id) return;
            try {
                const { data } = await api.get(`/api/books/${id}`);
                setTitle(data.title);
                setAuthor(data.author);
                setPrice(data.price);
                setDescription(data.description);
                setCategory(data.category);
                setImage(data.coverImage); // Backend uses 'coverImage'
                setImageUrl(data.image_url || '');
                setCountInStock(data.stock); // Backend uses 'stock'
                setFeatured(data.featured);
                setBestseller(data.bestseller);
                setIsbn(data.isbn || '');
                setPages(data.pages || '');
                setLanguage(data.language || '');
                if (data.publishedDate) {
                    setPublishedDate(data.publishedDate.split('T')[0]);
                } else {
                    setPublishedDate('');
                }
                setGenre(data.genre || '');
                setLoading(false);
            } catch (error) {
                toast.error('Failed to fetch product');
                navigate('/admin/productlist');
                setLoading(false);
            }
        };

        if (user && user.isAdmin) {
            fetchProduct();
        } else if (!user) {
            navigate('/login');
        }
    }, [id, user, navigate]);

    // Handle file selection
    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            // Validate file type
            const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
            if (!validTypes.includes(file.type)) {
                toast.error('Only JPEG, PNG, and WebP images are allowed');
                return;
            }

            // Validate file size (5MB)
            if (file.size > 5 * 1024 * 1024) {
                toast.error('Image size must be less than 5MB');
                return;
            }

            setSelectedFile(file);

            // Create preview
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    // Upload image to server
    const uploadImage = async (): Promise<string | null> => {
        if (!selectedFile) return null;

        setUploadingImage(true);
        try {
            const formData = new FormData();
            formData.append('image', selectedFile);

            const config = {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    Authorization: `Bearer ${user?.token}`,
                },
            };

            const { data } = await api.post('/api/upload/book-image', formData, config);
            toast.success('Image uploaded successfully');
            return data.filePath;
        } catch (error: any) {
            console.error('Upload error:', error);
            toast.error(error.response?.data?.message || 'Image upload failed');
            return null;
        } finally {
            setUploadingImage(false);
        }
    };

    const submitHandler = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoadingUpdate(true);
        try {
            // Custom validation: Ensure at least one image source is provided
            if (!selectedFile && !image && !imageUrl) {
                toast.error('Please provide at least one image source: upload a file, enter a static image path, or provide an image URL');
                setLoadingUpdate(false);
                return;
            }

            // Upload image if a file is selected
            let uploadedImagePath = null;
            if (selectedFile) {
                uploadedImagePath = await uploadImage();
                if (!uploadedImagePath) {
                    // Upload failed, stop submission
                    setLoadingUpdate(false);
                    return;
                }
            }

            const config = {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${user?.token}`,
                },
            };

            const payload = {
                title,
                author,
                price,
                description,
                category,
                coverImage: uploadedImagePath || image, // Prioritize uploaded image
                image_url: imageUrl,
                stock: countInStock, // Map 'countInStock' state to 'stock' for backend
                featured,
                bestseller,
                isbn,
                pages,
                language,
                publishedDate,
                genre,
            };

            const { data } = await api.put(
                `/api/books/${id}`,
                payload,
                config
            );

            toast.success('Product updated successfully');

            // Navigate back to product list which will auto-refresh
            navigate('/admin/productlist');
        } catch (error: any) {
            console.error('Update error:', error);
            const errorMessage = error.response?.data?.message || error.message || 'Update failed';
            toast.error(`Failed to update product: ${errorMessage}`);
        } finally {
            setLoadingUpdate(false);
        }
    };

    return (
        <AdminLayout>
            <Helmet>
                <title>Edit Product | Sri Chola Book Shop</title>
            </Helmet>

            <div className="max-w-2xl mx-auto">
                <Link to="/admin/productlist" className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6">
                    <ChevronLeft className="h-4 w-4" /> {t('admin.common.back')}
                </Link>

                <h1 className="text-3xl font-bold font-serif mb-8">{t('admin.products.editProduct')}</h1>

                {loading ? (
                    <div>{t('admin.common.loading')}</div>
                ) : (
                    <form onSubmit={submitHandler} className="space-y-6 bg-card p-6 rounded-xl border border-border shadow-sm">
                        <div className="space-y-2">
                            <Label htmlFor="title">{t('admin.products.form.title')}</Label>
                            <Input
                                id="title"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                required
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="price">{t('admin.products.form.price')} (₹)</Label>
                                <Input
                                    id="price"
                                    type="number"
                                    value={price}
                                    onChange={(e) => setPrice(Number(e.target.value))}
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="stock">{t('admin.products.form.stock')}</Label>
                                <Input
                                    id="stock"
                                    type="number"
                                    value={countInStock}
                                    onChange={(e) => setCountInStock(Number(e.target.value))}
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="image">{t('admin.products.form.image')} (Optional)</Label>
                            <Input
                                id="image"
                                value={image}
                                onChange={(e) => setImage(e.target.value)}
                                placeholder="e.g., /images/book-cover.jpg"
                            />
                            <p className="text-xs text-muted-foreground">
                                Static image path (optional). You can upload a file or use an image URL instead.
                            </p>
                        </div>

                        {/* File Upload Section */}
                        <div className="space-y-2 border-t pt-4">
                            <Label htmlFor="imageFile">Upload Book Image</Label>
                            <div className="flex gap-2">
                                <Input
                                    id="imageFile"
                                    type="file"
                                    accept="image/jpeg,image/jpg,image/png,image/webp"
                                    onChange={handleFileSelect}
                                    className="flex-1"
                                />
                                {selectedFile && (
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="icon"
                                        onClick={() => {
                                            setSelectedFile(null);
                                            setImagePreview('');
                                            const fileInput = document.getElementById('imageFile') as HTMLInputElement;
                                            if (fileInput) fileInput.value = '';
                                        }}
                                    >
                                        <X className="h-4 w-4" />
                                    </Button>
                                )}
                            </div>
                            <p className="text-xs text-muted-foreground">
                                Upload a book cover image (JPEG, PNG, WebP, max 5MB). This will be stored on the server.
                            </p>
                            {imagePreview && (
                                <div className="mt-2">
                                    <p className="text-sm font-medium mb-2">Preview:</p>
                                    <img
                                        src={imagePreview}
                                        alt="Upload Preview"
                                        className="w-32 h-48 object-cover rounded border"
                                    />
                                </div>
                            )}
                            {uploadingImage && (
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                    Uploading image...
                                </div>
                            )}
                        </div>

                        <div className="space-y-2 border-t pt-4">
                            <Label htmlFor="imageUrl">Image URL (Dynamic)</Label>
                            <Input
                                id="imageUrl"
                                value={imageUrl}
                                onChange={(e) => setImageUrl(e.target.value)}
                                placeholder="https://example.com/book-image.jpg"
                            />
                            <p className="text-xs text-muted-foreground">
                                Optional: Enter a direct URL to the book cover image. This will override the default image.
                            </p>
                            {imageUrl && (
                                <div className="mt-2">
                                    <img
                                        src={imageUrl}
                                        alt="Preview"
                                        className="w-32 h-48 object-cover rounded border"
                                        onError={(e) => {
                                            (e.target as HTMLImageElement).style.display = 'none';
                                        }}
                                    />
                                </div>
                            )}
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="author">{t('admin.products.form.author')}</Label>
                                <Input
                                    id="author"
                                    value={author}
                                    onChange={(e) => setAuthor(e.target.value)}
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="category">{t('admin.products.form.category')}</Label>
                                <Input
                                    id="category"
                                    value={category}
                                    onChange={(e) => setCategory(e.target.value)}
                                    required
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="isbn">{t('admin.products.form.isbn')}</Label>
                                <Input
                                    id="isbn"
                                    value={isbn}
                                    onChange={(e) => setIsbn(e.target.value)}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="pages">{t('admin.products.form.pages')}</Label>
                                <Input
                                    id="pages"
                                    type="number"
                                    value={pages}
                                    onChange={(e) => setPages(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-3 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="language">{t('admin.products.form.language')}</Label>
                                <Input
                                    id="language"
                                    value={language}
                                    onChange={(e) => setLanguage(e.target.value)}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="publishedDate">{t('admin.products.form.publishedDate')}</Label>
                                <Input
                                    id="publishedDate"
                                    type="date"
                                    value={publishedDate}
                                    onChange={(e) => setPublishedDate(e.target.value)}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="genre">{t('bookDetail.details.genre')}</Label>
                                <Input
                                    id="genre"
                                    value={genre}
                                    onChange={(e) => setGenre(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="description">{t('admin.products.form.description')}</Label>
                            <Textarea
                                id="description"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                className="h-32"
                                required
                            />
                        </div>

                        <div className="flex gap-6">
                            <div className="flex items-center gap-2">
                                <Checkbox
                                    id="featured"
                                    checked={featured}
                                    onCheckedChange={(checked) => setFeatured(checked as boolean)}
                                />
                                <Label htmlFor="featured">Featured Product</Label>
                            </div>
                            <div className="flex items-center gap-2">
                                <Checkbox
                                    id="bestseller"
                                    checked={bestseller}
                                    onCheckedChange={(checked) => setBestseller(checked as boolean)}
                                />
                                <Label htmlFor="bestseller">{t('admin.products.form.isBestseller')}</Label>
                            </div>
                        </div>

                        <Button type="submit" className="w-full" disabled={loadingUpdate}>
                            {loadingUpdate && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            {t('admin.products.update')}
                        </Button>
                    </form>
                )}
            </div>
        </AdminLayout>
    );
};

export default ProductEdit;

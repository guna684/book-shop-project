import { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { Filter, SlidersHorizontal, Grid3X3, List, Search, X } from 'lucide-react';
import Layout from '@/components/layout/Layout';
import BookCard from '@/components/books/BookCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Slider } from '@/components/ui/slider';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { useTranslation } from 'react-i18next';
import api from '@/lib/axios';
import { Book } from '@/types/book';
import { getLocalized } from '@/utils/localization';

interface Category {
  _id: string;
  name: string;
  slug: string;
  icon: string;
  bookCount: number;
}

const Books = () => {
  const { t, i18n } = useTranslation();
  const [books, setBooks] = useState<Book[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchParams, setSearchParams] = useSearchParams();
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [selectedCategories, setSelectedCategories] = useState<string[]>(
    searchParams.get('category')?.split(',').filter(Boolean) || []
  );
  const [priceRange, setPriceRange] = useState([0, 10000]);
  const [sortBy, setSortBy] = useState('relevance');
  const [showBestsellersOnly, setShowBestsellersOnly] = useState(
    searchParams.get('filter') === 'bestseller'
  );

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch books and categories in parallel
        const [booksRes, categoriesRes] = await Promise.all([
          api.get('/api/books'),
          api.get('/api/categories')
        ]);

        // Map _id to id for frontend compatibility
        const mappedBooks = booksRes.data.map((book: any) => ({
          ...book,
          id: book._id,
        }));
        setBooks(mappedBooks);
        setCategories(categoriesRes.data);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Update selectedCategories when URL param changes
  useEffect(() => {
    const categoryParam = searchParams.get('category');
    if (categoryParam) {
      const categoriesFromUrl = categoryParam.split(',').filter(Boolean);
      setSelectedCategories(categoriesFromUrl);
    } else {
      setSelectedCategories([]);
    }

    // Also handle search query sync
    const searchParam = searchParams.get('search');
    if (searchParam) {
      setSearchQuery(searchParam);
    }
  }, [searchParams]);

  const filteredBooks = useMemo(() => {
    if (!books.length) return [];

    let result = [...books];

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase().trim();
      if (query) {
        result = result.filter(
          book =>
            getLocalized(book, 'title', i18n.language).toLowerCase().includes(query) ||
            getLocalized(book, 'author', i18n.language).toLowerCase().includes(query) ||
            getLocalized(book, 'category', i18n.language).toLowerCase().includes(query)
        );
      }
    }

    // Category filter
    if (selectedCategories.length > 0) {
      result = result.filter(book =>
        selectedCategories.some(selectedCat => {
          const normalize = (str: string) => str.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
          const bookCatSlug = normalize(book.category);
          const selectedCatSlug = normalize(selectedCat);

          return bookCatSlug === selectedCatSlug;
        })
      );
    }

    // Price filter
    result = result.filter(
      book => {
        const price = typeof book.price === 'string' ? parseFloat(book.price) : book.price;
        return price >= priceRange[0] && price <= priceRange[1];
      }
    );

    // Bestsellers filter
    if (showBestsellersOnly) {
      result = result.filter(book => book.bestseller);
    }

    // Sort
    switch (sortBy) {
      case 'price-low':
        result.sort((a, b) => a.price - b.price);
        break;
      case 'price-high':
        result.sort((a, b) => b.price - a.price);
        break;
      case 'rating':
        result.sort((a, b) => b.rating - a.rating);
        break;
      case 'newest':
        result.sort((a, b) => new Date(b.publishedDate).getTime() - new Date(a.publishedDate).getTime());
        break;
    }

    return result;
  }, [books, searchQuery, selectedCategories, priceRange, sortBy, showBestsellersOnly]);

  const toggleCategory = (category: string) => {
    setSelectedCategories(prev =>
      prev.includes(category)
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedCategories([]);
    setPriceRange([0, 10000]);
    setSortBy('relevance');
    setShowBestsellersOnly(false);
    setSearchParams({});
  };

  const FilterPanel = () => (
    <div className="space-y-6">
      {/* Categories */}
      <div>
        <h3 className="font-serif font-semibold text-foreground mb-4">{t('nav.categories')}</h3>
        <div className="space-y-3">
          {categories.map(category => (
            <label
              key={category._id}
              className="flex items-center gap-3 cursor-pointer group"
            >
              <Checkbox
                checked={selectedCategories.includes(category.slug)}
                onCheckedChange={() => toggleCategory(category.slug)}
              />
              <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors">
                {category.name}
              </span>
              <span className="text-xs text-muted-foreground ml-auto">
                ({category.bookCount})
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Price Range */}
      <div>
        <h3 className="font-serif font-semibold text-foreground mb-4">{t('books.priceRange')}</h3>
        <Slider
          value={priceRange}
          onValueChange={setPriceRange}
          max={1000}
          step={50}
          className="mb-4"
        />
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>₹{priceRange[0]}</span>
          <span>₹{priceRange[1]}</span>
        </div>
      </div>

      {/* Bestsellers */}
      <div>
        <label className="flex items-center gap-3 cursor-pointer">
          <Checkbox
            checked={showBestsellersOnly}
            onCheckedChange={(checked) => setShowBestsellersOnly(!!checked)}
          />
          <span className="text-sm font-medium">{t('books.bestsellersOnly')}</span>
        </label>
      </div>

      {/* Clear Filters */}
      <Button variant="outline" className="w-full" onClick={clearFilters}>
        {t('books.clearFilters')}
      </Button>
    </div>
  );

  return (
    <>
      <Helmet>
        <title>Browse Books | Sri Chola Book Shop - Your Online Book Store</title>
        <meta
          name="description"
          content="Browse our extensive collection of books. Filter by category, price, and more. Find your perfect read at Sri Chola Book Shop."
        />
      </Helmet>
      <Layout>
        <div className="bg-secondary/30 py-8 border-b border-border">
          <div className="container mx-auto px-4">
            <h1 className="font-serif text-3xl md:text-4xl font-bold text-foreground mb-2">
              {t('books.browseBooks')}
            </h1>
            <p className="text-muted-foreground">
              {t('books.discover_count', { count: books.length })}
            </p>
          </div>
        </div>

        <div className="container mx-auto px-4 py-8">
          <div className="flex gap-8">
            {/* Desktop Sidebar */}
            <aside className="hidden lg:block w-64 shrink-0">
              <div className="sticky top-24">
                <FilterPanel />
              </div>
            </aside>

            {/* Main Content */}
            <div className="flex-1">
              {/* Toolbar */}
              <div className="flex flex-wrap items-center gap-4 mb-6">
                {/* Search */}
                <div className="relative flex-1 min-w-[200px]">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="text"
                    placeholder={t('search.placeholder')}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 bg-card"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>

                {/* Sort */}
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-[180px] bg-card">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="relevance">Relevance</SelectItem>
                    <SelectItem value="price-low">Price: Low to High</SelectItem>
                    <SelectItem value="price-high">Price: High to Low</SelectItem>
                    <SelectItem value="rating">Highest Rated</SelectItem>
                    <SelectItem value="newest">Newest First</SelectItem>
                  </SelectContent>
                </Select>

                {/* View Mode */}
                <div className="flex items-center gap-1 bg-card rounded-lg p-1">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-2 rounded-md transition-colors ${viewMode === 'grid' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'
                      }`}
                  >
                    <Grid3X3 className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-2 rounded-md transition-colors ${viewMode === 'list' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'
                      }`}
                  >
                    <List className="h-4 w-4" />
                  </button>
                </div>

                {/* Mobile Filter */}
                <Sheet>
                  <SheetTrigger asChild>
                    <Button variant="outline" className="lg:hidden gap-2">
                      <SlidersHorizontal className="h-4 w-4" />
                      Filters
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="left">
                    <SheetHeader>
                      <SheetTitle>Filters</SheetTitle>
                    </SheetHeader>
                    <div className="mt-6">
                      <FilterPanel />
                    </div>
                  </SheetContent>
                </Sheet>
              </div>

              {/* Active Filters */}
              {(selectedCategories.length > 0 || showBestsellersOnly) && (
                <div className="flex flex-wrap gap-2 mb-6">
                  {selectedCategories.map(cat => (
                    <button
                      key={cat}
                      onClick={() => toggleCategory(cat)}
                      className="inline-flex items-center gap-1 bg-primary/10 text-primary px-3 py-1 rounded-full text-sm hover:bg-primary/20 transition-colors"
                    >
                      {cat}
                      <X className="h-3 w-3" />
                    </button>
                  ))}
                  {showBestsellersOnly && (
                    <button
                      onClick={() => setShowBestsellersOnly(false)}
                      className="inline-flex items-center gap-1 bg-accent/10 text-accent px-3 py-1 rounded-full text-sm hover:bg-accent/20 transition-colors"
                    >
                      Bestsellers
                      <X className="h-3 w-3" />
                    </button>
                  )}
                </div>
              )}

              {/* Results Count */}
              <p className="text-sm text-muted-foreground mb-6">
                Showing {filteredBooks.length} results
              </p>

              {/* Books Grid/List */}
              {loading ? (
                <div className="flex justify-center py-20">Loading books...</div>
              ) : filteredBooks.length > 0 ? (
                <div className={
                  viewMode === 'grid'
                    ? 'grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6'
                    : 'space-y-4'
                }>
                  {filteredBooks.map((book, index) => (
                    <BookCard key={book.id} book={book} index={index} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-16">
                  <Filter className="h-16 w-16 text-muted-foreground/50 mx-auto mb-4" />
                  <h3 className="font-serif text-xl font-semibold text-foreground mb-2">
                    No books found
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    Try adjusting your filters or search query
                  </p>
                  <Button variant="outline" onClick={clearFilters}>
                    Clear Filters
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </Layout>
    </>
  );
};

export default Books;

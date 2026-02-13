// Helper function to get the full image URL
export const getImageUrl = (imagePath: string | undefined): string => {
    if (!imagePath) {
        return '/images/placeholder-book.jpg';
    }

    // If it's already a full URL (starts with http:// or https://), return as is
    if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
        return imagePath;
    }

    // If it's an uploaded image (starts with /uploads/), prepend API base URL
    if (imagePath.startsWith('/uploads/')) {
        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
        return `${apiUrl}${imagePath}`;
    }

    // For static images (like /images/...), return as is
    return imagePath;
};

export const getLocalized = (obj: any, field: string, lang: string) => {
    if (!obj) return '';
    if (lang === 'ta' && obj[`${field}_ta`]) {
        return obj[`${field}_ta`];
    }
    return obj[field];
};

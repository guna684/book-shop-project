/**
 * Order Filter Utilities
 * Single source of truth for order status filtering across the application
 */

/**
 * Order Status Constants
 * Canonical status values stored in database
 */
export const ORDER_STATUS = {
    PENDING: 'Pending',
    CONFIRMED: 'Confirmed',
    PROCESSING: 'Processing',
    PACKED: 'Packed',
    SHIPPED: 'Shipped',
    OUT_FOR_DELIVERY: 'Out for Delivery',
    DELIVERED: 'Delivered',
    CANCELLED: 'Cancelled',
    RETURNED: 'Returned',
    REFUNDED: 'Refunded'
};

/**
 * Get filter for delivered orders only
 * This is the single source of truth for filtering delivered orders
 * 
 * @param {Object} additionalFilters - Additional MongoDB query filters to merge
 * @param {boolean} caseInsensitive - Use case-insensitive matching (default: false for performance)
 * @returns {Object} MongoDB query filter object
 * 
 * @example
 * // Basic usage
 * const filter = getDeliveredFilter();
 * // Returns: { status: 'Delivered' }
 * 
 * @example
 * // With additional filters
 * const filter = getDeliveredFilter({ createdAt: { $gte: startDate } });
 * // Returns: { status: 'Delivered', createdAt: { $gte: startDate } }
 * 
 * @example
 * // Case-insensitive (defensive)
 * const filter = getDeliveredFilter({}, true);
 * // Returns: { status: { $regex: /^delivered$/i } }
 */
export const getDeliveredFilter = (additionalFilters = {}, caseInsensitive = false) => {
    const statusFilter = caseInsensitive
        ? { status: { $regex: /^delivered$/i } }
        : { status: ORDER_STATUS.DELIVERED };

    const filter = {
        ...additionalFilters,
        ...statusFilter
    };

    // Validation logging
    console.log('🔍 Delivered Filter Applied:', {
        caseInsensitive,
        filter,
        timestamp: new Date().toISOString()
    });

    return filter;
};

/**
 * Validate that a query uses the delivered filter
 * Used for runtime verification
 * 
 * @param {Object} query - MongoDB query object to validate
 * @returns {boolean} True if query includes delivered status filter
 */
export const isUsingDeliveredFilter = (query) => {
    const hasExactMatch = query.status === ORDER_STATUS.DELIVERED;
    const hasRegexMatch = query.status?.$regex?.toString() === '/^delivered$/i';

    const isValid = hasExactMatch || hasRegexMatch;

    if (!isValid) {
        console.warn('⚠️ Query does not use delivered filter:', query);
    }

    return isValid;
};

/**
 * Get date range filter helper
 * Combines date filtering with delivered status
 * 
 * @param {string} startDate - ISO date string
 * @param {string} endDate - ISO date string
 * @param {boolean} caseInsensitive - Use case-insensitive status matching
 * @returns {Object} Combined filter object
 */
export const getDeliveredDateRangeFilter = (startDate, endDate, caseInsensitive = false) => {
    let dateFilter = {};

    if (startDate || endDate) {
        dateFilter.createdAt = {};
        if (startDate) {
            dateFilter.createdAt.$gte = new Date(startDate);
        }
        if (endDate) {
            const endDateTime = new Date(endDate);
            endDateTime.setHours(23, 59, 59, 999);
            dateFilter.createdAt.$lte = endDateTime;
        }
    } else {
        // Default to last 30 days
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        thirtyDaysAgo.setHours(0, 0, 0, 0);
        dateFilter.createdAt = { $gte: thirtyDaysAgo };
    }

    return getDeliveredFilter(dateFilter, caseInsensitive);
};

export default {
    ORDER_STATUS,
    getDeliveredFilter,
    isUsingDeliveredFilter,
    getDeliveredDateRangeFilter
};

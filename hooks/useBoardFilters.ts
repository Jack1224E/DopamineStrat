'use client';

import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { useCallback, useState, useEffect } from 'react';


export interface BoardFilters {
    search: string;
    categories: string[];
    sort: 'created' | 'due' | 'priority' | 'alpha';
}

export function useBoardFilters() {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    // 1. Applied Filters (Derived directly from URL)
    const filters: BoardFilters = {
        search: searchParams.get('q') || '',
        categories: searchParams.get('categories')?.split(',').filter(Boolean) || [],
        sort: (searchParams.get('sort') as BoardFilters['sort']) || 'created',
    };

    // 2. Local Input State (for UI responsiveness)
    const [searchTerm, setSearchTerm] = useState(filters.search);

    // Sync local state if URL changes externally (e.g. Clear Filters)
    useEffect(() => {
        setSearchTerm(filters.search);
    }, [filters.search]);

    // 3. Debounce Update URL
    useEffect(() => {
        const timer = setTimeout(() => {
            if (searchTerm !== (searchParams.get('q') || '')) {
                const params = new URLSearchParams(searchParams.toString());
                if (searchTerm) {
                    params.set('q', searchTerm);
                } else {
                    params.delete('q');
                }
                // Preserve other params
                if (filters.categories.length > 0) params.set('categories', filters.categories.join(','));
                if (filters.sort !== 'created') params.set('sort', filters.sort);

                router.replace(`${pathname}?${params.toString()}`, { scroll: false });
            }
        }, 300);
        return () => clearTimeout(timer);
    }, [searchTerm, pathname, router, searchParams, filters.categories, filters.sort]);

    const updateUrl = (newParams: Record<string, string | null>) => {
        const params = new URLSearchParams(searchParams.toString());
        // We need to be careful not to lose existing params that aren't being updated
        // But here we are updating specific keys in the existing params object (if we used current searchParams)
        // Wait, `new URLSearchParams(searchParams.toString())` copies ALL existing params.
        // So we just overwrite the ones in `newParams`.
        Object.entries(newParams).forEach(([key, value]) => {
            if (value) {
                params.set(key, value);
            } else {
                params.delete(key);
            }
        });
        router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    };

    const setCategories = (newCategories: string[]) => {
        updateUrl({ categories: newCategories.length > 0 ? newCategories.join(',') : null });
    };

    const setSort = (newSort: BoardFilters['sort']) => {
        updateUrl({ sort: newSort });
    };

    const clearFilters = () => {
        setSearchTerm('');
        router.replace(pathname, { scroll: false });
    };

    return {
        filters,
        searchQuery: searchTerm,
        setSearch: setSearchTerm,
        setCategories,
        setSort,
        clearFilters,
        activeCount: (filters.search ? 1 : 0) + filters.categories.length + (filters.sort !== 'created' ? 1 : 0)
    };
}

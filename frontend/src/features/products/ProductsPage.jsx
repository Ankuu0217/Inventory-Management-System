import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { Plus, RotateCw } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { TooltipProvider } from '@/components/ui/tooltip';
import { ProductToolbar } from '@/features/products/ProductToolbar';
import { ActiveFilterChips } from '@/features/products/ActiveFilterChips';
import { ProductTable } from '@/features/products/ProductTable';
import { ProductPagination } from '@/features/products/ProductPagination';
import {
  NoFilterMatches,
  NoProductsYet,
  ProductTableSkeleton,
} from '@/features/products/ProductEmptyStates';
import { ProductFormDialog } from '@/features/products/ProductFormDialog';
import { ProductDetailSheet } from '@/features/products/ProductDetailSheet';
import { DeleteConfirmDialog } from '@/features/products/DeleteConfirmDialog';
import { useGetProductsQuery } from '@/api/productsApi';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import { DEFAULT_PAGE_SIZE, SEARCH_DEBOUNCE_MS } from '@/lib/constants';
import { getErrorMessage } from '@/lib/apiError';

const DEFAULT_SORT = 'createdAt';
const DEFAULT_ORDER = 'desc';

/** Container: owns URL-backed filter/sort/pagination state and all fetching. */
export function ProductsPage() {
  const navigate = useNavigate();
  const { id: detailId } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();

  const searchFromUrl = searchParams.get('search') ?? '';
  const category = searchParams.get('category') ?? '';
  const status = searchParams.get('status') ?? 'all';
  const page = Number(searchParams.get('page') ?? '1');
  const limit = Number(searchParams.get('limit') ?? String(DEFAULT_PAGE_SIZE));
  const sortBy = searchParams.get('sortBy') ?? DEFAULT_SORT;
  const order = searchParams.get('order') === 'asc' ? 'asc' : DEFAULT_ORDER;

  const [searchInput, setSearchInput] = useState(searchFromUrl);
  const debouncedSearch = useDebouncedValue(searchInput, SEARCH_DEBOUNCE_MS);

  const [formOpen, setFormOpen] = useState(false);
  const [formMode, setFormMode] = useState('create');
  const [editingProduct, setEditingProduct] = useState(null);
  const [deletingProduct, setDeletingProduct] = useState(null);

  /**
   * @param {Record<string, string|null>} updates
   * @param {boolean} [resetPage] send the user back to page 1 (any filter change)
   */
  const updateParams = useCallback(
    (updates, resetPage = true) => {
      setSearchParams((current) => {
        const next = new URLSearchParams(current);
        Object.entries(updates).forEach(([key, value]) => {
          if (value === null || value === '') next.delete(key);
          else next.set(key, value);
        });
        if (resetPage) next.delete('page');
        return next;
      });
    },
    [setSearchParams],
  );

  useEffect(() => {
    // Only sync once the debounce has caught up with what's actually in the
    // box. Without this guard, clearing the filters programmatically races the
    // in-flight timer, which then writes the stale term back into the URL.
    if (debouncedSearch !== searchInput) return;
    if (debouncedSearch === searchFromUrl) return;
    updateParams({ search: debouncedSearch || null });
  }, [debouncedSearch, searchInput, searchFromUrl, updateParams]);

  const clearAllFilters = useCallback(() => {
    setSearchInput('');
    updateParams({ search: null, category: null, status: null });
  }, [updateParams]);

  const hasActiveFilters = Boolean(searchFromUrl || category || status !== 'all');

  // Escape clears the filters -- but only when nothing is layered on top of the
  // page, since Radix already owns Escape for closing its own overlays.
  useEffect(() => {
    if (!hasActiveFilters) return undefined;
    /** @param {KeyboardEvent} event */
    function onKeyDown(event) {
      if (event.key !== 'Escape') return;
      if (document.querySelector('[role="dialog"]')) return;
      clearAllFilters();
    }
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [hasActiveFilters, clearAllFilters]);

  const listParams = useMemo(
    () => ({
      search: searchFromUrl || undefined,
      category: category || undefined,
      status: status === 'all' ? undefined : status,
      page,
      limit,
      sortBy,
      order,
    }),
    [searchFromUrl, category, status, page, limit, sortBy, order],
  );

  const { data, isLoading, isFetching, isError, error, refetch } = useGetProductsQuery(listParams);

  const products = useMemo(
    () => (Array.isArray(data?.products) ? data.products : []),
    [data],
  );
  const pagination = data?.pagination;

  const availableCategories = useMemo(() => {
    const categories = new Set(products.map((product) => product.category));
    return Array.from(categories).sort((a, b) => a.localeCompare(b));
  }, [products]);

  const isEmpty = Boolean(data) && products.length === 0;

  /** @param {'search'|'category'|'status'} key */
  function clearFilter(key) {
    if (key === 'search') setSearchInput('');
    updateParams({ [key]: null });
  }

  /** Toggles direction on the active column, otherwise sorts the new one desc. */
  function handleSort(column) {
    const nextOrder = sortBy === column && order === 'desc' ? 'asc' : 'desc';
    updateParams({ sortBy: column, order: nextOrder });
  }

  function openCreateForm() {
    setFormMode('create');
    setEditingProduct(null);
    setFormOpen(true);
  }

  /** @param {import('@/types/product').Product} product */
  function openEditForm(product) {
    setFormMode('edit');
    setEditingProduct(product);
    setFormOpen(true);
  }

  return (
    <TooltipProvider delayDuration={300}>
      <div className="flex flex-col gap-24">
        <PageHeader
          title="Products"
          subtitle="Track stock levels across your catalogue."
          action={
            <Button variant="primary" onClick={openCreateForm}>
              <Plus />
              Add product
            </Button>
          }
        />

        <div className="flex flex-col gap-12">
          <ProductToolbar
            search={searchInput}
            onSearchChange={setSearchInput}
            category={category}
            onCategoryChange={(value) => updateParams({ category: value || null })}
            status={status}
            onStatusChange={(value) => updateParams({ status: value === 'all' ? null : value })}
            availableCategories={availableCategories}
            resultCount={pagination?.total}
            isSearching={isFetching && !isLoading}
          />

          <ActiveFilterChips
            search={searchFromUrl}
            category={category}
            status={status}
            onClear={clearFilter}
            onClearAll={clearAllFilters}
          />
        </div>

        {isLoading ? (
          <ProductTableSkeleton />
        ) : isError ? (
          <Card className="flex flex-col items-start gap-12">
            <p className="text-sm text-charcoal">{getErrorMessage(error)}</p>
            <Button variant="secondary" size="sm" onClick={() => refetch()}>
              <RotateCw />
              Try again
            </Button>
          </Card>
        ) : isEmpty && !hasActiveFilters ? (
          <NoProductsYet onAddProduct={openCreateForm} />
        ) : isEmpty ? (
          <NoFilterMatches
            search={searchFromUrl}
            category={category}
            status={status}
            onClear={clearFilter}
            onClearAll={clearAllFilters}
          />
        ) : (
          <>
            <ProductTable
              products={products}
              listParams={listParams}
              sortBy={sortBy}
              order={order}
              onSort={handleSort}
              onRowClick={(id) =>
                navigate({ pathname: `/products/${id}`, search: searchParams.toString() })
              }
              onEdit={openEditForm}
              onDelete={setDeletingProduct}
            />

            {pagination ? (
              <ProductPagination
                pagination={pagination}
                isFetching={isFetching}
                onPageChange={(nextPage) => updateParams({ page: String(nextPage) }, false)}
                onLimitChange={(nextLimit) => updateParams({ limit: String(nextLimit) })}
              />
            ) : null}
          </>
        )}

        <ProductFormDialog
          mode={formMode}
          product={editingProduct ?? undefined}
          open={formOpen}
          onOpenChange={setFormOpen}
          categories={availableCategories}
        />

        <ProductDetailSheet
          productId={detailId ?? null}
          open={Boolean(detailId)}
          onOpenChange={(next) => {
            if (!next) navigate({ pathname: '/products', search: searchParams.toString() });
          }}
          onEdit={openEditForm}
          onDelete={setDeletingProduct}
        />

        <DeleteConfirmDialog
          product={deletingProduct}
          open={Boolean(deletingProduct)}
          onOpenChange={(next) => {
            if (!next) setDeletingProduct(null);
          }}
          onDeleted={() => {
            // The panel may be showing the record that was just deleted.
            if (detailId) navigate({ pathname: '/products', search: searchParams.toString() });
          }}
        />
      </div>
    </TooltipProvider>
  );
}

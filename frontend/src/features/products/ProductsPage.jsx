import { useEffect, useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Package, Plus, SearchX } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Skeleton } from '@/components/ui/skeleton';
import { Card } from '@/components/ui/card';
import { ProductToolbar } from '@/features/products/ProductToolbar';
import { ProductTable } from '@/features/products/ProductTable';
import { ProductFormDialog } from '@/features/products/ProductFormDialog';
import { ProductDetailSheet } from '@/features/products/ProductDetailSheet';
import { DeleteConfirmDialog } from '@/features/products/DeleteConfirmDialog';
import { useGetProductsQuery } from '@/api/productsApi';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import { DEFAULT_PAGE_SIZE, PAGE_SIZE_OPTIONS, SEARCH_DEBOUNCE_MS } from '@/lib/constants';
import { getErrorMessage } from '@/lib/apiError';

/** Container: owns URL-backed filter/pagination state and all data fetching. */
export function ProductsPage() {
  const navigate = useNavigate();
  const { id: detailId } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();

  const searchFromUrl = searchParams.get('search') ?? '';
  const category = searchParams.get('category') ?? '';
  const status = searchParams.get('status') ?? 'all';
  const page = Number(searchParams.get('page') ?? '1');
  const limit = Number(searchParams.get('limit') ?? String(DEFAULT_PAGE_SIZE));

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
  function updateParams(updates, resetPage = true) {
    const next = new URLSearchParams(searchParams);
    Object.entries(updates).forEach(([key, value]) => {
      if (value === null || value === '') next.delete(key);
      else next.set(key, value);
    });
    if (resetPage) next.delete('page');
    setSearchParams(next);
  }

  useEffect(() => {
    if (debouncedSearch !== searchFromUrl) {
      updateParams({ search: debouncedSearch || null });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch]);

  const listParams = useMemo(
    () => ({
      search: searchFromUrl || undefined,
      category: category || undefined,
      status: status === 'all' ? undefined : status,
      page,
      limit,
    }),
    [searchFromUrl, category, status, page, limit],
  );

  const { data, isLoading, isFetching, isError, error, refetch } = useGetProductsQuery(listParams);

  // Memoised so the empty-array fallback keeps a stable identity between
  // renders and doesn't invalidate the memo below on every pass.
  const products = useMemo(
    () => (Array.isArray(data?.products) ? data.products : []),
    [data],
  );
  const pagination = data?.pagination;

  const availableCategories = useMemo(() => {
    const categories = new Set(products.map((product) => product.category));
    return Array.from(categories).sort((a, b) => a.localeCompare(b));
  }, [products]);

  const hasActiveFilters = Boolean(searchFromUrl || category || status !== 'all');
  const isEmpty = Boolean(data) && products.length === 0;

  function clearFilters() {
    setSearchInput('');
    setSearchParams(new URLSearchParams());
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
    <div className="flex flex-col gap-24">
      <div className="flex items-center justify-between gap-16">
        <h1 className="text-heading-sm font-semibold text-charcoal md:text-heading">Products</h1>
        <Button variant="primary" onClick={openCreateForm}>
          <Plus className="h-16 w-16" />
          Add product
        </Button>
      </div>

      <ProductToolbar
        search={searchInput}
        onSearchChange={setSearchInput}
        category={category}
        onCategoryChange={(value) => updateParams({ category: value || null })}
        status={status}
        onStatusChange={(value) => updateParams({ status: value === 'all' ? null : value })}
        availableCategories={availableCategories}
      />

      {isLoading ? (
        <div className="flex flex-col gap-8">
          {Array.from({ length: 5 }).map((_, index) => (
            <Skeleton key={index} className="h-48 w-full" />
          ))}
        </div>
      ) : isError ? (
        <Card className="flex flex-col items-start gap-12">
          <p className="text-sm text-charcoal">{getErrorMessage(error)}</p>
          <Button variant="secondary" size="sm" onClick={() => refetch()}>
            Try again
          </Button>
        </Card>
      ) : isEmpty && !hasActiveFilters ? (
        <EmptyState
          icon={<Package className="h-32 w-32 text-silver" />}
          title="No products yet"
          description="Add your first product to start tracking inventory."
          action={
            <Button variant="primary" onClick={openCreateForm}>
              <Plus className="h-16 w-16" />
              Add product
            </Button>
          }
        />
      ) : isEmpty ? (
        <EmptyState
          icon={<SearchX className="h-32 w-32 text-silver" />}
          title="No products match these filters"
          description="Try adjusting your search or filters."
          action={
            <Button variant="secondary" onClick={clearFilters}>
              Clear filters
            </Button>
          }
        />
      ) : (
        <>
          <ProductTable
            products={products}
            listParams={listParams}
            onRowClick={(id) =>
              navigate({ pathname: `/products/${id}`, search: searchParams.toString() })
            }
            onEdit={openEditForm}
            onDelete={setDeletingProduct}
          />

          {pagination ? (
            <PaginationBar
              page={pagination.page}
              totalPages={pagination.totalPages}
              limit={limit}
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
      />

      <DeleteConfirmDialog
        product={deletingProduct}
        open={Boolean(deletingProduct)}
        onOpenChange={(next) => {
          if (!next) setDeletingProduct(null);
        }}
      />
    </div>
  );
}

/**
 * @param {Object} props
 * @param {React.ReactNode} props.icon
 * @param {string} props.title
 * @param {string} props.description
 * @param {React.ReactNode} props.action
 */
function EmptyState({ icon, title, description, action }) {
  return (
    <Card className="flex flex-col items-center gap-12 py-48 text-center">
      {icon}
      <div className="flex flex-col gap-4">
        <p className="text-sm font-medium text-charcoal">{title}</p>
        <p className="text-sm text-steel">{description}</p>
      </div>
      {action}
    </Card>
  );
}

EmptyState.propTypes = {
  icon: PropTypes.node,
  title: PropTypes.string.isRequired,
  description: PropTypes.string.isRequired,
  action: PropTypes.node,
};

/**
 * @param {Object} props
 * @param {number} props.page
 * @param {number} props.totalPages
 * @param {number} props.limit
 * @param {boolean} props.isFetching
 * @param {(page: number) => void} props.onPageChange
 * @param {(limit: number) => void} props.onLimitChange
 */
function PaginationBar({ page, totalPages, limit, isFetching, onPageChange, onLimitChange }) {
  const pageNumbers = useMemo(
    () => Array.from({ length: Math.max(totalPages, 1) }, (_, index) => index + 1),
    [totalPages],
  );

  return (
    <div className="flex flex-col items-center justify-between gap-16 sm:flex-row">
      <div className="flex items-center gap-8">
        <Button
          variant="secondary"
          size="icon"
          aria-label="Previous page"
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1 || isFetching}
        >
          <ChevronLeft className="h-16 w-16" />
        </Button>
        {pageNumbers.map((num) => (
          <Button
            key={num}
            variant={num === page ? 'primary' : 'secondary'}
            size="sm"
            onClick={() => onPageChange(num)}
            disabled={isFetching}
          >
            {num}
          </Button>
        ))}
        <Button
          variant="secondary"
          size="icon"
          aria-label="Next page"
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages || isFetching}
        >
          <ChevronRight className="h-16 w-16" />
        </Button>
      </div>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="secondary" size="sm">
            {limit} / page
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Rows per page</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {PAGE_SIZE_OPTIONS.map((option) => (
            <DropdownMenuCheckboxItem
              key={option}
              checked={option === limit}
              onCheckedChange={() => onLimitChange(option)}
            >
              {option}
            </DropdownMenuCheckboxItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

PaginationBar.propTypes = {
  page: PropTypes.number.isRequired,
  totalPages: PropTypes.number.isRequired,
  limit: PropTypes.number.isRequired,
  isFetching: PropTypes.bool,
  onPageChange: PropTypes.func.isRequired,
  onLimitChange: PropTypes.func.isRequired,
};

import { useEffect, useMemo, useState, type ReactNode } from 'react';
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
import type { Product, StatusFilter } from '@/types/product';

export function ProductsPage() {
  const navigate = useNavigate();
  const { id: detailId } = useParams<{ id?: string }>();
  const [searchParams, setSearchParams] = useSearchParams();

  const searchFromUrl = searchParams.get('search') ?? '';
  const category = searchParams.get('category') ?? '';
  const status = (searchParams.get('status') as StatusFilter | null) ?? 'all';
  const page = Number(searchParams.get('page') ?? '1');
  const limit = Number(searchParams.get('limit') ?? String(DEFAULT_PAGE_SIZE));

  const [searchInput, setSearchInput] = useState(searchFromUrl);
  const debouncedSearch = useDebouncedValue(searchInput, SEARCH_DEBOUNCE_MS);

  const [formOpen, setFormOpen] = useState(false);
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create');
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [deletingProduct, setDeletingProduct] = useState<Product | null>(null);

  function updateParams(updates: Record<string, string | null>, resetPage = true) {
    const next = new URLSearchParams(searchParams);
    Object.entries(updates).forEach(([key, value]) => {
      if (value === null || value === '') {
        next.delete(key);
      } else {
        next.set(key, value);
      }
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

  const { data, isLoading, isFetching, isError, error, refetch } = useGetProductsQuery({
    search: searchFromUrl || undefined,
    category: category || undefined,
    status: status === 'all' ? undefined : status,
    page,
    limit,
  });

  const availableCategories = useMemo(() => {
    const categories = new Set((data?.products ?? []).map((product) => product.category));
    return Array.from(categories).sort((a, b) => a.localeCompare(b));
  }, [data]);

  const hasActiveFilters = Boolean(searchFromUrl || category || status !== 'all');
  const isFirstRunEmpty = !hasActiveFilters && data?.products.length === 0;
  const isFilteredEmpty = hasActiveFilters && data?.products.length === 0;

  function clearFilters() {
    setSearchInput('');
    setSearchParams(new URLSearchParams());
  }

  function openCreateForm() {
    setFormMode('create');
    setEditingProduct(null);
    setFormOpen(true);
  }

  function openEditForm(product: Product) {
    setFormMode('edit');
    setEditingProduct(product);
    setFormOpen(true);
  }

  function closeDetailSheet(open: boolean) {
    if (!open) {
      navigate({ pathname: '/products', search: searchParams.toString() });
    }
  }

  return (
    <div className="flex flex-col gap-24">
      <div className="flex items-center justify-between gap-16">
        <h1 className="text-heading-sm font-semibold text-charcoal md:text-heading">Products</h1>
        <Button variant="primary" onClick={openCreateForm}>
          <Plus className="h-16 w-16" />
          Add Product
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
            Retry
          </Button>
        </Card>
      ) : isFirstRunEmpty ? (
        <EmptyState
          icon={<Package className="h-32 w-32 text-fog" />}
          title="No products yet"
          description="Add your first product to start tracking inventory."
          action={
            <Button variant="primary" onClick={openCreateForm}>
              <Plus className="h-16 w-16" />
              Add Product
            </Button>
          }
        />
      ) : isFilteredEmpty ? (
        <EmptyState
          icon={<SearchX className="h-32 w-32 text-fog" />}
          title="No products match your filters"
          description="Try adjusting your search or filters."
          action={
            <Button variant="secondary" onClick={clearFilters}>
              Clear filters
            </Button>
          }
        />
      ) : data ? (
        <>
          <ProductTable
            products={data.products}
            onRowClick={(id) => navigate({ pathname: `/products/${id}`, search: searchParams.toString() })}
            onEdit={openEditForm}
            onDelete={setDeletingProduct}
          />

          <PaginationBar
            page={data.pagination.page}
            totalPages={data.pagination.totalPages}
            limit={limit}
            isFetching={isFetching}
            onPageChange={(nextPage) => updateParams({ page: String(nextPage) }, false)}
            onLimitChange={(nextLimit) => updateParams({ limit: String(nextLimit) })}
          />
        </>
      ) : null}

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
        onOpenChange={closeDetailSheet}
      />

      <DeleteConfirmDialog
        product={deletingProduct}
        open={Boolean(deletingProduct)}
        onOpenChange={(open) => {
          if (!open) setDeletingProduct(null);
        }}
      />
    </div>
  );
}

interface EmptyStateProps {
  icon: ReactNode;
  title: string;
  description: string;
  action: ReactNode;
}

function EmptyState({ icon, title, description, action }: EmptyStateProps) {
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

interface PaginationBarProps {
  page: number;
  totalPages: number;
  limit: number;
  isFetching: boolean;
  onPageChange: (page: number) => void;
  onLimitChange: (limit: number) => void;
}

function PaginationBar({
  page,
  totalPages,
  limit,
  isFetching,
  onPageChange,
  onLimitChange,
}: PaginationBarProps) {
  const pageNumbers = useMemo(() => {
    const total = Math.max(totalPages, 1);
    return Array.from({ length: total }, (_, index) => index + 1);
  }, [totalPages]);

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


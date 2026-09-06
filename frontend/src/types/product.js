/**
 * Shared JSDoc typedefs for the API contract. Importing this module for its
 * side effects is never necessary -- editors pick the typedefs up globally,
 * so other modules reference them directly (e.g. `@param {Product} product`).
 *
 * @typedef {'In Stock' | 'Low Stock' | 'Out of Stock'} StockStatus
 * @typedef {'inStock' | 'lowStock' | 'outOfStock'} StatusFilter
 */

/**
 * A product as returned by the API. `stockStatus` is derived server-side from
 * `quantity` and is never persisted -- always render what the API sent.
 *
 * @typedef {Object} Product
 * @property {string} id
 * @property {string} name
 * @property {string} category
 * @property {number} price
 * @property {number} quantity
 * @property {StockStatus} stockStatus
 * @property {string} createdAt ISO 8601 timestamp
 * @property {string} updatedAt ISO 8601 timestamp
 */

/**
 * The success envelope every endpoint wraps its payload in.
 *
 * @template T
 * @typedef {Object} ApiEnvelope
 * @property {true} success
 * @property {T} data
 * @property {string} message
 */

/**
 * The error envelope. `errors` is present only for validation failures.
 *
 * @typedef {Object} ApiFieldError
 * @property {string} field
 * @property {string} message
 *
 * @typedef {Object} ApiErrorEnvelope
 * @property {false} success
 * @property {string} message
 * @property {ApiFieldError[]} [errors]
 */

/**
 * @typedef {Object} Pagination
 * @property {number} total
 * @property {number} page
 * @property {number} limit
 * @property {number} totalPages
 */

/**
 * @typedef {Object} PaginatedResponse
 * @property {Product[]} products
 * @property {Pagination} pagination
 */

/**
 * Query params accepted by `GET /api/products`.
 *
 * @typedef {Object} ProductListParams
 * @property {string} [search]
 * @property {string} [category]
 * @property {StatusFilter} [status]
 * @property {number} [page]
 * @property {number} [limit]
 * @property {'name'|'category'|'price'|'quantity'|'createdAt'|'updatedAt'} [sortBy]
 * @property {'asc'|'desc'} [order]
 */

/**
 * The body accepted by create and update.
 *
 * @typedef {Object} ProductInput
 * @property {string} name
 * @property {string} category
 * @property {number} price
 * @property {number} quantity
 */

/**
 * Either shape accepted by `PATCH /api/products/:id/quantity`.
 *
 * @typedef {{quantity: number} | {operation: 'increase'|'decrease', amount: number}} QuantityUpdateInput
 */

/**
 * @typedef {Object} CategoryBreakdownEntry
 * @property {string} category
 * @property {number} count
 */

/**
 * @typedef {Object} DashboardStats
 * @property {number} totalProducts
 * @property {number} totalQuantity
 * @property {number} lowStockCount
 * @property {number} outOfStockCount
 * @property {number} totalInventoryValue
 * @property {CategoryBreakdownEntry[]} categoryBreakdown
 */

export {};

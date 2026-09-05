const mongoose = require('mongoose');

const { Schema } = mongoose;

/** Stock status labels, derived from quantity — never persisted. */
const STOCK_STATUS = {
  IN_STOCK: 'In Stock',
  LOW_STOCK: 'Low Stock',
  OUT_OF_STOCK: 'Out of Stock',
};

/** Quantity thresholds backing the stock-status derivation (single source of truth). */
const STOCK_THRESHOLDS = {
  LOW_STOCK_MIN: 1,
  LOW_STOCK_MAX: 10,
  IN_STOCK_MIN: 11,
};

/**
 * Derives the stockStatus label for a given quantity using the same
 * thresholds as the Mongoose virtual, so query-building code (search/filter)
 * and document serialization never drift apart.
 * @param {number} quantity current stock quantity
 * @returns {string} one of STOCK_STATUS's values
 */
function deriveStockStatus(quantity) {
  if (quantity === 0) return STOCK_STATUS.OUT_OF_STOCK;
  if (quantity <= STOCK_THRESHOLDS.LOW_STOCK_MAX) return STOCK_STATUS.LOW_STOCK;
  return STOCK_STATUS.IN_STOCK;
}

/**
 * Maps a stock-status filter key (inStock|lowStock|outOfStock) to the
 * equivalent MongoDB quantity range query, so filtering happens server-side
 * against the derived field instead of in application code.
 * @param {'inStock'|'lowStock'|'outOfStock'} status status filter key
 * @returns {Object} a MongoDB query fragment for the `quantity` field
 */
function stockStatusToQuantityQuery(status) {
  switch (status) {
    case 'outOfStock':
      return { quantity: 0 };
    case 'lowStock':
      return {
        quantity: { $gte: STOCK_THRESHOLDS.LOW_STOCK_MIN, $lte: STOCK_THRESHOLDS.LOW_STOCK_MAX },
      };
    case 'inStock':
      return { quantity: { $gte: STOCK_THRESHOLDS.IN_STOCK_MIN } };
    default:
      return {};
  }
}

const productSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    category: { type: String, required: true, trim: true },
    price: { type: Number, required: true, min: 0 },
    quantity: {
      type: Number, required: true, min: 0, default: 0,
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (_doc, ret) => {
        ret.id = ret._id.toString();
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
    toObject: {
      virtuals: true,
      transform: (_doc, ret) => {
        ret.id = ret._id.toString();
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  },
);

// Partial, case-insensitive search on `name` is served via a case-insensitive
// regex against this index. A regular (non-text) index is used deliberately:
// a MongoDB text index tokenizes into whole, stemmed words and would not
// match a mid-word substring like "lap" against "Laptop".
productSchema.index({ name: 1 });
productSchema.index({ category: 1 });

productSchema.virtual('stockStatus').get(function getStockStatus() {
  return deriveStockStatus(this.quantity);
});

const Product = mongoose.model('Product', productSchema);

module.exports = {
  Product,
  STOCK_STATUS,
  STOCK_THRESHOLDS,
  deriveStockStatus,
  stockStatusToQuantityQuery,
};

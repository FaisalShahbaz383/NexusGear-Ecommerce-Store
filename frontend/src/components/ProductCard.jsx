import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart, Check, AlertCircle } from 'lucide-react';
import { useCart } from '../context/CartContext';
import StarRating from './StarRating';

const ProductCard = ({ product }) => {
  const { addToCart } = useCart();
  const [added, setAdded] = useState(false);

  const handleAddToCart = (e) => {
    e.preventDefault();
    if (product.countInStock > 0) {
      addToCart(product, 1);
      setAdded(true);
      setTimeout(() => setAdded(false), 1200);
    }
  };

  const isOutOfStock = product.countInStock <= 0;
  const isLowStock = product.countInStock > 0 && product.countInStock <= 4;

  return (
    <div className="group relative flex flex-col rounded-2xl bg-slate-800/60 border border-slate-700/60 hover:border-sky-500/40 hover:shadow-xl hover:shadow-sky-500/10 transition-all duration-300 overflow-hidden">
      {/* Product Image & Badges */}
      <Link to={`/product/${product._id}`} className="relative aspect-square overflow-hidden bg-slate-900 block">
        <img
          src={product.imageUrl}
          alt={product.title}
          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />

        {/* Stock Badge Overlay */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5">
          {isOutOfStock ? (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-500/90 text-white shadow-md backdrop-blur-sm">
              <AlertCircle size={12} />
              Out of Stock
            </span>
          ) : isLowStock ? (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20 backdrop-blur-sm animate-pulse">
              Only {product.countInStock} Left
            </span>
          ) : (
            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 shadow-sm backdrop-blur-md">
              In Stock ({product.countInStock})
            </span>
          )}
        </div>

        {/* Category Badge */}
        <span className="absolute top-3 right-3 px-2 py-0.5 rounded-md text-[11px] font-medium bg-slate-900/80 text-slate-300 border border-slate-700 backdrop-blur-sm">
          {product.category}
        </span>
      </Link>

      {/* Card Details */}
      <div className="flex flex-col flex-1 p-5">
        <div className="mb-2">
          <StarRating rating={product.rating} numReviews={product.numReviews} />
        </div>

        <Link to={`/product/${product._id}`} className="block flex-1 group/title">
          <h3 className="font-semibold text-base text-slate-100 group-hover/title:text-sky-400 transition-colors line-clamp-2 leading-snug">
            {product.title}
          </h3>
          <p className="mt-1 text-xs text-slate-400 line-clamp-2 leading-relaxed">
            {product.description}
          </p>
        </Link>

        {/* Price & Action */}
        <div className="mt-4 pt-4 border-t border-slate-700/60 flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-400 block">Price</span>
            <span className="text-xl font-extrabold text-white font-mono">
              ${Number(product.price).toFixed(2)}
            </span>
          </div>

          <button
            onClick={handleAddToCart}
            disabled={isOutOfStock}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-semibold transition-all shadow-md ${
              isOutOfStock
                ? 'bg-slate-700/50 text-slate-500 cursor-not-allowed border border-slate-700'
                : added
                ? 'bg-emerald-500 text-white shadow-emerald-500/20'
                : 'bg-sky-500 hover:bg-sky-400 text-white shadow-sky-500/20 hover:shadow-sky-500/30'
            }`}
          >
            {added ? (
              <>
                <Check size={16} />
                Added
              </>
            ) : (
              <>
                <ShoppingCart size={16} />
                Add
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;

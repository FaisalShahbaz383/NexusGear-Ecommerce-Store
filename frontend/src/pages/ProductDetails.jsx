import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../api/api';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import StarRating from '../components/StarRating';
import {
  ArrowLeft,
  ShoppingCart,
  Check,
  ShieldCheck,
  Truck,
  RotateCcw,
  AlertTriangle,
  Send,
  User,
} from 'lucide-react';

const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { user } = useAuth();

  const [product, setProduct] = useState(null);
  const [qty, setQty] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [added, setAdded] = useState(false);

  // Review Form State
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewError, setReviewError] = useState(null);
  const [reviewSuccess, setReviewSuccess] = useState(null);

  const fetchProduct = async () => {
    try {
      setLoading(true);
      const { data } = await api.get(`/products/${id}`);
      setProduct(data);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Product could not be found');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProduct();
  }, [id]);

  const handleAddToCart = () => {
    if (product && product.countInStock >= qty) {
      addToCart(product, qty);
      setAdded(true);
      setTimeout(() => setAdded(false), 1500);
    }
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!comment.trim()) {
      setReviewError('Please write a brief comment for your review.');
      return;
    }

    setSubmittingReview(true);
    setReviewError(null);
    setReviewSuccess(null);

    try {
      await api.post(`/products/${id}/reviews`, {
        rating: Number(rating),
        comment: comment.trim(),
      });
      setReviewSuccess('Review successfully posted! Thank you for your feedback.');
      setComment('');
      setRating(5);
      fetchProduct(); // Refresh product reviews and updated rating average
    } catch (err) {
      setReviewError(err.response?.data?.message || 'Failed to submit review');
    } finally {
      setSubmittingReview(false);
    }
  };

  if (loading) {
    return (
      <div className="py-24 flex flex-col items-center justify-center space-y-4">
        <div className="w-10 h-10 border-4 border-sky-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-sm font-medium text-slate-400">Loading product specs...</p>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="py-20 text-center max-w-md mx-auto space-y-4">
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm">
          {error || 'Product not found'}
        </div>
        <Link
          to="/"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800 text-white text-xs font-semibold hover:bg-slate-700"
        >
          <ArrowLeft size={16} /> Return to Storefront
        </Link>
      </div>
    );
  }

  const isOutOfStock = product.countInStock <= 0;
  const isLowStock = product.countInStock > 0 && product.countInStock <= 4;
  const alreadyReviewed = user && product.reviews?.some((r) => r.user === user._id || r.name === user.name);

  return (
    <div className="space-y-12 pb-20">
      {/* Breadcrumb Back Link */}
      <div>
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-sm font-medium text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft size={16} /> Back to Storefront
        </Link>
      </div>

      {/* Main Product Showcase */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        {/* Left: Product Image */}
        <div className="relative rounded-3xl overflow-hidden bg-slate-950 border border-slate-800 flex items-center justify-center aspect-square shadow-2xl">
          <img
            src={product.imageUrl}
            alt={product.title}
            className="w-full h-full object-cover object-center hover:scale-105 transition-transform duration-500"
          />
          <div className="absolute top-4 left-4">
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-slate-900/90 text-sky-400 border border-slate-700 backdrop-blur-md">
              {product.category}
            </span>
          </div>
        </div>

        {/* Right: Product Meta & Purchase Box */}
        <div className="flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <div>
              <StarRating rating={product.rating} numReviews={product.numReviews} size={18} />
              <h1 className="mt-2 text-2xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
                {product.title}
              </h1>
            </div>

            <div className="flex items-baseline space-x-3">
              <span className="text-3xl sm:text-4xl font-extrabold text-white font-mono">
                ${Number(product.price).toFixed(2)}
              </span>
              <span className="text-xs text-slate-400 font-medium">USD (Tax calculated at sandbox checkout)</span>
            </div>

            <div className="p-4 rounded-2xl bg-slate-800/40 border border-slate-700/60">
              <p className="text-sm text-slate-300 leading-relaxed">{product.description}</p>
            </div>

            {/* Inventory Status Alert */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-semibold">
                <span className="text-slate-400">Inventory Status:</span>
                {isOutOfStock ? (
                  <span className="text-rose-400 flex items-center gap-1">
                    <AlertTriangle size={14} /> Out of Stock
                  </span>
                ) : isLowStock ? (
                  <span className="text-amber-400 flex items-center gap-1 font-bold animate-pulse">
                    <AlertTriangle size={14} /> Low Inventory: {product.countInStock} items left
                  </span>
                ) : (
                  <span className="text-emerald-400 flex items-center gap-1.5 font-medium bg-emerald-500/15 px-2.5 py-0.5 rounded-full border border-emerald-500/30">
                    <Check size={14} /> In Stock ({product.countInStock} units available)
                  </span>
                )}
              </div>

              {/* Purchase Controls */}
              {!isOutOfStock && (
                <div className="flex items-center gap-4 pt-2">
                  <div className="flex items-center space-x-2">
                    <label htmlFor="qty-select" className="text-xs text-slate-400">
                      Quantity:
                    </label>
                    <select
                      id="qty-select"
                      value={qty}
                      onChange={(e) => setQty(Number(e.target.value))}
                      className="px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-sm font-semibold focus:outline-none focus:border-sky-500"
                    >
                      {[...Array(Math.min(product.countInStock, 10)).keys()].map((x) => (
                        <option key={x + 1} value={x + 1}>
                          {x + 1}
                        </option>
                      ))}
                    </select>
                  </div>

                  <button
                    onClick={handleAddToCart}
                    className={`flex-1 flex items-center justify-center gap-2 py-3 px-6 rounded-xl font-bold text-sm transition-all shadow-lg ${
                      added
                        ? 'bg-emerald-500 text-white shadow-emerald-500/25'
                        : 'bg-sky-500 hover:bg-sky-400 text-white shadow-sky-500/25 hover:shadow-sky-500/40'
                    }`}
                  >
                    {added ? (
                      <>
                        <Check size={18} /> Added to Cart!
                      </>
                    ) : (
                      <>
                        <ShoppingCart size={18} /> Add {qty} to Cart (${(product.price * qty).toFixed(2)})
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Guarantee Badges */}
          <div className="grid grid-cols-3 gap-3 pt-6 border-t border-slate-800 text-slate-400 text-xs text-center">
            <div className="p-3 rounded-xl bg-slate-800/30 border border-slate-700/40 flex flex-col items-center gap-1.5">
              <ShieldCheck size={18} className="text-sky-400" />
              <span className="font-semibold text-slate-200">Sandbox Verified</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-800/30 border border-slate-700/40 flex flex-col items-center gap-1.5">
              <Truck size={18} className="text-indigo-400" />
              <span className="font-semibold text-slate-200">Free Over $100</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-800/30 border border-slate-700/40 flex flex-col items-center gap-1.5">
              <RotateCcw size={18} className="text-emerald-400" />
              <span className="font-semibold text-slate-200">30-Day Policy</span>
            </div>
          </div>
        </div>
      </div>

      {/* Customer Reviews & Feedback Section */}
      <section className="pt-10 border-t border-slate-800 space-y-8">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight">Customer Reviews & Ratings</h2>
          <p className="text-xs text-slate-400 mt-1">Verified purchaser insights and user testimonials</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Review Submission Form */}
          <div className="p-6 rounded-2xl bg-slate-800/50 border border-slate-700/70 h-fit space-y-4">
            <h3 className="font-bold text-white text-base">Write a Review</h3>

            {!user ? (
              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 text-center space-y-2">
                <p className="text-xs text-slate-400">Please sign in to publish your customer review.</p>
                <Link
                  to="/auth"
                  className="inline-block px-4 py-1.5 rounded-lg bg-sky-500 hover:bg-sky-400 text-white text-xs font-semibold"
                >
                  Sign In to Rate
                </Link>
              </div>
            ) : alreadyReviewed ? (
              <div className="p-4 rounded-xl bg-sky-500/10 border border-sky-500/20 text-xs text-sky-300">
                You have already submitted a review for this product. Thank you!
              </div>
            ) : (
              <form onSubmit={handleReviewSubmit} className="space-y-4">
                {reviewError && (
                  <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs">
                    {reviewError}
                  </div>
                )}
                {reviewSuccess && (
                  <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs">
                    {reviewSuccess}
                  </div>
                )}

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Your Rating (1 to 5 Stars):
                  </label>
                  <StarRating
                    rating={rating}
                    interactive={true}
                    onRatingChange={(newVal) => setRating(newVal)}
                    size={22}
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Detailed Review:
                  </label>
                  <textarea
                    rows={4}
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Share your experience regarding build quality, sound, or durability..."
                    className="w-full p-3 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-sky-500"
                    required
                  ></textarea>
                </div>

                <button
                  type="submit"
                  disabled={submittingReview}
                  className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-white text-xs font-bold transition-all shadow-md shadow-sky-500/20 disabled:opacity-50"
                >
                  {submittingReview ? 'Publishing...' : <><Send size={14} /> Submit Feedback</>}
                </button>
              </form>
            )}
          </div>

          {/* Reviews List */}
          <div className="lg:col-span-2 space-y-4">
            {product.reviews && product.reviews.length > 0 ? (
              product.reviews.map((rev, index) => (
                <div
                  key={rev._id || index}
                  className="p-5 rounded-2xl bg-slate-800/40 border border-slate-700/60 space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="w-7 h-7 rounded-full bg-slate-700 flex items-center justify-center text-slate-300">
                        <User size={14} />
                      </div>
                      <span className="text-sm font-semibold text-white">{rev.name}</span>
                    </div>
                    <span className="text-xs text-slate-500">
                      {rev.createdAt ? new Date(rev.createdAt).toLocaleDateString() : 'Verified Purchase'}
                    </span>
                  </div>

                  <StarRating rating={rev.rating} showText={false} size={14} />

                  <p className="text-xs text-slate-300 leading-relaxed pt-1">{rev.comment}</p>
                </div>
              ))
            ) : (
              <div className="p-8 rounded-2xl bg-slate-800/20 border border-slate-800 text-center text-xs text-slate-400">
                No reviews recorded for this product yet. Be the first to share your thoughts!
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};

export default ProductDetails;

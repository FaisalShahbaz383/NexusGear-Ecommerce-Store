import React, { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState(() => {
    try {
      const saved = localStorage.getItem('cartItems');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem('cartItems', JSON.stringify(cartItems));
  }, [cartItems]);

  const addToCart = (product, qty = 1) => {
    const requestedQty = Number(qty);
    setCartItems((prevItems) => {
      const existItem = prevItems.find((x) => x.product === product._id);

      if (existItem) {
        const newQty = Math.min(existItem.qty + requestedQty, product.countInStock);
        return prevItems.map((x) =>
          x.product === product._id
            ? {
                ...x,
                qty: newQty,
                countInStock: product.countInStock,
              }
            : x
        );
      } else {
        return [
          ...prevItems,
          {
            product: product._id,
            title: product.title,
            imageUrl: product.imageUrl,
            price: product.price,
            countInStock: product.countInStock,
            qty: Math.min(requestedQty, product.countInStock),
          },
        ];
      }
    });
  };

  const updateQuantity = (productId, qty) => {
    const newQty = Number(qty);
    if (newQty <= 0) {
      removeFromCart(productId);
      return;
    }

    setCartItems((prevItems) =>
      prevItems.map((item) =>
        item.product === productId
          ? { ...item, qty: Math.min(newQty, item.countInStock) }
          : item
      )
    );
  };

  const removeFromCart = (productId) => {
    setCartItems((prevItems) => prevItems.filter((x) => x.product !== productId));
  };

  const clearCart = () => {
    setCartItems([]);
    localStorage.removeItem('cartItems');
  };

  // Calculations
  const itemsCount = cartItems.reduce((acc, item) => acc + item.qty, 0);
  const itemsPrice = Number(
    cartItems.reduce((acc, item) => acc + item.price * item.qty, 0).toFixed(2)
  );
  const taxPrice = Number((itemsPrice * 0.08).toFixed(2));
  const shippingPrice = itemsPrice > 100 || itemsPrice === 0 ? 0.00 : 15.00;
  const totalPrice = Number((itemsPrice + taxPrice + shippingPrice).toFixed(2));

  return (
    <CartContext.Provider
      value={{
        cartItems,
        itemsCount,
        itemsPrice,
        taxPrice,
        shippingPrice,
        totalPrice,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);

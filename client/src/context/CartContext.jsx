import React, { createContext, useState, useEffect, useContext } from 'react';

const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);

  // Load cart from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      try {
        setCartItems(JSON.parse(savedCart));
      } catch (err) {
        console.error('Failed to parse cart data', err);
      }
    }
  }, []);

  // Save cart to localStorage on change
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cartItems));
  }, [cartItems]);

  const addToCart = (book, quantity = 1, format = 'paperback') => {
    setCartItems(prev => {
      const existingIndex = prev.findIndex(item => item.bookId === book._id && item.format === format);
      if (existingIndex > -1) {
        const updated = [...prev];
        updated[existingIndex].quantity += quantity;
        return updated;
      } else {
        return [...prev, {
          bookId: book._id,
          title: book.title,
          price: book.price,
          format,
          quantity
        }];
      }
    });
  };

  const removeFromCart = (bookId, format) => {
    setCartItems(prev => prev.filter(item => !(item.bookId === bookId && item.format === format)));
  };

  const updateQuantity = (bookId, format, newQty) => {
    if (newQty < 1) return;
    setCartItems(prev => prev.map(item => 
      (item.bookId === bookId && item.format === format) 
        ? { ...item, quantity: newQty } 
        : item
    ));
  };

  const clearCart = () => {
    setCartItems([]);
  };

  const getCartTotal = () => {
    return cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  };

  return (
    <CartContext.Provider value={{ cartItems, addToCart, removeFromCart, updateQuantity, clearCart, getCartTotal }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);

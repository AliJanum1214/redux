import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  items:
    typeof window !== "undefined" && localStorage.getItem("cartItems")
      ? JSON.parse(localStorage.getItem("cartItems"))
      : [],
};

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    addToCart(state, action) {
      const existingItem = state.items.find(
        (item) => item.size === action.payload.size
      );
      if (existingItem) {
        existingItem.quantity += 1;
      } else {
        state.items.push({ ...action.payload, quantity: 1 });
      }
      localStorage.setItem("cartItems", JSON.stringify(state.items));
    },
    removeFromCart(state, action) {
      state.items.splice(action.payload, 1);
      localStorage.setItem("cartItems", JSON.stringify(state.items));
    },
    updateQuantity(state, action) {
      const { index, change } = action.payload;
      const item = state.items[index];
      if (item) {
        item.quantity = Math.max(1, item.quantity + change);
        localStorage.setItem("cartItems", JSON.stringify(state.items));
      }
    },
    loadCartFromStorage(state) {
      const stored = localStorage.getItem("cartItems");
      if (stored) state.items = JSON.parse(stored);
    },
    clearCart(state) {
      state.items = [];
      localStorage.setItem("cartItems", JSON.stringify(state.items));
    },
  },
});

export const {
  addToCart,
  removeFromCart,
  updateQuantity,
  loadCartFromStorage,
  clearCart,
} = cartSlice.actions;
export default cartSlice.reducer;

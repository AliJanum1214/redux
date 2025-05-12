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
      state.items.push(action.payload);
      localStorage.setItem("cartItems", JSON.stringify(state.items));
    },
    removeFromCart(state, action) {
      state.items.splice(action.payload, 1);
      localStorage.setItem("cartItems", JSON.stringify(state.items));
    },
    loadCartFromStorage(state) {
      const stored = localStorage.getItem("cartItems");
      if (stored) state.items = JSON.parse(stored);
    },
  },
});

export const { addToCart, removeFromCart, loadCartFromStorage } =
  cartSlice.actions;
export default cartSlice.reducer;

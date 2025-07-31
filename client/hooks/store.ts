// src/store/store.ts
import { configureStore } from "@reduxjs/toolkit";
import dateReducer from "./dateSlice";
import { useDispatch } from "react-redux";

export const store = configureStore({
  reducer: {
    dateRange: dateReducer,
  },
});

// Typage des hooks Redux
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export const useAppDispatch = () => useDispatch<AppDispatch>();
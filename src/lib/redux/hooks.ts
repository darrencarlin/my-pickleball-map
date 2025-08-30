import type { TypedUseSelectorHook } from "react-redux";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "./store";

export const useAppDispatch: () => AppDispatch = useDispatch;
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

// Helper to manually trigger persistence actions (if needed)
export const usePersistActions = () => {
  return {
    purge: () => {
      // This would purge the persisted state if needed
      // You can implement this if you need manual control over persistence
      console.log("Purge persistence called");
    },
  };
};

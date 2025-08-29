import { createSlice } from "@reduxjs/toolkit";

interface ModalState {
  "add-court": boolean;
  "edit-court"?: boolean;
}

const initialState: ModalState = {
  "add-court": false,
  "edit-court": false,
};

export const modalSlice = createSlice({
  name: "modal",
  initialState,
  reducers: {
    setModal: (
      state,
      action: {
        payload: { modal: keyof ModalState; value: boolean };
      }
    ) => {
      state[action.payload.modal] = action.payload.value;
    },
  },
});

export const { setModal } = modalSlice.actions;

export default modalSlice.reducer;

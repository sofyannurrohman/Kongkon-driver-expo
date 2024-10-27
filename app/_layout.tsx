import React from "react";
import { Slot } from "expo-router";
import '../global.css'
import { Provider } from "react-redux";
import store from "@/store";

export default function Layout() {
  return (
    <Provider store={store}>
      <Slot />
    </Provider>
  );
}
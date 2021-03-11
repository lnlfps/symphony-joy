import { useContext } from "react";
import { JoyReactContext } from "./application-component";
import { IReactApplication } from "./interfaces";

export function useJoyContext(): IReactApplication {
  const context = useContext(JoyReactContext);
  if (context === undefined) {
    throw new Error("Missing JoyReactContext in the react tree");
  }
  return context;
}
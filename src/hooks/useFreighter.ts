"use client";

import { useFreighterContext } from "@/context/FreighterProvider";

export function useFreighter() {
  return useFreighterContext();
}

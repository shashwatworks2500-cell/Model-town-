"use client";

import { createContext, useCallback, useContext, useMemo, useState } from "react";

interface EnquiryContextValue {
  open: boolean;
  openEnquiry: () => void;
  closeEnquiry: () => void;
}

const EnquiryContext = createContext<EnquiryContextValue | null>(null);

export function EnquiryProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const openEnquiry = useCallback(() => setOpen(true), []);
  const closeEnquiry = useCallback(() => setOpen(false), []);
  const value = useMemo(
    () => ({ open, openEnquiry, closeEnquiry }),
    [open, openEnquiry, closeEnquiry],
  );
  return <EnquiryContext.Provider value={value}>{children}</EnquiryContext.Provider>;
}

export function useEnquiry(): EnquiryContextValue {
  const context = useContext(EnquiryContext);
  if (!context) throw new Error("useEnquiry must be used inside EnquiryProvider");
  return context;
}

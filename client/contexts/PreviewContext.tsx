import React, { createContext, useContext, useState, ReactNode } from "react";
import type { BookingData } from "@shared/booking";
import type { TravelPlan } from "@shared/types";

interface PreviewData {
  invoice?: {
    content: string;
    client: string;
    amount: number;
    currency: string;
    createdAt: Date;
  };
  travelPlan?: TravelPlan;
  bookingData?: BookingData;
}

interface PreviewContextType {
  previewData: PreviewData;
  setInvoicePreview: (
    content: string,
    client: string,
    amount: number,
    currency: string,
  ) => void;
  setTravelPlanPreview: (plan: TravelPlan) => void;
  setBookingData: (data: BookingData) => void;
  clearPreviews: () => void;
  hasInvoicePreview: boolean;
  hasTravelPlanPreview: boolean;
}

const PreviewContext = createContext<PreviewContextType | undefined>(undefined);

export function PreviewProvider({ children }: { children: ReactNode }) {
  const [previewData, setPreviewData] = useState<PreviewData>({});

  const setInvoicePreview = (
    content: string,
    client: string,
    amount: number,
    currency: string,
  ) => {
    setPreviewData((prev) => ({
      ...prev,
      invoice: {
        content,
        client,
        amount,
        currency,
        createdAt: new Date(),
      },
    }));
  };

  const setTravelPlanPreview = (plan: TravelPlan) => {
    setPreviewData((prev) => ({
      ...prev,
      travelPlan: plan,
    }));
  };

  const setBookingData = (data: BookingData) => {
    setPreviewData((prev) => ({
      ...prev,
      bookingData: data,
    }));
  };

  const clearPreviews = () => {
    setPreviewData({});
  };

  const hasInvoicePreview = !!previewData.invoice;
  const hasTravelPlanPreview = !!previewData.travelPlan;

  return (
    <PreviewContext.Provider
      value={{
        previewData,
        setInvoicePreview,
        setTravelPlanPreview,
        setBookingData,
        clearPreviews,
        hasInvoicePreview,
        hasTravelPlanPreview,
      }}
    >
      {children}
    </PreviewContext.Provider>
  );
}

export function usePreview() {
  const context = useContext(PreviewContext);
  if (context === undefined) {
    throw new Error("usePreview must be used within a PreviewProvider");
  }
  return context;
}

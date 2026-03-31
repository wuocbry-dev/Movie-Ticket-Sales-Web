import React, { createContext, useContext, useState, useCallback } from 'react';

const QuickBookingContext = createContext(null);

export const QuickBookingProvider = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const openQuickBooking = useCallback(() => setIsOpen(true), []);
  const closeQuickBooking = useCallback(() => setIsOpen(false), []);

  return (
    <QuickBookingContext.Provider
      value={{
        isQuickBookingOpen: isOpen,
        openQuickBooking,
        closeQuickBooking,
      }}
    >
      {children}
    </QuickBookingContext.Provider>
  );
};

export const useQuickBooking = () => {
  const ctx = useContext(QuickBookingContext);
  if (!ctx) return { isQuickBookingOpen: false, openQuickBooking: () => {}, closeQuickBooking: () => {} };
  return ctx;
};

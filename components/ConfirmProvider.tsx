import React, { createContext, useState } from "react";

export const ConfirmState = createContext<any>(false);

export const ConfirmProvider = ({ children }: any) => {
  const [confirmState, setConfirmState] = useState(false);

  return (
    <ConfirmState.Provider value={{ confirmState, setConfirmState }}>
      {children}
    </ConfirmState.Provider>
  );
};

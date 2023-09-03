"use client";

import React, { createContext, useContext } from "react";

type MyContextType = {
  user: { Username: string; Token: string };
  setUser: (data: { Username: string; Token: string }) => void;
};

const MyContext = createContext<MyContextType | undefined>(undefined);

interface PropsType {
  children: React.ReactNode;
}

export const MyContextProvider: React.FC<PropsType> = (props) => {
  const [user, setUser] = React.useState({ Username: "", Token: "" });

  return (
    <MyContext.Provider value={{ user, setUser }}>
      {props.children}
    </MyContext.Provider>
  );
};

export const useMyContext = () => {
  const context = useContext(MyContext);

  if (!context) {
    throw new Error("useMyContext must be used within a MyContextProvider");
  }

  return context;
};

"use client";

import React, { createContext, useContext } from "react";

type UserType = { Username: string; Token: string; Limit: number };

export interface JsonData {
  BACKEND_URL?: string;
  PAGE_TITLE?: string;
  CHANNEL_NAME?: string;
}

type MyContextType = {
  user: UserType;
  setUser: (data: UserType) => void;
  config: JsonData;
  setConfig: (data: JsonData) => void;
};

const MyContext = createContext<MyContextType | undefined>(undefined);

interface PropsType {
  children: React.ReactNode;
}

export const MyContextProvider: React.FC<PropsType> = (props) => {
  const [user, setUser] = React.useState({ Username: "", Token: "", Limit: 5 });
  const [config, setConfig] = React.useState({});

  return (
    <MyContext.Provider value={{ user, setUser, config, setConfig }}>
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

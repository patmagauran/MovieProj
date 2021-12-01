import React, { Dispatch, SetStateAction, useState } from "react";
interface IUserContext {
  userContext: any;
  setUserContext: Dispatch<SetStateAction<any>>;
}
export const UserContext = React.createContext<IUserContext>({
  userContext: {},
  setUserContext: () => {},
});

let initialState = {};

export const UserProvider = (props: { children?: React.ReactNode }) => {
  const [state, setState] = useState(initialState);

  return (
    <UserContext.Provider
      value={{ userContext: state, setUserContext: setState }}
    >
      {props.children}
    </UserContext.Provider>
  );
};

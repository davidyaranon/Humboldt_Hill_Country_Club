import React, { useEffect } from "react";

type Props = {
  children: React.ReactNode;
}

export interface MongoDbAuth {
  loggedIn: boolean; // meaning the jwt token is valid
  email: string;
  uid: string | null;
}

export interface VerifyTokenData {
  email: string;
  uid: string; // uid is the _id associated with the MongoDB document
  verificationSuccess: boolean;
}

export type AuthContextType = {
  auth: MongoDbAuth;
  setAuth: React.Dispatch<React.SetStateAction<MongoDbAuth>>;
  authLoading: boolean;
  setAuthLoading: React.Dispatch<React.SetStateAction<boolean>>;
  authError: Error | null;
  setAuthError: React.Dispatch<React.SetStateAction<Error | null>>;
  verifyToken: () => Promise<boolean>;
}

export const Context = React.createContext<AuthContextType | null>(null);
export const ContextProvider = ({ children }: Props) => {

  const [authLoading, setAuthLoading] = React.useState<boolean>(false);
  const [authError, setAuthError] = React.useState<Error | null>(null);
  const [auth, setAuth] = React.useState<MongoDbAuth>({ loggedIn: false, email: '', uid: null });

  /**
   * @function verifyToken 
   * @description Verifies that the JWT token (stored in cookies) is valid and has not expired.
   * It also sets the auth object accordingly with the user's logged in status, email, and UID.
   * 
   * @returns {Promise<boolean>} true if the token is valid, false otherwise.
   */
  const verifyToken = async (): Promise<boolean> => {
    setAuthLoading(true);
    setAuthError(null);

    try {
      const res = await fetch('/verify-token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include'
      });

      if (!res.ok) {
        console.log(res.statusText);
        throw new Error(`Server responded with status: ${res.status}`);
      }

      const data: VerifyTokenData = await res.json();
      setAuthLoading(false);
      if (data.verificationSuccess) {
        console.log('Token verified');
        setAuth({ loggedIn: true, email: data.email, uid: data.uid });
        return true;
      } else {
        console.log('Token verification failed');
        setAuth({ loggedIn: false, email: '', uid: null });
        return false;
      }

    } catch (err: any) {
      setAuthLoading(false);
      console.error("Error while verifying token:", err);
      setAuthError(err);
      setAuth({ loggedIn: false, email: '', uid: null });
      return false;
    }
  };

  useEffect(() => {
    verifyToken();
  }, []);

  const memoizedContextValue = React.useMemo(() => ({
    auth, setAuth, authLoading, setAuthLoading, authError, setAuthError, verifyToken
  }), [auth, setAuth, authLoading, setAuthLoading, authError, setAuthError, verifyToken]);

  return (
    <Context.Provider value={memoizedContextValue}> {children} </Context.Provider>
  )
};

export const useAuthContext = () => {
  const context = React.useContext(Context);
  if (!context) {
    throw new Error("Auth context error");
  }
  return context;
}

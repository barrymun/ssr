// import { useLazyQuery } from "@apollo/client/react";
import { useRouter } from "next/router";
import React, { ReactElement, useContext, createContext, useMemo, useEffect, useCallback } from "react";

import { Loading } from "app/components";
import { UserProfile } from "app/utils/types";
// import { GET_USER_BY_EMAIL } from "app/graphql/users";
// import { Users } from "codegen/codegen";

type AuthContextProps = {
  user?: UserProfile;
  isLoading?: boolean;
};

const AuthContext = createContext<AuthContextProps>({
  isLoading: true,
});

type AuthProviderProps = React.PropsWithChildren<AuthContextProps>;
type UseConfig = () => AuthContextProps;

const AuthProvider = ({ children }: AuthProviderProps): ReactElement<AuthContextProps> => {
  const router = useRouter();

  const [user, setUser] = React.useState<UserProfile | undefined>(undefined);
  const [isLoading, setIsLoading] = React.useState<boolean>(true);

  // const [getUserByEmail] = useLazyQuery<Users>(GET_USER_BY_EMAIL);

  const getUser = useCallback(
    async () => {
      try {
        const r = await fetch("http://localhost:3001/session", {
          method: "GET",
          credentials: "include",
        });
        const user: UserProfile = await r.json();
        setUser(user);
        setIsLoading(false);
      } catch (err) {
        setIsLoading(false);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  useEffect(() => {
    getUser();
  }, []);

  useEffect(() => {
    // we don't want to keep redirecting to login if we're already there
    if (router.pathname === "/login") {
      return;
    }

    if (!isLoading && !user) {
      router.push("/login");
    }

    // getUser();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, isLoading]);

  const authContextProviderValue = useMemo(() => ({ user, isLoading }), [user, isLoading]);

  return (
    <AuthContext.Provider value={authContextProviderValue}>{isLoading ? <Loading /> : children}</AuthContext.Provider>
  );
};

const useAuth: UseConfig = () => useContext<AuthContextProps>(AuthContext);

export { AuthProvider, useAuth };

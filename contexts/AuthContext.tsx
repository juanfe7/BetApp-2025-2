import { createContext, ReactNode, useState } from 'react';

interface AuthContextProps {
  user: any;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
}

const fakeDataSource = [
  {
    email: "test@test.com",
    password: "12345678",
    name: "TEST"
  },
  {
    email: "test1@test.com",
    password: "12345678",
    name: "TEST1"
  },
  {
    email: "test2@test.com",
    password: "12345678",
    name: "TEST2"
  },
  {
    email: "juanfe",
    password: "123",
    name: "TEST2"
  }

];

export const AuthContext = createContext({} as AuthContextProps);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      // Buscar usuario en fakeDataSource
      const foundUser = fakeDataSource.find(
        (u) => u.email === email && u.password === password
      );

      if (!foundUser) {
        throw new Error("Credenciales incorrectas");
      }

      setUser(foundUser); // guardar usuario en el contexto
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setUser(null);
  };

  const register = async (email: string, password: string) => {
    // Ejemplo simple: agregar a fakeDataSource
    fakeDataSource.push({ email, password, name: email.split("@")[0] });
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        login,
        logout,
        register,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

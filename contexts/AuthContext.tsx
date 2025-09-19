import { supabase } from "@/utils/supabase";
import { createContext, ReactNode, useEffect, useState } from "react";

interface AuthContextProps {
  user: any;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updateProfile?: (profileData: Partial<any>) => Promise<boolean>;
  setUser: React.Dispatch<React.SetStateAction<any>>;
}

export const AuthContext = createContext({} as AuthContextProps);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const getSession = async () => {
      setIsLoading(true);
      const { data } = await supabase.auth.getSession();
      if (data.session) {
        setUser(data.session.user);
      }
      setIsLoading(false);
    };
    getSession();

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);


  const login = async (email: string, password: string) => {
    setIsLoading(true);

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setIsLoading(false);
      throw new Error(error.message);
    }

    if (data.user) {
      // 🔹 Traer el perfil completo desde la tabla profiles
      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", data.user.id)
        .single();

      if (profileError) {
        console.error("Error fetching user profile:", profileError);
        // 👉 Si falla, al menos guardamos el usuario básico de Supabase
        setUser(data.user);
      } else {
        // 👉 Guardamos user + profile en el contexto
        setUser({
          ...data.user,
          ...profileData,
        });
      }
    }

    setIsLoading(false);
  };



  const logout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw new Error(error.message);
    setUser(null);
  };


  const register = async (email: string, password: string) => {
    setIsLoading(true);

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      setIsLoading(false);
      throw new Error(error.message);
    }

    if (data.user) {
      const { error: profileError } = await supabase
        .from("profiles")
        .insert({
          id: data.user.id,
          email: data.user.email, // ✅ usar data.user
          name: "", // lo puedes dejar vacío o pedirlo en el formulario
          username: data.user.email?.split("@")[0], // ✅ seguro con optional chaining
        });

      if (profileError) {
        console.error("Error creating user profile:", profileError);
      }

      // Guardamos user + profile en el contexto
      setUser({
        ...data.user,
        email: data.user.email,
        username: data.user.email?.split("@")[0],
      });
    }

    setIsLoading(false);
  };



  // 🔹 Reset password
  const resetPassword = async (email: string) => {
    setIsLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: "betapp:///(auth)/reset", // URL a donde redirige después del link
    });
    setIsLoading(false);

    if (error) throw new Error(error.message);
  };


  const updateProfile = async (profileData: Partial<any>) => {
      if (!user?.id) {
          console.error('No user ID available');
          return false;
      }

      try {
          const { error } = await supabase
              .from('profiles')
              .update({
                  ...profileData,
                  updated_at: new Date().toISOString()
              })
              .eq('id', user.id);

          if (error) {
              console.error('Update profile error:', error.message);
              throw new Error(error.message);
          }

          setUser({
              ...user,
              ...profileData
          });

          return true;
      } catch (error) {
          console.error('Update profile error:', error);
          return false;
      }
  };


  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        login,
        logout,
        register,
        resetPassword,
        updateProfile,
        setUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

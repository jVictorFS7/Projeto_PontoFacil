import { createContext, useContext, useEffect, useState } from "react";
import {  createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged, updateProfile} from "firebase/auth";
import { doc, getDoc, setDoc, serverTimestamp, updateDoc} from "firebase/firestore";
import { auth, db } from "../firebaseConnection";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [funcionario, setFuncionario] = useState(null);
  const [carregando, setCarregando] = useState(true);

  // Verifica a sessão do usuário
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (usuario) => {
      setUser(usuario);

      if (usuario) {
        try {
          const referencia = doc(db, "funcionarios", usuario.uid);
          const resultado = await getDoc(referencia);

          if (resultado.exists()) {
            setFuncionario(resultado.data());
          } else {
            setFuncionario(null);
          }
        } catch (error) {
          console.log("Erro ao buscar funcionário:", error);
          setFuncionario(null);
        }
      } else {
        setFuncionario(null);
      }

      setCarregando(false);
    });

    return unsubscribe;
  }, []);

  // Cadastro de funcionário
  async function cadastrarFuncionario(dados) {
    setCarregando(true);

    try {
      const credencial = await createUserWithEmailAndPassword(
        auth,
        dados.email.trim().toLowerCase(),
        dados.senha,
      );

      const usuario = credencial.user;

      await updateProfile(usuario, {
        displayName: dados.nome.trim(),
      });

      const dadosFuncionario = {
        uid: usuario.uid,
        nome: dados.nome.trim(),
        cpf: dados.cpf.trim(),
        cargo: dados.cargo.trim(),
        email: dados.email.trim().toLowerCase(),
        criadoEm: serverTimestamp(),
      };

      await setDoc(doc(db, "funcionarios", usuario.uid), dadosFuncionario);

      setUser(usuario);
      setFuncionario(dadosFuncionario);

      return usuario;
    } finally {
      setCarregando(false);
    }
  }

  // Atualiza os dados do funcionário
  async function atualizarFuncionario(dados) {
    if (!user?.uid) {
      throw new Error("Usuário não autenticado.");
    }

    const dadosAtualizados = {
      nome: dados.nome.trim(),
      cargo: dados.cargo.trim(),
    };

    // Atualiza os dados no Firestore
    await updateDoc(doc(db, "funcionarios", user.uid), dadosAtualizados);

    // Atualiza o nome no Firebase Authentication
    if (auth.currentUser) {
      try {
        await updateProfile(auth.currentUser, {
          displayName: dadosAtualizados.nome,
        });
      } catch (error) {
        console.log("Erro ao atualizar nome de exibição:", error);
      }
    }

    // Atualiza os dados no estado global
    setFuncionario((atual) => ({
      ...atual,
      ...dadosAtualizados,
    }));

    return dadosAtualizados;
  }

  // Login
  async function login(email, senha) {
    setCarregando(true);

    try {
      const credencial = await signInWithEmailAndPassword(
        auth,
        email.trim().toLowerCase(),
        senha,
      );

      return credencial.user;
    } finally {
      setCarregando(false);
    }
  }

  // Logout
  async function logout() {
    await signOut(auth);
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        funcionario,
        carregando,
        cadastrarFuncionario,
        atualizarFuncionario,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// Hook de autenticação
export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth deve ser utilizado dentro de AuthProvider");
  }

  return context;
}

import { initializeApp, getApps, getApp } from "firebase/app";
import { initializeAuth, getAuth, getReactNativePersistence,} from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Configuração do Firebase
const firebaseConfig = {
  apiKey: "AIzaSyAET2AFh88SRpIHOJ2hdVRwv-L5HXztGcQ",
  authDomain: "pontofacil-70088.firebaseapp.com",
  projectId: "pontofacil-70088",
  storageBucket: "pontofacil-70088.firebasestorage.app",
  messagingSenderId: "519729218969",
  appId: "1:519729218969:web:6211bc08a6aa7529363f08",
};

// Inicializa o Firebase
const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

// Inicializa o Firestore
export const db = getFirestore(app);

// Inicializa a autenticação
let auth;

try {
  auth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage),
  });
} catch (error) {
  auth = getAuth(app);
}

export { auth };

export default app;

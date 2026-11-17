# Ponto Fácil

Aplicativo mobile de controle de ponto eletrônico desenvolvido com React Native, Expo e Firebase. O objetivo é permitir que funcionários registrem seus horários de entrada e saída, consultem o histórico de registros e gerenciem seus dados pessoais.

## 📱 Funcionalidades

- Cadastro de funcionários.
- Login e autenticação com Firebase Authentication.
- Logout da conta.
- Registro de entrada e saída.
- Histórico de registros de ponto.
- Consulta dos dados do funcionário.
- Edição de nome e cargo.
- Seleção e atualização da foto de perfil.
- Armazenamento dos dados no Firebase Firestore.

## 🛠️ Tecnologias utilizadas

- **React Native:** desenvolvimento da interface mobile.
- **Expo:** ambiente e ferramentas de desenvolvimento.
- **Expo Router:** navegação entre telas.
- **Firebase Authentication:** autenticação dos funcionários.
- **Cloud Firestore:** armazenamento dos dados e registros de ponto.
- **AsyncStorage:** persistência da sessão de autenticação.
- **Expo Image Picker:** seleção de foto da galeria.
- **Expo Image Manipulator:** redimensionamento e conversão de imagens.
- **Expo Haptics:** feedback tátil durante as interações.
- **React Native Vector Icons / Expo Vector Icons:** utilização de ícones.

## 📸 Capturas de tela

As imagens abaixo representam as principais telas do aplicativo.

> Para adicionar as capturas, crie uma pasta chamada `screenshots` na raiz do projeto e coloque as imagens nela.

### Tela de Login

![Tela de Login](![alt text](image.png))

### Tela de Cadastro

![Tela de Cadastro](![alt text](image-1.png))

### Tela Inicial – Registro de Ponto

![Tela Inicial](![alt text](image-2.png))

### Tela de Histórico

![Tela de Histórico](![alt text](image-3.png))

### Tela de Perfil

![Tela de Perfil](![alt text](image-4.png))

## ⚙️ Pré-requisitos

Antes de começar, você precisa ter instalado:

- [Node.js](https://nodejs.org/)
- npm (instalado junto com o Node.js)
- [Git](https://git-scm.com/)
- [Expo Go](https://expo.dev/go) no dispositivo móvel ou um emulador Android/iOS.
- Uma conta e um projeto configurado no [Firebase Console](https://console.firebase.google.com/).

## 🚀 Instalação e execução

### 1. Clonar o repositório

```bash
git clone https://github.com/jVictorFS7/Projeto_PontoFacil
```

Entre na pasta do projeto:

```bash
cd PontoFacil
```

### 2. Instalar as dependências

```bash
npm install
```

Instale também as dependências Expo utilizadas pelo projeto, caso ainda não estejam instaladas:

```bash
npx expo install expo-haptics expo-image-picker expo-image-manipulator @react-native-async-storage/async-storage npx expo install expo-router react-native-safe-area-contexto

npx expo install react-native-screens expo-linking expo-constants 

npx expo install @expo/vector-icons

npx expo install firebase

npx expo install expo-haptics
```

Instale o Firebase:

```bash
npm install firebase
```

### 3. Configurar o Firebase

O projeto utiliza Firebase Authentication e Cloud Firestore.

1. Acesse o [Firebase Console](https://console.firebase.google.com/).
2. Crie um projeto Firebase ou utilize um projeto de teste.
3. Adicione um aplicativo Web ao projeto Firebase.
4. Copie as configurações disponibilizadas pelo Firebase.
5. Habilite o método de autenticação **E-mail/senha** em Authentication.
6. Crie o banco de dados Cloud Firestore.

### 4. Configurar as chaves do Firebase

Na raiz do projeto, localize o arquivo `firebaseConnection.js`.

Configure o objeto `firebaseConfig` com os dados do seu projeto Firebase:

```javascript
const firebaseConfig = {
  apiKey: "SUA_API_KEY",
  authDomain: "SEU_AUTH_DOMAIN",
  projectId: "SEU_PROJECT_ID",
  storageBucket: "SEU_STORAGE_BUCKET",
  messagingSenderId: "SEU_MESSAGING_SENDER_ID",
  appId: "SEU_APP_ID",
};
```

Substitua os valores de exemplo pelas informações fornecidas pelo Firebase Console.

O arquivo também deve inicializar o Firebase Authentication com persistência usando AsyncStorage e configurar o Cloud Firestore.

### 5. Executar o aplicativo

Após instalar as dependências e configurar o Firebase, execute:

```bash
npx expo start
```

Para limpar o cache, caso necessário:

```bash
npx expo start --clear
```

Escaneie o QR Code com o Expo Go ou execute o projeto em um emulador compatível.

## 🗄️ Estrutura de dados do Firebase

O projeto utiliza o Cloud Firestore para armazenar os dados.

### Coleção `funcionarios`

Armazena as informações dos funcionários cadastrados.

Principais campos:

| Campo | Descrição |
|---|---|
| uid | Identificador do usuário no Firebase Authentication |
| nome | Nome do funcionário |
| cargo | Cargo do funcionário |
| email | E-mail utilizado no cadastro |
| foto | Foto de perfil codificada em Base64, quando cadastrada |

### Coleção `registros`

Armazena os registros de ponto dos funcionários.

| Campo | Descrição |
|---|---|
| uid | Identificador do funcionário |
| tipo | Tipo do registro: entrada ou saída |
| dataHora | Data e horário do registro |

## 👥 Integrantes e divisão das tarefas

| Integrante | Responsabilidades |
|---|---|
| [João Victor] | [Tudo] |

*Substitua os nomes e as responsabilidades acima pelos dados reais da equipe.*

## 🎓 Projeto acadêmico

Projeto desenvolvido como atividade acadêmica, com o objetivo de aplicar conceitos de desenvolvimento mobile, componentização, navegação, gerenciamento de estado, autenticação e integração com banco de dados em nuvem.
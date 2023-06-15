import React from "react";

import { Refine, AuthProvider } from "@pankod/refine-core";
import {
  notificationProvider,
  RefineSnackbarProvider,
  CssBaseline,
  GlobalStyles,
  ReadyPage,
  ErrorComponent,
} from "@pankod/refine-mui";

import {
  AccountCircleOutlined,
  ChatBubbleOutline,
  PeopleAltOutlined,
  StarOutlineRounded,
  VillaOutlined,
} from "@mui/icons-material";

import dataProvider from "@pankod/refine-simple-rest";
import { MuiInferencer } from "@pankod/refine-inferencer/mui";
import routerProvider from "@pankod/refine-react-router-v6";
import axios, { AxiosRequestConfig } from "axios";
import { ColorModeContextProvider } from "contexts";
import { Title, Sider, Layout, Header } from "components/layout";
import { 
  Login,
  Home,
  Agents,
  MyProfile,
  PropertyDetails,
  AllProperties,
  CreateProperty,
  AgentProfile,
  EditProperty, } from "pages";
import { CredentialResponse } from "interfaces/google";
import { parseJwt } from "utils/parse-jwt";

// const axiosInstance = axios.create();
// axiosInstance.interceptors.request.use((request: AxiosRequestConfig) => { // Los interceptores se utilizan para modificar las solicitudes antes de que se envien al servidor
//   const token = localStorage.getItem("token");                            // Aqui se agrega un encabezado 'Authorization con el token almacenado en localserver
//   if (request.headers) {                                                  // Esto será usado por el servidor para dar o no acceso a recursos protegidos.
//     request.headers["Authorization"] = `Bearer ${token}`;
//   } else {
//     request.headers = {
//       Authorization: `Bearer ${token}`,
//     };
//   }

//   return request;
// });

function App() {
  const authProvider: AuthProvider = {

    // Funciones que se pasan al provider del autenticación

    login: async({ credential }: CredentialResponse) => {                 // Recibimos las credenciales en login desde Login.jsx y si obtenemos respuesta
      const profileObj = credential ? parseJwt(credential) : null;        // parseamos dicha respuesta
      console.log('credencial', profileObj)

      if( profileObj ){                                                   // Si existen las credenciales
        const response = await fetch('http://localhost:8080/api/v1/users',{   // Guardamos los datos en mongo db
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: profileObj.name,
            email: profileObj.email,
            avatar: profileObj.picture,
          }),    
        })
        const data = await response.json();                               // Obtenemos los datos guardados en bd
        if( response.status === 200 ) {                                   // Si la respuesta es correcta
          localStorage.setItem(                                           // almacenamos en localStorage
            "user",                                                       // todas las propiedades del "user" de las credenciales
            JSON.stringify({                                                
              ...profileObj,
              avatar: profileObj.picture,
              userid: data._id                                            // y la id proporcionada por la base de datos
            })
          );
        }else{
          return Promise.reject();
        }
      }

      localStorage.setItem("token", `${credential}`);                     // Al final guardamos el token de autentificación en local Storage
      return Promise.resolve();                                           // Este token es el que permitirá acceder a los recursos del server
    },
    logout: () => {
      const token = localStorage.getItem("token");

      if (token && typeof window !== "undefined") {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        axios.defaults.headers.common = {};
        window.google?.accounts.id.revoke(token, () => {
          return Promise.resolve();
        });
      }

      return Promise.resolve();
    },
    checkError: () => Promise.resolve(),
    checkAuth: async () => {
      const token = localStorage.getItem("token");

      if (token) {
        return Promise.resolve();
      }
      return Promise.reject();
    },

    getPermissions: () => Promise.resolve(),
    getUserIdentity: async () => {
      const user = localStorage.getItem("user");
      if (user) {
        return Promise.resolve(JSON.parse(user));
      }
    },
  };

  return (
    <ColorModeContextProvider>
      <CssBaseline />
      <GlobalStyles styles={{ html: { WebkitFontSmoothing: "auto" } }} />
      <RefineSnackbarProvider>
        <Refine
          dataProvider={dataProvider("http://localhost:8080/api/v1")} //local host 8080
          notificationProvider={notificationProvider}
          ReadyPage={ReadyPage}
          catchAll={<ErrorComponent />}
          resources={[
            {
              name: "properties",
              list: AllProperties,
              show: PropertyDetails,
              create: CreateProperty,
              edit: EditProperty,
              icon: <VillaOutlined />,
            },
            {
              name: "agents",
              list: Agents,
              show: AgentProfile,
              icon: <PeopleAltOutlined />,
            },
            {
              name: "reviews",
              list: Home,
              icon: <StarOutlineRounded />
            },
            {
              name: "messages",
              list: Home,
              icon: <ChatBubbleOutline />,
            },
            {
              name: "my-profile",
              options: { label: "My Profile " },
              list: MyProfile,
              icon: <AccountCircleOutlined />
            },
          ]}
          Title={Title}
          Sider={Sider}
          Layout={Layout}
          Header={Header}
          routerProvider={routerProvider}
          authProvider={authProvider}
          LoginPage={Login}    // Página de login
          DashboardPage={Home} // Página de inicio
        />
      </RefineSnackbarProvider>
    </ColorModeContextProvider>
  );
}

export default App;

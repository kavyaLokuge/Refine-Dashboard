import { useEffect, useRef } from "react";
import { useLogin } from "@pankod/refine-core";
import { Container, Box } from "@pankod/refine-mui";

import { yariga } from '../assets';

import { CredentialResponse } from "../interfaces/google";

export const Login: React.FC = () => {

  const { mutate: login } = useLogin<CredentialResponse>(); // useLogin carga la función login del authprovider

  const GoogleButton = (): JSX.Element => {

    const divRef = useRef<HTMLDivElement>(null); // Referencia a un div donde se renderizará el boton

    useEffect(() => {
      if (typeof window === "undefined" || !window.google || !divRef.current) { // Se verifica si el navegador esta abierto  y tiene cargada 
        return;                                                                 // la prop de identidad de google y si se tiene la ref al div creada 
      }

      // Aqui se intenta 1º inicializar la API de identidad de Google y 2º renderizar un botón de inicio de sesión de Google.
      try {
        window.google.accounts.id.initialize({ 
          ux_mode: "popup",                                   // modo "popup" es para mostrar un cuadro de dialogo que aparece mientras se carga la página.
          client_id: process.env.REACT_APP_GOOGLE_CLIENT_ID,  // Se especifica el ID de cliente de Google de las .env para inicializar la aplicación web
          callback: async (res: CredentialResponse) => {      // 4º Se proporciona un callback que se llama cuando se obtiene una credencial de google   
            if (res.credential) {                             // Si res.credential esta definido (autentificación correcta) 
              login(res);                                     // se llama a la función login(res) con dicha credencial y se inicia sesión en la aplicación 
            }
          },
        });
        window.google.accounts.id.renderButton(divRef.current, { // renderButton renderiza el boton de inicio de sesión en el div referenciado
          theme: "filled_blue",                                  // 3º Cuando el usuario hace click en el boton la api de identidad de google 
          size: "medium",                                        // devuelve una credencial de respuesta 
          type: "standard",
        });
      } catch (error) {
        console.log(error);
      }
    }, []); // you can also add your client id as dependency here

    return <div ref={divRef} />;
  };

  return (
    <Box
      component="div"
      sx={{
        backgroundColor: '#FCFCFC'
      }}
    >
      <Container
        component="main"
        maxWidth="xs"
        sx={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          height: "100vh",
        }}
      >
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <div>
            <img src={ yariga } alt="Yariga Logo" />
          </div>
          <Box mt={4}>
            <GoogleButton />
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

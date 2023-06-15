import { useState } from "react";
import { useGetIdentity } from "@pankod/refine-core";
import { FieldValues, useForm } from "@pankod/refine-react-hook-form";

import Form from "components/common/Form";
import { useNavigate } from "@pankod/refine-react-router-v6";

const CreateProperty = () => {

  const navigate = useNavigate()
  const { data: user } = useGetIdentity();
  const [propertyImage, setPropertyImage] = useState({ name: "", url: "" });
  const { refineCore: { onFinish, formLoading }, register, handleSubmit } = useForm();

  const handleImageChange = (file: File) => {
    const reader = (readFile: File) =>           // Se define una función reader que toma el 'File' que devuelve una promise
      new Promise<string>((resolve, reject) => { // Esta promise se resuelve usando la api 'FileReader' que lee el contenido del file
        const fileReader = new FileReader();     // y lo convierte a una URL de Datos
        fileReader.onload = () => resolve(fileReader.result as string);
        fileReader.readAsDataURL(readFile);      
      });                                         

    reader(file).then((result: string) =>                  // Estos datos actualizan el estado del objeto 'propertyImage' que servirá 
      setPropertyImage({ name: file?.name, url: result }), // para su uso en diferentes páginas.
    );
  };

  const onFinishHandler = async (data: FieldValues) => {            // Recibe los valores del formulario
    if (!propertyImage.name) return alert("Please select an image");// Comprueba que hay imagen

    await onFinish({                                                // Cuando tiene valores e imagen
      ...data,                                                      // añade al objeto el email del usuario logeado
      photo: propertyImage.url,                                     // y se envía através del useForm al controller del server
      email: user.email,                                            // createProperty donde se graba en base de datos.
    });
  };
  
  return (
    <Form
      type="Create"
      register={register}
      onFinish={onFinish}
      formLoading={formLoading}
      handleSubmit={handleSubmit}
      handleImageChange={handleImageChange}
      onFinishHandler={onFinishHandler}
      propertyImage={propertyImage}
    />
    
  )
}

export default CreateProperty
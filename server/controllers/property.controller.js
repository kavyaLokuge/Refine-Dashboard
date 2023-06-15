import Property from "../mongodb/models/property.js";
import User from "../mongodb/models/user.js";

import mongoose from "mongoose";
import * as dotenv from "dotenv";
import { v2 as cloudinary } from "cloudinary";

dotenv.config();

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET

})

const getAllProperties = async (req, res) => {
    const {
        _end,
        _order,
        _start,
        _sort,
        title_like = "",
        propertyType = "",
    } = req.query;             

    const query = {};           // Construimos un query para la bd con esos parámetros para restringir la respuesta.

    if (propertyType !== "") {
        query.propertyType = propertyType;  // Tipo de propiedad a mostrar
    }

    if (title_like) {
        query.title = { $regex: title_like, $options: "i" }; // Título a mostrar
    }

    try {
        const count = await Property.countDocuments({ query });   // nº de propiedades según tipo y título (query)

        const properties = await Property.find(query)             // Buscamos las propiedades según query ( tipo y título )
            .limit(_end)                                          // expecificamos donde termina la busqueda
            .skip(_start)                                         // y donde empieza
            .sort({ [_sort]: _order });                           // y decimos también el ordenamiento (asc o desc) de lo que se encuentre.

        res.header("x-total-count", count);                            // header de la respuesta con el count
        res.header("Access-Control-Expose-Headers", "x-total-count");  // header con el nombre del header que puede ser expuesto al client

        res.status(200).json(properties);                         // Respuesta final según restricciones
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getPropertyDetail = async (req, res) => {
    const { id } = req.params;
    const propertyExists = await Property.findOne({ _id: id }).populate(
        "creator",
    );

    if (propertyExists) {
        res.status(200).json(propertyExists);
    } else {
        res.status(404).json({ message: "Property not found" });
    }
};

const createProperty = async (req, res) => {
    try {
        const { // Todos los parámetros llegán al server mediante el hook useForm que añade al body la info del form
            title,
            description,
            propertyType,
            location,
            price,
            photo,
            email,
        } = req.body;

        const session = await mongoose.startSession(); // Una transacción de sesión es una forma de agrupar operaciones en una sola 
        session.startTransaction();                    // transacción que se pueden confirmar o anular en conjunto.

        const user = await User.findOne({ email }).session(session); // Se identifica el usuario que crea la propiedad

        if (!user) throw new Error("User not found");                // Si no existe mensaje de error   

        const photoUrl = await cloudinary.uploader.upload(photo);    // Se sube la imagen

        const newProperty = await Property.create({ // Creamos dentro del modelo Property la nueva propiedad con los datos del form
            title,
            description,
            propertyType,
            location,
            price,
            photo: photoUrl.url,
            creator: user._id,
        });

        user.allProperties.push(newProperty._id); // Se asigna la nueva propiedad al usuario que la crea
        await user.save({ session });             // Se guardan los datos del usuario en bd

        await session.commitTransaction();        // Se confirma la transacción  

        res.status(200).json({ message: "Property created successfully" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const updateProperty = async (req, res) => {
    try {
        const { id } = req.params;
        const { title, description, propertyType, location, price, photo } = req.body;

        const photoUrl = await cloudinary.uploader.upload(photo);

        await Property.findByIdAndUpdate(
            { _id: id },
            {
                title,
                description,
                propertyType,
                location,
                price,
                photo: photoUrl.url || photo,
            },
        );

        res.status(200).json({ message: "Property updated successfully" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const deleteProperty = async (req, res) => {
    try {
        const { id } = req.params;

        const propertyToDelete = await Property.findById({ _id: id }).populate(
            "creator",
        );

        if (!propertyToDelete) throw new Error("Property not found");

        const session = await mongoose.startSession();
        session.startTransaction();

        propertyToDelete.remove({ session });                          // Borramos la propiedad de la bd
        propertyToDelete.creator.allProperties.pull(propertyToDelete); // Actualiza el registro de allProperties del usuario

        await propertyToDelete.creator.save({ session });
        await session.commitTransaction();

        res.status(200).json({ message: "Property deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export{
    getAllProperties,
    getPropertyDetail,
    createProperty,
    updateProperty,
    deleteProperty
}

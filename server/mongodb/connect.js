import mongoose from "mongoose";


const connectDB = (url) => {
    mongoose.set('strictQuery', true)
    mongoose
        .connect(url)
        .then(() => console.log('Conectado a MongoDB'))
        .catch((err) => console.log('Error al conectar ao MongoDB:'+ err))

}

export default connectDB;
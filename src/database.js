import mongoose from "mongoose";

mongoose
  .connect(
    "mongodb+srv://jasmin09:Jas21@cluster0.jkbawur.mongodb.net/ecommerce?retryWrites=true&w=majority&appName=Cluster0"
  )
  .then(() => {
    console.log("Conexión exitosa a MongoDB");
  })
  .catch((error) => {
    console.error("Error al conectar con MongoDB:", error);
  });

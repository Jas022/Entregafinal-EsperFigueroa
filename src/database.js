import mongoose from "mongoose";

mongoose
  .connect(
    "mongodb+srv://jasmin09:Jas21@cluster0.jkbawur.mongodb.net/ecommere?retryWrites=true&w=majority&appName=Cluster0"
  )
  .then(() => console.log("conexion exitosa"))
  .catch((error) => console.log("hay un error", error));

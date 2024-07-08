import express from "express";
import { engine } from "express-handlebars";
import http from "http";
import { Server } from "socket.io";
import productsRouter from "./src/routers/productsRouter.js";
import cartsRouter from "./src/routers/cartsRouter.js";
import viewsRouter from "./src/routers/views.router.js";

const app = express();
const PUERTO = 8080;

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static("./public"));

app.engine("handlebars", engine());
app.set("view engine", "handlebars");
app.set("views", "./views");

const httpServer = http.createServer(app);

app.use("/api/products", productsRouter);
app.use("/api/carts", cartsRouter);
app.use("/", viewsRouter);

httpServer.listen(PUERTO, () => {
  console.log(`Servidor escuchando en el puerto ${PUERTO}`);
});

import ProductManager from "./src/productManager.js";
const productManager = new ProductManager("./data/product.json");
const io = new Server(httpServer);

io.on("connection", async (socket) => {
  console.log("Un cliente se conectó");

  socket.emit("productos", await productManager.getProducts());

  socket.on("eliminarProducto", async (id) => {
    await productManager.deleteProduct(id);

    io.sockets.emit("productos", await productManager.getProducts());
  });

  socket.on("agregarProducto", async (producto) => {
    await productManager.addProduct(producto);

    io.sockets.emit("productos", await productManager.getProducts());
  });
});

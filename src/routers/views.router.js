import express from "express";
const router = express.Router();
import ProductManager from "../dao/db/product-manager-db.js";
import CartManager from "../dao/db/cart-manager-db.js";

const productManager = new ProductManager();
const cartManager = new CartManager();

router.get("/", async (req, res) => {
  try {
    const productos = await productManager.getProducts();
    res.render("home", { productos });
  } catch (error) {
    console.error("Error al obtener productos", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

router.get("/products", async (req, res) => {
  try {
    const { limit = 10, page = 1, sort, query } = req.query;

    const parsedQuery = query ? JSON.parse(query) : {};

    const products = await productManager.getProducts({
      limit,
      page,
      sort,
      query: parsedQuery,
    });

    res.render("home", {
      products: products.docs,
      pagination: {
        totalPages: products.totalPages,
        prevPage: products.prevPage,
        nextPage: products.nextPage,
        page: products.page,
        hasPrevPage: products.hasPrevPage,
        hasNextPage: products.hasNextPage,
        limit: limit,
        sort: sort,
        query: JSON.stringify(parsedQuery),
      },
    });
  } catch (error) {
    console.log("Error al obtener los productos", error);
    res.status(500).send("Error interno del servidor");
  }
});

router.get("/products/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const product = await productManager.getProductById(id);

    if (!product) {
      return res.status(404).send("Producto no encontrado");
    }

    res.render("productDetail", { product });
  } catch (error) {
    console.log("Error al obtener el producto por id", error);
    res.status(500).send("Error interno del servidor");
  }
});

router.get("/carts/:cid", async (req, res) => {
  const cartId = req.params.cid;

  try {
    const carrito = await cartManager.getCarritoById(cartId);

    if (!carrito) {
      console.log("No existe ese carrito con el id");
      return res.status(404).json({ error: "Carrito no encontrado" });
    }

    const productosEnCarrito = carrito.products.map((item) => ({
      product: item.product.toObject(),
      quantity: item.quantity,
    }));

    res.render("carts", { productos: productosEnCarrito });
  } catch (error) {
    console.error("Error al obtener el carrito", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

export default router;

import express from "express";
import CartManager from "../dao/db/cart-manager-db.js";
import ProductModel from "../dao/models/product.model.js";
import CartModel from "../dao/models/cart.model.js";

const router = express.Router();
const cartManager = new CartManager();

// Ruta para actualizar el carrito
router.put("/:cid", async (req, res) => {
  const cartId = req.params.cid;
  const products = req.body.products;

  if (!Array.isArray(products)) {
    return res
      .status(400)
      .json({ error: "El formato de los productos es incorrecto." });
  }

  try {
    const carritoActualizado = await CartModel.findByIdAndUpdate(
      cartId,
      { products },
      { new: true }
    ).populate("products.product", "_id title price");

    if (!carritoActualizado) {
      return res.status(404).json({ error: "Carrito no encontrado" });
    }

    res.json(carritoActualizado);
  } catch (error) {
    console.error("Error al actualizar el carrito", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

router.post("/", async (req, res) => {
  try {
    const nuevoCarrito = await cartManager.crearCarrito();
    res.json(nuevoCarrito);
  } catch (error) {
    console.error("Error al crear un nuevo carrito", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

router.get("/:cid", async (req, res) => {
  const cartId = req.params.cid;

  try {
    const carrito = await CartModel.findById(cartId).populate(
      "products.product",
      "_id title price"
    );

    if (!carrito) {
      return res.status(404).json({ error: "Carrito no encontrado" });
    }

    return res.json(carrito.products);
  } catch (error) {
    console.error("Error al obtener el carrito", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

router.post("/:cid/product/:pid", async (req, res) => {
  const cartId = req.params.cid;
  const productId = req.params.pid;
  const quantity = req.body.quantity || 1;

  try {
    const carritoActualizado = await cartManager.agregarProductoAlCarrito(
      cartId,
      productId,
      quantity
    );
    res.json(carritoActualizado.products);
  } catch (error) {
    console.error("Error al agregar producto al carrito", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

router.get("/", async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const sort =
      req.query.sort === "asc" ? 1 : req.query.sort === "desc" ? -1 : null;
    const query = req.query.query || {};

    const queryFilters = {};
    if (query.category) {
      queryFilters.category = query.category;
    }
    if (query.available) {
      queryFilters.available = query.available === "true";
    }

    const skip = (page - 1) * limit;
    const totalProducts = await ProductModel.countDocuments(queryFilters);

    const products = await ProductModel.find(queryFilters)
      .skip(skip)
      .limit(limit)
      .sort(sort ? { price: sort } : {})
      .exec();

    const totalPages = Math.ceil(totalProducts / limit);

    const hasPrevPage = page > 1;
    const hasNextPage = page < totalPages;
    const prevPage = hasPrevPage ? page - 1 : null;
    const nextPage = hasNextPage ? page + 1 : null;

    const response = {
      status: "success",
      payload: products,
      totalPages,
      prevPage,
      nextPage,
      page,
      hasPrevPage,
      hasNextPage,
      prevLink: hasPrevPage
        ? `/api/products?page=${prevPage}&limit=${limit}&sort=${req.query.sort}`
        : null,
      nextLink: hasNextPage
        ? `/api/products?page=${nextPage}&limit=${limit}&sort=${req.query.sort}`
        : null,
    };

    res.json(response);
  } catch (error) {
    console.error("Error al obtener los productos", error);
    res
      .status(500)
      .json({ status: "error", error: "Error interno del servidor" });
  }
});

router.delete("/:cid/product/:pid", async (req, res) => {
  const cartId = req.params.cid;
  const productId = req.params.pid;

  try {
    const carritoActualizado = await cartManager.eliminarProductoDelCarrito(
      cartId,
      productId
    );
    res.json({
      message: "Producto eliminado del carrito",
      carrito: carritoActualizado,
    });
  } catch (error) {
    console.error("Error al eliminar producto del carrito", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

// Ruta para eliminar todos los productos del carrito
router.delete("/:cid", async (req, res) => {
  const cartId = req.params.cid;

  try {
    const carritoActualizado =
      await cartManager.eliminarTodosLosProductosDelCarrito(cartId);

    if (!carritoActualizado) {
      return res.status(404).json({ error: "Carrito no encontrado" });
    }

    res.json({
      message: "Todos los productos han sido eliminados del carrito",
      carrito: carritoActualizado,
    });
  } catch (error) {
    console.error("Error al eliminar todos los productos del carrito", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

export default router;

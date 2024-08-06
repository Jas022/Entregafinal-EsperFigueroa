import mongoose from "mongoose";
import CartModel from "../models/cart.model.js";

class CartManager {
  async crearCarrito() {
    try {
      const newCart = new CartModel({ products: [] });
      await newCart.save();
      return newCart;
    } catch (error) {
      console.error("Error al crear un nuevo carrito", error);
      throw error;
    }
  }
  async agregarProductoAlCarrito(cartId, productId, quantity) {
    try {
      if (
        !mongoose.Types.ObjectId.isValid(cartId) ||
        !mongoose.Types.ObjectId.isValid(productId)
      ) {
        throw new Error("Invalid cart or product ID");
      }

      const cart = await CartModel.findById(cartId);
      if (!cart) {
        throw new Error("Cart not found");
      }

      if (!cart.products) {
        cart.products = [];
      }

      const productIndex = cart.products.findIndex(
        (p) => p.product.toString() === productId
      );

      if (productIndex >= 0) {
        cart.products[productIndex].quantity += quantity;
      } else {
        cart.products.push({ product: productId, quantity });
      }

      await cart.save();
      return cart;
    } catch (error) {
      throw new Error(`Error al agregar producto al carrito: ${error.message}`);
    }
  }

  async obtenerTodosLosCarritos() {
    try {
      const carritos = await CartModel.find();
      return carritos;
    } catch (error) {
      throw new Error(`Error al obtener todos los carritos: ${error.message}`);
    }
  }

  async getCarritoById(cartId) {
    try {
      if (!mongoose.Types.ObjectId.isValid(cartId)) {
        throw new Error("Invalid cart ID");
      }

      const carrito = await CartModel.findById(cartId).populate(
        "products.product"
      );
      return carrito;
    } catch (error) {
      throw new Error(`Error al obtener el carrito: ${error.message}`);
    }
  }

  async eliminarCarrito(cartId) {
    try {
      if (!mongoose.Types.ObjectId.isValid(cartId)) {
        throw new Error("Invalid cart ID");
      }

      const resultado = await CartModel.findByIdAndDelete(cartId);
      if (!resultado) {
        throw new Error("Cart not found");
      }

      return resultado;
    } catch (error) {
      throw new Error(`Error al eliminar el carrito: ${error.message}`);
    }
  }
  async eliminarProductoDelCarrito(cartId, productId) {
    try {
      if (
        !mongoose.Types.ObjectId.isValid(cartId) ||
        !mongoose.Types.ObjectId.isValid(productId)
      ) {
        throw new Error("Invalid cart or product ID");
      }

      const carrito = await CartModel.findByIdAndUpdate(
        cartId,
        { $pull: { products: { product: productId } } },
        { new: true } // Devuelve el documento actualizado
      ).populate("products.product", "_id title price");

      if (!carrito) {
        throw new Error("Carrito no encontrado");
      }

      return carrito;
    } catch (error) {
      throw new Error(
        `Error al eliminar producto del carrito: ${error.message}`
      );
    }
  }
  async eliminarTodosLosProductosDelCarrito(cartId) {
    try {
      if (!mongoose.Types.ObjectId.isValid(cartId)) {
        throw new Error("Invalid cart ID");
      }

      const carrito = await CartModel.findByIdAndUpdate(
        cartId,
        { $set: { products: [] } },
        { new: true }
      ).populate("products.product", "_id title price");

      if (!carrito) {
        throw new Error("Carrito no encontrado");
      }

      return carrito;
    } catch (error) {
      throw new Error(
        `Error al eliminar todos los productos del carrito: ${error.message}`
      );
    }
  }
  async updateCart(cartId, newProducts) {
    try {
      if (!mongoose.Types.ObjectId.isValid(cartId)) {
        throw new Error("Invalid cart ID");
      }

      if (!Array.isArray(newProducts)) {
        throw new Error("Products must be an array");
      }

      const carrito = await CartModel.findById(cartId);
      if (!carrito) {
        throw new Error("Carrito no encontrado");
      }

      const existingProductsMap = new Map();
      carrito.products.forEach((product) => {
        existingProductsMap.set(product.product.toString(), product.quantity);
      });

      newProducts.forEach((newProduct) => {
        if (existingProductsMap.has(newProduct.product)) {
          existingProductsMap.set(
            newProduct.product,
            existingProductsMap.get(newProduct.product) + newProduct.quantity
          );
        } else {
          existingProductsMap.set(newProduct.product, newProduct.quantity);
        }
      });

      const updatedProducts = Array.from(
        existingProductsMap,
        ([product, quantity]) => ({
          product,
          quantity,
        })
      );

      carrito.products = updatedProducts;
      await carrito.save();

      const carritoActualizado = await CartModel.findById(cartId).populate(
        "products.product",
        "_id title price"
      );

      return carritoActualizado;
    } catch (error) {
      throw new Error(`Error al actualizar el carrito: ${error.message}`);
    }
  }
  async updateProductQuantity(cartId, productId, quantity) {
    try {
      console.log(
        `Update Request - Cart ID: ${cartId}, Product ID: ${productId}, Quantity: ${quantity}`
      );

      if (
        !mongoose.Types.ObjectId.isValid(cartId) ||
        !mongoose.Types.ObjectId.isValid(productId)
      ) {
        throw new Error("Invalid cart or product ID");
      }

      if (quantity <= 0) {
        throw new Error("Quantity must be greater than 0");
      }

      const cart = await CartModel.findById(cartId);
      if (!cart) {
        console.log("Cart not found");
        throw new Error("Cart not found");
      }

      const productIndex = cart.products.findIndex(
        (p) => p.product.toString() === productId
      );

      if (productIndex === -1) {
        console.log("Product not found in cart");
        throw new Error("Product not found in cart");
      }

      cart.products[productIndex].quantity = quantity;

      const updatedCart = await cart.save();
      console.log("Cart updated successfully:", updatedCart);

      return await CartModel.findById(cartId).populate(
        "products.product",
        "_id title price"
      );
    } catch (error) {
      console.error("Error updating product quantity in cart:", error);
      throw new Error("Error updating product quantity in cart");
    }
  }
}

export default CartManager;

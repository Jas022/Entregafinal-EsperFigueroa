import ProductModel from "../models/product.model.js";

class ProductManager {
  async addProduct({
    title,
    description,
    price,
    img,
    code,
    stock,
    category,
    thumbnails,
  }) {
    try {
      if (!title || !description || !price || !code || !stock || !category) {
        console.log("Todos los campos son obligatorios");
        return;
      }

      const existeProducto = await ProductModel.findOne({ code: code });

      if (existeProducto) {
        console.log("El código debe ser único, malditooo!!!");
        return;
      }

      const newProduct = new ProductModel({
        title,
        description,
        price,
        img,
        code,
        stock,
        category,
        status: true,
        thumbnails: thumbnails || [],
      });

      await newProduct.save();
    } catch (error) {
      console.log("Error al agregar producto", error);
      throw error;
    }
  }

  async getProducts({ limit = 10, page = 1, sort, query } = {}) {
    try {
      const skip = (page - 1) * limit;

      const filter =
        typeof query === "string" ? JSON.parse(query) : query || {};

      console.log("Filter:", filter);

      const sortOptions = {};
      if (sort) {
        sortOptions.price = sort === "asc" ? 1 : -1;
      }

      const productos = await ProductModel.find(filter)
        .sort(sortOptions)
        .skip(skip)
        .limit(limit);

      const totalProducts = await ProductModel.countDocuments(filter);

      const totalPages = Math.ceil(totalProducts / limit);
      const hasPrevPage = page > 1;
      const hasNextPage = page < totalPages;

      return {
        docs: productos,
        totalPages,
        prevPage: hasPrevPage ? page - 1 : null,
        nextPage: hasNextPage ? page + 1 : null,
        page,
        hasPrevPage,
        hasNextPage,
        prevLink: hasPrevPage
          ? `/api/products?limit=${limit}&page=${
              page - 1
            }&sort=${sort}&query=${encodeURIComponent(JSON.stringify(filter))}`
          : null,
        nextLink: hasNextPage
          ? `/api/products?limit=${limit}&page=${
              page + 1
            }&sort=${sort}&query=${encodeURIComponent(JSON.stringify(filter))}`
          : null,
      };
    } catch (error) {
      console.log("Error al obtener los productos", error);
      throw error;
    }
  }

  async getProductById(id) {
    try {
      const producto = await ProductModel.findById(id);

      if (!producto) {
        console.log("Producto no encontrado");
        return null;
      }

      console.log("Producto encontrado");
      return producto;
    } catch (error) {
      console.log("Error al traer un producto por id");
    }
  }
  async getProductsByCategory(category) {
    try {
      const products = await ProductModel.find({ category: category });
      return products;
    } catch (error) {
      console.error("Error fetching products by category:", error);
      throw error;
    }
  }
  async updateProduct(id, productoActualizado) {
    try {
      const updateado = await ProductModel.findByIdAndUpdate(
        id,
        productoActualizado,
        { new: true }
      );

      if (!updateado) {
        console.log("No se encuentra che el producto");
        return null;
      }

      console.log("Producto actualizado con exito");
      return updateado;
    } catch (error) {
      console.log("Error al actualizar el producto", error);
    }
  }

  async deleteProduct(id) {
    try {
      const deleteado = await ProductModel.findByIdAndDelete(id);

      if (!deleteado) {
        console.log("No se encuentraaaa, busca bien!");
        return null;
      }

      console.log("Producto eliminado correctamente");
    } catch (error) {
      console.log("Error al eliminar el producto", error);
      throw error;
    }
  }
  
}

export default ProductManager;

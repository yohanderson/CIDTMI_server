const {getWsClient, pool} = require("../systems/controllers");

//crear produtos
  const createdProduct = async (req, res) => {
    const {name, description, price_unit, price_wholesale, price_cost, promotion, 
      discount, offer, quantity, supplier, brand, id_category_product, 
       time_acquisition, iva, mdcp, route } = req.body;  
    try { 
  
      // Convertir coloresConFotos a una cadena JSON
      const mdcpJson = JSON.stringify(mdcp);
  
      const query = 'INSERT INTO product (name, description, price_unit, price_wholesale, price_cost, promotion, discount, offer, quantity, supplier, brand, id_category_product, time_acquisition, iva, mdcp, route) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16) RETURNING product_id';
      await pool.query( query, [ name, description, price_unit, price_wholesale, price_cost, promotion, discount, offer, quantity, supplier, brand, id_category_product, time_acquisition, iva, mdcpJson, route]);  
  
  
      res.status(200).send('Productos creado con exito');
  
      if (getWsClient()) {
        getWsClient().send('update Products');
      }
      
    } catch (error) {
      console.error('Error al crear producto:', error);
      res.status(500).send('Error al procesar la solicitud');
    }
  };
  
// obtener todos los productos
const getAllProducts = async (req, res) => {
  
  try {
      const query = 'SELECT * FROM product';
      const result = await pool.query(query);
      const products = result.rows;

      // Enviar la respuesta JSON con las citas
      res.status(200).json(products);
  } catch (error) {
      console.error('Error fetching products:', error);
      res.status(500).json({ error: 'Error fetching products' });
  }
};

// eliminar producto
const deleteProduct = async (req, res) => {
  try {
    const {product_id} = req.body;   

    // Realiza la eliminación en la base de datos
    await pool.query('DELETE FROM product WHERE product_id = $1', [product_id]);

    res.status(200).json({ message: 'producto eliminado correctamente' });
    console.log('eliminada con exito')

    if (getWsClient()) {
      getWsClient().send('update Products');
    }

  } catch (error) {
    console.error('Error al eliminar producto:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

// editar producto
const updateProduct = async (req, res) => {
  try {
    const {product_id, name, description, price_unit, price_wholesale, price_cost, promotion, 
      discount, offer, quantity, supplier, brand, iva, mdcp } = req.body;  
    
    // Convertir coloresConFotos a una cadena JSON
    const mdcpJson = JSON.stringify(mdcp);
    
    // Realiza la actualización en la base de datos
    const query = 'UPDATE product SET name = $2, description = $3, price_unit = $4, price_wholesale = $5, price_cost = $6, promotion = $7, discount = $8, offer = $9, quantity = $10, supplier = $11, brand = $12, iva = $13, mdcp = $14 WHERE product_id = $1';
await pool.query(query, [product_id, name, description, price_unit, price_wholesale, price_cost, promotion, discount, offer, quantity, supplier, brand, iva, mdcpJson]);

    res.status(200).json({ message: 'Estado actualizado correctamente' });

    if (getWsClient()) {
      getWsClient().send('update Products');
    }

  } catch (error) {
    console.error('Error al actualizar el producto:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

// crear categoria
const createdCategory = async (req, res) => {
  const {category, id_padre} = req.body;

  try { 
    await pool.query('INSERT INTO category (name, id_padre) VALUES ($1, $2)', [category, id_padre]);
    
    res.status(200).send('categoria creado con exito');

    if (getWsClient()) {
      getWsClient().send('update categories');
    }
    
  } catch (error) {
    console.error('Error al crear categoria:', error);
    res.status(500).send('Error al procesar la solicitud');
  }
};

// obtener categoria
const getAllCategories = async (req, res) => {
  
  try {
      const query = 'SELECT * FROM category';
      const result = await pool.query(query);
      const products = result.rows;

      // Enviar la respuesta JSON con las citas
      res.status(200).json(products);
  } catch (error) {
      console.error('Error fetching categoris:', error);
      res.status(500).json({ error: 'Error fetching products' });
  }
};

// eliminar categoria
const deleteCategory = async (req, res) => {
  const { id_category } = req.body; // El ID de la categoría a eliminar

  try {
    await pool.query('BEGIN');

    // Encuentra todos los productos que están asignados a esta categoría
    const { rows: products } = await pool.query('SELECT product_id FROM product WHERE id_category_product = $1', [id_category]);

    // Elimina esos productos o reasigna a una categoría diferente
    for (let product of products) {
      await pool.query('DELETE FROM product WHERE product_id = $1', [product.product_id]);
    }

    const deleteSubCategories = async id => {
      const { rows: subCategories } = await pool.query('SELECT id_category FROM category WHERE id_padre = $1', [id_category]);
      for (let subCategory of subCategories) {
        await deleteSubCategories(subCategory.id);
      }
      await pool.query('DELETE FROM category WHERE id_category = $1', [id_category]);
    };

    await deleteSubCategories(id_category);

    await pool.query('COMMIT');

    res.status(200).send('Categoría y subcategorías eliminadas con éxito');
    
    if (getWsClient()) {
      getWsClient().send('update categories');
    }

  } catch (error) {
    await pool.query('ROLLBACK');
    console.error('Error al eliminar categoría:', error);
    res.status(500).send('Error al procesar la solicitud');
  }
};



// crear marcas
const createdBrand = async (req, res) => {
  const { brand } = req.body;

  try { 
    await pool.query('INSERT INTO brand (name) VALUES ($1)', [brand]);

    
    res.status(200).send('marca creado con exito');

    if (getWsClient()) {
      getWsClient().send('update brands');
    }
    
  } catch (error) {
    console.error('Error al crear marca:', error);
    res.status(500).send('Error al procesar la solicitud');
  }
};

// obtener marcas
const getAllBrands = async (req, res) => {
  
  try {
      const query = 'SELECT * FROM brand';
      const result = await pool.query(query);
      const products = result.rows;

      // Enviar la respuesta JSON con las citas
      res.status(200).json(products);
  } catch (error) {
      console.error('Error fetching brands:', error);
      res.status(500).json({ error: 'Error fetching products' });
  }
};

// obtener marcas
const deleteBrand = async (req, res) => {
  const { id_brand } = req.body; // El ID de la categoría a eliminar

  try {

    await pool.query('DELETE FROM brand WHERE id_brand = $1', [id_brand]);


    res.status(200).send('marca eliminada con éxito');
    
    if (getWsClient()) {
      getWsClient().send('update brands');
    }

  } catch (error) {
    console.error('Error al eliminar marca:', error);
    res.status(500).send('Error al procesar la solicitud');
  }
};

module.exports = {

    //shop
    getAllProducts,
    createdProduct,
    deleteProduct,
    updateProduct,
    getAllCategories,
    createdCategory,
    deleteCategory,
    getAllBrands,
    createdBrand,
    deleteBrand

}
const express = require('express');
const { Router } = require('express');
const router = Router();
const path = require('path');

     // <----login----> //

     const {

   // <---user_Accounts---> //

     loginUserAccount, loginUserAccountTokenGoogle, createdUserAccount,createdUserAccountTokenGoogle,
     getAllAccountsUserAccounts,getEmailAccount, generatePasswordCodeAccount, verifyResetCodeAccount,
     updatePasswordAccount
     

          } = require('../controllers/accounts_user/login_account');

     const {

          // <---user_Clients---> //
               
          loginUserClient, loginUserClientTokenGoogle, createdUserClient,createdUserClientTokenGoogle,
          getAllAccountsUserClients,getEmailClient, generatePasswordCodeClient, verifyResetCodeClient, 
          updatePasswordClient, verifyEmail
     
          } = require('../controllers/accounts_clients/login_client');

     // <----reserves----> //

     const {
          
     createdReserves, getAllReserves, updateStateReserves, deleteReserve, getReservesUser
     
          } = require('../controllers/reserves/reserves');

     // <----shop----> //

     const {

          // productos
     getAllProducts, createdProduct, deleteProduct, updateProduct, 
     
          // categorias
     getAllCategories, createdCategory, deleteCategory,

          // marcas
     getAllBrands, createdBrand, deleteBrand,

          } = require('../controllers/shop/shop');

     // <----orders----> //

     const {
         
     createdOrder, getAllOrders, updateStateOrder, deleteOrder, getOrdersUser

          } = require('../controllers/shop/orders');

          // <----systems----> //

     const {

               token 
          
          } = require('../controllers/systems/controllers');

//user_clients

// inicio de sesion user_clients
router.post('/login_user_client', loginUserClient);
router.post('/login_user_client_token_google', loginUserClientTokenGoogle);

// regitro de usuario user_clients
router.post('/created_user_client', createdUserClient);
router.post('/created_user_client_token_google', createdUserClientTokenGoogle);

//obtener todas las cuentas user_clients
router.get('/get_all_accounts_user_clients', getAllAccountsUserClients);

// cambio de contraseña
router.post('/get_email', getEmailClient);
router.post('/generate_password_code_client', generatePasswordCodeClient);
router.post('/verify_password_code_client', verifyResetCodeClient);
router.post('/update_password_client', updatePasswordClient);

//user_accounts

// inicio de sesion user_accounts
router.post('/login_user_account', loginUserAccount);
router.post('/login_user_account_token_google', loginUserAccountTokenGoogle);

// regitro de usuario user_accounts
router.post('/created_user_account', createdUserAccount);
router.post('/created_user_account_token_google', createdUserAccountTokenGoogle);

//obtener todas las cuentas user_accounts 
router.get('/get_all_accounts_user_accounts', getAllAccountsUserAccounts);

// cambio de contraseña
router.post('/get_email', getEmailAccount);
router.post('/generate_password_code_client', generatePasswordCodeAccount);
router.post('/verify_password_code_client', verifyResetCodeAccount);
router.post('/update_password_client', updatePasswordAccount);

// Ruta para la verificación
router.get('/verify_email', verifyEmail);

//reservas
router.post('/created_reserves', createdReserves);
router.post('/get_client_reserves_userid', getReservesUser);
router.get('/get_all_reserves', getAllReserves);
router.post('/update_state_reserve', updateStateReserves);
router.delete('/delete_reserves', deleteReserve);

//tienda 

          //productos
router.post('/created_product', createdProduct);
router.delete('/delete_product', deleteProduct,);
router.post('/update_product', updateProduct);
router.get('/get_all_products', getAllProducts);

          //categorias
router.post('/created_category', createdCategory);
router.get('/get_all_categories', getAllCategories);
router.post('/delete_category', deleteCategory );

          //marcas
router.post('/created_brand', createdBrand);
router.get('/get_all_brands', getAllBrands);
router.post('/delete_brand', deleteBrand );

//ordenes de la tienda
router.post('/created_order', createdOrder);
router.get('/get_all_orders', getAllOrders);
router.post('/update_state_order', updateStateOrder);
router.delete('/delete_order', deleteOrder);
router.post('/get_client_orders_userid', getOrdersUser);

//dispositivos conectados
router.post('/token', token);

// redirect virficacion 
router.get('/verify', (req, res) => {
     const filePath = path.join(__dirname, '../../public/verify/index.html');
     res.sendFile(filePath);
 });

router.use(express.static(path.join(__dirname, '../../public/verify')));

module.exports = router;
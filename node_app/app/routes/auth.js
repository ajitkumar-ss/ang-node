const express = require('express');
const router = express.Router();
const AuthController = require('../controllers/auth');
router.post('/sign_in',AuthController.sign_in);
router.post('/sign_up',AuthController.sign_up);
router.post('/change_status',AuthController.change_status);
router.post('/check_username',AuthController.check_username);

router.post('/changepass',AuthController.changepass);
router.post('/forgotpass',AuthController.forgotpass);

router.post('/update_role',AuthController.update_role);
router.post('/get_role',AuthController.get_role);

router.post('/update_user',AuthController.update_user);
router.post('/get_user',AuthController.get_user);




module.exports = router;
const express = require("express")
const router = express.Router()
const MainController = require('../controllers/main')

router.post('/upload_file', MainController.upload_file)
router.post('/upload_pdf', MainController.upload_pdf)
router.post('/get_data', MainController.get_data)

module.exports = router;
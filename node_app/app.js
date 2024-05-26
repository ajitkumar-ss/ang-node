const express = require('express'); // for api framework
const cors = require('cors');
const app = express();
const env = process.env
const mongoose = require('mongoose');
const dotenv = require("dotenv");
dotenv.config();
const cwd = process.cwd()
console.log(cwd)
const _ = require("lodash");
const { authentication } = require('./app/helpers/authentication');
const authRoutes = require('./app/routes/auth');
const mainRoutes = require('./app/routes/main');
const axios = require('axios');
const fileUpload = require('express-fileupload');

mongoose.set('strictQuery', true);
mongoose.connect(env.DB_URL, { useNewUrlParser: true, useUnifiedTopology: true });

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({
    extended: true, limit: '10mb'
}));

app.use(cors());
// app.use(authentication);
// app.use(checkip);



app.use(fileUpload());
app.use(express.static(cwd + '/add'));

app.use((req, res, next) => {
    if (req.method === 'OPTIONS') {
        res.header('Access-Control-Allow-Methods', 'PUT, GET, POST, PATCH, DELETE');
        return res.status(200).json({});
    }
    next();
});

app.use((req, res, next) => {
    if (req.method === 'GET') {
        return next();
    }
    res.apiResponse = async (status, message, data = null) => {
        var message = _(message);
        res.send({
            status,
            message,
            data,
        })
        return res.end()
    }
    var contype = req.headers['content-type'];
    if ((!contype || contype.indexOf('multipart/form-data') !== 0) && !req.body.params) {
        return res.apiResponse(false, "Params is required")
    }
    var params = req.body.params
    if ((typeof params).toLowerCase() !== 'object') {
        try {
            if (params != undefined) {
                params = JSON.parse(params)
            }

        } catch (e) {
            return res.apiResponse(false, "Params is not a valid JSON")
        }
        if ((typeof params).toLowerCase() !== 'object' && (typeof params).toLowerCase() !== 'undefined') {
            return res.apiResponse(false, "Params is not a valid JSON")
        }
    }
    req.bodyParams = params
    next()
})

app.get('/api', function (req, res) {
    res.apiResponse(true, "Basic auth working")
})

app.use('/api/auth', authRoutes);
app.use('/api/main', mainRoutes);


app.use((req, res, next) => {
    return res.send('404');
});

module.exports = app;

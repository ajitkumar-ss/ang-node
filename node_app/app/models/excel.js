const mongoose = require('mongoose');
var mongoosePaginate = require('mongoose-paginate-v2');
var schemaOptions = {
    toObject: {
        virtuals: true
    },
    toJSON: {
        virtuals: true
    },
    timestamps: true
};

const excelSchema = new mongoose.Schema({
    // Data1: String,
    // Data2: String,
    // Data3: String,
    file: Array,
    file_name: String,
    timestamp: String,
}, schemaOptions);
excelSchema.plugin(mongoosePaginate);
module.exports = mongoose.model('Excel', excelSchema);    
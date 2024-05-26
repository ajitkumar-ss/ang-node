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

const roleSchema = new mongoose.Schema({
    name: String,
}, schemaOptions);
roleSchema.plugin(mongoosePaginate);
module.exports = mongoose.model('Role', roleSchema);    
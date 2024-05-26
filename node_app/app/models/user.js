const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2');
const crypto = require('crypto');

const schemaOptions = {
    toObject: {
        virtuals: true,
    },
    toJSON: {
        virtuals: true,
    },
    timestamps: true,
};

const userSchema = new mongoose.Schema({
    role: String,
    username: String,
    name: String,
    email: String,
    mobile: String,
    salt: String,
    password: String,
   
    // status: {
    //     type: String,
    //     enum: ['Active', 'Inactive'],
    //     default: 'Active',
    // },
}, schemaOptions);

userSchema.plugin(mongoosePaginate);

userSchema.methods.hashPassword = function (password) {
    if (this.salt && password) {
        return crypto
            .pbkdf2Sync(password, this.salt, 10000, 64, 'sha512')
            .toString('base64');
    }
    return password;
};

userSchema.pre('save', function (next) {
    if (this.isModified('password')) {
        this.salt = crypto.randomBytes(16).toString('base64');
        this.password = this.hashPassword(this.password);
    }
    next();
});

userSchema.methods.comparePassword = function (candidatePassword) {
    if (!this.password || !this.salt) {
        return false;
    }
    const hashedCandidatePassword = this.hashPassword(candidatePassword);
    return crypto.timingSafeEqual(
        Buffer.from(this.password, 'base64'),
        Buffer.from(hashedCandidatePassword, 'base64')
    );
};

userSchema.virtual('Role_pop', {
    ref: 'Role',
    localField: 'role',
    foreignField: '_id',
    justOne: true
});

// userSchema.virtual('Access_pop', {
//     ref: 'Permission',
//     localField: 'role',
//     foreignField: 'role',
//     justOne: true
// });

// userSchema.virtual('Print_pop', {
//     ref: 'Printer',
//     localField: 'print_ID',
//     foreignField: '_id',
//     justOne: true
// });
module.exports = mongoose.model('User', userSchema);

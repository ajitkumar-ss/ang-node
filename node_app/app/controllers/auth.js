const commonHelper = require('../helpers/commonHelper');
require("dotenv").config();
const User = require("../models/user");
const Role = require("../models/role");
const jwt = require('jsonwebtoken');
const nodemail = require('../../config/nodemail');
const jwtSecret = process.env.JWT_SECRET;
const expired = process.env.JWT_TOKEN_EXPIRATION;
const crypto = require('crypto');
const FormData = require('form-data');
const fs = require('fs');
const axios = require('axios');


exports.sign_up = async (req, res, next) => {
    try {
        var requests = req.bodyParams;
        if (!requests.name || !requests.email || !requests.password || !requests.mobile) {
            return res.apiResponse(false, "Invalid Params !")
        }
        const checkUser = await User.findOne({ mobile: requests.mobile });
        if (checkUser) {
            return res.apiResponse(false, "Phone Number is already exists.");
        }

        var user = new User(requests);
        await user.save();
        return res.apiResponse(true, "User registered successfully.");
    }
    catch (error) {
        console.log("exports.sign_up -> error", error)
        return res.apiResponse(false, "Registation failed", {})
    }
}

exports.sign_in = async (req, res, next) => {
    try {
        var requests = req.bodyParams
        if (!requests.username || !requests.password) {
            return res.apiResponse(false, "Invalid Params")
        }
        if (requests.username || requests.username !== '') {
            var user_detail = await User.findOne({ username: requests.username }).populate(['Role_pop']);
        }

        if (!user_detail) {
            return res.apiResponse(false, "username does not exist")
        }
        else {
            if (user_detail.status === 'Inactive') {
                return res.apiResponse(false, "User is inactive");
            }

            if (user_detail.comparePassword(requests.password)) {
                var lastLogin = new Date();
                await User.findOneAndUpdate({ "_id": user_detail.id }, { "$set": { lastLogin: lastLogin } }, { new: true }).exec();
                const token = jwt.sign({ userId: user_detail.role }, jwtSecret, {
                    algorithm: 'HS256',
                    expiresIn: expired,
                });
                return res.apiResponse(true, "Logged In Successfully", { user_detail, token })
            }
            else {
                return res.apiResponse(false, "Invalid Password")
            }
        }
    } catch (error) {
        console.log(error);
        return res.apiResponse(false, "Login function failed")
    }
}

exports.change_status = async (req, res, next) => {
    try {
        var requests = req.bodyParams;
        if (requests.newStatus && requests.newStatus !== '') {
            const user = await User.findById(requests.id);
            if (!user) {
                return res.apiResponse(false, "User not found")
            }
            user.status = requests.newStatus;
            await user.save();
            return res.apiResponse(true, "Status changed successfully")
        }
    }
    catch (error) {
        console.log(error);
        return res.apiResponse(false, "change status function failed")
    }
}


exports.changepass = async (req, res, next) => {
    const requests = req.bodyParams;
    var user = await User.findOne({ _id: requests.userid });
    if (requests.currentPassword && requests.currentPassword != "") {
        if (user.comparePassword(requests.currentPassword)) {
            user.password = requests.newPassword
            user.save()
            return res.apiResponse(true, "Password changed successfully.")
        }
        else {
            return res.apiResponse(false, "Old Password is Invalid Password")
        }
    }
}

exports.forgotpass = async (req, res, next) => {
    var requests = req.bodyParams
    console.log(requests)
    var user = await User.findOne({ username: requests.username });

    if (!user) {
        return res.apiResponse(false, "User does not exist")
    }
    else {
        var token = crypto.randomBytes(3).toString('hex');
        var mail_data = {}
        mail_data.user_name = user.name;
        mail_data.site_name = commonHelper.siteName();
        mail_data.site_url = commonHelper.getBaseurl();
        mail_data.new_password = token;
        var content = "Hello " + user.name + ",<br/><br/>" + "Your password has been reset. Please use the password mentioned below to log in to your Hi-Tech Account.<br/><br/>" + "New Password:" + mail_data.new_password + "<br/><br/>Thank you,<br/>Hi-Tech."
        nodemail.sendMail({ 'to': user.email, 'slug': 'forgot_password', 'subject': 'Forgot Password', 'data': content });
        user.password = token;
        await user.save();
        return res.apiResponse(true, "Reset password link sent to your email", { token })
    }
}

exports.update_role = async (req, res, next) => {
    var requests = req.bodyParams
    requests = await commonHelper.trimobject(requests)
    if (requests.id) {
        const roles = await Role.findOneAndUpdate({ "_id": requests.id }, { "$set": requests }, { new: true }).exec();
        return res.apiResponse(true, "Role Updated Successfully", { roles })
    }
    else {
        var new_roles = new Role(requests);
        const savedRole = await new_roles.save()
        return res.apiResponse(true, "Role Added Successfully")
    }
}

exports.get_role = async (req, res, next) => {
    var requests = req.bodyParams;
    var page = requests.page || 1
    var per_page = requests.per_page || 10
    var pagination = requests.pagination || "false"
    const match = {}
    var sort = { createdAt: -1 }

    const options = {
        page: page,
        limit: per_page,
        sort: sort,
    };

   

    if (typeof requests.id != "undefined" && requests.id != "") {
        match['_id'] = requests.id
    }

    if (pagination == "true") {
        Role.paginate(match, options, function (err, roles) {
            return res.apiResponse(true, "Success", { roles })
        });
    }
    else {
        var roles = await Role.find(match).sort(sort);
        return res.apiResponse(true, "Success", { roles })
    }
}


exports.update_user = async (req, res, next) => {
    var requests = req.bodyParams
    console.log(requests)
    if (requests.id) {
        if (requests.role && requests.role != "") {
            var user_detail = await User.findOne({ _id: requests.id });
            var update = {}
            update.role = requests.role;
            update.username = requests.username;
            update.name = requests.name;
            update.email = requests.email;
            update.mobile = requests.mobile;
            if (requests.new_password && requests.new_password != '') {
                user_detail.password = requests.new_password;
                await user_detail.save();
                delete requests.password;
                delete requests.salt;
            }
        }
        const user = await User.findOneAndUpdate({ "_id": requests.id }, { "$set": update }, { new: true }).exec();
        return res.apiResponse(true, "User Updated Successfully", { user })
    }
    else {
        const checkUser = await User.findOne({ mobile: requests.mobile });
        if (checkUser) {
            return res.apiResponse(false, "Phone Number is already exists.");
        }
        var user = new User(requests);
        await user.save();
        // var content = `Hello ${user.name},<br/><br/>
        // Your account has been successfully created.<br/><br/>
        // Please check your <a href="http://hitech.herringinfotech.com">dashboard</a> for login.<br/><br/>
        // Thank you,<br/>
        // Hi-Tech.`;
        // nodemail.sendMail({
        //     to: user.email,
        //     subject: 'Account Created Successfully',
        //     data: content
        // });
        return res.apiResponse(true, "User create successfully.", { user });
    }
}

exports.check_username = async (req, res, next) => {
    try {
        var requests = req.bodyParams;
        console.log("requests")
        if (requests.username) {
            var checkusername = await User.findOne({
                username: requests.username,
            });
        } else {
            var checkusername = false;
        }

        if (checkusername) {
            return res.apiResponse(false, "Username already exists.");
        } else {
            return res.apiResponse(true);
        }
    } catch (error) {
        console.log("exports.HTA ref -> error", error);
        return res.apiResponse(false, "Unique check failed", {});
    }
};

exports.get_user = async (req, res, next) => {
    var requests = req.bodyParams;
    var page = requests.page || 1
    var per_page = requests.per_page || 10
    var pagination = requests.pagination || "false"
    const match = {}
    var sort = { createdAt: -1 }

    const options = {
        page: page,
        limit: per_page,
        sort: sort,
        populate: ['Role_pop']
    };

    if (typeof requests.id != "undefined" && requests.id != "") {
        match['_id'] = requests.id
    }

    if (typeof requests.role != "undefined" && requests.role != "") {
        match['role'] = requests.role
    }

    if (pagination == "true") {
        User.paginate(match, options, function (err, users) {
            return res.apiResponse(true, "Success", { users })
        });
    }
    else {
        var users = await User.find(match).sort(sort).populate(options.populate);
        return res.apiResponse(true, "Success", { users })
    }

}




















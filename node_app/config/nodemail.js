const nodemailer = require('nodemailer');
const _ = require("lodash")


exports.sendMail = async (req, res, next) => {
    console.log(process.env.APP_URL)
    try {
        var mail_content = "";
        mail_content += '<div style="width:100%;font-size:15px;font-family:Google Sans,Roboto,RobotoDraft,Helvetica,Arial,sans-serif;"><div style="max-width:600px;margin:0 auto;background: #fff;border-radius: 5px;border: 1px solid #0c753c1f;"><div style="width: 100%;background: #0c763c;height: 5px;border-top-left-radius: 5px;border-top-right-radius: 5px;"></div><div style="text-align:center;width: 100%;"><img style="height:60px" src="' + process.env.APP_URL + '/assets/images/logo.png"  /></div><div style="padding:10px">';
        mail_content += req.data;
        mail_content += '</div><div style="width: 100%;background: #0c763c;height: 5px;border-bottom-left-radius: 5px;border-bottom-right-radius: 5px;"></div></div></div>';
        nodemailer.createTestAccount((err, account) => {
            const transporter = nodemailer.createTransport({
                service: 'gmail',
                auth: {
                    user: 'ajithkumar100296@gmail.com',
                    pass: 'scfvzknsyracrvis',  
                }
            });

            // setup email data with unicode symbols
            let mailOptions = {
                from: 'ajithkumar100296@gmail.com',
                to: req.to, // list of receivers
                subject: req.subject, // Subject line
                html: mail_content // html body
            };

            // send mail with defined transport object
            transporter.sendMail(mailOptions, (error, info) => {
                console.log(error, info, mailOptions)
                if (error) {
                    return false;
                }
                else {
                    return true;
                }
            });
        });

    } catch (error) {
        console.log("exports.sendMail -> error", error)
        return true;
    }
};


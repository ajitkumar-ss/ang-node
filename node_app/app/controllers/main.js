const ExcelJS = require('exceljs');
const Excel = require('../models/excel')
const util = require('util')
const fs = require('fs');
const commonHelper = require('../helpers/commonHelper');

exports.upload_file = async (req, res, next) => {
    try {
        const requests = req.bodyParams;
        requests.timestamp = new Date()
        requests.file_name = "New_file1&2"

        if (!req.files || Object.keys(req.files).length === 0) {
            return res.status(400).send('No files were uploaded.');
        }


        const excelFiles = [req.files.file1, req.files.file2];

        for (let excelFile of excelFiles) {
            if (excelFile) {
        const workbook = new ExcelJS.Workbook();

        await workbook.xlsx.load(excelFile.data);
        const worksheet = workbook.getWorksheet(1);

        const row1 = worksheet.getRow(1);
        const headers = []

        row1.eachCell((cell, colNumber) => {
            headers.push(cell.value)
        })

        // const excel = {};

        // for (let colNum = 1; colNum <= worksheet.columnCount; colNum++) {
        //     const column = worksheet.getColumn(colNum);

        //     column.eachCell((cell, rowNum) => {
        //         const value = cell.value;

        //         if (rowNum > 1 && value !== undefined && value !== null && value !== '') {
        //             if (!excel[headers[colNum - 1]]) {
        //                 excel[headers[colNum - 1]] = [];
        //                 console.log("coming")
        //             }
        //             excel[headers[colNum - 1]].push(value);
        //         }
        //     });
        // }

        const excelArray = [];

        for (let rowNum = 2; rowNum <= worksheet.rowCount; rowNum++) {
            const rowData = {};

            let allow = false;

            for (let colNum = 1; colNum <= worksheet.columnCount; colNum++) {
                const header = headers[colNum - 1];
                const value = worksheet.getCell(rowNum, colNum).value;

                if (value !== undefined && value !== null && value !== '') {
                    rowData[header] = value;
                    allow = true;
                }
                else {
                    allow = false;
                }
            }
            if (allow) {
                excelArray.push(rowData);
            }
        }

        if (excelArray.length > 0) {
            let update = {
                file: excelArray,
                file_name: requests.file_name,
                timestamp: requests.timestamp
            };
            const save_file = new Excel(update);
            await save_file.save();
        }
    }
}

return res.apiResponse(true, "Files processed and saved successfully.", {});


    } catch (error) {
        console.error(error)
    }
}


exports.upload_pdf = async (req, res, next) => {
    var requests = req.bodyParams;
    const file = req.files.file
    const filemove = util.promisify(file.mv)
    const path  = 'add/upload/pdf/'
    const create_folter = fs.existsSync(path)
    if(!create_folter){
        fs.mkdirSync(path, {
            recursive:true
        })
    }
    const name =  file.name
   
    await filemove(path + name)
    const profile = process.env.APP_URL + path + name
    return res.apiResponse(true, "Upload success.", {profile});

}


exports.get_data = async (req, res, next) => {
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


    if (requests.search_data1 && requests.search_data1 != "") {
        match.Data1 = { $regex: new RegExp(requests.search_data1, "i") }
    }

    if (typeof requests.id != "undefined" && requests.id != "") {
        match['_id'] = requests.id
    }

    if (pagination == "true") {
        Excel.paginate(match, options, function (err, excel) {
            return res.apiResponse(true, "Success", { excel })
        });
    }
    else {
        var excel = await Excel.find(match).sort(sort);
        return res.apiResponse(true, "Success", { excel })
    }
}
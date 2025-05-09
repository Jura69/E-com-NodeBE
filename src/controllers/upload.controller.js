'use strict';

const { BadRequestError } = require("../core/error.response");
const { SuccessResponse } = require("../core/success.response");
const { uploadImageFromUrl, uploadImageFromLocal } = require("../services/upload.service");

class UploadController {
    uploadFileUrl = async(req, res, next) => {

        new SuccessResponse({
            message: "Upload file success",
            metadata: await uploadImageFromUrl()
        }).send(res); 
    }

    uploadFileLocal = async(req, res, next) => {
        const { file } = req;
        if (!file) {
            throw new BadRequestError('File missing');
        }

        new SuccessResponse({
            message: "Upload file success",
            metadata: await uploadImageFromLocal(
                file.path,
            )
        }).send(res);
    }
}

module.exports = new UploadController();
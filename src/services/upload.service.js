"use strict";

const cloudinary = require("../configs/cloudinary.config");

// 1. upload from url image
const uploadImageFromUrl = async() => {
    try {
        const urlImage = 'https://down-vn.img.susercontent.com/file/vn-11134207-7r98o-lvb7sq2fnerx53';
        const folderName = 'product/1111', newFileName = 'testdemo'

        const result = await cloudinary.uploader.upload(urlImage, {
            folder: folderName,
        })
        console.log(result);
    } catch (error) {
        console.log(error);
    }
}

// 2. upload from local file
const uploadImageFromLocal = async(
    path,
    folderName = 'product/1111',
) => {
    try {
        if (!path) {
            throw new BadRequestError('File path is required');
        }

        const result = await cloudinary.uploader.upload(path, {
            public_id: 'local',
            folder: folderName,
        })
        console.log(result);
        return {
            image_url: result.secure_url,
            shopId: 1111,
            thumb_url: await cloudinary.url(result.public_id, {
                transformation: [{
                    width: 100,
                    height: 100,
                    format: 'jpg',
                }]
            })
        }
    } catch (error) {
        console.log(error);
    }
}

module.exports = {
    uploadImageFromUrl,
    uploadImageFromLocal,
}
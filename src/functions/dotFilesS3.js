'use strict';

const s3 = require("../services/AwsS3Service");
const { handlerResponse, handlerErrResponse } = require("../utils/handleResponse");

module.exports.handler = async (event) => {
    try {
        console.log(event)
        return handlerResponse(200, event)
    } catch (err) {
        return handlerErrResponse(err)
    }
};
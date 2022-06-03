'use strict';

const { httpRequest } = require('../utils/httpRequest')
const { handlerResponse, handlerErrResponse } = require("../utils/handleResponse");

module.exports.handler = async (event) => {
  try {
    const { pathParameters } = event
    const result = await actionApi(pathParameters.action);

    return handlerResponse(200, result)
  } catch (err) {
    return handlerErrResponse(err)
  }
};

const actionApi = async (action) => {
  const url = `${process.env.URL_API}/settings/services/${action}`
  return await httpRequest(url);
}
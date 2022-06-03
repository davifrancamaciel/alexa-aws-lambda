"use strict";

const handlerResponse = (statusCode, body, message = 'Dados obtidos com sucesso') => {
    let response = {
        statusCode,
        headers: {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Credentials": true,
        }
    }

    if (body) {
        const result = { success: statusCode < 300, message, data: body }
        response['body'] = JSON.stringify(result)
    }

    return response
}

const handlerErrResponse = (err, obj) => {
    console.log('handlerErrResponse', err, obj)
    let message = err.message ? err.message : "Unknown error";
  
    const body = { error: err.name ? err.name : "Exception", err, obj }
    return handlerResponse(err.statusCode ? err.statusCode : 500, body, message)
}

module.exports = { handlerResponse, handlerErrResponse }


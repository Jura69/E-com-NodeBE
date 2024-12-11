'use strict'

const StatusCode = {
    FORBIDDENT: 403,
    CONFLICT: 409,
}

const ReasonStatusCode = {
    FORBIDDENT: 'Bad request error',
    CONFLICT: 'Conflict error',
}

class ErrorResponse extends Error {
    constructor(message, status) {
        super(message)
        this.status = status
    }
}

class ConflictRequestError extends ErrorResponse {
    constructor(message = ReasonStatusCode.CONFLICT, statusCode = StatusCode.FORBIDDENT){
        super(message, statusCode)
    }
}

class BadRequestError extends ErrorResponse {
    constructor(message = ReasonStatusCode.CONFLICT, statusCode = StatusCode.FORBIDDENT){
        super(message, statusCode)
    }
}

module.exports = {
    ConflictRequestError,
    BadRequestError
}
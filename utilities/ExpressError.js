class ExpressError extends Error {
    constructor(messageText, statusCode) {
        super();
        this.message = messageText;
        this.status = statusCode;
    }
}

module.exports = ExpressError;
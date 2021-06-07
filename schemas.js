const Joi = require('joi')

module.exports.courseSchema = Joi.object({
    course: Joi.object({
        name: Joi.string().required(),
        location: Joi.string().required(),
        image: Joi.string().allow(''), //for some reason, the empty inputs were causing an error
        price: Joi.number().allow('').min(0),
        description: Joi.string().allow(null, '')
    }).required()
})

module.exports.reviewSchema = Joi.object({
    review: Joi.object({
        rating: Joi.number().required().min(1).max(5).integer(),
        body: Joi.string().allow('').max(3000)
    }).required()
})
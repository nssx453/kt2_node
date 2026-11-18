
const Joi = require('joi')

const base = {
    name: Joi.string().min(2).max(100).required(),
    price: Joi.number().greater(0).required(),
    category: Joi.string().valid('electronics', 'clothing', 'food', 'other').required(),
    stock: Joi.number().integer().min(0).default(0),
    description: Joi.string().max(500).allow('', null)
}

const createSchema = Joi.object(base)

const patchSchema = Joi.object({
    name: base.name.optional(),
    price: base.price.optional(),
    category: base.category.optional(),
    stock: base.stock.optional(),
    description: base.description
}).min(1)

function check(schema) {
    return function (req, res, next) {
        const result = schema.validate(req.body, {
            abortEarly: false,
            stripUnknown: true
        })

        if (result.error) {
            return res.status(400).json({
                error: 'Ошибка валидации',
                details: result.error.details
            })
        }

        req.body = result.value
        next()
    }
}

module.exports = { check, createSchema, patchSchema }
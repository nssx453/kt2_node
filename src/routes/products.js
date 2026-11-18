const express = require('express')
const router = express.Router()
const { check, createSchema, patchSchema } = require('../middleware/validate')
const upload = require('../middleware/upload')

const products = []
let nextId = 1

// список с фильтрами и пагинацией
router.get('/', (req, res) => {
    let { category, minPrice, maxPrice, page = 1, limit = 10 } = req.query
    page = Math.max(1, Number(page) || 1)
    limit = Math.max(1, Number(limit) || 10)

    let list = [...products]
    if (category) list = list.filter(p => p.category === category)
    if (minPrice) list = list.filter(p => p.price >= Number(minPrice))
    if (maxPrice) list = list.filter(p => p.price <= Number(maxPrice))

    const offset = (page - 1) * limit

    res.json({
        data: list.slice(offset, offset + limit),
        total: list.length,
        page: page,
        limit: limit
    })
})

router.get('/:id', (req, res) => {
    const product = products.find(p => p.id === Number(req.params.id))
    if (!product) return res.status(404).json({ error: 'Товар не найден' })
    res.json(product)
})

router.post('/', check(createSchema), (req, res) => {
    const product = {
        id: nextId++,
        ...req.body,
        stock: req.body.stock ?? 0,
        description: req.body.description ?? '',
        imageUrl: null,
        createdAt: new Date().toISOString()
    }

    products.push(product)
    res.status(201).json(product)
})

router.put('/:id', check(createSchema), (req, res) => {
    const i = products.findIndex(p => p.id === Number(req.params.id))
    if (i === -1) return res.status(404).json({ error: 'Товар не найден' })

    products[i] = {
        ...products[i],
        ...req.body,
        stock: req.body.stock ?? 0,
        description: req.body.description ?? ''
    }

    res.json(products[i])
})

router.patch('/:id', check(patchSchema), (req, res) => {
    const product = products.find(p => p.id === Number(req.params.id))
    if (!product) return res.status(404).json({ error: 'Товар не найден' })

    Object.assign(product, req.body)
    res.json(product)
})

router.delete('/:id', (req, res) => {
    const i = products.findIndex(p => p.id === Number(req.params.id))
    if (i === -1) return res.status(404).json({ error: 'Товар не найден' })

    products.splice(i, 1)
    res.status(204).send()
})

router.post('/:id/image', upload.single('image'), (req, res) => {
    const product = products.find(p => p.id === Number(req.params.id))
    if (!product) return res.status(404).json({ error: 'Товар не найден' })
    if (!req.file) return res.status(400).json({ error: 'Нужен файл (поле image)' })

    product.imageUrl = '/uploads/products/' + req.file.filename
    res.json({ imageUrl: product.imageUrl })
})

module.exports = router
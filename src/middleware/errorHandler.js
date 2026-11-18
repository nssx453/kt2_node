function errorHandler(err, req, res, next) {
    if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ error: 'Файл больше 2 МБ' })
    }
    if (err.message && err.message.includes('JPEG')) {
        return res.status(400).json({ error: err.message })
    }

    console.error(err)
    res.status(500).json({ error: err.message || 'Ошибка сервера' })
}

module.exports = errorHandler
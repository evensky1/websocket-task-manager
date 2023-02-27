const jwt = require('jsonwebtoken')

module.exports = (req, res, next) => {

    try {
        if (req.path === '/login' || req.path === '/registration') {
            return next()
        }
        const token = req.headers.authorization.split(' ')[1]
        req.user = jwt.verify(token, process.env.SECRET_KEY)
        next()
    } catch (e) {
        return res.status(401).json({message: 'User is not authenticated'})
    }
}
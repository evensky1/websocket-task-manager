const User = require('../models/User')
const jwt = require('jsonwebtoken')

class AuthController {
    registration(req, res) {
        const {username, password} = req.body
        User.findOne({username})
            .then(u => {
                if (u) throw new Error('Such user already exists')
                return new User({username, password}).save()
            })
            .then(_ => res.status(201).json("You were successfully registered"))
            .catch(e => res.status(400).json({message: e.message}))
    }

    login(req, res) {
        console.log(req)
        console.log(req.body)
        const {username, password} = req.body
        User.findOne({username})
            .then(u => {
                if (!u) throw new Error('User wasn\'t found')
                if (u.password !== password) throw new Error('Incorrect password')

                const token = jwt.sign({id: u._id}, process.env.SECRET_KEY, {expiresIn: "1h"})
                return res.json({token})
            })
            .catch(e => res.status(400).json({message: e.message}))
    }
}

module.exports = new AuthController()
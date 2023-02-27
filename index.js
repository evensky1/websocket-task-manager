const express = require('express')
const path = require('path')
const fs = require('fs')
const bodyParser = require('body-parser')
const Task = require('./models/Task')
const authMiddleware = require('./auth/authMiddleware')
const authRouter = require('./auth/authRouter.js')

const app = express()
app.use(express.static(path.resolve(__dirname, 'static')))
app.use(bodyParser.json())
app.use('/auth', authRouter)

const server = require('http').createServer(app)
const {Server} = require('socket.io');
const mongoose = require("mongoose");
const io = new Server(server)

mongoose.connect(process.env.CONNECTION_URL).then(_ => console.log('Connection to mongoDB was successful'))

io.on('connection', socket => {
    console.log('New client was connected')
    Task.find({}, (e, tasks) => {
        if (e)
            console.log(e)
        else
            socket.emit('data', tasks)
    })

    socket.on('error', console.error)

    socket.on('message', msg => {
        io.emit('message', msg);
    })

    socket.on('newTask', task => {
        const fid = 'file-' + Date.now() + path.extname(task.fileName)
        const newTask = new Task({
            key: task.key,
            summary: task.summary,
            postDate: new Date(),
            status: 'wip',
            file: task.file,
            fileName: task.fileName,
            fid: fid,
            dueTo: task.dueTo
        })

        fs.writeFile('./uploads/' + fid, task.file, e => {
            if (e) console.log(e)
        })
        newTask.save().then(task => io.emit('newTask', task))

    })

    socket.on('changeTaskStatus', async id => {
        const res = await Task.updateOne({_id: id}, {status: 'done'})

        if (res.modifiedCount === 1)
            Task.findOne({_id: id})
                .then(t => io.emit('taskStatusUpdate', t))
    })

    socket.on('disconnect', () => {
        console.log('User disconnected')
    })
});

app.get('/attempt', authMiddleware, () => console.log('Auth attempt'))
app.get('/download', (req, res) => {
    res.status(200)
        .download(path.resolve(__dirname, 'uploads', req.query.fid))
})
app.get('/login', authMiddleware, (req, res) =>
    res.sendFile(path.resolve(__dirname, 'static', 'login.html')))
app.get('/registration', authMiddleware, (req, res) =>
    res.sendFile(path.resolve(__dirname, 'static', 'registration.html')))

server.listen(8085, () => {
    console.log('Listening on port 8085')
})
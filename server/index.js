require('dotenv').config();

const mongoose = require('mongoose')
const Document = require('./Document')


const MONGOOSE_OPTIONS = {
    useNewUrlParser: true,
    useFindAndModify: false,
    useUnifiedTopology: true
}
// mongoose.connect(process.env.MONGO_DB_URL, MONGOOSE_OPTIONS)

const io = require('socket.io')(8080, {
    cors: {
        origin: process.env.FRONTEND_URL, 
        methods: ['GET', 'POST']
    }
})

console.log(process.env.FRONTEND_URL)

io.on("connection", socket => {
    console.log('connected')

    socket.on("get-document", async (documentId) => {
        // const document = await findOrCreateDoc(documentId)
        const data = "start here"
        socket.join(documentId)

        socket.emit("load-document", data)
        // socket.emit("load-document", document.data)

        socket.on("send-changes", (delta) => {
            socket.broadcast.to(documentId).emit("receive-changes", delta)
        })

        socket.on("save-document", async (data) => {
            // await Document.findByIdAndUpdate(documentId, { data })
            console.log(data)
        })
    })

    
})

const defaultValue = ""
const findOrCreateDoc = async (id) => {
    if(id == null) return

    const document = await Document.findById(id)
    if(document) return document

    return await Document.create(({ _id: id, data: defaultValue }))
}



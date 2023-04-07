const { Schema, model } = require('mongoose')


const DocumentSchema = new Schema({
    data: Object
});


module.exports = model("Document", DocumentSchema);
const mongoose = require('mongoose');

const Schema = mongoose.Schema;
const ClothingSchema = new Schema({
    user: {
        type: Schema.ObjectId,
        ref: 'User',
    },
    clothingType: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now(),
    },
    updatedAt: {
        type: Date,
        default: Date.now(),
    },
});

module.exports = mongoose.model('Clothing', ClothingSchema);

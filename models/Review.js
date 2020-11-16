const mongoose = require('mongoose');

const ReviewSchema = new mongoose.Schema({
    title: {
        type: String,
        trim: true,
        required: [true, "Please add a title for the review"],
        maxlength: 100
    },
    text: {
        type: String,
        required: [true, "Please add some text description"]
    },
    rating: {
        type: Number,
        required: [true, "Please add a rating b/w 1 and 10"],
        min: 1,
        max: 10
    },

    createdAt: {
        type: Date,
        default: Date.now
    },
    bootcamp: {
        type: mongoose.Schema.ObjectId,
        ref: 'Bootcamp',
        required: true
    },
    user: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true
    }
});
ReviewSchema.index({ bootcamp: 1, user: 1 }, { unique: true });
ReviewSchema.statics.getAverageRating = async function (bootcampId) {
    const obj = await this.aggregate([
        {
            $match: { bootcamp: bootcampId }
        },
        {
            $group: {
                _id: '$bootcamp',
                averageRating: { $avg: '$rating' }
            }
        }
    ]);
    try {
        await this.model('Bootcamp').findByIdAndUpdate(bootcampId, {
            averageRating: Math.ceil(obj[0].averageRating / 10) * 10
        })
    } catch (err) {
        console.error(err)
    }
}
// Call getavgcost after save
ReviewSchema.post("save", function () {
    this.constructor.getAverageRating(this.bootcamp);
});
// Call getavgcost before remove
ReviewSchema.pre("remove", function () {
    this.constructor.getAverageRating(this.bootcamp);
});

module.exports = mongoose.model('Review', ReviewSchema);
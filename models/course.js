const mongoose = require('mongoose');
const Review = require('./review.js')
const Schema = mongoose.Schema;

const CourseSchema = new Schema({
    name: {
        type: String,
        required: [true, 'Name is required']
        // minLength: 11
    },
    price: {
        type: Number,
        required: false
    },
    description: {
        type: String,
        required: false
    },
    location: {
        type: String,
        required: true
    },
    image: {
        type: String,
        required: false
    },
    reviews: [
        {
            type: Schema.Types.ObjectId,
            ref: "Review"
        }
    ]

})

CourseSchema.post('findOneAndDelete', async function (doc) {
    if (doc) {
        // for (let review of doc.reviews) { // this was my original solution
        //     await Review.findByIdAndDelete(review._id)
        // }

        await Review.deleteMany({
            _id : {
                $in: doc.reviews
            }
        })
    }

});

module.exports = mongoose.model('Course', CourseSchema)

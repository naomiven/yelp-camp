const mongoose = require('mongoose');
const Review = require('./review');
const Schema = mongoose.Schema;

const CampgroundSchema = new Schema({
    title: String,
    image: String,
    price: Number,
    description: String,
    location: String,
    author: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    reviews: [
        {
            type: Schema.Types.ObjectId,
            ref: 'Review'
        }
    ]
});

// Delete reviews that are associated with a campground that is being deleted

// Query middleware for findOneAndDelete
CampgroundSchema.post('findOneAndDelete', async function (doc) {
    if (doc) {
        // Delete all reviews where their ID field is in document that was deleted
        await Review.deleteMany({ _id: { $in: doc.reviews } });
    }
})

module.exports = mongoose.model('Campground', CampgroundSchema)
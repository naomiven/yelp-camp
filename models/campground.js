const mongoose = require('mongoose');
const Review = require('./review');
const Schema = mongoose.Schema;

const ImageSchema = new Schema({
    url: String,
    filename: String
})

// Add a virtual property for thumbnail version of images
// No need to store in DB because this is just derived from url we're storing
ImageSchema.virtual('thumbnail').get(function () {
    return this.url.replace('/upload', '/upload/w_200');
})

const CampgroundSchema = new Schema({
    title: String,
    images: [ImageSchema],
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
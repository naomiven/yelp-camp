const express = require('express');
const router = express.Router({ mergeParams: true });
// Need 'mergeParams' so that we have access to 'id' param from our app's
// prefix route

const { validateReview, isLoggedIn, isReviewAuthor } = require('../middleware')

const Campground = require('../models/campground');
const Review = require('../models/review');

const ExpressError = require('../utils/ExpressError');
const catchAsync = require('../utils/catchAsync');

router.post('/', isLoggedIn, validateReview, catchAsync(async (req, res) => {
    const campground = await Campground.findById(req.params.id);
    const review = new Review(req.body.review);
    review.author = req.user._id;
    // Note this fails if 'mergeParams' is not set, since 'id' param is not
    // shared from our app's prefix route
    campground.reviews.push(review);
    await review.save();
    await campground.save();
    req.flash('success', 'Review submitted!');
    res.redirect(`/campgrounds/${campground._id}`);
}))

router.delete('/:reviewId', isLoggedIn, isReviewAuthor, catchAsync(async (req, res) => {
    const { id, reviewId } = req.params;
    // Pull operator removes from an array all instances of a value(s)
    // that match a condition
    await Campground.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
    await Review.findByIdAndDelete(req.params.reviewId);
    req.flash('success', 'Review deleted!');
    res.redirect(`/campgrounds/${id}`);
}))

module.exports = router
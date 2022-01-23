const express = require('express');
const router = express.Router();

const Campground = require('../models/campground');

const catchAsync = require('../utils/catchAsync');
const { isLoggedIn, isAuthor, validateCampground } = require('../middleware');

router.get('/', catchAsync(async (req, res) => {
    const campgrounds = await Campground.find({});
    res.render('campgrounds/index', { campgrounds });
}))

// New campground - GET form
router.get('/new', isLoggedIn, (req, res) => {
    res.render('campgrounds/new');
})

// New campground - POST campground
router.post('/', isLoggedIn, validateCampground, catchAsync(async (req, res, next) => {
    // Throw error if campground (key) object is not included in form data (body)
    // Note key looks like "campground[title]", etc...
    // if (!req.body.campground) throw new ExpressError('Invalid Campground Data', 400);
    const campground = new Campground(req.body.campground);
    campground.author = req.user._id;
    await campground.save();
    req.flash('success', 'Successfully added a new campground!');
    res.redirect(`/campgrounds/${campground._id}`);
}))

// Show
router.get('/:id', catchAsync(async (req, res) => {
    // Nested populate.
    // For each campground, populate reviews, and for review, populate author,
    // Then populate author for campground
    const campground = await Campground.findById(req.params.id).populate({
        path: 'reviews',
        populate: {
            path: 'author'
        }
    }).populate('author');
    if (!campground) {
        req.flash('error', 'Cannot find that campground!'); // Test by delete and show
        return res.redirect('/campgrounds');
    }
    res.render('campgrounds/show', { campground });
}))

// Edit - GET form
router.get('/:id/edit', isLoggedIn, isAuthor, catchAsync(async (req, res) => {
    const { id } = req.params;
    const campground = await Campground.findById(id);
    if (!campground) {
        req.flash('error', 'Cannot find that campground!'); // Test by delete and show
        return res.redirect('/campgrounds');
    }
    res.render('campgrounds/edit', { campground });
}))

// Edit - PUT campground
router.put('/:id', isLoggedIn, isAuthor, validateCampground, catchAsync(async (req, res) => {
    const { id } = req.params;
    const campground = await Campground.findByIdAndUpdate(id, { ...req.body.campground });
    req.flash('success', 'Campground updated!');
    res.redirect(`/campgrounds/${campground._id}`);
}))

router.delete('/:id', isLoggedIn, isAuthor, catchAsync(async (req, res) => {
    const { id } = req.params;
    await Campground.findByIdAndDelete(id);
    req.flash('success', 'Campground deleted!');
    res.redirect('/campgrounds');
}))

module.exports = router;
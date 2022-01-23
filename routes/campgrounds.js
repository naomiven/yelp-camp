const express = require('express');
const router = express.Router();

const Campground = require('../models/campground');

const { campgroundSchema } = require('../schemas.js');

const ExpressError = require('../utils/ExpressError');
const catchAsync = require('../utils/catchAsync');
const { isLoggedIn } = require('../middleware');

const validateCampground = (req, res, next) => {
    const { error } = campgroundSchema.validate(req.body);
    if (error) {
        // Join error details into one string
        const msg = error.details.map(el => el.message).join(',');
        throw new ExpressError(msg, 400);
    } else {
        next();
    }
}

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
    await campground.save();
    req.flash('success', 'Successfully added a new campground!');
    res.redirect(`/campgrounds/${campground._id}`);
}))

// Show
router.get('/:id', catchAsync(async (req, res) => {
    const campground = await Campground.findById(req.params.id).populate('reviews');
    if (!campground) {
        req.flash('error', 'Cannot find that campground!'); // Test by delete and show
        return res.redirect('/campgrounds');
    }
    res.render('campgrounds/show', { campground });
}))

// Edit - GET form
router.get('/:id/edit', isLoggedIn, catchAsync(async (req, res) => {
    const campground = await Campground.findById(req.params.id);
    if (!campground) {
        req.flash('error', 'Cannot find that campground!'); // Test by delete and show
        return res.redirect('/campgrounds');
    }
    res.render('campgrounds/edit', { campground });
}))

// Edit - PUT campground
router.put('/:id', isLoggedIn, validateCampground, catchAsync(async (req, res) => {
    const { id } = req.params;
    const campground = await Campground.findByIdAndUpdate(id, { ...req.body.campground });
    req.flash('success', 'Campground updated!');
    res.redirect(`/campgrounds/${campground._id}`);
}))

router.delete('/:id', isLoggedIn, catchAsync(async (req, res) => {
    const { id } = req.params;
    await Campground.findByIdAndDelete(id);
    req.flash('success', 'Campground deleted!');
    res.redirect('/campgrounds');
}))

module.exports = router;
const College = require('../models/collegeCard');
const Review = require('../models/review.js');

const createReview = async (req, res) => {
    const college = await College.findById(req.params.id);
    const review = new Review(req.body.review);
    // console.log(review);
    review.author = req.user._id;
    college.reviews.push(review);
    await review.save();
    await college.save();
    req.flash('success', 'Created new review!');
    res.redirect(`/colleges/${college._id}`);
}

const deleteReview = async (req, res) => {
    const { id, reviewId } = req.params;
    await College.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
    await Review.findByIdAndDelete(reviewId);
    req.flash('success', 'Successfully deleted review');
    res.redirect(`/colleges/${id}`);
}

module.exports = {createReview, deleteReview};
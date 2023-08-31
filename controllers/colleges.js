const College = require('../models/collegeCard');
const mbxGeocoding = require("@mapbox/mapbox-sdk/services/geocoding");
const mapBoxToken = process.env.MAPBOX_TOKEN;
const geocoder = mbxGeocoding({ accessToken: mapBoxToken });
const { cloudinary } = require("../cloudinary");

const index = async (req, res) => {

    const college = await College.find({});
    console.log(college);
    res.render('colleges/index', { college });
}

const createCollege = async (req, res) => {
    const geoData = await geocoder.forwardGeocode({
        query: req.body.college.location,
        limit: 1
    }).send()
    console.log(geoData.body.features[0].geometry.coordinates);
    const college = new College(req.body.college);
    college.geometry = geoData.body.features[0].geometry;
    college.images = req.files.map(f => ({ url: f.path, filename: f.filename }));
    college.author = req.user._id;
    await college.save();
    console.log(college);
    req.flash('success', 'Successfully added a new institution!');
    res.redirect(`/colleges/${college._id}`)
}

const renderNewForm = (req, res) => {
    res.render('colleges/new');
};

const showCollege = async (req, res,) => {
    const college = await College.findById(req.params.id).populate({
        path: 'reviews',
        populate: {
            path: 'author'
        }
    }).populate('author');
    console.log(college);
    if (!college) {
        req.flash('error', 'Cannot find that college!');
        return res.redirect('/colleges');
    }
    res.render('colleges/show', { college });
};

const updateCollege = async (req, res) => {

    const { id } = req.params;
    const geoData = await geocoder.forwardGeocode({
        query: req.body.college.location,
        limit: 1
    }).send()
    const college = await College.findByIdAndUpdate(id, { ...req.body.college });
    const imgs=req.files.map(f => ({ url: f.path, filename: f.filename }));
    college.images.push(...imgs);
    college.geometry = geoData.body.features[0].geometry;
    await college.save();
    if (req.body.deleteImages) {
        for (let filename of req.body.deleteImages) {
            await cloudinary.uploader.destroy(filename);
        }
        await college.updateOne({ $pull: { images: { filename: { $in: req.body.deleteImages } } } })
    }

    req.flash('success', 'Successfully updated college!');
    res.redirect(`/colleges/${college._id}`)
};

const deleteCollege = async (req, res) => {
    const { id } = req.params;
    await College.findByIdAndDelete(id);
    req.flash('success', 'Successfully deleted college');
    res.redirect('/colleges');
};

const renderRditForm = async (req, res) => {
    const college = await College.findById(req.params.id)
    if (!college) {
        req.flash('error', 'Cannot find that college!');
        return res.redirect('/colleges');
    }
    res.render('colleges/edit', { college });
};
module.exports = {
    index,
    createCollege,
    renderNewForm,
    renderRditForm,
    deleteCollege,
    updateCollege,
    showCollege
};


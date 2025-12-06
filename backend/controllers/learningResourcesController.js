const LearningResource = require('../models/LearningResource');

// @desc    Get all learning resources
// @route   GET /api/admin/learning-resources
// @access  Private (Admin)
exports.getLearningResources = async (req, res) => {
    try {
        const { category, active } = req.query;

        const query = {};
        if (category) query.category = category;
        if (active !== undefined) query.isActive = active === 'true';

        const resources = await LearningResource.find(query)
            .sort('-createdAt')
            .populate('createdBy', 'name email');

        res.json({
            success: true,
            count: resources.length,
            resources
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Create a learning resource
// @route   POST /api/admin/learning-resources
// @access  Private (Admin)
exports.createLearningResource = async (req, res) => {
    try {
        const { title, url, description, category } = req.body;

        const resource = await LearningResource.create({
            title,
            url,
            description,
            category,
            createdBy: req.user._id
        });

        res.status(201).json({
            success: true,
            message: 'Learning resource created successfully',
            resource
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Update a learning resource
// @route   PUT /api/admin/learning-resources/:id
// @access  Private (Admin)
exports.updateLearningResource = async (req, res) => {
    try {
        const { title, url, description, category, isActive } = req.body;

        const resource = await LearningResource.findByIdAndUpdate(
            req.params.id,
            { title, url, description, category, isActive },
            { new: true, runValidators: true }
        );

        if (!resource) {
            return res.status(404).json({
                success: false,
                message: 'Learning resource not found'
            });
        }

        res.json({
            success: true,
            message: 'Learning resource updated successfully',
            resource
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Delete a learning resource
// @route   DELETE /api/admin/learning-resources/:id
// @access  Private (Admin)
exports.deleteLearningResource = async (req, res) => {
    try {
        const resource = await LearningResource.findByIdAndDelete(req.params.id);

        if (!resource) {
            return res.status(404).json({
                success: false,
                message: 'Learning resource not found'
            });
        }

        res.json({
            success: true,
            message: 'Learning resource deleted successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

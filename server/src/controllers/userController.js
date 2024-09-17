import User from "../models/User.js";
import Patient from "../models/Patient.js";
import cloudinary from "../config/cloudinary.js";

export const getStaffList = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = 9;
        const search = req.query.search || '';

        const query = {
            role: { $in: ['doctor', 'nurse'] },
            $or: [
                { fullName: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } }
            ]
        };

        const totalStaff = await User.countDocuments(query);
        const totalPages = Math.ceil(totalStaff / limit);

        const staff = await User.find(query)
            .select('_id fullName role avatar email')
            .skip((page - 1) * limit)
            .limit(limit)
            .lean();

        res.status(200).json({
            staff,
            currentPage: page,
            totalPages,
            totalStaff
        });
    } catch (error) {
        console.error('Error fetching medical staff:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

export const getUserProfile = async (req, res) => {
    try {
        let user = await User.findById(req.params.id || req.user.id).select('-password -tokens');

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        if (req.user.id !== user.id && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Forbidden' });
        }

        if (user.role === 'patient') {
            const patient = await Patient.findOne({ user: user._id });
            if (patient) {
                user = user.toObject();
                user.healthInsurance = patient.healthInsurance;
            }
        }

        res.status(200).json(user);
    } catch (err) {
        console.error('Error in getUserProfile:', err);
        res.status(500).json({ message: 'Server error' });
    }
}

const deleteAvatarFromCloudinary = async (cloudinaryId) => {
    try {
        await cloudinary.uploader.destroy(cloudinaryId);
    } catch (cloudinaryError) {
        console.error('Error deleting image from Cloudinary:', cloudinaryError);
    }
}

export const deleteUser = async (req, res) => {
    try {
        if (req.user.id !== req.params.id) {
            return res.status(403).json({ message: 'Access denied!' });
        }

        let user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        if (user.avatar && user.avatar.includes('cloudinary')) {
            const publicId = user.avatar.split('/').slice(-1)[0].split('.')[0];
            await deleteAvatarFromCloudinary(publicId);
        }

        if (user.role === 'patient') {
            await Patient.findOneAndDelete({ user: user._id });
        }

        await User.findByIdAndDelete(req.params.id);

        res.status(200).json({ message: 'User deleted successfully' });
    } catch (err) {
        console.error('Error in deleteUser:', err);
        res.status(500).json({ message: 'Server error' });
    }
};

export const updateUser = async (req, res) => {
    try {
        let user = await User.findById(req.user.id);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const allowedUpdates = ['fullName', 'gender', 'dateOfBirth', 'phoneNumber', 'address'];

        const updateData = Object.keys(req.body)
            .filter(key => allowedUpdates.includes(key))
            .reduce((obj, key) => {
                obj[key] = req.body[key];
                return obj;
            }, {});

        if (req.file) {
            if (user.avatar && user.avatar.includes('cloudinary')) {
                const publicId = user.avatar.split('/').slice(-1)[0].split('.')[0];
                await deleteAvatarFromCloudinary(publicId);
            }

            const result = await cloudinary.uploader.upload(req.file.path);
            updateData.avatar = result.secure_url;
        }

        let updatedUser = await User.findByIdAndUpdate(
            req.user.id,
            {
                $set: updateData
            },
            { new: true, runValidators: true }
        ).select('-password -tokens');
        updatedUser = updatedUser.toObject();
        if (user.role === 'patient' && req.body.healthInsurance) {
            let patient = await Patient.findOne({ user: user._id });
            if (!patient) {
                patient = new Patient({ user: user._id, healthInsurance: req.body.healthInsurance });
            } else {
                patient.healthInsurance = req.body.healthInsurance;
            }
            await patient.save();
            updatedUser.healthInsurance = patient.healthInsurance;
        }
        res.status(200).json(updatedUser);
    } catch (err) {
        console.error('Error in updateUser:', err);
        res.status(500).json({ message: 'Server error' });
    }
};

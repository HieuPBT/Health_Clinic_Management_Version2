import User from "../models/User.js";
import cloudinary from "../config/cloudinary.js";


export const getUserProfile = async (req, res) => {
    try {
        const user = await User.findById(req.params.id).select('-password');
        console.log(req.user)
        if (req.user.id !== user.id && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Forbidden' });
        }
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
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

        await User.findByIdAndDelete(req.params.id);

        res.status(200).json({ message: 'User deleted successfully' });
    } catch (err) {
        console.error('Error in deleteUser:', err);
        res.status(500).json({ message: 'Server error' });
    }
};

export const updateUser = async (req, res) => {
    try {
        if (req.user.id !== req.params.id) {
            return res.status(403).json({ message: 'Access denied!' });
        }

        let user = await User.findById(req.params.id);

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

        const updatedUser = await User.findByIdAndUpdate(
            req.params.id,
            {
                $set: updateData
            },
            { new: true, runValidators: true }
        ).select('-password');

        res.status(200).json(updatedUser);
    } catch (err) {
        console.error('Error in updateUser:', err);
        res.status(500).json({ message: 'Server error' });
    }
};

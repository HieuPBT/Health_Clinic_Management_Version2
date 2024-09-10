import Department from '../models/Department.js'

export const getDepartments = async (req, res) => {
    try {
        const result = await Department.find();

        res.json(result);
    } catch (error) {
        console.error('Error fetching medicines:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

import Medicine from '../models/Medicine.js';
import createPaginator from '../utils/paginator.js';

const medicinePaginator = createPaginator(Medicine);

export const getMedicines = async (req, res) => {
    try {
        const { page, limit, name } = req.query;

        let query = {};
        if (name) {
            query.name = { $regex: name, $options: 'i' };
        }

        const options = {
            page,
            limit,
            sortBy: { name: 1 },
            baseUrl: `${req.protocol}://${req.get('host')}${req.baseUrl}${req.path}`
        };

        const result = await medicinePaginator(query, options);

        res.json(result);
    } catch (error) {
        console.error('Error fetching medicines:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

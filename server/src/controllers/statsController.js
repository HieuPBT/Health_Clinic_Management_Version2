import Appointment from '../models/Appointment.js';
import Invoice from '../models/Invoice.js';

export const getStatsData = async (req, res) => {
    try {
        const { period } = req.query;
        let groupStage;
        switch (period) {
            case 'month':
                groupStage = {
                    _id: { year: { $year: "$createdAt" }, month: { $month: "$createdAt" } },
                    count: { $sum: 1 },
                    revenue: { $sum: "$appointmentFee" }
                };
                break;
            case 'quarter':
                groupStage = {
                    _id: {
                        year: { $year: "$createdAt" },
                        quarter: { $ceil: { $divide: [{ $month: "$createdAt" }, 3] } }
                    },
                    count: { $sum: 1 },
                    revenue: { $sum: "$appointmentFee" }
                };
                break;
            case 'year':
                groupStage = {
                    _id: { year: { $year: "$createdAt" } },
                    count: { $sum: 1 },
                    revenue: { $sum: "$appointmentFee" }
                };
                break;
            default:
                return res.status(400).json({ message: 'Invalid period' });
        }

        const appointmentStats = await Appointment.aggregate([
            { $group: groupStage }
        ]);

        const revenueStats = await Invoice.aggregate([
            {
                $group: {
                    _id: groupStage._id,
                    totalRevenue: { $sum: { $add: ["$appointmentFee", "$prescriptionFee"] } }
                }
            }
        ]);

        const combinedStats = appointmentStats.map(stat => {
            const revenueStat = revenueStats.find(r =>
                JSON.stringify(r._id) === JSON.stringify(stat._id)
            );
            return {
                ...stat,
                totalRevenue: revenueStat ? revenueStat.totalRevenue : 0
            };
        });

        res.json(combinedStats);
    } catch (error) {
        console.error('Error in statistics route:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
}

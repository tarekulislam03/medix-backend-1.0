import Sales from "../models/salesModel.js";

const todaySales = async(req, res)=>{
    try {
        
        const startOfDay = new Date();
        startOfDay.setHours(0, 0, 0, 0);

        const endOfDay = new Date();
        endOfDay.setHours(23, 59, 59, 999);

        const result = await Sales.aggregate([
            {
                $match: {
                    created_at: {
                        $gte: startOfDay,
                        $lte: endOfDay
                    }
                }
            },
            {
                $group: {
                    _id: null,
                    total_sales: { $sum: "$grand_total" }
                }
            }
        ]);

        return res.status(200).json({
            data: result[0] || {
                total_sales: 0
            }
        });

    } catch (error) {
        res.status(500).json({
            message: error.message
        })
    }
};

const monthlySales = async(req, res)=>{
    try {
        
        const now = new Date();

        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const endOfMonth = new Date(
            now.getFullYear(),
            now.getMonth() + 1,
            0,
            23, 59, 59, 999
        );
        const result = await Sales.aggregate([
            {
                $match: {
                    created_at: {
                        $gte: startOfMonth,
                        $lte: endOfMonth
                    }
                }
            },
            {
                $group: {
                    _id: null,
                    total_sales: { $sum: "$grand_total" }
                }
            }
        ]);

        return res.status(200).json({
            data: result[0] || {
                total_sales: 0,
            }
        });

    } catch (error) {
        res.status(500).json({
            message: "Internal Server Error"
        })
    }
}

export { todaySales, monthlySales };
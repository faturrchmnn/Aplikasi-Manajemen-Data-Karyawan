const { poolPromise } = require('../config/db');

exports.getAllDepartments = async (req, res) => {
    try {
        const pool = await poolPromise;
        const result = await pool.request()
            .query('SELECT DepartmentID, DepartmentName FROM Departments');

        res.json(result.recordset);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

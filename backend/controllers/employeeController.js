const { poolPromise, sql } = require('../config/db');

exports.getAllEmployees = async (req, res) => {
    try {
        const pool = await poolPromise;
        const result = await pool.request().query('SELECT * FROM Employees');
        res.json(result.recordset);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.getEmployeeById = async (req, res) => {
    try {
        const pool = await poolPromise;
        const result = await pool.request()
            .input('id', sql.Int, req.params.id)
            .query('SELECT * FROM Employees WHERE EmployeeID = @id');

        if (result.recordset.length === 0)
            return res.status(404).json({ message: 'Employee not found' });

        res.json(result.recordset[0]);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.createEmployee = async (req, res) => {
    const { name, position, salary } = req.body;

    if (!name || salary <= 0)
        return res.status(400).json({ message: 'Invalid input' });

    try {
        const pool = await poolPromise;
        await pool.request()
            .input('name', sql.VarChar, name)
            .input('position', sql.VarChar, position)
            .input('salary', sql.Decimal(12, 2), salary)
            .query(`
                INSERT INTO Employees (Name, Position, Salary)
                VALUES (@name, @position, @salary)
            `);

        res.status(201).json({ message: 'Employee created' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.updateEmployee = async (req, res) => {
    const { name, position, salary } = req.body;

    if (!name || salary <= 0)
        return res.status(400).json({ message: 'Invalid input' });

    try {
        const pool = await poolPromise;
        await pool.request()
            .input('id', sql.Int, req.params.id)
            .input('name', sql.VarChar, name)
            .input('position', sql.VarChar, position)
            .input('salary', sql.Decimal(12, 2), salary)
            .query(`
                UPDATE Employees
                SET Name=@name, Position=@position, Salary=@salary
                WHERE EmployeeID=@id
            `);

        res.json({ message: 'Employee updated' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.deleteEmployee = async (req, res) => {
    try {
        const pool = await poolPromise;
        await pool.request()
            .input('id', sql.Int, req.params.id)
            .query('DELETE FROM Employees WHERE EmployeeID=@id');

        res.json({ message: 'Employee deleted' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

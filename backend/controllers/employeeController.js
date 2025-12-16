const { poolPromise, sql } = require('../config/db');

/**
 * GET ALL EMPLOYEES (Pagination + Search + Department)
 * GET /api/employees?page=1&limit=10&search=andi
 */
exports.getAllEmployees = async (req, res) => {
    try {
        const pool = await poolPromise;

        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const search = req.query.search || '';
        const offset = (page - 1) * limit;

        let query = `
            SELECT 
                e.EmployeeID,
                e.Name,
                e.Position,
                e.Salary,
                e.DepartmentID,
                d.DepartmentName,
                e.CreatedAt
            FROM Employees e
            LEFT JOIN Departments d 
                ON e.DepartmentID = d.DepartmentID
        `;

        let countQuery = `
            SELECT COUNT(*) AS total
            FROM Employees
        `;

        const request = pool.request();

        if (search) {
            query += ' WHERE e.Name LIKE @search';
            countQuery += ' WHERE Name LIKE @search';
            request.input('search', sql.VarChar, `%${search}%`);
        }

        query += `
            ORDER BY e.EmployeeID DESC
            OFFSET @offset ROWS
            FETCH NEXT @limit ROWS ONLY
        `;

        request.input('offset', sql.Int, offset);
        request.input('limit', sql.Int, limit);

        const [result, countResult] = await Promise.all([
            request.query(query),
            pool.request()
                .input('search', sql.VarChar, search ? `%${search}%` : '%%')
                .query(countQuery)
        ]);

        res.json({
            data: result.recordset,
            total: countResult.recordset[0].total,
            page,
            limit
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: err.message });
    }
};

/**
 * GET EMPLOYEE BY ID (with Department)
 * GET /api/employees/:id
 */
exports.getEmployeeById = async (req, res) => {
    try {
        const pool = await poolPromise;

        const result = await pool.request()
            .input('id', sql.Int, req.params.id)
            .query(`
                SELECT 
                    e.EmployeeID,
                    e.Name,
                    e.Position,
                    e.Salary,
                    e.DepartmentID,
                    d.DepartmentName
                FROM Employees e
                LEFT JOIN Departments d 
                    ON e.DepartmentID = d.DepartmentID
                WHERE e.EmployeeID = @id
            `);

        if (result.recordset.length === 0) {
            return res.status(404).json({ message: 'Employee not found' });
        }

        res.json(result.recordset[0]);

    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

/**
 * CREATE EMPLOYEE
 * POST /api/employees
 */
exports.createEmployee = async (req, res) => {
    const { name, position, salary, departmentId } = req.body;

    if (!name || name.trim() === '') {
        return res.status(400).json({ message: 'Name is required' });
    }
    if (!position || position.trim() === '') {
        return res.status(400).json({ message: 'Position is required' });
    }
    if (!salary || salary <= 0) {
        return res.status(400).json({ message: 'Salary must be greater than 0' });
    }

    try {
        const pool = await poolPromise;

        await pool.request()
            .input('name', sql.VarChar, name.trim())
            .input('position', sql.VarChar, position.trim())
            .input('salary', sql.Decimal(12, 2), salary)
            .input('departmentId', sql.Int, departmentId || null)
            .query(`
                INSERT INTO Employees (Name, Position, Salary, DepartmentID)
                VALUES (@name, @position, @salary, @departmentId)
            `);

        res.status(201).json({ message: 'Employee created successfully' });

    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

/**
 * UPDATE EMPLOYEE
 * PUT /api/employees/:id
 */
exports.updateEmployee = async (req, res) => {
    const { name, position, salary, departmentId } = req.body;
    const employeeId = req.params.id;

    if (!name || !position || !salary || salary <= 0) {
        return res.status(400).json({ message: 'Invalid input' });
    }

    try {
        const pool = await poolPromise;

        const exists = await pool.request()
            .input('id', sql.Int, employeeId)
            .query('SELECT EmployeeID FROM Employees WHERE EmployeeID = @id');

        if (exists.recordset.length === 0) {
            return res.status(404).json({ message: 'Employee not found' });
        }

        await pool.request()
            .input('id', sql.Int, employeeId)
            .input('name', sql.VarChar, name.trim())
            .input('position', sql.VarChar, position.trim())
            .input('salary', sql.Decimal(12, 2), salary)
            .input('departmentId', sql.Int, departmentId || null)
            .query(`
                UPDATE Employees
                SET 
                    Name = @name,
                    Position = @position,
                    Salary = @salary,
                    DepartmentID = @departmentId
                WHERE EmployeeID = @id
            `);

        res.json({ message: 'Employee updated successfully' });

    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

/**
 * DELETE EMPLOYEE
 * DELETE /api/employees/:id
 */
exports.deleteEmployee = async (req, res) => {
    const employeeId = req.params.id;

    try {
        const pool = await poolPromise;

        const exists = await pool.request()
            .input('id', sql.Int, employeeId)
            .query('SELECT EmployeeID FROM Employees WHERE EmployeeID = @id');

        if (exists.recordset.length === 0) {
            return res.status(404).json({ message: 'Employee not found' });
        }

        await pool.request()
            .input('id', sql.Int, employeeId)
            .query('DELETE FROM Employees WHERE EmployeeID = @id');

        res.json({ message: 'Employee deleted successfully' });

    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

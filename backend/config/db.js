const sql = require('mssql');

const config = {
    user: 'sa',
    password: 'sa123',
    server: 'localhost',
    port: 1433,
    database: 'EmployeeDB',
    options: {
        encrypt: true,
        trustServerCertificate: true
    }
};

const poolPromise = new sql.ConnectionPool(config)
    .connect()
    .then(pool => {
        console.log('✅ Connected to SQL Server (SQLEXPRESS via port)');
        return pool;
    })
    .catch(err => {
        console.error('❌ DB Connection Failed!', err);
    });

module.exports = { sql, poolPromise };

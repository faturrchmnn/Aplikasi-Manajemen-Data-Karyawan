const sql = require('mssql');

const config = {
    user: 'sa',
    password: 'your_password',
    server: 'localhost',
    database: 'EmployeeDB',
    options: {
        trustServerCertificate: true
    }
};

const poolPromise = new sql.ConnectionPool(config)
    .connect()
    .then(pool => {
        console.log('Connected to SQL Server');
        return pool;
    })
    .catch(err => console.log('DB Connection Failed!', err));

module.exports = {
    sql,
    poolPromise
};

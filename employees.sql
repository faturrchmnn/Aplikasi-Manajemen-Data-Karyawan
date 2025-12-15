CREATE DATABASE EmployeeDB;
GO

USE EmployeeDB;
GO

CREATE TABLE Employees (
    EmployeeID INT IDENTITY(1,1) PRIMARY KEY,
    Name VARCHAR(100) NOT NULL,
    Position VARCHAR(50),
    Salary DECIMAL(12,2) CHECK (Salary > 0),
    CreatedAt DATETIME DEFAULT GETDATE()
);

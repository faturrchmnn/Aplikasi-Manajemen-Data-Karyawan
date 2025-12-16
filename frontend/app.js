angular.module('employeeApp', [])
.controller('EmployeeController', function($scope, $http) {

    const API_EMP = 'http://localhost:3000/api/employees';
    const API_DEPT = 'http://localhost:3000/api/departments';

    $scope.isEdit = false;
    $scope.showModal = false;

    $scope.employee = {};
    $scope.employees = [];
    $scope.departments = [];

    $scope.currentPage = 1;
    $scope.limit = 10;
    $scope.searchTerm = '';
    $scope.total = 0;
    $scope.totalPages = 0;

    /* =========================
       LOAD DEPARTMENTS (DROPDOWN)
    ========================= */
    function loadDepartments() {
        $http.get(API_DEPT)
            .then(res => {
                console.log('Departments loaded:', res.data); // DEBUG
                $scope.departments = res.data;
            })
            .catch(err => {
                console.error('Failed load departments', err);
            });
    }

    /* =========================
       LOAD EMPLOYEES
    ========================= */
    function loadEmployees() {
        const params = {
            page: $scope.currentPage,
            limit: $scope.limit,
            search: $scope.searchTerm
        };
        $http.get(API_EMP, { params }).then(res => {
            $scope.employees = res.data.data;
            $scope.total = res.data.total;
            $scope.totalPages = Math.ceil($scope.total / $scope.limit);
        });
    }

    /* =========================
       INIT
    ========================= */
    loadDepartments();   // ⬅️ WAJIB supaya dropdown muncul
    loadEmployees();

    /* =========================
       SAVE (ADD / EDIT)
    ========================= */
    $scope.saveEmployee = function() {
        if ($scope.employee.salary <= 0) {
            alert('Salary must be greater than 0');
            return;
        }

        const employeeData = {
            name: $scope.employee.name,
            position: $scope.employee.position,
            salary: $scope.employee.salary,
            departmentId: $scope.employee.departmentId
                ? parseInt($scope.employee.departmentId)
                : null
        };

        if ($scope.isEdit) {
            $http.put(`${API_EMP}/${$scope.employee.EmployeeID}`, employeeData)
                .then(() => {
                    $scope.closeModal();
                    loadEmployees();
                });
        } else {
            $http.post(API_EMP, employeeData)
                .then(() => {
                    $scope.closeModal();
                    loadEmployees();
                });
        }
    };

    /* =========================
       EDIT
    ========================= */
    $scope.editEmployee = function(emp) {
        $scope.employee = angular.copy(emp);
        $scope.employee.departmentId = emp.DepartmentID
            ? emp.DepartmentID.toString()
            : '';
        $scope.isEdit = true;
        $scope.showModal = true;
    };

    /* =========================
       DELETE
    ========================= */
    $scope.deleteEmployee = function(id) {
        if (confirm('Delete this employee?')) {
            $http.delete(`${API_EMP}/${id}`)
                .then(loadEmployees);
        }
    };

    /* =========================
       MODAL
    ========================= */
    $scope.openModal = function() {
        $scope.employee = {};
        $scope.isEdit = false;
        $scope.showModal = true;
    };

    $scope.closeModal = function() {
        $scope.showModal = false;
        $scope.employee = {};
        $scope.isEdit = false;
    };

    /* =========================
       SEARCH & PAGINATION
    ========================= */
    $scope.searchEmployees = function() {
        $scope.currentPage = 1;
        loadEmployees();
    };

    $scope.prevPage = function() {
        if ($scope.currentPage > 1) {
            $scope.currentPage--;
            loadEmployees();
        }
    };

    $scope.nextPage = function() {
        if ($scope.currentPage < $scope.totalPages) {
            $scope.currentPage++;
            loadEmployees();
        }
    };
});

angular.module('employeeApp', [])
.controller('EmployeeController', function($scope, $http) {

    const API = 'http://localhost:3000/api/employees';

    $scope.isEdit = false;
    $scope.employee = {};
    $scope.currentPage = 1;
    $scope.limit = 10;
    $scope.searchTerm = '';
    $scope.total = 0;
    $scope.totalPages = 0;

    function loadEmployees() {
        const params = {
            page: $scope.currentPage,
            limit: $scope.limit,
            search: $scope.searchTerm
        };
        $http.get(API, { params }).then(res => {
            $scope.employees = res.data.data;
            $scope.total = res.data.total;
            $scope.totalPages = Math.ceil($scope.total / $scope.limit);
        });
    }

    loadEmployees();

    $scope.saveEmployee = function() {
        if ($scope.employee.salary <= 0) {
            alert('Salary must be greater than 0');
            return;
        }

        if ($scope.isEdit) {
            $http.put(`${API}/${$scope.employee.EmployeeID}`, $scope.employee)
                .then(() => {
                    $scope.closeModal();
                    loadEmployees();
                });
        } else {
            $http.post(API, $scope.employee)
                .then(() => {
                    $scope.closeModal();
                    loadEmployees();
                });
        }
    };

    $scope.editEmployee = function(emp) {
        $scope.employee = angular.copy(emp);
        $scope.isEdit = true;
        $scope.showModal = true;
    };

    $scope.deleteEmployee = function(id) {
        if (confirm('Delete this employee?')) {
            $http.delete(`${API}/${id}`)
                .then(loadEmployees);
        }
    };

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

angular.module('employeeApp', [])
.controller('EmployeeController', function($scope, $http) {

    const API = 'http://localhost:3000/api/employees';

    $scope.isEdit = false;
    $scope.employee = {};

    function loadEmployees() {
        $http.get(API).then(res => {
            $scope.employees = res.data;
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
});

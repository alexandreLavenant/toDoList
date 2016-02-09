var todoApp = angular.module('todoApp', []);

todoApp.controller('todoController', function($scope, $http) {
	$scope.todos = [];
	$scope.newToDo = {};
	$scope.selectedToDo = {};
	$scope.editTodo = {};
	$scope.todo = {};

	// when landing on the page, get all todos and show them
	$http.get('/api/todos')
		.success(function(data) {
			$scope.todos = data;
		})
		.error(function(data) {
			console.log('Error: ' + data);
		});

	// when submitting the add form, send the text to the node API
	$scope.selectToDo = function(todo) {
		todo.selected = ! todo.selected;
		$scope.selectedToDo = todo;
	};

	// when submitting the add form, send the text to the node API
	$scope.createTodoList = function() {
		$http.post('/api/todos', $scope.newToDo)
			.success(function(data) {
				$scope.newToDo = {}; // clear the form so our user is ready to enter another
				$scope.todos = data;
			})
			.error(function(data) {
				console.log('Error: ' + data);
			});
	};

	$scope.showDeleteModal = function(todo)
	{
		$scope.selectedToDo = todo;
		$('#modal-delete').modal('show');
	};
	// delete a todo after checking it
	$scope.deleteTodoList = function(id) {
		$http.delete('/api/todos' + id)
			.success(function(data) {
				$scope.todos = data;
				$scope.selectedToDo = {};
				$('#modal-delete').modal('hide');
			})
			.error(function(data) {
				console.log('Error: ' + data);
			});
	};

	// show edit modal
	$scope.showEditModal = function(todo){
		$scope.editTodo = todo;
		$('#modal-edit').modal('show');
	};

	// send new todo name to server
	$scope.edit = function(id, todo){
		var todoToEdit = { _id : todo._id, text : todo.text };
		$http.post('/api/todos'+ id +'/edit', todoToEdit)
			.success(function(data) {
				$scope.selectedToDo = data;
				$scope.editTodo = {};
				$('#modal-edit').modal('hide');
			})
			.error(function(data) {
				console.log('Error: ' + data);
			});
	};

	// when submitting the add form, send the text to the node API
	$scope.addTodo = function(id) {
		$http.post('/api/todos'+id, $scope.todo )
			.success(function(data) {
				$scope.todo = {}; // clear the form so our user is ready to enter another
				$scope.todos = data.todos;
				$scope.selectedToDo = data.newSelectedTodo;
			})
			.error(function(data) {
				console.log('Error: ' + data);
			});
	};

	// delete a todo after checking it
	$scope.removeTodos = function(id) {
		var data = {};
		data.toKeep = [];

		angular.forEach($scope.selectedToDo.list, function(todo)
		{
			if(!todo.done) data.toKeep.push(todo);
		});

		$http.post('/api/todos' + id + '/list', data)
			.success(function(data) {
				$scope.todos = data.todos;
				$scope.selectedToDo = data.newSelectedTodo;
			})
			.error(function(data) {
				console.log('Error: ' + data);
			});
	};
	
	// calculate number of remaining todo not checked
	$scope.remaining = function() {
		var count = 0;
		angular.forEach($scope.selectedToDo.list, function(todo) {
			count += todo.done ? 0 : 1;
		});
		return count;
	};

});

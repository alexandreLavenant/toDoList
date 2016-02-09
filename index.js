var Datastore   = require('nedb'),
	bodyParser	= require('body-parser'),
	express		= require('express'),
	favicon		= require('serve-favicon'),
	app			= express(),
	port		= 8080,
	todos		= new Datastore({ filename : './public/data/todos', autoload : true }),
	generateID	= function()
	{
		return '_' + Math.random().toString(36).substr(2, 9);
	}
	;

app.use(favicon(__dirname + '/public/img/favicon.ico'));
app.use(express.static(__dirname + '/public'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({'extended':'true'}));

/**
 * get todo list
 */
app.get('/api/todos', function(req, res){
	todos.find({}, function(err, docs)
	{
		if(err)
		{
			res.send({ message : err });
		}
		else
		{
			res.send(docs);
		}
	});
});

/**
 * create todo list
 */
app.post('/api/todos', function(req, res)
{
		todos.insert({ name : req.body.name, list : [] }, function(err, doc)
		{
			todos.find({}, function(err, docs)
			{
				if(err)
				{
					res.send({ message : err });
				}
				else
				{
					res.send(docs);
				}
			});
		});
});

/**
 * add todo in list
 */
app.post('/api/todos:todo_id', function(req, res)
{
	var todoID = req.params.todo_id;

	todos.find({ _id : todoID }, function(err, doc)
	{
		todos.update({ _id : todoID }, { $addToSet : { list : { _id : generateID(), text : req.body.text, date : Date.now(), pos : doc[0].list.length } } }, {}, function(err, numReplaced)
		{
			todos.find({}, function(err, updated)
			{
				if(err)
				{
					res.send(err);
				}
				else
				{
					var returnData = { todos : updated };

					todos.find({ _id : todoID }, function(err, newSelectedTodo)
					{
						if(err)
						{
							res.send(err);
						}
						else
						{
							returnData.newSelectedTodo = newSelectedTodo[0];
							res.send(returnData);
						}
					});
				}
			});
		});
	});

});

/**
 * delete todo list
 */
app.delete('/api/todos:todo_id', function(req, res)
{
	todos.remove({ _id : req.params.todo_id}, { multi : true }, function(err, numRemoved)
	{
		todos.find({}, function(err, doc)
		{
			if(err)
			{
				res.send(err);
			}
			else
			{
				res.send(doc);
			}
		});
	});
});

/**
 * edit todo from the list
 */
app.post('/api/todos:todo_id/edit', function(req, res)
{
	var todosID = req.params.todo_id;
	todos.find({ _id : todosID }, function(err, doc){

		if (err) {
			res.send(err);
		}
		else {
			//loop trought list of todos
			for (var i = 0; i < doc[0].list.length; i++) {
				if( doc[0].list[i]._id === req.body._id ){
					doc[0].list[i].text = req.body.text;
					break;
				}
			}
			//update and send back new data
			todos.update({ _id : todosID }, { $set : { list : doc[0].list }}, function(err, numReplaced){
				if(err){
					res.send(err);
				}
				else {
					res.send(doc[0]);
				}
			});
		}
	});
});

/**
 * remove todo from the list
 */
app.post('/api/todos:todo_id/list', function(req, res)
{
	var todoID = req.params.todo_id;

	todos.update({ _id : todoID }, { $set : { list : req.body.toKeep } }, {}, function(err, numReplaced)
	{
		todos.find({}, function(err, updated)
		{
			if(err)
			{
				res.send(err);
			}
			else
			{
				var returnData = { todos : updated };

				todos.find({ _id : todoID }, function(err, newSelectedTodo)
				{
					if(err)
					{
						res.send(err);
					}
					else
					{
						returnData.newSelectedTodo = newSelectedTodo[0];
						res.send(returnData);
					}
				});
			}
		});
	});
});

app.get('*', function(req, res) {
	res.sendFile(__dirname+'/public/index.html'); // load the single view file (angular will handle the page changes on the front-end)
});

//start server
app.listen(port, function()
{
	console.log('server listening on port '+port);
});

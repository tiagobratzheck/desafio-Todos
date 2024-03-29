const express = require("express");
const cors = require("cors");

const { v4: uuidv4 } = require("uuid");

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
    const { username } = request.headers;
    const user = users.find(user => user.username === username)
    if (!user) {
        return response.status(400).json({ error: "User not found" })
    }
    request.user = user;
    return next()
}

app.post("/users", (request, response) => {
    const { name, username } = request.body;
    const userAlreadyExists = users.some((user) => user.name === name)
    if (userAlreadyExists) {
        return response.status(400).json({ error: "User already exists!" })
    }
    const new_user = {
        id: uuidv4(),
        name,
        username,
        todos: [],
    }
    users.push(new_user);
    return response.status(201).json(new_user);
});

app.get("/todos", checksExistsUserAccount, (request, response) => {
    const { user } = request;
    return response.json(user.todos)
});

app.post("/todos", checksExistsUserAccount, (request, response) => {
    const { title, deadline } = request.body;
    const { user } = request
    const new_todo = {
        id: uuidv4(),
        title,
        done: false,
        deadline: new Date(deadline),
        created_at: new Date()
    }
    user.todos.push(new_todo);
    return response.status(201).send();
});

app.put("/todos/:id", checksExistsUserAccount, (request, response) => {
    const id = request.params.id;
    const { title, deadline } = request.body;
    const { user } = request       
    for (const todo of user.todos) {
        if (todo.id === id) {
            todo.title = title;
            todo.deadline = deadline
            break;
        }
    }    
    return response.json(user.todos)
});

app.patch("/todos/:id/done", checksExistsUserAccount, (request, response) => {
    const id = request.params.id;
    const { user } = request
    for (const todo of user.todos) {
        if (todo.id === id) {
            todo.done = true;            
            break;
        }
    }
    return response.status(201).send();
});

app.delete("/todos/:id", checksExistsUserAccount, (request, response) => {
    const id = request.params.id;
    const { user } = request
    var todo = user.todos.map(todo => todo.id).indexOf(id);
    if (todo > 0) {
        user.todos.splice(todo, 1);
        return response.status(204).send();
    }    
    return response.status(404).json({err: "Todo not found"});
});

module.exports = app;

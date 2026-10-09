const cl = console.log;

const todoList = document.getElementById("todoList");
const todoForm = document.getElementById("todoForm");
const todoItem = document.getElementById("todoItem");
const description = document.getElementById("description");
const isCompleted = document.getElementById("isCompleted");
const addTodo = document.getElementById("addTodo");
const updateTodo = document.getElementById("updateTodo");
const spinner = document.getElementById("spinner");

const base_url = `https://bhagyashri-s-first-database-default-rtdb.firebaseio.com/`;
const todo_url = `${base_url}/todowithcheckandContent.json`;

//local state

let localState = {
  todoArr: [],
  editId: null,
};

//handleSpinner

function handleSpinner(flag) {
  if (flag) {
    spinner.classList.remove("d-none");
  } else {
    spinner.classList.add("d-none");
  }
}

//snackbar function

function snackbar(msg, icon) {
  Swal.fire({
    title: msg,
    icon: icon,
    timer: 3000,
  });
}

//nestedObjIntoArr

function nestedObjIntoArr(obj) {
  for (const key in obj) {
    // cl(obj)
    obj[key].id = key;

    localState.todoArr.unshift(obj[key]);
    //    cl(localState.todoArr)
  }
  onCreateTodoList(localState.todoArr);
}

//show todo on UI function

async function fetchTodos() {
  handleSpinner(true);
  try {
    let res = await fetch(todo_url, {
      method: "GET",
      body: null,
      headers: {
        "content-type": "application/json",
        auth: "JWT from LS",
      },
    });

    if (!res.ok) {
      throw new Error(`hhtp : ${res.status}`);
    }

    let res1 = await res.json();
    // cl(res1)
    nestedObjIntoArr(res1);
  } catch (err) {
    cl("err");
    snackbar(`Error : ${err.msg}`, "error");
  } finally {
    handleSpinner();
  }
}

fetchTodos();

//read function

function onCreateTodoList(arr) {
  let res = "";

  arr.reverse().forEach((todo) => {
    res += `    <li class="list-group-item" id="${todo.id}">
                        <div class="accordion" id="accordionExample">
                            <div class="card">
                                <div class="card-header" id="headingOne">
                                    <h2 class="mb-0 d-flex justify-content-between">
                                        <button class="btn btn-link btn-block text-dark text-left mr-2" type="button"
                                            data-toggle="collapse" data-target="#collapseOne-${todo.todoid}" aria-expanded="true"
                                            aria-controls="collapseOne">
                                            <input type="checkbox" onchange="onCheckBoxChecked(this)" ${todo.isCompleted ? "checked" : ""}
                                                class="mr-2"
                                                style="height: 15px; width: 15px; vertical-align: middle;"><strong>${todo.todoItem}</strong>
                                        </button>

                                        <div class="d-flex justify-content-between">
                                            <button class="btn btn-sm btn-outline-success mr-1"
                                                onclick="onEdit(this)">Edit</button>
                                            <button class="btn btn-sm btn-outline-danger"
                                                onclick="onRemove(this)">Remove</button>
                                        </div>
                                    </h2>
                                </div>

                                <div id="collapseOne-${todo.todoid}" class="collapse" aria-labelledby="headingOne"
                                    data-parent="#todoList">
                                    <div class="card-body">
                                       ${todo.description}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </li>`;
  });
  todoList.innerHTML = res;
}

//function create

async function onSubmit(eve) {
  try {
    eve.preventDefault();
    handleSpinner(true)
    let newTodo = {
      todoItem: todoItem.value,
      todoid: Date.now(),
      isCompleted: isCompleted.value === "yes",
      description: description.value,
    };
    // cl(newTodo);
    todoForm.reset();
    let res = await fetch(todo_url, {
      method: "POST",
      body: JSON.stringify(newTodo),
      headers: {
        "content-type": "application/json",
        auth: "JWT from LS",
      },
    });
    if (!res.ok) {
      throw new Error(`http :  ${res.status}`);
    }
    let data = await res.json();

    newTodo.id = data.name;
    localState.todoArr.push(newTodo);
    // cl(localState.todoArr);

    let li = document.createElement("li");
    li.className = `list-group-item`;
    li.id = data.name;
    li.innerHTML = `<div class="accordion" id="accordionExample">
                            <div class="card">
                                <div class="card-header" id="headingOne">
                                    <h2 class="mb-0 d-flex justify-content-between">
                                        <button class="btn btn-link btn-block text-dark text-left mr-2" type="button"
                                            data-toggle="collapse" data-target="#collapseOne-${newTodo.todoid}" aria-expanded="true"
                                            aria-controls="collapseOne">
                                            <input type="checkbox" onchange="onCheckBoxChecked(this)" ${newTodo.isCompleted ? "checked" : ""}
                                                class="mr-2"
                                                style="height: 15px; width: 15px; vertical-align: middle;"><strong>${newTodo.todoItem}</strong>
                                        </button>

                                        <div class="d-flex justify-content-between">
                                            <button class="btn btn-sm btn-outline-success mr-1"
                                                onclick="onEdit(this)">Edit</button>
                                            <button class="btn btn-sm btn-outline-danger"
                                                onclick="onRemove(this)">Remove</button>
                                        </div>
                                    </h2>
                                </div>

                                <div id="collapseOne-${newTodo.todoid}" class="collapse" aria-labelledby="headingOne"
                                    data-parent="#todoList">
                                    <div class="card-body">
                                       ${newTodo.description}
                                    </div>
                                </div>
                            </div>
                        </div>`;
    todoList.append(li);
    snackbar(
      `New todo with name ${newTodo.todoItem} created successfully`,
      "success",
    );
  } catch (err) {
    cl(err);
    snackbar(err, "error");
  } finally {
    handleSpinner();
  }
}

//function onEdit

function onEdit(ele) {
  try {
    let editId = ele.closest("li").id;
    // cl(editId);

    localState.editId = editId;

    let editObj = localState.todoArr.find((obj) => obj.id === editId);
    // cl(editObj)

    todoItem.value = editObj.todoItem;
    isCompleted.value = editObj.isCompleted === true ? "yes" : "no";
    // cl(editObj.isCompleted)
    description.value = editObj.description;

    addTodo.classList.add("d-none");
    updateTodo.classList.remove("d-none");
  } catch (err) {
    cl(err);
    snackbar(err, "error");
  }
}

//function update

async function onUpdate() {
  try {
        handleSpinner(true);
        let updateId = localState.editId;
        // cl(updateId)

        let update_url = `${base_url}/todowithcheckandContent/${updateId}.json`;

        let updateObj = {
        todoItem: todoItem.value,
        isCompleted: isCompleted.value === "yes",
        description: description.value,
        todoid: Date.now(),
        id: updateId,
        };
        cl(updateObj);

        let res = await fetch(update_url, {
        method: "PATCH",
        body: JSON.stringify(updateObj),
        headers: {
            "content-type": "application/json",
            auth: "JWT from LS",
        },
        });

        if (!res.ok) {
        throw new Error(`http : ${res.status}`);
        }

        let data = await res.json();

        cl(data);
        let idx = localState.todoArr.findIndex((e) => e.id === updateId);
        localState.todoArr[idx] = updateObj;

        let obj = document.getElementById(updateId);
        obj.innerHTML = `<div class="accordion" id="accordionExample">
                                <div class="card">
                                    <div class="card-header" id="headingOne">
                                        <h2 class="mb-0 d-flex justify-content-between">
                                            <button class="btn btn-link btn-block text-dark text-left mr-2" type="button"
                                                data-toggle="collapse" data-target="#collapseOne-${updateObj.todoid}" aria-expanded="true"
                                                aria-controls="collapseOne">
                                                <input type="checkbox" onchange="onCheckBoxChecked(this)" ${updateObj.isCompleted ? "checked" : ""}
                                                    class="mr-2"
                                                    style="height: 15px; width: 15px; vertical-align: middle;"><strong>${updateObj.todoItem}</strong>
                                            </button>

                                            <div class="d-flex justify-content-between">
                                                <button class="btn btn-sm btn-outline-success mr-1"
                                                    onclick="onEdit(this)">Edit</button>
                                                <button class="btn btn-sm btn-outline-danger"
                                                    onclick="onRemove(this)">Remove</button>
                                            </div>
                                        </h2>
                                    </div>

                                    <div id="collapseOne-${updateObj.todoid}" class="collapse" aria-labelledby="headingOne"
                                        data-parent="#todoList">
                                        <div class="card-body">
                                        ${updateObj.description}
                                        </div>
                                    </div>
                                </div>
                            </div>`;
        todoForm.reset();
        addTodo.classList.remove("d-none");
        updateTodo.classList.add("d-none");
    } catch (err) {
        cl(err);
        snackbar(err, "error");
    }
    finally{
        handleSpinner()
    }
}

//function remove

async function onRemove(ele) {
  handleSpinner(true);
  try {
        let res1 = await Swal.fire({
        title: "Are you sure?",
        text: "You won't be able to revert this!",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "Yes, remove it!",
        });

        if (res1.isConfirmed) {
        let removeId = ele.closest("li").id;
        // cl(removeId)

        let remove_url = `${base_url}/todowithcheckandContent/${removeId}.json`;

        let res = await fetch(remove_url, {
            method: "DELETE",
            body: null,
            headers: {
            "content-type": "application/json",
            auth: "JWT from LS",
            },
        });
        if (!res.ok) {
            throw new Error(`http : ${res.status}`);
        }
        let data = await res.json();

        let idx = localState.todoArr.findIndex((e) => e.id === removeId);
        localState.todoArr.splice(idx, 1);

        ele.closest("li").remove();
        }
    } catch (err) {
        cl(err);
        snackbar(err, "error");
    } finally {
        handleSpinner();
    }
}

async function onCheckBoxChecked(ele) {
  handleSpinner(true);
  try {
        let checkBoxId = ele.closest("li").id;
        // cl(checkBoxId)

        let check_url = `${base_url}/todowithcheckandContent/${checkBoxId}.json`;
        let checkobj = {
        isCompleted: ele.checked,
        };
        // cl(checkobj)
        let res = await fetch(check_url, {
        method: "PATCH",
        body: JSON.stringify(checkobj),
        headers: {
            "content-type": "application/json",
            auth: "JWT from LS",
        },
        });
        if (!res.ok) {
        throw new Error(`${res.status}`);
        }

        let data = await res.json();
        let checkBoxObj = localState.todoArr.find((e) => e.id === checkBoxId);
        // cl(checkBoxObj)
        checkBoxObj.isCompleted = checkobj.isCompleted;
    } catch (err) {
        cl(err);
        snackbar(err, "error");
    } finally {
        handleSpinner();
    }
}

todoForm.addEventListener("submit", onSubmit);
updateTodo.addEventListener("click", onUpdate);

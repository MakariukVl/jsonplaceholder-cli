let USERS = [];
let serviceUsers = null;

const API = {
  USERS: 'https://jsonplaceholder.typicode.com/users',
  POSTS: 'https://jsonplaceholder.typicode.com/posts',
  COMMENTS: 'https://jsonplaceholder.typicode.com/comments',
  ALBUMS: 'https://jsonplaceholder.typicode.com/albums',
  PHOTOS: 'https://jsonplaceholder.typicode.com/photos',
  TODOS: 'https://jsonplaceholder.typicode.com/todos'
};

const handleEdit = e => {
  const ref = e.target;
  const id = ref.dataset.id;
  const path = `edit?id=${id}`;
  history.pushState(null, `Edit userID: ${id}`, path);
  const render = routes(path);
  render();
};

const handleDelete = e => {
  const ref = e.target;
  const id = ref.dataset.id;
  deleteUser(id).then(resp => {
    console.log(`user ${id} successfully deleted: `, resp);
  });
  const APP_ROOT = document.getElementById('root');
  getUsers().then(users => {
    USERS = users;
    const path = 'users';
    history.pushState(null, 'Users', path);
    const render = routes(path);
    render(APP_ROOT, users);
  });
};

const handleSubmitEdit = e => {
  const ref = e.target;
  const id = ref.dataset.id;
  const user = USERS.find(current => +current['id'] === +id);
  updateUser(id, user).then(newUser => {
    console.log(`user ${id} successfully updated: `, newUser);
  });
  const APP_ROOT = document.getElementById('root');
  getUsers().then(users => {
    USERS = users;
    const path = 'users';
    history.pushState(null, 'Users', path);
    const render = routes(path);
    render(APP_ROOT, users);
  });
};

const handleCancelEdit = () => {
  const APP_ROOT = document.getElementById('root');
  getUsers().then(users => {
    USERS = users;
    const path = 'users';
    history.pushState(null, 'Users', path);
    const render = routes(path);
    render(APP_ROOT, users);
  });
};

const handleChangeInput = e => {
  const ref = e.target;
  const id = ref.dataset.id;
  const key = ref.dataset.key;
  const user = USERS.find(current => +current['id'] === +id);
  user[key] = ref.value;
};

class DataService {
  constructor(serviceURL) {
    this._serviceURL = serviceURL;
  }

  /**
   * Request to Rest API. GET Users JSON.
   * @returns {Promise<Response>} response data
   */
  async getDataAsync() {
    const response = await fetch(this._serviceURL);
    const data = await response.json();
    return data;
  }

  async deleteDataAsync(resourceID) {
    const response = await fetch(`${this._serviceURL}/${resourceID}`, {
      method: 'DELETE'
    });
    const resData = await response.json();
    return resData;
  }

  async updateDataAsync(resourceID, newData) {
    const response = await fetch(`${this._serviceURL}/${resourceID}`, {
      method: 'PUT',
      headers: {
        'Content-type': 'application/json; charset=UTF-8 '
      },
      body: JSON.stringify(newData)
    });
    const resData = await response.json();
    return resData;
  }
}

/**
 * Resolving 'Users' request to Rest API and
 * returns Users' promise.
 * @returns {Promise<Response>} response data
 */
const getUsers = async () => {
  let users = [];
  showSpinner();
  try {
    users = await serviceUsers.getDataAsync();
  } catch (err) {
    console.error(err);
  } finally {
    hideSpinner();
  }
  return users;
};

const deleteUser = async resourceID => {
  let response = {};

  showSpinner();
  try {
    response = await serviceUsers.deleteDataAsync(resourceID);
  } catch (err) {
    console.error(err);
  } finally {
    hideSpinner();
  }
  return response;
};

const updateUser = async (userID, user) => {
  let response = {};

  showSpinner();
  try {
    response = await serviceUsers.updateDataAsync(userID, user);
  } catch (err) {
    console.error(err);
  } finally {
    hideSpinner();
  }
  return response;
};

/**
 * Display users in the DOM
 * @param {HTMLElement} root - root element for render
 * @param {Array} users - array of users
 */
const showUsers = (root, users) => {
  const header = document.createElement('h1');
  header.classList.add('page-header');
  header.innerText = 'Users';
  const workspace = document.createElement('div');
  workspace.classList.add('workspace');
  users.forEach(user => {
    const card = document.createElement('div');
    card.classList.add('card');
    const items = _showObject(user);
    items.append(document.createElement('hr'));
    card.append(items);
    const controls = document.createElement('div');
    const btnEdit = document.createElement('button');
    const btnDelete = document.createElement('button');
    btnEdit.classList.add('btn-dark');
    btnDelete.classList.add('btn-dark');
    controls.classList.add('control-panel');
    btnEdit.innerText = 'EDIT';
    btnDelete.innerText = 'DELETE';
    btnEdit.dataset.id = user.id;
    btnDelete.dataset.id = user.id;
    btnEdit.addEventListener('click', handleEdit);
    btnDelete.addEventListener('click', handleDelete);
    controls.append(btnEdit, btnDelete);
    card.append(controls);
    workspace.append(card);

    function _showObject(object) {
      const wrap = document.createElement('div');
      wrap.classList.add('card_wrap');
      for (const [key, val] of Object.entries(object)) {
        const propRow = document.createElement('div');
        const propName = document.createElement('span');
        const propValue = document.createElement('span');
        propName.classList.add('card_prop');
        propRow.classList.add('card_row');
        propName.innerText = `${key}: `;
        propValue.classList.add('card_value');
        if (val instanceof Object) {
          const child = _showObject(val);
          propRow.append(propName, child);
        } else {
          propValue.innerText = val;
          propRow.append(propName, propValue);
        }
        wrap.append(propRow);
      }
      return wrap;
    }
  });
  root.innerHTML = '';
  root.append(header);
  root.append(workspace);
};

const showSpinner = () => {
  const spinner = document.getElementById('spinner');
  spinner.style.display = 'inline-block';
};

const hideSpinner = () => {
  const spinner = document.getElementById('spinner');
  spinner.style.display = 'none';
};

const showError = (root, error) => {
  root.innerHTML = '';
  let divError = document.createElement('div');
  divError.style.textAlign = 'center';
  divError.style.padding = '0.5em';
  divError.style.fontSize = '160%';
  divError.innerText = `Ops! ${error}`;
  root.appendChild(divError);
};

const showEdit = (root, userID) => {
  const user = USERS.find(current => +current['id'] === +userID);
  const header = document.createElement('h1');
  header.classList.add('page-header');
  header.innerText = `Edit id=${userID}`;
  const form = document.createElement('section');
  form.classList.add('edit-user');
  const submit = document.createElement('button');
  const cancel = document.createElement('button');
  submit.classList.add('btn-dark-outline');
  submit.innerText = 'SUBMIT';
  cancel.classList.add('btn-dark-outline');
  cancel.innerText = 'CANCEL';
  submit.dataset.id = userID;
  submit.addEventListener('click', handleSubmitEdit);
  cancel.addEventListener('click', handleCancelEdit);
  const panel = document.createElement('div');
  panel.classList.add('control-panel');
  panel.append(submit, cancel);

  const rows = (function (object) {
    const wrap = document.createElement('div');
    wrap.classList.add('edit-user_wrap');
    const generalHeader = document.createElement('h3');
    generalHeader.classList.add('edit-user_header');
    generalHeader.innerText = 'General user information';
    wrap.append(generalHeader);
    _addWrapRows(object);
    function _addWrapRows(object) {
      for (const [key, val] of Object.entries(object)) {
        const propRow = document.createElement('div');
        const propLabel = document.createElement('label');
        const propInput = document.createElement('input');
        propLabel.classList.add('edit-user_label');
        propRow.classList.add('edit-user_row');
        propLabel.innerText = `${key}: `;
        propInput.classList.add('edit-user_input');
        if (val instanceof Object) {
          const childHeader = document.createElement('h3');
          childHeader.classList.add('edit-user_header');
          childHeader.innerText = `${key}`;
          wrap.append(childHeader);
          _addWrapRows(val);
        } else {
          switch (key) {
            case 'lat':
            case 'lng':
              propInput.step = '0,0001';
              propInput.type = 'number';
              break;
            case 'id':
              propInput.step = '1';
              propInput.type = 'number';
              propInput.disabled = true;
              break;
            case 'email':
              propInput.type = 'email';
              propInput.maxLength = 30;
              break;
            case 'phone':
              propInput.type = 'tel';
              propInput.maxLength = 30;
              break;
            case 'website':
              propInput.type = 'url';
              propInput.maxLength = 30;
              break;
            case 'catchPhrase':
            case 'bs':
              propInput.maxLength = 100;
              break;
            default:
              propInput.type = 'text';
              propInput.maxLength = 40;
              break;
          }
          propInput.placeholder = key;
          propInput.id = key;
          propInput.value = val;
          propInput.dataset.id = userID;
          propInput.dataset.key = key;
          propInput.addEventListener('change', handleChangeInput);
          propLabel.htmlFor = key;
          propRow.append(propLabel, propInput);
          wrap.append(propRow);
        }
      }
    }
    return wrap;
  })(user);

  rows.append(document.createElement('hr'), panel);
  form.append(rows);

  root.innerHTML = '';
  root.append(header);
  root.append(form);
};

const routes = path => {
  const routes = {
    '': showUsers,
    users: showUsers.bind(null),
    error: showError 
  };
  let view =
    routes[path] ||
    showError.bind(
      null,
      document.getElementById('root'),
      'Error 404. Not found.'
    );
  if (/^.*edit\?id=(\d+)$/.test(path)) {
    view = showEdit.bind(null, document.getElementById('root'), RegExp.$1);
  }

  return view;
};

window.onload = () => {
  const APP_ROOT = document.getElementById('root');
  serviceUsers = new DataService(API.USERS);

  getUsers().then(users => {
    USERS = users;
    const path = 'users';
    history.pushState(null, 'Users', path);
    const render = routes(path);
    render(APP_ROOT, users);
  });
};

window.onpopstate = () => {
  const APP_ROOT = document.getElementById('root');
  const path = location.pathname + location.search;
  const isValid = /^.*(edit\?id=\d+|users)$/.test(path);
  const route = RegExp.$1;
  const render = routes(route);

  if (isValid && route === 'users') {
    getUsers().then(users => {
      USERS = users;
      render(APP_ROOT, users);
    });
  } else {
    render();
  }
};

import React, { useEffect, useState } from 'react';
import uuid from 'react-uuid';

const iDB =
  window.indexedDB ||
  window.mozIndexedDB ||
  window.webkitIndexedDB ||
  window.msIndexedDB ||
  window.shimIndexedDB;

const createCollection = () => {
  if (!iDB) {
    alert("Browser not support Indexed DB")
    return;
  }
  const request = iDB.open("myDatabase", 2);
  request.onerror = (event) => {
    alert("ERROR", event);
  }
  request.onupgradeneeded = (event) => {
    const db = request.result;
    if (!db.objectStoreNames.contains("userData")) {
      db.createObjectStore("userData", { keyPath: "id" });
    }
  }
  request.onsuccess = () => {
    console.log("Database open successfully!");
  }
}

const App = () => {
  const [firstName, setFirstName] = useState();
  const [lastName, setLastName] = useState();
  const [email, setEmail] = useState();
  const [allUserData, setAllUserData] = useState([]);
  const [addUser, setAddUser] = useState(false);
  const [editUser, setEditUser] = useState(false);
  const [selectedUser, setSelectedUser] = useState({})

  useEffect(() => {
    createCollection();
    getAllData();
  }, []);

  const getAllData = () => {
    const dbPromise = iDB.open("myDatabase", 2);
    dbPromise.onsuccess = () => {
      const db = dbPromise.result;
      const tx = db.transaction('userData', 'readonly');
      const userData = tx.objectStore('userData');
      const users = userData.getAll();
      users.onsuccess = (query) => {
        if (query.srcElement.result.length > 0) {
          setAllUserData(query.srcElement.result)
        } else {
          setAllUserData([{
            id: "df8ffd-7733-e853-db4d-2261eb7518",
            firstName: "Touqeer",
            lastName: "Hussain",
            email: "htouqeer938@gmail.com"
          }])
        }
      }
      users.onerror = (event) => {
        alert("Error", event)
      }
      tx.oncomplete = () => {
        db.close()
      }
    }
  }

  const handleSubmit = (event) => {
    const dbPromise = iDB.open("myDatabase", 2);
    if (firstName && lastName && email) {
      dbPromise.onsuccess = () => {
        const db = dbPromise.result;
        const tx = db.transaction('userData', 'readwrite');
        const userData = tx.objectStore('userData');
        if (addUser) {
          const user = userData.put({
            id: uuid(),
            firstName,
            lastName,
            email
          })
          user.onsuccess = () => {
            getAllData();
            tx.oncomplete = () => {
              db.close()
            }
            alert("User Added!")
          }
          user.onerror = (event) => {
            alert("error", event)
          }
        } else if (editUser) {
          const user = userData.put({
            id: selectedUser?.id,
            firstName,
            lastName,
            email
          })
          user.onsuccess = () => {
            getAllData();
            tx.oncomplete = () => {
              db.close()
            }
            alert("User updated!")
          }
          user.onerror = (event) => {
            alert("error", event)
          }
        }
      }
    }
  }

  const deleteUserHandler = (user) => {
    const dbPromise = iDB.open("myDatabase", 2);
    dbPromise.onsuccess = () => {
      const db = dbPromise.result;
      const tx = db.transaction('userData', 'readwrite');
      const userData = tx.objectStore('userData');
      const users = userData.delete(user?.id);
      users.onsuccess = (query) => {
        alert("User deleted!");
        getAllData()
      }
      users.onerror = (event) => {
        alert("Error", event)
      }
      tx.oncomplete = () => {
        db.close()
      }
    }
  }

  return (
    <div className="container">
      <div className="p-5 my-4 bg-light rounded-3">
        <h1>Index DB with Touqeer Hussain</h1>
      </div>
      <div className="row g-3">
        {
          addUser || editUser ? (
            <div className="col-md-12 col-lg-12 col-xl-12">

              <div className='card' style={{ padding: 20 }}>
                <h3>{editUser ? "Update" : "Add"} user</h3>
                <div className='form-group'>
                  <label>First Name</label>
                  <input type="text" name="firstName" className="form-control" onChange={e => setFirstName(e.target.value)} value={firstName} />
                </div>

                <div className='form-group'>
                  <label>Last Name</label>
                  <input type="text" name="lastName" className="form-control" onChange={e => setLastName(e.target.value)} value={lastName} />
                </div>

                <div className='form-group'>
                  <label>Email</label>
                  <input type="email" name="email" className="form-control" onChange={e => setEmail(e.target.value)} value={email} />
                </div>

                <div className='form-group'>
                  <button className='btn btn-primary mt-2' onClick={handleSubmit}>{editUser ? "Update" : "Save"}</button>
                  <button className='btn btn-danger mt-2' style={{ float: 'right' }} onClick={() => {
                    setAddUser(false);
                    setEditUser(false);
                    setSelectedUser({});
                    setFirstName("");
                    setLastName("");
                    setEmail("");
                  }}>Close</button>

                </div>

              </div></div>
          ) : ""
        }
        <div className="col-md-12 col-lg-12 col-xl-12 d-flex flex-column">
          <button className='btn btn-primary float-end mb-2 ' onClick={() => {
            setAddUser(true);
            setEditUser(false);
            setSelectedUser({});
            setFirstName("");
            setLastName("");
            setEmail("");
          }}>
            Add New
          </button>
          <div class="table-responsive">
            <table className='table table-bordered'>
              <thead>
                <tr>
                  <th scope="col">Sr.</th>
                  <th scope="col">First Name</th>
                  <th scope="col">Last Name</th>
                  <th scope="col">Email</th>
                  <th scope="col">Actions</th>
                </tr>
              </thead>
              <tbody>
                {
                  allUserData.map((user, i) => (
                    <tr key={i}>
                      <th scope="row">{i + 1}</th>
                      <td>{user.firstName}</td>
                      <td>{user.lastName}</td>
                      <td>{user.email}</td>
                      <td className='d-flex'>
                        <button className='btn btn-success' style={{ marginRight: 10 }} onClick={() => {
                          setAddUser(false);
                          setEditUser(true);
                          setSelectedUser(user);
                          setFirstName(user.firstName);
                          setLastName(user.lastName);
                          setEmail(user.email);
                        }}>Edit</button>
                        <button className='btn btn-danger' onClick={() => deleteUserHandler(user)}>Delete</button>
                      </td>
                    </tr>
                  ))
                }
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;

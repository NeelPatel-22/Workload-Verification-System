import { createContext, useContext, useState } from 'react';

import { MOCK_USERS } from '../mock/mockData';

//global auth context
const AuthContext = createContext(null);

//key used to store auth data in browser
const STORAGE_KEY = 'wvs_current_user';

export function AuthProvider({ children }) {
  /*
    auth state structure for understanding
    {
      token: "demo-token",
      user: {
        id,
        username,
        name,
        role,
        department
      }
    }
  */
  const [auth, setAuth] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  //login function;currently using mock data which will be replaced by backedn API call(JWT authentication)
  function login(username, password) {
    //this is removed after backendd is integrated
    const foundUser = MOCK_USERS.find(
      (user) => user.username === username && user.password === password
    );

    //if user not found; login failed
    if(!foundUser){
      return{success: false};
    }

    //replace above logic when backend is integrated
    // const res = await fetch('/api/login', {
    //   method: 'POST',
    //   headers: {'Content-Type': 'application/json'},
    //   body: JSON.stringify({username, password})
    // });

    // if(!res.ok){
    //   return{success:false};
    // }

    // const data = await res.json();

    // example of backend response:
    // {
    //   token: "jwt-token",
    //   user: {
    //     id,
    //     username,
    //     name,
    //     role,
    //     department
    //   }
    // }

    //this remains same; but value will come from backend
    const authData = {
      token: 'demo-token', //replaced by JWT token
      user:{
        id: foundUser.id,
        username: foundUser.username,
        name: foundUser.name,
        role: foundUser.role,
        department: foundUser.department,
      },
    };

    //save login info in browser
    localStorage.setItem(STORAGE_KEY, JSON.stringify(authData));

    //update state
    setAuth(authData);

    return{ 
      success: true, 
      user: authData.user,
    };
  }

  //logout function
  function logout() {
    localStorage.removeItem(STORAGE_KEY);
    setAuth(null);
  }

  //expose values to whole app
  const currentUser = auth?.user || null;
  const token = auth?.token || null;

  return (
    <AuthContext.Provider value={{ currentUser, token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

//custom hoook to uuser auth anywhere in the app
export function useAuth() {
  return useContext(AuthContext);
}

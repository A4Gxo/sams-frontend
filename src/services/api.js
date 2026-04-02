// src/services/api.js

const API = "https://sams-zsar.onrender.com"; // <-- Updated to production URL

export const loginUser = async (email, password) => {
  // Your specific backend expects standard JSON, not Form Data!
  const res = await fetch(`${API}/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email, password }),
  });
  
  return res.json();
};

export const getStudents = async (token) => {
  const res = await fetch(`${API}/students/`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return res.json();
};

export const getCourses = async (token) => {
  const res = await fetch(`${API}/courses/`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return res.json();
};
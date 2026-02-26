// utils/saveCustomDashboard.js
import { db } from "@/app/_utils/firebase";
import { collection, addDoc, setDoc, doc } from "firebase/firestore";

// Save a new chart
export const saveNewChart = async (userId, chartData) => {
  try {
    const docRef = await addDoc(collection(db, "users", userId, "charts"), chartData);
    return docRef.id;
  } catch (error) {
    console.error("Error saving chart:", error);
  }
};

// Update an existing chart
export const updateChart = async (userId, chartId, chartData) => {
  try {
    await setDoc(doc(db, "users", userId, "charts", chartId), chartData);
  } catch (error) {
    console.error("Error updating chart:", error);
  }
};
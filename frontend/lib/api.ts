import axios from "axios";
import { EmployeeData, PredictionResult } from "@/types";

const API_BASE = "http://localhost:8000";

export async function predict(data: EmployeeData): Promise<PredictionResult> {
  const response = await axios.post(`${API_BASE}/predict`, data);
  return response.data;
}

export async function checkHealth() {
  const response = await axios.get(`${API_BASE}/health`);
  return response.data;
}

export async function predictCSV(file: File): Promise<PredictionResult & { rows_in_file: number }> {
  const formData = new FormData();
  formData.append("file", file);
  const response = await axios.post(`${API_BASE}/predict-csv`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data;
}
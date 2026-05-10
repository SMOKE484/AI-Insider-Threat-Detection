export interface EmployeeData {
  employee_department: number;
  employee_campus: number;
  employee_position: number;
  employee_seniority_years: number;
  is_contractor: number;
  employee_classification: number;
  has_foreign_citizenship: number;
  has_criminal_record: number;
  total_printed_pages: number;
  num_printed_pages_off_hours: number;
  total_files_burned: number;
  burned_from_other: number;
  is_abroad: number;
  hostility_country_level: number;
  num_entries: number;
  num_unique_campus: number;
  entry_during_weekend: number;
}

export interface FlaggedFeature {
  feature: string;
  label: string;
  description: string;
  value: number;
  baseline: number;
  importance: number;
  severity: "HIGH" | "MEDIUM";
}

export interface FeatureChartItem {
  feature: string;
  importance: number;
}

export interface PredictionResult {
  prediction: "Malicious" | "Normal";
  confidence: number;
  normal_prob: number;
  threat_prob: number;
  flagged: FlaggedFeature[];
  feature_chart: FeatureChartItem[];
  risk_level: "HIGH" | "MEDIUM" | "LOW";
}
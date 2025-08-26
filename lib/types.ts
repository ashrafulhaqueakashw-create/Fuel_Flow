export type CustomerCreate = {
  type: "individual" | "commercial";
  name: string;
  company_name?: string | null;
  phone?: string | null;
  email?: string | null;
  address?: string | null;
  preferences?: Record<string, unknown> | null;
};

export type EmployeeCreate = {
  name: string;
  role: string;
  email?: string | null;
  phone?: string | null;
  password: string;
  salary?: number | null;
};

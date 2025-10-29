export interface User {
  id: string;
  email: string;
  role: 'admin' | 'student';
  name: string;
  attendanceHistory?: MealAttendance[];
  optOuts?: OptOut[];
  rebates?: Rebate[];
  reviews?: Review[];
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthResponse {
  success: boolean;
  user?: User;
  message?: string;
  token?: string;
}

export interface MealAttendance {
  _id: string;
  user: User | string;
  date: string;
  breakfast: boolean;
  lunch: boolean;
  dinner: boolean;
  totalMeals: number;
}

export interface OptOut {
  _id: string;
  user: User | string;
  startDate: string;
  endDate: string;
  reason: string;
  approved: boolean;
  adminNotes?: string;
  createdAt: string;
}

export interface Rebate {
  _id: string;
  user: User | string;
  monthYear: string;
  baseFee: number;
  totalDays: number;
  attendedDays: number;
  optOutDays: number;
  missedDays: number;
  calculatedAmount: number;
  status: 'pending' | 'approved' | 'rejected';
  approvedAt?: string;
  adminNotes?: string;
}

export interface Review {
  _id: string;
  user: User | string;
  mealDate: string;
  rating: number;
  comment: string;
  approved: boolean;
  createdAt: string;
}

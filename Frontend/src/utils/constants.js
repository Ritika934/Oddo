export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const ROLES = {
  FLEET_MANAGER: 'fleet_manager',
  DISPATCHER: 'dispatcher',
  SAFETY_OFFICER: 'safety_officer',
  FINANCE_ANALYST: 'finance_analyst',
};

export const ROLE_LABELS = {
  [ROLES.FLEET_MANAGER]: 'Fleet Manager',
  [ROLES.DISPATCHER]: 'Dispatcher',
  [ROLES.SAFETY_OFFICER]: 'Safety Officer',
  [ROLES.FINANCE_ANALYST]: 'Finance Analyst',
};

export const TOKEN_KEY = 'transitops_token';
export const USER_KEY = 'transitops_user';

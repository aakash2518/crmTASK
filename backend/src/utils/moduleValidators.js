/**
 * Validates module data dynamically based on the module slug.
 * Used to ensure strict data validation for the 6 core modules.
 */

const validateEmail = (email) => {
  return String(email)
    .toLowerCase()
    .match(
      /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|.(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
    );
};

const isValidDate = (dateString) => {
  const date = new Date(dateString);
  return !isNaN(date.getTime());
};

const validateSales = (data) => {
  const errors = [];
  if (!data.customer) errors.push('Customer is required');
  if (!data.amount || isNaN(Number(data.amount))) errors.push('Amount must be a valid number');
  if (data.status && !['Lead', 'In Progress', 'Won', 'Lost'].includes(data.status)) {
    errors.push('Status must be Lead, In Progress, Won, or Lost');
  }
  if (data.date && !isValidDate(data.date)) errors.push('Date must be a valid date');
  return errors;
};

const validateOperations = (data) => {
  const errors = [];
  if (!data.task) errors.push('Task is required');
  if (data.priority && !['Low', 'Medium', 'High'].includes(data.priority)) {
    errors.push('Priority must be Low, Medium, or High');
  }
  if (data.dueDate && !isValidDate(data.dueDate)) errors.push('Due Date must be a valid date');
  return errors;
};

const validateCustomers = (data) => {
  const errors = [];
  if (data.email && !validateEmail(data.email)) errors.push('Email is invalid');
  return errors;
};

const validateEmployees = (data) => {
  const errors = [];
  if (data.email && !validateEmail(data.email)) errors.push('Email is invalid');
  return errors;
};

const validateFinance = (data) => {
  const errors = [];
  if (!data.amount || isNaN(Number(data.amount))) errors.push('Amount must be a valid number');
  if (data.type && !['Income', 'Expense'].includes(data.type)) {
    errors.push('Type must be Income or Expense');
  }
  if (data.date && !isValidDate(data.date)) errors.push('Date must be a valid date');
  return errors;
};

const validateSupport = (data) => {
  const errors = [];
  if (data.priority && !['Low', 'Medium', 'High', 'Urgent'].includes(data.priority)) {
    errors.push('Priority must be Low, Medium, High, or Urgent');
  }
  return errors;
};

exports.validateModuleData = (slug, data) => {
  if (!data || typeof data !== 'object' || Array.isArray(data)) {
    return { isValid: false, errors: ['Data must be a valid object'], sanitizedData: null };
  }

  // Filter out any extra fields and validate existing ones
  let allowedFields = [];
  let errors = [];
  let sanitizedData = {};

  switch (slug) {
    case 'sales':
      allowedFields = ['customer', 'product', 'amount', 'status', 'agent', 'date'];
      errors = validateSales(data);
      break;
    case 'operations':
      allowedFields = ['task', 'assignee', 'priority', 'status', 'dueDate'];
      errors = validateOperations(data);
      break;
    case 'customers':
      allowedFields = ['email', 'phone', 'company', 'status']; // Note: 'name' usually goes in title, but let's allow it in data if needed or they just use title
      errors = validateCustomers(data);
      break;
    case 'employees':
      allowedFields = ['email', 'department', 'designation', 'status'];
      errors = validateEmployees(data);
      break;
    case 'finance':
      allowedFields = ['transaction', 'amount', 'type', 'category', 'date', 'status'];
      errors = validateFinance(data);
      break;
    case 'support':
      allowedFields = ['customer', 'issue', 'priority', 'status', 'agent'];
      errors = validateSupport(data);
      break;
    default:
      // For dynamic custom modules, we don't have a strict schema to validate against yet.
      // We will allow the data through as is.
      return { isValid: true, errors: [], sanitizedData: data };
  }

  if (errors.length > 0) {
    return { isValid: false, errors, sanitizedData: null };
  }

  // Sanitize to prevent mass assignment of arbitrary fields for the core 6 modules
  allowedFields.forEach(field => {
    if (data[field] !== undefined) {
      sanitizedData[field] = data[field];
    }
  });

  return { isValid: true, errors: [], sanitizedData };
};

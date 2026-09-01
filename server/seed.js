const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./src/models/User');
const Module = require('./src/models/Module');
const ModuleData = require('./src/models/ModuleData');

dotenv.config();

const INITIAL_MODULES = [
  { name: 'Sales', slug: 'sales', description: 'Sales management module', icon: '💰' },
  { name: 'Operations', slug: 'operations', description: 'Operations management module', icon: '⚙️' },
  { name: 'Customers', slug: 'customers', description: 'Customer management module', icon: '👥' },
  { name: 'Employees', slug: 'employees', description: 'Employee management module', icon: '👨‍💼' },
  { name: 'Finance', slug: 'finance', description: 'Finance management module', icon: '📊' },
  { name: 'Support', slug: 'support', description: 'Support management module', icon: '🎧' },
];

const generateSales = () => {
  return [
    { title: 'Acme Corp Software License', data: { customer: 'Acme Corp', product: 'Software License', amount: 15000, status: 'Won', agent: 'Alice', date: '2026-08-15' } },
    { title: 'Globex Enterprise Plan', data: { customer: 'Globex', product: 'Enterprise Plan', amount: 45000, status: 'In Progress', agent: 'Bob', date: '2026-08-20' } },
    { title: 'Stark Ind. Consulting', data: { customer: 'Stark Ind.', product: 'Consulting', amount: 120000, status: 'Lead', agent: 'Alice', date: '2026-08-25' } },
    { title: 'Wayne Ent. Support', data: { customer: 'Wayne Ent.', product: 'Support Contract', amount: 25000, status: 'Won', agent: 'Charlie', date: '2026-07-10' } },
    { title: 'Umbrella Corp Audit', data: { customer: 'Umbrella Corp', product: 'Security Audit', amount: 8000, status: 'Lost', agent: 'Bob', date: '2026-08-01' } },
    { title: 'Cyberdyne Hardware', data: { customer: 'Cyberdyne', product: 'Hardware', amount: 55000, status: 'In Progress', agent: 'Alice', date: '2026-08-28' } },
    { title: 'Initech Server Setup', data: { customer: 'Initech', product: 'Server Setup', amount: 12000, status: 'Won', agent: 'Charlie', date: '2026-08-18' } },
    { title: 'Hooli Cloud Storage', data: { customer: 'Hooli', product: 'Cloud Storage', amount: 35000, status: 'Lead', agent: 'Bob', date: '2026-08-30' } }
  ];
};

const generateOperations = () => {
  return [
    { title: 'Q3 Server Migration', data: { task: 'Migrate to AWS', assignee: 'David', priority: 'High', status: 'In Progress', dueDate: '2026-09-15' } },
    { title: 'Office Relocation', data: { task: 'Move to new HQ', assignee: 'Eve', priority: 'Medium', status: 'Pending', dueDate: '2026-10-01' } },
    { title: 'Annual Security Audit', data: { task: 'Perform ISO 27001 audit', assignee: 'Frank', priority: 'High', status: 'Active', dueDate: '2026-09-30' } },
    { title: 'Update HR Policies', data: { task: 'Revise employee handbook', assignee: 'Eve', priority: 'Low', status: 'Active', dueDate: '2026-09-05' } },
    { title: 'Vendor Review', data: { task: 'Evaluate Q2 vendors', assignee: 'David', priority: 'Medium', status: 'Inactive', dueDate: '2026-08-20' } },
    { title: 'Network Upgrade', data: { task: 'Install new routers', assignee: 'Frank', priority: 'High', status: 'Pending', dueDate: '2026-09-10' } },
    { title: 'Team Building Event', data: { task: 'Organize retreat', assignee: 'Eve', priority: 'Low', status: 'In Progress', dueDate: '2026-09-25' } },
    { title: 'Software Licenses Audit', data: { task: 'Check Adobe licenses', assignee: 'David', priority: 'Medium', status: 'Active', dueDate: '2026-09-12' } }
  ];
};

const generateCustomers = () => {
  return [
    { title: 'Acme Corp', data: { email: 'contact@acme.com', phone: '555-0101', company: 'Acme Corp', status: 'Active' } },
    { title: 'Globex', data: { email: 'info@globex.com', phone: '555-0102', company: 'Globex Inc', status: 'Active' } },
    { title: 'Stark Industries', data: { email: 'tony@stark.com', phone: '555-0103', company: 'Stark Industries', status: 'Inactive' } },
    { title: 'Wayne Enterprises', data: { email: 'bruce@wayne.com', phone: '555-0104', company: 'Wayne Enterprises', status: 'Active' } },
    { title: 'Umbrella Corp', data: { email: 'admin@umbrella.com', phone: '555-0105', company: 'Umbrella Corp', status: 'Pending' } },
    { title: 'Cyberdyne Systems', data: { email: 'skynet@cyberdyne.com', phone: '555-0106', company: 'Cyberdyne', status: 'Active' } },
    { title: 'Initech', data: { email: 'lumbergh@initech.com', phone: '555-0107', company: 'Initech', status: 'Active' } },
    { title: 'Hooli', data: { email: 'gavin@hooli.com', phone: '555-0108', company: 'Hooli', status: 'Inactive' } }
  ];
};

const generateEmployees = () => {
  return [
    { title: 'Alice Johnson', data: { email: 'alice@company.com', department: 'Sales', designation: 'Senior Account Executive', status: 'Active' } },
    { title: 'Bob Smith', data: { email: 'bob@company.com', department: 'Sales', designation: 'Account Executive', status: 'Active' } },
    { title: 'Charlie Davis', data: { email: 'charlie@company.com', department: 'Sales', designation: 'Sales Manager', status: 'Active' } },
    { title: 'David Wilson', data: { email: 'david@company.com', department: 'Operations', designation: 'IT Admin', status: 'Active' } },
    { title: 'Eve Brown', data: { email: 'eve@company.com', department: 'Operations', designation: 'Operations Manager', status: 'Active' } },
    { title: 'Frank Miller', data: { email: 'frank@company.com', department: 'Operations', designation: 'Security Analyst', status: 'Active' } },
    { title: 'Grace Taylor', data: { email: 'grace@company.com', department: 'Finance', designation: 'Accountant', status: 'Inactive' } },
    { title: 'Henry Moore', data: { email: 'henry@company.com', department: 'Support', designation: 'Support Lead', status: 'Active' } }
  ];
};

const generateFinance = () => {
  return [
    { title: 'Office Rent Sept', data: { transaction: 'Rent Payment', amount: 5000, type: 'Expense', category: 'Rent', date: '2026-09-01', status: 'Active' } },
    { title: 'Acme Invoice Payment', data: { transaction: 'Invoice #1001', amount: 15000, type: 'Income', category: 'Sales', date: '2026-08-15', status: 'Active' } },
    { title: 'Wayne Ent Invoice Payment', data: { transaction: 'Invoice #1002', amount: 25000, type: 'Income', category: 'Sales', date: '2026-08-20', status: 'Active' } },
    { title: 'AWS Cloud Hosting', data: { transaction: 'AWS Bill August', amount: 1200, type: 'Expense', category: 'Infrastructure', date: '2026-08-31', status: 'Active' } },
    { title: 'Employee Salaries August', data: { transaction: 'Payroll', amount: 45000, type: 'Expense', category: 'Payroll', date: '2026-08-25', status: 'Active' } },
    { title: 'Initech Invoice Payment', data: { transaction: 'Invoice #1003', amount: 12000, type: 'Income', category: 'Sales', date: '2026-08-28', status: 'Pending' } },
    { title: 'Marketing Campaign Ad Spend', data: { transaction: 'Google Ads', amount: 3500, type: 'Expense', category: 'Marketing', date: '2026-08-10', status: 'Active' } },
    { title: 'Office Supplies', data: { transaction: 'Staples Order', amount: 450, type: 'Expense', category: 'Supplies', date: '2026-08-05', status: 'Active' } }
  ];
};

const generateSupport = () => {
  return [
    { title: 'Login Issue', data: { customer: 'Acme Corp', issue: 'Cannot access portal', priority: 'High', status: 'Active', agent: 'Henry' } },
    { title: 'Billing Query', data: { customer: 'Globex', issue: 'Question about Invoice #1002', priority: 'Medium', status: 'Pending', agent: 'Henry' } },
    { title: 'Bug in Dashboard', data: { customer: 'Stark Industries', issue: 'Charts not loading', priority: 'Urgent', status: 'In Progress', agent: 'Henry' } },
    { title: 'Feature Request', data: { customer: 'Wayne Enterprises', issue: 'Export to PDF', priority: 'Low', status: 'Active', agent: 'Grace' } },
    { title: 'Password Reset', data: { customer: 'Umbrella Corp', issue: 'Need password reset', priority: 'High', status: 'Closed', agent: 'Henry' } },
    { title: 'Data Missing', data: { customer: 'Cyberdyne', issue: 'Recent records not showing', priority: 'Urgent', status: 'In Progress', agent: 'Henry' } },
    { title: 'API Documentation', data: { customer: 'Initech', issue: 'Where to find API docs', priority: 'Low', status: 'Closed', agent: 'Grace' } },
    { title: 'Integration Issue', data: { customer: 'Hooli', issue: 'Slack integration failing', priority: 'Medium', status: 'Active', agent: 'Henry' } }
  ];
};

const seedDatabase = async () => {
  try {
    if (!process.env.MONGODB_URI) {
      console.error('FATAL ERROR: MONGODB_URI environment variable is not defined.');
      process.exit(1);
    }
    await mongoose.connect(process.env.MONGODB_URI);

    // Clear existing data completely for a clean idempotent run
    await User.deleteMany();
    await ModuleData.deleteMany();
    await Module.deleteMany();

    // Seed modules
    const modules = await Module.insertMany(INITIAL_MODULES);
    console.log(`Seeded ${modules.length} modules`);

    // Seed admin
    const admin = await User.create({
      name: 'Admin User',
      email: 'admin@test.com',
      password: 'password123',
      role: 'ADMIN',
    });
    console.log('Seeded Admin user');

    // Seed manager with Sales, Customers, Support assigned
    const salesMod = modules.find((m) => m.slug === 'sales');
    const customersMod = modules.find((m) => m.slug === 'customers');
    const supportMod = modules.find((m) => m.slug === 'support');
    
    // Additional modules to get mapping
    const opsMod = modules.find((m) => m.slug === 'operations');
    const empMod = modules.find((m) => m.slug === 'employees');
    const finMod = modules.find((m) => m.slug === 'finance');

    await User.create({
      name: 'Manager User',
      email: 'manager@test.com',
      password: 'password123',
      role: 'MANAGER',
      assignedModules: [salesMod._id, customersMod._id, supportMod._id],
    });
    console.log('Seeded Manager user with Sales, Customers, Support');

    // Seed ModuleData
    const dataToInsert = [
      ...generateSales().map(d => ({ ...d, moduleId: salesMod._id, createdBy: admin._id })),
      ...generateOperations().map(d => ({ ...d, moduleId: opsMod._id, createdBy: admin._id })),
      ...generateCustomers().map(d => ({ ...d, moduleId: customersMod._id, createdBy: admin._id })),
      ...generateEmployees().map(d => ({ ...d, moduleId: empMod._id, createdBy: admin._id })),
      ...generateFinance().map(d => ({ ...d, moduleId: finMod._id, createdBy: admin._id })),
      ...generateSupport().map(d => ({ ...d, moduleId: supportMod._id, createdBy: admin._id }))
    ];
    
    await ModuleData.insertMany(dataToInsert);
    console.log(`Seeded ${dataToInsert.length} ModuleData records`);

    console.log('Seed complete!');
    process.exit();
  } catch (error) {
    console.error('Database Connection/Seed Error: Failed to connect to MongoDB or seed data.');
    console.error(error.message);
    process.exit(1);
  }
};

seedDatabase();

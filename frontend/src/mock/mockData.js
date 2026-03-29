// Mock users covering all four roles in the system.
// Passwords are for demo only — real auth will be handled by the backend.
export const MOCK_USERS = [
  // Academic Staff
  { id: 1,  username: 'dummy01', password: 'password', name: 'Dummy, 01', role: 'staff',      department: 'CSSE' },
  { id: 2,  username: 'dummy02', password: 'password', name: 'Dummy, 02', role: 'staff',      department: 'CSSE' },
  { id: 3,  username: 'dummy03', password: 'password', name: 'Dummy, 03', role: 'staff',      department: 'CSSE' },
  { id: 4,  username: 'dummy04', password: 'password', name: 'Dummy, 04', role: 'staff',      department: 'CSSE' },
  { id: 5,  username: 'dummy05', password: 'password', name: 'Dummy, 05', role: 'staff',      department: 'CSSE' },
  { id: 6,  username: 'dummy06', password: 'password', name: 'Dummy, 06', role: 'staff',      department: 'CSSE' },
  { id: 7,  username: 'dummy07', password: 'password', name: 'Dummy, 07', role: 'staff',      department: 'CSSE' },
  { id: 8,  username: 'dummy08', password: 'password', name: 'Dummy, 08', role: 'staff',      department: 'Mathematics' },
  { id: 9,  username: 'dummy09', password: 'password', name: 'Dummy, 09', role: 'staff',      department: 'CSSE' },
  { id: 10, username: 'dummy10', password: 'password', name: 'Dummy, 10', role: 'staff',      department: 'Mathematics' },
  { id: 11, username: 'dummy11', password: 'password', name: 'Dummy, 11', role: 'staff',      department: 'Mathematics' },
  { id: 12, username: 'dummy12', password: 'password', name: 'Dummy, 12', role: 'staff',      department: 'Mathematics' },
  { id: 13, username: 'dummy13', password: 'password', name: 'Dummy, 13', role: 'staff',      department: 'Mathematics' },
  { id: 14, username: 'dummy14', password: 'password', name: 'Dummy, 14', role: 'staff',      department: 'Physics' },
  { id: 15, username: 'dummy15', password: 'password', name: 'Dummy, 15', role: 'staff',      department: 'Physics' },
  { id: 16, username: 'dummy16', password: 'password', name: 'Dummy, 16', role: 'staff',      department: 'Physics' },
  { id: 17, username: 'dummy17', password: 'password', name: 'Dummy, 17', role: 'staff',      department: 'Physics' },
  { id: 18, username: 'dummy18', password: 'password', name: 'Dummy, 18', role: 'staff',      department: 'Physics' },
  // Heads of Department
  { id: 19, username: 'hod.csse', password: 'password', name: 'HoD – CSSE',        role: 'hod', department: 'CSSE' },
  { id: 20, username: 'hod.maths', password: 'password', name: 'HoD – Mathematics', role: 'hod', department: 'Mathematics' },
  { id: 21, username: 'hod.physics', password: 'password', name: 'HoD – Physics',   role: 'hod', department: 'Physics' },
  // Head of School & Operations
  { id: 22, username: 'hos', password: 'password', name: 'Head of School',      role: 'hos',        department: null },
  { id: 23, username: 'ops', password: 'password', name: 'School Operations',   role: 'operations', department: null },
];

// Workload summary data sourced from client dummy file:
// "Dummy_Updated_ of 2025_Workload Summary – Regan's template.xlsm"
// Sheet: Report - Staff
// Columns: Staff Member | FTE | Teaching | Assigned Role | Self-Directed Service | HDR | Research | Total
export const MOCK_WORKLOAD = [
  { staffId: 1,  name: 'Dummy, 01', department: 'CSSE',        fte: 1.00, teaching: 24.99, assignedRole: 50.00, service: 10.00, hdSupervision: 4.00,   research: 11.01, total: 100,  targetBand: 'Balanced T&R',     calcBand: 'Balanced T&R',    hasDiscrepancy: false },
  { staffId: 2,  name: 'Dummy, 02', department: 'CSSE',        fte: 0.92, teaching: 30.03, assignedRole:  0.00, service:  9.20, hdSupervision: 0.00,   research: 52.77, total:  92,  targetBand: 'Balanced T&R',     calcBand: 'Balanced T&R',    hasDiscrepancy: false },
  { staffId: 3,  name: 'Dummy, 03', department: 'CSSE',        fte: 0.92, teaching:  7.54, assignedRole:  0.00, service:  9.20, hdSupervision: 1.00,   research: 74.26, total:  92,  targetBand: 'Balanced T&R',     calcBand: 'Research Focused', hasDiscrepancy: true },
  { staffId: 4,  name: 'Dummy, 04', department: 'CSSE',        fte: 1.00, teaching:  6.42, assignedRole: 15.01, service: 10.00, hdSupervision: 5.00,   research: 63.57, total: 100,  targetBand: 'Balanced T&R',     calcBand: 'Research Focused', hasDiscrepancy: true },
  { staffId: 5,  name: 'Dummy, 05', department: 'CSSE',        fte: 1.00, teaching: 20.00, assignedRole:  0.00, service: 10.00, hdSupervision: 25.75,  research: 44.25, total: 100,  targetBand: 'Balanced T&R',     calcBand: 'Balanced T&R',    hasDiscrepancy: false },
  { staffId: 6,  name: 'Dummy, 06', department: 'CSSE',        fte: 1.00, teaching: 54.51, assignedRole:  0.00, service: 10.00, hdSupervision: 1.00,   research: 34.49, total: 100,  targetBand: 'Balanced T&R',     calcBand: 'Balanced T&R',    hasDiscrepancy: false },
  { staffId: 7,  name: 'Dummy, 07', department: 'CSSE',        fte: 1.00, teaching: 29.29, assignedRole:  0.00, service: 10.00, hdSupervision: 5.25,   research: 55.46, total: 100,  targetBand: 'Research Focused', calcBand: 'Balanced T&R',    hasDiscrepancy: true },
  { staffId: 8,  name: 'Dummy, 08', department: 'Mathematics', fte: 1.00, teaching: 21.94, assignedRole:  0.00, service: 10.00, hdSupervision: 8.25,   research: 59.81, total: 100,  targetBand: 'Balanced T&R',     calcBand: 'Balanced T&R',    hasDiscrepancy: false },
  { staffId: 9,  name: 'Dummy, 09', department: 'CSSE',        fte: 1.00, teaching: 10.03, assignedRole: 59.07, service: 10.00, hdSupervision: 3.75,   research: 17.15, total: 100,  targetBand: 'Balanced T&R',     calcBand: 'Balanced T&R',    hasDiscrepancy: false },
  { staffId: 10, name: 'Dummy, 10', department: 'Mathematics', fte: 1.00, teaching:  0.00, assignedRole:  0.00, service: 10.00, hdSupervision: 0.00,   research: 90.00, total: 100,  targetBand: 'Research Focused', calcBand: 'Research Focused', hasDiscrepancy: false },
  { staffId: 11, name: 'Dummy, 11', department: 'Mathematics', fte: 1.00, teaching:  1.60, assignedRole:  8.12, service: 10.00, hdSupervision: 0.00,   research: 80.28, total: 100,  targetBand: 'Balanced T&R',     calcBand: 'Research Focused', hasDiscrepancy: true },
  { staffId: 12, name: 'Dummy, 12', department: 'Mathematics', fte: 1.00, teaching:  0.00, assignedRole: 10.03, service: 10.00, hdSupervision: 5.00,   research: 74.97, total: 100,  targetBand: 'Balanced T&R',     calcBand: 'Research Focused', hasDiscrepancy: true },
  { staffId: 13, name: 'Dummy, 13', department: 'Mathematics', fte: 1.00, teaching: 16.00, assignedRole:  6.67, service: 10.00, hdSupervision: 7.50,   research: 59.83, total: 100,  targetBand: 'Balanced T&R',     calcBand: 'Balanced T&R',    hasDiscrepancy: false },
  { staffId: 14, name: 'Dummy, 14', department: 'Physics',     fte: 1.00, teaching: 30.40, assignedRole:  0.00, service: 10.00, hdSupervision: 2.50,   research: 57.10, total: 100,  targetBand: 'Teaching Focused', calcBand: 'Balanced T&R',    hasDiscrepancy: true },
  { staffId: 15, name: 'Dummy, 15', department: 'Physics',     fte: 1.00, teaching:  1.60, assignedRole:  0.00, service: 10.00, hdSupervision: 0.00,   research: 88.40, total: 100,  targetBand: 'Balanced T&R',     calcBand: 'Research Focused', hasDiscrepancy: true },
  { staffId: 16, name: 'Dummy, 16', department: 'Physics',     fte: 0.96, teaching: 13.26, assignedRole: 12.17, service:  9.60, hdSupervision: 18.50,  research: 42.47, total:  96,  targetBand: 'Balanced T&R',     calcBand: 'Balanced T&R',    hasDiscrepancy: false },
  { staffId: 17, name: 'Dummy, 17', department: 'Physics',     fte: 0.80, teaching:  7.19, assignedRole: 10.03, service:  8.00, hdSupervision: 4.00,   research: 50.78, total:  80,  targetBand: 'Balanced T&R',     calcBand: 'Research Focused', hasDiscrepancy: true },
  { staffId: 18, name: 'Dummy, 18', department: 'Physics',     fte: 1.00, teaching: 17.60, assignedRole:  0.00, service: 10.00, hdSupervision: 0.00,   research: 72.40, total: 100,  targetBand: 'Research Focused', calcBand: 'Research Focused', hasDiscrepancy: false },
];

// Validation issues derived from T:R discrepancy flag in client data.
export const MOCK_VALIDATION_ISSUES = [
  { id: 1,  staffId: 3,  staffName: 'Dummy, 03', department: 'CSSE',        type: 'T:R Band Mismatch', severity: 'warning', description: 'Target band is Balanced T&R (0.50) but calculated ratio is 0.09 — classified as Research Focused.' },
  { id: 2,  staffId: 4,  staffName: 'Dummy, 04', department: 'CSSE',        type: 'T:R Band Mismatch', severity: 'warning', description: 'Target band is Balanced T&R (0.50) but calculated ratio is 0.09 — classified as Research Focused.' },
  { id: 3,  staffId: 7,  staffName: 'Dummy, 07', department: 'CSSE',        type: 'T:R Band Mismatch', severity: 'warning', description: 'Target band is Research Focused (0.00) but calculated ratio is 0.35 — classified as Balanced T&R.' },
  { id: 4,  staffId: 11, staffName: 'Dummy, 11', department: 'Mathematics', type: 'T:R Band Mismatch', severity: 'warning', description: 'Target band is Balanced T&R (0.50) but calculated ratio is 0.02 — classified as Research Focused.' },
  { id: 5,  staffId: 12, staffName: 'Dummy, 12', department: 'Mathematics', type: 'T:R Band Mismatch', severity: 'warning', description: 'Target band is Balanced T&R (0.50) but calculated ratio is 0.00 — classified as Research Focused.' },
  { id: 6,  staffId: 14, staffName: 'Dummy, 14', department: 'Physics',     type: 'T:R Band Mismatch', severity: 'warning', description: 'Target band is Teaching Focused (0.90) but calculated ratio is 0.35 — classified as Balanced T&R.' },
  { id: 7,  staffId: 15, staffName: 'Dummy, 15', department: 'Physics',     type: 'T:R Band Mismatch', severity: 'warning', description: 'Target band is Balanced T&R (0.50) but calculated ratio is 0.02 — classified as Research Focused.' },
  { id: 8,  staffId: 17, staffName: 'Dummy, 17', department: 'Physics',     type: 'T:R Band Mismatch', severity: 'warning', description: 'Target band is Balanced T&R (0.50) but calculated ratio is 0.12 — classified as Research Focused.' },
];

// Sample queries — fabricated to demonstrate the query workflow.
export const MOCK_QUERIES = [
  {
    id: 1,
    staffId: 3,
    staffName: 'Dummy, 03',
    department: 'CSSE',
    subject: 'Teaching allocation appears too low',
    message: 'My target is Balanced T&R but my teaching allocation seems much lower than expected. Please review.',
    status: 'pending',
    submittedAt: '2026-03-18',
    hodComment: null,
  },
  {
    id: 2,
    staffId: 14,
    staffName: 'Dummy, 14',
    department: 'Physics',
    subject: 'Teaching allocation does not match Teaching Focused contract',
    message: 'I am on a Teaching Focused contract (90% teaching target) but my allocation shows only 30.4%. Please correct.',
    status: 'approved',
    submittedAt: '2026-03-15',
    hodComment: 'Confirmed. The allocation will be reviewed and corrected before the central submission.',
  },
  {
    id: 3,
    staffId: 7,
    staffName: 'Dummy, 07',
    department: 'CSSE',
    subject: 'Research allocation higher than expected',
    message: 'I believe my research allocation is incorrect — my contract is Research Focused but the system shows Balanced T&R.',
    status: 'declined',
    submittedAt: '2026-03-10',
    hodComment: 'After review, the allocation is correct based on your current-year assigned duties. Please contact HR if you believe your contract classification has changed.',
  },
];

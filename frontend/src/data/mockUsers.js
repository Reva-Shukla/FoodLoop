/**
 * Mock Users Directory for Campus Supervisor Administrative View
 * Aligned with Java backend role definitions (MESS, NGO, ADMIN)
 */

export const MOCK_CAMPUS_USERS = [
  {
    id: 'user-admin-01',
    name: 'Dr. R. K. Sharma',
    email: 'admin@test.com',
    role: 'ADMIN',
    roleTitle: 'Campus Supervisor',
    department: 'University Administration & Student Welfare',
    status: 'ACTIVE',
    registeredDate: '2026-08-15',
    lastActive: 'Just now',
  },
  {
    id: 'user-mess-01',
    name: 'Vikram Singh',
    email: 'mess@test.com',
    role: 'MESS',
    roleTitle: 'Mess Manager',
    assignedMessId: 'mess-b-franklin',
    assignedMessName: 'Franklin Mess',
    status: 'ACTIVE',
    registeredDate: '2026-09-01',
    lastActive: '5 mins ago',
  },
  {
    id: 'user-mess-02',
    name: 'Sunita Verma',
    email: 'sunita.mess@chitkara.edu.in',
    role: 'MESS',
    roleTitle: 'Mess Manager',
    assignedMessId: 'mess-g-pi',
    assignedMessName: 'Pi Mess',
    status: 'ACTIVE',
    registeredDate: '2026-09-05',
    lastActive: '2 hours ago',
  },
  {
    id: 'user-mess-03',
    name: 'Rajesh Kumar',
    email: 'rajesh.mess@chitkara.edu.in',
    role: 'MESS',
    roleTitle: 'Mess Manager',
    assignedMessId: 'mess-b-alfred',
    assignedMessName: 'Alfred Mess',
    status: 'ACTIVE',
    registeredDate: '2026-09-12',
    lastActive: '1 day ago',
  },
  {
    id: 'user-ngo-01',
    name: 'Regional Relief Coordinator',
    email: 'ngo@test.com',
    role: 'NGO',
    roleTitle: 'NGO Partner',
    organization: 'NGO Demo Partner',
    status: 'ACTIVE',
    registeredDate: '2026-09-20',
    lastActive: '12 mins ago',
  },
];

// Modular Frontend-Only Pending Registration Requests Preview
export const MOCK_REGISTRATION_REQUESTS = [
  {
    id: 'req-001',
    name: 'Harpreet Kaur',
    email: 'harpreet.magellan@chitkara.edu.in',
    requestedRole: 'MESS',
    requestedRoleTitle: 'Mess Manager',
    proposedMess: 'Magellan Mess',
    requestDate: '2026-11-20',
    status: 'PENDING',
    notes: 'Staff ID verification submitted for Magellan Hostel dining hall.',
  },
  {
    id: 'req-002',
    name: 'Robin Community Seva Trust',
    email: 'contact@communityrelief-pb.org',
    requestedRole: 'NGO',
    requestedRoleTitle: 'NGO Partner',
    organization: 'Community Relief Punjab',
    requestDate: '2026-11-21',
    status: 'PENDING',
    notes: 'Local surplus cooked food redistribution volunteer network request.',
  },
];

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useTheme } from '../../contexts/ThemeContext';
import {
  Search,
  Filter,
  MoreVertical,
  Edit,
  Trash2,
  Ban,
  CheckCircle,
  Mail,
  UserPlus,
  Download,
  X,
  Eye,
  EyeOff
} from 'lucide-react';
import Papa from 'papaparse'; // Import papaparse

const UserManagement = () => {
  const { isDark } = useTheme();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRole, setSelectedRole] = useState('student');
  const [showAddFacultyModal, setShowAddFacultyModal] = useState(false);
  const [showAddStudentModal, setShowAddStudentModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [facultyForm, setFacultyForm] = useState({
    name: '',
    email: '',
    password: '',
    subjects: []
  });
  const [studentForm, setStudentForm] = useState({
    name: '',
    email: '',
    password: ''
  });
  const [editForm, setEditForm] = useState({
    name: '',
    email: '',
    subjects: []
  });

  // --- New State for Bulk Upload ---
  const [studentBulkFile, setStudentBulkFile] = useState(null);
  const [facultyBulkFile, setFacultyBulkFile] = useState(null);
  // ---------------------------------

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
  const [availableSubjects, setAvailableSubjects] = useState([]);

useEffect(() => {
  fetchUsers();
  fetchSubjects();
}, []);

const handleDownloadTemplate = () => {
  const link = document.createElement('a');
  link.href = '/users_template.csv';
  link.download = 'users_template.csv';
  link.click();
};

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/auth/users`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (response.data.success) {
        setUsers(response.data.users);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      setError('Failed to load users');
    }
  };

  const fetchSubjects = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/subjects`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (response.data.success) {
        setAvailableSubjects(response.data.data.map(subject => subject.name));
      }
    } catch (error) {
      console.error('Error fetching subjects:', error);
    }
  };

  const studentCount = users.filter(u => u.role === 'user').length;
  const facultyCount = users.filter(u => u.role === 'instructor').length;

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole =
      (selectedRole === 'student' && user.role === 'user') ||
      (selectedRole === 'faculty' && user.role === 'instructor');
    return matchesSearch && matchesRole;
  });

  const getRoleBadge = (role) => {
    if (role === 'instructor') return isDark ? 'bg-purple-900/30 text-purple-400' : 'bg-purple-100 text-purple-800';
    if (role === 'admin') return isDark ? 'bg-red-900/30 text-red-400' : 'bg-red-100 text-red-800';
    return isDark ? 'bg-blue-900/30 text-blue-400' : 'bg-blue-100 text-blue-800';
  };

  const getRoleDisplay = (role) => {
    if (role === 'instructor') return 'Faculty';
    if (role === 'admin') return 'Admin';
    return 'Student';
  };

  const handleSubjectToggle = (subject) => {
    setFacultyForm(prev => ({
      ...prev,
      subjects: prev.subjects.includes(subject)
        ? prev.subjects.filter(s => s !== subject)
        : [...prev.subjects, subject]
    }));
  };

  const handleAddFaculty = async () => {
    if (!facultyForm.name || !facultyForm.email || !facultyForm.password || facultyForm.subjects.length === 0) {
      setError('Please fill all required fields');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${API_URL}/auth/faculty`,
        facultyForm,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.success) {
        setSuccess('Faculty member added successfully!');
        setShowAddFacultyModal(false);
        setFacultyForm({ name: '', email: '', password: '', subjects: [] });
        setShowPassword(false);
        fetchUsers();
        setTimeout(() => setSuccess(''), 3000);
      }
    } catch (error) {
      console.error('Error adding faculty:', error);
      setError(error.response?.data?.message || 'Failed to add faculty member');
    } finally {
      setLoading(false);
    }
  };

  const handleAddStudent = async () => {
    if (!studentForm.name || !studentForm.email || !studentForm.password) {
      setError('Please fill all required fields');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${API_URL}/auth/register`,
        studentForm,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.success) {
        setSuccess('Student added successfully!');
        setShowAddStudentModal(false);
        setStudentForm({ name: '', email: '', password: '' });
        setShowPassword(false);
        fetchUsers();
        setTimeout(() => setSuccess(''), 3000);
      }
    } catch (error) {
      console.error('Error adding student:', error);
      setError(error.response?.data?.message || 'Failed to add student');
    } finally {
      setLoading(false);
    }
  };

  // --- New Bulk Add Student Handler ---
  const handleAddStudentBulk = () => {
    if (!studentBulkFile) {
      setError('Please select a CSV file first.');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');
    let successCount = 0;
    let failCount = 0;
    const errors = [];
    const token = localStorage.getItem('token');

    Papa.parse(studentBulkFile, {
      header: true,
      skipEmptyLines: true,
      complete: async (results) => {
        const students = results.data;
        if (students.length === 0) {
          setError("CSV is empty or invalid.");
          setLoading(false);
          return;
        }

        for (const [index, student] of students.entries()) {
          if (!student.name || !student.email || !student.password) {
            console.error(`Row ${index + 1} skipped: missing name, email, or password.`);
            errors.push(`Row ${index + 1}: missing required fields.`);
            failCount++;
            continue;
          }

          try {
            await axios.post(
              `${API_URL}/auth/register`,
              { name: student.name, email: student.email, password: student.password },
              { headers: { Authorization: `Bearer ${token}` } }
            );
            successCount++;
          } catch (error) {
            console.error(`Error adding student ${student.email}:`, error);
            errors.push(`Row ${index + 1} (${student.email}): ${error.response?.data?.message || 'Failed'}`);
            failCount++;
          }
        }

        setLoading(false);
        setSuccess(`Bulk add complete. Added: ${successCount}. Failed: ${failCount}.`);
        if (failCount > 0) {
          setSuccess(`Bulk add complete. Added: ${successCount}. Failed: ${failCount}. See console for error details.`);
          console.error("Bulk add errors:", errors);
        }
        
        fetchUsers();
        setShowAddStudentModal(false);
        setStudentBulkFile(null);
        const fileInput = document.getElementById('student-bulk-file');
        if (fileInput) fileInput.value = null;
        setTimeout(() => setSuccess(''), 5000); // Longer timeout for bulk
      },
      error: (error) => {
        console.error('Error parsing CSV file:', error);
        setError(`Failed to parse CSV file: ${error.message}`);
        setLoading(false);
      }
    });
  };

  // --- New Bulk Add Faculty Handler ---
  const handleAddFacultyBulk = () => {
    if (!facultyBulkFile) {
      setError('Please select a CSV file first.');
      return;
    }
    
    setLoading(true);
    setError('');
    setSuccess('');
    let successCount = 0;
    let failCount = 0;
    const errors = [];
    const token = localStorage.getItem('token');

    Papa.parse(facultyBulkFile, {
      header: true,
      skipEmptyLines: true,
      complete: async (results) => {
        const faculty = results.data;
        if (faculty.length === 0) {
          setError("CSV is empty or invalid.");
          setLoading(false);
          return;
        }

        for (const [index, user] of faculty.entries()) {
          if (!user.name || !user.email || !user.password || !user.subjects) {
            console.error(`Row ${index + 1} skipped: missing name, email, password, or subjects.`);
            errors.push(`Row ${index + 1}: missing required fields.`);
            failCount++;
            continue;
          }
          
          // Parse subjects. Assuming comma-separated string: "Math,Physics"
          const subjects = user.subjects.split(',').map(s => s.trim()).filter(Boolean);
          
          if (subjects.length === 0) {
             console.error(`Row ${index + 1} skipped: 'subjects' column is empty or invalid.`);
             errors.push(`Row ${index + 1}: 'subjects' column is empty.`);
             failCount++;
             continue;
          }

          try {
            await axios.post(
              `${API_URL}/auth/faculty`,
              { name: user.name, email: user.email, password: user.password, subjects: subjects },
              { headers: { Authorization: `Bearer ${token}` } }
            );
            successCount++;
          } catch (error) {
            console.error(`Error adding faculty ${user.email}:`, error);
            errors.push(`Row ${index + 1} (${user.email}): ${error.response?.data?.message || 'Failed'}`);
            failCount++;
          }
        }

        setLoading(false);
        setSuccess(`Bulk add complete. Added: ${successCount}. Failed: ${failCount}.`);
        if (failCount > 0) {
           setSuccess(`Bulk add complete. Added: ${successCount}. Failed: ${failCount}. See console for error details.`);
           console.error("Bulk add errors:", errors);
        }

        fetchUsers();
        setShowAddFacultyModal(false);
        setFacultyBulkFile(null);
        const fileInput = document.getElementById('faculty-bulk-file');
        if (fileInput) fileInput.value = null;
        setTimeout(() => setSuccess(''), 5000); // Longer timeout
      },
      error: (error) => {
        console.error('Error parsing CSV file:', error);
        setError(`Failed to parse CSV file: ${error.message}`);
        setLoading(false);
      }
    });
  };
  // ------------------------------------

  const handleEditClick = (user) => {
    setSelectedUser(user);
    setEditForm({
      name: user.name,
      email: user.email,
      subjects: user.subjects || []
    });
    setShowEditModal(true);
  };

  const handleUpdateUser = async () => {
    if (!editForm.name || !editForm.email) {
      setError('Please fill all required fields');
      return;
    }

    if (selectedUser.role === 'instructor' && editForm.subjects.length === 0) {
      setError('Please select at least one subject for faculty');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const token = localStorage.getItem('token');
      const response = await axios.put(
        `${API_URL}/auth/users/${selectedUser._id}`,
        editForm,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.success) {
        setSuccess('User updated successfully!');
        setShowEditModal(false);
        setSelectedUser(null);
        setEditForm({ name: '', email: '', subjects: [] });
        fetchUsers();
        setTimeout(() => setSuccess(''), 3000);
      }
    } catch (error) {
      console.error('Error updating user:', error);
      setError(error.response?.data?.message || 'Failed to update user');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = (user) => {
    setSelectedUser(user);
    setShowDeleteModal(true);
  };

  const handleDeleteUser = async () => {
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const token = localStorage.getItem('token');
      const response = await axios.delete(
        `${API_URL}/auth/users/${selectedUser._id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.success) {
        setSuccess('User deleted successfully!');
        setShowDeleteModal(false);
        setSelectedUser(null);
        fetchUsers();
        setTimeout(() => setSuccess(''), 3000);
      }
    } catch (error) {
      console.error('Error deleting user:', error);
      setError(error.response?.data?.message || 'Failed to delete user');
    } finally {
      setLoading(false);
    }
  };

  const handleEditSubjectToggle = (subject) => {
    setEditForm(prev => ({
      ...prev,
      subjects: prev.subjects.includes(subject)
        ? prev.subjects.filter(s => s !== subject)
        : [...prev.subjects, subject]
    }));
  };

  return (
    <div>
      {success && (
        <div className={`mb-4 p-4 rounded-lg ${isDark ? 'bg-green-900/30 text-green-400' : 'bg-green-100 text-green-800'}`}>
          {success}
        </div>
      )}
      {error && (
        <div className={`mb-4 p-4 rounded-lg ${isDark ? 'bg-red-900/30 text-red-400' : 'bg-red-100 text-red-800'}`}>
          {error}
        </div>
      )}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
        <div>
          <h1 className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'} mb-2`}>
            User Management
          </h1>
          <p className={`${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            Manage and monitor all users in the platform
          </p>
        </div>
<div className="flex gap-3 mt-4 md:mt-0">
  <button
    onClick={handleDownloadTemplate}
    className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all ${
      isDark
        ? 'bg-yellow-600 hover:bg-yellow-700 text-white'
        : 'bg-yellow-600 hover:bg-yellow-700 text-white'
    }`}
  >
    <Download className="w-5 h-5" />
    Download Template
  </button>
  <button
    onClick={() => setShowAddStudentModal(true)}
    className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all ${
      isDark
        ? 'bg-green-600 hover:bg-green-700 text-white'
        : 'bg-green-600 hover:bg-green-700 text-white'
    }`}
  >
    <UserPlus className="w-5 h-5" />
    Add Student
  </button>
  <button
    onClick={() => setShowAddFacultyModal(true)}
    className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all ${
      isDark
        ? 'bg-blue-600 hover:bg-blue-700 text-white'
        : 'bg-blue-600 hover:bg-blue-700 text-white'
    }`}
  >
    <UserPlus className="w-5 h-5" />
    Add Faculty
  </button>
</div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className={`${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-xl p-6 border`}>
          <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'} mb-1`}>Total Users</p>
          <p className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{users.length}</p>
        </div>
        <div
          onClick={() => setSelectedRole('student')}
          className={`cursor-pointer rounded-xl p-6 border transition-all ${
            selectedRole === 'student'
              ? isDark
                ? 'bg-blue-900/30 border-blue-700 ring-2 ring-blue-500'
                : 'bg-blue-50 border-blue-300 ring-2 ring-blue-500'
              : isDark
                ? 'bg-gray-800 border-gray-700 hover:border-gray-600'
                : 'bg-white border-gray-200 hover:border-gray-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'} mb-1`}>Students</p>
              <p className={`text-3xl font-bold ${selectedRole === 'student' ? 'text-blue-500' : isDark ? 'text-white' : 'text-gray-900'}`}>{studentCount}</p>
            </div>
            <span className="text-4xl">👨‍🎓</span>
          </div>
        </div>
        <div
          onClick={() => setSelectedRole('faculty')}
          className={`cursor-pointer rounded-xl p-6 border transition-all ${
            selectedRole === 'faculty'
              ? isDark
                ? 'bg-purple-900/30 border-purple-700 ring-2 ring-purple-500'
                : 'bg-purple-50 border-purple-300 ring-2 ring-purple-500'
              : isDark
                ? 'bg-gray-800 border-gray-700 hover:border-gray-600'
                : 'bg-white border-gray-200 hover:border-gray-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'} mb-1`}>Faculty</p>
              <p className={`text-3xl font-bold ${selectedRole === 'faculty' ? 'text-purple-500' : isDark ? 'text-white' : 'text-gray-900'}`}>{facultyCount}</p>
            </div>
            <span className="text-4xl">👨‍🏫</span>
          </div>
        </div>
      </div>

      <div className={`${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-xl border shadow-sm`}>
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
              <input
                type="text"
                placeholder="Search users by name or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={`w-full pl-10 pr-4 py-2 rounded-lg border ${
                  isDark
                    ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                } focus:outline-none focus:ring-2 focus:ring-blue-500`}
              />
            </div>
            <div className="flex gap-2">
              <button
                className={`px-4 py-2 rounded-lg border ${
                  isDark
                    ? 'bg-gray-700 border-gray-600 text-white hover:bg-gray-600'
                    : 'bg-white border-gray-300 text-gray-900 hover:bg-gray-50'
                } transition-colors`}
              >
                <Download className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className={`${isDark ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
              <tr>
                <th className={`px-6 py-4 text-left text-xs font-semibold ${isDark ? 'text-gray-300' : 'text-gray-700'} uppercase tracking-wider`}>
                  User
                </th>
                <th className={`px-6 py-4 text-left text-xs font-semibold ${isDark ? 'text-gray-300' : 'text-gray-700'} uppercase tracking-wider`}>
                  Role
                </th>
                <th className={`px-6 py-4 text-left text-xs font-semibold ${isDark ? 'text-gray-300' : 'text-gray-700'} uppercase tracking-wider`}>
                  Joined
                </th>
                <th className={`px-6 py-4 text-left text-xs font-semibold ${isDark ? 'text-gray-300' : 'text-gray-700'} uppercase tracking-wider`}>
                  {selectedRole === 'faculty' ? 'Subjects' : 'Progress'}
                </th>
                <th className={`px-6 py-4 text-left text-xs font-semibold ${isDark ? 'text-gray-300' : 'text-gray-700'} uppercase tracking-wider`}>
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {filteredUsers.map((user) => (
                <tr key={user._id} className={`${isDark ? 'hover:bg-gray-700/50' : 'hover:bg-gray-50'} transition-colors`}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      <img 
                        src={user.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${user.name}`} 
                        alt={user.name} 
                        className="w-10 h-10 rounded-full" 
                      />
                      <div>
                        <div className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                          {user.name}
                        </div>
                        <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                          {user.email}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-3 py-1 text-xs font-medium rounded-full ${getRoleBadge(user.role)}`}>
                      {getRoleDisplay(user.role)}
                    </span>
                  </td>
                  <td className={`px-6 py-4 whitespace-nowrap text-sm ${isDark ? 'text-gray-300' : 'text-gray-900'}`}>
                    {new Date(user.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4">
                    {user.role === 'instructor' ? (
                      <div className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-900'}`}>
                        <div className="font-medium">{user.subjects?.length || 0} subjects</div>
                        <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'} mt-1`}>
                          {user.subjects?.slice(0, 2).join(', ')}
                          {user.subjects?.length > 2 && '...'}
                        </div>
                      </div>
                    ) : (
                      <div className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-900'}`}>
                        <div>-</div>
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleEditClick(user)}
                        className={`p-2 rounded-lg ${
                          isDark ? 'hover:bg-gray-700 text-gray-400' : 'hover:bg-gray-100 text-gray-600'
                        } transition-colors`}
                        title="Edit User"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteClick(user)}
                        className={`p-2 rounded-lg ${
                          isDark ? 'hover:bg-red-900/20 text-red-400' : 'hover:bg-red-50 text-red-600'
                        } transition-colors`}
                        title="Delete User"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className={`px-6 py-4 border-t ${isDark ? 'border-gray-700' : 'border-gray-200'} flex items-center justify-between`}>
          <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            Showing {filteredUsers.length} {selectedRole === 'student' ? 'students' : 'faculty'}
          </p>
          <div className="flex gap-2">
            <button
              className={`px-4 py-2 rounded-lg border ${
                isDark
                  ? 'bg-gray-700 border-gray-600 text-white hover:bg-gray-600'
                  : 'bg-white border-gray-300 text-gray-900 hover:bg-gray-50'
              } transition-colors`}
            >
              Previous
            </button>
            <button
              className={`px-4 py-2 rounded-lg border ${
                isDark
                  ? 'bg-gray-700 border-gray-600 text-white hover:bg-gray-600'
                  : 'bg-white border-gray-300 text-gray-900 hover:bg-gray-50'
              } transition-colors`}
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {showEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto`}>
            <div className={`sticky top-0 ${isDark ? 'bg-gray-800' : 'bg-white'} border-b ${isDark ? 'border-gray-700' : 'border-gray-200'} p-6 flex items-center justify-between`}>
              <h2 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                Edit User
              </h2>
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setSelectedUser(null);
                  setEditForm({ name: '', email: '', subjects: [] });
                }}
                className={`p-2 rounded-lg ${isDark ? 'hover:bg-gray-700 text-gray-400' : 'hover:bg-gray-100 text-gray-600'}`}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div>
                <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                  Full Name
                </label>
                <input
                  type="text"
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  placeholder="John Doe"
                  className={`w-full px-4 py-2 rounded-lg border ${
                    isDark
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                  } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                />
              </div>

              <div>
                <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                  Email Address
                </label>
                <input
                  type="email"
                  value={editForm.email}
                  onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                  placeholder="john.doe@university.edu"
                  className={`w-full px-4 py-2 rounded-lg border ${
                    isDark
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                  } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                />
              </div>

              {selectedUser?.role === 'instructor' && (
                <div>
                  <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'} mb-3`}>
                    Subjects
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    {availableSubjects.map((subject) => (
                      <label
                        key={subject}
                        className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all ${
                          editForm.subjects.includes(subject)
                            ? isDark
                              ? 'bg-blue-900/30 border-blue-700'
                              : 'bg-blue-50 border-blue-300'
                            : isDark
                              ? 'bg-gray-700 border-gray-600 hover:border-gray-500'
                              : 'bg-white border-gray-300 hover:border-gray-400'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={editForm.subjects.includes(subject)}
                          onChange={() => handleEditSubjectToggle(subject)}
                          className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                        />
                        <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                          {subject}
                        </span>
                      </label>
))}
</div>
<p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'} mt-2`}>
{editForm.subjects.length} subject{editForm.subjects.length !== 1 ? 's' : ''} selected
</p>
</div>
              )}
            </div>

            <div className={`sticky bottom-0 ${isDark ? 'bg-gray-800' : 'bg-white'} border-t ${isDark ? 'border-gray-700' : 'border-gray-200'} p-6 flex gap-3 justify-end`}>
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setSelectedUser(null);
                  setEditForm({ name: '', email: '', subjects: [] });
                }}
                className={`px-6 py-2 rounded-lg border ${
                  isDark
                    ? 'bg-gray-700 border-gray-600 text-white hover:bg-gray-600'
                    : 'bg-white border-gray-300 text-gray-900 hover:bg-gray-50'
                } transition-colors`}
              >
                Cancel
              </button>
              <button
                onClick={handleUpdateUser}
                disabled={loading || !editForm.name || !editForm.email || (selectedUser?.role === 'instructor' && editForm.subjects.length === 0)}
                className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                  loading || !editForm.name || !editForm.email || (selectedUser?.role === 'instructor' && editForm.subjects.length === 0)
                    ? 'bg-gray-400 cursor-not-allowed text-white'
                    : 'bg-blue-600 hover:bg-blue-700 text-white'
                }`}
              >
                {loading ? 'Updating...' : 'Update User'}
              </button>
            </div>
          </div>
        </div>
      )}

      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-xl max-w-md w-full`}>
            <div className={`border-b ${isDark ? 'border-gray-700' : 'border-gray-200'} p-6`}>
              <h2 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                Confirm Delete
              </h2>
            </div>

            <div className="p-6">
              <p className={`${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                Are you sure you want to delete <strong>{selectedUser?.name}</strong>? This action cannot be undone.
              </p>
            </div>

            <div className={`border-t ${isDark ? 'border-gray-700' : 'border-gray-200'} p-6 flex gap-3 justify-end`}>
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setSelectedUser(null);
                }}
                className={`px-6 py-2 rounded-lg border ${
                  isDark
                    ? 'bg-gray-700 border-gray-600 text-white hover:bg-gray-600'
                    : 'bg-white border-gray-300 text-gray-900 hover:bg-gray-50'
                } transition-colors`}
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteUser}
                disabled={loading}
                className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                  loading
                    ? 'bg-gray-400 cursor-not-allowed text-white'
                    : 'bg-red-600 hover:bg-red-700 text-white'
                }`}
              >
                {loading ? 'Deleting...' : 'Delete User'}
              </button>
            </div>
          </div>
        </div>
      )}

      {showAddStudentModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto`}>
            <div className={`sticky top-0 ${isDark ? 'bg-gray-800' : 'bg-white'} border-b ${isDark ? 'border-gray-700' : 'border-gray-200'} p-6 flex items-center justify-between`}>
              <h2 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                Add New Student
              </h2>
              <button
                onClick={() => {
                  setShowAddStudentModal(false);
                  setStudentBulkFile(null);
                }}
                className={`p-2 rounded-lg ${isDark ? 'hover:bg-gray-700 text-gray-400' : 'hover:bg-gray-100 text-gray-600'}`}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div>
                <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                  Full Name
                </label>
                <input
                  type="text"
                  value={studentForm.name}
                  onChange={(e) => setStudentForm({ ...studentForm, name: e.target.value })}
                  placeholder="John Doe"
                  className={`w-full px-4 py-2 rounded-lg border ${
                    isDark
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                  } focus:outline-none focus:ring-2 focus:ring-green-500`}
                />
              </div>

              <div>
                <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                  Email Address
                </label>
                <input
                  type="email"
                  value={studentForm.email}
                  onChange={(e) => setStudentForm({ ...studentForm, email: e.target.value })}
                  placeholder="john.doe@university.edu"
                  className={`w-full px-4 py-2 rounded-lg border ${
                    isDark
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                  } focus:outline-none focus:ring-2 focus:ring-green-500`}
                />
              </div>

              <div>
                <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={studentForm.password}
                    onChange={(e) => setStudentForm({ ...studentForm, password: e.target.value })}
                    placeholder="Enter password"
                    className={`w-full px-4 py-2 rounded-lg border ${
                      isDark
                        ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                        : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                    } focus:outline-none focus:ring-2 focus:ring-green-500`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className={`absolute right-3 top-1/2 transform -translate-y-1/2 ${
                      isDark ? 'text-gray-400 hover:text-gray-300' : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>
              
              {/* --- NEW Bulk Student Upload --- */}
              <div className="relative flex py-5 items-center">
                <div className="flex-grow border-t border-gray-400 dark:border-gray-600"></div>
                <span className="flex-shrink mx-4 text-gray-400 dark:text-gray-500">OR</span>
                <div className="flex-grow border-t border-gray-400 dark:border-gray-600"></div>
              </div>

              <div className={`${
                  isDark ? 'bg-gray-700/50' : 'bg-gray-50'
              } rounded-lg p-4 border ${
                  isDark ? 'border-gray-600' : 'border-gray-200'
              }`}>
                <h3 className={`text-lg font-semibold mb-4 ${
                  isDark ? 'text-white' : 'text-gray-900'
                }`}>
                  Bulk Add Students via CSV
                </h3>
                <p className={`text-sm mb-3 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                  Upload a CSV file with columns: <b>name</b>, <b>email</b>, <b>password</b>.
                </p>

                <input
                  id="student-bulk-file"
                  type="file"
                  accept=".csv"
                  onChange={(e) => setStudentBulkFile(e.target.files[0])}
                  className={`w-full px-4 py-2 rounded-lg border ${
                    isDark
                      ? 'bg-gray-700 border-gray-600 text-white'
                      : 'bg-white border-gray-300 text-gray-900'
                  } file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0
                    file:text-sm file:font-semibold
                    ${isDark ? 'file:bg-green-600 file:text-white hover:file:bg-green-700' : 'file:bg-green-100 file:text-green-700 hover:file:bg-green-200'}
                  `}
                />
                <button
                  onClick={handleAddStudentBulk}
                  disabled={!studentBulkFile || loading}
                  className={`mt-3 w-full px-6 py-3 rounded-lg font-medium transition-all flex items-center justify-center gap-2 ${
                    isDark
                      ? 'bg-green-600 hover:bg-green-700 text-white'
                      : 'bg-green-600 hover:bg-green-700 text-white'
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  <UserPlus className="w-5 h-5" />
                  {loading && studentBulkFile ? 'Processing...' : 'Add Students from CSV'}
                </button>
              </div>
              {/* --- END Bulk Student Upload --- */}

            </div>

            <div className={`sticky bottom-0 ${isDark ? 'bg-gray-800' : 'bg-white'} border-t ${isDark ? 'border-gray-700' : 'border-gray-200'} p-6 flex gap-3 justify-end`}>
              <button
                onClick={() => {
                  setShowAddStudentModal(false);
                  setStudentBulkFile(null);
                }}
                className={`px-6 py-2 rounded-lg border ${
                  isDark
                    ? 'bg-gray-700 border-gray-600 text-white hover:bg-gray-600'
                    : 'bg-white border-gray-300 text-gray-900 hover:bg-gray-50'
                } transition-colors`}
              >
                Cancel
              </button>
              <button
                onClick={handleAddStudent}
disabled={loading || !studentForm.name || !studentForm.email || !studentForm.password}
className={`px-6 py-2 rounded-lg font-medium transition-colors ${
  loading || !studentForm.name || !studentForm.email || !studentForm.password
    ? 'bg-gray-400 cursor-not-allowed text-white'
    : 'bg-green-600 hover:bg-green-700 text-white'
}`}
>
{loading && !studentBulkFile ? 'Adding...' : 'Add Student'}
              </button>
            </div>
          </div>
        </div>
      )}

      {showAddFacultyModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto`}>
            <div className={`sticky top-0 ${isDark ? 'bg-gray-800' : 'bg-white'} border-b ${isDark ? 'border-gray-700' : 'border-gray-200'} p-6 flex items-center justify-between`}>
              <h2 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                Add New Faculty
              </h2>
              <button
                onClick={() => {
                  setShowAddFacultyModal(false);
                  setFacultyBulkFile(null);
                }}
                className={`p-2 rounded-lg ${isDark ? 'hover:bg-gray-700 text-gray-400' : 'hover:bg-gray-100 text-gray-600'}`}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div>
                <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                  Full Name
                </label>
                <input
                  type="text"
                  value={facultyForm.name}
                  onChange={(e) => setFacultyForm({ ...facultyForm, name: e.target.value })}
                  placeholder="Dr. John Doe"
                  className={`w-full px-4 py-2 rounded-lg border ${
                    isDark
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                  } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                />
              </div>

              <div>
                <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                  Email Address
                </label>
                <input
                  type="email"
                  value={facultyForm.email}
                  onChange={(e) => setFacultyForm({ ...facultyForm, email: e.target.value })}
                  placeholder="john.doe@university.edu"
                  className={`w-full px-4 py-2 rounded-lg border ${
                    isDark
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                  } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                />
              </div>

              <div>
                <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={facultyForm.password}
                    onChange={(e) => setFacultyForm({ ...facultyForm, password: e.target.value })}
                    placeholder="Enter password"
                    className={`w-full px-4 py-2 rounded-lg border ${
                      isDark
                        ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                        : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
} focus:outline-none focus:ring-2 focus:ring-blue-500`}
/>
<button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className={`absolute right-3 top-1/2 transform -translate-y-1/2 ${
                      isDark ? 'text-gray-400 hover:text-gray-300' : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <div>
                <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'} mb-3`}>
                  Subjects
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {availableSubjects.map((subject) => (
                    <label
                      key={subject}
                      className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all ${
                        facultyForm.subjects.includes(subject)
                          ? isDark
                            ? 'bg-blue-900/30 border-blue-700'
                            : 'bg-blue-50 border-blue-300'
                          : isDark
                            ? 'bg-gray-700 border-gray-600 hover:border-gray-500'
                            : 'bg-white border-gray-300 hover:border-gray-400'
}`}
>
<input
  type="checkbox"
  checked={facultyForm.subjects.includes(subject)}
  onChange={() => handleSubjectToggle(subject)}
  className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
/>
<span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
  {subject}
</span>
</label>
                  ))}
                </div>
                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'} mt-2`}>
                  {facultyForm.subjects.length} subject{facultyForm.subjects.length !== 1 ? 's' : ''} selected
                </p>
              </div>
              
              {/* --- NEW Bulk Faculty Upload --- */}
              <div className="relative flex py-5 items-center">
                <div className="flex-grow border-t border-gray-400 dark:border-gray-600"></div>
                <span className="flex-shrink mx-4 text-gray-400 dark:text-gray-500">OR</span>
                <div className="flex-grow border-t border-gray-400 dark:border-gray-600"></div>
              </div>

              <div className={`${
                  isDark ? 'bg-gray-700/50' : 'bg-gray-50'
              } rounded-lg p-4 border ${
                  isDark ? 'border-gray-600' : 'border-gray-200'
              }`}>
                  <h3 className={`text-lg font-semibold mb-4 ${
                    isDark ? 'text-white' : 'text-gray-900'
                  }`}>
                    Bulk Add Faculty via CSV
                  </h3>
                  <p className={`text-sm mb-3 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                    Upload a CSV file with columns: <b>name</b>, <b>email</b>, <b>password</b>, <b>subjects</b>.
                  </p>
                  <p className={`text-xs mb-3 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                    Note: The <b>subjects</b> column should contain a comma-separated list (e.g., "Math,Physics").
                  </p>

                  <input
                    id="faculty-bulk-file"
                    type="file"
                    accept=".csv"
                    onChange={(e) => setFacultyBulkFile(e.target.files[0])}
                    className={`w-full px-4 py-2 rounded-lg border ${
                      isDark
                        ? 'bg-gray-700 border-gray-600 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    } file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0
                      file:text-sm file:font-semibold
                    	${isDark ? 'file:bg-blue-600 file:text-white hover:file:bg-blue-700' : 'file:bg-blue-100 file:text-blue-700 hover:file:bg-blue-200'}
                    `}
                  />
                  <button
                    onClick={handleAddFacultyBulk}
                    disabled={!facultyBulkFile || loading}
                    className={`mt-3 w-full px-6 py-3 rounded-lg font-medium transition-all flex items-center justify-center gap-2 ${
                      isDark
                        ? 'bg-blue-600 hover:bg-blue-700 text-white'
                        : 'bg-blue-600 hover:bg-blue-700 text-white'
                    } disabled:opacity-50 disabled:cursor-not-allowed`}
                  >
                    <UserPlus className="w-5 h-5" />
                    {loading && facultyBulkFile ? 'Processing...' : 'Add Faculty from CSV'}
                  </button>
              </div>
              {/* --- END Bulk Faculty Upload --- */}

            </div>

              <div className={`sticky bottom-0 ${isDark ? 'bg-gray-800' : 'bg-white'} border-t ${isDark ? 'border-gray-700' : 'border-gray-200'} p-6 flex gap-3 justify-end`}>
                <button
                  onClick={() => {
                    setShowAddFacultyModal(false);
                    setFacultyBulkFile(null);
                  }}
                  className={`px-6 py-2 rounded-lg border ${
                    isDark
                      ? 'bg-gray-700 border-gray-600 text-white hover:bg-gray-600'
                      : 'bg-white border-gray-300 text-gray-900 hover:bg-gray-50'
                  } transition-colors`}
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddFaculty}
                  disabled={loading || !facultyForm.name || !facultyForm.email || !facultyForm.password || facultyForm.subjects.length === 0}
                  className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                    loading || !facultyForm.name || !facultyForm.email || !facultyForm.password || facultyForm.subjects.length === 0
                      ? 'bg-gray-400 cursor-not-allowed text-white'
                      : 'bg-blue-600 hover:bg-blue-700 text-white'
                  }`}
                >
                  {loading && !facultyBulkFile ? 'Adding...' : 'Add Faculty'}
                </button>
              </div>
        </div>
      </div>
      )}
    </div>
  );
};

export default UserManagement;
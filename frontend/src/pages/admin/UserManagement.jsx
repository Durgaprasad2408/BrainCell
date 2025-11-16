import React, { useState } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { UserPlus, Download } from 'lucide-react';

// Components
import UserManagementStats from '../../components/UserManagement/UserManagementStats';
import UserManagementSearch from '../../components/UserManagement/UserManagementSearch';
import UserTable from '../../components/UserManagement/UserTable';
import EditUserModal from '../../components/UserManagement/EditUserModal';
import DeleteUserModal from '../../components/UserManagement/DeleteUserModal';
import AddUserModal from '../../components/UserManagement/AddUserModal';

// Hooks
import { useUsers, useSubjects } from '../../components/UserManagement/useUsers';

const UserManagement = () => {
  const { isDark } = useTheme();
  const { users, loading, error, addUser, updateUser, deleteUser, addUsersBulk } = useUsers();
  const { subjects } = useSubjects();
  
  // Local state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRole, setSelectedRole] = useState('student');
  
  // Modal states
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [addUserType, setAddUserType] = useState('student');
  
  // Selected user for edit/delete operations
  const [selectedUser, setSelectedUser] = useState(null);
  
  // Forms
  const [userForm, setUserForm] = useState({
    name: '',
    email: '',
    password: '',
    subjects: []
  });
  const [editForm, setEditForm] = useState({
    name: '',
    email: '',
    subjects: []
  });

  // Notifications
  const [success, setSuccess] = useState('');
  const [formError, setFormError] = useState('');

  // Filter users based on search query
  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole =
      (selectedRole === 'student' && user.role === 'user') ||
      (selectedRole === 'faculty' && user.role === 'instructor');
    return matchesSearch && matchesRole;
  });

  // Download template handler
  const handleDownloadTemplate = () => {
    const link = document.createElement('a');
    link.href = '/users_template.csv';
    link.download = 'users_template.csv';
    link.click();
  };

  // User form handlers
  const handleAddUserClick = (type) => {
    setAddUserType(type);
    setShowAddUserModal(true);
    setUserForm({
      name: '',
      email: '',
      password: '',
      subjects: type === 'faculty' ? [] : []
    });
    setFormError('');
  };

  const handleUserFormChange = (newForm) => {
    setUserForm(newForm);
  };

  const handleAddUser = async (type) => {
    if (!userForm.name || !userForm.email || !userForm.password || (type === 'faculty' && userForm.subjects.length === 0)) {
      setFormError('Please fill all required fields');
      return;
    }

    const result = await addUser(userForm, type);
    
    if (result.success) {
      setSuccess(`${type === 'student' ? 'Student' : 'Faculty'} added successfully!`);
      setShowAddUserModal(false);
      setUserForm({
        name: '',
        email: '',
        password: '',
        subjects: []
      });
      setTimeout(() => setSuccess(''), 3000);
    } else {
      setFormError(result.message);
    }
  };

  const handleBulkAdd = async (file, type) => {
    if (!file) {
      setFormError('Please select a CSV file first.');
      return;
    }

    const result = await addUsersBulk(file, type);
    
    if (result.success) {
      setSuccess(result.message);
      setShowAddUserModal(false);
      setTimeout(() => setSuccess(''), 5000);
      if (result.failCount > 0) {
        console.error("Bulk add errors:", result.errors);
      }
    } else {
      setFormError(result.message);
    }
  };

  // Edit user handlers
  const handleEditClick = (user) => {
    setSelectedUser(user);
    setEditForm({
      name: user.name,
      email: user.email,
      subjects: user.subjects || []
    });
    setShowEditModal(true);
    setFormError('');
  };

  const handleEditFormChange = (newForm) => {
    setEditForm(newForm);
  };

  const handleSubjectToggle = (subject) => {
    setEditForm(prev => ({
      ...prev,
      subjects: prev.subjects.includes(subject)
        ? prev.subjects.filter(s => s !== subject)
        : [...prev.subjects, subject]
    }));
  };

  const handleUpdateUser = async () => {
    if (!editForm.name || !editForm.email || (selectedUser?.role === 'instructor' && editForm.subjects.length === 0)) {
      setFormError('Please fill all required fields');
      return;
    }

    const result = await updateUser(selectedUser._id, editForm);
    
    if (result.success) {
      setSuccess('User updated successfully!');
      setShowEditModal(false);
      setSelectedUser(null);
      setEditForm({
        name: '',
        email: '',
        subjects: []
      });
      setTimeout(() => setSuccess(''), 3000);
    } else {
      setFormError(result.message);
    }
  };

  const handleEditClose = () => {
    setShowEditModal(false);
    setSelectedUser(null);
    setEditForm({
      name: '',
      email: '',
      subjects: []
    });
    setFormError('');
  };

  // Delete user handlers
  const handleDeleteClick = (user) => {
    setSelectedUser(user);
    setShowDeleteModal(true);
  };

  const handleDeleteUser = async () => {
    const result = await deleteUser(selectedUser._id);
    
    if (result.success) {
      setSuccess('User deleted successfully!');
      setShowDeleteModal(false);
      setSelectedUser(null);
      setTimeout(() => setSuccess(''), 3000);
    } else {
      setFormError(result.message);
    }
  };

  const handleDeleteClose = () => {
    setShowDeleteModal(false);
    setSelectedUser(null);
  };

  // Close add user modal
  const handleAddUserClose = () => {
    setShowAddUserModal(false);
    setUserForm({
      name: '',
      email: '',
      password: '',
      subjects: []
    });
    setFormError('');
  };

  return (
    <div>
      {/* Notifications */}
      {success && (
        <div className={`mb-4 p-4 rounded-lg ${isDark ? 'bg-green-900/30 text-green-400' : 'bg-green-100 text-green-800'}`}>
          {success}
        </div>
      )}
      {formError && (
        <div className={`mb-4 p-4 rounded-lg ${isDark ? 'bg-red-900/30 text-red-400' : 'bg-red-100 text-red-800'}`}>
          {formError}
        </div>
      )}
      {error && (
        <div className={`mb-4 p-4 rounded-lg ${isDark ? 'bg-red-900/30 text-red-400' : 'bg-red-100 text-red-800'}`}>
          {error}
        </div>
      )}

      {/* Header */}
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
            onClick={() => handleAddUserClick('student')}
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
            onClick={() => handleAddUserClick('faculty')}
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

      {/* Stats Cards */}
      <UserManagementStats 
        users={users}
        selectedRole={selectedRole}
        onRoleSelect={setSelectedRole}
      />

      {/* Search */}
      <UserManagementSearch 
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onDownloadTemplate={handleDownloadTemplate}
      />

      {/* User Table */}
      <UserTable 
        users={filteredUsers}
        selectedRole={selectedRole}
        onEditUser={handleEditClick}
        onDeleteUser={handleDeleteClick}
        isDark={isDark}
      />

      {/* Modals */}
      <AddUserModal
        isOpen={showAddUserModal}
        type={addUserType}
        onClose={handleAddUserClose}
        formData={userForm}
        onFormChange={handleUserFormChange}
        onAddUser={handleAddUser}
        onBulkAdd={handleBulkAdd}
        loading={loading}
        availableSubjects={subjects}
        isDark={isDark}
      />

      <EditUserModal
        isOpen={showEditModal}
        onClose={handleEditClose}
        selectedUser={selectedUser}
        editForm={editForm}
        onFormChange={handleEditFormChange}
        availableSubjects={subjects}
        onSubjectToggle={handleSubjectToggle}
        onUpdateUser={handleUpdateUser}
        loading={loading}
        isDark={isDark}
      />

      <DeleteUserModal
        isOpen={showDeleteModal}
        onClose={handleDeleteClose}
        selectedUser={selectedUser}
        onDeleteUser={handleDeleteUser}
        loading={loading}
        isDark={isDark}
      />
    </div>
  );
};

export default UserManagement;
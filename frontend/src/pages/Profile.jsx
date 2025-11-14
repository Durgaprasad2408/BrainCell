import React, { useState, useEffect, useRef } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import {
  User,
  Mail,
  Calendar,
  ArrowLeft,
  Edit,
  Save,
  X,
  Lock,
  Camera,
  Trash2,
  Upload
} from 'lucide-react';

const Profile = () => {
  const { isDark } = useTheme();
  const { user, updateProfile, uploadAvatar, deleteAvatar } = useAuth();
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [avatarLoading, setAvatarLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const fileInputRef = useRef(null);

  const [userData, setUserData] = useState({
    name: '',
    email: '',
    role: '',
    createdAt: ''
  });

  const [editData, setEditData] = useState({
    name: '',
    email: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  useEffect(() => {
    if (user) {
      const formattedDate = new Date(user.createdAt).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });

      setUserData({
        name: user.name,
        email: user.email,
        role: user.role === 'user' ? 'Student' : user.role.charAt(0).toUpperCase() + user.role.slice(1),
        createdAt: formattedDate
      });

      setEditData({
        name: user.name,
        email: user.email,
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    }
  }, [user]);

  const handleSave = async () => {
    setLoading(true);
    setMessage('');

    // Validate passwords
    if (editData.newPassword || editData.currentPassword || editData.confirmPassword) {
      if (editData.newPassword !== editData.confirmPassword) {
        setMessage('New password and confirmation do not match');
        setLoading(false);
        return;
      }
      if (editData.newPassword.length < 8) {
        setMessage('New password must be at least 8 characters long');
        setLoading(false);
        return;
      }
    }

    const updateData = {
      name: editData.name,
      email: editData.email
    };

    // Only include password fields if they're filled
    if (editData.currentPassword && editData.newPassword) {
      updateData.currentPassword = editData.currentPassword;
      updateData.newPassword = editData.newPassword;
    }

    const result = await updateProfile(updateData);

    setLoading(false);

    if (result.success) {
      setUserData({
        ...userData,
        name: editData.name,
        email: editData.email
      });
      setIsEditing(false);
      setEditData({
        ...editData,
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      setMessage('Profile updated successfully!');
      setTimeout(() => setMessage(''), 3000);
    } else {
      setMessage(result.message || 'Failed to update profile');
    }
  };

  const handleCancel = () => {
    setEditData({
      name: userData.name,
      email: userData.email,
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    });
    setIsEditing(false);
    setMessage('');
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setMessage('Please select an image file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setMessage('Image size should be less than 5MB');
      return;
    }

    setSelectedFile(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleUploadAvatar = async () => {
    if (!selectedFile) return;

    setAvatarLoading(true);
    setMessage('');

    const result = await uploadAvatar(selectedFile);

    setAvatarLoading(false);

    if (result.success) {
      setMessage('Profile picture updated successfully!');
      setImagePreview(null);
      setSelectedFile(null);
      setTimeout(() => setMessage(''), 3000);
    } else {
      setMessage(result.message || 'Failed to upload profile picture');
    }
  };

  const handleDeleteAvatar = async () => {
    if (!confirm('Are you sure you want to remove your profile picture?')) return;

    setAvatarLoading(true);
    setMessage('');

    const result = await deleteAvatar();

    setAvatarLoading(false);

    if (result.success) {
      setMessage('Profile picture removed successfully!');
      setTimeout(() => setMessage(''), 3000);
    } else {
      setMessage(result.message || 'Failed to remove profile picture');
    }
  };

  const cancelImageSelection = () => {
    setImagePreview(null);
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const getRoleBadgeColor = (role) => {
    switch(role.toLowerCase()) {
      case 'admin':
        return isDark ? 'bg-red-900/30 text-red-400' : 'bg-red-50 text-red-600';
      case 'instructor':
        return isDark ? 'bg-blue-900/30 text-blue-400' : 'bg-blue-50 text-blue-600';
      default:
        return isDark ? 'bg-green-900/30 text-green-400' : 'bg-green-50 text-green-600';
    }
  };

  const isDiceBearAvatar = (avatarUrl) => {
    return avatarUrl && avatarUrl.includes('dicebear.com');
  };

  if (!user) {
    return (
      <div className={`min-h-screen ${isDark ? 'bg-gray-900' : 'bg-gray-50'} flex items-center justify-center`}>
        <p className={`${isDark ? 'text-white' : 'text-gray-900'}`}>Loading...</p>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${isDark ? 'bg-gray-900' : 'bg-gray-50'} py-8 px-4 lg:px-8 pt-22`}>
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => navigate(-1)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
              isDark
                ? 'text-gray-300 hover:bg-gray-800'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            <ArrowLeft className="w-5 h-5" />
            Back
          </button>

          {message && (
            <div className={`px-4 py-2 rounded-lg ${
              message.includes('success')
                ? isDark ? 'bg-green-900/30 text-green-400' : 'bg-green-50 text-green-600'
                : isDark ? 'bg-red-900/30 text-red-400' : 'bg-red-50 text-red-600'
            }`}>
              {message}
            </div>
          )}
        </div>

        <div className={`${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-xl border shadow-sm p-6 lg:p-8`}>
          <div className="flex justify-between items-start mb-6">
            <h2 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Profile Information
            </h2>
            {!isEditing ? (
              <button
                onClick={() => setIsEditing(true)}
                className={`p-2 rounded-lg ${
                  isDark ? 'hover:bg-gray-700 text-gray-400' : 'hover:bg-gray-100 text-gray-600'
                } transition-colors`}
              >
                <Edit className="w-5 h-5" />
              </button>
            ) : (
              <div className="flex gap-2">
                <button
                  onClick={handleSave}
                  disabled={loading}
                  className={`p-2 rounded-lg transition-colors ${
                    loading
                      ? 'bg-blue-400 cursor-not-allowed'
                      : 'bg-blue-600 hover:bg-blue-700'
                  } text-white`}
                >
                  <Save className="w-5 h-5" />
                </button>
                <button
                  onClick={handleCancel}
                  disabled={loading}
                  className={`p-2 rounded-lg ${
                    isDark ? 'hover:bg-gray-700 text-gray-400' : 'hover:bg-gray-100 text-gray-600'
                  } transition-colors ${loading ? 'cursor-not-allowed opacity-50' : ''}`}
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            )}
          </div>

          <div className="flex flex-col items-center mb-8">
            <div className="relative mb-4">
              {imagePreview ? (
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="w-32 h-32 rounded-full object-cover border-4 border-blue-500"
                />
              ) : user.avatar ? (
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="w-32 h-32 rounded-full object-cover border-4 border-gray-300"
                />
              ) : (
                <div className={`w-32 h-32 rounded-full ${isDark ? 'bg-blue-900/30 text-blue-400' : 'bg-blue-50 text-blue-600'} flex items-center justify-center`}>
                  <User className="w-16 h-16" />
                </div>
              )}

              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={avatarLoading}
                className={`absolute bottom-0 right-0 p-2 rounded-full ${
                  isDark ? 'bg-blue-600 hover:bg-blue-700' : 'bg-blue-500 hover:bg-blue-600'
                } text-white transition-colors ${avatarLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <Camera className="w-5 h-5" />
              </button>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
              />
            </div>

            {imagePreview && (
              <div className="flex gap-2 mb-4">
                <button
                  onClick={handleUploadAvatar}
                  disabled={avatarLoading}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg ${
                    avatarLoading
                      ? 'bg-blue-400 cursor-not-allowed'
                      : 'bg-blue-600 hover:bg-blue-700'
                  } text-white transition-colors`}
                >
                  <Upload className="w-4 h-4" />
                  {avatarLoading ? 'Uploading...' : 'Upload'}
                </button>
                <button
                  onClick={cancelImageSelection}
                  disabled={avatarLoading}
                  className={`px-4 py-2 rounded-lg ${
                    isDark ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-300 hover:bg-gray-400'
                  } transition-colors ${avatarLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  Cancel
                </button>
              </div>
            )}

            {!imagePreview && user.avatar && !isDiceBearAvatar(user.avatar) && (
              <button
                onClick={handleDeleteAvatar}
                disabled={avatarLoading}
                className={`flex items-center gap-2 px-4 py-2 mb-4 rounded-lg ${
                  isDark ? 'bg-red-900/30 text-red-400 hover:bg-red-900/50' : 'bg-red-50 text-red-600 hover:bg-red-100'
                } transition-colors ${avatarLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <Trash2 className="w-4 h-4" />
                Remove Photo
              </button>
            )}

            {isEditing ? (
              <input
                type="text"
                value={editData.name}
                onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                className={`text-2xl font-bold text-center mb-3 px-4 py-2 rounded border ${
                  isDark
                    ? 'bg-gray-700 border-gray-600 text-white'
                    : 'bg-white border-gray-300 text-gray-900'
                }`}
              />
            ) : (
              <h3 className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'} mb-3`}>
                {userData.name}
              </h3>
            )}
            <span className={`px-4 py-2 rounded-full text-sm font-medium ${getRoleBadgeColor(userData.role)}`}>
              {userData.role}
            </span>
          </div>

          <div className="space-y-6 max-w-2xl mx-auto">
            <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
              <div className="flex items-start gap-4">
                <Mail className={`w-6 h-6 mt-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                <div className="flex-1">
                  <p className={`text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-600'} mb-1`}>
                    Email Address
                  </p>
                  {isEditing ? (
                    <input
                      type="email"
                      value={editData.email}
                      onChange={(e) => setEditData({ ...editData, email: e.target.value })}
                      className={`w-full px-3 py-2 rounded border ${
                        isDark
                          ? 'bg-gray-700 border-gray-600 text-white'
                          : 'bg-white border-gray-300 text-gray-900'
                      }`}
                    />
                  ) : (
                    <p className={`text-base ${isDark ? 'text-gray-200' : 'text-gray-900'}`}>
                      {userData.email}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {isEditing && (
              <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                <div className="flex items-start gap-4">
                  <Lock className={`w-6 h-6 mt-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                  <div className="flex-1">
                    <p className={`text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-600'} mb-1`}>
                      Change Password
                    </p>
                    <div className="space-y-3">
                      <input
                        type="password"
                        placeholder="Current Password"
                        value={editData.currentPassword}
                        onChange={(e) => setEditData({ ...editData, currentPassword: e.target.value })}
                        className={`w-full px-3 py-2 rounded border ${
                          isDark
                            ? 'bg-gray-700 border-gray-600 text-white'
                            : 'bg-white border-gray-300 text-gray-900'
                        }`}
                      />
                      <input
                        type="password"
                        placeholder="New Password"
                        value={editData.newPassword}
                        onChange={(e) => setEditData({ ...editData, newPassword: e.target.value })}
                        className={`w-full px-3 py-2 rounded border ${
                          isDark
                            ? 'bg-gray-700 border-gray-600 text-white'
                            : 'bg-white border-gray-300 text-gray-900'
                        }`}
                      />
                      <input
                        type="password"
                        placeholder="Confirm New Password"
                        value={editData.confirmPassword}
                        onChange={(e) => setEditData({ ...editData, confirmPassword: e.target.value })}
                        className={`w-full px-3 py-2 rounded border ${
                          isDark
                            ? 'bg-gray-700 border-gray-600 text-white'
                            : 'bg-white border-gray-300 text-gray-900'
                        }`}
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
              <div className="flex items-start gap-4">
                <Calendar className={`w-6 h-6 mt-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                <div className="flex-1">
                  <p className={`text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-600'} mb-1`}>
                    Member Since
                  </p>
                  <p className={`text-base ${isDark ? 'text-gray-200' : 'text-gray-900'}`}>
                    {userData.createdAt}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
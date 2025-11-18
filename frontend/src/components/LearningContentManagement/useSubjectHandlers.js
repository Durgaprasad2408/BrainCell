import { useState } from 'react';

const useSubjectHandlers = () => {
  const [showAddSubjectModal, setShowAddSubjectModal] = useState(false);
  const [newSubject, setNewSubject] = useState({ name: '', description: '', icon: '', image: null });
  const [editingSubject, setEditingSubject] = useState(null);
  const [showDeleteSubjectModal, setShowDeleteSubjectModal] = useState(false);
  const [deletingSubject, setDeletingSubject] = useState(null);

  const handleEditSubject = (subject) => {
    setEditingSubject(subject);
    setNewSubject({
      name: subject.name,
      description: subject.description || '',
      icon: subject.icon || '',
      image: null
    });
    setShowAddSubjectModal(true);
  };

  const handleDeleteSubjectClick = (subject) => {
    setDeletingSubject(subject);
    setShowDeleteSubjectModal(true);
  };

  const resetSubjectForm = () => {
    setNewSubject({ name: '', description: '', icon: '', image: null });
    setEditingSubject(null);
  };

  const closeAddSubjectModal = () => {
    setShowAddSubjectModal(false);
    resetSubjectForm();
  };

  const closeDeleteSubjectModal = () => {
    setShowDeleteSubjectModal(false);
    setDeletingSubject(null);
  };

  return {
    showAddSubjectModal,
    setShowAddSubjectModal,
    newSubject,
    setNewSubject,
    editingSubject,
    setEditingSubject,
    showDeleteSubjectModal,
    deletingSubject,
    handleEditSubject,
    handleDeleteSubjectClick,
    resetSubjectForm,
    closeAddSubjectModal,
    closeDeleteSubjectModal
  };
};

export default useSubjectHandlers;
import React from 'react';
import "../ConfirmationDialogue.css"

const ConfirmationDialog = ({ message, onConfirm, onCancel }) => {
  return (
    <div className="toast-container">
      <div className="toast toast-confirm">
        <p>{message}</p>
        <button onClick={onConfirm}>Confirm</button>
        <button onClick={onCancel}>Cancel</button>
      </div>
    </div>
  );
};

export default ConfirmationDialog;

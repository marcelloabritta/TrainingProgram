import React, { useState } from 'react';

function CreateSessionModal({ isOpen, onClose, onCreate }) {
  const [period, setPeriod] = useState('Morning'); // Começa com 'Morning' selecionado

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onCreate(period); // Envia o período selecionado para o pai
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-[#1f2937] text-white rounded-lg shadow-xl p-6 w-full max-w-sm"
      >
        <h2 className="text-xl font-bold mb-4">New Training Session</h2>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label htmlFor="period" className="block text-sm font-medium text-gray-400 mb-1">
              Select the period
            </label>
            <select
              id="period"
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
              required
              className="w-full bg-gray-700 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-[#B2E642]"
            >
              <option value="Morning">Morning</option>
              <option value="Afternoon">Afternoon</option>
              <option value="Evening">Evening</option>
            </select>
          </div>
          <button
            type="submit"
            className="bg-[#B2E642] text-black font-bold py-2 rounded-md mt-2 hover:bg-[#81ad22] transition-colors"
          >
            Create Session
          </button>
        </form>
      </div>
    </div>
  );
}

export default CreateSessionModal;

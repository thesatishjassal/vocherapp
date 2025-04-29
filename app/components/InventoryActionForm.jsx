import React, { useState } from 'react';
import axios from 'axios';

const InventoryActionForm = () => {
  const [itemcode, setItemcode] = useState('');
  const [actionType, setActionType] = useState('return');
  const [quantity, setQuantity] = useState('');
  const [holdReason, setHoldReason] = useState('');
  const [message, setMessage] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const payload = {
        itemcode,
        action_type: actionType,
        quantity: parseInt(quantity),
        hold_reason: actionType === 'hold' ? holdReason : null
      };

      const res = await axios.post('https://api.panvic.in/inventory-action/', payload);
      setMessage(res.data.message);
    } catch (err) {
      setMessage(err.response?.data?.detail || 'Error occurred');
    }
  };

  return (
    <div className="max-w-md mx-auto p-4 border rounded-lg shadow">
      <h2 className="text-xl font-semibold mb-4">Inventory Action</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          placeholder="Item Code"
          value={itemcode}
          onChange={(e) => setItemcode(e.target.value)}
          className="w-full p-2 border rounded"
          required
        />

        <select
          value={actionType}
          onChange={(e) => setActionType(e.target.value)}
          className="w-full p-2 border rounded"
        >
          <option value="return">Return</option>
          <option value="book">Book</option>
          <option value="hold">Hold</option>
        </select>

        <input
          type="number"
          placeholder="Quantity"
          value={quantity}
          onChange={(e) => setQuantity(e.target.value)}
          className="w-full p-2 border rounded"
          required
        />

        {actionType === 'hold' && (
          <input
            type="text"
            placeholder="Hold Reason"
            value={holdReason}
            onChange={(e) => setHoldReason(e.target.value)}
            className="w-full p-2 border rounded"
          />
        )}

        <button
          type="submit"
          className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700"
        >
          Submit
        </button>
      </form>

      {message && <p className="mt-4 text-center text-green-600">{message}</p>}
    </div>
  );
};

export default InventoryActionForm;

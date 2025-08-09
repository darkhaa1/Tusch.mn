'use client';

import { X } from 'lucide-react';
import { useState } from 'react';

type Props = {
  open: boolean;
  onClose: () => void;
};

export default function NewListingModal({ open, onClose }: Props) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Exemple d'appel backend ici
    console.log({ title, description, category });

    // Fermer le modal après soumission
    onClose();
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center">
      <div className="bg-white w-full max-w-lg rounded-xl shadow-lg p-6 relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-black">
          <X size={20} />
        </button>

        <h2 className="text-xl font-bold text-center mb-4">Шинэ зар нэмэх</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            placeholder="Гарчиг"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full border px-4 py-2 rounded"
            required
          />

          <textarea
            placeholder="Дэлгэрэнгүй"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full border px-4 py-2 rounded"
            rows={4}
            required
          />

          <label className="block text-sm font-medium text-gray-700 mt-4">
  Ангилал
</label>
<select
  value={category}
  onChange={(e) => setCategory(e.target.value)}
  className="mt-1 block w-full border rounded px-3 py-2 bg-white"
>
  <option value="">-- Сонгох --</option>
  <option value="cleaning">Цэвэрлэгээ</option>
  <option value="plumbing">Сантехник</option>
  <option value="electrical">Цахилгаан</option>
  <option value="delivery">Хүргэлт</option>
  <option value="it">IT үйлчилгээ</option>
  <option value="other">Бусад</option>
</select>

          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition"
          >
            Нэмэх
          </button>
        </form>
      </div>
    </div>
  );
}

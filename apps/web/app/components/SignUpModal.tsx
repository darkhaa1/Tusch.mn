// components/SignupModal.tsx
import { X } from 'lucide-react';

type Props = {
  open: boolean;
  onClose: () => void;
};

export default function SignupModal({ open, onClose }: Props) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center">
      <div className="bg-white w-full max-w-md rounded-xl shadow-lg p-6 relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-black">
          <X size={20} />
        </button>

        <h2 className="text-xl font-bold text-center mb-2">Бүртгүүлээрэй!</h2>
        <p className="text-center text-gray-600 mb-4">
          Таны хорооны оршин суугчид, мэргэжилтнүүд таны хэрэгцээнд хариу өгнө.
        </p>

        <div className="space-y-3">
          <button className="w-full border rounded-full flex items-center justify-center py-2 font-medium hover:bg-gray-100">
            
            Google-ээр холбогдох
          </button>
          <button className="w-full bg-blue-600 text-white rounded-full py-2 font-medium hover:bg-blue-700">
            Facebook-ээр үргэлжлүүлэх
          </button>

          <div className="flex items-center gap-2 text-gray-400 text-sm justify-center">
            <div className="h-px bg-gray-300 flex-1" /> эсвэл <div className="h-px bg-gray-300 flex-1" />
          </div>

          <button className="w-full border rounded-full flex items-center justify-center py-2 font-medium hover:bg-gray-100">
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.121 17.804A9.001 9.001 0 0112 3v0a9.001 9.001 0 016.879 14.804M15 12h.01M9 12h.01" />
            </svg>
            И-мэйл хаягаар бүртгүүлэх
          </button>

          <p className="text-center text-sm text-gray-500 mt-3">
            Бүртгэлтэй юу?{' '}
            <button className="text-blue-600 hover:underline" onClick={onClose}>
              Нэвтрэх
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}

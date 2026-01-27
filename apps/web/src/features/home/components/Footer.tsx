export default function Footer() {
  return (
    <footer className="bg-gray-50 text-xs sm:text-sm text-gray-600 mt-10 pb-20 md:pb-10">
      <div className="max-w-6xl mx-auto px-4 py-10 grid grid-cols-2 md:grid-cols-4 gap-6">
        <div>
          <h4 className="font-semibold mb-2">FAQ</h4>
          <ul className="space-y-1">
            <li>Түгээмэл асуултууд</li>
            <li>Хэрэглэгчийн зөвлөмж</li>
            <li>Бүртгэх</li>
          </ul>
        </div>

        <div>
          <h4 className="font-semibold mb-2">Support</h4>
          <ul className="space-y-1">
            <li>Тусламжийн төв</li>
            <li>Холбоо барих</li>
            <li>Үйлчилгээний нөхцөл</li>
          </ul>
        </div>

        <div>
          <h4 className="font-semibold mb-2">Company</h4>
          <ul className="space-y-1">
            <li>Бидний тухай</li>
            <li>Ажлын байр</li>
            <li>Харилцах</li>
          </ul>
        </div>

        <div>
          <h4 className="font-semibold mb-2">Socials</h4>
          <ul className="space-y-1">
            <li>Facebook</li>
            <li>Twitter</li>
            <li>Instagram</li>
          </ul>
        </div>
      </div>

      {/* Fixed bottom nav mobile */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t shadow md:hidden">
        <div className="flex justify-around py-2 text-xs text-gray-600">
          <div className="flex flex-col items-center">
            <span className="material-icons">home</span>
            <span>Нүүр</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="material-icons">search</span>
            <span>Хайх</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="material-icons text-blue-600">add_circle</span>
            <span className="text-blue-600">Зар</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="material-icons">chat</span>
            <span>Чат</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="material-icons">person</span>
            <span>Профайл</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

import Link from "next/link";

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
            <li>
              <Link href="/cgu" className="hover:text-primary hover:underline underline-offset-2 transition-colors">
                Үйлчилгээний нөхцөл
              </Link>
            </li>
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

      <div className="max-w-6xl mx-auto px-4 pb-4 flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-500 border-t border-gray-200 pt-4">
        <Link href="/cgu" className="hover:text-primary hover:underline underline-offset-2 transition-colors">
          CGU
        </Link>
        <Link href="/confidentialite" className="hover:text-primary hover:underline underline-offset-2 transition-colors">
          Нууцлал
        </Link>
        <a href="mailto:info@tusch.mn" className="hover:text-primary hover:underline underline-offset-2 transition-colors">
          Холбоо барих
        </a>
        <span>Бидний тухай</span>
        <span className="ml-auto">© {new Date().getFullYear()} Tusch.mn</span>
      </div>
    </footer>
  );
}

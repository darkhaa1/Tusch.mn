import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Нууцлалын бодлого",
  description: "Tusch.mn платформын хэрэглэгчдийн хувийн мэдээллийг хэрхэн цуглуулж, хамгаалж буй талаарх нууцлалын бодлого.",
  robots: { index: true, follow: true },
};

export default function ConfidentialitePage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="mb-2 text-3xl font-bold text-foreground">Нууцлалын бодлого</h1>
      <p className="mb-10 text-sm text-muted-foreground">Хүчин төгөлдөр болох огноо: 2026 оны 4 дүгээр сарын 1</p>

      <section className="space-y-8 text-sm leading-relaxed text-foreground/90">
        <div>
          <h2 className="mb-3 text-lg font-semibold text-foreground">1. Ерөнхий мэдээлэл</h2>
          <p>
            Tusch.mn нь таны хувийн мэдээллийг хамгаалах, нууцлалыг сахихад онцгой анхаардаг. Энэхүү нууцлалын
            бодлого нь бид ямар мэдээлэл цуглуулдаг, хэрхэн ашигладаг, хэр удаан хадгалдаг талаар тодорхойлно.
          </p>
        </div>

        <div>
          <h2 className="mb-3 text-lg font-semibold text-foreground">2. Цуглуулдаг мэдээлэл</h2>
          <p className="mb-2">Бид дараах мэдээллийг цуглуулна:</p>
          <ul className="list-disc space-y-1 pl-5">
            <li>
              <strong>Таны өгсөн мэдээлэл:</strong> нэр, имэйл, утасны дугаар, нийтэлсэн зар, байршил, профайл
              зураг.
            </li>
            <li>
              <strong>Автоматаар цуглуулагдах мэдээлэл:</strong> IP хаяг, хөтчийн төрөл, платформд зарцуулсан хугацаа,
              хандсан хуудсуудын лог.
            </li>
            <li>
              <strong>OAuth нэвтрэлт:</strong> Google эсвэл Facebook-ээр нэвтэрсэн тохиолдолд тухайн платформаас
              нэр болон имэйл хаягийг авна.
            </li>
          </ul>
        </div>

        <div>
          <h2 className="mb-3 text-lg font-semibold text-foreground">3. Мэдээллийг ашиглах зорилго</h2>
          <ul className="list-disc space-y-1 pl-5">
            <li>Платформын үйлчилгээг хэвийн ажиллуулах, хэрэглэгчийн бүртгэлийг удирдах.</li>
            <li>Захиалагч болон гүйцэтгэгчийг холбох, мессеж илгээх.</li>
            <li>Платформын аюулгүй байдлыг хангах, хуурамч хэрэглэгчдийг илрүүлэх.</li>
            <li>Үйлчилгээг сайжруулах, хэрэглэгчийн туршлагыг дэмжих.</li>
            <li>Хуульд заасан шаардлагыг биелүүлэх.</li>
          </ul>
        </div>

        <div>
          <h2 className="mb-3 text-lg font-semibold text-foreground">4. Мэдээллийг гуравдагч этгээдтэй хуваалцах</h2>
          <p>
            Tusch.mn таны хувийн мэдээллийг борлуулахгүй. Дараах тохиолдолд л гуравдагч этгээдтэй хуваалцна:
          </p>
          <ul className="list-disc space-y-1 pl-5 mt-2">
            <li>Хуулийн байгууллагын хүсэлт, шүүхийн тушаалын дагуу.</li>
            <li>Хэрэглэгчийн зөвшөөрөлтэйгөөр.</li>
            <li>Платформын техникийн үйл ажиллагааг дэмжих найдвартай үйлчилгээ үзүүлэгчдэд (жишээ: мэйл сервер, хостинг).</li>
          </ul>
        </div>

        <div>
          <h2 className="mb-3 text-lg font-semibold text-foreground">5. Мэдээлэл хадгалах хугацаа</h2>
          <p>
            Таны мэдээллийг бүртгэл идэвхтэй байх хугацаанд хадгалана. Бүртгэл устгасны дараа 90 хоногийн дотор
            мэдээллийг устгана. Хуулиар шаардлагатай тохиолдолд урт хугацаагаар хадгалж болно.
          </p>
        </div>

        <div>
          <h2 className="mb-3 text-lg font-semibold text-foreground">6. Хэрэглэгчийн эрх</h2>
          <p className="mb-2">Та дараах эрхтэй:</p>
          <ul className="list-disc space-y-1 pl-5">
            <li>Өөрийн мэдээллийг харах, засах.</li>
            <li>Мэдээллийг устгах хүсэлт гаргах.</li>
            <li>Маркетингийн имэйлээс татгалзах.</li>
            <li>Мэдээлэл боловсруулалтыг хязгаарлах хүсэлт гаргах.</li>
          </ul>
          <p className="mt-2">
            Хүсэлт гаргахын тулд{" "}
            <a href="mailto:info@tusch.mn" className="text-primary underline underline-offset-2">
              info@tusch.mn
            </a>{" "}
            хаягаар холбоо бариарай.
          </p>
        </div>

        <div>
          <h2 className="mb-3 text-lg font-semibold text-foreground">7. Аюулгүй байдал</h2>
          <p>
            Бид таны мэдээллийг хамгаалахын тулд HTTPS шифрлэлт, нууц үгийн bcrypt хэш, HTTP-only cookie ашиглана.
            Гэсэн хэдий ч интернэтийн аюулгүй байдлыг 100% баталгаажуулах боломжгүй тул та өөрийн нэвтрэх
            мэдээллийн нууцлалд анхаарна уу.
          </p>
        </div>

        <div>
          <h2 className="mb-3 text-lg font-semibold text-foreground">8. Cookie ашиглалт</h2>
          <p>
            Tusch.mn сессийн cookie болон функциональ cookie ашиглана. Аналитик cookie ашиглахаас өмнө таны
            зөвшөөрлийг авна. Хөтчийнхөө тохиргооноос cookie-г хаах боломжтой боловч зарим функц ажиллахгүй болж
            болно.
          </p>
        </div>

        <div>
          <h2 className="mb-3 text-lg font-semibold text-foreground">9. Бодлого өөрчлөх</h2>
          <p>
            Нууцлалын бодлогод өөрчлөлт орсон тохиолдолд шинэчлэгдсэн огноог хуудасны дээд хэсэгт заана.
            Чухал өөрчлөлтийн тухай имэйлээр мэдэгдэх боломжтой.
          </p>
        </div>

        <div>
          <h2 className="mb-3 text-lg font-semibold text-foreground">10. Холбоо барих</h2>
          <p>
            Нууцлалтай холбоотой асуулт, хүсэлтийг{" "}
            <a href="mailto:info@tusch.mn" className="text-primary underline underline-offset-2">
              info@tusch.mn
            </a>{" "}
            хаягаар илгээнэ үү.
          </p>
        </div>
      </section>
    </main>
  );
}

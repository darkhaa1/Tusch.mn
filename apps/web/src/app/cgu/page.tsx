import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Үйлчилгээний нөхцөл",
  description: "Tusch.mn платформын үйлчилгээний ерөнхий нөхцөл — хэрэглэгчдийн эрх, үүрэг, хариуцлага.",
  robots: { index: true, follow: true },
};

export default function CguPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="mb-2 text-3xl font-bold text-foreground">Үйлчилгээний нөхцөл</h1>
      <p className="mb-10 text-sm text-muted-foreground">Хүчин төгөлдөр болох огноо: 2026 оны 4 дүгээр сарын 1</p>

      <section className="space-y-8 text-sm leading-relaxed text-foreground/90">
        <div>
          <h2 className="mb-3 text-lg font-semibold text-foreground">1. Ерөнхий мэдээлэл</h2>
          <p>
            Tusch.mn нь Монгол улсад үйлчилгээ хайж буй хэрэглэгчид болон үйлчилгээ үзүүлэгчдийг холбох зуучлагч
            платформ юм. Тус платформыг ашигласнаар та энэхүү үйлчилгээний нөхцөлийг бүрэн зөвшөөрсөн гэж үзнэ.
          </p>
        </div>

        <div>
          <h2 className="mb-3 text-lg font-semibold text-foreground">2. Платформын зорилго</h2>
          <p>
            Tusch.mn нь сантехник, барилга, зөөвөрлөлт, цэвэрлэгээ болон бусад гар ажилгааны үйлчилгээг хайж буй
            захиалагчид болон ийм үйлчилгээ санал болгож буй гүйцэтгэгчдийг цахим орчинд холбох зуучлагч тавцан
            болно. Платформ өөрөө аль ч гүйцэтгэгчийн ажлыг баталгаажуулахгүй бөгөөд гэрээт харилцаанд шууд оролцохгүй.
          </p>
        </div>

        <div>
          <h2 className="mb-3 text-lg font-semibold text-foreground">3. Хэрэглэгчдийн ангилал</h2>
          <ul className="list-disc space-y-1 pl-5">
            <li>
              <strong>Захиалагч:</strong> үйлчилгээ хайж зар нийтлэх хэрэглэгч.
            </li>
            <li>
              <strong>Гүйцэтгэгч:</strong> үйлчилгээгээ санал болгон саналын үнэ оруулдаг хэрэглэгч.
            </li>
            <li>
              <strong>Хосолсон:</strong> хоёр үүргийг нэгэн зэрэг гүйцэтгэх боломжтой хэрэглэгч.
            </li>
          </ul>
        </div>

        <div>
          <h2 className="mb-3 text-lg font-semibold text-foreground">4. Бүртгэл ба хариуцлага</h2>
          <p className="mb-2">
            Бүртгүүлэхдээ та үнэн зөв мэдээлэл оруулах үүрэгтэй. Худал эсвэл бусдын мэдээллийг ашиглан бүртгүүлсэн
            тохиолдолд бүртгэлийг цуцлах эрх Tusch.mn-д байна.
          </p>
          <p>
            Та өөрийн нэвтрэх мэдээллийн нууцлалыг хариуцана. Зөвшөөрөлгүй нэвтрэлт мэдэгдсэн тохиолдолд нэн
            даруй{" "}
            <a href="mailto:info@tusch.mn" className="text-primary underline underline-offset-2">
              info@tusch.mn
            </a>{" "}
            хаягт мэдэгдэнэ үү.
          </p>
        </div>

        <div>
          <h2 className="mb-3 text-lg font-semibold text-foreground">5. Зар нийтлэх дүрэм</h2>
          <ul className="list-disc space-y-1 pl-5">
            <li>Зар нь үнэн зөв, бодит мэдээлэл агуулсан байх ёстой.</li>
            <li>Хууль бус, хуурамч болон бусдад хохирол учруулж болзошгүй агуулга байршуулахыг хориглоно.</li>
            <li>Нэг бүтээгдэхүүн/үйлчилгээг давхардуулан нийтлэхийг хориглоно.</li>
            <li>Зар нь монгол хэлний шаардлага хангасан, ойлгомжтой байх ёстой.</li>
          </ul>
        </div>

        <div>
          <h2 className="mb-3 text-lg font-semibind text-foreground">6. Харилцааны дүрэм</h2>
          <p>
            Хэрэглэгчид бие биентэйгээ болон платформтой харилцахдаа хүндэтгэлтэй, ёс суртахуунтай байх үүрэгтэй.
            Дарамт учруулах, доромжлох, залилан мэхлэх болон аливаа хуурамч үйлдлийг хориглоно. Зөрчил гарвал
            бүртгэлийг хаах арга хэмжээ авна.
          </p>
        </div>

        <div>
          <h2 className="mb-3 text-lg font-semibold text-foreground">7. Хариуцлагын хязгаарлалт</h2>
          <p>
            Tusch.mn нь зуучлагч платформ тул захиалагч болон гүйцэтгэгчийн хооронд байгуулсан хэлцлийн үр дүнд
            гарсан аливаа маргаан, хохиролд хариуцлага хүлээхгүй. Гүйцэтгэгчдийн ажлын чанар, хугацааны хариуцлагыг
            Tusch.mn баталгаажуулахгүй.
          </p>
        </div>

        <div>
          <h2 className="mb-3 text-lg font-semibold text-foreground">8. Бүртгэл цуцлах</h2>
          <p>
            Хэрэглэгч хүссэн үедээ бүртгэлээ устгах хүсэлт гаргаж болно. Платформ дүрэм зөрчсөн тохиолдолд
            урьдчилан мэдэгдэлгүйгээр бүртгэлийг цуцлах эрхтэй.
          </p>
        </div>

        <div>
          <h2 className="mb-3 text-lg font-semibold text-foreground">9. Нөхцөл өөрчлөх</h2>
          <p>
            Tusch.mn энэхүү нөхцөлд өөрчлөлт оруулах эрхтэй бөгөөд өөрчлөлт хийгдсэн тохиолдолд платформ дотор
            мэдэгдэл гарна. Өөрчлөлтийн дараа үргэлжлүүлэн ашигласан нь шинэ нөхцөлийг зөвшөөрсөн гэж тооцогдоно.
          </p>
        </div>

        <div>
          <h2 className="mb-3 text-lg font-semibold text-foreground">10. Хамаарах хууль</h2>
          <p>
            Энэхүү нөхцөл нь Монгол улсын хуулиар зохицуулагдана. Маргаан гарсан тохиолдолд Улаанбаатар хотын
            шүүхийн харьяаллыг хүлээн зөвшөөрнө.
          </p>
        </div>

        <div>
          <h2 className="mb-3 text-lg font-semibold text-foreground">11. Холбоо барих</h2>
          <p>
            Санал гомдол, асуулт байвал{" "}
            <a href="mailto:info@tusch.mn" className="text-primary underline underline-offset-2">
              info@tusch.mn
            </a>{" "}
            хаягаар холбоо бариарай.
          </p>
        </div>
      </section>
    </main>
  );
}

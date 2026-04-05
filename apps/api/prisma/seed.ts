/**
 * Prisma seed — test data for full-text search validation (US-44)
 * Includes Mongolian/Cyrillic listings to verify tsvector + 'simple' config
 *
 * Usage: pnpm -C apps/api prisma db seed
 *        (or: npx prisma db seed from apps/api)
 */
import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  // Upsert a stable test user so the seed is idempotent
  const passwordHash = await bcrypt.hash('seed_password_123', 10);

  const seedUser = await prisma.user.upsert({
    where: { email: 'seed@tusch.mn' },
    update: {},
    create: {
      email: 'seed@tusch.mn',
      password: passwordHash,
      firstName: 'Seed',
      lastName: 'User',
      phone: '+97699000000',
      accountType: 'PROVIDER',
      emailVerified: true,
    },
  });

  const listings = [
    {
      description:
        'Гэрийн цэвэрлэгээний үйлчилгээ. Өрөө тасалгаа, гал тогоо, угаалгын өрөө цэвэрлэнэ.',
      price: 45000,
      location: 'Улаанбаатар',
      category: 'home_cleaning',
    },
    {
      description:
        'Гэрийн багш математик, физик хичээл заана. Элсэлтийн шалгалтад бэлтгэнэ.',
      price: 60000,
      location: 'Улаанбаатар',
      category: 'tutoring',
    },
    {
      description:
        'Нүүлгэлтийн үйлчилгээ. Тавилга, хэрэглэлийг болгоомжтой тээвэрлэнэ. Хотын дотор болон хот хооронд.',
      price: 120000,
      location: 'Дархан',
      category: 'moving',
    },
    {
      description:
        'Барилга, дотор засал, шинэчлэлтийн ажил. Өрөөний засал дизайн хийнэ.',
      price: 200000,
      location: 'Улаанбаатар',
      category: 'construction_renovation',
    },
    {
      description:
        'Мужааны ажил, тавилга угсрах, хаалга, цонхны засвар хийнэ.',
      price: 80000,
      location: 'Эрдэнэт',
      category: 'carpentry',
    },
    {
      description:
        'Авто засварын үйлчилгээ. Хөдөлгүүр, дамжуулгын хэрэгсэл засна. Туршлагатай механик.',
      price: 90000,
      location: 'Улаанбаатар',
      category: 'auto_repair',
    },
    {
      description:
        'Хүүхэд асрагч үйлчилгээ. Ажлын цагаар хүүхдийг асрах, цэцэрлэгт хүргэх.',
      price: 50000,
      location: 'Улаанбаатар',
      category: 'babysitting',
    },
    {
      description:
        'Шугам сүлжээний засвар угсралт. Цахилгаан, ус, дулааны шугам засна.',
      price: 70000,
      location: 'Улаанбаатар',
      category: 'network_repair',
    },
  ];

  for (const data of listings) {
    // Use upsert keyed on (userId, description) approximated by findFirst + create
    const existing = await prisma.listing.findFirst({
      where: { userId: seedUser.id, description: data.description },
    });
    if (!existing) {
      await prisma.listing.create({ data: { ...data, userId: seedUser.id } });
    }
  }

  console.log(
    `Seed complete — ${listings.length} test listings for user ${seedUser.email}`,
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

import { PrismaService } from '../database/prisma.service';

export type MockPrismaService = {
  [K in keyof PrismaService]: jest.Mocked<Record<string, jest.Mock>>;
} & {
  $transaction: jest.Mock;
};

/**
 * Creates a deeply-mocked PrismaService where every model delegate
 * (user, listing, message, notification, …) exposes jest.fn() stubs
 * for findUnique / findFirst / findMany / create / update / updateMany / delete / count.
 */
export function createMockPrismaService(): MockPrismaService {
  const methods = [
    'findUnique',
    'findFirst',
    'findMany',
    'create',
    'createMany',
    'update',
    'updateMany',
    'delete',
    'deleteMany',
    'count',
    'upsert',
  ];

  const delegate = () =>
    Object.fromEntries(methods.map((m) => [m, jest.fn()])) as Record<
      string,
      jest.Mock
    >;

  return {
    user: delegate(),
    listing: delegate(),
    listingImage: delegate(),
    message: delegate(),
    notification: delegate(),
    offer: delegate(),
    review: delegate(),
    report: delegate(),
    $transaction: jest.fn((args) => {
      if (Array.isArray(args)) return Promise.all(args);
      return args({
        listingImage: delegate(),
      });
    }),
  } as unknown as MockPrismaService;
}

import * as bcrypt from 'bcrypt';
import { DataSource } from 'typeorm';
import dataSource from './data-source';
import { AccountStatus, User, UserRole } from '../modules/users/entities/user.entity';
import { Provider } from '../modules/providers/entities/provider.entity';

type SeedUserInput = {
  role: UserRole;
  username: string;
  email: string;
  password: string;
  phoneNumber?: string;
};

async function upsertUser(
  source: DataSource,
  input: SeedUserInput,
): Promise<User> {
  const userRepository = source.getRepository(User);
  const existingUser = await userRepository.findOne({
    where: { email: input.email },
  });

  const passwordHash = await bcrypt.hash(input.password, 10);

  if (existingUser) {
    existingUser.role = input.role;
    existingUser.username = input.username;
    existingUser.passwordHash = passwordHash;
    existingUser.phoneNumber = input.phoneNumber ?? existingUser.phoneNumber;
    existingUser.status = AccountStatus.ACTIVE;
    existingUser.emailVerifiedAt = existingUser.emailVerifiedAt ?? new Date();
    return userRepository.save(existingUser);
  }

  return userRepository.save(
    userRepository.create({
      role: input.role,
      username: input.username,
      email: input.email,
      phoneNumber: input.phoneNumber,
      passwordHash,
      status: AccountStatus.ACTIVE,
      emailVerifiedAt: new Date(),
    }),
  );
}

async function seed() {
  await dataSource.initialize();

  try {
    await upsertUser(dataSource, {
      role: UserRole.ADMIN,
      username: 'admin',
      email: 'admin@tourbooking.local',
      password: 'Admin123!@#',
      phoneNumber: '+855000000001',
    });

    const providerUser = await upsertUser(dataSource, {
      role: UserRole.PROVIDER,
      username: 'provider',
      email: 'provider@tourbooking.local',
      password: 'Provider123!@#',
      phoneNumber: '+855000000002',
    });

    await upsertUser(dataSource, {
      role: UserRole.CUSTOMER,
      username: 'customer',
      email: 'customer@tourbooking.local',
      password: 'Customer123!@#',
      phoneNumber: '+855000000003',
    });

    const providerRepository = dataSource.getRepository(Provider);

    const existingProvider = await providerRepository.findOne({
      where: { userId: providerUser.id },
    });

    const provider = existingProvider
      ? existingProvider
      : providerRepository.create({
          userId: providerUser.id,
          companyName: 'Cambodia Tour Provider',
          logo: undefined,
          coverImage: undefined,
          description: 'Seeded provider account for local development.',
          address: 'Phnom Penh, Cambodia',
          facebookUrl: 'https://facebook.com/cambodiatourprovider',
          telegramUrl: 'https://t.me/cambodiatourprovider',
          commissionRate: 10,
          isVerified: true,
          verifiedAt: new Date(),
        } as Partial<Provider>);

    await providerRepository.save(provider);

    process.stdout.write(
      'Seed completed: admin, provider, and customer records are ready.\n',
    );
  } finally {
    await dataSource.destroy();
  }
}

seed().catch((error) => {
  process.stderr.write(
    `Seed failed: ${error instanceof Error ? error.message : String(error)}\n`,
  );
  process.exit(1);
});

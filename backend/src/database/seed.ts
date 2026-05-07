import * as bcrypt from 'bcrypt';
import { DataSource } from 'typeorm';
import dataSource from './data-source';
import { AccountStatus, User, UserRole } from '../modules/users/entities/user.entity';
import { Provider } from '../modules/providers/entities/provider.entity';
import { Service } from '../modules/services/entities/service.entity';
import { Booking, BookingStatus, PaymentStatus } from '../modules/bookings/entities/booking.entity';
import { ServiceType } from '../shared/enums';

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
    // 1. Create Admin
    await upsertUser(dataSource, {
      role: UserRole.ADMIN,
      username: 'admin',
      email: 'admin@tourbooking.local',
      password: 'Admin123!@#',
      phoneNumber: '+855000000001',
    });

    // 2. Create Providers & their accounts
    const providersData = [
      {
        username: 'angkorklean',
        email: 'info@angkorklean.com',
        companyName: 'Angkor Klean Tours',
        category: 'Tour',
        address: 'Slokram, Siem Reap',
        phone: '+85512345678',
      },
      {
        username: 'mekongtrails',
        email: 'contact@mekongtrails.co',
        companyName: 'Mekong Trails Co.',
        category: 'Experience',
        address: 'Riverside, Phnom Penh',
        phone: '+85523456789',
      },
      {
        username: 'ratanakirijungle',
        email: 'expedition@ratanakiri.com',
        companyName: 'Ratanakiri Jungle Trek',
        category: 'Tour',
        address: 'Banlung, Ratanakiri',
        phone: '+85534567890',
      }
    ];

    const providerRepo = dataSource.getRepository(Provider);
    const serviceRepo = dataSource.getRepository(Service);
    const userRepo = dataSource.getRepository(User);

    const seededProviders: Provider[] = [];

    for (const pData of providersData) {
      const user = await upsertUser(dataSource, {
        role: UserRole.PROVIDER,
        username: pData.username,
        email: pData.email,
        password: 'Provider123!@#',
        phoneNumber: pData.phone,
      });

      let provider = await providerRepo.findOne({ where: { userId: user.id } });
      if (!provider) {
        provider = providerRepo.create({
          userId: user.id,
          companyName: pData.companyName,
          serviceCategory: pData.category,
          address: pData.address,
          description: `Premier ${pData.category} provider based in ${pData.address}.`,
          isVerified: true,
          verifiedAt: new Date(),
        });
        provider = await providerRepo.save(provider);
      }
      seededProviders.push(provider);

      // Create some services for each provider
      const services = [
        { title: `${pData.companyName} Daily Trip`, price: 45, type: ServiceType.TOUR },
        { title: `${pData.companyName} Private Package`, price: 120, type: ServiceType.TOUR },
      ];

      for (const s of services) {
        const existingService = await serviceRepo.findOne({ where: { title: s.title, providerId: provider.id } });
        if (!existingService) {
          await serviceRepo.save(serviceRepo.create({
            providerId: provider.id,
            title: s.title,
            price: s.price,
            serviceType: s.type,
            description: `Experience the best with our ${s.title}.`,
            isActive: true,
          }));
        }
      }
    }

    // 3. Create Customers & Bookings
    const customer = await upsertUser(dataSource, {
      role: UserRole.CUSTOMER,
      username: 'john_doe',
      email: 'john@gmail.com',
      password: 'Customer123!@#',
      phoneNumber: '+85599000001',
    });

    const allServices = await serviceRepo.find();
    const bookingRepo = dataSource.getRepository(Booking);

    if (allServices.length > 0) {
      const bookingsToCreate = [
        { service: allServices[0], status: BookingStatus.COMPLETED, payment: PaymentStatus.PAID, qty: 2 },
        { service: allServices[1], status: BookingStatus.CONFIRMED, payment: PaymentStatus.PAID, qty: 1 },
        { service: allServices[2 % allServices.length], status: BookingStatus.PENDING, payment: PaymentStatus.PENDING, qty: 3 },
        { service: allServices[3 % allServices.length], status: BookingStatus.CANCELLED, payment: PaymentStatus.FAILED, qty: 1 },
        { service: allServices[0], status: BookingStatus.CONFIRMED, payment: PaymentStatus.PAID, qty: 4 },
      ];

      for (let i = 0; i < bookingsToCreate.length; i++) {
        const bData = bookingsToCreate[i];
        const date = new Date();
        date.setDate(date.getDate() + (i - 2)); // Some past, some future

        const existing = await bookingRepo.findOne({ 
          where: { userId: customer.id, serviceId: bData.service.id, bookingDate: date } 
        });

        if (!existing) {
          await bookingRepo.save(bookingRepo.create({
            userId: customer.id,
            serviceId: bData.service.id,
            providerId: bData.service.providerId,
            bookingDate: date,
            quantity: bData.qty,
            totalPrice: bData.service.price * bData.qty,
            status: bData.status,
            paymentStatus: bData.payment,
            transactionId: `TX-${Math.random().toString(36).substring(2, 10).toUpperCase()}`,
          }));
        }
      }
    }

    process.stdout.write(
      'Seed completed: realistic providers, services, and bookings are ready.\n',
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

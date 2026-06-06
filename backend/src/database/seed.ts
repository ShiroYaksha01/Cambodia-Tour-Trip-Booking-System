import * as bcrypt from 'bcrypt';
import { DataSource } from 'typeorm';
import dataSource from './data-source';
import { User, UserRole, AccountStatus } from '../modules/users/entities/user.entity';
import { Provider } from '../modules/providers/entities/provider.entity';
import { Service } from '../modules/services/entities/service.entity';
import { Booking } from '../modules/bookings/entities/booking.entity';
import { Transportation } from '../modules/services/entities/transportation.entity';
import { Accommodation } from '../modules/services/entities/accommodation.entity';
import { TourPackage } from '../modules/services/entities/tour-package.entity';
import { ServiceInventory } from '../modules/services/entities/service-inventory.entity';
import { ServiceType, TransportType, BookingStatus, PaymentStatus } from '../shared/enums';

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
    existingUser.isEmailVerified = true;
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
      isEmailVerified: true,
      emailVerifiedAt: new Date(),
    }),
  );
}

async function seed() {
  await dataSource.initialize();

  try {
    // 1. Users - Admin
    await upsertUser(dataSource, {
      role: UserRole.ADMIN,
      username: 'admin',
      email: 'admin@tourbooking.local',
      password: 'Admin123!@#',
      phoneNumber: '+855000000001',
    });

    // 2. Providers
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
    const transportRepo = dataSource.getRepository(Transportation);
    const accommodationRepo = dataSource.getRepository(Accommodation);
    const tourRepo = dataSource.getRepository(TourPackage);
    const inventoryRepo = dataSource.getRepository(ServiceInventory);

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
    }

    // 3. Services Seeding
    // Clear existing services to avoid duplicates in dev
    await serviceRepo.createQueryBuilder().delete().from(Service).execute();

    if (seededProviders.length > 0) {
      const mainProvider = seededProviders[0];

      // --- Transportation Services ---
      const transData = [
        {
          title: 'Private Luxury SUV Transfer',
          description: 'Safe and comfortable air-conditioned transfer between Siem Reap and Phnom Penh.',
          price: 85.00,
          location: 'Cambodia-wide',
          inventory: 10,
          coverImage: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=800&q=80',
          details: {
            transportType: TransportType.CAR,
            vehicleModel: 'Lexus LX570',
            totalSeats: 4,
            pricePerSeat: 85.00,
            departurePoint: 'Siem Reap City Center',
            destination: 'Phnom Penh Riverside',
            departureTime: new Date(Date.now() + 86400000),
          }
        }
      ];

      for (const item of transData) {
        const s = await serviceRepo.save(serviceRepo.create({
          providerId: mainProvider.id,
          serviceType: ServiceType.TRANSPORTATION,
          title: item.title,
          description: item.description,
          price: item.price,
          location: item.location,
          duration: 'Variable',
          rating: 4.8,
          coverImage: item.coverImage,
        }));
        await inventoryRepo.save(inventoryRepo.create({ serviceId: s.id, totalCapacity: item.inventory }));
        await transportRepo.save(transportRepo.create({ serviceId: s.id, ...item.details }));
      }

      // --- Accommodation Services ---
      const accData = [
        {
          title: 'Riverside Heritage Villa',
          description: 'Luxurious French-colonial inspired villa overlooking the Mekong.',
          price: 120.00,
          location: 'Phnom Penh',
          inventory: 5,
          coverImage: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80',
          details: {
            hotelName: 'Heritage Riverside',
            roomType: 'Colonial Suite',
            totalRooms: 5,
            pricePerNight: 120.00,
            checkInTime: '14:00:00',
            checkOutTime: '12:00:00',
            address: 'Preah Sisowath Quay, Phnom Penh',
          }
        }
      ];

      for (const item of accData) {
        const s = await serviceRepo.save(serviceRepo.create({
          providerId: mainProvider.id,
          serviceType: ServiceType.ACCOMMODATION,
          title: item.title,
          description: item.description,
          price: item.price,
          location: item.location,
          duration: 'Per Night',
          rating: 4.9,
          coverImage: item.coverImage,
        }));
        await inventoryRepo.save(inventoryRepo.create({ serviceId: s.id, totalCapacity: item.inventory }));
        await accommodationRepo.save(accommodationRepo.create({ serviceId: s.id, ...item.details }));
      }

      // --- Tour Package Services ---
      const tourData = [
        {
          title: 'Angkor Wat Sunrise Expedition',
          description: 'A private guided journey through the majestic Angkor Wat at dawn.',
          price: 45.00,
          location: 'Siem Reap',
          inventory: 20,
          coverImage: 'https://images.unsplash.com/photo-1506461883276-594a12b11cf3?auto=format&fit=crop&w=800&q=80',
          details: {
            numDays: 1,
            maxPeople: 20,
            basePrice: 45.00,
            travelDate: new Date(Date.now() + 604800000),
            endDate: new Date(Date.now() + 604800000),
            destination: 'Angkor Archaeological Park',
          }
        }
      ];

      for (const item of tourData) {
        const s = await serviceRepo.save(serviceRepo.create({
          providerId: mainProvider.id,
          serviceType: ServiceType.TOUR,
          title: item.title,
          description: item.description,
          price: item.price,
          location: item.location,
          duration: '1 Day',
          rating: 5.0,
          coverImage: item.coverImage,
        }));
        await inventoryRepo.save(inventoryRepo.create({ serviceId: s.id, totalCapacity: item.inventory }));
        await tourRepo.save(tourRepo.create({ serviceId: s.id, ...item.details }));
      }
    }

    // 4. Create Customers & Bookings
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
        { service: allServices[1 % allServices.length], status: BookingStatus.CONFIRMED, payment: PaymentStatus.PAID, qty: 1 },
        { service: allServices[2 % allServices.length], status: BookingStatus.PENDING, payment: PaymentStatus.PENDING, qty: 3 },
      ];

      for (let i = 0; i < bookingsToCreate.length; i++) {
        const bData = bookingsToCreate[i];
        const date = new Date();
        date.setDate(date.getDate() + (i - 2));

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
            totalAmount: bData.service.price * bData.qty,
            bookingStatus: bData.status,
            paymentStatus: bData.payment,
            transactionId: `TX-${Math.random().toString(36).substring(2, 10).toUpperCase()}`,
          }));
        }
      }
    }

    process.stdout.write(
      'Seed completed: Users, Providers, and Services (Trans/Acc/Tour) with Bookings are ready.\n',
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

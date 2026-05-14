import * as bcrypt from 'bcrypt';
import { DataSource } from 'typeorm';
import dataSource from './data-source';
import { User, UserRole, AccountStatus } from '../modules/users/entities/user.entity';
import { Provider } from '../modules/providers/entities/provider.entity';
import { Service } from '../modules/services/entities/service.entity';
import { Transportation } from '../modules/services/entities/transportation.entity';
import { Accommodation } from '../modules/services/entities/accommodation.entity';
import { TourPackage } from '../modules/services/entities/tour-package.entity';
import { ServiceInventory } from '../modules/services/entities/service-inventory.entity';
import { ServiceType, TransportType } from '../shared/enums';

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
    // 1. Users
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

    // 2. Provider
    const providerRepository = dataSource.getRepository(Provider);
    let provider = await providerRepository.findOne({
      where: { userId: providerUser.id },
    });

    if (!provider) {
      provider = providerRepository.create({
        userId: providerUser.id,
        companyName: 'Cambodia Tour Provider',
        description: 'Seeded provider account for local development.',
        address: 'Phnom Penh, Cambodia',
        facebookUrl: 'https://facebook.com/cambodiatourprovider',
        telegramUrl: 'https://t.me/cambodiatourprovider',
        commissionRate: 10,
        isVerified: true,
        verifiedAt: new Date(),
      } as Partial<Provider>);
      provider = await providerRepository.save(provider);
    }

    // 3. Services Seeding
    const serviceRepository = dataSource.getRepository(Service);
    const transportRepo = dataSource.getRepository(Transportation);
    const accommodationRepo = dataSource.getRepository(Accommodation);
    const tourRepo = dataSource.getRepository(TourPackage);
    const inventoryRepo = dataSource.getRepository(ServiceInventory);

    // Clear existing services to avoid duplicates in dev
    await serviceRepository.createQueryBuilder().delete().from(Service).execute();

    // --- Transportation Services ---
    const transData = [
      {
        title: 'Private Luxury SUV Transfer',
        description: 'Safe and comfortable air-conditioned transfer between Siem Reap and Phnom Penh.',
        price: 85.00,
        location: 'Cambodia-wide',
        inventory: 10,
        details: {
          transportType: TransportType.CAR,
          vehicleModel: 'Lexus LX570',
          totalSeats: 4,
          pricePerSeat: 85.00,
          departurePoint: 'Siem Reap City Center',
          destination: 'Phnom Penh Riverside',
          departureTime: new Date(Date.now() + 86400000),
        }
      },
      {
        title: 'Traditional Tuk-Tuk City Explorer',
        description: 'An authentic tour through the bustling markets of Phnom Penh in a private tuk-tuk.',
        price: 15.00,
        location: 'Phnom Penh',
        inventory: 25,
        details: {
          transportType: TransportType.TUK_TUK,
          vehicleModel: 'Remorque (Traditional)',
          totalSeats: 3,
          pricePerSeat: 15.00,
          departurePoint: 'Phnom Penh Post Office',
          destination: 'Wat Phnom',
          departureTime: new Date(Date.now() + 90000000),
        }
      }
    ];

    for (const item of transData) {
      const s = await serviceRepository.save(serviceRepository.create({
        providerId: provider.id,
        serviceType: ServiceType.TRANSPORTATION,
        title: item.title,
        description: item.description,
        price: item.price,
        location: item.location,
        duration: 'Variable',
        rating: 4.8,
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
        details: {
          hotelName: 'Heritage Riverside',
          roomType: 'Colonial Suite',
          totalRooms: 5,
          pricePerNight: 120.00,
          checkInTime: '14:00:00',
          checkOutTime: '12:00:00',
          address: 'Preah Sisowath Quay, Phnom Penh',
        }
      },
      {
        title: 'Island Retreat - Koh Rong Samloem',
        description: 'Eco-friendly beachfront bungalow. Perfect for disconnecting.',
        price: 95.00,
        location: 'Koh Rong',
        inventory: 8,
        details: {
          hotelName: 'Samloem Eco Retreat',
          roomType: 'Beachfront Eco-Pod',
          totalRooms: 8,
          pricePerNight: 95.00,
          checkInTime: '13:00:00',
          checkOutTime: '11:00:00',
          address: 'Saracen Bay, Koh Rong Samloem',
        }
      },
      {
        title: 'Cardamom Mountains Eco-Lodge',
        description: 'Stay in a high-end glamping tent nestled in the jungle.',
        price: 150.00,
        location: 'Koh Kong',
        inventory: 4,
        details: {
          hotelName: 'Cardamom Eco Lodge',
          roomType: 'Luxury Jungle Tent',
          totalRooms: 4,
          pricePerNight: 150.00,
          checkInTime: '14:00:00',
          checkOutTime: '12:00:00',
          address: 'Tatai River, Koh Kong',
        }
      }
    ];

    for (const item of accData) {
      const s = await serviceRepository.save(serviceRepository.create({
        providerId: provider.id,
        serviceType: ServiceType.ACCOMMODATION,
        title: item.title,
        description: item.description,
        price: item.price,
        location: item.location,
        duration: 'Per Night',
        rating: 4.9,
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
        details: {
          numDays: 1,
          maxPeople: 20,
          basePrice: 45.00,
          travelDate: new Date(Date.now() + 604800000),
          endDate: new Date(Date.now() + 604800000),
          destination: 'Angkor Archaeological Park',
        }
      },
      {
        title: 'Banteay Srei & Landmine Museum Tour',
        description: 'Explore the Citadel of Women and learn about modern history.',
        price: 35.00,
        location: 'Siem Reap',
        inventory: 15,
        details: {
          numDays: 1,
          maxPeople: 15,
          basePrice: 35.00,
          travelDate: new Date(Date.now() + 691200000),
          endDate: new Date(Date.now() + 691200000),
          destination: 'Banteay Srei',
        }
      },
      {
        title: 'Phnom Kulen Waterfall Expedition',
        description: 'Full-day nature trek to the sacred Kulen Mountain and waterfalls.',
        price: 55.00,
        location: 'Siem Reap',
        inventory: 12,
        details: {
          numDays: 1,
          maxPeople: 12,
          basePrice: 55.00,
          travelDate: new Date(Date.now() + 777600000),
          endDate: new Date(Date.now() + 777600000),
          destination: 'Phnom Kulen National Park',
        }
      },
      {
        title: 'Mekong River Sunset Cruise',
        description: 'Watch the sun dip below the horizon on a traditional wooden boat.',
        price: 25.00,
        location: 'Phnom Penh',
        inventory: 30,
        details: {
          numDays: 1,
          maxPeople: 30,
          basePrice: 25.00,
          travelDate: new Date(Date.now() + 864000000),
          endDate: new Date(Date.now() + 864000000),
          destination: 'Phnom Penh Rivers',
        }
      },
      {
        title: 'Ancient Temple Cycle Tour',
        description: 'Avoid the crowds and see the temples of Angkor by bicycle.',
        price: 20.00,
        location: 'Siem Reap',
        inventory: 18,
        details: {
          numDays: 1,
          maxPeople: 18,
          basePrice: 20.00,
          travelDate: new Date(Date.now() + 950400000),
          endDate: new Date(Date.now() + 950400000),
          destination: 'Angkor Trails',
        }
      }
    ];

    for (const item of tourData) {
      const s = await serviceRepository.save(serviceRepository.create({
        providerId: provider.id,
        serviceType: ServiceType.TOUR,
        title: item.title,
        description: item.description,
        price: item.price,
        location: item.location,
        duration: '1 Day',
        rating: 5.0,
      }));
      await inventoryRepo.save(inventoryRepo.create({ serviceId: s.id, totalCapacity: item.inventory }));
      await tourRepo.save(tourRepo.create({ serviceId: s.id, ...item.details }));
    }

    process.stdout.write(
      'Seed completed: Users, Provider, and 10 Services (Trans/Acc/Tour) are ready.\n',
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

import { Car } from '@/domain/car.model';
import { Prisma } from '@/storage/client/client';

export const dbCarToDomain = (car: Prisma.CarGetPayload<Prisma.CarDefaultArgs>): Car => {
  return {
    id: car.id,
    name: car.name,
    createdAt: car.createdAt,
    updatedAt: car.updatedAt,
  };
};

export const carToDbCar = (car: Car): Prisma.CarCreateInput => {
  return {
    name: car.name,
  };
};

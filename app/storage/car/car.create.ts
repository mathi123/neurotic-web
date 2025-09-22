import { Car } from '@/domain/car.model';
import { getPrismaClient } from '../utils';
import { carToDbCar, dbCarToDomain } from './car.mappers';

export const dbCarCreate = async (car: Car): Promise<Car> => {
  const prisma = getPrismaClient();
  const createdCar = await prisma.car.create({
    data: carToDbCar(car),
  });
  return dbCarToDomain(createdCar);
};

import { Car } from '@/domain/car.model';
import { getPrismaClient } from '../utils';
import { dbCarToDomain } from './car.mappers';

export const dbCarUpdate = async (car: Car): Promise<Car> => {
  const prisma = getPrismaClient();
  const updatedCar = await prisma.car.update({
    where: { id: car.id! },
    data: {
      name: car.name,
    },
  });
  return dbCarToDomain(updatedCar);
};

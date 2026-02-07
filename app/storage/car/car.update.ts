import { Car } from '@/domain/car.model';
import { getPrismaClient } from '@/storage/utils';
import { carToDbCarUpdate, dbCarToDomain } from './car.mappers';

export const dbCarUpdate = async (car: Car): Promise<Car> => {
  const prisma = getPrismaClient();
  const updatedCar = await prisma.car.update({
    where: { id: car.id! },
    data: carToDbCarUpdate(car),
  });
  return dbCarToDomain(updatedCar);
};

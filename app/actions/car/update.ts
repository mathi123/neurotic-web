import * as z from 'zod';
import { Car, carSchema } from '@/domain/car.model';
import { dbCarUpdate } from '@/storage/car/car.update';

export const updateCar = async (car: Car): Promise<Car> => {
  const validatedCar = carSchema.parse(car);
  // Ensure id is not null for updates
  z.uuid().parse(validatedCar.id);
  const result = await dbCarUpdate(validatedCar);
  return result;
};

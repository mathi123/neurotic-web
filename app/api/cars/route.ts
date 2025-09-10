import { type NextRequest } from 'next/server';
import { searchCar } from '@/actions/car/search';
import { createCar } from '@/actions/car/create';
import { fromZodParseResult, tryCreateResource } from '@/api/utils';
import { carFilterSchema } from '@/domain/car.filter';

export async function GET(request: NextRequest) {
  const carFilter = carFilterSchema.safeParse(Object.fromEntries(request.nextUrl.searchParams));
  if (!carFilter.success) {
    return fromZodParseResult(carFilter);
  }
  const result = await searchCar(carFilter.data);
  return Response.json(result);
}

export async function POST(request: NextRequest) {
  try {
    const car = await request.json();
    return tryCreateResource(createCar, car);
  } catch (error) {
    console.error(error);
    return Response.json({}, { status: 500 });
  }
}

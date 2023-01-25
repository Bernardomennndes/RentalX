import dayjs from 'dayjs';

import { RentalsRepositoryInMemory } from '@modules/rentals/repositories/in-memory/RentalsRepositoryInMemory';
import { DayjsDateProvider } from '@shared/container/providers/DateProvider/implementations/DayjsDateProvider';
import { AppError } from '@shared/errors/AppError';

import { CreateRentalUseCase } from './CreateRentalUseCase';

let createRentalUseCase: CreateRentalUseCase;
let rentalsRepositoryInMemory: RentalsRepositoryInMemory;
let dayJsDateProvider: DayjsDateProvider;

describe('Create Rental', () => {
	const dayAdd24Hours = dayjs().add(1, 'day').toDate();

	beforeEach(() => {
		rentalsRepositoryInMemory = new RentalsRepositoryInMemory();
		dayJsDateProvider = new DayjsDateProvider();
		createRentalUseCase = new CreateRentalUseCase(
			rentalsRepositoryInMemory,
			dayJsDateProvider,
		);
	});

	it('Should be able to create a new rental', async () => {
		const rental = await createRentalUseCase.execute({
			user_id: '12345',
			car_id: '12323',
			expected_return_date: dayAdd24Hours,
		});

		expect(rental).toHaveProperty('id');
		expect(rental).toHaveProperty('start_date');
	});

	it('Should not be able to create a new rental if there is another open rental related to the same user', () => {
		expect(async () => {
			await createRentalUseCase.execute({
				user_id: '12345',
				car_id: '12323',
				expected_return_date: dayAdd24Hours,
			});

			await createRentalUseCase.execute({
				user_id: '12345',
				car_id: '12363',
				expected_return_date: dayAdd24Hours,
			});
		}).rejects.toBeInstanceOf(AppError);
	});

	it('Should not be able to create a new rental with return time less than 24 hours', () => {
		expect(async () => {
			await createRentalUseCase.execute({
				user_id: '12347',
				car_id: '12323',
				expected_return_date: dayjs().toDate(),
			});
		}).rejects.toBeInstanceOf(AppError);
	});
});

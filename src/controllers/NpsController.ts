import { Request, Response } from 'express';
import { getCustomRepository, Not, IsNull } from 'typeorm';
import { SurveysUsersRepository } from '../repositories/SurveysUsersRepository';

class NpsController {
	/**
	 * NPS calculation
	 * detractors: 0 - 6
	 * passives: 7 - 8
	 * promoters: 9 - 10
	 *
	 * Formula: (N promoters - N detractors) / (N responses) * 100
	 */

	async execute(req: Request, res: Response) {
		const { survey } = req.params;

		const repository = getCustomRepository(SurveysUsersRepository);

		const data = await repository.find({
			survey_id: survey,
			value: Not(IsNull()),
		});
		console.log(data);
		if (data) {
			const detractors = data.filter(
				(survey) => survey.value <= 0 && survey.value <= 6
			);

			const promoters = data.filter(
				(survey) => survey.value >= 9 && survey.value <= 10
			);

			const passives = data.filter(
				(survey) => survey.value >= 7 && survey.value <= 8
			);

			const nps =
				((promoters.length - detractors.length) / Number(data.length)) *
				100;

			return res.status(200).json({
				code: 200,
				survey: data,
				numberOfResponses: data.length,
				nps,
				passives: {
					label: 'Answer between 7 and 8',
					count: passives.length,
				},
				promoters: {
					label: 'Answer between 9 and 10',
					count: promoters.length,
				},
				detractors: {
					label: 'Answer between 0 and 6',
					count: detractors.length,
				},
			});
		} else {
			return res.status(404).json({
				code: 404,
				message: 'Survey user not found!',
			});
		}
	}
}

export { NpsController };

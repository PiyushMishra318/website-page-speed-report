import { Test, TestingModule } from '@nestjs/testing';
import { PagespeedController } from './pagespeed.controller';
import { PagespeedService } from './pagespeed.service';

describe('PagespeedController', () => {
  let controller: PagespeedController;
  const analyzeUrl = jest.fn();

  beforeEach(async () => {
    analyzeUrl.mockReset();
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PagespeedController],
      providers: [
        {
          provide: PagespeedService,
          useValue: { analyzeUrl },
        },
      ],
    }).compile();

    controller = module.get(PagespeedController);
  });

  it('returns health status', () => {
    expect(controller.health()).toEqual({ status: 'ok' });
  });

  it('delegates url analysis to the service', async () => {
    const payload = {
      url: 'https://example.com',
      desktop: { score: 90, stats: {}, opportunities: [] },
      mobile: { score: 80, stats: {}, opportunities: [] },
    };
    analyzeUrl.mockResolvedValue(payload);

    await expect(controller.analyze('https://example.com')).resolves.toEqual(payload);
    expect(analyzeUrl).toHaveBeenCalledWith('https://example.com');
  });
});

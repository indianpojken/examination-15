import { http, HttpResponse } from 'msw';
import { customAlphabet } from 'nanoid';

import { PRICES } from '../tests/constants.js';

const URI = 'https://h5jbtjv6if.execute-api.eu-north-1.amazonaws.com';

export const handlers = [
  http.post(URI, async ({ request }) => {
    const body = await request.json();

    return HttpResponse.json({
      id: customAlphabet('ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789', 11)(),
      ...body,
      price: body.people * PRICES.person + body.lanes * PRICES.lane,
    });
  }),
];

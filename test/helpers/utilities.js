import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { PRICES } from './constants';

export function getBookingForm() {
  const [people, lanes] = screen.getAllByRole('spinbutton');

  return {
    date: screen.getByText(/date/i).nextSibling,
    time: screen.getByText(/time/i).nextSibling,
    people,
    lanes,
    submit: screen.getByRole('button', { name: 'strIIIIIike!' }),
  };
}

export async function mockBookingForm(testdata) {
  const form = getBookingForm();

  await userEvent.type(form.date, testdata.date);
  await userEvent.type(form.time, testdata.time);
  await userEvent.type(form.people, String(testdata.people));
  await userEvent.type(form.lanes, String(testdata.lanes));
}

export async function addShoes(amountOfShoes) {
  const addShoe = screen.getByRole('button', { name: '+' });

  for (let index = 0; index < amountOfShoes; index++) {
    await userEvent.click(addShoe);
  }

  const shoes = screen.getAllByRole('article');

  for (const shoe of shoes) {
    await userEvent.type(
      within(shoe).getByRole('textbox'),
      String(Math.floor(Math.random() * (46 - 38 + 1)) + 38)
    );
  }
}

export function getConfirmation() {
  return {
    when: screen.getByText(/when/i).nextSibling,
    who: screen.getByText(/who/i).nextSibling,
    lanes: screen.getByText(/lanes/i).nextSibling,
    bookingNumber: screen.getByText(/booking number/i).nextSibling,
    price: screen.getByText(/\d+ sek/),
    submit: screen.getByRole('button'),
  };
}

export function calculateTotal(people, lanes) {
  return people * PRICES.person + lanes * PRICES.lane;
}

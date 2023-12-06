import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect } from 'vitest';
import { createMemoryRouter, RouterProvider } from 'react-router-dom';

import { DATA, ERROR_MESSAGE, PRICES } from './tests/constants.js';

import {
  getBookingForm,
  mockBookingForm,
  addShoes,
  getConfirmation,
} from './tests/utilities.js';

import router from './router.jsx';

beforeEach(() => {
  const memoryRouter = createMemoryRouter(router.routes);
  render(<RouterProvider router={memoryRouter} />);
});

describe('Som användare vill jag kunna boka datum och tid samt ange antal spelare så att jag kan reservera 1 eller flera baner i bowlinghallen.', () => {
  describe('Användaren ska presenteras med ett formulär för att fylla i dom delar som krävs för att göra en bokning.', () => {
    test('Inmatningsfält för datum.', () =>
      expect(getBookingForm().date).toBeVisible());

    test('Inmatningsfält för tid.', () =>
      expect(getBookingForm().time).toBeVisible());

    test('Inmatningsfält för antal spelare.', () =>
      expect(getBookingForm().people).toBeVisible());

    test('Inmatningsfält för antal banor.', () =>
      expect(getBookingForm().lanes).toBeVisible());
  });

  test('Om användaren inte matar in samma antal skostorlekar, som antalet spelare, ska ett felmeddelande visas.', async () => {
    const amountOfShoes = DATA.people - 1;

    await mockBookingForm(DATA);
    await addShoes(amountOfShoes);

    const shoes = screen.getAllByRole('article');

    await userEvent.click(getBookingForm().submit);

    expect(shoes.length).toBe(amountOfShoes);
    expect(screen.getByText(ERROR_MESSAGE)).toBeVisible();
  });

  test('Användaren ska presenteras med ett felmeddelande om inmatningsfälten inte är korrekt ifyllda.', async () => {
    await userEvent.click(getBookingForm().submit);
    expect(screen.getByText(ERROR_MESSAGE)).toBeVisible();
  });

  test('Användaren ska kunna klicka på en knapp för att skicka iväg en reservation.', async () => {
    expect(getBookingForm().submit).toBeVisible();
  });

  test('Om bokningen går igenom, ska användaren skickas till bekräftelsevyn, där information om bokningen presenteras.', async () => {
    await mockBookingForm(DATA);
    await addShoes(DATA.people);

    await userEvent.click(getBookingForm().submit);

    expect(screen.getByRole('heading')).not.toHaveTextContent(/booking/i);
  });
});

describe('Som användare vill jag kunna välja skostorlek för varje spelare så varje spelare får skor som passar.', () => {
  test('Användaren ska kunna klicka på en knapp för att lägga till skor.', async () => {
    await addShoes(DATA.people);
    const addShoe = screen.getByRole('button', { name: '+' });
    const shoes = screen.getAllByRole('article');

    expect(addShoe).toBeVisible();
    expect(shoes.length).toBe(DATA.people);
  });

  describe('Om användaren lagt till skor, ska användaren presenteras med inmatningsfält för att välja skostorlek(ar).', () => {
    beforeEach(async () => await addShoes(DATA.people));

    test('Inmatningsfält för skostorlek.', async () => {
      const shoes = screen.getAllByRole('article');

      shoes.forEach((shoe) => {
        expect(
          within(shoe).getByRole('textbox', { type: 'text' })
        ).toBeVisible();
      });
    });

    test('Knapp för att ta bort sko.', async () => {
      const shoes = screen.getAllByRole('article');

      shoes.forEach((shoe) => {
        expect(within(shoe).getByRole('button', { name: '-' })).toBeVisible();
      });
    });
  });
});

describe('Som användare vill jag kunna ta bort ett fält för skostorlek om jag råkade klicka i ett för mycket så jag inte boka skor i onödan.', () => {
  test('Användaren ska kunna klicka på en knapp för att ta bort ett specifikt inmatningsfält för skostorlek.', async () => {
    await addShoes(DATA.people);

    const buttonsToRemoveShoes = screen.getAllByRole('button', { name: '-' });

    for (const button of buttonsToRemoveShoes) {
      await userEvent.click(button);
    }

    const shoes = screen.queryAllByRole('article');
    expect(shoes.length).toBe(0);
  });

  test('Användaren ska inte kunna ta bort ett inmatningsfält, om inga skostolekar är tillagd.', async () => {
    const buttonsToRemoveShoes = screen.queryAllByRole('button', { name: '-' });
    expect(buttonsToRemoveShoes.length).toBe(0);
  });
});

describe('Som användare vill jag kunna skicka iväg min reservation och få tillbaka ett ett bokningsnummer och totalsumma så jag vet hur mycket jag ska betala. (120 kr / person + 100 kr / bana).', () => {
  beforeEach(async () => {
    await mockBookingForm(DATA);
    await addShoes(DATA.people);

    await userEvent.click(getBookingForm().submit);
  });

  describe('Om bokningen går igenom, ska användaren skickas till bekräftelsevyn, där information om bokningen presenteras.', async () => {
    test('Tid och datum', () => {
      expect(getConfirmation().when).toHaveDisplayValue(
        `${DATA.date} ${DATA.time}`
      );
    });

    test('Antal spelare', () => {
      expect(getConfirmation().who).toHaveDisplayValue(DATA.people);
    });

    test('Antal banor', () => {
      expect(getConfirmation().lanes).toHaveDisplayValue(DATA.lanes);
    });

    test('Bokningsnummer', () => {
      expect(getConfirmation().bookingNumber).not.toHaveDisplayValue('');
    });

    test('Totalsumman', () => {
      expect(getConfirmation().price).toHaveTextContent(
        `${DATA.people * PRICES.person + DATA.lanes * PRICES.lane} sek`
      );
    });
  });

  test('Användaren ska kunna klicka på en knapp för att slutföra bokningen.', async () => {
    expect(getConfirmation().submit).toBeVisible();
  });
});

describe('Som användare vill jag kunna navigera mellan boknings-och bekräftelsevyn.', () => {
  const navigation = () => screen.getByRole('navigation');
  const menu = () => within(navigation()).getByRole('img');

  const link = (title) =>
    within(navigation()).getByRole('link', {
      name: new RegExp(title, 'i'),
    });

  test('Användaren ska kunna klicka på en meny-knapp och alternativ att navigera till ska då visas.', async () => {
    await userEvent.click(menu());
    const links = within(navigation()).getAllByRole('link');

    links.forEach((link) => expect(link).toBeVisible());
    await userEvent.click(menu());
    links.forEach((link) => expect(link).not.toBeVisible());
    expect(links.length).not.toBe(0);
  });

  test('Om användaren klickar på meny-knappen, när menyn är öppen, ska menyn stängas.', async () => {
    await userEvent.click(menu());
    expect(navigation()).toHaveClass('show-menu');

    await userEvent.click(menu());
    expect(navigation()).not.toHaveClass('show-menu');
  });

  test('Användaren ska kunna navigera från bokningsvyn till bekräftelsevyn.', async () => {
    await userEvent.click(menu());
    await userEvent.click(link('confirmation'));

    const header = screen.queryByRole('heading', { name: /booking/i });
    expect(header).not.toBeInTheDocument();
  });

  test('Användaren ska kunna navigera tillbaka till bokningsvyn från bekräftelsevyn.', async () => {
    await userEvent.click(menu());
    await userEvent.click(link('confirmation'));

    await userEvent.click(menu());
    await userEvent.click(link('booking'));

    expect(
      screen.getByRole('heading', { name: /booking/i })
    ).toBeInTheDocument();
  });
});

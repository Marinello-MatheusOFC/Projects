import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { Header } from '@/components/layout/Header';

function renderHeader() {
  return render(
    <MemoryRouter>
      <Header />
    </MemoryRouter>,
  );
}

describe('Header', () => {
  it('abre e fecha o drawer móvel', () => {
    renderHeader();
    fireEvent.click(screen.getByRole('button', { name: 'Abrir menu' }));

    const drawer = screen.getByRole('dialog', { name: 'Menu principal' });
    expect(drawer).toBeInTheDocument();

    fireEvent.click(within(drawer).getByRole('button', { name: 'Fechar menu' }));
    expect(screen.queryByRole('dialog', { name: 'Menu principal' })).not.toBeInTheDocument();
  });

  it('fecha o drawer com a tecla Escape', () => {
    renderHeader();
    fireEvent.click(screen.getByRole('button', { name: 'Abrir menu' }));
    expect(screen.getByRole('dialog', { name: 'Menu principal' })).toBeInTheDocument();

    fireEvent.keyDown(document, { key: 'Escape' });
    expect(screen.queryByRole('dialog', { name: 'Menu principal' })).not.toBeInTheDocument();
  });

  it('exibe navegação principal com links', () => {
    renderHeader();
    const nav = screen.getByRole('navigation', { name: 'Navegação principal' });
    expect(within(nav).getByRole('link', { name: 'Conhecer animais' })).toBeInTheDocument();
    expect(within(nav).getByRole('link', { name: 'Como ajudar' })).toBeInTheDocument();
    expect(within(nav).getByRole('link', { name: 'Contato' })).toBeInTheDocument();
  });
});

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ResponsivePicture } from '@/components/media/ResponsivePicture';

describe('ResponsivePicture', () => {
  it('renderiza fallback contextual quando src está vazio', () => {
    render(<ResponsivePicture src="" alt="Luna" fallback="animal" />);
    expect(screen.getByText('Foto em atualização')).toBeInTheDocument();
  });

  it('renderiza fallback de evento quando src está vazio', () => {
    render(<ResponsivePicture src="" alt="Feira de adoção" fallback="event" />);
    expect(screen.getByText('Evento SOS Focinho Carente')).toBeInTheDocument();
  });

  it('renderiza a imagem quando src existe', () => {
    render(
      <ResponsivePicture
        src="/images/demo/animal-dog-01.jpg"
        alt="Luna, cachorra"
        width={400}
        height={300}
      />,
    );
    const img = screen.getByRole('img', { name: 'Luna, cachorra' });
    expect(img).toHaveAttribute('src', '/images/demo/animal-dog-01.jpg');
  });
});

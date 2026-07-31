import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { ResponsivePicture } from '@/components/media/ResponsivePicture';

interface EventsEmptyStateProps {
  image: string;
  imageAlt: string;
}

export function EventsEmptyState({ image, imageAlt }: EventsEmptyStateProps) {
  return (
    <div className="empty-state--photo">
      <div className="empty-state--photo__media">
        <ResponsivePicture
          src={image}
          alt={imageAlt}
          objectFit="cover"
          objectPosition="center 45%"
          width={800}
          height={520}
          fallback="event"
        />
      </div>
      <div className="empty-state--photo__body">
        <span className="eyebrow">Agenda</span>
        <h3>Não há eventos publicados no momento</h3>
        <p>
          Quando houver feiras de adoção, campanhas ou ações da SOS Focinho
          Carente, as informações aparecerão aqui. Enquanto isso, você já pode
          conhecer os animais que esperam por um lar.
        </p>
        <div className="empty-state--photo__actions">
          <Link to="/adocao">
            <Button>Conhecer os animais</Button>
          </Link>
          <Link to="/como-ajudar">
            <Button variant="outline">Como ajudar</Button>
          </Link>
          <Link to="/contato">
            <Button variant="ghost">Entrar em contato</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}

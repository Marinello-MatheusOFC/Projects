import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { ResponsivePicture } from '@/components/media/ResponsivePicture';

interface NewsEmptyStateProps {
  image: string;
  imageAlt: string;
}

export function NewsEmptyState({ image, imageAlt }: NewsEmptyStateProps) {
  return (
    <div className="empty-state--photo empty-state--photo--editorial">
      <div className="empty-state--photo__media">
        <ResponsivePicture
          src={image}
          alt={imageAlt}
          objectFit="cover"
          objectPosition="center 40%"
          width={900}
          height={600}
          fallback="news"
        />
      </div>
      <div className="empty-state--photo__body">
        <span className="eyebrow">Notícias</span>
        <h3>Ainda não há notícias publicadas</h3>
        <p>
          Enquanto isso, você pode conhecer os animais disponíveis e descobrir
          outras formas de ajudar a SOS Focinho Carente.
        </p>
        <div className="empty-state--photo__actions">
          <Link to="/adocao">
            <Button>Conhecer os animais</Button>
          </Link>
          <Link to="/como-ajudar">
            <Button variant="outline">Como ajudar</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}

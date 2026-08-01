import { useEffect, useState } from 'react';
import { Camera } from 'lucide-react';
import { EmptyState } from '@/components/feedback/EmptyState';
import { ErrorState } from '@/components/feedback/ErrorState';
import { CardSkeleton } from '@/components/feedback/Skeleton';
import { ResponsivePicture } from '@/components/media/ResponsivePicture';
import { PageHeader } from '@/components/layout/PageHeader';
import { fetchGallery, type GalleryAlbumWithImages } from '@/services/gallery';

export default function GalleryPage() {
  const [albums, setAlbums] = useState<GalleryAlbumWithImages[] | null>(null);
  const [error, setError] = useState(false);
  const [reload, setReload] = useState(0);

  useEffect(() => {
    document.title = 'Galeria — SOS Focinho Carente';
  }, []);

  useEffect(() => {
    let active = true;
    setAlbums(null);
    setError(false);
    fetchGallery()
      .then((result) => {
        if (active) setAlbums(result);
      })
      .catch(() => {
        if (active) setError(true);
      });
    return () => {
      active = false;
    };
  }, [reload]);

  const albumsWithImages = (albums ?? []).filter((album) => album.images.length > 0);

  return (
    <div>
      <PageHeader
        tone="yellow"
        eyebrow="Álbum de fotos"
        title="Galeria"
        subtitle="Momentos especiais dos nossos animais e eventos."
        media={{
          src: '/images/demo/animal-cat-03.jpg',
          alt: 'Registro de um momento da ONG',
          objectPosition: 'center 50%',
          fallback: 'gallery',
        }}
      />

      <section className="section section--cream">
        <div className="container">
          {error ? (
            <ErrorState
              message="Não conseguimos carregar a galeria agora."
              onRetry={() => setReload((value) => value + 1)}
            />
          ) : albums === null ? (
            <div className="gallery-grid" aria-label="Carregando galeria">
              {Array.from({ length: 8 }).map((_, i) => (
                <CardSkeleton key={i} />
              ))}
            </div>
          ) : albumsWithImages.length === 0 ? (
            <EmptyState
              icon={<Camera size={48} aria-hidden="true" />}
              title="Nenhum registro na galeria"
              description="Em breve teremos novas fotos por aqui."
            />
          ) : (
            albumsWithImages.map((album) => (
              <div key={album.id} style={{ marginBottom: 'var(--space-12)' }}>
                <div className="section-intro">
                  <h2>{album.title}</h2>
                  {album.description && <p>{album.description}</p>}
                </div>
                <div className="gallery-grid">
                  {album.images.map((image, i) => (
                    <div key={image.id} className="gallery-item">
                      <ResponsivePicture
                        src={album.imageUrls[i]}
                        alt={image.alt_text ?? image.caption ?? `${album.title} — foto ${i + 1}`}
                        objectFit="cover"
                        objectPosition="center 50%"
                        width={600}
                        height={600}
                        fallback="gallery"
                      />
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  );
}

import { ResponsivePicture } from '@/components/media/ResponsivePicture';

const galleryImages = [
  '/images/demo/adoption-event.jpg',
  '/images/demo/animal-puppy.jpg',
  '/images/demo/shelter-space.jpg',
  '/images/demo/volunteer-team.jpg',
];

const dummyGallery = [
  { id: 1, caption: 'Momento de cuidado' },
  { id: 2, caption: 'Voluntários em ação' },
  { id: 3, caption: 'Animal em acolhimento' },
  { id: 4, caption: 'Campanha de adoção' },
];

export default function GalleryPage() {
  return (
    <div>
      <section className="page-hero">
        <div className="page-hero-photo">
          <ResponsivePicture
            src="/images/demo/hero-cat.jpg"
            alt="Galeria de fotos da ONG"
            objectFit="cover"
            objectPosition="center 50%"
            priority
            width={1920}
            height={600}
            fallback="gallery"
          />
        </div>
        <div className="page-hero-overlay" />
        <div className="container">
          <h1 className="page-hero-title">Galeria</h1>
          <p className="page-hero-subtitle">
            Momentos especiais dos nossos animais e eventos.
          </p>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="gallery-grid">
            {dummyGallery.map((item) => (
              <div key={item.id} className="gallery-item">
                <ResponsivePicture
                  src={galleryImages[item.id - 1]}
                  alt={item.caption}
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
      </section>
    </div>
  );
}

import { useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination } from "swiper/modules";

import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

// Optional: Lightbox component (simples)
const ImageModal = ({ url, onClose }: { url: string; onClose: () => void }) => (
  <div className="fixed inset-0 bg-black bg-opacity-80 flex justify-center items-center z-50">
    <div className="relative">
      <button
        className="absolute top-2 right-2 text-white text-3xl font-bold"
        onClick={onClose}
      >
        &times;
      </button>
      <img
        src={url}
        alt="Imagem ampliada"
        className="max-h-screen max-w-screen"
      />
    </div>
  </div>
);

// Carrossel de galeria
export function GalleryCarousel({ images }: { images: string[] }) {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  if (!images || images.length === 0) return null;

  return (
    <>
      <Swiper
        modules={[Navigation, Pagination]}
        navigation
        pagination={{ clickable: true }}
        spaceBetween={10}
        slidesPerView={1}
        className="mb-8 rounded-lg overflow-hidden"
        breakpoints={{
          640: {
            slidesPerView: 1,
          },
          768: {
            slidesPerView: 2,
          },
          1024: {
            slidesPerView: 3,
          },
        }}
      >
        {images.map((url, i) => (
          <SwiperSlide key={i}>
            <img
              src={url}
              alt={`Foto ${i + 1}`}
              onClick={() => setSelectedImage(url)}
              className="w-full h-48 sm:h-64 object-cover cursor-pointer rounded-md"

            />
          </SwiperSlide>
        ))}
      </Swiper>

      {selectedImage && (
        <ImageModal
          url={selectedImage}
          onClose={() => setSelectedImage(null)}
        />
      )}
    </>
  );
}

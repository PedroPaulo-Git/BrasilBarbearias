-- AlterTable
ALTER TABLE "shops" ADD COLUMN     "description" TEXT,
ADD COLUMN     "galleryImages" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "instagramUrl" TEXT,
ADD COLUMN     "mapUrl" TEXT,
ADD COLUMN     "rating" DOUBLE PRECISION,
ADD COLUMN     "whatsappUrl" TEXT;

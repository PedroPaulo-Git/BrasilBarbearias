import Link from "next/link"
import { Github, Twitter, Facebook } from "lucide-react"
import Logo from "@/assets/LogoSemFundo.png"
import Image from "next/image"
export default function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-muted border-t" id="contact">
      <div className="container mx-auto py-12 px-4">
        <div className="grid md:grid-cols-3 gap-8">
          {/* About Section */}
          <div>
            <h3 className="text-lg font-semibold text-foreground mb-4">
              <Image src={Logo} alt="Sua Barbearia App" width={100} height={100} />
            </h3>
            <p className="text-sm text-muted-foreground">
              A solução completa para gerenciar sua barbearia. 
              Simplifique agendamentos e foque no que você faz de melhor: cortar cabelo.
            </p>
          </div>

          {/* Quick Links Section */}
          <div>
            <h3 className="text-lg font-semibold text-foreground mb-4">
              Links Rápidos
            </h3>
            <ul className="space-y-2">
              <li><Link href="/#features" className="text-sm text-muted-foreground hover:text-primary transition-colors">Funcionalidades</Link></li>
              <li><Link href="/shops" className="text-sm text-muted-foreground hover:text-primary transition-colors">Encontrar Barbearias</Link></li>
              <li><Link href="/auth/signup" className="text-sm text-muted-foreground hover:text-primary transition-colors">Cadastrar Negócio</Link></li>
              <li><Link href="/privacy" className="text-sm text-muted-foreground hover:text-primary transition-colors">Política de Privacidade</Link></li>
            </ul>
          </div>

          {/* Social Media Section */}
          <div>
            <h3 className="text-lg font-semibold text-foreground mb-4">
              Siga-nos
            </h3>
            <div className="flex items-center gap-4">
              <Link href="#" className="text-muted-foreground hover:text-primary transition-colors">
                <Twitter className="h-5 w-5" />
                <span className="sr-only">Twitter</span>
              </Link>
              <Link href="#" className="text-muted-foreground hover:text-primary transition-colors">
                <Facebook className="h-5 w-5" />
                <span className="sr-only">Facebook</span>
              </Link>
              <Link href="#" className="text-muted-foreground hover:text-primary transition-colors">
                <Github className="h-5 w-5" />
                <span className="sr-only">GitHub</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Copyright Section */}
        <div className="mt-12 pt-8 border-t border-muted-foreground/20 text-center">
          <p className="text-sm text-muted-foreground">
            &copy; {currentYear} Brasil Barbearias. Todos os direitos reservados.
          </p>
        </div>
      </div>
    </footer>
  )
} 
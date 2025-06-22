"use client"

import Link from "next/link"
import { Button } from "./ui/button"
import { Sheet, SheetContent, SheetTrigger } from "./ui/sheet"
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar"
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "./ui/dropdown-menu"
import { Menu, User } from "lucide-react"
import { useSession, signOut } from "next-auth/react"
import Logo from "@/assets/LogoPernambucoBarbearias.png"
import Image from "next/image"

export default function Header() {
  const { data: session, status } = useSession()

  const handleLogout = async () => {
    await signOut({ callbackUrl: '/' })
  }

  const UserAvatar = () => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-10 w-10 rounded-full">
          <Avatar className="h-10 w-10">
            <AvatarImage src={session?.user?.image || ''} alt="User" />
            <AvatarFallback>
              <User className="h-5 w-5" />
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">
              {session?.user?.name || 'Usuário'}
            </p>
            <p className="text-xs leading-none text-muted-foreground">
              {session?.user?.email}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild className="cursor-pointer">
          <Link href="/dashboard">Dashboard</Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild className="cursor-pointer">
          <Link href="/profile">Meu Perfil</Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleLogout} className="cursor-pointer">
          Sair
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )

  const AuthButtons = () => (
    <div className="hidden md:flex items-center gap-4">
      <Button variant="ghost" asChild>
        <Link href="/auth/signin">Entrar</Link>
      </Button>
      <Button asChild>
        <Link href="/auth/signup">Cadastrar Barbearia</Link>
      </Button>
    </div>
  )

  const MobileAuthLinks = () => (
    <div className="border-t pt-4 mt-4 flex flex-col gap-4">
      {status === 'authenticated' ? (
        <>
          <Link href="/dashboard" className="font-medium">Dashboard</Link>
          <Link href="/profile" className="font-medium">Meu Perfil</Link>
          <Button onClick={handleLogout}>Sair</Button>
        </>
      ) : (
        <>
          <Button variant="ghost" asChild>
            <Link href="/auth/signin">Entrar</Link>
          </Button>
          <Button asChild>
            <Link href="/auth/signup">Cadastrar Barbearia</Link>
          </Button>
        </>
      )}
    </div>
  )

  return (
    <header className="bg-background/80 backdrop-blur-sm fixed top-0 left-0 right-0 z-50 border-b">
      <div className="container mx-auto flex justify-between items-center h-16 px-4">
        <Link href="/" className="text-xl font-bold text-primary">
          <Image src={Logo} alt="BarbeariaApp" width={70} height={100} />
        </Link>
        
        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-6">
          <Link href="/#features" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
            Funcionalidades
          </Link>
          <Link href="/shops" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
            Ver Barbearias
          </Link>
          <Link href="/#contact" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
            Contato
          </Link>
        </nav>

        {status === 'loading' ? (
          <div className="h-10 w-10 bg-muted rounded-full animate-pulse"></div>
        ) : status === 'authenticated' ? (
          <UserAvatar />
        ) : (
          <AuthButtons />
        )}

        {/* Mobile Navigation */}
        <div className="md:hidden">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Abrir menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right">
              <div className="grid gap-4 py-6 px-4">
                <Link href="/" className="text-lg font-bold text-primary mb-4">
                  <Image src={Logo} alt="BarbeariaApp" width={70} height={100} />
                </Link>
                <Link href="/#features" className="text-base font-medium text-muted-foreground hover:text-primary transition-colors">
                  Funcionalidades
                </Link>
                <Link href="/shops" className="text-base font-medium text-muted-foreground hover:text-primary transition-colors">
                  Ver Barbearias
                </Link>
                <Link href="/#contact" className="text-base font-medium text-muted-foreground hover:text-primary transition-colors">
                  Contato
                </Link>
                <MobileAuthLinks />
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  )
} 
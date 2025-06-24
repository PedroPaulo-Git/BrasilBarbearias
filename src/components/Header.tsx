"use client";

import Link from "next/link";
import { Button } from "./ui/button";
import { Sheet, SheetContent, SheetTrigger } from "./ui/sheet";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Menu, User } from "lucide-react";
import { useSession, signOut } from "next-auth/react";
import Logo from "@/assets/LogoSemFundo.png";
import Image from "next/image";
import { useEffect, useState } from "react";

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { data: session, status } = useSession();

  const handleLogout = async () => {
    await signOut({ callbackUrl: "/" });
  };

  const UserAvatar = () => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="relative h-10 w-10 rounded-full cursor-pointer"
        >
          <Avatar className="h-10 w-10">
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
              {session?.user?.name || "Usuário"}
            </p>
            <p className="text-xs leading-none text-muted-foreground">
              {session?.user?.email}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild className="cursor-pointer">
          <Link href="/dashboard">Gerenciar Barbearias</Link>
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
  );

  const AuthButtons = () => (
    <div className="hidden md:flex items-center gap-4">
      <Button variant="ghost" asChild>
        <Link href="/auth/signin">Entrar</Link>
      </Button>
      <Button asChild>
        <Link href="/auth/signup">Cadastrar Barbearia</Link>
      </Button>
    </div>
  );

  const MobileAuthLinks = () => (
    <div className="border-t pt-4 mt-4 flex flex-col gap-4">
      {status === "authenticated" ? (
        <>
          <Link
            href="/dashboard"
            className="font-medium"
            onClick={() => setIsMenuOpen(false)}
          >
            Painel
          </Link>
          <Link
            href="/profile"
            className="font-medium"
            onClick={() => setIsMenuOpen(false)}
          >
            Minha Conta
          </Link>
          <Button
            onClick={() => {
              handleLogout();
              setIsMenuOpen(false);
            }}
          >
            Sair
          </Button>
        </>
      ) : (
        <>
          <Button variant="ghost" asChild>
            <Link href="/auth/signin" onClick={() => setIsMenuOpen(false)}>
              Entrar
            </Link>
          </Button>
          <Button asChild>
            <Link href="/auth/signup" onClick={() => setIsMenuOpen(false)}>
              Cadastrar Barbearia
            </Link>
          </Button>
        </>
      )}
    </div>
  );
  useEffect(() => {
    console.log("User status:", status);
  }, [status]);

  return (
    <header className="bg-background/80 backdrop-blur-sm fixed top-0 left-0 right-0 z-50 border-b">
      <div className="container mx-auto flex justify-between items-center py-2 px-4">
        <Link href="/" className="text-xl font-bold text-primary">
          <Image src={Logo} alt="BarbeariaApp" width={70} height={100} />
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-6">
          <Link
            href="/#features"
            className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
          >
            Funcionalidades
          </Link>
          {status === "authenticated" && (
            <Link
              href="/dashboard"
              className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
            >
              Gerenciar Barbearias
            </Link>
          )}
          <Link
            href="/shops"
            className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
          >
            Ver Barbearias
          </Link>
          <Link
            href="/#contact"
            className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
          >
            Contato
          </Link>
        </nav>

        {status === "loading" ? (
          <div className="h-10 w-10 bg-muted rounded-full animate-pulse"></div>
        ) : status === "authenticated" ? (
          <div className="hidden md:block">
            <UserAvatar />
          </div>
        ) : (
          <div className="hidden md:block">
            <AuthButtons />
          </div>
        )}

        {/* Mobile Navigation */}
        <div className="md:hidden">
          <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Abrir menu</span>
              </Button>
            </SheetTrigger>
            
            <SheetContent side="right">
              <div className="grid gap-4 py-6 px-4">
                <Link
                  href="/"
                  className="text-lg font-bold text-primary mb-4"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <Image
                    src={Logo}
                    alt="BarbeariaApp"
                    width={70}
                    height={100}
                  />
                </Link>
                <Link
                  href="/#features"
                  className="text-base font-medium text-muted-foreground hover:text-primary transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Funcionalidades
                </Link>
                {status === "authenticated" && (
                  <Link
                    href="/dashboard"
                    className="text-base font-medium text-muted-foreground hover:text-primary transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Ver Minhas Barbearias
                  </Link>
                )}
                <Link
                  href="/shops"
                  className="text-base font-medium text-muted-foreground hover:text-primary transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Ver Barbearias
                </Link>
                <Link
                  href="/#contact"
                  className="text-base font-medium text-muted-foreground hover:text-primary transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Contato
                </Link>
                <MobileAuthLinks />
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}

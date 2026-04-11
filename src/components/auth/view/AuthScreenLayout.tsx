import { useMemo } from 'react';
import type { ReactNode } from 'react';

const backgroundImages = Object.values(
  import.meta.glob('../../../assets/auth-backgrounds/*.{jpg,jpeg,png,webp}', { eager: true, import: 'default' })
) as string[];

type AuthScreenLayoutProps = {
  title: string;
  description: string;
  children: ReactNode;
  footerText: string;
  logo?: ReactNode;
};

export default function AuthScreenLayout({
  title,
  description,
  children,
  footerText,
  logo,
}: AuthScreenLayoutProps) {
  const background = useMemo(
    () => backgroundImages[Math.floor(Math.random() * backgroundImages.length)],
    []
  );

  return (
    <div
      className="flex min-h-screen items-center justify-center p-4"
      style={background ? { backgroundImage: `url(${background})`, backgroundSize: 'cover', backgroundPosition: 'center' } : undefined}
    >
      <div className="w-full max-w-md">
        <div className="space-y-6 rounded-lg border border-border bg-card/90 p-8 shadow-lg backdrop-blur-sm">
          <div className="text-center">
            <div className="mb-4 flex justify-center">
              {logo ?? (
                <img src="/logo-128.png" alt="MoirAI" className="h-16 w-16 rounded-lg object-cover" />
              )}
            </div>
            <h1 className="text-2xl font-bold text-foreground">{title}</h1>
            <p className="mt-2 text-muted-foreground">{description}</p>
          </div>

          {children}

          <div className="text-center">
            <p className="text-sm text-muted-foreground">{footerText}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

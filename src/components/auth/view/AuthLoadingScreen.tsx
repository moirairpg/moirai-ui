import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

const backgroundImages = Object.values(
  import.meta.glob('../../../assets/auth-backgrounds/*.{jpg,jpeg,png,webp}', { eager: true, import: 'default' })
) as string[];

const loadingDotAnimationDelays = ['0s', '0.1s', '0.2s'];

export default function AuthLoadingScreen() {
  const { t } = useTranslation('auth');

  const background = useMemo(
    () => backgroundImages[Math.floor(Math.random() * backgroundImages.length)],
    []
  );

  return (
    <div
      className="flex min-h-screen items-center justify-center p-4"
      style={background ? { backgroundImage: `url(${background})`, backgroundSize: 'cover', backgroundPosition: 'center' } : undefined}
    >
      <div className="rounded-lg border border-border bg-card/90 p-8 text-center shadow-lg backdrop-blur-sm">
        <div className="mb-4 flex justify-center">
          <img src="/logo-128.png" alt="MoirAI" className="h-16 w-16 rounded-lg object-cover" />
        </div>

        <h1 className="mb-2 text-2xl font-bold text-foreground">{t('loading.title')}</h1>

        <div className="flex items-center justify-center space-x-2">
          {loadingDotAnimationDelays.map((delay) => (
            <div
              key={delay}
              className="h-2 w-2 animate-bounce rounded-full bg-blue-500"
              style={{ animationDelay: delay }}
            />
          ))}
        </div>

        <p className="mt-2 text-muted-foreground">{t('loading.text')}</p>
      </div>
    </div>
  );
}

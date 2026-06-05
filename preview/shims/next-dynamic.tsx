import { ComponentType, lazy, Suspense } from 'react';

interface DynamicOptions {
  ssr?: boolean;
  loading?: ComponentType;
}

// Replacement for next/dynamic — maps to React.lazy + Suspense.
export default function dynamic<T = Record<string, unknown>>(
  loader: () => Promise<{ default: ComponentType<T> } | ComponentType<T>>,
  options: DynamicOptions = {}
): ComponentType<T> {
  const LazyComp = lazy(async () => {
    const mod = await loader();
    return 'default' in mod ? (mod as { default: ComponentType<T> }) : { default: mod as ComponentType<T> };
  });
  const Loading = options.loading;
  return function DynamicComponent(props: T) {
    return (
      <Suspense fallback={Loading ? <Loading /> : null}>
        {/* @ts-expect-error generic props passthrough */}
        <LazyComp {...props} />
      </Suspense>
    );
  };
}

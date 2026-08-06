import type { PropsWithChildren, ReactNode } from "react";

interface WorkspaceShellProps extends PropsWithChildren {
  sidebar: ReactNode;
  topbar: ReactNode;
  title?: string;
  subtitle?: string;
  action?: ReactNode;
  contentClassName?: string;
}

export const WorkspaceShell = ({
  sidebar,
  topbar,
  title,
  subtitle,
  action,
  children,
  contentClassName = "max-w-[1280px]",
}: WorkspaceShellProps): JSX.Element => {
  return (
    <div className="min-h-screen bg-[#f7f8fe] text-slate-900">
      <div className="flex min-h-screen">
        {sidebar}
        <main className="flex-1">
          {topbar}
          <div className="px-4 py-8 lg:px-8">
            {(title || subtitle || action) && (
              <div className="mb-8 flex flex-col items-start justify-between gap-4 md:flex-row md:items-end">
                <div>
                  {title ? (
                    <h1 className="text-4xl font-black tracking-tight text-slate-900">
                      {title}
                    </h1>
                  ) : null}
                  {subtitle ? (
                    <p className="mt-2 max-w-3xl text-lg text-slate-600">
                      {subtitle}
                    </p>
                  ) : null}
                </div>
                {action}
              </div>
            )}
            <div className={contentClassName}>{children}</div>
          </div>
        </main>
      </div>
    </div>
  );
};


export function LoadingScreen() {
  return (
    <div className="flex min-h-dvh w-full flex-col bg-mineral">
      <div className="mx-auto flex min-h-dvh w-full max-w-6xl flex-1 items-center justify-center px-5">
        <div className="w-full max-w-md rounded-[--radius-card] border border-alternate/60 bg-background p-6 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="h-7 w-7 rounded-[--radius-sharp] bg-primary" />
            <div className="leading-tight">
              <div className="text-sm font-black tracking-tight text-midnight">
                NextStep Idea OS
              </div>
              <div className="text-micro text-tertiary/60">Initializing</div>
            </div>
          </div>
          <div className="mt-6 h-1.5 w-full overflow-hidden rounded-full bg-alternate/50">
            <div className="h-full w-1/2 animate-pulse rounded-full bg-primary" />
          </div>
        </div>
      </div>
    </div>
  )
}


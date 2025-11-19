import { Card, CardContent } from "../components/ui/card";

export function StatCardSkeleton() {
  return (
    <Card className="glass border-white/10">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="h-4 w-24 bg-slate-700/50 rounded-md animate-pulse mb-3"></div>
            <div className="h-8 w-20 bg-slate-700/50 rounded-md animate-pulse mb-3"></div>
            <div className="h-4 w-32 bg-slate-700/50 rounded-md animate-pulse"></div>
          </div>
          <div className="h-12 w-12 bg-slate-700/50 rounded-xl animate-pulse"></div>
        </div>
      </CardContent>
    </Card>
  );
}

export function ProjectCardSkeleton() {
  return (
    <div className="p-4 glass-medium rounded-lg space-y-3">
      <div className="flex items-center justify-between mb-3">
        <div>
          <div className="h-5 w-48 bg-slate-700/50 rounded-md animate-pulse mb-2"></div>
          <div className="h-4 w-32 bg-slate-700/50 rounded-md animate-pulse"></div>
        </div>
        <div className="h-6 w-24 bg-slate-700/50 rounded-md animate-pulse"></div>
      </div>
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="h-4 w-16 bg-slate-700/50 rounded-md animate-pulse"></div>
          <div className="h-4 w-12 bg-slate-700/50 rounded-md animate-pulse"></div>
        </div>
        <div className="h-2 w-full bg-slate-700/50 rounded-full animate-pulse"></div>
      </div>
    </div>
  );
}

export function ActivityItemSkeleton() {
  return (
    <div className="flex items-start space-x-4 p-3">
      <div className="h-10 w-10 rounded-full bg-slate-700/50 animate-pulse flex-shrink-0"></div>
      <div className="flex-1 space-y-2">
        <div className="h-4 w-3/4 bg-slate-700/50 rounded-md animate-pulse"></div>
        <div className="h-4 w-1/2 bg-slate-700/50 rounded-md animate-pulse"></div>
      </div>
    </div>
  );
}
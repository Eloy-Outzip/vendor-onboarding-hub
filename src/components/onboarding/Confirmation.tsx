import { CheckCircle } from "lucide-react";

export const Confirmation = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 px-4">
      <div className="max-w-md text-center space-y-6">
        <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
          <CheckCircle className="h-8 w-8 text-primary" />
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          You're on the map!
        </h1>
        <p className="text-muted-foreground leading-relaxed">
          We're enriching your products with AI. You'll get an email when your
          shop is live.
        </p>
      </div>
    </div>
  );
};

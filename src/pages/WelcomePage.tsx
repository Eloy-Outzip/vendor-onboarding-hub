import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const WelcomePage = () => (
  <div className="min-h-screen bg-muted/30 flex items-center justify-center px-4">
    <div className="max-w-md text-center space-y-6">
      <h1 className="text-4xl font-bold tracking-tight text-foreground">
        You're on the map! 🎉
      </h1>
      <p className="text-muted-foreground text-lg">
        Check your email to confirm your account and access your vendor profile.
      </p>
      <Button asChild size="lg">
        <Link to="/profile">Go to my profile →</Link>
      </Button>
    </div>
  </div>
);

export default WelcomePage;

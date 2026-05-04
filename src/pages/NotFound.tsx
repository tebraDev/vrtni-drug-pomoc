import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Leaf } from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.warn("404: Route not found:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4">
      <div className="text-center max-w-md">
        <div className="mb-6 flex justify-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-primary text-primary-foreground shadow-glow">
            <Leaf className="h-8 w-8" />
          </div>
        </div>
        <h1 className="mb-2 text-8xl font-bold tracking-tighter text-primary">404</h1>
        <p className="mb-2 text-2xl font-semibold text-foreground">Page not found</p>
        <p className="mb-8 text-muted-foreground">
          The page <code className="rounded bg-muted px-1.5 py-0.5 text-sm">{location.pathname}</code> does not exist.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button asChild size="lg" className="rounded-full">
            <Link to="/">Return to Home</Link>
          </Button>
          <Button asChild variant="outline" size="lg" className="rounded-full">
            <Link to="/porucivanje">Order Services</Link>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default NotFound;

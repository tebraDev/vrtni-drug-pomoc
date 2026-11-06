import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Leaf } from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.warn("404: Route not found:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen flex-col justify-center bg-background px-4">
      <div className="mx-auto w-full max-w-md">
        <p className="flex items-center gap-2 font-display text-xl font-semibold text-foreground">
          <Leaf className="h-5 w-5 text-primary" aria-hidden="true" /> Zelena Oaza
        </p>
        <h1 className="mt-10 text-4xl font-semibold tracking-tight text-foreground">This page doesn't exist</h1>
        <p className="mt-3 text-lg text-muted-foreground">
          There's nothing at <code className="rounded bg-muted px-1.5 py-0.5 text-base">{location.pathname}</code>.
          Go back to the home page to request a quote.
        </p>
        <Button asChild size="lg" className="mt-8 h-12 rounded-md bg-accent text-accent-foreground hover:bg-accent/90">
          <Link to="/">Go to the home page</Link>
        </Button>
      </div>
    </div>
  );
};

export default NotFound;
